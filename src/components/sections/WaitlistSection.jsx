import { useState, useEffect, useRef } from 'react'
import WaitlistModal from './WaitlistModal'
import './WaitlistSection.css'

export default function WaitlistSection() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const checkedRef = useRef(false)
  
  useEffect(() => {
    // Only check once on mount
    if (checkedRef.current) return;
    checkedRef.current = true;
    
    // Check if returning from OAuth redirect
    const isPending = localStorage.getItem('waitlist_pending');
    const hasAuthTokens = window.location.hash.includes('access_token');
    const alreadyProcessed = sessionStorage.getItem('waitlist_processed');
    
    if ((isPending || hasAuthTokens) && !alreadyProcessed) {
      setOpen(true);
    }
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.25 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])

  return (
    <section className="waitlist">
      <div ref={ref} className={`waitlist-inner${visible ? ' visible' : ''}`}>
        <h2>Get early access.</h2>
        <p>Join 3,500+ people shaping the future of personal style.</p>

        <button
          className="waitlist-btn"
          onClick={() => setOpen(true)}
        >
          Join the waitlist
        </button>
      </div>

      {open && <WaitlistModal onClose={() => setOpen(false)} />}
    </section>
  )
}
