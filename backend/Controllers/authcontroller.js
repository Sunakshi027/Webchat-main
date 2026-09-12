const bcrypt = require("bcryptjs");
const User = require("../models/user");
const generateToken = require("../Utils/generatetocken");



const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            profilePic,
            password
        } = req.body;

        // Check fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields",
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            fullName,
            email,
            profilePic,
            password: hashedPassword,
        });


  const token = generateToken(user._id);

return res.status(201).json({
    message: "Registration Successful",
    token,
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
        console.error("Register Error:", error);

        return res.status(500).json({
            message: "Server Error",
        });
    }
};


/* const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Register API working",
      data: {
        fullName,
        email,
        password
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
*/
// ================= LOGIN =================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter your email and password",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email and password",
            });
        }

        // Set online
        user.isOnline = true;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login Successful",
            token,
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
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Server Error",
        });
    }
};


// ================= EXPORT =================

module.exports = {
    register,
    login,
};
























