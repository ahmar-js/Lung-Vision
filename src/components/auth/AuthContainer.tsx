import { useState } from "react";
import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageAlert } from "@/components/ui/form-helpers/MessageAlert";
import { LoginForm } from "./forms/LoginForm";
import { RegisterForm } from "./forms/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormData, RegisterFormData } from "@/lib/validations";

interface AuthContainerProps {
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
}

export function AuthContainer({ onLoginSuccess, onRegisterSuccess }: AuthContainerProps) {
  const [activeTab, setActiveTab] = useState("login");
  const { 
    login, 
    register, 
    message, 
    clearMessage,
    loginState,
    registerState 
  } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    await login(data);
    if (loginState.isSuccess) {
      onLoginSuccess?.();
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    await register(data);
    if (registerState.isSuccess) {
      setActiveTab("login");
      onRegisterSuccess?.();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Lung Vision
          </CardTitle>
          <CardDescription className="text-gray-600">
            Welcome! Please sign in to your account or create a new one.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <MessageAlert message={message} onClose={clearMessage} />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm font-medium">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <LoginForm 
                onSubmit={handleLogin} 
                isLoading={loginState.isLoading} 
              />
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <RegisterForm 
                onSubmit={handleRegister} 
                isLoading={registerState.isLoading} 
              />
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Secure Authentication</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 