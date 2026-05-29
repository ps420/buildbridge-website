/**
 * V87.0: SCROLL-DRIVEN ANIMATION TIMELINE
 * JavaScript Fallback for Browsers Without Native Support
 * Fortune 500 Quality Scroll-Linked Animations
 */

(function() {
  'use strict';

  // Check for native scroll-timeline support
  const nativeSupport = CSS.supports('animation-timeline', 'scroll()');

  class ScrollDrivenAnimations {
    constructor() {
      this.elements = [];
      this.scrollProgress = 0;
      this.viewportHeight = window.innerHeight;
      
      this.init();
    }

    init() {
      if (nativeSupport) {
        console.log('BuildBridge: Native scroll-timeline supported');
        this.enhanceNativeSupport();
      } else {
        console.log('BuildBridge: Using JS fallback for scroll animations');
        this.initFallback();
      }
    }

    enhanceNativeSupport() {
      // Add native scroll progress bar
      if (!document.querySelector('.scroll-progress-native')) {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-native';
        document.body.appendChild(progressBar);
      }

      // Enhance view-reveal elements with intersection observer for better performance
      const viewElements = document.querySelectorAll(
        '.view-reveal, .view-reveal-left, .view-reveal-right, .view-reveal-scale, .view-reveal-blur'
      );

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('view-visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      });

      viewElements.forEach(el => observer.observe(el));
    }

    initFallback() {
      this.collectElements();
      this.bindEvents();
      this.updateAnimations();
    }

    collectElements() {
      // Scroll-linked progress elements
      this.progressElements = document.querySelectorAll('[data-scroll-progress]');

      // View-reveal elements
      this.viewElements = Array.from(document.querySelectorAll(
        '.view-reveal, .view-reveal-left, .view-reveal-right, .view-reveal-scale, .view-reveal-blur, .view-reveal-clip, .view-reveal-circle'
      )).map(el => ({
        element: el,
        type: this.getRevealType(el),
        triggered: false
      }));

      // Parallax elements
      this.parallaxElements = Array.from(document.querySelectorAll(
        '.parallax-slow, .parallax-fast'
      )).map(el => ({
        element: el,
        speed: el.classList.contains('parallax-slow') ? 0.3 : 0.5
      }));

      // Scroll-rotate elements
      this.rotateElements = document.querySelectorAll('.scroll-rotate');
    }

    getRevealType(el) {
      if (el.classList.contains('view-reveal-left')) return 'left';
      if (el.classList.contains('view-reveal-right')) return 'right';
      if (el.classList.contains('view-reveal-scale')) return 'scale';
      if (el.classList.contains('view-reveal-blur')) return 'blur';
      if (el.classList.contains('view-reveal-clip')) return 'clip';
      if (el.classList.contains('view-reveal-circle')) return 'circle';
      return 'up';
    }

    bindEvents() {
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateAnimations();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', () => {
        this.viewportHeight = window.innerHeight;
        this.updateAnimations();
      }, { passive: true });
    }

    updateAnimations() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - this.viewportHeight;
      this.scrollProgress = Math.min(Math.max(scrollY / docHeight, 0), 1);

      this.updateProgressElements();
      this.updateViewReveals();
      this.updateParallax();
      this.updateRotations();
    }

    updateProgressElements() {
      this.progressElements.forEach(el => {
        const progress = this.scrollProgress * 100;
        el.style.setProperty('--scroll-progress', `${progress}%`);
        
        if (el.tagName === 'PROGRESS') {
          el.value = progress;
        }
      });
    }

    updateViewReveals() {
      this.viewElements.forEach(item => {
        if (item.triggered) return;

        const rect = item.element.getBoundingClientRect();
        const triggerPoint = this.viewportHeight * 0.85;

        if (rect.top < triggerPoint && rect.bottom > 0) {
          item.triggered = true;
          this.animateReveal(item.element, item.type);
        }
      });
    }

    animateReveal(element, type) {
      const animations = {
        up: { opacity: [0, 1], transform: ['translateY(60px)', 'translateY(0)'] },
        left: { opacity: [0, 1], transform: ['translateX(-80px)', 'translateX(0)'] },
        right: { opacity: [0, 1], transform: ['translateX(80px)', 'translateX(0)'] },
        scale: { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] },
        blur: { opacity: [0, 1], filter: ['blur(20px)', 'blur(0)'], transform: ['scale(1.1)', 'scale(1)'] },
        clip: { clipPath: ['polygon(0 0, 0 0, 0 100%, 0 100%)', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'], opacity: [0, 1] },
        circle: { clipPath: ['circle(0% at 50% 50%)', 'circle(100% at 50% 50%)'], opacity: [0, 1] }
      };

      const anim = animations[type] || animations.up;
      
      element.animate(anim, {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });

      element.classList.add('view-visible');
    }

    updateParallax() {
      const scrollY = window.scrollY;

      this.parallaxElements.forEach(item => {
        const yPos = scrollY * item.speed;
        item.element.style.transform = `translateY(${yPos}px)`;
      });
    }

    updateRotations() {
      const rotation = this.scrollProgress * 360;
      
      this.rotateElements.forEach(el => {
        el.style.transform = `rotate(${rotation}deg)`;
      });
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollDrivenAnimations = new ScrollDrivenAnimations();
  });

  // Add staggered delay support
  document.querySelectorAll('.stagger-grid > *, [class*="stagger-"]').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

})();
