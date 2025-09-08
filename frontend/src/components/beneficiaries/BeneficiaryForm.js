import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Home,
  Tag,
  FileText,
  Shield,
  UserPlus,
  Calendar,
  ChevronDown,
  Check,
  X,
  Clock
} from 'lucide-react';

// Custom Date Picker Component (UntitledUI Style)
const DatePicker = ({ value, onChange, placeholder = "Select date", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');
  const [viewDate, setViewDate] = useState(new Date());
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between hover:border-neutral-400 dark:hover:border-gray-500 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-neutral-400 dark:text-gray-400" />
          <span className={selectedDate ? "text-neutral-800 dark:text-white" : "text-neutral-400 dark:text-gray-400"}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronDown className="w-4 h-4 rotate-90 text-neutral-600 dark:text-gray-400" />
            </button>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronDown className="w-4 h-4 -rotate-90 text-neutral-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-neutral-500 dark:text-gray-400 text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(viewDate).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date && (
                    <button
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      className={`w-full h-full text-xs rounded-lg transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                        isSelected(date)
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : isToday(date)
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                          : 'text-neutral-700 dark:text-gray-300'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setSelectedDate('');
                onChange?.('');
                setIsOpen(false);
              }}
              className="text-xs text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Select Component (UntitledUI Style)
const Select = ({ value, onChange, options, placeholder = "Select option", className = "", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between hover:border-neutral-400 dark:hover:border-gray-500 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-neutral-400 dark:text-gray-400" />}
          <span className={selectedOption ? "text-neutral-800 dark:text-white" : "text-neutral-400 dark:text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                option.value === value 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-neutral-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {option.icon && <option.icon className="w-4 h-4" />}
                <span>{option.label}</span>
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Checkbox Component
const Checkbox = ({ checked, onChange, label, description, className = "" }) => {
  return (
    <label className={`flex items-start cursor-pointer ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 transition-all ${
          checked 
            ? 'bg-primary-500 border-primary-500' 
            : 'border-neutral-300 dark:border-gray-600 hover:border-neutral-400 dark:hover:border-gray-500'
        }`}>
          {checked && (
            <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </div>
      <div className="ml-3">
        <span className="text-sm text-neutral-700 dark:text-gray-300">{label}</span>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </label>
  );
};

const BeneficiaryForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingBeneficiary, 
  programs = [],
  formData,
  setFormData
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const genderOptions = [
    { value: 'Male', label: 'Male', icon: User },
    { value: 'Female', label: 'Female', icon: User },
    { value: 'Other', label: 'Other', icon: User }
  ];

  const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
  ];

  const employmentStatusOptions = [
    { value: 'Employed', label: 'Employed' },
    { value: 'Self-Employed', label: 'Self-Employed' },
    { value: 'Unemployed', label: 'Unemployed' },
    { value: 'Student', label: 'Student' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Farmer', label: 'Farmer' },
    { value: 'Housewife/Househusband', label: 'Housewife/Househusband' }
  ];

  const incomeLevelOptions = [
    { value: 'No Income', label: 'No Income' },
    { value: 'Below K500', label: 'Below K500' },
    { value: 'K500 - K1,000', label: 'K500 - K1,000' },
    { value: 'K1,000 - K2,500', label: 'K1,000 - K2,500' },
    { value: 'K2,500 - K5,000', label: 'K2,500 - K5,000' },
    { value: 'Above K5,000', label: 'Above K5,000' }
  ];

  const educationLevelOptions = [
    { value: 'No Formal Education', label: 'No Formal Education' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Tertiary', label: 'Tertiary' },
    { value: 'University', label: 'University' },
    { value: 'Postgraduate', label: 'Postgraduate' }
  ];

  const provinceOptions = [
    { value: 'Central', label: 'Central' },
    { value: 'Copperbelt', label: 'Copperbelt' },
    { value: 'Eastern', label: 'Eastern' },
    { value: 'Luapula', label: 'Luapula' },
    { value: 'Lusaka', label: 'Lusaka' },
    { value: 'Muchinga', label: 'Muchinga' },
    { value: 'Northern', label: 'Northern' },
    { value: 'North-Western', label: 'North-Western' },
    { value: 'Southern', label: 'Southern' },
    { value: 'Western', label: 'Western' }
  ];

  const housingTypeOptions = [
    { value: 'Own House', label: 'Own House' },
    { value: 'Rented', label: 'Rented' },
    { value: 'Family House', label: 'Family House' },
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Government Quarters', label: 'Government Quarters' },
    { value: 'Other', label: 'Other' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Bemba', label: 'Bemba' },
    { value: 'Nyanja', label: 'Nyanja' },
    { value: 'Tonga', label: 'Tonga' },
    { value: 'Lozi', label: 'Lozi' },
    { value: 'Other', label: 'Other' }
  ];

  const healthStatusOptions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
    { value: 'Chronic Condition', label: 'Chronic Condition' }
  ];

  const documentationStatusOptions = [
    { value: 'Complete', label: 'Complete' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Missing', label: 'Missing' },
    { value: 'In Process', label: 'In Process' }
  ];

  const programOptions = [
    { value: '', label: 'No Program (Standalone)' },
    ...programs.map(program => ({
      value: program.program_id,
      label: `${program.program_name} - ${program.program_type}`
    }))
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white flex items-center">
                <UserPlus className="w-6 h-6 mr-3 text-primary-500" />
                {editingBeneficiary ? 'Edit Beneficiary' : 'Register New Beneficiary'}
              </h2>
              <p className="text-neutral-600 dark:text-gray-400 mt-1">
                Complete all required information for beneficiary registration
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  National ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.national_id}
                  onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter national ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <Select
                  value={formData.gender}
                  onChange={(value) => setFormData({...formData, gender: value})}
                  options={genderOptions}
                  placeholder="Select gender"
                  icon={User}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <DatePicker
                  value={formData.dob}
                  onChange={(value) => setFormData({...formData, dob: value})}
                  placeholder="Select date of birth"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Marital Status
                </label>
                <Select
                  value={formData.marital_status}
                  onChange={(value) => setFormData({...formData, marital_status: value})}
                  options={maritalStatusOptions}
                  placeholder="Select marital status"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Preferred Language
                </label>
                <Select
                  value={formData.preferred_language}
                  onChange={(value) => setFormData({...formData, preferred_language: value})}
                  options={languageOptions}
                  placeholder="Select language"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter emergency contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter emergency contact phone"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Next of Kin
                </label>
                <input
                  type="text"
                  value={formData.next_of_kin}
                  onChange={(e) => setFormData({...formData, next_of_kin: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter next of kin"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Location & Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Province
                </label>
                <Select
                  value={formData.province}
                  onChange={(value) => setFormData({...formData, province: value})}
                  options={provinceOptions}
                  placeholder="Select province"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter district"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Housing Type
                </label>
                <Select
                  value={formData.housing_type}
                  onChange={(value) => setFormData({...formData, housing_type: value})}
                  options={housingTypeOptions}
                  placeholder="Select housing type"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Full Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter complete residential address"
                />
              </div>
            </div>
          </div>

          {/* Economic Information */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Economic & Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Employment Status
                </label>
                <Select
                  value={formData.employment_status}
                  onChange={(value) => setFormData({...formData, employment_status: value})}
                  options={employmentStatusOptions}
                  placeholder="Select employment status"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Current job or occupation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Monthly Income (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Income Level
                </label>
                <Select
                  value={formData.income_level}
                  onChange={(value) => setFormData({...formData, income_level: value})}
                  options={incomeLevelOptions}
                  placeholder="Select income level"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Education Level
                </label>
                <Select
                  value={formData.education_level}
                  onChange={(value) => setFormData({...formData, education_level: value})}
                  options={educationLevelOptions}
                  placeholder="Select education level"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter bank account number"
                />
              </div>
            </div>
          </div>

          {/* Household Information */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <Home className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
              Household Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Household Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.household_size}
                  onChange={(e) => setFormData({...formData, household_size: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Number of people"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dependents}
                  onChange={(e) => setFormData({...formData, dependents: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Children and other dependents"
                />
              </div>
              
              <div className="flex items-center">
                <Checkbox
                  checked={formData.household_head}
                  onChange={(value) => setFormData({...formData, household_head: value})}
                  label="Household Head"
                  description="Check if this person is the head of household"
                />
              </div>
            </div>
          </div>

          {/* Program Assignment */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Program Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Assign to Program
                </label>
                <Select
                  value={formData.program_id}
                  onChange={(value) => setFormData({...formData, program_id: value})}
                  options={programOptions}
                  placeholder="Select program"
                />
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-2">
                  Leave empty if beneficiary is not enrolled in any specific program
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Application Reason
                </label>
                <textarea
                  value={formData.application_reason}
                  onChange={(e) => setFormData({...formData, application_reason: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  placeholder="Reason for applying to this program..."
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-pink-600 dark:text-pink-400" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Health Status
                </label>
                <Select
                  value={formData.health_status}
                  onChange={(value) => setFormData({...formData, health_status: value})}
                  options={healthStatusOptions}
                  placeholder="Select health status"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Documentation Status
                </label>
                <Select
                  value={formData.documentation_status}
                  onChange={(value) => setFormData({...formData, documentation_status: value})}
                  options={documentationStatusOptions}
                  placeholder="Select documentation status"
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <Checkbox
                  checked={formData.disability_status}
                  onChange={(value) => setFormData({...formData, disability_status: value})}
                  label="Person with disability"
                  description="Check if the beneficiary has any form of disability"
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Special Needs
                  </label>
                  <textarea
                    value={formData.special_needs}
                    onChange={(e) => setFormData({...formData, special_needs: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any special needs or requirements..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Previous Assistance
                  </label>
                  <textarea
                    value={formData.previous_assistance}
                    onChange={(e) => setFormData({...formData, previous_assistance: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Details of any previous government assistance..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consent Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
              Consent & Privacy
            </h3>
            <div className="space-y-4">
              <Checkbox
                checked={formData.consent_data_sharing}
                onChange={(value) => setFormData({...formData, consent_data_sharing: value})}
                label="Data Sharing Consent"
                description="I consent to the sharing of my personal data with relevant government agencies and program partners for the purpose of service delivery and program evaluation."
              />
              
              <Checkbox
                checked={formData.consent_communication}
                onChange={(value) => setFormData({...formData, consent_communication: value})}
                label="Communication Consent"
                description="I consent to receive communications about programs, services, and updates via phone, SMS, or email."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-neutral-200 dark:border-gray-700 p-6 rounded-b-2xl">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>{editingBeneficiary ? 'Update' : 'Register'} Beneficiary</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryForm;
