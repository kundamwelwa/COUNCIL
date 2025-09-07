import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import GlobalSearch from '../common/GlobalSearch';
import ThemeToggle from '../common/ThemeToggle';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
      }
      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse}
        user={user}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 shadow-lg border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {getTimeBasedGreeting()}, {user?.username || 'User'}!
              </h1>
              <p className="text-sm text-white/80">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              {/* Global Search Button */}
              <button
                onClick={openSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                <Search className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Search</span>
                <kbd className="px-2 py-1 bg-white/20 border border-white/30 rounded text-xs text-white">
                  Ctrl+K
                </kbd>
              </button>

              {/* Notifications */}
              <div className="relative">
                <div className="w-3 h-3 bg-orange-500 rounded-full absolute -top-1 -right-1"></div>
                <button className="p-2 text-white hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <button className="p-2 text-white hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
};

export default MainLayout;
