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
            
            const analysis = data.analysis;
            resultsText.innerHTML = `
              <div class="space-y-4">
                <div class="text-center pb-3 border-b border-gray-200">
                  <p class="font-bold text-gray-900 text-lg mb-1">✨ ${analysis.style_profile}</p>
                  <p class="text-xs text-gray-500">Your item analysis</p>
                </div>
                <div class="result-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <p class="font-semibold text-purple-900 mb-2 text-sm">Color Palette</p>
                  <div class="flex flex-wrap gap-2">
                    ${analysis.colors.map(color => `
                      <span class="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm border border-gray-200">${color}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="result-card bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200" style="animation-delay: 0.1s">
                  <p class="font-semibold text-blue-900 mb-2 text-sm">Perfect For</p>
                  <div class="flex flex-wrap gap-2">
                    ${analysis.occasion.map(occ => `
                      <span class="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm border border-gray-200">${occ}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="result-card bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200" style="animation-delay: 0.2s">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="font-semibold text-green-900 text-sm">Style Suggestions</p>
                  </div>
                  <ul class="text-gray-700 space-y-2 text-sm">
                    ${analysis.suggestions.map(s => `
                      <li class="flex items-start gap-2">
                        <span class="text-green-500 mt-0.5">•</span>
                        <span>${s}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
                <p class="text-center text-xs text-gray-500 italic pt-2">Building your style profile... Upload more for better recommendations!</p>
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
            resultsText.innerHTML = `<p class="text-red-600 text-sm">Error: ${data.error}</p>`;
            resultsArea.classList.remove('hidden');
          }
          
        } catch (error) {
          console.error('Error:', error);
          resultsText.innerHTML = `<p class="text-red-600 text-sm">Failed to analyze. Please try again.</p>`;
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
          
          capsuleOutfitDetails.innerHTML = `
            <div class="space-y-4">
              <div class="text-center pb-3 border-b border-gray-200">
                <p class="font-bold text-gray-900 text-lg mb-1">✨ ${data.outfit.name}</p>
                <p class="text-xs text-gray-500">Perfect for your occasion</p>
              </div>
              <div class="grid grid-cols-1 gap-3">
                ${data.outfit.pieces.map((piece, index) => `
                  <div class="result-card bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all" style="animation-delay: ${index * 0.1}s">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        ${index + 1}
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-gray-900 mb-1">${piece.item}</p>
                        <p class="text-sm text-gray-600">${piece.description}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p class="text-sm font-semibold text-blue-900">Styling Tips</p>
                </div>
                <ul class="text-sm text-gray-700 space-y-2">
                  ${data.outfit.tips.map(tip => `
                    <li class="flex items-start gap-2">
                      <span class="text-blue-500 mt-0.5">•</span>
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
          
          const sustainabilityDisplay = sustainabilityFilters.length > 0 ? `
            <div class="pt-3 border-t border-gray-200">
              <p class="font-medium text-green-700 text-xs mb-2">🌱 Active Filters:</p>
              <div class="flex flex-wrap gap-2">
                ${sustainabilityFilters.map(filter => `
                  <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">${filter}</span>
                `).join('')}
              </div>
            </div>
          ` : '';
          
          styleProfileDetails.innerHTML = `
            <div class="space-y-3">
              <div>
                <p class="font-semibold text-gray-900 text-sm mb-1">Context: ${data.profile.context}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700 text-xs mb-2">Aesthetics:</p>
                <div class="flex flex-wrap gap-2">
                  ${data.profile.aesthetics.map(a => `
                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">${a}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="font-medium text-gray-700 text-xs mb-2">Colors:</p>
                <div class="flex gap-2">
                  ${data.profile.colors.map(c => `
                    <div class="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm" style="background-color: ${c}"></div>
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
              <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                <div class="flex gap-4">
                  <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                      ${item.brand}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <h5 class="font-semibold text-gray-900 text-sm truncate">${item.name}</h5>
                      <span class="text-gray-900 font-bold text-sm ml-2">${item.price}</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-1">
                      ${item.brand}
                      ${isSustainable ? '<span class="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">🌱 Eco</span>' : ''}
                    </p>
                    <p class="text-xs text-gray-700 line-clamp-2 mb-2">${item.description}</p>
                    <div class="flex gap-2">
                      <a href="${item.url}" target="_blank" class="text-xs bg-black text-white hover:bg-gray-800 px-3 py-1 rounded transition-colors font-medium">
                        View Item
                      </a>
                      <span class="text-xs ${item.available ? 'text-green-600' : 'text-gray-400'} flex items-center">
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
            
            styleShoppingResults.innerHTML += `
              <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                <p class="text-sm text-gray-700">
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
          
          // H&M-style product cards
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
              <!-- Product Image -->
              <div class="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center p-4">
                    <div class="text-4xl mb-2">👕</div>
                    <p class="text-xs text-gray-500 font-medium">${item.store}</p>
                  </div>
                </div>
                ${isSustainable ? '<div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">🌱 Eco</div>' : ''}
                ${item.inBudget ? '' : '<div class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">Near Budget</div>'}
                
                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
              
              <!-- Product Info -->
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">${item.name}</h3>
                <p class="text-xs text-gray-600 line-clamp-1">${item.description}</p>
                <div class="flex items-center justify-between pt-1">
                  <span class="text-sm font-bold text-gray-900">$${item.price}</span>
                  <span class="text-xs text-gray-500">${item.store}</span>
                </div>
                ${item.inBudget ? 
                  '<span class="inline-block text-xs text-green-600 font-medium">✓ Within budget</span>' : 
                  '<span class="inline-block text-xs text-yellow-600 font-medium">Slightly over</span>'}
              </div>
            </div>
            `;
          }).join('');

          // Add budget summary
          const totalSpent = data.items.reduce((sum, item) => sum + item.price, 0);
          const remaining = budget - totalSpent;
          
          shoppingItems.innerHTML += `
            <div class="col-span-full mt-4 pt-6 border-t border-gray-200">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-700 mb-1">
                  <span class="font-semibold">Total:</span> $${totalSpent.toFixed(2)} of $${budget.toFixed(2)} budget
                </p>
                <p class="text-xs ${remaining >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">
                  ${remaining >= 0 ? `$${remaining.toFixed(2)} remaining in budget` : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </p>
              </div>
            </div>
          `;
        } else {
          if (shoppingEmpty) {
            shoppingEmpty.classList.remove('hidden');
            shoppingEmpty.innerHTML = '<p class="text-red-600 text-sm">No items found. Try adjusting your budget or description.</p>';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        if (shoppingEmpty) {
          shoppingEmpty.classList.remove('hidden');
          shoppingEmpty.innerHTML = '<p class="text-red-600 text-sm">Failed to find items. Please try again.</p>';
        }
      }

      findItemsBtn.disabled = false;
      findItemsBtn.textContent = 'Find Items';
    });
  }
});