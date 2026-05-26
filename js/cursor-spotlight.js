/**
 * Cursor Spotlight Effect
 * Subtle torch/spotlight following cursor for premium feel
 */

(function() {
  'use strict';

  // Check for touch device
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReducedMotion) return;

  // Create spotlight elements
  const spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';
  document.body.appendChild(spotlight);

  const spotlightEnhanced = document.createElement('div');
  spotlightEnhanced.className = 'cursor-spotlight-enhanced';
  document.body.appendChild(spotlightEnhanced);

  const spotlightCore = document.createElement('div');
  spotlightCore.className = 'cursor-spotlight-core';
  document.body.appendChild(spotlightCore);

  // State
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let enhancedX = 0;
  let enhancedY = 0;
  let isActive = false;
  let rafId = null;
  let inactivityTimeout = null;

  // Mouse move handler with RAF throttling
  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isActive) {
      isActive = true;
      spotlight.classList.add('active');
      spotlightEnhanced.classList.add('active');
      spotlightCore.classList.add('active');
      startAnimation();
    }

    // Update CSS variables for CSS-based effects
    document.querySelectorAll('.card-spotlight, .section-spotlight, .grid-spotlight').forEach(el => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    });

    // Reset inactivity timeout
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      // Keep active, just optional fade logic here if needed
    }, 100);
  }

  // Animation loop for smooth following
  function startAnimation() {
    if (rafId) return;

    function animate() {
      // Smooth follow with different easing for each layer
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
      enhancedX += (mouseX - enhancedX) * 0.08;
      enhancedY += (mouseY - enhancedY) * 0.08;

      // Apply transforms
      spotlight.style.left = `${currentX}px`;
      spotlight.style.top = `${currentY}px`;
      
      spotlightEnhanced.style.left = `${enhancedX}px`;
      spotlightEnhanced.style.top = `${enhancedY}px`;

      spotlightCore.style.left = `${mouseX}px`;
      spotlightCore.style.top = `${mouseY}px`;

      rafId = requestAnimationFrame(animate);
    }

    animate();
  }

  // Mouse leave handler
  function handleMouseLeave() {
    spotlight.classList.remove('active');
    spotlightEnhanced.classList.remove('active');
    spotlightCore.classList.remove('active');
    isActive = false;
    
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Button glow effect
  function initButtonGlow() {
    document.querySelectorAll('.btn, .btn.ghost').forEach(btn => {
      btn.classList.add('btn-glow');
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
      });
    });
  }

  // Initialize card spotlight effects
  function initCardSpotlights() {
    const cards = document.querySelectorAll('.service-card, .project-card, .stat-item, .timeline-item');
    cards.forEach(card => {
      card.classList.add('card-spotlight');
    });
  }

  // Text spotlight reveal on scroll
  function initTextSpotlights() {
    const textElements = document.querySelectorAll('h1, h2, .section-header p');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('text-spotlight');
          setTimeout(() => entry.target.classList.add('revealed'), 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    textElements.forEach(el => observer.observe(el));
  }

  // Initialize
  function init() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    
    initButtonGlow();
    initCardSpotlights();
    initTextSpotlights();

    console.log('🔦 Cursor Spotlight Effect initialized');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
