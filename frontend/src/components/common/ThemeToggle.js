import React, { useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, changeTheme, isDark, isLight, isSystem } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Use system setting' }
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 ${isDark ? 'dark-theme' : isLight ? 'light-theme' : isSystem ? 'system-theme' : ''}`}
        title={`Current theme: ${currentTheme?.label}${isDark ? ' (Dark)' : isLight ? ' (Light)' : isSystem ? ' (System)' : ''}`}
        data-theme={isDark ? 'dark' : isLight ? 'light' : isSystem ? 'system' : 'unknown'}
      >
        <CurrentIcon className="w-4 h-4 text-white" />
        <span className="text-sm text-white hidden sm:inline">Theme</span>
        <ChevronDown className={`w-3 h-3 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{themeOption.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
