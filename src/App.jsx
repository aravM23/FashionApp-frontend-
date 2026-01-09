import { useState, useRef, useEffect, useCallback } from 'react'
import Navigation from './components/Navigation'
import AuthModal from './components/AuthModal'
import UserMenu from './components/UserMenu'
import IntroSection from './components/sections/IntroSection'
import ClosetSection from './components/sections/ClosetSection'
import VideoSection from './components/sections/VideoSection'
import StyleSection from './components/sections/StyleSection'
import ShopSection from './components/sections/ShopSection'
import ContactSection from './components/sections/ContactSection'
import Toast from './components/Toast'
import { useAuth } from './context/AuthContext'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [toast, setToast] = useState(null)
  const containerRef = useRef(null)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const { user } = useAuth()

  const panels = ['intro', 'home', 'video-experience', 'about', 'features', 'contact']

  const goToPanel = useCallback((index) => {
    if (index < 0 || index >= panels.length || isScrolling) return
    
    setIsScrolling(true)
    setCurrentPanelIndex(index)
    
    const panel = document.getElementById(panels[index])
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', inline: 'start' })
    }
    
    setTimeout(() => setIsScrolling(false), 550)
  }, [isScrolling, panels])

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      if (isScrolling) return
      
      if (e.deltaY > 50) {
        goToPanel(currentPanelIndex + 1)
      } else if (e.deltaY < -50) {
        goToPanel(currentPanelIndex - 1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentPanelIndex, isScrolling, goToPanel])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollIndex = Math.round(container.scrollLeft / window.innerWidth)
      if (scrollIndex !== currentPanelIndex && !isScrolling) {
        setCurrentPanelIndex(scrollIndex)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentPanelIndex, isScrolling])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleNavClick = (targetId) => {
    const index = panels.indexOf(targetId)
    if (index !== -1) {
      goToPanel(index)
    }
  }

  return (
    <div className="bg-black text-white">
      <div 
        ref={containerRef}
        className="horizontal-scroll flex snap-x snap-mandatory relative z-10"
      >
        <IntroSection />
        <ClosetSection 
          onLoginClick={() => setShowAuthModal(true)} 
          isLoggedIn={!!user}
        />
        <VideoSection 
          onLoginClick={() => setShowAuthModal(true)}
          isLoggedIn={!!user}
        />
        <StyleSection 
          onLoginClick={() => setShowAuthModal(true)}
          isLoggedIn={!!user}
        />
        <ShopSection 
          onLoginClick={() => setShowAuthModal(true)}
          isLoggedIn={!!user}
        />
        <ContactSection />
      </div>

      <Navigation onNavClick={handleNavClick} />

      {/* Login Button / User Menu */}
      <div className="fixed top-6 right-6 z-50">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <button
            id="loginBtn"
            onClick={() => setShowAuthModal(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border border-white/20 hover:border-white/40"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={(message) => {
          setShowAuthModal(false)
          showToast(message)
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

export default App
