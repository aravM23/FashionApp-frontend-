import './WaitlistModal.css'

export default function WaitlistModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Join the waitlist</h3>

        <form>
          <input
            type="email"
            placeholder="Your email"
            required
            autoFocus
          />
          <button type="submit">Join</button>
        </form>
      </div>
    </div>
  )
}