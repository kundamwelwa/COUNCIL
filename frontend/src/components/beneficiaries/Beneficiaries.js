import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  Building2,
  Heart,
  Briefcase,
  Home,
  Globe,
  FileText,
  Tag,
  UserPlus,
  Upload,
  BarChart3,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  FileSpreadsheet,
  Bell,
  Settings,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import axios from 'axios';
import BeneficiaryForm from './BeneficiaryForm';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    gender: '',
    dob: '',
    phone_number: '',
    email: '',
    address: '',
    district: '',
    province: '',
    marital_status: '',
    employment_status: '',
    income_level: '',
    disability_status: false,
    program_id: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    education_level: '',
    household_size: '',
    housing_type: '',
    monthly_income: '',
    bank_account: '',
    next_of_kin: '',
    next_of_kin_phone: '',
    special_needs: '',
    previous_assistance: '',
    application_reason: '',
    occupation: '',
    dependents: '',
    health_status: '',
    preferred_language: '',
    documentation_status: '',
    benefits_received: '',
    household_head: false,
    consent_data_sharing: false,
    consent_communication: false
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalBeneficiaries: 0,
    newThisMonth: 0,
    activePrograms: 0,
    pendingApplications: 0,
    demographics: {},
    programDistribution: {}
  });

  useEffect(() => {
    fetchBeneficiaries();
    fetchPrograms();
    fetchAnalytics();
  }, []);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and Sort options
  const filterOptions = [
    { value: 'all', label: 'All Beneficiaries', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { value: 'male', label: 'Male Only', icon: User, color: 'text-green-600 dark:text-green-400' },
    { value: 'female', label: 'Female Only', icon: User, color: 'text-pink-600 dark:text-pink-400' },
    { value: 'with-program', label: 'With Program', icon: Building2, color: 'text-purple-600 dark:text-purple-400' },
    { value: 'without-program', label: 'Standalone', icon: UserCheck, color: 'text-orange-600 dark:text-orange-400' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created', icon: Calendar, color: 'text-blue-600 dark:text-blue-400' },
    { value: 'first_name', label: 'First Name', icon: User, color: 'text-green-600 dark:text-green-400' },
    { value: 'last_name', label: 'Last Name', icon: User, color: 'text-purple-600 dark:text-purple-400' },
    { value: 'national_id', label: 'National ID', icon: CreditCard, color: 'text-orange-600 dark:text-orange-400' }
  ];

  const fetchBeneficiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/persons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBeneficiaries(response.data.data || []);
      calculateAnalytics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      // In a real app, this would be a dedicated analytics endpoint
      const response = await axios.get('http://localhost:5000/api/persons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      calculateAnalytics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const calculateAnalytics = (data) => {
    const now = new Date();
    const thisMonth = data.filter(b => {
      const created = new Date(b.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });

    const demographics = data.reduce((acc, b) => {
      acc[b.gender] = (acc[b.gender] || 0) + 1;
      return acc;
    }, {});

    setAnalytics({
      totalBeneficiaries: data.length,
      newThisMonth: thisMonth.length,
      activePrograms: new Set(data.map(b => b.program_id).filter(Boolean)).size,
      pendingApplications: data.filter(b => b.status === 'pending').length,
      demographics,
      programDistribution: {}
    });
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the complete form data
      const submitData = {
        ...formData,
        household_size: formData.household_size ? parseInt(formData.household_size) : null,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        dependents: formData.dependents ? parseInt(formData.dependents) : null,
        // Convert boolean strings to actual booleans
        disability_status: formData.disability_status === true || formData.disability_status === 'true',
        household_head: formData.household_head === true || formData.household_head === 'true',
        consent_data_sharing: formData.consent_data_sharing === true || formData.consent_data_sharing === 'true',
        consent_communication: formData.consent_communication === true || formData.consent_communication === 'true'
      };
      
      if (editingBeneficiary) {
        await axios.put(`http://localhost:5000/api/persons/${editingBeneficiary.person_id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/persons', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      setEditingBeneficiary(null);
      resetForm();
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      alert('Error saving beneficiary. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      national_id: '',
      gender: '',
      dob: '',
      phone_number: '',
      email: '',
      address: '',
      district: '',
      province: '',
      marital_status: '',
      employment_status: '',
      income_level: '',
      disability_status: false,
      program_id: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      education_level: '',
      household_size: '',
      housing_type: '',
      monthly_income: '',
      bank_account: '',
      next_of_kin: '',
      next_of_kin_phone: '',
      special_needs: '',
      previous_assistance: '',
      application_reason: '',
      occupation: '',
      dependents: '',
      health_status: '',
      preferred_language: '',
      documentation_status: '',
      benefits_received: '',
      household_head: false,
      consent_data_sharing: false,
      consent_communication: false
    });
  };

  const handleEdit = (beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      first_name: beneficiary.first_name || '',
      last_name: beneficiary.last_name || '',
      national_id: beneficiary.national_id || '',
      gender: beneficiary.gender || '',
      dob: beneficiary.dob || '',
      phone_number: beneficiary.phone_number || '',
      email: beneficiary.email || '',
      address: beneficiary.address || '',
      district: beneficiary.district || '',
      province: beneficiary.province || '',
      marital_status: beneficiary.marital_status || '',
      employment_status: beneficiary.employment_status || '',
      income_level: beneficiary.income_level || '',
      disability_status: beneficiary.disability_status || false,
      program_id: beneficiary.program_id || '',
      emergency_contact_name: beneficiary.emergency_contact_name || '',
      emergency_contact_phone: beneficiary.emergency_contact_phone || '',
      education_level: beneficiary.education_level || '',
      household_size: beneficiary.household_size || '',
      housing_type: beneficiary.housing_type || '',
      monthly_income: beneficiary.monthly_income || '',
      bank_account: beneficiary.bank_account || '',
      next_of_kin: beneficiary.next_of_kin || '',
      next_of_kin_phone: beneficiary.next_of_kin_phone || '',
      special_needs: beneficiary.special_needs || '',
      previous_assistance: beneficiary.previous_assistance || '',
      application_reason: beneficiary.application_reason || '',
      occupation: beneficiary.occupation || '',
      dependents: beneficiary.dependents || '',
      health_status: beneficiary.health_status || '',
      preferred_language: beneficiary.preferred_language || '',
      documentation_status: beneficiary.documentation_status || '',
      benefits_received: beneficiary.benefits_received || '',
      household_head: beneficiary.household_head || false,
      consent_data_sharing: beneficiary.consent_data_sharing || false,
      consent_communication: beneficiary.consent_communication || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/persons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBeneficiaries();
      } catch (error) {
        console.error('Error deleting beneficiary:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedBeneficiaries.length} beneficiaries?`)) {
      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          selectedBeneficiaries.map(id =>
            axios.delete(`http://localhost:5000/api/persons/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        setSelectedBeneficiaries([]);
        setShowBulkActions(false);
        fetchBeneficiaries();
      } catch (error) {
        console.error('Error bulk deleting beneficiaries:', error);
      }
    }
  };

  const handleExport = (format) => {
    // Export functionality
    const exportData = filteredBeneficiaries.map(b => ({
      'First Name': b.first_name,
      'Last Name': b.last_name,
      'National ID': b.national_id,
      'Gender': b.gender,
      'Phone': b.phone_number,
      'Email': b.email,
      'Address': b.address,
      'Province': b.province,
      'District': b.district
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'beneficiaries.csv';
      a.click();
    }
    setShowExportModal(false);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          
          // Process CSV data here
          console.log('CSV imported:', { headers, lines: lines.length });
          alert('Import functionality would be implemented here');
        } catch (error) {
          console.error('Error importing file:', error);
          alert('Error importing file');
        }
      };
      reader.readAsText(file);
    }
    setShowImportModal(false);
  };

  // Filtering and sorting
  const filteredBeneficiaries = beneficiaries
    .filter(beneficiary => {
      const matchesSearch = beneficiary.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.national_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.phone_number?.includes(searchTerm);
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'male' && beneficiary.gender === 'Male') ||
        (filterBy === 'female' && beneficiary.gender === 'Female') ||
        (filterBy === 'with-program' && beneficiary.program_id) ||
        (filterBy === 'without-program' && !beneficiary.program_id);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });

  // Pagination
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full Width Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Beneficiaries Management</h1>
            <p className="text-neutral-600 dark:text-gray-400 mt-2">
              Comprehensive beneficiary registration and management system
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New</span>
            </button>
          </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200/60 dark:border-gray-700/60 p-8 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white">Analytics Overview</h2>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">Real-time beneficiary insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/60 dark:border-gray-700/60 text-center group hover:shadow-lg transition-all">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{analytics.totalBeneficiaries}</div>
                <div className="text-sm text-neutral-600 dark:text-gray-400 font-medium">Total Beneficiaries</div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/60 dark:border-gray-700/60 text-center group hover:shadow-lg transition-all">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{analytics.newThisMonth}</div>
                <div className="text-sm text-neutral-600 dark:text-gray-400 font-medium">New This Month</div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/60 dark:border-gray-700/60 text-center group hover:shadow-lg transition-all">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{analytics.activePrograms}</div>
                <div className="text-sm text-neutral-600 dark:text-gray-400 font-medium">Active Programs</div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/60 dark:border-gray-700/60 text-center group hover:shadow-lg transition-all">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{analytics.pendingApplications}</div>
                <div className="text-sm text-neutral-600 dark:text-gray-400 font-medium">Pending Applications</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 dark:text-gray-400 text-sm font-medium">Total Beneficiaries</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-white">{beneficiaries.length}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-primary-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 dark:text-gray-400 text-sm font-medium">Active Programs</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-white">{programs.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                  <UserCheck className="w-3 h-3 mr-1" />
                  {beneficiaries.filter(b => b.program_id).length} enrolled
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 dark:text-gray-400 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-white">
                  {beneficiaries.filter(b => {
                    const created = new Date(b.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  New registrations
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 dark:text-gray-400 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-white">
                  {beneficiaries.filter(b => b.status === 'pending').length}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting approval
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search, Filter, and Bulk Actions */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200/60 dark:border-gray-700/60 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-neutral-400 dark:text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder-neutral-400 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Professional Filter Dropdowns with Custom Overlays */}
              <div className="flex space-x-3">
                {/* Custom Filter By Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => {
                      setShowFilterDropdown(!showFilterDropdown);
                      setShowSortDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 pr-10 border-2 border-neutral-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    {(() => {
                      const selectedOption = filterOptions.find(option => option.value === filterBy);
                      const IconComponent = selectedOption?.icon || Users;
                      return (
                        <>
                          <IconComponent className={`w-4 h-4 ${selectedOption?.color || 'text-blue-600 dark:text-blue-400'}`} />
                          <span className="text-sm font-medium">{selectedOption?.label || 'All Beneficiaries'}</span>
                        </>
                      );
                    })()}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-gray-400 transition-transform absolute right-3 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-neutral-200/60 dark:border-gray-700/60 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      {filterOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterBy(option.value);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-100/80 dark:hover:bg-gray-700/80 transition-colors ${
                              filterBy === option.value ? 'bg-primary-50/80 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-gray-300'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 ${option.color}`} />
                            <span className="text-sm font-medium">{option.label}</span>
                            {filterBy === option.value && (
                              <CheckCircle className="w-4 h-4 text-primary-500 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Sort By Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown);
                      setShowFilterDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 pr-10 border-2 border-neutral-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    {(() => {
                      const selectedOption = sortOptions.find(option => option.value === sortBy);
                      const IconComponent = selectedOption?.icon || Calendar;
                      return (
                        <>
                          <IconComponent className={`w-4 h-4 ${selectedOption?.color || 'text-blue-600 dark:text-blue-400'}`} />
                          <span className="text-sm font-medium">{selectedOption?.label || 'Date Created'}</span>
                        </>
                      );
                    })()}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-gray-400 transition-transform absolute right-3 ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-neutral-200/60 dark:border-gray-700/60 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      {sortOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-100/80 dark:hover:bg-gray-700/80 transition-colors ${
                              sortBy === option.value ? 'bg-primary-50/80 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-gray-300'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 ${option.color}`} />
                            <span className="text-sm font-medium">{option.label}</span>
                            {sortBy === option.value && (
                              <CheckCircle className="w-4 h-4 text-primary-500 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 border-2 border-neutral-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all shadow-sm hover:shadow-md group"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? 
                    <SortAsc className="w-5 h-5 text-neutral-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors" /> : 
                    <SortDesc className="w-5 h-5 text-neutral-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors" />
                  }
                </button>
              </div>
            </div>

            {/* Enhanced Bulk Actions */}
            {selectedBeneficiaries.length > 0 && (
              <div className="flex items-center space-x-4 animate-in slide-in-from-right duration-300">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-neutral-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-neutral-600 dark:text-gray-400">
                    {selectedBeneficiaries.length} selected
                  </span>
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Beneficiaries Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-neutral-200/60 dark:border-gray-700/60 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-700">
              <thead className="bg-neutral-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBeneficiaries(paginatedBeneficiaries.map(b => b.person_id));
                        } else {
                          setSelectedBeneficiaries([]);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    National ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    Programs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-neutral-200 dark:divide-gray-700">
                {paginatedBeneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.person_id} className="hover:bg-neutral-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBeneficiaries.includes(beneficiary.person_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBeneficiaries([...selectedBeneficiaries, beneficiary.person_id]);
                          } else {
                            setSelectedBeneficiaries(selectedBeneficiaries.filter(id => id !== beneficiary.person_id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-300 font-medium text-sm">
                            {beneficiary.first_name?.charAt(0)}{beneficiary.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {beneficiary.first_name} {beneficiary.last_name}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-gray-400">
                            {beneficiary.gender}
                          </div>
                          {beneficiary.address && (
                            <div className="text-xs text-neutral-400 dark:text-gray-500 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {beneficiary.address.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-neutral-900 dark:text-white">
                        <CreditCard className="w-4 h-4 mr-2 text-neutral-400 dark:text-gray-400" />
                        {beneficiary.national_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {beneficiary.phone_number && (
                          <div className="flex items-center mb-1">
                            <Phone className="w-4 h-4 mr-2 text-neutral-400 dark:text-gray-400" />
                            {beneficiary.phone_number}
                          </div>
                        )}
                        {beneficiary.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-neutral-400 dark:text-gray-400" />
                            {beneficiary.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {beneficiary.program_id ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            No Program
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        beneficiary.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : beneficiary.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {beneficiary.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* View beneficiary details */}}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(beneficiary)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(beneficiary.person_id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="px-8 py-6 bg-gradient-to-r from-neutral-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-neutral-200/60 dark:border-gray-700/60 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-neutral-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                    Showing <span className="text-primary-600 dark:text-primary-400 font-semibold">{startIndex + 1}</span> to{' '}
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">{Math.min(startIndex + itemsPerPage, filteredBeneficiaries.length)}</span> of{' '}
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">{filteredBeneficiaries.length}</span> results
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border-2 border-neutral-300 dark:border-gray-600 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors" />
                </button>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-neutral-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                    Page <span className="text-primary-600 dark:text-primary-400 font-semibold">{currentPage}</span> of{' '}
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">{totalPages}</span>
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border-2 border-neutral-300 dark:border-gray-600 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Registration Modal */}
        <BeneficiaryForm
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingBeneficiary(null);
            resetForm();
          }}
          onSubmit={handleSubmit}
          editingBeneficiary={editingBeneficiary}
          programs={programs}
          formData={formData}
          setFormData={setFormData}
        />

        {false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white flex items-center">
                  <UserPlus className="w-6 h-6 mr-3" />
                  {editingBeneficiary ? 'Edit Beneficiary' : 'Register New Beneficiary'}
                </h2>
                <p className="text-neutral-600 dark:text-gray-400 mt-1">
                  Complete all required information for beneficiary registration
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        National ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.national_id}
                        onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Gender *
                      </label>
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Marital Status
                      </label>
                      <select
                        value={formData.marital_status}
                        onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Preferred Language
                      </label>
                      <select
                        value={formData.preferred_language}
                        onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Bemba">Bemba</option>
                        <option value="Nyanja">Nyanja</option>
                        <option value="Tonga">Tonga</option>
                        <option value="Lozi">Lozi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Next of Kin
                      </label>
                      <input
                        type="text"
                        value={formData.next_of_kin}
                        onChange={(e) => setFormData({...formData, next_of_kin: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location & Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Province
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Province</option>
                        <option value="Central">Central</option>
                        <option value="Copperbelt">Copperbelt</option>
                        <option value="Eastern">Eastern</option>
                        <option value="Luapula">Luapula</option>
                        <option value="Lusaka">Lusaka</option>
                        <option value="Muchinga">Muchinga</option>
                        <option value="Northern">Northern</option>
                        <option value="North-Western">North-Western</option>
                        <option value="Southern">Southern</option>
                        <option value="Western">Western</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Housing Type
                      </label>
                      <select
                        value={formData.housing_type}
                        onChange={(e) => setFormData({...formData, housing_type: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Housing Type</option>
                        <option value="Own House">Own House</option>
                        <option value="Rented">Rented</option>
                        <option value="Family House">Family House</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Government Quarters">Government Quarters</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Full Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter complete residential address"
                      />
                    </div>
                  </div>
                </div>

                {/* Economic Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Economic & Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Employment Status
                      </label>
                      <select
                        value={formData.employment_status}
                        onChange={(e) => setFormData({...formData, employment_status: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Employment Status</option>
                        <option value="Employed">Employed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Student">Student</option>
                        <option value="Retired">Retired</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Housewife/Househusband">Housewife/Househusband</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Current job or occupation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Monthly Income (ZMW)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.monthly_income}
                        onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Income Level
                      </label>
                      <select
                        value={formData.income_level}
                        onChange={(e) => setFormData({...formData, income_level: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Income Level</option>
                        <option value="No Income">No Income</option>
                        <option value="Below K500">Below K500</option>
                        <option value="K500 - K1,000">K500 - K1,000</option>
                        <option value="K1,000 - K2,500">K1,000 - K2,500</option>
                        <option value="K2,500 - K5,000">K2,500 - K5,000</option>
                        <option value="Above K5,000">Above K5,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.bank_account}
                        onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Education Level
                      </label>
                      <select
                        value={formData.education_level}
                        onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Education Level</option>
                        <option value="No Formal Education">No Formal Education</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Tertiary">Tertiary</option>
                        <option value="University">University</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Household Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Household Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Household Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.household_size}
                        onChange={(e) => setFormData({...formData, household_size: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Number of people"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Number of Dependents
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.dependents}
                        onChange={(e) => setFormData({...formData, dependents: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Children and other dependents"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                        Household Head
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.household_head}
                          onChange={(e) => setFormData({...formData, household_head: e.target.checked})}
                          className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-gray-300">
                          Is household head
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Program Assignment */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Program Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Assign to Program
                      </label>
                      <select
                        value={formData.program_id}
                        onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">No Program (Standalone)</option>
                        {programs.map((program) => (
                          <option key={program.program_id} value={program.program_id}>
                            {program.program_name} - {program.program_type}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                        Leave empty if beneficiary is not enrolled in any specific program
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Application Reason
                      </label>
                      <textarea
                        value={formData.application_reason}
                        onChange={(e) => setFormData({...formData, application_reason: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Reason for applying to this program..."
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Health Status
                      </label>
                      <select
                        value={formData.health_status}
                        onChange={(e) => setFormData({...formData, health_status: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Health Status</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="Chronic Condition">Chronic Condition</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Documentation Status
                      </label>
                      <select
                        value={formData.documentation_status}
                        onChange={(e) => setFormData({...formData, documentation_status: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Documentation Status</option>
                        <option value="Complete">Complete</option>
                        <option value="Partial">Partial</option>
                        <option value="Missing">Missing</option>
                        <option value="In Process">In Process</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                        Disability Status
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.disability_status}
                          onChange={(e) => setFormData({...formData, disability_status: e.target.checked})}
                          className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-gray-300">
                          Person with disability
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Special Needs
                      </label>
                      <textarea
                        value={formData.special_needs}
                        onChange={(e) => setFormData({...formData, special_needs: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Any special needs or requirements..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Previous Assistance
                      </label>
                      <textarea
                        value={formData.previous_assistance}
                        onChange={(e) => setFormData({...formData, previous_assistance: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Details of any previous government assistance..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Benefits Received
                      </label>
                      <textarea
                        value={formData.benefits_received}
                        onChange={(e) => setFormData({...formData, benefits_received: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Current or past benefits received..."
                      />
                    </div>
                  </div>
                </div>

                {/* Consent Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Consent & Privacy
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.consent_data_sharing}
                        onChange={(e) => setFormData({...formData, consent_data_sharing: e.target.checked})}
                        className="mr-3 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-gray-300">
                        I consent to the sharing of my personal data with relevant government agencies and program partners for the purpose of service delivery and program evaluation.
                      </span>
                    </label>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.consent_communication}
                        onChange={(e) => setFormData({...formData, consent_communication: e.target.checked})}
                        className="mr-3 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-gray-300">
                        I consent to receive communications about programs, services, and updates via phone, SMS, or email.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBeneficiary(null);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {editingBeneficiary ? 'Update' : 'Register'} Beneficiary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-neutral-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">Import Beneficiaries</h3>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">Upload data from CSV file</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/60 dark:border-blue-700/60">
                  <p className="text-sm text-neutral-700 dark:text-gray-300 leading-relaxed">
                    Upload a CSV file with beneficiary data. Required columns: <span className="font-semibold text-blue-600 dark:text-blue-400">first_name, last_name, national_id, gender</span>. Optional: phone, email, address.
                  </p>
                </div>
                
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="sr-only"
                  />
                  <div className="border-2 border-dashed border-neutral-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer group"
                       onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-12 h-12 text-neutral-400 dark:text-gray-400 group-hover:text-primary-500 mx-auto mb-4 transition-colors" />
                    <p className="text-sm font-medium text-neutral-600 dark:text-gray-300 mb-1">Click to upload CSV file</p>
                    <p className="text-xs text-neutral-400 dark:text-gray-500">or drag and drop</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-gray-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-neutral-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">Export Beneficiaries</h3>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">Download data in your preferred format</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200/60 dark:border-orange-700/60">
                  <p className="text-sm text-neutral-700 dark:text-gray-300">
                    Exporting <span className="font-semibold text-orange-600 dark:text-orange-400">{filteredBeneficiaries.length} beneficiaries</span> based on current filters.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center space-x-4 px-6 py-4 border-2 border-neutral-200 dark:border-gray-600 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors">
                      <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-neutral-800 dark:text-white">Export as CSV</div>
                      <div className="text-xs text-neutral-500 dark:text-gray-400">Comma-separated values for spreadsheets</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center space-x-4 px-6 py-4 border-2 border-neutral-200 dark:border-gray-600 rounded-xl hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                  >
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/60 transition-colors">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-neutral-800 dark:text-white">Export as PDF</div>
                      <div className="text-xs text-neutral-500 dark:text-gray-400">Formatted document for printing</div>
                    </div>
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-gray-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;
