'use client';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { MdLaptop } from "react-icons/md";

const ExamRedirectPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Centered Card Container */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-700">
          {/* Header Section - Centered */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Exam Portal
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Access your exams and view upcoming schedules
            </p>
          </div>

          {/* Main Icon - Centered */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="bg-blue-500/20 p-4 sm:p-6 rounded-full">
                <MdLaptop className="text-blue-400 text-4xl sm:text-5xl md:text-6xl" />
              </div>
              {/* Optional animated ring */}
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Main Title - Centered */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Ready for Your Exam?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
              Click the button below to proceed to your exam. Make sure you have a stable internet connection and all necessary materials ready.
            </p>
          </div>

          {/* Centered Action Button */}
          <div className="mb-6 sm:mb-8">
            <Link 
              href="https://cbt.waccps.org/" 
              target="_blank"
              className="group block"
              aria-label="Start exam - Navigate to exam page"
            >
              <div className="max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 transform transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-2xl shadow-lg shadow-blue-500/25">
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* Button Icon */}
                  <div className="bg-white/20 p-3 sm:p-4 rounded-full">
                    <FaArrowRight className="text-white text-xl sm:text-2xl md:text-3xl" />
                  </div>
                  
                  {/* Button Text */}
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                      Start Your Exam Now
                    </h3>
                    <p className="text-gray-200 text-sm sm:text-base">
                      Click to begin your examination
                    </p>
                  </div>
                  
                  {/* Animated Arrow */}
                  <div className="mt-2">
                    <div className="bg-white/10 p-2 rounded-full animate-pulse group-hover:animate-none">
                      <FaArrowRight className="text-white text-lg transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Important Notes - Centered */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6">
              <h4 className="font-bold text-yellow-400 mb-3 text-center text-sm sm:text-base">Important Notes:</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                  <span className="text-gray-300 text-xs sm:text-sm">Stable internet connection required</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                  <span className="text-gray-300 text-xs sm:text-sm">Do not refresh the page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                  <span className="text-gray-300 text-xs sm:text-sm">Answers auto-save</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                  <span className="text-gray-300 text-xs sm:text-sm">Timer displayed during exam</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note - Centered */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="text-gray-400 text-xs sm:text-sm">
              <p className="mb-2">
                All exams are monitored. Any suspicious activity will be flagged.
              </p>
              <p className="text-gray-500 text-xs">
                Redirecting to: <span className="text-blue-400">cbt.waccps.org</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRedirectPage;