/**
 * BuildBridge Dynamic Island Notifications
 * iOS 17 Style Notification System - v79.0
 * Fortune 500 Quality Alert System
 */

(function() {
  'use strict';
  
  class DynamicIslandSystem {
    constructor() {
      this.container = null;
      this.notifications = [];
      this.maxStacked = 3;
      this.defaultDuration = 5000;
      this.init();
    }
    
    init() {
      this.createContainer();
      this.bindEvents();
      
      // Expose global API
      window.DynamicIsland = this;
      
      console.log('🏝️ Dynamic Island Notifications initialized');
    }
    
    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'dynamic-island-container';
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(this.container);
    }
    
    bindEvents() {
      // Handle keyboard dismissal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.dismissAll();
        }
      });
      
      // Pause on hover
      this.container.addEventListener('mouseenter', () => {
        this.pauseAll();
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.resumeAll();
      });
    }
    
    show(options = {}) {
      const config = {
        type: 'info',
        title: 'Notification',
        message: '',
        duration: this.defaultDuration,
        expandable: false,
        details: '',
        actions: [],
        priority: 'normal', // normal, urgent, priority
        showProgress: true,
        onDismiss: null,
        onAction: null,
        ...options
      };
      
      const island = this.createIsland(config);
      this.container.appendChild(island);
      
      // Trigger animation
      requestAnimationFrame(() => {
        island.classList.add('active');
        this.updateStackPositions();
      });
      
      // Auto dismiss
      let dismissTimer;
      if (config.duration > 0) {
        dismissTimer = setTimeout(() => {
          this.dismiss(island);
        }, config.duration);
        
        island._dismissTimer = dismissTimer;
      }
      
      // Store reference
      const notification = {
        element: island,
        config,
        createdAt: Date.now(),
        dismissTimer
      };
      
      this.notifications.push(notification);
      
      // Limit stacked notifications
      if (this.notifications.length > this.maxStacked) {
        const oldest = this.notifications[0];
        this.dismiss(oldest.element);
      }
      
      return {
        dismiss: () => this.dismiss(island),
        update: (newOptions) => this.update(island, newOptions),
        expand: () => this.expand(island),
        collapse: () => this.collapse(island)
      };
    }
    
    createIsland(config) {
      const island = document.createElement('div');
      island.className = `dynamic-island ${config.priority}`;
      island.setAttribute('role', 'alert');
      island.setAttribute('aria-live', config.priority === 'urgent' ? 'assertive' : 'polite');
      
      // Icon based on type
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        message: '💬'
      };
      
      island.innerHTML = `
        <div class="dynamic-island-icon ${config.type}">
          ${icons[config.type] || icons.info}
        </div>
        <div class="dynamic-island-content">
          <h4 class="dynamic-island-title">${this.escapeHtml(config.title)}</h4>
          <p class="dynamic-island-message">${this.escapeHtml(config.message)}</p>
        </div>
        ${config.actions.length > 0 ? `
          <div class="dynamic-island-actions">
            ${config.actions.map((action, i) => `
              <button class="dynamic-island-action ${action.primary ? 'primary' : ''}" 
                      data-action="${i}" aria-label="${action.label}">
                ${action.icon || action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
        <button class="dynamic-island-close" aria-label="Dismiss notification">✕</button>
        ${config.showProgress && config.duration > 0 ? `
          <div class="dynamic-island-progress">
            <div class="dynamic-island-progress-bar" style="--duration: ${config.duration}ms"></div>
          </div>
        ` : ''}
        ${config.expandable && config.details ? `
          <div class="dynamic-island-details">
            <p class="dynamic-island-details-text">${this.escapeHtml(config.details)}</p>
            <div class="dynamic-island-details-actions">
              ${config.actions.map(action => `
                <button class="dynamic-island-btn ${action.primary ? 'primary' : 'secondary'}" data-action-full>
                  ${action.label}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;
      
      // Bind events
      const closeBtn = island.querySelector('.dynamic-island-close');
      closeBtn.addEventListener('click', () => this.dismiss(island));
      
      // Action buttons
      island.querySelectorAll('.dynamic-island-action, [data-action-full]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const actionIndex = btn.dataset.action;
          if (actionIndex !== undefined && config.actions[actionIndex]) {
            const action = config.actions[actionIndex];
            if (action.onClick) action.onClick();
            if (action.dismiss !== false) this.dismiss(island);
          }
          if (config.onAction) config.onAction(btn);
        });
      });
      
      // Expand on click
      if (config.expandable) {
        island.addEventListener('click', (e) => {
          if (!e.target.closest('.dynamic-island-action') && 
              !e.target.closest('.dynamic-island-close')) {
            this.toggleExpand(island);
          }
        });
      }
      
      return island;
    }
    
    dismiss(island) {
      if (!island || island._dismissing) return;
      island._dismissing = true;
      
      // Clear timer
      if (island._dismissTimer) {
        clearTimeout(island._dismissTimer);
      }
      
      // Remove from array
      this.notifications = this.notifications.filter(n => n.element !== island);
      
      // Animate out
      island.classList.remove('active');
      island.style.opacity = '0';
      island.style.transform = 'scale(0.8) translateY(-20px)';
      
      setTimeout(() => {
        island.remove();
        this.updateStackPositions();
        
        // Call callback
        const notification = this.notifications.find(n => n.element === island);
        if (notification?.config?.onDismiss) {
          notification.config.onDismiss();
        }
      }, 300);
    }
    
    dismissAll() {
      [...this.notifications].forEach(n => this.dismiss(n.element));
    }
    
    update(island, newOptions) {
      const notification = this.notifications.find(n => n.element === island);
      if (!notification) return;
      
      notification.config = { ...notification.config, ...newOptions };
      
      // Update content
      if (newOptions.title) {
        island.querySelector('.dynamic-island-title').textContent = newOptions.title;
      }
      if (newOptions.message) {
        island.querySelector('.dynamic-island-message').textContent = newOptions.message;
      }
    }
    
    expand(island) {
      island.classList.add('expanded');
    }
    
    collapse(island) {
      island.classList.remove('expanded');
    }
    
    toggleExpand(island) {
      island.classList.toggle('expanded');
    }
    
    updateStackPositions() {
      this.notifications.slice(0, this.maxStacked).forEach((notification, index) => {
        const island = notification.element;
        island.classList.remove('stacked-1', 'stacked-2', 'stacked-3');
        
        if (index > 0) {
          island.classList.add(`stacked-${index}`);
        }
      });
    }
    
    pauseAll() {
      this.notifications.forEach(n => {
        if (n.element._dismissTimer) {
          clearTimeout(n.element._dismissTimer);
          n.element._dismissTimer = null;
        }
        const progressBar = n.element.querySelector('.dynamic-island-progress-bar');
        if (progressBar) {
          progressBar.style.animationPlayState = 'paused';
        }
      });
    }
    
    resumeAll() {
      this.notifications.forEach(n => {
        const remaining = n.config.duration - (Date.now() - n.createdAt);
        if (remaining > 0 && !n.element._dismissTimer) {
          n.element._dismissTimer = setTimeout(() => {
            this.dismiss(n.element);
          }, remaining);
        }
        const progressBar = n.element.querySelector('.dynamic-island-progress-bar');
        if (progressBar) {
          progressBar.style.animationPlayState = 'running';
        }
      });
    }
    
    // Convenience methods
    success(title, message, options = {}) {
      return this.show({ type: 'success', title, message, ...options });
    }
    
    error(title, message, options = {}) {
      return this.show({ type: 'error', title, message, priority: 'urgent', duration: 8000, ...options });
    }
    
    warning(title, message, options = {}) {
      return this.show({ type: 'warning', title, message, priority: 'priority', ...options });
    }
    
    info(title, message, options = {}) {
      return this.show({ type: 'info', title, message, ...options });
    }
    
    message(title, message, options = {}) {
      return this.show({ type: 'message', title, message, ...options });
    }
    
    liveActivity(title, status, visual, options = {}) {
      const island = document.createElement('div');
      island.className = 'dynamic-island live-activity active';
      island.innerHTML = `
        <div class="dynamic-island-icon info">${visual}</div>
        <div class="dynamic-island-content">
          <div class="live-activity-visual">${visual}</div>
          <div class="live-activity-info">
            <h4 class="dynamic-island-title">${this.escapeHtml(title)}</h4>
            <span class="live-activity-status">${this.escapeHtml(status)}</span>
          </div>
        </div>
        <button class="dynamic-island-close" aria-label="Dismiss">✕</button>
      `;
      
      this.container.appendChild(island);
      
      return {
        dismiss: () => this.dismiss(island),
        update: (newTitle, newStatus) => {
          island.querySelector('.dynamic-island-title').textContent = newTitle;
          island.querySelector('.live-activity-status').textContent = newStatus;
        }
      };
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DynamicIslandSystem());
  } else {
    new DynamicIslandSystem();
  }
  
  // Demo notifications on load (optional)
  setTimeout(() => {
    if (window.DynamicIsland && !window.location.hash.includes('no-demo')) {
      window.DynamicIsland.success(
        'Welcome to BuildBridge',
        'Your construction journey starts here',
        { duration: 4000 }
      );
    }
  }, 2000);
  
})();
