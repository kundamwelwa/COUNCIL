import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('No reset token provided');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token: token,
        newPassword: formData.password
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.data?.error?.includes('expired')) {
        setError('Reset link has expired. Please request a new one.');
      } else if (error.response?.data?.error?.includes('invalid')) {
        setError('Invalid reset link. Please check your email and try again.');
      } else {
        setError(error.response?.data?.error || 'Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <XCircle className="w-full h-full text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Reset Link</h1>
            <p className="text-red-500">No reset token provided</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8 text-center">
            <p className="text-red-600 mb-6">Please check your email for the correct password reset link.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <CheckCircle className="w-full h-full text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successfully!</h1>
            <p className="text-green-500">Your password has been updated</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-8 text-center">
            <p className="text-green-600 mb-6">You can now login with your new password.</p>
            <p className="text-sm text-neutral-500 mb-6">Redirecting to login page...</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Zambian Coat of Arms Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 opacity-90">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="coatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="75%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="eagleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              {/* Main Shield */}
              <path d="M200 50 L320 120 L320 280 L200 350 L80 280 L80 120 Z" fill="url(#coatGradient)" stroke="#1e293b" strokeWidth="4"/>
              {/* Inner Shield */}
              <path d="M200 80 L280 130 L280 270 L200 320 L120 270 L120 130 Z" fill="#1e293b" opacity="0.9"/>
              {/* Eagle Body */}
              <ellipse cx="200" cy="200" rx="25" ry="35" fill="url(#eagleGradient)"/>
              {/* Eagle Head */}
              <circle cx="200" cy="170" r="15" fill="url(#eagleGradient)"/>
              {/* Eagle Wings */}
              <path d="M160 200 Q140 180 160 160 Q180 180 200 200" fill="url(#eagleGradient)"/>
              <path d="M240 200 Q260 180 240 160 Q220 180 200 200" fill="url(#eagleGradient)"/>
              {/* Eagle Beak */}
              <path d="M200 155 L195 150 L200 145 L205 150 Z" fill="#fbbf24"/>
              {/* Crown */}
              <path d="M200 50 L190 40 L200 30 L210 40 Z" fill="#f97316"/>
              <path d="M200 30 L195 25 L200 20 L205 25 Z" fill="#fbbf24"/>
              {/* Supporters - Lions */}
              <path d="M120 280 Q100 300 120 320 Q140 300 120 280" fill="#f97316" stroke="#1e293b" strokeWidth="2"/>
              <path d="M280 280 Q300 300 280 320 Q260 300 280 280" fill="#f97316" stroke="#1e293b" strokeWidth="2"/>
              {/* Motto Banner */}
              <path d="M150 360 L250 360 L255 365 L250 370 L150 370 L145 365 Z" fill="#1e293b"/>
              <text x="200" y="375" textAnchor="middle" className="text-xs fill-white font-serif font-bold">One Zambia, One Nation</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Council Management System</h1>
          <p className="text-neutral-600">Reset Your Password</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-8">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">Create New Password</h2>
            <p className="text-neutral-600 text-sm">
              Enter your new password below. Make sure it's secure and memorable.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-center text-sm text-neutral-500 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Password Requirements
            </div>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Use a combination of letters, numbers, and symbols</li>
              <li>• Avoid common words or personal information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
