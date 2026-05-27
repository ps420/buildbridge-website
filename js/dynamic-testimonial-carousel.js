/**
 * v31.0 - Dynamic Testimonial Carousel
 * Auto-playing testimonial slider with smooth transitions
 */

(function() {
  'use strict';

  class DynamicTestimonialCarousel {
    constructor(container) {
      this.container = container;
      this.track = container.querySelector('.testimonial-carousel-track');
      this.slides = Array.from(container.querySelectorAll('.testimonial-slide'));
      this.prevBtn = container.querySelector('.testimonial-nav-btn.prev');
      this.nextBtn = container.querySelector('.testimonial-nav-btn.next');
      this.dots = Array.from(container.querySelectorAll('.testimonial-dot'));
      this.progressBar = container.querySelector('.testimonial-progress-bar');
      
      this.currentIndex = 0;
      this.autoplayDelay = 6000;
      this.autoplayTimer = null;
      this.progressTimer = null;
      this.isPaused = false;
      
      this.init();
    }

    init() {
      if (this.slides.length === 0) return;

      this.bindEvents();
      this.goToSlide(0);
      this.startAutoplay();
    }

    bindEvents() {
      // Navigation buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          this.prev();
          this.resetAutoplay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          this.next();
          this.resetAutoplay();
        });
      }

      // Dots
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.goToSlide(index);
          this.resetAutoplay();
        });
      });

      // Pause on hover
      this.container.addEventListener('mouseenter', () => {
        this.isPaused = true;
        this.stopAutoplay();
      });

      this.container.addEventListener('mouseleave', () => {
        this.isPaused = false;
        this.startAutoplay();
      });

      // Touch support
      let touchStartX = 0;
      this.track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      this.track.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
          this.resetAutoplay();
        }
      }, { passive: true });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.isInViewport()) return;
        
        if (e.key === 'ArrowLeft') {
          this.prev();
          this.resetAutoplay();
        } else if (e.key === 'ArrowRight') {
          this.next();
          this.resetAutoplay();
        }
      });
    }

    isInViewport() {
      const rect = this.container.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    goToSlide(index) {
      // Remove active class from current slide
      this.slides[this.currentIndex].classList.remove('active');
      this.slides[this.currentIndex].classList.remove('prev');
      this.dots[this.currentIndex]?.classList.remove('active');

      // Update index
      this.currentIndex = index;
      if (this.currentIndex < 0) this.currentIndex = this.slides.length - 1;
      if (this.currentIndex >= this.slides.length) this.currentIndex = 0;

      // Add active class to new slide
      this.slides[this.currentIndex].classList.add('active');
      this.dots[this.currentIndex]?.classList.add('active');

      // Mark previous slide
      const prevIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
      this.slides[prevIndex].classList.add('prev');

      // Reset progress bar animation
      this.resetProgressBar();
    }

    next() {
      this.goToSlide(this.currentIndex + 1);
    }

    prev() {
      this.goToSlide(this.currentIndex - 1);
    }

    startAutoplay() {
      if (this.isPaused) return;
      
      this.stopAutoplay();
      this.autoplayTimer = setInterval(() => {
        this.next();
      }, this.autoplayDelay);

      this.startProgressBar();
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
      this.stopProgressBar();
    }

    resetAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }

    startProgressBar() {
      if (!this.progressBar) return;
      
      let progress = 0;
      const interval = 50;
      const increment = 100 / (this.autoplayDelay / interval);

      this.progressTimer = setInterval(() => {
        progress += increment;
        if (this.progressBar) {
          this.progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
      }, interval);
    }

    stopProgressBar() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    }

    resetProgressBar() {
      this.stopProgressBar();
      if (this.progressBar) {
        this.progressBar.style.width = '0%';
      }
      if (!this.isPaused) {
        this.startProgressBar();
      }
    }
  }

  // Initialize all carousels on page
  function initCarousels() {
    document.querySelectorAll('.testimonial-carousel-container').forEach(container => {
      new DynamicTestimonialCarousel(container);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  // Expose to global scope
  window.DynamicTestimonialCarousel = DynamicTestimonialCarousel;
})();
