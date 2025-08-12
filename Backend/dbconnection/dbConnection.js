//dbconnection/dbConnection.js

const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.MONGO_URL; 


const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
