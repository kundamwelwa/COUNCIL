import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Bell,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalPrograms: 0,
    totalGroups: 0,
    totalLoans: 0,
    activeLoans: 0,
    repaidLoans: 0,
    defaultedLoans: 0,
    totalAmount: 0,
    totalRepaid: 0,
    outstandingAmount: 0
  });
  const [beneficiariesByProgram, setBeneficiariesByProgram] = useState([]);
  const [loanStatusData, setLoanStatusData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [geographicDistribution, setGeographicDistribution] = useState([]);
  const [financialSummary, setFinancialSummary] = useState([]);
  const [programPerformance, setProgramPerformance] = useState([]);
  const [groupStatistics, setGroupStatistics] = useState([]);
  const [todayActivities, setTodayActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [fieldVisits, setFieldVisits] = useState([]);
  const [followUps, setFollowUps] = useState([]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all dashboard data from different endpoints
      const [
        statsResponse,
        beneficiariesResponse,
        loanStatusResponse,
        monthlyTrendsResponse,
        recentActivitiesResponse,
        geographicResponse,
        financialResponse,
        programPerformanceResponse,
        groupStatsResponse,
        notificationsResponse
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats', { headers }),
        axios.get('http://localhost:5000/api/dashboard/beneficiaries-by-program', { headers }),
        axios.get('http://localhost:5000/api/dashboard/loan-status', { headers }),
        axios.get('http://localhost:5000/api/dashboard/monthly-trends', { headers }),
        axios.get('http://localhost:5000/api/dashboard/recent-activities', { headers }),
        axios.get('http://localhost:5000/api/dashboard/geographic-distribution', { headers }),
        axios.get('http://localhost:5000/api/dashboard/financial-summary', { headers }),
        axios.get('http://localhost:5000/api/dashboard/program-performance', { headers }),
        axios.get('http://localhost:5000/api/dashboard/group-statistics', { headers }),
        axios.get('http://localhost:5000/api/notifications', { headers })
      ]);

      // Set all the data
      if (statsResponse.data.success) setStats(statsResponse.data.data);
      if (beneficiariesResponse.data.success) setBeneficiariesByProgram(beneficiariesResponse.data.data);
      if (loanStatusResponse.data.success) setLoanStatusData(loanStatusResponse.data.data);
      if (monthlyTrendsResponse.data.success) setMonthlyTrends(monthlyTrendsResponse.data.data);
      if (recentActivitiesResponse.data.success) setRecentActivities(recentActivitiesResponse.data.data);
      if (geographicResponse.data.success) setGeographicDistribution(geographicResponse.data.data);
      if (financialResponse.data.success) setFinancialSummary(financialResponse.data.data);
      if (programPerformanceResponse.data.success) setProgramPerformance(programPerformanceResponse.data.data);
      if (groupStatsResponse.data.success) setGroupStatistics(groupStatsResponse.data.data);
      
      // Process notifications for calendar and activities
      if (notificationsResponse.data.success) {
        const notifications = notificationsResponse.data.data;
        const today = new Date().toDateString();
        
        // Filter today's activities
        const todayActivitiesData = notifications.filter(notif => 
          new Date(notif.created_at).toDateString() === today
        );
        setTodayActivities(todayActivitiesData);
        
        // Filter pending approvals
        const pendingApprovalsData = notifications.filter(notif => 
          notif.type === 'warning' && !notif.is_read
        );
        setPendingApprovals(pendingApprovalsData);
        
        // Filter field visits (mock for now - would come from a dedicated endpoint)
        setFieldVisits([]);
        
        // Filter follow-ups
        const followUpsData = notifications.filter(notif => 
          notif.type === 'info' && !notif.is_read
        );
        setFollowUps(followUpsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-neutral-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-neutral-500 dark:text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-primary-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-primary-500' : 'text-accent-500'}`}>
                {trendValue}%
              </span>
              <span className="text-xs text-neutral-500 dark:text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">{title}</h3>
        <div className="flex space-x-2">
          <button className="p-2 text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-accent-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-800 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-white">Council Management System</h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-gray-400">Beneficiaries & Fund Management</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search beneficiaries..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent-500 rounded-full"></span>
            </button>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Calendar & Quick Actions</h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Today's Activities</p>
              <p className="text-xs text-neutral-500">{todayActivities.length} scheduled activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Pending Approvals</p>
              <p className="text-xs text-neutral-500">{pendingApprovals.length} items waiting</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Field Visits</p>
              <p className="text-xs text-neutral-500">{fieldVisits.length} scheduled today</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Follow-ups</p>
              <p className="text-xs text-neutral-500">{followUps.length} calls pending</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Email Notifications</p>
              <p className="text-xs text-neutral-500">{todayActivities.length + pendingApprovals.length + followUps.length} unread messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Calendar Section */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">Calendar & Schedule</h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Today
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
              Week
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
              Month
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-neutral-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = i - 6; // Start from previous month
                  const isCurrentMonth = date > 0 && date <= 31;
                  const isToday = date === new Date().getDate();
                  
                  return (
                    <div
                      key={i}
                      className={`h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                        isCurrentMonth
                          ? isToday
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-800 hover:bg-neutral-200'
                          : 'text-neutral-400'
                      }`}
                    >
                      {isCurrentMonth ? date : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div>
            <h4 className="text-md font-semibold text-neutral-800 mb-4">Upcoming Events</h4>
            <div className="space-y-3">
              {todayActivities.length > 0 ? todayActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">{activity.title}</p>
                    <p className="text-xs text-neutral-500">{new Date(activity.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p>No events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-neutral-600">Welcome to the Council Beneficiaries Management System</p>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Beneficiaries"
            value={stats.totalPersons}
            icon={Users}
            color="bg-primary-500"
            trend="up"
            trendValue="12.5"
            subtitle="Registered persons"
          />
          <StatCard
            title="Active Programs"
            value={stats.totalPrograms}
            icon={Building2}
            color="bg-secondary-500"
            trend="up"
            trendValue="8.2"
            subtitle="Bursaries, SMEs, etc."
          />
          <StatCard
            title="Groups & Cooperatives"
            value={stats.totalGroups}
            icon={UserCheck}
            color="bg-accent-500"
            trend="up"
            trendValue="15.3"
            subtitle="Active groups"
          />
          <StatCard
            title="Total Loans"
            value={stats.totalLoans}
            icon={DollarSign}
            color="bg-neutral-800"
            trend="up"
            trendValue="22.1"
            subtitle="ZMW 2.4M disbursed"
          />
        </div>

        {/* Financial Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={Activity}
            color="bg-green-500"
            trend="up"
            trendValue="5.2"
            subtitle="Currently active"
          />
          <StatCard
            title="Repaid Loans"
            value={stats.repaidLoans}
            icon={TrendingUp}
            color="bg-blue-500"
            trend="up"
            trendValue="18.7"
            subtitle="Successfully repaid"
          />
          <StatCard
            title="Defaulted Loans"
            value={stats.defaultedLoans}
            icon={TrendingDown}
            color="bg-red-500"
            trend="down"
            trendValue="2.1"
            subtitle="Require attention"
          />
          <StatCard
            title="Outstanding Amount"
            value={stats.outstandingAmount}
            icon={DollarSign}
            color="bg-yellow-500"
            trend="up"
            trendValue="3.4"
            subtitle="ZMW to be collected"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Beneficiaries by Program */}
          <ChartCard title="Beneficiaries by Program">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={beneficiariesByProgram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {beneficiariesByProgram.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Loan Status Distribution */}
          <ChartCard title="Loan Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {loanStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-neutral-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Trends and Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Monthly Trends */}
          <ChartCard title="Monthly Trends" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="beneficiaries" 
                  stackId="1" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  stackId="2" 
                  stroke="#f97316" 
                  fill="#f97316" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Recent Activities */}
          <ChartCard title="Recent Activities">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-primary-500' :
                    activity.type === 'warning' ? 'bg-secondary-500' :
                    'bg-accent-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{activity.action}</p>
                    <p className="text-sm text-neutral-600 truncate">{activity.person}</p>
                    {activity.program && <p className="text-xs text-neutral-500">{activity.program}</p>}
                    {activity.amount && <p className="text-xs text-neutral-500">{activity.amount}</p>}
                    <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600 font-medium">
              View all activities
            </button>
          </ChartCard>
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Geographic Distribution */}
          <ChartCard title="Geographic Distribution">
            <div className="space-y-3">
              {geographicDistribution.length > 0 ? geographicDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{item.district}</p>
                      <p className="text-xs text-neutral-500">{item.province}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">{item.count}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p>No geographic data available</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Financial Summary */}
          <ChartCard title="Financial Summary">
            <div className="space-y-4">
              {financialSummary.length > 0 ? financialSummary.map((item, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-800">{item.type}</h4>
                    <span className="text-sm text-neutral-500">{item.count} items</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Total Amount:</span>
                      <span className="font-medium">ZMW {item.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total Repaid:</span>
                      <span className="font-medium">ZMW {item.totalRepaid?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-500">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p>No financial data available</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Program Performance & Group Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Program Performance */}
          <ChartCard title="Program Performance">
            <div className="space-y-4">
              {programPerformance.length > 0 ? programPerformance.map((item, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-800">{item.programName}</h4>
                    <span className="text-sm text-neutral-500">{item.beneficiaryCount} beneficiaries</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Budget Allocation:</span>
                      <span className="font-medium">ZMW {item.budgetAllocation?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total Disbursed:</span>
                      <span className="font-medium">ZMW {item.totalDisbursed?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ 
                          width: `${item.budgetAllocation > 0 ? (item.totalDisbursed / item.budgetAllocation) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p>No program performance data available</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Group Statistics */}
          <ChartCard title="Group Statistics">
            <div className="space-y-4">
              {groupStatistics.length > 0 ? groupStatistics.map((item, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-800">{item.groupType}</h4>
                    <span className="text-sm text-neutral-500">{item.groupCount} groups</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Total Membership Fees:</span>
                      <span className="font-medium">ZMW {item.totalMembershipFees?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Average per Group:</span>
                      <span className="font-medium">
                        ZMW {item.groupCount > 0 ? Math.round(item.totalMembershipFees / item.groupCount) : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-neutral-500">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p>No group statistics available</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button className="flex items-center space-x-3 p-3 sm:p-4 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group">
              <div className="p-2 bg-primary-500 rounded-lg group-hover:bg-primary-600 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-neutral-800">Register Beneficiary</p>
                <p className="text-xs sm:text-sm text-neutral-500">Add new person</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 border border-neutral-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all group">
              <div className="p-2 bg-secondary-500 rounded-lg group-hover:bg-secondary-600 transition-colors">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-neutral-800">Create Group</p>
                <p className="text-xs sm:text-sm text-neutral-500">New cooperative/club</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 border border-neutral-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all group">
              <div className="p-2 bg-accent-500 rounded-lg group-hover:bg-accent-600 transition-colors">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-neutral-800">Process Loan</p>
                <p className="text-xs sm:text-sm text-neutral-500">Approve funding</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 border border-neutral-200 rounded-lg hover:border-neutral-800 hover:bg-neutral-50 transition-all group">
              <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-neutral-900 transition-colors">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-neutral-800">Generate Report</p>
                <p className="text-xs sm:text-sm text-neutral-500">Export data</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
