'use client'
import React from 'react'
import { FaBook, FaBookMedical, FaBookReader, FaShoppingCart, FaUsers } from "react-icons/fa"
import { FaWpforms } from "react-icons/fa"
import { LuMessagesSquare } from "react-icons/lu"
import CandidatesDashboardReport from './CandidatesDR'

const cards = [
  { title: "Exam Forms", icon: <FaBookReader className="text-3xl" />, bg: "#00a3ba" },
  { title: "Training Forms", icon: <FaWpforms className="text-3xl" />, bg: "#dc143c" },
  { title: "College Payments", icon: <FaShoppingCart className="text-3xl" />, bg: "#00b050" },
  { title: "Approved Dissertations", icon: <FaBookMedical className="text-3xl" />, bg: "#8000ff" },
  { title: "Submit Proposal", icon: <FaBook className="text-3xl" />, bg: "#a6a6a6" },
  { title: "Update form", icon: <FaWpforms className="text-3xl" />, bg: "#3c4fff" },
  { title: "User Settings", icon: <FaUsers className="text-3xl" />, bg: "#000000" },
  { title: "Support", icon: <LuMessagesSquare className="text-3xl" />, bg: "#ffcc00" },
]

function Dashboard() {
  return (
  <div>

<div className='flex justify-between place-items-center mt-8 px-4'>
    <h1 className='text-2xl text-white'>Dashboard</h1>

    <div className='flex space-x-2'>
        <h3 className='text-blue-700'>Home</h3> <div className='text-white'> /</div> <nav className='text-gray-400'>Dashboard</nav>
    </div>
</div>

      <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {cards.map((card, index) => (
        <div key={index} className="flex overflow-hidden items-center gap-4 bg-[#343940] p-4 rounded-lg shadow-md">
          <div className="p-3 rounded" style={{ backgroundColor: card.bg }}>
            {card.icon}
          </div>
          <h3 className="text-base font-medium">{card.title}</h3>
        </div>
      ))}
    </div>

   <div className='p-4'>
   <CandidatesDashboardReport/>
   </div>
  </div>
  )
}

export default Dashboard
