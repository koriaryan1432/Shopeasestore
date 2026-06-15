import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any route that requires a logged-in user
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
