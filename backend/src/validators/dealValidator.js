const { z } = require("zod");

const createDealSchema = z.object({
  title: z
    .string()
    .min(1, "Deal title is required")
    .max(120, "Deal title must be at most 120 characters")
    .trim(),
  value: z.number().min(0, "Deal value cannot be negative").default(0),
  currency: z.string().max(3).toUpperCase().trim().default("EGP"),
  stage: z
    .enum(["lead", "qualified", "proposal", "won", "lost"])
    .default("lead"),
  expectedCloseDate: z.coerce.date().optional(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .trim()
    .optional(),
  contact: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid contact ID format"),
});

// For PATCH — same fields as create, minus contact & stage (those have dedicated endpoints)
const updateDealSchema = createDealSchema
  .omit({ contact: true, stage: true })
  .partial();

const changeDealStageSchema = z.object({
  stage: z.enum(["lead", "qualified", "proposal", "won", "lost"], {
    message: "Invalid stage value",
  }),
});

const assignDealSchema = z.object({
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  createDealSchema,
  updateDealSchema,
  changeDealStageSchema,
  assignDealSchema,
};
