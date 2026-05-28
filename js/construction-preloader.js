/**
 * Construction Preloader - v66.0
 * Fortune 500 Professional Loading Experience
 * Animated construction crane with building blocks
 */

(function() {
  'use strict';

  const Preloader = {
    container: null,
    progressTrack: null,
    percentage: null,
    status: null,
    progress: 0,
    statusMessages: [
      'Loading assets...',
      'Connecting to servers...',
      'Preparing 3D models...',
      'Optimizing images...',
      'Building interface...',
      'Almost ready...'
    ],
    currentStatusIndex: 0,
    
    init() {
      this.createPreloader();
      this.startLoading();
      this.bindEvents();
    },

    createPreloader() {
      // Check if preloader already exists
      if (document.querySelector('.construction-preloader')) {
        return;
      }

      const preloader = document.createElement('div');
      preloader.className = 'construction-preloader';
      preloader.setAttribute('role', 'progressbar');
      preloader.setAttribute('aria-label', 'Loading BuildBridge website');
      preloader.setAttribute('aria-valuemin', '0');
      preloader.setAttribute('aria-valuemax', '100');
      preloader.setAttribute('aria-valuenow', '0');

      preloader.innerHTML = `
        <!-- Construction Grid Background -->
        <div class="construction-grid"></div>
        
        <!-- Blueprint Lines -->
        <div class="blueprint-lines">
          <div class="blueprint-line horizontal"></div>
          <div class="blueprint-line horizontal"></div>
          <div class="blueprint-line horizontal"></div>
          <div class="blueprint-line horizontal"></div>
          <div class="blueprint-line vertical"></div>
          <div class="blueprint-line vertical"></div>
          <div class="blueprint-line vertical"></div>
          <div class="blueprint-line vertical"></div>
        </div>
        
        <!-- Floating Particles -->
        <div class="preloader-particles">
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
          <div class="preloader-particle"></div>
        </div>
        
        <!-- Logo -->
        <div class="preloader-logo-container">
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="preloader-logo">
        </div>
        
        <!-- Loading Text -->
        <div class="preloader-text">Building Experience</div>
        
        <!-- Loading Dots -->
        <div class="loading-dots">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        
        <!-- Animated Crane -->
        <div class="preloader-crane" aria-hidden="true">
          <div class="crane-tower"></div>
          <div class="crane-arm">
            <div class="crane-cable">
              <div class="crane-hook"></div>
            </div>
          </div>
          <div class="construction-block"></div>
          <div class="crane-base"></div>
          <div class="block-stack">
            <div class="stack-block"></div>
            <div class="stack-block"></div>
            <div class="stack-block"></div>
            <div class="stack-block"></div>
            <div class="stack-block"></div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="preloader-progress-container">
          <div class="preloader-progress-track"></div>
          <span class="preloader-percentage">0%</span>
        </div>
        
        <!-- Status Message -->
        <div class="preloader-status">${this.statusMessages[0]}</div>
      `;

      document.body.appendChild(preloader);
      
      this.container = preloader;
      this.progressTrack = preloader.querySelector('.preloader-progress-track');
      this.percentage = preloader.querySelector('.preloader-percentage');
      this.status = preloader.querySelector('.preloader-status');
    },

    startLoading() {
      // Simulate loading progress
      const totalDuration = 2500; // 2.5 seconds
      const interval = 50;
      const increment = 100 / (totalDuration / interval);
      
      const loadingInterval = setInterval(() => {
        this.progress += increment + (Math.random() * 2);
        
        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(loadingInterval);
          this.complete();
        }
        
        this.updateProgress();
        this.updateStatus();
      }, interval);

      // Also listen for actual page load
      if (document.readyState === 'complete') {
        // Page already loaded, let animation complete naturally
      } else {
        window.addEventListener('load', () => {
          // Speed up to finish
          this.progress = Math.max(this.progress, 85);
        });
      }
    },

    updateProgress() {
      const roundedProgress = Math.round(this.progress);
      
      if (this.percentage) {
        this.percentage.textContent = `${roundedProgress}%`;
      }
      
      if (this.container) {
        this.container.setAttribute('aria-valuenow', roundedProgress);
      }
    },

    updateStatus() {
      const statusIndex = Math.floor((this.progress / 100) * (this.statusMessages.length - 1));
      
      if (statusIndex !== this.currentStatusIndex && this.status) {
        this.currentStatusIndex = statusIndex;
        
        // Fade out old status
        this.status.style.opacity = '0';
        this.status.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
          this.status.textContent = this.statusMessages[statusIndex];
          this.status.style.opacity = '1';
          this.status.style.transform = 'translateY(0)';
        }, 200);
      }
    },

    complete() {
      setTimeout(() => {
        this.hide();
      }, 300);
    },

    hide() {
      if (!this.container) return;
      
      this.container.classList.add('preloader--hidden');
      this.container.setAttribute('aria-hidden', 'true');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
        
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('preloaderComplete'));
      }, 800);
    },

    bindEvents() {
      // Handle reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.statusMessages = ['Loading...'];
      }

      // Allow manual skip on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.container && !this.container.classList.contains('preloader--hidden')) {
          this.hide();
        }
      });
    },

    // Public API to show preloader again (if needed)
    show() {
      this.createPreloader();
      this.progress = 0;
      this.startLoading();
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Preloader.init());
  } else {
    Preloader.init();
  }

  // Expose to global scope
  window.BuildBridgePreloader = Preloader;

})();
