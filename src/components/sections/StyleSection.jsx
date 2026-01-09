import React, { useState, useRef } from 'react'

const OCCASIONS = [
  { value: 'romantic dinner', icon: '💕', text: 'Date Night' },
  { value: 'casual brunch', icon: '☕', text: 'Brunch' },
  { value: 'important meeting', icon: '💼', text: 'Business' },
  { value: 'night out clubbing', icon: '🪩', text: 'Night Out' },
  { value: 'gallery opening', icon: '🎨', text: 'Art Event' },
  { value: 'beach vacation', icon: '🌴', text: 'Vacation' },
  { value: 'workout gym', icon: '💪', text: 'Active' },
  { value: 'cozy weekend home', icon: '🏠', text: 'Lounging' },
]

const BUDGET_TIERS = [
  { value: 'budget', icon: '✦', name: 'Essential', range: 'Under $50', desc: 'Smart finds, great style' },
  { value: 'moderate', icon: '✦✦', name: 'Elevated', range: '$50 – $150', desc: 'Quality meets style' },
  { value: 'premium', icon: '✦✦✦', name: 'Premium', range: '$150 – $500', desc: 'Investment pieces' },
  { value: 'luxury', icon: '👑', name: 'Luxury', range: '$500+', desc: 'Designer & haute couture', isLuxury: true },
]

const VALUES = [
  { value: 'sustainability', icon: '🌿', text: 'Sustainable' },
  { value: 'quality', icon: '⭐', text: 'Quality-First' },
  { value: 'ethical', icon: '🤝', text: 'Ethical' },
  { value: 'local', icon: '📍', text: 'Local' },
  { value: 'timeless', icon: '♾️', text: 'Timeless' },
  { value: 'trendy', icon: '🔥', text: 'Trendy' },
  { value: 'minimalist', icon: '◯', text: 'Minimalist' },
  { value: 'bold', icon: '💥', text: 'Bold' },
  { value: 'vintage', icon: '🕰️', text: 'Vintage' },
  { value: 'affordable', icon: '💰', text: 'Affordable' },
]

