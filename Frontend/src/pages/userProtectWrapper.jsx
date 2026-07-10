import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'

const UserProtectWrapper = ({ children }) => {

  const token = localStorage.getItem('token')
  const [isLoading, setIsLoading] = useState(false)

  const { UserData, setUserData } = useContext(UserDataContext)

  const { UserRideData, setUserRideData } = useContext(UserDataContext)

  const {acceptRideData, setAcceptRideData} = useContext(UserDataContext)

  const navigate = useNavigate()

  const socket = useSocket()

  useEffect(() => {
    if (!token) {
      return navigate('/users/login')
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then((res) => {
      setUserData({})
      setUserData(res.data.user)
      setUserRideData({})
      setUserRideData(res.data.activeRide)
      if(res.data.captain){
        setAcceptRideData({ride:res.data.activeRide,captain:res.data.captain})
      }
      setIsLoading(true)
    }).catch((err) => {
        toast.error(err.response.data.message);
      navigate('/users/login')
    })
  }, [token])

  useEffect(() => {
    if (!UserData?._id) return;

    const joinPayload = {
      userId: UserData._id,
      userType: "user"
    };

    const onConnect = () => {
      socket.emit("join", joinPayload);
    };

    socket.on("connect", onConnect);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
    };
  }, [UserData?._id, socket]);

  if (!isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">

        <div className="flex gap-2">

          <div className="w-3 h-3 bg-black rounded-full animate-bounce" />

          <div
            className="w-3 h-3 bg-black rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />

          <div
            className="w-3 h-3 bg-black rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />

        </div>

        <p className="mt-5 text-gray-600 font-medium">
          Checking your account...
        </p>

      </div>
    );
  }

  return (<>
    {children}
  </>
  )
}

export default UserProtectWrapper