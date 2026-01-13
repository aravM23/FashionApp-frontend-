export default function IntroSection() {
  return (
    <section 
      id="intro" 
      className="relative w-screen h-screen overflow-hidden bg-white"
    >
      {/* Full-Bleed Editorial Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2940&auto=format&fit=crop"
          alt="Fashion Editorial"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        {/* Subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40"></div>
      </div>

      {/* Minimal Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-8 md:p-16">
        {/* Top - Logo */}
        <div className="flex justify-center md:justify-start">
          <img 
            src="/static/oro-logo.png" 
            alt="Oro" 
            className="h-16 md:h-20 object-contain drop-shadow-lg"
          />
        </div>

        {/* Bottom - Headline */}
        <div className="text-center md:text-left max-w-2xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 tracking-tight leading-[0.95]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your wardrobe,<br />
            <span className="font-normal italic">computed.</span>
          </h1>
          <p className="text-white/90 text-sm md:text-base font-light tracking-wide">
            Luxury style intelligence for the modern wardrobe.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
