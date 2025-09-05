import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-accent-600" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Access Denied
          </h1>
          <p className="text-neutral-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          
          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center space-x-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Council Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
