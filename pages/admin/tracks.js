import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminTracks({ session }) {
  const [organization, setOrganization] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
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
      // Check admin access and get organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

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
      await fetchTracks(org.id)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const fetchTracks = async (orgId) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          videos (id)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (error) {
      console.error('Error fetching tracks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingTrack) {
        // Update existing track
        const { error } = await supabase
          .from('tracks')
          .update({
            title: formData.title,
            description: formData.description
          })
          .eq('id', editingTrack.id)

        if (error) throw error
      } else {
        // Create new track
        const { error } = await supabase
          .from('tracks')
          .insert({
            title: formData.title,
            description: formData.description,
            organization_id: organization.id
          })

        if (error) throw error
      }
      
      setFormData({ title: '', description: '' })
      setShowForm(false)
      setEditingTrack(null)
      await fetchTracks(organization.id)
      alert('Track saved successfully!')
    } catch (error) {
      console.error('Error saving track:', error)
      alert('Error saving track: ' + error.message)
    }
  }

  const handleEdit = (track) => {
    setEditingTrack(track)
    setFormData({
      title: track.title,
      description: track.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (track) => {
    if (!confirm(`Are you sure you want to delete "${track.title}"? This will also delete all associated videos.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', track.id)

      if (error) throw error
      await fetchTracks(organization.id)
      alert('Track deleted successfully!')
    } catch (error) {
      console.error('Error deleting track:', error)
      alert('Error deleting track: ' + error.message)
    }
  }

  const cancelEdit = () => {
    setFormData({ title: '', description: '' })
    setShowForm(false)
    setEditingTrack(null)
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
    <Layout title="Manage Tracks - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Learning Tracks</h1>
                <p className="text-gray-600">{organization?.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Track</span>
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingTrack ? 'Edit Track' : 'Create New Track'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Web Development"
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
                  placeholder="Describe what students will learn in this track..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {editingTrack ? 'Update Track' : 'Create Track'}
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

        {/* Tracks List */}
        <div className="bg-white rounded-xl shadow-sm">
          {tracks.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tracks yet</h3>
              <p className="text-gray-500 mb-4">Create your first learning track to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
              >
                Create Track
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tracks.map((track) => (
                <div key={track.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {track.title}
                      </h3>
                      {track.description && (
                        <p className="text-gray-600 mb-2">{track.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{track.videos?.length || 0} videos</span>
                        <span>Created {new Date(track.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(track)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit track"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(track)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete track"
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