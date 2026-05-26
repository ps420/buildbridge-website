/**
 * BuildBridge Interactive Ripple Effects v13.0
 * Fortune 500-grade click feedback system
 */

class RippleSystem {
  constructor(options = {}) {
    this.options = {
      selector: '[data-ripple], .btn, .service-card, .project-card, .nav-links a, .faq-question, .timeline-node',
      color: 'light',
      duration: 600,
      maxRipples: 3,
      center: false,
      unbounded: false,
      ...options
    };

    this.rippleCount = new Map();
    this.touchStarted = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
    console.log('💫 Ripple System activated');
  }

  bindEvents() {
    // Mouse events
    document.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));
    
    // Touch events
    document.addEventListener('touchstart', (e) => {
      this.touchStarted = true;
      this.handleStart(e);
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      this.handleEnd(e);
      this.touchStarted = false;
    });

    // Keyboard events for accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = document.activeElement;
        if (target && target.matches(this.options.selector)) {
          this.createRipple(target, null, true);
        }
      }
    });
  }

  handleStart(e) {
    const target = e.target.closest(this.options.selector);
    if (!target) return;

    // Don't create ripple if disabled
    if (target.disabled || target.dataset.rippleDisabled) return;

    // Get coordinates
    let clientX, clientY;
    if (e.type.startsWith('touch')) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    this.createRipple(target, { clientX, clientY });
  }

  handleEnd(e) {
    // Optional: Add hold-specific behavior
  }

  createRipple(element, coords, keyboard = false) {
    // Check ripple limit
    const currentCount = this.rippleCount.get(element) || 0;
    if (currentCount >= this.options.maxRipples) return;

    this.rippleCount.set(element, currentCount + 1);

    // Get ripple color
    const color = element.dataset.rippleColor || this.options.color;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = `ripple ripple-${color}`;
    
    // Calculate size and position
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    let x, y;
    
    if (keyboard || this.options.center) {
      // Centered ripple
      x = rect.width / 2 - size / 2;
      y = rect.height / 2 - size / 2;
    } else if (coords) {
      // Positioned ripple from click
      x = coords.clientX - rect.left - size / 2;
      y = coords.clientY - rect.top - size / 2;
    } else {
      // Default center
      x = rect.width / 2 - size / 2;
      y = rect.height / 2 - size / 2;
    }

    // Apply styles
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    // Ensure element has relative positioning
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';

    // Add ripple
    element.appendChild(ripple);

    // Handle animation end
    const onAnimationEnd = () => {
      ripple.remove();
      const count = this.rippleCount.get(element) || 0;
      this.rippleCount.set(element, Math.max(0, count - 1));
    };

    ripple.addEventListener('animationend', onAnimationEnd);
    
    // Fallback removal
    setTimeout(onAnimationEnd, this.options.duration + 100);

    // Add press effect
    this.addPressEffect(element);
  }

  addPressEffect(element) {
    // Add temporary press class
    element.classList.add('ripple-pressing');
    
    // Scale effect
    const originalTransform = element.style.transform;
    element.style.transform = `${originalTransform} scale(0.98)`;
    element.style.transition = 'transform 0.1s ease';

    // Remove effect after animation
    setTimeout(() => {
      element.style.transform = originalTransform;
      element.classList.remove('ripple-pressing');
    }, 150);
  }

  // Create hold ripple for long press
  createHoldRipple(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple ripple-hold';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${rect.width / 2 - size / 2}px;
      top: ${rect.height / 2 - size / 2}px;
    `;

    element.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // Double ripple effect
  createDoubleRipple(element, coords) {
    this.createRipple(element, coords);
    setTimeout(() => this.createRipple(element, coords), 200);
  }

  // Pulse animation for notifications
  createPulse(element, color = 'chrome') {
    const ripple = document.createElement('span');
    ripple.className = `ripple ripple-pulse ripple-${color}`;
    
    const rect = element.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${rect.width / 2 - size / 2}px;
      top: ${rect.height / 2 - size / 2}px;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    return {
      stop: () => {
        ripple.remove();
      }
    };
  }

  // Add ripple to dynamically created elements
  addToElement(element, options = {}) {
    element.addEventListener('mousedown', (e) => {
      this.createRipple(element, { clientX: e.clientX, clientY: e.clientY });
    });
    
    element.addEventListener('touchstart', (e) => {
      this.createRipple(element, { 
        clientX: e.touches[0].clientX, 
        clientY: e.touches[0].clientY 
      });
    }, { passive: true });
  }

  // Remove all ripples from an element
  clearElement(element) {
    element.querySelectorAll('.ripple').forEach(ripple => ripple.remove());
    this.rippleCount.set(element, 0);
  }

  // Global disable/enable
  disable() {
    document.body.classList.add('ripples-disabled');
  }

  enable() {
    document.body.classList.remove('ripples-disabled');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.rippleSystem = new RippleSystem();
});

// Expose to global
window.RippleSystem = RippleSystem;
