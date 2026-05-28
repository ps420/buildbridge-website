/**
 * Magnetic Links Controller
 * BuildBridge v63.0 - Fortune 500 Magnetic Cursor Effects
 * 
 * Features:
 * - Magnetic attraction on hover
 * - Configurable strength and radius per element
 * - Smooth elastic return on mouse leave
 * - Performance optimized with RAF throttling
 * - Touch device support
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    defaultStrength: 0.3,
    defaultRadius: 100,
    returnDuration: 500,
    magnetThreshold: 0.1,
    reducedMotionQuery: '(prefers-reduced-motion: reduce)'
  };

  // State
  let magneticElements = [];
  let mousePos = { x: 0, y: 0 };
  let isTicking = false;
  let prefersReducedMotion = window.matchMedia(config.reducedMotionQuery).matches;

  // Initialize
  function init() {
    if (prefersReducedMotion) {
      console.log('[MagneticLinks] Reduced motion preferred - disabled');
      return;
    }

    // Check for touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) {
      console.log('[MagneticLinks] Touch device detected - limited functionality');
      initTouchSupport();
      return;
    }

    findMagneticElements();
    setupEventListeners();
    
    console.log('[MagneticLinks] Initialized with', magneticElements.length, 'elements');
  }

  // Find all magnetic elements
  function findMagneticElements() {
    const selectors = [
      '.magnetic-link',
      '.magnetic-nav-link', 
      '.magnetic-btn-link',
      '.magnetic-social-link',
      '.magnetic-card-link',
      '.magnetic-footer-link',
      '[data-magnetic]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    magneticElements = Array.from(elements).map(el => {
      const strength = parseFloat(el.dataset.magneticStrength) || config.defaultStrength;
      const radius = parseFloat(el.dataset.magneticRadius) || config.defaultRadius;
      const textOnly = el.dataset.magneticText === 'true';
      
      return {
        element: el,
        strength,
        radius,
        textOnly,
        isMagnetic: false,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        rect: null
      };
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Track mouse position
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    
    // Handle element hover
    magneticElements.forEach(item => {
      item.element.addEventListener('mouseenter', () => onMouseEnter(item));
      item.element.addEventListener('mouseleave', () => onMouseLeave(item));
    });
    
    // Update rects on scroll/resize
    window.addEventListener('scroll', updateRects, { passive: true });
    window.addEventListener('resize', updateRects, { passive: true });
    
    // Listen for reduced motion changes
    window.matchMedia(config.reducedMotionQuery).addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        resetAllPositions();
      }
    });
    
    // Initial rect calculation
    updateRects();
  }

  // Update element positions
  function updateRects() {
    magneticElements.forEach(item => {
      item.rect = item.element.getBoundingClientRect();
    });
  }

  // Mouse move handler
  function onMouseMove(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    if (!isTicking) {
      requestAnimationFrame(updateMagneticPositions);
      isTicking = true;
    }
  }

  // Update all magnetic positions
  function updateMagneticPositions() {
    if (prefersReducedMotion) {
      isTicking = false;
      return;
    }

    magneticElements.forEach(item => {
      if (!item.isMagnetic) return;
      
      const centerX = item.rect.left + item.rect.width / 2;
      const centerY = item.rect.top + item.rect.height / 2;
      
      const deltaX = mousePos.x - centerX;
      const deltaY = mousePos.y - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Calculate magnetic pull
      if (distance < item.radius) {
        const pull = 1 - (distance / item.radius);
        const ease = pull * pull; // Ease out quad
        
        item.targetX = deltaX * item.strength * ease;
        item.targetY = deltaY * item.strength * ease;
      } else {
        item.targetX = 0;
        item.targetY = 0;
      }
      
      // Lerp current position
      item.currentX += (item.targetX - item.currentX) * 0.15;
      item.currentY += (item.targetY - item.currentY) * 0.15;
      
      // Apply transform
      applyTransform(item);
    });
    
    isTicking = false;
  }

  // Apply transform to element
  function applyTransform(item) {
    const { currentX, currentY, textOnly } = item;
    
    // Check if movement is significant
    if (Math.abs(currentX) < config.magnetThreshold && Math.abs(currentY) < config.magnetThreshold) {
      return;
    }
    
    if (textOnly) {
      // Only move text content
      const textEl = item.element.querySelector('.magnetic-text') || item.element;
      textEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
    } else {
      // Move entire element
      item.element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    
    // Add magnetic class for CSS effects
    item.element.classList.add('is-magnetic');
  }

  // Mouse enter handler
  function onMouseEnter(item) {
    item.isMagnetic = true;
    item.rect = item.element.getBoundingClientRect();
    
    // Add hover class for CSS transitions
    item.element.classList.add('is-magnetic');
    item.element.classList.remove('is-returning');
  }

  // Mouse leave handler
  function onMouseLeave(item) {
    item.isMagnetic = false;
    item.targetX = 0;
    item.targetY = 0;
    
    item.element.classList.remove('is-magnetic');
    item.element.classList.add('is-returning');
    
    // Animate back to center
    animateReturn(item);
  }

  // Animate element back to center
  function animateReturn(item) {
    const startX = item.currentX;
    const startY = item.currentY;
    const startTime = performance.now();
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / config.returnDuration, 1);
      
      // Elastic ease out
      const ease = elasticOut(progress);
      
      item.currentX = startX * (1 - ease);
      item.currentY = startY * (1 - ease);
      
      if (item.textOnly) {
        const textEl = item.element.querySelector('.magnetic-text') || item.element;
        textEl.style.transform = `translate(${item.currentX}px, ${item.currentY}px)`;
      } else {
        item.element.style.transform = `translate(${item.currentX}px, ${item.currentY}px)`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        item.element.classList.remove('is-returning');
        item.element.style.transform = '';
      }
    }
    
    requestAnimationFrame(step);
  }

  // Elastic ease out function
  function elasticOut(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  }

  // Reset all positions (for reduced motion)
  function resetAllPositions() {
    magneticElements.forEach(item => {
      item.isMagnetic = false;
      item.currentX = 0;
      item.currentY = 0;
      item.element.style.transform = '';
      item.element.classList.remove('is-magnetic', 'is-returning');
    });
  }

  // Touch device support
  function initTouchSupport() {
    magneticElements.forEach(item => {
      item.element.addEventListener('touchstart', () => {
        item.element.style.transform = 'scale(0.98)';
      }, { passive: true });
      
      item.element.addEventListener('touchend', () => {
        item.element.style.transform = '';
      }, { passive: true });
    });
  }

  // Refresh elements (call when DOM changes)
  function refresh() {
    findMagneticElements();
    setupEventListeners();
  }

  // Public API
  window.MagneticLinks = {
    init,
    refresh,
    get elements() { return magneticElements; },
    get isReducedMotion() { return prefersReducedMotion; }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
