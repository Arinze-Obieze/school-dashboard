"use client";

import { FaWhatsapp, FaTelegram, FaCheckCircle, FaArrowRight } from "react-icons/fa";

const GROUPS = [
  {
    name: "WhatsApp Group 1",
    description: "Join our main WhatsApp group for updates and discussions.",
    url: "https://wa.me/+2347081924221",
    icon: <FaWhatsapp className="text-green-500" size={28} />,
    color: "bg-green-500/10 hover:bg-green-500/20",
  },
  // {
  //   name: "WhatsApp Group 2",
  //   description: "Alternative WhatsApp group for members.",
  //   url: "https://chat.whatsapp.com/your-group-link-2",
  //   icon: <FaWhatsapp className="text-green-500" size={28} />,
  //   color: "bg-green-500/10 hover:bg-green-500/20",
  // },
  // {
  //   name: "Telegram Group",
  //   description: "Join our Telegram group for announcements.",
  //   url: "https://t.me/your-telegram-group",
  //   icon: <FaTelegram className="text-blue-400" size={28} />,
  //   color: "bg-blue-500/10 hover:bg-blue-500/20",
  // },
];

export default function MembershipSuccess() {

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <FaCheckCircle className="mx-auto text-green-400 text-5xl mb-4" />
            <h1 className="text-3xl font-bold text-white mb-3">
              Membership Registration Successful!
            </h1>
            <p className="text-gray-300 text-lg">
              Thank you for joining us! Get started by connecting with our community.
            </p>
          </div>
          
          <div className="space-y-4">
            {GROUPS.map((group, idx) => (
              <a
                key={idx}
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between ${group.color} transition-all rounded-lg p-5 group cursor-pointer border border-gray-700`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-700/50 group-hover:bg-gray-700/70 transition">
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">{group.name}</h3>
                    <p className="text-gray-400 text-sm">{group.description}</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-white transition mr-2" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}