'use client';
import React from 'react';
import Link from 'next/link';
import {
  FaHome, FaBook, FaWpforms, FaGraduationCap,  FaUser,
  FaCog, FaComments, FaSignOutAlt
} from 'react-icons/fa';
import { GrResources } from "react-icons/gr";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { FaTimes } from 'react-icons/fa'; // import close icon
import { MdOutlinePayments } from 'react-icons/md';

const menuItems = [
    { label: "Dashboard", icon: <FaHome />, href: "/" },
    {
        label: "Exams / Result", icon: <FaBook />, href: "/exams",
        subItems: [
            { label: "Exam Timetable", href: "/exams/timetable" },
            { label: "Take Online Exams", href: "/exams/online" },
            { label: "Submit Exam Scripts", href: "/exams/submit" },
            { label: "View Results", href: "/exams/results" },
            { label: "GPA / CGPA Tracker", href: "/exams/gpa-tracker" },
            { label: "Download Transcripts", href: "/exams/transcripts" },
        ]
    },
    {
        label: "Registration Forms", icon: <FaWpforms />, href: "/registration-forms"
    },
    {
        label: "Courses", icon: <FaGraduationCap />, href: "/courses",
        subItems: [
            { label: "Registered Courses", href: "/courses/registered" },
            { label: "Register/Drop Courses", href: "/courses/register-drop" },
            { label: "Course Materials", href: "/courses/materials" },
            { label: "Assignment Uploads", href: "/courses/assignments" },
            { label: "Class Schedule / Timetable", href: "/courses/schedule" },
        ]
    },
    {
        label: "Payments", icon: <MdOutlinePayments />, href: "/payments",
        subItems: [
            { label: "Fee Breakdown", href: "/payments/fee-breakdown" },
            { label: "Pay Online", href: "/payments/pay-online" },
            { label: "View Payment History", href: "/payments/history" },
            { label: "Download Payment Receipts", href: "/payments/receipts" },
            { label: "Print Invoice", href: "/payments/invoice" },
        ]
    },
    {
        label: "Resources", icon: <GrResources />, href: "/resources",
        subItems: [
            { label: "eLibrary", href: "/resources/elibrary" },
            { label: "Lecture Notes", href: "/resources/notes" },
            { label: "Videos & Tutorials", href: "/resources/videos" },
            { label: "Study Groups / Forums", href: "/resources/groups" },
        ]
    },
    {
        label: "Academic Records", icon: <FaWpforms />, href: "/academic-records",
        subItems: [
            { label: "Course Registration History", href: "/academic-records/registration-history" },
            { label: "Academic Standing", href: "/academic-records/standing" },
            { label: "Download Admission Letter", href: "/academic-records/admission-letter" },
            { label: "Graduation Eligibility", href: "/academic-records/graduation-eligibility" },
        ]
    },
    {
        label: "My Profile", icon: <FaUser />, href: "/profile", badge: "New",
        subItems: [
            { label: "View & Edit Personal Info", href: "/profile/edit" },
            { label: "Upload Passport Photo", href: "/profile/photo" },
            { label: "Update Password", href: "/profile/password" },
            { label: "Download Student ID Card", href: "/profile/id-card" },
        ]
    },
];
  
  const miscItems = [
    { label: "User Settings", icon: <FaCog />, href: "/settings" },
    { label: "Support", icon: <FaComments />, href: "/support" },
    { label: "Logout", icon: <FaSignOutAlt />, href: "/logout" },
  ];

function Sidebar({ isOpen, setIsOpen }) {
  const [openDropdowns, setOpenDropdowns] = React.useState({});
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
          <img src="/c.jpg" alt="User" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm overflow-hidden">CHRISTOPHER Adimchukwu</p>
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
          {menuItems.map((item, i) => (
            <li key={i} className="relative">
              {/* Dropdown parent with subItems */}
              {item.subItems ? (
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 ${item.href === '/' ? 'bg-[#3b82f6]' : ''}`}
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
                  className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 ${item.href === '/' ? 'bg-[#3b82f6]' : ''}`}
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
                  {item.subItems.map((sub, j) => (
                    <li key={j}>
                      <Link href={sub.href} className="block px-4 py-2 rounded hover:bg-gray-600 text-sm" onClick={handleMenuClick}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="px-4 mt-6 text-gray-400 text-sm">MISCELLANEOUS</div>

        <ul className="px-2 mt-2 space-y-1">
          {miscItems.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700"
                onClick={handleMenuClick}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
