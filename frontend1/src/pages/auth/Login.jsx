import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-600/20 mb-5">
            <BookOpen className="text-white w-7 h-7" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-gray-500 mt-2 font-medium">Please enter your credentials to log in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="you@college.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 block">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 flex items-center justify-center gap-2 rounded-xl font-semibold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline underline-offset-4 transition-all">
              Create one now
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

export default Login;
