import { useState, useRef, useEffect, useCallback } from 'react'
import './AppMockups.css'

const screens = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'closet', label: 'Closet' },
  { id: 'runway', label: 'Runway' }
]

const screenContent = {
  home: {
    title: "Your taste, decoded.",
    desc: "Upload moodboards. Oro learns what you like, using our own AI model, built to understand taste, not trends."
  },
  shop: {
    title: "A wardrobe that fits.",
    desc: "Set a budget. Oro finds capsule pieces across the web that match your style and your price."
  },
  closet: {
    title: "Your closet, remembered.",
    desc: "Upload your outfits. Oro learns what you own and how you actually dress."
  },
  runway: {
    title: "Outfits for every context.",
    desc: "Tell Oro the occasion. It styles what you already have, tuned to the moment."
  }
}

export default function AppMockups() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const ref = useRef(null)
  
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.15 })
    ref.current && obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  
  const go = useCallback((i) => {
    setActive(i < 0 ? screens.length - 1 : i >= screens.length ? 0 : i)
    setDragX(0)
  }, [])
  
  const onStart = (e) => {
    startX.current = e.touches?.[0]?.clientX ?? e.clientX
    setDragging(true)
  }
  
  const onMove = (e) => {
    if (!dragging) return
    const x = e.touches?.[0]?.clientX ?? e.clientX
    setDragX((x - startX.current) * 0.35)
  }
  
  const onEnd = () => {
    if (!dragging) return
    dragX < -35 ? go(active + 1) : dragX > 35 ? go(active - 1) : null
    setDragX(0)
    setDragging(false)
  }

  const currentContent = screenContent[screens[active].id]

  const goToScreen = (index) => {
    go(index)
  }

  return (
    <section ref={ref} className={`mockup-section${visible ? ' in' : ''}`}>
      <div className="mockup-bg" />
      
      <div className="mockup-container-centered">
        {/* Phone Center */}
        <div className="phone-center">
          <p className="mockup-label">The App</p>
          
          <div className="phone-wrap">
            <div 
              className={`phone${dragging ? ' drag' : ''}`}
              onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
              onMouseDown={onStart} onMouseMove={dragging ? onMove : null} onMouseUp={onEnd} onMouseLeave={onEnd}
            >
              <div className="phone-body">
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <div 
                    className="screen-inner"
                    style={{ 
                      transform: `translateX(calc(-${active * 100}% + ${dragX}px))`,
                      transition: dragging ? 'none' : 'transform 0.55s cubic-bezier(.4,.0,.2,1)'
                    }}
                  >
                    <HomeScreen goToScreen={goToScreen} />
                    <ShopScreen goToScreen={goToScreen} />
                    <ClosetScreen goToScreen={goToScreen} />
                    <RunwayScreen goToScreen={goToScreen} />
                  </div>
                </div>
                <div className="phone-bar" />
              </div>
            </div>
          </div>

          <nav className="mockup-nav">
            {screens.map((s, i) => (
              <button key={s.id} onClick={() => go(i)} className={`nav-pill${i === active ? ' on' : ''}`}>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Below Phone */}
        <div className="content-below">
          <h3 className="content-title">{currentContent.title}</h3>
          <p className="content-desc">{currentContent.desc}</p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   RUNWAY SCREEN — Your Outfits of the Month
   ═══════════════════════════════════════════════════════════ */
function RunwayScreen({ goToScreen }) {
  const [currentLook, setCurrentLook] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  
  const looks = [
    {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      title: ['January', 'Runway'],
      outfit: 'Wool Coat, Cashmere Knit, Wide Trousers',
      date: 'Look 1 of 4'
    },
    {
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      title: ['Your', 'Best Looks'],
      outfit: 'Silk Blouse, Tailored Pants, Leather Bag',
      date: 'Look 2 of 4'
    },
    {
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
      title: ['OOTD,', 'Monday'],
      outfit: 'Oversized Blazer, Midi Skirt',
      date: 'Look 3 of 4'
    },
    {
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      title: ['Street', 'Style'],
      outfit: 'Trench Coat, Denim, White Tee',
      date: 'Look 4 of 4'
    }
  ]
  
  const look = looks[currentLook]
  
  const nextLook = () => setCurrentLook((currentLook + 1) % looks.length)
  const prevLook = () => setCurrentLook(currentLook === 0 ? looks.length - 1 : currentLook - 1)
  
  return (
    <div className="screen runway">
      {/* Full Bleed Video/Image */}
      <div className="runway-hero">
        <img 
          src={look.image} 
          alt="" 
          className="runway-media"
          onClick={nextLook}
        />
        <div className="runway-gradient" />
        
        {/* Top Badge */}
        <div className="runway-badge">
          <span className="badge-dot" />
          Your Runway
        </div>
        
        {/* Editorial Title */}
        <div className="runway-content">
          <p className="runway-date">{look.date}</p>
          <h1 className="runway-title">
            <span>{look.title[0]}</span>
            <span className="indent">{look.title[1]}</span>
          </h1>
          <p className="runway-outfit">{look.outfit}</p>
        </div>
        
        {/* Video Controls */}
        <div className="runway-controls">
          <button 
            className="ctrl-btn"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>
          <button 
            className="ctrl-btn"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
              </svg>
            )}
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="runway-pagination">
          {looks.map((_, i) => (
            <button 
              key={i} 
              className={`runway-dot${i === currentLook ? ' on' : ''}`}
              onClick={() => setCurrentLook(i)}
            />
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="runway-progress">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentLook + 1) / looks.length) * 100}%` }}
          />
        </div>
        
        {/* Outfit Tag */}
        <button className="outfit-tag" onClick={nextLook}>
          <div className="tag-preview">
            <img src={looks[(currentLook + 1) % looks.length].image} alt="" />
          </div>
          <div className="tag-next">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </button>
      </div>
      
      <UnifiedNav active="runway" onNavigate={goToScreen} />
    </div>
  )
}

/* Unified Bottom Tab Bar */
function UnifiedNav({ active, onNavigate }) {
  const handleNav = (screenId) => {
    const screenIndex = screens.findIndex(s => s.id === screenId)
    if (screenIndex !== -1 && onNavigate) {
      onNavigate(screenIndex)
    }
  }

  return (
    <nav className="unified-nav">
      <button className="unav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button 
        className={`unav-item unav-text${active === 'home' ? ' on' : ''}`}
        onClick={() => handleNav('home')}
      >
        Home
        {active === 'home' && <span className="unav-dot" />}
      </button>
      <button 
        className={`unav-item unav-text${active === 'shop' ? ' on' : ''}`}
        onClick={() => handleNav('shop')}
      >
        Shop
        {active === 'shop' && <span className="unav-dot" />}
      </button>
      <button 
        className={`unav-item unav-text${active === 'closet' ? ' on' : ''}`}
        onClick={() => handleNav('closet')}
      >
        You
        {active === 'closet' && <span className="unav-dot" />}
      </button>
      <button 
        className={`unav-item unav-text${active === 'runway' ? ' on' : ''}`}
        onClick={() => handleNav('runway')}
      >
        Runway
        {active === 'runway' && <span className="unav-dot" />}
      </button>
      <button className="unav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </button>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════
   HOME SCREEN
   ═══════════════════════════════════════════════════════════ */
function HomeScreen({ goToScreen }) {
  return (
    <div className="screen home">
      <div className="home-hero">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80" alt="" />
        <div className="home-hero-fade" />
        <div className="home-hero-content">
          <p className="home-tag">New Arrival</p>
          <h1 className="home-title">The<br/>Winter<br/>Edit</h1>
          <button className="home-cta">Shop Now</button>
        </div>
      </div>
      
      <div className="home-scroll">
        <div className="scroll-header">
          <span className="scroll-title">For You</span>
          <button className="scroll-link">See All</button>
        </div>
        <div className="scroll-track">
          {[
            { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', name: 'Wool Coat', price: '$289' },
            { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', name: 'Cashmere Knit', price: '$165' },
            { img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', name: 'Wide Trousers', price: '$128' },
          ].map((item, i) => (
            <div key={i} className="scroll-card">
              <div className="scroll-img"><img src={item.img} alt="" /></div>
              <p className="scroll-name">{item.name}</p>
              <p className="scroll-price">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
      
      <UnifiedNav active="home" onNavigate={goToScreen} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SHOP SCREEN
   ═══════════════════════════════════════════════════════════ */
function ShopScreen({ goToScreen }) {
  const items = [
    { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80', name: 'Tailored Wool Coat', brand: 'COS', price: '$350', sale: '$245' },
    { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&q=80', name: 'Relaxed Cashmere', brand: 'ARKET', price: '$189', sale: null },
    { img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80', name: 'Pleated Trousers', brand: 'ZARA', price: '$79', sale: '$59' },
    { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80', name: 'Leather Tote', brand: 'MANGO', price: '$129', sale: null },
  ]
  
  return (
    <div className="screen shop">
      <div className="shop-top">
        <h1 className="shop-title">Shop</h1>
        <button className="shop-filter">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h12M5 10h8M7 14h4"/></svg>
        </button>
      </div>
      
      <div className="shop-cats">
        {['All', 'Coats', 'Knitwear', 'Trousers', 'Bags'].map((c, i) => (
          <button key={c} className={`cat${i === 0 ? ' on' : ''}`}>{c}</button>
        ))}
      </div>
      
      <div className="shop-grid">
        {items.map((item, i) => (
          <div key={i} className="product">
            <div className="product-img">
              <img src={item.img} alt="" />
              <button className="product-heart">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 13.7l-5.3-5.4a3.1 3.1 0 014.4-4.4L8 4.8l.9-.9a3.1 3.1 0 014.4 4.4L8 13.7z"/></svg>
              </button>
            </div>
            <p className="product-brand">{item.brand}</p>
            <p className="product-name">{item.name}</p>
            <p className="product-price">
              {item.sale ? <><s>{item.price}</s><span className="sale">{item.sale}</span></> : item.price}
            </p>
          </div>
        ))}
      </div>
      
      <UnifiedNav active="shop" onNavigate={goToScreen} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CLOSET SCREEN
   ═══════════════════════════════════════════════════════════ */
function ClosetScreen({ goToScreen }) {
  const pieces = [
    { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', name: 'Cashmere Sweater' },
    { img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', name: 'Wide Leg Pants' },
    { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', name: 'Wool Coat' },
    { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', name: 'Leather Bag' },
    { img: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80', name: 'Silk Blouse' },
  ]
  
  return (
    <div className="screen closet">
      <div className="closet-top">
        <h1 className="closet-title">My Closet</h1>
        <button className="closet-add">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg>
        </button>
      </div>
      
      <div className="closet-stats">
        <div className="stat"><span className="stat-num">12</span><span className="stat-label">Items</span></div>
        <div className="stat"><span className="stat-num">4</span><span className="stat-label">Outfits</span></div>
        <div className="stat"><span className="stat-num">3</span><span className="stat-label">Looks</span></div>
      </div>
      
      <div className="closet-grid">
        {pieces.map((p, i) => (
          <div key={i} className="piece">
            <div className="piece-img"><img src={p.img} alt="" /></div>
            <p className="piece-name">{p.name}</p>
          </div>
        ))}
        <button className="piece piece-add">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div className="closet-cta">
        <span className="cta-spark">✦</span>
        <div className="cta-info">
          <span className="cta-label">Style me for</span>
          <span className="cta-placeholder">A dinner date...</span>
        </div>
        <button className="cta-go">→</button>
      </div>
      
      <UnifiedNav active="closet" onNavigate={goToScreen} />
    </div>
  )
}

