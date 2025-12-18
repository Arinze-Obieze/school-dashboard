'use client';
import React from 'react';
import { 
  FaTelegram, 
  FaUsers,
  FaCommentDots,
  FaBullhorn,
  FaExternalLinkAlt,
  FaComments,
  FaArrowRight
} from 'react-icons/fa';
import { MdForum, MdAnnouncement, MdLibraryBooks, MdGroup } from 'react-icons/md';

const StudyForum = () => {
  // Telegram Links Data
  const telegramLinks = [
    {
      name: "Study Forum",
      description: "Community discussion forum where everyone can post and discuss",
      link: "https://t.me/officialwaccpsforum",
      type: "forum",
      icon: <FaComments />,
      stats: [
        { label: 'Active Members', value: '500+', icon: <FaUsers /> },
        { label: 'Daily Messages', value: '50+', icon: <FaCommentDots /> }
      ],
      gradient: "from-p-100 to-gray-1500",
      buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
    },
    {
      name: "Official Channel",
      description: "Official announcements, study materials, and important updates",
      link: "https://t.me/+PCipfdvooeY0NmM0 ",
      type: "channel",
      icon: <FaBullhorn />,
      stats: [
        { label: 'Subscribers', value: '200+', icon: <MdGroup /> },
        { label: 'Resources Shared', value: '50+', icon: <MdLibraryBooks /> }
      ],
      gradient: "from-p-100 to-gray-1500",
      buttonColor: "bg-white text-purple-600 hover:bg-gray-100",
    }
  ];

  return (
    <div className="min-h-screen bg-[#3e444d] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MdForum className="text-blue-600 text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Telegram Community
                  </h1>
                  <p className="text-gray-300">
                    Join for discussions and official announcements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {telegramLinks.map((item, index) => (
            <div key={index} className={`bg-gradient-to-r ${item.gradient} rounded-2xl shadow-xl overflow-hidden`}>
              <div className="p-6 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {item.name}
                      </h2>
                      <p className="opacity-90 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {item.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-xl font-bold">{stat.value}</div>
                          <div className="text-xs opacity-90">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Join Button */}
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group ${item.buttonColor} w-full py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] shadow-lg`}
                >
                  <FaTelegram className="text-xl" />
                  <span>{item.type === "forum" ? "Join Discussion Forum" : "Join Announcement Channel"}</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Explanation */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-blue-600 text-xl" />
              </div>
              <h4 className="font-semibold text-white mb-2">
                Forum / Group
              </h4>
              <p className="text-gray-300 text-sm">
                Everyone can post, discuss, and engage in conversations
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBullhorn className="text-purple-600 text-xl" />
              </div>
              <h4 className="font-semibold text-white mb-2">
                Announcement Channel
              </h4>
              <p className="text-gray-300 text-sm">
                Broadcast-only for official updates and study materials
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>Telegram Community • For Discussions & Announcements</p>
          <p className="mt-2 text-xs">
            Join both for complete community access
          </p>
        </footer>
      </div>
    </div>
  );
};

export default StudyForum;