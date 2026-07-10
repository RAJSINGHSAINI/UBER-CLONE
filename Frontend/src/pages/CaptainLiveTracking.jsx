import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { CaptainDataContext } from '../context/CaptainContext';
import Navbar from '../components/CaptainNavBar';
import BottomSheet from '../components/BottomSheet';
import CaptainLiveMap from '../components/CaptainLiveMap';
import space from '../assets/spaceBar.svg';
import pin from '../assets/pin.svg';
import { registerCaptainEvents, unregisterCaptainEvents } from '../socket/socketEvents';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/cards/Timer';

const CaptainLiveTracking = () => {
    const { acceptRideData, CaptainData, setCaptainData, setAcceptRideData } = useContext(CaptainDataContext);
    const socket = useSocket();
    const navigate = useNavigate()

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [locationState, setLocationState] = useState('');
    const [captainLiveLocation, setCaptainLiveLocation] = useState(null);
    const [route, setRoute] = useState([]);
    const [isCancel, setIsCancel] = useState(false)

    const [contactCooldown, setContactCooldown] = useState(0);
    const [isRequesting, setIsRequesting] = useState(false);

    const [contactNumber, setContactNumber] = useState('')

    const user = useMemo(() => acceptRideData?.user, [acceptRideData]);

    const ride = useMemo(() => acceptRideData?.ride, [acceptRideData]);

    // listen for cancel ride
    useEffect(() => {

        const handlers = {

            onCancelRide: (data) => {
                toast.error('Ride cancelled by user')
                setCaptainData(data.captain)
                setAcceptRideData(null)
                setTimeout(() => {
                    navigate('/captains/home')
                }, 500);

            }
        };
        registerCaptainEvents(
            socket,
            handlers
        );

        return () => {
            unregisterCaptainEvents(
                socket,
                handlers
            );
        };

    }, []);
    // listen for get contact number
    useEffect(() => {

        const handlers = {

            onGetContact: (data) => {
                toast.success('contact number shared')
                setContactNumber(data.contactNumber)
            }
        };
        registerCaptainEvents(
            socket,
            handlers
        );

        return () => {
            unregisterCaptainEvents(
                socket,
                handlers
            );
        };

    }, []);

    useEffect(() => {
        if (!ride?._id) return;

        const token =
            localStorage.getItem("token");

        axios.get(
            `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
            {
                params: {
                    pickupLat:
                        acceptRideData.ride?.pickup.lat,
                    pickupLng:
                        acceptRideData.ride?.pickup.lng,
                    destinationLat:
                        acceptRideData.ride?.destination.lat,
                    destinationLng:
                        acceptRideData.ride?.destination.lng,
                },
                headers: {
                    authorization:
                        `Bearer ${token}`
                }
            }
        ).then(res => {

            setRoute(
                res.data.route.map(
                    ([lng, lat]) => [lat, lng]
                )
            );
        }).catch(err => {
            console.log(err);

        });
    }, [acceptRideData?.ride?._id]);
    const otpRef = useRef(null);
    const inputsRef = useRef([]);
    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        ""
    ]);
    const [isOtpSend, setIsOtpSend] = useState(false)
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

    const formatDuration = (seconds) => {
        if (!seconds) return '0 min';
        const totalMinutes = Math.floor(seconds / 60);
        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
        }
        return `${totalMinutes} min`;
    };

    const formatDistance = (distance) => {
        if (!distance) return '0 m';
        if (distance >= 1000) return `${(distance / 1000).toFixed(1)} km`;
        return `${distance} m`;
    };

    const getCurrentLocation = () => {


        if (!navigator.geolocation) {
            setLocationState({
                status: "unsupported",
                message: "Your browser doesn't support location services."
            });

            return;
        }

        setLocationState({
            status: "loading",
            message: "Requesting location permission..."
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {

                const { latitude, longitude } = position.coords;



                setCaptainLiveLocation({
                    lat: latitude,
                    lng: longitude
                })
                setIsSheetOpen(false)
                setLocationState({
                    status: "granted",
                    message: "Current location detected successfully."
                });
                setTimeout(() => {
                    setLocationState({
                        status: "idle",
                        message: ""
                    });

                }, 2000);

            },
            (error) => {

                if (error.code === error.PERMISSION_DENIED) {

                    setLocationState({
                        status: "denied",
                        message:
                            "Location access denied. Please allow location permission from your browser settings."
                    });

                } else {

                    setLocationState({
                        status: "denied",
                        message:
                            "Unable to fetch your location. Please try again."
                    });

                }

            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    async function onCancel() {
        try {
            setIsCancel(true)

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/rides/cancel-ride`,
                {
                    params: {
                        rideId: acceptRideData?.ride?._id,
                        userType: 'captains'
                    },
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );
            if (!res?.data?.success) {
                return toast.error(res.data.message)
            }
            toast.success(res.data.message);
            setAcceptRideData(null)
            navigate('/captains/home')
            setIsCancel(false)
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }
    useEffect(() => {
        if (contactCooldown <= 0) return;

        const timer = setInterval(() => {
            setContactCooldown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [contactCooldown]);
    async function onRequestNumber() {

        try {

            const token = localStorage.getItem('token')
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/request-contact`, {
                rideId: ride?._id
            },
                {
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!res.data.success) {
                setContactCooldown(res.data.remaining);
                toast.error(`Wait ${res.data.remaining}s`);
                return;
            }

            toast.success("Request sent");
            setContactCooldown(res.data.cooldown);


        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setIsRequesting(false);
        }

    }

    async function onSendOtp() {
        try {
            const otpValue = otp.join("");

            if (otpValue.length !== 6) {
                toast.error("Please enter the complete OTP");
                return;
            }
            setIsOtpSend(true)

            const token = localStorage.getItem('token')

            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/verify-otp`, {
                rideId: ride._id,
                otp: otpValue
            },
                {
                    headers: {
                        authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!res.data.success) {
                toast.error(res.data.message)
            } else {
                toast.success(res.data.message)
                setAcceptRideData(prev => ({
                    ...prev,
                    ride: {
                        ...prev.ride,
                        status: "ongoing"
                    }
                }));
                navigate('/captains/ride-ongoing')
            }
            setIsOtpSend(false)
        } catch (error) {
            console.log(error.message);

        }
    }

    const renderPanelContent = (showCloseButton = false) => (
        <div className="px-5 pb-6 max-w-full">
            {showCloseButton && (
                <button
                    onClick={() => setIsSheetOpen(!isSheetOpen)}
                    className="sticky rounded-full top-0 backdrop-blur-sm w-full"
                >
                    <img
                        className='w-10 mx-auto lg:hidden'
                        src={space} alt="" />
                </button>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Your Ride</h1>
                <p className="text-gray-500">Track your ride in real time</p>
            </div>

            <div className="bg-black text-white rounded-2xl p-4 mb-5">
                <div className="flex justify-between">
                    <div>
                        <p className="text-sm opacity-80">Status</p>
                        <h3 className="font-bold text-lg">{ride?.status}</h3>
                    </div>

                    <div className="text-right">
                        <p className="text-sm opacity-80">ETA</p>
                        {/* <h3 className="font-bold text-lg">{ride?.eta}</h3> */}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ">
                {/* Header */}
                <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <div className=" w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold shrink-0 ">
                        {user?.fullname.firstname[0]}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">

                        <h2 className=" text-lg font-bold truncate ">
                            {user?.fullname.firstname}
                            {" "}
                            {user?.fullname.lastname}
                        </h2>

                        <p className=" text-sm text-gray-500 ">
                            Passenger
                        </p>

                    </div>

                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 my-4" />

                {/* Details */}
                <div className="space-y-3">

                    <div className=" flex flex-col sm:flex-row sm:items-center gap-2 ">
                        <span className="text-xs font-semibold text-gray-500 w-20 ">
                            EMAIL
                        </span>

                        <span className=" bg-gray-100 px-3 py-2 rounded-xl text-sm break-all ">
                            {user?.email}
                        </span>
                    </div>

                    <div className=" flex flex-col sm:flex-row sm:items-center gap-2 ">
                        <span className="text-xs font-semibold text-gray-500  w-20 ">
                            CONTACT
                        </span>
                        {contactNumber && (
                            <a
                                href={`tel:${contactNumber}`}
                                className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-all duration-200 "
                            >
                                📞 {contactNumber}
                            </a>
                        )}
                        <span className=" bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-sm font-medium ">
                            {contactNumber.length <= 0 ? 'Waiting for user to share contact number' : 'This contact number will be disapper when page refresh'}
                        </span>
                    </div>

                </div>

                {/* Button */}
                {
                    contactNumber.length <= 0 &&
                    <button onClick={onRequestNumber}
                        disabled={contactCooldown > 0 || isRequesting}
                        className=" mt-5 w-full bg-black text-white py-3 rounded-xl font-semibold transition hover:opacity-90 active:scale-[0.98] " >
                        {isRequesting
                            ? "Sending..."
                            : contactCooldown > 0
                                ? `Wait ${contactCooldown}s`
                                : "Request Contact Number"}
                    </button>
                }
                {contactCooldown > 0 && (
                    <>
                        <p className="text-sm text-center mt-2">
                            Next request in {contactCooldown}s
                        </p>

                        <ProgressBar
                            time={contactCooldown}
                            TotalTime={10}
                        />
                    </>
                )}
            </div>

            <div className="border rounded-2xl p-4 my-5">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="w-0.5 h-[50%] bg-gray-300" />
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>

                    <div className="flex-1">
                        <div className="mb-5">
                            <p className="text-gray-500 text-xs">Pickup</p>
                            <p className="font-medium">{ride?.pickup.address}</p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs">Destination</p>
                            <p className="font-medium">{ride?.destination.address}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="bg-gray-100 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500">Fare</p>
                        <p className="font-bold">₹{ride?.fare}</p>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="font-bold">{formatDistance(ride?.distance)}</p>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-bold">{formatDuration(ride?.duration)}</p>
                    </div>
                </div>
            </div>


            <div className="border rounded-2xl p-5 mb-5 bg-black text-white">

                <div className="flex justify-between items-center mb-3">

                    <div>
                        <h3 className="font-bold text-lg">
                            Ride OTP
                        </h3>

                        <p className="text-gray-300 text-sm">
                            Enter OTP to start the ride
                        </p>
                    </div>
                </div>

                <div className="flex justify-center gap-3 my-5 ">
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

                <div className=" bg-white/10 rounded-xl p-3 ">
                    <p className="text-sm text-gray-200">
                        The OTP provided by the user.
                    </p>
                </div>
                <div className='w-full bg-white rounded-xl py-3 mt-4'>
                    <button
                        onClick={onSendOtp}
                        className="flex-1 border text-black w-full border-none font-semibold">
                        {isOtpSend ? 'verifying' : 'submit OTP'}
                    </button>
                </div>
            </div>

            {ride?.showContact && (
                <div className="border rounded-2xl p-4 mb-5">
                    <h3 className="font-semibold mb-3">Temporary Contact Number</h3>

                    <input
                        placeholder="+91 9876543210"
                        className="w-full border rounded-xl p-3 mb-4"
                    />

                    <button className="bg-black text-white px-5 py-3 rounded-xl w-full">
                        Share Contact
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                        This contact number will only be shared with your assigned captain
                        after they arrive at your pickup location.
                    </p>
                </div>
            )}

            {
                locationState.status !== "idle" && (
                    <div
                        className={` m-4 rounded-2xl p-4 text-sm font-medium

                ${locationState.status === "granted"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : ""
                            }

                ${locationState.status === "loading"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : ""
                            }

                ${locationState.status === "denied"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : ""
                            }

                ${locationState.status === "unsupported"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : ""
                            }
            `}
                    >
                        {locationState.message}
                    </div>
                )
            }
            <div className="flex gap-3 mb-5">
                <button
                    onClick={getCurrentLocation}
                    className="flex-1 bg-black text-white rounded-xl py-3 font-semibold">
                    <img src={pin} className='w-5' alt="" /> My Location
                </button>
                <button
                    disabled={isCancel}
                    onClick={onCancel}
                    className="flex-1 border rounded-xl py-3 font-semibold">
                    {isCancel ? 'please wait...' : 'Cancel'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden">
            <Navbar Data={CaptainData} userType={'captains'} />

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="hidden lg:flex lg:w-105 lg:min-w-90 lg:shrink-0 bg-white shadow-xl z-10 h-full">
                    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                        {renderPanelContent()}
                    </div>
                </div>

                <BottomSheet isOpen={isSheetOpen}>
                    <div className="relative">
                        {renderPanelContent(true)}
                    </div>
                </BottomSheet>

                <div className="flex-1 relative min-w-0 h-full overflow-hidden">
                    <CaptainLiveMap
                        route={route}
                        pickup={acceptRideData?.ride?.pickup}
                        destination={acceptRideData?.ride?.destination}
                        setLocationState={setLocationState}
                        CaptainLiveLocation={captainLiveLocation}
                        setCaptainLiveLocation={setCaptainLiveLocation}
                        onClose={() => setIsSheetOpen(false)}
                        getCurrentLocation={getCurrentLocation}
                        ride={ride}
                    />
                </div>
            </div>
        </div>
    );
};
export default CaptainLiveTracking;