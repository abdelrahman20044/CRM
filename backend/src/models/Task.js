const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title must be at most 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "canceled"],
      default: "pending",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    relatedTo: {
      type: String,
      enum: ["Contact", "Deal", null],
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedTo",
    },

    completedAt: Date,
  },
  { timestamps: true },
);

taskSchema.index({ company: 1, assignedTo: 1, status: 1 });
taskSchema.index({ company: 1, dueDate: 1 });

taskSchema.pre("save", function () {
  if (this.isModified("status") && this.status === "completed") {
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
});

module.exports = mongoose.model("Task", taskSchema);
