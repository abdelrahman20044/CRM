const { z } = require("zod");

const createContactSchema = z.object({
  name: z.string().min(1, "Contact name is required").trim(),
  email: z
    .string()
    .email("Please provide a valid email")
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string().trim().optional(),
  source: z
    .enum(["website", "facebook", "referral", "cold_call", "other"])
    .default("other"),
  status: z.enum(["new", "contacted", "qualified", "lost"]).default("new"),
  notes: z.string().optional(),
});

// For PATCH — all fields become optional
const updateContactSchema = createContactSchema.partial();

const assignContactSchema = z.object({
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  assignContactSchema,
};
