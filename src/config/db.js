const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD,
);
const connectDB = mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});
module.exports = connectDB;
