'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  FaGraduationCap,
  FaPlayCircle,
  FaListOl,
  FaHourglassHalf,
  FaUserGraduate,
  FaSync
} from 'react-icons/fa';
import { 
  MdLaptop, 
  MdHistory, 
  MdUpcoming,
  MdAccessTime,
  MdScore,
  MdQuestionAnswer,
  MdSchool,
  MdTimer
} from "react-icons/md";
import { TbClockHour4, TbClock } from "react-icons/tb";
import Link from 'next/link';
import { auth } from '@/firebase';

const ExamPortalPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper functions for dynamic classes
  const getTabIconColor = (color) => {
    switch(color) {
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'gray': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTabBadgeClasses = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-500/20 text-blue-300';
      case 'green': return 'bg-green-500/20 text-green-300';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-300';
      case 'gray': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTabBorderColor = (color) => {
    switch(color) {
      case 'blue': return 'border-blue-500';
      case 'green': return 'border-green-500';
      case 'yellow': return 'border-yellow-500';
      case 'gray': return 'border-gray-500';
      default: return 'border-gray-500';
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

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

  const getExamStatus = (exam) => {
    const now = currentTime;
    
    // Create dates in local timezone
    const examStart = new Date(`${exam.date}T${exam.time_range_start}`);
    const examEnd = new Date(`${exam.date}T${exam.time_range_end}`);
    
    // If exam was manually marked as started/completed in API
    if (exam.started === 1) {
      return exam.completed === 1 ? 'completed' : 'in-progress';
    }
    
    // Add buffer time (15 minutes before/after)
    const bufferMs = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    // Determine status based on current time
    if (now < (examStart - bufferMs)) {
      return 'upcoming';
    } else if (now >= (examStart - bufferMs) && now <= examEnd) {
      return 'active'; // Exam is currently happening or about to start
    } else if (now > examEnd && now <= (examEnd + bufferMs)) {
      return 'active'; // Grace period after exam ends
    } else if (now > examEnd) {
      return 'past';
    }
    
    return 'unknown';
  };

  const fetchExams = async (studentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/exams?studentId=${studentId}`, {
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Handle empty or invalid response
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data:', data);
        setExams([]);
        return;
      }
      
      // Transform and add calculated status
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
        // Calculate status based on time
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
  };

  // Filter and sort exams based on active tab
  const { filteredExams, stats } = useMemo(() => {
    const now = currentTime;
    const allExams = exams.map(exam => ({
      ...exam,
      // Recalculate status for each exam
      status: getExamStatus(exam)
    }));

    // Calculate statistics
    const stats = {
      total: allExams.length,
      upcoming: allExams.filter(e => e.status === 'upcoming').length,
      active: allExams.filter(e => e.status === 'active').length,
      inProgress: allExams.filter(e => e.status === 'in-progress').length,
      past: allExams.filter(e => e.status === 'past').length,
      completed: allExams.filter(e => e.status === 'completed').length,
    };

    // Filter based on active tab
    let filteredExams = [];
    switch (activeTab) {
      case 'upcoming':
        filteredExams = allExams.filter(e => e.status === 'upcoming');
        break;
      case 'active':
        filteredExams = allExams.filter(e => e.status === 'active');
        break;
      case 'in-progress':
        filteredExams = allExams.filter(e => e.status === 'in-progress');
        break;
      case 'history':
        filteredExams = allExams.filter(e => 
          e.status === 'past' || e.status === 'completed'
        );
        break;
      default:
        filteredExams = allExams;
    }

    // Sort exams
    filteredExams.sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time_range_start}`);
      const bDate = new Date(`${b.date}T${b.time_range_start}`);
      
      if (activeTab === 'upcoming' || activeTab === 'active') {
        return aDate - bDate; // Soonest first
      } else {
        return bDate - aDate; // Most recent first
      }
    });

    return { filteredExams, stats };
  }, [exams, activeTab, currentTime]);

  const formatDate = (dateString) => {
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
  };

  const formatTime = (timeString) => {
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
  };

  const formatDuration = (hours, minutes) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    return parts.join(' ') || 'No time limit';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return (
          <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full flex items-center">
            <FaRegClock className="mr-1.5" />
            Upcoming
          </span>
        );
      case 'active':
        return (
          <span className="bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full flex items-center animate-pulse">
            <FaPlayCircle className="mr-1.5" />
            Active Now
          </span>
        );
      case 'in-progress':
        return (
          <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full flex items-center animate-pulse">
            <FaPlayCircle className="mr-1.5" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full flex items-center">
            <FaCheckCircle className="mr-1.5" />
            Completed
          </span>
        );
      case 'past':
        return (
          <span className="bg-gray-500/20 text-gray-300 text-xs px-3 py-1 rounded-full flex items-center">
            <FaTimesCircle className="mr-1.5" />
            Past
          </span>
        );
      default:
        return null;
    }
  };

  const getExamCardBg = (status) => {
    switch(status) {
      case 'active':
        return 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30';
      case 'in-progress':
        return 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/30';
      case 'completed':
        return 'bg-gradient-to-br from-purple-900/20 to-violet-900/20 border-purple-500/30';
      case 'upcoming':
        return 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30';
      case 'past':
        return 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600';
      default:
        return 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700';
    }
  };

  const getTimeRemaining = (date, startTime) => {
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
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="md:max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2">
                Exam Portal
              </h1>
              <p className="text-gray-300 text-sm">
                {user ? `Welcome, ${user.displayName || user.email?.split('@')[0] || 'Student'}` : 'Manage your exams'}
              </p>
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
                <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{stats.upcoming}</p>
                  <p className="text-xs text-blue-400">Upcoming</p>
                </div>
                <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                  <p className="text-xs text-green-400">Active</p>
                </div>
                <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                  <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
                  <p className="text-xs text-yellow-400">In Progress</p>
                </div>
                <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
                  <p className="text-xs text-purple-400">Completed</p>
                </div>
                <div className="text-center p-3 bg-gray-900/20 rounded-lg border border-gray-500/20">
                  <p className="text-2xl font-bold text-gray-400">{stats.past}</p>
                  <p className="text-xs text-gray-400">Past</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 border-b border-gray-700">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: MdUpcoming, color: 'blue', count: stats.upcoming },
            { id: 'active', label: 'Active Now', icon: FaPlayCircle, color: 'green', count: stats.active },
            { id: 'in-progress', label: 'In Progress', icon: TbClockHour4, color: 'yellow', count: stats.inProgress },
            { id: 'history', label: 'History', icon: MdHistory, color: 'gray', count: stats.past + stats.completed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm sm:text-base rounded-t-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gray-800 text-white border-b-2 ${getTabBorderColor(tab.color)}`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className={`mr-2 ${getTabIconColor(tab.color)}`} />
              {tab.label}
              <span className={`ml-2 ${getTabBadgeClasses(tab.color)} text-xs px-2 py-0.5 rounded-full`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

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
                {activeTab === 'upcoming' ? (
                  <MdUpcoming className="text-5xl text-gray-500" />
                ) : activeTab === 'active' ? (
                  <FaPlayCircle className="text-5xl text-gray-500" />
                ) : activeTab === 'in-progress' ? (
                  <TbClockHour4 className="text-5xl text-gray-500" />
                ) : (
                  <MdHistory className="text-5xl text-gray-500" />
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
            filteredExams.map((exam) => (
              <div
                key={exam.id}
                className={`${getExamCardBg(exam.status)} rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:border-gray-500 hover:shadow-xl`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                          {exam.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="inline-flex items-center bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                            <FaBook className="mr-1.5" />
                            {exam.course_name}
                          </span>
                          <span className="inline-flex items-center bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                            <MdSchool className="mr-1.5" />
                            {exam.course_code}
                          </span>
                          {exam.status === 'upcoming' && (
                            <span className="inline-flex items-center bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
                              <FaClock className="mr-1.5" />
                              {getTimeRemaining(exam.date, exam.time_range_start)}
                            </span>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg mt-1">
                          <FaCalendarAlt className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="text-white font-medium">{formatDate(exam.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-500/10 p-2 rounded-lg mt-1">
                          <FaClock className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Time Slot</p>
                          <p className="text-white font-medium">
                            {formatTime(exam.time_range_start)} - {formatTime(exam.time_range_end)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-yellow-500/10 p-2 rounded-lg mt-1">
                          <MdTimer className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-white font-medium">
                            {formatDuration(exam.duration_hours, exam.duration_minutes)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-500/10 p-2 rounded-lg mt-1">
                          <FaHourglassHalf className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="text-white font-medium capitalize">
                            {exam.status.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Info */}
                    <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-700/50 mb-4">
                      <p className="text-sm text-gray-400 mb-2 flex items-center">
                        <FaExclamationTriangle className="mr-2 text-yellow-500" />
                        Exam Window: 
                        <span className="ml-2 text-white">
                          {formatDate(exam.date)} from {formatTime(exam.time_range_start)} to {formatTime(exam.time_range_end)}
                        </span>
                      </p>
                      {exam.status === 'upcoming' && (
                        <p className="text-sm text-blue-400">
                          Starts {getTimeRemaining(exam.date, exam.time_range_start).toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="lg:w-64 flex-shrink-0">
                    {exam.status === 'active' || exam.status === 'in-progress' ? (
                      <Link
                        href={exam.exam_link || 'https://cbt.waccps.org/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center group"
                      >
                        <FaPlayCircle className="mr-3 text-xl" />
                        <div className="text-left">
                          <div className="font-bold">
                            {exam.status === 'in-progress' ? 'Continue Exam' : 'Start Exam'}
                          </div>
                          <div className="text-xs opacity-90">
                            {exam.status === 'in-progress' ? 'Resume your exam' : 'Exam is now active'}
                          </div>
                        </div>
                        <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : exam.status === 'upcoming' ? (
                      <div className="bg-gray-900/80 rounded-lg p-4 sm:p-5 border border-gray-700">
                        <div className="text-center mb-3">
                          <FaRegClock className="text-3xl text-blue-400 mx-auto mb-2" />
                          <p className="text-white font-bold">Upcoming</p>
                          <p className="text-blue-300 text-sm mt-1">
                            {getTimeRemaining(exam.date, exam.time_range_start)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          Available from {formatTime(exam.time_range_start)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/80 rounded-lg p-4 sm:p-5 border border-gray-700">
                        <div className="text-center mb-3">
                          <FaCheckCircle className="text-3xl text-gray-400 mx-auto mb-2" />
                          <p className="text-white font-bold">Exam {exam.completed ? 'Completed' : 'Ended'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Status</span>
                            <span className="text-gray-300 font-medium capitalize">
                              {exam.completed ? 'Submitted' : 'Time Ended'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Date</span>
                            <span className="text-white">{formatDate(exam.date)}</span>
                          </div>
                          <button 
                            onClick={() => {/* View results function */}}
                            className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg transition-colors text-sm"
                          >
                            {exam.completed ? 'View Results' : 'Review Exam'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Info */}
                    <div className="mt-4 text-xs text-gray-500">
                      <p className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                        Exam ID: {exam.exam_id}
                      </p>
                      <p className="flex items-center mt-1">
                        <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                        Duration: {exam.total_duration_minutes} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
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