import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Clock,
  Database,
  Shield
} from 'lucide-react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        action: actionFilter,
        user: userFilter,
        date: dateFilter
      });

      const response = await axios.get(`http://localhost:5000/api/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      setError('Failed to load audit logs');
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, userFilter, dateFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return <User className="w-4 h-4 text-blue-500" />;
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Activity className="w-4 h-4 text-yellow-500" />;
    } else if (actionLower.includes('permission') || actionLower.includes('access')) {
      return <Shield className="w-4 h-4 text-purple-500" />;
    } else if (actionLower.includes('password') || actionLower.includes('reset')) {
      return <Database className="w-4 h-4 text-orange-500" />;
    } else {
      return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('login') || actionLower.includes('create') || actionLower.includes('add')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (actionLower.includes('delete') || actionLower.includes('remove') || actionLower.includes('error')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('change')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (actionLower.includes('permission') || actionLower.includes('access') || actionLower.includes('security')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const exportLogs = async (format = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        format,
        action: actionFilter,
        user: userFilter,
        date: dateFilter,
        search: searchTerm
      });

      const response = await axios.get(`http://localhost:5000/api/admin/audit-logs/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  };

  const getUniqueUsers = () => {
    const users = [...new Set(logs.map(log => log.username).filter(Boolean))];
    return users.sort();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-primary-500" />
          Audit Logs
        </h1>
        <p className="text-neutral-600 mt-1">
          Monitor system activities and user actions
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Actions</option>
              {getUniqueActions().map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Users</option>
              {getUniqueUsers().map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => exportLogs('csv')}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            
            <button
              type="button"
              onClick={() => exportLogs('json')}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-primary-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Logs</p>
              <p className="text-2xl font-bold text-neutral-800">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Users</p>
              <p className="text-2xl font-bold text-neutral-800">{getUniqueUsers().length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Actions Today</p>
              <p className="text-2xl font-bold text-neutral-800">
                {logs.filter(log => {
                  const logDate = new Date(log.created_at);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Last Activity</p>
              <p className="text-sm font-bold text-neutral-800">
                {logs.length > 0 ? formatRelativeTime(logs[0].created_at) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-800">
            Audit Logs ({pagination.total} total)
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Table/Record
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-neutral-400 mr-2" />
                      <span className="text-sm text-neutral-800">
                        {log.username || 'System'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-800 max-w-xs truncate">
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {log.ip_address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {log.table_name ? (
                      <div className="flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        {log.table_name}
                        {log.record_id && (
                          <span className="ml-1 text-xs text-neutral-400">
                            (ID: {log.record_id})
                          </span>
                        )}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <div>
                        <div>{formatDate(log.created_at)}</div>
                        <div className="text-xs text-neutral-400">
                          {formatRelativeTime(log.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-lg ${
                          page === pagination.page
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-800">Log Details</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Action
                  </label>
                  <div className="flex items-center">
                    {getActionIcon(selectedLog.action)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    User
                  </label>
                  <p className="text-sm text-neutral-800">{selectedLog.username || 'System'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    IP Address
                  </label>
                  <p className="text-sm text-neutral-800">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Time
                  </label>
                  <p className="text-sm text-neutral-800">{formatDate(selectedLog.created_at)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Details
                </label>
                <p className="text-sm text-neutral-800 bg-neutral-50 p-3 rounded-lg">
                  {selectedLog.details}
                </p>
              </div>
              
              {selectedLog.table_name && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Database Information
                  </label>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="text-sm text-neutral-800">
                      <strong>Table:</strong> {selectedLog.table_name}
                    </p>
                    {selectedLog.record_id && (
                      <p className="text-sm text-neutral-800">
                        <strong>Record ID:</strong> {selectedLog.record_id}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {(selectedLog.old_values || selectedLog.new_values) && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Data Changes
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.old_values && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-600 mb-2">Old Values</h4>
                        <pre className="text-xs text-neutral-800 bg-red-50 p-3 rounded-lg overflow-auto max-h-32">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {selectedLog.new_values && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-600 mb-2">New Values</h4>
                        <pre className="text-xs text-neutral-800 bg-green-50 p-3 rounded-lg overflow-auto max-h-32">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
