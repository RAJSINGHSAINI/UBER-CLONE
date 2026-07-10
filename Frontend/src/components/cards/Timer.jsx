import React, { useEffect, useState } from "react";

export const Timer = ({ time }) => {


    const [seconds, setSeconds] = useState(time);

    useEffect(() => {
        if (seconds <= 0) return;

        const timer = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        <span
            className="
        bg-white
        w-full
        text-center
        px-4
        py-2
        rounded-xl
        shadow-sm
        font-bold
        text-lg
        "
        >
            {minutes}:
            {remainingSeconds.toString().padStart(2, "0")}
        </span>
    );
};

export const ProgressBar = ({ time,TotalTime }) => {

    const [seconds, setSeconds] = useState(time);
    useEffect(() => {
        if (seconds <= 0) return;

        const timer = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);
    return (
        <>
            {seconds > 0 ? (
                <div className="my-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all duration-1000"
                            style={{
                                width: `${(seconds / TotalTime) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h3 className="font-bold text-lg">
                        No drivers accepted
                    </h3>
                    <p className="text-gray-500 m-2">
                        Ride request automatically cancelled
                    </p>
                </div>
            )}
        </>
    );
};