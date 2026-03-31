import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.error("Please verify:");
    console.error("1. MongoDB Atlas credentials are correct");
    console.error("2. IP address is whitelisted in MongoDB Atlas");
    console.error("3. Connection string includes the database name");
  }
};

export default connectDB;
