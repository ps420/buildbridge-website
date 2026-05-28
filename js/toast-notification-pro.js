/**
 * v47.0: TOAST NOTIFICATION PRO - Fortune 500 Professional
 * Advanced notification system with stacking, actions, and persistence
 */

(function() {
  'use strict';

  window.ToastSystem = {
    // Configuration
    config: {
      maxVisible: 5,
      defaultDuration: 5000,
      defaultPosition: 'top-right',
      pauseOnHover: true,
      newestOnTop: false
    },

    // State
    state: {
      toasts: [],
      toastId: 0,
      containers: {}
    },

    // Icon SVGs
    icons: {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    },

    /**
     * Initialize the toast system
     */
    init(options = {}) {
      Object.assign(this.config, options);
      
      // Create default container
      this.getContainer(this.config.defaultPosition);
      
      console.log('[ToastSystem] Initialized');
      
      return this;
    },

    /**
     * Get or create container for position
     */
    getContainer(position) {
      if (this.state.containers[position]) {
        return this.state.containers[position];
      }

      const container = document.createElement('div');
      container.className = 'toast-container';
      container.dataset.position = position;
      document.body.appendChild(container);
      
      this.state.containers[position] = container;
      return container;
    },

    /**
     * Show a toast notification
     */
    show(options = {}) {
      const {
        message = '',
        title = '',
        type = 'default',
        duration = this.config.defaultDuration,
        position = this.config.defaultPosition,
        actions = [],
        onClose = null,
        onAction = null,
        persistent = false,
        showProgress = true,
        compact = false,
        image = null
      } = options;

      // Generate unique ID
      const id = ++this.state.toastId;

      // Get container
      const container = this.getContainer(position);

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast-pro toast-${type}`;
      toast.dataset.id = id;
      
      if (compact) toast.classList.add('toast-compact');
      if (image) toast.classList.add('toast-with-image');

      // Build actions HTML
      const actionsHtml = actions.map((action, i) => `
        <button class="toast-action-btn toast-action-btn-${action.type || 'secondary'}" data-action="${i}">
          ${action.label}
        </button>
      `).join('');

      // Build content
      toast.innerHTML = `
        ${image ? `<img src="${image}" alt="" class="toast-image">` : ''}
        <div class="toast-icon">
          ${this.icons[type] || this.icons.default}
        </div>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          <div class="toast-message">${message}</div>
          ${actions.length ? `<div class="toast-actions">${actionsHtml}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="Close notification">
          ${this.icons.close}
        </button>
        ${showProgress && !persistent ? `<div class="toast-progress"><div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div></div>` : ''}
      `;

      // Add to container
      if (this.config.newestOnTop) {
        container.insertBefore(toast, container.firstChild);
      } else {
        container.appendChild(toast);
      }

      // Create toast object
      const toastObj = {
        id,
        element: toast,
        startTime: Date.now(),
        duration,
        remaining: duration,
        timer: null,
        onClose,
        onAction
      };

      // Store reference
      this.state.toasts.push(toastObj);

      // Manage stack
      this.manageStack(container);

      // Bind events
      this.bindToastEvents(toastObj, toast);

      // Start timer if not persistent
      if (!persistent) {
        this.startTimer(toastObj);
      }

      // Dispatch event
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { id, message, type }
      }));

      return {
        id,
        close: () => this.close(id),
        update: (newOptions) => this.update(id, newOptions)
      };
    },

    /**
     * Bind events to toast
     */
    bindToastEvents(toastObj, element) {
      // Close button
      const closeBtn = element.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.close(toastObj.id));

      // Action buttons
      const actionBtns = element.querySelectorAll('.toast-action-btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const actionIndex = parseInt(btn.dataset.action);
          if (toastObj.onAction) {
            toastObj.onAction(actionIndex, btn);
          }
        });
      });

      // Pause on hover
      if (this.config.pauseOnHover && toastObj.duration) {
        element.addEventListener('mouseenter', () => {
          this.pauseTimer(toastObj);
        });

        element.addEventListener('mouseleave', () => {
          this.startTimer(toastObj);
        });
      }

      // Close on click (if no actions)
      if (!actionBtns.length) {
        element.addEventListener('click', (e) => {
          if (e.target.closest('.toast-action-btn')) return;
          this.close(toastObj.id);
        });
      }
    },

    /**
     * Manage toast stack
     */
    manageStack(container) {
      const toasts = Array.from(container.children);
      const max = this.config.maxVisible;

      toasts.forEach((toast, index) => {
        if (toasts.length > max && index < toasts.length - max) {
          toast.style.display = 'none';
        } else {
          toast.style.display = 'flex';
          // Add stacked effect
          const stackIndex = toasts.length - 1 - index;
          if (stackIndex > 0 && stackIndex < 3) {
            toast.dataset.stacked = 'true';
            toast.style.transform = `scale(${1 - stackIndex * 0.05}) translateY(${stackIndex * -8}px)`;
            toast.style.opacity = 1 - stackIndex * 0.15;
          } else {
            toast.dataset.stacked = 'false';
            toast.style.transform = '';
            toast.style.opacity = '';
          }
        }
      });
    },

    /**
     * Start countdown timer
     */
    startTimer(toastObj) {
      this.clearTimer(toastObj);
      
      toastObj.timer = setTimeout(() => {
        this.close(toastObj.id);
      }, toastObj.remaining);
    },

    /**
     * Pause countdown timer
     */
    pauseTimer(toastObj) {
      if (!toastObj.timer) return;
      
      const elapsed = Date.now() - toastObj.startTime;
      toastObj.remaining = Math.max(0, toastObj.remaining - elapsed);
      this.clearTimer(toastObj);
    },

    /**
     * Clear timer
     */
    clearTimer(toastObj) {
      if (toastObj.timer) {
        clearTimeout(toastObj.timer);
        toastObj.timer = null;
      }
    },

    /**
     * Close a specific toast
     */
    close(id) {
      const index = this.state.toasts.findIndex(t => t.id === id);
      if (index === -1) return;

      const toastObj = this.state.toasts[index];
      const toast = toastObj.element;

      // Clear timer
      this.clearTimer(toastObj);

      // Add exit animation
      toast.classList.add('toast-exit');

      // Remove after animation
      setTimeout(() => {
        toast.remove();
        this.state.toasts.splice(index, 1);
        
        // Update stacks for all containers
        Object.values(this.state.containers).forEach(container => {
          this.manageStack(container);
        });

        // Call callback
        if (toastObj.onClose) {
          toastObj.onClose();
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('toast:close', {
          detail: { id }
        }));
      }, 300);
    },

    /**
     * Update an existing toast
     */
    update(id, options) {
      const toastObj = this.state.toasts.find(t => t.id === id);
      if (!toastObj) return;

      const toast = toastObj.element;
      
      if (options.message) {
        const msgEl = toast.querySelector('.toast-message');
        if (msgEl) msgEl.textContent = options.message;
      }

      if (options.type) {
        toast.className = toast.className.replace(/toast-\w+/, `toast-${options.type}`);
      }

      if (options.duration) {
        toastObj.duration = options.duration;
        toastObj.remaining = options.duration;
        toastObj.startTime = Date.now();
        this.startTimer(toastObj);
      }
    },

    /**
     * Close all toasts
     */
    closeAll() {
      [...this.state.toasts].forEach(toast => this.close(toast.id));
    },

    /**
     * Convenience methods for different types
     */
    success(message, options = {}) {
      return this.show({ ...options, message, type: 'success' });
    },

    error(message, options = {}) {
      return this.show({ ...options, message, type: 'error' });
    },

    warning(message, options = {}) {
      return this.show({ ...options, message, type: 'warning' });
    },

    info(message, options = {}) {
      return this.show({ ...options, message, type: 'info' });
    },

    loading(message = 'Loading...', options = {}) {
      return this.show({
        ...options,
        message,
        type: 'default',
        persistent: true,
        showProgress: false,
        icon: `<div class="toast-spinner"></div>`
      });
    },

    promise(promise, messages = {}, options = {}) {
      const { loading = 'Loading...', success = 'Success!', error = 'Error occurred' } = messages;
      
      const toast = this.loading(loading, options);
      
      promise
        .then(result => {
          toast.close();
          this.success(typeof success === 'function' ? success(result) : success, options);
          return result;
        })
        .catch(err => {
          toast.close();
          this.error(typeof error === 'function' ? error(err) : error, options);
          throw err;
        });
      
      return promise;
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ToastSystem.init());
  } else {
    window.ToastSystem.init();
  }

})();
