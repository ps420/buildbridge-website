/**
 * Toast Notification Hub
 * Fortune 500 Professional Notification System
 * 
 * Features:
 * - Multiple toast types (success, error, warning, info, promise)
 * - Stacking with position management
 * - Action buttons
 * - Progress/countdown
 * - Notification history panel
 * - Promise-based async notifications
 */

class ToastHub {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'top-right',
      maxVisible: options.maxVisible || 5,
      defaultDuration: options.defaultDuration || 5000,
      ...options
    };
    
    this.toasts = [];
    this.history = [];
    this.idCounter = 0;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.createHistoryPanel();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `toast-hub toast-hub-${this.options.position}`;
    document.body.appendChild(this.container);
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'toast-hub-toggle';
    this.toggleBtn.innerHTML = '🔔';
    this.toggleBtn.setAttribute('aria-label', 'Notification history');
    this.toggleBtn.addEventListener('click', () => this.toggleHistory());
    document.body.appendChild(this.toggleBtn);
  }
  
  createHistoryPanel() {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'toast-history-backdrop';
    this.backdrop.addEventListener('click', () => this.closeHistory());
    document.body.appendChild(this.backdrop);
    
    // Panel
    this.historyPanel = document.createElement('div');
    this.historyPanel.className = 'toast-history-panel';
    this.historyPanel.innerHTML = `
      <div class="toast-history-header">
        <h3 class="toast-history-title">Notifications</h3>
        <button class="toast-history-close" aria-label="Close">✕</button>
      </div>
      <div class="toast-history-list"></div>
      <div class="toast-history-footer">
        <button class="toast-history-clear">Clear All History</button>
      </div>
    `;
    
    document.body.appendChild(this.historyPanel);
    
    // Event listeners
    this.historyPanel.querySelector('.toast-history-close').addEventListener('click', () => this.closeHistory());
    this.historyPanel.querySelector('.toast-history-clear').addEventListener('click', () => this.clearHistory());
    
    this.historyList = this.historyPanel.querySelector('.toast-history-list');
  }
  
  show(options = {}) {
    const id = ++this.idCounter;
    const toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || this.options.defaultDuration,
      actions: options.actions || [],
      icon: options.icon || this.getIconForType(options.type),
      promise: options.promise || null,
      timestamp: new Date()
    };
    
    // Add to history
    this.addToHistory(toast);
    
    // Create DOM element
    const element = this.createToastElement(toast);
    this.container.appendChild(element);
    toast.element = element;
    
    // Add to active toasts
    this.toasts.push(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      element.classList.add('show');
    });
    
    // Handle promise
    if (toast.promise) {
      this.handlePromise(toast);
    } else {
      // Auto dismiss
      this.scheduleDismiss(toast);
    }
    
    // Limit visible toasts
    if (this.toasts.length > this.options.maxVisible) {
      const oldest = this.toasts[0];
      this.dismiss(oldest.id);
    }
    
    return {
      id: toast.id,
      dismiss: () => this.dismiss(toast.id),
      update: (updates) => this.update(toast.id, updates)
    };
  }
  
  createToastElement(toast) {
    const div = document.createElement('div');
    div.className = `toast-notification ${toast.type}`;
    div.setAttribute('role', 'alert');
    div.setAttribute('aria-live', 'polite');
    
    // Build actions HTML
    const actionsHtml = toast.actions.map((action, index) => 
      `<button class="toast-action ${action.primary ? 'toast-action-primary' : ''}" data-action="${index}">${action.label}</button>`
    ).join('');
    
    div.innerHTML = `
      <div class="toast-icon">${toast.icon}</div>
      <div class="toast-content">
        ${toast.title ? `<h4 class="toast-title">${toast.title}</h4>` : ''}
        ${toast.message ? `<p class="toast-message">${toast.message}</p>` : ''}
        ${actionsHtml ? `<div class="toast-actions">${actionsHtml}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss">✕</button>
      <div class="toast-progress"></div>
    `;
    
    // Event listeners
    div.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast.id));
    
    div.querySelectorAll('.toast-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionIndex = parseInt(e.target.dataset.action);
        const action = toast.actions[actionIndex];
        if (action && action.onClick) {
          action.onClick();
        }
        if (action && action.dismiss !== false) {
          this.dismiss(toast.id);
        }
      });
    });
    
    // Set countdown duration
    if (toast.duration > 0 && !toast.promise) {
      div.style.setProperty('--toast-duration', `${toast.duration}ms`);
      div.classList.add('countdown');
    }
    
    return div;
  }
  
  handlePromise(toast) {
    toast.promise
      .then((result) => {
        this.update(toast.id, {
          type: 'success',
          title: result?.title || 'Success',
          message: result?.message || 'Operation completed successfully',
          icon: '✓',
          promise: null
        });
      })
      .catch((error) => {
        this.update(toast.id, {
          type: 'error',
          title: error?.title || 'Error',
          message: error?.message || 'Something went wrong',
          icon: '✕',
          promise: null
        });
      });
  }
  
  update(id, updates) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;
    
    Object.assign(toast, updates);
    
    // Update DOM
    if (updates.type) {
      toast.element.className = `toast-notification ${updates.type} show`;
    }
    
    if (updates.icon !== undefined) {
      toast.element.querySelector('.toast-icon').textContent = updates.icon;
    }
    
    if (updates.title !== undefined) {
      const titleEl = toast.element.querySelector('.toast-title');
      if (updates.title) {
        if (titleEl) {
          titleEl.textContent = updates.title;
        } else {
          const content = toast.element.querySelector('.toast-content');
          content.insertAdjacentHTML('afterbegin', `<h4 class="toast-title">${updates.title}</h4>`);
        }
      } else if (titleEl) {
        titleEl.remove();
      }
    }
    
    if (updates.message !== undefined) {
      const messageEl = toast.element.querySelector('.toast-message');
      if (updates.message) {
        if (messageEl) {
          messageEl.textContent = updates.message;
        } else {
          const content = toast.element.querySelector('.toast-content');
          content.insertAdjacentHTML('beforeend', `<p class="toast-message">${updates.message}</p>`);
        }
      } else if (messageEl) {
        messageEl.remove();
      }
    }
    
    // Schedule dismiss if promise completed
    if (updates.promise === null) {
      this.scheduleDismiss(toast);
    }
  }
  
  scheduleDismiss(toast) {
    if (toast.duration > 0) {
      toast.dismissTimer = setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }
  
  dismiss(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const toast = this.toasts[index];
    
    // Clear timer
    if (toast.dismissTimer) {
      clearTimeout(toast.dismissTimer);
    }
    
    // Animate out
    toast.element.classList.add('hiding');
    toast.element.classList.remove('show');
    
    setTimeout(() => {
      toast.element.remove();
      this.toasts.splice(index, 1);
    }, 400);
  }
  
  dismissAll() {
    [...this.toasts].forEach(toast => this.dismiss(toast.id));
  }
  
  getIconForType(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      promise: '◌'
    };
    return icons[type] || 'ℹ';
  }
  
  addToHistory(toast) {
    this.history.unshift({
      ...toast,
      element: null,
      dismissTimer: null
    });
    
    // Limit history size
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    
    this.updateToggleCount();
  }
  
  updateToggleCount() {
    const unread = this.history.length;
    this.toggleBtn.setAttribute('data-count', unread > 99 ? '99+' : unread);
    this.toggleBtn.classList.toggle('has-unread', unread > 0);
  }
  
  toggleHistory() {
    if (this.historyPanel.classList.contains('open')) {
      this.closeHistory();
    } else {
      this.openHistory();
    }
  }
  
  openHistory() {
    this.renderHistoryList();
    this.historyPanel.classList.add('open');
    this.backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  
  closeHistory() {
    this.historyPanel.classList.remove('open');
    this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  renderHistoryList() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = `
        <div class="toast-history-empty">
          <div class="toast-history-empty-icon">🔔</div>
          <p>No notifications yet</p>
        </div>
      `;
      return;
    }
    
    this.historyList.innerHTML = this.history.map(item => `
      <div class="toast-history-item" data-id="${item.id}">
        <div class="toast-history-item-icon">${item.icon}</div>
        <div class="toast-history-item-content">
          ${item.title ? `<h5 class="toast-history-item-title">${item.title}</h5>` : ''}
          ${item.message ? `<p class="toast-history-item-message">${item.message}</p>` : ''}
          <div class="toast-history-item-time">${this.formatTime(item.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }
  
  clearHistory() {
    this.history = [];
    this.updateToggleCount();
    this.renderHistoryList();
  }
  
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }
  
  // Convenience methods
  success(title, message, options = {}) {
    return this.show({ type: 'success', title, message, icon: '✓', ...options });
  }
  
  error(title, message, options = {}) {
    return this.show({ type: 'error', title, message, icon: '✕', ...options });
  }
  
  warning(title, message, options = {}) {
    return this.show({ type: 'warning', title, message, icon: '⚠', ...options });
  }
  
  info(title, message, options = {}) {
    return this.show({ type: 'info', title, message, icon: 'ℹ', ...options });
  }
  
  promise(promise, options = {}) {
    return this.show({ 
      type: 'promise', 
      title: options.loadingTitle || 'Loading...',
      message: options.loadingMessage || 'Please wait',
      icon: '◌',
      promise,
      duration: 0,
      ...options 
    });
  }
}

// Create global instance
let globalToastHub = null;

function getToastHub() {
  if (!globalToastHub) {
    globalToastHub = new ToastHub();
  }
  return globalToastHub;
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  getToastHub();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastHub, getToastHub };
}

// Browser global
if (typeof window !== 'undefined') {
  window.ToastHub = ToastHub;
  window.getToastHub = getToastHub;
  window.toast = {
    show: (options) => getToastHub().show(options),
    success: (title, message, options) => getToastHub().success(title, message, options),
    error: (title, message, options) => getToastHub().error(title, message, options),
    warning: (title, message, options) => getToastHub().warning(title, message, options),
    info: (title, message, options) => getToastHub().info(title, message, options),
    promise: (promise, options) => getToastHub().promise(promise, options)
  };
}
