const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const DB = process.env.DATABASE.replace("<db_password>", process.env.DATABASE_PASSWORD);

  try {
    const db = await mongoose.connect(DB);
    isConnected = db.connections[0].readyState;
    console.log("DB connection successful");
  } catch (err) {
    console.log("DB Connection Error:", err);
  }
};

module.exports = connectDB;
