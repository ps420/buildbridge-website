/**
 * Horizontal Scroll Gallery
 * Smooth drag-to-scroll with momentum and snap points
 */

(function() {
  'use strict';

  class HorizontalGallery {
    constructor(container) {
      this.container = container;
      this.track = container.querySelector('.horizontal-gallery-track');
      this.cards = container.querySelectorAll('.gallery-card');
      this.navPrev = container.querySelector('.gallery-nav.prev');
      this.navNext = container.querySelector('.gallery-nav.next');
      this.progressDots = container.querySelectorAll('.gallery-progress-dot');
      
      this.isDragging = false;
      this.startX = 0;
      this.scrollLeft = 0;
      this.velocity = 0;
      this.lastX = 0;
      this.lastTime = 0;
      this.rafId = null;
      
      this.init();
    }

    init() {
      this.setupDragScroll();
      this.setupNavigation();
      this.setupProgress();
      this.setupIntersectionObserver();
      this.setupKeyboardNav();
    }

    setupDragScroll() {
      const track = this.track;
      
      // Mouse events
      track.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startX = e.pageX - track.offsetLeft;
        this.scrollLeft = track.scrollLeft;
        this.lastX = e.pageX;
        this.lastTime = Date.now();
        this.velocity = 0;
        
        track.classList.add('dragging');
        track.style.cursor = 'grabbing';
        
        cancelAnimationFrame(this.rafId);
      });

      track.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        track.scrollLeft = this.scrollLeft - walk;
        
        // Calculate velocity for momentum
        const now = Date.now();
        const dt = now - this.lastTime;
        if (dt > 0) {
          this.velocity = (e.pageX - this.lastX) / dt;
        }
        this.lastX = e.pageX;
        this.lastTime = now;
        
        // Apply skew effect based on velocity
        const skewAmount = Math.min(Math.max(this.velocity * 2, -5), 5);
        track.style.transform = `skewX(${skewAmount}deg)`;
      });

      const stopDrag = () => {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        track.classList.remove('dragging');
        track.style.cursor = 'grab';
        track.style.transform = '';
        
        // Apply momentum
        this.applyMomentum();
      };

      track.addEventListener('mouseup', stopDrag);
      track.addEventListener('mouseleave', stopDrag);

      // Touch events
      track.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        this.startX = e.touches[0].pageX - track.offsetLeft;
        this.scrollLeft = track.scrollLeft;
        this.lastX = e.touches[0].pageX;
        this.lastTime = Date.now();
        this.velocity = 0;
        
        track.classList.add('dragging');
        
        cancelAnimationFrame(this.rafId);
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        
        const x = e.touches[0].pageX - track.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        track.scrollLeft = this.scrollLeft - walk;
        
        const now = Date.now();
        const dt = now - this.lastTime;
        if (dt > 0) {
          this.velocity = (e.touches[0].pageX - this.lastX) / dt;
        }
        this.lastX = e.touches[0].pageX;
        this.lastTime = now;
      }, { passive: true });

      track.addEventListener('touchend', () => {
        this.isDragging = false;
        track.classList.remove('dragging');
        this.applyMomentum();
      });

      // Scroll event for progress updates
      track.addEventListener('scroll', () => {
        this.updateProgress();
        this.updateNavButtons();
      }, { passive: true });
    }

    applyMomentum() {
      const track = this.track;
      const decay = 0.95;
      const minVelocity = 0.01;
      
      const animate = () => {
        if (Math.abs(this.velocity) > minVelocity) {
          track.scrollLeft -= this.velocity * 16;
          this.velocity *= decay;
          this.rafId = requestAnimationFrame(animate);
        }
      };
      
      animate();
    }

    setupNavigation() {
      if (this.navPrev) {
        this.navPrev.addEventListener('click', () => {
          const cardWidth = this.cards[0]?.offsetWidth + 30 || 430;
          this.track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
      }
      
      if (this.navNext) {
        this.navNext.addEventListener('click', () => {
          const cardWidth = this.cards[0]?.offsetWidth + 30 || 430;
          this.track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
      }
    }

    setupProgress() {
      this.progressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          if (this.cards[index]) {
            this.cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
          }
        });
      });
    }

    updateProgress() {
      const track = this.track;
      const scrollProgress = track.scrollLeft / (track.scrollWidth - track.clientWidth);
      const activeIndex = Math.round(scrollProgress * (this.cards.length - 1));
      
      this.progressDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    }

    updateNavButtons() {
      const track = this.track;
      
      if (this.navPrev) {
        this.navPrev.disabled = track.scrollLeft <= 10;
      }
      
      if (this.navNext) {
        this.navNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
      }
    }

    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.5 });

      this.cards.forEach(card => observer.observe(card));
    }

    setupKeyboardNav() {
      this.container.addEventListener('keydown', (e) => {
        const cardWidth = this.cards[0]?.offsetWidth + 30 || 430;
        
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      });
      
      this.container.setAttribute('tabindex', '0');
    }
  }

  // Initialize all galleries
  function init() {
    const galleries = document.querySelectorAll('.horizontal-gallery-container');
    galleries.forEach(gallery => new HorizontalGallery(gallery));
    
    if (galleries.length > 0) {
      console.log('📜 Horizontal Gallery initialized');
    }
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
