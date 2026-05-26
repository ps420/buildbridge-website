/**
 * Enhanced Skeleton Loading States
 * Fortune 500 loading experience with progressive disclosure
 */

class SkeletonLoader {
  constructor(options = {}) {
    this.options = {
      baseColor: options.baseColor || 'rgba(201, 206, 214, 0.08)',
      highlightColor: options.highlightColor || 'rgba(201, 206, 214, 0.15)',
      animationDuration: options.animationDuration || '1.5s',
      ...options
    };
    
    this.styles = null;
    this.loadingQueue = [];
    this.init();
  }
  
  init() {
    this.injectStyles();
    this.observeLazyElements();
  }
  
  injectStyles() {
    if (document.getElementById('skeleton-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'skeleton-styles';
    styles.textContent = `
      /* Enhanced Skeleton Loading */
      .skeleton {
        position: relative;
        overflow: hidden;
        background: ${this.options.baseColor};
        border-radius: 4px;
      }
      
      .skeleton::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          ${this.options.highlightColor},
          transparent
        );
        animation: skeleton-shimmer ${this.options.animationDuration} infinite;
      }
      
      @keyframes skeleton-shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      /* Skeleton Variants */
      .skeleton-text {
        height: 16px;
        margin-bottom: 12px;
      }
      
      .skeleton-text:last-child {
        width: 75%;
      }
      
      .skeleton-title {
        height: 28px;
        width: 60%;
        margin-bottom: 20px;
      }
      
      .skeleton-image {
        aspect-ratio: 16/9;
        border-radius: 8px;
      }
      
      .skeleton-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }
      
      .skeleton-card {
        border-radius: 12px;
        padding: 24px;
        background: rgba(201, 206, 214, 0.05);
        border: 1px solid rgba(201, 206, 214, 0.08);
      }
      
      .skeleton-button {
        height: 48px;
        width: 150px;
        border-radius: 6px;
      }
      
      /* Progressive Loading States */
      .skeleton-fade-out {
        animation: skeleton-fade-out 0.4s ease forwards;
      }
      
      @keyframes skeleton-fade-out {
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }
      
      /* Content Reveal */
      .content-reveal {
        animation: content-reveal 0.5s ease forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      
      @keyframes content-reveal {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Staggered Reveal for lists */
      .content-reveal-stagger > * {
        opacity: 0;
        transform: translateY(20px);
      }
      
      .content-reveal-stagger.revealed > *:nth-child(1) { animation: content-reveal 0.4s ease 0.05s forwards; }
      .content-reveal-stagger.revealed > *:nth-child(2) { animation: content-reveal 0.4s ease 0.1s forwards; }
      .content-reveal-stagger.revealed > *:nth-child(3) { animation: content-reveal 0.4s ease 0.15s forwards; }
      .content-reveal-stagger.revealed > *:nth-child(4) { animation: content-reveal 0.4s ease 0.2s forwards; }
      .content-reveal-stagger.revealed > *:nth-child(5) { animation: content-reveal 0.4s ease 0.25s forwards; }
      .content-reveal-stagger.revealed > *:nth-child(6) { animation: content-reveal 0.4s ease 0.3s forwards; }
    `;
    document.head.appendChild(styles);
  }
  
  createSkeleton(type, count = 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'skeleton-container';
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type}`;
      skeleton.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(skeleton);
    }
    
    return wrapper;
  }
  
  createCardSkeleton() {
    const card = document.createElement('div');
    card.className = 'skeleton-card skeleton';
    card.innerHTML = `
      <div class="skeleton skeleton-title" style="background: rgba(201,206,214,0.12);"></div>
      <div class="skeleton skeleton-text" style="background: rgba(201,206,214,0.1);"></div>
      <div class="skeleton skeleton-text" style="background: rgba(201,206,214,0.1);"></div>
      <div class="skeleton skeleton-text" style="width: 50%; background: rgba(201,206,214,0.1);"></div>
    `;
    return card;
  }
  
  loadElement(element, contentCallback, delay = 0) {
    // Add skeleton state
    const originalContent = element.innerHTML;
    const skeletonType = element.dataset.skeletonType || 'text';
    
    if (skeletonType === 'card') {
      element.innerHTML = '';
      element.appendChild(this.createCardSkeleton());
    } else {
      element.classList.add('skeleton');
    }
    
    // Simulate loading
    return new Promise((resolve) => {
      setTimeout(() => {
        // Fade out skeleton
        if (skeletonType === 'card') {
          const skeleton = element.querySelector('.skeleton-card');
          if (skeleton) skeleton.classList.add('skeleton-fade-out');
        } else {
          element.classList.add('skeleton-fade-out');
        }
        
        setTimeout(() => {
          // Replace with content
          element.innerHTML = contentCallback();
          element.classList.remove('skeleton', 'skeleton-fade-out');
          
          // Reveal animation
          if (element.dataset.stagger) {
            element.classList.add('content-reveal-stagger');
            setTimeout(() => element.classList.add('revealed'), 50);
          } else {
            element.classList.add('content-reveal');
          }
          
          resolve(element);
        }, 400);
      }, delay);
    });
  }
  
  observeLazyElements() {
    // Auto-load elements with data-skeleton attribute when they enter viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const type = el.dataset.skeleton || 'text';
          const delay = parseInt(el.dataset.skeletonDelay) || 300;
          
          // Store original content
          const originalHTML = el.innerHTML;
          el.dataset.originalContent = originalHTML;
          
          // Show skeleton
          this.loadElement(el, () => originalHTML, delay);
          
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    document.querySelectorAll('[data-skeleton]').forEach(el => observer.observe(el));
  }
  
  // Global loading state for page
  showPageLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-skeleton-loader';
    loader.innerHTML = `
      <div class="page-skeleton-hero">
        <div class="skeleton" style="height: 400px; width: 100%;"></div>
      </div>
      <div class="page-skeleton-content" style="padding: 60px 70px; max-width: 1200px; margin: 0 auto;">
        <div class="skeleton skeleton-title" style="width: 50%; margin-bottom: 40px;"></div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;">
          ${Array(3).fill(this.createCardSkeleton().outerHTML).join('')}
        </div>
      </div>
    `;
    loader.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0f0f10;
      z-index: 9999;
      overflow-y: auto;
    `;
    
    document.body.appendChild(loader);
    
    return {
      hide: () => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => loader.remove(), 500);
      }
    };
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.skeletonLoader = new SkeletonLoader({
    baseColor: 'rgba(201, 206, 214, 0.06)',
    highlightColor: 'rgba(201, 206, 214, 0.12)',
    animationDuration: '2s'
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkeletonLoader;
}
