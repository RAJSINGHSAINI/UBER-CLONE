import express from 'express'
import cors from 'cors'
import { userRouter } from './routes/user.router.js';
import cookieParser from 'cookie-parser';
import { captainRouter } from './routes/captain.router.js';
import { mapRouter } from './routes/map.router.js';
import { rideRouter } from './routes/ride.router.js';
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://192.168.0.112:5173",
    "https://192.168.0.112:5173",
    process.env.CLIENT_URL
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.get("/", (req, res) => {
    res.send("Server is running")
})

app.use('/users', userRouter)
app.use('/captains', captainRouter)
app.use('/maps', mapRouter)
app.use('/rides', rideRouter)
export default app