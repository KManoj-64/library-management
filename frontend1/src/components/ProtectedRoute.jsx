import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // If not logged in, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is missing, we can't authorize. 
  // Redirecting to login is safer than trying a dashboard route that might loop back.
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  // If role doesn't match, go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
