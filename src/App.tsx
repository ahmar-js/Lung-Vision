import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage, RoleSelectionPage, DoctorAuthPage, ResearcherAuthPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to role selection */}
        <Route path="/" element={<Navigate to="/role-selection" replace />} />
        
        {/* Role selection route */}
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        
        {/* Role-specific authentication routes */}
        <Route path="/auth/doctor" element={<DoctorAuthPage />} />
        <Route path="/auth/researcher" element={<ResearcherAuthPage />} />
        
        {/* Legacy login route - redirect to role selection */}
        <Route path="/login" element={<Navigate to="/role-selection" replace />} />
        
        {/* Protected dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to role selection */}
        <Route path="*" element={<Navigate to="/role-selection" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
