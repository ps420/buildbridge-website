/**
 * Dynamic Gradient Border Cards - v33.0
 * Fortune 500 Animated Border Effects
 * 
 * Features:
 * - Animated gradient borders on cards
 * - Mouse-following interactive gradients
 * - Multiple animation variants (rotate, pulse, mesh, etc.)
 * - Shine effects on hover
 * - Responsive design
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    interactiveThrottle: 16, // ms
    magneticStrength: 0.3,
    glowIntensity: 0.6
  };

  // State
  let interactiveCards = [];
  let isThrottling = false;

  /**
   * Initialize Dynamic Gradient Borders
   */
  function init() {
    // Find all gradient border cards
    const cards = document.querySelectorAll('.gradient-border-card--interactive');
    interactiveCards = Array.from(cards);

    if (interactiveCards.length === 0) {
      console.log('✨ Dynamic Gradient Borders: No interactive cards found');
    } else {
      setupInteractiveCards();
    }

    // Setup featured card effects
    setupFeaturedCards();

    // Add entrance animations
    setupEntranceAnimations();

    console.log('✨ BuildBridge Dynamic Gradient Borders v33.0 loaded');
  }

  /**
   * Setup interactive mouse-following cards
   */
  function setupInteractiveCards() {
    interactiveCards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('mouseenter', handleMouseEnter);
    });
  }

  /**
   * Handle mouse move on interactive card
   */
  function handleMouseMove(e) {
    if (isThrottling) return;
    
    isThrottling = true;
    
    requestAnimationFrame(() => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      
      // Calculate mouse position as percentage
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Update CSS custom properties
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
      
      // Add subtle tilt effect
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((e.clientY - rect.top - centerY) / centerY) * -5;
      const rotateY = ((e.clientX - rect.left - centerX) / centerX) * 5;
      
      const inner = card.querySelector('.gradient-border-inner');
      if (inner) {
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      
      isThrottling = false;
    });
  }

  /**
   * Handle mouse leave
   */
  function handleMouseLeave(e) {
    const card = e.currentTarget;
    const inner = card.querySelector('.gradient-border-inner');
    
    if (inner) {
      inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      inner.style.transition = 'transform 0.5s ease';
    }
    
    // Reset to center
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
  }

  /**
   * Handle mouse enter
   */
  function handleMouseEnter(e) {
    const card = e.currentTarget;
    const inner = card.querySelector('.gradient-border-inner');
    
    if (inner) {
      inner.style.transition = 'transform 0.1s ease';
    }
  }

  /**
   * Setup featured cards with enhanced effects
   */
  function setupFeaturedCards() {
    const featuredCards = document.querySelectorAll('.gradient-border-card--featured');
    
    featuredCards.forEach((card, index) => {
      // Add staggered entrance delay
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '1';
        card.style.transform = 'scale(1.05)';
      }, index * 150);
    });
  }

  /**
   * Setup entrance animations for cards
   */
  function setupEntranceAnimations() {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          // Add stagger delay based on position
          const delay = Array.from(card.parentElement.children).indexOf(card) * 100;
          
          setTimeout(() => {
            card.classList.add('gradient-border-visible');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, delay);
          
          observer.unobserve(card);
        }
      });
    }, observerOptions);

    // Observe all gradient border cards
    document.querySelectorAll('.gradient-border-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }

  /**
   * Create a new gradient border card programmatically
   */
  function createCard(options = {}) {
    const {
      variant = '',
      icon = '🎯',
      title = 'Card Title',
      text = 'Card description text.',
      link = null,
      featured = false
    } = options;

    const card = document.createElement('div');
    card.className = `gradient-border-card ${variant} ${featured ? 'gradient-border-card--featured' : ''}`;
    
    card.innerHTML = `
      <div class="gradient-border-shine"></div>
      <div class="gradient-border-inner">
        <div class="gradient-card-icon">${icon}</div>
        <h3 class="gradient-card-title">${title}</h3>
        <p class="gradient-card-text">${text}</p>
        ${link ? `<a href="${link}" class="gradient-card-link">Learn More →</a>` : ''}
      </div>
    `;

    return card;
  }

  /**
   * Add magnetic effect to cards
   */
  function addMagneticEffect(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      card.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  /**
   * Pulse animation trigger
   */
  function pulseCard(card) {
    card.classList.add('gradient-border-pulsing');
    setTimeout(() => {
      card.classList.remove('gradient-border-pulsing');
    }, 1000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.GradientBorders = {
    createCard: createCard,
    addMagneticEffect: addMagneticEffect,
    pulseCard: pulseCard,
    refresh: init
  };
})();
