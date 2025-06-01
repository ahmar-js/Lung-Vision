import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Lung Vision';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const ENABLE_DEV_TOOLS = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV;

export function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome to {APP_NAME}
                </h1>
                <p className="text-lg text-gray-600">
                  Hello, <span className="font-semibold">{user?.full_name}</span>!
                </p>
                <p className="text-sm text-gray-500">
                  Email: {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98] focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Welcome Back
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.full_name}</div>
              <p className="text-xs text-muted-foreground">
                Last login: Today
              </p>
            </CardContent>
          </Card>

          {/* Patient Analytics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patient Scans
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Analysis
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ready for deployment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Area */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Decision Support System</CardTitle>
            <CardDescription>
              AI-powered lung cancer detection dashboard will be available here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Dashboard Coming Soon
              </h3>
              <p className="text-gray-500 mb-4">
                Your lung vision application dashboard with AI-powered diagnostic tools will be available here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">PET/CT Analysis</h4>
                  <p className="text-sm text-blue-700">Multi-modal imaging</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h4 className="font-medium text-cyan-900">Risk Scoring</h4>
                  <p className="text-sm text-cyan-700">AI-powered assessment</p>
                </div>
              </div>
            </div>

            {/* Debug info for development */}
            {ENABLE_DEV_TOOLS && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Debug Info:</h3>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify({
                    app: {
                      name: APP_NAME,
                      version: APP_VERSION,
                      environment: import.meta.env.MODE,
                    },
                    user: user ? { 
                      email: user.email, 
                      full_name: user.full_name 
                    } : null,
                    auth: {
                      isAuthenticated: !!user,
                      isLoading,
                    },
                  }, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 