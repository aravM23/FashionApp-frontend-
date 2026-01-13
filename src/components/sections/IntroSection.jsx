import { useState, useEffect } from 'react'

export default function IntroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Trigger animations on mount
    setTimeout(() => setLoaded(true), 100)
  }, [])

  return (
    <section 
      id="intro" 
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      {/* Full-Bleed Wardrobe Image with fade-in */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.45)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.05)'
        }}
      />
      
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 transition-opacity duration-1000"
        style={{ opacity: loaded ? 1 : 0 }}
      />

      {/* Centered Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
        {/* Centered Logo with staggered entrance */}
        <img 
          src="/static/oro-logo.png" 
          alt="Oro" 
          className="h-48 md:h-64 lg:h-72 object-contain drop-shadow-2xl mb-8 transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
            transitionDelay: '300ms'
          }}
        />

        {/* Subtitle with delayed entrance */}
        <p 
          className="text-white/80 text-base md:text-lg font-light tracking-widest uppercase transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '600ms'
          }}
        >
          Your wardrobe, computed.
        </p>
      </div>

      {/* Scroll Indicator with delayed entrance */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
        style={{
          opacity: loaded ? 1 : 0,
          transform: `translateX(-50%) ${loaded ? 'translateY(0)' : 'translateY(20px)'}`,
          transitionDelay: '900ms'
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 animate-bounce">
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
