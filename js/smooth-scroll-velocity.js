/**
 * Smooth Scroll with Velocity Effects - v81.2
 * Fortune 500 style smooth scrolling with velocity-based animations
 */

(function() {
  'use strict';

  class SmoothScrollVelocity {
    constructor(options = {}) {
      this.options = {
        smoothness: options.smoothness || 1.2,
        wheelMultiplier: options.wheelMultiplier || 1,
        touchMultiplier: options.touchMultiplier || 2,
        infinite: options.infinite || false,
        enableSkew: options.enableSkew !== false,
        enableParallax: options.enableParallax !== false,
        skewMax: options.skewMax || 2, // degrees
        parallaxElements: options.parallaxElements || '[data-parallax]',
        ...options
      };

      this.lenis = null;
      this.rafId = null;
      this.velocity = 0;
      this.direction = 0;
      this.scrollY = 0;
      this.isScrolling = false;
      this.scrollTimeout = null;

      this.init();
    }

    init() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('smooth-scroll');
        return;
      }

      this.setupLenis();
      this.setupVelocityEffects();
      this.setupScrollProgress();
      this.setupBackToTop();
      this.setupSectionHighlights();
    }

    setupLenis() {
      // Load Lenis from CDN if not already loaded
      if (typeof Lenis === 'undefined') {
        this.loadLenis().then(() => this.initializeLenis());
      } else {
        this.initializeLenis();
      }
    }

    loadLenis() {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    initializeLenis() {
      document.documentElement.classList.add('smooth-scroll-lenis');

      this.lenis = new Lenis({
        duration: this.options.smoothness,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: this.options.wheelMultiplier,
        touchMultiplier: this.options.touchMultiplier,
        infinite: this.options.infinite,
      });

      // Track velocity and direction
      this.lenis.on('scroll', (e) => {
        this.velocity = e.velocity;
        this.direction = e.direction;
        this.scrollY = e.scroll;
        
        this.onScroll(e);
      });

      // Start animation loop
      this.rafId = requestAnimationFrame(this.raf.bind(this));

      // Handle anchor links
      this.setupAnchorLinks();
    }

    raf(time) {
      if (this.lenis) {
        this.lenis.raf(time);
      }
      requestAnimationFrame(this.raf.bind(this));
    }

    onScroll(e) {
      // Track scrolling state
      this.isScrolling = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        document.body.classList.remove('scrolling-fast');
      }, 150);

      // Fast scroll detection
      if (Math.abs(this.velocity) > 2) {
        document.body.classList.add('scrolling-fast');
      }

      // Apply velocity-based skew
      if (this.options.enableSkew) {
        this.applyVelocitySkew();
      }

      // Update parallax
      if (this.options.enableParallax) {
        this.updateParallax();
      }

      // Update progress
      this.updateProgress();

      // Update momentum indicators
      this.updateMomentumIndicators(e.direction);

      // Back to top visibility
      this.updateBackToTop();

      // Fire custom event
      window.dispatchEvent(new CustomEvent('scrollVelocity', {
        detail: {
          velocity: this.velocity,
          direction: this.direction,
          scrollY: this.scrollY
        }
      }));
    }

    applyVelocitySkew() {
      const skewAmount = Math.min(
        Math.max(this.velocity * 0.1, -this.options.skewMax),
        this.options.skewMax
      );

      const elements = document.querySelectorAll('.velocity-skew, [data-velocity-skew]');
      elements.forEach(el => {
        el.style.transform = `skewY(${skewAmount}deg)`;
      });

      // Scale effects based on velocity
      const scaleElements = document.querySelectorAll('[data-velocity-scale]');
      scaleElements.forEach(el => {
        const baseScale = 1;
        const scaleAmount = Math.abs(this.velocity) * 0.01;
        const scale = this.velocity > 0 ? baseScale - scaleAmount : baseScale + scaleAmount;
        el.style.transform = `scale(${Math.max(0.95, Math.min(1.05, scale))})`;
      });
    }

    updateParallax() {
      const elements = document.querySelectorAll(this.options.parallaxElements);
      
      elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = centerY - viewportCenter;
        const translateY = distance * speed * -0.1;
        
        el.style.transform = `translateY(${translateY}px)`;
      });
    }

    updateProgress() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (this.scrollY / docHeight) * 100;
      
      // Update reading progress bar
      const progressBar = document.querySelector('.scroll-progress-velocity, .reading-progress');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        // Add velocity-based stretch
        const stretch = Math.abs(this.velocity) * 2;
        progressBar.style.transform = `scaleX(${1 + stretch * 0.01})`;
      }

      // Update velocity indicator
      const velocityInd = document.querySelector('.scroll-velocity-bar');
      if (velocityInd) {
        const velocityPercent = Math.min(Math.abs(this.velocity) * 10, 100);
        velocityInd.style.width = `${velocityPercent}%`;
      }
    }

    updateMomentumIndicators(direction) {
      // Update section indicators based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const dots = document.querySelectorAll('.momentum-dot');
      
      sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const isActive = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
        
        if (dots[i]) {
          dots[i].classList.toggle('active', isActive);
          dots[i].classList.toggle('velocity-high', Math.abs(this.velocity) > 1.5);
        }
      });

      // Direction indicators
      const upInd = document.querySelector('.scroll-direction-up');
      const downInd = document.querySelector('.scroll-direction-down');
      
      if (upInd) {
        upInd.classList.toggle('visible', direction === -1 && Math.abs(this.velocity) > 0.5);
      }
      if (downInd) {
        downInd.classList.toggle('visible', direction === 1 && Math.abs(this.velocity) > 0.5);
      }
    }

    setupAnchorLinks() {
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          if (targetId === '#') return;
          
          const target = document.querySelector(targetId);
          if (target && this.lenis) {
            e.preventDefault();
            this.lenis.scrollTo(target, {
              offset: -80,
              duration: 1.5,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          }
        });
      });
    }

    setupVelocityEffects() {
      // Create velocity indicator
      if (!document.querySelector('.scroll-velocity-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-velocity-indicator';
        indicator.innerHTML = '<div class="scroll-velocity-bar"></div>';
        document.body.appendChild(indicator);

        // Show on scroll
        let scrollStarted = false;
        window.addEventListener('scroll', () => {
          if (!scrollStarted) {
            scrollStarted = true;
            indicator.classList.add('visible');
          }
        }, { passive: true });
      }

      // Create momentum indicators
      if (!document.querySelector('.momentum-indicator')) {
        const sections = document.querySelectorAll('section[id]');
        if (sections.length > 0) {
          const container = document.createElement('div');
          container.className = 'momentum-indicator';
          
          sections.forEach(() => {
            const dot = document.createElement('div');
            dot.className = 'momentum-dot';
            container.appendChild(dot);
          });
          
          document.body.appendChild(container);
        }
      }
    }

    setupScrollProgress() {
      if (!document.querySelector('.scroll-progress-velocity')) {
        const progress = document.createElement('div');
        progress.className = 'scroll-progress-velocity';
        document.body.appendChild(progress);
      }
    }

    setupBackToTop() {
      if (!document.querySelector('.back-to-top-velocity')) {
        const btn = document.createElement('button');
        btn.className = 'back-to-top-velocity';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Back to top');
        
        btn.addEventListener('click', () => {
          if (this.lenis) {
            this.lenis.scrollTo(0, { duration: 2 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          btn.classList.add('scrolling');
          setTimeout(() => btn.classList.remove('scrolling'), 2000);
        });
        
        document.body.appendChild(btn);
        this.backToTopBtn = btn;
      }
    }

    updateBackToTop() {
      if (this.backToTopBtn) {
        const show = this.scrollY > window.innerHeight * 0.5;
        this.backToTopBtn.classList.toggle('visible', show);
      }
    }

    setupSectionHighlights() {
      // Reveal sections on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      });

      document.querySelectorAll('[data-reveal="velocity"]').forEach(el => {
        observer.observe(el);
      });
    }

    // Public API
    scrollTo(target, options = {}) {
      if (this.lenis) {
        this.lenis.scrollTo(target, options);
      } else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    stop() {
      if (this.lenis) {
        this.lenis.stop();
      }
    }

    start() {
      if (this.lenis) {
        this.lenis.start();
      }
    }

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      if (this.lenis) {
        this.lenis.destroy();
      }
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smoothScroll = new SmoothScrollVelocity();
    });
  } else {
    window.smoothScroll = new SmoothScrollVelocity();
  }
})();
