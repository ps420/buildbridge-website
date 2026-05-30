// ========================================
// v123.0: FORTUNE 500 SKELETON LOADING SYSTEM
// Professional Loading Placeholder States
// ========================================

class Fortune500SkeletonLoader {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.options = {
      animation: 'shimmer', // shimmer, pulse, wave
      duration: 1500,
      autoHide: true,
      minDisplayTime: 500,
      ...options
    };
    this.skeletons = [];
    this.startTime = Date.now();
    this.isComplete = false;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    this.container.classList.add('skeleton-container');
  }
  
  // Create skeleton elements
  static create(type, count = 1, options = {}) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type}`;
      
      if (options.variant) {
        skeleton.classList.add(options.variant);
      }
      
      if (options.animation) {
        skeleton.classList.add(options.animation);
      }
      
      if (options.style) {
        Object.assign(skeleton.style, options.style);
      }
      
      skeletons.push(skeleton);
    }
    
    return count === 1 ? skeletons[0] : skeletons;
  }
  
  // Common skeleton patterns
  static text(variant = 'full', count = 1) {
    return this.create('text', count, { variant });
  }
  
  static title(count = 1) {
    return this.create('text', count, { variant: 'title' });
  }
  
  static paragraph(lines = 3) {
    const container = document.createElement('div');
    container.className = 'skeleton-paragraph';
    
    const variants = ['full', 'long', 'medium', 'short'];
    for (let i = 0; i < lines; i++) {
      const variant = variants[i % variants.length];
      const line = this.create('text', 1, { variant });
      container.appendChild(line);
    }
    
    return container;
  }
  
  static image(options = {}) {
    return this.create('image', 1, { 
      variant: options.ratio || 'wide',
      style: options.style
    });
  }
  
  static avatar(size = 'medium') {
    const sizes = { small: 'small', medium: '', large: 'large', xl: 'xl' };
    return this.create('avatar', 1, { variant: sizes[size] });
  }
  
  static button(variant = 'medium') {
    return this.create('button', 1, { variant });
  }
  
  // Complex patterns
  static projectCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-project-card';
    card.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-project-card-content">
        <div class="skeleton skeleton-text title"></div>
        <div class="skeleton skeleton-text medium"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    `;
    return card;
  }
  
  static serviceCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-service-card';
    card.innerHTML = `
      <div class="skeleton skeleton-icon"></div>
      <div class="skeleton skeleton-text title"></div>
      <div class="skeleton skeleton-text full"></div>
      <div class="skeleton skeleton-text long"></div>
      <div class="skeleton skeleton-text medium"></div>
    `;
    return card;
  }
  
  static testimonialCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-testimonial';
    card.innerHTML = `
      <div class="skeleton skeleton-quote"></div>
      <div class="skeleton-testimonial-author">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-testimonial-author-info">
          <div class="skeleton skeleton-text medium"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>
    `;
    return card;
  }
  
  static statsGrid(count = 4) {
    const grid = document.createElement('div');
    grid.className = 'skeleton-stats-grid';
    
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.className = 'skeleton-stats-item';
      item.innerHTML = `
        <div class="skeleton skeleton-number"></div>
        <div class="skeleton skeleton-label"></div>
      `;
      grid.appendChild(item);
    }
    
    return grid;
  }
  
  static form(fields = ['name', 'email', 'message']) {
    const form = document.createElement('div');
    form.className = 'skeleton-form';
    
    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'skeleton-form-group';
      
      group.innerHTML = `
        <div class="skeleton skeleton-label"></div>
        <div class="skeleton skeleton-${field === 'message' ? 'textarea' : 'input'}"></div>
      `;
      
      form.appendChild(group);
    });
    
    // Add submit button
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'skeleton-form-group';
    buttonGroup.innerHTML = '<div class="skeleton skeleton-button"></div>';
    form.appendChild(buttonGroup);
    
    return form;
  }
  
  static hero() {
    const hero = document.createElement('div');
    hero.className = 'skeleton-hero';
    hero.innerHTML = `
      <div class="skeleton-hero-content">
        <div class="skeleton skeleton-text eyebrow"></div>
        <div class="skeleton skeleton-text title"></div>
        <div class="skeleton skeleton-text title" style="width: 60%"></div>
        ${Array(3).fill(0).map(() => '<div class="skeleton skeleton-text full"></div>').join('')}
        <div class="skeleton-hero-buttons">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button" style="width: 140px"></div>
        </div>
      </div>
      <div class="skeleton skeleton-image" style="border-radius: 20px;"></div>
    `;
    return hero;
  }
  
  static navigation() {
    const nav = document.createElement('div');
    nav.className = 'skeleton-nav';
    nav.innerHTML = `
      <div class="skeleton skeleton-logo"></div>
      <div class="skeleton-nav-links">
        ${Array(5).fill(0).map(() => '<div class="skeleton"></div>').join('')}
      </div>
      <div class="skeleton skeleton-button small"></div>
    `;
    return nav;
  }
  
  // Instance methods for showing/hiding
  show(content) {
    if (!this.container) return this;
    
    this.container.innerHTML = '';
    this.startTime = Date.now();
    this.isComplete = false;
    
    if (typeof content === 'string') {
      // Use preset template
      const template = this.getPreset(content);
      if (template) {
        this.container.appendChild(template);
      }
    } else if (content instanceof HTMLElement) {
      this.container.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(el => this.container.appendChild(el));
    }
    
    this.container.style.opacity = '1';
    this.container.style.visibility = 'visible';
    
    return this;
  }
  
  getPreset(name) {
    const presets = {
      'project-card': Fortune500SkeletonLoader.projectCard,
      'service-card': Fortune500SkeletonLoader.serviceCard,
      'testimonial': Fortune500SkeletonLoader.testimonialCard,
      'stats': () => Fortune500SkeletonLoader.statsGrid(),
      'form': () => Fortune500SkeletonLoader.form(),
      'hero': Fortune500SkeletonLoader.hero,
      'nav': Fortune500SkeletonLoader.navigation,
      'image': () => Fortune500SkeletonLoader.image(),
      'paragraph': () => Fortune500SkeletonLoader.paragraph()
    };
    
    return presets[name] ? presets[name]() : null;
  }
  
  hide(callback) {
    if (!this.container || this.isComplete) return this;
    
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.options.minDisplayTime - elapsed);
    
    setTimeout(() => {
      this.container.classList.add('skeleton-loaded');
      this.isComplete = true;
      
      setTimeout(() => {
        this.container.style.opacity = '0';
        this.container.style.visibility = 'hidden';
        this.container.innerHTML = '';
        this.container.classList.remove('skeleton-loaded');
        
        if (callback) callback();
      }, 400);
    }, remaining);
    
    return this;
  }
  
  // Promise-based hide
  hideAsync() {
    return new Promise(resolve => this.hide(resolve));
  }
  
  // Replace skeleton with real content
  replace(content) {
    this.hide(() => {
      this.container.innerHTML = '';
      
      if (typeof content === 'string') {
        this.container.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.container.appendChild(content);
      }
      
      // Animate in
      this.container.style.opacity = '0';
      this.container.style.visibility = 'visible';
      
      requestAnimationFrame(() => {
        this.container.style.transition = 'opacity 0.4s ease';
        this.container.style.opacity = '1';
      });
    });
    
    return this;
  }
  
  // Wait for data then replace
  async load(promise, renderFn) {
    this.show('hero'); // Show initial skeleton
    
    try {
      const data = await promise;
      const content = renderFn(data);
      this.replace(content);
      return data;
    } catch (error) {
      this.replace(`<div class="error-message">Failed to load content</div>`);
      throw error;
    }
  }
}

