/**
 * FORTUNE 500 PROFESSIONAL FEATURES v89.0
 * BuildBridge Website Enhancement Suite
 * 
 * Features:
 * - Scroll-Triggered Animations
 * - Professional Toast Notification System
 * - Smart Breadcrumb Navigation
 * - Advanced Lazy Loading
 * - Image Zoom & Magnification
 */

// ============================================
// SCROLL-TRIGGERED ANIMATION SYSTEM
// ============================================
class ScrollAnimationEngine {
  constructor() {
    this.observers = new Map();
    this.elements = [];
    this.options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };
    
    this.init();
  }
  
  init() {
    // Detect reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.setupAnimations();
    this.setupStaggerParents();
    this.setupClipReveals();
    this.setupBlurReveals();
    this.setupParallax();
    this.setupCounters();
    this.setupCharReveals();
  }
  
  setupAnimations() {
    const elements = document.querySelectorAll('[data-scroll-animate]');
    
    if (this.prefersReducedMotion) {
      elements.forEach(el => el.classList.add('animate-in'));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Optional: animate out when leaving viewport
          if (!entry.target.dataset.stayVisible) {
            observer.unobserve(entry.target);
          }
        } else if (entry.target.dataset.stayVisible) {
          entry.target.classList.remove('animate-in');
        }
      });
    }, this.options);
    
    elements.forEach(el => observer.observe(el));
    this.observers.set('animations', observer);
  }
  
  setupStaggerParents() {
    const parents = document.querySelectorAll('[data-stagger-parent]');
    
    if (this.prefersReducedMotion) {
      parents.forEach(el => el.classList.add('animate-in'));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { ...this.options, threshold: 0.2 });
    
    parents.forEach(el => observer.observe(el));
    this.observers.set('stagger', observer);
  }
  
  setupClipReveals() {
    const elements = document.querySelectorAll('[data-clip-reveal]');
    
    if (this.prefersReducedMotion) {
      elements.forEach(el => el.classList.add('animate-in'));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add stagger delay if specified
          const delay = parseInt(entry.target.dataset.revealDelay) || 0;
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { ...this.options, threshold: 0.3 });
    
    elements.forEach(el => observer.observe(el));
    this.observers.set('clip', observer);
  }
  
  setupBlurReveals() {
    const elements = document.querySelectorAll('[data-blur-reveal]');
    
    if (this.prefersReducedMotion) {
      elements.forEach(el => el.classList.add('animate-in'));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, this.options);
    
    elements.forEach(el => observer.observe(el));
    this.observers.set('blur', observer);
  }
  
  setupParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length || window.matchMedia('(pointer: coarse)').matches) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const scrolled = window.innerHeight - rect.top;
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = scrolled * speed * 0.1;
            el.style.transform = `translateY(${yPos}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  setupCounters() {
    const counters = document.querySelectorAll('[data-counter-scroll]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target);
          entry.target.classList.add('counted');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(el => observer.observe(el));
    this.observers.set('counters', observer);
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.target) || 0;
    const duration = parseInt(element.dataset.duration) || 2000;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    
    const startTime = performance.now();
    const startValue = 0;
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + (target - startValue) * easeProgress);
      
      element.textContent = prefix + current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = prefix + target.toLocaleString() + suffix;
        element.classList.add('rolling');
      }
    };
    
    requestAnimationFrame(update);
  }
  
  setupCharReveals() {
    const elements = document.querySelectorAll('[data-char-reveal]');
    
    elements.forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${i * 30}ms`;
        el.appendChild(span);
      });
    });
    
    if (this.prefersReducedMotion) {
      elements.forEach(el => el.classList.add('animate-in'));
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    elements.forEach(el => observer.observe(el));
    this.observers.set('charReveal', observer);
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class FortuneToast {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'top-right';
    this.maxVisible = options.maxVisible || 5;
    this.toasts = [];
    this.idCounter = 0;
    
    this.init();
  }
  
  init() {
    this.createContainer();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `toast-container ${this.position}`;
    document.body.appendChild(this.container);
  }
  
  show(options) {
    const {
      type = 'info',
      title = '',
      message = '',
      duration = 5000,
      actions = [],
      showProgress = true,
      closable = true
    } = options;
    
    const id = `toast-${++this.idCounter}`;
    const toast = document.createElement('div');
    toast.className = `fortune-toast ${type}`;
    toast.id = id;
    
    // Icon mapping
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '<div class="toast-spinner"></div>'
    };
    
    const iconHtml = type === 'loading' ? icons[type] : `<span>${icons[type]}</span>`;
    
    // Build actions HTML
    const actionsHtml = actions.length ? `
      <div class="toast-actions">
        ${actions.map(a => `
          <button class="toast-action-btn ${a.type || 'secondary'}" onclick="${a.onClick || ''}">
            ${a.label}
          </button>
        `).join('')}
      </div>
    ` : '';
    
    // Progress bar
    const progressHtml = showProgress && duration > 0 ? `
      <div class="toast-progress" style="animation: toastProgress ${duration}ms linear forwards;"></div>
    ` : '';
    
    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-content">
        ${title ? `<h4 class="toast-title">${title}</h4>` : ''}
        ${message ? `<p class="toast-message">${message}</p>` : ''}
        ${actionsHtml}
      </div>
      ${closable ? `<button class="toast-close" onclick="toast.dismiss('${id}')">×</button>` : ''}
      ${progressHtml}
    `;
    
    this.container.appendChild(toast);
    this.toasts.push({ id, element: toast });
    
    // Limit visible toasts
    if (this.toasts.length > this.maxVisible) {
      const oldest = this.toasts.shift();
      this.dismiss(oldest.id);
    }
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    
    return id;
  }
  
  dismiss(id) {
    const toastIndex = this.toasts.findIndex(t => t.id === id);
    if (toastIndex === -1) return;
    
    const toast = this.toasts[toastIndex].element;
    toast.classList.add('hiding');
    toast.classList.remove('show');
    
    setTimeout(() => {
      toast.remove();
      this.toasts.splice(toastIndex, 1);
    }, 500);
  }
  
  update(id, options) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;
    
    const { type, title, message } = options;
    if (type) toast.element.className = `fortune-toast ${type} show`;
    if (title) {
      const titleEl = toast.element.querySelector('.toast-title');
      if (titleEl) titleEl.textContent = title;
    }
    if (message) {
      const msgEl = toast.element.querySelector('.toast-message');
      if (msgEl) msgEl.textContent = message;
    }
  }
  
  // Convenience methods
  success(title, message, options = {}) {
    return this.show({ type: 'success', title, message, ...options });
  }
  
  error(title, message, options = {}) {
    return this.show({ type: 'error', title, message, ...options });
  }
  
  warning(title, message, options = {}) {
    return this.show({ type: 'warning', title, message, ...options });
  }
  
  info(title, message, options = {}) {
    return this.show({ type: 'info', title, message, ...options });
  }
  
  loading(title, message, options = {}) {
    return this.show({ type: 'loading', title, message, duration: 0, ...options });
  }
}

// ============================================
// BREADCRUMB NAVIGATION
// ============================================
class FortuneBreadcrumbs {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      separator: options.separator || 'chevron',
      homeIcon: options.homeIcon !== false,
      maxItems: options.maxItems || 4,
      schemaOrg: options.schemaOrg !== false,
      ...options
    };
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    this.render();
    if (this.options.schemaOrg) {
      this.addSchemaOrg();
    }
  }
  
  render() {
    const items = this.getBreadcrumbItems();
    const homeItem = this.options.homeIcon ? this.getHomeItem() : '';
    
    let html = `<nav class="fortune-breadcrumbs" aria-label="Breadcrumb">
      <div class="breadcrumb-container">
        <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">`;
    
    // Home
    if (homeItem) {
      html += `<li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        ${homeItem}
        <meta itemprop="position" content="1" />
      </li>`;
    }
    
    // Regular items
    let position = homeItem ? 2 : 1;
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const separator = index > 0 || homeItem ? this.getSeparator() : '';
      
      if (items.length > this.options.maxItems && index > 0 && index < items.length - 2) {
        if (index === 1) {
          html += `${separator}<li class="breadcrumb-item breadcrumb-dropdown">
            <button class="breadcrumb-more" aria-label="More pages">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
            <div class="breadcrumb-dropdown-menu">`;
        }
        html += `<a href="${item.url}" class="breadcrumb-dropdown-item" itemprop="item">
          <span itemprop="name">${item.label}</span>
        </a>`;
        if (index === items.length - 3) {
          html += `</div></li>`;
        }
      } else {
        html += `${separator}<li class="breadcrumb-item ${isLast ? 'active' : ''}" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">`;
        
        if (isLast) {
          html += `<span class="breadcrumb-text" itemprop="name" aria-current="page">${item.label}</span>`;
        } else {
          html += `<a href="${item.url}" class="breadcrumb-link" itemprop="item">
            <span itemprop="name">${item.label}</span>
          </a>`;
        }
        
        html += `<meta itemprop="position" content="${position}" /></li>`;
      }
      
      position++;
    });
    
    html += `</ol></div></nav>`;
    this.container.innerHTML = html;
  }
  
  getBreadcrumbItems() {
    // Auto-generate from URL or use data attribute
    const pathData = this.container.dataset.breadcrumbs;
    if (pathData) {
      return JSON.parse(pathData);
    }
    
    // Auto-parse from URL
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && !s.includes('.'));
    
    const urlMap = {
      'about': { label: 'About Us', url: '/about.html' },
      'services': { label: 'Services', url: '/services.html' },
      'projects': { label: 'Projects', url: '/projects.html' },
      'contact': { label: 'Contact', url: '/contact.html' }
    };
    
    return segments.map(seg => urlMap[seg] || { label: this.capitalize(seg), url: `/${seg}` });
  }
  
  getHomeItem() {
    return `<a href="/index.html" class="breadcrumb-link breadcrumb-home" itemprop="item" aria-label="Home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <meta itemprop="name" content="Home" />
    </a>`;
  }
  
  getSeparator() {
    const separators = {
      chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
      arrow: '→',
      slash: '/',
      pipe: '|',
      bullet: '•'
    };
    
    const sep = separators[this.options.separator] || separators.chevron;
    return `<li class="breadcrumb-separator ${this.options.separator}" aria-hidden="true">${sep}</li>`;
  }
  
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
  
  addSchemaOrg() {
    // Schema already included in HTML via microdata
  }
}

