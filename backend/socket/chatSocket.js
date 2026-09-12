const chatSocket = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("user-online", (userId) => {
      onlineUsers.set(String(userId), socket.id);

      socket.userId = String(userId);

      io.emit(
        "online-users",
        Array.from(onlineUsers.keys())
      );

      console.log("🟢 USER ONLINE:", userId);
    });

    // SEND MESSAGE
    socket.on("send-message", (message) => {
      const receiverId =
        message.receiverId?._id ||
        message.receiverId ||
        message.receiver?._id ||
        message.receiver;

      const receiverSocket =
        onlineUsers.get(String(receiverId));

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "new-message",
          message
        );

        // DELIVERED
        io.to(socket.id).emit(
          "message-delivered",
          {
            messageId: message._id,
          }
        );

        console.log("✅ Delivered");
      }
    });

    // SEEN
    socket.on(
      "message-seen",
      ({ messageId, senderId }) => {
        const senderSocket =
          onlineUsers.get(String(senderId));

        if (senderSocket) {
          io.to(senderSocket).emit(
            "message-seen-update",
            {
              messageId,
            }
          );
        }
      }
    );

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(
          String(socket.userId)
        );

        io.emit(
          "online-users",
          Array.from(
            onlineUsers.keys()
          )
        );
      }
    });
  });
};

module.exports = chatSocket;