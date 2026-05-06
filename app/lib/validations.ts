// Mirrors src/lib/validations.js in the backend exactly.
// Keep both files in sync whenever rules change.
import { z } from "zod";

// ─── Reusable field fragments ─────────────────────────────────────────────────

const phone = z
  .string()
  .regex(/^[+\d\s\-(). ]{7,15}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal(""));

const optionalEmail = z
  .string()
  .email("Invalid email address.")
  .optional()
  .or(z.literal(""));

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().min(1, "Email is required.").email("Invalid email address."),
  password: z.string().min(1, "Password is required.").min(6, "At least 6 characters.").max(72),
});

export const signupSchema = z
  .object({
    firstName:       z.string().min(1, "First name is required.").min(2, "Must be at least 2 characters."),
    lastName:        z.string().min(2, "Must be at least 2 characters.").optional().or(z.literal("")),
    email:           z.string().min(1, "Email is required.").email("Invalid email address."),
    phone,
    password:        z.string().min(1, "Password is required.").min(6, "At least 6 characters.").max(72),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path:    ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password:        z.string().min(6, "At least 6 characters.").max(72),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path:    ["confirmPassword"],
  });

export const gymProfileSchema = z.object({
  gymName:  z.string().min(1, "Gym name is required.").min(2, "At least 2 characters."),
  strength: z.coerce.number({ invalid_type_error: "Must be a number." }).int().min(1, "At least 1."),
  city:     z.string().min(1, "City is required.").min(2, "At least 2 characters."),
  state:    z.string().optional(),
  address:  z.string().optional(),
  pincode:  z.string().regex(/^\d{4,10}$/, "Enter a valid pincode.").optional().or(z.literal("")),
  phone,
  email:    optionalEmail,
});

// ─── Plan ─────────────────────────────────────────────────────────────────────

export const planSchema = z.object({
  name: z
    .string()
    .min(1, "Plan name is required.")
    .min(2, "Must be at least 2 characters.")
    .max(100, "Too long."),
  durationDays: z.coerce
    .number({ invalid_type_error: "Duration must be a number." })
    .int("Must be a whole number.")
    .min(1, "At least 1 day required.")
    .max(3650, "Cannot exceed 10 years."),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .min(0, "Price cannot be negative.")
    .max(10_000_000, "Price is too high."),
  features: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
});

// ─── Member ───────────────────────────────────────────────────────────────────

export const memberSchema = z.object({
  firstName:      z.string().min(1, "First name is required."),
  lastName:       z.string().optional().or(z.literal("")),
  email:          z.string().min(1, "Email is required.").email("Invalid email address."),
  phone,
  dateOfBirth:    z.string().optional().or(z.literal("")),
  membershipType: z.enum(["basic", "standard", "premium"], {
    errorMap: () => ({ message: "Select a valid membership type." }),
  }),
  membershipEnd: z
    .string()
    .min(1, "Membership end date is required.")
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date."),
  // physique
  height:   z.coerce.number().positive("Must be positive.").optional().or(z.literal("")),
  weight:   z.coerce.number().positive("Must be positive.").optional().or(z.literal("")),
  bodyType: z.string().optional().or(z.literal("")),
  // diet
  dietType:    z.string().optional().or(z.literal("")),
  supplements: z.string().optional().or(z.literal("")),
  // goal
  primaryGoal:  z.string().optional().or(z.literal("")),
  targetWeight: z.coerce.number().positive("Must be positive.").optional().or(z.literal("")),
  goalNotes:    z.string().optional().or(z.literal("")),
  // health
  medicalConditions: z.string().optional().or(z.literal("")),
  injuries:          z.string().optional().or(z.literal("")),
  healthNotes:       z.string().optional().or(z.literal("")),
  // emergency
  emergencyName:     z.string().optional().or(z.literal("")),
  emergencyPhone:    z.string().optional().or(z.literal("")),
  emergencyRelation: z.string().optional().or(z.literal("")),
});

// ─── Staff ────────────────────────────────────────────────────────────────────

export const staffSchema = z.object({
  firstName:      z.string().min(1, "First name is required."),
  lastName:       z.string().min(1, "Last name is required."),
  phone:          z.string().regex(/^[+\d\s\-(). ]{7,15}$/, "Enter a valid phone number."),
  email:          optionalEmail,
  gender:         z.enum(["male", "female", "other"], { errorMap: () => ({ message: "Select a gender." }) }),
  dateOfBirth:    z.string().optional().or(z.literal("")),
  role:           z.enum(["trainer", "receptionist", "manager", "cleaner"], {
    errorMap: () => ({ message: "Select a valid role." }),
  }),
  joiningDate:    z.string().min(1, "Joining date is required."),
  employmentType: z.enum(["full-time", "part-time"]).optional(),
  salaryAmount:   z.coerce.number().min(0, "Cannot be negative.").optional().or(z.literal("")),
  salaryType:     z.enum(["monthly", "per-session"]).optional(),
  shiftType:      z.enum(["morning", "evening", "custom"]).optional(),
  shiftStart:     z.string().optional().or(z.literal("")),
  shiftEnd:       z.string().optional().or(z.literal("")),
});

// ─── Payment ──────────────────────────────────────────────────────────────────

export const paymentSchema = z.object({
  memberId: z.string().min(1, "Select a member."),
  planId:   z.string().min(1, "Select a plan."),
  amount:   z.coerce.number({ invalid_type_error: "Amount must be a number." }).min(1, "Amount must be at least 1."),
  method:   z.enum(["cash", "card", "upi", "bank_transfer", "cheque"], {
    errorMap: () => ({ message: "Select a payment method." }),
  }),
  date:     z.string().optional().or(z.literal("")),
  note:     z.string().optional().or(z.literal("")),
});

// ─── Helper — flatten ZodError into field → message map ──────────────────────

export type FieldErrors = Record<string, string>;

export function parseErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
