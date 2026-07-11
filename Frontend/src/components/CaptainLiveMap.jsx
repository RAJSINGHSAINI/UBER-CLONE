import React, { useContext, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import gps from '../assets/gps.svg';
import { pickupIcon, destinationIcon } from '../utils/MapIcons';
import { useSocket } from '../hooks/useSocket';
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CaptainLiveMap = ({
    setLocationState,
    CaptainLiveLocation,
    setCaptainLiveLocation,
    route,
    pickup,
    destination,
    onClose,
    getCurrentLocation,
    ride,
    setETA
}) => {
    const mapRef = useRef(null);
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const watchIdRef = useRef(null);
    const lastBroadcastRef = useRef(0);
    const lastCaptainLocation = useRef(null)
    const lastRouteUpdateRef = useRef(0);
    const accumulatedDistance = useRef(0)
    const { CaptainData } = useContext(CaptainDataContext)
    const [captainRoute, setCaptainRoute] = useState([])
    const socket = useSocket()

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
                setETA(res.data.duration)
                
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
    function FlyToLocation({ location, zoom = 15 }) {
        const map = useMap();

        useEffect(() => {
            if (!location || location.lat == null || location.lng == null) return;
            map.flyTo([location.lat, location.lng], zoom);
        }, [location, zoom, map]);

        return null;
    }

    function LiveCaptainMarker({ currentLocation }) {
        const markerRef = useRef(null);
        const map = useMap();

        useEffect(() => {
            if (!currentLocation || currentLocation.lat == null || currentLocation.lng == null) return;

            if (markerRef.current) {
                markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
            }

            map.flyTo([currentLocation.lat, currentLocation.lng], 18, { animate: true });
        }, [currentLocation, map]);

        return <Marker ref={markerRef} position={[currentLocation?.lat || 0, currentLocation?.lng || 0]} />;
    }

    const startLiveTracking = () => {
        if (!navigator.geolocation) {
            setLocationState({ status: 'unsupported', message: "Your browser doesn't support location services." });
            return;
        }

        setLocationState({ status: 'loading', message: 'Requesting live location...' });
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
                if (!lastCaptainLocation.current) {
                    lastCaptainLocation.current = nextLocation;
                    return;
                }
                setCaptainLiveLocation(nextLocation);
                broadcastLiveLocation(nextLocation);
                setTrackingLoading(false);
                setLocationState({ status: 'granted', message: 'Live location updated successfully.' });

                const now = Date.now();

                const distance = getDistance(
                    lastCaptainLocation.current.lat,
                    lastCaptainLocation.current.lng,
                    nextLocation.lat,
                    nextLocation.lng
                );

                accumulatedDistance.current += distance;

                lastCaptainLocation.current = nextLocation;

                if (
                    accumulatedDistance.current > 200 &&
                    now - lastRouteUpdateRef.current > 30000
                ) {
                    accumulatedDistance.current = 0;
                    lastRouteUpdateRef.current = now;

                    updateCaptainRoute(nextLocation);
                }

            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationState({ status: 'denied', message: 'Location access denied. Please allow location permission from your browser settings.' });
                } else {
                    setLocationState({ status: 'denied', message: 'Unable to fetch your location. Please try again.' });
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleLiveToggle = () => {
        if (isLiveTracking) {
            stopLiveTracking();
            return;
        }

        startLiveTracking();
    };
    const stopLiveTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        setIsLiveTracking(false);
        setTrackingLoading(false);
    };


    useEffect(() => {
        if (!socket || !CaptainData?._id) return;

        socket.emit('join', { userId: CaptainData._id, userType: 'captain' });

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [socket, CaptainData?._id]);

    const broadcastLiveLocation = (nextLocation) => {
        if (!socket || !ride?._id || !nextLocation) return;
        const now = Date.now();
        if (now - lastBroadcastRef.current < 1000) return;
        lastBroadcastRef.current = now;

        socket.emit('captain-live-location', {
            rideId: ride._id,
            location: nextLocation,
            captainId: CaptainData?._id
        });
    };

    return (
        <>
            <div className="absolute z-10 inset-0 flex items-center justify-center text-2xl font-bold text-gray-600">
                <MapContainer
                    ref={mapRef}
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{
                        borderRadius: '10px',
                        height: '100%',
                        width: '100%'
                    }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {CaptainLiveLocation && <FlyToLocation location={CaptainLiveLocation} />}
                    {pickup && <FlyToLocation location={pickup} />}

                    {isLiveTracking && CaptainLiveLocation ? (
                        <LiveCaptainMarker currentLocation={CaptainLiveLocation} />
                    ) : CaptainLiveLocation ? (
                        <Marker position={[CaptainLiveLocation.lat, CaptainLiveLocation.lng]} />
                    ) : null}

                    {route?.length > 0 && (
                        <>
                            <Polyline positions={route} weight={5} color="gray" />
                        </>
                    )}

                    {pickup && (
                        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
                    )}

                    {destination && (
                        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
                    )}

                    {
                        captainRoute.length > 0 && (
                            <Polyline
                                positions={captainRoute}
                                color="green"
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
                <img className="w-5" src={gps} alt="" />
                <span className="text-sm text-gray-800">
                    {trackingLoading ? 'Starting...' : isLiveTracking ? 'Stop Tracking' : 'Live Location'}
                </span>
            </button>
        </>
    );
};

export default CaptainLiveMap;
