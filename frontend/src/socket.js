import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

console.log("🔗 SOCKET URL:", SOCKET_URL);

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],

  reconnection: true,

  reconnectionAttempts: Infinity,

  reconnectionDelay: 1000,

  reconnectionDelayMax: 5000,

  timeout: 20000,
});

// ==========================================
// SOCKET CONNECTED
// ==========================================

socket.on("connect", () => {
  console.log(
    "✅ SOCKET CONNECTED:",
    socket.id
  );
});

// ==========================================
// SOCKET DISCONNECTED
// ==========================================

socket.on("disconnect", (reason) => {
  console.log(
    "❌ SOCKET DISCONNECTED:",
    reason
  );
});

// ==========================================
// SOCKET ERROR
// ==========================================

socket.on("connect_error", (error) => {
  console.log(
    "❌ SOCKET CONNECTION ERROR:",
    error.message
  );
});

// ==========================================
// RECONNECT ATTEMPT
// ==========================================

socket.io.on("reconnect_attempt", (attempt) => {
  console.log(
    "🔄 SOCKET RECONNECT ATTEMPT:",
    attempt
  );
});

// ==========================================
// RECONNECTED
// ==========================================

socket.io.on("reconnect", (attempt) => {
  console.log(
    "🟢 SOCKET RECONNECTED:",
    attempt,
    socket.id
  );
});

// ==========================================
// RECONNECT ERROR
// ==========================================

socket.io.on("reconnect_error", (error) => {
  console.log(
    "❌ SOCKET RECONNECT ERROR:",
    error.message
  );
});

// ==========================================
// RECONNECT FAILED
// ==========================================

socket.io.on("reconnect_failed", () => {
  console.log(
    "❌ SOCKET RECONNECT FAILED"
  );
});

export default socket;