/**
 * BuildBridge Toast Notification System
 * Professional notification system for user feedback
 * Version: 1.0.0
 */

class ToastNotification {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'bottom-right',
      duration: options.duration || 5000,
      maxToasts: options.maxToasts || 5,
      ...options
    };
    
    this.container = null;
    this.toasts = [];
    this.toastId = 0;
    
    this.init();
  }
  
  init() {
    this.createContainer();
  }
  
  createContainer() {
    // Check if container already exists
    this.container = document.querySelector(`.toast-container[data-position="${this.options.position}"]`);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `toast-container toast-${this.options.position}`;
      this.container.setAttribute('data-position', this.options.position);
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(this.container);
    }
  }
  
  show(options = {}) {
    const {
      type = 'info',
      title = '',
      message = '',
      duration = this.options.duration,
      dismissible = true,
      action = null,
      icon = null
    } = options;
    
    // Limit maximum toasts
    if (this.toasts.length >= this.options.maxToasts) {
      this.remove(this.toasts[0].id);
    }
    
    const id = ++this.toastId;
    const toast = this.createToastElement({
      id,
      type,
      title,
      message,
      dismissible,
      action,
      icon
    });
    
    this.container.appendChild(toast.element);
    this.toasts.push({ id, element: toast.element, timeout: null });
    
    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.element.classList.add('toast-enter');
      requestAnimationFrame(() => {
        toast.element.classList.add('toast-enter-active');
      });
    });
    
    // Auto-dismiss
    if (duration > 0) {
      const timeout = setTimeout(() => {
        this.remove(id);
      }, duration);
      
      const toastData = this.toasts.find(t => t.id === id);
      if (toastData) {
        toastData.timeout = timeout;
      }
      
      // Pause on hover
      toast.element.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
      });
      
      toast.element.addEventListener('mouseleave', () => {
        const newTimeout = setTimeout(() => {
          this.remove(id);
        }, duration / 2);
        if (toastData) {
          toastData.timeout = newTimeout;
        }
      });
    }
    
    return id;
  }
  
  createToastElement({ id, type, title, message, dismissible, action, icon }) {
    const element = document.createElement('div');
    element.className = `toast toast-${type}`;
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'polite');
    element.dataset.toastId = id;
    
    const iconSvg = icon || this.getDefaultIcon(type);
    const progressBar = `<div class="toast-progress"><div class="toast-progress-bar"></div></div>`;
    
    let actionHtml = '';
    if (action) {
      actionHtml = `<button class="toast-action" onclick="${action.onClick}">${action.label}</button>`;
    }
    
    let closeHtml = '';
    if (dismissible) {
      closeHtml = `
        <button class="toast-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    }
    
    element.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
        ${actionHtml}
      </div>
      ${closeHtml}
      ${progressBar}
    `;
    
    // Bind close button
    const closeBtn = element.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.remove(id));
    }
    
    // Bind action button
    const actionBtn = element.querySelector('.toast-action');
    if (actionBtn && action) {
      actionBtn.addEventListener('click', () => {
        if (typeof action.onClick === 'function') {
          action.onClick();
        }
        if (action.closeOnClick !== false) {
          this.remove(id);
        }
      });
    }
    
    return { element };
  }
  
  getDefaultIcon(type) {
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      loading: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`
    };
    
    return icons[type] || icons.info;
  }
  
  remove(id) {
    const toastIndex = this.toasts.findIndex(t => t.id === id);
    if (toastIndex === -1) return;
    
    const toast = this.toasts[toastIndex];
    
    // Clear timeout
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }
    
    // Exit animation
    toast.element.classList.add('toast-exit');
    requestAnimationFrame(() => {
      toast.element.classList.add('toast-exit-active');
    });
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      this.toasts.splice(toastIndex, 1);
    }, 300);
  }
  
  removeAll() {
    [...this.toasts].forEach(toast => this.remove(toast.id));
  }
  
  update(id, options) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;
    
    const titleEl = toast.element.querySelector('.toast-title');
    const messageEl = toast.element.querySelector('.toast-message');
    
    if (titleEl && options.title !== undefined) {
      titleEl.textContent = options.title;
    }
    if (messageEl && options.message !== undefined) {
      messageEl.textContent = options.message;
    }
    
    // Reset timer if provided
    if (options.duration !== undefined && options.duration > 0) {
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }
      toast.timeout = setTimeout(() => {
        this.remove(id);
      }, options.duration);
    }
  }
  
  // Convenience methods
  success(message, options = {}) {
    return this.show({ type: 'success', message, ...options });
  }
  
  error(message, options = {}) {
    return this.show({ type: 'error', message, ...options });
  }
  
  warning(message, options = {}) {
    return this.show({ type: 'warning', message, ...options });
  }
  
  info(message, options = {}) {
    return this.show({ type: 'info', message, ...options });
  }
  
  loading(message = 'Loading...', options = {}) {
    return this.show({ type: 'loading', message, duration: 0, ...options });
  }
}

// Create global instance
window.Toast = new ToastNotification({ position: 'top-right', duration: 5000 });

// Auto-initialize
window.addEventListener('DOMContentLoaded', () => {
  // Demo toasts can be triggered manually
  window.showToast = (type, message) => window.Toast[type](message);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastNotification;
}
