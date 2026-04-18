import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP');
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email is required');
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">OTP Verification</h2>
        <p className="text-gray-600 mb-6">Enter the 6-digit code sent to your email</p>
        
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-left">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-left">OTP Code</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center text-2xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300 mb-4"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="text-blue-600 hover:underline text-sm disabled:text-gray-400"
        >
          {resending ? 'Resending...' : "Didn't receive code? Resend OTP"}
        </button>

        <div className="mt-6 border-t pt-4">
          <Link to="/register" className="text-sm text-gray-600 hover:text-blue-600">
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
