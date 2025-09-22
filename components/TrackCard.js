import Link from 'next/link'
import { PlayCircle, Clock } from 'lucide-react'

export default function TrackCard({ track }) {
  const videoCount = track.videos?.length || 0

  return (
    <Link href={`/tracks/${track.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center">
          <PlayCircle className="h-16 w-16 text-orange-500" />
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {track.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {track.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {track.organizations?.name}
            </span>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{videoCount} videos</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}