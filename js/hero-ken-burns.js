/**
 * v32.0 - Ken Burns Hero Slider
 * Fortune 500 cinematic hero slider with smooth transitions
 */

class KenBurnsSlider {
  constructor(element, options = {}) {
    this.slider = element;
    this.slides = element.querySelectorAll('.hero-slide');
    this.dots = element.querySelectorAll('.hero-nav-dot');
    this.progressBar = element.querySelector('.hero-progress-bar');
    this.prevBtn = element.querySelector('.hero-nav-arrow.prev');
    this.nextBtn = element.querySelector('.hero-nav-arrow.next');
    this.currentSlideEl = element.querySelector('.hero-slide-current');
    
    this.currentIndex = 0;
    this.autoplayDelay = options.autoplayDelay || 6000;
    this.isAutoplay = options.autoplay !== false;
    this.autoplayTimer = null;
    this.progressTimer = null;
    this.progress = 0;
    this.progressInterval = 50; // Update every 50ms
    this.progressStep = 100 / (this.autoplayDelay / this.progressInterval);
    this.isPaused = false;
    
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    if (this.slides.length === 0) return;
    
    // Set initial slide
    this.goToSlide(0);
    
    // Bind events
    this.bindEvents();
    
    // Start autoplay
    if (this.isAutoplay) {
      this.startAutoplay();
    }
    
    // Update counter
    this.updateCounter();
  }
  
  bindEvents() {
    // Navigation arrows
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Touch/swipe support
    this.slider.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.pauseAutoplay();
    }, { passive: true });
    
    this.slider.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.resumeAutoplay();
    }, { passive: true });
    
    // Pause on hover
    this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.slider.addEventListener('mouseleave', () => this.resumeAutoplay());
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else {
        this.resumeAutoplay();
      }
    });
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
  
  goToSlide(index) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;
    
    // Remove active class from current slide
    this.slides[this.currentIndex].classList.remove('active');
    this.dots[this.currentIndex]?.classList.remove('active');
    
    // Update current index
    this.currentIndex = index;
    
    // Add active class to new slide
    this.slides[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex]?.classList.add('active');
    
    // Update counter
    this.updateCounter();
    
    // Reset and restart progress
    this.resetProgress();
    if (this.isAutoplay && !this.isPaused) {
      this.startProgress();
    }
    
    // Dispatch custom event
    this.slider.dispatchEvent(new CustomEvent('slideChange', {
      detail: { currentIndex: this.currentIndex, total: this.slides.length }
    }));
  }
  
  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }
  
  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }
  
  updateCounter() {
    if (this.currentSlideEl) {
      this.currentSlideEl.textContent = String(this.currentIndex + 1).padStart(2, '0');
    }
  }
  
  startAutoplay() {
    this.isAutoplay = true;
    this.startProgress();
  }
  
  stopAutoplay() {
    this.isAutoplay = false;
    this.stopProgress();
    clearInterval(this.autoplayTimer);
  }
  
  pauseAutoplay() {
    this.isPaused = true;
    this.stopProgress();
    clearInterval(this.autoplayTimer);
  }
  
  resumeAutoplay() {
    if (!this.isAutoplay) return;
    this.isPaused = false;
    this.startAutoplay();
  }
  
  startProgress() {
    this.stopProgress();
    this.progress = 0;
    
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
    
    this.progressTimer = setInterval(() => {
      this.progress += this.progressStep;
      if (this.progressBar) {
        this.progressBar.style.width = `${Math.min(this.progress, 100)}%`;
      }
    }, this.progressInterval);
  }
  
  stopProgress() {
    clearInterval(this.progressTimer);
  }
  
  resetProgress() {
    this.stopProgress();
    this.progress = 0;
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    clearInterval(this.autoplayTimer);
  }
  
  destroy() {
    this.stopAutoplay();
    clearInterval(this.autoplayTimer);
    clearInterval(this.progressTimer);
  }
}

// Initialize Ken Burns sliders on page load
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.hero-ken-burns');
  
  sliders.forEach(slider => {
    new KenBurnsSlider(slider, {
      autoplay: true,
      autoplayDelay: 6000 // 6 seconds per slide
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KenBurnsSlider;
}
