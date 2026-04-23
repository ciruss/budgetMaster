import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate({ to: '/' });
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
        <Link to="/signup" className="text-sm text-blue-600 mt-2 text-center">Need an account? Sign up</Link>
      </form>
    </div>
  );
}

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ email, password });
      await login({ email, password });
      navigate({ to: '/' });
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Sign Up</button>
        <Link to="/login" className="text-sm text-blue-600 mt-2 text-center">Already have an account? Login</Link>
      </form>
    </div>
  );
}
