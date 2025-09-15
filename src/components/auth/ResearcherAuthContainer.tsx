import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageAlert } from "@/components/ui/form-helpers/MessageAlert";
import { LoginForm } from "./forms/LoginForm";
import { ResearcherRegistrationForm } from "./forms/ResearcherRegistrationForm";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import type { LoginFormData, ResearcherRegistrationFormData } from "@/lib/validations";

export function ResearcherAuthContainer() {
  const [activeTab, setActiveTab] = useState("login");
    const { 
    login, 
    message, 
    clearMessage,
    loginState
  } = useAuth();

  const [localMessage, setLocalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setLocalMessage(null);
    
    try {
      // Attempt login
      const response = await authService.login(data);
      
      // Check if the user's role matches this page (researcher)
      if (response.user?.role !== 'researcher') {
        // Log out the user since they're on the wrong page
        await authService.logout();
        
        const roleName = response.user.role === 'doctor' ? 'Doctor' : response.user.role;
        setLocalMessage({ 
          type: 'error', 
          text: `This account is registered as a ${roleName}. Please go back to role selection and choose "${roleName}" to access the correct login page.` 
        });
        return;
      }
      
      // If role matches, proceed with normal login flow
      await login(data);
    } catch (error: any) {
      // Let the useAuth hook handle login errors normally
      setLocalMessage({ 
        type: 'error', 
        text: error?.message || 'Login failed. Please try again.' 
      });
    }
  };

  const handleRegister = async (data: ResearcherRegistrationFormData) => {
    setLocalMessage(null);
    setIsRegistering(true);
    
    try {
      const response = await authService.registerResearcher(data);
      // Switch to login tab after successful registration
      setActiveTab("login");
      setLocalMessage({ 
        type: 'success', 
        text: response.detail || 'Researcher account created successfully! Your account is pending approval by an administrator. You will be able to login once your account is approved.' 
      });
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      
      // Extract user-friendly error message
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 400) {
        const data = error?.response?.data;
        if (data?.email && Array.isArray(data.email)) {
          errorMessage = data.email[0];
        } else if (data?.password && Array.isArray(data.password)) {
          errorMessage = data.password[0];
        }
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setLocalMessage({ type: "error", text: errorMessage });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Researcher Portal - Lung Vision
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome, Researcher! Please sign in to your account or create a new researcher account.
          </p>
        </div>

        {/* Message Alert */}
        {(message || localMessage) && (
          <div className="mb-6">
            <MessageAlert 
              message={localMessage || message!} 
              onClose={() => {
                setLocalMessage(null);
                clearMessage();
              }} 
            />
          </div>
        )}

        {/* Auth Tabs */}
        <Card className="shadow-lg border-0 bg-white/90 mb-6">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 max-w-md mx-auto">
                <TabsTrigger value="login" className="text-sm font-medium cursor-pointer h-10">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="text-sm font-medium cursor-pointer h-10">
                  Register as Researcher
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-in fade-in-50 slide-in-from-right-5 duration-300">
                <Card className="max-w-md mx-auto shadow-sm border bg-white">
                  <CardContent className="p-6">
                    <LoginForm 
                      onSubmit={handleLogin} 
                      isLoading={loginState.isLoading} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
                <ResearcherRegistrationForm 
                  onSubmit={handleRegister} 
                  isLoading={isRegistering} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center mb-2">
            <Separator className="flex-1 max-w-xs" />
            <span className="px-4 text-xs uppercase">Secure Researcher Authentication</span>
            <Separator className="flex-1 max-w-xs" />
          </div>
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">
            Wrong role? <a href="/role-selection" className="text-cyan-600 hover:text-cyan-800 underline">Go to Role Selection</a>
          </p>
        </div>
      </div>
    </div>
  );
}