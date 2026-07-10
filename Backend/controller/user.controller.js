import { validationResult } from "express-validator";
import { createUser, loginUser, profileUpdate, sendEmailChangeOtp, sendPasswordResetOtp, verifyChangeEmailOtp, verifyResetOtp, verifyUser } from "../services/user.service.js";
import { BlacklistToken } from "../models/blackListToken.model.js";
import { userModel } from "../models/user.model.js";
import { rideModel } from "../models/ride.model.js";
import { captainModel } from "../models/captain.model.js";

export const userRegister = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }

    try {
        const user = await createUser(req.body);

        if (!user.success) {
            return res.status(201).json({ success: false, message: user.message })
        }

        const token = user.user.generateUserAuth();

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, token, user: user.user.toPublicJSON() })

    } catch (error) {
        console.log(error);

        return res.status(400).json({ success: false, message: error })
    }
}

export const userLogin = async (req, res) => {

    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }
    try {
        const user = await loginUser(req.body);

        if (!user.success) {
            return res.status(201).json({ success: false, message: user.message })
        }

        const token = user.user.generateUserAuth();

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, token, user: user.user.toPublicJSON() })

    } catch (error) {
        console.log(error);

        return res.status(400).json({ success: false, error })
    }
}

export const userProfile = async (req, res) => {
    let activeRide = null;

    let captain = null;

    if (req.user.activeRide) {
        activeRide = await rideModel.findById(req.user.activeRide);

        // auto expire only pending rides
        if (activeRide && activeRide.deleteAfter <= new Date() && ["searching", "accepted"].includes(activeRide.status)) {
            activeRide.status = "expired";
            await activeRide.save();

            await userModel.findByIdAndUpdate(req.user._id, { activeRide: null });

            req.user.activeRide = null;
            activeRide = null;
        }

        // valid active ride
        else if (activeRide && ["searching", "accepted", "ongoing"].includes(activeRide.status)) {
            // keep activeRide

            if (activeRide.captain) {
                captain = await captainModel.findById({ _id: activeRide.captain });
            }
        }

        // completed/cancelled/expired
        else {

            await userModel.findByIdAndUpdate(req.user._id, { activeRide: null });

            req.user.activeRide = null;
            activeRide = null;
        }
    }

    if (captain) {
        return res.status(200).json({ success: true, user: req.user, activeRide, captain: captain?.toPublicJSON() });
    }

    return res.status(200).json({ success: true, user: req.user, activeRide });
};
export const userVerify = async (req, res) => {

    try {
        const { otp } = req.body;

        const isUserVerifed = await verifyUser(otp, req.user._id, 'verify-email')

        if (isUserVerifed.success) {
            return res.status(200).json({ success: true, user: isUserVerifed.user.toPublicJSON() })
        } else {
            return res.status(201).json({ success: false, message: isUserVerifed.message })
        }

    } catch (error) {
        console.log(error);

        return res.status(400).json({ success: false, message: error.message })
    }
}

export const updateProfile = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.json({ success: false, message: validationResult(req).array() })
    }
    try {

        const UpdatedData = await profileUpdate(req.body, req.user);

        if (UpdatedData.success) {
            return res.status(200).json({ success: true, user: UpdatedData.user, message: 'profile updated successfully' })
        } else {
            return res.status(400).json({ success: false, message: UpdatedData.message })
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
        const UpdatedData = await sendPasswordResetOtp(req.body);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, user: UpdatedData.user, message: 'otp is successfully sent' })
        } else {
            return res.status(400).json({ success: false, message: UpdatedData.message })
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
        const UpdatedData = await verifyResetOtp(req.body, 'reset-password', req.body.newPassword);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, user: UpdatedData.user, message: 'Password reset sucessfully' })
        } else {
            return res.status(400).json({ success: false, message: UpdatedData.message })
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
        const UpdatedData = await sendEmailChangeOtp(req.body, req.user._id);
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, user: UpdatedData.user, message: UpdatedData.message })
        } else {
            return res.status(400).json({ success: false, message: UpdatedData.message })
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
        const UpdatedData = await verifyChangeEmailOtp(req.body, req.user._id, 'change-email');
        if (UpdatedData.success) {
            return res.status(200).json({ success: true, user: UpdatedData.user, message: UpdatedData.message })
        } else {
            return res.status(400).json({ success: false, message: UpdatedData.message })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }

}

export const userLogout = async (req, res) => {
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

export const userUpdateLocation = async (req, res) => {
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

        const user = await userModel.findByIdAndUpdate({ _id: req.user._id }, { location }, { returnDocument: 'after' })

        return res.status(200).json({ success: true, user: user.toPublicJSON() })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}