'use client';
import React from 'react';
import { FaBookOpen, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { MdEventNote, MdNotificationsActive } from 'react-icons/md';
import Link from 'next/link';
import Card from './Card';

const Dashboard = () => {
  // Sample data
  const stats = [
    { title: 'Courses Enrolled', value: 0, icon: <FaBookOpen className="text-blue-500 text-xl" />, bg: '#23272f', href: '/courses' },
    { title: 'GPA', value: 0, icon: <FaChartLine className="text-green-500 text-xl" />, bg: '#23272f', href: '/exams/gpa-tracker' },
    { title: 'Outstanding Fees', value: '0', icon: <FaDollarSign className="text-red-500 text-xl" />, bg: '#23272f', href: '/payments' },
  ];

  const upcomingExams = [
    {/*
    { title: 'PSY501 - Psychopathology', date: '2025-07-05', time: '9:00 AM' hidden},
    { title: 'PSY505 - Cognitive Behavioral Therapy', date: '2025-07-07', time: '2:00 PM' },
    */}
  ];

  const notifications = [
    { id: 1, message: 'School portal will be under maintenance this weekend.' },
    { id: 2, message: 'Get to know your center.' },
    { id: 3, message: 'Application is still on.' },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#3e444d]">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Welcome back 👋</h1>
        <p className="text-gray-400 mt-1">Here’s what’s happening with your academic profile.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={<><span className="text-lg font-semibold text-white">{stat.value}</span> <span className="block text-gray-400 text-sm font-normal">{typeof stat.title === 'string' ? stat.title : ''}</span></>}
            icon={stat.icon}
            bg={stat.bg}
            href={stat.href}
          />
        ))}
      </div>

      {/* Upcoming Exams */}
      <div className="bg-[#23272f] shadow rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
            <MdEventNote className="text-blue-400" />
            Upcoming Exams / Deadlines
          </h2>
          <Link href="/exams" className="text-sm text-blue-400 hover:underline">View All</Link>
        </div>
        <ul className="space-y-2">
          {upcomingExams.map((exam, index) => (
            <li key={index} className="border border-gray-700 rounded p-3 hover:bg-[#343940] transition">
              <p className="font-medium text-gray-100">{exam.title}</p>
              <p className="text-sm text-gray-400">{exam.date} at {exam.time}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      <div className="bg-[#23272f] shadow rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
            <MdNotificationsActive className="text-orange-400" />
            Notifications & Announcements
          </h2>
          <Link href="/notifications" className="text-sm text-orange-400 hover:underline">Read More</Link>
        </div>
        <ul className="space-y-2">
          {notifications.slice(0, 3).map((note) => (
            <li key={note.id} className="text-gray-200 text-sm border-l-4 border-orange-400 pl-3">
              • {note.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
