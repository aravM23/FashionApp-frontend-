import { useState, useRef } from 'react'

export default function ClosetSection({ onLoginClick, isLoggedIn }) {
  const [previewImage, setPreviewImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [capsuleDescription, setCapsuleDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [outfitResult, setOutfitResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    const file = fileInputRef.current?.files[0]
    if (!file) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-outfit', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.analysis)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateOutfit = async () => {
    if (!capsuleDescription.trim()) {
      // Shake animation would be nice here
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-capsule-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: capsuleDescription }),
      })
      const data = await response.json()

      if (data.success) {
        setOutfitResult(data.outfit)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section 
      id="home" 
      className="panel relative flex items-center justify-center overflow-hidden bg-black p-0"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950"></div>
      <img 
        src="/static/pic1.png" 
        className="parallax-image absolute w-4/5 max-w-4xl opacity-5" 
        alt="Fashion Image" 
      />

      {/* Login Required Overlay */}
      {!isLoggedIn && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-4xl font-light text-white mb-4 tracking-tight">Sign In Required</h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed">
                Create an account to build your capsule wardrobe and track your style journey
              </p>
            </div>
            <button 
              onClick={onLoginClick}
              className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm shadow-lg transition-all transform hover:scale-105"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-7xl overflow-y-auto max-h-screen px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] border border-gray-800 px-5 py-1.5 rounded-full bg-gray-900/50 backdrop-blur-sm">
              Your Collection
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-light mb-4 text-white tracking-tight">
            Capsule <span className="font-bold">Wardrobe</span>
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Build a sustainable wardrobe with versatile pieces you love
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Track Your Closet */}
          <div className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:border-gray-700/50 transition-all duration-500">
            <div className="mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-white tracking-tight">Track Your Closet</h3>
              <p className="text-gray-400 text-sm font-light">Log items to avoid buying duplicates</p>
            </div>

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all cursor-pointer bg-black/30"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-3">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Take Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Snap a pic of your item</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {previewImage && (
              <div className="mt-4">
                <img 
                  src={previewImage} 
                  className="w-full h-48 object-cover rounded-2xl mb-3 border-2 border-gray-800" 
                  alt="Preview" 
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-2xl transition-all text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : 'Analyze Item'}
                </button>
              </div>
            )}

            {/* Results */}
            {analysisResult && (
              <div className="mt-4 p-4 bg-black/50 rounded-2xl border-2 border-gray-800">
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-gray-700">
                    <p className="font-bold text-white text-lg mb-1">✨ {analysisResult.style_profile}</p>
                    <p className="text-xs text-gray-400">Your item analysis</p>
                  </div>
                  <div className="result-card bg-gradient-to-br from-purple-900/30 to-gray-800 rounded-lg p-3 border border-purple-700/50">
                    <p className="font-semibold text-purple-300 mb-2 text-sm">Color Palette</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.colors.map((color, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 shadow-sm border border-gray-600">{color}</span>
                      ))}
                    </div>
                  </div>
                  <div className="result-card bg-gradient-to-br from-blue-900/30 to-gray-800 rounded-lg p-3 border border-blue-700/50">
                    <p className="font-semibold text-blue-300 mb-2 text-sm">Perfect For</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.occasion.map((occ, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 shadow-sm border border-gray-600">{occ}</span>
                      ))}
                    </div>
                  </div>
                  <div className="result-card bg-gradient-to-br from-green-900/30 to-gray-800 rounded-lg p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="font-semibold text-green-300 text-sm">Style Suggestions</p>
                    </div>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      {analysisResult.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Create Outfits */}
          <div className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:border-gray-700/50 transition-all duration-500">
            <div className="mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-white tracking-tight">Create Outfits</h3>
              <p className="text-gray-400 text-sm font-light">Mix & match from your closet</p>
            </div>

            <textarea
              value={capsuleDescription}
              onChange={(e) => setCapsuleDescription(e.target.value)}
              placeholder="E.g., 'Casual brunch outfit' or 'Professional meeting'"
              className="w-full bg-black/50 border-2 border-gray-800 rounded-2xl p-4 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-0 resize-none h-32 text-sm transition-all hover:border-gray-700"
            />

            <button 
              onClick={handleGenerateOutfit}
              disabled={isGenerating}
              className="w-full mt-4 bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-2xl transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Generate Outfit'}
            </button>

            {/* Outfit Results */}
            {outfitResult && (
              <div className="mt-4 p-4 bg-black/50 rounded-2xl border-2 border-gray-800 max-h-64 overflow-y-auto">
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-gray-600">
                    <p className="font-bold text-white text-lg mb-1">✨ {outfitResult.name}</p>
                    <p className="text-xs text-gray-400">Perfect for your occasion</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {outfitResult.pieces.map((piece, index) => (
                      <div key={index} className="result-card bg-gradient-to-br from-gray-700 to-gray-700/50 rounded-lg p-4 border border-gray-600 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white mb-1">{piece.item}</p>
                            <p className="text-sm text-gray-300">{piece.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600 bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      <p className="text-sm font-semibold text-blue-300">Styling Tips</p>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-2">
                      {outfitResult.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Sustainable Fashion */}
          <div className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-emerald-800/50 shadow-2xl hover:border-emerald-700/50 transition-all duration-500">
            <div className="mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl">
                <span className="text-3xl">🌱</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-emerald-300 tracking-tight">Sustainable Fashion</h3>
              <p className="text-emerald-400 text-sm font-light">Build a timeless, eco-friendly wardrobe</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-black/30 rounded-2xl p-5 border border-emerald-800/50">
                <p className="font-bold text-emerald-300 mb-2">Quality Over Quantity</p>
                <p className="text-gray-400 text-sm font-light">Invest in versatile pieces that last years, not seasons</p>
              </div>

              <div className="mt-4 p-5 bg-black/30 rounded-2xl text-center border border-emerald-800/50">
                <p className="text-emerald-300 font-bold mb-2 text-sm uppercase tracking-wider">Your Impact</p>
                <p className="text-gray-400 text-xs font-light">Capsule wardrobes reduce fashion waste by up to 80%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
