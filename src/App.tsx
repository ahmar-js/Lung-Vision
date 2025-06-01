import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage, LoginPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
