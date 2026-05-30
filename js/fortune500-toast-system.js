// ========================================
// v122.0: FORTUNE 500 TOAST NOTIFICATION SYSTEM
// Professional User Feedback Notifications
// ========================================

class Fortune500ToastSystem {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'bottom-right';
    this.maxToasts = options.maxToasts || 4;
    this.defaultDuration = options.defaultDuration || 5000;
    this.toasts = [];
    this.toastId = 0;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.bindMethods();
  }
  
  bindMethods() {
    // Bind common toast types
    this.success = (message, options) => this.show({ ...options, type: 'success', message });
    this.error = (message, options) => this.show({ ...options, type: 'error', message });
    this.warning = (message, options) => this.show({ ...options, type: 'warning', message });
    this.info = (message, options) => this.show({ ...options, type: 'info', message });
    this.chrome = (message, options) => this.show({ ...options, type: 'chrome', message });
  }
  
  createContainer() {
    // Remove existing container if present
    const existing = document.querySelector(`.toast-container.${this.position}`);
    if (existing) existing.remove();
    
    this.container = document.createElement('div');
    this.container.className = `toast-container ${this.position}`;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  }
  
  show(options = {}) {
    const {
      type = 'info',
      title,
      message,
      duration = this.defaultDuration,
      showProgress = true,
      closable = true,
      actions = [],
      badge,
      image,
      onClose,
      onAction
    } = options;
    
    this.toastId++;
    const id = `toast-${this.toastId}`;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    
    // Icon based on type
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      chrome: '◆'
    };
    
    // Build HTML
    let html = '';
    
    // Image for rich toasts
    if (image) {
      html += `<img src="${image}" class="toast-image" alt="">`;
      html += `<div class="toast-body">`;
    }
    
    // Icon
    html += `<div class="toast-icon">${icons[type]}</div>`;
    
    // Content
    html += `<div class="toast-content">`;
    
    if (badge) {
      html += `<div class="toast-badge ${badge.type || ''}">${badge.text}</div>`;
    }
    
    if (title) {
      html += `<div class="toast-title">${title}</div>`;
    }
    
    html += `<div class="toast-message">${message}</div>`;
    
    // Actions
    if (actions.length > 0) {
      html += `<div class="toast-actions">`;
      actions.forEach((action, index) => {
        const variant = action.variant || 'secondary';
        html += `<button class="toast-action ${variant}" data-action="${index}">${action.text}</button>`;
      });
      html += `</div>`;
    }
    
    html += `</div>`; // toast-content
    
    if (image) {
      html += `</div>`; // toast-body
    }
    
    // Close button
    if (closable) {
      html += `<button class="toast-close" aria-label="Close notification">×</button>`;
    }
    
    // Progress bar
    if (showProgress && duration > 0) {
      html += `
        <div class="toast-progress">
          <div class="toast-progress-bar" style="animation: shrink ${duration}ms linear forwards"></div>
        </div>
      `;
    }
    
    toast.innerHTML = html;
    
    // Add theme-aware styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shrink {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
    `;
    toast.appendChild(style);
    
    // Add to container
    this.container.appendChild(toast);
    this.toasts.push({ id, element: toast, onClose });
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show', 'animate-pop');
    });
    
    // Bind close button
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.close(id));
      
      // Close on click for simple toasts without actions
      if (actions.length === 0) {
        toast.addEventListener('click', (e) => {
          if (e.target === toast || e.target.closest('.toast-content')) {
            this.close(id);
          }
        });
      }
    }
    
    // Bind action buttons
    if (actions.length > 0) {
      toast.querySelectorAll('.toast-action').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = actions[index];
          if (action.callback) action.callback();
          if (onAction) onAction(index, action);
          if (action.closeOnClick !== false) this.close(id);
        });
      });
    }
    
    // Auto close
    let progressTimer;
    let pauseTime = 0;
    let remainingTime = duration;
    let startTime = Date.now();
    
    const startTimer = () => {
      if (duration <= 0) return;
      progressTimer = setTimeout(() => this.close(id), remainingTime);
      startTime = Date.now();
    };
    
    const pauseTimer = () => {
      if (duration <= 0) return;
      clearTimeout(progressTimer);
      remainingTime -= Date.now() - startTime;
    };
    
    startTimer();
    
    // Pause on hover
    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', startTimer);
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
    
    // Limit number of toasts
    this.enforceMaxToasts();
    
    return id;
  }
  
  close(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const { element, onClose } = this.toasts[index];
    
    // Animate out
    element.classList.remove('show');
    element.classList.add('hiding');
    
    setTimeout(() => {
      element.remove();
      this.toasts.splice(index, 1);
      if (onClose) onClose();
    }, 500);
  }
  
  closeAll() {
    [...this.toasts].forEach(toast => this.close(toast.id));
  }
  
  enforceMaxToasts() {
    while (this.toasts.length > this.maxToasts) {
      this.close(this.toasts[0].id);
    }
  }
  
  updatePosition(position) {
    this.position = position;
    this.container.className = `toast-container ${position}`;
  }
  
  // Preset toast configurations
  projectInquiry(name) {
    return this.show({
      type: 'chrome',
      title: 'Project Inquiry Received',
      message: `Thank you ${name || ''}! We'll review your project and get back to you within 24 hours.`,
      duration: 6000,
      actions: [
        { text: 'View FAQ', variant: 'secondary', callback: () => window.location.href = '#faq' },
        { text: 'Close', variant: 'primary' }
      ]
    });
  }
  
  consultationBooked(date) {
    return this.show({
      type: 'success',
      title: 'Consultation Scheduled',
      message: `Your consultation for ${date} has been confirmed. Check your email for details.`,
      duration: 8000,
      actions: [
        { text: 'Add to Calendar', variant: 'secondary', callback: () => this.addToCalendar(date) },
        { text: 'Got it', variant: 'primary' }
      ]
    });
  }
  
  contractorMatched(contractorName) {
    return this.show({
      type: 'success',
      title: 'Contractor Matched',
      message: `We've matched you with ${contractorName}. They'll contact you within 2 business days.`,
      duration: 7000,
      badge: { text: 'New Match', type: 'new' }
    });
  }
  
  estimateReady(projectName) {
    return this.show({
      type: 'info',
      title: 'Estimate Ready',
      message: `Your preliminary estimate for ${projectName} is ready for review.`,
      duration: 0, // No auto-close
      badge: { text: 'Ready', type: 'new' },
      actions: [
        { text: 'View Estimate', variant: 'primary', callback: () => window.open('estimate.html', '_blank') },
        { text: 'Later', variant: 'secondary' }
      ]
    });
  }
  
  milestoneUpdate(projectName, milestone) {
    return this.show({
      type: 'chrome',
      title: 'Milestone Reached',
      message: `${projectName}: ${milestone} is now complete.`,
      duration: 5000
    });
  }
  
  offlineNotification() {
    return this.show({
      type: 'warning',
      title: 'You\'re Offline',
      message: 'Some features may be unavailable. Changes will sync when you reconnect.',
      duration: 0,
      closable: false,
      showProgress: false
    });
  }
  
  welcomeBack(name) {
    const time = new Date().getHours();
    let greeting = 'Good evening';
    if (time < 12) greeting = 'Good morning';
    else if (time < 18) greeting = 'Good afternoon';
    
    return this.show({
      type: 'chrome',
      title: `${greeting}${name ? ', ' + name : ''}`,
      message: 'Welcome back to BuildBridge. How can we help with your project today?',
      duration: 4000,
      badge: { text: 'Welcome', type: 'new' }
    });
  }
  
  // Helper method for calendar
  addToCalendar(date) {
    // Create calendar event (simplified)
    const event = {
      title: 'BuildBridge Consultation',
      description: 'Project consultation with BuildBridge construction management team.',
      start: date,
      duration: 60
    };
    
    // Google Calendar link
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}`;
    window.open(googleCalUrl, '_blank');
  }
}

// ========================================
// Initialize Global Toast System
// ========================================
let toastSystem = null;

function initToastSystem() {
  if (!toastSystem) {
    toastSystem = new Fortune500ToastSystem({
      position: 'bottom-right',
      maxToasts: 4,
      defaultDuration: 5000
    });
  }
  return toastSystem;
}

// Global access
document.addEventListener('DOMContentLoaded', () => {
  initToastSystem();
  
  // Expose globally
  window.BuildBridgeToast = toastSystem;
  
  // Convenience functions
  window.toast = {
    success: (msg, opts) => toastSystem.success(msg, opts),
    error: (msg, opts) => toastSystem.error(msg, opts),
    warning: (msg, opts) => toastSystem.warning(msg, opts),
    info: (msg, opts) => toastSystem.info(msg, opts),
    show: (opts) => toastSystem.show(opts),
    closeAll: () => toastSystem.closeAll()
  };
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Fortune500ToastSystem, initToastSystem };
}
