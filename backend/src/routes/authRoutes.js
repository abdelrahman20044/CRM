const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  me,
} = require("./../controllers/authController");
const { protect } = require("./../middlewares/auth");
const validate = require("./../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require("./../validators/authValidator");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);
router.patch("/resetPassword/:token", validate(resetPasswordSchema), resetPassword);
router.get("/me", protect, me);
router.patch("/updatePassword", protect, validate(updatePasswordSchema), updatePassword);

module.exports = router;
