const Message = require("../models/message");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// =====================================================
// SEND MESSAGE
// =====================================================

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // =================================================
    // CHECK RECEIVER ID
    // =================================================

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver is required",
      });
    }

    // =================================================
    // CHECK MESSAGE CONTENT
    // =================================================

    if (!text && !req.file) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // =================================================
    // CHECK SENDER
    // =================================================

    const sender = await User.findById(req.userId);

    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }

    // =================================================
    // CHECK RECEIVER
    // =================================================

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // =================================================
    // AUTO ADD SENDER TO RECEIVER CONTACTS
    // =================================================

    if (!Array.isArray(receiver.contacts)) {
      receiver.contacts = [];
    }

    const alreadyContact = receiver.contacts.some(
      (contactId) =>
        String(contactId) === String(sender._id)
    );

    if (!alreadyContact) {
      receiver.contacts.push(sender._id);

      await receiver.save();

      console.log(
        "👤 Sender automatically added to receiver contacts:",
        sender.email
      );
    }

    // =================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // =================================================

    let imageUrl = "";

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "webchat/messages",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);
        });
      };

      const result =
        await uploadToCloudinary();

      imageUrl = result.secure_url;
    }

    // =================================================
    // CREATE MESSAGE
    // =================================================

    const message = await Message.create({
      sender: req.userId,
      receiver: receiverId,
      text: text || "",
      image: imageUrl,
      seen: false,
      isFavourite: false,
    });

    // =================================================
    // POPULATE USER DATA
    // =================================================

    const populatedMessage =
      await Message.findById(message._id)
        .populate(
          "sender",
          "fullName profilePic"
        )
        .populate(
          "receiver",
          "fullName profilePic"
        );

    // =================================================
    // FINAL MESSAGE
    // =================================================

    const finalMessage = {
      ...populatedMessage.toObject(),

      senderId: String(req.userId),

      receiverId: String(receiverId),
    };

    console.log(
      "📨 MESSAGE CREATED:",
      finalMessage
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      message: finalMessage,
    });

  } catch (error) {
    console.error(
      "Send Message Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to send message",
    });
  }
};

// =====================================================
// GET MESSAGES
// =====================================================

const getMessage = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: req.userId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.userId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate(
        "sender",
        "fullName profilePic"
      )
      .populate(
        "receiver",
        "fullName profilePic"
      );

    return res.status(200).json(messages);

  } catch (error) {
    console.error(
      "Get Messages Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to get messages",
    });
  }
};

// =====================================================
// MARK MESSAGES AS SEEN / READ
// =====================================================

const markMessageSeen = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: req.userId,
        seen: false,
      },
      {
        $set: {
          seen: true,
        },
      }
    );

    return res.status(200).json({
      message: "Messages marked as seen",
      modifiedCount:
        result.modifiedCount,
    });

  } catch (error) {
    console.error(
      "Mark Seen Error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET UNREAD MESSAGE COUNT
// =====================================================

const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count =
      await Message.countDocuments({
        sender: userId,
        receiver: req.userId,
        seen: false,
      });

    return res.status(200).json({
      unreadCount: count,
    });

  } catch (error) {
    console.error(
      "Unread Count Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to get unread count",
    });
  }
};

// =====================================================
// TOGGLE FAVOURITE
// =====================================================

const toggleFavourite = async (req, res) => {
  try {
    const { id } = req.params;

    const message =
      await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.isFavourite =
      !message.isFavourite;

    await message.save();

    const updatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "fullName profilePic"
        )
        .populate(
          "receiver",
          "fullName profilePic"
        );

    return res.status(200).json({
      message:
        "Favourite updated successfully",
      data: updatedMessage,
    });

  } catch (error) {
    console.error(
      "Favourite Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update favourite",
      error: error.message,
    });
  }
};

// =====================================================
// GET FAVOURITE MESSAGES
// =====================================================

const getFavouriteMessages = async (
  req,
  res
) => {
  try {
    const messages =
      await Message.find({
        $or: [
          {
            sender: req.userId,
          },
          {
            receiver: req.userId,
          },
        ],

        isFavourite: true,
      })
        .sort({ createdAt: -1 })
        .populate(
          "sender",
          "fullName profilePic"
        )
        .populate(
          "receiver",
          "fullName profilePic"
        );

    return res.status(200).json(
      messages
    );

  } catch (error) {
    console.error(
      "Get Favourite Error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to get favourite messages",
    });
  }
};

// =====================================================
// DELETE MESSAGE
// =====================================================

const deletMessage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const message =
      await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (
      message.sender.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own message",
      });
    }

    await Message.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Message deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete message",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MESSAGE
// =====================================================

const updateMessage = async (
  req,
  res
) => {
  try {
    const { text } = req.body;
    const { id } = req.params;

    // =================================================
    // CHECK TEXT
    // =================================================

    if (!text || !text.trim()) {
      return res.status(400).json({
        message:
          "Message text is required",
      });
    }

    // =================================================
    // FIND MESSAGE
    // =================================================

    const message =
      await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // =================================================
    // ONLY SENDER CAN UPDATE
    // =================================================

    if (
      message.sender.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only update your own message",
      });
    }

    // =================================================
    // UPDATE TEXT
    // =================================================

    message.text =
      text.trim();

    await message.save();

    // =================================================
    // GET UPDATED MESSAGE
    // =================================================

    const updatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "fullName profilePic"
        )
        .populate(
          "receiver",
          "fullName profilePic"
        );

    return res.status(200).json({
      message:
        "Message updated successfully",
      data: updatedMessage,
    });

  } catch (error) {
    console.error(
      "Update Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update message",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  sendMessage,
  getMessage,
  markMessageSeen,
  getUnreadCount,
  toggleFavourite,
  getFavouriteMessages,
  deletMessage,
  updateMessage,
};