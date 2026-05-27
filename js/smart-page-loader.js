/**
 * BuildBridge Smart Page Loader
 * Fortune 500 Branded Loading Experience
 */

class SmartPageLoader {
  constructor(options = {}) {
    this.options = {
      minimumLoadTime: options.minimumLoadTime || 1500,
      maximumLoadTime: options.maximumLoadTime || 8000,
      fadeOutDuration: options.fadeOutDuration || 600,
      showPercentage: options.showPercentage !== false,
      showStages: options.showStages !== false,
      autoInit: options.autoInit !== false,
      exitAnimation: options.exitAnimation || 'fade', // fade, circle, up
      variant: options.variant || 'default', // default, minimal, compact
      ...options
    };
    
    this.loader = null;
    this.progress = 0;
    this.stages = [
      { id: 'assets', label: 'Loading Assets', weight: 40 },
      { id: 'scripts', label: 'Initializing', weight: 30 },
      { id: 'content', label: 'Preparing Content', weight: 20 },
      { id: 'ready', label: 'Ready', weight: 10 }
    ];
    this.currentStage = 0;
    this.resources = {
      total: 0,
      loaded: 0,
      failed: 0
    };
    this.startTime = Date.now();
    this.isComplete = false;
    this.isHidden = false;
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  init() {
    this.createLoaderHTML();
    this.bindEvents();
    this.startLoading();
  }
  
  createLoaderHTML() {
    // Check if loader already exists
    if (document.getElementById('smartPageLoader')) {
      this.loader = document.getElementById('smartPageLoader');
      return;
    }
    
    const brandText = 'BuildBridge';
    const letters = brandText.split('').map((letter, i) => 
      `<span style="animation-delay: ${0.1 + (i * 0.05)}s">${letter}</span>`
    ).join('');
    
    this.loader = document.createElement('div');
    this.loader.id = 'smartPageLoader';
    this.loader.className = `smart-page-loader ${this.options.variant} ${this.options.theme || ''}`;
    this.loader.setAttribute('role', 'progressbar');
    this.loader.setAttribute('aria-label', 'Loading BuildBridge');
    this.loader.setAttribute('aria-valuemin', '0');
    this.loader.setAttribute('aria-valuemax', '100');
    this.loader.setAttribute('aria-valuenow', '0');
    
    this.loader.innerHTML = `
      <div class="loader-bg-grid"></div>
      <div class="loader-bg-orb orb-1"></div>
      <div class="loader-bg-orb orb-2"></div>
      
      <div class="loader-content">
        <div class="loader-brand">
          <div class="loader-logo-ring"></div>
          <div class="loader-logo-img">
            <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge">
          </div>
          <div class="loader-particles">
            ${Array(6).fill(0).map(() => '<div class="loader-particle"></div>').join('')}
          </div>
        </div>
        
        <div class="loader-brand-text">
          <div class="loader-brand-name">${letters}</div>
          <div class="loader-brand-tagline">Construction Management</div>
        </div>
        
        <div class="loader-progress-container">
          <div class="loader-status">
            <span class="loader-status-text">
              <span id="loaderStatusText">Loading Assets</span>
              <span class="loader-status-dots">
                <span class="loader-status-dot"></span>
                <span class="loader-status-dot"></span>
                <span class="loader-status-dot"></span>
              </span>
            </span>
            <span class="loader-percentage" id="loaderPercentage">0%</span>
          </div>
          
          <div class="loader-progress-bar">
            <div class="loader-progress-fill" id="loaderProgressFill"></div>
          </div>
          
          ${this.options.showStages ? `
          <div class="loader-stages" id="loaderStages">
            ${this.stages.map((stage, index) => `
              <div class="loader-stage ${index === 0 ? 'active' : ''}" data-stage="${stage.id}">
                <span class="loader-stage-icon">${index + 1}</span>
                <span>${stage.label}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(this.loader);
  }
  
  bindEvents() {
    // Track resource loading
    this.trackResources();
    
    // Handle page load
    if (document.readyState === 'complete') {
      this.onPageLoad();
    } else {
      window.addEventListener('load', () => this.onPageLoad());
    }
    
    // Safety timeout
    setTimeout(() => {
      if (!this.isComplete) {
        this.complete();
      }
    }, this.options.maximumLoadTime);
  }
  
  trackResources() {
    // Track images
    const images = document.querySelectorAll('img');
    this.resources.total += images.length;
    
    images.forEach(img => {
      if (img.complete) {
        this.onResourceLoad();
      } else {
        img.addEventListener('load', () => this.onResourceLoad());
        img.addEventListener('error', () => this.onResourceError());
      }
    });
    
    // Track stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    this.resources.total += stylesheets.length;
    
    // Track scripts
    const scripts = document.querySelectorAll('script[src]');
    this.resources.total += scripts.length;
    
    // Estimate progress based on DOM content
    document.addEventListener('DOMContentLoaded', () => {
      this.updateProgress(30);
      this.setStage(1);
    });
  }
  
  onResourceLoad() {
    this.resources.loaded++;
    this.calculateProgress();
  }
  
  onResourceError() {
    this.resources.failed++;
    this.resources.loaded++;
    this.calculateProgress();
  }
  
  calculateProgress() {
    if (this.resources.total === 0) return;
    
    const resourceProgress = (this.resources.loaded / this.resources.total) * 40;
    const baseProgress = this.currentStage >= 1 ? 30 : 0;
    const targetProgress = Math.min(90, baseProgress + resourceProgress);
    
    this.animateProgressTo(targetProgress);
  }
  
  startLoading() {
    // Initial animation
    this.animateProgressTo(5);
    
    // Simulate loading stages
    const stageInterval = setInterval(() => {
      if (this.isComplete) {
        clearInterval(stageInterval);
        return;
      }
      
      const elapsed = Date.now() - this.startTime;
      
      if (elapsed > 500 && this.currentStage === 0) {
        this.setStage(0);
        this.animateProgressTo(20);
      }
      
      if (elapsed > 1000 && this.currentStage === 0) {
        this.setStage(1);
        this.animateProgressTo(40);
      }
      
      if (elapsed > 2000 && this.currentStage === 1) {
        this.setStage(2);
        this.animateProgressTo(70);
      }
      
      if (elapsed > 3000 && this.currentStage === 2) {
        this.setStage(3);
        this.animateProgressTo(90);
      }
    }, 200);
  }
  
  onPageLoad() {
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.options.minimumLoadTime - elapsed);
    
    setTimeout(() => {
      this.animateProgressTo(100);
      this.setStage(3);
      
      setTimeout(() => this.complete(), 300);
    }, remainingTime);
  }
  
  animateProgressTo(target) {
    const start = this.progress;
    const diff = target - start;
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      this.progress = start + (diff * easeOutQuart);
      
      this.updateDisplay();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  updateDisplay() {
    const percentage = Math.floor(this.progress);
    
    // Update progress fill
    const fill = this.loader.querySelector('#loaderProgressFill');
    if (fill) {
      fill.style.width = `${this.progress}%`;
    }
    
    // Update percentage text
    if (this.options.showPercentage) {
      const percentageEl = this.loader.querySelector('#loaderPercentage');
      if (percentageEl) {
        percentageEl.textContent = `${percentage}%`;
      }
    }
    
    // Update aria
    this.loader.setAttribute('aria-valuenow', percentage);
  }
  
  setStage(index) {
    if (this.currentStage === index) return;
    this.currentStage = index;
    
    const stages = this.loader.querySelectorAll('.loader-stage');
    stages.forEach((stage, i) => {
      stage.classList.remove('active', 'complete');
      if (i < index) {
        stage.classList.add('complete');
        stage.querySelector('.loader-stage-icon').innerHTML = '✓';
      } else if (i === index) {
        stage.classList.add('active');
      }
    });
    
    // Update status text
    const statusText = this.loader.querySelector('#loaderStatusText');
    if (statusText && this.stages[index]) {
      statusText.textContent = this.stages[index].label;
    }
  }
  
  complete() {
    if (this.isComplete) return;
    this.isComplete = true;
    
    this.loader.classList.add('complete');
    
    setTimeout(() => this.hide(), 400);
  }
  
  hide() {
    if (this.isHidden) return;
    this.isHidden = true;
    
    // Apply exit animation
    this.loader.classList.add(`exiting-${this.options.exitAnimation}`);
    
    setTimeout(() => {
      this.loader.classList.add('hidden');
      document.body.style.overflow = '';
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('pageLoaderHidden'));
    }, this.options.fadeOutDuration);
  }
  
  show() {
    this.isHidden = false;
    this.loader.classList.remove('hidden', `exiting-${this.options.exitAnimation}`);
    document.body.style.overflow = 'hidden';
  }
  
  // Public API for manual control
  setProgress(value) {
    this.animateProgressTo(Math.min(100, Math.max(0, value)));
  }
  
  setStatus(text) {
    const statusText = this.loader.querySelector('#loaderStatusText');
    if (statusText) {
      statusText.textContent = text;
    }
  }
  
  // Factory methods
  static showMinimal() {
    return new SmartPageLoader({
      variant: 'minimal',
      showStages: false,
      showPercentage: false,
      minimumLoadTime: 1000
    });
  }
  
  static showCompact() {
    return new SmartPageLoader({
      variant: 'compact',
      showStages: false,
      minimumLoadTime: 1500
    });
  }
  
  static hideAll() {
    document.querySelectorAll('.smart-page-loader').forEach(loader => {
      loader.classList.add('hidden');
    });
  }
}

// Auto-initialize on DOM ready
let pageLoader = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion && !sessionStorage.getItem('loaderShown')) {
    pageLoader = new SmartPageLoader({
      minimumLoadTime: 2000,
      exitAnimation: 'circle',
      showStages: true
    });
    
    // Mark as shown for this session
    sessionStorage.setItem('loaderShown', 'true');
  }
});

// Export for global access
window.SmartPageLoader = SmartPageLoader;
window.pageLoader = pageLoader;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPageLoader;
}