/**
 * v44.0: Smart Preloader System
 * Fortune 500 Professional Loading Experience
 */

(function() {
  'use strict';

  class SmartPreloader {
    constructor(options = {}) {
      this.options = {
        minDuration: 1500,
        debug: false,
        steps: [
          { progress: 15, message: 'Initializing...', duration: 200 },
          { progress: 35, message: 'Loading assets...', duration: 400 },
          { progress: 60, message: 'Preparing content...', duration: 300 },
          { progress: 80, message: 'Optimizing...', duration: 250 },
          { progress: 95, message: 'Almost ready...', duration: 200 },
          { progress: 100, message: 'Welcome', duration: 150 }
        ],
        ...options
      };

      this.currentProgress = 0;
      this.startTime = Date.now();
      this.elements = {};
      this.isComplete = false;

      this.init();
    }

    init() {
      this.createPreloader();
      this.cacheElements();
      this.createParticles();
      this.startLoadingSequence();
      this.bindEvents();
    }

    createPreloader() {
      const preloader = document.createElement('div');
      preloader.className = 'smart-preloader';
      preloader.id = 'smartPreloader';
      preloader.setAttribute('role', 'progressbar');
      preloader.setAttribute('aria-label', 'Loading BuildBridge');
      preloader.setAttribute('aria-valuemin', '0');
      preloader.setAttribute('aria-valuemax', '100');
      preloader.setAttribute('aria-valuenow', '0');

      preloader.innerHTML = `
        <div class="preloader-particles"></div>
        <div class="preloader-container">
          <div class="preloader-logo-wrapper">
            <svg class="preloader-progress-ring" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="preloader-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#F5F7FA;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle class="ring-bg" cx="50" cy="50" r="45"/>
              <circle class="ring-progress" cx="50" cy="50" r="45"/>
            </svg>
            <div class="preloader-orbital preloader-orbital--1"></div>
            <div class="preloader-orbital preloader-orbital--2"></div>
            <div class="preloader-orbital preloader-orbital--3"></div>
            <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="preloader-logo">
          </div>
          <div class="preloader-info">
            <div class="preloader-percentage">0%</div>
            <div class="preloader-status">Initializing...</div>
            <div class="preloader-steps">
              ${this.options.steps.map(() => '<div class="preloader-step"></div>').join('')}
            </div>
          </div>
          <div class="preloader-bar-container">
            <div class="preloader-bar" style="width: 0%"></div>
          </div>
        </div>
        <div class="preloader-tagline">Building Excellence</div>
      `;

      document.body.prepend(preloader);
      this.preloader = preloader;
    }

    cacheElements() {
      this.elements = {
        percentage: this.preloader.querySelector('.preloader-percentage'),
        status: this.preloader.querySelector('.preloader-status'),
        bar: this.preloader.querySelector('.preloader-bar'),
        ring: this.preloader.querySelector('.ring-progress'),
        steps: this.preloader.querySelectorAll('.preloader-step'),
        particles: this.preloader.querySelector('.preloader-particles')
      };
    }

    createParticles() {
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'preloader-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${10 + Math.random() * 10}s`;
        this.elements.particles.appendChild(particle);
      }
    }

    startLoadingSequence() {
      let stepIndex = 0;

      const processStep = () => {
        if (stepIndex >= this.options.steps.length || this.isComplete) {
          this.complete();
          return;
        }

        const step = this.options.steps[stepIndex];
        
        // Update progress
        this.updateProgress(step.progress, step.message);
        
        // Update step indicators
        this.elements.steps.forEach((el, i) => {
          el.classList.remove('step--active', 'step--completed');
          if (i < stepIndex) el.classList.add('step--completed');
          if (i === stepIndex) el.classList.add('step--active');
        });

        stepIndex++;
        setTimeout(processStep, step.duration);
      };

      processStep();
    }

    updateProgress(progress, message) {
      this.currentProgress = progress;
      
      // Update percentage text
      if (this.elements.percentage) {
        this.elements.percentage.textContent = `${Math.round(progress)}%`;
      }

      // Update status message
      if (this.elements.status && message) {
        this.elements.status.textContent = message;
        this.elements.status.classList.add('status--loading');
        setTimeout(() => {
          this.elements.status.classList.remove('status--loading');
        }, 200);
      }

      // Update progress bar
      if (this.elements.bar) {
        this.elements.bar.style.width = `${progress}%`;
      }

      // Update progress ring
      if (this.elements.ring) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;
        this.elements.ring.style.strokeDashoffset = offset;
      }

      // Update ARIA
      this.preloader.setAttribute('aria-valuenow', Math.round(progress));

      if (this.options.debug) {
        console.log(`[SmartPreloader] Progress: ${progress}% - ${message}`);
      }
    }

    complete() {
      if (this.isComplete) return;
      this.isComplete = true;

      const elapsed = Date.now() - this.startTime;
      const remainingDelay = Math.max(0, this.options.minDuration - elapsed);

      // Ensure we hit 100%
      this.updateProgress(100, 'Welcome');

      setTimeout(() => {
        // Add completion animation
        const container = this.preloader.querySelector('.preloader-container');
        container.classList.add('preloader-complete');

        setTimeout(() => {
          this.hide();
        }, 400);
      }, remainingDelay + 300);
    }

    hide() {
      this.preloader.classList.add('preloader--hidden');
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('preloader:complete', {
        detail: { duration: Date.now() - this.startTime }
      }));

      // Remove from DOM after transition
      setTimeout(() => {
        if (this.preloader.parentNode) {
          this.preloader.parentNode.removeChild(this.preloader);
        }
      }, 800);
    }

    bindEvents() {
      // Listen for page load
      if (document.readyState === 'complete') {
        this.onPageLoaded();
      } else {
        window.addEventListener('load', () => this.onPageLoaded());
      }

      // Listen for all images loaded
      this.waitForImages();
    }

    onPageLoaded() {
      // Trigger completion faster if page is ready
      if (!this.isComplete && this.currentProgress < 80) {
        this.options.steps = this.options.steps.filter(s => s.progress >= this.currentProgress);
        this.options.steps.unshift({ 
          progress: Math.min(this.currentProgress + 15, 85), 
          message: 'Finalizing...', 
          duration: 150 
        });
        this.startLoadingSequence();
      }
    }

    waitForImages() {
      const images = document.querySelectorAll('img');
      let loadedCount = 0;
      const totalImages = images.length;

      if (totalImages === 0) return;

      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.addEventListener('load', () => {
            loadedCount++;
            if (loadedCount >= totalImages && !this.isComplete) {
              this.onPageLoaded();
            }
          });
          img.addEventListener('error', () => {
            loadedCount++;
          });
        }
      });
    }

    // Public API
    static init(options) {
      return new SmartPreloader(options);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartPreloader.init());
  } else {
    SmartPreloader.init();
  }

  // Expose globally
  window.SmartPreloader = SmartPreloader;
})();
