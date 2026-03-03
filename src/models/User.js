const mongoose = require("mongoose");
//const { validate } = require("./Company");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "User must belong to a company"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "PasswordConfirm is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "sales_rep"],
      default: "sales_rep",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false, 
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});
userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword,
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (jwtExpire) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return jwtExpire < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.pre(/^find/, function () {
  this.find({ isActive: true }); // find only true ones
});
const User = mongoose.model("User", userSchema);
module.exports = User;
