import { useEffect, useRef, useState } from 'react'
import './AboutSection.css'

export default function AboutSection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section className="about">
      <div ref={ref} className={`about-block intro${visible ? ' visible' : ''}`}>
        <h2>Oro learns your style.</h2>
      </div>
    </section>
  )
}
