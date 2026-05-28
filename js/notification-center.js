/**
 * NOTIFICATION CENTER - v41 Fortune 500
 * Professional notification management system
 */

class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.activeFilter = 'all';
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.loadFromStorage();
    this.createUI();
    this.bindEvents();
    this.startRealtimeSimulation();
    
    // Welcome notification
    setTimeout(() => {
      this.showToast({
        type: 'info',
        title: 'Welcome to BuildBridge',
        message: 'You have access to the new notification center. Stay updated!',
        duration: 5000
      });
    }, 2000);
  }
  
  createUI() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'notification-toggle';
    toggle.setAttribute('aria-label', 'Open notifications');
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span class="notification-badge hidden">0</span>
    `;
    document.body.appendChild(toggle);
    this.toggle = toggle;
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'notification-backdrop';
    document.body.appendChild(backdrop);
    this.backdrop = backdrop;
    
    // Create notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-center';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notification center');
    panel.innerHTML = this.getPanelHTML();
    document.body.appendChild(panel);
    this.panel = panel;
    
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'notification-toast-container';
    document.body.appendChild(toastContainer);
    this.toastContainer = toastContainer;
    
    // Cache elements
    this.listElement = panel.querySelector('.notification-list');
    this.badgeElement = toggle.querySelector('.notification-badge');
    this.filterButtons = panel.querySelectorAll('.notification-filter');
    
    this.renderNotifications();
  }
  
  getPanelHTML() {
    return `
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-header-actions">
          <button class="notification-header-btn" data-action="settings" title="Settings">⚙️</button>
          <button class="notification-header-btn" data-action="mark-all-read" title="Mark all as read">✓</button>
          <button class="notification-close" data-action="close" aria-label="Close">✕</button>
        </div>
      </div>
      
      <div class="notification-filters">
        <button class="notification-filter active" data-filter="all">All<span class="count">0</span></button>
        <button class="notification-filter" data-filter="unread">Unread<span class="count">0</span></button>
        <button class="notification-filter" data-filter="projects">Projects</button>
        <button class="notification-filter" data-filter="messages">Messages</button>
        <button class="notification-filter" data-filter="system">System</button>
      </div>
      
      <div class="notification-list"></div>
      
      <div class="notification-footer">
        <button class="notification-footer-btn" data-action="view-all">View All History</button>
        <button class="notification-footer-btn primary" data-action="preferences">Preferences</button>
      </div>
    `;
  }
  
  bindEvents() {
    // Toggle button
    this.toggle.addEventListener('click', () => this.togglePanel());
    
    // Backdrop click
    this.backdrop.addEventListener('click', () => this.closePanel());
    
    // Panel actions
    this.panel.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (action) {
        this.handleAction(action.dataset.action);
      }
      
      const item = e.target.closest('.notification-item');
      if (item) {
        this.handleItemClick(item.dataset.id);
      }
      
      const filter = e.target.closest('.notification-filter');
      if (filter) {
        this.setFilter(filter.dataset.filter);
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    });
    
    // Mark notifications as read when panel opens
    this.panel.addEventListener('transitionend', () => {
      if (this.isOpen) {
        this.markVisibleAsRead();
      }
    });
  }
  
  handleAction(action) {
    switch (action) {
      case 'close':
        this.closePanel();
        break;
      case 'mark-all-read':
        this.markAllAsRead();
        break;
      case 'settings':
        this.showToast({
          type: 'info',
          title: 'Settings',
          message: 'Notification preferences coming soon!',
          duration: 3000
        });
        break;
      case 'view-all':
        this.showToast({
          type: 'info',
          title: 'History',
          message: 'Full notification history feature coming soon!',
          duration: 3000
        });
        break;
      case 'preferences':
        this.showToast({
          type: 'info',
          title: 'Preferences',
          message: 'Customize your notification preferences here.',
          duration: 3000
        });
        break;
    }
  }
  
  handleItemClick(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.updateBadge();
      this.renderNotifications();
      this.saveToStorage();
      
      // Handle navigation
      if (notification.link) {
        window.location.href = notification.link;
      }
    }
  }
  
  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('active', this.isOpen);
    this.backdrop.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
  
  closePanel() {
    this.isOpen = false;
    this.panel.classList.remove('active');
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  setFilter(filter) {
    this.activeFilter = filter;
    this.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.renderNotifications();
  }
  
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    
    // Limit to 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.updateBadge();
    this.renderNotifications();
    this.saveToStorage();
    
    // Show toast for important notifications
    if (notification.important) {
      this.showToast({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        duration: 6000
      });
    }
  }
  
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateBadge();
    this.renderNotifications();
    this.saveToStorage();
    
    this.showToast({
      type: 'success',
      title: 'All Read',
      message: 'All notifications marked as read',
      duration: 3000
    });
  }
  
  markVisibleAsRead() {
    const visibleNotifications = this.getFilteredNotifications();
    visibleNotifications.forEach(n => n.read = true);
    this.updateBadge();
    this.renderNotifications();
    this.saveToStorage();
  }
  
  updateBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.badgeElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
    this.badgeElement.classList.toggle('hidden', unreadCount === 0);
    
    // Update filter counts
    const allCount = this.notifications.length;
    const unreadCountAll = this.notifications.filter(n => !n.read).length;
    
    this.panel.querySelector('[data-filter="all"] .count').textContent = allCount;
    this.panel.querySelector('[data-filter="unread"] .count').textContent = unreadCountAll;
  }
  
  getFilteredNotifications() {
    switch (this.activeFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'projects':
        return this.notifications.filter(n => n.category === 'projects');
      case 'messages':
        return this.notifications.filter(n => n.category === 'messages');
      case 'system':
        return this.notifications.filter(n => n.category === 'system');
      default:
        return this.notifications;
    }
  }
  
  renderNotifications() {
    const filtered = this.getFilteredNotifications();
    
    if (filtered.length === 0) {
      this.listElement.innerHTML = `
        <div class="notification-empty">
          <div class="notification-empty-icon">🔔</div>
          <h4>No notifications</h4>
          <p>You're all caught up! Check back later for updates.</p>
        </div>
      `;
      return;
    }
    
    this.listElement.innerHTML = filtered.map(n => this.getNotificationHTML(n)).join('');
  }
  
  getNotificationHTML(notification) {
    const timeAgo = this.getTimeAgo(notification.timestamp);
    const iconMap = {
      success: '✓',
      warning: '⚠️',
      error: '✕',
      info: 'ℹ️'
    };
    
    return `
      <div class="notification-item ${notification.type} ${notification.read ? '' : 'unread'}" 
           data-id="${notification.id}">
        <div class="notification-icon">${iconMap[notification.type] || '🔔'}</div>
        <div class="notification-content">
          <h4 class="notification-title">${notification.title}</h4>
          <p class="notification-message">${notification.message}</p>
          <div class="notification-meta">
            <span class="notification-time">${timeAgo}</span>
            ${notification.category ? `<span class="notification-category">${notification.category}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }
  
  showToast({ type, title, message, duration = 5000 }) {
    const iconMap = {
      success: '✓',
      warning: '⚠️',
      error: '✕',
      info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
      <div class="notification-toast-icon">${iconMap[type] || '🔔'}</div>
      <div class="notification-toast-content">
        <h4 class="notification-toast-title">${title}</h4>
        <p class="notification-toast-message">${message}</p>
      </div>
      <button class="notification-toast-close" aria-label="Close notification">✕</button>
      <div class="notification-toast-progress">
        <div class="notification-toast-progress-bar"></div>
      </div>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Close button
    const closeBtn = toast.querySelector('.notification-toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }
    
    // Play sound (optional)
    this.playNotificationSound(type);
  }
  
  removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }
  
  playNotificationSound(type) {
    // Subtle notification sound could be added here
    // Using Web Audio API for professional sounds
  }
  
  // Simulate real-time notifications
  startRealtimeSimulation() {
    const simulatedNotifications = [
      {
        type: 'info',
        title: 'New Project Inquiry',
        message: 'A potential client from Johannesburg is interested in commercial construction services.',
        category: 'projects',
        important: true
      },
      {
        type: 'success',
        title: 'Project Milestone Reached',
        message: 'Cape Town Residential project has reached 75% completion.',
        category: 'projects'
      },
      {
        type: 'info',
        title: 'Team Update',
        message: 'New contractor partner qualified and added to our network.',
        category: 'system'
      },
      {
        type: 'warning',
        title: 'Schedule Alert',
        message: 'Durban project timeline adjusted due to weather conditions.',
        category: 'projects'
      },
      {
        type: 'success',
        title: 'Client Feedback',
        message: 'New 5-star review received from Johannesburg Corporate HQ project.',
        category: 'messages',
        important: true
      }
    ];
    
    // Add initial notifications
    simulatedNotifications.slice(0, 3).forEach(n => {
      setTimeout(() => this.addNotification(n), 1000 + Math.random() * 2000);
    });
    
    // Add periodic notifications
    setInterval(() => {
      if (Math.random() > 0.7) {
        const randomNotification = simulatedNotifications[Math.floor(Math.random() * simulatedNotifications.length)];
        this.addNotification({
          ...randomNotification,
          title: randomNotification.title + ` #${Math.floor(Math.random() * 100)}`,
          important: Math.random() > 0.8
        });
      }
    }, 30000); // Every 30 seconds
  }
  
  saveToStorage() {
    try {
      localStorage.setItem('buildbridge_notifications', JSON.stringify({
        notifications: this.notifications,
        lastRead: new Date().toISOString()
      }));
    } catch (e) {
      // Storage might be full or unavailable
    }
  }
  
  loadFromStorage() {
    try {
      const data = localStorage.getItem('buildbridge_notifications');
      if (data) {
        const parsed = JSON.parse(data);
        this.notifications = parsed.notifications || [];
      }
    } catch (e) {
      this.notifications = [];
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new NotificationCenter());
} else {
  new NotificationCenter();
}
