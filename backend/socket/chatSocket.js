const jwt = require("jsonwebtoken");

const chatSocket = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // =========================
    // USER ONLINE
    // =========================
    socket.on("user-online", (userId) => {
      if (!userId) return;

      onlineUsers.set(String(userId), socket.id);

      socket.userId = String(userId);

      console.log("User online:", userId);
    });

    // =========================
    // SEND MESSAGE
    // =========================
    socket.on("send-message", (message) => {
      if (!message) return;

      const receiverId =
        message.receiverId?._id ||
        message.receiverId;

      if (!receiverId) return;

      const receiverSocket = onlineUsers.get(
        String(receiverId)
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "new-message",
          message
        );
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(String(socket.userId));

        console.log(
          "User offline:",
          socket.userId
        );
      }

      console.log(
        "Socket disconnected:",
        socket.id
      );
    });
  });
};

module.exports = chatSocket;