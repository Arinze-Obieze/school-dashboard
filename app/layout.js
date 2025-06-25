import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";



export const metadata = {
  title: "dashboard",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#454c56]">
      <Header/>
        {children}
      </body>
    </html>
  );
}
