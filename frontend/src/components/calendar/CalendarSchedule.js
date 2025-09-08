import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  X,
  Save,
  Trash2,
  User
} from 'lucide-react';

const CalendarSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'meeting',
    attendees: '',
    priority: 'medium'
  });
  const [userRole, setUserRole] = useState('Admin'); // This should come from auth context

  // Load user role from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) {
      setUserRole(user.role);
    }
  }, []);

  // Calendar utility functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date && date < today;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  // Event handlers
  const handleDateClick = (date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
    setShowEventModal(true);
    setEventForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'meeting',
      attendees: '',
      priority: 'medium'
    });
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const newEvent = {
      id: Date.now(),
      ...eventForm,
      date: selectedDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setEvents(prev => [...prev, newEvent]);
    setShowEventModal(false);
    setSelectedDate(null);
  };

  const handleEventDelete = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">Calendar & Schedule</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-medium text-neutral-800 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-neutral-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const canSchedule = (userRole === 'SuperAdmin' || userRole === 'Admin') && !isPastDate(day);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[60px] p-2 border border-neutral-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all
                  ${day ? 'hover:bg-neutral-50 dark:hover:bg-gray-700' : 'bg-neutral-50 dark:bg-gray-700 cursor-not-allowed'}
                  ${isToday(day) ? 'bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700' : ''}
                  ${isPastDate(day) ? 'opacity-50 cursor-not-allowed' : ''}
                  ${canSchedule ? 'hover:border-primary-300 dark:hover:border-primary-600' : ''}
                `}
                onClick={() => canSchedule && handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isToday(day) 
                          ? 'text-primary-700 dark:text-primary-300' 
                          : 'text-neutral-800 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </span>
                      {canSchedule && (
                        <Plus className="w-3 h-3 text-neutral-400 hover:text-primary-500 transition-colors" />
                      )}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded truncate ${
                              event.priority === 'high' 
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                : event.priority === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-neutral-500 dark:text-gray-400">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-neutral-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Upcoming Events</h3>
          <Clock className="w-5 h-5 text-neutral-500 dark:text-gray-400" />
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {getUpcomingEvents().length > 0 ? getUpcomingEvents().map(event => (
            <div key={event.id} className="p-4 bg-neutral-50 dark:bg-gray-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-white">{event.title}</h4>
                <button
                  onClick={() => handleEventDelete(event.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-neutral-600 dark:text-gray-300 mb-2">{event.description}</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(new Date(event.date))}</span>
                </div>
                {event.startTime && (
                  <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  event.priority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : event.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                }`}>
                  {event.priority} priority
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-neutral-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No upcoming events</p>
              <p className="text-sm mt-1">Click on a future date to schedule an event</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">
                Schedule Event - {selectedDate && formatDate(selectedDate)}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="training">Training</option>
                    <option value="field_visit">Field Visit</option>
                    <option value="assessment">Assessment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Attendees
                  </label>
                  <input
                    type="text"
                    value={eventForm.attendees}
                    onChange={(e) => setEventForm({...eventForm, attendees: e.target.value})}
                    placeholder="Enter attendee names or roles"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={eventForm.priority}
                    onChange={(e) => setEventForm({...eventForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-neutral-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Schedule Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSchedule;
