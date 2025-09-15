import { useNavigate } from 'react-router-dom';
import { UserCog, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'doctor' | 'researcher') => {
    navigate(`/auth/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-2xl border-0 bg-white/80 ">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to Lung Vision
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Please select your role to continue with the appropriate registration process
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Card */}
            <Card className="border-2 border-blue-200 cursor-pointer"
                  onClick={() => handleRoleSelection('doctor')}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <UserCog className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-blue-700">
                  I am a Doctor
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Medical professionals working in clinical practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">You'll need to provide:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Medical License Number</li>
                    <li>Specialization (e.g., Pulmonologist, Radiologist)</li>
                    <li>Hospital/Clinic Affiliation</li>
                    <li>Medical License Document</li>
                  </ul>
                </div>
                <Button 
                  className="w-full bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection('doctor');
                  }}
                >
                  Continue as Doctor
                </Button>
              </CardContent>
            </Card>

            {/* Researcher Card */}
            <Card className="border-2 border-cyan-200 cursor-pointer"
                  onClick={() => handleRoleSelection('researcher')}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-cyan-700">
                  I am a Researcher
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Academic researchers, students, and institution members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">You'll need to provide:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Research Institution/University Name</li>
                    <li>Affiliation Type (Student, Faculty, Postdoc)</li>
                    <li>Purpose of Use</li>
                    <li>Institutional ID Document</li>
                  </ul>
                </div>
                <Button 
                  className="w-full bg-cyan-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection('researcher');
                  }}
                >
                  Continue as Researcher
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-600 font-medium underline"
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}