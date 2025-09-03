import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail
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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalPrograms: 0,
    totalGroups: 0,
    totalLoans: 0,
    activeLoans: 0,
    repaidLoans: 0,
    defaultedLoans: 0
  });

  // Mock data for demonstration
  const mockStats = {
    totalPersons: 2847,
    totalPrograms: 6,
    totalGroups: 142,
    totalLoans: 89,
    activeLoans: 45,
    repaidLoans: 38,
    defaultedLoans: 6
  };

  const beneficiariesByProgram = [
    { name: 'Bursaries', count: 1205, color: '#22c55e' },
    { name: 'SMEs', count: 856, color: '#f97316' },
    { name: 'Social Welfare', count: 432, color: '#ef4444' },
    { name: 'FISP', count: 234, color: '#1e293b' },
    { name: 'Cooperatives', count: 89, color: '#3b82f6' },
    { name: 'Clubs', count: 31, color: '#8b5cf6' }
  ];

  const loanStatusData = [
    { name: 'Active', value: 45, color: '#22c55e' },
    { name: 'Repaid', value: 38, color: '#f97316' },
    { name: 'Defaulted', value: 6, color: '#ef4444' }
  ];

  const monthlyTrends = [
    { month: 'Jan', beneficiaries: 120, loans: 8 },
    { month: 'Feb', beneficiaries: 145, loans: 12 },
    { month: 'Mar', beneficiaries: 189, loans: 15 },
    { month: 'Apr', beneficiaries: 234, loans: 18 },
    { month: 'May', beneficiaries: 267, loans: 22 },
    { month: 'Jun', beneficiaries: 298, loans: 25 }
  ];

  const recentActivities = [
    { id: 1, action: 'New beneficiary registered', person: 'John Mwamba', program: 'Bursaries', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Loan approved', person: 'SME Group Alpha', amount: 'ZMW 15,000', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Repayment received', person: 'Cooperative Beta', amount: 'ZMW 8,500', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'New group created', person: 'Youth Club Gamma', program: 'Clubs', time: '1 day ago', type: 'info' },
    { id: 5, action: 'Beneficiary updated', person: 'Mary Chisenga', program: 'Social Welfare', time: '2 days ago', type: 'warning' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-neutral-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
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
              <span className="text-xs text-neutral-500 ml-1">vs last month</span>
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
    <div className={`bg-white rounded-xl shadow-lg border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        <div className="flex space-x-2">
          <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-800">Council Management System</h1>
                  <p className="text-sm text-neutral-500">Beneficiaries & Fund Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search beneficiaries..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Dashboard Overview</h2>
          <p className="text-neutral-600">Welcome to the Council Beneficiaries Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group">
              <div className="p-2 bg-primary-500 rounded-lg group-hover:bg-primary-600 transition-colors">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-800">Register Beneficiary</p>
                <p className="text-sm text-neutral-500">Add new person</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all group">
              <div className="p-2 bg-secondary-500 rounded-lg group-hover:bg-secondary-600 transition-colors">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-800">Create Group</p>
                <p className="text-sm text-neutral-500">New cooperative/club</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all group">
              <div className="p-2 bg-accent-500 rounded-lg group-hover:bg-accent-600 transition-colors">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-800">Process Loan</p>
                <p className="text-sm text-neutral-500">Approve funding</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-neutral-800 hover:bg-neutral-50 transition-all group">
              <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-neutral-900 transition-colors">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-800">Generate Report</p>
                <p className="text-sm text-neutral-500">Export data</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
