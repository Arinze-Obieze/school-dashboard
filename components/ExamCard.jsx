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
    statusConfig,
    getStatusBadge,
    getTimeRemaining,
    formatDate,
    formatTime,
    formatDuration,
    examInfoItems,
  }) => {
    if (!exam) return null;

    return (
      <div className={`${statusConfig.card} rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:border-gray-500 hover:shadow-xl`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header with Title and Status */}
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

            {/* Exam Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {examInfoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-start space-x-3">
                    <div className={`bg-${item.color}-500/10 p-2 rounded-lg mt-1`}>
                      <Icon className={`text-${item.color}-400`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="text-white font-medium capitalize">
                        {item.getValue(exam)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Window Info */}
            <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-700/50 mb-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center">
                <FaExclamationTriangle className="mr-2 text-yellow-500" />
                Exam Window:
                <span className="ml-2 text-white">
                  {formatDate(exam.date)} from {formatTime(exam.time_range_start)} to{' '}
                  {formatTime(exam.time_range_end)}
                </span>
              </p>
              {exam.status === 'upcoming' && (
                <p className="text-sm text-blue-400">
                  Starts {getTimeRemaining(exam.date, exam.time_range_start).toLowerCase()}
                </p>
              )}
            </div>
          </div>

          {/* Action Button Section */}
          <div className="lg:w-64 flex-shrink-0">
            {exam.status === 'active' || exam.status === 'in-progress' ? (
              <Link
                href={exam.exam_link || 'https://cbt.waccps.org/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center group"
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
                  <p className="text-white font-bold">
                    Exam {exam.completed ? 'Completed' : 'Ended'}
                  </p>
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
                  <button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg transition-colors text-sm">
                    {exam.completed ? 'View Results' : 'Review Exam'}
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-4 text-xs text-gray-300">
              <p className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Exam ID: {exam.exam_id}
              </p>
              <p className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Duration: {exam.total_duration_minutes} minutes
              </p>
            </div>
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
