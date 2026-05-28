/**
 * Bento Grid System v36.2
 * Fortune 500 Modern Grid Layout Controller
 * Apple/Google inspired modular interactions
 */

class BentoGrid {
  constructor(options = {}) {
    this.options = {
      selector: '.bento-grid',
      cardSelector: '.bento-card',
      revealOnScroll: true,
      magneticHover: true,
      tiltEffect: true,
      ...options
    };
    
    this.grids = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.findGrids();
    this.setupScrollReveal();
    this.setupInteractions();
    this.setupResponsiveBehavior();
  }
  
  findGrids() {
    const gridElements = document.querySelectorAll(this.options.selector);
    
    this.grids = Array.from(gridElements).map(grid => ({
      element: grid,
      cards: Array.from(grid.querySelectorAll(this.options.cardSelector)),
      layout: this.detectLayout(grid)
    }));
  }
  
  detectLayout(grid) {
    if (grid.classList.contains('bento-grid--hero')) return 'hero';
    if (grid.classList.contains('bento-grid--services')) return 'services';
    if (grid.classList.contains('bento-grid--features')) return 'features';
    if (grid.classList.contains('bento-grid--showcase')) return 'showcase';
    return 'standard';
  }
  
  setupScrollReveal() {
    if (!this.options.revealOnScroll) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      this.grids.forEach(grid => {
        grid.cards.forEach(card => card.classList.add('revealed'));
      });
      return;
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = this.calculateRevealDelay(card);
          
          setTimeout(() => {
            card.classList.add('revealed');
          }, delay);
          
          this.observer.unobserve(card);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    this.grids.forEach(grid => {
      grid.cards.forEach(card => {
        this.observer.observe(card);
      });
    });
  }
  
  calculateRevealDelay(card) {
    const grid = card.closest(this.options.selector);
    const cards = Array.from(grid.querySelectorAll(this.options.cardSelector));
    const index = cards.indexOf(card);
    
    // Calculate delay based on position in grid
    return index * 80;
  }
  
  setupInteractions() {
    this.grids.forEach(grid => {
      grid.cards.forEach(card => {
        this.setupCardHover(card);
        this.setupCardClick(card);
      });
    });
  }
  
  setupCardHover(card) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    // Magnetic hover effect for featured cards
    if (card.classList.contains('bento-card--large') || 
        card.classList.contains('bento-card--featured')) {
      this.setupMagneticHover(card);
    }
    
