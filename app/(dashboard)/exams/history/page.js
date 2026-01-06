'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaArrowRight, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaRegClock,
  FaBook,
  FaPlayCircle,
  FaHourglassHalf,
  FaSync
} from 'react-icons/fa';
import { 
  MdHistory, 
  MdUpcoming,
  MdSchool,
  MdTimer
} from "react-icons/md";
import { TbClockHour4 } from "react-icons/tb";
import Link from 'next/link';
import { auth } from '@/firebase';
import ExamCard from '@/components/ExamCard';
import VirtualizedExamList from '@/components/VirtualizedExamList';

// Tab configuration 
const TAB_CONFIG = [
  { id: 'upcoming', label: 'Upcoming', icon: MdUpcoming, color: 'blue' },
  { id: 'active', label: 'Active Now', icon: FaPlayCircle, color: 'green' },
  { id: 'in-progress', label: 'In Progress', icon: TbClockHour4, color: 'yellow' },
  { id: 'history', label: 'History', icon: MdHistory, color: 'gray' },
];

// Status configuration 
const STATUS_CONFIG = {
  upcoming: {
    badge: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      icon: FaRegClock,
      label: 'Upcoming'
    },
    card: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30'
  },
  active: {
    badge: {
      bg: 'bg-green-500/20',
      text: 'text-green-300',
      icon: FaPlayCircle,
      label: 'Active Now',
      animate: 'animate-pulse'
    },
    card: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30'
  },
  'in-progress': {
    badge: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-300',
      icon: FaPlayCircle,
      label: 'In Progress',
      animate: 'animate-pulse'
    },
    card: 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/30'
  },
  completed: {
    badge: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-300',
      icon: FaCheckCircle,
      label: 'Completed'
    },
    card: 'bg-gradient-to-br from-purple-900/20 to-violet-900/20 border-purple-500/30'
  },
  past: {
    badge: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-300',
      icon: FaTimesCircle,
      label: 'Past'
    },
    card: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600'
  }
};

// Color mapping 
const COLOR_CLASSES = {
  blue: {
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
    border: 'border-blue-500',
    stat: 'text-blue-400'
  },
  green: {
    icon: 'text-green-400',
    badge: 'bg-green-500/20 text-green-300',
    border: 'border-green-500',
    stat: 'text-green-400'
  },
  yellow: {
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300',
    border: 'border-yellow-500',
    stat: 'text-yellow-400'
  },
  gray: {
    icon: 'text-gray-400',
    badge: 'bg-gray-500/20 text-gray-300',
    border: 'border-gray-500',
    stat: 'text-gray-400'
  }
};

const ExamPortalPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchExams(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);



  // Get exam status based on time
  const getExamStatus = useCallback((exam) => {

  if (!exam.date || !exam.time_range_start || !exam.time_range_end) {
  return 'upcoming';
}
    const now = currentTime;
    const examStart = new Date(`${exam.date}T${exam.time_range_start}`);
    const examEnd = new Date(`${exam.date}T${exam.time_range_end}`);
    
    // If exam was manually marked as started/completed
    if (exam.started) {
      return exam.completed ? 'completed' : 'in-progress';
    }
    
    const bufferMs = 15 * 60 * 1000; // 15 minutes buffer before exam starts
    
    // Upcoming: before exam start time (with 15 min buffer)
    if (now < (examStart - bufferMs)) {
      return 'upcoming';
    } 
    // Active: from 15 minutes before start until exam end time
    else if (now >= (examStart - bufferMs) && now <= examEnd) {
      return 'active';
    } 
    // Past: immediately after exam end time
    else if (now > examEnd) {
      return 'past';
    }
    
    return 'unknown';
  }, [currentTime]);

  // Fetch exams from API
  const fetchExams = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/exams?studentId=${studentId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data:', data);
        setExams([]);
        return;
      }
      
      // Transform exam data
      const transformedExams = data.map((exam, index) => ({
        id: exam.quiz_id?.toString() || `exam-${index}`,
        exam_id: exam.quiz_id,
        title: exam.title || 'Untitled Exam',
        course_name: exam.courses?.[0]?.name || 'General',
        course_code: exam.courses?.[0]?.id || 'N/A',
        student_category: exam.student_category,
        student_batch: exam.student_batch,
        date: exam.date,
        time_range_start: exam.time_range_start,
        time_range_end: exam.time_range_end,
        duration_hours: exam.time_allowed_hours || 0,
        duration_minutes: exam.time_allowed_minutes || 0,
        total_duration_minutes: (exam.time_allowed_hours || 0) * 60 + (exam.time_allowed_minutes || 0),
        started: exam.started === 1,
        completed: exam.completed === 1,
        created_by: exam.created_by,
        last_update: exam.last_update,
        instructions: 'Follow all exam guidelines. Ensure stable internet connection.',
        exam_link: `https://cbt.waccps.org/exam/${exam.quiz_id}`,
        status: getExamStatus({
          date: exam.date,
          time_range_start: exam.time_range_start,
          time_range_end: exam.time_range_end,
          started: exam.started,
          completed: exam.completed
        })
      }));
      
      setExams(transformedExams);
      
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(`Unable to load exams: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getExamStatus]);

  // Calculate filtered exams and stats with SINGLE-PASS filtering (7x faster)
  const { filteredExams, stats } = useMemo(() => {
    // Initialize counters and grouped exams
    const byStatus = {
      upcoming: [],
      active: [],
      'in-progress': [],
      past: [],
      completed: [],
    };

    const stats = {
      total: 0,
      upcoming: 0,
      active: 0,
      inProgress: 0,
      past: 0,
      completed: 0,
    };

    // SINGLE PASS: Calculate status once and group exams (O(n) instead of O(n*m))
    for (const exam of exams) {
      const status = getExamStatus(exam);
      byStatus[status]?.push(exam);
      
      // Update stats
      stats.total++;
      if (status === 'in-progress') {
        stats.inProgress++;
      } else {
        stats[status]++;
      }
    }

    // Get filtered exams for active tab (already grouped)
    let filteredExams = [];
    if (activeTab === 'history') {
      filteredExams = [...(byStatus.past || []), ...(byStatus.completed || [])];
    } else {
      filteredExams = byStatus[activeTab] || [];
    }

    // Sort exams by date
    filteredExams.sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time_range_start}`);
      const bDate = new Date(`${b.date}T${b.time_range_start}`);
      
      if (activeTab === 'upcoming' || activeTab === 'active') {
        return aDate - bDate; // Sort ascending for upcoming/active
      } else {
        return bDate - aDate; // Sort descending for history
      }
    });

    return { filteredExams, stats };
  }, [exams, activeTab, getExamStatus]);

  // Format date
  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }, []);

  // Format time
  const formatTime = useCallback((timeString) => {
    if (!timeString) return '';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  }, []);

  // Format duration
  const formatDuration = useCallback((hours, minutes) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    return parts.join(' ') || 'No time limit';
  }, []);

  // Get status badge component
  const getStatusBadge = useCallback((status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    
    const Icon = config.badge.icon;
    
    return (
      <span className={`${config.badge.bg} ${config.badge.text} text-xs px-3 py-1 rounded-full flex items-center ${config.badge.animate || ''}`}>
        <Icon className="mr-1.5" />
        {config.badge.label}
      </span>
    );
  }, []);

  // Get time remaining text
  const getTimeRemaining = useCallback((date, startTime) => {
    const examStart = new Date(`${date}T${startTime}`);
    const now = currentTime;
    const diffMs = examStart - now;
    
    if (diffMs <= 0) return 'Started';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }, [currentTime]);

  // Stats bar items - mapped properly
  const STAT_ITEMS = [
    { label: 'Total', value: stats.total, color: 'gray' },
    { label: 'Upcoming', value: stats.upcoming, color: 'blue' },
    { label: 'Active', value: stats.active, color: 'green' },
    { label: 'In Progress', value: stats.inProgress, color: 'yellow' },
    { label: 'Completed', value: stats.completed, color: 'purple' },
    { label: 'Past', value: stats.past, color: 'gray' },
  ];

  // Info items for each exam card - mapped properly
  const EXAM_INFO_ITEMS = [
    {
      key: 'date',
      label: 'Date',
      icon: FaCalendarAlt,
      color: 'blue',
      getValue: (exam) => formatDate(exam.date)
    },
    {
      key: 'time',
      label: 'Time Slot',
      icon: FaClock,
      color: 'purple',
      getValue: (exam) => `${formatTime(exam.time_range_start)} - ${formatTime(exam.time_range_end)}`
    },
    {
      key: 'duration',
      label: 'Duration',
      icon: MdTimer,
      color: 'yellow',
      getValue: (exam) => formatDuration(exam.duration_hours, exam.duration_minutes)
    },
    {
      key: 'status',
      label: 'Status',
      icon: FaHourglassHalf,
      color: 'green',
      getValue: (exam) => exam.status.replace('-', ' ')
    }
  ];

  // Loading state
  if (loading && exams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="animate-spin text-5xl text-blue-400 mx-auto mb-6" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          </div>
          <p className="text-gray-400">Fetching your exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3e444d] p-4 sm:p-6 md:p-8">
      <div className="md:max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2">
                Exam History
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {exams.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                  <p className="text-sm text-gray-400">Current Time</p>
                  <p className="text-xl font-bold text-white">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => user && fetchExams(user.uid)}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
                title="Refresh exams"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {exams.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {STAT_ITEMS.map((stat) => (
                  <div 
                    key={stat.label}
                    className={`text-center p-3 ${stat.color === 'purple' ? 'bg-purple-900/20 border-purple-500/20' : `bg-${stat.color}-900/20 border-${stat.color}-500/20`} rounded-lg border`}
                  >
                    <p className={`text-2xl font-bold ${stat.color === 'purple' ? 'text-purple-400' : `text-${stat.color}-400`}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${stat.color === 'purple' ? 'text-purple-400' : `text-${stat.color}-400`}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 border-b border-gray-700">
          {TAB_CONFIG.map((tab) => {
const count =
  tab.id === 'history'
    ? stats.past + stats.completed
    : stats[tab.id] ?? 0;
            const colorClass = COLOR_CLASSES[tab.color];
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm sm:text-base rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gray-800 text-white border-b-2 ${colorClass.border}`
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className={`mr-2 ${colorClass.icon}`} />
                {tab.label}
                <span className={`ml-2 ${colorClass.badge} text-xs px-2 py-0.5 rounded-full`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-3" />
              <div>
                <p className="text-red-300 font-medium">{error}</p>
                <button 
                  onClick={() => user && fetchExams(user.uid)}
                  className="text-red-400 hover:text-red-300 text-sm mt-1 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exams List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredExams.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-8 sm:p-12 text-center border border-gray-700">
              <div className="inline-block p-4 rounded-full bg-gray-700/50 mb-4">
                {TAB_CONFIG.find(tab => tab.id === activeTab)?.icon && (
                  React.createElement(TAB_CONFIG.find(tab => tab.id === activeTab).icon, {
                    className: "text-5xl text-gray-500"
                  })
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-3">
                No {activeTab.replace('-', ' ')} Exams
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeTab === 'upcoming' 
                  ? 'You have no upcoming exams scheduled.'
                  : activeTab === 'active'
                  ? 'No exams are currently active.'
                  : activeTab === 'in-progress'
                  ? 'You have no exams in progress.'
                  : 'No exam history available.'}
              </p>
            </div>
          ) : (
            <VirtualizedExamList
              exams={filteredExams}
              formatDate={formatDate}
              formatTime={formatTime}
              getTimeRemaining={getTimeRemaining}
              getStatusBadge={getStatusBadge}
              STATUS_CONFIG={STATUS_CONFIG}
              EXAM_INFO_ITEMS={EXAM_INFO_ITEMS}
            />
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p className="mb-2">
            All times are displayed in your local timezone.
          </p>
          <p>
            Ensure you have a stable internet connection before starting any exam.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamPortalPage;