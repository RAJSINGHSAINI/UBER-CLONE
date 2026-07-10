import express from 'express'
import cors from 'cors'
import { userRouter } from './routes/user.router.js';
import cookieParser from 'cookie-parser';
import { captainRouter } from './routes/captain.router.js';
import { mapRouter } from './routes/map.router.js';
import { rideRouter } from './routes/ride.router.js';
const app = express();


app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.get("/", (req, res) => {
    res.send("Server is running")
})

app.use('/users', userRouter)
app.use('/captains', captainRouter)
app.use('/maps', mapRouter)
app.use('/rides',rideRouter)
export default app