const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Deal must belong to a company"],
      index: true,
    },

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: [true, "Deal must be linked to a contact"],
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Deal must have an owner"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: [120, "Deal title must be at most 120 characters"],
    },

    value: {
      type: Number,
      min: [0, "Deal value cannot be negative"],
      default: 0,
    },

    currency: {
      type: String,
      default: "EGP",
      uppercase: true,
      trim: true,
      maxlength: 3,
    },

    stage: {
      type: String,
      enum: ["lead", "qualified", "proposal", "won", "lost"],
      default: "lead",
      index: true,
    },

    expectedCloseDate: {
      type: Date,
    },

    closedAt: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes must be at most 2000 characters"],
    },
  },
  { timestamps: true },
);

dealSchema.index({ company: 1, createdAt: -1 });
dealSchema.index({ company: 1, stage: 1 });
dealSchema.index({ company: 1, assignedTo: 1, createdAt: -1 });

dealSchema.pre("save", function (next) {
  if (
    this.isModified("stage") &&
    (this.stage === "won" || this.stage === "lost")
  ) {
    if (!this.closedAt) this.closedAt = new Date();
  }
  next();
});

const Deal = mongoose.model("Deal", dealSchema);
module.exports = Deal;
