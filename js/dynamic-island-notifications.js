/**
 * BuildBridge Dynamic Island Notifications
 * iOS-Style Floating Alert System v90.0
 */

class DynamicIsland {
  constructor(options = {}) {
    this.options = {
      defaultDuration: 4000,
      maxNotifications: 3,
      position: 'top',
      ...options
    };
    
    this.notifications = [];
    this.container = null;
    
    this.init();
  }
  
  init() {
    this.createContainer();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'dynamic-island-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  }
  
  /**
   * Show a compact notification
   */
  show(options) {
    const {
      title,
      message,
      type = 'info',
      icon,
      duration = this.options.defaultDuration,
      actions = [],
      expandable = false,
      onExpand,
      onDismiss
    } = options;
    
    const island = document.createElement('div');
    island.className = 'dynamic-island compact';
    island.setAttribute('role', 'alert');
    
    // Icon based on type
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    island.innerHTML = `
      <div class="dynamic-island-icon ${type}">
        ${icon || iconMap[type] || '•'}
      </div>
      <div class="dynamic-island-content">
        <div class="dynamic-island-title">${this.escapeHtml(title)}</div>
        ${message ? `<div class="dynamic-island-message">${this.escapeHtml(message)}</div>` : ''}
      </div>
      ${actions.length ? `
        <div class="dynamic-island-actions">
          ${actions.map(action => `
            <button class="dynamic-island-action ${action.primary ? 'primary' : ''}" data-action="${action.id}">
              ${this.escapeHtml(action.label)}
            </button>
          `).join('')}
        </div>
      ` : ''}
      <button class="dynamic-island-close" aria-label="Dismiss notification">✕</button>
      <div class="dynamic-island-progress">
        <div class="dynamic-island-progress-bar"></div>
      </div>
    `;
    
    this.container.appendChild(island);
    
    // Trigger reflow for animation
    requestAnimationFrame(() => {
      island.classList.add('visible');
    });
    
    // Progress bar animation
    const progressBar = island.querySelector('.dynamic-island-progress-bar');
    if (progressBar && duration > 0) {
      progressBar.style.transition = `transform ${duration}ms linear`;
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    }
    
    // Action handlers
    const actionButtons = island.querySelectorAll('.dynamic-island-action');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.action;
        const action = actions.find(a => a.id === actionId);
        if (action && action.handler) {
          action.handler();
        }
        this.dismiss(island);
      });
    });
    
    // Expand on click (if expandable)
    if (expandable) {
      island.style.cursor = 'pointer';
      island.addEventListener('click', (e) => {
        if (e.target.closest('.dynamic-island-action') || e.target.closest('.dynamic-island-close')) return;
        this.expand(island, options);
        if (onExpand) onExpand();
      });
    }
    
    // Close button
    const closeBtn = island.querySelector('.dynamic-island-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismiss(island);
    });
    
    // Auto dismiss
    let dismissTimeout;
    if (duration > 0) {
      dismissTimeout = setTimeout(() => {
        this.dismiss(island);
      }, duration);
    }
    
    // Pause on hover
    island.addEventListener('mouseenter', () => {
      if (dismissTimeout) clearTimeout(dismissTimeout);
      if (progressBar) progressBar.style.transition = 'none';
    });
    
    island.addEventListener('mouseleave', () => {
      if (duration > 0) {
        dismissTimeout = setTimeout(() => {
          this.dismiss(island);
        }, duration / 2);
        if (progressBar) {
          progressBar.style.transition = `transform ${duration / 2}ms linear`;
          progressBar.style.transform = 'scaleX(0)';
        }
      }
    });
    
    // Store notification reference
    const notification = {
      element: island,
      timeout: dismissTimeout,
      onDismiss
    };
    
    this.notifications.push(notification);
    
    // Limit max notifications
    if (this.notifications.length > this.options.maxNotifications) {
      this.dismiss(this.notifications[0].element);
    }
    
    return notification;
  }
  
  /**
   * Expand a notification to show full content
   */
  expand(island, options) {
    island.classList.remove('compact');
    island.classList.add('expanded');
    
    // Update content if needed
    if (options.expandedContent) {
      const content = island.querySelector('.dynamic-island-content');
      content.innerHTML = options.expandedContent;
    }
  }
  
  /**
   * Collapse an expanded notification
   */
  collapse(island, options) {
    island.classList.remove('expanded');
    island.classList.add('compact');
  }
  
  /**
   * Dismiss a notification
   */
  dismiss(island) {
    const index = this.notifications.findIndex(n => n.element === island);
    if (index === -1) return;
    
    const notification = this.notifications[index];
    
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }
    
    island.classList.remove('visible');
    island.style.transform = 'translateY(-20px) scale(0.9)';
    island.style.opacity = '0';
    
    setTimeout(() => {
      island.remove();
      this.notifications.splice(index, 1);
      
      if (notification.onDismiss) {
        notification.onDismiss();
      }
    }, 400);
  }
  
  /**
   * Show a media player notification
   */
  showMedia(options) {
    const {
      title,
      artist,
      cover,
      isPlaying = false,
      duration = 0,
      currentTime = 0
    } = options;
    
    const island = document.createElement('div');
    island.className = 'dynamic-island media';
    
    island.innerHTML = `
      <div class="dynamic-island-media-cover">
        ${cover ? `<img src="${cover}" alt="${title}">` : '🎵'}
      </div>
      <div class="dynamic-island-media-info">
        <div class="dynamic-island-media-title">${this.escapeHtml(title)}</div>
        <div class="dynamic-island-media-artist">${this.escapeHtml(artist)}</div>
      </div>
      <div class="dynamic-island-media-controls">
        <button class="dynamic-island-media-btn" aria-label="Previous">⏮</button>
        <button class="dynamic-island-media-btn play" aria-label="${isPlaying ? 'Pause' : 'Play'}">
          ${isPlaying ? '⏸' : '▶'}
        </button>
        <button class="dynamic-island-media-btn" aria-label="Next">⏭</button>
      </div>
    `;
    
    this.container.appendChild(island);
    
    requestAnimationFrame(() => {
      island.classList.add('visible');
    });
    
    return island;
  }
  
  /**
   * Show an incoming call notification
   */
  showCall(options) {
    const {
      name,
      avatar,
      status = 'incoming',
      onAccept,
      onDecline
    } = options;
    
    const island = document.createElement('div');
    island.className = 'dynamic-island call';
    
    island.innerHTML = `
      <div class="dynamic-island-call-avatar">
        ${avatar ? `<img src="${avatar}" alt="${name}">` : '👤'}
      </div>
      <div class="dynamic-island-call-info">
        <div class="dynamic-island-call-name">${this.escapeHtml(name)}</div>
        <div class="dynamic-island-call-status">${status === 'incoming' ? 'Incoming Call...' : 'Calling...'}</div>
      </div>
      <div class="dynamic-island-call-actions">
        <button class="dynamic-island-call-btn decline" aria-label="Decline">📞</button>
        <button class="dynamic-island-call-btn accept" aria-label="Accept">📞</button>
      </div>
    `;
    
    this.container.appendChild(island);
    
    requestAnimationFrame(() => {
      island.classList.add('visible');
    });
    
    // Button handlers
    island.querySelector('.decline').addEventListener('click', () => {
      this.dismiss(island);
      if (onDecline) onDecline();
    });
    
    island.querySelector('.accept').addEventListener('click', () => {
      this.dismiss(island);
      if (onAccept) onAccept();
    });
    
    return island;
  }
  
  /**
   * Show a biometric/Face ID notification
   */
  showBiometric(status = 'scanning') {
    const statusText = {
      scanning: 'Face ID',
      success: 'Unlocked',
      failed: 'Try Again'
    };
    
    const island = document.createElement('div');
    island.className = 'dynamic-island biometric';
    
    island.innerHTML = `
      <div class="dynamic-island-biometric-lock">🔒</div>
      <div class="dynamic-island-biometric-text">${statusText[status]}</div>
    `;
    
    this.container.appendChild(island);
    
    requestAnimationFrame(() => {
      island.classList.add('visible');
    });
    
    // Auto dismiss for success/failed
    if (status !== 'scanning') {
      setTimeout(() => this.dismiss(island), 1500);
    }
    
    return island;
  }
  
  /**
   * Show a live activity notification
   */
  showLiveActivity(options) {
    const { title, stats = [] } = options;
    
    const island = document.createElement('div');
    island.className = 'dynamic-island live';
    
    island.innerHTML = `
      <div class="dynamic-island-live-header">
        <div class="dynamic-island-live-indicator"></div>
        <div class="dynamic-island-live-title">${this.escapeHtml(title)}</div>
      </div>
      <div class="dynamic-island-live-content">
        ${stats.map(stat => `
          <div class="dynamic-island-live-stat">
            <div class="dynamic-island-live-value">${stat.value}</div>
            <div class="dynamic-island-live-label">${this.escapeHtml(stat.label)}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.container.appendChild(island);
    
    requestAnimationFrame(() => {
      island.classList.add('visible');
    });
    
    return island;
  }
  
  /**
   * Update an existing notification
   */
  update(island, updates) {
    if (updates.title) {
      const titleEl = island.querySelector('.dynamic-island-title');
      if (titleEl) titleEl.textContent = updates.title;
    }
    
    if (updates.message) {
      const msgEl = island.querySelector('.dynamic-island-message');
      if (msgEl) msgEl.textContent = updates.message;
    }
    
    if (updates.progress !== undefined) {
      const progressBar = island.querySelector('.dynamic-island-progress-bar');
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.transform = `scaleX(${1 - updates.progress})`;
      }
    }
  }
  
  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.forEach(n => {
      if (n.timeout) clearTimeout(n.timeout);
      n.element.remove();
    });
    this.notifications = [];
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Convenience methods for common notification types
const DynamicIslandAPI = {
  instance: null,
  
  init() {
    if (!this.instance) {
      this.instance = new DynamicIsland();
    }
    return this.instance;
  },
  
  success(title, message, options = {}) {
    return this.init().show({
      title,
      message,
      type: 'success',
      ...options
    });
  },
  
  error(title, message, options = {}) {
    return this.init().show({
      title,
      message,
      type: 'error',
      duration: 6000,
      ...options
    });
  },
  
  warning(title, message, options = {}) {
    return this.init().show({
      title,
      message,
      type: 'warning',
      ...options
    });
  },
  
  info(title, message, options = {}) {
    return this.init().show({
      title,
      message,
      type: 'info',
      ...options
    });
  },
  
  media(options) {
    return this.init().showMedia(options);
  },
  
  call(options) {
    return this.init().showCall(options);
  },
  
  biometric(status) {
    return this.init().showBiometric(status);
  },
  
  liveActivity(options) {
    return this.init().showLiveActivity(options);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.DynamicIsland = DynamicIslandAPI;
  DynamicIslandAPI.init();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DynamicIsland, DynamicIslandAPI };
}
