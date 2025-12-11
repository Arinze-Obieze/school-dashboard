'use client';
import React from 'react';
import Link from 'next/link';
import {
  FaHome, FaBook, FaBookReader, FaWpforms, FaGraduationCap, FaUser,
  FaCog,  FaSignOutAlt,
  FaTimes,
  FaChevronUp,
  FaChevronDown,
  FaCalendarAlt,
  FaLaptopCode,
  FaPaperPlane,
  FaChartBar,
  FaFileDownload,
  FaUserPlus,
  FaHandshake,
  FaChalkboardTeacher,
  FaBookOpen,
  FaPlusCircle,
  FaCloudDownloadAlt,
  FaUpload,
 
  FaListAlt,
  FaCreditCard,
  FaHistory,
  FaDownload,
  FaPrint,
  FaVideo,
  FaUsers,

  FaFileAlt,
  FaRegClock
} from 'react-icons/fa';
import { LuMessagesSquare } from 'react-icons/lu';
import { MdOutlinePayments } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const menuItems = [
    { label: "Dashboard", icon: <FaHome />, href: "/" },
  
    {
      label: "My Profile", icon: <FaUser />, href: "/profile",
     
  },
  {
    label: "Courses", icon: <FaGraduationCap />, href: "/courses",
    subItems: [
      { label: "Register", href: "/courses/register", icon: <FaPlusCircle /> },
        // { label: "Course Materials", href: "/courses/materials", icon: <FaCloudDownloadAlt /> },
        // { label: "Assignment Uploads", href: "/courses/assignments", icon: <FaUpload /> },
        { label: "Registered", href: "/courses/registered", icon: <FaRegClock /> },
    ]
},
{
  label: "Exams / Result", icon: <FaBookReader />, href: "/exams",
  subItems: [
      // { label: "Exam Timetable", href: "/exams/timetable", icon: <FaCalendarAlt /> },
      { label: "Take Online Exams", href: "/exams/online", icon: <FaLaptopCode /> },
      { label: "View History/Results", href: "/exams/history", icon: <FaChartBar /> },
      // { label: "GPA / CGPA Tracker", href: "/exams/gpa-tracker", icon: <FaGraduationCap /> },
      { label: "Download Transcripts", href: "/exams/transcripts", icon: <FaFileDownload /> },
  ]
},
{
  label: "Payments", icon: <MdOutlinePayments />, href: "/payments",
  subItems: [
      // { label: "Fee Breakdown", href: "/payment/fee-breakdown", icon: <FaListAlt /> },
      // { label: "Pay Online", href: "/payment/pay", icon: <FaCreditCard /> },
      { label: "View Payment History", href: "/payments/history", icon: <FaHistory /> },
      // { label: "Download Payment Receipts", href: "/payment/receipts", icon: <FaDownload /> },
      // { label: "Print Invoice", href: "/payment/invoice", icon: <FaPrint /> },
  ]
},
// {
//   label: "Academic Records", icon: <FaBook />, href: "/academic-records",
//   subItems: [
//       { label: "Course Registration History", href: "/academic-records/registration-history", icon: <FaBook /> },
//       { label: "Academic Standing", href: "/academic-records/standing", icon: <FaBalanceScale /> },
//       { label: "Download Admission Letter", href: "/academic-records/admission-letter", icon: <FaFileDownload /> },
//       { label: "Graduation Eligibility", href: "/academic-records/graduation-eligibility", icon: <FaCheckCircle /> },
//   ]
// },
{
  label: "Resources", icon: <FaBook />, href: "/resources",
  subItems: [
      // { label: "eLibrary", href: "/resources/elibrary", icon: <FaBook /> },
      // { label: "Lecture Notes", href: "/resources/notes", icon: <FaFileAlt /> },
      { label: "Videos & Tutorials", href: "/resources/videos", icon: <FaVideo /> },
      { label: "Study Groups / Forums", href: "/resources/groups", icon: <FaUsers /> },
  ]
},
    {
        label: "Course Registration Forms", icon: <FaWpforms />, href: "/registration-forms",
        subItems: [
          { label: "Primary", href: "/registration-forms/primary", icon: <FaChalkboardTeacher /> },
          { label: "Membership", href: "/registration-forms/membership", icon: <FaUserPlus /> },
            { label: "Fellowship", href: "/registration-forms/fellowship", icon: <FaHandshake /> },
        ]
    },
  
  
];
  
  const miscItems = [
    // { label: "User Settings", icon: <FaCog />, href: "/settings" },
    // { label: "Support", icon: <LuMessagesSquare />, href: "/support" },
    { label: "Logout", icon: <FaSignOutAlt />, href: "/logout" },
  ];

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);
  const handleClose = () => setIsOpen(false);

  const handleDropdown = (label, e) => {
    e.stopPropagation(); // Prevent link navigation
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`bg-[#343940] z-50 text-white w-64 min-h-screen flex flex-col fixed top-0 left-0 h-full transition-transform duration-200 ease-in-out transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div>
        <div className="text-center mt-4 mb-2 px-4 pt-2 flex place-items-center justify-between">
          <h2 className="font-extralight text-lg">User Dashboard</h2>
             {/* Close button for small/medium screens */}
      <div className="lg:hidden flex  ">
        <FaTimes className="text-xl cursor-pointer" onClick={handleClose} />
      </div>
        </div>
        <div className="flex border-t items-center gap-3 px-4 py-3 border-b border-gray-500">
          <img src={profile?.photoURL || "/c.jpg"} alt="User" className="w-10 h-10 rounded-full" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{profile ? `${profile.surname || ''} ${profile.firstname || ''} ${profile.middlename || ''}`.trim() : 'Loading...'}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 bg-[#1f2227] text-white rounded border border-gray-600 focus:outline-none"
        />
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-auto">
        <ul className="px-2 space-y-1">
          {menuItems.map((item, i) => {
            // Determine if this item or any of its subItems is active
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
            return (
              <li key={i} className="relative">
                {/* Dropdown parent with subItems */}
                {item.subItems ? (
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`flex-1 flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-[#3b82f6] text-white' : ''}`}
                      onClick={handleMenuClick}
                    >
                      <span>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>
                      )}
                    </Link>
                    <button
                      type="button"
                      className="px-2 focus:outline-none"
                      onClick={(e) => handleDropdown(item.label, e)}
                      aria-label={openDropdowns[item.label] ? 'Collapse' : 'Expand'}
                    >
                      {openDropdowns[item.label] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-[#3b82f6] text-white' : ''}`}
                    onClick={handleMenuClick}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </Link>
                )}
                {/* Dropdown subItems */}
                {item.subItems && openDropdowns[item.label] && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((sub, j) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <li key={j}>
                          <Link href={sub.href} className={` px-4 py-2 rounded hover:bg-gray-600 text-sm flex items-center gap-2 ${isSubActive ? 'bg-[#3b82f6] text-white' : ''}`} onClick={handleMenuClick}>
                            <span>{sub.icon}</span>
                            <span>{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="px-4 mt-6 text-gray-400 text-sm">MISCELLANEOUS</div>
        <ul className="px-2 mt-2 space-y-1">
          {miscItems.map((item, i) => (
            <li key={i}>
              {item.label === 'Logout' ? (
                <button
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 w-full text-left"
                  onClick={() => { logout(); setIsOpen(false); }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"
                  onClick={handleMenuClick}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
