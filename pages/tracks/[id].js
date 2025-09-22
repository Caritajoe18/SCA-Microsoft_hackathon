import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import VideoPlayer from '../../components/VideoPlayer'
import RatingComponent from '../../components/RatingComponent'
import { ArrowLeft, Play } from 'lucide-react'
import Link from 'next/link'

export default function TrackDetail({ session }) {
  const router = useRouter()
  const { id } = router.query
  const [track, setTrack] = useState(null)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (id) {
      fetchTrackData()
    }
  }, [id, session])

  const fetchTrackData = async () => {
    try {
      // Fetch track details
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .select(`
          *,
          organizations (name, description)
        `)
        .eq('id', id)
        .single()

      if (trackError) throw trackError

      // Fetch videos with ratings
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          ratings (rating, user_id)
        `)
        .eq('track_id', id)
        .order('created_at', { ascending: true })

      if (videosError) throw videosError

      setTrack(trackData)
      setVideos(videosData || [])
      if (videosData && videosData.length > 0) {
        setSelectedVideo(videosData[0])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching track data:', error)
      setLoading(false)
    }
  }

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
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

  if (!track) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Track not found</h1>
          <Link href="/" className="text-orange-500 hover:text-orange-600">
            ← Back to tracks
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`${track.title} - Lenoff`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to tracks</span>
        </Link>

        {/* Track Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {track.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {track.description}
          </p>
          <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
            {track.organizations?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {selectedVideo ? (
              <>
                <VideoPlayer video={selectedVideo} />
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedVideo.description}
                  </p>
                  <RatingComponent 
                    videoId={selectedVideo.id} 
                    userId={session?.user?.id} 
                  />
                </div>
              </>
            ) : (
              <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                <p className="text-gray-500">No videos available</p>
              </div>
            )}
          </div>

          {/* Video Playlist */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Course Videos</h3>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedVideo?.id === video.id
                      ? 'bg-orange-50 border-l-4 border-orange-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Play className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {index + 1}. {video.title}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}