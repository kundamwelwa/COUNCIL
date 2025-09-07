import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Shield,
  BarChart3,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleCollapse, user }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Beneficiaries',
      href: '/beneficiaries',
      icon: Users,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Programs',
      href: '/programs',
      icon: Building2,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Groups',
      href: '/groups',
      icon: UserCheck,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Loans & Grants',
      href: '/loans',
      icon: CreditCard,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']
    }
  ];

  const adminItems = [
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Shield,
      roles: ['SuperAdmin']
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['SuperAdmin']
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ClipboardList,
      roles: ['SuperAdmin']
    },
    {
      name: 'System Status',
      href: '/admin/system-status',
      icon: BarChart3,
      roles: ['SuperAdmin']
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const filteredAdminItems = adminItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className={`bg-gradient-to-b from-gray-700 via-gray-600 to-gray-800 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col shadow-xl`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 rounded-tr-2xl">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Council</h1>
                <p className="text-xs text-white/70">Management System</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-white/20">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive(item.href)
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {filteredAdminItems.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="mt-6 mb-2">
                  <h3 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {filteredAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                        isActive(item.href)
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/20">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/10">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {user?.role || 'Role'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-white/80 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-4 h-4 text-white" />
                  </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 text-white/80 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
