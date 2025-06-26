'use client'
import Card from '@/components/Card'
import React from 'react'
import {
  FaExclamationCircle,
  FaQuestionCircle
} from 'react-icons/fa'

const supportCards = [
  {
    title: 'Submit a Complaint / Issue',
    icon: <FaExclamationCircle className="text-3xl" />,
    bg: '#e74c3c',
    href: '/support/complaint'
  },
  {
    title: 'FAQ Section',
    icon: <FaQuestionCircle className="text-3xl" />,
    bg: '#f1c40f',
    href: '/support/faq'
  }
]

function Support() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Support</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Support</nav>
        </div>
      </div>

   
      {/* Remaining Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 p-4">
        {supportCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            icon={card.icon}
            bg={card.bg}
            href={card.href}
          />
        ))}
      </div>



         {/* Contact Form */}
         <div className='p-4'>
        <div className="bg-[#343940] p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-white font-semibold mb-4">Contact Admin / Help Desk</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-white mb-1">Your Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Your Message</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Support
