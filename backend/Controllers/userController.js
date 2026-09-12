const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Get All Users
const getUser = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.userId,
      },
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to get users",
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio  } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (bio) {
      user.bio = bio;
    }

    // Upload Profile Image
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

    res.json({
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
    console.error(error);

    res.status(500).json({
      message: "Unable to update profile",
    });
  }
};


const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name?.trim()) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      fullName: {
        $regex: name.trim(),
        $options: "i",
      },
    })
      .select("-password")
      .sort({ fullName: 1 });

    res.status(200).json(users);
  } catch (error) {
  console.error("SEARCH USER ERROR:", error);

  return res.status(500).json({
    message: "failed to search users",
    error: error.message,
  });
}
};
module.exports = {
  getUser,
  getProfile,
  updateProfile,
  searchUsers,
};




