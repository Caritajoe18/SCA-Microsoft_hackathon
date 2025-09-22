import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star } from 'lucide-react'

export default function RatingComponent({ videoId, userId }) {
  const [rating, setRating] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    if (videoId && userId) {
      fetchRatings()
    }
  }, [videoId, userId])

  const fetchRatings = async () => {
    try {
      // Get user's rating
      const { data: userRating } = await supabase
        .from('ratings')
        .select('rating')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .single()

      if (userRating) {
        setRating(userRating.rating)
      }

      // Get average rating and count
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('video_id', videoId)

      if (allRatings && allRatings.length > 0) {
        const sum = allRatings.reduce((acc, r) => acc + r.rating, 0)
        setAverageRating(sum / allRatings.length)
        setTotalRatings(allRatings.length)
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const handleRating = async (newRating) => {
    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: userId,
          video_id: videoId,
          rating: newRating
        })

      if (error) throw error

      setRating(newRating)
      await fetchRatings() // Refresh to get updated average
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  return (
    <div className="border-t pt-4">
      <h4 className="font-semibold text-gray-800 mb-3">Rate this video</h4>
      
      {/* Star Rating */}
      <div className="flex items-center space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                (hover || rating) >= star
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `You rated ${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
        </span>
      </div>

      {/* Average Rating Display */}
      {totalRatings > 0 && (
        <div className="text-sm text-gray-600">
          Average: {averageRating.toFixed(1)}/5 ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
        </div>
      )}
    </div>
  )
}