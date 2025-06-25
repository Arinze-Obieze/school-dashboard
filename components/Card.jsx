'use client'
import React from 'react'
import Link from 'next/link'

function Card({ title, icon, bg, href }) {
  return (
    <Link href={href} className="flex overflow-hidden items-center gap-4 bg-[#343940] p-4 rounded-lg shadow-md hover:scale-[1.02] transition-transform">
      <div className="p-3 rounded" style={{ backgroundColor: bg }}>
        {icon}
      </div>
      <h3 className="text-base font-medium text-white">{title}</h3>
    </Link>
  )
}

export default Card
