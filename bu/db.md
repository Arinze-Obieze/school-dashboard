'use client'
import React from 'react'
import { FaBook, FaBookMedical, FaBookReader, FaGraduationCap, FaShoppingCart, FaUsers, FaWpforms } from "react-icons/fa"
import { LuMessagesSquare } from "react-icons/lu"
import CandidatesDashboardReport from './CandidatesDR'
import Card from './Card'
import { MdOutlinePayments } from 'react-icons/md'


const cards = [
  { title: "Exams / Result", icon: <FaBookReader className="text-3xl" />, bg: "#00a3ba", href: "/exams" },
  { title: "payments", icon: <MdOutlinePayments className="text-3xl" />, bg: "#dc143c", href: "/payments" },
  { title: "College Payments", icon: <FaShoppingCart className="text-3xl" />, bg: "#00b050", href: "/college-payments" },
{ title: "Courses", icon: <FaGraduationCap className="text-3xl" />, bg: "#a6a6a6", href: "/courses" },
{ title: "Submit Proposal", icon: <FaBook className="text-3xl" />, bg: "#a6a6a6", href: "/submit-proposal" },
  { title: "Update form", icon: <FaWpforms className="text-3xl" />, bg: "#3c4fff", href: "/update-form" },
  { title: "User Settings", icon: <FaUsers className="text-3xl" />, bg: "#000000", href: "/user-settings" },
  { title: "Support", icon: <LuMessagesSquare className="text-3xl" />, bg: "#ffcc00", href: "/support" },
]

function Dashboard() {
  return (
    <div>
      <div className='flex justify-between items-center mt-8 px-4'>
        <h1 className='text-2xl text-white'>Dashboard</h1>
        <div className='flex space-x-2'>
          <h3 className='text-blue-700'>Home</h3>
          <div className='text-white'> / </div>
          <nav className='text-gray-400'>Dashboard</nav>
        </div>
      </div>

      <div className="grid grid-cols-1 text-white sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            icon={card.icon}
            bg={card.bg}
            href={card.href}
          />
        ))}
      </div>

      <div className='p-4'>
        <CandidatesDashboardReport />
      </div>
    </div>
  )
}

export default Dashboard
