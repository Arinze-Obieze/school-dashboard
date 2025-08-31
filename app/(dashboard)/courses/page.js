'use client'
import Card from '@/components/Card'
import React from 'react'
import { FaBookOpen, FaPlusCircle, FaCloudDownloadAlt, FaUpload, FaRegClock } from 'react-icons/fa'


const courseCards = [
  {
    title: 'Register/Drop Courses',
    icon: <FaPlusCircle className="text-3xl" />,
    bg: '#7ed957',
    href: '/courses/register'
  },
  {
    title: 'Registered Courses',
    icon: <FaBookOpen className="text-3xl" />,
    bg: '#4a90e2',
    href: '/courses/registered'
  },
  {
    title: 'Course Materials',
    icon: <FaCloudDownloadAlt className="text-3xl" />,
    bg: '#f5a623',
    href: '/courses/materials'
  },
  // {
  //   title: 'Assignment Uploads',
  //   icon: <FaUpload className="text-3xl" />,
  //   bg: '#d0021b',
  //   href: '/courses/assignments'
  // },
  {
    title: 'Class Schedule / Timetable',
    icon: <FaRegClock className="text-3xl" />,
    bg: '#9013fe',
    href: '/courses/timetable'
  }
]

function Courses() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Courses</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Courses</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {courseCards.map((card, index) => (
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

export default Courses
