/**
 * BuildBridge Pro Skeleton Loading v13.0
 * Fortune 500-grade loading states management
 */

class SkeletonLoader {
  constructor(options = {}) {
    this.options = {
      fadeDuration: 300,
      delayBeforeShow: 150,
      ...options
    };

    this.skeletons = new Map();
    this.observer = null;
    
    this.init();
  }

  init() {
    this.createObserver();
    this.scanForSkeletons();
    console.log('💀 Pro Skeleton Loading activated');
  }

  createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const skeleton = entry.target;
            const config = this.skeletons.get(skeleton);
            if (config && config.autoLoad) {
              this.load(skeleton, config.src);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  scanForSkeletons() {
    document.querySelectorAll('[data-skeleton]').forEach(el => {
      const type = el.dataset.skeleton;
      const src = el.dataset.skeletonSrc;
      const autoLoad = el.dataset.skeletonAutoload !== 'false';
      
      this.create(el, type, { src, autoLoad });
    });
  }

  create(container, type, options = {}) {
    const skeletonHTML = this.getSkeletonHTML(type, options);
    container.innerHTML = skeletonHTML;
    container.classList.add('skeleton-container');

    this.skeletons.set(container, {
      type,
      src: options.src,
      autoLoad: options.autoLoad !== false,
      loaded: false
    });

    if (options.autoLoad !== false) {
      this.observer.observe(container);
    }

    return container;
  }

  getSkeletonHTML(type, options = {}) {
    const patterns = {
      card: `
        <div class="skeleton skeleton-card">
          <div class="skeleton-card-header">
            <div class="skeleton skeleton-avatar"></div>
            <div style="flex: 1;">
              <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 8px;"></div>
              <div class="skeleton skeleton-text sm" style="width: 40%;"></div>
            </div>
          </div>
          <div class="skeleton-card-body">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
          </div>
        </div>
      `,

      service: `
        <div class="skeleton skeleton-service-card">
          <div class="skeleton skeleton-icon"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      `,

      project: `
        <div class="skeleton skeleton-project-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 50%;"></div>
          </div>
        </div>
      `,

      testimonial: `
        <div class="skeleton skeleton-testimonial">
          <div class="skeleton skeleton-quote"></div>
          <div class="skeleton-author">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton-author-info">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text sm"></div>
            </div>
          </div>
        </div>
      `,

      hero: `
        <div class="skeleton skeleton-hero">
          <div class="skeleton-hero-content">
            <div class="skeleton skeleton-title lg"></div>
            <div class="skeleton-paragraph">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width: 80%;"></div>
            </div>
            <div class="skeleton-actions">
              <div class="skeleton skeleton-button"></div>
              <div class="skeleton skeleton-button"></div>
            </div>
          </div>
          <div class="skeleton skeleton-hero-image"></div>
        </div>
      `,

      stats: `
        <div class="skeleton skeleton-stats">
          ${Array(4).fill().map(() => `
            <div class="skeleton-stat-item">
              <div class="skeleton skeleton-number"></div>
              <div class="skeleton skeleton-label"></div>
            </div>
          `).join('')}
        </div>
      `,

      nav: `
        <div class="skeleton skeleton-nav">
          <div class="skeleton skeleton-logo"></div>
          <div class="skeleton-links">
            <div class="skeleton skeleton-text md"></div>
            <div class="skeleton skeleton-text md"></div>
            <div class="skeleton skeleton-text md"></div>
            <div class="skeleton skeleton-text md"></div>
          </div>
          <div class="skeleton skeleton-cta"></div>
        </div>
      `,

      text: `
        <div class="skeleton-paragraph">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
      `,

      image: `
        <div class="skeleton skeleton-image"></div>
      `,

      avatar: `
        <div class="skeleton skeleton-avatar"></div>
      `,

      button: `
        <div class="skeleton skeleton-button"></div>
      `,

      custom: options.customHTML || ''
    };

    return patterns[type] || patterns.text;
  }

  async load(container, contentOrPromise) {
    const config = this.skeletons.get(container);
    if (!config || config.loaded) return;

    let content;

    if (typeof contentOrPromise === 'function') {
      content = await contentOrPromise();
    } else if (contentOrPromise instanceof Promise) {
      content = await contentOrPromise;
    } else {
      content = contentOrPromise;
    }

    // Small delay for visual polish
    await new Promise(resolve => setTimeout(resolve, this.options.delayBeforeShow));

    // Fade out skeleton
    container.style.transition = `opacity ${this.options.fadeDuration}ms ease`;
    container.style.opacity = '0';

    await new Promise(resolve => setTimeout(resolve, this.options.fadeDuration));

    // Replace content
    if (typeof content === 'string') {
      container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      container.innerHTML = '';
      container.appendChild(content);
    }

    // Fade in content
    container.style.opacity = '1';
    container.classList.add('loaded');

    config.loaded = true;
    this.skeletons.set(container, config);

    // Dispatch event
    container.dispatchEvent(new CustomEvent('skeletonLoaded'));

    return container;
  }

  // Quick load with delay simulation
  simulateLoad(container, delay = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.load(container, container.dataset.loadedContent || '');
        resolve(container);
      }, delay);
    });
  }

  // Show loading on specific element
  showLoading(element, type = 'text') {
    const wrapper = document.createElement('div');
    wrapper.className = 'skeleton-loading-wrapper';
    wrapper.innerHTML = this.getSkeletonHTML(type);
    
    element.style.display = 'none';
    element.parentNode.insertBefore(wrapper, element.nextSibling);
    
    return {
      hide: () => {
        wrapper.remove();
        element.style.display = '';
      }
    };
  }

  // Global loading state
  showPageLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'skeleton-page-loading';
    overlay.innerHTML = `
      <div class="skeleton skeleton-nav" style="padding: 20px 5%;"></div>
      <div style="padding: 40px 5%;">
        <div class="skeleton skeleton-hero"></div>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--bg-primary, #0f0f10);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger reflow
    overlay.offsetHeight;
    overlay.style.opacity = '1';

    return {
      hide: () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }
    };
  }

  // Remove all skeletons from page
  clearAll() {
    document.querySelectorAll('.skeleton-container').forEach(container => {
      container.classList.add('loaded');
      container.querySelectorAll('.skeleton').forEach(s => {
        s.style.animation = 'none';
        s.style.opacity = '0';
      });
    });
  }

  // Check if any skeletons are still loading
  isLoading() {
    return Array.from(this.skeletons.values()).some(c => !c.loaded);
  }

  // Get loading progress
  getProgress() {
    const configs = Array.from(this.skeletons.values());
    if (configs.length === 0) return 1;
    return configs.filter(c => c.loaded).length / configs.length;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.skeletonLoader = new SkeletonLoader();
});

// Expose to global
window.SkeletonLoader = SkeletonLoader;
