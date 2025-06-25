'use client'
import React from 'react'
import {
  FaBook,
  FaFileAlt,
  FaVideo,
  FaUsers
} from 'react-icons/fa'
import Card from '@/components/Card'

const resourceCards = [
  {
    title: 'eLibrary (Books, PDFs, Journals)',
    icon: <FaBook className="text-3xl" />,
    bg: '#3498db',
    href: '/resources/elibrary'
  },
  {
    title: 'Lecture Notes',
    icon: <FaFileAlt className="text-3xl" />,
    bg: '#2ecc71',
    href: '/resources/notes'
  },
  {
    title: 'Videos & Tutorials',
    icon: <FaVideo className="text-3xl" />,
    bg: '#e67e22',
    href: '/resources/videos'
  },
  {
    title: 'Study Groups / Forums',
    icon: <FaUsers className="text-3xl" />,
    bg: '#9b59b6',
    href: '/resources/groups'
  }
]

function Resources() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Resources</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Resources</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {resourceCards.map((card, index) => (
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

export default Resources
