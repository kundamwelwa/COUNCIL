import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Calendar,
  Filter,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    stats: {},
    beneficiariesByProgram: [],
    loanStatus: [],
    monthlyTrends: []
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, beneficiariesRes, loanStatusRes, trendsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/dashboard/beneficiaries-by-program', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/dashboard/loan-status', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/dashboard/monthly-trends', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setReportData({
        stats: statsRes.data.data,
        beneficiariesByProgram: beneficiariesRes.data.data,
        loanStatus: loanStatusRes.data.data,
        monthlyTrends: trendsRes.data.data
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting ${selectedReport} report as ${format}`);
    // In a real app, this would generate and download the file
  };

  const reportTypes = [
    { id: 'overview', name: 'Overview Report', icon: BarChart3 },
    { id: 'beneficiaries', name: 'Beneficiaries Report', icon: Users },
    { id: 'programs', name: 'Programs Report', icon: Building },
    { id: 'financial', name: 'Financial Report', icon: DollarSign },
    { id: 'trends', name: 'Trends Analysis', icon: TrendingUp }
  ];

  const chartColors = ['#22c55e', '#f97316', '#ef4444', '#1e293b', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Reports & Analytics</h1>
          <p className="text-neutral-600">Generate comprehensive reports and analytics</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedReport === report.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedReport === report.id ? 'text-primary-600' : 'text-neutral-600'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedReport === report.id ? 'text-primary-700' : 'text-neutral-700'
                }`}>
                  {report.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Date Range</h3>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>Apply Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {selectedReport === 'overview' && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm font-medium">Total Beneficiaries</p>
                    <p className="text-3xl font-bold text-neutral-800">{reportData.stats.totalPersons || 0}</p>
                  </div>
                  <div className="p-3 bg-primary-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm font-medium">Active Programs</p>
                    <p className="text-3xl font-bold text-neutral-800">{reportData.stats.totalPrograms || 0}</p>
                  </div>
                  <div className="p-3 bg-secondary-500 rounded-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm font-medium">Total Groups</p>
                    <p className="text-3xl font-bold text-neutral-800">{reportData.stats.totalGroups || 0}</p>
                  </div>
                  <div className="p-3 bg-accent-500 rounded-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm font-medium">Total Disbursed</p>
                    <p className="text-3xl font-bold text-neutral-800">
                      ZMW {(reportData.stats.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-800 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Beneficiaries by Program</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.beneficiariesByProgram}>
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
                      {reportData.beneficiariesByProgram.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Loan Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportData.loanStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportData.loanStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4">
                  {reportData.loanStatus.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      ></div>
                      <span className="text-sm text-neutral-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {selectedReport === 'trends' && (
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={reportData.monthlyTrends}>
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
          </div>
        )}

        {/* Print Button */}
        <div className="flex justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-900 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
