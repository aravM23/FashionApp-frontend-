export default function IntroSection() {
  return (
    <section 
      id="intro" 
      className="panel relative w-screen h-screen flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/static/background.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-block mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.4em] border border-gray-700/50 px-6 py-2 rounded-full bg-black/30 backdrop-blur-sm">
            Welcome To
          </span>
        </div>
        
        {/* Logo */}
        <img 
          src="/static/oro-logo.png" 
          alt="Oro" 
          className="h-48 md:h-64 mb-6 object-contain"
        />
        
        {/* Subtitle */}
        <p className="text-base md:text-lg text-white max-w-2xl font-light tracking-wide leading-relaxed px-8">
          Your wardrobe, computed.
        </p>
      </div>
    </section>
  )
}
