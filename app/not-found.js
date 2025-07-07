'use client';

import Link from 'next/link';
import Head from 'next/head';
import { FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page In Progress</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-700">
          <div className="flex justify-center mb-6">
            <FiAlertTriangle className="text-5xl text-yellow-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-100 mb-3">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page in Progress</h2>
          
          <p className="text-gray-400 mb-6">
            Oops! The page you're looking for doesn't exist or  under construction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Go To Dashboard
            </Link>
            
            <Link
              href="/contact"
              className="px-6 py-3 border border-gray-600 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition-colors duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
