import { useState } from 'react'

export default function VideoSection({ onLoginClick, isLoggedIn }) {
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [isGeneratingReel, setIsGeneratingReel] = useState(false)
  const [isGeneratingRunway, setIsGeneratingRunway] = useState(false)
  const [runwayProgress, setRunwayProgress] = useState(0)
  const [showRunwayProgress, setShowRunwayProgress] = useState(false)

  const handleGenerateTryOn = async () => {
    setIsGeneratingTryOn(true)
    try {
      const response = await fetch('/api/video/generate-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'demo',
          product_name: 'Fashion Item',
          body_type: 'average',
        }),
      })
      const data = await response.json()
      if (data.success) {
        // Handle video preview
        console.log('Try-on video ready:', data.video)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGeneratingTryOn(false)
    }
  }

  const handleGenerateReel = async () => {
    setIsGeneratingReel(true)
    try {
      const response = await fetch('/api/video/generate-styling-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfit_id: 'demo',
          outfit_items: [],
        }),
      })
      const data = await response.json()
      if (data.success) {
        console.log('Styling reel ready:', data.video)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGeneratingReel(false)
    }
  }

  const handleGenerateRunway = async () => {
    setIsGeneratingRunway(true)
    setShowRunwayProgress(true)
    setRunwayProgress(0)

    // Animate progress
    const progressInterval = setInterval(() => {
      setRunwayProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const response = await fetch('/api/video/generate-runway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'Weekly Highlights',
          music_mood: 'elegant',
        }),
      })
      const data = await response.json()
      if (data.success) {
        console.log('Runway show ready:', data.video)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      clearInterval(progressInterval)
      setIsGeneratingRunway(false)
      setShowRunwayProgress(false)
    }
  }

  return (
    <section 
      id="video-experience" 
      className="panel relative flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>

      <div className="relative z-20 w-full max-w-7xl overflow-y-auto max-h-screen px-6 py-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="ai-badge">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              AI Video
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-light mb-4 text-white tracking-tight">
            See It <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">In Motion</span>
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Experience fashion like never before with AI-generated videos
          </p>
        </div>

        {/* Video Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Micro Try-On Videos */}
          <div className="tryon-card group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Micro Try-On</h3>
                <p className="text-gray-500 text-xs">5-second motion clips</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              See any piece on an AI model with your body type, styled with items already in your closet.
            </p>

            {/* Demo Video Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900/50 aspect-[3/4] mb-4">
              <img 
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop" 
                alt="Try-on preview" 
                className="w-full h-full object-cover opacity-60" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="play-button scale-75">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="video-timestamp">0:05</div>
            </div>

            <button 
              onClick={handleGenerateTryOn}
              disabled={isGeneratingTryOn}
              className="tryon-btn w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingTryOn ? (
                <>
                  <span className="video-loading-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Generate Try-On
                </>
              )}
            </button>
          </div>

          {/* Styling Reels */}
          <div className="tryon-card group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Styling Reels</h3>
                <p className="text-gray-500 text-xs">3 ways to wear it</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Every outfit becomes a short video showing 3 different ways to style it for any occasion.
            </p>

            {/* Styling Looks Preview */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-purple-400 font-mono text-xs">0:00</span>
                <div>
                  <p className="text-white text-sm font-medium">Casual Day</p>
                  <p className="text-gray-500 text-xs">Sneakers • Canvas tote</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-purple-400 font-mono text-xs">0:05</span>
                <div>
                  <p className="text-white text-sm font-medium">Work Ready</p>
                  <p className="text-gray-500 text-xs">Loafers • Structured bag</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-purple-400 font-mono text-xs">0:10</span>
                <div>
                  <p className="text-white text-sm font-medium">Night Out</p>
                  <p className="text-gray-500 text-xs">Heels • Clutch</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateReel}
              disabled={isGeneratingReel}
              className="reel-btn w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingReel ? (
                <>
                  <span className="video-loading-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Create Styling Reel
                </>
              )}
            </button>
          </div>

          {/* Runway Recaps */}
          <div className="tryon-card group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Runway Recaps</h3>
                <p className="text-gray-500 text-xs">Weekly fashion shows</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Get a personalized runway show every week featuring your best looks from your own closet.
            </p>

            {/* Runway Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900/50 aspect-video mb-4">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" 
                alt="Runway preview" 
                className="w-full h-full object-cover opacity-60" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="play-button scale-75 mb-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-white/80 text-sm font-medium">Your Weekly Show</p>
              </div>
              <div className="video-timestamp">1:00</div>
            </div>

            {/* Generation Progress */}
            {showRunwayProgress && (
              <div className="mb-4">
                <div className="generation-progress">
                  <div 
                    className="generation-progress-bar" 
                    style={{ width: `${Math.min(runwayProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-500 text-xs mt-2">Generating your runway show...</p>
              </div>
            )}

            <button 
              onClick={handleGenerateRunway}
              disabled={isGeneratingRunway}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingRunway ? (
                <>
                  <span className="video-loading-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                  Generate This Week's Show
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video History Section */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Videos</h3>
          <div className="reels-scroll">
            <div className="w-48 flex-shrink-0">
              <div className="video-thumb aspect-[9/16] bg-gray-800 rounded-xl mb-2">
                <img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200" className="w-full h-full object-cover rounded-xl" alt="Recent video" />
              </div>
              <p className="text-white text-sm font-medium truncate">Cashmere Sweater</p>
              <p className="text-gray-500 text-xs">Try-On • 2h ago</p>
            </div>
            <div className="w-48 flex-shrink-0">
              <div className="video-thumb aspect-[9/16] bg-gray-800 rounded-xl mb-2">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" className="w-full h-full object-cover rounded-xl" alt="Recent video" />
              </div>
              <p className="text-white text-sm font-medium truncate">Navy Blazer Styles</p>
              <p className="text-gray-500 text-xs">Reel • Yesterday</p>
            </div>
            <div className="w-48 flex-shrink-0">
              <div className="video-thumb aspect-[9/16] bg-gray-800 rounded-xl mb-2">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200" className="w-full h-full object-cover rounded-xl" alt="Recent video" />
              </div>
              <p className="text-white text-sm font-medium truncate">Week 1 Runway</p>
              <p className="text-gray-500 text-xs">Runway • 5d ago</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
