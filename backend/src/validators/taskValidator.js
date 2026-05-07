const { z } = require("zod");

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .trim()
    .optional(),
  status: z
    .enum(["pending", "in-progress", "completed", "canceled"])
    .default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.coerce.date().optional(),
  relatedTo: z.enum(["Contact", "Deal"]).optional(),
  relatedId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid related ID format")
    .optional(),
});

// For PATCH — all fields become optional
const updateTaskSchema = createTaskSchema.partial();

const changeTaskStatusSchema = z.object({
  status: z.enum(["pending", "in-progress", "completed", "canceled"], {
    message: "Invalid status value",
  }),
});

const assignTaskSchema = z.object({
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  changeTaskStatusSchema,
  assignTaskSchema,
};
