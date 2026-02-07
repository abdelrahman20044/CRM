const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
} = require("./../controllers/authController");
const protect = require("./../middlewares/auth");
router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.get("/me", protect, me);

module.exports = router;
