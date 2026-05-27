/**
 * PRO ANIMATION ENGINE v21.0
 * Fortune 500 Quality Animation System
 * GSAP-like performance with vanilla JS
 */

(function() {
  'use strict';
  
  const ProAnimation = {
    // Configuration
    config: {
      defaultDuration: 0.8,
      defaultEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      defaultStagger: 0.1,
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    },
    
    // State
    observers: [],
    animatedElements: new Set(),
    parallaxElements: [],
    
    /**
     * Initialize the animation engine
     */
    init() {
      this.setupScrollAnimations();
      this.setupParallax();
      this.setupMagneticElements();
      this.setup3DCards();
      this.setupTextAnimations();
      this.setupIntersectionObserver();
      this.setupReducedMotion();
      console.log('🎬 Pro Animation Engine initialized');
    },
    
    /**
     * Setup Intersection Observer for scroll animations
     */
    setupIntersectionObserver() {
      const options = {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            // Optionally unobserve after animation
            if (entry.target.dataset.once !== 'false') {
              observer.unobserve(entry.target);
            }
          } else if (entry.target.dataset.once === 'false') {
            this.resetElement(entry.target);
          }
        });
      }, options);
      
      // Observe all elements with data-animate
      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });
      
      // Observe mask reveals
      document.querySelectorAll('.mask-reveal').forEach(el => {
        observer.observe(el);
      });
      
      this.observers.push(observer);
    },
    
    /**
     * Animate element based on its configuration
     */
    animateElement(element) {
      if (this.animatedElements.has(element)) return;
      
      const delay = parseFloat(element.dataset.delay) * 100 || 0;
      const staggerDelay = parseFloat(element.dataset.stagger) * 100 || 0;
      
      // Handle children staggering
      if (staggerDelay > 0) {
        const children = element.children;
        Array.from(children).forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('pro-animated', 'animated');
          }, delay + (index * staggerDelay));
        });
      }
      
      setTimeout(() => {
        element.classList.add('pro-animated', 'animated');
        this.animatedElements.add(element);
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('proAnimated', { 
          detail: { element } 
        }));
      }, delay);
    },
    
    /**
     * Reset element animation
     */
    resetElement(element) {
      element.classList.remove('pro-animated', 'animated');
      this.animatedElements.delete(element);
    },
    
    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations() {
      let ticking = false;
      
      const updateAnimations = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Update parallax elements
        this.parallaxElements.forEach(item => {
          const rect = item.element.getBoundingClientRect();
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          
          if (progress > -0.2 && progress < 1.2) {
            const speed = item.speed || 0.5;
            const yPos = (progress - 0.5) * 100 * speed;
            item.element.style.transform = `translateY(${yPos}px)`;
          }
        });
        
        ticking = false;
      };
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateAnimations);
          ticking = true;
        }
      }, { passive: true });
    },
    
    /**
     * Setup parallax elements
     */
    setupParallax() {
      document.querySelectorAll('[data-parallax]').forEach(el => {
        this.parallaxElements.push({
          element: el,
          speed: parseFloat(el.dataset.parallax) || 0.5
        });
      });
    },
    
    /**
     * Setup magnetic elements that follow the cursor
     */
    setupMagneticElements() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      
      document.querySelectorAll('[data-magnetic]').forEach(el => {
        const strength = parseFloat(el.dataset.magnetic) || 0.3;
        
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    },
    
    /**
     * Setup 3D tilt cards
     */
    setup3DCards() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      
      document.querySelectorAll('[data-tilt]').forEach(el => {
        const maxTilt = parseFloat(el.dataset.tilt) || 15;
        
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          
          const tiltX = (y - 0.5) * maxTilt;
          const tiltY = (x - 0.5) * -maxTilt;
          
          el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
          
          // Optional glare effect
          const glare = el.querySelector('.glare');
          if (glare) {
            glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
          }
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
      });
    },
    
    /**
     * Setup text character animations
     */
    setupTextAnimations() {
      // Split text into characters
      document.querySelectorAll('[data-split-text]').forEach(el => {
        const text = el.textContent;
        const chars = text.split('');
        const type = el.dataset.splitText || 'chars'; // chars, words, lines
        
        if (type === 'chars') {
          el.innerHTML = chars.map((char, i) => 
            char === ' ' 
              ? ' ' 
              : `<span class="char-animate" style="animation-delay: ${i * 0.03}s">${char}</span>`
          ).join('');
        } else if (type === 'words') {
          const words = text.split(' ');
          el.innerHTML = words.map((word, i) => 
            `<span class="word-animate" style="transition-delay: ${i * 0.1}s"><span>${word}</span></span>`
          ).join(' ');
        }
      });
    },
    
    /**
     * Handle reduced motion preference
     */
    setupReducedMotion() {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (mediaQuery.matches) {
        document.documentElement.classList.add('reduced-motion');
      }
      
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          document.documentElement.classList.add('reduced-motion');
        } else {
          document.documentElement.classList.remove('reduced-motion');
        }
      });
    },
    
    /**
     * Trigger animation on element manually
     */
    trigger(element, animationType = 'spring') {
      element.classList.add(`pro-${animationType}`);
      element.addEventListener('animationend', () => {
        element.classList.remove(`pro-${animationType}`);
      }, { once: true });
    },
    
    /**
     * Create sequenced animation timeline
     */
    timeline(sequence) {
      let totalDelay = 0;
      
      sequence.forEach((step, index) => {
        const { target, animation, duration = 0.6, delay = 0 } = step;
        const elements = document.querySelectorAll(target);
        
        setTimeout(() => {
          elements.forEach(el => this.trigger(el, animation));
        }, totalDelay + (delay * 1000));
        
        totalDelay += (delay + duration) * 1000;
      });
      
      return {
        duration: totalDelay,
        then: (callback) => {
          setTimeout(callback, totalDelay);
          return this;
        }
      };
    },
    
    /**
     * Cleanup all observers and listeners
     */
    destroy() {
      this.observers.forEach(obs => obs.disconnect());
      this.observers = [];
      this.animatedElements.clear();
      this.parallaxElements = [];
    }
  };
  
  // Expose to global scope
  window.ProAnimation = ProAnimation;
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProAnimation.init());
  } else {
    ProAnimation.init();
  }
})();
