export default function Navigation({ onNavClick }) {
  const navItems = [
    { id: 'intro', label: 'INTRO' },
    { id: 'home', label: 'CLOSET' },
    { id: 'video-experience', label: 'AI VIDEO' },
    { id: 'about', label: 'STYLE' },
    { id: 'features', label: 'SHOP' },
    { id: 'contact', label: 'CONTACT' },
  ]

  return (
    <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 gap-5 shadow-lg border-r border-gray-700/50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavClick(item.id)}
          className="nav-rotated"
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
