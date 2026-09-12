const express = require("express");

const {
  sendMessage,
  getMessage,
  markMessageSeen,
  getUnreadCount,
  toggleFavourite,
  getFavouriteMessages,
  deletMessage,
  updateMessage,
} = require("../Controllers/messageController");

const authMiddleware = require("../middleware/authMiddleeware");
const upload = require("../middleware/uploademiddleware");

const router = express.Router();


// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  sendMessage
);


// ==========================================
// GET MESSAGES
// ==========================================

router.get(
  "/:userId",
  authMiddleware,
  getMessage
);


// ==========================================
// MARK MESSAGES AS READ / SEEN
// ==========================================

router.put(
  "/seen/:userId",
  authMiddleware,
  markMessageSeen
);


// ==========================================
// GET UNREAD COUNT
// ==========================================

router.get(
  "/unread/:userId",
  authMiddleware,
  getUnreadCount
);


// ==========================================
// FAVOURITE / UNFAVOURITE MESSAGE
// ==========================================

router.put(
  "/favourite/:id",
  authMiddleware,
  toggleFavourite
);


// ==========================================
// GET FAVOURITE MESSAGES
// ==========================================

router.get(
  "/favourite/all",
  authMiddleware,
  getFavouriteMessages
);


// ==========================================
// UPDATE MESSAGE
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  updateMessage
);


// ==========================================
// DELETE MESSAGE
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deletMessage
);


module.exports = router;