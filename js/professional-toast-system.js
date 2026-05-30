/**
 * Professional Toast Notification System - v110.0
 * Fortune 500 Notification Experience
 */

class ProfessionalToastSystem {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      maxToasts: 5,
      defaultDuration: 5000,
      pauseOnHover: true,
      ...options
    };
    
    this.toasts = [];
    this.container = null;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    // Attach to window for global access
    window.showToast = this.show.bind(this);
    window.toastSystem = this;
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('data-position', this.options.position);
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', 'Notifications');
    
    document.body.appendChild(this.container);
  }
  
  /**
   * Show a toast notification
   * @param {Object|String} options - Toast options or message string
   */
  show(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    const config = {
      type: 'info',
      title: null,
      message: '',
      duration: this.options.defaultDuration,
      actions: [],
      onClose: null,
      onAction: null,
      icon: null,
      image: null,
      closable: true,
      progress: true,
      ...options
    };
    
    // Limit max toasts
    if (this.toasts.length >= this.options.maxToasts) {
      this.remove(this.toasts[0].id);
    }
    
    const toast = this.createToastElement(config);
    this.container.appendChild(toast.element);
    
    // Store reference
    const toastData = {
      id: toast.id,
      element: toast.element,
      config: config,
      timeout: null,
      startTime: Date.now(),
      remaining: config.duration
    };
    
    this.toasts.push(toastData);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.element.classList.add('show');
    });
    
    // Auto close
    if (config.duration > 0) {
      this.startTimer(toastData);
    }
    
    // Pause on hover
    if (this.options.pauseOnHover) {
      toast.element.addEventListener('mouseenter', () => this.pauseTimer(toastData));
      toast.element.addEventListener('mouseleave', () => this.resumeTimer(toastData));
    }
    
    return toastData.id;
  }
  
  createToastElement(config) {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const element = document.createElement('div');
    element.className = `toast toast-${config.type}`;
    element.id = id;
    element.setAttribute('role', 'alert');
    
    // Set CSS variable for animation duration
    element.style.setProperty('--toast-duration', `${config.duration}ms`);
    
    // Icon
    const icon = config.icon || this.getDefaultIcon(config.type);
    
    // Build HTML
    let html = '';
    
    // Image if provided
    if (config.image) {
      element.classList.add('toast-with-image');
      html += `<img src="${config.image}" alt="" class="toast-image">`;
      html += '<div class="toast-content-wrapper">';
    }
    
    html += `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${config.title ? `<h4 class="toast-title">${config.title}</h4>` : ''}
        <p class="toast-message">${config.message}</p>
        ${this.renderActions(config.actions)}
      </div>
    `;
    
    if (config.closable) {
      html += `<button class="toast-close" aria-label="Close notification">✕</button>`;
    }
    
    if (config.image) {
      html += '</div>';
    }
    
    // Progress bar
    if (config.progress && config.duration > 0) {
      html += `
        <div class="toast-progress">
          <div class="toast-progress-bar"></div>
        </div>
      `;
    }
    
    element.innerHTML = html;
    
    // Bind close button
    if (config.closable) {
      element.querySelector('.toast-close').addEventListener('click', () => {
        this.remove(id);
      });
    }
    
    // Bind actions
    if (config.actions.length > 0) {
      element.querySelectorAll('.toast-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          if (config.onAction) {
            config.onAction(config.actions[index].action, id);
          }
          if (config.actions[index].close !== false) {
            this.remove(id);
          }
        });
      });
    }
    
    return { id, element };
  }
  
  renderActions(actions) {
    if (!actions || actions.length === 0) return '';
    
    return `
      <div class="toast-actions">
        ${actions.map((action, index) => `
          <button class="toast-btn ${action.primary ? 'toast-btn-primary' : 'toast-btn-secondary'}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }
  
  getDefaultIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      gold: '★'
    };
    return icons[type] || icons.info;
  }
  
  startTimer(toastData) {
    toastData.timeout = setTimeout(() => {
      this.remove(toastData.id);
    }, toastData.remaining);
    toastData.startTime = Date.now();
  }
  
  pauseTimer(toastData) {
    if (toastData.timeout) {
      clearTimeout(toastData.timeout);
      toastData.timeout = null;
      toastData.remaining -= Date.now() - toastData.startTime;
      
      // Pause progress bar animation
      const progressBar = toastData.element.querySelector('.toast-progress-bar');
      if (progressBar) {
        progressBar.style.animationPlayState = 'paused';
      }
    }
  }
  
  resumeTimer(toastData) {
    if (!toastData.timeout && toastData.remaining > 0) {
      this.startTimer(toastData);
      
      // Resume progress bar animation
      const progressBar = toastData.element.querySelector('.toast-progress-bar');
      if (progressBar) {
        progressBar.style.animationPlayState = 'running';
      }
    }
  }
  
  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const toastData = this.toasts[index];
    
    // Clear timeout
    if (toastData.timeout) {
      clearTimeout(toastData.timeout);
    }
    
    // Call onClose callback
    if (toastData.config.onClose) {
      toastData.config.onClose();
    }
    
    // Animate out
    toastData.element.classList.add('hiding');
    
    // Remove from DOM and array
    setTimeout(() => {
      toastData.element.remove();
      this.toasts.splice(index, 1);
    }, 400);
  }
  
  /**
   * Show a success toast
   */
  success(message, options = {}) {
    return this.show({ type: 'success', message, ...options });
  }
  
  /**
   * Show an error toast
   */
  error(message, options = {}) {
    return this.show({ type: 'error', message, title: 'Error', ...options });
  }
  
  /**
   * Show a warning toast
   */
  warning(message, options = {}) {
    return this.show({ type: 'warning', message, title: 'Warning', ...options });
  }
  
  /**
   * Show an info toast
   */
  info(message, options = {}) {
    return this.show({ type: 'info', message, ...options });
  }
  
  /**
   * Show a loading toast that updates on promise resolution
   */
  promise(promise, options = {}) {
    const loadingConfig = {
      type: 'gold',
      title: options.loading || 'Loading...',
      message: options.message || 'Please wait',
      duration: 0,
      icon: '🔄',
      progress: false,
      ...options
    };
    
    const id = this.show(loadingConfig);
    const toastData = this.toasts.find(t => t.id === id);
    
    promise
      .then(result => {
        if (toastData) {
          toastData.element.querySelector('.toast-title').textContent = options.success || 'Success!';
          toastData.element.querySelector('.toast-message').textContent = options.successMessage || result;
          toastData.element.classList.remove('toast-gold');
          toastData.element.classList.add('toast-success', 'toast-promise-resolved');
          toastData.element.querySelector('.toast-icon').textContent = '✓';
          
          this.startTimer({ ...toastData, remaining: 3000 });
        }
      })
      .catch(error => {
        if (toastData) {
          toastData.element.querySelector('.toast-title').textContent = options.error || 'Error';
          toastData.element.querySelector('.toast-message').textContent = options.errorMessage || error.message;
          toastData.element.classList.remove('toast-gold');
          toastData.element.classList.add('toast-error', 'toast-promise-rejected');
          toastData.element.querySelector('.toast-icon').textContent = '✕';
          
          this.startTimer({ ...toastData, remaining: 5000 });
        }
      });
    
    return id;
  }
  
  /**
   * Clear all toasts
   */
  clearAll() {
    [...this.toasts].forEach(t => this.remove(t.id));
  }
  
  /**
   * Update position
   */
  setPosition(position) {
    this.options.position = position;
    this.container.setAttribute('data-position', position);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.toastSystem = new ProfessionalToastSystem();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfessionalToastSystem;
}
