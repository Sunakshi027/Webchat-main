import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL,
  {
    transports: ["polling", "websocket"],

    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000,
  }
);

socket.on("connect", () => {
  console.log(
    "✅ SOCKET CONNECTED:",
    socket.id
  );
});

socket.on("disconnect", (reason) => {
  console.log(
    "❌ SOCKET DISCONNECTED:",
    reason
  );
});

socket.on("connect_error", (error) => {
  console.log(
    "❌ SOCKET CONNECTION ERROR:",
    error.message
  );
});

export default socket;