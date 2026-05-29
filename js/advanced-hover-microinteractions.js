/* ============================================
   v69.0: ADVANCED HOVER MICRO-INTERACTIONS
   Fortune 500 Quality Hover Effects Controller
   ============================================ */

class AdvancedHoverController {
  constructor(options = {}) {
    this.options = {
      magneticStrength: options.magneticStrength || 0.3,
      magneticRadius: options.magneticRadius || 100,
      tiltMaxAngle: options.tiltMaxAngle || 15,
      enableCursorFollower: options.enableCursorFollower !== false,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.initMagneticElements();
    this.initTiltCards();
    this.initCursorFollower();
    this.initParallaxCards();
    this.initGlowElements();
  }
  
  // ============================================
  // MAGNETIC ELEMENTS
  // ============================================
  initMagneticElements() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || this.options.magneticStrength;
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Also move inner content (button text)
        const content = el.querySelector('.btn-content, .magnetic-content');
        if (content) {
          content.style.transform = `translate(${deltaX * 0.5}px, ${deltaY * 0.5}px)`;
        }
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        const content = el.querySelector('.btn-content, .magnetic-content');
        if (content) {
          content.style.transform = '';
        }
      });
    });
  }
  
  // ============================================
  // TILT CARDS
  // ============================================
  initTiltCards() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
      const maxAngle = parseFloat(card.dataset.tilt) || this.options.tiltMaxAngle;
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -maxAngle;
        const rotateY = ((x - centerX) / centerX) * maxAngle;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update glare position
        const glare = card.querySelector('.glare-effect');
        if (glare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
  
  // ============================================
  // CURSOR FOLLOWER
  // ============================================
  initCursorFollower() {
    if (!this.options.enableCursorFollower) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const containers = document.querySelectorAll('[data-cursor-follow]');
    
    containers.forEach(container => {
      const follower = document.createElement('div');
      follower.className = 'cursor-follower';
      follower.style.cssText = `
        position: absolute;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(201, 206, 214, 0.08) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
        z-index: 0;
      `;
      container.appendChild(follower);
      
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        follower.style.left = `${x}px`;
        follower.style.top = `${y}px`;
        follower.style.opacity = '1';
      });
      
      container.addEventListener('mouseleave', () => {
        follower.style.opacity = '0';
      });
    });
  }
  
  // ============================================
  // PARALLAX CARDS
  // ============================================
  initParallaxCards() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const parallaxCards = document.querySelectorAll('[data-parallax-card]');
    
    parallaxCards.forEach(card => {
      const layers = card.querySelectorAll('[data-parallax-layer]');
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        layers.forEach(layer => {
          const speed = parseFloat(layer.dataset.parallaxLayer) || 1;
          const moveX = x * 30 * speed;
          const moveY = y * 30 * speed;
          
          layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      });
      
      card.addEventListener('mouseleave', () => {
        layers.forEach(layer => {
          layer.style.transform = '';
        });
      });
    });
  }
  
  // ============================================
  // GLOW ELEMENTS
  // ============================================
  initGlowElements() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const glowElements = document.querySelectorAll('[data-glow]');
    
    glowElements.forEach(el => {
      const intensity = el.dataset.glow || 'medium';
      const colors = {
        low: 'rgba(201, 206, 214, 0.1)',
        medium: 'rgba(201, 206, 214, 0.2)',
        high: 'rgba(201, 206, 214, 0.4)'
      };
      
      el.style.position = 'relative';
      
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: linear-gradient(135deg, ${colors[intensity]}, transparent 50%, ${colors[intensity]});
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: -1;
        filter: blur(10px);
      `;
      
      el.appendChild(glow);
      
      el.addEventListener('mouseenter', () => {
        glow.style.opacity = '1';
      });
      
      el.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
      });
    });
  }
}

// ============================================
// HOVER IMAGE ZOOM CONTROLLER
// ============================================
class HoverImageZoom {
  constructor() {
    this.init();
  }
  
  init() {
    const zoomContainers = document.querySelectorAll('[data-hover-zoom]');
    
    zoomContainers.forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;
      
      const zoomLevel = parseFloat(container.dataset.hoverZoom) || 1.1;
      
      container.addEventListener('mouseenter', () => {
        img.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        img.style.transform = `scale(${zoomLevel})`;
      });
      
      container.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
      
      // Pan effect on mousemove
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        
        img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      });
    });
  }
}

// ============================================
// LINK PREVIEW TOOLTIP
// ============================================
class LinkPreviewTooltip {
  constructor(options = {}) {
    this.options = {
      delay: options.delay || 300,
      ...options
    };
    this.tooltip = null;
    this.timeout = null;
    
    this.init();
  }
  
  init() {
    this.createTooltip();
    this.bindEvents();
  }
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'link-preview-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      padding: 12px 16px;
      background: rgba(15, 15, 16, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(201, 206, 214, 0.1);
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      color: #C9CED6;
      pointer-events: none;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(this.tooltip);
  }
  
  bindEvents() {
    document.querySelectorAll('[data-preview]').forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        const previewText = link.dataset.preview;
        this.show(previewText, e);
      });
      
      link.addEventListener('mouseleave', () => {
        this.hide();
      });
      
      link.addEventListener('mousemove', (e) => {
        this.move(e);
      });
    });
  }
  
  show(text, e) {
    clearTimeout(this.timeout);
    
    this.timeout = setTimeout(() => {
      this.tooltip.innerHTML = text;
      this.tooltip.style.opacity = '1';
      this.tooltip.style.transform = 'translateY(0)';
      this.move(e);
    }, this.options.delay);
  }
  
  hide() {
    clearTimeout(this.timeout);
    this.tooltip.style.opacity = '0';
    this.tooltip.style.transform = 'translateY(10px)';
  }
  
  move(e) {
    const x = e.clientX + 15;
    const y = e.clientY + 15;
    
    // Keep within viewport
    const rect = this.tooltip.getBoundingClientRect();
    const finalX = x + rect.width > window.innerWidth ? e.clientX - rect.width - 10 : x;
    const finalY = y + rect.height > window.innerHeight ? e.clientY - rect.height - 10 : y;
    
    this.tooltip.style.left = `${finalX}px`;
    this.tooltip.style.top = `${finalY}px`;
  }
}

// ============================================
// RIPPLE EFFECT
// ============================================
class RippleEffect {
  constructor(options = {}) {
    this.options = {
      color: options.color || 'rgba(255, 255, 255, 0.3)',
      duration: options.duration || 600,
      ...options
    };
    
    this.init();
  }
  
  init() {
    document.querySelectorAll('[data-ripple]').forEach(el => {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      
      el.addEventListener('click', (e) => this.createRipple(e, el));
    });
  }
  
  createRipple(e, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${this.options.color};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-expand ${this.options.duration}ms ease-out;
      pointer-events: none;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), this.options.duration);
  }
}

// Add ripple animation keyframes
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
  @keyframes ripple-expand {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyles);

// ============================================
// STAGGERED HOVER REVEAL
// ============================================
class StaggeredHoverReveal {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('[data-stagger-hover]').forEach(container => {
      const children = container.children;
      const baseDelay = parseInt(container.dataset.staggerHover) || 50;
      
      container.addEventListener('mouseenter', () => {
        Array.from(children).forEach((child, i) => {
          child.style.transitionDelay = `${i * baseDelay}ms`;
          child.classList.add('stagger-revealed');
        });
      });
      
      container.addEventListener('mouseleave', () => {
        Array.from(children).forEach(child => {
          child.style.transitionDelay = '0ms';
          child.classList.remove('stagger-revealed');
        });
      });
    });
  }
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize advanced hover controller
  window.hoverController = new AdvancedHoverController();
  
  // Initialize image zoom
  window.hoverImageZoom = new HoverImageZoom();
  
  // Initialize link preview tooltip
  window.linkPreview = new LinkPreviewTooltip();
  
  // Initialize ripple effect
  window.rippleEffect = new RippleEffect();
  
  // Initialize staggered hover reveal
  window.staggeredReveal = new StaggeredHoverReveal();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdvancedHoverController,
    HoverImageZoom,
    LinkPreviewTooltip,
    RippleEffect,
    StaggeredHoverReveal
  };
}
