/**
 * CONFETTI CELEBRATION SYSTEM v55.0
 * Delightful Micro-interactions for Form Submissions
 */

(function() {
  'use strict';

  // Config
  const DEFAULT_CONFIG = {
    particleCount: 100,
    spread: 120,
    origin: { y: 0.7 },
    colors: ['#C9CED6', '#8A9199', '#F5F7FA', '#5eead4', '#22c55e', '#f59e0b', '#3b82f6'],
    shapes: ['square', 'circle', 'triangle', 'ribbon'],
    gravity: 0.8,
    drag: 0.96,
    terminalVelocity: 6
  };

  // Color palettes for different celebration types
  const PALETTES = {
    success: ['#22c55e', '#16a34a', '#86efac', '#C9CED6', '#F5F7FA'],
    contact: ['#3b82f6', '#22c55e', '#C9CED6', '#8b5cf6', '#f59e0b'],
    booking: ['#f59e0b', '#ef4444', '#C9CED6', '#8A9199', '#ec4899'],
    subscribe: ['#8b5cf6', '#C9CED6', '#F5F7FA', '#a78bfa', '#c4b5fd'],
    milestone: ['#f59e0b', '#ef4444', '#fbbf24', '#fcd34d', '#fde68a']
  };

  // Active animations tracker
  let activeAnimations = new Set();

  /**
   * Create confetti explosion
   */
  function celebrate(options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const { x, y, origin } = config;
    
    // Use provided coords or normalized origin
    const originX = x !== undefined ? x : (origin?.x || 0.5);
    const originY = y !== undefined ? y : (origin?.y || 0.5);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    // Generate particles
    for (let i = 0; i < config.particleCount; i++) {
      createParticle(container, originX, originY, config);
    }

    // Cleanup
    setTimeout(() => {
      container.remove();
    }, 4000);
  }

  /**
   * Create individual confetti particle
   */
  function createParticle(container, originX, originY, config) {
    const particle = document.createElement('div');
    const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    
    particle.className = `confetti-particle ${shape}`;
    particle.style.backgroundColor = shape === 'triangle' ? 'transparent' : color;
    particle.style.color = color; // For triangle
    
    // Starting position
    const startX = originX * window.innerWidth;
    const startY = originY * window.innerHeight;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    // Physics
    const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
    const velocity = Math.random() * 15 + 8;
    const vx = Math.sin(angle) * velocity;
    const vy = Math.cos(angle) * velocity - Math.random() * 5;
    
    // Set CSS variables for animation
    particle.style.setProperty('--tx', (vx * 20) + 'px');
    particle.style.setProperty('--ty', (vy * 15) + 'px');
    
    // Animation
    const duration = Math.random() * 1000 + 2000;
    const delay = Math.random() * 200;
    
    particle.style.animation = `
      confetti-explode ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards,
      confetti-shimmer ${Math.random() * 500 + 500}ms ease-in-out infinite alternate
    `;
    
    container.appendChild(particle);
  }

  /**
   * Create mini sparkles around an element
   */
  function createSparkles(element, count = 8) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      
      const angle = (i / count) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      sparkle.style.left = centerX + 'px';
      sparkle.style.top = centerY + 'px';
      sparkle.style.setProperty('--tx', tx + 'px');
      sparkle.style.setProperty('--ty', ty + 'px');
      sparkle.style.background = PALETTES.success[Math.floor(Math.random() * PALETTES.success.length)];
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 800);
    }
  }

  /**
   * Create expansion ring effect
   */
  function createRing(x, y, color = '#C9CED6') {
    const ring = document.createElement('div');
    ring.className = 'celebration-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.style.borderColor = color;
    ring.style.width = '50px';
    ring.style.height = '50px';
    
    document.body.appendChild(ring);
    
    setTimeout(() => ring.remove(), 800);
  }

  /**
   * Show success overlay with confetti
   */
  function showSuccess(options = {}) {
    const {
      title = 'Success!',
      message = 'Your submission has been received.',
      type = 'success',
      duration = 3000,
      onClose
    } = options;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'form-success-overlay';
    overlay.innerHTML = `
      <div class="form-success-content">
        <div class="form-success-checkmark">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50"/>
            <path d="M35 60 L50 75 L85 40"/>
          </svg>
        </div>
        <h2 class="form-success-title">${title}</h2>
        <p class="form-success-message">${message}</p>
        <button class="form-success-close">Continue</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger confetti
    celebrate({
      particleCount: 80,
      colors: PALETTES[type] || PALETTES.success,
      origin: { y: 0.6 }
    });
    
    // Show animation
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
    
    // Handle close
    const closeOverlay = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        if (onClose) onClose();
      }, 400);
    };
    
    overlay.querySelector('.form-success-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
    
    // Auto close
    if (duration > 0) {
      setTimeout(closeOverlay, duration);
    }
  }

  /**
   * Show floating success notification
   */
  function showFloatingSuccess(options = {}) {
    const {
      title = 'Success!',
      message = 'Action completed successfully.',
      x,
      y
    } = options;

    const notification = document.createElement('div');
    notification.className = 'celebration-success';
    notification.innerHTML = `
      <div class="celebration-success-icon">✓</div>
      <div class="celebration-success-title">${title}</div>
      <div class="celebration-success-message">${message}</div>
    `;
    
    if (x !== undefined && y !== undefined) {
      notification.style.left = x + 'px';
      notification.style.top = y + 'px';
      notification.style.transform = 'translate(-50%, -50%)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('active');
    });
    
    // Mini confetti burst
    celebrate({
      particleCount: 30,
      spread: 60,
      x: x ? x / window.innerWidth : 0.5,
      y: y ? y / window.innerHeight : 0.5,
      colors: PALETTES.success
    });
    
    // Remove after delay
    setTimeout(() => {
      notification.style.animation = 'none';
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
      notification.style.transition = 'all 0.3s ease';
      
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Attach celebration to form
   */
  function attachToForm(formSelector, options = {}) {
    const forms = document.querySelectorAll(formSelector);
    
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        // Let the form submit normally, then celebrate
        const originalSubmit = form.onsubmit;
        
        // Store button for animation
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        if (submitBtn) {
          // Button animation
          submitBtn.style.transform = 'scale(0.95)';
          createSparkles(submitBtn, 12);
          createRing(
            submitBtn.getBoundingClientRect().left + submitBtn.offsetWidth / 2,
            submitBtn.getBoundingClientRect().top + submitBtn.offsetHeight / 2
          );
        }
        
        // Show success after brief delay (simulate processing)
        setTimeout(() => {
          showSuccess({
            type: options.type || 'success',
            title: options.title || 'Thank You!',
            message: options.message || 'Your submission has been received successfully.',
            onClose: () => {
              if (options.resetForm !== false) form.reset();
              if (submitBtn) submitBtn.style.transform = '';
            }
          });
        }, 500);
      });
    });
  }

  /**
   * Celebrate button click with mini burst
   */
  function celebrateButtonClick(button, options = {}) {
    const rect = button.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    createSparkles(button, options.sparkleCount || 8);
    
    celebrate({
      particleCount: options.particleCount || 25,
      spread: 80,
      x,
      y,
      colors: options.colors || PALETTES.success
    });
    
    createRing(rect.left + rect.width / 2, rect.top + rect.height / 2, options.ringColor);
  }

  /**
   * Celebrate milestone (bigger celebration)
   */
  function celebrateMilestone(options = {}) {
    const { title = 'Milestone Reached!', message } = options;
    
    // Multiple confetti bursts
    const bursts = [
      { origin: { x: 0.2, y: 0.7 } },
      { origin: { x: 0.5, y: 0.8 } },
      { origin: { x: 0.8, y: 0.7 } }
    ];
    
    bursts.forEach((burst, i) => {
      setTimeout(() => {
        celebrate({
          particleCount: 60,
          spread: 100,
          ...burst,
          colors: PALETTES.milestone
        });
      }, i * 200);
    });
    
    // Show notification
    setTimeout(() => {
      showSuccess({
        title,
        message: message || 'You\'ve reached an important milestone!',
        type: 'milestone'
      });
    }, 300);
  }

  // Initialize - attach to common forms
  function init() {
    // Contact forms
    attachToForm('form[action*="contact"], .contact-form, #contact-form', {
      type: 'contact',
      title: 'Message Sent!',
      message: 'Thank you for reaching out. We\'ll get back to you within 24 hours.'
    });
    
    // Newsletter forms
    attachToForm('form.newsletter-form, .newsletter-signup', {
      type: 'subscribe',
      title: 'You\'re Subscribed!',
      message: 'Welcome to the BuildBridge newsletter. Check your inbox for a welcome email.'
    });
    
    // Booking forms
    attachToForm('form.booking-form, .consultation-form', {
      type: 'booking',
      title: 'Booking Confirmed!',
      message: 'Your consultation has been scheduled. We\'ll send you a calendar invite shortly.'
    });
    
    // Generic forms with data-celebrate attribute
    attachToForm('form[data-celebrate="true"]');
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.CelebrationSystem = {
    celebrate,
    showSuccess,
    showFloatingSuccess,
    celebrateButtonClick,
    celebrateMilestone,
    attachToForm,
    createSparkles,
    palettes: PALETTES
  };

})();
