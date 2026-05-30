// ========================================
// v125.0: FORTUNE 500 MAGNETIC BUTTON SYSTEM
// Professional Interactive Button Effects
// ========================================

class Fortune500MagneticButton {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!this.element) return;
    
    this.options = {
      strength: 0.3,
      radius: 100,
      ease: 0.15,
      scale: 1.05,
      onClick: null,
      ripple: true,
      shine: true,
      ...options
    };
    
    this.isHovered = false;
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.rafId = null;
    
    // Skip on touch devices
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    // Wrap in magnetic container
    this.wrapElement();
    
    // Add effects
    if (this.options.ripple) this.addRippleEffect();
    if (this.options.shine) this.addShineEffect();
    
    // Bind events
    this.bindEvents();
  }
  
  wrapElement() {
    const parent = this.element.parentNode;
    const wrapper = document.createElement('span');
    wrapper.className = 'magnetic-wrap';
    wrapper.style.display = 'inline-block';
    
    parent.insertBefore(wrapper, this.element);
    wrapper.appendChild(this.element);
    
    this.wrapper = wrapper;
  }
  
  addRippleEffect() {
    this.element.style.position = 'relative';
    this.element.style.overflow = 'hidden';
    
    this.element.addEventListener('click', (e) => this.createRipple(e));
  }
  
  createRipple(e) {
    const rect = this.element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple-effect 0.6s ease-out;
      pointer-events: none;
    `;
    
    this.element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  addShineEffect() {
    const shine = document.createElement('span');
    shine.className = 'shine';
    this.element.appendChild(shine);
  }
  
  bindEvents() {
    if (this.isTouch) {
      // Touch-specific behavior
      this.element.addEventListener('touchstart', () => {
        this.element.style.transform = `scale(${this.options.scale * 0.95})`;
      });
      
      this.element.addEventListener('touchend', () => {
        this.element.style.transform = 'scale(1)';
      });
      
      return;
    }
    
    // Mouse events
    this.wrapper.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.startAnimation();
    });
    
    this.wrapper.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.targetX = 0;
      this.targetY = 0;
    });
    
    this.wrapper.addEventListener('mousemove', (e) => {
      if (!this.isHovered) return;
      
      const rect = this.wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Only apply within radius
      if (distance < this.options.radius) {
        const strength = this.options.strength * (1 - distance / this.options.radius);
        this.targetX = distX * strength;
        this.targetY = distY * strength;
      } else {
        this.targetX = 0;
        this.targetY = 0;
      }
    });
    
    // Click effect
    this.element.addEventListener('mousedown', () => {
      this.element.classList.add('clicking');
    });
    
    this.element.addEventListener('mouseup', () => {
      this.element.classList.remove('clicking');
      if (this.options.onClick) {
        this.options.onClick();
      }
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.classList.remove('clicking');
    });
  }
  
  startAnimation() {
    const animate = () => {
      // Lerp towards target
      this.currentX += (this.targetX - this.currentX) * this.options.ease;
      this.currentY += (this.targetY - this.currentY) * this.options.ease;
      
      // Apply transform
      const scale = this.isHovered ? this.options.scale : 1;
      this.element.style.transform = `
        translate(${this.currentX}px, ${this.currentY}px)
        scale(${scale})
      `;
      
      // Continue animation if moving or hovered
      if (this.isHovered || 
          Math.abs(this.currentX) > 0.01 || 
          Math.abs(this.currentY) > 0.01) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.element.style.transform = '';
        this.rafId = null;
      }
    };
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(animate);
    }
  }
  
  // Set loading state
  setLoading(loading) {
    this.element.classList.toggle('loading', loading);
  }
  
  // Set success state
  setSuccess(duration = 2000) {
    this.element.classList.add('success');
    setTimeout(() => {
      this.element.classList.remove('success');
    }, duration);
  }
  
  // Destroy
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.wrapper.replaceWith(this.element);
  }
}

// ========================================
// Magnetic Link Component
// ========================================
class Fortune500MagneticLink {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!this.element) return;
    
    this.options = {
      strength: 0.2,
      radius: 80,
      ...options
    };
    
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }
  
  init() {
    if (this.isTouch) return;
    
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      this.element.style.transform = `translate(${x * this.options.strength}px, ${y * this.options.strength}px)`;
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = '';
      this.element.style.transition = 'transform 0.3s ease';
      
      setTimeout(() => {
        this.element.style.transition = '';
      }, 300);
    });
  }
}

// ========================================
// Magnetic Social Buttons
// ========================================
class Fortune500MagneticSocial {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    
    if (!this.container) return;
    
    this.buttons = this.container.querySelectorAll('.magnetic-social');
    this.options = {
      repelDistance: 100,
      repelStrength: 20,
      ...options
    };
    
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }
  
  init() {
    if (this.isTouch) return;
    
    this.container.addEventListener('mousemove', (e) => {
      this.buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < this.options.repelDistance) {
          const force = (this.options.repelDistance - distance) / this.options.repelDistance;
          const moveX = -(distX / distance) * this.options.repelStrength * force;
          const moveY = -(distY / distance) * this.options.repelStrength * force;
          
          btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
        } else {
          btn.style.transform = '';
        }
      });
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.buttons.forEach(btn => {
        btn.style.transform = '';
      });
    });
  }
}

// ========================================
// Magnetic Floating Action Button
// ========================================
class Fortune500MagneticFAB {
  constructor(element, options = {}) {
    this.element = typeof element === 'string'
      ? document.querySelector(element)
      : element;
    
    if (!this.element) return;
    
    this.options = {
      menuItems: [],
      ...options
    };
    
    this.isExpanded = false;
    this.init();
  }
  
  init() {
    this.element.addEventListener('click', () => this.toggle());
    
    // Add ripple
    const magneticBtn = new Fortune500MagneticButton(this.element, {
      strength: 0.4,
      scale: 1.1
    });
  }
  
  toggle() {
    this.isExpanded = !this.isExpanded;
    this.element.classList.toggle('expanded', this.isExpanded);
    
    if (this.isExpanded) {
      this.showMenu();
    } else {
      this.hideMenu();
    }
  }
  
  showMenu() {
    // Create menu if not exists
    if (!this.menu) {
      this.menu = document.createElement('div');
      this.menu.className = 'magnetic-fab-menu';
      this.menu.style.cssText = `
        position: fixed;
        bottom: 110px;
        right: 30px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 999;
      `;
      
      this.options.menuItems.forEach((item, i) => {
        const btn = document.createElement('button');
        btn.className = 'magnetic-btn small secondary';
        btn.innerHTML = `<span>${item.icon}</span> ${item.label}`;
        btn.style.cssText = `
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.3s ease ${i * 0.05}s;
        `;
        btn.addEventListener('click', () => {
          item.action();
          this.toggle();
        });
        this.menu.appendChild(btn);
      });
      
      document.body.appendChild(this.menu);
    }
    
    // Show menu items
    setTimeout(() => {
      this.menu.querySelectorAll('button').forEach((btn, i) => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateX(0)';
      });
    }, 10);
  }
  
  hideMenu() {
    if (!this.menu) return;
    
    this.menu.querySelectorAll('button').forEach(btn => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateX(20px)';
    });
  }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all magnetic buttons
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    new Fortune500MagneticButton(btn);
  });
  
  // Initialize magnetic links
  document.querySelectorAll('.magnetic-link').forEach(link => {
    new Fortune500MagneticLink(link);
  });
  
  // Initialize magnetic social buttons
  document.querySelectorAll('.magnetic-social-container').forEach(container => {
    new Fortune500MagneticSocial(container);
  });
  
  // Initialize FABs
  document.querySelectorAll('.magnetic-fab').forEach(fab => {
    const menuItems = JSON.parse(fab.dataset.menu || '[]');
    new Fortune500MagneticFAB(fab, { menuItems });
  });
  
  // Expose globally
  window.Fortune500MagneticButton = Fortune500MagneticButton;
  window.Fortune500MagneticLink = Fortune500MagneticLink;
  window.Fortune500MagneticSocial = Fortune500MagneticSocial;
  window.Fortune500MagneticFAB = Fortune500MagneticFAB;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Fortune500MagneticButton,
    Fortune500MagneticLink,
    Fortune500MagneticSocial,
    Fortune500MagneticFAB
  };
}
