import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import gps from '../assets/gps.svg'
import { pickupIcon, destinationIcon, captainIcon } from '../utils/MapIcons';
import { useSocket } from '../hooks/useSocket';
import { registerUserEvents, unregisterUserEvents } from '../socket/socketEvents';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserLiveMap = ({
    setLocationState,
    UserLiveLocation,
    setUserLiveLocation,
    getCurrentLocation,
    route,
    pickup,
    destination,
    setRouteData
}) => {
    const mapRef = useRef(null);
    const watchIdRef = useRef(null);
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [CaptainLiveLocation, setCaptainLiveLocation] = useState(null)
    const [captainRoute, setCaptainRoute] = useState([]);

    const isFlyToCurrentLocation = useRef(false)
    const previousUserLocationRef = useRef(null)
    const lastCaptainLocationRef = useRef(null);
    const lastRouteUpdateRef = useRef(0);
    useEffect(() => {
        if (!UserLiveLocation) return;

        const hasChanged = !previousUserLocationRef.current ||
            previousUserLocationRef.current.lat !== UserLiveLocation.lat ||
            previousUserLocationRef.current.lng !== UserLiveLocation.lng;

        previousUserLocationRef.current = UserLiveLocation;

        if (hasChanged) {
            isFlyToCurrentLocation.current = true;
        }
    }, [UserLiveLocation]);

    function FlyToLocation({ location }) {
        const map = useMap();

        useEffect(() => {
            if (!location || !isFlyToCurrentLocation.current) return;

            isFlyToCurrentLocation.current = false;
            map.flyTo([location.lat, location.lng], 18, { animate: true });
        }, [location, map]);

        return null;
    }

    function LiveUserMarker({ currentLocation }) {
        const markerRef = useRef(null);
        const map = useMap();

        useEffect(() => {
            if (!currentLocation || currentLocation.lat == null || currentLocation.lng == null) return;

            if (markerRef.current) {
                markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
            }
        }, [currentLocation, map]);

        return <Marker ref={markerRef} position={[currentLocation?.lat || 0, currentLocation?.lng || 0]} />;
    }
    function CaptainMarker({ location }) {

        const markerRef = useRef();

        useEffect(() => {

            if (
                markerRef.current &&
                location
            ) {

                markerRef.current.setLatLng([
                    location.lat,
                    location.lng
                ]);
            }

        }, [location]);

        return (
            <Marker
            
                ref={markerRef}
                position={[
                    location?.lat || 0,
                    location?.lng || 0
                ]}
                icon={captainIcon}
            />
        );
    }

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const stopLiveTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        setIsLiveTracking(false);
        setTrackingLoading(false);
    };

    const startLiveTracking = () => {
        if (!navigator.geolocation) {
            setLocationState({
                status: 'unsupported',
                message: "Your browser doesn't support location services."
            });
            return;
        }

        setLocationState({
            status: 'loading',
            message: 'Requesting live location...'
        });
        setTrackingLoading(true);
        setIsLiveTracking(true);

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const nextLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                setUserLiveLocation(nextLocation);
                setTrackingLoading(false);
                setLocationState({
                    status: 'granted',
                    message: 'Live location updated successfully.'
                });
            },
            (error) => {

                if (error.code === error.PERMISSION_DENIED) {
                    setLocationState({
                        status: 'denied',
                        message: 'Location access denied. Please allow location permission from your browser settings.'
                    });
                } else {
                    setLocationState({
                        status: 'denied',
                        message: 'Unable to fetch your location. Please try again.'
                    });
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleLiveToggle = () => {
        if (isLiveTracking) {
            stopLiveTracking();
            return;
        }

        startLiveTracking();
    };

    const updateCaptainRoute = async (captainLocation) => {

        try {

            const token = localStorage.getItem('token');

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
                {
                    params: {
                        pickupLat: captainLocation.lat,
                        pickupLng: captainLocation.lng,
                        destinationLat: pickup.lat,
                        destinationLng: pickup.lng
                    },
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                setRouteData(res.data)
                setCaptainRoute(
                    res.data.route.map(
                        point => [point[1], point[0]]
                    )
                );
            }

        } catch (error) {
        toast.error(error.response.data.message);
        }
    };


function getDistance(lat1, lon1, lat2, lon2) {

        const R = 6371000;

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
    }
    const socket = useSocket()

    useEffect(() => {

        const handlers = {

            onLiveLocation: async (data) => {

                const newLocation = data.location;

                setCaptainLiveLocation(newLocation);

                if (!lastCaptainLocationRef.current) {
                    lastCaptainLocationRef.current = newLocation;
                    return;
                }

                const distance = getDistance(
                    lastCaptainLocationRef.current.lat,
                    lastCaptainLocationRef.current.lng,
                    newLocation.lat,
                    newLocation.lng
                );

                const now = Date.now();

                if (distance > 200 && now - lastRouteUpdateRef.current > 30000) {

                    lastCaptainLocationRef.current = newLocation;
                    lastRouteUpdateRef.current = now;

                    updateCaptainRoute(newLocation);
                }
            }
        };
        registerUserEvents(
            socket,
            handlers
        );

        return () => {
            unregisterUserEvents(
                socket,
                handlers
            );
        };

    }, []);


    return <>
        <div className="absolute z-10 inset-0 flex items-center justify-center text-2xl font-bold text-gray-600">
            <MapContainer
                ref={mapRef}
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{
                    borderRadius: "10px",
                    height: "100%",
                    width: "100%"
                }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {UserLiveLocation && <FlyToLocation location={UserLiveLocation} />}

                {isLiveTracking && UserLiveLocation ? (
                    <LiveUserMarker currentLocation={UserLiveLocation} />
                ) : UserLiveLocation ? (
                    <Marker position={[UserLiveLocation.lat, UserLiveLocation.lng]}

                    />
                ) : null}

                {
                    CaptainLiveLocation &&
                    <CaptainMarker
                        location={
                            CaptainLiveLocation
                        }

                    />
                }

                {
                    route.length > 0 && (
                        <>
                            <Polyline
                                positions={route}
                                weight={5}
                                color="black"
                            />

                        </>
                    )
                }

                {
                    pickup && (
                        <Marker
                            position={[
                                pickup.lat,
                                pickup.lng
                            ]}
                            icon={pickupIcon}
                        />
                    )
                }
                {
                    destination && (
                        <Marker
                            position={[
                                destination.lat,
                                destination.lng
                            ]}
                            icon={destinationIcon}
                        />
                    )
                }

                {
                    captainRoute.length > 0 && (
                        <Polyline
                            positions={captainRoute}
                            color="blue"
                            weight={5}
                        />
                    )
                }

            </MapContainer>
        </div>

        <button
            onClick={handleLiveToggle}
            className="absolute z-15 flex justify-center items-center lg:bottom-5 bottom-1/3 left-5 bg-white px-3 py-1 rounded-xl shadow-lg font-semibold lg:block"
        >
            <img className='w-5' src={gps} alt="" />
            <span className='text-sm text-gray-800'>
                {trackingLoading ? 'Starting...' : isLiveTracking ? 'Stop Tracking' : 'Live Location'}
            </span>
        </button>
    </>
}

export default UserLiveMap