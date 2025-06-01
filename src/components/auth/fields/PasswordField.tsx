import { useState, useRef } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { PasswordRequirements } from "../PasswordRequirements";

interface PasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  disabled?: boolean;
  showRequirements?: boolean;
  currentValue?: string;
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  showRequirements = false,
  currentValue = "",
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFocus = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Add a small delay before hiding to allow for mouse interactions
    timeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  return (
    <div className="space-y-2 relative">
      <FormField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        icon={Lock}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </FormField>
      
      {/* Password Requirements Popup */}
      {showRequirements && isFocused && (
        <div 
          className="absolute top-full left-0 right-0 z-50 mt-2 animate-in fade-in-50 slide-in-from-top-3 duration-200"
          onMouseEnter={handleFocus}
          onMouseLeave={handleBlur}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
            <PasswordRequirements password={currentValue} />
          </div>
        </div>
      )}
    </div>
  );
} 