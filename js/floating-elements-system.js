/**
 * v50.0: Floating Elements System
 * Dynamic floating UI components manager
 */

/**
 * Floating Notification System
 * Stack-based notification manager
 */
class FloatingNotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.maxNotifications = 5;
    this.init();
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'floating-notification-stack';
    document.body.appendChild(this.container);
  }

  show(options = {}) {
    const {
      type = 'info',
      title = 'Notification',
      message = '',
      duration = 5000,
      icon = this.getIconForType(type)
    } = options;

    // Remove oldest if at max
    if (this.notifications.length >= this.maxNotifications) {
      this.remove(this.notifications[0]);
    }

    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        ${message ? `<div class="notification-message">${message}</div>` : ''}
      </div>
      <button class="notification-close" aria-label="Close">✕</button>
    `;

    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.remove(notification);
    });

    // Auto close
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    this.container.appendChild(notification);
    this.notifications.push(notification);

    return notification;
  }

  remove(notification) {
    if (!notification || notification.classList.contains('closing')) return;
    
    notification.classList.add('closing');
    
    setTimeout(() => {
      notification.remove();
      this.notifications = this.notifications.filter(n => n !== notification);
    }, 300);
  }

  getIconForType(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };
    return icons[type] || icons.info;
  }

  success(message, title = 'Success') {
    return this.show({ type: 'success', title, message });
  }

  error(message, title = 'Error') {
    return this.show({ type: 'error', title, message });
  }

  info(message, title = 'Info') {
    return this.show({ type: 'info', title, message });
  }

  warning(message, title = 'Warning') {
    return this.show({ type: 'warning', title, message });
  }
}

/**
 * Floating Tooltip System
 * Dynamic tooltip positioning
 */
class FloatingTooltipSystem {
  constructor() {
    this.tooltip = null;
    this.currentTarget = null;
    this.hideTimeout = null;
    this.init();
  }

  init() {
    this.createTooltip();
    this.bindEvents();
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'floating-tooltip-advanced';
    document.body.appendChild(this.tooltip);
  }

  bindEvents() {
    // Use event delegation for dynamic content
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        this.show(target);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        this.scheduleHide();
      }
    });

    // Keep visible when hovering tooltip
    this.tooltip.addEventListener('mouseenter', () => {
      clearTimeout(this.hideTimeout);
    });

    this.tooltip.addEventListener('mouseleave', () => {
      this.hide();
    });
  }

  show(target) {
    clearTimeout(this.hideTimeout);
    this.currentTarget = target;

    const title = target.dataset.tooltipTitle || '';
    const content = target.dataset.tooltip || '';
    const position = target.dataset.tooltipPosition || 'top';

    this.tooltip.innerHTML = `
      ${title ? `<div class="tooltip-title">${title}</div>` : ''}
      <div class="tooltip-desc">${content}</div>
    `;

    this.position(target, position);
    this.tooltip.className = `floating-tooltip-advanced tooltip-${position} visible`;
  }

  position(target, position) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let top, left;

    switch (position) {
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
      case 'top':
      default:
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
    }

    // Keep within viewport
    const padding = 10;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    top = Math.max(padding, top);

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  scheduleHide() {
    this.hideTimeout = setTimeout(() => this.hide(), 100);
  }

  hide() {
    this.tooltip.classList.remove('visible');
    this.currentTarget = null;
  }
}

/**
 * Floating Badge System
 * Temporary floating badges
 */
class FloatingBadgeSystem {
  constructor() {
    this.badges = [];
  }

  show(message, options = {}) {
    const {
      position = 'top-right',
      duration = 3000,
      parent = document.body
    } = options;

    const badge = document.createElement('div');
    badge.className = 'floating-badge';
    badge.textContent = message;

    // Position
    const positions = {
      'top-left': { top: '100px', left: '24px' },
      'top-right': { top: '100px', right: '24px' },
      'bottom-left': { bottom: '100px', left: '24px' },
      'bottom-right': { bottom: '100px', right: '24px' }
    };

    Object.assign(badge.style, positions[position] || positions['top-right']);
    parent.appendChild(badge);

    // Auto close
    if (duration > 0) {
      setTimeout(() => this.close(badge), duration);
    }

    this.badges.push(badge);
    return badge;
  }

  close(badge) {
    if (!badge || badge.classList.contains('closing')) return;
    
    badge.classList.add('closing');
    setTimeout(() => {
      badge.remove();
      this.badges = this.badges.filter(b => b !== badge);
    }, 300);
  }
}

/**
 * Floating Progress System
 * Scroll or task progress indicator
 */
class FloatingProgressSystem {
  constructor() {
    this.element = null;
    this.label = null;
    this.fill = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createElement();
    this.bindScroll();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'floating-progress';
    this.element.innerHTML = `
      <div class="progress-label">
        <span>Reading Progress</span>
        <span class="progress-percent">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
    `;
    
    this.label = this.element.querySelector('.progress-percent');
    this.fill = this.element.querySelector('.progress-fill');
    
    document.body.appendChild(this.element);
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      this.update();
    }, { passive: true });
  }

  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    
    this.label.textContent = `${Math.round(progress)}%`;
    this.fill.style.width = `${progress}%`;

    // Show/hide based on scroll
    if (progress > 5 && progress < 95) {
      if (!this.isVisible) {
        this.element.style.opacity = '1';
        this.isVisible = true;
      }
    } else {
      if (this.isVisible) {
        this.element.style.opacity = '0';
        this.isVisible = false;
      }
    }
  }

  hide() {
    this.element.style.display = 'none';
  }

  show() {
    this.element.style.display = 'block';
  }
}

/**
 * Floating Dock System
 * macOS-style floating dock
 */
class FloatingDockSystem {
  constructor(element) {
    this.element = element;
    this.items = element.querySelectorAll('.dock-item');
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.init();
  }

  init() {
    if (this.isTouch) return;
    
    this.bindHoverEffects();
    this.bindClickHandlers();
  }

  bindHoverEffects() {
    this.element.addEventListener('mousemove', (e) => {
      this.items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(e.clientX - (rect.left + rect.width / 2));
        const maxDistance = 150;
        
        if (distance < maxDistance) {
          const scale = 1 + (1 - distance / maxDistance) * 0.4;
          item.style.transform = `scale(${scale})`;
        } else {
          item.style.transform = 'scale(1)';
        }
      });
    });

    this.element.addEventListener('mouseleave', () => {
      this.items.forEach(item => {
        item.style.transform = 'scale(1)';
      });
    });
  }

  bindClickHandlers() {
    this.items.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.target;
        if (target) {
          const element = document.querySelector(target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        
        // Update active state
        this.items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }
}

// Initialize systems when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global notification system
  window.notifications = new FloatingNotificationSystem();
  
  // Create tooltip system
  window.tooltips = new FloatingTooltipSystem();
  
  // Create badge system
  window.badges = new FloatingBadgeSystem();
  
  // Create progress system
  window.progress = new FloatingProgressSystem();
  
  // Initialize docks
  document.querySelectorAll('.floating-dock').forEach(dock => {
    new FloatingDockSystem(dock);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FloatingNotificationSystem,
    FloatingTooltipSystem,
    FloatingBadgeSystem,
    FloatingProgressSystem,
    FloatingDockSystem
  };
}
