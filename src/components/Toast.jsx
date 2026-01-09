import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
    : 'bg-gradient-to-r from-red-500 to-pink-500'

  return (
    <div className={`fixed top-24 right-6 z-[110] ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300`}>
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  )
}
