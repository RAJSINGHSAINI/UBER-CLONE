import VehicleCard from "./cards/VehicleCard";
import space from '../assets/spaceBar.svg'
import cross from '../assets/cross.svg'
import carSvg from '../assets/carImg.jpg'
import bikeSvg from '../assets/motoImg.webp'
import autoSvg from '../assets/autoImg.jpeg'
import { useEffect } from "react";

const VehiclePanel = ({
    onClose,
    loading,
    rideData,
    pickup,
    destination,
    setSelectedVehicle,
    onSelect,
    activePanel,
    setActivePanel
}) => {
    const formatDuration = (minutes) => {
        if (!minutes) return "0 min";

        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            return mins === 0
                ? `${hours} hr`
                : `${hours} hr ${mins} min`;
        }

        return `${minutes} min`;
    };
    const vehicles = [
        {
            name: "Uber Go",
            seats: 4,
            time: `${formatDuration(rideData?.durationInMinutes)} `,
            price: rideData?.fares.car,
            image: carSvg,
            type: 'car'
        },
        {
            name: "Moto",
            seats: 1,
            time: `${formatDuration(rideData?.durationInMinutes)} `,
            price: rideData?.fares.motorcycle,
            image: bikeSvg,
            type: 'motorcycle'
        },
        {
            name: "Auto",
            seats: 3,
            time: `${formatDuration(rideData?.durationInMinutes)} `,
            price: rideData?.fares.auto,
            image: autoSvg,
            type: 'auto'
        }
    ];

    if (loading)
        return <div className="animate-pulse bg-white min-h-dvh px-5 py-6 space-y-5">

            {/* Header */}
            <div>
                <div className="h-7 w-40 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 w-60 bg-gray-100 rounded"></div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-100 rounded-2xl p-5">
                <div className="flex justify-between">
                    <div>
                        <div className="h-3 w-12 bg-gray-300 rounded mb-2"></div>
                        <div className="h-5 w-28 bg-gray-300 rounded"></div>
                    </div>

                    <div className="text-right">
                        <div className="h-3 w-10 bg-gray-300 rounded mb-2 ml-auto"></div>
                        <div className="h-5 w-20 bg-gray-300 rounded ml-auto"></div>
                    </div>
                </div>
            </div>

            {/* Captain Card */}
            <div className="bg-gray-100 rounded-2xl p-5 flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-300"></div>

                <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-gray-300 rounded"></div>
                    <div className="h-4 w-52 bg-gray-200 rounded"></div>

                    <div className="flex gap-2 pt-2">
                        <div className="h-8 w-20 bg-white rounded-full"></div>
                        <div className="h-8 w-24 bg-white rounded-full"></div>
                        <div className="h-8 w-16 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Ride Details */}
            <div className="border rounded-2xl p-5 space-y-4">
                <div className="h-5 w-full bg-gray-200 rounded"></div>
                <div className="h-5 w-5/6 bg-gray-200 rounded"></div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
            </div>

            {/* Contact Card */}
            <div className="border rounded-2xl p-5">
                <div className="h-5 w-44 bg-gray-300 rounded mb-4"></div>
                <div className="h-12 bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>

        </div>

    if (!rideData)
        return null;

    function onClickVehicle(vehicle) {
        setSelectedVehicle(vehicle);
        setActivePanel('confirm')
    }

    return (
        <div
            className="bg-white rounded-3xl shadow-2xl w-full h-dvh overflow-y-auto lg:h-auto lg:rounded-2xl lg:shadow-lg lg:w-screen lg:m-0 overflow-hidden">
            <img
                className='w-10 mx-auto lg:hidden '
                src={space}
                onClick={onClose}
            />

            {/* Header */}
            <div className="mb-6 lg:hidden">

                <h2 className="text-2xl font-bold">
                    Choose a ride
                </h2>

            </div>

            {/* Route */}
            <div className="bg-gray-50 relative rounded-2xl p-4 mb-6 lg:mb-4 lg:p-3">
                <img
                    className='w-5 absolute lg:block hidden right-10 top-5'
                    src={cross}
                    onClick={onClose}
                />

                <div className="flex items-center gap-5 lg:gap-3">

                    <div className="flex flex-col items-center shrink-0">

                        <div className="w-3 h-3 bg-green-500 rounded-full" />

                        <div className="h-8 w-0.5 bg-gray-300" />

                        <div className="w-3 h-3 bg-red-500 rounded-full" />

                    </div>

                    <div className="min-w-0 flex-1">

                        <p className="font-medium text-sm">
                            Current Location
                        </p>

                        <p className="text-gray-500 text-xs truncate">
                            {pickup?.address}
                        </p>

                    </div>

                    <div className="text-2xl text-gray-400 shrink-0">
                        →
                    </div>

                    <div className="min-w-0 flex-1">

                        <p className="font-medium text-sm">
                            {destination?.address?.split(' ')[0]}
                        </p>

                        <p className="text-gray-500 text-xs truncate">
                            {destination?.address}
                        </p>

                    </div>

                </div>

            </div>

            {/* Vehicles */}
            <div className="space-y-4 lg:justify-center lg:space-y-3 px-4 lg:flex lg:px-3 lg:gap-10">
                {
                    vehicles.map(
                        vehicle => (
                            <VehicleCard onClick={() => { onClickVehicle(vehicle) }}
                                key={vehicle.name}
                                {...vehicle}
                            />
                        )
                    )
                }

            </div>

            {/* Footer */}
            <div
                className="mt-6 lg:mt-4 bg-gray-50 rounded-2xl p-4 lg:p-3 flex justify-around text-center mx-4 lg:mx-3 lg:mb-4"
            >

                <div className="flex-1">

                    <p className="text-gray-500 text-xs">
                        Distance
                    </p>

                    <p className="font-bold text-sm">
                        {rideData?.distance >= 1000 ? rideData?.distanceInKm : rideData?.distance} {rideData?.distance >= 1000 ? "KM" : "M"}
                    </p>

                </div>

                <div className="w-px bg-gray-200" />

                <div className="flex-1">

                    <p className="text-gray-500 text-xs">
                        Duration
                    </p>

                    <p className="font-bold text-sm">
                        {rideData && rideData?.duration >= 60 ? formatDuration(rideData?.durationInMinutes) : rideData?.duration} {rideData && rideData?.duration <= 60 && 'sec'}
                    </p>

                </div>

            </div>

        </div>
    );
};

export default VehiclePanel;