import React, { useContext } from 'react'
import space from '../assets/spaceBar.svg'
import cross from '../assets/cross.svg'
import carSvg from '../assets/carImg.jpg'
import bikeSvg from '../assets/motoImg.webp'
import autoSvg from '../assets/autoImg.jpeg'
import axios from 'axios'
import toast from 'react-hot-toast'
import { UserDataContext } from '../context/UserContext'
import { useState } from 'react'

const ConfirmRidePanelLg = ({
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
        setIsLoading(false)
    }


    return (

        //     <div
        //         className="
        //             bg-white
        //             rounded-3xl
        //             shadow-2xl
        //             w-full
        //             px-6
        //         "
        //     >

        //         {/* Close */}
        //         <img
        //             src={space}
        //             onClick={() => setActivePanel(null)}
        //             className="
        //                 w-10
        //                 mx-auto
        //                 cursor-pointer
        //             "
        //             alt=""
        //         />

        //         {/* Header */}
        //         <div className="mb-6">

        //             <h2
        //                 className="
        //                     text-2xl
        //                     font-bold
        //                     text-center
        //                 "
        //             >
        //                 Confirm Ride
        //             </h2>

        //         </div>
        //         <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        //             {/* Vehicle */}
        //             <div
        //                 className="border rounded-3xl p-6 flex flex-col items-center shadow-sm " >
        //                 <img
        //                     src={carSvg}
        //                     className="w-40 object-contain"
        //                     alt=""
        //                 />

        //                 <h3 className="text-2xl font-bold mt-4">
        //                     {ride.vehicle}
        //                 </h3>

        //                 <p className="text-gray-500">
        //                     Estimated Fare
        //                 </p>

        //                 <p className="text-4xl font-bold mt-2">
        //                     ₹{ride.fare}
        //                 </p>
        //             </div>

        //             {/* Route */}
        //             <div
        //                 className="
        //     border
        //     rounded-3xl
        //     p-6
        //     shadow-sm
        // "
        //             >
        //                 <div className="flex gap-5">

        //                     <div className="flex flex-col items-center">
        //                         <div className="w-4 h-4 bg-green-500 rounded-full" />
        //                         <div className="h-16 w-0.5 bg-gray-300" />
        //                         <div className="w-4 h-4 bg-red-500 rounded-full" />
        //                     </div>

        //                     <div className="flex-1">

        //                         <div className="mb-6">
        //                             <p className="text-sm text-gray-400">
        //                                 Pickup
        //                             </p>

        //                             <p className="font-semibold">
        //                                 {ride.pickup}
        //                             </p>
        //                         </div>

        //                         <div>
        //                             <p className="text-sm text-gray-400">
        //                                 Destination
        //                             </p>

        //                             <p className="font-semibold">
        //                                 {ride.destination}
        //                             </p>
        //                         </div>

        //                     </div>
        //                 </div>
        //             </div>

        //             {/* Details */}
        //             <div
        //                 className="
        //     grid
        //     grid-cols-4
        //     gap-4
        // "
        //             >

        //                 <div className="bg-gray-50 rounded-2xl p-5 text-center">
        //                     <p className="text-gray-500 text-sm">
        //                         Distance
        //                     </p>

        //                     <p className="text-xl font-bold mt-2">
        //                         {ride.distance}
        //                     </p>
        //                 </div>

        //                 <div className="bg-gray-50 rounded-2xl p-5 text-center">
        //                     <p className="text-gray-500 text-sm">
        //                         Duration
        //                     </p>

        //                     <p className="text-xl font-bold mt-2">
        //                         {ride.duration}
        //                     </p>
        //                 </div>

        //                 <div className="bg-gray-50 rounded-2xl p-5 text-center">
        //                     <p className="text-gray-500 text-sm">
        //                         Payment
        //                     </p>

        //                     <p className="text-xl font-bold mt-2">
        //                         Cash
        //                     </p>
        //                 </div>
        //             </div>
        //         </div>
        //         {/* Confirm */}
        //         <button
        //             className="
        //     w-full
        //     mt-8
        //     py-5
        //     rounded-2xl
        //     bg-black
        //     text-white
        //     font-bold
        //     text-lg
        //     hover:opacity-90
        // "
        //         >
        //             Confirm Ride
        //         </button>

        //     </div>

        //         <div className=" bg-white pt-5 rounded-3xl shadow-2xl w-full  lg:block hidden mx-auto px-8 ">

        //             <img
        //                 src={cross}
        //                 onClick={() => setActivePanel(null)}
        //                 className="
        //                         w-8
        //                         absolute
        //                         top-5
        //                         right-5
        //                         cursor-pointer
        //                     "
        //                 alt=""
        //             />

        //             <h2 className="text-3xl font-bold text-center mb-8">
        //                 Confirm Ride
        //             </h2>

        //             <div className="flex gap-3 justify-around items-stretch w-full">

        //                 {/* Vehicle */}
        //                 <div className="
        //     flex-1
        //     min-w-0
        //     border
        //     rounded-3xl
        //     p-2
        //     flex
        //     flex-col
        //     items-center
        // ">
        //                     <img
        //                         src={selectedVehicle?.image || carSvg}
        //                         className="w-40"
        //                         alt=""
        //                     />

        //                     <h3 className="text-2xl font-bold">
        //                         {ride.vehicle}
        //                     </h3>

        //                     <p className="text-gray-500">
        //                         Selected Vehicle
        //                     </p>

        //                     {/* <div className="
        //                 text-4xl
        //                 font-bold
        //                 mt-4
        //             ">
        //                         ₹{ride.fare}
        //                     </div> */}
        //                 </div>

        //                 {/* Route */}
        //                 <div className="
        //     flex-2
        //     min-w-0
        //     border
        //     rounded-3xl
        //     p-6
        // ">
        //                     <div className="flex gap-3 w-full">

        //                         <div className="
        //                     flex
        //                     flex-col
        //                     items-center
        //                 ">
        //                             <div className="
        //                         w-4
        //                         h-4
        //                         bg-green-500
        //                         rounded-full
        //                     " />

        //                             <div className="
        //                         flex-1
        //                         w-0.5
        //                         bg-gray-300
        //                         min-h-20
        //                     " />

        //                             <div className="
        //                         w-4
        //                         h-4
        //                         bg-red-500
        //                         rounded-full
        //                     " />
        //                         </div>

        //                         <div className="
        //                     flex
        //                     flex-col
        //                     justify-between
        //                 ">
        //                             <div>
        //                                 <p className="
        //                             text-sm
        //                             text-gray-400
        //                         ">
        //                                     PICKUP
        //                                 </p>

        //                                 <h4 className="font-semibold">
        //                                     {ride.pickup}
        //                                 </h4>
        //                             </div>

        //                             <div>
        //                                 <p className="
        //                             text-sm
        //                             text-gray-400
        //                         ">
        //                                     DESTINATION
        //                                 </p>

        //                                 <h4 className="font-semibold">
        //                                     {ride.destination}
        //                                 </h4>
        //                             </div>
        //                         </div>

        //                     </div>
        //                 </div>

        //                 {/* Ride Details */}
        //                 <div className="
        //     flex-1
        //     min-w-0
        //     bg-gray-50
        //     rounded-3xl
        //     p-6
        // ">

        //                     <div>
        //                         <p className="text-gray-500">
        //                             Distance
        //                         </p>

        //                         <p className="font-bold text-xl">
        //                             {ride.distance}
        //                         </p>
        //                     </div>

        //                     <div>
        //                         <p className="text-gray-500">
        //                             Duration
        //                         </p>

        //                         <p className="font-bold text-xl">
        //                             {ride.duration}
        //                         </p>
        //                     </div>

        //                     <div>
        //                         <p className="text-gray-500">
        //                             Payment
        //                         </p>

        //                         <p className="font-bold text-xl">
        //                             ₹ {ride.fare}
        //                         </p>
        //                     </div>

        //                 </div>

        //             </div>

        //             <button
        //                 onClick={onConfirm}
        //                 className="
        //             w-full
        //             mt-8
        //             bg-black
        //             text-white
        //             py-5
        //             rounded-2xl
        //             font-bold
        //             text-lg
        //         "
        //             >
        //                 Confirm Ride
        //             </button>

        //         </div>
        <div className="hidden lg:block w-full max-w-6xl mx-auto bg-white rounded-t-3xl shadow-xl p-8 relative">

            {/* Close */}
            <img
                src={cross}
                onClick={() => setActivePanel(null)}
                className="w-7 absolute top-6 right-6 cursor-pointer"
                alt=""
            />

            <h2 className="text-2xl font-bold mb-8">
                Confirm Ride
            </h2>

            <div className="grid grid-cols-3 gap-6">

                {/* LEFT SECTION */}
                <div className="col-span-2 space-y-6">

                    {/* Vehicle */}
                    <div className="border rounded-2xl p-5 flex items-center gap-6">

                        <img
                            src={selectedVehicle?.image || carSvg}
                            className="w-32"
                            alt=""
                        />

                        <div>

                            <h3 className="text-2xl font-bold">
                                {ride.vehicle}
                            </h3>

                            <p className="text-gray-500 mt-1">
                                {ride.distance} • {ride.duration}
                            </p>

                            <p className="text-sm text-gray-400 mt-3">
                                Selected vehicle
                            </p>

                        </div>

                    </div>

                    {/* Route */}
                    <div className="border rounded-2xl p-6">

                        <div className="flex gap-5">

                            {/* Timeline */}
                            <div className="flex flex-col items-center">

                                <div className="w-4 h-4 bg-green-500 rounded-full" />

                                <div className="h-20 w-0.5 bg-gray-300" />

                                <div className="w-4 h-4 bg-red-500 rounded-full" />

                            </div>

                            {/* Locations */}
                            <div className="flex-1">

                                <div className="pb-6 border-b">

                                    <p className="text-xs text-gray-400 mb-1">
                                        PICKUP
                                    </p>

                                    <h4 className="font-semibold text-lg">
                                        {ride.pickup}
                                    </h4>

                                </div>

                                <div className="pt-6">

                                    <p className="text-xs text-gray-400 mb-1">
                                        DESTINATION
                                    </p>

                                    <h4 className="font-semibold text-lg">
                                        {ride.destination}
                                    </h4>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT SECTION */}
                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">

                    <div>

                        <h3 className="font-bold text-xl mb-6">
                            Ride Summary
                        </h3>

                        <div className="space-y-5">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Distance
                                </span>

                                <span className="font-semibold">
                                    {ride.distance}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Duration
                                </span>

                                <span className="font-semibold">
                                    {ride.duration}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Vehicle
                                </span>

                                <span className="font-semibold">
                                    {ride.vehicle}
                                </span>
                            </div>

                            <hr />

                            <div className="flex justify-between">

                                <span className="font-semibold">
                                    Total Fare
                                </span>

                                <span className="text-2xl font-bold">
                                    ₹{ride.fare}
                                </span>

                            </div>

                        </div>

                    </div>

                    <button
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="
                    mt-8
                    w-full
                    bg-black
                    text-white
                    py-4
                    rounded-xl
                    font-semibold
                    hover:opacity-90
                    transition
                "
                    >
                        {
                            isLoading ? 'please wait' : 'Confirm Ride' 
                        }
                    </button>

                </div>

            </div>

        </div>
    )
}

export default ConfirmRidePanelLg