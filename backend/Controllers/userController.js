const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// =====================================================
// GET MY CONTACTS
// =====================================================

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "contacts",
      "fullName email profilePic bio isOnline"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user.contacts || []);
  } catch (error) {
    console.error("Get Contacts Error:", error);

    return res.status(500).json({
      message: "Unable to get contacts",
    });
  }
};

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      message: "Unable to get profile",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // UPDATE NAME
    // ==========================================

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    // ==========================================
    // UPDATE BIO
    // ==========================================

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "webchat/profile",
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

      user.profilePic = result.secure_url;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",

      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};

// =====================================================
// SEARCH MY CONTACTS BY NAME
// =====================================================

const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Search name is required",
      });
    }

    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Make sure contacts exists
    const contactIds = Array.isArray(currentUser.contacts)
      ? currentUser.contacts
      : [];

    const users = await User.find({
      // Search ONLY inside my contacts
      _id: {
        $in: contactIds,
      },

      // Search by name
      fullName: {
        $regex: name.trim(),
        $options: "i",
      },
    }).select(
      "fullName email profilePic bio isOnline"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error("Search Users Error:", error);

    return res.status(500).json({
      message: "Unable to search users",
    });
  }
};

// =====================================================
// ADD CONTACT USING GMAIL
// =====================================================

const addContact = async (req, res) => {
  try {
    const { email } = req.body;

    // ==========================================
    // CHECK EMAIL
    // ==========================================

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Gmail is required",
      });
    }

    const contactEmail = email.trim().toLowerCase();

    // ==========================================
    // FIND CURRENT USER
    // ==========================================

    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // ==========================================
    // MAKE SURE CONTACTS EXISTS
    // ==========================================

    if (!Array.isArray(currentUser.contacts)) {
      currentUser.contacts = [];
    }

    // ==========================================
    // FIND CONTACT USING GMAIL
    // ==========================================

    const userToAdd = await User.findOne({
      email: contactEmail,
    });

    if (!userToAdd) {
      return res.status(404).json({
        message: "No WebChat user found with this Gmail",
      });
    }

    // ==========================================
    // CANNOT ADD YOURSELF
    // ==========================================

    if (
      String(currentUser._id) ===
      String(userToAdd._id)
    ) {
      return res.status(400).json({
        message: "You cannot add yourself",
      });
    }

    // ==========================================
    // CHECK ALREADY ADDED
    // ==========================================

    const alreadyAdded = currentUser.contacts.some(
      (contactId) =>
        String(contactId) ===
        String(userToAdd._id)
    );

    if (alreadyAdded) {
      return res.status(400).json({
        message: "User already added",
      });
    }

    // ==========================================
    // ADD CONTACT
    // ==========================================

    currentUser.contacts.push(userToAdd._id);

    await currentUser.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      message: "Contact added successfully",

      user: {
        _id: userToAdd._id,
        fullName: userToAdd.fullName,
        email: userToAdd.email,
        profilePic: userToAdd.profilePic,
        bio: userToAdd.bio,
        isOnline: userToAdd.isOnline,
      },
    });
  } catch (error) {
    console.error("Add Contact Error:", error);

    return res.status(500).json({
      message: "Unable to add contact",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getUser,
  getProfile,
  updateProfile,
  searchUsers,
  addContact,
};