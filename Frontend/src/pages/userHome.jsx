import React, { useContext, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { UserDataContext } from '../context/UserContext'
import RidePanel from '../components/RidePanel'
import MapView from '../components/MapView'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import BottomSheet from '../components/BottomSheet'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRidePanel from '../components/ConfirmRidePanel'
import SearchingDriverPanel from '../components/SearchingDriverPanel'
import BottomSheets from '../components/BottomSheets'
import axios from 'axios'
import ConfirmRidePanelLg from '../components/ConfirmRidePanelLg'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SearchingDriverPanelLg from '../components/SearchingDriverPanelLg'
const userHome = () => {
  const navigate = useNavigate()
  const { UserData, setUserData } = useContext(UserDataContext)
  const { UserRideData, setUserRideData } = useContext(UserDataContext)

  const [destination, setDestination] = useState(UserRideData?.destination || null);
  const [pickup, setPickup] = useState(UserRideData?.pickup || null);

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null);

  const [locationState, setLocationState] = useState({
    status: "idle",
    message: ""
  });

  //  animations

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [bottomSheetsOpen, setBottomSheetsOpen] = useState(false)
  const [bottomSheetsOpenForDriver, setBottomSheetsOpenForDriver] = useState(false)
  const [rideStage, setRideStage] = useState('search')

  const [activePanel, setActivePanel] = useState(null);

  // get fares

  const [rideData, setRideData] = useState(null);
  const [loadingFare, setLoadingFare] = useState(false);

  // confirm ride data vehicle

  const [selectedVehicle, setSelectedVehicle] = useState(null)

  // routes

  const [route, setRoute] =
    useState([]);

  const getRoute = async () => {

    if (!pickup || !destination)
      return;

    try {

      const token =
        localStorage.getItem("token");

      const res =
        await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
          {
            params: {
              pickupLat: pickup.lat,
              pickupLng: pickup.lng,
              destinationLat:
                destination.lat,
              destinationLng:
                destination.lng
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
      setRoute(
        res.data.route.map(
          ([lng, lat]) => [lat, lng]
        )
      );

    } catch (error) {
      console.log(error);

      toast.error(error.response.data.message);
    }
  };


  const prevPickup = useRef(null);
  const prevDestination = useRef(null);

  const getFare = async () => {
    try {
      if (!pickup || !destination) return;

      // Check if pickup and destination are same as previous
      const isSamePickup = prevPickup.current?.lat === pickup.lat && prevPickup.current?.lng === pickup.lng;

      const isSameDestination = prevDestination.current?.lat === destination.lat && prevDestination.current?.lng === destination.lng;

      if (isSamePickup && isSameDestination) {
        console.log("Using cached ride data");
        setActivePanel('vehicle');
        setBottomSheetsOpen(true);
        return; // stop API call and keep old rideData
      }

      // Save current values
      prevPickup.current = pickup;
      prevDestination.current = destination;

      setLoadingFare(true);
      setActivePanel('vehicle');
      setBottomSheetsOpen(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: {
            pickupLat: pickup.lat,
            pickupLng: pickup.lng,
            destinationLat: destination.lat,
            destinationLng: destination.lng
          },
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (!res?.data?.success) {

        return toast.error(res.data.message);
      }

      setRoute(res.data.fare.route.map(([lng, lat]) => [lat, lng]))
      setRideData(res.data.fare);
      setActivePanel('vehicle');
      setBottomSheetsOpen(true);

      // await getRoute();

    } catch (error) {
      console.log(error);

      prevPickup.current = null;
      prevDestination.current = null;
      toast.error(error.response.data.message);
    } finally {
      setLoadingFare(false);
    }
  };
  useEffect(() => {
    if (UserRideData?.status === 'completed') {
      return
    }
    if (UserRideData && Object.keys(UserRideData).length > 0) {
      setRideData(UserRideData)
      getRoute()
      setActivePanel('waiting')
    } else {
      setActivePanel(null)
    }
  }, [UserRideData])

  useEffect(() => {

    if (UserData?.location?.coordinates?.length >= 2) {

      setCurrentLocation({
        lat: UserData.location.coordinates[1],
        lng: UserData.location.coordinates[0]
      });

    }
  }, [UserData]);

  return (
    <div>

      <Navbar userType={'users'} Data={UserData} />
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-64px)]">
        <BottomSheet isOpen={bottomSheetOpen} className=" fixed w-full lg:hidden block overflow-y-auto " >
          <div className="relative">

            <RidePanel
              setRoute={setRoute}
              getFare={getFare}
              activePanel={activePanel}
              bottomSheetOpen={bottomSheetOpen}
              setActivePanel={setActivePanel}
              setBottomSheetOpen={setBottomSheetOpen}
              setSelectionMode={setSelectionMode}
              locationState={locationState}
              selectionMode={selectionMode}
              setLocationState={setLocationState}
              setPickup={setPickup}
              pickup={pickup}
              destination={destination}
              setDestination={setDestination}
              currentLocation={currentLocation}
              setBottomSheetsOpenForDriver={setBottomSheetsOpenForDriver}
              setCurrentLocation={setCurrentLocation} />
            {!UserData?.verified && (
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
                    onClick={() => navigate('/users/profile')}
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
        <BottomSheets
          // className={'lg:hidden'}
          isOpen={bottomSheetsOpen}
        >{
            activePanel === 'vehicle' &&
            <VehiclePanel
              setBottomSheetsOpen={setBottomSheetsOpen}
              setSelectedVehicle={setSelectedVehicle}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              pickup={pickup}
              destination={destination}
              rideData={rideData}
              loading={loadingFare}
              onClose={() => setBottomSheetsOpen(false)}
              onSelect={() => setActivePanel("confirm")}
            />
          }
        </BottomSheets>
        <BottomSheets
          className={'lg:hidden'}
          isOpen={activePanel === "confirm"}
        >
          {
            activePanel === 'confirm' &&
            <ConfirmRidePanel
              setBottomSheetsOpenForDriver={setBottomSheetsOpenForDriver}
              selectedVehicle={selectedVehicle}
              pickup={pickup}
              destination={destination}
              setActivePanel={setActivePanel}
              rideData={rideData}
              onClose={() => setActivePanel(null)}

            />
          }
        </BottomSheets>

        <BottomSheets
          isOpen={bottomSheetsOpenForDriver}
          className={'lg:hidden'}
        >
          {
            activePanel === 'waiting' &&
            <SearchingDriverPanel
              prevPickup={prevPickup}
              prevDestination={prevDestination}
              setActivePanel={setActivePanel}
              setRideData={setRideData}
              onClose={() => setBottomSheetsOpenForDriver(false)}
            />
          }
        </BottomSheets>
        <div className=" p-4 hidden lg:block overflow-y-auto " >
          <div className="relative">

            <RidePanel
              setRoute={setRoute}
              setBottomSheetsOpenForDriver={setBottomSheetsOpenForDriver}
              getFare={getFare}
              bottomSheetOpen={bottomSheetOpen}
              setActivePanel={setActivePanel}
              setBottomSheetOpen={setBottomSheetOpen}
              setSelectionMode={setSelectionMode}
              locationState={locationState}
              selectionMode={selectionMode}
              setLocationState={setLocationState}
              setPickup={setPickup}
              pickup={pickup}
              destination={destination}
              setDestination={setDestination}
              currentLocation={currentLocation}
              activePanel={activePanel}
              setCurrentLocation={setCurrentLocation} />
            {!UserData?.verified && (
              <div className="
            absolute
            inset-0
            bg-white/80
            backdrop-blur-sm
            flex
            justify-center
            items-center
            rounded-3xl
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
                    onClick={() => navigate('/users/profile')}
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

        </div>
        <div className='flex relative flex-1 flex-col'>
          <div className="flex-1 z-40">
            <MapView
              activePanel={activePanel}
              route={route}
              setRoute={setRoute}
              setLocationState={setLocationState}
              currentLocation={currentLocation}
              selectionMode={selectionMode}
              pickup={pickup}
              setPickup={setPickup}
              destination={destination}
              setDestination={setDestination}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
            />
          </div>
          <div className=' absolute z-50 bottom-0 w-full'>
            {
              activePanel === 'confirm' &&
              <ConfirmRidePanelLg

                setBottomSheetsOpenForDriver={setBottomSheetsOpenForDriver}
                pickup={pickup}
                destination={destination}
                rideData={rideData}
                selectedVehicle={selectedVehicle}
                setActivePanel={setActivePanel}
              />
            }
            <BottomSheets

              isOpen={bottomSheetsOpenForDriver}
            >
              {
                activePanel === 'waiting' &&
                <SearchingDriverPanelLg
                  prevPickup={prevPickup}
                  prevDestination={prevDestination}
                  setActivePanel={setActivePanel}
                  setRideData={setRideData}
                  onClose={() => setBottomSheetsOpenForDriver(false)}
                />
              }
            </BottomSheets >
          </div>
        </div>
        <div>
        </div>
      </div>
    </div >
  )
}

export default userHome