'use client';
import React from 'react';
import Link from 'next/link';
import {
  FaHome, FaBook, FaWpforms, FaGraduationCap,
  FaShoppingCart, FaBookMedical, FaUser,
  FaCog, FaComments, FaSignOutAlt
} from 'react-icons/fa';

const menuItems = [
  { label: "Dashboard", icon: <FaHome />, href: "/" },
  { label: "Exams / Result", icon: <FaBook />, href: "/exams" },
  { label: "Training Forms", icon: <FaWpforms />, href: "/training-forms" },
  { label: "Courses", icon: <FaGraduationCap />, href: "/courses" },
  { label: "Fellowship Forms", icon: <FaGraduationCap />, href: "/fellowship-forms" },
  { label: "College Payments", icon: <FaShoppingCart />, href: "/college-payments" },
//   { label: "Approved Dissertations", icon: <FaBookMedical />, href: "/approved-dissertations" },
  { label: "Academic Records", icon: <FaWpforms />, href: "/academic-records" },
  { label: "My Profile", icon: <FaUser />, href: "/profile", badge: "New" },
  { label: "Update User", icon: <FaWpforms />, href: "/update-user" },
];

const miscItems = [
  { label: "User Settings", icon: <FaCog />, href: "/settings" },
  { label: "Support", icon: <FaComments />, href: "/support" },
  { label: "Logout", icon: <FaSignOutAlt />, href: "/logout" },
];

function Sidebar({ isOpen }) {
  return (
    <div
      className={`bg-[#343940] z-50 text-white w-64 min-h-screen flex flex-col fixed top-0 left-0 h-full transition-transform duration-200 ease-in-out transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div>
        <div className="text-center mt-4 mb-2">
          <h2 className="font-extralight text-lg">User Dashboard</h2>
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
            <li key={i}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 ${
                  item.href === '/' ? 'bg-[#3b82f6]' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
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
