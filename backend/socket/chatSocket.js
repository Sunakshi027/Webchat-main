const chatSocket = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(
      "🔌 Socket connected:",
      socket.id
    );

    // ==============================
    // USER ONLINE
    // ==============================

    socket.on("user-online", (userId) => {
      if (!userId) return;

      onlineUsers.set(
        String(userId),
        socket.id
      );

      socket.userId = String(userId);

      io.emit(
        "online-users",
        Array.from(onlineUsers.keys())
      );

      console.log(
        "🟢 USER ONLINE:",
        userId
      );
    });

    // ==============================
    // SEND MESSAGE
    // ==============================

    socket.on(
      "send-message",
      (message) => {
        if (!message) return;

        const receiverId =
          message.receiverId?._id ||
          message.receiverId ||
          message.receiver?._id ||
          message.receiver;

        const senderId =
          message.senderId?._id ||
          message.senderId ||
          message.sender?._id ||
          message.sender;

        if (!receiverId) {
          console.log(
            "❌ Receiver ID missing"
          );
          return;
        }

        const receiverSocket =
          onlineUsers.get(
            String(receiverId)
          );

        if (receiverSocket) {

          // ==========================
          // NEW MESSAGE
          // ==========================

          io.to(receiverSocket).emit(
            "new-message",
            message
          );

          // ==========================
          // AUTO ADD CONTACT
          // ==========================

          io.to(receiverSocket).emit(
            "contact-added",
            {
              user: {
                _id: senderId,

                fullName:
                  message.sender?.fullName ||
                  "",

                email:
                  message.sender?.email ||
                  "",

                profilePic:
                  message.sender?.profilePic ||
                  "",

                bio:
                  message.sender?.bio ||
                  "Hey! I am Using WebChat",

                isOnline: true,
              },
            }
          );

          // ==========================
          // DELIVERED
          // ==========================

          io.to(socket.id).emit(
            "message-delivered",
            {
              messageId:
                message._id,
            }
          );

          console.log(
            "✅ Message delivered"
          );

          console.log(
            "👤 Contact added in receiver sidebar"
          );

        } else {

          console.log(
            "⚠️ Receiver is offline"
          );

        }
      }
    );

    // ==============================
    // MESSAGE SEEN
    // ==============================

    socket.on(
      "message-seen",
      ({ messageId, senderId }) => {

        if (
          !messageId ||
          !senderId
        ) {
          return;
        }

        const senderSocket =
          onlineUsers.get(
            String(senderId)
          );

        if (senderSocket) {

          io.to(senderSocket).emit(
            "message-seen-update",
            {
              messageId,
            }
          );

          console.log(
            "👁️ Message seen:",
            messageId
          );
        }
      }
    );

    // ==============================
    // DISCONNECT
    // ==============================

    socket.on(
      "disconnect",
      () => {

        if (socket.userId) {

          const userId =
            String(socket.userId);

          // Remove only this user's socket
          if (
            onlineUsers.get(userId) ===
            socket.id
          ) {
            onlineUsers.delete(
              userId
            );
          }

          io.emit(
            "online-users",
            Array.from(
              onlineUsers.keys()
            )
          );

          console.log(
            "🔴 USER OFFLINE:",
            userId
          );
        }

        console.log(
          "❌ Socket disconnected:",
          socket.id
        );
      }
    );
  });
};

module.exports = chatSocket;