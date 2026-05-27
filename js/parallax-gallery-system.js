/**
 * v29.0: Parallax Gallery System
 * Fortune 500 Premium Scroll Experience
 * Depth-based parallax with scroll-triggered reveals
 */

(function() {
  'use strict';
  
  const ParallaxGallery = {
    config: {
      parallaxStrength: 0.15,
      perspectiveStrength: 0.1,
      skewMax: 3,
      smoothness: 0.1,
      revealThreshold: 0.2
    },
    
    state: {
      scrollY: 0,
      lastScrollY: 0,
      scrollVelocity: 0,
      ticking: false,
      items: [],
      isTouch: false
    },
    
    /**
     * Initialize parallax gallery
     */
    init() {
      // Check for reduced motion
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('📸 Parallax Gallery: Reduced motion enabled');
        this.setupRevealOnly();
        return;
      }
      
      // Detect touch device
      this.state.isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (this.state.isTouch) {
        this.config.parallaxStrength = 0.08;
      }
      
      this.findItems();
      this.setupIntersectionObserver();
      this.bindEvents();
      
      console.log('📸 BuildBridge Parallax Gallery System initialized');
    },
    
    /**
     * Find all parallax items
     */
    findItems() {
      this.state.items = Array.from(document.querySelectorAll('.parallax-item')).map(el => {
        const depth = parseInt(el.dataset.depth) || 1;
        return {
          element: el,
          depth: depth,
          imageWrapper: el.querySelector('.parallax-image-wrapper'),
          revealed: false,
          rect: null
        };
      });
    },
    
    /**
     * Setup intersection observer for reveals
     */
    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        this.state.items.forEach(item => {
          item.element.classList.add('revealed');
          item.revealed = true;
        });
        return;
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const item = this.state.items.find(i => i.element === entry.target);
          if (item && entry.isIntersecting) {
            setTimeout(() => {
              item.element.classList.add('revealed');
              item.revealed = true;
            }, parseInt(entry.target.dataset.delay || 0) * 100);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: this.config.revealThreshold,
        rootMargin: '0px 0px -50px 0px'
      });
      
      this.state.items.forEach(item => observer.observe(item.element));
    },
    
    /**
     * Setup reveal only (for reduced motion)
     */
    setupRevealOnly() {
      const items = document.querySelectorAll('.parallax-item');
      items.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    },
    
    /**
     * Bind scroll and resize events
     */
    bindEvents() {
      // Scroll handling with RAF
      window.addEventListener('scroll', () => {
        this.state.scrollY = window.scrollY;
        
        if (!this.state.ticking) {
          requestAnimationFrame(() => {
            this.update();
            this.state.ticking = false;
          });
          this.state.ticking = true;
        }
      }, { passive: true });
      
      // Resize handling
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.findItems();
        }, 250);
      }, { passive: true });
      
      // Mouse parallax for perspective gallery
      if (!this.state.isTouch) {
        document.querySelectorAll('.perspective-gallery').forEach(gallery => {
          gallery.addEventListener('mousemove', (e) => {
            this.handlePerspectiveMouseMove(e, gallery);
          });
          
          gallery.addEventListener('mouseleave', () => {
            this.resetPerspective(gallery);
          });
        });
      }
    },
    
    /**
     * Main update loop
     */
    update() {
      // Calculate scroll velocity
      this.state.scrollVelocity = this.state.scrollY - this.state.lastScrollY;
      this.state.lastScrollY = this.state.scrollY;
      
      const viewportCenter = this.state.scrollY + window.innerHeight / 2;
      
      // Update each parallax item
      this.state.items.forEach(item => {
        if (!item.revealed || !item.imageWrapper) return;
        
        const rect = item.element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2 + this.state.scrollY;
        const distanceFromCenter = (viewportCenter - elementCenter) * this.config.parallaxStrength;
        
        // Apply parallax transform based on depth
        const parallaxOffset = distanceFromCenter * (item.depth * 0.3);
        item.imageWrapper.style.transform = `translateY(${parallaxOffset}px)`;
      });
      
      // Apply velocity skew to containers
      this.applyVelocitySkew();
    },
    
    /**
     * Apply velocity-based skew effect
     */
    applyVelocitySkew() {
      const containers = document.querySelectorAll('.velocity-skew-container');
      const skew = Math.max(-this.config.skewMax, Math.min(this.config.skewMax, 
        this.state.scrollVelocity * 0.05));
      
      containers.forEach(container => {
        container.style.transform = `skewY(${skew}deg)`;
      });
    },
    
    /**
     * Handle mouse move for perspective gallery
     */
    handlePerspectiveMouseMove(e, gallery) {
      const rect = gallery.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      const cards = gallery.querySelectorAll('.perspective-card');
      cards.forEach((card, index) => {
        const depth = parseInt(card.dataset.depth) || 1;
        const intensity = depth * this.config.perspectiveStrength;
        
        const rotateY = x * 15 * intensity;
        const rotateX = -y * 15 * intensity;
        const translateZ = depth * 20;
        
        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(${translateZ}px)
        `;
      });
    },
    
    /**
     * Reset perspective transforms
     */
    resetPerspective(gallery) {
      const cards = gallery.querySelectorAll('.perspective-card');
      cards.forEach(card => {
        const depth = card.dataset.depth;
        if (depth === '1') {
          card.style.transform = 'translateZ(0) rotateY(-5deg)';
        } else if (depth === '2') {
          card.style.transform = 'translateZ(50px) scale(1.05)';
        } else if (depth === '3') {
          card.style.transform = 'translateZ(0) rotateY(5deg)';
        }
      });
    },
    
    /**
     * Horizontal parallax track
     */
    initHorizontalTrack() {
      const tracks = document.querySelectorAll('.parallax-track');
      
      tracks.forEach(track => {
        let targetX = 0;
        let currentX = 0;
        
        const updateTrack = () => {
          currentX += (targetX - currentX) * this.config.smoothness;
          track.style.transform = `translateX(${currentX}px)`;
          
          if (Math.abs(targetX - currentX) > 0.1) {
            requestAnimationFrame(updateTrack);
          }
        };
        
        track.addEventListener('mousemove', (e) => {
          const rect = track.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          const trackWidth = track.scrollWidth - rect.width;
          targetX = -percent * trackWidth;
          requestAnimationFrame(updateTrack);
        });
      });
    },
    
    /**
     * Scroll pin animation
     */
    initScrollPin() {
      const pinSections = document.querySelectorAll('.scroll-pin-section');
      
      pinSections.forEach(section => {
        const items = section.querySelectorAll('.scroll-pin-item');
        const container = section.querySelector('.scroll-pin-container');
        
        if (!container || items.length === 0) return;
        
        const handleScroll = () => {
          const rect = section.getBoundingClientRect();
          const sectionHeight = section.offsetHeight;
          const viewportHeight = window.innerHeight;
          
          // Calculate progress through section (0 to 1)
          const progress = Math.max(0, Math.min(1, 
            (-rect.top) / (sectionHeight - viewportHeight)
          ));
          
          // Animate items based on progress
          items.forEach((item, index) => {
            const itemProgress = (progress * items.length) - index;
            const clampedProgress = Math.max(0, Math.min(1, itemProgress));
            
            // Calculate transforms
            const scale = 0.8 + (clampedProgress * 0.2);
            const opacity = clampedProgress;
            const translateZ = (1 - clampedProgress) * -200;
            const translateY = (1 - clampedProgress) * 100;
            
            item.style.transform = `
              scale(${scale})
              translateZ(${translateZ}px)
              translateY(${translateY}px)
            `;
            item.style.opacity = opacity;
            item.style.zIndex = index + 1;
          });
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call
      });
    },
    
    /**
     * Image comparison slider
     */
    initComparisonSlider() {
      const comparisons = document.querySelectorAll('.parallax-comparison');
      
      comparisons.forEach(container => {
        const handle = container.querySelector('.parallax-handle');
        const before = container.querySelector('.comparison-before');
        let isDragging = false;
        
        const updatePosition = (x) => {
          const rect = container.getBoundingClientRect();
          const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
          
          handle.style.left = `${percent}%`;
          if (before) {
            before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
          }
        };
        
        handle.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('mousemove', (e) => {
          if (isDragging) updatePosition(e.clientX);
        });
        
        // Touch support
        handle.addEventListener('touchstart', () => isDragging = true);
        document.addEventListener('touchend', () => isDragging = false);
        document.addEventListener('touchmove', (e) => {
          if (isDragging) updatePosition(e.touches[0].clientX);
        });
        
        // Click to move
        container.addEventListener('click', (e) => {
          updatePosition(e.clientX);
        });
      });
    }
  };
  
  // Export to global scope
  window.ParallaxGallery = ParallaxGallery;
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ParallaxGallery.init());
  } else {
    ParallaxGallery.init();
  }
  
})();
