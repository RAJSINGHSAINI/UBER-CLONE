import express from 'express'
import { body } from 'express-validator';
import { captainLogin, captainLogout, captainProfile, captainRegister, captainUpdateLocation, captainUpdateStatus, captainVerify, sendChangeEmailOtp, sendResetPasswordOtp, updateProfile, verifyEmailChangeOtp, verifyResetPasswordOtp,saveFeedBack } from '../controller/captain.controller.js';
import { authCaptain, authUser } from '../middleware/auth.middleware.js';
export const captainRouter = express.Router();


captainRouter.post('/register',
    [
        body("firstname").isLength({ min: 3 }).withMessage("first name atleast 3 length"),
        body("lastname").isLength({ min: 3 }).withMessage("last name atleast 3 length"),
        body("email").isLength({ min: 3 }).withMessage("email atleast 3 length"),
        body("password").isLength({ min: 3 }).withMessage("password atleast 3 length"),
        body("color").isLength({ min: 3 }).withMessage("color atleast 3 length"),
        body("plate").isLength({ min: 3 }).withMessage("plate atleast 3 length"),
        body("capacity").isInt({ min: 1, max: 10 }).withMessage("capacity must be between 1 and 10"),
        body("vehicleType").isIn(["car", "motorcycle", "auto"]).withMessage("vehicle type must be car, motorcycle or auto")
    ], captainRegister);

captainRouter.post('/login', [
    body("email").isLength({ min: 3 }).withMessage("email atleast 3 length"),
    body("password").isLength({ min: 3 }).withMessage("password atleast 3 length")
], captainLogin);

captainRouter.get('/profile', authCaptain, captainProfile);

captainRouter.post('/verify-email', authCaptain, captainVerify);

captainRouter.post('/update-profile', [
    body("firstname").isLength({ min: 3 }).withMessage("first name atleast 3 length"),
    body("lastname").isLength({ min: 3 }).withMessage("last name atleast 3 length"),
    body("address").isLength({ min: 3 }).withMessage("address atleast 3 length"),
    body("color").isLength({ min: 3 }).withMessage("color atleast 3 length"),
    body("plate").isLength({ min: 3 }).withMessage("plate atleast 3 length"),
    body("capacity").isInt({ min: 1, max: 10 }).withMessage("capacity must be between 1 and 10"),
    body("vehicleType").isIn(["car", "motorcycle", "auto"]).withMessage("vehicle type must be car, motorcycle or auto")
], authCaptain, updateProfile);

captainRouter.post('/send-reset-password-otp', [
    body("email").isLength({ min: 3 }).withMessage("email must be 3 length")
], authCaptain, sendResetPasswordOtp);

captainRouter.post('/verify-reset-password-otp', [
    body("otp").isLength({ min: 6 }).withMessage("otp must be 6 digit"),
    body("newPassword").isLength({ min: 6 }).withMessage("newPassword must be 6 digit")
], authCaptain, verifyResetPasswordOtp);

captainRouter.post('/send-change-email-otp', [
    body("email").isLength({ min: 3 }).withMessage("email must be 3 length")
], authCaptain, sendChangeEmailOtp);

captainRouter.post('/verify-change-email-otp', [
    body("otp").isLength({ min: 6 }).withMessage("otp must be 6 digit"),
], authCaptain, verifyEmailChangeOtp);

captainRouter.get("/logout", authCaptain, captainLogout);

captainRouter.get('/update-status',authCaptain,captainUpdateStatus)

captainRouter.get('/update-location',authCaptain,captainUpdateLocation)

captainRouter.post('/feedback',authUser,saveFeedBack)