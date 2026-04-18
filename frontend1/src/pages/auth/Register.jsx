import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, User, Mail, Hash, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, collegeId, password });
      toast.success('Registration successful! Please check your email for the OTP.');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-12 px-4">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg relative z-10 animate-fade-up">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 flex items-center justify-center rounded-xl shadow-sm mb-4">
            <BookOpen className="text-indigo-600 w-6 h-6" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium text-center">Join the digital library platform today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">College ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="12345678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="you@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 flex items-center justify-center gap-2 rounded-xl font-semibold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Create Account <UserPlus className="w-5 h-5" /></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-gray-500 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline underline-offset-4 transition-all">
              Sign In
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
