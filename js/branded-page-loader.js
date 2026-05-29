/**
 * BuildBridge - Branded Page Loader
 * Fortune 500 Professional Loading Experience
 */

class BrandedPageLoader {
  constructor(options = {}) {
    this.options = {
      minDuration: 1500,
      maxDuration: 5000,
      showPercentage: true,
      showStatus: true,
      statusMessages: [
        'Initializing...',
        'Loading resources...',
        'Preparing content...',
        'Optimizing experience...',
        'Almost ready...'
      ],
      autoStart: true,
      fadeOutDuration: 600,
      ...options
    };
    
    this.loader = null;
    this.progressBar = null;
    this.percentageEl = null;
    this.statusEl = null;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.animationId = null;
    this.startTime = null;
    this.isComplete = false;
    
    if (this.options.autoStart) {
      this.init();
    }
  }
  
  init() {
    this.createLoader();
    this.setupEventListeners();
    this.startLoadingSimulation();
  }
  
  createLoader() {
    // Check if loader already exists
    if (document.querySelector('.branded-loader')) return;
    
    const loader = document.createElement('div');
    loader.className = 'branded-loader';
    loader.setAttribute('role', 'progressbar');
    loader.setAttribute('aria-label', 'Loading BuildBridge');
    loader.setAttribute('aria-valuemin', '0');
    loader.setAttribute('aria-valuemax', '100');
    loader.setAttribute('aria-valuenow', '0');
    
    loader.innerHTML = `
      <!-- Particle Effects -->
      <div class="branded-loader__particles"></div>
      
      <!-- Construction Crane Animation -->
      <div class="branded-loader__crane" aria-hidden="true">
        <div class="branded-loader__crane-tower"></div>
        <div class="branded-loader__crane-jib">
          <div class="branded-loader__crane-cable">
            <div class="branded-loader__crane-hook"></div>
          </div>
        </div>
        <div class="branded-loader__blocks">
          <div class="branded-loader__block"></div>
          <div class="branded-loader__block"></div>
          <div class="branded-loader__block"></div>
          <div class="branded-loader__block"></div>
          <div class="branded-loader__block"></div>
        </div>
      </div>
      
      <!-- Logo and Brand -->
      <div class="branded-loader__logo-container">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="branded-loader__logo" aria-hidden="true">
        <h1 class="branded-loader__title">BuildBridge</h1>
        <p class="branded-loader__subtitle">Construction Management</p>
      </div>
      
      <!-- Progress Bar -->
      <div class="branded-loader__progress" ${this.options.showPercentage ? '' : 'style="display:none"'}>
        <div class="branded-loader__progress-bar"></div>
      </div>
      
      <!-- Percentage -->
      <div class="branded-loader__percentage" ${this.options.showPercentage ? '' : 'style="display:none"'}>0%</div>
      
      <!-- Status Text -->
      <div class="branded-loader__status" ${this.options.showStatus ? '' : 'style="display:none"'}>
        <span class="branded-loader__status-dot"></span>
        <span class="branded-loader__status-text">Initializing...</span>
      </div>
    `;
    
    document.body.prepend(loader);
    this.loader = loader;
    this.progressBar = loader.querySelector('.branded-loader__progress-bar');
    this.percentageEl = loader.querySelector('.branded-loader__percentage');
    this.statusEl = loader.querySelector('.branded-loader__status-text');
    
    // Create particles
    this.createParticles();
  }
  
  createParticles() {
    const particlesContainer = this.loader.querySelector('.branded-loader__particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'branded-loader__particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${8 + Math.random() * 4}s`;
      particlesContainer.appendChild(particle);
    }
  }
  
  setupEventListeners() {
    // Listen for actual page load events
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMContentLoaded());
    } else {
      this.onDOMContentLoaded();
    }
    
    window.addEventListener('load', () => this.onWindowLoad());
    
    // Listen for resource loading via Performance API
    if (window.performance) {
      this.monitorResourceLoading();
    }
  }
  
  onDOMContentLoaded() {
    this.targetProgress = Math.max(this.targetProgress, 30);
  }
  
  onWindowLoad() {
    this.targetProgress = Math.max(this.targetProgress, 80);
    
    // Give a small delay for any deferred scripts
    setTimeout(() => {
      this.complete();
    }, 500);
  }
  
  monitorResourceLoading() {
    const checkResources = () => {
      if (!window.performance || !window.performance.getEntriesByType) return;
      
      const resources = window.performance.getEntriesByType('resource');
      const total = resources.length;
      const loaded = resources.filter(r => r.responseEnd > 0).length;
      
      if (total > 0) {
        const percent = (loaded / total) * 60; // Max 60% for resources
        this.targetProgress = Math.max(this.targetProgress, percent);
      }
    };
    
    // Check periodically
    const interval = setInterval(() => {
      checkResources();
      if (this.isComplete) clearInterval(interval);
    }, 100);
  }
  
  startLoadingSimulation() {
    this.startTime = performance.now();
    this.animate();
  }
  
  animate() {
    if (this.isComplete) return;
    
    const now = performance.now();
    const elapsed = now - this.startTime;
    
    // Natural progress increase over time
    const timeProgress = Math.min((elapsed / this.options.maxDuration) * 100, 95);
    
    // Smooth interpolation towards target
    const target = Math.max(this.targetProgress, timeProgress);
    this.currentProgress += (target - this.currentProgress) * 0.1;
    
    // Update UI
    this.updateProgress(this.currentProgress);
    this.updateStatus(elapsed);
    
    // Check if we should complete
    if (this.currentProgress >= 99 || elapsed >= this.options.maxDuration) {
      this.complete();
      return;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  updateProgress(percent) {
    const rounded = Math.round(percent);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${rounded}%`;
    }
    
    if (this.percentageEl) {
      this.percentageEl.textContent = `${rounded}%`;
    }
    
    if (this.loader) {
      this.loader.setAttribute('aria-valuenow', rounded);
    }
  }
  
  updateStatus(elapsed) {
    if (!this.statusEl || !this.options.statusMessages.length) return;
    
    const index = Math.min(
      Math.floor((elapsed / this.options.minDuration) * this.options.statusMessages.length),
      this.options.statusMessages.length - 1
    );
    
    const message = this.options.statusMessages[index];
    if (this.statusEl.textContent !== message) {
      this.statusEl.style.opacity = '0';
      setTimeout(() => {
        this.statusEl.textContent = message;
        this.statusEl.style.opacity = '1';
      }, 150);
    }
  }
  
  complete() {
    if (this.isComplete) return;
    this.isComplete = true;
    
    cancelAnimationFrame(this.animationId);
    
    // Set to 100%
    this.updateProgress(100);
    
    if (this.statusEl) {
      this.statusEl.textContent = 'Ready!';
    }
    
    // Small delay before hiding
    setTimeout(() => {
      this.hide();
    }, 300);
  }
  
  hide() {
    if (!this.loader) return;
    
    this.loader.classList.add('hidden');
    
    // Remove from DOM after transition
    setTimeout(() => {
      if (this.loader && this.loader.parentNode) {
        this.loader.remove();
      }
      this.loader = null;
    }, this.options.fadeOutDuration);
  }
  
  show() {
    this.isComplete = false;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.createLoader();
    this.startLoadingSimulation();
  }
  
  setProgress(percent) {
    this.targetProgress = Math.min(Math.max(percent, 0), 100);
  }
  
  // Static method to initialize
  static init(options) {
    return new BrandedPageLoader(options);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pageLoader = BrandedPageLoader.init();
  });
} else {
  window.pageLoader = BrandedPageLoader.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrandedPageLoader;
}
