import { useState } from "react";
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

  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        icon={Lock}
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
      
      {showRequirements && (
        <PasswordRequirements password={currentValue} />
      )}
    </div>
  );
} 