import React from 'react'

const AuthInfoSection = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-1/2 h-full bg-gradient-to-br from-blue-900 to-blue-600 text-white mx-12 p-12">
        <img src="/logo-50x100.jpg" alt="Logo" width={300} height={120} className="mb-8" />
        <h1 className="text-4xl font-bold mb-4">Join Our Community!</h1>
        <p className="text-lg mb-8 text-center max-w-md">Create your account to access courses, exams, resources, and more. Start your academic journey with us today.</p>
        <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center">
          <img src="/globe.svg" alt="Illustration" className="w-40 h-40" />
        </div>
      </div>
  )
}

export default AuthInfoSection
