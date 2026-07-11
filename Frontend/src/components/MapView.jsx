import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useMap } from "react-leaflet";
import location from '../assets/location.svg'
import axios from 'axios'
import toast from 'react-hot-toast';
import { Polyline } from "react-leaflet";
import { pickupIcon, destinationIcon } from '../utils/MapIcons';
const MapView = ({ currentLocation, selectionMode, setSelectionMode, setPickup, pickup, destination, setDestination, route, setRoute, activePanel }) => {
    const [selectedCoords, setSelectedCoords] = useState(null);

    async function getAddress(cords) {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/maps/get-address`,
                {
                    params: {
                        lat: cords.lat,
                        lng: cords.lng
                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.data.success) {
                return toast.error(res.data.message)
            }
            if (!res.data.coordinate.toString().includes('India')) {
                return toast.error('cannot set locaiton outside from India')
            }

            if (selectionMode === 'pickUp') {
                setPickup({
                    address: res.data.coordinate,
                    lat: cords.lat,
                    lng: cords.lng
                })
            } else if (selectionMode === 'destination') {
                setDestination({
                    address: res.data.coordinate,
                    lat: cords.lat,
                    lng: cords.lng
                })
            }
        } catch (error) {
            console.log(error);

            toast.error("Failed to get address");
        }
    }
    function ChangeMapView({ center }) {

        const map = useMap();

        useEffect(() => {

            if (center) {
                map.flyTo(center, 15);
            }

        }, [center, map]);

        return null;
    }

    const mapRef = useRef(null);
    function SaveMap() {
        const map = useMap();

        useEffect(() => {
            mapRef.current = map;
        }, [map]);

        return null;
    }

    // function FlyToCurrentLocation({ currentLocation }) {

    //     const map = useMap();

    //     useEffect(() => {

    //         if (!currentLocation) return;

    //         map.flyTo(
    //             [
    //                 currentLocation.lat,
    //                 currentLocation.lng
    //             ],
    //             15
    //         );

    //     }, [currentLocation]);

    //     return null;
    // }

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

    return (
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

            {
                selectionMode &&
                (
                    <div
                        className="
                absolute
                top-1/2
                left-1/2
                z-10000
                -translate-x-1/2
                -translate-y-full
                pointer-events-none
            "
                    >
                        <img src={location} className='w-10' alt="" />
                    </div>
                )
            }

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {
                currentLocation && (
                    <Marker
                        position={[
                            currentLocation.lat,
                            currentLocation.lng
                        ]}
                    />

                )
            }
            <div className="absolute top-5 right-5 z-1000 flex flex-col gap-2">
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
                    !(activePanel === 'waiting') && pickup && (
                        <button
                            onClick={() => { setPickup(null); setRoute([]) }}
                            className="
                    bg-white
                    p-2
                    rounded-lg
                    shadow
                "
                        >
                            Remove Pickup
                        </button>
                    )
                }

                {
                    !(activePanel === 'waiting') && destination && (
                        <button
                            onClick={() => { setDestination(null); setRoute([]) }}
                            className="
                    bg-white
                    p-2
                    rounded-lg
                    shadow
                "
                        >
                            Remove Destination
                        </button>
                    )
                }

            </div>
            {
                currentLocation && (
                    <FlyToLocation
                        location={currentLocation}
                    />
                )
            }
            {
                pickup && (
                    <FlyToLocation
                        location={pickup}
                    />
                )
            }
            {
                destination && (
                    <FlyToLocation
                        location={destination}
                    />
                )
            }
            < SaveMap />
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
                selectionMode && (
                    <div
                        className="
                absolute
                z-10000             

                top-5
                right-6
                left-auto
                translate-x-0

                flex
                flex-col
                gap-3
            "
                    >

                        {/* Confirm */}
                        <button
                            className="
                    bg-white
                    shadow-xl
                    border
                    border-gray-100

                    px-5
                    py-3

                    rounded-2xl

                    flex
                    items-center
                    justify-center

                    font-semibold
                    text-sm

                    hover:shadow-2xl
                    transition
                    min-w-45
                "
                            onClick={() => {

                                const center =
                                    mapRef.current.getCenter();

                                setSelectedCoords({
                                    lat: center.lat,
                                    lng: center.lng
                                });

                                getAddress({
                                    lat: center.lat,
                                    lng: center.lng
                                });

                                setSelectionMode(null);
                            }}
                        >
                            ✓ Confirm Location
                        </button>

                        {/* Remove */}
                        <button
                            className="
                    bg-white
                    shadow-xl
                    border
                    border-gray-100

                    px-5
                    py-3

                    rounded-2xl

                    flex
                    items-center
                    justify-center

                    font-semibold
                    text-sm

                    hover:shadow-2xl
                    transition

                    text-red-500

                    min-w-45
                "
                            onClick={() => {
                                setSelectionMode(null);
                            }}
                        >
                            ✕ Remove Pin
                        </button>

                    </div>
                )
            }

        </MapContainer>
    );
};

export default MapView;