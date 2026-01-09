import { useState } from 'react'

export default function ShopSection({ onLoginClick, isLoggedIn }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('moderate')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/budget-shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          budget: selectedBudget,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setResults(data.items || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section 
      id="features" 
      className="panel relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Login Required Overlay */}
      {!isLoggedIn && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-yellow-400/30 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-4xl font-light text-white mb-4 tracking-tight">Sign In Required</h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed">Create an account to start shopping with budget-smart recommendations</p>
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

      <div className="relative z-20 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-[0.3em]">Smart Shopping</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight mb-4 text-white tracking-tight">
            Budget <span className="font-semibold italic bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Finder</span>
          </h2>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Find the perfect pieces within your budget. Tell us what you're looking for.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Navy blazer for work, summer dress under $100..."
                className="w-full px-6 py-5 text-lg bg-white/5 border border-white/10 rounded-2xl focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all placeholder-gray-500 text-white"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Budget Selection */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { value: 'budget', label: 'Under $50', icon: '💰' },
                { value: 'moderate', label: '$50-$150', icon: '💎' },
                { value: 'premium', label: '$150-$300', icon: '✨' },
                { value: 'luxury', label: '$300+', icon: '👑' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedBudget(option.value)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedBudget === option.value
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>

            {/* Search Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-yellow-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Find Pieces</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h5 className="font-semibold text-white mb-2 line-clamp-2">{item.name}</h5>
                  <p className="text-2xl font-bold text-yellow-400 mb-2">{item.price}</p>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description || ''}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 hover:from-yellow-500 hover:to-yellow-400 text-white hover:text-black text-center py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Search for items to see personalized recommendations</p>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Budget Smart</h3>
            <p className="text-gray-400 text-sm">AI-powered price matching across thousands of retailers</p>
          </div>
          
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quality Verified</h3>
            <p className="text-gray-400 text-sm">Each recommendation checked for quality and value</p>
          </div>
          
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Style Matched</h3>
            <p className="text-gray-400 text-sm">Items curated to match your personal aesthetic</p>
          </div>
        </div>
      </div>
    </section>
  )
}