// ========================================
// Page Load Skeleton
// ========================================
class PageLoadSkeleton {
  constructor() {
    this.skeletonOverlay = null;
    this.isActive = false;
  }
  
  show() {
    if (this.isActive) return;
    this.isActive = true;
    
    this.skeletonOverlay = document.createElement('div');
    this.skeletonOverlay.className = 'page-skeleton-overlay';
    this.skeletonOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0f0f12;
      z-index: 999998;
      overflow-y: auto;
    `;
    
    const nav = Fortune500SkeletonLoader.navigation();
    const hero = Fortune500SkeletonLoader.hero();
    const stats = Fortune500SkeletonLoader.statsGrid();
    
    this.skeletonOverlay.appendChild(nav);
    this.skeletonOverlay.appendChild(hero);
    this.skeletonOverlay.appendChild(stats);
    
    document.body.appendChild(this.skeletonOverlay);
    document.body.style.overflow = 'hidden';
  }
  
  hide() {
    if (!this.isActive || !this.skeletonOverlay) return;
    
    this.skeletonOverlay.style.opacity = '0';
    this.skeletonOverlay.style.transition = 'opacity 0.4s ease';
    
    setTimeout(() => {
      this.skeletonOverlay.remove();
      document.body.style.overflow = '';
      this.isActive = false;
    }, 400);
  }
}

// ========================================
// Initialize Global System
// ========================================
const pageLoadSkeleton = new PageLoadSkeleton();

// Expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.Fortune500SkeletonLoader = Fortune500SkeletonLoader;
  window.PageLoadSkeleton = PageLoadSkeleton;
  window.pageLoadSkeleton = pageLoadSkeleton;
  
  // Auto-initialize skeletons with data-skeleton attribute
  document.querySelectorAll('[data-skeleton]').forEach(el => {
    const type = el.dataset.skeleton;
    const loader = new Fortune500SkeletonLoader(el);
    loader.show(type);
    
    // Store reference
    el._skeletonLoader = loader;
  });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    Fortune500SkeletonLoader, 
    PageLoadSkeleton,
    pageLoadSkeleton 
  };
}
