/**
 * v90.0: Advanced 3D Perspective Card Gallery
 * Fortune 500 Quality Scroll-Triggered Gallery with 3D effects
 */

class PerspectiveGallery {
  constructor(container) {
    this.container = container;
    this.cards = [];
    this.observer = null;
    this.tiltEnabled = !window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    this.cards = this.container.querySelectorAll('.perspective-card');
    if (!this.cards.length) return;
    
    this.setupIntersectionObserver();
    if (this.tiltEnabled) {
      this.setup3DTilt();
    }
    this.setupParallax();
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.revealCard(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
    
    this.cards.forEach(card => {
      this.observer.observe(card);
    });
  }
  
  revealCard(card) {
    const delay = parseFloat(getComputedStyle(card).transitionDelay) || 0;
    
    setTimeout(() => {
      card.classList.add('revealed');
      this.animateCardStats(card);
      this.animateCardContent(card);
    }, delay * 1000);
  }
  
  animateCardStats(card) {
    const stats = card.querySelectorAll('.perspective-stat-value');
    stats.forEach((stat, index) => {
      const finalValue = stat.textContent;
      const isNumeric = /^[\d,.]+/.test(finalValue);
      
      if (isNumeric) {
        const numValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
        const prefix = finalValue.match(/^[^\d]*/)?.[0] || '';
        const suffix = finalValue.match(/[^\d]*$/)?.[0] || '';
        
        this.animateNumber(stat, 0, numValue, 1500, prefix, suffix, index * 150);
      }
    });
  }
  
  animateNumber(element, start, end, duration, prefix = '', suffix = '', delay = 0) {
    setTimeout(() => {
      const startTime = performance.now();
      const range = end - start;
      
      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-expo)
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        const current = start + (range * easeProgress);
        
        // Format number
        let formatted;
        if (end % 1 !== 0) {
          formatted = current.toFixed(1);
        } else {
          formatted = Math.round(current).toLocaleString();
        }
        
        element.textContent = prefix + formatted + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        }
      };
      
      requestAnimationFrame(updateNumber);
    }, delay);
  }
  
  animateCardContent(card) {
    const title = card.querySelector('.perspective-card-title');
    const category = card.querySelector('.perspective-card-category');
    const location = card.querySelector('.perspective-card-location');
    
    if (title) {
      title.style.opacity = '0';
      title.style.transform = 'translateY(20px)';
      setTimeout(() => {
        title.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 200);
    }
    
    if (category) {
      category.style.opacity = '0';
      setTimeout(() => {
        category.style.transition = 'opacity 0.5s ease';
        category.style.opacity = '0.6';
      }, 100);
    }
    
    if (location) {
      location.style.opacity = '0';
      location.style.transform = 'translateX(-10px)';
      setTimeout(() => {
        location.style.transition = 'all 0.5s ease';
        location.style.opacity = '1';
        location.style.transform = 'translateX(0)';
      }, 300);
    }
  }
  
  setup3DTilt() {
    this.cards.forEach(card => {
      const inner = card.querySelector('.perspective-card-inner');
      if (!inner) return;
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Move content slightly for parallax effect
        const content = card.querySelector('.perspective-card-content');
        const image = card.querySelector('.perspective-card-image');
        
        if (content) {
          content.style.transform = `translateZ(30px) translateX(${(x - centerX) / centerX * 5}px)`;
        }
        if (image) {
          image.style.transform = `translateZ(20px) scale(1.05)`;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        
        const content = card.querySelector('.perspective-card-content');
        const image = card.querySelector('.perspective-card-image');
        
        if (content) {
          content.style.transform = 'translateZ(30px)';
        }
        if (image) {
          image.style.transform = 'translateZ(20px)';
        }
      });
    });
  }
  
  setupParallax() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  updateParallax() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    this.cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = (cardCenter - viewportCenter) / viewportHeight;
      
      // Subtle parallax based on position in viewport
      const translateZ = distance * 20;
      const rotateX = distance * 2;
      
      if (!card.matches(':hover')) {
        const inner = card.querySelector('.perspective-card-inner');
        if (inner) {
          inner.style.transform = `translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
        }
      }
    });
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize all perspective galleries
document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.perspective-gallery-container');
  galleries.forEach(gallery => {
    new PerspectiveGallery(gallery);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerspectiveGallery;
}
