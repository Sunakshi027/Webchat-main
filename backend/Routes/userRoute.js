const express = require("express");

const {
  getUser,
  getProfile,
  updateProfile,
  searchUsers,
  addContact,
} = require("../Controllers/userController");

const authMiddleware = require("../middleware/authMiddleeware");
const upload = require("../middleware/uploademiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getUser
);

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePic"),
  updateProfile
);

router.get(
  "/search",
  authMiddleware,
  searchUsers
);

router.post(
  "/add-contact",
  authMiddleware,
  addContact
);

module.exports = router;