import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import { Building, Plus } from 'lucide-react'

export default function AdminOrganization({ session }) {
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    checkAdminAndFetchOrg()
  }, [session])

  const checkAdminAndFetchOrg = async () => {
    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      // Fetch existing organization
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (org) {
        setOrganization(org)
        setFormData({
          name: org.name,
          description: org.description || ''
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (organization) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq('id', organization.id)

        if (error) throw error
      } else {
        // Create new organization
        const { data, error } = await supabase
          .from('organizations')
          .insert({
            name: formData.name,
            description: formData.description,
            owner_id: session.user.id
          })
          .select()
          .single()

        if (error) throw error
        setOrganization(data)
      }
      
      alert('Organization saved successfully!')
    } catch (error) {
      console.error('Error saving organization:', error)
      alert('Error saving organization: ' + error.message)
    } finally {
      setSaving(false)
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
    <Layout title="Manage Organization - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {organization ? 'Manage Organization' : 'Create Organization'}
              </h1>
              <p className="text-gray-600">
                {organization ? 'Update your organization details' : 'Create your first organization to start adding courses'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., TechEd Academy"
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
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell us about your organization..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || !formData.name}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (organization ? 'Update Organization' : 'Create Organization')}
              </button>
              
              {organization && (
                <button
                  type="button"
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Organization Info */}
        {organization && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-2">Organization Status</h3>
            <p className="text-teal-600">
              Your organization "{organization.name}" is active and ready to accept courses and students.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}