'use client'
import React from 'react'
import Link from 'next/link'

function Card({ title, icon, bg, href, count }) {
  return (
    <Link href={href} className="flex overflow-hidden items-center gap-4 bg-[#343940] p-4 rounded-lg shadow-md hover:scale-[1.02] transition-transform">
      <div className="p-3 rounded" style={{ backgroundColor: bg }}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-medium text-white">{title}</h3>
        {typeof count === 'number' && (
          <span className="text-xs text-blue-300 font-semibold">{count} Registered</span>
        )}
      </div>
    </Link>
  )
}

export default Card
