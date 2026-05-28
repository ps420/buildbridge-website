/**
 * PROFESSIONAL PAGE LOADER - BuildBridge
 * v36.0 Fortune 500 Loading Experience
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    minDisplayTime: 2000,      // Minimum time to show loader (ms)
    maxDisplayTime: 8000,      // Maximum time before auto-hide (ms)
    progressIncrement: 2,      // Base progress increment
    updateInterval: 50,        // Progress update frequency (ms)
    messages: [
      'Loading assets...',
      'Initializing components...',
      'Preparing experience...',
      'Almost ready...',
      'Welcome to BuildBridge'
    ]
  };

  // State
  let state = {
    progress: 0,
    loadedResources: 0,
    totalResources: 0,
    isComplete: false,
    startTime: Date.now()
  };

  // DOM Elements
  let elements = {};

  /**
   * Initialize the professional loader
   */
  function init() {
    // Create loader HTML
    createLoaderHTML();
    
    // Cache DOM elements
    cacheElements();
    
    // Create floating particles
    createParticles();
    
    // Start progress simulation
    startProgressSimulation();
    
    // Listen for resource loading
    monitorResourceLoading();
    
    // Handle page load events
    bindLoadEvents();
    
    // Handle skip button
    bindSkipButton();
  }

  /**
   * Create loader HTML structure
   */
  function createLoaderHTML() {
    const loader = document.createElement('div');
    loader.className = 'professional-loader';
    loader.id = 'professional-loader';
    loader.setAttribute('role', 'progressbar');
    loader.setAttribute('aria-label', 'Loading BuildBridge');
    loader.setAttribute('aria-valuemin', '0');
    loader.setAttribute('aria-valuemax', '100');
    loader.setAttribute('aria-valuenow', '0');

    loader.innerHTML = `
      <div class="loader-grid"></div>
      <div class="loader-particles"></div>
      
      <div class="loader-brand">
        <div class="loader-logo-wrapper">
          <div class="loader-logo-ring"></div>
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="loader-logo">
        </div>
        
        <div class="loader-brand-text">
          <span class="loader-brand-name">BuildBridge</span>
          <span class="loader-brand-tagline">Loading Experience</span>
        </div>
        
        <div class="loader-progress-container">
          <div class="loader-progress-bar" id="loader-progress-bar"></div>
        </div>
        
        <div class="loader-progress-text" id="loader-message">Initializing...</div>
        <div class="loader-progress-percent" id="loader-percent">0%</div>
      </div>
      
      <button class="loader-skip-btn" id="loader-skip">Skip Loading</button>
      
      <div class="loader-messages">
        <div class="loader-message">Premium Construction Management</div>
        <div class="loader-message">Connecting Clients & Contractors</div>
        <div class="loader-message">Building Trust Since 2012</div>
      </div>
    `;

    document.body.appendChild(loader);
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      loader: document.getElementById('professional-loader'),
      progressBar: document.getElementById('loader-progress-bar'),
      percentText: document.getElementById('loader-percent'),
      messageText: document.getElementById('loader-message'),
      skipButton: document.getElementById('loader-skip')
    };
  }

  /**
   * Create floating particles
   */
  function createParticles() {
    const container = document.querySelector('.loader-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'loader-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${6 + Math.random() * 4}s`;
      container.appendChild(particle);
    }
  }

  /**
   * Start progress simulation
   */
  function startProgressSimulation() {
    let lastUpdate = Date.now();
    
    const updateProgress = () => {
      if (state.isComplete) return;
      
      const now = Date.now();
      const elapsed = now - state.startTime;
      
      // Calculate target progress based on time
      let targetProgress = Math.min(100, (elapsed / CONFIG.minDisplayTime) * 100);
      
      // Adjust for actual resource loading
      if (state.totalResources > 0) {
        const resourceProgress = (state.loadedResources / state.totalResources) * 100;
        targetProgress = Math.max(targetProgress, resourceProgress * 0.7);
      }
      
      // Smooth progress increment
      const increment = (targetProgress - state.progress) * 0.1;
      state.progress = Math.min(targetProgress, state.progress + Math.max(0.5, increment));
      
      // Update UI
      updateLoaderUI();
      
      // Check completion
      if (state.progress >= 100 && elapsed >= CONFIG.minDisplayTime) {
        completeLoading();
      } else if (elapsed >= CONFIG.maxDisplayTime) {
        forceComplete();
      } else {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }

  /**
   * Update loader UI elements
   */
  function updateLoaderUI() {
    const progress = Math.floor(state.progress);
    
    if (elements.progressBar) {
      elements.progressBar.style.width = `${progress}%`;
    }
    
    if (elements.percentText) {
      elements.percentText.textContent = `${progress}%`;
    }
    
    if (elements.loader) {
      elements.loader.setAttribute('aria-valuenow', progress);
    }
    
    // Update message based on progress
    updateLoadingMessage(progress);
  }

  /**
   * Update loading message based on progress
   */
  function updateLoadingMessage(progress) {
    if (!elements.messageText) return;
    
    const messageIndex = Math.min(
      Math.floor((progress / 100) * CONFIG.messages.length),
      CONFIG.messages.length - 1
    );
    
    elements.messageText.textContent = CONFIG.messages[messageIndex];
  }

  /**
   * Monitor resource loading
   */
  function monitorResourceLoading() {
    // Count total resources
    const images = document.querySelectorAll('img');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    state.totalResources = images.length + stylesheets.length + scripts.length;
    
    // Track image loading
    images.forEach(img => {
      if (img.complete) {
        state.loadedResources++;
      } else {
        img.addEventListener('load', () => state.loadedResources++);
        img.addEventListener('error', () => state.loadedResources++);
      }
    });
  }

  /**
   * Bind load events
   */
  function bindLoadEvents() {
    // Page load event
    if (document.readyState === 'complete') {
      onPageLoaded();
    } else {
      window.addEventListener('load', onPageLoaded);
    }
    
    // Also listen for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        state.loadedResources += 5; // Boost for DOM ready
      });
    }
  }

  /**
   * Handle page loaded
   */
  function onPageLoaded() {
    state.loadedResources = state.totalResources || 100;
    
    // Ensure minimum display time
    const elapsed = Date.now() - state.startTime;
    const remaining = Math.max(0, CONFIG.minDisplayTime - elapsed);
    
    setTimeout(() => {
      if (!state.isComplete) {
        state.progress = 100;
        completeLoading();
      }
    }, remaining);
  }

  /**
   * Complete loading sequence
   */
  function completeLoading() {
    if (state.isComplete) return;
    state.isComplete = true;
    
    // Add complete class for animations
    elements.loader.classList.add('complete');
    
    // Short delay before hiding
    setTimeout(() => {
      elements.loader.classList.add('exiting');
      
      setTimeout(() => {
        elements.loader.classList.add('hidden');
        
        // Remove loader from DOM after animation
        setTimeout(() => {
          elements.loader.remove();
          document.body.classList.add('page-loaded');
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('buildbridge:loaded'));
        }, 800);
      }, 600);
    }, 400);
  }

  /**
   * Force completion (timeout fallback)
   */
  function forceComplete() {
    state.progress = 100;
    completeLoading();
  }

  /**
   * Bind skip button
   */
  function bindSkipButton() {
    if (elements.skipButton) {
      elements.skipButton.addEventListener('click', (e) => {
        e.preventDefault();
        forceComplete();
      });
    }
  }

  /**
   * Public API
   */
  window.ProfessionalLoader = {
    init,
    complete: completeLoading,
    setProgress: (percent) => {
      state.progress = Math.min(100, Math.max(0, percent));
      updateLoaderUI();
    },
    isComplete: () => state.isComplete
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
