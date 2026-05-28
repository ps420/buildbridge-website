/**
 * v45.0: 3D Card Stack System v2
 * Fortune 500 Interactive Scroll-Driven Card Experience
 */

(function() {
  'use strict';

  class CardStackV2 {
    constructor(container) {
      this.container = container;
      this.wrapper = container.querySelector('.card-stack-v2-wrapper');
      this.cards = Array.from(container.querySelectorAll('.card-stack-v2-item'));
      this.progressBar = container.querySelector('.card-stack-v2-progress-fill');
      this.navDots = Array.from(container.querySelectorAll('.card-stack-v2-dot'));
      
      this.currentIndex = 0;
      this.cardCount = this.cards.length;
      this.scrollProgress = 0;
      this.isActive = true;
      
      this.init();
    }

    init() {
      this.setupCards();
      this.bindScroll();
      this.bindNavigation();
      this.addMagneticEffect();
    }

    setupCards() {
      this.cards.forEach((card, index) => {
        card.style.zIndex = this.cardCount - index;
        
        // Store original index
        card.dataset.index = index;
      });
    }

    bindScroll() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!this.isActive) return;
        
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateOnScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Initial update
      this.updateOnScroll();
    }

    updateOnScroll() {
      const rect = this.container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the section
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Progress from 0 to 1 as we scroll through section
      let progress = -sectionTop / (sectionHeight - windowHeight);
      progress = Math.max(0, Math.min(1, progress));
      
      this.scrollProgress = progress;
      
      // Update progress bar
      if (this.progressBar) {
        this.progressBar.style.height = `${progress * 100}%`;
      }
      
      // Calculate which card should be active
      const cardProgress = progress * (this.cardCount - 1);
      const activeIndex = Math.floor(cardProgress);
      const cardOffset = cardProgress - activeIndex;
      
      // Update current index
      this.currentIndex = Math.min(activeIndex, this.cardCount - 1);
      
      // Update cards
      this.cards.forEach((card, index) => {
        this.updateCardTransform(card, index, activeIndex, cardOffset);
      });
      
      // Update navigation dots
      this.updateNavDots();
    }

    updateCardTransform(card, index, activeIndex, offset) {
      const cardIndex = parseInt(card.dataset.index);
      const relativeIndex = cardIndex - activeIndex;
      
      let translateX = 0;
      let translateY = 0;
      let translateZ = 0;
      let rotateX = 0;
      let rotateY = 0;
      let opacity = 1;
      let scale = 1;
      
      if (relativeIndex < 0) {
        // Cards that have been scrolled past
        translateY = -100 - (Math.abs(relativeIndex) * 50);
        translateZ = -200 * Math.abs(relativeIndex);
        rotateX = 15;
        opacity = Math.max(0, 0.3 - (Math.abs(relativeIndex) * 0.1));
        scale = 0.9;
      } else if (relativeIndex === 0) {
        // Active card
        translateY = -offset * 50;
        translateZ = offset * 100;
        rotateX = -offset * 10;
        opacity = 1 - offset * 0.3;
        scale = 1 - offset * 0.05;
      } else {
        // Cards coming up
        translateY = 100 + (relativeIndex * 30);
        translateZ = -100 * relativeIndex;
        rotateX = -10;
        opacity = 0;
        scale = 0.95;
      }
      
      // Apply transforms
      card.style.transform = `
        translate(-50%, -50%)
        translate3d(${translateX}px, ${translateY}px, ${translateZ}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
      
      card.style.opacity = opacity;
    }

    updateNavDots() {
      this.navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
      });
    }

    bindNavigation() {
      // Click on dots to jump to card
      this.navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.scrollToCard(index);
        });
      });
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextCard();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevCard();
        }
      });
    }

    scrollToCard(index) {
      const rect = this.container.getBoundingClientRect();
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const scrollTarget = window.scrollY + rect.top + 
        (sectionHeight - windowHeight) * (index / (this.cardCount - 1));
      
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    }

    nextCard() {
      if (this.currentIndex < this.cardCount - 1) {
        this.scrollToCard(this.currentIndex + 1);
      }
    }

    prevCard() {
      if (this.currentIndex > 0) {
        this.scrollToCard(this.currentIndex - 1);
      }
    }

    addMagneticEffect() {
      this.cards.forEach(card => {
        const glow = card.querySelector('.card-stack-v2-glow');
        if (!glow) return;
        
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - 150;
          const y = e.clientY - rect.top - 150;
          
          glow.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
    }

    destroy() {
      this.isActive = false;
    }
  }

  // Initialize
  function init() {
    document.querySelectorAll('.card-stack-v2-section').forEach(section => {
      new CardStackV2(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.CardStackV2 = CardStackV2;
})();