    // 3D tilt effect
    if (this.options.tiltEffect && !card.classList.contains('bento-card--no-tilt')) {
      this.setupTiltEffect(card);
    }
  }
  
  setupMagneticHover(card) {
    const strength = 0.1;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      card.style.transform = `
        translate(${x * strength}px, ${y * strength}px)
        translateY(-4px)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }
  
  setupTiltEffect(card) {
    const maxTilt = 5;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const tiltX = (y - 0.5) * maxTilt;
      const tiltY = (x - 0.5) * -maxTilt;
      
      card.style.transform = `
        perspective(1000px)
        rotateX(${tiltX}deg)
        rotateY(${tiltY}deg)
        translateY(-4px)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
  }
  
  setupCardClick(card) {
    const cta = card.querySelector('.bento-card__cta');
    const href = card.dataset.href || (cta && cta.getAttribute('href'));
    
    if (!href) return;
    
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking on interactive elements inside
      if (e.target.closest('a, button, input, select, textarea')) {
        return;
      }
      
      // Ripple effect
      this.createRipple(e, card);
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 200);
    });
  }
  
  createRipple(e, card) {
    const ripple = document.createElement('span');
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
      transform: scale(0);
      animation: bento-ripple 0.6s ease-out forwards;
    `;
    
    card.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  setupResponsiveBehavior() {
    const handleResize = this.debounce(() => {
      this.refreshLayouts();
    }, 250);
    
    window.addEventListener('resize', handleResize);
  }
  
  refreshLayouts() {
    this.grids.forEach(grid => {
      const newLayout = this.detectLayout(grid.element);
      if (newLayout !== grid.layout) {
        grid.layout = newLayout;
        this.animateLayoutChange(grid);
      }
    });
  }
  
  animateLayoutChange(grid) {
    grid.cards.forEach((card, index) => {
      card.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        card.style.transition = '';
      }, 400);
    });
  }
  
  // Public API
  revealAll() {
    this.grids.forEach(grid => {
      grid.cards.forEach(card => card.classList.add('revealed'));
    });
  }
  
  reset() {
    this.grids.forEach(grid => {
      grid.cards.forEach(card => card.classList.remove('revealed'));
    });
    this.setupScrollReveal();
  }
  
  refresh() {
    this.findGrids();
    this.setupScrollReveal();
    this.setupInteractions();
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.grids = [];
  }
}

/**
 * Bento Card Builder - Helper for programmatic card creation
 */
class BentoCardBuilder {
  constructor() {
    this.card = document.createElement('div');
    this.card.className = 'bento-card';
  }
  
  withSize(size) {
    if (size) {
      this.card.classList.add(`bento-card--${size}`);
    }
    return this;
  }
  
  withStyle(style) {
    if (style) {
      this.card.classList.add(`bento-card--${style}`);
    }
    return this;
  }
  
  withImage(src, alt = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'bento-card__image';
    this.card.appendChild(img);
    
    const overlay = document.createElement('div');
    overlay.className = 'bento-card__image-overlay';
    this.card.appendChild(overlay);
    
    this.card.classList.add('bento-card--image');
    return this;
  }
  
  withContent({ eyebrow, title, description, cta, href }) {
    const content = document.createElement('div');
    content.className = 'bento-card__content';
    
    if (eyebrow) {
      const eyebrowEl = document.createElement('span');
      eyebrowEl.className = 'bento-card__eyebrow';
      eyebrowEl.textContent = eyebrow;
      content.appendChild(eyebrowEl);
    }
    
    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'bento-card__title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }
    
    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'bento-card__description';
      descEl.textContent = description;
      content.appendChild(descEl);
    }
    
    if (cta) {
      const ctaEl = document.createElement('a');
      ctaEl.className = 'bento-card__cta';
      ctaEl.href = href || '#';
      ctaEl.innerHTML = `${cta} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      content.appendChild(ctaEl);
    }
    
    this.card.appendChild(content);
    return this;
  }
  
  withIcon(iconSvg) {
    const iconContainer = document.createElement('div');
    iconContainer.className = 'bento-card__icon';
    iconContainer.innerHTML = iconSvg;
    
    const content = this.card.querySelector('.bento-card__content');
    if (content) {
      content.insertBefore(iconContainer, content.firstChild);
    } else {
      this.card.appendChild(iconContainer);
    }
    
    return this;
  }
  
  withBadge(text, type = '') {
    const badge = document.createElement('span');
    badge.className = `bento-card__badge ${type ? `bento-card__badge--${type}` : ''}`;
    badge.textContent = text;
    this.card.appendChild(badge);
    return this;
  }
  
  withStats(stats) {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'bento-card__stats';
    
    stats.forEach(stat => {
      const statEl = document.createElement('div');
      statEl.className = 'bento-stat';
      statEl.innerHTML = `
        <span class="bento-stat__value">${stat.value}</span>
        <span class="bento-stat__label">${stat.label}</span>
      `;
      statsContainer.appendChild(statEl);
    });
    
    const content = this.card.querySelector('.bento-card__content');
    if (content) {
      content.appendChild(statsContainer);
    }
    
    return this;
  }
  
  withLink(href) {
    this.card.dataset.href = href;
    return this;
  }
  
  build() {
    return this.card;
  }
  
  appendTo(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.appendChild(this.card);
    }
    return this.card;
  }
}

// CSS Animation for ripple effect
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
  @keyframes bento-ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyles);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.bentoGrid = new BentoGrid();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BentoGrid, BentoCardBuilder };
}
