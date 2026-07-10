import React from "react";
import { Timer, ProgressBar } from "./Timer";

function RideCardLg({
    ride,
    onAccept,
    onIgnore,
    isRemoving
}) {

    const formatDistance = (distance) => {
        if (!distance) return "0m";

        return distance >= 1000
            ? `${(distance / 1000).toFixed(1)}km`
            : `${distance}m`;
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "0m";

        const mins = Math.floor(seconds / 60);

        if (mins >= 60) {
            const hr = Math.floor(mins / 60);
            const rem = mins % 60;

            return rem
                ? `${hr}h ${rem}m`
                : `${hr}h`;
        }

        return `${mins}m`;
    };

    const time = Math.floor((new Date(ride.searchExpiresAt).getTime() - Date.now()) / 1000)

    const TotalTime = Math.floor((new Date(ride.searchExpiresAt).getTime() - new Date(ride.createdAt).getTime()) / 1000)

    return (
        <div

            className={`                
                bg-white
                rounded-2xl
                shadow-sm
                border
                p-4
                hover:shadow-lg
                transition-all
                duration-300
                ease-out
                transform
                ${isRemoving
                    ? `
                            opacity-0
                            -translate-x-20
                            scale-95
                            overflow-hidden
                            my-0
                            p-0
                          `
                    : `
                            opacity-100
                            translate-x-0
                            scale-100
                          `
                }
            `}
        >

            {/* header */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div className="flex gap-3">

                    <div
                        className="
                            px-3
                            py-1
                            bg-black
                            text-white
                            rounded-full
                            text-xs
                            flex justify-center items-center
                            font-semibold
                        "
                    >
                        {ride.vehicleType}
                    </div>

                    <div
                        className="
                            font-bold
                            text-lg
                        "
                    >
                        ₹{ride.fare}
                    </div>

                    <div className="text-gray-500">
                        {formatDistance(
                            ride.distance
                        )}
                    </div>

                    <div className="text-gray-500">
                        {formatDuration(
                            ride.duration
                        )}
                    </div>

                </div>

                <Timer time={time} />

            </div>

            {/* route */}
            <div className="mt-3">

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                    "
                >
                    <div
                        className="
                            w-2
                            h-2
                            bg-green-500
                            rounded-full
                        "
                    />

                    <span className="font-semibold">
                        Pickup:
                    </span>

                    <span
                        className="
                            text-gray-600
                            truncate
                        "
                    >
                        {ride.pickup.address}
                    </span>
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        mt-2
                    "
                >
                    <div
                        className="
                            w-2
                            h-2
                            bg-red-500
                            rounded-full
                        "
                    />

                    <span className="font-semibold">
                        Drop:
                    </span>

                    <span
                        className="
                            text-gray-600
                            truncate
                        "
                    >
                        {ride.destination.address}
                    </span>
                </div>

            </div>

            {/* timer */}
            <div className="mt-4">
                <ProgressBar TotalTime={TotalTime} time={time} />
            </div>

            {/* buttons */}
            <div
                className="
                    flex
                    justify-end
                    gap-3
                    mt-4
                "
            >

                <button
                    onClick={() =>
                        onIgnore?.(ride)
                    }
                    className="
                        px-5
                        py-2
                        border
                        rounded-xl
                        font-semibold
                    "
                >
                    Ignore
                </button>

                <button
                    onClick={() =>
                        onAccept?.(ride)
                    }
                    className="
                        px-5
                        py-2
                        bg-black
                        text-white
                        rounded-xl
                        font-semibold
                    "
                >
                    Accept
                </button>

            </div>

        </div>
    );
}

export default RideCardLg;