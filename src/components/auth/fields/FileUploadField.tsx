import type { Control, FieldPath, FieldValues } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { Upload, X } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface FileUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  acceptedFileTypes: string;
  disabled?: boolean;
  required?: boolean;
  icon?: LucideIcon;
  hint?: string;
}

export function FileUploadField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Click to upload or drag and drop",
  acceptedFileTypes,
  disabled = false,
  required = false,
  icon: Icon,
  hint,
}: FileUploadFieldProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <div className="space-y-2">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50",
                  fieldState.error && "border-red-500 hover:border-red-500",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!disabled) {
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/50');
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                  if (!disabled && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    field.onChange(file);
                  }
                }}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
                <p className="text-xs text-gray-500">Accepted formats: {acceptedFileTypes}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes}
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />
              </div>
              {field.value && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{field.value.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(field.value.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => {
                      field.onChange(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
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