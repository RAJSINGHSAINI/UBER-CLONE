import { validationResult } from "express-validator";
import { cancelRide, createRide, getFare } from "../services/ride.service.js";
import { rideModel } from "../models/ride.model.js";
import { userModel } from "../models/user.model.js";
import { sendMessageToSocketId } from "../config/socket.js";
import { captainModel } from "../models/captain.model.js";

export const getRideHistoryController = async (req, res) => {
    try {
        const { userId, userType } = req.body;
        const entityType = (userType || "").toLowerCase();

        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }

        if (!['user', 'captain'].includes(entityType)) {
            return res.status(400).json({ success: false, message: "userType must be either user or captain" });
        }

        const entity = entityType === "user"
            ? await userModel.findById(userId)
            : await captainModel.findById(userId);

        if (!entity) {
            return res.status(404).json({ success: false, message: `${entityType} not found` });
        }

        const rides = await rideModel.find({
            status: { $in: ["completed", "cancelled", "expired"] },
            ...(entityType === "user" ? { user: userId } : { captain: userId })
        })
            .sort({ createdAt: -1 })
            .populate(entityType === "user" ? {
                path: "captain",
                select: "fullname email verified status vehicle ratings address socketId location"
            } : {
                path: "user",
                select: "fullname email verified address socketId location"
            });

        return res.status(200).json({
            success: true,
            rides: rides.map((ride) => ride.toObject())
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getFareController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ success: false, message: errors.array() });
    }
    try {
        const { pickupLat, pickupLng, destinationLat, destinationLng } = req.query;
        if (!pickupLat || !pickupLng || !destinationLat || !destinationLng) {
            return res.status(400).json({ success: false, message: "Pick-up and destination are required" });
        }
        const fare = await getFare({ pickupLat, pickupLng }, { destinationLat, destinationLng });
        res.status(200).json({ success: true, message: "Fare calculated successfully", fare });
    } catch (error) {
        console.log(error);

        res.status(500).json({ success: false, message: "Failed to calculate fare", error: error.message });
    }
}

export const createRideController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
        const { pickup, destination, duration, distance, vehicleType, fare } = req.body;
        
        if (!pickup || !destination || !duration || !distance || !vehicleType || !fare) {
            return res.status(201).json({ success: false, message: 'missing fields' })
        }
        const pickupData = pickup.address === 'Current Location' ? { lat: pickup.lat, lng: pickup.lng } : pickup

        const ride = await createRide(pickupData, destination, duration, distance, vehicleType, fare, req.user);
        return res.status(200).json({ success: true, ride })
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            status: false,
            message: error.message
        });
    }

}


