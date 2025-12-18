'use client';
import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaDollarSign, FaChartLine, FaSpinner, FaRegClock } from 'react-icons/fa';
import { MdEventNote } from 'react-icons/md';
import Link from 'next/link';
import Card from '@/components/Card';
import Notifications from '@/components/Notifications';
import { useCourse } from '@/context/CourseContext';
import { auth } from '@/firebase';

const Dashboard = () => {
  const { registeredCount, loading } = useCourse();
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Get exam status based on time
  const getExamStatus = (exam) => {
    const now = currentTime;
    
    const examStart = new Date(`${exam.date}T${exam.time_range_start}`);
    const examEnd = new Date(`${exam.date}T${exam.time_range_end}`);
    
    if (exam.started === 1) {
      return exam.completed === 1 ? 'completed' : 'in-progress';
    }
    
    const bufferMs = 15 * 60 * 1000;
    
    if (now < (examStart - bufferMs)) {
      return 'upcoming';
    } else if (now >= (examStart - bufferMs) && now <= examEnd) {
      return 'active';
    } else if (now > examEnd && now <= (examEnd + bufferMs)) {
      return 'active';
    } else if (now > examEnd) {
      return 'past';
    }
    
    return 'unknown';
  };

  // Fetch exams
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchExams(currentUser.uid);
      } else {
        setExamsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchExams = async (studentId) => {
    setExamsLoading(true);
    
    try {
      const response = await fetch(`/api/exams?studentId=${studentId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch exams`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setExams([]);
        return;
      }
      
      const transformedExams = data.map((exam, index) => ({
        id: exam.quiz_id?.toString() || `exam-${index}`,
        exam_id: exam.quiz_id,
        title: exam.title || 'Untitled Exam',
        course_name: exam.courses?.[0]?.name || 'General',
        course_code: exam.courses?.[0]?.id || 'N/A',
        date: exam.date,
        time_range_start: exam.time_range_start,
        time_range_end: exam.time_range_end,
        duration_hours: exam.time_allowed_hours || 0,
        duration_minutes: exam.time_allowed_minutes || 0,
        started: exam.started === 1,
        completed: exam.completed === 1,
        exam_link: `https://cbt.waccps.org/exam/${exam.quiz_id}`,
        status: getExamStatus({
          date: exam.date,
          time_range_start: exam.time_range_start,
          time_range_end: exam.time_range_end,
          started: exam.started,
          completed: exam.completed
        })
      }));
      
      setExams(transformedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Courses Enrolled', 
      value: loading ? '...' : registeredCount, 
      icon: <FaBookOpen className="text-blue-500 text-xl" />, 
      bg: '#23272f', 
      href: '/courses' 
    },
  ];

  // Get upcoming exams (limit to 5)
  const upcomingExams = exams
    .filter(exam => exam.status === 'upcoming' || exam.status === 'active')
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time_range_start}`);
      const bDate = new Date(`${b.date}T${b.time_range_start}`);
      return aDate - bDate;
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-[#3e444d]">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Welcome back 👋</h1>
        <p className="text-gray-400 mt-1">Here's what's happening with your academic profile.</p>
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
      <div className="bg-[#23272f] mt-22 shadow rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
            <MdEventNote className="text-blue-400" />
            Upcoming Exams / Deadlines
          </h2>
          <Link href="/exams/history" className="text-sm text-blue-400 hover:underline">View All</Link>
        </div>
        
        {examsLoading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-blue-400 mr-2" />
            <span className="text-gray-400">Loading exams...</span>
          </div>
        ) : upcomingExams.length === 0 ? (
          <div className="text-center py-6">
            <FaRegClock className="text-3xl text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No upcoming exams scheduled</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcomingExams.map((exam) => (
              <li 
                key={exam.id} 
                className={`border rounded p-3 transition ${
                  exam.status === 'active' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-700 hover:bg-[#343940]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-100">{exam.title}</p>
                    <p className="text-sm text-gray-400">{exam.course_name} ({exam.course_code})</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`${exam.date}T${exam.time_range_start}`).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })} at {new Date(`2000-01-01T${exam.time_range_start}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                    exam.status === 'active' 
                      ? 'bg-green-500/30 text-green-300' 
                      : 'bg-blue-500/30 text-blue-300'
                  }`}>
                    {exam.status === 'active' ? 'Active Now' : 'Upcoming'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Notifications />
    </div>
  );
};

export default Dashboard;