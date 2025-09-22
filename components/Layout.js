import Head from 'next/head'
import Navbar from './Navbar'

export default function Layout({ children, title = 'Lenoff LMS' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Lenoff Learning Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  )
}