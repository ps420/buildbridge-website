/**
 * v72.0: UNIFIED NOTIFICATION CENTER
 * Fortune 500 Notification Hub
 * 
 * Features:
 * - Centralized notification management
 * - Multiple notification types (info, success, warning, error)
 * - Unread count badge
 * - Filtering by type
 * - Mark as read/unread
 * - Persistent storage
 */

class UnifiedNotificationCenter {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('buildbridge-notifications') || '[]');
    this.filter = 'all';
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.attachEventListeners();
    this.render();
    this.updateBadge();
    
    // Show welcome notification on first visit
    if (!localStorage.getItem('buildbridge-notifications-initialized')) {
      this.addWelcomeNotification();
      localStorage.setItem('buildbridge-notifications-initialized', 'true');
    }
  }
  
  createUI() {
    if (document.querySelector('.notification-center')) return;
    
    // Create bell trigger
    const bell = document.createElement('button');
    bell.className = 'notification-bell';
    bell.setAttribute('aria-label', 'Open notifications');
    bell.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notification-badge hidden">0</span>
    `;
    
    // Create notification center panel
    const panel = document.createElement('div');
    panel.className = 'notification-center';
    panel.innerHTML = `
      <div class="notification-center-header">
        <div class="notification-center-title">Notifications</div>
        <div class="notification-center-actions">
          <button class="notification-center-btn" data-action="mark-all-read" title="Mark all as read">✓</button>
          <button class="notification-center-btn" data-action="clear-all" title="Clear all">🗑</button>
          <button class="notification-center-btn" data-action="close" title="Close">✕</button>
        </div>
      </div>
      <div class="notification-center-filters">
        <button class="notification-filter active" data-filter="all">All</button>
        <button class="notification-filter" data-filter="unread">Unread</button>
        <button class="notification-filter" data-filter="system">System</button>
      </div>
      <div class="notification-list"></div>
      <div class="notification-center-footer">
        <div class="notification-center-stats">
          <span class="unread-count">0</span> unread
        </div>
        <button class="notification-center-view-all">View History →</button>
      </div>
    `;
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'notification-center-backdrop';
    
    document.body.appendChild(bell);
    document.body.appendChild(panel);
    document.body.appendChild(backdrop);
    
    this.bell = bell;
    this.panel = panel;
    this.backdrop = backdrop;
    this.list = panel.querySelector('.notification-list');
    this.badge = bell.querySelector('.notification-badge');
  }
  
  attachEventListeners() {
    // Bell click
    this.bell.addEventListener('click', () => {
      this.toggle();
    });
    
    // Close button
    this.panel.querySelector('[data-action="close"]').addEventListener('click', () => {
      this.close();
    });
    
    // Mark all as read
    this.panel.querySelector('[data-action="mark-all-read"]').addEventListener('click', () => {
      this.markAllAsRead();
    });
    
    // Clear all
    this.panel.querySelector('[data-action="clear-all"]').addEventListener('click', () => {
      this.clearAll();
    });
    
    // Filters
    this.panel.querySelectorAll('.notification-filter').forEach(filter => {
      filter.addEventListener('click', () => {
        this.setFilter(filter.dataset.filter);
      });
    });
    
    // Backdrop click
    this.backdrop.addEventListener('click', () => {
      this.close();
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.panel.classList.add('active');
    this.backdrop.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.panel.classList.remove('active');
    this.backdrop.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }
  
  add(notification) {
    const newNotification = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      timestamp: Date.now(),
      read: false,
      icon: notification.icon || this.getIconForType(notification.type)
    };
    
    this.notifications.unshift(newNotification);
    this.save();
    this.render();
    this.updateBadge();
    
    // Show toast if configured
    if (notification.showToast !== false) {
      this.showToast(newNotification);
    }
    
    return newNotification.id;
  }
  
  getIconForType(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬',
      update: '🔄',
      project: '🏗️',
      contract: '📋'
    };
    return icons[type] || '🔔';
  }
  
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.save();
      this.render();
      this.updateBadge();
    }
  }
  
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.save();
    this.render();
    this.updateBadge();
  }
  
  clearAll() {
    if (confirm('Clear all notifications?')) {
      this.notifications = [];
      this.save();
      this.render();
      this.updateBadge();
    }
  }
  
  setFilter(filter) {
    this.filter = filter;
    this.panel.querySelectorAll('.notification-filter').forEach(f => {
      f.classList.toggle('active', f.dataset.filter === filter);
    });
    this.render();
  }
  
  render() {
    let filtered = this.notifications;
    
    if (this.filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    if (filtered.length === 0) {
      this.list.innerHTML = `
        <div class="notification-empty">
          <div class="notification-empty-icon">🔔</div>
          <div class="notification-empty-text">No notifications</div>
          <div class="notification-empty-subtext">You're all caught up!</div>
        </div>
      `;
    } else {
      this.list.innerHTML = filtered.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notification-icon ${n.type}">${n.icon}</div>
          <div class="notification-content">
            <div class="notification-title">${n.title}</div>
            <div class="notification-message">${n.message}</div>
            <div class="notification-meta">
              <span class="notification-time">${this.formatTime(n.timestamp)}</span>
              ${n.read ? '' : '<span class="notification-unread-dot"></span>'}
            </div>
          </div>
        </div>
      `).join('');
      
      // Attach click handlers
      this.list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
          this.markAsRead(item.dataset.id);
        });
      });
    }
    
    // Update stats
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.panel.querySelector('.unread-count').textContent = unreadCount;
    
    // Update title
    const title = this.panel.querySelector('.notification-center-title');
    title.classList.toggle('no-unread', unreadCount === 0);
  }
  
  updateBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    this.badge.classList.toggle('hidden', unreadCount === 0);
  }
  
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }
  
  showToast(notification) {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(notification.message, notification.type);
    }
  }
  
  save() {
    // Keep only last 50 notifications
    this.notifications = this.notifications.slice(0, 50);
    localStorage.setItem('buildbridge-notifications', JSON.stringify(this.notifications));
  }
  
  addWelcomeNotification() {
    this.add({
      title: 'Welcome to BuildBridge',
      message: 'Thanks for visiting! Explore our services and get in touch for your next project.',
      type: 'info',
      icon: '🏗️',
      showToast: false
    });
  }
  
  // Public API
  info(title, message) {
    return this.add({ title, message, type: 'info' });
  }
  
  success(title, message) {
    return this.add({ title, message, type: 'success' });
  }
  
  warning(title, message) {
    return this.add({ title, message, type: 'warning' });
  }
  
  error(title, message) {
    return this.add({ title, message, type: 'error' });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notificationCenter = new UnifiedNotificationCenter();
  });
} else {
  window.notificationCenter = new UnifiedNotificationCenter();
}
