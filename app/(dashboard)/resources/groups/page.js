'use client';
import React from 'react';
import { 
  FaTelegram, 
  FaBook, 
  FaVideo, 
  FaFilePdf, 
  FaUsers,
  FaShareAlt,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaGraduationCap,
  FaArrowRight,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { MdForum, MdLibraryBooks, MdGroup } from 'react-icons/md';

const StudyForum = () => {
  // Featured resources data
  const featuredResources = [
    {
      title: 'Computer Science Handbook',
      type: 'book',
      icon: <FaBook className="text-blue-500" />,
      size: '15 MB',
      downloads: '2.4k',
      tags: ['Programming', 'Algorithms', 'CS']
    },
    {
      title: 'Mathematics Lectures 2024',
      type: 'video',
      icon: <FaVideo className="text-red-500" />,
      size: '4.2 GB',
      downloads: '1.8k',
      tags: ['Calculus', 'Linear Algebra']
    },
    {
      title: 'Physics Solved Problems',
      type: 'pdf',
      icon: <FaFilePdf className="text-green-500" />,
      size: '8.7 MB',
      downloads: '3.1k',
      tags: ['Mechanics', 'Physics']
    },
    {
      title: 'Research Paper Collection',
      type: 'pdf',
      icon: <FaFilePdf className="text-purple-500" />,
      size: '25 MB',
      downloads: '1.2k',
      tags: ['Research', 'Academic']
    }
  ];

  // Forum categories
  const categories = [
    { name: 'Engineering', count: 245, icon: '⚙️' },
    { name: 'Medicine', count: 189, icon: '🩺' },
    { name: 'Business', count: 167, icon: '💼' },
    { name: 'Arts & Humanities', count: 312, icon: '🎨' },
    { name: 'Science', count: 276, icon: '🔬' },
    { name: 'Law', count: 98, icon: '⚖️' },
    { name: 'Technology', count: 421, icon: '💻' },
    { name: 'Mathematics', count: 334, icon: '📐' },
  ];

  // Channel statistics
  const stats = [
    { label: 'Total Members', value: '500+', icon: <FaUsers /> },
    { label: 'Resources Shared', value: '50+', icon: <MdLibraryBooks /> },
    { label: 'Daily Messages', value: '10+', icon: <FaShareAlt /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                  <MdForum className="text-blue-600 dark:text-blue-400 text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Study Forum
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Join our Telegram community for educational resources
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                Last updated: Today
              </div>
            
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Channel Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Telegram Channel Card */}
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-xl">
                      <FaTelegram className="text-4xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Official Study Forum Telegram Channel
                      </h2>
                      <p className="opacity-90">
                        Join 5,000+ students sharing books, notes, and resources
                      </p>
                    </div>
                  </div>
                  
                  <a 
                    href="https://t.me/+PCipfdvooeY0NmM0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <FaTelegram className="text-xl" />
                    <span>Join Channel</span>
                    <FaExternalLinkAlt className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
                
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-xl">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Resources */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBook />
                  Featured Resources
                </h3>
                <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1">
                  View All <FaArrowRight />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredResources.map((resource, index) => (
                  <div 
                    key={index}
                    className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {resource.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {resource.type.toUpperCase()} • {resource.size}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {resource.downloads} downloads
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resource.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* How to Join */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FaGraduationCap />
                How to Get Started
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Join Telegram Channel
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Click the button above to join our official Study Forum channel
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Browse Resources
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Search for books, notes, and study materials by subject or category
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Share & Discuss
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Contribute your own resources and participate in discussions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          {/* <div className="space-y-8">
            {/* Quick Stats */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaFilter />
                Forum Categories
              </h3>
              
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Recent Activity */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaCalendarAlt />
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="text-gray-900 dark:text-white">
                    New Physics textbook added
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-gray-900 dark:text-white">
                    Computer Science study group started
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    5 hours ago
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-gray-900 dark:text-white">
                    Mathematics problem discussion
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1 day ago
                  </p>
                </div>
              </div>
            </div> */}

         

          </div> 
        {/* </div> */}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p>Study Forum Telegram Channel • Educational Resources Platform</p>
              <p className="mt-1">Join thousands of students sharing knowledge daily</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Terms of Service
              </a>
              <a href="mailto:admin@studyforum.edu" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Contact Admin
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs">
            Note: This is an official community channel.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default StudyForum;