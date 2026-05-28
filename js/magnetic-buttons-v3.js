/**
 * v50.0: Magnetic Buttons v3
 * Next-gen magnetic interactions with ripple effects
 */

class MagneticButtonV3 {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      strength: options.strength || 0.3,
      ease: options.ease || 0.15,
      maxDistance: options.maxDistance || 100,
      ...options
    };
    
    this.position = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.isHovering = false;
    this.rafId = null;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }

  init() {
    if (this.isTouch) {
      // Simpler effect for touch devices
      this.bindTouchEvents();
      return;
    }
    
    this.createRippleContainer();
    this.bindEvents();
    this.animate();
  }

  createRippleContainer() {
    // Ensure position relative for ripple positioning
    const style = window.getComputedStyle(this.element);
    if (style.position === 'static') {
      this.element.style.position = 'relative';
    }
  }

  bindEvents() {
    // Magnetic effect on mouse move
    this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.element.addEventListener('mouseenter', () => this.handleMouseEnter());
    
    // Ripple on click
    this.element.addEventListener('click', (e) => this.createRipple(e));
  }

  bindTouchEvents() {
    this.element.addEventListener('touchstart', (e) => {
      this.createRipple(e.touches[0]);
    }, { passive: true });
  }

  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Calculate magnetic pull
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const magnetism = Math.max(0, 1 - distance / this.options.maxDistance);
    
    this.target.x = deltaX * this.options.strength * magnetism;
    this.target.y = deltaY * this.options.strength * magnetism;
  }

  handleMouseLeave() {
    this.isHovering = false;
    this.target.x = 0;
    this.target.y = 0;
  }

  handleMouseEnter() {
    this.isHovering = true;
  }

  animate() {
    // Smooth interpolation
    this.position.x += (this.target.x - this.position.x) * this.options.ease;
    this.position.y += (this.target.y - this.position.y) * this.options.ease;
    
    // Apply transform
    const content = this.element.querySelector('span') || this.element;
    content.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  createRipple(e) {
    const rect = this.element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const size = Math.max(rect.width, rect.height) * 2;
    const x = (e.clientX || e.pageX) - rect.left - size / 2;
    const y = (e.clientY || e.pageY) - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: magnetic-ripple 0.6s ease-out forwards;
      pointer-events: none;
    `;
    
    this.element.appendChild(ripple);
    
    // Add keyframes if not exists
    if (!document.getElementById('magnetic-ripple-style')) {
      const style = document.createElement('style');
      style.id = 'magnetic-ripple-style';
      style.textContent = `
        @keyframes magnetic-ripple {
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => ripple.remove(), 600);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

/**
 * Magnetic Link Effect
 * Magnetic pull for text links
 */
class MagneticLink {
  constructor(element) {
    this.element = element;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }

  init() {
    if (this.isTouch) return;
    
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      this.element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'translate(0, 0)';
    });
  }
}

/**
 * Magnetic FAB Menu
 * Floating action button with expandable menu
 */
class MagneticFABMenu {
  constructor(element) {
    this.element = element;
    this.fab = element.querySelector('.magnetic-fab');
    this.isOpen = false;
    this.init();
  }

  init() {
    this.fab.addEventListener('click', () => this.toggle());
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target) && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('active', this.isOpen);
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('active');
  }
}

/**
 * Initialize all magnetic elements
 */
function initMagneticButtonsV3() {
  // Magnetic buttons
  document.querySelectorAll('.magnetic-btn-v3').forEach(btn => {
    new MagneticButtonV3(btn, {
      strength: parseFloat(btn.dataset.magneticStrength) || 0.3,
      maxDistance: parseFloat(btn.dataset.magneticDistance) || 100
    });
  });

  // Magnetic links
  document.querySelectorAll('.magnetic-link').forEach(link => {
    new MagneticLink(link);
  });

  // FAB Menus
  document.querySelectorAll('.magnetic-fab-menu').forEach(menu => {
    new MagneticFABMenu(menu);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMagneticButtonsV3);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MagneticButtonV3, MagneticLink, MagneticFABMenu, initMagneticButtonsV3 };
}
