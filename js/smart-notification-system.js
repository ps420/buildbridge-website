/**
 * Smart Notification System - v22.0 Professional Enhancement
 * Advanced notification system with bell, dropdown, and toast integration
 */

class SmartNotificationSystem {
  constructor(options = {}) {
    this.options = {
      maxNotifications: 10,
      bellSelector: '.notification-bell',
      dropdownSelector: '.notification-dropdown',
      ...options
    };
    
    this.notifications = [];
    this.unreadCount = 0;
    this.isOpen = false;
    
    this.bell = document.querySelector(this.options.bellSelector);
    this.dropdown = document.querySelector(this.options.dropdownSelector);
    
    if (!this.bell) {
      this.createBell();
    }
    
    this.init();
  }
  
  createBell() {
    // Create notification bell element
    this.bell = document.createElement('button');
    this.bell.className = 'notification-bell';
    this.bell.setAttribute('aria-label', 'Notifications');
    this.bell.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notification-badge" aria-label="Unread notifications">0</span>
      <span class="notification-pulse"></span>
    `;
    
    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'notification-dropdown';
    this.dropdown.innerHTML = `
      <div class="notification-header">
        <h3>Notifications</h3>
        <button class="notification-mark-all">Mark all as read</button>
      </div>
      <div class="notification-list"></div>
      <div class="notification-footer">
        <a href="#all-notifications">View all notifications</a>
      </div>
    `;
    
    // Insert into header
    const nav = document.querySelector('.nav') || document.querySelector('header');
    if (nav) {
      nav.appendChild(this.bell);
      nav.appendChild(this.dropdown);
    }
  }
  
  init() {
    // Load saved notifications from localStorage
    this.loadNotifications();
    
    // Bind events
    this.bell.addEventListener('click', this.toggleDropdown.bind(this));
    
    // Mark all as read
    const markAllBtn = this.dropdown?.querySelector('.notification-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', this.markAllAsRead.bind(this));
    }
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.bell.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDropdown();
    });
    
    // Initialize with welcome notification
    if (this.notifications.length === 0) {
      this.addNotification({
        id: 'welcome',
        title: 'Welcome to BuildBridge',
        message: 'Explore our services and start your project today.',
        type: 'info',
        timestamp: Date.now(),
        read: false
      });
    }
    
    this.updateUI();
  }
  
  addNotification(notification) {
    const notif = {
      id: notification.id || Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      timestamp: notification.timestamp || Date.now(),
      read: notification.read || false,
      icon: this.getIconForType(notification.type),
      action: notification.action || null
    };
    
    // Add to beginning
    this.notifications.unshift(notif);
    
    // Limit max notifications
    if (this.notifications.length > this.options.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.options.maxNotifications);
    }
    
    // Update unread count
    if (!notif.read) {
      this.unreadCount++;
    }
    
    // Save and update UI
    this.saveNotifications();
    this.updateUI();
    
    // Show toast for new notification
    if (window.Toast && !notif.read) {
      setTimeout(() => {
        Toast.info(notif.message, {
          title: notif.title,
          duration: 5000,
          action: notif.action ? {
            text: notif.action.text,
            onClick: notif.action.onClick
          } : null
        });
      }, 1000);
    }
    
    return notif.id;
  }
  
  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      const notif = this.notifications[index];
      if (!notif.read) {
        this.unreadCount--;
      }
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.updateUI();
    }
  }
  
  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotifications();
      this.updateUI();
    }
  }
  
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveNotifications();
    this.updateUI();
  }
  
  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.dropdown.classList.toggle('active', this.isOpen);
    this.bell.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.renderNotifications();
    }
  }
  
  closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.remove('active');
    this.bell.classList.remove('active');
  }
  
  updateUI() {
    // Update badge
    const badge = this.bell.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
      
      // Animate badge update
      if (this.unreadCount > 0) {
        badge.classList.add('badge-update');
        setTimeout(() => badge.classList.remove('badge-update'), 300);
      }
    }
    
    // Show pulse for unread
    const pulse = this.bell.querySelector('.notification-pulse');
    if (pulse) {
      pulse.style.display = this.unreadCount > 0 ? 'block' : 'none';
    }
    
    // Render if dropdown is open
    if (this.isOpen) {
      this.renderNotifications();
    }
  }
  
  renderNotifications() {
    const list = this.dropdown.querySelector('.notification-list');
    if (!list) return;
    
    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p>No notifications yet</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = this.notifications.map(notif => `
      <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
        <div class="notification-icon ${notif.type}">
          ${notif.icon}
        </div>
        <div class="notification-content">
          <h4>${notif.title}</h4>
          <p>${notif.message}</p>
          <span class="notification-time">${this.formatTime(notif.timestamp)}</span>
        </div>
        <button class="notification-dismiss" aria-label="Dismiss notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    // Bind item events
    list.querySelectorAll('.notification-item').forEach(item => {
      const id = item.dataset.id;
      
      // Mark as read on click
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-dismiss')) {
          this.markAsRead(id);
        }
      });
      
      // Dismiss button
      const dismissBtn = item.querySelector('.notification-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.style.animation = 'notification-dismiss 0.3s ease forwards';
          setTimeout(() => this.removeNotification(id), 300);
        });
      }
    });
  }
  
  getIconForType(type) {
    const icons = {
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    };
    return icons[type] || icons.info;
  }
  
  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
  
  saveNotifications() {
    try {
      localStorage.setItem('buildbridge_notifications', JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Could not save notifications:', e);
    }
  }
  
  loadNotifications() {
    try {
      const saved = localStorage.getItem('buildbridge_notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }
    } catch (e) {
      console.warn('Could not load notifications:', e);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.notificationSystem = new SmartNotificationSystem();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartNotificationSystem;
}
