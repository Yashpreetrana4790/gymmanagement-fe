import { z } from "zod";

// ─── Validation messages ──────────────────────────────────────────────────────

export const MSG = {
  // Common
  required:        "This field is required.",
  // Email
  emailRequired:   "Email address is required.",
  emailInvalid:    "Please enter a valid email address.",
  // Password
  passwordRequired: "Password is required.",
  passwordMin:     "Password must be at least 6 characters.",
  passwordMax:     "Password must be less than 72 characters.",
  // Name
  firstNameRequired: "First name is required.",
  firstNameMin:    "First name must be at least 2 characters.",
  lastNameMin:     "Last name must be at least 2 characters.",
  // Phone
  phoneInvalid:    "Enter a valid phone number (digits, spaces, +, - allowed).",
  // Confirm password
  passwordMismatch: "Passwords do not match.",
} as const;

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: MSG.emailRequired })
    .min(1, MSG.emailRequired)
    .email(MSG.emailInvalid),
  password: z
    .string({ required_error: MSG.passwordRequired })
    .min(1, MSG.passwordRequired)
    .min(6, MSG.passwordMin)
    .max(72, MSG.passwordMax),
});

export const signupSchema = z
  .object({
    firstName: z
      .string({ required_error: MSG.firstNameRequired })
      .min(1, MSG.firstNameRequired)
      .min(2, MSG.firstNameMin),
    lastName: z.string().min(2, MSG.lastNameMin).optional().or(z.literal("")),
    email: z
      .string({ required_error: MSG.emailRequired })
      .min(1, MSG.emailRequired)
      .email(MSG.emailInvalid),
    phone: z
      .string()
      .regex(/^[+\d\s\-().]{7,15}$/, MSG.phoneInvalid)
      .optional()
      .or(z.literal("")),
    password: z
      .string({ required_error: MSG.passwordRequired })
      .min(1, MSG.passwordRequired)
      .min(6, MSG.passwordMin)
      .max(72, MSG.passwordMax),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: MSG.passwordMismatch,
    path: ["confirmPassword"],
  });

export const gymProfileSchema = z.object({
  gymName:  z.string().min(1, "Gym name is required.").min(2, "Gym name must be at least 2 characters."),
  strength: z.coerce.number({ invalid_type_error: "Capacity must be a number." }).int().min(1, "Capacity must be at least 1."),
  city:     z.string().min(1, "City is required.").min(2, "City must be at least 2 characters."),
  state:    z.string().optional(),
  address:  z.string().optional(),
  pincode:  z
    .string()
    .regex(/^\d{4,10}$/, "Enter a valid pincode.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[+\d\s\-().]{7,15}$/, MSG.phoneInvalid)
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email(MSG.emailInvalid)
    .optional()
    .or(z.literal("")),
});

// ─── Helper — flatten ZodError into a flat field→message map ─────────────────

export type FieldErrors = Record<string, string>;

export function parseErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
