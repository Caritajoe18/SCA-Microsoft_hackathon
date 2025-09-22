import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, BookOpen, LogOut } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
              Lenoff
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Tracks
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    href="/admin/dashboard" 
                    className="text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{profile?.full_name || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}