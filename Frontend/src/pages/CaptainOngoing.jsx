import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import CaptainNavBar from '../components/CaptainNavBar';
import CaptainOngoingMap from '../components/CaptainOngoingMap';
import space from '../assets/spaceBar.svg';
import pin from '../assets/pin.svg';
import { CaptainDataContext } from '../context/CaptainContext';
import { useSocket } from '../hooks/useSocket';
import { registerCaptainEvents, unregisterCaptainEvents } from '../socket/socketEvents';

const CaptainOngoing = () => {
    const { CaptainData, acceptRideData, setAcceptRideData, setCaptainData } = useContext(CaptainDataContext);
    const navigate = useNavigate();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [locationState, setLocationState] = useState({ status: 'idle', message: '' });
    const [captainLiveLocation, setCaptainLiveLocation] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (CaptainData?.location?.coordinates) {
            setCaptainLiveLocation({
                lng: CaptainData.location.coordinates[0],
                lat: CaptainData.location.coordinates[1]
            });
        }
    }, [CaptainData]);

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

    const ride = useMemo(() => {
        const passengerName = [
            acceptRideData?.user?.fullname?.firstname,
            acceptRideData?.user?.fullname?.lastname
        ].filter(Boolean).join(' ') || 'Passenger';

        return {
            status: acceptRideData?.ride?.status || 'Ride is ongoing',
            passenger: {
                name: passengerName,
                email: acceptRideData?.user?.email || 'passenger@email.com',
            },
            pickup: acceptRideData?.ride?.pickup?.address || 'Pickup location',
            destination: acceptRideData?.ride?.destination?.address || 'Destination',
            fare: acceptRideData?.ride?.fare || 0,
            distance: acceptRideData?.ride?.distance ? formatDistance(acceptRideData.ride.distance) : '0 m',
            duration: acceptRideData?.ride?.duration ? formatDuration(acceptRideData.ride.duration) : '0 min'
        };
    }, [acceptRideData]);

    const handleCompleteRide = async () => {
        if (!acceptRideData?.ride?._id) {
            toast.error('No active ride found');
            return;
        }

        setShowConfirmModal(false);

        try {
            setIsCompleting(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/complete-ride`,
                {
                    rideId: acceptRideData.ride._id,
                    paymentDone: true
                },
                {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Ride marked as completed');
                setAcceptRideData(null);
                setCaptainData(response.data.captain)
                navigate('/captains/home');
            } else {
                toast.error(response.data?.message || 'Unable to complete ride');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to complete ride');
        } finally {
            setIsCompleting(false);
        }
    };

    const socket = useSocket();

    useEffect(() => {
        const handlers = {

            onRideCompleted: (data) => {
                setAcceptRideData(prev => {
                    if (!prev?.ride) return prev;

                    return {
                        ...prev,
                        ride: {
                            ...prev.ride,
                            status: "completed"
                        }
                    };
                });
                setCaptainData(data.captain)
                setAcceptRideData({})
                navigate("/captains/home")
                toast.success('ride completed')
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
    })

    const renderPanelContent = (showCloseButton = false) => (
        <div>
            {showCloseButton && (
                <button
                    onClick={() => setIsSheetOpen(!isSheetOpen)}
                    className="sticky min-h-3 rounded-full top-0 backdrop-blur-sm w-full"
                >
                    <div className="bg-gray-400 mt-2 mb-4 rounded-full mx-auto w-10 h-1" />
                </button>
            )}

            <div className="px-5 pb-3 max-w-full">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold">Your Ride</h1>
                    <p className="text-gray-500">Track your ride in real time</p>
                </div>

                <div className="bg-black text-white rounded-2xl p-5 mb-5 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-300">Remaining Time</span>
                            <span className="text-3xl font-bold mt-1">{formatDuration(remainingTime)}</span>
                        </div>

                        <div className="w-px h-14 bg-gray-600" />

                        <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-300">Remaining Distance</span>
                            <span className="text-3xl font-bold mt-1">{formatDistance(remainingDistance)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4 mb-5">
                    <div className="flex gap-4">
                        <div className="min-w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl">
                            {ride.passenger.name?.[0] || 'P'}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{ride.passenger.name}</h3>
                            <h3 className="font-semibold text-base">{ride.passenger.email}</h3>
                            <p className="text-gray-500">Passenger</p>


                        </div>
                    </div>
                </div>

                <div className="border rounded-2xl p-4 my-2">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <div className="w-0.5 h-[50%] bg-gray-300" />
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

                {locationState.status !== 'idle' && (
                    <div className={`my-2 rounded-2xl p-4 text-sm font-medium ${locationState.status === 'granted' ? 'bg-green-50 text-green-700 border border-green-200' : ''} ${locationState.status === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''} ${locationState.status === 'denied' ? 'bg-red-50 text-red-700 border border-red-200' : ''} ${locationState.status === 'unsupported' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}`}>
                        {locationState.message}
                    </div>
                )}

                <div className="flex gap-3 mb-5">
                    <button
                        onClick={() => setIsTracking((prev) => !prev)}
                        className="flex-1 bg-gray-100 border text-black flex justify-center items-center gap-2 rounded-xl py-3 font-semibold"
                    >
                        <img src={pin} className="w-5" alt="" /> <span>{isTracking ? 'Stop Tracking' : 'Track Location'}</span>
                    </button>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-5 text-sm text-amber-800">
                    <p className="font-semibold">Payment confirmation required</p>
                    <p className="mt-1">Only mark this ride as completed after the passenger has paid. This action closes the trip for both sides.</p>
                </div>

                <div className="flex gap-3 mb-5">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isCompleting}
                        className="flex-1 bg-green-600 text-white flex justify-center items-center gap-2 rounded-xl py-3 font-semibold disabled:opacity-70"
                    >
                        {isCompleting ? 'Finishing Ride...' : 'Mark Ride Completed'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-dvh w-full flex flex-col bg-gray-100 overflow-hidden">
            <CaptainNavBar Data={CaptainData} userType={'captains'} />

            {showConfirmModal && (
                <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Complete ride?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Complete the ride only after payment has been received. This will close the trip for both sides.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteRide}
                                disabled={isCompleting}
                                className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-70"
                            >
                                {isCompleting ? 'Finishing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="hidden lg:flex lg:w-105 lg:min-w-90 lg:shrink-0 bg-white shadow-xl h-full">
                    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                        {renderPanelContent()}
                    </div>
                </div>

                <BottomSheet isOpen={isSheetOpen}>
                    <div className="relative">
                        {renderPanelContent(true)}
                    </div>
                </BottomSheet>

                <div className="flex-1 relative min-w-0 h-full z-0 overflow-hidden">
                    <CaptainOngoingMap
                        onClose={() => setIsSheetOpen(false)}
                        isTracking={isTracking}
                        pickup={acceptRideData?.ride?.pickup}
                        destination={acceptRideData?.ride?.destination}
                        initialLocation={captainLiveLocation}
                        setLocationState={setLocationState}
                        setRemainingDistance={setRemainingDistance}
                        setRemainingTime={setRemainingTime}
                    />
                </div>
            </div>
        </div>
    );
};

export default CaptainOngoing;
