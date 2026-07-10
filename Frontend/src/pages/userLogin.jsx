import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useContext, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast';
import { UserDataContext } from '../context/UserContext'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

const UserLogin = () => {
    axios.withCredentials = true;
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showForgotModal, setShowForgotModal] = useState(false)

    const { UserData, setUserData, setIsLoggedIn } = useContext(UserDataContext)

    const submitHandler = async (e) => {
        e.preventDefault()
        const user = {
            email: email,
            password: password
        }

        try {

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, user);

            if (response.data.success) {
                setUserData({})
                setUserData(response.data.user)
                localStorage.setItem("token", response.data.token)
                setIsLoggedIn(true)
                toast.success("Login successfully")
                setEmail("")
                setPassword("")
                setTimeout(() => {
                    navigate('/users/home')
                }, 1000)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error("something went wrong")
            
        }
    }

    return (
        <div className="min-h-dvh bg-[#f7f8f7] flex">
            {/* Left Section - Desktop Only */}
            <div className="hidden min-[700px]:flex w-1/2 flex-col justify-between p-12 bg-linear-to-br from-[#f6faf6] to-[#edf4ed]">

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

                    {/* Mobile Logo */}
                    <div className="min-[700px]:hidden mb-8 text-center">
                        <img
                            src={logo}
                            alt="logo"
                            className="w-20 mx-auto"
                        />

                        <h1 className="text-4xl font-bold mt-6">
                            Welcome Back!
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Sign in to continue
                        </p>
                    </div>

                    {/* Desktop Heading */}
                    <div className="hidden min-[700px]:block text-center mb-10">
                        <h2 className="text-4xl font-bold">
                            Login to your account
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Enter your details to continue
                        </p>
                    </div>

                    <form onSubmit={submitHandler}>

                        <div className="mb-5">
                            <label className="font-medium block mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="font-medium block mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="mt-2 text-sm text-green-600 font-medium hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <p className="text-center mt-6">
                            New here?{" "}
                            <Link
                                to="/users/register"
                                className="text-green-600 font-semibold"
                            >
                                Create New Account
                            </Link>
                        </p>

                        <button
                            className="mt-6 w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            Login
                        </button>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px flex-1 bg-gray-200"></div>
                            <span className="text-gray-400 text-sm">OR</span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        <Link
                            to="/captains/login"
                            className="w-full border-2 border-green-600 text-green-700 rounded-xl py-3 flex justify-center font-semibold hover:bg-green-50 transition"
                        >
                            Sign In as Captain
                        </Link>

                    </form>
                </div>

            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <ForgotPasswordModal userType={'users'} onClose={() => setShowForgotModal(false)} />
            )}

        </div>
    )
}

export default UserLogin