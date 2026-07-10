import { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ onClose,userType }) => {

    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
  
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

    // Modal entrance animation
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

    // Step change animation
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
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/${userType}/send-reset-password-otp`,
                { email }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            gsap.to(emailRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.25,
                onComplete: () => {
                    setStep("otp");
                },
            });

            toast.success("OTP sent to your email");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {

        const code = otp.join("");

        if (code.length !== 6) {
            toast.error("Enter valid OTP");
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error(
                "Password must be at least 6 characters"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/${userType}/verify-reset-password-otp`,
                {
                    email,
                    otp: code,
                    newPassword
                }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            gsap.to(modalRef.current, {
                scale: 1.05,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    toast.success(
                        "Password reset successfully"
                    );
                    onClose();
                }
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Password reset failed"
            );

        } finally {
            setLoading(false);
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
                        Reset Password
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Securely reset your password
                    </p>
                </div>

                {/* Email Step */}
                {step === "email" && (
                    <div ref={emailRef} className="mt-8">
                        <label className="block mb-2 font-medium">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                hover:opacity-90
                                disabled:opacity-50
                                transition
                            "
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </div>
                )}

                {/* OTP Step */}
                {step === "otp" && (
                    <div ref={otpRef} className="mt-8">

                        <p className="text-center text-gray-500 mb-6">
                            OTP sent to
                            <br />
                            <span className="font-semibold text-black">
                                {email}
                            </span>
                        </p>

                        <div
                            className="
                flex
                justify-center
                gap-2
                mb-6
            "
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (inputsRef.current[index] = el)
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
                                        handleKeyDown(e, index)
                                    }
                                    className="
                        h-12
                        w-10
                        border
                        border-gray-300
                        rounded-xl
                        text-center
                        text-xl
                        font-semibold
                        focus:border-black
                        outline-none
                    "
                                />
                            ))}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">
                                New Password
                            </label>

                            <div className="relative">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
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
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="
                        absolute
                        right-3
                        top-3
                        text-gray-500
                    "
                                >
                                    {showPassword
                                        ? "👁️"
                                        : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block mb-2 font-medium">
                                Confirm Password
                            </label>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm password"
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
                        </div>

                        <button
                            onClick={verifyOtp}
                            disabled={loading}
                            className="
                w-full
                bg-green-600
                text-white
                py-3
                rounded-xl
                font-semibold
                hover:opacity-90
                disabled:opacity-50
                transition
            "
                        >
                            {loading
                                ? "Resetting..."
                                : "Verify OTP & Reset Password"}
                        </button>

                    </div>
                )}
                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full text-gray-500 hover:text-gray-700 transition"
                >
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default ForgotPasswordModal;
