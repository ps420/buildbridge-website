/**
 * Dynamic Page Loader (v38.0)
 * Smart loading with progress tracking and Fortune 500 polish
 */

class DynamicPageLoader {
  constructor(options = {}) {
    this.options = {
      minDuration: 1500,
      maxDuration: 5000,
      showLoader: true,
      showProgress: true,
      showTips: true,
      autoHide: true,
      logoSrc: 'assets/BuildBridge_Icon_Mark.svg',
      brandName: 'BuildBridge',
      stages: [
        { name: 'Initializing', weight: 10, status: 'Initializing...' },
        { name: 'Loading Resources', weight: 30, status: 'Loading assets...' },
        { name: 'Preparing Content', weight: 30, status: 'Preparing content...' },
        { name: 'Finalizing', weight: 30, status: 'Almost ready...' }
      ],
      tips: [
        'BuildBridge has managed 150+ projects worth over R500M',
        'Professional management can save up to 15% on construction costs',
        'We work with 50+ vetted contractor partners across South Africa',
        '98% of our clients recommend us to others',
        'Average project completion time reduced by 20% with BuildBridge'
      ],
      onComplete: null,
      onError: null,
      ...options
    };
    
    this.progress = 0;
    this.currentStage = 0;
    this.startTime = null;
    this.isComplete = false;
    this.isError = false;
    this.assetsLoaded = 0;
    this.totalAssets = 0;
    
    this.init();
  }
  
  init() {
    if (!this.options.showLoader) return;
    
    this.createLoader();
    this.startLoading();
    this.trackLoading();
  }
  
  createLoader() {
    // Create SVG gradient definition
    const svgDef = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDef.classList.add('loader-gradient-def');
    svgDef.innerHTML = `
      <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#C9CED6"/>
          <stop offset="100%" style="stop-color:#F5F7FA"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svgDef);
    
    // Create loader element
    this.loader = document.createElement('div');
    this.loader.className = 'page-loader';
    this.loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo">
          <img src="${this.options.logoSrc}" alt="${this.options.brandName}">
        </div>
        <h2 class="loader-title">${this.options.brandName}</h2>
        <p class="loader-subtitle">Loading your experience</p>
        
        <div class="loader-progress-container">
          <div class="loader-progress-track">
            <div class="loader-progress-bar" style="width: 0%"></div>
          </div>
          <div class="loader-progress-info">
            <span class="loader-percentage">0<span>%</span></span>
            <span class="loader-status">${this.options.stages[0].status}</span>
          </div>
        </div>
        
        <div class="loader-stages">
          ${this.options.stages.map(() => '<div class="loader-stage"></div>').join('')}
        </div>
        
        ${this.options.showTips ? `
          <div class="loader-tips">
            ${this.options.tips.map(tip => `<p class="loader-tip">${tip}</p>`).join('')}
          </div>
          <div class="loader-fact">
            <span class="loader-fact-icon">💡</span>
            <span>Did you know?</span>
          </div>
        ` : ''}
        
        <button class="loader-cancel">Cancel Loading</button>
      </div>
    `;
    
    document.body.appendChild(this.loader);
    
    // Cache elements
    this.progressBar = this.loader.querySelector('.loader-progress-bar');
    this.percentageEl = this.loader.querySelector('.loader-percentage');
    this.statusEl = this.loader.querySelector('.loader-status');
    this.stageEls = this.loader.querySelectorAll('.loader-stage');
    this.tipEls = this.loader.querySelectorAll('.loader-tip');
    this.cancelBtn = this.loader.querySelector('.loader-cancel');
    
    // Cancel button
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => {
        this.cancel();
      });
      
