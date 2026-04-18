import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Home from './pages/Home';

// Admin Pages
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';

// Student Pages
import StudentLayout from './components/Layout/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentBrowse from './pages/student/BrowseBooks';
import StudentHistory from './pages/student/History';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Verifying session...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={(!user || !user.role) ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />
      <Route path="/register" element={(!user || !user.role) ? <Register /> : <Navigate to="/student" />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="browse" element={<StudentBrowse />} />
          <Route path="history" element={<StudentHistory />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
