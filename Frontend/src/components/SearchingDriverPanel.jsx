import React, { useEffect, useState } from 'react'
import carSvg from '../assets/carImg.jpg'
import bikeSvg from '../assets/motoImg.webp'
import autoSvg from '../assets/autoImg.jpeg'
import space from '../assets/spaceBar.svg'
import { useContext } from 'react'
import { UserDataContext } from '../context/UserContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSocket } from '../hooks/useSocket'
import { registerCaptainEvents, registerUserEvents, unregisterCaptainEvents, unregisterUserEvents } from '../socket/socketEvents'
import { useNavigate } from 'react-router-dom'
const SearchingDriverPanel = ({
  onClose,
  setActivePanel,
  setRideData,
  prevPickup,
  prevDestination
}) => {

  const { UserRideData, setUserRideData } = useContext(UserDataContext)

  const navigate = useNavigate()

  const { AcceptRideData, setAcceptRideData } = useContext(UserDataContext)

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

  const formatDistance = (distance) => {
    if (!distance) return "0 m";

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }

    return `${distance} m`;
  };

  const vehicleImg = UserRideData?.vehicleType === 'car' ? carSvg : UserRideData?.vehicleType === 'auto' ? autoSvg : bikeSvg

  const ride = {
    vehicle: UserRideData?.vehicleType === 'car' ? 'Uber Go' : UserRideData?.vehicleType === 'auto' ? 'Auto' : 'Moto' || "Uber Go",
    fare: UserRideData?.fare || 164,
    distance: formatDistance(UserRideData?.distance) || "12.4 km",
    duration: formatDuration(UserRideData?.duration) || "28 min",
    pickup: `${UserRideData?.pickup?.address}` || "Haldwani Bus Stand",
    destination: `${UserRideData?.destination?.address}` || "Railway Station",
  }

  const time = Math.floor((new Date(UserRideData?.searchExpiresAt).getTime() - Date.now()) / 1000);

  const TotalTime = Math.floor((new Date(UserRideData?.searchExpiresAt).getTime() - new Date(UserRideData?.createdAt).getTime()) / 1000)

  const [seconds, setSeconds] = useState(time);
  // console.log((seconds / TotalTime) * 100);
  // console.log((new Date(UserRideData?.searchExpiresAt).getTime() - Date.now()));


  useEffect(() => {
    if (seconds <= 0) {

      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);

    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  async function onCancel() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/cancel-ride`,
        {
          params: {
            rideId: UserRideData?._id,
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

      if (res.data.success) {
        setActivePanel(null)
        setUserRideData(null)
        setRideData(null)
        prevPickup.current = null;
        prevDestination.current = null;
        return toast.success(res.data.message)
      }
    } catch (err) {
      toast.error(err.response.data.message)
    }
  }

  // const socket = useSocket()

  // useEffect(() => {

  //   const handlers = {

  //     onAcceptRide: (data) => {


  //       toast.success('Ride accepted')

  //       setTimeout(() => {
  //         navigate('/users/live-tracking')
  //       }, 500);

  //       setAcceptRideData(data)

  //     }
  //   };
  //   registerUserEvents(
  //     socket,
  //     handlers
  //   );

  //   return () => {
  //     unregisterUserEvents(
  //       socket,
  //       handlers
  //     );
  //   };

  // }, []);

  return (
    <div
      className="
                bg-white
                h-dvh
                rounded-t-3xl
                shadow-2xl
                px-6
                overflow-y-auto
            "
    >
      <div className='sticky top-0  z-100 w-full backdrop-blur-xl'>
        <img
          className='w-10  mx-auto lg:hidden '
          src={space}
          onClick={onClose}
        />
      </div>
      {/* Searching animation */}
      <div className="flex flex-col items-center mb-8">

        <div className="relative">

          <div
            className="
                            w-24
                            h-24
                            rounded-full
                            border-4
                            border-gray-200
                        "
          />

          {seconds >= 0 && <div
            className="
                            absolute
                            inset-0
                            w-24
                            h-24
                            rounded-full
                            border-4
                            border-black
                            border-t-transparent
                            animate-spin
                        "
          />}

          <img
            src={vehicleImg}
            className="
                            absolute
                            top-1/2
                            left-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            w-14
                            rounded-xl
                        "
            alt=""
          />

        </div>

        <h2
          className="
                        text-2xl
                        font-bold
                        mt-6
                    "
        >
          {AcceptRideData?.ride ? 'Driver Found' : 'Searching Driver'}
        </h2>

        <p
          className="
                        text-gray-500
                        text-center
                        mt-2
                    "
        >
          {AcceptRideData?.ride ? 'Captain is picked your ride' : 'Finding the nearest driver for you...'}
        </p>

      </div>

      {/* Vehicle */}
      <div
        className="
                    border
                    rounded-2xl
                    p-5
                    mb-5
                    flex
                    justify-between
                    items-center
                "
      >

        <div className="flex gap-4">

          <img
            src={vehicleImg}
            className="
                            h-20
                            
                            rounded-xl
                        "
            alt=""
          />

          <div>

            <h3 className="font-bold text-lg">
              {ride.vehicle}
            </h3>

            <p className="text-gray-500">
              {ride.distance}
            </p>

            <p className="text-gray-500">
              {ride.duration}
            </p>

          </div>

        </div>

        <div
          className="
                        text-2xl
                        font-bold
                    "
        >
          ₹{ride.fare}
        </div>

      </div>

      {/* Route */}
      <div
        className="
                    border
                    rounded-2xl
                    p-5
                    mb-5
                "
      >

        <div className="flex gap-4">

          <div
            className="
                            flex
                            flex-col
                            items-center
                        "
          >
            <div
              className="
                                w-3
                                h-3
                                rounded-full
                                bg-green-500
                            "
            />

            <div
              className="
                                h-[50%]
                                w-0.5
                                bg-gray-300
                            "
            />

            <div
              className="
                                w-3
                                h-3
                                rounded-full
                                bg-red-500
                            "
            />
          </div>

          <div className="flex-1">

            <div className="mb-6">

              <h4 className="font-semibold">
                Pickup
              </h4>

              <p className="text-gray-500">
                {ride.pickup}
              </p>

            </div>

            <div>

              <h4 className="font-semibold">
                Destination
              </h4>

              <p className="text-gray-500">
                {ride.destination}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Ride info */}
      <div
        className="
                    bg-gray-50
                    rounded-2xl
                    p-5
                "
      >

        <div className="flex justify-between mb-4">

          <span className="text-gray-500">
            Distance
          </span>

          <span className="font-bold">
            {ride.distance}
          </span>

        </div>

        <div className="flex justify-between mb-4">

          <span className="text-gray-500">
            Duration
          </span>

          <span className="font-bold">
            {ride.duration}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-gray-500">
            Fare
          </span>

          <span className="font-bold">
            ₹{ride.fare}
          </span>

        </div>

      </div>
      {/* Searching Status */}
      {
        AcceptRideData?.ride ?
          <div className="
    bg-gray-100
    w-full
    mt-2
    rounded-2xl
    p-4
    shadow-sm
">
            {/* Header */}
          
              <div className="flex items-center justify-start gap-3 min-w-full">

                {/* Avatar */}
                <div className="
                min-w-14
                min-h-14
                rounded-full
                bg-black
                text-white
                flex
                items-center
                justify-center
                text-lg
                font-bold
            ">
                  {AcceptRideData?.captain?.fullname?.firstname?.[0]}
                </div>

                {/* Captain Info */}
                <div className='w-full'>
                  <div className='w-full flex flex-row justify-between'>
                    <h3 className="
                    font-semibold
                    text-lg
                    ">
                      {AcceptRideData?.captain?.fullname?.firstname}
                      {" "}
                      {AcceptRideData?.captain?.fullname?.lastname}
                    </h3>
                    {/* Vehicle Type */}
                    <div className="
            bg-black
            text-white
            px-3
            py-1
            rounded-full
            text-sm
            capitalize
        ">
                      {AcceptRideData?.captain?.vehicle?.vehicleType}
                    </div>
                  </div>
                  <p className="
                    text-sm
                    text-gray-500
                    pr-1
                "
                  >
                    {AcceptRideData?.captain?.email}
                  </p>
                  <p className="
                    text-sm
                    text-gray-500
                ">
                    Captain
                  </p>
                </div>
              </div>
            {/* Access ride  */}
            <div className="
    flex
    items-center
    justify-between
    gap-4
    my-4
">

              {/* Status */}
              <div className="
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-xl
        bg-gray-100
        border
    ">
                <span className="text-gray-500 text-sm">
                  Status
                </span>

                <span className="
            font-semibold
            capitalize
            text-gray-600
        ">
                  {AcceptRideData?.ride?.status}
                </span>
              </div>

              {/* Live Tracking */}
              <button
                onClick={() => {
                  if (AcceptRideData?.ride?.status === 'ongoing') {
                    navigate('/users/ride-ongoing')
                  } else {
                    navigate('/users/live-tracking')
                  }
                }}
                className="
            px-5
            py-2
            rounded-xl
            bg-black
            text-white
            font-medium
            hover:opacity-90
            transition
        "
              >
                Live Tracking
              </button>

            </div>
            {/* Vehicle Details */}
            <div className="
        grid
        grid-cols-3
        gap-3
        text-center
    ">
              <div className="
            bg-white
            rounded-xl
            p-3
        ">
                <p className="
                text-xs
                text-gray-500
            ">
                  Vehicle
                </p>

                <p className="font-semibold capitalize">
                  {AcceptRideData?.captain?.vehicle?.color}
                </p>
              </div>

              <div className="
            bg-white
            rounded-xl
            p-3
        ">
                <p className="
                text-xs
                text-gray-500
            ">
                  Plate
                </p>

                <p className="font-semibold">
                  {AcceptRideData?.captain?.vehicle?.plate}
                </p>
              </div>

              <div className="
            bg-white
            rounded-xl
            p-3
        ">
                <p className="
                text-xs
                text-gray-500
            ">
                  Rating
                </p>

                <p className="font-semibold">
                  ⭐ {AcceptRideData?.captain?.ratings?.average || "N/A"}
                </p>
              </div>
            </div>
          </div>
          :
          <div
            className="
        mt-5
        border
        rounded-2xl
        p-5
        bg-orange-50
        border-orange-200
    "
          >

            {seconds > 0 ? (
              <>
                <div className="flex flex-col items-center justify-between">

                  <div className='mb-2'>

                    <h3 className="font-semibold">
                      Waiting for driver
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Your ride request will expire automatically
                    </p>

                  </div>

                  <div
                    className="
                       
                      flex flex-row gap-4 items-center justify-center
                    "
                  >
                    <button
                      onClick={onCancel}
                      className=' py-2 px-4 rounded-xl bg-red-500 text-white shadow-sm
                                font-bold text-lg hover:bg-red-600 transition'>cancel</button>
                    <span className="    
                               bg-white
                               px-4
                               py-2
                               rounded-xl
                               shadow-sm
                                font-bold text-lg">
                      {minutes}:
                      {remainingSeconds
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>

                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="
                            h-full
                            bg-orange-500
                            transition-all
                            duration-1000
                        "
                      style={{
                        width: `${(seconds / TotalTime) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">

                <h3 className="font-bold text-lg">
                  No drivers accepted
                </h3>
                <button
                  onClick={onCancel}
                  className=' py-2 px-4 rounded-xl bg-white text-red-500 shadow-sm
                                font-bold text-lg hover:bg-red-100 cursor-pointer transition'>cancel</button>
                <p className="text-gray-500 m-2">
                  Ride request automatically cancelled
                </p>

              </div>
            )}

          </div>
      }
    </div >
  )
}

export default SearchingDriverPanel