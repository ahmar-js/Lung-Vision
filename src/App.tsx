import { useEffect } from 'react';
import { AuthContainer } from './components/auth/AuthContainer';
import { useAuth } from './hooks/useAuth';
import { tokenManager, config } from './lib/axios';
import './App.css';

// App configuration from environment variables
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Lung Vision';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const ENABLE_DEV_TOOLS = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV;

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Initialize authentication state on app load
  useEffect(() => {
    // If we have tokens but no user data, the useUserQuery will automatically fetch user data
    // This handles the case where user refreshes the page
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Show loading spinner while checking authentication
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to {APP_NAME}</h1>
              <p className="text-gray-600">Hello, {user?.full_name}!</p>
              <p className="text-sm text-gray-500">Email: {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Dashboard Coming Soon
            </h2>
            <p className="text-gray-500 mb-4">
              Your lung vision application dashboard will be available here.
            </p>
            
            {/* Debug info for development */}
            {ENABLE_DEV_TOOLS && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-semibold text-gray-700 mb-2">Debug Info:</h3>
                <pre className="text-xs text-gray-600">
                  {JSON.stringify({
                    app: {
                      name: APP_NAME,
                      version: APP_VERSION,
                      environment: config.NODE_ENV,
                    },
                    api: {
                      baseUrl: config.API_BASE_URL,
                      timeout: config.API_TIMEOUT,
                    },
                    auth: {
                      isAuthenticated,
                      hasTokens: tokenManager.hasValidTokens(),
                      user: user ? { email: user.email, full_name: user.full_name } : null,
                    },
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
