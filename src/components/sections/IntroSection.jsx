export default function IntroSection() {
  return (
    <section 
      id="intro" 
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      {/* Full-Bleed Wardrobe Image with Balanced Exposure */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1558769132-cb1aea1c8348?q=80&w=2874&auto=format&fit=crop"
          alt="Luxury Wardrobe"
          className="w-full h-full object-cover"
          style={{ 
            objectPosition: 'center',
            filter: 'brightness(0.85) contrast(1.1)'
          }}
        />
        {/* Subtle dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
      </div>

      {/* Centered Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
        {/* Centered Logo */}
        <img 
          src="/static/oro-logo.png" 
          alt="Oro" 
          className="h-48 md:h-64 lg:h-72 object-contain drop-shadow-2xl mb-8"
        />

        {/* Subtitle */}
        <p className="text-white/80 text-base md:text-lg font-light tracking-widest uppercase">
          Your wardrobe, computed.
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
