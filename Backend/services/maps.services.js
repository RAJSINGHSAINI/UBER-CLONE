import axios from "axios";
import { captainModel } from "../models/captain.model.js";

export const getAddressCoordinate = async (address) => {

    if (!address) {
        throw new Error("Address is required");
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    try {

        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
                params: {
                    text: address,
                    filter: "countrycode:in",
                    limit: 1,
                    apiKey
                }
            }
        );

        const feature = response.data.features[0];

        if (!feature) {
            throw new Error("Location not found");
        }

        return {
            lat: feature.properties.lat,
            lng: feature.properties.lon
        };

    } catch (error) {

        console.error(
            "Geoapify Geocoding Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export const getAddressDistanceTime = async (pickup, destination) => {

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            const response = await axios.post(
                "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
                {
                    coordinates: [
                        [Number(pickup.lng), Number(pickup.lat)],
                        [Number(destination.lng), Number(destination.lat)]
                    ],
                    radiuses: [10000, 10000]
                },
                {
                    headers: {
                        Authorization: process.env.ORS_API_KEY,
                        "Content-Type": "application/json"
                    }
                }
            );

            // Parse response
            const feature = response.data.features[0];
            const route = feature.geometry.coordinates;
            const summary = feature.properties.summary;

            return {
                distance: summary.distance,
                duration: summary.duration,
                route
            };

        } catch (error) {

            // Retry only for 502
            if (
                (error.response?.status === 502 ||
                    error.response?.status === 504) &&
                attempt < MAX_RETRIES
            ) {

                console.log(
                    `502 received. Retrying ${attempt}/${MAX_RETRIES}...`
                );

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                continue;
            }

            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);

            throw error;
        }
    }
};


export const getAutoCompleteSuggestions = async (query) => {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/autocomplete",
            {
                params: {
                    text: query,
                    filter: "countrycode:in",
                    limit: 5,
                    apiKey
                }
            }
        );

        return response.data.features.map((place) => ({

            label: place.properties.formatted,

            coordinates: {
                lat: place.properties.lat,
                lng: place.properties.lon
            }

        }));
    } catch (error) {
        console.log(error);

    }
}


export const getCaptainInTheRadius = async (lat, lng, radius, vehicleType) => {
    return await captainModel.find({
        status: "online",
        "vehicle.vehicleType": vehicleType,
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6371]
            }
        }
    });
}
export const getAddressFromCoordinates = async (lat, lng) => {

    try {
        if (!lat || !lng) {
            throw new Error(
                "lng or lat required"
            );
        }
        const apiKey = process.env.GEOAPIFY_API_KEY;

        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
                params: {
                    lat,
                    lon: lng,
                    apiKey
                }
            }
        );



        const feature = response.data.features[0];

        if (!feature) {
            throw new Error(
                "Address not found"
            );
        }

        return feature.properties.formatted;
    } catch (error) {
        console.log(error);

    }
};

export const getRoute = async (
    pickup,
    destination
) => {

    try {
        const response = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                coordinates: [
                    [pickup.lng, pickup.lat],
                    [destination.lng, destination.lat]
                ],
                radiuses: [5000, 5000]
            },
            {
                headers: {
                    Authorization:
                        process.env.ORS_API_KEY,
                    "Content-Type":
                        "application/json"
                }
            }
        );
        console.log('api call');
        const feature = response.data.features[0];

        const route = feature.geometry.coordinates;

        const distance = feature.properties.summary.distance; // meters

        const duration = feature.properties.summary.duration; // seconds

        return { route, distance, duration };
    }
    catch (error) {

        console.log("STATUS:",
            error.response?.status);

        console.log("DATA:",
            error.response?.data);

        console.log("MESSAGE:",
            error.message);
    }
};