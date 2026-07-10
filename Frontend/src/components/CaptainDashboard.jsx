import React, { useContext, useState } from "react";
import space from '../assets/spaceBar.svg'
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";
import gps from '../assets/gps.svg'
import toast from "react-hot-toast";
import carSvg from '../assets/carImg.jpg'
import bikeSvg from '../assets/motoImg.webp'
import autoSvg from '../assets/autoImg.jpeg'
import AvailableRidePanelLg from "./AvailableRidePanelLg";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useEffect } from "react";
const CaptainDashboard = ({
  setBottomSheetOpen,
  getAvailableRides,
  bottomSheetOpen,
  setOpenPopupForRides,
  setCurrentLocation,
  onRefresh,
  loading,
  onConfirm,
  setCurrentRide,
  setAvailableRides,
  availableRides,
  getConfirmRideData,
  setRange,
  range
}) => {

  const { CaptainData, setCaptainData } = useContext(CaptainDataContext)
  const [isLoading, setIsLoading] = useState(false)
  const { acceptRideData } = useContext(CaptainDataContext)
  const [showRideHistory, setShowRideHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [rideHistory, setRideHistory] = useState([])
  const historyRef = useRef()
  const navigate = useNavigate()
  // current location
  const [locationState, setLocationState] = useState({
    status: "idle",
    message: ""
  });

  const updateCaptainLocation = async (location) => {
    try {

      const token =
        localStorage.getItem("token");

      await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/update-location`,
        {
          params: {
            lat: location.lat,
            lng: location.lng
          },
          headers: {
            authorization:
              `Bearer ${token}`
          }
        }
      );

    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const getCurrentLocation = async () => {


    setBottomSheetOpen(false)

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
      async (position) => {

        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          lat: latitude,
          lng: longitude
        })

        await updateCaptainLocation({ lat: latitude, lng: longitude })

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
        console.log(error);

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
        //   timeout: 10000,
        //   maximumAge: 0
      }
    );
  };


  const vehicleImg = CaptainData?.vehicle.vehicleType === 'car' ? carSvg : CaptainData?.vehicle.vehicleType === 'auto' ? autoSvg : bikeSvg

  const updateStatus = async (status) => {

    try {
      const token =
        localStorage.getItem("token");
      setIsLoading(true)
      const res =
        await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captains/update-status`,
          {
            params: {
              status
            },
            headers: {
              authorization:
                `Bearer ${token}`
            }
          }
        );
      setCaptainData(res.data.captain)
      setIsLoading(false)
      if (!res.data.success) {
        return toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.response.data.message);
      setIsLoading(false)
      toast.error('something went wrong')

    }

  }

  const [showDesktopRides, setShowDesktopRides] = useState(false);

  useEffect(() => {
    if (!showRideHistory) return;

    const timer = setTimeout(() => {
      historyRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100); 

    return () => clearTimeout(timer);
  }, [showRideHistory]);
  async function fetchRideHistory() {
    try {
      const token = localStorage.getItem('token')
      setHistoryLoading(true)
      setShowRideHistory(false)
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/ride-history`, {
        userId: CaptainData._id,
        userType: 'captain'
      },
        {
          headers: {
            authorization:
              `Bearer ${token}`
          }
        }
      );
      if (!res.data.success) {
        return toast.error(res.data.message);
      }
      setRideHistory(res.data.rides);
      setShowRideHistory(true)
    } catch (error) {
      console.log(error);
      console.log(error.response.data);

    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="
            bg-white
            rounded-3xl
            shadow-xl
            w-full
            lg:w-105
        ">
      <div className="sticky rounded-full top-0 backdrop-blur-sm w-full ">
        <img
          className='w-10 mx-auto lg:hidden'
          src={space}
          onClick={() =>
            setBottomSheetOpen(
              !bottomSheetOpen
            )
          }
        />
      </div>
      <div className="px-6">


        {/* Profile */}
        <div className="flex gap-4 mb-8">

          <div className="
        w-16
        h-16
        flex justify-center items-center
        rounded-full ">
            <img src={vehicleImg} className=" w-16 h-16 object-contain" alt="" />
          </div>

          <div className="flex-1">

            <h2 className="font-bold text-xl">
              {CaptainData?.fullname?.firstname}
              {" "}
              {CaptainData?.fullname?.lastname}
            </h2>

            <p className="text-gray-500 text-sm">
              {CaptainData?.email}
            </p>

            <div className="flex gap-4 mt-2">

              <span className="font-semibold">
                ⭐ {CaptainData?.ratings?.average || 0}
              </span>

              <span className="text-gray-500">
                (
                {CaptainData?.ratings?.totalRatings || 0}
                )
              </span>

            </div>

          </div>

        </div>

        {/* Vehicle */}

        <div className="
    bg-gray-50
    rounded-2xl
    p-5
    mb-8
">

          <h3 className="font-semibold mb-4">
            Vehicle Information
          </h3>

          <div className="space-y-2">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Type
              </span>

              <span className="font-medium capitalize">
                {CaptainData?.vehicle?.vehicleType}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Color
              </span>

              <span className="font-medium capitalize">
                {CaptainData?.vehicle?.color}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Plate
              </span>

              <span className="font-medium">
                {CaptainData?.vehicle?.plate}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Capacity
              </span>

              <span className="font-medium">
                {CaptainData?.vehicle?.capacity}
              </span>
            </div>

          </div>

        </div>

        {/* Stats */}
        <div className="
    grid
    grid-cols-3
    gap-4
    mb-8
">

          <div className="
        bg-gray-50
        rounded-2xl
        p-4
        text-center
    ">

            <h3 className="font-bold text-xl">
              ₹{CaptainData?.earnings?.total || 0}
            </h3>

            <p className="text-gray-500 text-sm">
              Earnings
            </p>

          </div>

          <div className="
        bg-gray-50
        rounded-2xl
        p-4
        text-center
    ">

            <h3 className="font-bold text-xl">
              {CaptainData?.ratings?.totalRatings || 0}
            </h3>

            <p className="text-gray-500 text-sm">
              Ratings
            </p>

          </div>

          <div className="
        bg-gray-50
        rounded-2xl
        p-4
        text-center
    ">

            <h3 className="font-bold text-xl capitalize">
              {CaptainData?.status}
            </h3>

            <p className="text-gray-500 text-sm">
              Status
            </p>

          </div>

        </div>

        {/* Status */}
        <div className="
                bg-green-50
                border
                border-green-200
                rounded-2xl
                p-4
                flex
                justify-between
                items-center
                mb-4
            ">

          <div>

            <h3 className="font-semibold">
              Status
            </h3>

            <p
              className={
                CaptainData?.status === "online"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {
                CaptainData?.status === "online"
                  ? "🟢 Online"
                  : "🔴 Offline"
              }
            </p>

          </div>

          <button
            disabled={isLoading}
            onClick={() =>
              updateStatus(
                CaptainData?.status === "online"
                  ? "offline"
                  : "online"
              )
            }
            className="bg-black text-white px-4 py-2 rounded-xl " >
            {
              isLoading
                ? "Please wait..."
                : CaptainData?.status === "online"
                  ? "Go Offline"
                  : "Go Online"
            }
          </button>

        </div>

        {/* Current Ride */}
        <div className="
    border
    rounded-2xl
    p-5
">
          <h3 className="font-semibold mb-3">
            Current Ride
          </h3>

          {
            acceptRideData?.ride ? (
              <div
                onClick={() => {
                  if (acceptRideData?.ride?.status === 'ongoing') {
                    navigate('/captains/ride-ongoing')
                  } else {
                    navigate('/captains/live-tracking')
                  }
                }}
                className="
                rounded-xl
                p-4
                bg-gray-100
                shadow-sm
                space-y-3
            ">

                {/* Passenger */}
                <div className="
                    flex
                    items-center
                    justify-between
                ">
                  <div>
                    <p className="
                            text-xs
                            text-gray-500
                        ">
                      Passenger
                    </p>

                    <h4 className="
                            font-semibold
                            text-base
                        ">
                      {acceptRideData?.user?.fullname?.firstname} {acceptRideData?.user?.fullname?.lastname}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {acceptRideData?.user.email}
                    </p>
                  </div>

                  <div className="
                        bg-black
                        text-white
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-semibold
                    ">
                    ₹{acceptRideData?.ride?.fare}
                  </div>
                </div>

                {/* Route */}
                <div className="
                    flex
                    gap-3
                    h-full
                ">
                  <div className="
                        flex
                        flex-col
                        items-center
                    ">
                    <div className="
                            w-2.5
                            h-2.5
                            rounded-full
                            bg-green-500
                        "/>

                    <div className="
                            w-0.5
                            h-8
                            bg-gray-300
                        "/>

                    <div className="
                            w-2.5
                            h-2.5
                            rounded-full
                            bg-red-500
                        "/>
                  </div>

                  <div className="
                        flex-1
                        w-full
                        pr-2
                        space-y-3
                        text-sm
                    ">
                    <p className="
                            truncate
                            font-medium
                        ">
                      {acceptRideData?.ride?.pickup?.address}
                    </p>

                    <p className="
                            truncate
                            font-medium
                        ">
                      {acceptRideData?.ride?.destination?.address}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="
                    flex
                    justify-between
                    text-sm
                    pt-2
                    border-t
                ">
                  <div>
                    <p className="text-gray-500">
                      Distance
                    </p>

                    <p className="font-semibold">
                      {(acceptRideData?.ride?.distance / 1000).toFixed(1)} km
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Time
                    </p>

                    <p className="font-semibold">
                      {Math.floor(
                        acceptRideData?.ride?.duration / 60
                      )} min
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Vehicle
                    </p>

                    <p className="font-semibold capitalize">
                      {acceptRideData?.ride?.vehicleType}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-gray-500">
                No active ride
              </p>
            )
          }
        </div>

        {/* current location */}
        <button
          onClick={getCurrentLocation}
          className="
        my-4
        w-full
        bg-white
        rounded-2xl
        p-4
        border
        shadow-sm
        flex
        justify-between
        items-center
        hover:bg-gray-50
    "
        >

          <div className="flex gap-4">

            <div className="
            w-12
            h-12
            rounded-full
            bg-black
            text-white
            flex
            items-center
            justify-center
        ">
              <img src={gps} className='w-10 invert-100' alt="" />
            </div>

            <div className="text-left">

              <div className="font-semibold">
                See Current Location
              </div>

              <div className="text-sm text-gray-500">
                Detect my location
              </div>

            </div>

          </div>

          <div className="text-2xl">
            ›
          </div>

        </button>
        {
          locationState.status !== "idle" && (
            <div
              className={`
                mb-4
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
        {/* Actions */}
        <div className="space-y-3">

          <button
            onClick={() => { setOpenPopupForRides(true); getAvailableRides() }}
            disabled={
              CaptainData?.status === "offline"
            }
            className="
            w-full
            bg-black
            text-white
            py-4
            rounded-2xl
            lg:hidden
            font-semibold
            disabled:opacity-50
        "
          >
            Check Available Rides
          </button>
          <button
            disabled={acceptRideData?.ride}
            onClick={() => {
              if (acceptRideData?.ride) {
                toast.error('you already have an ride')
              } else {

                setShowDesktopRides(
                  prev => !prev
                );
              }
              if (!showDesktopRides) onRefresh()
            }}
            className="
        bg-black
        text-white
        px-5
        w-full
            justify-between
        py-3
        hidden
        lg:flex
        rounded-xl
        font-semibold
        items-center
        gap-2
    "
          >
            Available Rides

            <span
              className={`
            transition-transform
            duration-300
            ${showDesktopRides
                  ? "rotate-180"
                  : ""
                }
        `}
            >
              ▼
            </span>
          </button>
          <div
            className={`
        origin-top
        hidden
        lg:block
        transition-all
        duration-300
        ease-out
        ${showDesktopRides
                ? "scale-y-100 opacity-100 mt-4"
                : "scale-y-0 opacity-0 h-0"
              }
    `}
          >
            <div className="
        bg-white
        shadow-lg
        overflow-hidden
    ">
              <AvailableRidePanelLg
                setRange={setRange}
                range={range}
                getConfirmRideData={getConfirmRideData}
                availableRides={availableRides}
                setAvailableRides={setAvailableRides}
                onConfirm={onConfirm}
                setCurrentRide={setCurrentRide}
                onRefresh={onRefresh}
                loading={loading}
                onClose={() => { }}
              />
            </div>
          </div>
          <button
            onClick={async () => {
              if (showRideHistory) {
                setShowRideHistory(false);
                return;
              }
              await fetchRideHistory();
            }}
            disabled={historyLoading}
            className="
            w-full
            border
            py-4
            rounded-2xl
            font-semibold
            disabled:opacity-50
        "
          >
            {historyLoading ? "Loading..." : showRideHistory ? "Hide Ride History" : "Ride History"}
          </button>

          <div
            ref={historyRef}
            className={`
              overflow-hidden
              transition-all
              duration-300
              ease-out
              pb-2
              ${showRideHistory ? "max-h-128 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}
            `}
          >
            <div className="max-h-104 overflow-y-auto pr-1 space-y-3">
              {rideHistory.length > 0 ? (
                rideHistory.map((ride) => (
                  <div key={ride._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Passenger
                        </p>
                        <p className="truncate font-semibold text-sm">
                          {ride?.user?.fullname?.firstname} {ride?.user?.fullname?.lastname}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {ride?.user?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">₹{ride?.fare}</p>
                        <p className="text-xs capitalize text-gray-500">{ride?.status}</p>
                        <p className='text-xs capitalize text-gray-500'> ride date: {new Date(ride?.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <div className="mt-1 flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <div className="mt-1 h-[50%] w-0.5 bg-gray-300" />
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2 text-sm">
                        <p className=" font-medium">{ride?.pickup?.address}</p>
                        <p className=" font-medium">{ride?.destination?.address}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-gray-200 pt-2 text-sm text-gray-600">
                      <div>
                        <p className="text-gray-500">Distance</p>
                        <p className="font-semibold">{(ride?.distance / 1000).toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-semibold">{Math.floor(ride?.duration / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rating</p>
                        <p className="font-semibold">⭐ {ride?.captainRating ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                  No ride history yet.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;