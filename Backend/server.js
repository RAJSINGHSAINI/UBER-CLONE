import http from 'http';
import app from './app.js';
import 'dotenv/config.js';
import { connectDB } from './config/connectDB.js';
import { initializeSocket } from './config/socket.js';
connectDB()

const server = http.createServer(app);

initializeSocket(server)

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});