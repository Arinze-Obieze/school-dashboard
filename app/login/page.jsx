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
    <div className="min-h-screen flex items-center justify-center bg-[#23272f]">
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
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Login</button>
        <p className="mt-4 text-gray-400 text-sm text-center">
          Don't have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}
