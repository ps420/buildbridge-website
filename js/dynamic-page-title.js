/**
 * BuildBridge Dynamic Page Title Notifications
 * Fortune 500 Quality - Browser tab title notifications for engagement
 */

class DynamicPageTitle {
  constructor(options = {}) {
    this.originalTitle = document.title;
    this.messages = options.messages || [
      '👋 Welcome to BuildBridge',
      '🏗️ Ready to build?',
      '💬 Chat with us →',
      '📞 Call +27 66 120 0064',
      '✨ 150+ Projects Delivered'
    ];
    this.interval = options.interval || 4000;
    this.pauseOnFocus = options.pauseOnFocus !== false;
    this.isRunning = false;
    this.currentIndex = 0;
    this.timeoutId = null;
    this.visibilityHandler = null;
    this.focusHandler = null;
    this.blurHandler = null;
    
    this.init();
  }

  init() {
    // Don't run on mobile (saves battery)
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.setupEventListeners();
    this.start();
  }

  setupEventListeners() {
    // Visibility change for tab switching
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.startRotation();
      } else {
        this.stopRotation();
        this.restoreTitle();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Window focus/blur handling
    if (this.pauseOnFocus) {
      this.focusHandler = () => {
        this.stopRotation();
        this.restoreTitle();
      };
      this.blurHandler = () => {
        this.startRotation();
      };
      window.addEventListener('focus', this.focusHandler);
      window.addEventListener('blur', this.blurHandler);
    }

    // Start rotation when user scrolls (engagement signal)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!document.hasFocus() || document.hidden) {
          this.startRotation();
        }
      }, 2000);
    }, { passive: true });
  }

  startRotation() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const rotate = () => {
      if (!this.isRunning) return;
      
      this.updateTitle();
      this.timeoutId = setTimeout(rotate, this.interval);
    };
    
    rotate();
  }

  stopRotation() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  updateTitle() {
    const message = this.messages[this.currentIndex];
    document.title = message;
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;
  }

  restoreTitle() {
    document.title = this.originalTitle;
    this.currentIndex = 0;
  }

  destroy() {
    this.stopRotation();
    this.restoreTitle();
    
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    if (this.focusHandler) window.removeEventListener('focus', this.focusHandler);
    if (this.blurHandler) window.removeEventListener('blur', this.blurHandler);
  }

  // Public methods
  setMessages(messages) {
    this.messages = messages;
    this.currentIndex = 0;
  }

  pause() {
    this.stopRotation();
    this.restoreTitle();
  }

  resume() {
    if (!document.hasFocus() || document.hidden) {
      this.startRotation();
    }
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  window.pageTitleManager = new DynamicPageTitle({
    messages: [
      '👋 Welcome to BuildBridge',
      '🏗️ Need a contractor?',
      '💬 WhatsApp: +27 66 120 0064',
      '✨ 150+ Projects Completed',
      '📞 Call Us Today',
      '🏠 Residential & Commercial',
      '⭐ 98% Client Satisfaction'
    ],
    interval: 3500,
    pauseOnFocus: true
  });
});

// Export for global access
window.DynamicPageTitle = DynamicPageTitle;

console.log('📑 Dynamic Page Title initialized');
