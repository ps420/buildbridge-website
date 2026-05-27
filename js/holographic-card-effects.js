/**
 * HOLOGRAPHIC 3D CARD EFFECTS v35.0
 * Fortune 500 Next-Gen Card Interactions
 */

(function() {
  'use strict';

  // Holographic Card Controller
  const HoloCards = {
    cards: [],
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    
    init() {
      this.findCards();
      this.setupEventListeners();
      this.applyHoloEffects();
      console.log('✨ Holographic Card Effects initialized');
    },
    
    findCards() {
      this.cards = document.querySelectorAll('.holo-card, .tilt-3d, .prism-border, .neon-glow, .glass-reflection');
    },
    
    setupEventListeners() {
      if (this.isTouch) return; // Skip mouse effects on touch devices
      
      this.cards.forEach(card => {
        // Mouse move for tilt and gradient effects
        card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
        card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
        card.addEventListener('mouseenter', () => this.handleMouseEnter(card));
      });
    },
    
    handleMouseMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      // Apply 3D tilt
      if (card.classList.contains('tilt-3d')) {
        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale3d(1.02, 1.02, 1.02)
        `;
      }
      
      // Update gradient angle for holo effects
      if (card.classList.contains('holo-card')) {
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        card.style.setProperty('--angle', `${angle + 90}deg`);
      }
      
      // Update glow position
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      card.style.setProperty('--glow-x', `${glowX}%`);
      card.style.setProperty('--glow-y', `${glowY}%`);
    },
    
    handleMouseLeave(card) {
      // Reset transforms
      if (card.classList.contains('tilt-3d')) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      }
      
      // Reset gradient angle
      card.style.removeProperty('--angle');
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    },
    
    handleMouseEnter(card) {
      // Add initial entrance animation
      card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    },
    
    applyHoloEffects() {
      // Add chromatic aberration on scroll for dramatic effect
      let lastScrollY = 0;
      let ticking = false;
      
      const chromaticCards = document.querySelectorAll('.holo-chromatic');
      
      if (chromaticCards.length && !this.isTouch) {
        window.addEventListener('scroll', () => {
          lastScrollY = window.scrollY;
          
          if (!ticking) {
            requestAnimationFrame(() => {
              const velocity = lastScrollY - (window.scrollY - lastScrollY);
              const intensity = Math.min(Math.abs(velocity) / 500, 1);
              
              chromaticCards.forEach(card => {
                card.style.filter = `blur(${intensity * 2}px)`;
              });
              
              ticking = false;
            });
            ticking = true;
          }
        }, { passive: true });
      }
    }
  };

  // 3D Flip Card Controller
  const FlipCards = {
    init() {
      const flipCards = document.querySelectorAll('.flip-card-3d');
      
      flipCards.forEach(card => {
        // Allow keyboard toggle
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        
        card.addEventListener('click', () => this.toggle(card));
        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle(card);
          }
        });
      });
      
      console.log('🔄 3D Flip Cards initialized');
    },
    
    toggle(card) {
      const isFlipped = card.classList.contains('flipped');
      card.classList.toggle('flipped', !isFlipped);
      card.setAttribute('aria-pressed', !isFlipped);
    }
  };

  // Magnetic Effect Controller
  const MagneticEffect = {
    elements: [],
    strength: 0.3,
    
    init() {
      this.elements = document.querySelectorAll('[data-magnetic]');
      this.setupMagneticEffect();
      console.log('🧲 Magnetic Effects initialized');
    },
    
    setupMagneticEffect() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      
      this.elements.forEach(el => {
        const strength = parseFloat(el.dataset.magnetic) || this.strength;
        
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translate(0, 0)';
          el.style.transition = 'transform 0.3s ease';
        });
        
        el.addEventListener('mouseenter', () => {
          el.style.transition = 'transform 0.1s ease';
        });
      });
    }
  };

  // Layer Stack Effect
  const LayerStackEffect = {
    init() {
      const layers = document.querySelectorAll('.layer-stack');
      
      layers.forEach(layer => {
        layer.addEventListener('mouseenter', () => {
          layer.style.transform = 'translateZ(20px)';
        });
        
        layer.addEventListener('mouseleave', () => {
          layer.style.transform = 'translateZ(0)';
        });
      });
      
      console.log('📚 Layer Stack Effects initialized');
    }
  };

  // Service Cards Enhancement
  const ServiceCardsEnhancement = {
    init() {
      const serviceCards = document.querySelectorAll('.service-card');
      
      serviceCards.forEach((card, index) => {
        // Add holographic classes to existing service cards
        card.classList.add('glass-reflection');
        
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add 3D tilt effect
        if (!window.matchMedia('(pointer: coarse)').matches) {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `
              perspective(1000px)
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
              translateY(-8px)
            `;
            
            // Update gradient position
            card.style.setProperty('--sheen-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--sheen-y', `${(y / rect.height) * 100}%`);
          });
          
          card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.setProperty('--sheen-x', '50%');
            card.style.setProperty('--sheen-y', '50%');
          });
        }
      });
      
      console.log('💎 Service Cards Enhanced with Holographic Effects');
    }
  };

  // Intersection Observer for Reveal Animations
  const RevealObserver = {
    init() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Add holographic glow to revealed cards
            if (entry.target.classList.contains('holo-card')) {
              entry.target.classList.add('holo-reveal');
            }
          }
        });
      }, observerOptions);
      
      // Observe all cards
      document.querySelectorAll('.holo-card, .flip-card-3d, .tilt-3d').forEach(card => {
        observer.observe(card);
      });
      
      console.log('👁️ Reveal Observer initialized');
    }
  };

  // Initialize All Effects
  function init() {
    HoloCards.init();
    FlipCards.init();
    MagneticEffect.init();
    LayerStackEffect.init();
    ServiceCardsEnhancement.init();
    RevealObserver.init();
    
    // Add CSS custom properties for dynamic effects
    document.documentElement.style.setProperty('--card-transition-timing', 'cubic-bezier(0.4, 0, 0.2, 1)');
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.HoloCards = {
    refresh: () => HoloCards.findCards(),
    tilt: HoloCards,
    flip: FlipCards
  };

})();
