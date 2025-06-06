import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContainer } from '@/components/auth/AuthContainer';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-in fade-in-50 duration-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 ease-in-out"></div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Show login form if not authenticated
  return <AuthContainer />;
} 