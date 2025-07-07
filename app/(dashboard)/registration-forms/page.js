'use client'
import React from 'react'
import {
  FaUserPlus,
  FaHandshake,
  FaChalkboardTeacher
} from 'react-icons/fa'
import Card from '@/components/Card'

const registrationCards = [
  {
    title: 'Primary',
    icon: <FaChalkboardTeacher className="text-3xl" />,
    bg: '#9b59b6',
    href: '/registration-forms/primary'
  },
  {
    title: 'Membership',
    icon: <FaUserPlus className="text-3xl" />,
    bg: '#1abc9c',
    href: '/registration-forms/membership'
  },
  {
    title: 'Fellowship',
    icon: <FaHandshake className="text-3xl" />,
    bg: '#f39c12',
    href: '/registration-forms/fellowship'
  },

]

function RegistrationForms() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Registration Forms</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Registration</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {registrationCards.map((card, index) => (
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

export default RegistrationForms
