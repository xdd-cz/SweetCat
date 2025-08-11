const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("db connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // crash to restart
  }
};

module.exports = dbConnect;
