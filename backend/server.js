const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/connectDB");
const authRoutes = require("./Routes/authroute");
const userRoutes = require("./Routes/userRoute");
const messageRoutes = require("./Routes/messageroute");
const chatSocket = require("./socket/chatSocket");

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://webchat-main-1.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// CORS
app.use(
  cors({
    origin: "https://webchat-main-1.onrender.com",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "WebChat backend is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/messages", messageRoutes);

// Socket connection
chatSocket(io);

// Server Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});