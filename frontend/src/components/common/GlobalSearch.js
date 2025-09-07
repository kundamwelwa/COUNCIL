import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Building2, UserCheck, CreditCard, Clock } from 'lucide-react';
import axios from 'axios';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const searchItems = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [personsRes, programsRes, groupsRes, loansRes] = await Promise.all([
        axios.get(`/api/persons?search=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/programs?search=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/groups?search=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/loans?search=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } }))
      ]);

      const searchResults = [
        ...personsRes.data.data.map(item => ({
          ...item,
          type: 'person',
          title: `${item.first_name} ${item.last_name}`,
          subtitle: `National ID: ${item.national_id}`,
          icon: Users,
          href: `/beneficiaries`
        })),
        ...programsRes.data.data.map(item => ({
          ...item,
          type: 'program',
          title: item.program_name,
          subtitle: item.description,
          icon: Building2,
          href: `/programs`
        })),
        ...groupsRes.data.data.map(item => ({
          ...item,
          type: 'group',
          title: item.group_name,
          subtitle: `Program: ${item.program_name || 'N/A'}`,
          icon: UserCheck,
          href: `/groups`
        })),
        ...loansRes.data.data.map(item => ({
          ...item,
          type: 'loan',
          title: `${item.type} - ZMW ${item.amount}`,
          subtitle: `Group: ${item.group_name || 'N/A'}`,
          icon: CreditCard,
          href: `/loans`
        }))
      ];

      setResults(searchResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchItems(query);
      // Add to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const handleResultClick = (result) => {
    // Navigate to the result
    window.location.href = result.href;
    onClose();
  };

  const handleRecentClick = (recentQuery) => {
    setQuery(recentQuery);
    searchItems(recentQuery);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div 
        ref={searchRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden"
      >
        {/* Search Input */}
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search beneficiaries, programs, groups, loans..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchItems(e.target.value);
              }}
              className="w-full pl-10 pr-12 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </form>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                Search Results ({results.length})
              </div>
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {result.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && !query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Searches
                </div>
                <button
                  onClick={clearRecent}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentClick(recent)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{recent}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && !query && recentSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Start typing to search...</p>
              <p className="text-xs mt-1">Search across beneficiaries, programs, groups, and loans</p>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd> to search</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> to close</span>
            </div>
            <span>Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
