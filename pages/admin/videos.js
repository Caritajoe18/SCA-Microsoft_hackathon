import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import { Video, Plus, Edit, Trash2, ExternalLink } from 'lucide-react'

export default function AdminVideos({ session }) {
  const [organization, setOrganization] = useState(null)
  const [tracks, setTracks] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    track_id: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    checkAdminAndFetch()
  }, [session])

  const checkAdminAndFetch = async () => {
    try {
      // Check admin access
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (!org) {
        router.push('/admin/organization')
        return
      }

      setOrganization(org)
      await fetchTracksAndVideos(org.id)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const fetchTracksAndVideos = async (orgId) => {
    try {
      // Fetch tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: true })

      setTracks(tracksData || [])

      // Fetch videos
      const { data: videosData } = await supabase
        .from('videos')
        .select(`
          *,
          tracks (title)
        `)
        .in('track_id', (tracksData || []).map(t => t.id))
        .order('created_at', { ascending: false })

      setVideos(videosData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingVideo) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            track_id: formData.track_id
          })
          .eq('id', editingVideo.id)

        if (error) throw error
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert({
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            track_id: formData.track_id
          })

        if (error) throw error
      }
      
      setFormData({ title: '', description: '', video_url: '', track_id: '' })
      setShowForm(false)
      setEditingVideo(null)
      await fetchTracksAndVideos(organization.id)
      alert('Video saved successfully!')
    } catch (error) {
      console.error('Error saving video:', error)
      alert('Error saving video: ' + error.message)
    }
  }

  const handleEdit = (video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      track_id: video.track_id
    })
    setShowForm(true)
  }

  const handleDelete = async (video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id)

      if (error) throw error
      await fetchTracksAndVideos(organization.id)
      alert('Video deleted successfully!')
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Error deleting video: ' + error.message)
    }
  }

  const cancelEdit = () => {
    setFormData({ title: '', description: '', video_url: '', track_id: '' })
    setShowForm(false)
    setEditingVideo(null)
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
    <Layout title="Manage Videos - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Course Videos</h1>
                <p className="text-gray-600">{organization?.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={tracks.length === 0}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>Add Video</span>
            </button>
          </div>
          {tracks.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                You need to create at least one track before you can add videos.{' '}
                <button
                  onClick={() => router.push('/admin/tracks')}
                  className="underline hover:text-yellow-900"
                >
                  Create a track
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="track_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Track *
                </label>
                <select
                  id="track_id"
                  value={formData.track_id}
                  onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a track</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Introduction to HTML"
                />
              </div>

              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL * (YouTube supported)
                </label>
                <input
                  type="url"
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe what this video covers..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos List */}
        <div className="bg-white rounded-xl shadow-sm">
          {videos.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No videos yet</h3>
              <p className="text-gray-500 mb-4">Add your first video to get started</p>
              {tracks.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                >
                  Add Video
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {video.title}
                        </h3>
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                          title="View video"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {video.description && (
                        <p className="text-gray-600 mb-2">{video.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                          {video.tracks?.title}
                        </span>
                        <span>Added {new Date(video.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit video"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}