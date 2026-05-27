/**
 * v28.0: Advanced Toast Notification System
 * Fortune 500 Quality User Feedback
 * Supports promises, actions, rich content, and stacking
 */

(function() {
  'use strict';
  
  const ToastSystem = {
    // Configuration
    config: {
      defaultDuration: 5000,
      maxVisible: 5,
      position: 'top-right',
      pauseOnHover: true,
      showProgress: true
    },
    
    // State
    container: null,
    toasts: [],
    toastId: 0,
    
    // Icons
    icons: {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      promise: '◌',
      loading: '⟳'
    },
    
    /**
     * Initialize toast container
     */
    init() {
      this.createContainer();
      console.log('🔔 BuildBridge Advanced Toast System initialized');
    },
    
    /**
     * Create toast container
     */
    createContainer() {
      if (document.getElementById('toast-container')) return;
      
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = `toast-container ${this.config.position}`;
      document.body.appendChild(this.container);
    },
    
    /**
     * Create a toast notification
     */
    create(options = {}) {
      const {
        type = 'info',
        title = '',
        message = '',
        duration = this.config.defaultDuration,
        actions = [],
        image = null,
        icon = null,
        closable = true,
        onClose = null,
        onAction = null,
        promise = null,
        id = ++this.toastId
      } = options;
      
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.dataset.id = id;
      
      // Build content
      let content = '';
      
      // Icon
      const iconChar = icon || this.icons[type];
      if (type === 'promise' || type === 'loading') {
        content += `<div class="toast-spinner"></div>`;
      } else {
        content += `<div class="toast-icon">${iconChar}</div>`;
      }
      
      // Image (if provided)
      if (image) {
        toast.classList.add('toast-with-image');
        content += `<img src="${image}" alt="" class="toast-image">`;
        content += `<div class="toast-image-content">`;
      }
      
      // Text content
      content += `<div class="toast-content">`;
      if (title) {
        content += `<h4 class="toast-title">${this.escapeHtml(title)}</h4>`;
      }
      content += `<p class="toast-message">${this.escapeHtml(message)}</p>`;
      
      // Actions
      if (actions.length > 0) {
        content += `<div class="toast-actions">`;
        actions.forEach((action, index) => {
          content += `<button class="toast-action ${action.primary ? 'primary' : ''}" data-action="${index}">${this.escapeHtml(action.text)}</button>`;
        });
        content += `</div>`;
      }
      
      content += `</div>`; // Close toast-content
      
      if (image) {
        content += `</div>`; // Close toast-image-content
      }
      
      // Close button
      if (closable) {
        content += `<button class="toast-close" aria-label="Close notification">×</button>`;
      }
      
      // Progress bar
      if (this.config.showProgress && duration > 0 && !promise) {
        content += `<div class="toast-progress"><div class="toast-progress-bar"></div></div>`;
      }
      
      toast.innerHTML = content;
      
      // Event listeners
      this.bindToastEvents(toast, { duration, closable, onClose, onAction, actions, promise });
      
      // Add to container
      this.container.appendChild(toast);
      this.toasts.push({ id, element: toast, startTime: Date.now(), duration });
      
      // Animate in
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
      
      // Update stack positions
      this.updateStack();
      
      // Handle promise
      if (promise && typeof promise.then === 'function') {
        this.handlePromise(toast, promise, options);
      }
      
      return {
        id,
        dismiss: () => this.dismiss(id),
        update: (newOptions) => this.update(id, newOptions)
      };
    },
    
    /**
     * Bind events to toast
     */
    bindToastEvents(toast, options) {
      const { duration, closable, onClose, onAction, actions, promise } = options;
      let remainingTime = duration;
      let startTime = Date.now();
      let timerId = null;
      let isPaused = false;
      
      // Auto-dismiss timer
      const startTimer = () => {
        if (duration <= 0 || promise) return;
        
        const progressBar = toast.querySelector('.toast-progress-bar');
        
        const tick = () => {
          if (isPaused) return;
          
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, remainingTime - elapsed);
          
          if (progressBar) {
            const percent = (remaining / duration) * 100;
            progressBar.style.transform = `scaleX(${percent / 100})`;
          }
          
          if (remaining <= 0) {
            this.dismiss(toast.dataset.id);
          } else {
            timerId = requestAnimationFrame(tick);
          }
        };
        
        timerId = requestAnimationFrame(tick);
      };
      
      startTimer();
      
      // Pause on hover
      if (this.config.pauseOnHover && duration > 0) {
        toast.addEventListener('mouseenter', () => {
          isPaused = true;
          remainingTime -= Date.now() - startTime;
          if (timerId) cancelAnimationFrame(timerId);
        });
        
        toast.addEventListener('mouseleave', () => {
          isPaused = false;
          startTime = Date.now();
          startTimer();
        });
      }
      
      // Close button
      if (closable) {
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            if (onClose) onClose();
            this.dismiss(toast.dataset.id);
          });
        }
      }
      
      // Action buttons
      if (actions.length > 0) {
        toast.querySelectorAll('.toast-action').forEach((btn, index) => {
          btn.addEventListener('click', () => {
            if (onAction) onAction(actions[index], index);
            if (actions[index].onClick) actions[index].onClick();
            if (actions[index].dismiss !== false) {
              this.dismiss(toast.dataset.id);
            }
          });
        });
      }
    },
    
    /**
     * Handle promise-based toast
     */
    handlePromise(toast, promise, options) {
      const successMessage = options.successMessage || options.message;
      const errorMessage = options.errorMessage || 'An error occurred';
      const loadingMessage = options.loadingMessage || 'Loading...';
      
      promise
        .then((result) => {
          toast.classList.remove('promise');
          toast.classList.add('success');
          toast.querySelector('.toast-spinner')?.remove();
          
          const iconEl = document.createElement('div');
          iconEl.className = 'toast-icon';
          iconEl.textContent = this.icons.success;
          toast.insertBefore(iconEl, toast.firstChild);
          
          const messageEl = toast.querySelector('.toast-message');
          if (messageEl) {
            messageEl.textContent = typeof successMessage === 'function' 
              ? successMessage(result) 
              : successMessage;
          }
          
          // Auto-dismiss after delay
          setTimeout(() => this.dismiss(toast.dataset.id), this.config.defaultDuration);
        })
        .catch((error) => {
          toast.classList.remove('promise');
          toast.classList.add('error');
          toast.querySelector('.toast-spinner')?.remove();
          
          const iconEl = document.createElement('div');
          iconEl.className = 'toast-icon';
          iconEl.textContent = this.icons.error;
          toast.insertBefore(iconEl, toast.firstChild);
          
          const messageEl = toast.querySelector('.toast-message');
          if (messageEl) {
            messageEl.textContent = typeof errorMessage === 'function' 
              ? errorMessage(error) 
              : errorMessage;
          }
          
          setTimeout(() => this.dismiss(toast.dataset.id), this.config.defaultDuration);
        });
    },
    
    /**
     * Update existing toast
     */
    update(id, options) {
      const toastData = this.toasts.find(t => t.id == id);
      if (!toastData) return;
      
      const toast = toastData.element;
      
      if (options.title) {
        const titleEl = toast.querySelector('.toast-title');
        if (titleEl) titleEl.textContent = options.title;
      }
      
      if (options.message) {
        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = options.message;
      }
      
      if (options.type) {
        toast.className = `toast ${options.type} show`;
      }
      
      return { id, dismiss: () => this.dismiss(id) };
    },
    
    /**
     * Dismiss a toast
     */
    dismiss(id) {
      const index = this.toasts.findIndex(t => t.id == id);
      if (index === -1) return;
      
      const toast = this.toasts[index].element;
      toast.classList.add('hiding');
      toast.classList.remove('show');
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
        this.toasts.splice(index, 1);
        this.updateStack();
      }, 400);
    },
    
    /**
     * Update toast stack positions
     */
    updateStack() {
      // Limit visible toasts
      this.toasts.slice(this.config.maxVisible).forEach(t => {
        t.element.style.opacity = '0';
        t.element.style.pointerEvents = 'none';
      });
    },
    
    /**
     * Dismiss all toasts
     */
    dismissAll() {
      [...this.toasts].forEach(t => this.dismiss(t.id));
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    // Convenience methods
    success(message, title, options = {}) {
      return this.create({ type: 'success', message, title, ...options });
    },
    
    error(message, title, options = {}) {
      return this.create({ type: 'error', message, title, ...options });
    },
    
    warning(message, title, options = {}) {
      return this.create({ type: 'warning', message, title, ...options });
    },
    
    info(message, title, options = {}) {
      return this.create({ type: 'info', message, title, ...options });
    },
    
    promise(promise, options = {}) {
      return this.create({ type: 'promise', promise, ...options });
    },
    
    loading(message, options = {}) {
      return this.create({ 
        type: 'loading', 
        message, 
        duration: 0, 
        closable: false,
        ...options 
      });
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ToastSystem.init());
  } else {
    ToastSystem.init();
  }
  
  // Expose global Toast object
  window.Toast = {
    success: (message, title, options) => ToastSystem.success(message, title, options),
    error: (message, title, options) => ToastSystem.error(message, title, options),
    warning: (message, title, options) => ToastSystem.warning(message, title, options),
    info: (message, title, options) => ToastSystem.info(message, title, options),
    promise: (promise, options) => ToastSystem.promise(promise, options),
    loading: (message, options) => ToastSystem.loading(message, options),
    dismiss: (id) => ToastSystem.dismiss(id),
    dismissAll: () => ToastSystem.dismissAll(),
    create: (options) => ToastSystem.create(options)
  };
  
})();
