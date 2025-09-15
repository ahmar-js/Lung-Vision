import type { Control, FieldPath, FieldValues } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  icon?: LucideIcon;
  hint?: string;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
  icon: Icon,
  hint,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={cn(
            "text-sm font-medium text-gray-700 flex items-center gap-2",
            required && "after:content-['*'] after:text-red-500"
          )}>
            {Icon && <Icon className="w-4 h-4" />}
            {label}
          </FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              value={field.value} 
              disabled={disabled}
            >
              <SelectTrigger className={cn(
                "w-full h-11 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                fieldState.error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                disabled && "opacity-50 cursor-not-allowed"
              )}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {hint && !fieldState.error && (
            <p className="text-xs text-gray-500 mt-1">{hint}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}