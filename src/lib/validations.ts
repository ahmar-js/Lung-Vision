import * as z from "zod";

// Base validation rules
export const emailValidation = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .refine(
    (email) => {
      // Check if email contains only digits before @ symbol
      const localPart = email.split('@')[0];
      return !/^\d+$/.test(localPart);
    },
    "Email cannot contain only digits before @ symbol"
  )
  .refine(
    (email) => {
      // Additional email validation - must have proper domain
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    },
    "Please enter a valid email address with proper domain"
  );

export const passwordValidation = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password must not exceed 32 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
  );

export const fullNameValidation = z
  .string()
  .min(1, "Full name is required")
  .min(2, "Full name must be at least 2 characters")
  .max(50, "Full name must be less than 50 characters")
  .regex(
    /^[a-zA-Z\s]+$/,
    "Full name can only contain letters and spaces"
  )
  .refine(
    (value) => value.trim().length >= 2,
    "Full name must contain at least 2 characters excluding spaces"
  );

// Login schema
export const loginSchema = z.object({
  email: emailValidation,
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// Registration schema
export const registerSchema = z.object({
  fullName: fullNameValidation,
  email: emailValidation,
  password: passwordValidation,
});

// Password requirements for UI display
export const passwordRequirements = [
  {
    id: 'length',
    label: '8-32 characters long',
    test: (value: string) => value.length >= 8 && value.length <= 32,
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (value: string) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'At least one special character (@$!%*?&)',
    test: (value: string) => /[@$!%*?&]/.test(value),
  },
];

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>; 