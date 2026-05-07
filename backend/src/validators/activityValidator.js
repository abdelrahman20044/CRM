const { z } = require("zod");

const createActivitySchema = z.object({
  type: z.enum(
    [
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
    { message: "Invalid activity type" },
  ),
  title: z
    .string()
    .min(1, "Activity title is required")
    .max(200, "Activity title must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .trim()
    .optional(),
  relatedTo: z.enum(["Contact", "Deal", "Task"]).optional(),
  relatedId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid related ID format")
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

// For PATCH — all fields become optional
const updateActivitySchema = createActivitySchema.partial();

module.exports = {
  createActivitySchema,
  updateActivitySchema,
};
