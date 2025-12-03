'use client';
import React from 'react';
import { FaCalendarAlt, FaClock, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { MdLaptop } from "react-icons/md";

const ExamRedirectPage = () => {
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Exam Portal
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Access your exams and view upcoming schedules
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Main Action */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-700">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-blue-500/20 p-3 sm:p-4 rounded-full">
                <MdLaptop className="text-blue-400 text-3xl sm:text-4xl md:text-5xl" />
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3 sm:mb-4">
              Ready for Your Exam?
            </h2>
            
            <p className="text-gray-300 text-sm sm:text-base text-center mb-4 sm:mb-6 md:mb-8">
              Click the button below to proceed to your exam. Make sure you have a stable internet connection and all necessary materials ready.
            </p>

            {/* Main Action Button with Breakpoints */}
            <Link 
              href="https://cbt.waccps.org/" 
              target="_blank"
              className="group block w-full"
              aria-label="Start exam - Navigate to exam page"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 transform transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:shadow-2xl shadow-lg shadow-blue-500/25 touch-manipulation min-h-[120px] sm:min-h-[140px] flex items-center">
                <div className="w-full">
                  <div className="flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full xs:w-auto">
                      <div className="flex-1 xs:flex-initial text-center xs:text-left">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                          Start Your Exam Now
                        </h3>
                        <p className="text-gray-200 text-xs sm:text-sm mt-1 hidden xs:block">
                          Click to begin your examination
                        </p>
                        <p className="text-gray-200 text-xs sm:text-sm mt-1 xs:hidden">
                          Tap to begin
                        </p>
                      </div>
                       <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                        <FaArrowRight className="text-white text-lg sm:text-xl md:text-2xl" />
                      </div>
                    </div>
                    
                    {/* Arrow indicator - hidden on smallest screens, visible on sm+ */}
                    <div className="hidden xs:flex items-center justify-center">
                      <div className="bg-white/10 p-2 sm:p-3 rounded-full animate-pulse group-hover:animate-none">
                        <FaArrowRight className="text-white text-base sm:text-lg md:text-xl transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile tap hint - visible only on smallest screens */}
                  <div className="mt-3 xs:hidden">
                    <p className="text-center text-white/70 text-xs animate-pulse">
                      Tap anywhere to start
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Important Notes */}
            <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="font-bold text-yellow-400 mb-2 text-sm sm:text-base">Important Notes:</h4>
              <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-1">Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-1">Do not refresh the page during the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-1">All answers are automatically saved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-1">Time will be displayed during the exam</span>
                </li>
              </ul>
            </div>
          </div>

         
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p className="mt-1">
            All exams are monitored. Any suspicious activity will be flagged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamRedirectPage;

