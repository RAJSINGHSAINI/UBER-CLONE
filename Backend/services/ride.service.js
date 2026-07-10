import { sendMessageToSocketId } from "../config/socket.js";
import { captainModel } from "../models/captain.model.js";
import { rideModel } from "../models/ride.model.js";
import { userModel } from "../models/user.model.js";
import { getAddressDistanceTime, getAddressFromCoordinates, getCaptainInTheRadius } from "./maps.services.js";


export const getFare = async (pickUp, destination) => {
    const pickUpCoordinate = { lng: pickUp.pickupLng, lat: pickUp.pickupLat }
    const destinationCoordinate = { lng: destination.destinationLng, lat: destination.destinationLat }

    if (!pickUpCoordinate || !destinationCoordinate) {
        throw new Error("Invalid pickup or destination address");
    }

    const { distance, duration,route } = await getAddressDistanceTime(
        pickUpCoordinate,
        destinationCoordinate
    );

    // ORS returns meters and seconds
    const distanceInKm = distance / 1000;
    const durationInMinutes = duration / 60;

    const baseFare = {
        auto: 30,
        motorcycle: 20,
        car: 50
    };

    const perKmRate = {
        auto: 12,
        motorcycle: 8,
        car: 15
    };

    const perMinuteRate = {
        auto: 1,
        motorcycle: 0.5,
        car: 2
    };

    const fares = {};

    Object.keys(baseFare).forEach((vehicleType) => {
        fares[vehicleType] = Math.round(
            baseFare[vehicleType] +
            distanceInKm * perKmRate[vehicleType] +
            durationInMinutes * perMinuteRate[vehicleType]
        );
    });

    return {
        fares,
        distance: Math.round(distance), // meters
        duration: Math.round(duration), // seconds
        distanceInKm: Number(distanceInKm.toFixed(2)),
        durationInMinutes: Math.ceil(durationInMinutes),
        route
    };
}

export const createRide = async (
    pickupData,
    destination,
    duration,
    distance,
    vehicleType,
    fare,
    user
) => {
    try {

        if (!pickupData || !destination || !duration || !distance || !vehicleType || !fare) {
            throw new Error("missing fields");
        }

        let activeRide = null;

        if (user.activeRide) {

            activeRide = await rideModel.findOne({
                _id: user.activeRide,
                status: {
                    $in: [
                        "searching",
                        "ongoing",
                        "accepted"
                    ]
                }
            });
        }

        if (activeRide) {
            throw new Error(
                "please complete or cancel current ride"
            );
        }

        let address = null;

        if (!pickupData.address) {

            address =
                await getAddressFromCoordinates(
                    pickupData.lat,
                    pickupData.lng
                );
        }

        const searchExpiresAt =
            new Date(
                Date.now() + 15 * 60 * 1000
            ); // 15 minutes
        const deleteAfter =
            new Date(
                Date.now() + 2 * 60 * 60 * 1000
            ); // 2 hours

        const pickup = {
            address:
                address ||
                pickupData.address,
            lat: pickupData.lat,
            lng: pickupData.lng,
            location: {
                type: "Point",
                coordinates: [
                    pickupData.lng,
                    pickupData.lat
                ]
            }
        };

        const ride = await rideModel.create({
            pickup,
            destination,
            duration,
            distance,
            user: user._id,
            vehicleType,
            fare,
            searchExpiresAt,
            deleteAfter
        });

        await userModel.findByIdAndUpdate(
            user._id,
            {
                activeRide: ride._id
            }
        );

        const captains = await getCaptainInTheRadius(pickup.lat, pickup.lng, 15, vehicleType);

        captains.forEach(captain => {
            sendMessageToSocketId(
                captain.socketId,
                {
                    event: "new-ride",
                    ride,
                    user
                }
            );
        });

        return ride;

    } catch (error) {

        console.log(error);
        throw new Error(
            error.message
        );
    }
};

export const cancelRide = async (rideId, req, userType) => {
    try {

        if (!rideId || !userType) {
            throw new Error('rideId and userType are required');
        }

        const ride = await rideModel.findById(rideId).populate('user').populate('captain');
        if (!ride) {
            throw new Error('Ride not found');
        }

        // already cancelled
        if (ride.status === 'cancelled') {
            return { success: false, message: 'Ride already cancelled' };
        }

        // only active rides can cancel
        const allowedStatus = ['accepted', 'arrived', 'started', 'searching'];

        if (!allowedStatus.includes(ride.status)) {
            throw new Error(`Cannot cancel ride with status ${ride.status}`);
        }

        // update ride
        ride.status = 'cancelled';

        ride.cancelledBy = userType === 'users' ? 'user' : 'captain';

        ride.cancelledAt = new Date();

        await ride.save();
        let user = null
        // clear active ride
        if (ride.user?._id) {
           user = await userModel.findByIdAndUpdate(
                ride.user._id,
                {
                    $unset: {
                        activeRide: ""
                    }
                },{returnDocument: 'after'}
            );
        }
        let captain = null
        if (ride.captain?._id) {
            captain = await captainModel.findByIdAndUpdate(
                ride.captain._id,
                {
                    $unset: {
                        activeRide: ""
                    }
                },{returnDocument: 'after'}
            );
        }

        // notify user
        if (userType === 'captains' && ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-cancelled',
                cancelledBy: 'captain',
                rideId: ride._id,
                message: 'Captain cancelled the ride',
                user: user.toPublicJSON()
            }
            );
        }

        // notify captain
        if (userType === 'users' && ride.captain?.socketId) {
            sendMessageToSocketId(
                ride.captain.socketId,
                {
                    event: 'ride-cancelled',
                    cancelledBy: 'user',
                    rideId: ride._id,
                    message: 'User cancelled the ride',
                    captain: captain.toPublicJSON()
                }
            );
        }

        return { success: true };

    } catch (error) {
        throw new Error(error.message);
    }
};