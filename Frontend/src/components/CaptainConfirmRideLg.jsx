import React, { useContext, useEffect, useState } from "react";
import cross from '../assets/cross.svg'
import { useSocket } from "../hooks/useSocket";
import { registerCaptainEvents, unregisterCaptainEvents } from "../socket/socketEvents";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainConfirmRideLg = ({
    currentRideDataWithUser,
    onConfirm,
    onIgnore,
    onClose,
    onOpen
}) => {

    const navigate = useNavigate()

    const { acceptRideData, setAcceptRideData } = useContext(CaptainDataContext)
    const [ride, setRide] = useState(
        currentRideDataWithUser?.ride || null
    );
        const [isConfirm, setIsConfirm] = useState(false)

    const [user, setUser] = useState(
        currentRideDataWithUser?.user || null
    );

    const [isNewRide, setIsNewRide] = useState(false)

    useEffect(() => {
        if (currentRideDataWithUser) {
            setRide(currentRideDataWithUser.ride);
            setUser(currentRideDataWithUser.user);
            setIsNewRide(false)
        }
    }, [currentRideDataWithUser]);


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

    const formatDistance = (distance) => {
        if (!distance) return "0 m";

        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(1)} km`;
        }

        return `${distance} m`;
    };

    const socket = useSocket();

    useEffect(() => {

        const handlers = {

            onNewRide: (data) => {
                onOpen()
                setRide(data.ride);
                setUser(data.user);
                setIsNewRide(true)
            }
        };
        registerCaptainEvents(
            socket,
            handlers
        );

        return () => {

            unregisterCaptainEvents(
                socket,
                handlers
            );
        };

    }, []);

    async function onConfirm() {

        try {

            const token = localStorage.getItem('token')
            setIsConfirm(true)

            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/ride-accept`, {
                rideId: ride._id
            },
                {
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!res.data.success) {
                return toast.error(res.data.message)
            }
            setAcceptRideData(res.data.data)

            setTimeout(() => {
                navigate('/captains/live-tracking')
            }, 500);


            return toast.success('ride accepted successfully')

        } catch (error) {
              toast.error(error.response.data.message);
        } finally{
            setIsConfirm(false)
        }

    }

    return (
        <div
            className="
                bg-white
                rounded-3xl
                shadow-xl
                p-8
                hidden
                lg:block
                w-full
                "
        >
            {/* Close */}
            <img
                src={cross}
                className="w-7 absolute top-6 right-6 cursor-pointer"
                alt=""
                onClick={onClose}
            />
            {/* header */}
            <div className="mb-8">

                <h1 className="
                    text-3xl
                    font-bold
                ">
                    {isNewRide ? 'New Ride' : 'Confirm Ride'}
                </h1>

                <p className="text-gray-500">
                    Verify passenger and trip details
                </p>

            </div>

            <div className="
                grid
                grid-cols-2
                gap-8
            ">

                {/* Passenger */}
                <div
                    className="
                        border
                        rounded-2xl
                        p-6
                    "
                >

                    <h2 className="
                        font-bold
                        text-xl
                        mb-5
                    ">
                        Passenger
                    </h2>

                    <div className="
                        flex
                        gap-4
                        items-center
                        mb-6
                    ">

                        <div
                            className="
                                w-16
                                h-16
                                rounded-full
                                bg-black
                                text-white
                                flex
                                items-center
                                justify-center
                                text-2xl
                                font-bold
                            "
                        >
                            {user?.fullname?.firstname?.[0]}
                        </div>

                        <div>

                            <h3 className="font-bold text-lg">
                                {user?.fullname?.firstname}
                                {" "}
                                {user?.fullname?.lastname}
                            </h3>

                            <p className="text-gray-500">
                                {user?.email}
                            </p>

                            <span
                                className="
                                    inline-block
                                    mt-2
                                    px-3
                                    py-1
                                    rounded-full
                                    bg-green-100
                                    text-green-700
                                    text-sm
                                "
                            >
                                Verified Passenger
                            </span>

                        </div>

                    </div>

                    <div className="space-y-4">

                        <div>
                            <p className="text-gray-500 text-sm">
                                Pickup
                            </p>

                            <p className="font-semibold">
                                {ride?.pickup?.address}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-sm">
                                Destination
                            </p>

                            <p className="font-semibold">
                                {ride?.destination?.address}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Ride Details */}
                <div
                    className="
                        border
                        rounded-2xl
                        p-6
                    "
                >

                    <h2 className="
                        font-bold
                        text-xl
                        mb-5
                    ">
                        Ride Details
                    </h2>

                    <div className="
                        grid
                        grid-cols-2
                        gap-4
                    ">

                        <div className="
                            bg-gray-50
                            rounded-xl
                            p-5
                        ">
                            <p className="
                                text-sm
                                text-gray-500
                            ">
                                Fare
                            </p>

                            <p className="
                                text-2xl
                                font-bold
                            ">
                                ₹{ride?.fare}
                            </p>
                        </div>

                        <div className="
                            bg-gray-50
                            rounded-xl
                            p-5
                        ">
                            <p className="
                                text-sm
                                text-gray-500
                            ">
                                Distance
                            </p>

                            <p className="
                                text-2xl
                                font-bold
                            ">
                                {formatDistance(
                                    ride?.distance
                                )}
                            </p>
                        </div>

                        <div className="
                            bg-gray-50
                            rounded-xl
                            p-5
                        ">
                            <p className="
                                text-sm
                                text-gray-500
                            ">
                                Duration
                            </p>

                            <p className="
                                text-2xl
                                font-bold
                            ">
                                {formatDuration(
                                    ride?.duration
                                )}
                            </p>
                        </div>

                        <div className="
                            bg-gray-50
                            rounded-xl
                            p-5
                        ">
                            <p className="
                                text-sm
                                text-gray-500
                            ">
                                Vehicle
                            </p>

                            <p className="
                                text-2xl
                                font-bold
                                capitalize
                            ">
                                {ride?.vehicleType}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* actions */}
            <div
                className="
                    flex
                    justify-end
                    gap-4
                    mt-8
                "
            >

                <button
                    onClick={onClose}
                    className="
                        px-8
                        py-3
                        border
                        rounded-xl
                        font-semibold
                    "
                >
                    Ignore
                </button>

                <button
                    disabled={isConfirm}
                    onClick={onConfirm}
                    className="
                        px-8
                        py-3
                        bg-black
                        text-white
                        rounded-xl
                        font-semibold
                    "
                >
                        { isConfirm ? 'please wait...' : 'Confirm Ride'}
                </button>

            </div>

        </div>
    );
};

export default CaptainConfirmRideLg;