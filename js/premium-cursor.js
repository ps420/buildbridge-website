/**
 * BuildBridge Premium Cursor System v13.0
 * Fortune 500-grade custom cursor with magnetic effects
 */

class PremiumCursor {
  constructor(options = {}) {
    this.options = {
      magneticStrength: 0.3,
      smoothness: 0.15,
      trailEnabled: true,
      trailLength: 5,
      magneticElements: '[data-magnetic], .btn, .nav-links a, .service-card, .project-card',
      hoverElements: 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]',
      textElements: 'input[type="text"], input[type="email"], textarea, [contenteditable]',
      ...options
    };

    this.cursor = null;
    this.dot = null;
    this.ring = null;
    this.label = null;
    this.trail = null;
    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.ringPos = { x: 0, y: 0 };
    this.isActive = false;
    this.isHovering = false;
    this.magneticEl = null;
    this.rafId = null;
    this.trailDots = [];

    // Check if touch device
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    if (!this.isTouch) {
      this.init();
    }
  }

  init() {
    this.createCursor();
    this.createTrail();
    this.bindEvents();
    this.animate();
    
    // Add class to html
    document.documentElement.classList.add('premium-cursor-enabled');
    
    console.log('✨ Premium Cursor System activated');
  }

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'premium-cursor';
    this.cursor.innerHTML = `
      <div class="cursor-glow"></div>
      <div class="cursor-ring">
        <span class="cursor-label">View</span>
      </div>
      <div class="cursor-dot"></div>
    `;
    
    document.body.appendChild(this.cursor);
    
    this.dot = this.cursor.querySelector('.cursor-dot');
    this.ring = this.cursor.querySelector('.cursor-ring');
    this.label = this.cursor.querySelector('.cursor-label');
  }

  createTrail() {
    if (!this.options.trailEnabled) return;
    
    this.trail = document.createElement('div');
    this.trail.className = 'cursor-trail';
    document.body.appendChild(this.trail);
  }

  bindEvents() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      
      if (!this.isActive) {
        this.isActive = true;
        this.cursor.style.opacity = '1';
      }
      
      // Add trail dot
      if (this.options.trailEnabled && this.trailDots.length < this.options.trailLength) {
        this.addTrailDot(e.clientX, e.clientY);
      }
    }, { passive: true });

    // Mouse leave
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.isActive = false;
    });

    // Mouse enter
    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.isActive = true;
    });

    // Hover elements
    document.querySelectorAll(this.options.hoverElements).forEach(el => {
      el.addEventListener('mouseenter', () => this.setHoverState(el));
      el.addEventListener('mouseleave', () => this.removeHoverState());
    });

    // Text elements
    document.querySelectorAll(this.options.textElements).forEach(el => {
      el.addEventListener('mouseenter', () => this.setTextState());
      el.addEventListener('mouseleave', () => this.removeTextState());
    });

    // Magnetic elements
    document.querySelectorAll(this.options.magneticElements).forEach(el => {
      el.addEventListener('mouseenter', (e) => this.setMagneticState(e, el));
      el.addEventListener('mouseleave', () => this.removeMagneticState(el));
      el.addEventListener('mousemove', (e) => this.handleMagneticMove(e, el));
    });

    // Click state
    document.addEventListener('mousedown', () => this.setClickState());
    document.addEventListener('mouseup', () => this.removeClickState());

    // Dynamic content observer
    this.observeDynamicContent();
  }

  observeDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if added node matches selectors
            if (node.matches && node.matches(this.options.hoverElements)) {
              node.addEventListener('mouseenter', () => this.setHoverState(node));
              node.addEventListener('mouseleave', () => this.removeHoverState());
            }
            if (node.matches && node.matches(this.options.magneticElements)) {
              node.addEventListener('mouseenter', (e) => this.setMagneticState(e, node));
              node.addEventListener('mouseleave', () => this.removeMagneticState(node));
              node.addEventListener('mousemove', (e) => this.handleMagneticMove(e, node));
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  animate() {
    // Smooth cursor following
    this.pos.x += (this.target.x - this.pos.x) * this.options.smoothness;
    this.pos.y += (this.target.y - this.pos.y) * this.options.smoothness;

    // Ring follows with more lag
    this.ringPos.x += (this.target.x - this.ringPos.x) * (this.options.smoothness * 0.5);
    this.ringPos.y += (this.target.y - this.ringPos.y) * (this.options.smoothness * 0.5);

    // Apply transforms
    if (this.dot) {
      this.dot.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;
    }
    if (this.ring) {
      this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  setHoverState(el) {
    this.isHovering = true;
    this.cursor.classList.add('cursor--hover');
    
    // Update label if data attribute exists
    const label = el.dataset.cursorLabel || el.getAttribute('aria-label');
    if (label && this.label) {
      this.label.textContent = label;
    }
  }

  removeHoverState() {
    this.isHovering = false;
    this.cursor.classList.remove('cursor--hover');
  }

  setTextState() {
    this.cursor.classList.add('cursor--text');
  }

  removeTextState() {
    this.cursor.classList.remove('cursor--text');
  }

  setMagneticState(e, el) {
    this.magneticEl = el;
    this.cursor.classList.add('cursor--magnetic');
  }

  removeMagneticState(el) {
    this.magneticEl = null;
    this.cursor.classList.remove('cursor--magnetic');
    if (el) {
      el.style.transform = '';
    }
  }

  handleMagneticMove(e, el) {
    if (!this.magneticEl) return;
    
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * this.options.magneticStrength;
    const deltaY = (e.clientY - centerY) * this.options.magneticStrength;
    
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    // Update cursor label
    const label = el.dataset.cursorLabel || 'View';
    if (this.label) {
      this.label.textContent = label;
    }
  }

  setClickState() {
    this.cursor.classList.add('cursor--click');
  }

  removeClickState() {
    this.cursor.classList.remove('cursor--click');
  }

  addTrailDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    
    this.trail.appendChild(dot);
    this.trailDots.push(dot);
    
    // Remove after animation
    setTimeout(() => {
      dot.remove();
      this.trailDots = this.trailDots.filter(d => d !== dot);
    }, 500);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.cursor) {
      this.cursor.remove();
    }
    if (this.trail) {
      this.trail.remove();
    }
    document.documentElement.classList.remove('premium-cursor-enabled');
  }

  // Public API
  setLabel(text) {
    if (this.label) {
      this.label.textContent = text;
    }
  }

  addMagneticElement(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', (e) => this.setMagneticState(e, el));
      el.addEventListener('mouseleave', () => this.removeMagneticState(el));
      el.addEventListener('mousemove', (e) => this.handleMagneticMove(e, el));
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.premiumCursor = new PremiumCursor();
});

// Expose to global scope
window.PremiumCursor = PremiumCursor;
