const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "call",
        "email",
        "meeting",
        "note",
        "task_created",
        "task_completed",
        "deal_created",
        "deal_stage_changed",
        "contact_created",
        "contact_status_changed",
      ],
      required: [true, "Activity type is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
      maxlength: [200, "Activity title must be at most 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
    },

    relatedTo: {
      type: String,
      enum: ["Contact", "Deal", "Task", null],
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedTo",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

activitySchema.index({ company: 1, createdAt: -1 });
activitySchema.index({ company: 1, type: 1, createdAt: -1 });
activitySchema.index({ company: 1, relatedTo: 1, relatedId: 1 });

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
