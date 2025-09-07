import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'If an account with that email exists, a password reset link has been sent to your email address.' 
        });
        setEmailSent(true);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Zambian Coat of Arms Background - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 opacity-90">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="eagleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              {/* Shield Background */}
              <path d="M200 50 L150 80 L150 200 Q150 250 200 300 Q250 250 250 200 L250 80 Z" fill="url(#shieldGradient)" stroke="#1e293b" strokeWidth="3"/>
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
              {/* Decorative Elements */}
              <circle cx="200" cy="100" r="3" fill="#fbbf24"/>
              <circle cx="180" cy="120" r="2" fill="#fbbf24"/>
              <circle cx="220" cy="120" r="2" fill="#fbbf24"/>
            </svg>
          </div>
        </div>
        {/* Zambian Flag Colors Stripes */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-red-500 to-black"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-red-500 to-black"></div>
      </div>
      
      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">
                Reset Your Password
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Forgot Password Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 lg:p-8">
              {!emailSent ? (
                <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                  {message.text && (
                    <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                      message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="text-sm">{message.text}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 pl-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        placeholder="Enter your email address"
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        <span className="text-sm sm:text-base">Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">Send Reset Link</span>
                      </div>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Check Your Email</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-neutral-500">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      setMessage({ type: '', text: '' });
                    }}
                    className="w-full flex justify-center py-3 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Try Another Email
                  </button>
                </div>
              )}

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">Remember your password?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full flex justify-center items-center py-3 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Secure Access</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-secondary-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Email Verification</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Council System</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-800 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Quick Recovery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
