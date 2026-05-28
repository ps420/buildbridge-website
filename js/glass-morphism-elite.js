/**
 * v50.0: Glass Morphism Elite System
 * Advanced glass effects with spotlight and interactions
 */

class GlassEliteSystem {
  constructor() {
    this.cards = document.querySelectorAll('.glass-spotlight');
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }

  init() {
    if (this.isTouch) return;
    
    this.cards.forEach(card => {
      this.createSpotlight(card);
      this.bindEvents(card);
    });
  }

  createSpotlight(card) {
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    card.appendChild(spotlight);
  }

  bindEvents(card) {
    const spotlight = card.querySelector('.spotlight');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;
    });

    card.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });

    card.addEventListener('mouseenter', () => {
      spotlight.style.opacity = '1';
    });
  }
}

/**
 * Glass Card Tilt Effect
 * 3D tilt on hover with glare
 */
class GlassTiltEffect {
  constructor() {
    this.cards = document.querySelectorAll('.glass-card-elite[data-tilt]');
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }

  init() {
    if (this.isTouch) return;
    
    this.cards.forEach(card => {
      this.bindTiltEvents(card);
    });
  }

  bindTiltEvents(card) {
    const maxTilt = parseFloat(card.dataset.tilt) || 15;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      
      // Update glare position
      const glare = card.querySelector('.glare');
      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  }
}

/**
 * Glass Floating Animation Controller
 * Controls floating glass elements
 */
class GlassFloatController {
  constructor() {
    this.elements = document.querySelectorAll('.glass-float');
    this.init();
  }

  init() {
    this.elements.forEach((el, index) => {
      // Add staggered delays
      el.style.animationDelay = `${index * -1.5}s`;
      
      // Add scroll-based parallax
      this.bindScrollParallax(el, index);
    });
  }

  bindScrollParallax(el, index) {
    const speed = 0.05 + (index * 0.02);
    
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const yPos = scrolled * speed;
      el.style.transform = `translateY(${yPos}px)`;
    }, { passive: true });
  }
}

/**
 * Glass Grid Animation
 * Staggered reveal for glass card grids
 */
class GlassGridAnimation {
  constructor() {
    this.grids = document.querySelectorAll('.glass-grid');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateGrid(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    this.grids.forEach(grid => observer.observe(grid));
  }

  animateGrid(grid) {
    const cards = grid.querySelectorAll('.glass-card-elite');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GlassEliteSystem();
  new GlassTiltEffect();
  new GlassFloatController();
  new GlassGridAnimation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlassEliteSystem, GlassTiltEffect, GlassFloatController, GlassGridAnimation };
}
