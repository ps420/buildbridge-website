/**
 * Velocity-Based Scroll Reveal - v33.0
 * Fortune 500 Dynamic Scroll Animations
 * 
 * Features:
 * - Elements animate based on scroll velocity
 * - Faster scroll = faster animations
 * - Multiple animation types (fade, slide, scale, rotate, blur)
 * - Skew effects during fast scrolling
 * - Text character and word animations
 * - Reduced motion support
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    velocityMultiplier: 1.5,
    slowThreshold: 200,    // px/s
    fastThreshold: 800,    // px/s
    skewMax: 3,            // degrees
    debug: false
  };

  // State
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  let ticking = false;
  let elements = [];

  /**
   * Initialize Velocity Scroll Reveal
   */
  function init() {
    // Find all velocity reveal elements
    elements = document.querySelectorAll('.velocity-reveal, [data-velocity-reveal]');
    
    if (elements.length === 0) {
      console.log('⚡ Velocity Scroll Reveal: No elements found');
      return;
    }

    // Process text reveal elements
    processTextReveals();

    // Setup Intersection Observer
    setupObserver();

    // Setup scroll listener for velocity
    setupScrollListener();

    // Setup skew effect
    setupSkewEffect();

    // Debug indicator
    if (CONFIG.debug) {
      createDebugIndicator();
    }

    console.log(`⚡ BuildBridge Velocity Scroll Reveal v33.0 loaded | ${elements.length} elements`);
  }

  /**
   * Process text reveal elements
   */
  function processTextReveals() {
    document.querySelectorAll('.velocity-text-reveal').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      
      if (el.classList.contains('velocity-text-reveal--words')) {
        // Word-level animation
        const words = text.split(' ');
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = word + ' ';
          span.style.transitionDelay = `${i * 30}ms`;
          el.appendChild(span);
        });
      } else {
        // Character-level animation
        [...text].forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.transitionDelay = `${i * 15}ms`;
          el.appendChild(span);
        });
      }
    });
  }

  /**
   * Setup Intersection Observer
   */
  function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Calculate animation timing based on velocity
          const velocity = Math.abs(scrollVelocity);
          const element = entry.target;
          
          // Apply velocity-based speed class
          updateVelocityClass(element, velocity);
          
          // Trigger animation
          requestAnimationFrame(() => {
            element.classList.add('velocity-visible');
          });
          
          // Update text reveal timing
          updateTextRevealTiming(element, velocity);
          
          // Stop observing once visible
          observer.unobserve(element);
        }
      });
    }, {
      threshold: CONFIG.threshold,
      rootMargin: CONFIG.rootMargin
    });

    elements.forEach(el => observer.observe(el));
  }

  /**
   * Update velocity-based animation class
   */
  function updateVelocityClass(element, velocity) {
    // Remove existing velocity classes
    element.classList.remove('velocity-fast', 'velocity-medium', 'velocity-slow', 'velocity-dramatic');
    
    // Add appropriate class based on velocity
    if (velocity > CONFIG.fastThreshold) {
      element.classList.add('velocity-fast');
    } else if (velocity > CONFIG.slowThreshold) {
      element.classList.add('velocity-medium');
    } else if (velocity > 50) {
      element.classList.add('velocity-slow');
    } else {
      element.classList.add('velocity-dramatic');
    }
  }

  /**
   * Update text reveal animation timing
   */
  function updateTextRevealTiming(element, velocity) {
    const chars = element.querySelectorAll('.char, .word');
    const baseDelay = velocity > CONFIG.fastThreshold ? 10 : 
                      velocity > CONFIG.slowThreshold ? 20 : 30;
    
    chars.forEach((char, i) => {
      char.style.transitionDelay = `${i * baseDelay}ms`;
    });
  }

  /**
   * Setup scroll listener for velocity calculation
   */
  function setupScrollListener() {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateVelocity();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Calculate scroll velocity
   */
  function calculateVelocity() {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastScrollTime;
    
    if (timeDelta > 0) {
      const scrollDelta = currentScrollY - lastScrollY;
      scrollVelocity = (scrollDelta / timeDelta) * 1000; // px per second
      
      // Update debug indicator
      if (CONFIG.debug) {
        updateDebugIndicator();
      }
    }
    
    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;

    // Decay velocity when not scrolling
    setTimeout(() => {
      if (Date.now() - lastScrollTime > 100) {
        scrollVelocity *= 0.8;
        if (Math.abs(scrollVelocity) < 10) scrollVelocity = 0;
      }
    }, 100);
  }

  /**
   * Setup skew effect on fast scroll
   */
  function setupSkewEffect() {
    const containers = document.querySelectorAll('.velocity-skew-container');
    
    window.addEventListener('scroll', () => {
      if (containers.length === 0) return;
      
      const absVelocity = Math.abs(scrollVelocity);
      const direction = scrollVelocity > 0 ? 'down' : 'up';
      
      if (absVelocity > CONFIG.fastThreshold * 0.5) {
        const skewAmount = Math.min(
          (absVelocity / CONFIG.fastThreshold) * CONFIG.skewMax,
          CONFIG.skewMax
        );
        
        const skewValue = direction === 'down' ? skewAmount : -skewAmount;
        
        containers.forEach(container => {
          container.style.transform = `skewY(${skewValue}deg)`;
        });
      } else {
        containers.forEach(container => {
          container.style.transform = 'skewY(0deg)';
        });
      }
    }, { passive: true });
  }

  /**
   * Create debug indicator
   */
  function createDebugIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'velocity-indicator';
    indicator.id = 'velocity-debug';
    indicator.innerHTML = `
      <div>Velocity: <span id="vel-value">0</span> px/s</div>
      <div>Speed: <span id="vel-class">static</span></div>
    `;
    document.body.appendChild(indicator);
  }

  /**
   * Update debug indicator
   */
  function updateDebugIndicator() {
    const indicator = document.getElementById('velocity-debug');
    if (!indicator) return;
    
    const velValue = indicator.querySelector('#vel-value');
    const velClass = indicator.querySelector('#vel-class');
    
    if (velValue) velValue.textContent = Math.round(Math.abs(scrollVelocity));
    if (velClass) {
      const absVel = Math.abs(scrollVelocity);
      if (absVel > CONFIG.fastThreshold) velClass.textContent = 'fast';
      else if (absVel > CONFIG.slowThreshold) velClass.textContent = 'medium';
      else if (absVel > 50) velClass.textContent = 'slow';
      else velClass.textContent = 'static';
    }
  }

  /**
   * Reinitialize (call after DOM changes)
   */
  function refresh() {
    elements = document.querySelectorAll('.velocity-reveal, [data-velocity-reveal]');
    processTextReveals();
    setupObserver();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.VelocityReveal = {
    refresh: refresh,
    getVelocity: () => scrollVelocity,
    config: CONFIG
  };
})();
