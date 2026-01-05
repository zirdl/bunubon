import { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';

interface SignUpPageProps {
  onSignUp: (username: string, password: string, fullName: string, email: string) => Promise<{ success: boolean; message?: string }>;
  onBackToLogin: () => void;
}

export function SignUpPage({ onSignUp, onBackToLogin }: SignUpPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username || !password || !fullName || !email) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onSignUp(username, password, fullName, email);

      if (!result.success) {
        setError(result.message || 'Sign up failed');
      } else {
        // Optionally navigate to login or show success message
        onBackToLogin();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <button
          onClick={onBackToLogin}
          className="flex items-center text-emerald-700 hover:text-emerald-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-full mb-4">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-emerald-800 text-2xl font-bold">Create Account</h1>
          <p className="text-gray-600 mt-2">Department of Agrarian Reform</p>
          <p className="text-sm text-gray-500 mt-1">Provincial Office - La Union</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block mb-2 text-gray-700">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="username" className="block mb-2 text-gray-700">
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-700">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Confirm password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-3 rounded-lg hover:from-emerald-800 hover:to-emerald-900 transition-colors shadow-md ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            * Required fields
          </div>
        </form>
      </div>
    </div>
  );
}