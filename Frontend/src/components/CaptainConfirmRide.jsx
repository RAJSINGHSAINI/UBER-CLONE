import React, { useContext, useEffect, useState } from 'react'
import space from '../assets/spaceBar.svg'
import { useSocket } from '../hooks/useSocket'
import {
    registerCaptainEvents,
    unregisterCaptainEvents
} from "../socket/socketEvents";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext';
import toast from 'react-hot-toast';

const CaptainConfirmRide = ({
    onClose,
    currentRideDataWithUser,
    onOpen
}) => {

    const navigate = useNavigate()


    const { acceptRideData, setAcceptRideData } = useContext(CaptainDataContext)

    const [isConfirm, setIsConfirm] = useState(false)

    const [ride, setRide] = useState(
        currentRideDataWithUser?.ride || null
    );

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

        <div className="
    bg-white
    rounded-t-3xl
    h-[85vh]
    overflow-y-auto
">

            {/* drag handle */}
            <div className="sticky rounded-full top-0 backdrop-blur-sm w-full ">
                <img
                    className='w-10 mx-auto lg:hidden'
                    src={space}
                    onClick={onClose}
                />
            </div>

            <div className="p-5">

                {/* title */}
                <div className="mb-6">
                    <h1 className="
                text-2xl
                font-bold
            ">
                        {isNewRide ? 'New Ride' : 'Confirm Ride'}
                    </h1>

                    <p className="text-gray-500">
                        Verify passenger details
                    </p>
                </div>

                {/* user card */}
                <div className="
            bg-gray-50
            rounded-2xl
            p-4
            mb-5
        ">
                    <div className="flex gap-4">

                        <div className="
                    w-14
                    h-14
                    rounded-full
                    bg-black
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-bold
                ">
                            {user?.fullname.firstname[0]}
                        </div>

                        <div>
                            <h2 className="
                        font-bold
                        text-lg
                    ">
                                {user?.fullname.firstname} {user?.fullname.lastname}
                            </h2>

                            <p className="text-gray-500">
                                {user?.email}
                            </p>

                            <span className="
                        text-xs
                        bg-green-100
                        text-green-700
                        px-2
                        py-1
                        rounded-full
                    ">
                                Verified Passenger
                            </span>
                        </div>

                    </div>
                </div>

                {/* route */}
                <div className="
            border
            rounded-2xl
            p-4
            mb-5
        ">

                    <div className="flex gap-4">

                        <div className="
                    flex
                    flex-col
                    items-center
                ">
                            <div className="
                        w-3
                        h-3
                        rounded-full
                        bg-green-500
                    "/>

                            <div className="
                        h-[50%]
                        w-0.5
                        bg-gray-300
                    "/>

                            <div className="
                        w-3
                        h-3
                        rounded-full
                        bg-red-500
                    "/>
                        </div>

                        <div>

                            <div className="mb-5">
                                <p className="
                            text-xs
                            text-gray-500
                        ">
                                    Pickup
                                </p>

                                <p className="font-semibold">
                                    {ride?.pickup.address}
                                </p>
                            </div>

                            <div>
                                <p className="
                            text-xs
                            text-gray-500
                        ">
                                    Destination
                                </p>

                                <p className="font-semibold">
                                    {ride?.destination.address}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* stats */}
                <div className="
            grid
            grid-cols-3
            gap-3
            mb-6
        ">

                    <div className="
                bg-gray-50
                p-4
                rounded-xl
                text-center
            ">
                        <p className="
                    text-gray-500
                    text-sm
                ">
                            Fare
                        </p>

                        <p className="font-bold">
                            ₹{ride?.fare}
                        </p>
                    </div>

                    <div className="
                bg-gray-50
                p-4
                rounded-xl
                text-center
            ">
                        <p className="
                    text-gray-500
                    text-sm
                ">
                            Distance
                        </p>

                        <p className="font-bold">
                            {formatDistance(ride?.distance)}
                        </p>
                    </div>

                    <div className="
                bg-gray-50
                p-4
                rounded-xl
                text-center
            ">
                        <p className="
                    text-gray-500
                    text-sm
                ">
                            Time
                        </p>

                        <p className="font-bold">
                            {formatDuration(ride?.duration)}
                        </p>
                    </div>

                </div>

                {/* buttons */}
                <div className="
            flex
            gap-3
        ">

                    <button
                        onClick={onClose}
                        className="
                flex-1
                border
                rounded-2xl
                py-4
                font-semibold
            ">
                        Ignore
                    </button>

                    <button
                    disabled={isConfirm}
                        onClick={onConfirm}
                        className="
                flex-1
                bg-black
                text-white
                rounded-2xl
                py-4
                font-semibold
            ">
                        { isConfirm ? 'please wait...' : 'Confirm Ride'}
                    </button>

                </div>

            </div>

        </div>
    )
}

export default CaptainConfirmRide