/**
 * Floating Card Grid v13.0
 * Fortune 500 Levitation Effects
 * Cards with floating animations and magnetic hover effects
 */

(function() {
  'use strict';

  class FloatingCardGrid {
    constructor(options = {}) {
      this.options = {
        magneticStrength: options.magneticStrength || 0.2,
        tiltEnabled: options.tiltEnabled !== false,
        maxTilt: options.maxTilt || 10,
        glareEnabled: options.glareEnabled !== false
      };

      this.cards = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.isTouch = window.matchMedia('(pointer: coarse)').matches;

      this.init();
    }

    init() {
      this.cards = document.querySelectorAll('.floating-card');
      
      if (this.cards.length === 0) return;

      // Add entrance animation class
      const grids = document.querySelectorAll('.floating-card-grid');
      grids.forEach(grid => {
        // Use Intersection Observer for entrance animation
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        observer.observe(grid);
      });

      // Skip advanced effects on touch devices
      if (this.isTouch) {
        this.cards.forEach(card => {
          card.style.animation = 'none';
        });
        return;
      }

      // Add glare element to cards
      if (this.options.glareEnabled) {
        this.cards.forEach(card => {
          if (!card.querySelector('.floating-card__glow')) {
            const glow = document.createElement('div');
            glow.className = 'floating-card__glow';
            card.appendChild(glow);
          }
          
          if (!card.querySelector('.floating-card__shine')) {
            const shine = document.createElement('div');
            shine.className = 'floating-card__shine';
            card.appendChild(shine);
          }
        });
      }

      // Track mouse movement
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.updateCards();
      }, { passive: true });

      // Reset cards when mouse leaves
      document.addEventListener('mouseleave', () => {
        this.resetCards();
      });

      // Add click interaction
      this.cards.forEach(card => {
        card.addEventListener('click', () => this.handleCardClick(card));
      });
    }

    updateCards() {
      this.cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = this.mouseX - centerX;
        const deltaY = this.mouseY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Check if mouse is within card bounds + margin
        const margin = 100;
        const isNearCard = 
          this.mouseX > rect.left - margin &&
          this.mouseX < rect.right + margin &&
          this.mouseY > rect.top - margin &&
          this.mouseY < rect.bottom + margin;

        if (isNearCard && this.options.tiltEnabled) {
          // Calculate tilt based on mouse position
          const tiltX = (deltaY / (rect.height / 2)) * -this.options.maxTilt;
          const tiltY = (deltaX / (rect.width / 2)) * this.options.maxTilt;

          // Apply magnetic pull
          const pullStrength = Math.max(0, 1 - distance / (Math.max(rect.width, rect.height) + margin));
          const magneticX = deltaX * pullStrength * this.options.magneticStrength * 0.1;
          const magneticY = deltaY * pullStrength * this.options.magneticStrength * 0.1;

          card.style.transform = `
            translateY(-20px)
            translateX(${magneticX}px)
            translateY(${magneticY - 20}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale(1.02)
          `;

          // Update shine position
          const shine = card.querySelector('.floating-card__shine');
          if (shine) {
            const shineX = ((this.mouseX - rect.left) / rect.width) * 100;
            const shineY = ((this.mouseY - rect.top) / rect.height) * 100;
            shine.style.background = `
              radial-gradient(
                circle at ${shineX}% ${shineY}%,
                rgba(255, 255, 255, 0.15) 0%,
                transparent 50%
              )
            `;
          }
        } else {
          // Reset position with smooth transition
          this.resetCard(card);
        }
      });
    }

    resetCard(card) {
      // Check if card has levitation animation
      const hasLevitation = 
        card.classList.contains('floating-card--levitate-1') ||
        card.classList.contains('floating-card--levitate-2') ||
        card.classList.contains('floating-card--levitate-3') ||
        card.classList.contains('floating-card--levitate-4');

      if (!hasLevitation) {
        card.style.transform = '';
      }

      const shine = card.querySelector('.floating-card__shine');
      if (shine) {
        shine.style.background = '';
      }
    }

    resetCards() {
      this.cards.forEach(card => this.resetCard(card));
    }

    handleCardClick(card) {
      // Add click ripple
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(201, 206, 214, 0.3);
        transform: scale(0);
        animation: card-ripple 0.6s ease-out;
        pointer-events: none;
      `;

      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (this.mouseX - rect.left - size / 2) + 'px';
      ripple.style.top = (this.mouseY - rect.top - size / 2) + 'px';

      card.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);

      // Trigger confetti if available
      if (window.ConfettiEffect) {
        window.ConfettiEffect.explode({
          x: this.mouseX,
          y: this.mouseY,
          count: 20,
          colors: ['#C9CED6', '#F5F7FA', '#8B92A0']
        });
      }
    }

    // Static method to create floating cards
    static create(container, items, options = {}) {
      const grid = document.createElement('div');
      grid.className = `floating-card-grid ${options.asymmetric ? 'floating-card-grid--asymmetric' : ''}`;
      
      const levitateClasses = [
        'floating-card--levitate-1',
        'floating-card--levitate-2',
        'floating-card--levitate-3',
        'floating-card--levitate-4'
      ];

      items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `floating-card ${levitateClasses[index % levitateClasses.length]}`;
        
        if (item.featured) {
          card.classList.add('floating-card--featured');
        }

        if (item.variant) {
          card.classList.add(`floating-card--${item.variant}`);
        }

        card.innerHTML = `
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="floating-card__image">` : ''}
          <div class="floating-card__content">
            ${item.icon ? `<div class="floating-card__icon">${item.icon}</div>` : ''}
            ${item.number !== undefined ? `<div class="floating-card__number" data-count="${item.number}">${item.number}</div>` : ''}
            <h3 class="floating-card__title">${item.title}</h3>
            <p class="floating-card__description">${item.description}</p>
            ${item.link ? `<a href="${item.link}" class="floating-card__link">${item.linkText || 'Learn More'}</a>` : ''}
          </div>
        `;

        grid.appendChild(card);
      });

      container.appendChild(grid);

      // Initialize the grid
      return new FloatingCardGrid(options);
    }
  }

  // Add ripple animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes card-ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.floatingCardGrid = new FloatingCardGrid();
    });
  } else {
    window.floatingCardGrid = new FloatingCardGrid();
  }

  // Expose globally
  window.FloatingCardGrid = FloatingCardGrid;
})();
