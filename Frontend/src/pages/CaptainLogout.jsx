import axios from "axios";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

const CaptainLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/captains/logout`,
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                localStorage.removeItem("token");
                toast.success("Logged out successfully");
                navigate("/captains/login");
            } catch (error) {
                toast.error("Failed to logout");
            }
        };

        socket.disconnect()
        logoutUser();
    }, [navigate]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            {/* Spinner */}
            <div className="w-14 h-14 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

            {/* Text */}
            <p className="mt-4 text-lg font-medium text-gray-700">
                Logging you out...
            </p>
        </div>
    );
};

export default CaptainLogout;