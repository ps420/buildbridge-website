/**
 * Horizontal Scroll Showcase v1.0
 * Apple-style Horizontal Gallery with Snap Points
 */

class HorizontalShowcase {
  constructor(container) {
    this.container = container;
    this.wrapper = container.querySelector('.horizontal-scroll-wrapper');
    this.track = container.querySelector('.horizontal-scroll-track');
    this.cards = container.querySelectorAll('.showcase-card');
    this.progressDots = container.querySelectorAll('.showcase-progress-dot');
    this.prevBtn = container.querySelector('.showcase-nav-btn.prev');
    this.nextBtn = container.querySelector('.showcase-nav-btn.next');
    
    this.currentIndex = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }

  init() {
    if (!this.wrapper || !this.track || this.cards.length === 0) return;

    this.bindEvents();
    this.updateProgress();
    this.setupIntersectionObserver();
    this.setupScrollHint();
  }

  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.scrollToPrev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.scrollToNext());
    }

    // Progress dots
    this.progressDots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.scrollToIndex(index));
    });

    // Scroll events
    this.wrapper.addEventListener('scroll', () => {
      this.isScrolling = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.updateCurrentIndex();
      }, 150);
    }, { passive: true });

    // Touch/drag handling
    let isDown = false;
    let startX;
    let scrollLeft;

    this.wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      this.wrapper.style.cursor = 'grabbing';
      startX = e.pageX - this.wrapper.offsetLeft;
      scrollLeft = this.wrapper.scrollLeft;
    });

    this.wrapper.addEventListener('mouseleave', () => {
      isDown = false;
      this.wrapper.style.cursor = 'grab';
    });

    this.wrapper.addEventListener('mouseup', () => {
      isDown = false;
      this.wrapper.style.cursor = 'grab';
    });

    this.wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - this.wrapper.offsetLeft;
      const walk = (x - startX) * 2;
      this.wrapper.scrollLeft = scrollLeft - walk;
    });

    // Keyboard navigation
    this.wrapper.setAttribute('tabindex', '0');
    this.wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.scrollToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.scrollToNext();
      }
    });

    // Set initial cursor
    this.wrapper.style.cursor = 'grab';
  }

  setupIntersectionObserver() {
    const options = {
      root: this.wrapper,
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, options);

    this.cards.forEach(card => observer.observe(card));
  }

  setupScrollHint() {
    const hint = this.container.querySelector('.showcase-scroll-hint');
    if (!hint) return;

    // Hide after first scroll
    const hideHint = () => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 500);
      this.wrapper.removeEventListener('scroll', hideHint);
    };

    this.wrapper.addEventListener('scroll', hideHint, { once: true });
  }

  scrollToPrev() {
    if (this.currentIndex > 0) {
      this.scrollToIndex(this.currentIndex - 1);
    }
  }

  scrollToNext() {
    if (this.currentIndex < this.cards.length - 1) {
      this.scrollToIndex(this.currentIndex + 1);
    }
  }

  scrollToIndex(index) {
    if (index < 0 || index >= this.cards.length) return;

    const card = this.cards[index];
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    // Calculate center position
    const scrollLeft = this.wrapper.scrollLeft + 
      (cardRect.left - wrapperRect.left) - 
      (wrapperRect.width / 2) + 
      (cardRect.width / 2);

    this.wrapper.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });

    this.currentIndex = index;
    this.updateProgress();
  }

  updateCurrentIndex() {
    const wrapperCenter = this.wrapper.scrollLeft + (this.wrapper.offsetWidth / 2);
    let closestIndex = 0;
    let closestDistance = Infinity;

    this.cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const distance = Math.abs(wrapperCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== this.currentIndex) {
      this.currentIndex = closestIndex;
      this.updateProgress();
    }
  }

  updateProgress() {
    // Update dots
    this.progressDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });

    // Update nav buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
      this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.cards.length - 1;
      this.nextBtn.style.opacity = this.currentIndex === this.cards.length - 1 ? '0.3' : '1';
    }

    // Update cards visual state
    this.cards.forEach((card, index) => {
      const distance = Math.abs(index - this.currentIndex);
      card.style.opacity = distance === 0 ? '1' : distance === 1 ? '0.7' : '0.5';
      card.style.transform = distance === 0 ? 'scale(1)' : 'scale(0.95)';
    });
  }

  // Auto-scroll functionality (optional)
  startAutoplay(interval = 5000) {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      if (this.currentIndex < this.cards.length - 1) {
        this.scrollToNext();
      } else {
        this.scrollToIndex(0);
      }
    }, interval);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplayOnHover() {
    this.wrapper.addEventListener('mouseenter', () => this.stopAutoplay());
    this.wrapper.addEventListener('mouseleave', () => {
      if (this.autoplayInterval) this.startAutoplay();
    });
  }

  // Public API
  getCurrentIndex() {
    return this.currentIndex;
  }

  getTotalCards() {
    return this.cards.length;
  }
}

// Initialize all showcases on page
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.horizontal-showcase').forEach(showcase => {
    const instance = new HorizontalShowcase(showcase);
    
    // Store reference for potential external control
    showcase._showcaseInstance = instance;
  });
});

// Export
window.HorizontalShowcase = HorizontalShowcase;
