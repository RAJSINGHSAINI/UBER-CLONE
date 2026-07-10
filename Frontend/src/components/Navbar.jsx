import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/tirriLogo.png";
import profile from "../assets/profile.svg";
import { useNavigate } from "react-router-dom";
const Navbar = ({Data,userType}) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const  UserData = Data
    const dropdownRef = useRef();
    
    const navigate = useNavigate()

    const user = {
        name: `${UserData?.fullname.firstname} ${UserData?.fullname.lastname}` || "User123",
        email: UserData?.email || "user@email.com",
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
                    src={logo}
                    alt="logo" onClick={()=>navigate('/users/home')}
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
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                            <div className="p-4 border-b">
                                <h3 className="font-semibold">
                                    {user.name}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>

                            <button onClick={() => navigate('/users/profile')} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition">
                                Edit Profile
                            </button>

                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition">
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
                className={`fixed top-0 left-0 h-full w-72 bg-white z-1000 shadow-2xl transition-transform duration-300 ${openMobileMenu
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

                <div className="p-4">

                    <button onClick={() => navigate('/users/profile')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100">
                        Edit Profile
                    </button>

                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50">
                        Logout
                    </button>

                </div>
            </div>
        </>
    );
};

export default Navbar;