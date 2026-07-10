import React, { useContext, useRef } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import Navbar from '../components/CaptainNavBar';
import CaptainMap from '../components/CaptainMap';
import CaptainDashboard from '../components/CaptainDashboard';
import BottomSheet from '../components/BottomSheet';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AvailableRidePanel from '../components/AvailableRidePanel';
import BottomSheets from '../components/BottomSheets';
import axios from 'axios';
import toast from 'react-hot-toast';
import CaptainConfirmRide from '../components/CaptainConfirmRide';
import CaptainConfirmRideLg from '../components/CaptainConfirmRideLg';
import { useEffect } from 'react';

const captainHome = () => {
  const navigate = useNavigate()
  const { CaptainData, setCaptainData } = useContext(CaptainDataContext)

  // pop up states
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  const [openPopupForRides, setOpenPopupForRides] = useState(false)

  const [activePanel, setActivePanel] = useState(null)

  const [currentLocation, setCurrentLocation] = useState(null);

  const [openConfirmRidePanel, setOpenConfirmRidePanel] = useState(false)

  // all rides

  const [availableRides, setAvailableRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);

  const [CurrentRide, setCurrentRide] = useState(null)

  const [currentRideDataWithUser, setCurrentRideDataWithUser] = useState(null)

  const [range, setRange] = useState('1')

  async function getAvailableRides() {
    try {
      setLoadingRides(true);

      const token =
        localStorage.getItem("token");

      const res =
        await axios.get(
          `${import.meta.env.VITE_BASE_URL}/rides/available-rides`,
          {
            params: {
              range
            },
            headers: {
              authorization:
                `Bearer ${token}`
            }
          }
        );
      if (!res.data.success) {
        return toast.error(res.data.message)
      }
      setAvailableRides(res.data.rides);
    } catch (err) {
      toast.error(err.response.data.message);
    }
    finally {
      setLoadingRides(false);
    }
  }

  // set current location

  const currentLocationRef = useRef(null);

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

  async function getConfirmRideData(ride) {
    setOpenConfirmRidePanel(true);
    try {
      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/ride-data`,
        {
          params: {
            rideId: ride._id
          },
          headers: {
            authorization:
              `Bearer ${token}`
          }
        }
      );
      if (!res.data.success) {
        return toast.error(res.data.message);
      }

      setCurrentRideDataWithUser(res.data)
    } catch (error) {
      toast.error("something went wrong")

    }
  }

  useEffect(() => {

    if (CaptainData?.location?.coordinates?.length >= 2) {

      setCurrentLocation({
        lat: CaptainData.location.coordinates[1],
        lng: CaptainData.location.coordinates[0]
      });

    }
  }, [CaptainData]);

  return (
    <div>
      <Navbar userType={'captains'} />
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-64px)]">


        {/* mobile view */}
        <BottomSheet isOpen={bottomSheetOpen} className=" fixed w-full lg:hidden block overflow-y-auto " >
          <div className="relative">

            <CaptainDashboard
              range={range}
              setRange={setRange}
              availableRides={availableRides}
              setAvailableRides={setAvailableRides}
              getConfirmRideData={getConfirmRideData}
              onConfirm={() => setOpenConfirmRidePanel(true)}
              setCurrentRide={setCurrentRide}
              onRefresh={() => getAvailableRides()}
              rides={availableRides}
              loading={loadingRides}
              onClose={() => setOpenPopupForRides(!openPopupForRides)}
              getAvailableRides={getAvailableRides}
              setCurrentLocation={setCurrentLocation}
              setBottomSheetOpen={setBottomSheetOpen}
              bottomSheetOpen={bottomSheetOpen}
              setOpenPopupForRides={setOpenPopupForRides}
            />
            {!CaptainData?.verified && (
              <div className="
            absolute
            inset-0
            bg-white/80
            backdrop-blur-sm
            flex
            justify-center
            items-start
            rounded-3xl
            mt-10
            z-50
        ">
                <div className="text-center">
                  <h2 className="font-bold text-xl">
                    Verify your account
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Verification is required to book rides.
                  </p>

                  <button
                    onClick={() => navigate('/captains/profile')}
                    className="
                    mt-4
                    bg-black
                    text-white
                    px-6
                    py-3
                    rounded-xl
                ">
                    Verify Now
                  </button>
                </div>
              </div>
            )}

          </div>
        </BottomSheet>
        <BottomSheets isOpen={openPopupForRides} className={" lg:hidden "}
        >
          <AvailableRidePanel
            range={range}
            setRange={setRange}
            setAvailableRides={setAvailableRides}
            availableRides={availableRides}
            getConfirmRideData={getConfirmRideData}
            onConfirm={() => setOpenConfirmRidePanel(true)}
            setCurrentRide={setCurrentRide}
            onRefresh={() => getAvailableRides()}
            rides={availableRides}
            loading={loadingRides}
            onClose={() => setOpenPopupForRides(!openPopupForRides)} />
        </BottomSheets>

        <BottomSheets
          isOpen={openConfirmRidePanel} className={" lg:hidden "}

        >
          <CaptainConfirmRide
            currentRideDataWithUser={currentRideDataWithUser}
            // ride={CurrentRide}
            onClose={() => setOpenConfirmRidePanel(false)}
            onOpen={() => setOpenConfirmRidePanel(true)}
          />
        </BottomSheets>


        {/* desktop view */}
        <div className='lg:block hidden overflow-y-auto'>
          <CaptainDashboard
            range={range}
            setRange={setRange}
            availableRides={availableRides}
            setAvailableRides={setAvailableRides}
            getConfirmRideData={getConfirmRideData}
            onConfirm={() => setOpenConfirmRidePanel(true)}
            setCurrentRide={setCurrentRide}
            onRefresh={() => getAvailableRides()}
            rides={availableRides}
            loading={loadingRides}
            onClose={() => setOpenPopupForRides(!openPopupForRides)}
            getAvailableRides={getAvailableRides}
            setCurrentLocation={setCurrentLocation}
            setBottomSheetOpen={setBottomSheetOpen}
            bottomSheetOpen={bottomSheetOpen}
            setOpenPopupForRides={setOpenPopupForRides}
          />
        </div>
        {/* map */}
        <div className='flex-1 h-dvh lg:h-full z-40'>
          <CaptainMap
            currentLocation={currentLocation}
          />
        </div>

        <BottomSheets
          isOpen={openConfirmRidePanel}
        >
          <CaptainConfirmRideLg
            currentRideDataWithUser={currentRideDataWithUser}
            // ride={CurrentRide}
            onClose={() => setOpenConfirmRidePanel(false)}
            onOpen={() => setOpenConfirmRidePanel(true)}
          />
        </BottomSheets>
      </div>
    </div>
  )
}

export default captainHome