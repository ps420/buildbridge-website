/**
 * Smart Notification System - v40.0
 * Fortune 500 Professional Toast Notifications
 * Features: Auto-dismiss, actions, progress bars, stacking, swipe dismiss
 */

class SmartNotificationSystem {
  constructor(options = {}) {
    this.options = {
      position: 'top-right',
      maxVisible: 4,
      defaultDuration: 5000,
      pauseOnHover: true,
      allowDuplicates: false,
      theme: 'light',
      ...options
    };
    
    this.notifications = [];
    this.container = null;
    this.idCounter = 0;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.bindEvents();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `notification-container position-${this.options.position}`;
    document.body.appendChild(this.container);
  }
  
  bindEvents() {
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      this.notifications.forEach(n => {
        if (document.hidden) {
          n.pauseTimer();
        } else {
          n.resumeTimer();
        }
      });
    });
  }
  
  show(options = {}) {
    const config = {
      type: 'default',
      title: '',
      message: '',
      icon: null,
      duration: this.options.defaultDuration,
      actions: [],
      showProgress: true,
      showClose: true,
      clickable: false,
      onClick: null,
      onClose: null,
      richContent: null,
      id: null,
      theme: this.options.theme,
      ...options
    };
    
    // Check for duplicates
    if (!this.options.allowDuplicates && config.id) {
      const existing = this.notifications.find(n => n.id === config.id);
      if (existing) {
        existing.resetTimer();
        return existing;
      }
    }
    
    // Limit visible notifications
    if (this.notifications.length >= this.options.maxVisible) {
      const oldest = this.notifications[0];
      oldest.dismiss();
    }
    
    // Create notification
    const notification = new NotificationToast(config, this);
    this.notifications.push(notification);
    
    return notification;
  }
  
  remove(notification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }
  
  clearAll() {
    [...this.notifications].forEach(n => n.dismiss());
  }
  
  // Preset methods
  success(title, message, options = {}) {
    return this.show({
      type: 'success',
      icon: '✓',
      title,
      message,
      ...options
    });
  }
  
  error(title, message, options = {}) {
    return this.show({
      type: 'error',
      icon: '✕',
      title,
      message,
      duration: 8000,
      ...options
    });
  }
  
  warning(title, message, options = {}) {
    return this.show({
      type: 'warning',
      icon: '⚠',
      title,
      message,
      ...options
    });
  }
  
  info(title, message, options = {}) {
    return this.show({
      type: 'info',
      icon: 'ℹ',
      title,
      message,
      ...options
    });
  }
  
  loading(title, message, options = {}) {
    return this.show({
      type: 'info',
      icon: '◌',
      title,
      message,
      duration: 0,
      showProgress: false,
      ...options
    });
  }
  
  updateLoading(id, type, title, message) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.update({
        type,
        icon: type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ',
        title,
        message,
        duration: 5000,
        showProgress: true
      });
    }
  }
  
  // Promise-based notification
  promise(promise, messages = {}) {
    const { loading = 'Loading...', success = 'Success!', error = 'Something went wrong' } = messages;
    
    const id = `promise-${Date.now()}`;
    this.loading(loading, '', { id, duration: 0 });
    
    promise
      .then(result => {
        this.updateLoading(id, 'success', success, typeof result === 'string' ? result : '');
        return result;
      })
      .catch(err => {
        this.updateLoading(id, 'error', error, err.message || '');
        throw err;
      });
    
    return promise;
  }
}

class NotificationToast {
  constructor(config, system) {
    this.config = config;
    this.system = system;
    this.id = config.id || `notification-${++system.idCounter}`;
    this.element = null;
    this.progressBar = null;
    this.timer = null;
    this.remainingTime = config.duration;
    this.startTime = null;
    this.isPaused = false;
    this.isDismissed = false;
    
    this.create();
    this.show();
    
    if (config.duration > 0) {
      this.startTimer();
    }
  }
  
  create() {
    const el = document.createElement('div');
    el.className = `notification-toast type-${this.config.type} theme-${this.config.theme}`;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    
    // Icon
    const iconHtml = this.config.icon ? `
      <div class="notification-icon">${this.config.icon}</div>
    ` : '';
    
    // Actions
    const actionsHtml = this.config.actions.length > 0 ? `
      <div class="notification-actions">
        ${this.config.actions.map((action, i) => `
          <button class="notification-action-btn ${action.type || 'secondary'}" data-action="${i}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    ` : '';
    
    // Rich content
    const richContentHtml = this.config.richContent ? `
      <div class="notification-rich-content">
        ${this.config.richContent}
      </div>
    ` : '';
    
    // Close button
    const closeHtml = this.config.showClose ? `
      <button class="notification-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    ` : '';
    
    // Progress bar
    const progressHtml = this.config.showProgress && this.config.duration > 0 ? `
      <div class="notification-progress">
        <div class="notification-progress-bar" style="animation-duration: ${this.config.duration}ms"></div>
      </div>
    ` : '';
    
    el.innerHTML = `
      ${iconHtml}
      <div class="notification-content">
        ${this.config.title ? `<h4 class="notification-title">${this.escapeHtml(this.config.title)}</h4>` : ''}
        ${this.config.message ? `<p class="notification-message">${this.escapeHtml(this.config.message)}</p>` : ''}
        ${actionsHtml}
        ${richContentHtml}
      </div>
      ${closeHtml}
      ${progressHtml}
    `;
    
    // Bind events
    this.bindEvents(el);
    
    this.element = el;
    this.progressBar = el.querySelector('.notification-progress-bar');
  }
  
