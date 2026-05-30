/**
 * Smart PWA Install Experience
 * Fortune 500 Quality Custom Install Prompt
 * v91.0: Intelligent install prompt with platform detection
 */

class SmartPWAInstall {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.hasPromptShown = false;
    
    // Check localStorage for user preference
    this.dismissedAt = localStorage.getItem('pwaInstallDismissed');
    this.installedAt = localStorage.getItem('pwaInstalled');
    
    this.init();
  }
  
  init() {
    // Already installed or standalone
    if (this.isStandalone || this.installedAt) {
      this.isInstalled = true;
      return;
    }
    
    // Check if dismissed recently (7 days)
    if (this.dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(this.dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return;
    }
    
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });
    
    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showSuccessMessage();
      localStorage.setItem('pwaInstalled', Date.now().toString());
      this.deferredPrompt = null;
    });
    
    // For iOS Safari, show manual install hint
    if (this.isIOS && this.isSafari) {
      setTimeout(() => this.showIOShint(), 3000);
    }
    
    // Register service worker if available
    this.registerServiceWorker();
  }
  
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    }
  }
  
  createInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'pwa-install-prompt';
    prompt.setAttribute('role', 'dialog');
    prompt.setAttribute('aria-label', 'Install BuildBridge App');
    prompt.innerHTML = `
      <button class="pwa-install-close" aria-label="Dismiss install prompt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="pwa-install-icon">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="pwa-install-icon-fallback" style="display: none;">🏗️</div>
      </div>
      <div class="pwa-install-content">
        <h3 class="pwa-install-title">Install BuildBridge</h3>
        <p class="pwa-install-subtitle">Add to your home screen for quick access and offline capabilities</p>
        <div class="pwa-install-benefits">
          <span class="pwa-install-benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Offline Access
          </span>
          <span class="pwa-install-benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Faster Loading
          </span>
          <span class="pwa-install-benefit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            No Updates Needed
          </span>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button class="pwa-install-btn pwa-install-btn-primary" id="pwaInstallBtn">
          Install App
        </button>
        <button class="pwa-install-btn pwa-install-btn-secondary" id="pwaLaterBtn">
          Maybe Later
        </button>
      </div>
      <div class="pwa-install-progress">
        <div class="pwa-install-progress-bar"></div>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    // Event listeners
    prompt.querySelector('.pwa-install-close').addEventListener('click', () => this.dismissInstall());
    prompt.querySelector('#pwaLaterBtn').addEventListener('click', () => this.dismissInstall());
    prompt.querySelector('#pwaInstallBtn').addEventListener('click', () => this.handleInstall());
    
    return prompt;
  }
  
  showInstallPrompt() {
    if (this.hasPromptShown || this.isInstalled) return;
    
    const prompt = this.createInstallPrompt();
    
    // Animate in
    requestAnimationFrame(() => {
      prompt.classList.add('show');
    });
    
    this.hasPromptShown = true;
    
    // Track impression
    this.trackEvent('pwa_prompt_shown');
    
    // Auto-dismiss after 30 seconds if not interacted
    this.autoDismissTimer = setTimeout(() => {
      if (prompt.classList.contains('show')) {
        this.dismissInstall();
      }
    }, 30000);
  }
  
  async handleInstall() {
    if (!this.deferredPrompt) return;
    
    const prompt = document.querySelector('.pwa-install-prompt');
    const progressBar = prompt?.querySelector('.pwa-install-progress-bar');
    
    // Show installing state
    prompt?.classList.add('installing');
    if (progressBar) {
      progressBar.style.width = '30%';
    }
    
    this.trackEvent('pwa_install_clicked');
    
    // Trigger install
    this.deferredPrompt.prompt();
    
    if (progressBar) {
      progressBar.style.width = '60%';
    }
    
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (progressBar) {
      progressBar.style.width = '100%';
    }
    
    if (outcome === 'accepted') {
      this.trackEvent('pwa_install_accepted');
    } else {
      this.trackEvent('pwa_install_dismissed');
      this.dismissInstall();
    }
    
    this.deferredPrompt = null;
  }
  
  dismissInstall() {
    clearTimeout(this.autoDismissTimer);
    this.hideInstallPrompt();
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
    this.trackEvent('pwa_prompt_dismissed');
  }
  
  hideInstallPrompt() {
    const prompt = document.querySelector('.pwa-install-prompt');
    if (prompt) {
      prompt.classList.remove('show');
      prompt.classList.add('hide');
      setTimeout(() => prompt.remove(), 500);
    }
  }
  
  showSuccessMessage() {
    const success = document.createElement('div');
    success.className = 'pwa-install-success';
    success.innerHTML = `
      <div class="pwa-install-success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span class="pwa-install-success-text">BuildBridge installed successfully!</span>
    `;
    
    document.body.appendChild(success);
    
    requestAnimationFrame(() => {
      success.classList.add('show');
    });
    
    setTimeout(() => {
      success.classList.remove('show');
      setTimeout(() => success.remove(), 500);
    }, 4000);
  }
  
  showIOShint() {
    // Don't show if already installed or dismissed
    if (this.isInstalled || this.dismissedAt) return;
    
    const hint = document.createElement('div');
    hint.className = 'pwa-install-ios-hint';
    hint.innerHTML = `
      <div class="pwa-install-ios-arrow"></div>
      <div class="pwa-install-ios-step">
        <div class="pwa-install-ios-icon">1</div>
        <span>Tap the <strong>Share</strong> button below</span>
      </div>
      <div class="pwa-install-ios-step">
        <div class="pwa-install-ios-icon">2</div>
        <span>Scroll and tap <strong>Add to Home Screen</strong></span>
      </div>
      <button class="pwa-install-close" style="top: 8px; right: 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    
    document.body.appendChild(hint);
    
    requestAnimationFrame(() => {
      hint.classList.add('show');
    });
    
    hint.querySelector('.pwa-install-close').addEventListener('click', () => {
      hint.classList.remove('show');
      setTimeout(() => hint.remove(), 500);
      localStorage.setItem('pwaInstallDismissed', Date.now().toString());
    });
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      if (hint.classList.contains('show')) {
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 500);
      }
    }, 15000);
  }
  
  trackEvent(eventName) {
    // Google Analytics event tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'PWA',
        event_label: this.isIOS ? 'iOS' : 'Android/Desktop'
      });
    }
    
    // Console log for debugging
    console.log(`[PWA] ${eventName}`);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SmartPWAInstall());
} else {
  new SmartPWAInstall();
}

export default SmartPWAInstall;
