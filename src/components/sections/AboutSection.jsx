import './AboutSection.css'

export default function AboutSection() {
  return (
    <section className="about">
      <div className="about-block intro">
        <h2>Oro learns your style.</h2>
      </div>

      <div className="about-block">
        <h2>Your taste, decoded.</h2>
        <p>
          Upload moodboards. Oro learns what you like — using our own AI model,
          built to understand taste, not trends.
        </p>
      </div>

      <div className="about-block">
        <h2>A wardrobe that fits.</h2>
        <p>
          Set a budget. Oro finds capsule pieces across the web
          that match your style and your price.
        </p>
      </div>

      <div className="about-block">
        <h2>Your closet, remembered.</h2>
        <p>
          Upload your outfits. Oro learns what you own
          and how you actually dress.
        </p>
      </div>

      <div className="about-block">
        <h2>Outfits for every context.</h2>
        <p>
          Tell Oro the occasion. It styles what you already have —
          tuned to the moment.
        </p>
      </div>
    </section>
  )
}
