/**
 * SPOTLIGHT HOVER EFFECTS v55.0
 * Advanced Mouse-Following Spotlight System
 */

(function() {
  'use strict';

  const config = {
    throttleDelay: 16, // ~60fps
    smoothingFactor: 0.15,
    enableOnTouch: false
  };

  let rafId = null;
  const elements = new Map();

  /**
   * Initialize spotlight effects
   */
  function init() {
    // Skip on touch devices
    if (!config.enableOnTouch && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // Find all spotlight elements
    const selectors = [
      '.spotlight-card',
      '.spotlight-border',
      '.spotlight-layered',
      '.glass-spotlight',
      '.mesh-spotlight',
      '.corner-spotlight',
      '.image-spotlight',
      '.text-spotlight'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      if (!elements.has(el)) {
        elements.set(el, {
          targetX: 50,
          targetY: 50,
          currentX: 50,
          currentY: 50
        });
        bindElement(el);
      }
    });

    // Watch for new elements
    observeNewElements();

    // Start animation loop
    startAnimationLoop();
  }

  /**
   * Bind events to element
   */
  function bindElement(el) {
    let isHovering = false;
    let lastMoveTime = 0;

    el.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      // Reset to center when leaving
      const state = elements.get(el);
      if (state) {
        state.targetX = 50;
        state.targetY = 50;
      }
    });

    el.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime < config.throttleDelay) return;
      lastMoveTime = now;

      const rect = el.getBoundingClientRect();
      const state = elements.get(el);
      
      if (state) {
        // Calculate percentage position
        state.targetX = ((e.clientX - rect.left) / rect.width) * 100;
        state.targetY = ((e.clientY - rect.top) / rect.height) * 100;
      }
    });

    // Handle text spotlight
    if (el.classList.contains('text-spotlight')) {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        el.style.setProperty('--spotlight-pos', x + '%');
      });
    }
  }

  /**
   * Animation loop for smooth spotlight movement
   */
  function startAnimationLoop() {
    function update() {
      elements.forEach((state, el) => {
        // Smooth interpolation
        state.currentX += (state.targetX - state.currentX) * config.smoothingFactor;
        state.currentY += (state.targetY - state.currentY) * config.smoothingFactor;

        // Apply to CSS variables
        el.style.setProperty('--mouse-x', state.currentX + '%');
        el.style.setProperty('--mouse-y', state.currentY + '%');
      });

      rafId = requestAnimationFrame(update);
    }

    update();
  }

  /**
   * Watch for new spotlight elements
   */
  function observeNewElements() {
    const observer = new MutationObserver(mutations => {
      let hasNewElements = false;

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const newSpotlights = node.matches?.('.spotlight-card, .spotlight-border, .spotlight-layered, .glass-spotlight, .mesh-spotlight, .corner-spotlight, .image-spotlight, .text-spotlight')
              ? [node]
              : node.querySelectorAll?.('.spotlight-card, .spotlight-border, .spotlight-layered, .glass-spotlight, .mesh-spotlight, .corner-spotlight, .image-spotlight, .text-spotlight') || [];

            newSpotlights.forEach(el => {
              if (!elements.has(el)) {
                elements.set(el, {
                  targetX: 50,
                  targetY: 50,
                  currentX: 50,
                  currentY: 50
                });
                bindElement(el);
                hasNewElements = true;
              }
            });
          }
        });
      });

      if (hasNewElements && !rafId) {
        startAnimationLoop();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Create spotlight card programmatically
   */
  function createSpotlightCard(options = {}) {
    const card = document.createElement('div');
    card.className = `spotlight-card ${options.className || ''}`;
    
    if (options.variant) {
      card.classList.remove('spotlight-card');
      card.classList.add(options.variant);
    }

    card.innerHTML = `
      <div class="spotlight-content">
        ${options.icon ? `<div class="spotlight-icon">${options.icon}</div>` : ''}
        ${options.title ? `<h3>${options.title}</h3>` : ''}
        ${options.content || ''}
      </div>
    `;

    // Initialize
    elements.set(card, {
      targetX: 50,
      targetY: 50,
      currentX: 50,
      currentY: 50
    });
    bindElement(card);

    return card;
  }

  /**
   * Apply spotlight effect to existing element
   */
  function applyToElement(element, variant = 'spotlight-card') {
    element.classList.add(variant);
    
    if (!elements.has(element)) {
      elements.set(element, {
        targetX: 50,
        targetY: 50,
        currentX: 50,
        currentY: 50
      });
      bindElement(element);
    }

    if (!rafId) {
      startAnimationLoop();
    }
  }

  /**
   * Destroy spotlight effects
   */
  function destroy() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    elements.clear();
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId && elements.size > 0) {
      startAnimationLoop();
    }
  });

  // Expose API
  window.SpotlightEffects = {
    init,
    destroy,
    createSpotlightCard,
    applyToElement,
    elements
  };

})();
