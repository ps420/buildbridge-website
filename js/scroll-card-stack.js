/**
 * Scroll-Driven 3D Card Stack
 * v25.0 Fortune 500 Professional Feature
 * Cards that elegantly stack/unstack on scroll with 3D transforms
 */

class ScrollCardStack {
  constructor(container) {
    this.container = container;
    this.wrapper = container.querySelector('.card-stack-wrapper');
    this.cards = Array.from(container.querySelectorAll('.card-stack-item'));
    this.progressIndicator = container.querySelector('.card-stack-progress');
    this.hint = container.querySelector('.card-stack-hint');
    this.dots = [];
    
    this.currentIndex = 0;
    this.cardCount = this.cards.length;
    this.scrollProgress = 0;
    this.isInView = false;
    
    this.init();
  }
  
  init() {
    if (!this.cards.length) return;
    
    // Create progress dots
    this.createProgressDots();
    
    // Set initial card states
    this.cards.forEach((card, index) => {
      card.style.zIndex = this.cardCount - index;
      card.dataset.index = index;
    });
    
    // Bind events
    this.bindEvents();
    
    // Initial render
    this.updateCards();
    
    // Observe visibility
    this.observeVisibility();
  }
  
  createProgressDots() {
    if (!this.progressIndicator) return;
    
    this.cards.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'card-stack-dot' + (index === 0 ? ' active' : '');
      dot.dataset.index = index;
      dot.addEventListener('click', () => this.scrollToCard(index));
      this.progressIndicator.appendChild(dot);
      this.dots.push(dot);
    });
  }
  
  bindEvents() {
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
  }
  
  observeVisibility() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          this.isInView = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(this.container);
  }
  
  onScroll() {
    if (!this.isInView) return;
    
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through the section
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const scrollPerCard = (sectionHeight - windowHeight) / this.cardCount;
    
    // Progress from 0 to 1 through the entire section
    const rawProgress = -sectionTop / (sectionHeight - windowHeight);
    this.scrollProgress = Math.max(0, Math.min(1, rawProgress));
    
    // Calculate current card index
    const newIndex = Math.min(
      Math.floor(this.scrollProgress * this.cardCount),
      this.cardCount - 1
    );
    
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updateProgressDots();
    }
    
    this.updateCards();
    this.updateHint();
  }
  
  updateCards() {
    const progressPerCard = 1 / this.cardCount;
    const localProgress = (this.scrollProgress % progressPerCard) / progressPerCard;
    
    this.cards.forEach((card, index) => {
      const cardProgress = this.scrollProgress * this.cardCount - index;
      
      if (cardProgress < 0) {
        // Card hasn't been reached yet
        this.setCardState(card, 'upcoming', index);
      } else if (cardProgress >= 0 && cardProgress < 1) {
        // Card is currently active
        const easedProgress = this.easeOutCubic(cardProgress);
        this.setCardState(card, 'active', index, easedProgress);
      } else {
        // Card has been passed
        this.setCardState(card, 'passed', index);
      }
    });
  }
  
  setCardState(card, state, index, progress = 0) {
    const baseTransform = {
      upcoming: 'translateY(100px) scale(0.9)',
      passed: `translateY(${-20 * (this.currentIndex - index)}px) scale(${1 - (this.currentIndex - index) * 0.02})`,
      active: `translateY(0) scale(1)`
    };
    
    switch (state) {
      case 'upcoming':
        card.style.transform = `
          translateY(50px) 
          scale(0.95) 
          rotateX(5deg)
        `;
        card.style.opacity = '0.6';
        card.classList.remove('stacked');
        break;
        
      case 'passed':
        const depth = this.currentIndex - index;
        const scale = Math.max(0.85, 1 - depth * 0.03);
        const translateZ = -depth * 30;
        const translateY = -depth * 15;
        const opacity = Math.max(0.3, 1 - depth * 0.2);
        
        card.style.transform = `
          translateY(${translateY}px) 
          translateZ(${translateZ}px)
          scale(${scale})
        `;
        card.style.opacity = opacity;
        card.classList.add('stacked');
        break;
        
      case 'active':
        const parallaxY = progress * -10;
        const scaleActive = 1 - progress * 0.02;
        
        card.style.transform = `
          translateY(${parallaxY}px) 
          scale(${scaleActive})
        `;
        card.style.opacity = '1';
        card.classList.remove('stacked');
        break;
    }
    
    // Update z-index to ensure proper stacking
    card.style.zIndex = this.cardCount - Math.abs(this.currentIndex - index);
  }
  
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  updateProgressDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      
      if (index === this.currentIndex) {
        dot.classList.add('active');
      } else if (index < this.currentIndex) {
        dot.classList.add('completed');
      }
    });
  }
  
  scrollToCard(index) {
    const rect = this.container.getBoundingClientRect();
    const scrollTop = window.pageYOffset + rect.top;
    const sectionHeight = rect.height;
    const targetScroll = scrollTop + (sectionHeight / this.cardCount) * index;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
  
  updateHint() {
    if (!this.hint) return;
    
    if (this.scrollProgress > 0.1) {
      this.hint.classList.add('hidden');
    } else {
      this.hint.classList.remove('hidden');
    }
  }
  
  onResize() {
    // Recalculate on resize
    this.onScroll();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const cardStackSections = document.querySelectorAll('.card-stack-section');
  cardStackSections.forEach(section => {
    new ScrollCardStack(section);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollCardStack;
}
