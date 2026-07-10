import React, { useContext, useEffect, useState } from "react";
import BottomSheet from "../components/BottomSheet";
import space from '../assets/spaceBar.svg'
import pin from '../assets/pin.svg'
import { UserDataContext } from "../context/UserContext";
import UserLiveMap from "../components/UserLiveMap";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ProgressBar, Timer } from "../components/cards/Timer";
import { registerUserEvents, unregisterUserEvents } from "../socket/socketEvents";
import { useSocket } from "../hooks/useSocket";
const UserLiveTracking = () => {

  const { UserData } = useContext(UserDataContext)

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { AcceptRideData, setAcceptRideData, setUserRideData, setUserData } = useContext(UserDataContext)
  const [isOTPGenerated, setIsOTPGenerated] = useState(AcceptRideData?.ride?.verifyOTPGenerated || false)
  const [locationState, setLocationState] = useState('')
  const [UserLiveLocation, setUserLiveLocation] = useState(null)
  const [route, setRoute] = useState([]);
  const [routeData, setRouteData] = useState({})
  const navigate = useNavigate()
  const [isOtpGenerating, setIsOtpGenerating] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [OTP, setOTP] = useState('')
  const [isCancel, setIsCancel] = useState(false)
  const [shakeContactCard, setShakeContactCard] = useState(false);
  const [contactNumber, setContactNumber] = useState('')
  const socket = useSocket()

  const [shareCooldown, setShareCooldown] = useState(0);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    if (UserData.location) {
      setUserLiveLocation({
        lng: UserData.location.coordinates[0],
        lat: UserData.location.coordinates[1]
      })
    }
  }, [UserData])
  const formatDuration = (seconds) => {
    if (!seconds) return "0 min";

    const totalMinutes = Math.floor(seconds / 60);

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      return mins === 0
        ? `${hours} hr`
        : `${hours} hr ${mins} min`;
    }

    return `${totalMinutes} min`;
  };
  const formatDurationInSec = (seconds) => {
    if (seconds <= 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {

    if (!AcceptRideData?.ride?._id)
      return;
    if (AcceptRideData?.ride?.status === 'cancelled' || AcceptRideData?.ride?.status === 'expired') {
      toast.error('ride expired')
      navigate('/users/home')
    }
    const token =
      localStorage.getItem("token");

    axios.get(
      `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
      {
        params: {
          pickupLat:
            AcceptRideData.ride.pickup.lat,
          pickupLng:
            AcceptRideData.ride.pickup.lng,
          destinationLat:
            AcceptRideData.ride.destination.lat,
          destinationLng:
            AcceptRideData.ride.destination.lng
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
    });

  }, [AcceptRideData?.ride?._id]);

  const formatDistance = (distance) => {
    if (!distance) return "0 m";

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }

    return `${distance} m`;
  };

  const ride = {
    status: "Captain arriving",
    eta: `${formatDuration(routeData.duration)}` || "6 min",

    captain: {
      name: `${AcceptRideData?.captain?.fullname?.firstname} ${AcceptRideData?.captain?.fullname?.lastname}` || "Raj Singh",
      email: `${AcceptRideData?.captain?.email}` || 'rajsingh@gmail.com',
      vehicle: `${AcceptRideData?.captain?.vehicle?.vehicleType}` || "White",
      plate: `${AcceptRideData?.captain?.vehicle?.plate}` || "UK04 AB 1234",
      rating: `${AcceptRideData?.captain?.ratings?.average}` || '4.3'
    },

    pickup: `${AcceptRideData?.ride?.pickup?.address}` || "Haldwani Bus Stand, Haldwani",

    destination: `${AcceptRideData?.ride?.destination?.address}` || "Railway Station, Haldwani",

    fare: `${AcceptRideData?.ride?.fare}` || 149,
    distance: `${formatDistance(AcceptRideData?.ride?.distance)}` || "8.4 km",
    duration: `${formatDuration(AcceptRideData?.ride?.duration)}` || "18 min",

    showContact: true,
    otp: OTP || '543563'
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



        setUserLiveLocation({
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
  const time = Math.floor((new Date(AcceptRideData?.ride?.verifyOTPGeneratedAt).getTime() + 15 * 60 * 1000 - Date.now()) / 1000)

  const [seconds, setSeconds] = useState(time);
  async function generateOTP() {
    setIsOtpGenerating(true)
    try {

      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/generate-otp`,
        {
          headers: {
            authorization:
              `Bearer ${token}`
          }
        }
      );
      if (res.data.success) {
        setOTP(res.data.otp);
        toast.success(res?.data?.message);
        setShowOTP(true)
        if (res.data.message !== "OTP already generated") {
          setSeconds(15 * 60)
        }
      }
    } catch (error) {
        toast.error(error.response.data.message);
    }
  }

  async function onCancel() {
    try {
      setIsCancel(true)
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/cancel-ride`,
        {
          params: {
            rideId: AcceptRideData?.ride?._id,
            userType: 'users'
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      )


      if (!res?.data?.success) {
        return toast.error(res.data.message)
      }
      toast.success(res.data.message);
      setAcceptRideData(null)
      setUserRideData(null)
      navigate('/users/home')
      setIsCancel(false)

    } catch (error) {
        toast.error(error.response.data.message);

    }
  }

  //  console.log(time);

  // listen on cancel event
  useEffect(() => {

    const handlers = {

      onCancelRide: (data) => {

        toast.error('Ride cancelled by captain')
        setUserData(data.user)
        setUserRideData(null)
        setAcceptRideData(null)
        setTimeout(() => {
          navigate('/users/home')
        }, 500);

      }
    };
    registerUserEvents(
      socket,
      handlers
    );

    return () => {
      unregisterUserEvents(
        socket,
        handlers
      );
    };

  }, []);
  // listen on requesting contact number
  useEffect(() => {

    const handlers = {

      onRequestNumber: (data) => {
        setShakeContactCard(true);

        setTimeout(() => {
          setShakeContactCard(false);
        }, 1000);
        toast.success('captain request for contact number')

      }
    };
    registerUserEvents(
      socket,
      handlers
    );

    return () => {
      unregisterUserEvents(
        socket,
        handlers
      );
    };

  }, []);

  // on otp verify

  useEffect(() => {

    const handlers = {

      onOtpVerify: (data) => {
        setAcceptRideData({ride:data.ride,captain:data.captain})
        toast.success('OTP verified, ride started')
        navigate('/users/ride-ongoing')
      }
    };
    registerUserEvents(
      socket,
      handlers
    );

    return () => {
      unregisterUserEvents(
        socket,
        handlers
      );
    };

  }, []);


  useEffect(() => {
    if (seconds <= 0) {
      setShowOTP(false)
      setIsOtpGenerating(false)
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (shareCooldown <= 0) return;

    const timer = setInterval(() => {
      setShareCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [shareCooldown]);

  async function onShare() {
    try {
      setSharing(true)
      const token = localStorage.getItem('token')
      if(contactNumber.length<10){
        return toast.error('please fill valid contact number')
      }
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/share-contact`, {
        rideId: AcceptRideData?.ride?._id,
        contactNumber
      },
        {
          headers: {
            authorization:
              `Bearer ${token}`
          }
        }
      );
      
      
      if (!res.data.success) {
        setShareCooldown(res.data.remaining);
        return;
      }
      toast.success('number shared')
      setShareCooldown(res.data.cooldown);
    } catch (error) {
        toast.error(error.response.data.message);

    } finally {
      setSharing(false);
    }
  }

  const renderPanelContent = (showCloseButton = false) => (
    <div>
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

      <div className="px-5 pb-6 max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Ride</h1>
          <p className="text-gray-500">Track your ride in real time</p>
        </div>

        <div className="bg-black text-white rounded-2xl p-4 mb-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm opacity-80">Status</p>
              <h3 className="font-bold text-lg">{ride.status}</h3>
            </div>

            <div className="text-right">
              <p className="text-sm opacity-80">ETA</p>
              <h3 className="font-bold text-lg">{ride.eta}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 mb-5">
          <div className="flex gap-4">
            <div className="min-w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl">
              {ride.captain.name[0]}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{ride.captain.name}</h3>
              <h3 className="font-semibold text-base">{ride.captain.email}</h3>
              <p className="text-gray-500">Captain</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-white px-3 py-1 rounded-full text-sm">
                  🚕 {ride.captain.vehicle}
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-sm">
                  {ride.captain.plate}
                </span>
                <span className="bg-white px-3 py-1 rounded-full text-sm">
                  ⭐ {ride.captain.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-2xl p-4 my-2">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 min-h-[50%] bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>

            <div className="flex-1">
              <div className="mb-5">
                <p className="text-gray-500 text-xs">Pickup</p>
                <p className="font-medium">{ride.pickup}</p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Destination</p>
                <p className="font-medium">{ride.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-gray-100 p-3 rounded-xl text-center">
              <p className="text-xs text-gray-500">Fare</p>
              <p className="font-bold">₹{ride.fare}</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl text-center">
              <p className="text-xs text-gray-500">Distance</p>
              <p className="font-bold">{ride.distance}</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl text-center">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-bold">{ride.duration}</p>
            </div>
          </div>
        </div>

        {showOTP ? (
          <div className="border rounded-2xl p-5 mb-5 bg-black text-white">

            <div className="flex justify-between items-center mb-3">

              <div>
                <h3 className="font-bold text-lg">
                  Ride OTP
                </h3>

                <p className="text-gray-300 text-sm">
                  Share this OTP with your captain
                </p>
              </div>
            </div>

            <div className="
            flex
            justify-center
            gap-3
            my-5
        ">

              {ride.otp.split("").map((digit, index) => (
                <div
                  key={index}
                  className="
                        w-14
                        h-14
                        bg-white
                        text-black
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-2xl
                        font-bold
                    "
                >
                  {digit}
                </div>
              ))}

            </div>

            <div className="
            bg-white/10
            rounded-xl
            p-3
        ">
              <p className="text-sm text-gray-200">
                ⚠️ Give this OTP only to your assigned captain when they arrive at your pickup location.
              </p>
            </div>

          </div>
        ) : (
          <div className="mb-2">
            <button
              disabled={isOtpGenerating}
              onClick={generateOTP}
              className="bg-black text-white px-5 py-3 rounded-xl w-full"
            >
              {(isOTPGenerated && seconds > 0) ? 'Get OTP' : isOtpGenerating ? 'generating' : 'generate OTP'}
            </button>
          </div>
        )}
        {
          isOTPGenerated && seconds > 1 &&
          <div className="w-full p-2 flex flex-col bg-gray-100 my-1 rounded  items-center justify-around text-center text-gray-900">
            <div className="flex flex-row justify-between w-full items-center">
              <span>
                OTP expires in
              </span>
              <div className="my-0.5">
                <Timer time={seconds}></Timer>
              </div>
            </div>
            <div className="w-full">
              <ProgressBar time={seconds} TotalTime={15 * 60} />
            </div>
          </div>
        }

        {ride.showContact && (
          <div className={`
        border
        rounded-2xl
        p-4
        mb-5
        ${shakeContactCard ? "animate-contact-shake" : ""}
    `}>
            <h3 className="font-semibold mb-3">Temporary Contact Number</h3>

            <input
              onChange={(e) => setContactNumber(e.target.value)}
              value={contactNumber}
              type="number"
              placeholder="+91 9876543210"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <button
              onClick={onShare}
              disabled={sharing || shareCooldown > 0}
              className="bg-black text-white px-5 py-3 rounded-xl w-full">
              {sharing
                ? "Sharing..."
                : shareCooldown > 0
                  ? `Wait ${shareCooldown}s`
                  : "Share Contact"}
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
              className={`
                m-4
                rounded-2xl
                p-4
                text-sm
                font-medium

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
            className="flex-1 bg-black text-white flex justify-center items-center gap-2 rounded-xl py-3 font-semibold">
            <img src={pin} className='w-5 invert-100' alt="" /> <span>My Location</span>
          </button>
          <button
            disabled={isCancel}
            onClick={onCancel}
            className="flex-1 border rounded-xl py-3 font-semibold">
            {isCancel ? 'please wait...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-dvh w-full flex flex-col bg-gray-100 overflow-hidden">
      <Navbar Data={UserData} userType={'users'} />

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
          <UserLiveMap
            route={route}
            pickup={AcceptRideData?.ride?.pickup}
            destination={AcceptRideData?.ride?.destination}
            setLocationState={setLocationState}
            UserLiveLocation={UserLiveLocation}
            setUserLiveLocation={setUserLiveLocation}
            onClose={() => setIsSheetOpen(false)}
            getCurrentLocation={getCurrentLocation}
            setRouteData={setRouteData}
          />
        </div>
      </div>
    </div>
  );
};

export default UserLiveTracking;