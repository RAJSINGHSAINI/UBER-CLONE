import { validationResult } from "express-validator"
import { createCaptain, loginCaptain, profileUpdate, sendEmailChangeOtp, sendPasswordResetOtp, verifyCaptain, verifyChangeEmailOtp, verifyResetOtp } from "../services/captain.service.js"
import { BlacklistToken } from "../models/blackListToken.model.js";
import { captainModel } from "../models/captain.model.js";
import { rideModel } from "../models/ride.model.js";
import { userModel } from "../models/user.model.js";
import { sendMessageToSocketId } from "../config/socket.js";
export const captainRegister = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const captain = await createCaptain(req.body);
        if (!captain) {
            return res.status(201).json({ success: false, message: 'failed to create captain account' })
        }
        const token = captain.generateCaptainAuth();

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, token, captain: captain.toPublicJSON() })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }

}

export const captainLogin = async (req, res) => {

    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }
    try {
        const captain = await loginCaptain(req.body);

        if (!captain.success) {
            return res.status(201).json({ success: false, message: captain.message })
        }

        const token = captain.captain.generateCaptainAuth();

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        return res.status(200).json({ success: true, token, captain: captain.captain.toPublicJSON() })

    } catch (error) {
        console.log(error);

        return res.status(400).json({ success: false, error })
    }
}

export const captainProfile = async (req, res) => {

    let activeRide = null;

    let user = null

    if (req.captain.activeRide) {

        activeRide = await rideModel.findById(
            req.captain.activeRide
        );

        // auto expire only pending rides
        if (activeRide && activeRide.deleteAfter <= new Date() && ["searching", "accepted"].includes(activeRide.status)) {

            activeRide.status = "expired";
            await activeRide.save();

            await captainModel.findByIdAndUpdate(
                req.captain._id,
                {
                    activeRide: null
                }
            );

            req.captain.activeRide = null;
            activeRide = null;
        }

        // valid active ride
        else if (
            activeRide &&
            ["searching", "accepted", "ongoing"]
                .includes(activeRide.status)
        ) {
            // keep activeRide
            user = await userModel.findById({ _id: activeRide.user })
        }

        // completed/cancelled/expired
        else {

            await captainModel.findByIdAndUpdate(
                req.captain._id,
                {
                    activeRide: null
                }
            );

            req.captain.activeRide = null;
            activeRide = null;
        }
    }

    if (user) {
        return res.status(200).json({ success: true, captain: req.captain, data: { ride: activeRide, user: user.toPublicJSON() } })
    }

    return res.status(200).json({ success: true, captain: req.captain, data: { ride: activeRide } })
}

export const captainVerify = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const { otp } = req.body;

        const isCaptainVerifed = await verifyCaptain(otp, req.captain._id, 'verify-email')

        if (isCaptainVerifed.success) {
            return res.status(200).json({ success: true, Captain: isCaptainVerifed.captain.toPublicJSON() })
        } else {
            return res.status(201).json({ success: false, message: isCaptainVerifed.message })
        }

    } catch (error) {
        console.log(error);

        return res.status(400).json({ success: false, message: error.message })
    }
}

export const updateProfile = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        console.log(validationResult(req).array());

        return res.json({ success: false, message: validationResult(req).array() })
    }
    try {

        const UpdatedData = await profileUpdate(req.body, req.captain);

        if (UpdatedData.success) {
            return res.status(200).json({ success: true, captain: UpdatedData.captain, message: 'profile updated successfully' })
        } else {
            return res.status(201).json({ success: false, message: UpdatedData.message })
        }

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const sendResetPasswordOtp = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const UpdatedData = await sendPasswordResetOtp(req.body, req.captain._id);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, captain: UpdatedData.captain, message: 'otp is successfully sent' })
        } else {
            return res.status(201).json({ success: false, message: UpdatedData.message })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const verifyResetPasswordOtp = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const UpdatedData = await verifyResetOtp(req.body, req.captain._id, 'reset-password', req.body.newPassword);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, captain: UpdatedData.captain, message: 'Password reset sucessfully' })
        } else {
            return res.status(201).json({ success: false, message: UpdatedData.message })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const sendChangeEmailOtp = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const UpdatedData = await sendEmailChangeOtp(req.body, req.captain._id);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, captain: UpdatedData.captain, message: UpdatedData.message })
        } else {
            return res.status(201).json({ success: false, message: UpdatedData.message })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const verifyEmailChangeOtp = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const UpdatedData = await verifyChangeEmailOtp(req.body, req.captain._id, 'change-email');
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, captain: UpdatedData.captain, message: UpdatedData.message })
        } else {
            return res.status(201).json({ success: false, message: UpdatedData.message })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }

}

export const captainLogout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: "token not found" })
        }
        await BlacklistToken.create({ token });
        res.clearCookie("token");
        return res.status(200).json({ message: "logout successful" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const captainUpdateStatus = async (req, res) => {
    try {

        const { status } = req.query;

        if (!status) {
            return res.status(201).json({ success: false, message: 'status required' })
        }

        const captainData = await captainModel.findByIdAndUpdate({ _id: req.captain._id }, { status: status }, { returnDocument: 'after' })

        const captain = captainData.toPublicJSON()

        return res.status(200).json({ success: true, captain })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const captainUpdateLocation = async (req, res) => {
    try {

        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(201).json({ success: false, message: 'location required' })
        }
        const location = {
            type: 'Point',
            coordinates: [
                Number(lng),
                Number(lat)
            ]
        };

        const captain = await captainModel.findByIdAndUpdate({ _id: req.captain._id }, { location })

        return res.status(200).json({ success: true, captain })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const saveFeedBack = async (req, res) => {
    try {
        const { rideId, rating } = req.body;

        if (!rideId || !rating) {
            return res.status(404).json({ success: false, message: 'ride or rating not found' })
        }

        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ success: false, message: 'ride not found' })
        }

        const captain = await captainModel.findById(ride.captain)

        if (!captain) {
            return res.status(404).json({ success: false, message: 'captain not found' })
        }

        if (ride.captainRating) {
            return res.status(202).json({ success: false, message: 'feedback already submited' })
        }

        const oldAverage = captain.ratings.average;
        const totalRatings = captain.ratings.totalRatings;

        const newAverage =
            ((oldAverage * totalRatings) + rating) /
            (totalRatings + 1);

        captain.ratings.average = Number(newAverage.toFixed(1));
        captain.ratings.totalRatings += 1;

        await captain.save();
        sendMessageToSocketId(captain?.socketId, {
            event: 'feedback-submitted',
            captain: captain.toPublicJSON()
        });
        ride.captainRating = rating;
        await ride.save();

        return res.status(200).json({ success: true, message: 'feedback submited successfully' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}