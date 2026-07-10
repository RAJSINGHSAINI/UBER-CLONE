import { useContext, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserDataContext } from "../../context/UserContext";

export default function CaptainFeedbackCard({ ride }) {
    const [rating, setRating] = useState(0);
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { setAcceptRideData, setUserRideData } = useContext(UserDataContext)

    function onIgnore() {
        setAcceptRideData({})
        setUserRideData({})
        navigate("/users/home")
    }
    async function onSubmitFeedback() {
        try {
            const token = localStorage.getItem("token");
            if (rating <= 0) {
                return toast.error('please select any star')
            }
            setIsSubmitting(true)
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/captains/feedback`,
                { rating, rideId: ride._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
            } else {
                toast.success(response.data.message);
                setAcceptRideData({})
                setUserRideData({})
                navigate("/users/home")
            }

        } catch (error) {

            toast.error(error?.response?.data?.message)
        } finally {
            setIsSubmitting(false)
        }
    }
    

    return (
        <div className="bg-white animate-slide-up z-1000 rounded-2xl border overflow-y-scroll shadow-sm p-5 max-w-full w-full">

            {/* Captain Info */}
            <div className="flex items-center gap-4 pb-5 border-b">

                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold uppercase">
                    {ride.captain.name.charAt(0)}
                </div>

                <div className="flex-1">

                    <h2 className="text-lg font-bold">
                        {ride.captain.name}
                    </h2>

                    <p className="text-gray-500 text-sm">
                        {ride.captain.vehicle} • {ride.captain.plate}
                    </p>

                    <div className="flex items-center gap-2 mt-2">

                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                            ⭐ {ride.captain.rating}
                        </span>

                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {ride.status}
                        </span>

                    </div>

                </div>

            </div>

            {/* Ride Details */}
            <div className="py-5 space-y-4">

                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        Pickup
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                        {ride.pickup}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        Destination
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                        {ride.destination}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">

                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">
                            Fare
                        </p>
                        <p className="font-bold text-lg">
                            ₹{ride.fare}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">
                            Distance
                        </p>
                        <p className="font-bold text-lg">
                            {ride.distance}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">
                            Duration
                        </p>
                        <p className="font-bold text-lg">
                            {ride.duration}
                        </p>
                    </div>

                </div>

            </div>

            {/* Contact */}
            <div className="border rounded-xl p-4 bg-gray-50">

                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Captain Email
                </p>

                <a
                    href={`mailto:${ride.captain.email}`}
                    className="text-sm font-medium text-blue-600 break-all hover:underline"
                >
                    {ride.captain.email}
                </a>

            </div>
            {/* Feedback */}
            <div className="pt-6 border-t mt-6">

                <h3 className="font-semibold text-lg">
                    Rate your Captain
                </h3>

                <p className="text-sm text-gray-500 mt-1 mb-5">
                    Your feedback helps improve ride quality.
                </p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            <Star
                                size={36}
                                className={`${star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 mt-5">

                    <button
                        onClick={onIgnore}
                        className="flex-1 border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-100 transition"
                    >
                        Ignore
                    </button>

                    <button
                        onClick={onSubmitFeedback}
                        disabled={rating === 0}
                        disabled={isSubmitting}
                        className="flex-1 bg-black text-white rounded-xl py-3 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-900 transition"
                    >
                        {isSubmitting ? 'please wait...' : 'Submit Feedback'}
                    </button>

                </div>

            </div>


        </div>
    );
}