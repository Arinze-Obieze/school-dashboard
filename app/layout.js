'use client'
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
       <head>
        <title>WACCPS | Student Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#454c56] flex flex-col lg:flex-row min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <main className="flex-1">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}