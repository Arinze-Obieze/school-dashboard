import React from "react";
import { GiSpanner } from "react-icons/gi";
export default function CandidatesDashboardReport() {
  return (
    <div className="bg-[#343940] text-gray-300 p-4 ">
      {/* Header */}
      <div className="mb-6 flex bg justify-between items-center">
        <h2 className="text-white font-semibold text-lg">Candidates Dashboard Report</h2>
        <div className="flex place-items-center space-x-2 text-gray-400">
          <button title="Minimize" className="hover:text-white">_</button>
          <button title="Maximize" className="hover:text-white"><GiSpanner /></button>
          <button title="Close" className="hover:text-white">×</button>
        </div>
      </div>

      {/* Exam Status Label */}
      <div className="text-center text-sm font-bold text-gray-200 mb-2">Exam Status</div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded h-3 mb-6 relative">
        <div
          className="bg-green-600 h-3 rounded"
          style={{ width: "5%" }}
          aria-label="Progress"
        ></div>
        <span className=" absolute right-0 top-0 -mt-6 text-gray-400 font-semibold text-sm">5%</span>
      </div>

      {/* User Label */}
      <div className="text-green-500 font-semibold mb-6">User</div>

      {/* Stats Section */}
      <div className="flex bg-[#2f3339] py-4 justify-between border-t border-gray-600 pt-4 text-center text-xs">
        {/* No Result (New) */}
        <div className="flex-1 border-r border-gray-600">
          <div className="text-green-500 font-semibold text-sm mb-1">-5%</div>
          <div className="font-bold text-gray-200 mb-0.5">No Result (New)</div>
          <div className="uppercase text-gray-400 tracking-widest">USER</div>
        </div>

        {/* Non */}
        <div className="flex-1 border-r border-gray-600">
          <div className="text-yellow-500 font-semibold text-sm mb-1">0%</div>
          <div className="font-bold text-gray-200 mb-0.5">Non</div>
          <div className="uppercase text-gray-400 tracking-widest">NEW USER</div>
        </div>

        {/* No Payment */}
        <div className="flex-1 border-r border-gray-600">
          <div className="text-pink-500 font-semibold text-sm mb-1">No Payment</div>
          <div className="font-bold text-gray-200 mb-0.5">Non</div>
          <div className="uppercase text-gray-400 tracking-widest">NEW USER</div>
        </div>

        {/* No Goal Set */}
        <div className="flex-1">
          <div className="text-cyan-400 font-semibold text-sm mb-1">0%</div>
          <div className="font-bold text-gray-200 mb-0.5">No Goal Set</div>
          <div className="uppercase text-gray-400 tracking-widest">GOAL</div>
        </div>
      </div>
    </div>
  );
}
