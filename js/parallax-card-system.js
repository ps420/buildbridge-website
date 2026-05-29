/**
 * Parallax Card System - v83.0
 * Fortune 500 Scroll-Triggered 3D Cards
 * 
 * Features:
 * - Scroll-triggered reveal animations
 * - 3D tilt on mouse move
 * - Depth parallax layers
 * - Intersection Observer for performance
 * - Mobile touch support
 */

(function() {
  'use strict';

  class ParallaxCardSystem {
    constructor(options = {}) {
      this.options = {
        selector: '.parallax-card',
        sectionSelector: '.parallax-card-section',
        perspective: 1000,
        maxTilt: 15,
        scale: 1.02,
        speed: 400,
        transition: true,
        glare: true,
        maxGlare: 0.3,
        ...options
      };

      this.cards = [];
      this.observer = null;
      this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      this.init();
    }

    init() {
      this.cards = document.querySelectorAll(this.options.selector);
      if (!this.cards.length) return;

      this.setupIntersectionObserver();
      this.setupEventListeners();
      this.setupScrollHandler();
      
      console.log(`🎴 Parallax Card System: Initialized ${this.cards.length} cards`);
    }

    setupIntersectionObserver() {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            this.revealCard(entry.target);
          }
        });
      }, observerOptions);

      this.cards.forEach(card => {
        this.observer.observe(card);
        this.setupCardTilt(card);
      });
    }

    revealCard(card) {
      if (card.classList.contains('revealed')) return;
      
      card.classList.add('revealed');
      
      // Add stagger delay based on index
      const index = Array.from(this.cards).indexOf(card);
      card.style.animationDelay = `${index * 0.15}s`;
      
      // Trigger custom event
      card.dispatchEvent(new CustomEvent('parallaxCardRevealed', {
        detail: { card, index }
      }));
    }

    setupCardTilt(card) {
      if (this.isTouchDevice) return;

      const inner = card.querySelector('.parallax-card-inner');
      if (!inner) return;

      let rafId = null;
      let isHovering = false;

      const handleMouseMove = (e) => {
        if (!isHovering) return;
        
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const mouseX = e.clientX - centerX;
          const mouseY = e.clientY - centerY;
          
          const rotateX = (mouseY / (rect.height / 2)) * -this.options.maxTilt;
          const rotateY = (mouseX / (rect.width / 2)) * this.options.maxTilt;
          
          inner.style.transform = `
            perspective(${this.options.perspective}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
          `;

          // Update glare position
          if (this.options.glare) {
            this.updateGlare(card, mouseX, mouseY, rect.width, rect.height);
          }

          // Parallax internal elements
          this.updateInternalParallax(card, rotateX, rotateY);
        });
      };

      const handleMouseEnter = () => {
        isHovering = true;
        card.classList.add('hovering');
        inner.style.transition = 'transform 0.1s ease-out';
      };

      const handleMouseLeave = () => {
        isHovering = false;
        card.classList.remove('hovering');
        inner.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        
        // Reset internal elements
        this.resetInternalParallax(card);
      };

      card.addEventListener('mouseenter', handleMouseEnter, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      card.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    updateGlare(card, mouseX, mouseY, width, height) {
      const glare = card.querySelector('.parallax-card-shine');
      if (!glare) return;

      const glareX = (mouseX / width + 0.5) * 100;
      const glareY = (mouseY / height + 0.5) * 100;
      
      glare.style.background = `
        radial-gradient(
          circle at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, ${this.options.maxGlare}) 0%,
          rgba(255, 255, 255, 0) 60%
        )
      `;
      glare.style.opacity = '1';
    }

    updateInternalParallax(card, rotateX, rotateY) {
      const content = card.querySelector('.parallax-card-content');
      const title = card.querySelector('.parallax-card-title');
      const category = card.querySelector('.parallax-card-category');
      const floatElements = card.querySelectorAll('.parallax-card-float');

      // Different depths for different elements
      if (content) {
        content.style.transform = `translateZ(30px) translateX(${rotateY * 0.5}px) translateY(${rotateX * 0.5}px)`;
      }
      if (title) {
        title.style.transform = `translateZ(50px) translateX(${rotateY * 0.8}px)`;
      }
      if (category) {
        category.style.transform = `translateZ(40px) translateX(${rotateY * 0.3}px)`;
      }
      
      floatElements.forEach((el, i) => {
        const depth = 60 + (i * 20);
        el.style.transform = `translateZ(${depth}px) translateX(${rotateY * (1 + i * 0.3)}px) translateY(${rotateX * (1 + i * 0.3)}px)`;
      });
    }

    resetInternalParallax(card) {
      const elements = card.querySelectorAll('.parallax-card-content, .parallax-card-title, .parallax-card-category, .parallax-card-float');
      elements.forEach(el => {
        el.style.transform = '';
      });
      
      const glare = card.querySelector('.parallax-card-shine');
      if (glare) {
        glare.style.opacity = '0';
      }
    }

    setupScrollHandler() {
      let ticking = false;
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const scrollDelta = scrollY - lastScrollY;
            
            this.updateParallaxOnScroll(scrollY, scrollDelta);
            
            lastScrollY = scrollY;
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateParallaxOnScroll(scrollY, scrollDelta) {
      this.cards.forEach((card, index) => {
        if (!card.classList.contains('revealed')) return;

        const rect = card.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate progress through viewport (0 to 1)
        const progress = 1 - (rect.top + rect.height) / (viewportHeight + rect.height);
        
        if (progress > 0 && progress < 1) {
          const image = card.querySelector('.parallax-card-image');
          if (image) {
            // Subtle parallax on image
            const parallaxOffset = (progress - 0.5) * 30;
            image.style.transform = `translateZ(-50px) scale(1.2) translateY(${parallaxOffset}px)`;
          }

          // Rotate card slightly based on scroll
          const rotationX = (progress - 0.5) * 5;
          const inner = card.querySelector('.parallax-card-inner');
          if (inner && !card.classList.contains('hovering')) {
            inner.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(0deg)`;
          }
        }
      });
    }

    setupEventListeners() {
      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAnimations();
        } else {
          this.resumeAnimations();
        }
      });

      // Handle resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.handleResize();
        }, 250);
      }, { passive: true });
    }

    pauseAnimations() {
      this.cards.forEach(card => {
        card.style.animationPlayState = 'paused';
      });
    }

    resumeAnimations() {
      this.cards.forEach(card => {
        if (!card.classList.contains('hovering')) {
          card.style.animationPlayState = 'running';
        }
      });
    }

    handleResize() {
      // Recalculate positions on resize
      this.cards.forEach(card => {
        this.resetInternalParallax(card);
      });
    }

    // Public API methods
    revealAll() {
      this.cards.forEach(card => this.revealCard(card));
    }

    hideAll() {
      this.cards.forEach(card => {
        card.classList.remove('revealed');
      });
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
      
      this.cards.forEach(card => {
        const clone = card.cloneNode(true);
        card.parentNode.replaceChild(clone, card);
      });
      
      this.cards = [];
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.parallaxCardSystem = new ParallaxCardSystem();
    });
  } else {
    window.parallaxCardSystem = new ParallaxCardSystem();
  }

  // Expose to global scope
  window.ParallaxCardSystem = ParallaxCardSystem;

})();