export const cancelRideController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }
    try {
        const { rideId, userType } = req.query;
        if (!rideId || !userType) {
            return res.status(201).json({ success: false, message: 'missing ride detail' })
        }
        const result = await cancelRide(rideId, req, userType);
        if (result.success) {
            return res.status(200).json({ success: true, message: 'ride cancelled successfully' })
        } else if (!result.success) {
            return res.status(201).json({ success: false, message: result.message })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
}

export const availableRides = async (req, res) => {
    try {

        await rideModel.updateMany(
            {
                status: {
                    $in: ["searching", "accepted"]
                },
                deleteAfter: {
                    $lt: new Date()
                },
                searchExpiresAt: {
                    $lt: new Date()
                }
            },
            {
                $set: {
                    status: "expired"
                }
            }
        );

        const range = Number(req.query.range); // km

        if (!range) {
            return res.status(201).json({ success: false, message: 'please set range' })
        }



        const captain = req.captain;

        const rides = await rideModel.find({
            status: "searching",

            vehicleType:
                captain.vehicle.vehicleType,

            searchExpiresAt: {
                $gt: new Date()
            },

            "pickup.location": {
                $geoWithin: {
                    $centerSphere: [
                        captain.location.coordinates,
                        range / 6378.1
                    ]
                }
            }
            // "pickup.location": {
            //     $near: {
            //         $geometry: {
            //             type: "Point",
            //             coordinates:
            //                 captain.location.coordinates
            //         },
            //         $maxDistance: 10000 // meters
            //     }
            // }
        });        

        return res.status(200).json({ success: true, rides })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

export const getRideData = async (req, res) => {

    try {
        const { rideId } = req.query
        const ride = await rideModel.findById({ _id: rideId })

        if (ride.deleteAfter <= new Date()) {
            ride.status = 'expired'
            await ride.save()
            return res.status(201).json({
                status: false,
                message: 'ride is expired'
            });
        }

        const user = await userModel.findById({ _id: ride.user })

        if (!user) {
            return res.status(201).json({
                status: false,
                message: 'user not found'
            });
        }

        return res.status(200).json({ success: true, ride, user: user.toPublicJSON() })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }

}

export const acceptRide = async (req, res) => {

    try {

        const ride = await rideModel.findById(req.body.rideId);

        if (!ride) return res.status(201).json({ success: false, message: 'ride not found' });

        if (ride.status !== "searching") {
            return res.status(201).json({ success: false, message: "Ride unavailable" });
        }

        ride.status = "accepted";

        ride.captain = req.captain._id;

        await captainModel.findByIdAndUpdate({ _id: req.captain._id }, { activeRide: ride._id });

        await ride.save();

        const user = await userModel.findById(ride.user);

        sendMessageToSocketId(user.socketId, {
            event: "captain-accepted", ride,
            captain: {
                id: req.captain._id,
                fullname: req.captain.fullname,
                vehicle: req.captain.vehicle,
                email: req.captain.email
            }
        }
        );

        return res.json({ success: true, data: { ride, user: user.toPublicJSON() } });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

export const generateOTP = async (req, res) => {
    try {

        const ride = await rideModel
            .findById(req.user.activeRide)
            .select('+verifyOTP ');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride unavailable'
            });
        }

        if (ride.status !== 'accepted') {
            return res.json({
                success: false,
                message: `Ride status is ${ride.status}`
            });
        }

        const now = new Date();

        // OTP already exists and still valid
        if (ride.verifyOTPGenerated && ride.verifyOTPGeneratedAt && (now - ride.verifyOTPGeneratedAt) < 15 * 60 * 1000) {
            return res.status(200).json({
                success: true,
                message: 'OTP already generated',
                otp: ride.verifyOTP
            });
        }
        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        ride.verifyOTP = otp;
        ride.verifyOTPGenerated = true;
        ride.verifyOTPGeneratedAt = now;
        await ride.save();
        return res.status(200).json({ success: true, message: 'OTP generated successfully', otp });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const requestContact = async (req, res) => {
    try {

        const { rideId } = req.body;
        if (!rideId) {
            return res.status(201).json({ success: false, message: 'missing details' });
        }
        const ride = await rideModel.findById(rideId).populate('user')

        if (!ride) {
            return res.json({ success: false, message: 'ride not found' });
        }

        if (ride.contactRequestCooldownUntil > Date.now()) {
            return res.json({ success: false, remaining: Math.floor((ride.contactRequestCooldownUntil - Date.now()) / 1000) });
        }

        ride.contactRequestCooldownUntil = new Date(Date.now() + 10 * 1000);

        await ride.save();

        sendMessageToSocketId(ride.user.socketId, {
            event: "captain-requested",
            rideCoolDown: ride.contactRequestCooldownUntil
        })

        return res.json({ success: true, message: 'request sended' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const shareContact = async (req, res) => {
    try {

        const { rideId, contactNumber } = req.body;

        if (!rideId || !contactNumber) {
            return res.status(201).json({ success: false, message: 'missing details' });
        }
        const ride = await rideModel.findById(rideId).populate('captain')

        if (!ride) {
            return res.json({ success: false, message: 'ride not found' });
        }

        if (ride.contactShareCooldownUntil > Date.now()) {
            return res.json({ success: false, remaining: Math.floor((ride.contactShareCooldownUntil - Date.now()) / 1000) });
        }

        ride.contactShareCooldownUntil = new Date(Date.now() + 10 * 1000);

        await ride.save();

        sendMessageToSocketId(ride.captain.socketId, {
            event: "contact-shared",
            rideCoolDown: ride.contactShareCooldownUntil,
            contactNumber
        })

        return res.json({ success: true, message: 'contact no. sended' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const verifyOTP = async (req, res) => {
    try {

        const { rideId, otp } = req.body

        if (!rideId || !otp) {
            return res.status(201).json({ success: false, message: 'missing details' });
        }
        const ride = await rideModel.findById(rideId).select('+verifyOTP').populate('user')

        if (!ride) {
            return res.json({ success: false, message: 'ride not found' });
        }

        if (ride.status !== "accepted") {
            return res.json({ success: false, message: "Ride cannot be verified." });
        }

        const expiresAt = new Date(ride.verifyOTPGeneratedAt).getTime() + 15 * 60 * 1000;

        if (Date.now() > expiresAt) {
            return res.json({ success: false, message: "OTP has expired." });
        }

        if (otp !== ride.verifyOTP) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        ride.status = 'ongoing'

        await ride.save();

        sendMessageToSocketId(ride.user.socketId, {
            event: 'otp-verified',
            ride,
            captain: req.captain
        })
        return res.json({ success: true, message: 'OTP verified' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const completeRide = async (req, res) => {
    try {
        const { rideId, paymentDone } = req.body;

        if (!rideId) {
            return res.status(400).json({ success: false, message: 'Ride id is required' });
        }

        if (paymentDone !== true) {
            return res.status(400).json({ success: false, message: 'Payment must be confirmed before completing the ride.' });
        }

        const ride = await rideModel.findById(rideId).populate('user').populate('captain');

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }

        if (ride.captain?._id?.toString() !== req.captain._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only complete your own ride' });
        }

        if (!['ongoing', 'arrived'].includes(ride.status)) {
            return res.status(400).json({ success: false, message: `Ride cannot be completed from ${ride.status} status` });
        }

        ride.status = 'completed';
        await ride.save();


        const captain = await captainModel.findByIdAndUpdate(
            req.captain._id,
            {
                $inc: {
                    "earnings.total": ride.fare
                },
                $set: {
                    status: "online"
                },
                $unset: {
                    activeRide: ""
                }
            }, { returnDocument: 'after' }
        );

        if (ride.user?._id) {
            await userModel.findByIdAndUpdate(
                ride.user._id,
                {
                    $unset: { activeRide: '' }
                }
            );
        }

        if (ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-completed',
                ride
            });
        }

        return res.json({ success: true, message: 'Ride marked as completed', ride, captain: captain.toPublicJSON() });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const earlyCompleteRide = async (req, res) => {
    try {
        const { rideId, paymentDone } = req.body;

        if (!rideId) {
            return res.status(400).json({ success: false, message: 'Ride id is required' });
        }

        if (paymentDone !== true) {
            return res.status(400).json({ success: false, message: 'Payment must be confirmed before completing the ride.' });
        }

        const ride = await rideModel.findById(rideId).populate('user').populate('captain');

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }

        if (ride.user?._id?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only complete your own ride' });
        }

        if (!['ongoing', 'arrived'].includes(ride.status)) {
            return res.status(400).json({ success: false, message: `Ride cannot be completed from ${ride.status} status` });
        }

        ride.status = 'completed';
        await ride.save();


        const captain = await captainModel.findByIdAndUpdate(
            ride.captain._id,
            {
                $inc: {
                    "earnings.total": ride.fare
                },
                $set: {
                    status: "online"
                },
                $unset: {
                    activeRide: ""
                }
            }, { returnDocument: 'after' }
        );

        if (ride.user?._id) {
            await userModel.findByIdAndUpdate(
                ride.user._id,
                {
                    $unset: { activeRide: '' }
                }
            );
        }

        if (ride.captain?.socketId) {
            sendMessageToSocketId(ride?.captain?.socketId, {
                event: 'ride-completed',
                ride,
                captain: captain.toPublicJSON()
            });
        }

        return res.json({ success: true, message: 'Ride marked as completed', ride });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

