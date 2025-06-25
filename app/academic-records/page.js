'use client'
import Card from '@/components/Card'
import React from 'react'
import {
  FaBook,
  FaBalanceScale,
  FaFileDownload,
  FaCheckCircle
} from 'react-icons/fa'

const recordsCards = [
  {
    title: 'Course Registration History',
    icon: <FaBook className="text-3xl" />,
    bg: '#34495e',
    href: '/records/registration-history'
  },
  {
    title: 'Academic Standing',
    icon: <FaBalanceScale className="text-3xl" />,
    bg: '#2ecc71',
    href: '/records/academic-standing'
  },
  {
    title: 'Download Admission Letter',
    icon: <FaFileDownload className="text-3xl" />,
    bg: '#e67e22',
    href: '/records/admission-letter'
  },
  {
    title: 'Graduation Eligibility',
    icon: <FaCheckCircle className="text-3xl" />,
    bg: '#9b59b6',
    href: '/records/graduation-eligibility'
  }
]

function AcademicRecords() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Academic Records</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Academic Records</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {recordsCards.map((card, index) => (
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

export default AcademicRecords
