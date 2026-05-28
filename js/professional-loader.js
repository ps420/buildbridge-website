/**
 * Professional Loader System v36.0
 * Fortune 500 Premium Page Loading Experience
 */

class ProfessionalLoader {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 2000,
      showPercentage: options.showPercentage !== false,
      showRing: options.showRing !== false,
      showStatus: options.showStatus !== false,
      autoStart: options.autoStart !== false,
      fadeDelay: options.fadeDelay || 500,
      statuses: options.statuses || [
        'Initializing...',
        'Loading assets...',
        'Preparing content...',
        'Almost ready...',
        'Welcome'
      ],
      ...options
    };
    
    this.progress = 0;
    this.targetProgress = 0;
    this.isComplete = false;
    this.loaderElement = null;
    this.statusIndex = 0;
    this.assetsLoaded = 0;
    this.totalAssets = 0;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    this.createLoader();
    
    if (this.options.autoStart) {
      this.start();
    }
    
    this.trackAssets();
  }
  
  createLoader() {
    // Check if loader already exists
    this.loaderElement = document.querySelector('.professional-loader');
    if (this.loaderElement) return;
    
    this.loaderElement = document.createElement('div');
    this.loaderElement.className = 'professional-loader';
    this.loaderElement.setAttribute('role', 'progressbar');
    this.loaderElement.setAttribute('aria-label', 'Loading BuildBridge');
    this.loaderElement.setAttribute('aria-valuemin', '0');
    this.loaderElement.setAttribute('aria-valuemax', '100');
    this.loaderElement.setAttribute('aria-valuenow', '0');
    
    this.loaderElement.innerHTML = `
      <div class="professional-loader__glow"></div>
      <div class="professional-loader__grid"></div>
      
      <div class="professional-loader__content">
        <div class="professional-loader__logo-wrapper">
          <svg class="professional-loader__ring" viewBox="0 0 120 120">
            <circle class="professional-loader__ring-bg" cx="60" cy="60" r="54"/>
            <circle class="professional-loader__ring-progress" cx="60" cy="60" r="54"/>
          </svg>
          
          <div class="professional-loader__orbit">
            <div class="professional-loader__orbit-particle"></div>
          </div>
          <div class="professional-loader__orbit professional-loader__ring--secondary">
            <div class="professional-loader__orbit-particle" style="width: 6px; height: 6px;"></div>
          </div>
          <div class="professional-loader__orbit professional-loader__ring--tertiary">
            <div class="professional-loader__orbit-particle" style="width: 4px; height: 4px;"></div>
          </div>
          
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="professional-loader__logo">
          
          <div class="professional-loader__complete-icon">✓</div>
        </div>
        
        <div class="professional-loader__info">
          ${this.options.showPercentage ? `
            <div class="professional-loader__percentage">0%</div>
          ` : ''}
          
          ${this.options.showStatus ? `
            <div class="professional-loader__status">
              <span class="professional-loader__status-text">${this.options.statuses[0]}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="professional-loader__brand">
          <div class="professional-loader__brand-name">BuildBridge</div>
          <div class="professional-loader__brand-tagline">Construction Management</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.loaderElement);
    document.body.style.overflow = 'hidden';
    
    // Cache elements
    this.ringProgress = this.loaderElement.querySelector('.professional-loader__ring-progress');
    this.percentageEl = this.loaderElement.querySelector('.professional-loader__percentage');
    this.statusEl = this.loaderElement.querySelector('.professional-loader__status-text');
  }
  
  trackAssets() {
    // Track images
    const images = document.querySelectorAll('img');
    this.totalAssets = images.length;
    
    images.forEach(img => {
      if (img.complete) {
        this.assetsLoaded++;
      } else {
        img.addEventListener('load', () => {
          this.assetsLoaded++;
          this.updateProgressFromAssets();
        }, { once: true });
        
        img.addEventListener('error', () => {
          this.assetsLoaded++;
          this.updateProgressFromAssets();
        }, { once: true });
      }
    });
    
    // Track fonts
    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.assetsLoaded += 2;
        this.updateProgressFromAssets();
      });
      this.totalAssets += 2;
    }
    
    this.updateProgressFromAssets();
  }
  
  updateProgressFromAssets() {
    if (this.totalAssets === 0) return;
    
    const assetProgress = (this.assetsLoaded / this.totalAssets) * 70; // Assets count for 70%
    this.targetProgress = Math.max(this.targetProgress, assetProgress);
  }
  
  start() {
    this.startTime = performance.now();
    this.animate();
    this.updateStatus();
    
    // Complete loading after minimum duration
    setTimeout(() => {
      this.targetProgress = 100;
    }, this.options.duration);
    
    // Complete on window load
    window.addEventListener('load', () => {
      this.targetProgress = 100;
    });
  }
  
  animate() {
    if (this.isComplete) return;
    
    // Smooth progress interpolation
    const diff = this.targetProgress - this.progress;
    this.progress += diff * 0.1;
    
    // Update visual elements
    this.updateVisuals();
    
    // Check for completion
    if (this.progress >= 99.5) {
      this.progress = 100;
      this.updateVisuals();
      this.complete();
      return;
    }
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  updateVisuals() {
    const progress = Math.round(this.progress);
    
    // Update ring
    if (this.ringProgress) {
      const circumference = 339.292;
      const offset = circumference - (this.progress / 100) * circumference;
      this.ringProgress.style.strokeDashoffset = offset;
    }
    
    // Update percentage
    if (this.percentageEl) {
      this.percentageEl.textContent = `${progress}%`;
    }
    
    // Update ARIA
    this.loaderElement.setAttribute('aria-valuenow', progress);
  }
  
  updateStatus() {
    if (!this.statusEl) return;
    
    const statusInterval = this.options.duration / (this.options.statuses.length - 1);
    
    const update = () => {
      if (this.isComplete) return;
      
      const progressIndex = Math.floor((this.progress / 100) * (this.options.statuses.length - 1));
      
      if (progressIndex !== this.statusIndex && progressIndex < this.options.statuses.length) {
        this.statusIndex = progressIndex;
        this.statusEl.style.animation = 'none';
        this.statusEl.offsetHeight; // Trigger reflow
        this.statusEl.style.animation = '';
        this.statusEl.textContent = this.options.statuses[this.statusIndex];
      }
      
      requestAnimationFrame(update);
    };
    
    update();
  }
  
  complete() {
    if (this.isComplete) return;
    this.isComplete = true;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Show complete state
    this.loaderElement.classList.add('professional-loader--complete');
    
    if (this.statusEl) {
      this.statusEl.textContent = this.options.statuses[this.options.statuses.length - 1];
    }
    
    // Fade out and remove
    setTimeout(() => {
      this.loaderElement.classList.add('professional-loader--hidden');
      document.body.style.overflow = '';
      
      setTimeout(() => {
        if (this.loaderElement.parentNode) {
          this.loaderElement.remove();
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('loaderComplete'));
      }, 800);
    }, this.options.fadeDelay);
  }
  
  // Public methods
  setProgress(value) {
    this.targetProgress = Math.min(100, Math.max(0, value));
  }
  
  setStatus(text) {
    if (this.statusEl) {
      this.statusEl.textContent = text;
    }
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.loaderElement && this.loaderElement.parentNode) {
      this.loaderElement.remove();
    }
    document.body.style.overflow = '';
  }
}

