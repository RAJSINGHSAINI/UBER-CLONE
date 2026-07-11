import React, { useContext, useEffect, useState } from 'react'
import arrow from '../assets/downArrow.svg'
import space from '../assets/spaceBar.svg'
import gps from '../assets/gps.svg'
import pin from '../assets/pin.svg'
import search from '../assets/search.svg'
import toast from 'react-hot-toast'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'
import { useRef } from 'react'

const RidePanel = ({
    currentLocation,
    setSelectionMode,
    selectionMode,
    bottomSheetOpen,
    setBottomSheetOpen,
    setLocationState,
    locationState,
    pickup,
    setPickup,
    destination,
    setDestination,
    setCurrentLocation,
    setActivePanel,
    getFare,
    setRoute,
    activePanel,
    setBottomSheetsOpenForDriver
}) => {


    const [pickUpAddress, setPickUpAddress] = useState('')
    const [dropAddress, setDropAddress] = useState('')
    const { UserData, setUserData } = useContext(UserDataContext)
    // suggestions

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);

    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // history states
    const [showRideHistory, setShowRideHistory] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [rideHistory, setRideHistory] = useState([])
    const historyRef = useRef()

    const updateUserLocation = async (location) => {
        try {

            const token =
                localStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/users/update-location`,
                {
                    params: {
                        lat: location.latitude,
                        lng: location.longitude
                    },
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setUserData(res.data.user)
                toast.success('Location Updated.')
            }

        } catch (error) {
            toast.error(error.response.data.message);
        }
    };
    const getCurrentLocation = () => {


        setBottomSheetOpen(false)
        if (!navigator.geolocation) {
            setLocationState({
                status: "unsupported",
                message: "Your browser doesn't support location services."
            });

            return;
        }

        setLocationState({
            status: "loading",
            message: "Requesting location permission..."
        });

        navigator.geolocation.getCurrentPosition(
            async (position) => {

                const { latitude, longitude } = position.coords;

                await updateUserLocation({ latitude, longitude })

                if (activePanel === 'waiting') {
                } else {
                    setPickup({
                        address: "Current Location",
                        lat: latitude,
                        lng: longitude
                    });
                    setPickUpAddress('Current Location')
                    toast.success('Current location set to pick up.')
                }


                setCurrentLocation({
                    lat: latitude,
                    lng: longitude
                })


                setLocationState({
                    status: "granted",
                    message: "Current location detected successfully."
                });
                setTimeout(() => {
                    setLocationState({
                        status: "idle",
                        message: ""
                    });

                }, 2000);

            },
            (error) => {

                if (error.code === error.PERMISSION_DENIED) {

                    setLocationState({
                        status: "denied",
                        message:
                            "Location access denied. Please allow location permission from your browser settings."
                    });

                } else {

                    setLocationState({
                        status: "denied",
                        message:
                            "Unable to fetch your location. Please try again."
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

    useEffect(() => {
        setPickUpAddress(pickup?.address || '')
    }, [pickup])
    useEffect(() => {
        setDropAddress(destination?.address || '')
    }, [destination])

    async function getCoordinate(address, type) {
        try {
            if (!address) {
                return toast.error("please fill address")
            }
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/maps/get-coordinate`,
                {
                    params: {
                        address
                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            )


            if (!res?.data?.success) {
                return toast.error(res.data.message)
            }

            const { lat, lng } = res.data.coordinate;

            if (type === 'pickup') {
                setPickup({
                    address,
                    lat,
                    lng
                });
            }
            else if (type === 'destination') {
                setDestination({
                    address,
                    lat,
                    lng
                });
            }

        } catch (error) {
            toast.error("something went wrong")
        }
    }

    const getSuggestions = async (query, type) => {

        if (!query) {
            if (type === "pickup")
                setPickupSuggestions([]);

            else
                setDestinationSuggestions([]);

            return;
        }
        if (!type) return
        try {

            const token =
                localStorage.getItem("token");

            const res =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
                    {
                        params: {
                            query
                        },
                        headers: {
                            authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (!res?.data?.success) {
                return toast.error(res.data.message)
            }

            if (type === "pickup") {
                setPickupSuggestions(
                    res.data.suggestions
                );

                setShowPickupSuggestions(
                    true
                );
            }
            else {
                setDestinationSuggestions(
                    res.data.suggestions
                );

                setShowDestinationSuggestions(
                    true
                );
            }

        }
        catch (err) {
            if (err.response.status == 404) {
                return
            }
            toast.error(err.response.data.message);
        }
    }

    useEffect(() => {

        const timer =
            setTimeout(() => {

                getSuggestions(
                    pickUpAddress,
                    "pickup"
                );

            }, 800);

        return () => clearTimeout(timer);

    }, [pickUpAddress]);

    useEffect(() => {

        const timer =
            setTimeout(() => {

                getSuggestions(
                    dropAddress,
                    "destination"
                );
            }, 800);

        return () => clearTimeout(timer);

    }, [dropAddress]);

    function onCurrentRide() {
        setBottomSheetsOpenForDriver(true)
    }
    function onContinue() {
        if (activePanel === 'waiting') {
            return toast.error('You already have an active ride')
        }
        if (!pickUpAddress) {
            return toast.error("please fill pick up address")
        }
        if (!dropAddress) {
            return toast.error("please fill destination address")
        }

        if (!pickup) {
            return toast.error("please confirm pick up or choose by pin")
        }
        if (!destination) {
            return toast.error("please confirm destination or choose by pin")
        }
        getFare()
        setBottomSheetOpen(false)
    }
    const formatDuration = (seconds) => {
        if (!seconds) return "0 min";

        const totalMinutes = Math.floor(seconds / 60);

        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;

            return mins === 0
                ? `${hours} hr`
                : `${hours} hr ${mins} min`;
        }

        return `${totalMinutes} min`;
    };
    // fetch history

    useEffect(() => {
        if (!showRideHistory) return;

        const timer = setTimeout(() => {
            historyRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [showRideHistory]);
    async function fetchRideHistory() {
        try {
            const token = localStorage.getItem('token')
            setHistoryLoading(true)
            setShowRideHistory(false)
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/ride-history`, {
                userId: UserData._id,
                userType: 'user'
            },
                {
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );
            if (!res.data.success) {
                return toast.error(res.data.message);
            }
            setRideHistory(res.data.rides);
            setShowRideHistory(true)
        } catch (error) {
            console.log(error);
            console.log(error.response.data);

        } finally {
            setHistoryLoading(false)
        }
    }

    return (
        <div>
            <div className='sticky top-0 rounded-b overflow-hidden z-100 w-full backdrop-blur-xl'>
                <img
                    className='w-10 mx-auto lg:hidden'
                    src={space}
                    onClick={() =>
                        setBottomSheetOpen(
                            !bottomSheetOpen
                        )
                    }
                />
            </div>
            <div
                className=" bg-white rounded-3xl relative shadow-xl px-5 sm:px-6 md:pb-8 w-full mx-auto z-10 ">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Where to?
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">
                        Choose your pickup and destination
                    </p>

                </div>

                {/* Locations */}
                <div className="relative">

                    {/* vertical line */}
                    <div
                        className="absolute left-3.75 top-10 h-16 w-0.5 bg-gray-300 " />

                    {/* Pickup */}

                    {
                        pickup ? (

                            <div className="bg-white rounded-2xl border shadow-sm p-4 my-2 flex justify-between items-center ">

                                <div className="flex gap-4">

                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center ">
                                        <img src={pin} className='w-5' alt="" />
                                    </div>

                                    <div className='w-50'>
                                        <h3 className="font-semibold">
                                            Pickup
                                        </h3>

                                        <p className="wrap-break-word text-gray-500">
                                            {pickup.address}
                                        </p>
                                    </div>

                                </div>

                                {!(activePanel === 'waiting') && <button
                                    onClick={() => { setPickup(null); setRoute([]) }}
                                    className="text-2xl text-gray-400 hover:text-black " >
                                    ×
                                </button>}

                            </div>

                        ) : (
                            <div className='relative my-2'>
                                <div
                                    className=" flex my-2 items-center bg-gray-100 rounded-2xl px-4 py-2 transition hover:bg-gray-200 " >
                                    <input
                                        type="text"
                                        placeholder="Enter pickup location"
                                        value={pickUpAddress}
                                        onChange={(e) => setPickUpAddress(e.target.value)}
                                        className=" flex-1 bg-transparent text-base placeholder:text-gray-500 outline-none border-none focus:outline-none focus:ring-0 py-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { getCoordinate(pickUpAddress, 'pickup'); setBottomSheetOpen(false) }}
                                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white transition " >
                                        <img
                                            src={search}
                                            className="w-5 h-5 opacity-70"
                                            alt="search"
                                        />
                                    </button>
                                </div>
                                {
                                    showPickupSuggestions &&
                                    pickupSuggestions.length > 0 &&
                                    (
                                        <div className=" absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-y-auto max-h-72 " >
                                            {
                                                pickupSuggestions.map(
                                                    (item, index) => (
                                                        <button
                                                            onClick={() => {
                                                                setPickup({
                                                                    address: item.label,
                                                                    lat: item.coordinates.lat,
                                                                    lng: item.coordinates.lng
                                                                })
                                                                setBottomSheetOpen(false)
                                                                setShowPickupSuggestions(false)
                                                            }}
                                                            key={index}
                                                            className=" w-full flex gap-4 items-start px-4 py-4 hover:bg-gray-50 transition border-b border-gray-100 ">
                                                            <div className=" w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center shrink-0 " > <img src={pin} className='w-5' alt="" /> </div>
                                                            <div className="text-left flex-1">
                                                                <p className=" font-medium text-sm wrap-break-words " >
                                                                    {item.label}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {/* Destination */}

                    {
                        destination ? (

                            <div className="bg-white rounded-2xl border shadow-sm my-2 p-4 flex justify-between items-center ">

                                <div className="flex gap-4">

                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center ">
                                        🏠
                                    </div>

                                    <div className='w-50'>
                                        <h3 className="font-semibold">
                                            Destination
                                        </h3>

                                        <p className=" wrap-break-wordtext-gray-500">
                                            {destination.address}
                                        </p>
                                    </div>

                                </div>

                                {!(activePanel === 'waiting') && <button
                                    onClick={() => { setDestination(null); setRoute([]) }}
                                    className=" text-2xl text-gray-400 hover:text-black ">
                                    ×
                                </button>}

                            </div>

                        ) : (
                            <div className='relative my-2'>
                                <div
                                    className=" flex my-2 items-center bg-gray-100 rounded-2xl px-4 py-2 transition hover:bg-gray-200 " >
                                    <input
                                        type="text"
                                        value={dropAddress}
                                        placeholder="Where are you going?"
                                        onChange={(e) => setDropAddress(e.target.value)}
                                        className=" flex-1 bg-transparent text-base placeholder:text-gray-500 outline-none border-none focus:outline-none focus:ring-0 py-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { getCoordinate(dropAddress, 'destination'); setBottomSheetOpen(false) }}
                                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white transition " >
                                        <img
                                            src={search}
                                            className="w-5 h-5 opacity-70"
                                            alt="search"
                                        />
                                    </button>
                                </div>
                                {
                                    showDestinationSuggestions &&
                                    destinationSuggestions.length > 0 &&
                                    (
                                        <div className=" absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-y-auto max-h-72 " >
                                            {
                                                destinationSuggestions.map(
                                                    (item, index) => (
                                                        <button
                                                            onClick={() => {
                                                                setDestination({
                                                                    address: item.label,
                                                                    lat: item.coordinates.lat,
                                                                    lng: item.coordinates.lng
                                                                })
                                                                setBottomSheetOpen(false)
                                                                setDestinationSuggestions(false)
                                                            }}
                                                            key={index}
                                                            className=" w-full flex gap-4 items-start px-4 py-4 hover:bg-gray-50 transition border-b border-gray-100 ">
                                                            <div className=" w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center shrink-0 " > <img src={pin} className='w-5' alt="" /> </div>
                                                            <div className="text-left flex-1">
                                                                <p className=" font-medium text-sm wrap-break-words " >
                                                                    {item.label}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                </div>

                {/* Actions */}
                {!(activePanel === 'waiting') && <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <button
                        onClick={() => { setSelectionMode('pickUp'); setBottomSheetOpen(false) }}
                        className="flex-1 border flex w-full justify-center items-center gap-3 border-gray-200 rounded-xl py-3 font-medium hover:bg-gray-100 " >
                        <img src={pin} className='w-5' alt="" /> <span> Select PickUp</span>
                    </button>

                    <button
                        onClick={() => { setSelectionMode('destination'); setBottomSheetOpen(false) }}
                        className="flex-1 border flex w-full justify-center items-center gap-3 border-gray-200 rounded-xl py-3 font-medium hover:bg-gray-100 " >
                        <img src={pin} className='w-5' alt="" /> <span> Select Destination</span>
                    </button>
                </div>}
                <button
                    onClick={getCurrentLocation}
                    className="
        mt-6
        w-full
        bg-white
        rounded-2xl
        p-4
        border
        shadow-sm
        flex
        justify-between
        items-center
        hover:bg-gray-50
    "
                >

                    <div className="flex gap-4">

                        <div className="
            w-12
            h-12
            rounded-full
            bg-black
            text-white
            flex
            items-center
            justify-center
        ">
                            <img src={gps} className='w-10 invert-100' alt="" />
                        </div>

                        <div className="text-left">

                            <div className="font-semibold">
                                Use Current Location
                            </div>

                            <div className="text-sm text-gray-500">
                                Detect my location
                            </div>

                        </div>

                    </div>

                    <div className="text-2xl">
                        ›
                    </div>

                </button>
                {
                    locationState.status !== "idle" && (
                        <div
                            className={`
                mt-4
                rounded-2xl
                p-4
                text-sm
                font-medium

                ${locationState.status === "granted"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : ""
                                }

                ${locationState.status === "loading"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : ""
                                }

                ${locationState.status === "denied"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : ""
                                }

                ${locationState.status === "unsupported"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    : ""
                                }
            `}
                        >
                            {locationState.message}
                        </div>
                    )
                }
                {/* current ride */}
                <div className="mt-8 ">

                    {
                        activePanel === 'waiting' && (

                            <button
                                onClick={onCurrentRide}
                                className="
                        w-full
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
                            >
                                Current Ride
                            </button>

                        )
                    }

                </div>

                <div>
                    <button
                        onClick={async () => {
                            if (showRideHistory) {
                                setShowRideHistory(false);
                                return;
                            }
                            await fetchRideHistory();
                        }}
                        disabled={historyLoading}
                        className="
            w-full
            border
            py-4
            mt-4
            rounded-2xl
            font-semibold
            disabled:opacity-50
        "
                    >
                        {historyLoading ? "Loading..." : showRideHistory ? "Hide Ride History" : "Ride History"}
                    </button>
                </div>

                {/* history */}
                <div
                    ref={historyRef}
                    className={`
              overflow-hidden
              transition-all
              duration-300
              ease-out
              pb-2
              ${showRideHistory ? "max-h-128 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}
            `}
                >
                    <div className="max-h-104 overflow-y-auto pr-1 space-y-3">
                        {rideHistory.length > 0 ? (
                            rideHistory.map((ride) => (
                                <div key={ride._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                Passenger
                                            </p>
                                            <p className="truncate font-semibold text-sm">
                                                {ride?.user?.fullname?.firstname} {ride?.user?.fullname?.lastname}
                                            </p>
                                            <p className="truncate text-xs text-gray-500">
                                                {ride?.user?.email}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">₹{ride?.fare}</p>
                                            <p className="text-xs capitalize text-gray-500">{ride?.status}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <div className="mt-1 flex flex-col items-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                            <div className="mt-1 h-[50%] w-0.5 bg-gray-300" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2 text-sm">
                                            <p className=" font-medium">{ride?.pickup?.address}</p>
                                            <p className=" font-medium">{ride?.destination?.address}</p>
                                            <p className='text-xs capitalize text-gray-500'> ride date: {new Date(ride?.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-gray-200 pt-2 text-sm text-gray-600">
                                        <div>
                                            <p className="text-gray-500">Distance</p>
                                            <p className="font-semibold">{(ride?.distance / 1000).toFixed(1)} km</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Time</p>
                                            <p className="font-semibold">{formatDuration(ride?.duration)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Rating</p>
                                            <p className="font-semibold">⭐ {ride?.captainRating ?? "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                                No ride history yet.
                            </p>
                        )}
                    </div>
                </div>
                {/* Continue */}
                <button
                    onClick={onContinue}
                    className=" mt-6 w-full bg-black text-white py-4 rounded-2xl font-semibold text-base hover:opacity-90 transition " >
                    Continue
                </button>

            </div>
        </div>
    )
}

export default RidePanel 