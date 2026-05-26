/**
 * BuildBridge Advanced Toast Notification System v1.0
 * Fortune 500 Quality - Rich notifications with progress bars, actions & stacking
 * Features: Multiple positions, auto-dismiss with pause on hover, action buttons, stacking
 */

class AdvancedToastSystem {
  constructor(options = {}) {
    this.position = options.position || 'bottom-right';
    this.maxVisible = options.maxVisible || 5;
    this.defaultDuration = options.defaultDuration || 5000;
    this.toasts = [];
    this.container = null;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.bindGlobalErrorHandler();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `toast-container toast-container--${this.position}`;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  }
  
  bindGlobalErrorHandler() {
    // Catch unhandled errors and show toast
    window.addEventListener('error', (e) => {
      this.error('Something went wrong', {
        description: e.message,
        duration: 8000
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.error('Request failed', {
        description: e.reason?.message || 'Network error occurred',
        duration: 8000
      });
    });
  }
  
  create(options) {
    const {
      type = 'info',
      title,
      message,
      description,
      duration = this.defaultDuration,
      actions = [],
      icon,
      closable = true,
      progressBar = true,
      pauseOnHover = true,
      onClose,
      onAction
    } = options;
    
    // Limit visible toasts
    if (this.toasts.length >= this.maxVisible) {
      this.remove(this.toasts[0].id);
    }
    
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const toast = document.createElement('div');
    
    toast.className = `advanced-toast advanced-toast--${type}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');
    
    // Icon mapping
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳'
    };
    
    const toastIcon = icon || icons[type] || icons.info;
    const isLoading = type === 'loading';
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon ${isLoading ? 'toast-icon--spinning' : ''}">
          ${toastIcon}
        </div>
        <div class="toast-body">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          ${message ? `<div class="toast-message">${message}</div>` : ''}
          ${description ? `<div class="toast-description">${description}</div>` : ''}
          ${actions.length ? `
            <div class="toast-actions">
              ${actions.map((action, i) => `
                <button class="toast-action-btn ${action.primary ? 'toast-action-btn--primary' : ''}" data-action="${i}">
                  ${action.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        ${closable ? `
          <button class="toast-close" aria-label="Close notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
      </div>
      ${progressBar && !isLoading ? `
        <div class="toast-progress">
          <div class="toast-progress-bar"></div>
        </div>
      ` : ''}
    `;
    
    // Add to container
    this.container.appendChild(toast);
    
    // Store toast data
    const toastData = {
      id,
      element: toast,
      startTime: Date.now(),
      duration,
      remaining: duration,
      timerId: null,
      isPaused: false,
      onClose
    };
    
    this.toasts.push(toastData);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
      if (!isLoading) {
        this.startTimer(toastData);
      }
    });
    
    // Bind events
    if (closable) {
      toast.querySelector('.toast-close').addEventListener('click', () => {
        this.remove(id);
      });
    }
    
    // Action buttons
    if (actions.length) {
      toast.querySelectorAll('.toast-action-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const action = actions[i];
          if (action.onClick) {
            action.onClick();
          }
          if (onAction) {
            onAction(action, i);
          }
          if (action.dismiss !== false) {
            this.remove(id);
          }
        });
      });
    }
    
    // Pause on hover
    if (pauseOnHover && !isLoading) {
      toast.addEventListener('mouseenter', () => this.pauseTimer(toastData));
      toast.addEventListener('mouseleave', () => this.resumeTimer(toastData));
    }
    
    // Swipe to dismiss on mobile
    this.bindSwipeToDismiss(toast, id);
    
    return id;
  }
  
  startTimer(toastData) {
    const progressBar = toastData.element.querySelector('.toast-progress-bar');
    
    const tick = () => {
      if (toastData.isPaused) return;
      
      const elapsed = Date.now() - toastData.startTime;
      const remaining = Math.max(0, toastData.remaining - elapsed);
      const progress = (remaining / toastData.duration) * 100;
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      if (remaining <= 0) {
        this.remove(toastData.id);
      } else {
        toastData.timerId = requestAnimationFrame(tick);
      }
    };
    
    toastData.startTime = Date.now();
    toastData.timerId = requestAnimationFrame(tick);
  }
  
  pauseTimer(toastData) {
    if (toastData.isPaused) return;
    
    toastData.isPaused = true;
    const elapsed = Date.now() - toastData.startTime;
    toastData.remaining -= elapsed;
    
    if (toastData.timerId) {
      cancelAnimationFrame(toastData.timerId);
    }
    
    toastData.element.classList.add('toast--paused');
  }
  
  resumeTimer(toastData) {
    if (!toastData.isPaused) return;
    
    toastData.isPaused = false;
    toastData.startTime = Date.now();
    toastData.element.classList.remove('toast--paused');
    
    if (toastData.remaining > 0) {
      this.startTimer(toastData);
    }
  }
  
  bindSwipeToDismiss(toast, id) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const handleStart = (e) => {
      startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      isDragging = true;
      toast.style.transition = 'none';
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const diff = currentX - startX;
      
      // Only allow left swipe
      if (diff < 0) {
        toast.style.transform = `translateX(${diff}px)`;
        toast.style.opacity = 1 + (diff / 200);
      }
    };
    
    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      toast.style.transition = '';
      
      const diff = currentX - startX;
      
      if (diff < -100) {
        this.remove(id);
      } else {
        toast.style.transform = '';
        toast.style.opacity = '';
      }
    };
    
    toast.addEventListener('touchstart', handleStart, { passive: true });
    toast.addEventListener('touchmove', handleMove, { passive: true });
    toast.addEventListener('touchend', handleEnd);
  }
  
  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const toastData = this.toasts[index];
    const toast = toastData.element;
    
    // Cancel timer
    if (toastData.timerId) {
      cancelAnimationFrame(toastData.timerId);
    }
    
    // Animate out
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exiting');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // Remove from array
      this.toasts.splice(index, 1);
      
      // Trigger callback
      if (toastData.onClose) {
        toastData.onClose();
      }
    }, 300);
  }
  
  update(id, updates) {
    const toastData = this.toasts.find(t => t.id === id);
    if (!toastData) return;
    
    const toast = toastData.element;
    
    if (updates.message) {
      const messageEl = toast.querySelector('.toast-message');
      if (messageEl) messageEl.textContent = updates.message;
    }
    
    if (updates.title) {
      const titleEl = toast.querySelector('.toast-title');
      if (titleEl) titleEl.textContent = updates.title;
    }
    
    if (updates.type) {
      toast.className = toast.className.replace(/advanced-toast--\w+/, `advanced-toast--${updates.type}`);
    }
  }
  
  // Convenience methods
  success(message, options = {}) {
    return this.create({ type: 'success', message, ...options });
  }
  
  error(message, options = {}) {
    return this.create({ type: 'error', message, ...options });
  }
  
  warning(message, options = {}) {
    return this.create({ type: 'warning', message, ...options });
  }
  
  info(message, options = {}) {
    return this.create({ type: 'info', message, ...options });
  }
  
  loading(message, options = {}) {
    return this.create({ type: 'loading', message, duration: Infinity, ...options });
  }
  
  promise(promise, options = {}) {
    const { loading = 'Loading...', success = 'Success!', error = 'Error occurred' } = options;
    
    const id = this.loading(loading, { ...options.loading });
    
    promise
      .then((result) => {
        this.remove(id);
        const successMessage = typeof success === 'function' ? success(result) : success;
        this.success(successMessage, options.success);
        return result;
      })
      .catch((err) => {
        this.remove(id);
        const errorMessage = typeof error === 'function' ? error(err) : error;
        this.error(errorMessage, options.error);
        throw err;
      });
    
    return promise;
  }
  
  clear() {
    [...this.toasts].forEach(t => this.remove(t.id));
  }
}

// Initialize global toast system
document.addEventListener('DOMContentLoaded', () => {
  window.Toast = new AdvancedToastSystem({
    position: 'bottom-right',
    maxVisible: 5,
    defaultDuration: 5000
  });
  
  // Demo on first load
  if (!sessionStorage.getItem('toast-demo-shown')) {
    setTimeout(() => {
      window.Toast.info('Welcome to BuildBridge', {
        title: '👋 Hello!',
        description: 'Press / to search or try our new features',
        duration: 6000
      });
      sessionStorage.setItem('toast-demo-shown', 'true');
    }, 2000);
  }
});

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedToastSystem;
}
