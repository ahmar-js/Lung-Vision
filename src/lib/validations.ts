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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&_)"
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
    label: 'At least one special character (@$!%*?&_)',
    test: (value: string) => /[@$!%*?&_]/.test(value),
  },
];

// Doctor registration schema
export const doctorRegistrationSchema = z.object({
  fullName: fullNameValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  medicalLicenseNumber: z
    .string()
    .min(1, "Medical license number is required")
    .min(5, "Medical license number must be at least 5 characters")
    .max(20, "Medical license number must be less than 20 characters"),
  country: z.string().min(1, "Country is required"),
  specialization: z.string().min(1, "Specialization is required"),
  hospitalAffiliation: z
    .string()
    .min(1, "Hospital/Clinic affiliation is required")
    .min(2, "Hospital/Clinic name must be at least 2 characters")
    .max(100, "Hospital/Clinic name must be less than 100 characters"),
  phoneNumber: z.string().optional(),
  medicalLicense: z
    .any()
    .refine((file) => file != null, "Medical license document is required")
    .refine(
      (file) => file == null || file?.size <= 5000000, // 5MB
      "File size must be less than 5MB"
    ),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Researcher registration schema
export const researcherRegistrationSchema = z.object({
  fullName: fullNameValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  researchInstitution: z
    .string()
    .min(1, "Research institution is required")
    .min(2, "Institution name must be at least 2 characters")
    .max(100, "Institution name must be less than 100 characters"),
  country: z.string().min(1, "Country is required"),
  affiliationType: z.string().min(1, "Affiliation type is required"),
  purposeOfUse: z.string().min(1, "Purpose of use is required"),
  orcidId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(val),
      "ORCID ID must be in format 0000-0000-0000-0000"
    ),
  institutionalId: z
    .any()
    .refine((file) => file != null, "Institutional ID document is required")
    .refine(
      (file) => file == null || file?.size <= 5000000, // 5MB
      "File size must be less than 5MB"
    ),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type DoctorRegistrationFormData = z.infer<typeof doctorRegistrationSchema>;
export type ResearcherRegistrationFormData = z.infer<typeof researcherRegistrationSchema>; 