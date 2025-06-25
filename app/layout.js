'use client'
import Footer from "@/components/Footer";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function RootLayout({ children }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  return (
    <html lang="en">
      <body className="bg-[#454c56] flex flex-col lg:flex-row">
        {/* Sidebar: Hidden by default on small screens, fixed on large screens */}
        <Sidebar isOpen={toggleSidebar} />
        {/* Main content: Full width on small screens, offset by sidebar width on large screens */}
        <div className="flex-1 lg:ml-64">
          <Header toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
          <main>{children}</main>

                 {/* Footer  */}
        <div className="fixed bottom-0 w-full">
   <Footer/>
   </div>
        </div>

 
      </body>

 
    </html>
  );
}