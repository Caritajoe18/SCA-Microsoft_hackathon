import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { Mail, Lock, User, BookOpen } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Client-side validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });
      console.log('SignUp Response:', { data, error });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.user.confirmed_at) {
        setMessage('Account created! Please check your email to confirm your account.');
      } else {
        // Update profile if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated or not found');
        }
        await supabase
          .from('profiles')
          .update({ role, full_name: fullName })
          .eq('id', user.id);

        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      setMessage(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up - Lenoff">
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
              Join Lenoff
            </h1>
            <p className="text-gray-600 mt-2">Create your account to start learning</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="mb-4">
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
                  minLength={6}
                  disabled={loading}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="learner">Learner</option>
              </select>
            </div>

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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('successfully') || message.includes('check your email')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}