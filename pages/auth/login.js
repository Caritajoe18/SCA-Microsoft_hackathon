import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { Mail, Lock, BookOpen } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'magic'
  const router = useRouter();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before signing in.');
        }
        throw error;
      }
      router.push('/'); // Redirect to dashboard
    } catch (error) {
      console.error('Login Error:', error);
      setMessage(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard
        },
      });
      if (error) throw error;
      setMessage('Check your email for the magic link!');
      setEmail('');
    } catch (error) {
      console.error('Magic Link Error:', error);
      setMessage(error.message || 'An error occurred sending the magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login - Lenoff">
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Sign in to continue your learning journey</p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMethod === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={loading}
            >
              Password
            </button>
            <button
              onClick={() => setAuthMethod('magic')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMethod === 'magic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={loading}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={authMethod === 'password' ? handlePasswordLogin : handleMagicLink}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {authMethod === 'password' && (
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Please wait...
                </span>
              ) : authMethod === 'password' ? 'Sign In' : 'Send Magic Link'}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('Check your email') || message.includes('Confirmation email resent')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
              {message.includes('confirm your email') && (
                <button
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email,
                      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
                    });
                    if (error) setMessage(error.message);
                    else setMessage('Confirmation email resent! Check your inbox.');
                  }}
                  className="ml-2 text-orange-500 hover:underline"
                >
                  Resend confirmation email
                </button>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}