import './WaitlistModal.css'; 
import { useState } from 'react'; 
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function WaitlistModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('waitlist')
      .insert([{ email }])

    if (error) {
      if (error.code === '23505') {
        setError('You’re already on the waitlist.')
      } else {
        setError('Something went wrong.')
      }
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <h3>You’re in.</h3>
        ) : (
          <>
            <h3>Join the waitlist</h3>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Joining…' : 'Join'}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}