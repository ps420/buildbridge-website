/**
 * v32.0 - Horizontal Scroll Gallery
 * Immersive horizontal scrolling project gallery
 */

class HorizontalScrollGallery {
  constructor(element, options = {}) {
    this.section = element;
    this.wrapper = element.querySelector('.horizontal-scroll-wrapper');
    this.container = element.querySelector('.horizontal-scroll-container');
    this.track = element.querySelector('.horizontal-scroll-track');
    this.progressBar = element.querySelector('.horizontal-gallery-progress__bar');
    this.prevBtn = element.querySelector('.gallery-nav-btn.prev');
    this.nextBtn = element.querySelector('.gallery-nav-btn.next');
    this.counterCurrent = element.querySelector('.gallery-counter__current');
    this.counterTotal = element.querySelector('.gallery-counter__total');
    
    this.cards = element.querySelectorAll('.gallery-card');
    
    this.currentIndex = 0;
    this.isScrolling = false;
    this.scrollSpeed = 0;
    this.targetX = 0;
    this.currentX = 0;
    
    // Config
    this.cardGap = 40;
    this.scrollMultiplier = 0.5;
    
    this.init();
  }
  
  init() {
    if (this.cards.length === 0) return;
    
    // Update counter
    if (this.counterTotal) {
      this.counterTotal.textContent = String(this.cards.length).padStart(2, '0');
    }
    
    // Bind scroll events
    this.bindScroll();
    
    // Bind navigation
    this.bindNavigation();
    
    // Initialize intersection observer for section activation
    this.initIntersectionObserver();
  }
  
  bindScroll() {
    // Only enable horizontal scroll on desktop
    if (window.innerWidth <= 768) return;
    
    let accumulatedDelta = 0;
    const deltaThreshold = 50;
    
    this.section.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      accumulatedDelta += e.deltaY;
      
      if (Math.abs(accumulatedDelta) >= deltaThreshold) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        this.navigate(direction);
        accumulatedDelta = 0;
      }
    }, { passive: false });
    
    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.section.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    this.section.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Only prevent default for horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        
        if (Math.abs(diffX) > 50) {
          const direction = diffX > 0 ? 1 : -1;
          this.navigate(direction);
          touchStartX = 0;
          touchStartY = 0;
        }
      }
    }, { passive: false });
  }
  
  bindNavigation() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.navigate(-1));
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.navigate(1));
    }
    
    // Card click navigation
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Keyboard navigation
    this.section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
    
    this.section.setAttribute('tabindex', '0');
  }
  
  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.cards.length) {
      this.goToSlide(newIndex);
    }
  }
  
  goToSlide(index) {
    if (this.isScrolling || index === this.currentIndex) return;
    
    this.isScrolling = true;
    this.currentIndex = index;
    
    // Calculate scroll position
    const card = this.cards[index];
    const cardRect = card.getBoundingClientRect();
    const trackRect = this.track.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Center the card in viewport
    const scrollLeft = card.offsetLeft - (containerRect.width / 2) + (cardRect.width / 2);
    
    // Animate scroll
    this.container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    
    // Update UI
    this.updateUI();
    
    setTimeout(() => {
      this.isScrolling = false;
    }, 600);
  }
  
  updateUI() {
    // Update counter
    if (this.counterCurrent) {
      this.counterCurrent.textContent = String(this.currentIndex + 1).padStart(2, '0');
    }
    
    // Update progress bar
    const progress = ((this.currentIndex + 1) / this.cards.length) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
    
    // Update buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.cards.length - 1;
    }
    
    // Update active card
    this.cards.forEach((card, index) => {
      card.classList.toggle('is-active', index === this.currentIndex);
    });
  }
  
  initIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.section.classList.add('is-active');
            this.updateUI();
          } else {
            this.section.classList.remove('is-active');
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(this.section);
  }
  
  // Smooth scroll on scroll event
  handleScroll() {
    if (!this.container) return;
    
    const scrollLeft = this.container.scrollLeft;
    const maxScroll = this.track.scrollWidth - this.container.clientWidth;
    const progress = (scrollLeft / maxScroll) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
    
    // Find current card
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    this.cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const containerCenter = scrollLeft + (this.container.clientWidth / 2);
      const distance = Math.abs(cardCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex !== this.currentIndex) {
      this.currentIndex = closestIndex;
      this.updateUI();
    }
  }
}

// Initialize galleries on page load
document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.horizontal-gallery-section');
  
  galleries.forEach(gallery => {
    new HorizontalScrollGallery(gallery);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HorizontalScrollGallery;
}
