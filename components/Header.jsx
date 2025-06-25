import React from 'react'
import { IoIosMenu, IoIosNotificationsOutline, } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { MdDashboard, MdOutlineFullscreenExit } from "react-icons/md";

function Header() {
  return (
    <div className='flex justify-between items-center p-4 text-gray-300 shadow-md bg-[#343940]'>
      <div className='flex items-center gap-4'>
      <IoIosMenu className='text-2xl'/>
        <h3 className='text-sm'>Home</h3>

        <h3 className='text-sm'>Contact</h3>
      </div>

      <div className='flex items-center gap-4'>
      <IoSearch className='text-2xl'/>
      <IoIosNotificationsOutline className='text-2xl'/>
      <MdOutlineFullscreenExit className='text-2xl'/>
      <MdDashboard className='text-2xl'/>
      </div>
    </div>
  )
}

export default Header
