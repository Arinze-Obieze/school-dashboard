'use client'
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Layout({ children }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  return (
    <html lang="en">
      <body className="bg-[#454c56] flex flex-col lg:flex-row min-h-screen">
      
          <ProtectedRoute>
            {/* Sidebar: Hidden by default on small screens, fixed on large screens */}
            <Sidebar isOpen={toggleSidebar} setIsOpen={setToggleSidebar}  />
            {/* Main content: Full width on small screens, offset by sidebar width on large screens */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
              <Header toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
              <main className="flex-1">{children}</main>
              {/* Footer  */}
              <Footer/>
            </div>
          </ProtectedRoute>
      
      </body>
    </html>
  );
}