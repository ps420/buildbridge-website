// BuildBridge - Fortune 500 Mouse Spotlight Effect
// Interactive spotlight that follows cursor with premium glow effects
// Version 1.0

class MouseSpotlight {
  constructor(options = {}) {
    this.options = {
      container: document.body,
      color: 'rgba(201, 206, 214, 0.15)',
      size: 300,
      blur: 100,
      edgeMask: true,
      mixBlend: 'screen',
      ...options
    };
    
    this.spotlight = null;
    this.edgeMask = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.animationFrame = null;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    // Only on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.createElements();
    this.bindEvents();
    this.animate();
    this.isActive = true;
    
    // Hide initially and fade in
    setTimeout(() => {
      if (this.spotlight) {
        this.spotlight.style.opacity = '1';
      }
    }, 1000);
  }
  
  createElements() {
    // Main spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'mouse-spotlight';
    this.spotlight.style.cssText = `
      position: fixed;
      width: ${this.options.size}px;
      height: ${this.options.size}px;
      border-radius: 50%;
      background: radial-gradient(circle, ${this.options.color} 0%, transparent 70%);
      pointer-events: none;
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.5s ease;
      mix-blend-mode: ${this.options.mixBlend};
      filter: blur(${this.options.blur}px);
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(this.spotlight);
    
    // Edge mask for vignette effect
    if (this.options.edgeMask) {
      this.edgeMask = document.createElement('div');
      this.edgeMask.className = 'edge-mask';
      this.edgeMask.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9997;
        background: radial-gradient(ellipse at center, transparent 30%, rgba(15, 15, 16, 0.4) 100%);
        opacity: 0;
        transition: opacity 0.5s ease;
      `;
      
      document.body.appendChild(this.edgeMask);
      
      setTimeout(() => {
        this.edgeMask.style.opacity = '1';
      }, 500);
    }
    
    // Add CSS for hover states on interactive elements
    const style = document.createElement('style');
    style.textContent = `
      .mouse-spotlight.hover-intense {
        width: ${this.options.size * 1.5}px !important;
        height: ${this.options.size * 1.5}px !important;
        background: radial-gradient(circle, rgba(201, 206, 214, 0.25) 0%, transparent 70%) !important;
      }
      
      /* Glow effect on hoverable elements */
      a, button, .btn, .service-card, .project-card {
        transition: box-shadow 0.3s ease;
      }
      
      body:has(.mouse-spotlight) a:hover,
      body:has(.mouse-spotlight) button:hover,
      body:has(.mouse-spotlight) .btn:hover {
        box-shadow: 0 0 30px rgba(201, 206, 214, 0.2);
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Mouse move tracking
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    // Add hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .service-card, .project-card, input, textarea');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (this.spotlight) {
          this.spotlight.classList.add('hover-intense');
        }
      });
      
      el.addEventListener('mouseleave', () => {
        if (this.spotlight) {
          this.spotlight.classList.remove('hover-intense');
        }
      });
    });
    
    // Pause on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Smooth interpolation (easing)
    const ease = 0.1;
    this.currentX += (this.mouseX - this.currentX) * ease;
    this.currentY += (this.mouseY - this.currentY) * ease;
    
    if (this.spotlight) {
      this.spotlight.style.left = `${this.currentX}px`;
      this.spotlight.style.top = `${this.currentY}px`;
    }
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  pause() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }
  
  setColor(color) {
    this.options.color = color;
    if (this.spotlight) {
      this.spotlight.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
    }
  }
  
  setSize(size) {
    this.options.size = size;
    if (this.spotlight) {
      this.spotlight.style.width = `${size}px`;
      this.spotlight.style.height = `${size}px`;
    }
  }
  
  destroy() {
    this.pause();
    if (this.spotlight) {
      this.spotlight.remove();
    }
    if (this.edgeMask) {
      this.edgeMask.remove();
    }
  }
}

// Section-specific spotlight variations
class HeroSpotlight extends MouseSpotlight {
  constructor(options = {}) {
    super({
      container: document.querySelector('.hero'),
      color: 'rgba(201, 206, 214, 0.08)',
      size: 400,
      blur: 80,
      edgeMask: true,
      ...options
    });
  }
}

class SectionSpotlight extends MouseSpotlight {
  constructor(selector, options = {}) {
    const container = document.querySelector(selector);
    super({
      container: container,
      color: 'rgba(201, 206, 214, 0.05)',
      size: 250,
      blur: 60,
      edgeMask: false,
      ...options
    });
    
    this.container = container;
    if (container) {
      this.bindContainerEvents();
    }
  }
  
  bindContainerEvents() {
    // Only show spotlight when inside container
    this.container.addEventListener('mouseenter', () => {
      if (this.spotlight) {
        this.spotlight.style.opacity = '1';
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (this.spotlight) {
        this.spotlight.style.opacity = '0';
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Main page spotlight
  window.mainSpotlight = new MouseSpotlight({
    color: 'rgba(201, 206, 214, 0.1)',
    size: 350,
    blur: 90
  });
  
  // Hero-specific spotlight
  const hero = document.querySelector('.hero');
  if (hero) {
    window.heroSpotlight = new HeroSpotlight();
  }
  
  // Section-specific spotlights
  document.querySelectorAll('.section').forEach((section, index) => {
    if (index % 2 === 0) { // Every other section
      new SectionSpotlight(`[data-section="${section.dataset.section}"]`);
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MouseSpotlight, HeroSpotlight, SectionSpotlight };
}
