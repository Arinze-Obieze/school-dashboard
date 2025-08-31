'use client'
import Link from "next/link";
import { IoIosMenu, IoIosNotificationsOutline, } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { MdDashboard, MdOutlineFullscreenExit } from "react-icons/md";

function Header({ toggleSidebar, setToggleSidebar }) {
  const handleToggleSidebar = () => {
    setToggleSidebar(!toggleSidebar);
  };

  return (
    <div className='flex justify-between items-center p-4 text-gray-300 shadow-md bg-[#343940]'>
      <div className='flex items-center gap-4'>
      <IoIosMenu className='text-2xl cursor-pointer lg:hidden' onClick={handleToggleSidebar} />
        <Link href="/" className='text-sm cursor-pointer'>Home</Link>

        <Link href="/contact" className='text-sm cursor-pointer'>Contact</Link>
      </div>

      <div className='flex items-center gap-4'>
      <IoIosNotificationsOutline className='text-2xl'/>
      </div>
    </div>
  )
}

export default Header
