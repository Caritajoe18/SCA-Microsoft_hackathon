import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { Users, BookOpen, Star, Plus, BarChart3 } from 'lucide-react'

export default function AdminDashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    studentsCount: 0,
    tracksCount: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    checkAdminAccess()
  }, [session])

  const checkAdminAccess = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data?.role !== 'admin') {
        router.push('/')
        return
      }

      setProfile(data)
      await fetchStats()
      setLoading(false)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/')
    }
  }

  const fetchStats = async () => {
    try {
      // Get organization owned by current admin
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (!org) return

      // Get students count (learners who have rated videos in our tracks)
      const { data: students } = await supabase
        .from('ratings')
        .select(`
          user_id,
          videos!inner(
            track_id,
            tracks!inner(
              organization_id
            )
          )
        `)
        .eq('videos.tracks.organization_id', org.id)

      const uniqueStudents = new Set(students?.map(s => s.user_id) || [])

      // Get tracks count
      const { count: tracksCount } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      // Get average rating
      const { data: ratings } = await supabase
        .from('ratings')
        .select(`
          rating,
          videos!inner(
            track_id,
            tracks!inner(
              organization_id
            )
          )
        `)
        .eq('videos.tracks.organization_id', org.id)

      const averageRating = ratings && ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

      setStats({
        studentsCount: uniqueStudents.size,
        tracksCount: tracksCount || 0,
        averageRating: averageRating
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Dashboard - Lenoff">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-teal-500 rounded-xl text-white p-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="opacity-90">Welcome back, {profile?.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.studentsCount}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tracks</p>
                <p className="text-3xl font-bold text-gray-800">{stats.tracksCount}</p>
              </div>
              <BookOpen className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/organization"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-orange-500" />
              <span className="font-medium">Manage Organization</span>
            </Link>

            <Link
              href="/admin/tracks"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-teal-500" />
              <span className="font-medium">Manage Tracks</span>
            </Link>

            <Link
              href="/admin/videos"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-blue-500" />
              <span className="font-medium">Manage Videos</span>
            </Link>

            <Link
              href="/"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Users className="h-6 w-6 text-green-500" />
              <span className="font-medium">View as Student</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}