      // Show cancel after 3 seconds
      setTimeout(() => {
        this.cancelBtn.classList.add('visible');
      }, 3000);
    }
  }
  
  startLoading() {
    this.startTime = performance.now();
    
    // Activate first stage
    this.updateStage(0);
    
    // Start rotating tips
    if (this.options.showTips && this.tipEls.length > 0) {
      this.rotateTips();
    }
    
    // Start progress simulation
    this.simulateProgress();
    
    // Listen for actual page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
    
    window.addEventListener('load', () => this.onWindowLoad());
  }
  
  simulateProgress() {
    const simulate = () => {
      if (this.isComplete || this.isError) return;
      
      // Calculate target progress based on time
      const elapsed = performance.now() - this.startTime;
      const minProgress = Math.min((elapsed / this.options.minDuration) * 90, 90);
      
      // Add some randomness
      const increment = Math.random() * 2 + 0.5;
      this.progress = Math.min(this.progress + increment, minProgress);
      
      this.updateProgress(this.progress);
      
      // Update stages
      const stageProgress = this.progress / 100 * this.options.stages.length;
      const currentStage = Math.min(Math.floor(stageProgress), this.options.stages.length - 1);
      if (currentStage !== this.currentStage) {
        this.updateStage(currentStage);
      }
      
      if (this.progress < 90) {
        requestAnimationFrame(simulate);
      }
    };
    
    requestAnimationFrame(simulate);
  }
  
  trackLoading() {
    // Track images
    const images = document.querySelectorAll('img');
    this.totalAssets += images.length;
    
    // Track stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    this.totalAssets += stylesheets.length;
    
    // Track scripts
    const scripts = document.querySelectorAll('script[src]');
    this.totalAssets += scripts.length;
    
    // Track font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.assetsLoaded += 5; // Estimate
        this.updateAssetProgress();
      });
    }
    
    // Update progress as images load
    images.forEach(img => {
      if (img.complete) {
        this.assetsLoaded++;
        this.updateAssetProgress();
      } else {
        img.addEventListener('load', () => {
          this.assetsLoaded++;
          this.updateAssetProgress();
        });
        img.addEventListener('error', () => {
          this.assetsLoaded++;
          this.updateAssetProgress();
        });
      }
    });
  }
  
  updateAssetProgress() {
    if (this.totalAssets === 0) return;
    
    const assetProgress = (this.assetsLoaded / this.totalAssets) * 30; // Assets contribute 30% max
    this.progress = Math.max(this.progress, assetProgress);
    this.updateProgress(this.progress);
  }
  
  onDOMReady() {
    this.domReady = true;
    this.progress = Math.max(this.progress, 40);
    this.updateProgress(this.progress);
  }
  
  onWindowLoad() {
    this.windowLoaded = true;
    this.complete();
  }
  
  updateProgress(value) {
    const clamped = Math.max(0, Math.min(100, value));
    
    if (this.progressBar) {
      this.progressBar.style.width = `${clamped}%`;
    }
    
    if (this.percentageEl) {
      this.percentageEl.innerHTML = `${Math.floor(clamped)}<span>%</span>`;
    }
  }
  
  updateStage(index) {
    if (index < 0 || index >= this.options.stages.length) return;
    
    this.currentStage = index;
    const stage = this.options.stages[index];
    
    // Update stage indicators
    this.stageEls.forEach((el, i) => {
      el.classList.toggle('active', i === index);
      el.classList.toggle('completed', i < index);
    });
    
    // Update status text
    if (this.statusEl) {
      this.statusEl.textContent = stage.status;
    }
  }
  
  rotateTips() {
    let currentTip = 0;
    this.tipEls[0].classList.add('visible');
    
    setInterval(() => {
      this.tipEls[currentTip].classList.remove('visible');
      currentTip = (currentTip + 1) % this.tipEls.length;
      
      setTimeout(() => {
        this.tipEls[currentTip].classList.add('visible');
      }, 400);
    }, 4000);
  }
  
  complete() {
    if (this.isComplete || this.isError) return;
    this.isComplete = true;
    
    // Ensure we reach 100%
    this.updateProgress(100);
    this.updateStage(this.options.stages.length - 1);
    
    // Calculate remaining time to meet minDuration
    const elapsed = performance.now() - this.startTime;
    const remaining = Math.max(0, this.options.minDuration - elapsed);
    
    setTimeout(() => {
      this.hide();
    }, remaining + 300);
    
    if (this.options.onComplete) {
      this.options.onComplete();
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('pageLoadComplete'));
  }
  
  hide() {
    if (!this.loader) return;
    
    this.loader.classList.add('complete');
    
    setTimeout(() => {
      this.loader.classList.add('fade-out');
      
      setTimeout(() => {
        this.loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 800);
    }, 600);
  }
  
  cancel() {
    this.isComplete = true;
    this.hide();
  }
  
  error(message) {
    this.isError = true;
    
    // Show error state
    if (this.loader) {
      const content = this.loader.querySelector('.loader-content');
      content.innerHTML = `
        <div class="loader-error">
          <div class="loader-error-icon">⚠️</div>
          <h3 class="loader-error-title">Loading Error</h3>
          <p class="loader-error-message">${message}</p>
          <div class="loader-error-actions">
            <button class="loader-error-btn primary" onclick="location.reload()">Try Again</button>
            <button class="loader-error-btn secondary" onclick="document.querySelector('.page-loader').remove()">Continue Anyway</button>
          </div>
        </div>
      `;
    }
    
    if (this.options.onError) {
      this.options.onError(message);
    }
  }
  
  // Static methods for global access
  static show(options = {}) {
    return new DynamicPageLoader(options);
  }
  
  static hide() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.add('fade-out', 'hidden');
    }
  }
  
  static update(progress, status) {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    
    const bar = loader.querySelector('.loader-progress-bar');
    const percentage = loader.querySelector('.loader-percentage');
    const statusEl = loader.querySelector('.loader-status');
    
    if (bar) bar.style.width = `${progress}%`;
    if (percentage) percentage.innerHTML = `${Math.floor(progress)}<span>%</span>`;
    if (statusEl && status) statusEl.textContent = status;
  }
}

// Skeleton loader class
class SkeletonLoader {
  constructor(container) {
    this.container = container || document.body;
    this.skeleton = null;
  }
  
  show() {
    this.skeleton = document.createElement('div');
    this.skeleton.className = 'skeleton-loader';
    this.skeleton.innerHTML = `
      <div class="skeleton-header">
        <div class="skeleton-logo"></div>
        <div class="skeleton-nav">
          <div class="skeleton-nav-item"></div>
          <div class="skeleton-nav-item"></div>
          <div class="skeleton-nav-item"></div>
          <div class="skeleton-nav-item"></div>
        </div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text" style="width: 30%"></div>
        <div class="skeleton-button"></div>
      </div>
    `;
    
    this.container.appendChild(this.skeleton);
    document.body.style.overflow = 'hidden';
  }
  
  hide() {
    if (this.skeleton) {
      this.skeleton.remove();
      document.body.style.overflow = '';
    }
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if auto-load is enabled
    if (document.body.dataset.loader !== 'false') {
      window.pageLoader = new DynamicPageLoader();
    }
  });
} else {
  if (document.body.dataset.loader !== 'false') {
    window.pageLoader = new DynamicPageLoader();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DynamicPageLoader, SkeletonLoader };
}
