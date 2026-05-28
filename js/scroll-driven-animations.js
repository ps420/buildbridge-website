/**
 * BuildBridge v48.0 - CSS Scroll-Driven Animations System
 * Native @scroll-timeline with JS fallback for legacy browsers
 * 
 * Features:
 * - Progressive enhancement for @scroll-timeline
 * - Intersection Observer fallback
 * - Scroll velocity detection
 * - Smooth reveal animations
 * - Reduced motion support
 */

(function() {
  'use strict';

  class ScrollDrivenAnimations {
    constructor() {
      this.supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');
      this.supportsViewTimeline = CSS.supports('animation-timeline', 'view()');
      this.observers = [];
      this.elements = [];
      this.scrollVelocity = 0;
      this.lastScrollY = window.scrollY;
      this.lastScrollTime = Date.now();
      
      this.init();
    }

    init() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('🎞️ BuildBridge v48.0: Scroll animations disabled (reduced motion preference)');
        return;
      }

      // Add scroll progress bar
      this.addProgressBar();
      
      // Initialize based on browser support
      if (this.supportsScrollTimeline && this.supportsViewTimeline) {
        console.log('🎞️ BuildBridge v48.0: Native CSS @scroll-timeline supported');
        this.initNativeSupport();
      } else {
        console.log('🎞️ BuildBridge v48.0: Using Intersection Observer fallback');
        this.initFallbackSupport();
      }
      
      // Initialize velocity tracking
      this.initVelocityTracking();
      
      // Initialize smooth reveals
      this.initSmoothReveals();
    }

    addProgressBar() {
      // Check if progress bar already exists
      if (document.querySelector('.scroll-progress-line')) return;
      
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-line';
      progressBar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progressBar);
    }

    initNativeSupport() {
      // Add native animation classes to elements
      document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        const type = el.dataset.scrollReveal || 'fade';
        const delay = el.dataset.scrollDelay || '0';
        
        el.classList.add('scroll-native-animate');
        el.style.animationDelay = `${delay}ms`;
        
        switch (type) {
          case 'fade':
            el.classList.add('scroll-fade-in');
            break;
          case 'scale':
            el.classList.add('scroll-scale-up');
            break;
          case 'left':
            el.classList.add('card-scroll-left');
            break;
          case 'right':
            el.classList.add('card-scroll-right');
            break;
          case '3d-flip':
            el.classList.add('scroll-3d-flip');
            break;
          case 'blur':
            el.classList.add('scroll-blur-reveal');
            break;
        }
      });
    }

    initFallbackSupport() {
      // Setup Intersection Observer for browsers without native support
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.scrollDelay) || 0;
            const type = el.dataset.scrollReveal || 'fade';
            
            setTimeout(() => {
              this.animateElement(el, type);
            }, delay);
            
            // Unobserve after animation
            if (!el.dataset.scrollRepeat) {
              observer.unobserve(el);
            }
          }
        });
      }, observerOptions);

      // Observe all scroll-reveal elements
      document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = this.getInitialTransform(el.dataset.scrollReveal);
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
      });

      this.observers.push(observer);
      
      // Parallax fallback
      this.initParallaxFallback();
      
      // Image reveal fallback
      this.initImageRevealFallback();
    }

    getInitialTransform(type) {
      switch (type) {
        case 'fade': return 'translateY(30px)';
        case 'scale': return 'translateY(30px) scale(0.9)';
        case 'left': return 'translateX(-100px)';
        case 'right': return 'translateX(100px)';
        case 'up': return 'translateY(50px)';
        case '3d-flip': return 'perspective(1000px) rotateY(45deg)';
        case 'blur': return 'translateY(20px)';
        default: return 'translateY(30px)';
      }
    }

    animateElement(el, type) {
      el.style.opacity = '1';
      
      switch (type) {
        case 'fade':
        case 'up':
          el.style.transform = 'translateY(0)';
          break;
        case 'scale':
          el.style.transform = 'translateY(0) scale(1)';
          break;
        case 'left':
        case 'right':
          el.style.transform = 'translateX(0)';
          break;
        case '3d-flip':
          el.style.transform = 'perspective(1000px) rotateY(0)';
          break;
        case 'blur':
          el.style.transform = 'translateY(0)';
          el.style.filter = 'blur(0)';
          break;
        default:
          el.style.transform = 'none';
      }
    }

    initParallaxFallback() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      if (parallaxElements.length === 0) return;

      let ticking = false;
      
      const updateParallax = () => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.5;
          const offset = scrollY * speed;
          el.style.transform = `translateY(${offset}px)`;
        });
        
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
    }

    initImageRevealFallback() {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            imageObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll('[data-image-reveal]').forEach(img => {
        img.style.clipPath = 'inset(100% 0 0 0)';
        img.style.transition = 'clip-path 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        
        img.addEventListener('transitionend', () => {
          img.style.clipPath = '';
        });
        
        imageObserver.observe(img);
      });
    }

    initVelocityTracking() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const now = Date.now();
            const deltaY = window.scrollY - this.lastScrollY;
            const deltaTime = now - this.lastScrollTime;
            
            if (deltaTime > 0) {
              this.scrollVelocity = Math.abs(deltaY / deltaTime) * 10;
              this.applyVelocityEffects();
            }
            
            this.lastScrollY = window.scrollY;
            this.lastScrollTime = now;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    applyVelocityEffects() {
      // Apply velocity-based effects to elements with data-velocity attribute
      document.querySelectorAll('[data-velocity]').forEach(el => {
        const maxSkew = parseFloat(el.dataset.velocity) || 2;
        const skew = Math.min(this.scrollVelocity, maxSkew);
        
        el.style.transform = `skewY(${skew}deg)`;
        
        // Reset after scroll stops
        clearTimeout(el.velocityTimeout);
        el.velocityTimeout = setTimeout(() => {
          el.style.transition = 'transform 0.3s ease';
          el.style.transform = 'skewY(0deg)';
          setTimeout(() => {
            el.style.transition = '';
          }, 300);
        }, 100);
      });
    }

    initSmoothReveals() {
      // Elements with .reveal-on-scroll class
      const revealElements = document.querySelectorAll('.reveal-on-scroll:not([data-scroll-reveal])');
      
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

      revealElements.forEach(el => revealObserver.observe(el));
      this.observers.push(revealObserver);
    }

    // Public API for programmatic control
    static refresh() {
      // Re-initialize for dynamically added content
      if (window.buildBridgeScroll) {
        window.buildBridgeScroll.initFallbackSupport();
        window.buildBridgeScroll.initSmoothReveals();
      }
    }

    static reveal(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (element) {
        element.classList.add('revealed');
        element.style.opacity = '1';
        element.style.transform = 'none';
      }
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.buildBridgeScroll = new ScrollDrivenAnimations();
    });
  } else {
    window.buildBridgeScroll = new ScrollDrivenAnimations();
  }

  // Expose to global
  window.ScrollDrivenAnimations = ScrollDrivenAnimations;
})();
