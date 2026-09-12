

const express = require("express");

const {
  getUser,
  getProfile,
  updateProfile,
  searchUsers,
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




module.exports = router;