import IntroSection from './components/sections/IntroSection'
import AboutSection from './components/sections/AboutSection'
import AppMockups from './components/sections/AppMockups'
import WaitlistSection from './components/sections/WaitlistSection'

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <IntroSection />
      <AboutSection />
      <AppMockups />
      <WaitlistSection />
    </div>
  )
}

export default App
