import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { Timer, ProgressBar } from './Timer';


function RideCard({
    ride,
    onAccept,
    onIgnore,
    isRemoving
}) {

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

    const time = Math.floor((new Date(ride.searchExpiresAt).getTime() - Date.now()) / 1000)

    const TotalTime = Math.floor((new Date(ride.searchExpiresAt).getTime() - new Date(ride.createdAt).getTime()) / 1000)



    return (
        <div
            className={`
                bg-white
                border
                rounded-3xl
                shadow-lg
                p-5
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

            {/* top */}

            <div
                className="
                    flex
                    justify-between
                    items-center
                    mb-4
                "
            >

                <div>

                    <h2 className="
                        font-bold
                        text-lg
                    ">
                        New Ride
                    </h2>

                    <p className="
                        text-sm
                        text-gray-500
                    ">
                    </p>

                </div>

                <div
                    className="
                        px-3
                        py-1
                        rounded-full
                        capitalize
                        text-sm
                    "
                >
                    <Timer time={time}></Timer>
                </div>

            </div>

            {/* route */}

            <div
                className="
                    flex
                    gap-4
                    mb-5
                "
            >

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
                            bg-green-500
                            rounded-full
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
                            bg-red-500
                            rounded-full
                        "
                    />

                </div>

                <div className="flex-1">

                    <div className="mb-4">

                        <h3 className="
                            font-semibold
                        ">
                            Pickup
                        </h3>

                        <p
                            className="
                                text-sm
                                text-gray-500
                                wrap-break-words
                            "
                        >
                            {
                                ride
                                    .pickup
                                    .address
                            }
                        </p>

                    </div>

                    <div>

                        <h3 className="
                            font-semibold
                        ">
                            Destination
                        </h3>

                        <p
                            className="
                                text-sm
                                text-gray-500
                                wrap-break-words
                            "
                        >
                            {
                                ride
                                    .destination
                                    .address
                            }
                        </p>

                    </div>

                </div>

            </div>

            {/* stats */}

            <div
                className="
                    bg-gray-50
                    rounded-2xl
                    p-4
                    flex
                    justify-around
                    mb-5
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <p
                        className="
                            text-gray-500
                            text-sm
                        "
                    >
                        Fare
                    </p>

                    <p className="font-bold">
                        ₹{ride.fare}
                    </p>

                </div>

                <div
                    className="
                        text-center
                    "
                >

                    <p
                        className="
                            text-gray-500
                            text-sm
                        "
                    >
                        Distance
                    </p>

                    <p className="font-bold">
                        {
                            (
                                ride
                                    .distance
                                / 1000
                            )
                                .toFixed(1)
                        } km
                    </p>

                </div>

                <div
                    className="
                        text-center
                    "
                >

                    <p
                        className="
                            text-gray-500
                            text-sm
                        "
                    >
                        Time
                    </p>

                    <p className="font-bold">
                        {
                            Math.ceil(
                                ride
                                    .duration
                                / 60
                            )
                        } min
                    </p>

                </div>

            </div>

            {/* Remaining time bar */}
            <ProgressBar TotalTime={TotalTime} time={time}></ProgressBar>

            {/* buttons */}

            <div
                className="
                    flex
                    gap-3
                "
            >

                <button
                    onClick={() =>
                        onIgnore?.(ride._id)
                    }
                    className="
                        flex-1
                        border
                        py-3
                        rounded-2xl
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
                        flex-1
                        bg-black
                        text-white
                        py-3
                        rounded-2xl
                        font-semibold
                    "
                >
                    Accept
                </button>

            </div>

        </div>
    );
}

export default RideCard