export default function StyleSection({ onLoginClick, isLoggedIn }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    styleContext: '',
    priceRange: '',
    values: [],
    moodboard: null,
  })
  const [selectedOccasion, setSelectedOccasion] = useState(null)
  const [moodboardPreview, setMoodboardPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const totalSteps = 5

  const handleOccasionClick = (value) => {
    setSelectedOccasion(value)
    setFormData(prev => ({ ...prev, styleContext: value }))
  }

  const handleBudgetSelect = (value) => {
    setFormData(prev => ({ ...prev, priceRange: value }))
  }

  const handleValueToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.includes(value)
        ? prev.values.filter(v => v !== value)
        : [...prev.values, value]
    }))
  }

  const handleMoodboardChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, moodboard: file }))
      const reader = new FileReader()
      reader.onload = (event) => setMoodboardPreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.styleContext.trim()) {
          showNotice('Tell us about your occasion ✨', 'error')
          return false
        }
        return true
      case 2:
        if (!formData.priceRange) {
          showNotice('Select your investment level 💎', 'error')
          return false
        }
        return true
      default:
        return true
    }
  }

  const showNotice = (message, type = 'info') => {
    const notice = document.createElement('div')
    notice.className = `fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium z-50 transition-all duration-300 ${
      type === 'error' ? 'bg-red-500/90 text-white' : 'bg-yellow-500/90 text-black'
    }`
    notice.textContent = message
    document.body.appendChild(notice)
    setTimeout(() => {
      notice.style.opacity = '0'
      setTimeout(() => notice.remove(), 300)
    }, 3000)
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step) => {
    if (step < currentStep || (step === currentStep + 1 && validateStep(currentStep))) {
      setCurrentStep(step)
    }
  }

  const handleFindItems = async () => {
    setIsLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('context', formData.styleContext)
      formDataToSend.append('price_range', formData.priceRange)
      
      if (formData.moodboard) {
        formDataToSend.append('images', formData.moodboard)
      }

      const sustainabilityPrefs = {
        ecoMaterials: formData.values.includes('sustainability'),
        fairTrade: formData.values.includes('ethical'),
        timeless: formData.values.includes('timeless'),
        qualityFocus: formData.values.includes('quality'),
      }
      formDataToSend.append('sustainability_prefs', JSON.stringify(sustainabilityPrefs))

      const response = await fetch('/api/learn-style-and-shop', {
        method: 'POST',
        body: formDataToSend,
      })
      const data = await response.json()

      if (data.success) {
        setResults(data.shopping_items)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const budgetLabels = {
    'budget': 'Essential • Under $50',
    'moderate': 'Elevated • $50–$150',
    'premium': 'Premium • $150–$500',
    'luxury': 'Luxury • $500+'
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light mb-1 text-white">
              What's the <span className="italic font-medium text-yellow-300">occasion</span>?
            </h3>
            <p className="text-gray-500 text-sm mb-4">Tell us where you're headed</p>
            
            <div className="relative mb-4">
              <input
                type="text"
                value={formData.styleContext}
                onChange={(e) => setFormData(prev => ({ ...prev, styleContext: e.target.value }))}
                placeholder="A romantic dinner, weekend getaway..."
                className="w-full px-5 py-3 text-base bg-black/40 border border-white/10 rounded-xl focus:border-yellow-500/50 focus:ring-0 outline-none transition-all placeholder-gray-600 text-white text-center font-light tracking-wide"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {OCCASIONS.map((occasion) => (
                <button
                  key={occasion.value}
                  type="button"
                  onClick={() => handleOccasionClick(occasion.value)}
                  className={`occasion-card group ${selectedOccasion === occasion.value ? 'selected' : ''}`}
                >
                  <span className="occasion-icon">{occasion.icon}</span>
                  <span className="occasion-text">{occasion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">💎</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light mb-1 text-white">
              Your <span className="italic font-medium text-yellow-300">investment</span> level?
            </h3>
            <p className="text-gray-500 text-sm mb-4">Per piece, not the whole look</p>
            
            <div className="grid grid-cols-2 gap-3">
              {BUDGET_TIERS.map((tier) => (
                <div key={tier.value} className="budget-tier group">
                  <label
                    onClick={() => handleBudgetSelect(tier.value)}
                    className={`budget-tier-label ${tier.isLuxury ? 'luxury' : ''} ${formData.priceRange === tier.value ? 'selected' : ''}`}
                  >
                    <div className="budget-tier-icon">
                      <span className="text-2xl">{tier.icon}</span>
                    </div>
                    <div className="budget-tier-info">
                      <span className="budget-tier-name">{tier.name}</span>
                      <span className="budget-tier-range">{tier.range}</span>
                    </div>
                    <div className="budget-tier-desc">{tier.desc}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">💫</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light mb-1 text-white">
              What do you <span className="italic font-medium text-yellow-300">value</span>?
            </h3>
            <p className="text-gray-500 text-sm mb-4">Select all that resonate with you</p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {VALUES.map((item) => (
                <label
                  key={item.value}
                  className="value-pill"
                  onClick={() => handleValueToggle(item.value)}
                >
                  <span className={`pill-content ${formData.values.includes(item.value) ? 'selected' : ''}`}>
                    <span className="pill-icon">{item.icon}</span>
                    <span className="pill-text">{item.text}</span>
                  </span>
                </label>
              ))}
            </div>
            
            <p className="text-gray-600 text-xs mt-4">Tap to select • Choose as many as you like</p>
          </div>
        )

      case 4:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light mb-1 text-white">
              Show us your <span className="italic font-medium text-yellow-300">inspiration</span>
            </h3>
            <p className="text-gray-500 text-sm mb-4">Upload a Pinterest board, outfit screenshot, or style inspo</p>
            
            <div className="moodboard-upload-zone group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMoodboardChange}
              />
              
              {!moodboardPreview ? (
                <label
                  onClick={() => fileInputRef.current?.click()}
                  className="moodboard-upload-label compact flex flex-col items-center cursor-pointer"
                >
                  <div className="upload-icon-wrapper">
                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Drop your image here</p>
                  <p className="text-gray-500 text-sm">or click to browse</p>
                </label>
              ) : (
                <div className="moodboard-preview relative max-w-xs mx-auto">
                  <img src={moodboardPreview} alt="Preview" className="w-full rounded-xl shadow-2xl" />
                  <div className="preview-overlay absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                    <span className="px-4 py-2 bg-green-500/90 text-white text-xs font-semibold rounded-full">✓ Perfect</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white/90 text-black text-xs font-semibold rounded-full hover:bg-white transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-xs mt-3">Optional • Helps us understand your aesthetic</p>
          </div>
        )

      case 5:
        return (
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">🔮</span>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light mb-1 text-white">
              Your <span className="italic font-medium text-amber-300">style profile</span>
            </h3>
            <p className="text-gray-500 text-sm mb-4">Here's what we know about you</p>
            
            {/* Profile Summary */}
            <div className="profile-summary-card mb-6">
              <div className="profile-grid">
                <div className="profile-item text-left">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-white/40 mb-1">Occasion</span>
                  <span className="text-sm font-medium text-white">{formData.styleContext || '—'}</span>
                </div>
                <div className="profile-item text-left">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-white/40 mb-1">Budget</span>
                  <span className="text-sm font-medium text-white">{budgetLabels[formData.priceRange] || '—'}</span>
                </div>
                <div className="profile-item text-left">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-white/40 mb-1">Values</span>
                  <span className="text-sm font-medium text-white">
                    {formData.values.length > 0 
                      ? formData.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
                      : '—'}
                  </span>
                </div>
                <div className="profile-item text-left">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-white/40 mb-1">Inspiration</span>
                  <span className="text-sm font-medium text-white">{moodboardPreview ? '✓ Uploaded' : 'Skipped'}</span>
                </div>
              </div>
            </div>
            
            {/* Find Button */}
            <button
              onClick={handleFindItems}
              disabled={isLoading}
              className="discover-btn group"
            >
              <span className="discover-btn-bg"></span>
              <span className="discover-btn-content">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Curating...</span>
                  </>
                ) : (
                  <>
                    <span>Discover My Pieces</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Results */}
            {results && results.length > 0 && (
              <div className="mt-12">
                <h4 className="text-2xl font-bold mb-6 text-white">Your Personalized Picks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item, index) => (
                    <div
                      key={index}
                      className="result-card bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                        <img
                          src={item.image || 'https://via.placeholder.com/300x400'}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-white mb-2 line-clamp-2">{item.name}</h5>
                        <p className="text-2xl font-bold text-yellow-400 mb-2">{item.price}</p>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description || ''}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-center py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                          View Item
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section 
      id="about" 
      className="panel relative flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/30 via-black to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-800/20 via-transparent to-transparent"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Login Required Overlay */}
      {!isLoggedIn && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-yellow-400/30 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-4xl font-light text-white mb-4 tracking-tight">Sign In Required</h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed">Create an account to build your personalized style profile</p>
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

      <div className="relative z-20 w-full max-w-5xl min-h-screen flex flex-col px-4 py-6">
        {/* Header */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.4em]">Personal Stylist</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-extralight mb-1 text-white tracking-tight">
            Curate Your <span className="font-semibold italic bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent">Style</span>
          </h2>
          <p className="text-gray-500 text-xs font-light tracking-wide">Five questions. Infinite possibilities.</p>
        </div>

        {/* Step Indicators */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-center items-center gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => goToStep(step)}
                  className={`style-step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                >
                  <span className="step-inner">{step}</span>
                  <span className="step-ring"></span>
                </button>
                {step < 5 && <div className="step-line"></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest text-gray-600">
            {['Vibe', 'Budget', 'Values', 'Inspire', 'Discover'].map((label, i) => (
              <span
                key={label}
                className={`style-step-label ${currentStep === i + 1 ? 'active' : ''} ${currentStep > i + 1 ? 'completed' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900/80 to-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl">
          {/* Content Area */}
          <div className="flex-1 p-5 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {renderStepContent()}
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center px-6 md:px-10 py-5 border-t border-white/5 bg-black/20 backdrop-blur-xl">
            <button
              onClick={previousStep}
              className={`nav-btn-prev ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            {currentStep < totalSteps && (
              <button onClick={nextStep} className="nav-btn-next">
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}