const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                message: "No Token Provided",
            });
        }

        // Get token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid Token",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save user ID
        req.userId = decoded.userId;

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Auth Error:", error);

        return res.status(401).json({
            message: "Unauthorized",
        });
    }
};

module.exports = authMiddleware;