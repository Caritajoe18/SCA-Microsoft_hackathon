import '../app/globals.css'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        
        if (event === 'SIGNED_IN' && router.pathname.startsWith('/auth')) {
          router.push('/')
        }
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <Component 
      {...pageProps} 
      session={session} 
      loading={loading}
    />
  )
}