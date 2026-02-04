const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgetPassword,
  resetPassword,
  me,
} = require("./../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token").post(resetPassword);
router.get("/me").post(me);

module.exports = router;
