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

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://webchat-main-1.onrender.com",
];

// HTTP server
const server = http.createServer(app);

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Body parser
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "WebChat backend is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Socket
chatSocket(io);

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});