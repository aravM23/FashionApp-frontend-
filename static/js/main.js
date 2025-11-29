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
  
  // --- UPDATED applyParallax FUNCTION ---
  function applyParallax() {
    const scrollLeft = container.scrollLeft;
    
    parallaxElements.forEach((el, i) => {
      // Find the element's parent panel
      const panel = el.closest('.panel');
      if (!panel) return;

      // Calculate the scroll position *relative* to the start of this panel
      // This is the key change.
      const panelOffsetLeft = panel.offsetLeft;
      const relativeScroll = scrollLeft - panelOffsetLeft;

      const speed = 0.25 + (i % 3) * 0.08;
      
      // Apply translation based on the relative scroll
      el.style.transform = `translateX(${ -relativeScroll * speed }px)`;
    });
  }
  // --- END OF UPDATE ---

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

  // --- 5. Outfit Upload Functionality ---
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('outfit-upload');
  const previewArea = document.getElementById('preview-area');
  const previewImage = document.getElementById('preview-image');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsArea = document.getElementById('results-area');
  const resultsText = document.getElementById('results-text');

  if (uploadArea && fileInput) {
    // Click to trigger file input
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          previewImage.src = event.target.result;
          previewArea.classList.remove('hidden');
          resultsArea.classList.add('hidden');
          
          // Smooth fade-in animation
          previewArea.style.opacity = '0';
          previewArea.style.transform = 'scale(0.95)';
          requestAnimationFrame(() => {
            previewArea.style.transition = 'all 0.3s ease-out';
            previewArea.style.opacity = '1';
            previewArea.style.transform = 'scale(1)';
          });
          
          uploadArea.style.borderColor = '#10b981';
          setTimeout(() => {
            uploadArea.style.borderColor = '';
          }, 500);
        };
        
        reader.readAsDataURL(file);
      }
    });

    // Analyze button click
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        
        analyzeBtn.disabled = true;
        analyzeBtn.style.transform = 'scale(0.98)';
        analyzeBtn.innerHTML = `
          <div class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing...</span>
          </div>
        `;
        
        try {
          // Create FormData to send file
          const formData = new FormData();
          formData.append('image', file);
          
          // Send to backend
          const response = await fetch('/api/upload-outfit', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Hide old results with fade
            if (!resultsArea.classList.contains('hidden')) {
              resultsArea.style.opacity = '0';
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            resultsArea.classList.remove('hidden');
            resultsArea.style.opacity = '0';
            resultsArea.style.transform = 'translateY(10px)';
            
            // UPDATED: Dark theme for results
            const analysis = data.analysis;
            resultsText.innerHTML = `
              <div class="space-y-4">
                <div class="text-center pb-3 border-b border-gray-700">
                  <p class="font-bold text-white text-lg mb-1">✨ ${analysis.style_profile}</p>
                  <p class="text-xs text-gray-400">Your item analysis</p>
                </div>
                <div class="result-card bg-gradient-to-br from-purple-900/30 to-gray-800 rounded-lg p-3 border border-purple-700/50">
                  <p class="font-semibold text-purple-300 mb-2 text-sm">Color Palette</p>
                  <div class="flex flex-wrap gap-2">
                    ${analysis.colors.map(color => `
                      <span class="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 shadow-sm border border-gray-600">${color}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="result-card bg-gradient-to-br from-blue-900/30 to-gray-800 rounded-lg p-3 border border-blue-700/50" style="animation-delay: 0.1s">
                  <p class="font-semibold text-blue-300 mb-2 text-sm">Perfect For</p>
                  <div class="flex flex-wrap gap-2">
                    ${analysis.occasion.map(occ => `
                      <span class="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 shadow-sm border border-gray-600">${occ}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="result-card bg-gradient-to-br from-green-900/30 to-gray-800 rounded-lg p-4 border border-green-700/50" style="animation-delay: 0.2s">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="font-semibold text-green-300 text-sm">Style Suggestions</p>
                  </div>
                  <ul class="text-gray-300 space-y-2 text-sm">
                    ${analysis.suggestions.map(s => `
                      <li class="flex items-start gap-2">
                        <span class="text-green-400 mt-0.5">•</span>
                        <span>${s}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
                <p class="text-center text-xs text-gray-400 italic pt-2">Building your style profile... Upload more for better recommendations!</p>
              </div>
            `;
            
            // Smooth fade in
            requestAnimationFrame(() => {
              resultsArea.style.transition = 'all 0.4s ease-out';
              resultsArea.style.opacity = '1';
              resultsArea.style.transform = 'translateY(0)';
            });
            
            // Success feedback
            analyzeBtn.style.background = '#10b981';
            setTimeout(() => {
              analyzeBtn.style.background = '';
            }, 300);
          } else {
            resultsText.innerHTML = `<p class="text-red-400 text-sm">Error: ${data.error}</p>`;
            resultsArea.classList.remove('hidden');
          }
          
        } catch (error) {
          console.error('Error:', error);
          resultsText.innerHTML = `<p class="text-red-400 text-sm">Failed to analyze. Please try again.</p>`;
          resultsArea.classList.remove('hidden');
          
          // Error feedback
          analyzeBtn.style.background = '#ef4444';
          setTimeout(() => {
            analyzeBtn.style.background = '';
          }, 300);
        }
        
        analyzeBtn.disabled = false;
        analyzeBtn.style.transform = '';
        analyzeBtn.innerHTML = 'Analyze Item';
      });
    }
  }
  
  // --- 6. Capsule Wardrobe Creator ---
  const capsuleDescription = document.getElementById('capsule-description');
  const generateOutfitBtn = document.getElementById('generate-outfit-btn');
  const capsuleResults = document.getElementById('capsule-results');
  const capsuleOutfitDetails = document.getElementById('capsule-outfit-details');

  if (generateOutfitBtn) {
    generateOutfitBtn.addEventListener('click', async () => {
      const description = capsuleDescription.value.trim();
      if (!description) {
        // Shake animation for empty input
        capsuleDescription.classList.add('animate-shake');
        capsuleDescription.style.borderColor = '#ef4444';
        setTimeout(() => {
          capsuleDescription.classList.remove('animate-shake');
          capsuleDescription.style.borderColor = '';
        }, 500);
        return;
      }

      // Smooth transition to loading state
      generateOutfitBtn.disabled = true;
      generateOutfitBtn.style.transform = 'scale(0.98)';
      
      // Create loading spinner
      const originalText = generateOutfitBtn.innerHTML;
      generateOutfitBtn.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Creating your outfit...</span>
        </div>
      `;

      try {
        const response = await fetch('/api/generate-capsule-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description })
        });

        const data = await response.json();

        if (data.success) {
          // Hide old results with fade out
          if (!capsuleResults.classList.contains('hidden')) {
            capsuleResults.style.opacity = '0';
            capsuleResults.style.transform = 'translateY(-10px)';
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          capsuleResults.classList.remove('hidden');
          capsuleResults.style.opacity = '0';
          capsuleResults.style.transform = 'translateY(10px)';
          
          // UPDATED: Dark theme for results
          capsuleOutfitDetails.innerHTML = `
            <div class="space-y-4">
              <div class="text-center pb-3 border-b border-gray-600">
                <p class="font-bold text-white text-lg mb-1">✨ ${data.outfit.name}</p>
                <p class="text-xs text-gray-400">Perfect for your occasion</p>
              </div>
              <div class="grid grid-cols-1 gap-3">
                ${data.outfit.pieces.map((piece, index) => `
                  <div class="result-card bg-gradient-to-br from-gray-700 to-gray-700/50 rounded-lg p-4 border border-gray-600 hover:shadow-md transition-all" style="animation-delay: ${index * 0.1}s">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                        ${index + 1}
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-white mb-1">${piece.item}</p>
                        <p class="text-sm text-gray-300">${piece.description}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-4 pt-4 border-t border-gray-600 bg-blue-900/30 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p class="text-sm font-semibold text-blue-300">Styling Tips</p>
                </div>
                <ul class="text-sm text-gray-300 space-y-2">
                  ${data.outfit.tips.map(tip => `
                    <li class="flex items-start gap-2">
                      <span class="text-blue-400 mt-0.5">•</span>
                      <span>${tip}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `;
          
          // Smooth fade in
          requestAnimationFrame(() => {
            capsuleResults.style.transition = 'all 0.4s ease-out';
            capsuleResults.style.opacity = '1';
            capsuleResults.style.transform = 'translateY(0)';
          });
          
          // Success haptic feedback (visual)
          generateOutfitBtn.style.background = '#10b981';
          setTimeout(() => {
            generateOutfitBtn.style.background = '';
          }, 300);
        }
      } catch (error) {
        console.error('Error:', error);
        
        // Error state with red flash
        generateOutfitBtn.style.background = '#ef4444';
        setTimeout(() => {
          generateOutfitBtn.style.background = '';
          alert('Failed to generate outfit. Please try again.');
        }, 300);
      }

      generateOutfitBtn.disabled = false;
      generateOutfitBtn.style.transform = '';
      generateOutfitBtn.innerHTML = 'Generate Outfit';
    });
  }

  // --- 7. Pinterest Moodboard Style Learning ---
  const moodboardUploadArea = document.getElementById('moodboard-upload-area');
  const moodboardInput = document.getElementById('moodboard-upload');
  const moodboardContext = document.getElementById('moodboard-context');
  const priceRange = document.getElementById('price-range');
  const moodboardPreviewGrid = document.getElementById('moodboard-preview-grid');
  const learnStyleBtn = document.getElementById('learn-style-btn');
  const styleLearningResults = document.getElementById('style-learning-results');
  const styleProfileDetails = document.getElementById('style-profile-details');
  const styleShoppingResults = document.getElementById('style-shopping-results');
  const shoppingLoader = document.getElementById('shopping-loader');
  const emptyShoppingState = document.getElementById('empty-shopping-state');

  let moodboardFiles = [];

  if (moodboardUploadArea) {
    moodboardUploadArea.addEventListener('click', () => {
      moodboardInput.click();
    });

    moodboardInput.addEventListener('change', (e) => {
      moodboardFiles = Array.from(e.target.files);
      
      if (moodboardFiles.length > 0) {
        moodboardPreviewGrid.innerHTML = '';
        moodboardPreviewGrid.classList.remove('hidden');
        learnStyleBtn.classList.remove('hidden');

        moodboardFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'w-full h-24 object-cover rounded-lg';
            moodboardPreviewGrid.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  if (learnStyleBtn) {
    learnStyleBtn.addEventListener('click', async () => {
      const context = moodboardContext.value.trim();
      const priceRangeValue = priceRange.value;
      
      // Collect sustainability preferences
      const ecoMaterials = document.getElementById('eco-materials')?.checked || false;
      const fairTrade = document.getElementById('fair-trade')?.checked || false;
      const timeless = document.getElementById('timeless')?.checked || false;
      const qualityFocus = document.getElementById('quality-focus')?.checked || false;

      const sustainabilityPrefs = {
        ecoMaterials,
        fairTrade,
        timeless,
        qualityFocus
      };
      
      if (!context) {
        alert('Please describe what this moodboard is for');
        return;
      }

      if (moodboardFiles.length === 0) {
        alert('Please upload at least one moodboard image');
        return;
      }

      learnStyleBtn.disabled = true;
      learnStyleBtn.innerHTML = '<span class="animate-pulse">Analyzing your style...</span>';
      
      // Show loader, hide empty state
      if (emptyShoppingState) emptyShoppingState.classList.add('hidden');
      if (shoppingLoader) shoppingLoader.classList.remove('hidden');
      if (styleShoppingResults) styleShoppingResults.classList.add('hidden');

      try {
        const formData = new FormData();
        formData.append('context', context);
        formData.append('price_range', priceRangeValue);
        formData.append('sustainability_prefs', JSON.stringify(sustainabilityPrefs));
        moodboardFiles.forEach((file, index) => {
          formData.append('images', file);
        });

        const response = await fetch('/api/learn-style-and-shop', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          // Show style profile
          styleLearningResults.classList.remove('hidden');
          
          // Build sustainability filter display
          const sustainabilityFilters = [];
          if (ecoMaterials) sustainabilityFilters.push('Eco-friendly materials');
          if (fairTrade) sustainabilityFilters.push('Fair trade & ethical');
          if (timeless) sustainabilityFilters.push('Timeless designs');
          if (qualityFocus) sustainabilityFilters.push('Quality focus');
          
          // UPDATED: Dark theme for results
          const sustainabilityDisplay = sustainabilityFilters.length > 0 ? `
            <div class="pt-3 border-t border-gray-600">
              <p class="font-medium text-green-400 text-xs mb-2">🌱 Active Filters:</p>
              <div class="flex flex-wrap gap-2">
                ${sustainabilityFilters.map(filter => `
                  <span class="bg-green-700/30 text-green-300 px-3 py-1 rounded-full text-xs font-medium">${filter}</span>
                `).join('')}
              </div>
            </div>
          ` : '';
          
          styleProfileDetails.innerHTML = `
            <div class="space-y-3">
              <div>
                <p class="font-semibold text-white text-sm mb-1">Context: ${data.profile.context}</p>
              </div>
              <div>
                <p class="font-medium text-gray-400 text-xs mb-2">Aesthetics:</p>
                <div class="flex flex-wrap gap-2">
                  ${data.profile.aesthetics.map(a => `
                    <span class="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-xs font-medium">${a}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="font-medium text-gray-400 text-xs mb-2">Colors:</p>
                <div class="flex gap-2">
                  ${data.profile.colors.map(c => `
                    <div class="w-8 h-8 rounded-full border-2 border-gray-600 shadow-sm" style="background-color: ${c}"></div>
                  `).join('')}
                </div>
              </div>
              ${sustainabilityDisplay}
            </div>
          `;
          
          // Hide loader, show shopping results
          if (shoppingLoader) shoppingLoader.classList.add('hidden');
          if (styleShoppingResults) {
            styleShoppingResults.classList.remove('hidden');
            
            // UPDATED: Dark theme for shopping items
            styleShoppingResults.innerHTML = data.shopping_items.map(item => {
              // Determine if item is sustainable based on brand or description
              const isSustainable = item.brand && (
                item.brand.toLowerCase().includes('organic') ||
                item.brand.toLowerCase().includes('patagonia') ||
                item.brand.toLowerCase().includes('everlane') ||
                item.brand.toLowerCase().includes('reformation') ||
                item.brand.toLowerCase().includes('tentree') ||
                item.description?.toLowerCase().includes('organic') ||
                item.description?.toLowerCase().includes('recycled') ||
                item.description?.toLowerCase().includes('sustainable')
              );
              
              return `
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:shadow-lg transition-all">
                <div class="flex gap-4">
                  <div class="w-20 h-20 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
                    <div class="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
                      ${item.brand}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <h5 class="font-semibold text-white text-sm truncate">${item.name}</h5>
                      <span class="text-white font-bold text-sm ml-2">${item.price}</span>
                    </div>
                    <p class="text-xs text-gray-300 mb-1">
                      ${item.brand}
                      ${isSustainable ? '<span class="ml-1 px-2 py-0.5 bg-green-700/30 text-green-300 rounded-full text-xs font-medium">🌱 Eco</span>' : ''}
                    </p>
                    <p class="text-xs text-gray-400 line-clamp-2 mb-2">${item.description}</p>
                    <div class="flex gap-2">
                      <a href="${item.url}" target="_blank" class="text-xs bg-white text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors font-medium">
                        View Item
                      </a>
                      <span class="text-xs ${item.available ? 'text-green-400' : 'text-gray-500'} flex items-center">
                        ${item.available ? '✓ Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              `;
            }).join('');
            
            // Add summary
            const sustainableCount = data.shopping_items.filter(item => {
              const isSustainable = item.brand && (
                item.brand.toLowerCase().includes('organic') ||
                item.brand.toLowerCase().includes('patagonia') ||
                item.brand.toLowerCase().includes('everlane') ||
                item.brand.toLowerCase().includes('reformation') ||
                item.brand.toLowerCase().includes('tentree') ||
                item.description?.toLowerCase().includes('organic') ||
                item.description?.toLowerCase().includes('recycled') ||
                item.description?.toLowerCase().includes('sustainable')
              );
              return isSustainable;
            }).length;
            
            // UPDATED: Dark theme for summary
            styleShoppingResults.innerHTML += `
              <div class="mt-4 pt-4 border-t border-gray-700 text-center">
                <p class="text-sm text-gray-300">
                  ${data.shopping_items.length} items • ${priceRangeValue} range
                  ${sustainableCount > 0 ? ` • ${sustainableCount} sustainable 🌱` : ''}
                </p>
              </div>
            `;
          }
        }
      } catch (error) {
        console.error('Error:', error);
        if (shoppingLoader) shoppingLoader.classList.add('hidden');
        if (emptyShoppingState) {
          emptyShoppingState.classList.remove('hidden');
          emptyShoppingState.innerHTML = '<p class="text-red-400 text-sm">Failed to analyze. Please try again.</p>';
        }
      }

      learnStyleBtn.disabled = false;
      learnStyleBtn.innerHTML = 'Analyze & Shop My Style';
    });
  }

  // --- 8. Budget Shopping Feature ---
  const budgetInput = document.getElementById('budget-input');
  const shoppingDescription = document.getElementById('shopping-description');
  const findItemsBtn = document.getElementById('find-items-btn');
  const shoppingResults = document.getElementById('shopping-results');
  const shoppingItems = document.getElementById('shopping-items');
  const shoppingEmpty = document.getElementById('shopping-empty');
  const itemsCount = document.getElementById('items-count');

  if (findItemsBtn) {
    findItemsBtn.addEventListener('click', async () => {
      const budget = parseFloat(budgetInput.value);
      const description = shoppingDescription.value.trim();

      if (!budget || budget <= 0) {
        alert('Please enter a valid budget');
        return;
      }

      if (!description) {
        alert('Please describe what you\'re looking for');
        return;
      }

      findItemsBtn.disabled = true;
      findItemsBtn.textContent = 'Finding items...';
      
      if (shoppingEmpty) shoppingEmpty.classList.add('hidden');

      try {
        const response = await fetch('/api/budget-shopping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget, description })
        });

        const data = await response.json();

        if (data.success && data.items.length > 0) {
          shoppingResults.classList.remove('hidden');
          if (itemsCount) itemsCount.textContent = data.items.length;
          
          // UPDATED: Dark theme for H&M-style product cards
          shoppingItems.innerHTML = data.items.map(item => {
            const isSustainable = item.store && (
              item.store.toLowerCase().includes('everlane') ||
              item.store.toLowerCase().includes('patagonia') ||
              item.store.toLowerCase().includes('reformation') ||
              item.name.toLowerCase().includes('organic') ||
              item.description.toLowerCase().includes('sustainable')
            );
            
            return `
            <div class="group cursor-pointer">
              <div class="relative aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden mb-3">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center p-4">
                    <div class="text-4xl mb-2">👕</div>
                    <p class="text-xs text-gray-400 font-medium">${item.store}</p>
                  </div>
                </div>
                ${isSustainable ? '<div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">🌱 Eco</div>' : ''}
                ${item.inBudget ? '' : '<div class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">Near Budget</div>'}
                
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
              </div>
              
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-white group-hover:text-gray-300 transition-colors line-clamp-2">${item.name}</h3>
                <p class="text-xs text-gray-400 line-clamp-1">${item.description}</p>
                <div class="flex items-center justify-between pt-1">
                  <span class="text-sm font-bold text-white">$${item.price}</span>
                  <span class="text-xs text-gray-400">${item.store}</span>
                </div>
                ${item.inBudget ? 
                  '<span class="inline-block text-xs text-green-400 font-medium">✓ Within budget</span>' : 
                  '<span class="inline-block text-xs text-yellow-400 font-medium">Slightly over</span>'}
              </div>
            </div>
            `;
          }).join('');

          // UPDATED: Dark theme for budget summary
          const totalSpent = data.items.reduce((sum, item) => sum + item.price, 0);
          const remaining = budget - totalSpent;
          
          shoppingItems.innerHTML += `
            <div class="col-span-full mt-4 pt-6 border-t border-gray-700">
              <div class="bg-gray-700 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-300 mb-1">
                  <span class="font-semibold">Total:</span> $${totalSpent.toFixed(2)} of $${budget.toFixed(2)} budget
                </p>
                <p class="text-xs ${remaining >= 0 ? 'text-green-400' : 'text-red-400'} font-medium">
                  ${remaining >= 0 ? `$${remaining.toFixed(2)} remaining in budget` : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </p>
              </div>
            </div>
          `;
        } else {
          if (shoppingEmpty) {
            shoppingEmpty.classList.remove('hidden');
            shoppingEmpty.innerHTML = '<p class="text-red-400 text-sm">No items found. Try adjusting your budget or description.</p>';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        if (shoppingEmpty) {
          shoppingEmpty.classList.remove('hidden');
          shoppingEmpty.innerHTML = '<p class="text-red-400 text-sm">Failed to find items. Please try again.</p>';
        }
      }

      findItemsBtn.disabled = false;
      findItemsBtn.textContent = 'Find Items';
    });
  }
});

// ========== STEP-BY-STEP WIZARD LOGIC ==========

let currentStep = 1;
const totalSteps = 5;
let formData = {
  styleContext: '',
  priceRange: '',
  values: [],
  moodboard: null
};

// Initialize luxury wizard
function initLuxuryWizard() {
  // Occasion card click handlers
  document.querySelectorAll('.occasion-card').forEach(card => {
    card.addEventListener('click', function() {
      // Remove selected from all
      document.querySelectorAll('.occasion-card').forEach(c => c.classList.remove('selected'));
      // Add selected to clicked
      this.classList.add('selected');
      // Update input
      const value = this.dataset.value;
      const input = document.getElementById('styleVibeInput');
      if (input) input.value = value;
    });
  });
  
  // Budget tier click handlers
  document.querySelectorAll('.budget-tier').forEach(tier => {
    tier.addEventListener('click', function() {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
  
  // Value pill click handlers
  document.querySelectorAll('.value-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      const checkbox = this.querySelector('input[type="checkbox"]');
      // The label click already toggles, just add visual feedback
    });
  });
  
  // Moodboard upload handler
  const moodboardInput = document.getElementById('moodboardInput');
  if (moodboardInput) {
    moodboardInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('moodboardPreview');
          const uploadLabel = document.querySelector('.moodboard-upload-label');
          const previewImg = preview.querySelector('.preview-image');
          
          previewImg.src = e.target.result;
          preview.classList.remove('hidden');
          if (uploadLabel) uploadLabel.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Call init on DOM ready
document.addEventListener('DOMContentLoaded', initLuxuryWizard);

function updateStepIndicators() {
  // Update step dots
  document.querySelectorAll('.style-step-dot').forEach((dot, index) => {
    const stepNum = index + 1;
    dot.classList.remove('active', 'completed');
    
    if (stepNum < currentStep) {
      dot.classList.add('completed');
    } else if (stepNum === currentStep) {
      dot.classList.add('active');
    }
  });
  
  // Update step labels
  document.querySelectorAll('.style-step-label').forEach((label, index) => {
    const stepNum = index + 1;
    label.classList.remove('active', 'completed');
    
    if (stepNum < currentStep) {
      label.classList.add('completed');
    } else if (stepNum === currentStep) {
      label.classList.add('active');
    }
  });
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.step-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Show current step
  const stepElement = document.getElementById(`step${step}`);
  if (stepElement) {
    stepElement.classList.add('active');
  }
  
  // Update navigation buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) {
    if (step === 1) {
      prevBtn.classList.add('opacity-0', 'pointer-events-none');
    } else {
      prevBtn.classList.remove('opacity-0', 'pointer-events-none');
    }
  }
  
  if (nextBtn) {
    if (step === totalSteps) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'flex';
    }
  }
  
  updateStepIndicators();
}

// Allow direct navigation to steps
function goToStep(step) {
  if (step < currentStep || step === currentStep + 1) {
    // Can go back or go to next step
    if (step > currentStep && !validateStep(currentStep)) {
      return;
    }
    if (step > currentStep) {
      saveStepData(currentStep);
    }
    currentStep = step;
    showStep(currentStep);
    
    if (currentStep === totalSteps) {
      updateSummary();
    }
  }
}

function nextStep() {
  // Validate current step
  if (!validateStep(currentStep)) {
    return;
  }
  
  // Save current step data
  saveStepData(currentStep);
  
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);

    // Update summary on final step
    if (currentStep === totalSteps) {
      updateSummary();
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// Luxury notification instead of alert
function showNotice(message, type = 'info') {
  const notice = document.createElement('div');
  notice.className = `fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium z-50 transition-all duration-300 ${
    type === 'error' ? 'bg-red-500/90 text-white' : 'bg-purple-500/90 text-white'
  }`;
  notice.textContent = message;
  document.body.appendChild(notice);
  
  setTimeout(() => {
    notice.style.opacity = '0';
    setTimeout(() => notice.remove(), 300);
  }, 3000);
}

function validateStep(step) {
  switch(step) {
    case 1: // Style Context
      const styleVibeInput = document.getElementById('styleVibeInput');
      if (!styleVibeInput || !styleVibeInput.value.trim()) {
        showNotice('Tell us about your occasion ✨', 'error');
        styleVibeInput?.focus();
        return false;
      }
      return true;
      
    case 2: // Price Range
      const priceChecked = document.querySelector('input[name="priceRange"]:checked');
      if (!priceChecked) {
        showNotice('Select your investment level 💎', 'error');
        return false;
      }
      return true;
      
    case 3: // Values - Optional, can skip
      return true;
      
    case 4: // Moodboard - Optional, can skip
      return true;
      
    default:
      return true;
  }
}

function saveStepData(step) {
  switch(step) {
    case 1: // Style Context
      const styleVibeInput = document.getElementById('styleVibeInput');
      formData.styleContext = styleVibeInput ? styleVibeInput.value.trim() : '';
      break;
      
    case 2: // Price Range
      const priceRadio = document.querySelector('input[name="priceRange"]:checked');
      formData.priceRange = priceRadio ? priceRadio.value : '';
      break;
      
    case 3: // Values
      formData.values = Array.from(
        document.querySelectorAll('input[name="values"]:checked')
      ).map(cb => cb.value);
      break;
      
    case 4: // Moodboard
      const moodboardInput = document.getElementById('moodboardInput');
      if (moodboardInput && moodboardInput.files && moodboardInput.files.length > 0) {
        formData.moodboard = moodboardInput.files[0];
      }
      break;
  }
}

function updateSummary() {
  // Style/Occasion
  const styleEl = document.getElementById('summaryStyle');
  if (styleEl) {
    styleEl.textContent = formData.styleContext || 'Not specified';
  }
  
  // Budget with elegant labels
  const budgetLabels = {
    'budget': 'Essential • Under $50',
    'moderate': 'Elevated • $50–$150',
    'premium': 'Premium • $150–$500',
    'luxury': 'Luxury • $500+'
  };
  const budgetEl = document.getElementById('summaryBudget');
  if (budgetEl) {
    budgetEl.textContent = budgetLabels[formData.priceRange] || 'Not selected';
  }
  
  // Values
  const valuesEl = document.getElementById('summaryValues');
  if (valuesEl) {
    valuesEl.textContent = formData.values.length > 0 
      ? formData.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
      : 'None selected';
  }
  
  // Moodboard
  const moodboardEl = document.getElementById('summaryMoodboard');
  if (moodboardEl) {
    moodboardEl.textContent = formData.moodboard ? '✓ Uploaded' : 'Skipped';
  }
}

// Moodboard preview
document.addEventListener('DOMContentLoaded', () => {
  // Initialize suggestion chips
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  const styleVibeInput = document.getElementById('styleVibeInput');
  
  if (suggestionChips && styleVibeInput) {
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        styleVibeInput.value = value;
        styleVibeInput.focus();
        
        // UPDATED: Dark theme visual feedback
        suggestionChips.forEach(c => {
          c.style.background = '#374151'; // gray-700
          c.style.borderColor = '#4b5563'; // gray-600
          c.style.color = '#d1d5db'; // gray-300
        });
        this.style.background = 'linear-gradient(135deg, #4c1d95, #3b0764)'; // dark purple
        this.style.borderColor = '#8b5cf6';
        this.style.color = '#c4b5fd'; // violet-300
      });
    });
  }

  const moodboardInput = document.getElementById('moodboardInput');
  if (moodboardInput) {
    moodboardInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById('moodboardPreview');
          const img = preview.querySelector('img');
          img.src = event.target.result;
          preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Initialize first step
  showStep(1);
});

async function findItems() {
  const btn = event.target;
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  btn.disabled = true;
  
  try {
    // Create FormData
    const formDataToSend = new FormData();
    // formData.styleContext is a string, not array. Adjusting.
    formDataToSend.append('context', formData.styleContext); 
    formDataToSend.append('price_range', formData.priceRange);
    
    if (formData.moodboard) {
      formDataToSend.append('images', formData.moodboard); // Use 'images' key
    }
    
    // Add sustainability prefs from 'values'
    const sustainabilityPrefs = {
        ecoMaterials: formData.values.includes('sustainability'),
        fairTrade: formData.values.includes('fairtrade'),
        timeless: formData.values.includes('timeless'),
        qualityFocus: formData.values.includes('quality')
    };
    formDataToSend.append('sustainability_prefs', JSON.stringify(sustainabilityPrefs));

    
    // Send to backend
    const response = await fetch('/api/learn-style-and-shop', {
      method: 'POST',
      body: formDataToSend // Use the corrected FormData
    });
    
    const data = await response.json();
    
    // Display results
    // UPDATED: Dark theme results
    const resultsDiv = document.getElementById('itemResults');
    resultsDiv.innerHTML = '<h4 class="text-2xl font-bold mb-6 text-white">Your Personalized Picks</h4>';
    
    if (data.shopping_items && data.shopping_items.length > 0) {
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      
      data.shopping_items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'result-card bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Determine sustainability
        const isSustainable = item.brand && (
            item.brand.toLowerCase().includes('organic') ||
            item.brand.toLowerCase().includes('patagonia') ||
            item.brand.toLowerCase().includes('everlane') ||
            item.description?.toLowerCase().includes('organic') ||
            item.description?.toLowerCase().includes('recycled')
        );
        
        card.innerHTML = `
          <div class="aspect-[3/4] overflow-hidden bg-gray-800">
            <img src="${item.image || 'https://via.placeholder.com/300x400'}" 
                 alt="${item.name}" 
                 class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="p-4">
            <h5 class="font-semibold text-white mb-2 line-clamp-2">${item.name}</h5>
            <p class="text-2xl font-bold text-purple-400 mb-2">${item.price}</p>
            <p class="text-sm text-gray-400 mb-3 line-clamp-2">${item.description || ''}</p>
            ${isSustainable ? `<span class="inline-block bg-green-700/30 text-green-300 text-xs px-2 py-1 rounded-full mb-3">🌱 Eco-Friendly</span>` : ''}
            <a href="${item.url}" target="_blank" class="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              View Item
            </a>
          </div>
        `;
        
        grid.appendChild(card);
      });
      
      resultsDiv.appendChild(grid);
    } else {
      resultsDiv.innerHTML += '<p class="text-gray-400 text-center py-8">No items found. Try adjusting your preferences.</p>';
    }
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('itemResults').innerHTML = '<p class="text-red-400 text-center py-8">Failed to find items. Please try again.</p>';
  } finally {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    btn.disabled = false;
  }
}


// ========== AI VIDEO FEATURES ==========

/**
 * Video Modal Controller
 */
const VideoModal = {
  modal: null,
  videoElement: null,
  
  init() {
    this.createModal();
    this.bindEvents();
  },
  
  createModal() {
    const modalHTML = `
      <div id="videoModal" class="video-modal">
        <div class="video-modal-content">
          <button class="video-modal-close" onclick="VideoModal.close()">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <video id="modalVideo" class="video-player" controls playsinline>
            <source src="" type="video/mp4">
          </video>
          <div id="videoInfo" class="p-6 bg-gray-900/80 backdrop-blur">
            <h3 id="videoTitle" class="text-xl font-bold text-white mb-2"></h3>
            <p id="videoDescription" class="text-gray-400"></p>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('videoModal');
    this.videoElement = document.getElementById('modalVideo');
  },
  
  bindEvents() {
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },
  
  open(videoData) {
    if (!this.modal) return;
    
    this.videoElement.src = videoData.video_url || '';
    document.getElementById('videoTitle').textContent = videoData.title || 'Video';
    document.getElementById('videoDescription').textContent = videoData.description || '';
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    this.videoElement.play().catch(() => {});
  },
  
  close() {
    if (!this.modal) return;
    
    this.videoElement.pause();
    this.videoElement.src = '';
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};


/**
 * AI Video Generator - handles all video generation API calls
 */
const AIVideoGenerator = {
  
  // Generate Try-On Video
  async generateTryOn(productId, productName, bodyType = 'average') {
    const btn = document.querySelector(`[data-product-id="${productId}"] .tryon-btn`);
    const originalText = btn?.innerHTML;
    
    try {
      if (btn) {
        btn.innerHTML = '<span class="video-loading-spinner inline-block w-4 h-4 mr-2"></span>Generating...';
        btn.disabled = true;
      }
      
      const response = await fetch('/api/video/generate-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          product_name: productName,
          body_type: bodyType,
          closet_items: await this.getClosetItems()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showVideoPreview(data.video, 'try-on');
        this.showNotification('Your try-on video is ready!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
      
    } catch (error) {
      console.error('Try-on error:', error);
      this.showNotification('Failed to generate video. Please try again.', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  },
  
  // Generate Styling Reel
  async generateStylingReel(outfitId, outfitItems = []) {
    const btn = document.querySelector(`[data-outfit-id="${outfitId}"] .reel-btn`);
    const originalText = btn?.innerHTML;
    
    try {
      if (btn) {
        btn.innerHTML = '<span class="video-loading-spinner inline-block w-4 h-4 mr-2"></span>Creating...';
        btn.disabled = true;
      }
      
      const response = await fetch('/api/video/generate-styling-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfit_id: outfitId,
          outfit_items: outfitItems,
          style_preferences: ['casual', 'smart-casual', 'evening']
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showStylingReelPreview(data.video);
        this.showNotification('Your styling reel is ready!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate reel');
      }
      
    } catch (error) {
      console.error('Styling reel error:', error);
      this.showNotification('Failed to generate reel. Please try again.', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  },
  
  // Generate Weekly Runway Show
  async generateRunwayShow(theme = 'Weekly Highlights') {
    const btn = document.getElementById('generateRunwayBtn');
    const progressContainer = document.getElementById('runwayProgress');
    
    try {
      if (btn) {
        btn.innerHTML = '<span class="video-loading-spinner inline-block w-5 h-5 mr-2"></span>Generating...';
        btn.disabled = true;
      }
      
      if (progressContainer) {
        progressContainer.classList.remove('hidden');
        this.animateProgress(progressContainer);
      }
      
      const response = await fetch('/api/video/generate-runway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme,
          closet_items: await this.getClosetItems(),
          music_mood: 'elegant'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.displayRunwayShow(data.video);
        this.showNotification('Your runway show is ready!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate runway show');
      }
      
    } catch (error) {
      console.error('Runway show error:', error);
      this.showNotification('Failed to generate runway show. Please try again.', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = '✨ Generate This Week\'s Show';
        btn.disabled = false;
      }
      if (progressContainer) {
        progressContainer.classList.add('hidden');
      }
    }
  },
  
  // Helper: Get user's closet items
  async getClosetItems() {
    // In production, fetch from API
    return ['White sneakers', 'Blue jeans', 'Black blazer', 'Grey sweater'];
  },
  
  // Helper: Show video preview in card
  showVideoPreview(videoData, type) {
    const previewContainer = document.getElementById(`${type}Preview`);
    if (!previewContainer) return;
    
    previewContainer.innerHTML = `
      <div class="video-container cursor-pointer" onclick="VideoModal.open(${JSON.stringify(videoData).replace(/"/g, '&quot;')})">
        <img src="${videoData.thumbnail_url}" alt="${videoData.title}" class="w-full aspect-video object-cover rounded-xl">
        <div class="play-button">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-timestamp">${videoData.duration}s</div>
      </div>
      <div class="mt-4">
        <h4 class="text-white font-semibold">${videoData.title}</h4>
        <p class="text-gray-400 text-sm mt-1">${videoData.description}</p>
      </div>
    `;
  },
  
  // Helper: Show styling reel preview
  showStylingReelPreview(videoData) {
    const container = document.getElementById('stylingReelPreview');
    if (!container) return;
    
    const looksHTML = videoData.looks?.map(look => `
      <div class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <span class="text-purple-400 font-mono text-sm">${look.timestamp}</span>
        <div>
          <h5 class="text-white font-medium">${look.name}</h5>
          <p class="text-gray-500 text-xs">${look.description}</p>
        </div>
      </div>
    `).join('') || '';
    
    container.innerHTML = `
      <div class="video-container cursor-pointer mb-4" onclick="VideoModal.open(${JSON.stringify(videoData).replace(/"/g, '&quot;')})">
        <img src="${videoData.thumbnail_url}" alt="${videoData.title}" class="w-full aspect-[9/16] object-cover rounded-xl">
        <div class="play-button">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-timestamp">${videoData.duration}s</div>
      </div>
      <div class="space-y-2">${looksHTML}</div>
    `;
  },
  
  // Helper: Display runway show
  displayRunwayShow(videoData) {
    const container = document.getElementById('runwayShowDisplay');
    if (!container) return;
    
    const looksGrid = videoData.looks?.map((look, i) => `
      <div class="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <span class="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">${i + 1}</span>
        <div>
          <h5 class="text-white font-medium text-sm">${look.name}</h5>
          <p class="text-gray-500 text-xs">${look.items.join(' • ')}</p>
        </div>
      </div>
    `).join('') || '';
    
    container.innerHTML = `
      <div class="runway-card overflow-hidden">
        <div class="relative cursor-pointer" onclick="VideoModal.open(${JSON.stringify(videoData).replace(/"/g, '&quot;')})">
          <img src="${videoData.thumbnail_url}" alt="Runway Show" class="w-full aspect-video object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div class="play-button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="ai-badge mb-2">AI Generated</div>
            <h3 class="text-xl font-bold text-white">${videoData.theme}</h3>
            <p class="text-gray-300 text-sm">Week of ${videoData.week_of}</p>
          </div>
        </div>
        <div class="p-4">
          <h4 class="text-white font-semibold mb-3">${videoData.total_looks} Featured Looks</h4>
          <div class="grid grid-cols-2 gap-2">${looksGrid}</div>
        </div>
      </div>
    `;
  },
  
  // Helper: Animate progress bar
  animateProgress(container) {
    const bar = container.querySelector('.generation-progress-bar');
    if (!bar) return;
    
    bar.style.width = '0%';
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      bar.style.width = `${progress}%`;
    }, 500);
  },
  
  // Helper: Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 translate-y-4 opacity-0 ${
      type === 'success' ? 'bg-green-500/90 text-white' :
      type === 'error' ? 'bg-red-500/90 text-white' :
      'bg-gray-800/90 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        ${type === 'success' ? '<span class="text-xl">✨</span>' : type === 'error' ? '<span class="text-xl">⚠️</span>' : ''}
        <span class="font-medium">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.classList.remove('translate-y-4', 'opacity-0');
    });
    
    setTimeout(() => {
      notification.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
};


/**
 * Initialize video features on page load
 */
function initVideoFeatures() {
  // Initialize modal
  VideoModal.init();
  
  // Bind try-on buttons
  document.querySelectorAll('.tryon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('[data-product-id]');
      const productId = card?.dataset.productId;
      const productName = card?.dataset.productName;
      if (productId) {
        AIVideoGenerator.generateTryOn(productId, productName);
      }
    });
  });
  
  // Bind styling reel buttons
  document.querySelectorAll('.reel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('[data-outfit-id]');
      const outfitId = card?.dataset.outfitId;
      if (outfitId) {
        AIVideoGenerator.generateStylingReel(outfitId);
      }
    });
  });
  
  // Bind runway show generation
  const runwayBtn = document.getElementById('generateRunwayBtn');
  if (runwayBtn) {
    runwayBtn.addEventListener('click', () => {
      const themeInput = document.getElementById('runwayTheme');
      const theme = themeInput?.value || 'Weekly Highlights';
      AIVideoGenerator.generateRunwayShow(theme);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoFeatures);
} else {
  initVideoFeatures();
}