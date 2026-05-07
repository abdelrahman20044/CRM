const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.env.NODE_ENV = "test"; // ← so app.js skips rate limiter, morgan, etc.
dotenv.config({ path: "./config.env" });

// Connect to a SEPARATE test database
const connectTestDB = async () => {
  const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD,
  );
  const testDB = DB.replace("mongodb.net/", "mongodb.net/crm-test");
  await mongoose.connect(testDB);
};

// Drop test database and disconnect
const disconnectTestDB = async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, disconnectTestDB };

