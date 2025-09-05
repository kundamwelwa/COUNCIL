import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Users, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Cpu,
  Shield,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const SystemStatus = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/system-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSystemStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      setError('Failed to load system status');
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading && !systemStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center">
              <Server className="w-6 h-6 mr-2 text-primary-500" />
              System Status
            </h1>
            <p className="text-neutral-600 mt-1">
              Monitor system health and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-sm text-neutral-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            <button
              onClick={fetchSystemStatus}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {systemStats && (
        <>
          {/* Overall System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">System Status</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(systemStats.overall_status)}
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(systemStats.overall_status).split(' ')[1]}`}>
                      {systemStats.overall_status?.charAt(0).toUpperCase() + systemStats.overall_status?.slice(1)}
                    </span>
                  </div>
                </div>
                <Server className="w-8 h-8 text-primary-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Database</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(systemStats.database?.status)}
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(systemStats.database?.status).split(' ')[1]}`}>
                      {systemStats.database?.status?.charAt(0).toUpperCase() + systemStats.database?.status?.slice(1)}
                    </span>
                  </div>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">API Response</p>
                  <p className="text-lg font-bold text-neutral-800">
                    {systemStats.api?.response_time || 0}ms
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Uptime</p>
                  <p className="text-lg font-bold text-neutral-800">
                    {systemStats.server?.uptime ? formatUptime(systemStats.server.uptime) : 'N/A'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Server Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-primary-500" />
                Server Resources
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-1">
                    <span>CPU Usage</span>
                    <span>{systemStats.server?.cpu_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.server?.cpu_usage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-1">
                    <span>Memory Usage</span>
                    <span>{systemStats.server?.memory_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.server?.memory_usage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-1">
                    <span>Disk Usage</span>
                    <span>{systemStats.server?.disk_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${systemStats.server?.disk_usage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-500" />
                Database Metrics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Active Connections</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.database?.active_connections || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Total Tables</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.database?.total_tables || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Database Size</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.database?.size ? formatBytes(systemStats.database.size) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Query Response Time</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.database?.query_time || 0}ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                User Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Active Sessions</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.users?.active_sessions || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Total Users</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.users?.total_users || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Online Today</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.users?.online_today || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-500" />
                System Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Requests/min</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.api?.requests_per_minute || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Error Rate</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.api?.error_rate || 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Avg Response</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.api?.avg_response_time || 0}ms
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-500" />
                Security Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Failed Logins</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.security?.failed_logins || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Blocked IPs</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {systemStats.security?.blocked_ips || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">SSL Status</span>
                  <div className="flex items-center">
                    {getStatusIcon(systemStats.security?.ssl_status)}
                    <span className="ml-1 text-sm font-medium">
                      {systemStats.security?.ssl_status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              Recent System Events
            </h3>
            
            <div className="space-y-3">
              {systemStats.events?.length > 0 ? (
                systemStats.events.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(event.status)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-800">{event.message}</p>
                        <p className="text-xs text-neutral-500">{event.timestamp}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No recent events</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemStatus;
