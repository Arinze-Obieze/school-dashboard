'use client'
import Card from '@/components/Card'
import React from 'react'
import {
  FaCalendarAlt,
  FaLaptopCode,
  FaPaperPlane,
  FaChartBar,
  FaGraduationCap,
  FaFileDownload
} from 'react-icons/fa'

const examCards = [
  {
    title: 'Exam Timetable',
    icon: <FaCalendarAlt className="text-3xl" />,
    bg: '#1abc9c',
    href: '/exams/timetable'
  },
  {
    title: 'Take Online Exams',
    icon: <FaLaptopCode className="text-3xl" />,
    bg: '#e67e22',
    href: '/exams/online'
  },
  {
    title: 'Submit Exam Scripts',
    icon: <FaPaperPlane className="text-3xl" />,
    bg: '#9b59b6',
    href: '/exams/submit'
  },
  {
    title: 'View Results',
    icon: <FaChartBar className="text-3xl" />,
    bg: '#3498db',
    href: '/exams/results'
  },
  {
    title: 'GPA / CGPA Tracker',
    icon: <FaGraduationCap className="text-3xl" />,
    bg: '#2ecc71',
    href: '/exams/gpa-tracker'
  },
  {
    title: 'Download Transcripts',
    icon: <FaFileDownload className="text-3xl" />,
    bg: '#e74c3c',
    href: '/exams/transcripts'
  }
]

function Exams() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Exams</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Exams</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {examCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            icon={card.icon}
            bg={card.bg}
            href={card.href}
          />
        ))}
      </div>
    </div>
  )
}

export default Exams
