import express from 'express'
import { body } from "express-validator";
import { sendChangeEmailOtp, sendResetPasswordOtp, updateProfile, userLogin, userLogout, userProfile, userRegister, userUpdateLocation, userVerify, verifyEmailChangeOtp, verifyResetPasswordOtp } from '../controller/user.controller.js';
import { registerLimiter } from '../config/rateLimiter.js';
import { authUser } from '../middleware/auth.middleware.js';

export const userRouter = express.Router();

userRouter.post('/register', [
    body("firstname").isLength({ min: 3 }).withMessage("first name atleast 3 length"),
    body("lastname").isLength({ min: 3 }).withMessage("last name atleast 3 length"),
    body("email").isLength({ min: 3 }).withMessage("email atleast 3 length"),
    body("password").isLength({ min: 3 }).withMessage("password atleast 3 length"),
    body("address").isLength({ min: 3 }).withMessage("address atleast 3 length")
],userRegister);

userRouter.post('/login', [
    body("email").isLength({ min: 3 }).withMessage("email atleast 3 length"),
    body("password").isLength({ min: 3 }).withMessage("password atleast 3 length")
],userLogin);

userRouter.get('/profile',authUser,userProfile);

userRouter.post('/verify-email',authUser,userVerify);

userRouter.post('/send-reset-password-otp', [
    body("email").isLength({ min: 3 }).withMessage("email must be 3 length")
],sendResetPasswordOtp);

userRouter.post('/verify-reset-password-otp', [
    body("otp").isLength({ min: 6 }).withMessage("otp must be 6 digit"),
    body("newPassword").isLength({ min: 6 }).withMessage("newPassword must be 6 digit")
],verifyResetPasswordOtp);
userRouter.post('/update-profile', [
    body("firstname").isLength({ min: 3 }).withMessage("first name atleast 3 length"),
    body("lastname").isLength({ min: 3 }).withMessage("last name atleast 3 length"),
    body("address").isLength({ min: 3 }).withMessage("address atleast 3 length")
],authUser,updateProfile);


userRouter.post('/send-change-email-otp', [
    body("email").isLength({ min: 3 }).withMessage("email must be 3 length")
],authUser,sendChangeEmailOtp);

userRouter.post('/verify-change-email-otp', [
    body("otp").isLength({ min: 6 }).withMessage("otp must be 6 digit")
],authUser,verifyEmailChangeOtp);

userRouter.get("/logout", authUser, userLogout);


userRouter.get('/update-location',authUser,userUpdateLocation)