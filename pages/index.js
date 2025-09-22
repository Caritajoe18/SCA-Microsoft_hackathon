import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import TrackCard from '../components/TrackCard'
import { useRouter } from 'next/router'

export default function Home({ session, loading }) {
  const [tracks, setTracks] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login')
      return
    }
    if (session) {
      fetchTracks()
    }
  }, [session, loading])

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          organizations (name),
          videos (id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (error) {
      console.error('Error fetching tracks:', error)
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

  if (!session) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-orange-500 to-teal-500 rounded-xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Lenoff
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover amazing learning tracks and expand your knowledge with our comprehensive video courses
          </p>
        </div>

        {/* Tracks Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Learning Tracks
          </h2>
          
          {tracks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg">No tracks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}