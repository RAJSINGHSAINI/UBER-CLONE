import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import toast from "react-hot-toast";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";

const ChangeEmailModal = ({ onClose,userType }) => {

    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const {setUserData} = useContext(UserDataContext)
    const {setCaptainData} = useContext(CaptainDataContext)
    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        ""
    ]);

    const modalRef = useRef(null);
    const emailRef = useRef(null);
    const otpRef = useRef(null);
    const inputsRef = useRef([]);

    useEffect(() => {
        gsap.fromTo(
            modalRef.current,
            {
                opacity: 0,
                y: 30,
                scale: 0.95,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.4,
                ease: "power3.out",
            }
        );
    }, []);

    useEffect(() => {
        if (step === "otp" && otpRef.current) {
            gsap.fromTo(
                otpRef.current,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power3.out",
                }
            );
        }
    }, [step]);

    const sendOtp = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/${userType}/send-change-email-otp`,
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }
            if(!response.data.success){
                toast.success(response.data.message)
            }

            gsap.to(emailRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.25,
                onComplete: () => {
                    setStep("otp");
                },
            });

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyEmail = async () => {

        const code = otp.join("");

        if (code.length !== 6) {
            toast.error("Enter valid OTP");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/${userType}/verify-change-email-otp`,
                {
                    email,
                    otp: code,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }
            if(userType === 'users'){
                setUserData(response.data.user)
            } else if(userType === 'captains'){
                setCaptainData(response.data.captain)
            }
            
            gsap.to(modalRef.current, {
                scale: 1.05,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    toast.success(
                        "Email changed successfully"
                    );
                    onClose();
                },
            });

        } catch (error) {
       
            
            toast.error(
                error.response?.data?.message ||
                "Verification failed"
            );
        }
    };

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
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">

            <div
                ref={modalRef}
                className="
                    w-[90%]
                    max-w-md
                    rounded-3xl
                    bg-white
                    shadow-2xl
                    p-6
                "
            >

                <div className="text-center">

                    <h2 className="text-3xl font-bold">
                        Change Email
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Securely update your email
                    </p>

                </div>

                {step === "email" && (

                    <div
                        ref={emailRef}
                        className="mt-8"
                    >

                        <label className="block mb-2 font-medium">
                            New Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="example@gmail.com"
                            className="
                                w-full
                                border
                                border-gray-200
                                rounded-xl
                                px-4
                                py-3
                                outline-none
                                focus:border-black
                            "
                        />

                        <button
                            onClick={sendOtp}
                            disabled={loading}
                            className="
                                mt-5
                                w-full
                                bg-black
                                text-white
                                py-3
                                rounded-xl
                                font-semibold
                            "
                        >
                            {
                                loading
                                    ? "Sending..."
                                    : "Send OTP"
                            }
                        </button>

                    </div>
                )}

                {step === "otp" && (

                    <div
                        ref={otpRef}
                        className="mt-8"
                    >

                        <p className="text-center text-gray-500 mb-6">
                            OTP sent to
                            <br />
                            <span className="font-semibold">
                                {email}
                            </span>
                        </p>

                        <div
                            className="
                                flex
                                justify-center
                                gap-2
                            "
                            onPaste={handlePaste}
                        >

                            {otp.map((digit, index) => (

                                <input
                                    key={index}
                                    ref={(el) =>
                                        (
                                            inputsRef.current[index]
                                        ) = el
                                    }
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    inputMode="numeric"
                                    onChange={(e) =>
                                        handleChange(
                                            e.target.value,
                                            index
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(
                                            e,
                                            index
                                        )
                                    }
                                    className="h-12 w-10 border rounded-xl text-center text-xl font-semibold "
                                />

                            ))}

                        </div>

                        <button
                            onClick={verifyEmail}
                            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
                        >
                            Verify & Change Email
                        </button>

                    </div>
                )}

                <button
                    onClick={onClose} className="mt-4 w-full text-gray-500">
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default ChangeEmailModal;