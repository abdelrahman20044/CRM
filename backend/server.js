const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const connectDB = require("./src/config/db");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./src/app");

connectDB().catch((err) => {
  console.log(err);
  // Don't process.exit here, it can crash Vercel's serverless environment
});

// Vercel handles the server listening implicitly. We only manually listen if not on Vercel production.
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    server.close(() => {
      console.log(err.name, err.message);
      process.exit(1);
    }); // Exit with failure
  });
}

// Export the Express API for Vercel
module.exports = app;
