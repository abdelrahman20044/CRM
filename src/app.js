const express = require("express");

const app = express();

// Body parser
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "CRM SaaS API is running!" });
});

module.exports = app;