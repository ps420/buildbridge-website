/**
 * v38.0: Scroll-Driven Morphing Cards
 * Dynamic shape transformation based on scroll position
 * Fortune 500 Next-Gen Interaction Feature
 */

class MorphingCards {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.morphing-cards-section');
    if (!this.container) return;
    
    this.cards = this.container.querySelectorAll('.morphing-card');
    this.progressDots = document.querySelectorAll('.morphing-progress-dot');
    
    this.currentPhase = 0;
    this.phases = 5;
    this.isScrolling = false;
    
    this.init();
  }
  
  init() {
    this.bindScroll();
    this.bindProgressDots();
    this.updatePhase(0);
    
    // Intersection Observer for entrance animation
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateEntrance();
        }
      });
    }, { threshold: 0.2 });
    
    this.observer.observe(this.container);
  }
  
  bindScroll() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        this.isScrolling = true;
        requestAnimationFrame(() => this.handleScroll());
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    }, { passive: true });
  }
  
  handleScroll() {
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through section
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const scrollProgress = Math.max(0, Math.min(1, 
      (windowHeight - sectionTop) / (windowHeight + sectionHeight)
    ));
    
    // Determine current phase based on scroll
    const phase = Math.min(this.phases - 1, Math.floor(scrollProgress * this.phases));
    
    if (phase !== this.currentPhase) {
      this.updatePhase(phase);
    }
    
    // Apply parallax to cards
    this.cards.forEach((card, index) => {
      const offset = (scrollProgress - 0.5) * 50 * (index % 2 === 0 ? 1 : -1);
      card.style.transform = `translateY(${offset}px)`;
    });
    
    this.isScrolling = false;
  }
  
  updatePhase(phase) {
    this.currentPhase = phase;
    
    this.cards.forEach((card, index) => {
      // Stagger the phase updates
      setTimeout(() => {
        card.setAttribute('data-phase', phase + 1);
        
        // Add transition class
        card.classList.add('phase-transition');
        setTimeout(() => card.classList.remove('phase-transition'), 600);
      }, index * 100);
    });
    
    // Update progress dots
    this.progressDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === phase);
    });
  }
  
  bindProgressDots() {
    this.progressDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.scrollToPhase(index);
      });
    });
  }
  
  scrollToPhase(phase) {
    const rect = this.container.getBoundingClientRect();
    const scrollTop = window.pageYOffset + rect.top;
    const sectionHeight = rect.height;
    const targetScroll = scrollTop + (sectionHeight * phase / this.phases);
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
  
  animateEntrance() {
    this.cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px) rotateX(15deg)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) rotateX(0)';
      }, index * 150);
    });
  }
  
  // Public method to force update
  refresh() {
    this.handleScroll();
  }
}

// Auto-rotate phases when section is in view
class MorphingCardAutoRotate {
  constructor(cardsInstance) {
    this.cards = cardsInstance;
    this.interval = null;
    this.isVisible = false;
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.5 });
    
    if (this.cards.container) {
      observer.observe(this.cards.container);
    }
  }
  
  start() {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
      if (!this.isVisible) return;
      
      const nextPhase = (this.cards.currentPhase + 1) % this.cards.phases;
      this.cards.updatePhase(nextPhase);
    }, 4000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const morphingCards = new MorphingCards();
    window.morphingCards = morphingCards;
    window.morphingAutoRotate = new MorphingCardAutoRotate(morphingCards);
  });
} else {
  const morphingCards = new MorphingCards();
  window.morphingCards = morphingCards;
  window.morphingAutoRotate = new MorphingCardAutoRotate(morphingCards);
}

export { MorphingCards, MorphingCardAutoRotate };
