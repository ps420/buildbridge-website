// ========================================
// v121.0: INTERACTIVE 3D PROJECT SHOWCASE
// Fortune 500 Quality 3D Gallery System
// ========================================

class Interactive3DShowcase {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.showcase-3d-track');
    this.cards = container.querySelectorAll('.showcase-3d-card');
    this.prevBtn = container.querySelector('.showcase-3d-nav.prev');
    this.nextBtn = container.querySelector('.showcase-3d-nav.next');
    this.dots = container.querySelectorAll('.showcase-3d-dot');
    this.progressBar = container.querySelector('.showcase-3d-progress-bar');
    
    this.currentIndex = 0;
    this.totalCards = this.cards.length;
    this.isAnimating = false;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000;
    
    // 3D Configuration
    this.cardWidth = 380;
    this.cardGap = 60;
    this.perspective = 1200;
    this.rotationY = 45;
    this.translateZ = 350;
    
    this.init();
  }
  
  init() {
    this.positionCards();
    this.bindEvents();
    this.startAutoPlay();
    this.updateProgress();
  }
  
  positionCards() {
    const centerIndex = Math.floor(this.totalCards / 2);
    
    this.cards.forEach((card, index) => {
      const offset = index - this.currentIndex;
      const absOffset = Math.abs(offset);
      
      // Calculate 3D transforms
      let translateX = offset * (this.cardWidth + this.cardGap);
      let translateZ = -absOffset * 150;
      let rotateY = offset * -25;
      let scale = 1 - (absOffset * 0.15);
      let opacity = 1 - (absOffset * 0.3);
      let blur = absOffset * 2;
      
      // Clamp values
      scale = Math.max(0.7, scale);
      opacity = Math.max(0.4, opacity);
      blur = Math.min(8, blur);
      
      // Apply transforms
      card.style.transform = `
        translateX(calc(-50% + ${translateX}px))
        translateY(-50%)
        translateZ(${translateZ}px)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = this.totalCards - absOffset;
      
      // Active card styling
      if (index === this.currentIndex) {
        card.classList.add('active');
        card.style.filter = 'blur(0px)';
      } else {
        card.classList.remove('active');
      }
    });
  }
  
  goToCard(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    this.isAnimating = true;
    
    // Handle wrapping
    if (index < 0) index = this.totalCards - 1;
    if (index >= this.totalCards) index = 0;
    
    this.currentIndex = index;
    this.positionCards();
    this.updateDots();
    this.updateProgress();
    
    // Reset animation flag
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
    
    // Reset autoplay
    this.resetAutoPlay();
  }
  
  next() {
    this.goToCard(this.currentIndex + 1);
  }
  
  prev() {
    this.goToCard(this.currentIndex - 1);
  }
  
  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
  
  updateProgress() {
    if (this.progressBar) {
      const progress = ((this.currentIndex + 1) / this.totalCards) * 100;
      this.progressBar.style.width = `${progress}%`;
    }
  }
  
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
  
  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    
    // Dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToCard(index));
    });
    
    // Card clicks
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (index !== this.currentIndex) {
          this.goToCard(index);
        }
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.container.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      this.stopAutoPlay();
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
      this.startAutoPlay();
    }, { passive: true });
    
    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    });
  }
  
  handleSwipe(startX, endX) {
    const threshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
}

// ========================================
// 3D Card Tilt Effect
// ========================================
class Showcase3DTilt {
  constructor(element) {
    this.element = element;
    this.inner = element.querySelector('.showcase-3d-card-inner');
    this.isActive = true;
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    this.element.addEventListener('mouseenter', () => this.onMouseEnter());
  }
  
  onMouseMove(e) {
    if (!this.isActive) return;
    
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    this.inner.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(30px)
      scale(1.02)
    `;
  }
  
  onMouseLeave() {
    this.inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
  }
  
  onMouseEnter() {
    this.inner.style.transition = 'transform 0.1s ease-out';
  }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const showcaseContainers = document.querySelectorAll('.showcase-3d-container');
  
  showcaseContainers.forEach(container => {
    new Interactive3DShowcase(container);
  });
  
  // Initialize tilt effect on cards
  document.querySelectorAll('.showcase-3d-card').forEach(card => {
    new Showcase3DTilt(card);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Interactive3DShowcase, Showcase3DTilt };
}
