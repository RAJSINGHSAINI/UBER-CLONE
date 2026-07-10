import express from 'express'
import { authUser, authUserOrCaptain } from '../middleware/auth.middleware.js';
import { getCoordinate,getAddress, getDistanceTime, autoCompleteSuggestions, getRouteController } from '../controller/map.controller.js';
import { query,body } from "express-validator";
import { requireVerification } from '../middleware/verification.middleware.js';

export const mapRouter = express.Router();

mapRouter.get('/get-coordinate', query('address').isString().isLength({ min: 3 }), authUser,requireVerification,  getCoordinate);

mapRouter.get('/get-address', authUser,requireVerification,  getAddress);

mapRouter.post('/get-distance-time', authUser,requireVerification,  getDistanceTime);

mapRouter.get('/get-suggestions', query('query').isString().isLength({ min: 3 }), authUser,requireVerification,  autoCompleteSuggestions);

mapRouter.get('/get-route',authUserOrCaptain,requireVerification, getRouteController)