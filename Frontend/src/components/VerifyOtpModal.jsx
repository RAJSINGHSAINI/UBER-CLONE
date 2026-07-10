import { useContext, useRef, useState } from "react";
import toast from 'react-hot-toast';
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";
const VerifyOtpModal = ({ onClose, onVerify,userType }) => {

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const inputsRef = useRef([]);

    const { UserData, setUserData } = useContext(UserDataContext)
    const {CaptainData,setCaptainData} = useContext(CaptainDataContext)
    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const digit = value.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;

        setOtp(newOtp);

        if (digit && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .trim()
            .slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];

        pastedData.split("").forEach((digit, i) => {
            if (i < 6) {
                newOtp[i] = digit;
            }
        });

        setOtp(newOtp);

        const lastFilledIndex = Math.min(
            pastedData.length - 1,
            5
        );

        inputsRef.current[lastFilledIndex]?.focus();
    };

    const submitOtp = async () => {
        const code = otp.join("");

        if (code.length !== 6) return;
        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/${userType}/verify-email`,
                { otp: code },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (!response.data.success) {
                toast.error(response.data.message)
                return
            }
            if (response.data.success) {
                onVerify()
                if(userType === 'users'){
                    setUserData(response.data.user)
                } else if(userType==='captains'){
                    setCaptainData(response.data.captain)
                }
            }
        } catch (error) {
        toast.error(error.response.data.message);
        }

    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 sm:p-8">

                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                        Verify Account
                    </h2>

                    <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                <div
                    className="flex justify-center gap-2 sm:gap-3 mt-8"
                    onPaste={handlePaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputsRef.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                                handleChange(e.target.value, index)
                            }
                            onKeyDown={(e) =>
                                handleKeyDown(e, index)
                            }
                            className="
                        h-12 w-10
                        sm:h-14 sm:w-12
                        text-center
                        text-xl sm:text-2xl
                        font-semibold
                        rounded-lg sm:rounded-xl
                        border border-gray-300
                        focus:outline-none
                        focus:border-black
                        focus:ring-2
                        focus:ring-black/10
                    "
                        />
                    ))}
                </div>

                <button
                    onClick={submitOtp}
                    className="
                w-full
                mt-8
                bg-black
                text-white
                py-3
                rounded-xl
                font-semibold
                hover:opacity-90
                transition
            "
                >
                    Verify Account
                </button>

            <button
                onClick={onClose}
                className="
                w-full
                mt-2
                text-gray-500
                cursor-pointer
            "
            >
                Cancel
            </button>

        </div>
        </div >
    );
};

export default VerifyOtpModal;