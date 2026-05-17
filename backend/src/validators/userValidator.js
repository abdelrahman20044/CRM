const { z } = require("zod");

const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Please provide a valid email").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string().min(1, "Password confirm is required"),
    role: z.enum(["admin", "manager", "sales_rep"]).default("sales_rep"),
    // 'owner' is excluded cannot be created using this route
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords are not the same!",
    path: ["passwordConfirm"],
  });

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  email: z.string().email("Please provide a valid email").toLowerCase().trim().optional(),
  role: z.enum(["admin", "manager", "sales_rep"]).optional(),
  // 'owner' is excluded
  // password/passwordConfirm are excluded use updatePassword
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
