/**
 * Advanced Skeleton Loading System - v81.4
 * Fortune 500 style skeleton loading screens with shimmer effects
 */

(function() {
  'use strict';

  class SkeletonLoader {
    constructor(options = {}) {
      this.options = {
        minDisplayTime: options.minDisplayTime || 800,
        fadeOutDuration: options.fadeOutDuration || 400,
        shimmerSpeed: options.shimmerSpeed || 1.5,
        ...options
      };

      this.loaders = new Map();
      this.observer = null;

      this.init();
    }

    init() {
      this.setupGlobalStyles();
      this.setupLazyLoading();
      this.setupAutomaticSkeletons();
    }

    setupGlobalStyles() {
      // Update skeleton animation speed from options
      const style = document.createElement('style');
      style.textContent = `
        .skeleton {
          animation-duration: ${this.options.shimmerSpeed}s;
        }
      `;
      document.head.appendChild(style);
    }

    setupLazyLoading() {
      // Observe images and replace with skeleton until loaded
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.wrapImageWithSkeleton(img);
            this.observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      document.querySelectorAll('img[data-skeleton]').forEach(img => {
        this.observer.observe(img);
      });
    }

    wrapImageWithSkeleton(img) {
      const container = document.createElement('div');
      container.className = 'skeleton-container loading';
      container.style.cssText = img.style.cssText;
      container.style.position = 'relative';

      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-image ${img.dataset.skeletonClass || ''}`;
      skeleton.style.cssText = `
        position: absolute;
        inset: 0;
        ${img.style.aspectRatio ? `aspect-ratio: ${img.style.aspectRatio};` : ''}
      `;

      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';

      img.parentNode.insertBefore(container, img);
      container.appendChild(skeleton);
      container.appendChild(img);

      // Load handler
      const handleLoad = () => {
        img.style.opacity = '1';
        setTimeout(() => {
          skeleton.remove();
          container.classList.remove('loading');
        }, this.options.fadeOutDuration);
      };

      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', () => {
          skeleton.style.background = 'rgba(244, 67, 54, 0.1)';
        }, { once: true });
      }
    }

    setupAutomaticSkeletons() {
      // Auto-generate skeleton for sections with data-auto-skeleton
      document.querySelectorAll('[data-auto-skeleton]').forEach(section => {
        const type = section.dataset.autoSkeleton;
        this.generateSkeleton(section, type);
      });
    }

    generateSkeleton(container, type) {
      const skeletonHTML = this.getSkeletonTemplate(type);
      const skeletonWrapper = document.createElement('div');
      skeletonWrapper.className = 'skeleton-placeholder skeleton-stagger';
      skeletonWrapper.innerHTML = skeletonHTML;

      const content = container.innerHTML;
      container.innerHTML = '';
      container.classList.add('skeleton-container', 'loading');
      container.appendChild(skeletonWrapper);

      // Store actual content
      const contentDiv = document.createElement('div');
      contentDiv.className = 'skeleton-content';
      contentDiv.innerHTML = content;
      container.appendChild(contentDiv);

      // Simulate loading
      this.simulateLoading(container);
    }

    getSkeletonTemplate(type) {
      const templates = {
        hero: `
          <div class="skeleton-hero">
            <div class="skeleton-hero-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text w-75"></div>
              <div class="skeleton skeleton-button"></div>
            </div>
            <div class="skeleton skeleton-hero-image"></div>
          </div>
        `,
        stats: `
          <div class="skeleton-stats">
            ${[1, 2, 3, 4].map(() => `
              <div class="skeleton-stat-item">
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-stat-label"></div>
              </div>
            `).join('')}
          </div>
        `,
        services: `
          <div class="skeleton-services-grid">
            ${[1, 2, 3, 4].map(() => `
              <div class="skeleton-service-card">
                <div class="skeleton skeleton-service-icon"></div>
                <div class="skeleton skeleton-service-title"></div>
                <div class="skeleton skeleton-service-text"></div>
                <div class="skeleton skeleton-service-text w-75"></div>
              </div>
            `).join('')}
          </div>
        `,
        projects: `
          <div class="skeleton-projects-grid">
            ${[1, 2, 3].map(() => `
              <div class="skeleton-project-card">
                <div class="skeleton skeleton-project-image"></div>
                <div class="skeleton-project-content">
                  <div class="skeleton skeleton-project-title"></div>
                  <div class="skeleton skeleton-project-meta"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `,
        team: `
          <div class="skeleton-team-grid">
            ${[1, 2, 3, 4].map(() => `
              <div class="skeleton-team-card">
                <div class="skeleton skeleton-team-avatar"></div>
                <div class="skeleton skeleton-team-name"></div>
                <div class="skeleton skeleton-team-role"></div>
              </div>
            `).join('')}
          </div>
        `,
        form: `
          <div class="skeleton-form">
            ${[1, 2, 3].map(() => `
              <div class="skeleton-form-group">
                <div class="skeleton skeleton-form-label"></div>
                <div class="skeleton skeleton-form-input"></div>
              </div>
            `).join('')}
            <div class="skeleton-form-group">
              <div class="skeleton skeleton-form-label"></div>
              <div class="skeleton skeleton-form-textarea"></div>
            </div>
            <div class="skeleton skeleton-button w-100"></div>
          </div>
        `,
        nav: `
          <div class="skeleton-nav">
            <div class="skeleton skeleton-logo"></div>
            <div class="skeleton-nav-links">
              ${[1, 2, 3, 4, 5].map(() => `
                <div class="skeleton skeleton-nav-link"></div>
              `).join('')}
            </div>
            <div class="skeleton skeleton-nav-btn"></div>
          </div>
        `,
        cards: `
          <div class="skeleton-projects-grid">
            ${[1, 2, 3, 4, 5, 6].map(() => `
              <div class="skeleton-card skeleton-card-full">
                <div class="skeleton skeleton-image" style="height: 200px;"></div>
                <div class="skeleton skeleton-title" style="width: 80%;"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text w-75"></div>
                <div class="skeleton skeleton-text w-50"></div>
              </div>
            `).join('')}
          </div>
        `
      };

      return templates[type] || templates.cards;
    }

    simulateLoading(container) {
      const startTime = Date.now();
      const contentDiv = container.querySelector('.skeleton-content');

      // Process any scripts in the content
      const scripts = contentDiv.querySelectorAll('script');
      let loadedCount = 0;
      const totalScripts = scripts.length;

      if (totalScripts === 0) {
        this.completeLoading(container, startTime);
        return;
      }

      scripts.forEach(script => {
        if (script.src) {
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.onload = () => {
            loadedCount++;
            if (loadedCount >= totalScripts) {
              this.completeLoading(container, startTime);
            }
          };
          newScript.onerror = () => {
            loadedCount++;
            if (loadedCount >= totalScripts) {
              this.completeLoading(container, startTime);
            }
          };
          script.parentNode.replaceChild(newScript, script);
        } else {
          loadedCount++;
        }
      });

      // Fallback timeout
      setTimeout(() => {
        this.completeLoading(container, startTime);
      }, 5000);
    }

    completeLoading(container, startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, this.options.minDisplayTime - elapsed);

      setTimeout(() => {
        const placeholder = container.querySelector('.skeleton-placeholder');
        const content = container.querySelector('.skeleton-content');

        if (placeholder) {
          placeholder.style.opacity = '0';
          placeholder.style.transition = `opacity ${this.options.fadeOutDuration}ms ease`;
        }

        content.classList.add('loaded');

        setTimeout(() => {
          if (placeholder) placeholder.remove();
          container.classList.remove('loading');
          container.classList.add('loaded');
        }, this.options.fadeOutDuration);
      }, remaining);
    }

    // Public API methods
    showSkeleton(selector, type) {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) return;

      this.generateSkeleton(element, type || 'cards');
    }

    hideSkeleton(selector) {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) return;

      this.completeLoading(element, 0);
    }

    createInlineSkeleton(options = {}) {
      const {
        type = 'text',
        width = '100%',
        height = '16px',
        className = ''
      } = options;

      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type} ${className}`;
      skeleton.style.width = width;
      if (height) skeleton.style.height = height;

      return skeleton;
    }

    // Dynamic content loading
    async loadWithSkeleton(target, asyncFn, options = {}) {
      const type = options.skeletonType || 'cards';
      const container = typeof target === 'string' ? document.querySelector(target) : target;

      if (!container) return;

      // Show skeleton
      const originalContent = container.innerHTML;
      this.generateSkeleton(container, type);

      try {
        const result = await asyncFn();
        return result;
      } catch (error) {
        container.innerHTML = `
          <div class="skeleton-error" style="text-align: center; padding: 40px;">
            <p style="color: rgba(201, 206, 214, 0.6);">Failed to load content.</p>
            <button onclick="this.closest('.skeleton-container').innerHTML = \`${originalContent.replace(/`/g, '\\`')}\`; skeletonLoader.loadWithSkeleton(this.closest('.skeleton-container'), ${asyncFn.toString()}, { skeletonType: '${type}' })" 
                    style="margin-top: 16px; padding: 12px 24px; background: rgba(201, 206, 214, 0.1); border: 1px solid rgba(201, 206, 214, 0.2); border-radius: 8px; color: #C9CED6; cursor: pointer;">
              Retry
            </button>
          </div>
        `;
        throw error;
      }
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.skeletonLoader = new SkeletonLoader();
    });
  } else {
    window.skeletonLoader = new SkeletonLoader();
  }

  window.SkeletonLoader = SkeletonLoader;
})();
