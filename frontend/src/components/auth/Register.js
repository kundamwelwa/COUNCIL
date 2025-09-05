import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Building2, Users, DollarSign, FileText, Shield } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone_number: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const roles = [
    { value: 'SuperAdmin', label: 'Super Administrator', icon: Shield, color: 'text-red-600' },
    { value: 'Admin', label: 'Administrator', icon: Building2, color: 'text-blue-600' },
    { value: 'DataEntry', label: 'Data Entry', icon: Users, color: 'text-green-600' },
    { value: 'Auditor', label: 'Auditor', icon: FileText, color: 'text-purple-600' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: '',
        department: ''
      });
      
      if (response.data.success) {
        setSuccess('Account created successfully! Please check your email for verification instructions before signing in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex">
      {/* Zambian Coat of Arms Background - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 opacity-90">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="coatGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="75%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="eagleGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              {/* Main Shield */}
              <path d="M200 50 L320 120 L320 280 L200 350 L80 280 L80 120 Z" fill="url(#coatGradient2)" stroke="#1e293b" strokeWidth="4"/>
              {/* Inner Shield */}
              <path d="M200 80 L280 130 L280 270 L200 320 L120 270 L120 130 Z" fill="#1e293b" opacity="0.9"/>
              {/* Eagle Body */}
              <ellipse cx="200" cy="200" rx="25" ry="35" fill="url(#eagleGradient2)"/>
              {/* Eagle Head */}
              <circle cx="200" cy="170" r="15" fill="url(#eagleGradient2)"/>
              {/* Eagle Wings */}
              <path d="M160 200 Q140 180 160 160 Q180 180 200 200" fill="url(#eagleGradient2)"/>
              <path d="M240 200 Q260 180 240 160 Q220 180 200 200" fill="url(#eagleGradient2)"/>
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
          <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">
                Create Account
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Join the Council Management System
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 lg:p-8">
            <form className="space-y-3 sm:space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-2">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter your department"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-neutral-700">
                  I agree to the{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-sm sm:text-base">Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Create Account</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Manage Beneficiaries</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-secondary-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Track Funds</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Program Oversight</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-neutral-200">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-800 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-neutral-600">Generate Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
