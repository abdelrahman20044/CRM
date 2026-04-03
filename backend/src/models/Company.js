const mongoose = require("mongoose");
const validator = require("validator");
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Company phone number is required"],
      trim: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "pro"],
      default: "free",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);
companySchema.pre(/^find/, function () {
  this.find({ isActive: true });
});
const Company = mongoose.model("Company", companySchema);
module.exports = Company;
