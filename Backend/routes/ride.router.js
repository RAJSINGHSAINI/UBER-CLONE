import express from 'express'
import { body, query } from "express-validator";
import { authCaptain, authUser, authUserOrCaptain } from '../middleware/auth.middleware.js';
import { getFareController,createRideController, cancelRideController, availableRides, getRideData, acceptRide, generateOTP, requestContact, shareContact, verifyOTP, completeRide, earlyCompleteRide, getRideHistoryController } from '../controller/ride.controller.js';
import { requireVerification } from '../middleware/verification.middleware.js';
export const rideRouter = express.Router();

rideRouter.get('/get-fare',authUser,requireVerification, getFareController);

rideRouter.post('/create-ride',authUser,requireVerification, createRideController)

rideRouter.get('/cancel-ride',[query('rideId').isLength({min:24}).withMessage('ride Id required')],authUserOrCaptain,requireVerification, cancelRideController)

rideRouter.get('/available-rides',authCaptain,requireVerification, availableRides)

rideRouter.get('/ride-data',authCaptain,requireVerification,getRideData)

rideRouter.post('/ride-accept',authCaptain,requireVerification,acceptRide);

rideRouter.get('/generate-otp',authUser,requireVerification,generateOTP);

rideRouter.post('/request-contact',authCaptain,requireVerification,requestContact)

rideRouter.post('/share-contact',authUser,requireVerification,shareContact)

rideRouter.post('/verify-otp',authCaptain,requireVerification,verifyOTP)

rideRouter.post('/complete-ride',authCaptain,requireVerification,completeRide)

rideRouter.post('/early-complete-ride',authUser,requireVerification,earlyCompleteRide)

rideRouter.post('/ride-history',authUserOrCaptain,requireVerification,getRideHistoryController)