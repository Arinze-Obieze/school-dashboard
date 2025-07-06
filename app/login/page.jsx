'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-[#23272f]">
      {/* Side panel for large screens */}
      <div className="hidden lg:flex  mx-12 flex-col justify-center items-center w-1/2 h-full bg-gradient-to-br from-blue-900 to-blue-600 text-white p-12">
        <img src="/logo-50x100.jpg" alt="Logo" width={300} height={120} className="mb-8" />
        <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-lg mb-8 text-center max-w-md">Access your dashboard, manage your courses, and stay connected with your academic journey.</p>
        <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center">
          {/* You can replace this with an illustration or SVG */}
          <img src="/globe.svg" alt="Illustration" className="w-40 h-40" />
        </div>
      </div>
      {/* Main form area */}
      <div className="flex flex-1 flex-col items-center justify-center w-full lg:w-1/2 px-4 py-8">
        <div className="flex justify-center mb-6 lg:hidden">
          <img src="/logo-50x100.jpg" alt="Logo" width={300} height={120} />
        </div>
        <form onSubmit={handleLogin} className="bg-[#343940] p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl mb-6 text-white text-center">Login</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-2 rounded">Login</button>
          <p className="mt-4 text-gray-400 text-sm text-center">
          Don&apos;t have an account? <a href="/signup" className="text-blue-400 hover:underline">Apply Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
