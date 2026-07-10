import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import axios from 'axios';
import { destinationIcon, pickupIcon } from '../utils/MapIcons';
import toast from 'react-hot-toast';

const CaptainOngoingMap = ({
    isTracking,
    pickup,
    destination,
    initialLocation,
    setLocationState,
    onClose,
    setRemainingDistance,
    setRemainingTime
}) => {
    const mapRef = useRef(null);
    const watchIdRef = useRef(null);
    const [captainLocation, setCaptainLocation] = useState(initialLocation || null);
    const [route, setRoute] = useState([]);
    const lastLocationRef = useRef(null);
    const lastRouteUpdateRef = useRef(0);

    useEffect(() => {
        if (initialLocation) {
            setCaptainLocation(initialLocation);
        }
    }, [initialLocation]);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const updateRoute = async (currentLocation) => {
        if (!pickup?.lat || !pickup?.lng || !destination?.lat || !destination?.lng) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
                {
                    params: {
                        pickupLat: currentLocation.lat,
                        pickupLng: currentLocation.lng,
                        destinationLat: destination.lat,
                        destinationLng: destination.lng
                    },
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data?.success) {
                setRoute(response.data.route.map(([lng, lat]) => [lat, lng]));
                setRemainingDistance(response.data.distance);
                setRemainingTime(response.data.duration);
            }
        } catch (error) {
        toast.error(error.response.data.message);
        }
    };

    useEffect(() => {
        if (!isTracking) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            setLocationState?.({
                status: 'unsupported',
                message: "Your browser doesn't support location services."
            });
            return;
        }

        setLocationState?.({
            status: 'loading',
            message: 'Requesting live location...'
        });

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const nextLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                setCaptainLocation(nextLocation);
                setLocationState?.({
                    status: 'granted',
                    message: 'Live location updated successfully.'
                });
                onClose();

                if (!lastLocationRef.current) {
                    lastLocationRef.current = nextLocation;
                    updateRoute(nextLocation);
                    return;
                }

                const distance = getDistance(
                    lastLocationRef.current.lat,
                    lastLocationRef.current.lng,
                    nextLocation.lat,
                    nextLocation.lng
                );

                const now = Date.now();

                if (distance > 200 && now - lastRouteUpdateRef.current > 30000) {
                    lastLocationRef.current = nextLocation;
                    lastRouteUpdateRef.current = now;
                    updateRoute(nextLocation);
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationState?.({
                        status: 'denied',
                        message: 'Location access denied. Please allow location permission from your browser settings.'
                    });
                } else {
                    setLocationState?.({
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

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [destination?.lat, destination?.lng, isTracking, pickup?.lat, pickup?.lng, setLocationState]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    function FlyToLocation({ location }) {
        const map = useMap();

        useEffect(() => {
            if (!location ) return;

            map.flyTo([location.lat, location.lng], 18, { animate: true });
        }, [location, map]);

        return null;
    }

    const center = captainLocation
        ? [captainLocation.lat, captainLocation.lng]
        : pickup
            ? [pickup.lat, pickup.lng]
            : destination
                ? [destination.lat, destination.lng]
                : [20.5937, 78.9629];

    return (
        <div className="h-full w-full">
            <MapContainer
                ref={mapRef}
                center={center}
                zoom={13}
                style={{
                    borderRadius: '10px',
                    height: '100%',
                    width: '100%'
                }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {captainLocation && <FlyToLocation location={captainLocation} />}

                {captainLocation && (
                    <Marker position={[captainLocation.lat, captainLocation.lng]} />
                )}

                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
                )}

                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
                )}

                {route.length > 0 && (
                    <Polyline positions={route} weight={5} color="blue" />
                )}
            </MapContainer>
        </div>
    );
};

export default CaptainOngoingMap;
