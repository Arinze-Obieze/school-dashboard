'use client'
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CourseProvider } from "@/context/CourseContext";

export default function Layout({ children }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  return (
       <ProtectedRoute>
         <CourseProvider>
      <div className="bg-[#454c56] flex flex-col lg:flex-row min-h-screen">
            {/* Sidebar: Hidden by default on small screens, fixed on large screens */}
            <Sidebar isOpen={toggleSidebar} setIsOpen={setToggleSidebar}  />
            {/* Main content: Full width on small screens, offset by sidebar width on large screens */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
              <Header toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
              <div className="flex-1">{children}</div>
              {/* Footer  */}
              <Footer/>
            </div>
      
      </div>
      </CourseProvider>

      </ProtectedRoute>
  
 
  );
}