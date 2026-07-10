import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { CaptainDataContext } from '../context/CaptainContext';
import LiveCaptainMarker from './cards/LiveCaptainMarker';
import AvailableRidePanel from './AvailableRidePanel';

const CaptainMap = ({
    currentLocation
}) => {
   

    function FlyToLocation({ location, zoom = 15 }) {

        const map = useMap();
        useEffect(() => {

            if (
                !location ||
                location.lat == null ||
                location.lng == null
            ) return;

            map.flyTo(
                [location.lat, location.lng],
                zoom
            );

        }, [location, zoom, map]);

        return null;
    }
    // function ChangeMapView({ center }) {

    //     const map = useMap();

    //     useEffect(() => {

    //         if (center) {
    //             map.flyTo(center, 15);
    //         }

    //     }, [center, map]);

    //     return null;
    // }
    //     async function getAddress(cords) {
    //     const token = localStorage.getItem("token");
    //     try {
    //         const res = await axios.get(
    //             `${import.meta.env.VITE_BASE_URL}/maps/get-address`,
    //             {
    //                 params: {
    //                     lat: cords.lat,
    //                     lng: cords.lng
    //                 },
    //                 headers: {
    //                     authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //         console.log(res.data);
    //         if (!res.data.success) {
    //             return toast.error(res.data.message)
    //         }
    //         if (!res.data.coordinate.toString().includes('India')) {
    //             return toast.error('cannot set locaiton outside from India')
    //         }

    //         if (selectionMode === 'pickUp') {
    //             setPickup({
    //                 address: res.data.coordinate,
    //                 lat: cords.lat,
    //                 lng: cords.lng
    //             })
    //         } else if (selectionMode === 'destination') {
    //             setDestination({
    //                 address: res.data.coordinate,
    //                 lat: cords.lat,
    //                 lng: cords.lng
    //             })
    //         }
    //     } catch (error) {
    //         console.log(error);

    //         toast.error("Failed to get address");
    //     }
    // }

    const { CaptainData } = useContext(CaptainDataContext)
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const locationErrorShown = useRef(false);


    const currentLocationRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const lastSentLocationRef = useRef(null);
    // const [liveLocation, setLiveLocation] = useState(null)
    const hasLocationChanged = (
        oldLocation,
        newLocation
    ) => {

        if (!oldLocation)
            return true;

        const latDiff =
            Math.abs(
                oldLocation.lat -
                newLocation.lat
            );

        const lngDiff =
            Math.abs(
                oldLocation.lng -
                newLocation.lng
            );

        // around 5-10 meters
        return (
            latDiff > 0.00005 ||
            lngDiff > 0.00005
        );
    };

    const updateCaptainLocation = async (location) => {
        try {

                const token =
                    localStorage.getItem("token");

                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/captains/update-location`,
                    {
                        params: {
                            lat: location.lat,
                            lng: location.lng
                        },
                        headers: {
                            authorization:
                                `Bearer ${token}`
                        }
                    }
                );

        } catch (error) {
        toast.error(error.response.data.message);
        }
    };

    useEffect(() => {

        if (CaptainData?.status !== "online") return;

        if (!isLiveTracking) return;

        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
                async (position) => {

                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    currentLocationRef.current = location;
 
                    const now = Date.now();

                    if (trackingLoading) setTrackingLoading(false);

                    if (
                        now - lastUpdateRef.current >= 5000 &&
                        hasLocationChanged(
                            lastSentLocationRef.current,
                            location
                        )
                    ) {

                        lastUpdateRef.current = now;
                        lastSentLocationRef.current = location;

                        await updateCaptainLocation(location);
                    }
                },
                (err) => {
                    console.log(err);

                },
                {
                    enableHighAccuracy: true
                }
            );

        return () =>
            navigator.geolocation.clearWatch(watchId);

    }, [isLiveTracking, CaptainData?.status]);

    return (
        <MapContainer
            // ref={mapRef}
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{
                position: 'relative',
                borderRadius: "10px",
                height: "100%",
                width: "100%",
                overflowY: 'hidden'
            }}
        >

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* current locataion */}
            {
                currentLocation && !isLiveTracking && (
                    <Marker
                        position={[
                            currentLocation.lat,
                            currentLocation.lng
                        ]}
                    />

                )
            }
            {
                isLiveTracking && <LiveCaptainMarker currentLocationRef={currentLocationRef} />
            }
            {
                currentLocation &&
                (
                    <FlyToLocation
                        location={currentLocation}
                    />
                )
            }

            {CaptainData?.status === 'online' &&
                <button
                    onClick={() => {

                        if (isLiveTracking) {
                            setIsLiveTracking(false);
                            return;
                        }

                        setTrackingLoading(true);
                        setIsLiveTracking(true);
                    }}
                    className="
        bg-white
        p-2
        z-400
        right-1
        m-5
        absolute
        rounded-lg
        shadow
    "
                >
                    {
                        trackingLoading
                            ? "Starting..."
                            : isLiveTracking
                                ? "Stop Tracking"
                                : "Live Tracking"
                    }
                </button>}



        </MapContainer>
    )
}

export default CaptainMap