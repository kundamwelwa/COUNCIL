import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/verify-email', {
        token: token
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.data?.error?.includes('expired')) {
        setStatus('expired');
        setMessage('Verification link has expired. Please request a new one.');
      } else if (error.response?.data?.error?.includes('invalid')) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
      } else {
        setStatus('error');
        setMessage('Verification failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setLoading(true);
      // This would need to be implemented with email input
      setMessage('Please contact support to resend verification email.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('Failed to resend verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      case 'expired':
        return <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />;
      default:
        return <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'expired':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Verification Link Expired';
      default:
        return 'Verifying Your Email...';
    }
  };

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
          <p className="text-neutral-600">Email Verification</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-8 text-center">
          {getStatusIcon()}
          
          <h2 className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h2>

          {loading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-neutral-600">Please wait while we verify your email...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-neutral-700 mb-6">{message}</p>
              
              {status === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">Account Activated</span>
                    </div>
                    <p className="text-green-600 text-sm">
                      You will be redirected to the login page in a few seconds...
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700 font-medium">Verification Failed</span>
                    </div>
                    <p className="text-red-600 text-sm">
                      Please check your email for the correct verification link.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate('/register')}
                      className="flex-1 bg-neutral-100 text-neutral-700 py-3 px-4 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                    >
                      Register Again
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
                    >
                      Try Login
                    </button>
                  </div>
                </div>
              )}

              {status === 'expired' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-orange-500 mr-2" />
                      <span className="text-orange-700 font-medium">Link Expired</span>
                    </div>
                    <p className="text-orange-600 text-sm">
                      Verification links expire after 24 hours for security reasons.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={resendVerification}
                      disabled={loading}
                      className="flex-1 bg-orange-100 text-orange-700 py-3 px-4 rounded-lg font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      Resend Email
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
                    >
                      Try Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-center text-sm text-neutral-500 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Need Help?
            </div>
            <p className="text-xs text-neutral-400">
              If you're having trouble verifying your email, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
