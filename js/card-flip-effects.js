// BuildBridge - 3D Card Flip Effects
// Fortune 500-style interactive card animations
// Version 5.0 Professional Enhancement

class CardFlipEffects {
  constructor() {
    this.cards = [];
    this.init();
  }
  
  init() {
    this.findCards();
    this.setupCards();
    this.bindEvents();
  }
  
  findCards() {
    // Find cards with flip effect enabled
    const selectors = [
      '.service-card.flip-card',
      '.team-card.flip-card',
      '.pricing-card.flip-card',
      '[data-flip="true"]'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        this.cards.push({
          element: card,
          isFlipped: false,
          isAnimating: false
        });
      });
    });
  }
  
  setupCards() {
    this.cards.forEach(cardObj => {
      const card = cardObj.element;
      
      // Ensure proper 3D context
      card.style.perspective = '1000px';
      card.style.transformStyle = 'preserve-3d';
      
      // Find or create flip containers
      let front = card.querySelector('.card-front');
      let back = card.querySelector('.card-back');
      
      if (!front) {
        // Wrap existing content as front
        front = document.createElement('div');
        front.className = 'card-front';
        while (card.firstChild) {
          front.appendChild(card.firstChild);
        }
        card.appendChild(front);
      }
      
      if (!back) {
        // Create back from data attribute or clone
        back = document.createElement('div');
        back.className = 'card-back';
        
        // Check for data-back-content
        const backContent = card.dataset.backContent || card.dataset.flipContent;
        if (backContent) {
          back.innerHTML = backContent;
        } else {
          // Create default back content
          back.innerHTML = this.createDefaultBackContent(card);
        }
        
        card.appendChild(back);
      }
      
      // Add flip button if not present
      if (!card.querySelector('.flip-trigger')) {
        const flipBtn = document.createElement('button');
        flipBtn.className = 'flip-trigger';
        flipBtn.innerHTML = '↻';
        flipBtn.setAttribute('aria-label', 'Flip card');
        card.appendChild(flipBtn);
        
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.flipCard(cardObj);
        });
      }
      
      cardObj.front = front;
      cardObj.back = back;
      
      // Touch support
      this.addTouchSupport(cardObj);
    });
  }
  
  createDefaultBackContent(card) {
    const title = card.querySelector('h3')?.textContent || '';
    const icon = card.querySelector('.service-icon')?.textContent || '🔧';
    
    return `
      <div class="card-back-content">
        <span class="card-back-icon">${icon}</span>
        <h4>${title}</h4>
        <p>Click to learn more about our premium ${title.toLowerCase()} services.</p>
        <a href="#contact" class="btn btn-sm">Get in Touch</a>
      </div>
    `;
  }
  
  addTouchSupport(cardObj) {
    const card = cardObj.element;
    let touchStartX = 0;
    let touchEndX = 0;
    
    card.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    card.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(cardObj, touchStartX, touchEndX);
    }, { passive: true });
  }
  
  handleSwipe(cardObj, startX, endX) {
    const threshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      this.flipCard(cardObj);
    }
  }
  
  flipCard(cardObj) {
    if (cardObj.isAnimating) return;
    
    cardObj.isAnimating = true;
    cardObj.isFlipped = !cardObj.isFlipped;
    
    const card = cardObj.element;
    
    // Apply flip animation
    if (cardObj.isFlipped) {
      card.classList.add('flipped');
      card.style.transform = 'rotateY(180deg)';
    } else {
      card.classList.remove('flipped');
      card.style.transform = 'rotateY(0deg)';
    }
    
    // Accessibility
    card.setAttribute('aria-pressed', cardObj.isFlipped.toString());
    
    // Reset animation flag
    setTimeout(() => {
      cardObj.isAnimating = false;
    }, 600);
  }
  
  bindEvents() {
    // Add hover flip for desktop
    this.cards.forEach(cardObj => {
      const card = cardObj.element;
      
      // Only add hover on non-touch devices
      if (!window.matchMedia('(pointer: coarse)').matches) {
        card.addEventListener('mouseenter', () => {
          if (card.dataset.flipOnHover === 'true') {
            this.flipCard(cardObj);
          }
        });
        
        card.addEventListener('mouseleave', () => {
          if (card.dataset.flipOnHover === 'true' && cardObj.isFlipped) {
            this.flipCard(cardObj);
          }
        });
      }
      
      // Click to flip (if not using flip button)
      card.addEventListener('click', (e) => {
        if (card.dataset.flipOnClick === 'true' && !e.target.closest('.flip-trigger')) {
          this.flipCard(cardObj);
        }
      });
    });
  }
  
  // Method to flip all cards at once (for dramatic effect)
  flipAll() {
    this.cards.forEach((cardObj, index) => {
      setTimeout(() => {
        this.flipCard(cardObj);
      }, index * 100);
    });
  }
  
  reset() {
    this.cards.forEach(cardObj => {
      if (cardObj.isFlipped) {
        this.flipCard(cardObj);
      }
    });
  }
}

// Advanced 3D Card Stack
class CardStack3D {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.cards = [];
    this.currentIndex = 0;
    this.init();
  }
  
  init() {
    this.findCards();
    this.setupStack();
    this.bindEvents();
  }
  
  findCards() {
    this.cards = Array.from(this.container.querySelectorAll('.stack-card'));
  }
  
  setupStack() {
    this.cards.forEach((card, index) => {
      card.style.zIndex = this.cards.length - index;
      card.style.transform = `translateY(${index * 10}px) scale(${1 - index * 0.05})`;
      card.style.opacity = index < 3 ? 1 : 0;
    });
  }
  
  bindEvents() {
    this.container.addEventListener('click', () => this.nextCard());
    
    // Touch swipe
    let touchStartY = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextCard();
        } else {
          this.prevCard();
        }
      }
    });
  }
  
  nextCard() {
    const currentCard = this.cards[this.currentIndex];
    if (!currentCard) return;
    
    // Animate current card out
    currentCard.style.transform = 'translateX(-120%) rotate(-20deg)';
    currentCard.style.opacity = '0';
    
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateStack();
  }
  
  prevCard() {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    const currentCard = this.cards[this.currentIndex];
    
    currentCard.style.transform = '';
    currentCard.style.opacity = '1';
    
    this.updateStack();
  }
  
  updateStack() {
    this.cards.forEach((card, index) => {
      const offset = (index - this.currentIndex + this.cards.length) % this.cards.length;
      
      if (offset === 0) {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.opacity = '1';
        card.style.zIndex = this.cards.length;
      } else if (offset < 3) {
        card.style.transform = `translateY(${offset * 10}px) scale(${1 - offset * 0.05})`;
        card.style.opacity = 1 - offset * 0.3;
        card.style.zIndex = this.cards.length - offset;
      } else {
        card.style.opacity = '0';
        card.style.zIndex = 1;
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cardFlipEffects = new CardFlipEffects();
  
  // Initialize card stacks if they exist
  document.querySelectorAll('.card-stack-3d').forEach(stack => {
    new CardStack3D(stack);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CardFlipEffects, CardStack3D };
}
