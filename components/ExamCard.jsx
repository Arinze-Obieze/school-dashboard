'use client';
import React from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegClock,
  FaBook,
  FaPlayCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import { MdSchool, MdTimer } from 'react-icons/md';

/**
 * ExamCard Component - Memoized for virtual scrolling performance
 * Renders a single exam card with status-dependent content and actions
 */
const ExamCard = React.memo(
  ({
    exam,
    statusConfig = {},
    getStatusBadge = () => null,
    getTimeRemaining = () => 'Soon',
    formatDate = (date) => date,
    formatTime = (time) => time,
    formatDuration = (hours, mins) => `${hours}h ${mins}m`,
    examInfoItems = [],
  }) => {
    if (!exam) return null;

    return (
      <div className={`${statusConfig.card || 'bg-gray-800/50 border-gray-700'} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border transition-all duration-300 hover:border-gray-500 hover:shadow-xl h-full overflow-hidden`}>
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
          {/* Header with Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 truncate">
                {exam.title}
              </h3>
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <span className="inline-flex items-center bg-gray-700/50 text-gray-300 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <FaBook className="mr-1 sm:mr-1.5 text-[10px] sm:text-xs" />
                  <span className="truncate max-w-[80px] sm:max-w-none">{exam.course_name}</span>
                </span>
                <span className="inline-flex items-center bg-gray-700/50 text-gray-300 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <MdSchool className="mr-1 sm:mr-1.5" />
                  {exam.course_code}
                </span>
              </div>
            </div>
            <div className="self-start shrink-0">
              {getStatusBadge(exam.status)}
            </div>
          </div>

          {/* Exam Info Grid - Simplified for mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {examInfoItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center space-x-2">
                  <div className={`bg-${item.color}-500/10 p-1.5 sm:p-2 rounded-lg shrink-0`}>
                    <Icon className={`text-${item.color}-400 text-sm sm:text-base`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{item.label}</p>
                    <p className="text-white text-xs sm:text-sm font-medium capitalize truncate">
                      {item.getValue(exam)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Window Info - Compact on mobile */}
          <div className="bg-gray-900/50 rounded-lg p-2 sm:p-3 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <div className="flex items-center text-gray-400">
                <FaExclamationTriangle className="mr-1.5 text-yellow-500 shrink-0" />
                <span className="hidden sm:inline">Exam Window:</span>
                <span className="sm:hidden">Window:</span>
              </div>
              <span className="text-white text-xs sm:text-sm">
                {formatDate(exam.date)} • {formatTime(exam.time_range_start)} - {formatTime(exam.time_range_end)}
              </span>
            </div>
            {exam.status === 'upcoming' && (
              <p className="text-xs text-blue-400 mt-1">
                Starts {getTimeRemaining(exam.date, exam.time_range_start).toLowerCase()}
              </p>
            )}
          </div>

          {/* Action Section - Compact */}
          <div className="mt-auto">
            {exam.status === 'active' || exam.status === 'in-progress' ? (
              <Link
                href={exam.exam_link || 'https://cbt.waccps.org/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center group"
              >
                <FaPlayCircle className="mr-2 text-base sm:text-lg" />
                <span className="text-sm sm:text-base font-bold">
                  {exam.status === 'in-progress' ? 'Continue' : 'Start Exam'}
                </span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : exam.status === 'upcoming' ? (
              <div className="flex items-center justify-between bg-gray-900/80 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-xl sm:text-2xl text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-bold">Upcoming</p>
                    <p className="text-blue-300 text-xs">
                      {getTimeRemaining(exam.date, exam.time_range_start)}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Available</p>
                  <p className="text-white">{formatTime(exam.time_range_start)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-900/80 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-xl sm:text-2xl text-gray-400" />
                  <div>
                    <p className="text-white text-sm font-bold">
                      {exam.completed ? 'Completed' : 'Ended'}
                    </p>
                    <p className="text-gray-400 text-xs">{formatDate(exam.date)}</p>
                  </div>
                </div>
                <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 px-3 rounded-lg transition-colors text-xs sm:text-sm">
                  {exam.completed ? 'Results' : 'Review'}
                </button>
              </div>
            )}
          </div>

          {/* Exam ID - Small footer */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 pt-1 border-t border-gray-700/30">
            <span>ID: {exam.exam_id}</span>
            <span>{exam.total_duration_minutes} min</span>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if exam ID changed or status badge changed
    return (
      prevProps.exam.id === nextProps.exam.id &&
      prevProps.exam.status === nextProps.exam.status
    );
  }
);

ExamCard.displayName = 'ExamCard';

export default ExamCard;
