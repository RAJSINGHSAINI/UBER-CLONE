import React, { useContext, useState } from "react";
import Navbar from "../components/CaptainNavBar";
import { CaptainDataContext } from "../context/CaptainContext";
import toast from "react-hot-toast";
import VerifyOtpModal from "../components/VerifyOtpModal";
import axios from 'axios'
import ChangeEmailModal from "../components/ChangeEmailModal";
const CaptainProfilePage = () => {

    const { CaptainData, setCaptainData } = useContext(CaptainDataContext)
    const [openChangeEmail, setOpenChangeEmail] = useState(false);
    const [openVerify, setOpenVerify] = useState(false)
    const [firstname, setFirstname] = useState(CaptainData?.fullname.firstname)
    const [lastname, setLastname] = useState(CaptainData?.fullname.lastname)
    const [address, setAddress] = useState(CaptainData?.address)
    const isVerified = CaptainData?.verified;

    // vehicle data

    const [vehicleType, setVehicleType] = useState(CaptainData?.vehicle.vehicleType)
    const [color, setColor] = useState(CaptainData?.vehicle.color)
    const [capacity, setCapacity] = useState(CaptainData?.vehicle.capacity)
    const [plate, setPlate] = useState(CaptainData?.vehicle.plate)


    const handleChange = (e) => {
        setCaptainData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (firstname === CaptainData?.fullname.firstname && lastname === CaptainData.fullname.lastname && address === CaptainData?.address && CaptainData?.vehicle.vehicleType === vehicleType && CaptainData?.vehicle.color === color && CaptainData?.vehicle.capacity === capacity && CaptainData?.vehicle.plate === plate) {
            return toast.error("Cannot update same data")
        }

        const token = localStorage.getItem('token')
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/update-profile`, {
            firstname, lastname, address, vehicleType, color, plate, capacity
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        if (!response.data.success) {
            return toast.error(response.data.message)
        }
        setCaptainData(response.data.captain)
        return toast.success(response.data.message)
    };


    const VerifyBtnHandler = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/captains/verify-email`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data.success) {
                toast(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data.message || error.message);
        }
    };

    const onVerifySuccess = () => {
        setOpenVerify(false)
        toast.success('account verified')
    }
    return (
        <>
            <Navbar userType={'captains'} Data={CaptainData} />
            {openVerify && <VerifyOtpModal userType={'captains'} onVerify={onVerifySuccess} onClose={() => setOpenVerify(false)} />}
            <div className="min-h-[calc(100vh-64px)] bg-[#f7f8f7] px-4 py-8">
                {openChangeEmail && (
                    <ChangeEmailModal
                        userType={'captains'}
                        onClose={() => setOpenChangeEmail(false)}
                    />
                )
                }
                <div className="max-w-3xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-4xl font-bold">
                            Profile Settings
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage your personal information
                        </p>

                    </div>

                    {/* Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl h-full shadow-lg p-8">

                            <form onSubmit={handleSubmit}>

                                {/* Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <label className="block mb-2 font-medium">
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            required
                                            name="firstname"
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black "
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium">
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="lastname"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black "
                                        />
                                    </div>

                                </div>



                                {/* Address */}
                                <div className="mt-6">

                                    <label className="block mb-2 font-medium">
                                        Address
                                    </label>

                                    <textarea
                                        required
                                        rows={4}
                                        name="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-black "
                                    />

                                </div>

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    className="mt-8 w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition "
                                >
                                    Save Changes
                                </button>

                            </form>

                        </div>
                        <div className="bg-white rounded-3xl shadow-lg p-8">

                            <h2 className="text-2xl font-semibold mb-6">
                                Captain Overview
                            </h2>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="bg-green-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500">
                                        Earnings
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        ₹{CaptainData.earnings.total}
                                    </h3>
                                </div>

                                <div className="bg-yellow-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500">
                                        Rating
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        ⭐ {CaptainData.ratings.average}
                                    </h3>
                                </div>

                            </div>

                            <div className="mt-4">

                                <div
                                    className={`
                rounded-xl
                px-4
                py-3
                font-medium
                ${CaptainData.status === "online"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                        }
            `}
                                >
                                    {
                                        CaptainData.status === "online"
                                            ? "🟢 Currently Online"
                                            : "⚫ Currently Offline"
                                    }
                                </div>

                            </div>

                        </div>
                        <div className="bg-white rounded-3xl shadow-lg p-8 mt-4">

                            <h2 className="text-2xl font-semibold mb-6">
                                Vehicle Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Vehicle Type
                                    </label>

                                    <select
                                        required
                                        value={vehicleType}
                                        onChange={(e) => setVehicleType(e.target.value)}
                                        className="w-full mt-1 border rounded-xl px-4 py-3 bg-gray-50"
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        <option value="car">Car</option>
                                        <option value="motorcycle">Motorcycle</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">
                                        Number Plate
                                    </label>

                                    <input

                                        value={plate}
                                        onChange={(e) => setPlate(e.target.value)}
                                        className="w-full mt-1 border rounded-xl px-4 py-3 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">
                                        Vehicle Color
                                    </label>

                                    <input
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-full mt-1 border rounded-xl px-4 py-3 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">
                                        Capacity
                                    </label>

                                    <input
                                        value={capacity}
                                        type="number"
                                        onChange={(e) => setCapacity(e.target.value)}
                                        className="w-full mt-1 border rounded-xl px-4 py-3 bg-gray-50"
                                    />
                                </div>

                            </div>
                            <button
                                onClick={handleSubmit}
                                className="mt-8 w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition "
                            >
                                Save Changes
                            </button>

                        </div>
                        <div className="bg-white rounded-3xl h-full shadow-lg p-8">

                            <h2 className="text-2xl font-semibold mb-6">
                                Account Status
                            </h2>

                            {/* Email */}
                            <div>
                                <label className="block mb-2 font-medium">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={CaptainData.email}
                                    readOnly
                                    className="
                                             w-full
                                             border
                                             border-gray-200
                                             rounded-xl
                                             px-4
                                             py-3
                                             bg-gray-50
                                             text-gray-700
                                             cursor-not-allowed
                                         "
                                />
                            </div>

                            {/* Verification Status */}
                            <div className="mt-5">

                                {isVerified ? (
                                    <div
                                        className="
                                          bg-green-100
                                          text-green-700
                                          px-4
                                          py-3
                                          rounded-xl
                                          font-medium
                                          flex items-center gap-2
                                      "
                                    >
                                        <span>✓</span>
                                        <span>Email Verified</span>
                                    </div>
                                ) : (
                                    <div
                                        className="
                                             bg-red-100
                                             text-red-700
                                             px-4
                                             py-3
                                             rounded-xl
                                             font-medium
                                             flex items-center gap-2
                                         "
                                    >
                                        <span>⚠</span>
                                        <span>Email Not Verified</span>
                                    </div>
                                )}

                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-end flex-col gap-3">

                                {!isVerified && (
                                    <button
                                        type="button"
                                        onClick={() => { setOpenVerify(true); VerifyBtnHandler() }}
                                        className="
                                                w-full
                                                bg-green-600
                                                text-white
                                                py-3
                                                rounded-xl
                                                font-semibold
                                                hover:bg-green-700
                                                transition
                                            "
                                    >
                                        Verify Email
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setOpenChangeEmail(true)}
                                    className="
                                                w-full
                                                border
                                                border-gray-300
                                                py-3
                                                rounded-xl
                                                font-semibold
                                                hover:bg-gray-100
                                                transition

                                            "
                                >
                                    Change Email
                                </button>

                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default CaptainProfilePage;