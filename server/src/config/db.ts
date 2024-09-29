import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB is already connected.");
    return;
  }

  try {
    await mongoose.connect(
      process.env.DB_URI ||
        "mongodb://localhost:27017/cloudcampus?replicaSet=rs0"
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1); // Exit if connection fails
  }
};

export default connectDB;