// Minimal loader variant
class MinimalLoader {
  constructor() {
    this.loader = null;
    this.init();
  }
  
  init() {
    this.loader = document.createElement('div');
    this.loader.className = 'professional-loader professional-loader--minimal';
    this.loader.innerHTML = `
      <div class="professional-loader__content">
        <div class="professional-loader__logo-wrapper">
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="professional-loader__logo">
        </div>
        <div class="professional-loader__dots">
          <div class="professional-loader__dot"></div>
          <div class="professional-loader__dot"></div>
          <div class="professional-loader__dot"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.loader);
    document.body.style.overflow = 'hidden';
    
    // Auto remove on load
    window.addEventListener('load', () => {
      setTimeout(() => this.hide(), 500);
    });
    
    // Fallback
    setTimeout(() => this.hide(), 3000);
  }
  
  hide() {
    this.loader.classList.add('professional-loader--hidden');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (this.loader.parentNode) {
        this.loader.remove();
      }
    }, 800);
  }
}

// Typing text effect for loader
class TypingLoader {
  constructor(element, texts, speed = 100) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    
    this.type();
  }
  
  type() {
    const currentText = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }
    
    let typeSpeed = this.speed;
    
    if (this.isDeleting) {
      typeSpeed /= 2;
    }
    
    if (!this.isDeleting && this.charIndex === currentText.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Only show loader on first visit (session-based)
  const hasVisited = sessionStorage.getItem('buildbridge_visited');
  
  if (!hasVisited) {
    window.buildbridgeLoader = new ProfessionalLoader({
      duration: 2500,
      showPercentage: true,
      showRing: true,
      showStatus: true,
      statuses: [
        'Initializing BuildBridge...',
        'Loading project assets...',
        'Connecting contractors...',
        'Preparing experience...',
        'Welcome to BuildBridge'
      ]
    });
    
    sessionStorage.setItem('buildbridge_visited', 'true');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfessionalLoader, MinimalLoader, TypingLoader };
}
