const mongoose = require("mongoose");
const validator = require("validator");
const contactSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ["website", "facebook", "referral", "cold_call", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost"],
      default: "new",
    },

    notes: { type: String },
  },
  { timestamps: true },
);

// unique per company (only when email exists)
contactSchema.index({ company: 1, email: 1 }, { unique: true, sparse: true });

contactSchema.index({ company: 1, createdAt: -1 });
contactSchema.index({ company: 1, status: 1 });

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
