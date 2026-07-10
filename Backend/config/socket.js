import { Server } from 'socket.io'
import { userModel } from '../models/user.model.js'
import { captainModel } from '../models/captain.model.js'
import { rideModel } from '../models/ride.model.js'

let io = null

export function initializeSocket(httpServer) {
    if (io) return io

    const allowedOrigins = [
        "http://localhost:5173",
        process.env.CLIENT_URL
    ];

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id)
        // connection establishment
        socket.on('join', async (data) => {
            const { userId, userType } = data;
            try {
                if (userType === 'user') {
                    await userModel.findByIdAndUpdate({ _id: userId }, { socketId: socket.id })
                } else if (userType === 'captain') {
                    await captainModel.findByIdAndUpdate({ _id: userId }, { socketId: socket.id })
                } else {
                    throw new Error(`Unknown userType: ${userType}`)
                }
                console.log(`Socket join: ${userType} -> ${socket.id}`)
            } catch (error) {
                console.error('Socket join failed:', error)
            }
        })
        //  broadcasting live location
        socket.on('captain-live-location', async (payload) => {
            try {
                const { rideId, location, captainId } = payload || {};
                if (!rideId || !location || !captainId) return;

                const ride = await rideModel.findById(rideId);
                if (!ride || ride.captain?.toString() !== captainId) return;

                const user = await userModel.findById(ride.user);
                if (!user?.socketId) return;

                io.to(user.socketId).emit('captain-live-location', {
                    rideId,
                    location,
                    captainId
                });
            } catch (error) {
                console.error('Captain live-location broadcast failed:', error);
            }
        });

        socket.on('disconnect', async () => {
            console.log('Socket disconnected:', socket.id)
            try {
                await userModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: '' } }
                )
                await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: '' } }
                )
            } catch (error) {
                console.error('Socket disconnect cleanup failed:', error)
            }
        })
    })
    console.log('Socket.IO initialized');



    return io
}

export function sendMessageToSocketId(socketId, message) {
    if (!io) {
        throw new Error('Socket not initialized. Call initializeSocket(server) first.')
    }

    const target = io.sockets.sockets.get(socketId)
    if (target) {
        target.emit(message.event, message)
        console.log("message send to ", socketId, message.event);
        return true
    }
    console.log("message failed ", socketId);
    return false
}