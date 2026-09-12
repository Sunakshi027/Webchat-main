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

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver is required",
      });
    }

    if (!text && !req.file) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // Check receiver
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    let imageUrl = "";

    // =================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // =================================================

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
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

      const result = await uploadToCloudinary();

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

    const populatedMessage = await Message.findById(
      message._id
    )
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    // =================================================
    // ADD SOCKET IDs
    // =================================================

    const finalMessage = {
      ...populatedMessage.toObject(),

      senderId: String(req.userId),

      receiverId: String(receiverId),
    };

    console.log("📨 MESSAGE CREATED:", finalMessage);

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      message: finalMessage,
    });

  } catch (error) {
    console.error("Send Message Error:", error);

    res.status(500).json({
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
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    res.status(200).json(messages);

  } catch (error) {
    console.error("Get Messages Error:", error);

    res.status(500).json({
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

    res.status(200).json({
      message: "Messages marked as seen",
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Mark Seen Error:", error);

    res.status(500).json({
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

    const count = await Message.countDocuments({
      sender: userId,
      receiver: req.userId,
      seen: false,
    });

    res.status(200).json({
      unreadCount: count,
    });

  } catch (error) {
    console.error("Unread Count Error:", error);

    res.status(500).json({
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

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.isFavourite = !message.isFavourite;

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    res.status(200).json({
      message: "Favourite updated successfully",
      data: updatedMessage,
    });

  } catch (error) {
    console.error("Favourite Error:", error);

    res.status(500).json({
      message: "Failed to update favourite",
      error: error.message,
    });
  }
};


// =====================================================
// GET FAVOURITE MESSAGES
// =====================================================

const getFavouriteMessages = async (req, res) => {
  try {
    const messages = await Message.find({
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
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    res.status(200).json(messages);

  } catch (error) {
    console.error("Get Favourite Error:", error);

    res.status(500).json({
      message: "Unable to get favourite messages",
    });
  }
};


// =====================================================
// DELETE MESSAGE
// =====================================================

const deletMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only delete your own message",
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).json({
      message: "Failed to delete message",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE MESSAGE
// =====================================================

const updateMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only update your own message",
      });
    }

    message.text = text.trim();

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName profilePic")
      .populate("receiver", "fullName profilePic");

    res.status(200).json({
      message: "Message updated successfully",
      data: updatedMessage,
    });

  } catch (error) {
    console.error("Update Error:", error);

    res.status(500).json({
      message: "Failed to update message",
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