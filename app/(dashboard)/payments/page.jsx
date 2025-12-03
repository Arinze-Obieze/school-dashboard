'use client'
import React from 'react'
import {
  FaListAlt,
  FaCreditCard,
  FaHistory,
  FaDownload,
  FaPrint
} from 'react-icons/fa'
import Card from '@/components/Card'

const paymentCards = [
  // {
  //   title: 'Fee Breakdown',
  //   icon: <FaListAlt className="text-3xl" />,
  //   bg: '#2980b9',
  //   href: '/payment/fee-breakdown'
  // },
  // {
  //   title: 'Pay Online',
  //   icon: <FaCreditCard className="text-3xl" />,
  //   bg: '#27ae60',
  //   href: '/payment/pay'
  // },
  {
    title: 'View Payment History',
    icon: <FaHistory className="text-3xl" />,
    bg: '#8e44ad',
    href: '/payments/history'
  },
  // {
  //   title: 'Download Payment Receipts',
  //   icon: <FaDownload className="text-3xl" />,
  //   bg: '#e67e22',
  //   href: '/payment/receipts'
  // },
  // {
  //   title: 'Print Invoice',
  //   icon: <FaPrint className="text-3xl" />,
  //   bg: '#c0392b',
  //   href: '/payment/invoice'
  // }
]

function Payments() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Payments</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Payments</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {paymentCards.map((card, index) => (
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

export default Payments