// ============================================
// SMART LAZY LOADER
// ============================================
class FortuneLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px 0px',
      threshold: options.threshold || 0.01,
      placeholderColor: options.placeholderColor || '#1a1a1b',
      ...options
    };
    
    this.imageObserver = null;
    this.backgroundObserver = null;
    this.init();
  }
  
  init() {
    this.setupImageObserver();
    this.setupBackgroundObserver();
    this.processExistingImages();
  }
  
  setupImageObserver() {
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }
    
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }
  
  setupBackgroundObserver() {
    this.backgroundObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadBackground(entry.target);
          this.backgroundObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }
  
  processExistingImages() {
    // Lazy images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.prepareImage(img);
      this.imageObserver?.observe(img);
    });
    
    // Lazy backgrounds
    document.querySelectorAll('[data-bg-src]').forEach(el => {
      this.backgroundObserver?.observe(el);
    });
  }
  
  prepareImage(img) {
    // Add container class if not present
    if (!img.parentElement.classList.contains('fortune-lazy-container')) {
      const container = document.createElement('div');
      container.className = 'fortune-lazy-container';
      if (img.dataset.aspect) {
        container.dataset.aspect = img.dataset.aspect;
      }
      
      img.parentNode.insertBefore(container, img);
      container.appendChild(img);
      
      // Add loading state
      if (img.dataset.lqip) {
        const lqip = document.createElement('img');
        lqip.src = img.dataset.lqip;
        lqip.className = 'lqip';
        lqip.alt = '';
        container.appendChild(lqip);
      }
    }
    
    img.classList.add('fortune-lazy-image', 'full');
    img.parentElement.classList.add('loading');
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.parentElement.classList.add('loaded');
      img.parentElement.classList.remove('loading');
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyloaded', { detail: { src } }));
    };
    
    imageLoader.onerror = () => {
      img.dispatchEvent(new CustomEvent('lazyerror', { detail: { src } }));
      img.parentElement.classList.remove('loading');
    };
    
    imageLoader.src = src;
  }
  
  loadBackground(el) {
    const src = el.dataset.bgSrc;
    if (!src) return;
    
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${src})`;
      el.classList.add('bg-loaded');
      el.dispatchEvent(new CustomEvent('bglazyloaded'));
    };
    img.src = src;
  }
  
  loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => this.loadImage(img));
    document.querySelectorAll('[data-bg-src]').forEach(el => this.loadBackground(el));
  }
  
  // Public method to observe new images added dynamically
  observeImage(img) {
    this.prepareImage(img);
    this.imageObserver?.observe(img);
  }
}

// ============================================
// IMAGE ZOOM & MAGNIFICATION
// ============================================
class FortuneImageZoom {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      magnification: options.magnification || 2,
      enabled: options.enabled !== false
    };
    
    this.zoomed = false;
    this.magnifier = null;
    
    if (this.options.enabled) {
      this.init();
    }
  }
  
  init() {
    this.container.classList.add('fortune-image-zoom');
    this.img = this.container.querySelector('img');
    
    if (!this.img) return;
    
    this.setupMagnifier();
    this.bindEvents();
  }
  
  setupMagnifier() {
    this.magnifier = document.createElement('div');
    this.magnifier.className = 'fortune-magnifier';
    
    this.magnifierImg = document.createElement('img');
    this.magnifierImg.src = this.img.src;
    this.magnifier.appendChild(this.magnifierImg);
    
    this.container.appendChild(this.magnifier);
  }
  
  bindEvents() {
    this.container.addEventListener('mouseenter', () => {
      if (this.zoomed) return;
      this.magnifierImg.src = this.img.src;
    });
    
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.container.addEventListener('mouseleave', () => this.hideMagnifier());
    this.container.addEventListener('click', () => this.toggleZoom());
  }
  
  handleMouseMove(e) {
    if (this.zoomed) return;
    
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Move magnifier
    this.magnifier.style.left = `${x - 75}px`;
    this.magnifier.style.top = `${y - 75}px`;
    
    // Calculate image position in magnifier
    const imgWidth = rect.width;
    const imgHeight = rect.height;
    const magWidth = 150;
    const magHeight = 150;
    
    const bgX = (x / imgWidth) * 100;
    const bgY = (y / imgHeight) * 100;
    
    const magImgWidth = imgWidth * this.options.magnification;
    const magImgHeight = imgHeight * this.options.magnification;
    
    this.magnifierImg.style.width = `${magImgWidth}px`;
    this.magnifierImg.style.height = `${magImgHeight}px`;
    this.magnifierImg.style.left = `${-bgX * this.options.magnification + magWidth / 2}px`;
    this.magnifierImg.style.top = `${-bgY * this.options.magnification + magHeight / 2}px`;
  }
  
  hideMagnifier() {
    // Magnifier hides via CSS
  }
  
  toggleZoom() {
    this.zoomed = !this.zoomed;
    this.container.classList.toggle('zoomed', this.zoomed);
  }
}

// ============================================
// INITIALIZE ALL FEATURES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Scroll Animations
  window.scrollAnimations = new ScrollAnimationEngine();
  
  // Initialize Toast System
  window.toast = new FortuneToast({
    position: 'top-right',
    maxVisible: 3
  });
  
  // Initialize Lazy Loader
  window.lazyLoader = new FortuneLazyLoader();
  
  // Initialize Breadcrumbs (auto-detect containers)
  document.querySelectorAll('[data-breadcrumbs], .breadcrumb-auto').forEach(container => {
    new FortuneBreadcrumbs(container);
  });
  
  // Initialize Image Zoom
  document.querySelectorAll('[data-zoom]').forEach(container => {
    new FortuneImageZoom(container, {
      magnification: parseFloat(container.dataset.zoom) || 2
    });
  });
  
  // Demo: Show welcome toast after delay
  setTimeout(() => {
    if (!sessionStorage.getItem('buildbridge-welcome-shown')) {
      toast.info(
        'Welcome to BuildBridge',
        'Experience our enhanced Fortune 500 interface. Scroll to see animations in action.',
        { duration: 6000 }
      );
      sessionStorage.setItem('buildbridge-welcome-shown', 'true');
    }
  }, 2000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ScrollAnimationEngine,
    FortuneToast,
    FortuneBreadcrumbs,
    FortuneLazyLoader,
    FortuneImageZoom
  };
}
