import React, { useEffect, useState } from "react";
import space from "../assets/spaceBar.svg";
import refresh from "../assets/refresh.svg";
import RideCard from "./cards/RideCard";

const AvailableRidePanel = ({
    onRefresh,
    loading,
    onClose,
    onAccept,
    onIgnore,
    onConfirm,
    setCurrentRide,
    availableRides,
    getConfirmRideData,
    setAvailableRides,
    setRange,
    range
}) => {

    const [rides, setRides] = useState([
        {
            _id: "1",
            pickup: {
                address: "Current Location"
            },
            destination: {
                address:
                    "Canara Bank, Ekta Vihar Phase 2, Haldwani"
            },
            vehicleType: "auto",
            fare: 149,
            distance: 5620,
            duration: 450,
            rideDisplayedTime: Date.now() + 15 * 60 * 1000
        },

        {
            _id: "2",
            pickup: {
                address: "Bus Stand, Haldwani"
            },
            destination: {
                address:
                    "Railway Station, Haldwani"
            },
            vehicleType: "car",
            fare: 230,
            distance: 9400,
            duration: 780,
            rideDisplayedTime:
                Date.now() + 15 * 60 * 1000
        },

        {
            _id: "3",
            pickup: {
                address:
                    "Mukhani Chauraha"
            },
            destination: {
                address:
                    "Kathgodam Railway Station"
            },
            vehicleType: "motorcycle",
            fare: 90,
            distance: 4200,
            duration: 310,
            rideDisplayedTime:
                Date.now() + 15 * 60 * 1000
        },

        {
            _id: "4",
            pickup: {
                address:
                    "MBPG College"
            },
            destination: {
                address:
                    "Gaulapar Stadium"
            },
            vehicleType: "car",
            fare: 310,
            distance: 13200,
            duration: 1020,
            rideDisplayedTime:
                Date.now() + 15 * 60 * 1000
        }
    ]);
    const [removingRide, setRemovingRide] = useState(null);


    const handleIgnore = (rideId) => {
        // start animation
        setRemovingRide(rideId);

        // remove after animation
        setTimeout(() => {
            setAvailableRides(prev =>
                prev.filter(
                    ride => ride._id !== rideId
                )
            );

            setRemovingRide(null);
        }, 300);
    };

    if (loading) {
        return (
            <div
                className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            flex
            flex-col
            items-center
            justify-center
            gap-5
            min-h-75
        "
            >

                {/* Spinner */}
                <div
                    className="
                w-14
                h-14
                border-4
                border-gray-200
                border-t-black
                rounded-full
                animate-spin
            "
                />

                {/* Text */}
                <div className="text-center">

                    <h3 className="text-lg font-semibold">
                        Finding Available Rides
                    </h3>

                    <p className="text-gray-500 mt-1">
                        Searching nearby requests...
                    </p>

                </div>

                {/* Skeleton cards */}
                <div className="w-full space-y-3">

                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="
                        animate-pulse
                        border
                        rounded-2xl
                        p-4
                    "
                        >
                            <div className="flex justify-between mb-4">
                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                <div className="h-4 w-12 bg-gray-200 rounded" />
                            </div>

                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 rounded" />
                                <div className="h-3 w-4/5 bg-gray-200 rounded" />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <div className="h-10 flex-1 bg-gray-200 rounded-xl" />
                                <div className="h-10 flex-1 bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        );
    }
    return (
        <div
            className="
                bg-white
                rounded-t-3xl
                h-dvh
                overflow-y-auto
            "
        >

            {/* drag handle */}

            <div className="sticky rounded-full z-100 top-0 backdrop-blur-sm w-full ">
                <img
                    className='w-10 mx-auto lg:hidden'
                    src={space}
                    onClick={onClose
                    }
                />
            </div>

            <div className="px-5">
                {/* header */}
                <div className="mb-6 flex w-full justify-between">
                    <div className="w-full">

                        <h1 className="
                    text-2xl
                    font-bold
                ">
                            Available Rides
                        </h1>

                        <p className="text-gray-500">
                            Nearby ride requests
                        </p>
                        <div className="flex justify-end flex-row gap-5">
                            <select
                                onChange={(e) => setRange(e.target.value)}
                                value={range.toString()}
                                className=" border rounded-xl px-4 py-3 bg-gray-50" name="range" id="">
                                <option value="5">5 KM</option>
                                <option value="10">10 KM</option>
                                <option value="50">50 KM</option>
                                <option value="100">100 KM</option>
                            </select>
                            <button
                                onClick={onRefresh}
                                className="bg-white
                            px-4
                        py-2
                        rounded-xl
                        shadow-sm
                        font-semibold
                        text-lg
                        text-center
                        gap-1
                        flex justify-center items-center
                        "
                            >
                                <img src={refresh} className="w-8" alt="" />
                                refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* rides */}

                <div className="space-y-5">

                    {
                        availableRides?.map(
                            ride => (
                                <RideCard
                                    key={ride._id}
                                    ride={ride}
                                    onAccept={() => { onConfirm(); setCurrentRide(ride); getConfirmRideData(ride) }}
                                    onIgnore={() => handleIgnore(ride._id)}
                                    isRemoving={removingRide === ride._id}
                                />
                            )
                        )
                    }

                </div>
            </div>
        </div>
    );
};


export default AvailableRidePanel;