  bindEvents(el) {
    // Close button
    const closeBtn = el.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss());
    }
    
    // Action buttons
    el.querySelectorAll('.notification-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionIndex = parseInt(e.target.dataset.action);
        const action = this.config.actions[actionIndex];
        if (action && action.onClick) {
          action.onClick(this);
        }
        if (action?.closeOnClick !== false) {
          this.dismiss();
        }
      });
    });
    
    // Click handler
    if (this.config.clickable && this.config.onClick) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action-btn')) {
          this.config.onClick(this);
        }
      });
    }
    
    // Pause on hover
    if (this.system.options.pauseOnHover && this.config.duration > 0) {
      el.addEventListener('mouseenter', () => this.pauseTimer());
      el.addEventListener('mouseleave', () => this.resumeTimer());
    }
    
    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchStartY = 0;
    
    el.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    el.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Horizontal swipe to dismiss
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
        el.style.transform = `translateX(${deltaX > 0 ? '120%' : '-120%'})`;
        setTimeout(() => this.dismiss(), 200);
      }
    }, { passive: true });
  }
  
  show() {
    this.system.container.appendChild(this.element);
    
    // Trigger animation
    requestAnimationFrame(() => {
      this.element.classList.add('is-visible');
    });
  }
  
  startTimer() {
    this.startTime = Date.now();
    
    this.timer = setTimeout(() => {
      if (!this.isPaused) {
        this.dismiss();
      }
    }, this.remainingTime);
  }
  
  pauseTimer() {
    if (this.isPaused || !this.timer) return;
    
    this.isPaused = true;
    clearTimeout(this.timer);
    this.timer = null;
    
    // Calculate remaining time
    const elapsed = Date.now() - this.startTime;
    this.remainingTime = Math.max(0, this.remainingTime - elapsed);
    
    // Pause progress bar animation
    if (this.progressBar) {
      this.progressBar.style.animationPlayState = 'paused';
    }
  }
  
  resumeTimer() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    
    if (this.remainingTime > 0) {
      this.startTimer();
    }
    
    // Resume progress bar
    if (this.progressBar) {
      this.progressBar.style.animationPlayState = 'running';
    }
  }
  
  resetTimer() {
    this.remainingTime = this.config.duration;
    this.startTime = Date.now();
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.startTimer();
    
    // Reset progress bar
    if (this.progressBar) {
      this.progressBar.style.animation = 'none';
      this.progressBar.offsetHeight; // Trigger reflow
      this.progressBar.style.animation = `progress-shimmer ${this.config.duration}ms linear infinite`;
    }
  }
  
  update(newConfig) {
    Object.assign(this.config, newConfig);
    
    // Update type
    this.element.className = `notification-toast type-${this.config.type} theme-${this.config.theme}`;
    
    // Update content
    const contentEl = this.element.querySelector('.notification-content');
    let html = '';
    
    if (this.config.title) {
      html += `<h4 class="notification-title">${this.escapeHtml(this.config.title)}</h4>`;
    }
    if (this.config.message) {
      html += `<p class="notification-message">${this.escapeHtml(this.config.message)}</p>`;
    }
    
    contentEl.innerHTML = html;
    
    // Update icon
    const iconEl = this.element.querySelector('.notification-icon');
    if (iconEl) {
      iconEl.textContent = this.config.icon || '';
    }
    
    // Restart timer
    this.resetTimer();
  }
  
  dismiss() {
    if (this.isDismissed) return;
    this.isDismissed = true;
    
    this.element.classList.remove('is-visible');
    this.element.classList.add('is-hiding');
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    setTimeout(() => {
      this.element.remove();
      this.system.remove(this);
      
      if (this.config.onClose) {
        this.config.onClose(this);
      }
    }, 400);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize global instance
window.notifications = new SmartNotificationSystem({
  position: 'top-right',
  theme: 'dark'
});

// Demo function for testing
function demoNotifications() {
  setTimeout(() => {
    window.notifications.success('Welcome!', 'BuildBridge notification system is now active.');
  }, 1000);
  
  setTimeout(() => {
    window.notifications.info('New Feature', 'Try our new project comparison tool.', {
      actions: [
        { label: 'Try it', type: 'primary', onClick: () => window.location.href = 'projects.html' },
        { label: 'Later', type: 'secondary' }
      ]
    });
  }, 3000);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmartNotificationSystem, NotificationToast };
}
