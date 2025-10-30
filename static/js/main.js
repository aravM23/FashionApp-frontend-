// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector('.horizontal-scroll');
  if (!container) return;

  const panels = Array.from(document.querySelectorAll('.panel'));
  let currentPanelIndex = 0;
  let isScrolling = false;
  const scrollDuration = 500; 

  // Parallax effect for images inside the container
  const parallaxElements = Array.from(document.querySelectorAll('.parallax-image'));
  
  function applyParallax() {
    const scrollLeft = container.scrollLeft;
    parallaxElements.forEach((el, i) => {
      const speed = 0.25 + (i % 3) * 0.08;
      el.style.transform = `translateX(${ -scrollLeft * speed }px)`;
    });
  }

  // --- 1. Panel Navigation Function ---
  function goToPanel(index) {
    if (index < 0 || index >= panels.length || isScrolling) return;

    isScrolling = true;
    currentPanelIndex = index;
    
    panels[index].scrollIntoView({
      behavior: 'smooth',
      inline: 'start' // Critical for horizontal scrolling
    });

    // Use a timeout to reset the scroll flag, matching the scroll behavior duration
    setTimeout(() => {
      isScrolling = false;
    }, scrollDuration + 50); // Small buffer to ensure animation completes
  }

  // --- 2. Vertical Wheel-to-Horizontal Conversion (Scroll-Jacking) ---
  window.addEventListener('wheel', (e) => {
    // Prevent default vertical scroll behavior
    e.preventDefault();
    
    if (isScrolling) return;
    
    // Check for a significant scroll threshold
    if (e.deltaY > 50) {
      // Scrolling Down/Right (next panel)
      goToPanel(currentPanelIndex + 1);
    } else if (e.deltaY < -50) {
      // Scrolling Up/Left (previous panel)
      goToPanel(currentPanelIndex - 1);
    }
  }, { passive: false });

  // --- 3. Parallax Update on Scroll ---
  // This listener ensures parallax works both when JS-driven and during manual scroll/touch
  let ticking = false;
  container.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        applyParallax();
        ticking = false;
      });
      ticking = true;
    }
    
    // Update currentPanelIndex based on scroll position for robustness
    const scrollIndex = Math.round(container.scrollLeft / window.innerWidth);
    if (scrollIndex !== currentPanelIndex && !isScrolling) {
      currentPanelIndex = scrollIndex;
    }
  });
  
  // --- 4. Navigation link functionality ---
  document.querySelectorAll('.nav-rotated').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetPanel = document.getElementById(targetId);
      const targetIndex = panels.indexOf(targetPanel);
      
      if (targetIndex !== -1) {
        goToPanel(targetIndex);
      }
    });
  });

  // Initial setup
  applyParallax();
});