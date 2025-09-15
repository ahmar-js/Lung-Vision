export interface User {
  id?: number;
  email: string;
  full_name: string;
  role: 'doctor' | 'researcher' | 'admin';
  account_status?: 'pending' | 'approved' | 'rejected';
  country?: string;
  phone_number?: string;
  date_joined?: string;

  // Doctor-specific fields
  medical_license_number?: string;
  specialization?: string;
  hospital_affiliation?: string;

  // Researcher-specific fields
  research_institution?: string;
  affiliation_type?: string;
  purpose_of_use?: string;
  orcid_id?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegistrationResponse {
  detail: string;
  user: User;
  // No tokens - user must be approved first
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
}

export interface MessageState {
  type: "success" | "error";
  text: string;
}

export interface ValidationRule {
  pattern: RegExp;
  message: string;
  isValid: (value: string) => boolean;
} 