import { createContext, useContext, useEffect } from "react";
import { socket } from "../socket/socket";
import toast from "react-hot-toast";
import { registerCaptainEvents, registerUserEvents, unregisterCaptainEvents, unregisterUserEvents } from "../socket/socketEvents";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "./UserContext";
import { CaptainDataContext } from "./CaptainContext";

export const SocketContext = createContext();

export const SocketProvider = ({
    children
}) => {

    const navigate = useNavigate()
    const {setAcceptRideData} = useContext(UserDataContext)
    const {setCaptainData} = useContext(CaptainDataContext)
    useEffect(() => {

        socket.connect();
        
        socket.on("connect", () => { console.log("socket connected", socket.id); });
        
        socket.on("disconnect", () => { console.log("socket disconnected"); });
        
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };

    }, []);
    //for user: ride accepted
      useEffect(() => {

        const handlers = {

            onAcceptRide: (data) => {

                toast.success('Ride accepted')

                setTimeout(() => {
                    navigate('/users/live-tracking')
                }, 500);

                setAcceptRideData(data)

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

    // for captain : feedback submitted
      useEffect(() => {

        const handlers = {

            onSubmitFeedback: (data) => {

                toast.success('feedback given by user')

                setCaptainData(data.captain)

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

    return (
        <SocketContext.Provider
            value={socket}
        >
            {children}
        </SocketContext.Provider>
    );
};