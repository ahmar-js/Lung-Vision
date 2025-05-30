import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "../fields/FormField";
import { PasswordField } from "../fields/PasswordField";
import { loginSchema } from "@/lib/validations";
import type { LoginFormData } from "@/lib/validations";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          disabled={isLoading}
          icon={Mail}
        />

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
} 