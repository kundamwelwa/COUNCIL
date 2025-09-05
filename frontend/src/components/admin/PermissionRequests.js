import React, { useState, useEffect } from 'react';
import { Shield, User, Clock, Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PermissionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/permission-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      setError('Failed to load permission requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/auth/permission-requests/${requestId}`, {
        action: action,
        comments: reviewComments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccess(`Permission request ${action}d successfully`);
        setSelectedRequest(null);
        setReviewComments('');
        fetchRequests();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to review permission request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'Denied':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Denied':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-primary-500" />
          Permission Requests Management
        </h1>
        <p className="text-neutral-600 mt-1">
          Review and manage permission requests from users
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-neutral-800">
                {requests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Approved</p>
              <p className="text-2xl font-bold text-neutral-800">
                {requests.filter(r => r.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <X className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Denied</p>
              <p className="text-2xl font-bold text-neutral-800">
                {requests.filter(r => r.status === 'Denied').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-800">All Permission Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {requests.map((request) => (
                <tr key={request.request_id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full p-2 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-800">
                          {request.requester_username}
                        </div>
                        {request.target_username && request.target_username !== request.requester_username && (
                          <div className="text-xs text-neutral-500">
                            Target: {request.target_username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {request.requested_permission.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-800 max-w-xs truncate">
                      {request.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'Pending' && (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Review
                      </button>
                    )}
                    {request.status !== 'Pending' && request.review_comments && (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-neutral-600 hover:text-neutral-900"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-800">Review Permission Request</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Requester
                </label>
                <p className="text-sm text-neutral-800">{selectedRequest.requester_username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Requested Permission
                </label>
                <p className="text-sm text-neutral-800">{selectedRequest.requested_permission.replace('_', ' ')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Reason
                </label>
                <p className="text-sm text-neutral-800 bg-neutral-50 p-3 rounded-lg">
                  {selectedRequest.reason}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Review Comments
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add your review comments..."
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewComments('');
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
              
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleReview(selectedRequest.request_id, 'deny')}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Deny
                  </button>
                  
                  <button
                    onClick={() => handleReview(selectedRequest.request_id, 'approve')}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionRequests;
