import React, { useContext } from 'react'
import space from '../assets/spaceBar.svg'
import carSvg from '../assets/carImg.jpg'
import bikeSvg from '../assets/motoImg.webp'
import autoSvg from '../assets/autoImg.jpeg'
import axios from 'axios'
import toast from 'react-hot-toast'
import { UserDataContext } from '../context/UserContext'
import { useState } from 'react'
const ConfirmRidePanel = ({
    rideData,
    pickup,
    destination,
    setActivePanel,
    selectedVehicle,
    setBottomSheetsOpenForDriver
}) => {

    const ride = {
        vehicle: `${selectedVehicle?.name}`,
        fare: selectedVehicle?.price,
        distance: `${rideData?.distance >= 1000 ? rideData?.distanceInKm : rideData?.distance} ${rideData?.distance >= 1000 ? "KM" : "M"}`,
        duration: `${rideData && rideData?.durationInMinutes >= 60 ? rideData?.duration : rideData?.durationInMinutes} ${rideData && rideData?.durationInMinutes >= 60 ? 'sec' : 'min'}`,
        pickup: pickup?.address,
        destination: destination?.address,
        payment: "Cash"
    }
    // const ride = {
    //     vehicle: "Uber Go",
    //     fare: 164,
    //     distance: "12.4 km",
    //     duration: "28 min",
    //     pickup: "Haldwani Bus Stand",
    //     destination: "Railway Station",
    //     payment: "Cash"
    // }

    const { setUserRideData } = useContext(UserDataContext)

    const [isLoading, setIsLoading] = useState(false)

    async function onConfirm() {
        try {
            
            const token = localStorage.getItem("token");
            setIsLoading(true)
        const res = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/rides/create-ride`,
            { pickup, destination, duration: rideData.duration, distance: rideData.distance, vehicleType: selectedVehicle.type, fare: selectedVehicle.price },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!res.data.success) {
            return toast.error(res.data.message)
        }

        if (res.data.success) {
            toast.success('ride created successfully')
            setActivePanel('waiting')
            setUserRideData(res.data.ride)
            setBottomSheetsOpenForDriver(true)
        }
    } catch (error) {
            console.log(error);
            
    } finally{
        setIsLoading(false)
    }
    }

    return (
        <div
            className="
                bg-white
                rounded-3xl
                shadow-2xl
                w-full
                h-dvh
                lg:h-auto
                lg:w-125
                overflow-auto
                px-6
            "
        >

            {/* Close */}
            <div className='sticky top-0  bg-white/80 backdrop-blur-sm'>
                <img
                    className='w-10  mx-auto lg:hidden '
                    src={space}
                    onClick={() => setActivePanel(null)}
                />
            </div>

            {/* Header */}
            <div className="mb-6">

                <h2
                    className="
                        text-2xl
                        font-bold
                        text-center
                    "
                >
                    Confirm Ride
                </h2>

            </div>

            {/* Vehicle */}
            <div
                className="
                    flex
                    flex-col
                    items-center
                    border
                    rounded-2xl
                    p-5
                    mb-6
                "
            >

                <img
                    src={selectedVehicle?.image}
                    className="w-32"
                    alt=""
                />

                <h3
                    className="
                        text-xl
                        font-semibold
                        mt-2
                    "
                >
                    {ride?.vehicle}
                </h3>

                <p
                    className="
                        text-3xl
                        font-bold
                        mt-1
                    "
                >
                    ₹{ride?.fare}
                </p>

            </div>

            {/* Route */}
            <div
                className="
                    border
                    rounded-2xl
                    p-5
                    mb-6
                "
            >

                <div className="flex gap-4">

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                        "
                    >
                        <div
                            className="
                                w-3
                                h-3
                                rounded-full
                                bg-green-500
                            "
                        />

                        <div
                            className="
                                h-14
                                w-0.5
                                bg-gray-300
                            "
                        />

                        <div
                            className="
                                w-3
                                h-3
                                rounded-full
                                bg-red-500
                            "
                        />
                    </div>

                    <div>

                        <div className="mb-5">

                            <h4 className="font-semibold">
                                Pickup
                            </h4>

                            <p className="text-gray-500">
                                {ride?.pickup}
                            </p>

                        </div>

                        <div>

                            <h4 className="font-semibold">
                                Destination
                            </h4>

                            <p className="text-gray-500">
                                {ride?.destination}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* Details */}
            <div
                className="
                    bg-gray-50
                    rounded-2xl
                    p-5
                    mb-6
                "
            >

                <div
                    className="
                        flex
                        justify-between
                        mb-3
                    "
                >
                    <span>
                        Distance
                    </span>

                    <span className="font-semibold">
                        {ride?.distance}
                    </span>
                </div>

                <div
                    className="
                        flex
                        justify-between
                        mb-3
                    "
                >
                    <span>
                        Duration
                    </span>

                    <span className="font-semibold">
                        {ride?.duration}
                    </span>
                </div>

                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span>
                        Payment
                    </span>

                    <span className="font-semibold">
                        💵 {ride?.payment}
                    </span>
                </div>

            </div>

            {/* Confirm */}
            <button
                disabled={isLoading}
                onClick={onConfirm}
                className="
                    w-full
                    bg-black
                    text-white
                    py-4
                    rounded-2xl
                    font-semibold
                    hover:opacity-90
                    transition
                "
            >{!isLoading ? 'Confirm Ride' : 'please wait'}
            </button>

        </div>
    )
}

export default ConfirmRidePanel