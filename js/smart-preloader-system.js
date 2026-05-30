/**
 * v104.0: Smart Preloader System
 * Fortune 500 Professional Loading Experience
 */

(function() {
  'use strict';

  // Preloader Configuration
  const CONFIG = {
    minimumDisplayTime: 2000,      // Minimum time to show preloader (ms)
    progressUpdateInterval: 50,     // Progress update frequency (ms)
    fadeOutDuration: 800,          // Fade out animation duration (ms)
    enableProgressSimulation: true, // Simulate progress if real loading is too fast
  };

  // Loading Status Messages
  const STATUS_MESSAGES = [
    { progress: 0, text: 'Initializing...', detail: 'Setting up environment' },
    { progress: 10, text: 'Loading Assets', detail: 'Fetching critical resources' },
    { progress: 25, text: 'Loading Assets', detail: 'Loading stylesheets' },
    { progress: 40, text: 'Loading Assets', detail: 'Loading scripts' },
    { progress: 55, text: 'Preparing Content', detail: 'Parsing document structure' },
    { progress: 70, text: 'Preparing Content', detail: 'Initializing components' },
    { progress: 85, text: 'Finalizing', detail: 'Applying animations' },
    { progress: 95, text: 'Almost Ready', detail: 'Preparing for takeoff' },
    { progress: 100, text: 'Welcome', detail: 'BuildBridge loaded successfully' }
  ];

  class SmartPreloader {
    constructor() {
      this.progress = 0;
      this.targetProgress = 0;
      this.isComplete = false;
      this.startTime = Date.now();
      this.assetsLoaded = 0;
      this.totalAssets = 0;
      this.elements = {};
      
      this.init();
    }

    init() {
      this.createPreloader();
      this.cacheElements();
      this.bindEvents();
      this.startLoading();
    }

    createPreloader() {
      const preloader = document.createElement('div');
      preloader.className = 'smart-preloader';
      preloader.id = 'smartPreloader';
      preloader.setAttribute('data-state', 'initializing');
      preloader.setAttribute('role', 'progressbar');
      preloader.setAttribute('aria-label', 'Loading BuildBridge');
      preloader.setAttribute('aria-valuemin', '0');
      preloader.setAttribute('aria-valuemax', '100');
      preloader.setAttribute('aria-valuenow', '0');

      preloader.innerHTML = `
        <!-- SVG Definitions -->
        <svg class="preloader-defs">
          <defs>
            <linearGradient id="preloader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#F5F7FA;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#C9CED6;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Brand Tagline -->
        <div class="preloader-tagline">
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="">
          <span>BuildBridge</span>
        </div>

        <!-- Main Container -->
        <div class="preloader-container">
          <!-- Animated Rings -->
          <div class="preloader-ring preloader-ring--outer"></div>
          <div class="preloader-ring preloader-ring--middle"></div>
          <div class="preloader-ring preloader-ring--inner"></div>
          
          <!-- Progress Ring -->
          <svg class="preloader-progress-ring" viewBox="0 0 260 260">
            <circle class="bg" cx="130" cy="130" r="130"></circle>
            <circle class="progress" cx="130" cy="130" r="130" 
                    style="stroke-dasharray: 816.8; stroke-dashoffset: 816.8;"></circle>
          </svg>
          
          <!-- Logo -->
          <div class="preloader-logo-container">
            <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="preloader-logo">
            <div class="preloader-logo-shine"></div>
          </div>
          
          <!-- Floating Particles -->
          <div class="preloader-particles" id="preloaderParticles"></div>
        </div>

        <!-- Status Text -->
        <div class="preloader-status">
          <div class="preloader-status-text" id="preloaderStatus">Initializing...</div>
          <div class="preloader-status-detail" id="preloaderDetail">Setting up environment</div>
        </div>

        <!-- Progress Percentage -->
        <div class="preloader-percentage" id="preloaderPercentage">0<span>%</span></div>

        <!-- Footer -->
        <div class="preloader-footer">
          <div class="preloader-footer-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Secure Connection</span>
          </div>
          <div class="preloader-footer-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>Optimized Performance</span>
          </div>
        </div>
      `;

      document.body.insertBefore(preloader, document.body.firstChild);
      this.createParticles();
    }

    createParticles() {
      const container = document.getElementById('preloaderParticles');
      if (!container) return;

      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'preloader-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(particle);
      }
    }

    cacheElements() {
      this.elements = {
        preloader: document.getElementById('smartPreloader'),
        progress: document.querySelector('.preloader-progress-ring .progress'),
        status: document.getElementById('preloaderStatus'),
        detail: document.getElementById('preloaderDetail'),
        percentage: document.getElementById('preloaderPercentage')
      };
    }

    bindEvents() {
      // Track actual asset loading
      this.trackAssetLoading();
      
      // Listen for window load
      window.addEventListener('load', () => this.onWindowLoad());
      
      // Listen for font loading
      if (document.fonts) {
        document.fonts.ready.then(() => this.onFontsLoaded());
      }
    }

    trackAssetLoading() {
      // Count images
      const images = document.querySelectorAll('img');
      this.totalAssets += images.length;
      
      // Count stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      this.totalAssets += stylesheets.length;
      
      // Count scripts
      const scripts = document.querySelectorAll('script[src]');
      this.totalAssets += scripts.length;

      // Track image loading
      images.forEach(img => {
        if (img.complete) {
          this.onAssetLoaded();
        } else {
          img.addEventListener('load', () => this.onAssetLoaded());
          img.addEventListener('error', () => this.onAssetLoaded());
        }
      });
    }

    onAssetLoaded() {
      this.assetsLoaded++;
      const assetProgress = (this.assetsLoaded / this.totalAssets) * 60;
      this.updateTargetProgress(assetProgress);
    }

    onFontsLoaded() {
      this.updateTargetProgress(80);
    }

    onWindowLoad() {
      this.updateTargetProgress(100);
      this.checkComplete();
    }

    updateTargetProgress(progress) {
      this.targetProgress = Math.max(this.targetProgress, progress);
    }

    startLoading() {
      this.elements.preloader.setAttribute('data-state', 'loading');
      
      const updateProgress = () => {
        if (this.isComplete) return;

        // Smooth progress interpolation
        const diff = this.targetProgress - this.progress;
        if (diff > 0.5) {
          this.progress += diff * 0.1;
        } else {
          this.progress = this.targetProgress;
        }

        // Update display
        this.updateDisplay();

        // Continue updating
        requestAnimationFrame(updateProgress);
      };

      requestAnimationFrame(updateProgress);

      // Simulate progress if enabled and loading is slow
      if (CONFIG.enableProgressSimulation) {
        this.simulateProgress();
      }
    }

    simulateProgress() {
      let simulatedProgress = 0;
      
      const simulate = () => {
        if (this.isComplete || this.progress >= 90) return;
        
        simulatedProgress += Math.random() * 2;
        if (simulatedProgress > 70) simulatedProgress = 70;
        
        this.updateTargetProgress(simulatedProgress);
        
        setTimeout(simulate, 200 + Math.random() * 300);
      };

      setTimeout(simulate, 500);
    }

    updateDisplay() {
      const progress = Math.min(100, Math.max(0, this.progress));
      
      // Update progress ring
      if (this.elements.progress) {
        const circumference = 816.8;
        const offset = circumference - (progress / 100) * circumference;
        this.elements.progress.style.strokeDashoffset = offset;
      }

      // Update percentage
      if (this.elements.percentage) {
        this.elements.percentage.innerHTML = `${Math.floor(progress)}<span>%</span>`;
      }

      // Update ARIA
      if (this.elements.preloader) {
        this.elements.preloader.setAttribute('aria-valuenow', Math.floor(progress));
      }

      // Update status text
      this.updateStatusText(progress);
    }

    updateStatusText(progress) {
      // Find appropriate message
      const message = STATUS_MESSAGES.find((m, i) => {
        const next = STATUS_MESSAGES[i + 1];
        return progress >= m.progress && (!next || progress < next.progress);
      }) || STATUS_MESSAGES[STATUS_MESSAGES.length - 1];

      if (this.elements.status && this.elements.status.textContent !== message.text) {
        this.animateTextChange(this.elements.status, message.text);
      }
      
      if (this.elements.detail && this.elements.detail.textContent !== message.detail) {
        this.animateTextChange(this.elements.detail, message.detail);
      }
    }

    animateTextChange(element, newText) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        element.textContent = newText;
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 150);
    }

    checkComplete() {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, CONFIG.minimumDisplayTime - elapsed);

      setTimeout(() => {
        this.complete();
      }, remaining);
    }

    complete() {
      if (this.isComplete) return;
      this.isComplete = true;

      // Final progress update
      this.progress = 100;
      this.updateDisplay();

      // Update state
      this.elements.preloader.setAttribute('data-state', 'complete');

      // Hide preloader
      setTimeout(() => {
        this.elements.preloader.classList.add('hidden');
        
        // Remove from DOM after animation
        setTimeout(() => {
          this.elements.preloader.remove();
          document.body.classList.add('preloader-complete');
          
          // Trigger custom event
          window.dispatchEvent(new CustomEvent('preloaderComplete'));
        }, CONFIG.fadeOutDuration);
      }, 500);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SmartPreloader());
  } else {
    new SmartPreloader();
  }
})();
