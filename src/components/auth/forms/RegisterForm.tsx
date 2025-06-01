import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "../fields/FormField";
import { PasswordField } from "../fields/PasswordField";
import { registerSchema } from "@/lib/validations";
import type { RegisterFormData } from "@/lib/validations";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const watchedPassword = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          disabled={isLoading}
          icon={User}
          hint="Only letters and spaces allowed (e.g., John Doe)"
        />

        <FormField
          control={form.control}
          name="email"
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          disabled={isLoading}
          icon={Mail}
          hint="Must be a valid email address (e.g., user@example.com)"
        />

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          placeholder="Create a strong password"
          disabled={isLoading}
          showRequirements={true}
          currentValue={watchedPassword}
        />

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-300 ease-in-out cursor-pointer disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
} 