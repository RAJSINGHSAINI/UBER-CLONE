import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'

const CaptainProtectWrapper = ({ children }) => {

  const token = localStorage.getItem('token')
  const [isLoading, setIsLoading] = useState(false)

  const { CaptainData, setCaptainData } = useContext(CaptainDataContext)
  const { setAcceptRideData } = useContext(CaptainDataContext)
  const navigate = useNavigate()
  const socket = useSocket()

  useEffect(() => {
    if (!token) {
      return navigate('/captains/login')
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then((res) => {
      setCaptainData({})
      setCaptainData(res.data.captain)
      setAcceptRideData(res.data.data)
      setIsLoading(true)
    }).catch((err) => {
        toast.error(err.response.data.message);
      navigate('/captains/login')
    })
  }, [token])

  useEffect(() => {
    if (!CaptainData?._id) return;

    const joinPayload = {
      userId: CaptainData._id,
      userType: "captain"
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
  }, [CaptainData?._id, socket]);

  if (!isLoading) {
    return <div className="h-screen flex flex-col items-center justify-center bg-white">

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
  }

  return (<>
    {children}
  </>
  )
}

export default CaptainProtectWrapper