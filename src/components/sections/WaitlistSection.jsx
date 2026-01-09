import { useState } from 'react'
import WaitlistModal from './WaitlistModal'
import './WaitlistSection.css'

export default function WaitlistSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="waitlist">
      <div className="waitlist-inner">
        <h2>Get early access.</h2>
        <p>Join 2,000+ people shaping the future of personal style.</p>

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