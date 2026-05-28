/**
 * Advanced Toast Notification System v3.0
 * Fortune 500 Quality - Professional Toast Notifications
 * Features: Rich content, promises, positioning, action buttons, auto-dismiss
 */

class ToastSystem {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'top-right';
    this.maxToasts = options.maxToasts || 5;
    this.defaultDuration = options.duration || 5000;
    this.toasts = [];
    
    this.init();
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `toast-container ${this.position}`;
    document.body.appendChild(this.container);
  }

  create(options) {
    const {
      type = 'info',
      title,
      message,
      duration = this.defaultDuration,
      dismissible = true,
      actions = [],
      rich = null,
      onClose,
      onAction
    } = options;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Icon
    const iconSvg = this.getIconSvg(type);

    // Build content
    let contentHtml = '';
    
    if (rich) {
      // Rich content toast
      contentHtml = this.buildRichContent(rich, type, title, message);
    } else {
      // Standard toast
      contentHtml = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
          ${message ? `<div class="toast-message">${message}</div>` : ''}
          ${actions.length > 0 ? this.buildActions(actions) : ''}
        </div>
      `;
    }

    // Close button
    const closeHtml = dismissible ? `
      <button class="toast-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    ` : '';

    // Progress bar
    const progressHtml = duration !== Infinity ? `
      <div class="toast-progress" style="width: 100%"></div>
    ` : '';

    toast.innerHTML = contentHtml + closeHtml + progressHtml;

    // Add to container
    this.container.appendChild(toast);

    // Store toast data
    const toastData = {
      element: toast,
      startTime: Date.now(),
      duration,
      timerId: null,
      paused: false,
      remaining: duration,
      onClose,
      onAction
    };

    this.toasts.push(toastData);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Setup interactions
    this.setupInteractions(toastData);

    // Auto dismiss
    if (duration !== Infinity) {
      this.startTimer(toastData);
    }

    // Limit max toasts
    if (this.toasts.length > this.maxToasts) {
      this.dismiss(this.toasts[0]);
    }

    return {
      id: toastData,
      dismiss: () => this.dismiss(toastData),
      update: (updates) => this.update(toastData, updates)
    };
  }

  buildRichContent(rich, type, title, message) {
    let html = '<div class="toast-rich">';
    
    // Header
    html += `
      <div class="toast-rich-header">
        <div class="toast-icon">${this.getIconSvg(type)}</div>
        <div class="toast-content">
          ${title ? `<div class="toast-title">${title}</div>` : ''}
        </div>
      </div>
    `;

    // Body
    html += '<div class="toast-rich-body">';
    
    if (rich.image) {
      html += `<img src="${rich.image}" alt="" class="toast-rich-image">`;
    }
    
    if (message) {
      html += `<div class="toast-message">${message}</div>`;
    }
    
    html += '</div>';

    // Footer with actions
    if (rich.actions && rich.actions.length > 0) {
      html += '<div class="toast-rich-footer">';
      rich.actions.forEach(action => {
        html += `
          <button class="toast-btn ${action.primary ? 'toast-btn-primary' : 'toast-btn-secondary'}" 
                  data-action="${action.id || action.label}">
            ${action.label}
          </button>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  buildActions(actions) {
    return `
      <div class="toast-actions">
        ${actions.map(action => `
          <button class="toast-btn ${action.primary ? 'toast-btn-primary' : 'toast-btn-secondary'}" 
                  data-action="${action.id || action.label}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  setupInteractions(toastData) {
    const { element } = toastData;

    // Close button
    const closeBtn = element.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(toastData));
    }

    // Pause on hover
    element.addEventListener('mouseenter', () => this.pause(toastData));
    element.addEventListener('mouseleave', () => this.resume(toastData));

    // Action buttons
    const actionBtns = element.querySelectorAll('[data-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionId = e.currentTarget.dataset.action;
        if (toastData.onAction) {
          toastData.onAction(actionId, toastData);
        }
      });
    });

    // Touch swipe to dismiss
    let touchStartX = 0;
    element.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 100) {
        this.dismiss(toastData);
      }
    }, { passive: true });
  }

  startTimer(toastData) {
    const tick = () => {
      if (toastData.paused) return;

      const elapsed = Date.now() - toastData.startTime;
      const progress = Math.max(0, 100 - (elapsed / toastData.duration) * 100);

      const progressBar = toastData.element.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (elapsed >= toastData.duration) {
        this.dismiss(toastData);
      } else {
        toastData.timerId = requestAnimationFrame(tick);
      }
    };

    toastData.timerId = requestAnimationFrame(tick);
  }

  pause(toastData) {
    if (toastData.duration === Infinity) return;
    toastData.paused = true;
    toastData.remaining -= Date.now() - toastData.startTime;
    if (toastData.timerId) {
      cancelAnimationFrame(toastData.timerId);
    }
  }

  resume(toastData) {
    if (toastData.duration === Infinity || !toastData.paused) return;
    toastData.paused = false;
    toastData.startTime = Date.now() - (toastData.duration - toastData.remaining);
    this.startTimer(toastData);
  }

  dismiss(toastData) {
    const index = this.toasts.indexOf(toastData);
    if (index === -1) return;

    if (toastData.timerId) {
      cancelAnimationFrame(toastData.timerId);
    }

    toastData.element.classList.add('exiting');
    toastData.element.classList.add('closing');

    setTimeout(() => {
      toastData.element.remove();
      this.toasts.splice(index, 1);
      if (toastData.onClose) {
        toastData.onClose();
      }
    }, 400);
  }

  update(toastData, updates) {
    if (!toastData || !toastData.element) return;

    const { element } = toastData;

    // Update type
    if (updates.type) {
      element.className = `toast ${updates.type} show`;
      const iconEl = element.querySelector('.toast-icon');
      if (iconEl) {
        iconEl.innerHTML = this.getIconSvg(updates.type);
      }
    }

    // Update title
    if (updates.title !== undefined) {
      const titleEl = element.querySelector('.toast-title');
      if (titleEl) {
        titleEl.textContent = updates.title;
      }
    }

    // Update message
    if (updates.message !== undefined) {
      const messageEl = element.querySelector('.toast-message');
      if (messageEl) {
        messageEl.textContent = updates.message;
      }
    }

    // Update duration
    if (updates.duration !== undefined) {
      toastData.duration = updates.duration;
      toastData.remaining = updates.duration;
      toastData.startTime = Date.now();
      if (toastData.timerId) {
        cancelAnimationFrame(toastData.timerId);
      }
      if (updates.duration !== Infinity) {
        this.startTimer(toastData);
      }
    }
  }

  getIconSvg(type) {
    const icons = {
      success: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `,
      error: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      warning: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `,
      info: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `,
      loading: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      `
    };
    return icons[type] || icons.info;
  }

  // Convenience methods
  success(message, options = {}) {
    return this.create({
      type: 'success',
      title: options.title || 'Success',
      message,
      ...options
    });
  }

  error(message, options = {}) {
    return this.create({
      type: 'error',
      title: options.title || 'Error',
      message,
      duration: options.duration || 8000,
      ...options
    });
  }

  warning(message, options = {}) {
    return this.create({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      ...options
    });
  }

  info(message, options = {}) {
    return this.create({
      type: 'info',
      title: options.title || 'Information',
      message,
      ...options
    });
  }

  loading(message, options = {}) {
    return this.create({
      type: 'loading',
      title: options.title || 'Loading',
      message,
      duration: Infinity,
      dismissible: false,
      ...options
    });
  }

  promise(promise, options = {}) {
    const { loading: loadingMsg = 'Loading...', success, error } = options;

    const toast = this.loading(loadingMsg, { title: options.loadingTitle || 'Please wait' });

    promise
      .then((result) => {
        if (success) {
          const successOptions = typeof success === 'function' ? success(result) : success;
          toast.update({
            type: 'success',
            title: successOptions.title || 'Success',
            message: successOptions.message || 'Operation completed successfully',
            duration: 5000,
            dismissible: true
          });
        } else {
          toast.dismiss();
        }
        return result;
      })
      .catch((err) => {
        if (error) {
          const errorOptions = typeof error === 'function' ? error(err) : error;
          toast.update({
            type: 'error',
            title: errorOptions.title || 'Error',
            message: errorOptions.message || err.message || 'An error occurred',
            duration: 8000,
            dismissible: true
          });
        } else {
          toast.dismiss();
        }
        throw err;
      });

    return toast;
  }

  dismissAll() {
    [...this.toasts].forEach(toast => this.dismiss(toast));
  }

  setPosition(position) {
    this.container.className = `toast-container ${position}`;
  }
}

// Create global instance
window.ToastSystem = new ToastSystem();

// Shorthand functions
window.toast = {
  success: (msg, opts) => window.ToastSystem.success(msg, opts),
  error: (msg, opts) => window.ToastSystem.error(msg, opts),
  warning: (msg, opts) => window.ToastSystem.warning(msg, opts),
  info: (msg, opts) => window.ToastSystem.info(msg, opts),
  loading: (msg, opts) => window.ToastSystem.loading(msg, opts),
  promise: (promise, opts) => window.ToastSystem.promise(promise, opts),
  dismissAll: () => window.ToastSystem.dismissAll()
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastSystem;
}
