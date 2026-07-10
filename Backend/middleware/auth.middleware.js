import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { captainModel } from "../models/captain.model.js";
import { BlacklistToken } from "../models/blackListToken.model.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const isBlacklisted = await BlacklistToken.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({ message: "unauthorized" });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel.findById(decoded.id);

        if (!user) {

            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user.toPublicJSON();

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};
export const authCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({ message: "unauthorized" });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const captain = await captainModel.findById(decoded.id);

        if (!captain) {
            return res.status(401).json({
                message: "Captain not found"
            });
        }

        req.captain = captain.toPublicJSON();

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export const authUserOrCaptain = async (req,res,next) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({success: false,message: 'Unauthorized'});
        }

        try {
            const decoded =jwt.verify(token,process.env.JWT_SECRET);

            const user =await userModel.findById(decoded.id);

            if (user) {
                req.user = user;
                req.role = 'user';
                return next();
            }
        }
        catch { }

        try {
            const decoded =jwt.verify(token,process.env.JWT_SECRET);

            const captain =await captainModel.findById(decoded.id);

            if (captain) {
                req.captain = captain;
                req.role = 'captain';
                return next();
            }
        }
        catch { }

        return res.status(401).json({success: false,message: 'Unauthorized'});

    }
    catch (error) {
        return res.status(401).json({success: false,message: error.message});
    }
}