import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'
import ride from '../assets/ride.svg'
import toast from 'react-hot-toast';
const UserRegister = () => {
    axios.withCredentials = true

    const { UserData, setUserData } = useContext(UserDataContext)


    const [firstname, setFirstName] = useState('')
    const [lastname, setLastName] = useState('')

    const navigate = useNavigate()

    const [email, setEmail] = useState('')

    const [password, setPassword] = useState('')

    const [address, setAddress] = useState('')

    const submitHandler = async (e) => {
        e.preventDefault()
        const newUser = {
            firstname,
            lastname,
            email,
            password,
            address
        }
        try {

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`,
                newUser
            )
            const { data } = response
            
            if (response.status === 200) {
                setUserData(response.data.user)
                localStorage.setItem("token", response.data.token)
                toast.success("user register successfully")
                setFirstName('')
                setLastName('')
                setEmail("")
                setPassword("")
                setTimeout(() => {
                    navigate('/users/home')
                }, 1000)
            } else if (!data.success) {
                toast.error(data.message)

            }

        } catch (error) {
        toast.error(error.response.data.message);
        }
    }
    return (
        <div className="min-h-dvh bg-[#f7f8f7] flex">
            {/* Left Section - Desktop Only */}
            < div className="hidden min-[700px]:flex w-1/2 flex-col justify-between p-12 bg-linear-to-br from-[#f6faf6] to-[#edf4ed]">

                <div>
                    <img src={logo} alt="logo" className="w-24" />

                    <div className="mt-20">
                        <h1 className="text-6xl font-bold text-gray-900">
                            Welcome back!
                        </h1>

                        <p className="mt-4 text-xl text-gray-500">
                            Sign in to continue your journey
                        </p>
                    </div>

                    <div className="mt-16 space-y-8">
                        <div className="flex gap-4">
                            <div className="size-12 rounded-full border flex items-center justify-center">
                                🛡️
                            </div>
                            <div>
                                <h3 className="font-semibold">Safe & Secure</h3>
                                <p className="text-gray-500">
                                    Your safety is our priority
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="size-12 rounded-full border flex items-center justify-center">
                                ⏱️
                            </div>
                            <div>
                                <h3 className="font-semibold">Quick & Reliable</h3>
                                <p className="text-gray-500">
                                    Get rides in minutes
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="size-12 rounded-full border flex items-center justify-center">
                                👤
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Trusted by millions
                                </h3>
                                <p className="text-gray-500">
                                    Join a community you can trust
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Login Section */}
            <div className="w-full min-[700px]:w-1/2 flex items-center justify-center p-6">

                <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">

                    {/* Mobile Heading */}
                    <div className="min-[700px]:hidden text-center mb-8">
                        <img src={logo} alt="logo" className="w-20 mx-auto" />

                        <h1 className="text-4xl font-bold mt-6">
                            Create Account
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Join and start your journey
                        </p>
                    </div>

                    {/* Desktop Heading */}
                    <div className="hidden min-[700px]:block text-center mb-8">
                        <h2 className="text-4xl font-bold">
                            Create Account
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Enter your details to get started
                        </p>
                    </div>

                    <form onSubmit={submitHandler}>

                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-3 mb-5">

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={firstname}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={lastname}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                                />
                            </div>

                        </div>

                        {/* Email */}
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">
                                Email
                            </label>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">
                                Password
                            </label>

                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create Password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">
                                Address
                            </label>

                            <input
                                type="address"
                                value={address}
                                required
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter Address"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                            />
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-sm mb-5">
                            Already have an account?{" "}
                            <Link
                                to="/users/login"
                                className="text-green-600 font-semibold"
                            >
                                Login Here
                            </Link>
                        </p>

                        {/* Register Button */}
                        <button
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            Create Account
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px flex-1 bg-gray-200"></div>
                            <span className="text-sm text-gray-400">
                                OR
                            </span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        {/* Captain */}
                        <Link
                            to="/captains/register"
                            className="w-full border-2 border-green-600 text-green-700 rounded-xl py-3 flex justify-center font-semibold hover:bg-green-50 transition"
                        >
                            Register as Captain
                        </Link>

                        {/* Terms */}
                        <p className="text-xs text-gray-500 text-center leading-relaxed mt-6">
                            By creating an account, you agree to receive
                            verification codes via SMS or WhatsApp.
                            Message and data rates may apply.
                        </p>

                    </form>

                </div>

            </div>

        </div >
    )
}

export default UserRegister