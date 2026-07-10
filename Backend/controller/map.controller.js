import { getAddressCoordinate, getAddressDistanceTime, getAddressFromCoordinates, getAutoCompleteSuggestions, getRoute } from "../services/maps.services.js"
import { validationResult } from "express-validator";


export const getCoordinate = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    const { address } = req.query;
    try {
        const coordinate = await getAddressCoordinate(address);
        res.status(200).json({ success: true, coordinate });
    } catch (error) {
        res.status(404).json({ success: false, message: "coordinates not found" });
    }
}

export const getAddress = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    const { lat, lng } = req.query;
    try {
        const coordinate = await getAddressFromCoordinates(lat, lng);
        res.status(200).json({ success: true, coordinate });
    } catch (error) {
        res.status(404).json({ success: false, message: "coordinates not found" });
    }
}

export const getDistanceTime = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    const { pickup, destination } = req.body;

    if (!pickup || !destination) {
        return res.status(400).json({ success: false, message: "pickup and destination are required" });
    }

    try {
        const response = await getAddressDistanceTime(pickup, destination);
        res.status(200).json({ success: true, response });

    } catch (error) {

        res.status(404).json({ success: false, message: "coordinates not found" });
    }

}

export const autoCompleteSuggestions = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    const { query } = req.query;
    try {
        const suggestions = await getAutoCompleteSuggestions(query);
        if (!suggestions || suggestions.length === 0) {
            return res.status(404).json({ success: false, message: "No suggestions found" });
        }
        res.status(200).json({ success: true, suggestions });
    } catch (error) {
        res.status(404).json({ success: false, message: "Suggestions not found" });
    }


}

export const getRouteController = async (req, res) => {
    try {
        const {
            pickupLat,
            pickupLng,
            destinationLat,
            destinationLng
        } = req.query;

        const data = await getRoute(
            {
                lat: pickupLat,
                lng: pickupLng
            },
            {
                lat: destinationLat,
                lng: destinationLng
            }
        );        
        return res.status(200).json({success:true,route:data.route,duration:data.duration,distance:data.distance});

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};