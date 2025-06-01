import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  children?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  icon: Icon,
  hint,
  children,
  onFocus,
  onBlur,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              )}
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={`${Icon ? 'pl-10' : ''} h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500`}
                disabled={disabled}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {children}
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
          {hint && (
            <p className="text-xs text-gray-500 mt-1">
              {hint}
            </p>
          )}
        </FormItem>
      )}
    />
  );
} 