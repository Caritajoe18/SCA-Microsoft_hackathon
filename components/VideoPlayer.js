import { useState, useEffect } from 'react'

export default function VideoPlayer({ video }) {
  const [embedUrl, setEmbedUrl] = useState('')

  useEffect(() => {
    if (video?.video_url) {
      const url = convertToEmbedUrl(video.video_url)
      setEmbedUrl(url)
    }
  }, [video])

  const convertToEmbedUrl = (url) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // If it's already an embed URL, return as is
    if (url.includes('embed')) {
      return url
    }
    // Default return the original URL
    return url
  }

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Invalid video URL</p>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title={video.title}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}