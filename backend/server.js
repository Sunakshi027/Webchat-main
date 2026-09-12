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


connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "WebChat backend is running",
  });
});


app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);



chatSocket(io);



const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});