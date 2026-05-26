/**
 * Skeleton Loading States
 * Progressive content loading with skeleton placeholders
 */

(function() {
  'use strict';

  class SkeletonLoader {
    constructor() {
      this.observers = new Map();
      this.init();
    }

    init() {
      this.initLazyImages();
      this.initContentLoading();
      this.initPageLoader();
    }

    // Progressive image loading
    initLazyImages() {
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '50px' });

      images.forEach(img => {
        // Wrap in progressive container if not already
        if (!img.parentElement.classList.contains('progressive-image')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'progressive-image';
          
          const skeleton = document.createElement('div');
          skeleton.className = 'skeleton';
          
          img.parentElement.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          wrapper.appendChild(skeleton);
        }
        
        imageObserver.observe(img);
      });
    }

    loadImage(img) {
      const src = img.dataset.src;
      if (!src) return;

      const tempImage = new Image();
      tempImage.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
      tempImage.src = src;
    }

    // Content section loading
    initContentLoading() {
      const sections = document.querySelectorAll('[data-loading]');
      
      sections.forEach(section => {
        const delay = parseInt(section.dataset.loading) || 0;
        
        setTimeout(() => {
          section.classList.add('loaded');
        }, delay);
      });
    }

    // Page loader
    initPageLoader() {
      const loader = document.querySelector('.page-loader');
      if (!loader) return;

      // Hide loader when page is ready
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.classList.add('hidden');
        }, 500);
      });

      // Fallback: hide after max 3 seconds
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 3000);
    }

    // Create skeleton for dynamic content
    static createSkeleton(type, count = 1) {
      const templates = {
        card: `
          <div class="skeleton-card">
            <div class="skeleton skeleton-image" style="margin-bottom: 20px;"></div>
            <div class="skeleton skeleton-title" style="width: 80%;"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        `,
        service: `
          <div class="skeleton skeleton-service-card">
            <div style="padding: 30px;">
              <div class="skeleton skeleton-avatar" style="margin-bottom: 20px;"></div>
              <div class="skeleton skeleton-title" style="width: 70%;"></div>
              <div class="skeleton skeleton-text medium"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        `,
        project: `
          <div class="skeleton skeleton-project-card">
            <div class="skeleton" style="height: 60%;"></div>
            <div style="padding: 20px;">
              <div class="skeleton skeleton-title" style="width: 60%;"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        `,
        stat: `
          <div class="skeleton skeleton-stat-card" style="display: flex; align-items: center; gap: 15px; padding: 30px;">
            <div class="skeleton skeleton-avatar large"></div>
            <div style="flex: 1;">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        `,
        text: `
          <div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        `
      };

      const template = templates[type] || templates.text;
      return template.repeat(count);
    }

    // Replace skeleton with content
    static replaceSkeleton(container, content) {
      const skeleton = container.querySelector('.skeleton-container');
      if (skeleton) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 400);
      }
      
      const contentEl = container.querySelector('.content');
      if (contentEl) {
        contentEl.innerHTML = content;
        contentEl.style.opacity = '1';
      }
    }

    // Show loading state for AJAX requests
    static showLoading(element, type = 'spinner') {
      const loaders = {
        spinner: '<div class="spinner"></div>',
        dots: `
          <div class="loading-pulse">
            <div class="loading-pulse-dot"></div>
            <div class="loading-pulse-dot"></div>
            <div class="loading-pulse-dot"></div>
          </div>
        `,
        text: '<span class="loading-text">Loading...</span>'
      };

      element.dataset.originalContent = element.innerHTML;
      element.innerHTML = loaders[type] || loaders.spinner;
      element.disabled = true;
    }

    // Hide loading state
    static hideLoading(element) {
      if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
      }
      element.disabled = false;
    }
  }

  // Expose to global scope
  window.SkeletonLoader = SkeletonLoader;

  // Initialize on DOM ready
  function init() {
    new SkeletonLoader();
    console.log('💀 Skeleton Loading initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
