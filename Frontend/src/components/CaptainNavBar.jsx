import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/tirriLogo.png";
import profile from "../assets/profile.svg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";
import { useContext } from "react";
const Navbar = ({ Data, userType }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [openMobileMenu, setOpenMobileMenu] = useState(false);

    const [isLoading, setIsLoading] = useState(false)

    const { CaptainData, setCaptainData } = useContext(CaptainDataContext)
    const dropdownRef = useRef();

    const navigate = useNavigate()

    const user = {
        name: `${CaptainData?.fullname.firstname} ${CaptainData?.fullname.lastname}` || "User123",
        email: CaptainData?.email || "user@email.com",
    };

    useEffect(() => {
        const handleClick = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpenProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClick
            );
    }, []);

    const handleLogout = () => {
        navigate(`/${userType}/logout`);
    }

    const updateStatus = async (status) => {
        try {
            setIsLoading(true)
            const token =
                localStorage.getItem("token");

            const res =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/captains/update-status`,
                    {
                        params: {
                            status
                        },
                        headers: {
                            authorization:
                                `Bearer ${token}`
                        }
                    }
                );
            setCaptainData(res.data.captain)
            if (!res.data.success) {
                return toast.error(res.data.message)
            }
        } catch (err) {
            toast.error('something went wrong')
        } finally {
            setIsLoading(false)
        }

    }



    return (
        <>
            <nav className="w-full h-16 bg-white border-b border-gray-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50">
                {/* Mobile Hamburger */}
                <button
                    className="md:hidden"
                    onClick={() =>
                        setOpenMobileMenu(true)
                    }
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Logo */}
                <img
                    onClick={() => navigate('/captains/home')}
                    src={logo}
                    alt="logo"
                    className="w-20"
                />

                {/* Desktop Profile */}
                <div
                    className="hidden md:block relative"
                    ref={dropdownRef}
                >
                    <button
                        onClick={() =>
                            setOpenProfile(!openProfile)
                        }
                        className="rounded-full overflow-hidden border-2 border-gray-200 hover:border-black transition"
                    >
                        <img
                            src={profile}
                            alt=""
                            className="size-11"
                        />
                    </button>

                    {openProfile && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-y-scroll h-100">

                            <div className="p-4 border-b">

                                <div className="flex items-center gap-3">

                                    <img
                                        src={profile}
                                        alt=""
                                        className="size-12 rounded-full border"
                                    />

                                    <div>
                                        <h3 className="font-semibold">
                                            {user.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${CaptainData.status === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                `}
                                    >
                                        {CaptainData.status === "online"
                                            ? "🟢 Online"
                                            : "⚫ Offline"}
                                    </span>
                                </div>

                            </div>
                            <div className="p-4 border-b">

                                <div className="grid grid-cols-2 gap-3">

                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500">
                                            Earnings
                                        </p>

                                        <h3 className="font-bold text-lg">
                                            ₹{CaptainData.earnings.total}
                                        </h3>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500">
                                            Rating
                                        </p>

                                        <h3 className="font-bold text-lg">
                                            ⭐ {CaptainData.ratings.average}
                                        </h3>
                                    </div>

                                </div>

                            </div>
                            <div className="p-4 border-b">

                                <h4 className="font-semibold mb-3">
                                    Vehicle
                                </h4>

                                <div className="space-y-2 text-sm">

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Type
                                        </span>

                                        <span className="font-medium capitalize">
                                            {CaptainData.vehicle.vehicleType}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Number
                                        </span>

                                        <span className="font-medium">
                                            {CaptainData.vehicle.plate}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Color
                                        </span>

                                        <span className="font-medium capitalize">
                                            {CaptainData.vehicle.color}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Capacity
                                        </span>

                                        <span className="font-medium">
                                            {CaptainData.vehicle.capacity}
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <button
                                onClick={() => navigate("/captains/profile")}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 " >
                                Edit Profile
                            </button>

                            <button
                                disabled={isLoading}
                                onClick={() => updateStatus(CaptainData.status === 'online' ? 'offline' : 'online')}
                                className=" w-full text-left px-4 py-3 hover:bg-gray-50 ">
                                 {
              isLoading
                ? "Please wait..."
                : CaptainData.status === "online"
                  ? "Go Offline"
                  : "Go Online"
            }
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 " >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Empty div for mobile alignment */}
                <div className="md:hidden w-7"></div>

            </nav>

            {/* Overlay */}
            {openMobileMenu && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() =>
                        setOpenMobileMenu(false)
                    }
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={`fixed top-0 left-0 z-200 h-full w-[85vw] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${openMobileMenu
                    ? "translate-x-0"
                    : "-translate-x-full"
                    }`}
            >

                <div className="p-5 border-b flex justify-between items-center">

                    <div>
                        <h3 className="font-semibold text-lg">
                            {user.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setOpenMobileMenu(false)
                        }
                    >
                        ✕
                    </button>

                </div>


                <div className="flex flex-col h-[calc(100%-88px)]">

                    {/* Status */}
                    <div className="p-4 border-b">

                        <span
                            className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${CaptainData.status === "online"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                `}
                        >
                            {
                                CaptainData.status === "online"
                                    ? "🟢 Online"
                                    : "⚫ Offline"
                            }
                        </span>

                    </div>

                    {/* Earnings + Rating */}
                    <div className="p-4">

                        <div className="grid grid-cols-2 gap-3">

                            <div className="bg-green-50 rounded-2xl p-4">

                                <p className="text-xs text-gray-500">
                                    Earnings
                                </p>

                                <h3 className="text-xl font-bold">
                                    ₹{CaptainData?.earnings.total}
                                </h3>

                            </div>

                            <div className="bg-yellow-50 rounded-2xl p-4">

                                <p className="text-xs text-gray-500">
                                    Rating
                                </p>

                                <h3 className="text-xl font-bold">
                                    ⭐ {CaptainData.ratings.average}
                                </h3>

                            </div>

                        </div>

                    </div>

                    {/* Vehicle Card */}
                    <div className="px-4">

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <div className="flex justify-between mb-3">

                                <span className="font-semibold">
                                    🚗 Vehicle
                                </span>

                                <span className="capitalize">
                                    {CaptainData.vehicle.vehicleType}
                                </span>

                            </div>

                            <div className="space-y-2 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Number
                                    </span>

                                    <span className="font-medium">
                                        {CaptainData.vehicle.plate}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Color
                                    </span>

                                    <span className="capitalize">
                                        {CaptainData.vehicle.color}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Capacity
                                    </span>

                                    <span>
                                        {CaptainData.vehicle.capacity}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-auto p-4 space-y-2">

                        <button
                            onClick={() => navigate('/captains/profile')}
                            className="
                    w-full
                    py-3
                    rounded-xl
                    bg-black
                    text-white
                    font-medium
                "
                        >
                            Edit Profile
                        </button>

                        <button
                            onClick={() => updateStatus(CaptainData.status === 'online' ? 'offline' : 'online')}
                            disabled={isLoading}
                            className="
                    w-full
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                "
                        >
                            {
                                isLoading
                                    ? "Please wait..."
                                    : CaptainData.status === "online"
                                        ? "Go Offline"
                                        : "Go Online"
                            }
                        </button>

                        <button
                            onClick={handleLogout}
                            className="
                    w-full
                    py-3
                    rounded-xl
                    bg-red-50
                    text-red-600
                    font-medium
                "
                        >
                            Logout
                        </button>

                    </div>

                </div>


            </div>
        </>
    );
};

export default Navbar;