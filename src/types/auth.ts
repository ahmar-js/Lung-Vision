export interface User {
  email: string;
  full_name: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
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