import ToastProvider from "@/components/ToastProvider";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
       <head>
        <title>WACCPS | Student Dashboard</title>
        <link rel="icon" href="/faviconi.ico" />
      </head>
      <body className="bg-[#454c56] flex flex-col lg:flex-row min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <div className="flex-1">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}