/**
 * Scroll Velocity Typography System
 * v95.0: Fortune 500 Scroll-Driven Text Effects
 * Applies dynamic transformations based on scroll velocity
 */

class ScrollVelocityTypography {
  constructor() {
    this.velocity = 0;
    this.lastScrollY = window.scrollY;
    this.lastTime = performance.now();
    this.smoothVelocity = 0;
    this.velocityThreshold = 50;
    this.fastThreshold = 200;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.elements = {
      velocityText: [],
      heroText: [],
      sectionHeaders: [],
      kineticText: [],
      parallaxLayers: []
    };
    
    this.init();
  }
  
  init() {
    this.cacheElements();
    this.bindEvents();
    this.animate();
    
    console.log('✨ ScrollVelocityTypography initialized');
  }
  
  cacheElements() {
    this.elements.velocityText = document.querySelectorAll('.velocity-text');
    this.elements.heroText = document.querySelectorAll('.hero-velocity-text');
    this.elements.sectionHeaders = document.querySelectorAll('.section-velocity-header');
    this.elements.kineticText = document.querySelectorAll('.kinetic-velocity-text');
    this.elements.parallaxLayers = document.querySelectorAll('.velocity-parallax-layer');
    
    // Setup character splitting for velocity effects
    this.elements.velocityText.forEach(el => {
      if (!el.dataset.velocityInitialized) {
        this.splitIntoChars(el);
        el.dataset.velocityInitialized = 'true';
      }
    });
  }
  
  splitIntoChars(element) {
    const text = element.textContent;
    element.innerHTML = text.split('').map((char, i) => 
      `<span class="velocity-char" style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
  }
  
  bindEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
      
      if (!ticking) {
        requestAnimationFrame(() => {
          this.calculateVelocity();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Recalculate on resize
    window.addEventListener('resize', () => {
      this.cacheElements();
    });
  }
  
  calculateVelocity() {
    const currentScrollY = window.scrollY;
    const currentTime = performance.now();
    const deltaY = currentScrollY - this.lastScrollY;
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      // Calculate instant velocity (pixels per second)
      const instantVelocity = (deltaY / deltaTime) * 1000;
      
      // Smooth the velocity
      this.smoothVelocity += (instantVelocity - this.smoothVelocity) * 0.1;
      this.velocity = this.smoothVelocity;
    }
    
    this.lastScrollY = currentScrollY;
    this.lastTime = currentTime;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('velocityChange', {
      detail: {
        velocity: this.velocity,
        direction: this.velocity > 0 ? 'down' : 'up',
        isFast: Math.abs(this.velocity) > this.fastThreshold,
        isScrolling: this.isScrolling
      }
    }));
  }
  
  animate() {
    this.updateElements();
    requestAnimationFrame(() => this.animate());
  }
  
  updateElements() {
    const absVelocity = Math.abs(this.velocity);
    const direction = this.velocity > 0 ? 'down' : 'up';
    const isFast = absVelocity > this.fastThreshold;
    const isMedium = absVelocity > this.velocityThreshold;
    
    // Set CSS custom property for global velocity access
    document.documentElement.style.setProperty('--scroll-velocity', this.velocity);
    
    // Update velocity text
    this.elements.velocityText.forEach(el => {
      el.classList.remove('scrolling-up', 'scrolling-down', 'scrolling-fast', 'scrolling-slow');
      
      if (absVelocity > 10) {
        el.classList.add(`scrolling-${direction}`);
        el.classList.add(isFast ? 'scrolling-fast' : 'scrolling-slow');
      }
    });
    
    // Update hero text
    this.elements.heroText.forEach(el => {
      el.classList.remove('velocity-high', 'velocity-medium', 'velocity-low');
      
      if (isFast) {
        el.classList.add('velocity-high');
      } else if (isMedium) {
        el.classList.add('velocity-medium');
      } else {
        el.classList.add('velocity-low');
      }
    });
    
    // Update section headers
    this.elements.sectionHeaders.forEach(el => {
      el.classList.toggle('scrolling', this.isScrolling);
    });
    
    // Update kinetic text
    this.elements.kineticText.forEach(el => {
      el.classList.toggle('scrolling', absVelocity > 20);
    });
    
    // Update parallax layers
    this.elements.parallaxLayers.forEach((el, index) => {
      const multiplier = (index + 1) * 0.1;
      el.style.transform = `translateY(${this.velocity * multiplier}px)`;
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollVelocityTypography = new ScrollVelocityTypography();
  });
} else {
  window.scrollVelocityTypography = new ScrollVelocityTypography();
}
