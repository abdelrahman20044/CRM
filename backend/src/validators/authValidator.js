const { z } = require("zod");

const registerSchema = z
  .object({
    // Company fields
    companyName: z.string().min(1, "Company name is required").trim(),
    companyAddress: z.string().min(1, "Company address is required").trim(),
    companyEmail: z
      .string()
      .email("Please provide a valid company email")
      .toLowerCase()
      .trim(),
    companyPhone: z.string().min(1, "Company phone is required").trim(),

    // User fields
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Please provide a valid email").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string().min(1, "Password confirm is required"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords are not the same!",
    path: ["passwordConfirm"],
  });

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email").toLowerCase().trim(),
  password: z.string().min(1, "Please provide a password"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email").toLowerCase().trim(),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string().min(1, "Password confirm is required"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords are not the same!",
    path: ["passwordConfirm"],
  });

const updatePasswordSchema = z
  .object({
    passwordCurrent: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string().min(1, "Password confirm is required"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords are not the same!",
    path: ["passwordConfirm"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
};
