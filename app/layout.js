'use client'
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="bg-[#454c56] flex flex-col lg:flex-row min-h-screen">
        <AuthProvider>
              <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}