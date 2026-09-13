const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_URL}/WebChat`
    );

    console.log("MongoDB connected successfully");
    console.log("Database: WebChat");
    console.log("Host:", connection.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;