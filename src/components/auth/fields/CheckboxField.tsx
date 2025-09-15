import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  required = false,
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                fieldState.error && "border-red-500"
              )}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className={cn(
              "text-sm text-gray-700 cursor-pointer",
              required && "after:content-['*'] after:text-red-500 after:ml-1",
              disabled && "cursor-not-allowed opacity-50"
            )}>
              {label}
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}