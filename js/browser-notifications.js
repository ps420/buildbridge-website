/* =========================================
   Browser Notification System - v30.1
   Fortune 500 Push Notification Manager
   ========================================= */

class BrowserNotificationSystem {
  constructor() {
    this.permission = 'default';
    this.toasts = [];
    this.notifications = [];
    this.maxToasts = 3;
    this.maxNotifications = 50;
    this.toastDuration = 5000;
    this.soundEnabled = false;
    
    // Demo notifications for showcase
    this.demoNotifications = [
      {
        id: 'demo-1',
        type: 'success',
        title: 'Project Updated',
        message: 'Your bathroom renovation project milestone has been completed.',
        icon: 'check',
        timestamp: Date.now() - 300000
      },
      {
        id: 'demo-2',
        type: 'info',
        title: 'New Message',
        message: 'Sarah from BuildBridge sent you an update about your quote.',
        icon: 'message',
        timestamp: Date.now() - 900000
      },
      {
        id: 'demo-3',
        type: 'warning',
        title: 'Schedule Change',
        message: 'Your consultation has been rescheduled to 3:00 PM tomorrow.',
        icon: 'calendar',
        timestamp: Date.now() - 1800000
      }
    ];
    
    this.init();
  }
  
  init() {
    this.createToastContainer();
    this.checkPermission();
    this.bindEvents();
    this.loadNotifications();
    
    // Show notification bell after delay
    setTimeout(() => this.createNotificationBell(), 2000);
    
    // Schedule demo notifications
    this.scheduleDemoNotifications();
  }
  
  checkPermission() {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return;
    }
    
    this.permission = Notification.permission;
    
    if (this.permission === 'default') {
      // Show permission prompt after user interaction
      this.schedulePermissionPrompt();
    }
  }
  
  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toast-container';
    document.body.appendChild(container);
    this.toastContainer = container;
  }
  
  schedulePermissionPrompt() {
    // Wait for user interaction with the site
    const showPrompt = () => {
      // Only show if not already interacted
      if (localStorage.getItem('notification_prompt_shown')) return;
      
      setTimeout(() => {
        this.showPermissionPrompt();
      }, 5000);
    };
    
    // Show on first scroll or click
    let promptShown = false;
    const triggerPrompt = () => {
      if (promptShown) return;
      promptShown = true;
      showPrompt();
    };
    
    window.addEventListener('scroll', triggerPrompt, { once: true });
    document.addEventListener('click', triggerPrompt, { once: true });
  }
  
  showPermissionPrompt() {
    if (localStorage.getItem('notification_prompt_shown')) return;
    
    const prompt = document.createElement('div');
    prompt.className = 'notification-permission-prompt';
    prompt.innerHTML = `
      <div class="notification-header">
        <div class="notification-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div class="notification-title">
          <h4>Stay Updated</h4>
          <p>BuildBridge Notifications</p>
        </div>
        <button class="notification-close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p class="notification-content">
        Get instant updates about your projects, consultation reminders, and special offers. We respect your privacy and won't spam you.
      </p>
      <div class="notification-actions">
        <button class="notification-btn notification-btn-secondary" data-action="dismiss">Not Now</button>
        <button class="notification-btn notification-btn-primary" data-action="allow">Enable Notifications</button>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    // Animate in
    requestAnimationFrame(() => {
      prompt.classList.add('active');
    });
    
    // Bind events
    prompt.querySelector('.notification-close').addEventListener('click', () => {
      this.dismissPermissionPrompt(prompt);
    });
    
    prompt.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
      this.dismissPermissionPrompt(prompt);
    });
    
    prompt.querySelector('[data-action="allow"]').addEventListener('click', () => {
      this.requestPermission(prompt);
    });
    
    localStorage.setItem('notification_prompt_shown', 'true');
  }
  
  dismissPermissionPrompt(prompt) {
    prompt.classList.remove('active');
    setTimeout(() => prompt.remove(), 500);
  }
  
  async requestPermission(prompt) {
    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      
      this.dismissPermissionPrompt(prompt);
      
      if (result === 'granted') {
        this.showToast({
          type: 'success',
          title: 'Notifications Enabled!',
          message: 'You\'ll now receive updates about your projects.'
        });
        
        // Send welcome notification
        setTimeout(() => {
          this.sendNativeNotification({
            title: 'Welcome to BuildBridge! 🏗️',
            body: 'You\'re all set to receive project updates and consultation reminders.',
            icon: '/assets/BuildBridge_Icon_Mark.svg'
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
  
  sendNativeNotification(options) {
    if (this.permission !== 'granted') return;
    
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/assets/BuildBridge_Icon_Mark.svg',
      badge: options.badge || '/assets/BuildBridge_Icon_Mark.svg',
      tag: options.tag || 'buildbridge-' + Date.now(),
      requireInteraction: options.requireInteraction || false,
      data: options.data || {}
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      if (options.onClick) {
        options.onClick(notification.data);
      }
    };
    
    return notification;
  }
  
  showToast(options) {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${options.type || 'info'}`;
    
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5-.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[options.type] || icons.info}</div>
      <div class="toast-content">
        <h5 class="toast-title">${options.title}</h5>
        <p class="toast-message">${options.message}</p>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="toast-progress">
        <div class="toast-progress-bar" style="animation-duration: ${this.toastDuration}ms"></div>
      </div>
    `;
    
    // Limit concurrent toasts
    if (this.toasts.length >= this.maxToasts) {
      this.removeToast(this.toasts[0]);
    }
    
    this.toastContainer.appendChild(toast);
    this.toasts.push(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('active');
    });
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // Auto remove
    const autoRemove = setTimeout(() => {
      this.removeToast(toast);
    }, this.toastDuration);
    
    // Pause on hover
    toast.addEventListener('mouseenter', () => {
      const progress = toast.querySelector('.toast-progress-bar');
      if (progress) {
        progress.style.animationPlayState = 'paused';
      }
    });
    
    toast.addEventListener('mouseleave', () => {
      const progress = toast.querySelector('.toast-progress-bar');
      if (progress) {
        progress.style.animationPlayState = 'running';
      }
    });
    
    // Store reference for cleanup
    toast.autoRemoveTimeout = autoRemove;
    
    return toast;
  }
  
  removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    clearTimeout(toast.autoRemoveTimeout);
    toast.classList.remove('active');
    toast.classList.add('removing');
    
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 400);
  }
  
  createNotificationBell() {
    const bell = document.createElement('div');
    bell.className = 'notification-bell';
    bell.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    `;
    
    document.body.appendChild(bell);
    this.bell = bell;
    
    // Create notification panel
    this.createNotificationPanel();
    
    bell.addEventListener('click', () => {
      this.toggleNotificationPanel();
    });
    
    // Check for unread notifications
    this.updateBellState();
  }
  
  createNotificationPanel() {
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
      <div class="notification-panel-header">
        <h4>Notifications</h4>
        <button class="notification-panel-clear">Clear all</button>
      </div>
      <div class="notification-panel-list">
        <div class="notification-panel-empty">No notifications yet</div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.notificationPanel = panel;
    
    // Clear all button
    panel.querySelector('.notification-panel-clear').addEventListener('click', () => {
      this.clearAllNotifications();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !this.bell.contains(e.target)) {
        panel.classList.remove('active');
      }
    });
  }
  
  toggleNotificationPanel() {
    this.notificationPanel.classList.toggle('active');
    
    if (this.notificationPanel.classList.contains('active')) {
      this.markAllAsRead();
    }
  }
  
  scheduleDemoNotifications() {
    // Add demo notifications to storage
    this.demoNotifications.forEach((notif, index) => {
      setTimeout(() => {
        this.addNotification(notif);
      }, (index + 1) * 3000);
    });
  }
  
  addNotification(data) {
    const notification = {
      id: data.id || 'notif-' + Date.now(),
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      icon: data.icon,
      timestamp: data.timestamp || Date.now(),
      read: false
    };
    
    this.notifications.unshift(notification);
    
    // Limit max notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    
    this.saveNotifications();
    this.updateNotificationPanel();
    this.updateBellState();
    
    // Show toast for new notifications
    if (!data.silent) {
      this.showToast({
        type: notification.type,
        title: notification.title,
        message: notification.message
      });
      
      // Ring the bell
      if (this.bell) {
        this.bell.classList.add('ringing');
        setTimeout(() => this.bell.classList.remove('ringing'), 500);
      }
    }
  }
  
  updateNotificationPanel() {
    const list = this.notificationPanel.querySelector('.notification-panel-list');
    
    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="notification-panel-empty">No notifications yet</div>';
      return;
    }
    
    list.innerHTML = this.notifications.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
        <div class="notification-item-icon" style="background: ${this.getTypeColor(notif.type)}1A; color: ${this.getTypeColor(notif.type)}">
          ${this.getTypeIcon(notif.icon, notif.type)}
        </div>
        <div class="notification-item-content">
          <h5 class="notification-item-title">${notif.title}</h5>
          <p class="notification-item-desc">${notif.message}</p>
          <span class="notification-item-time">${this.formatTime(notif.timestamp)}</span>
        </div>
      </div>
    `).join('');
  }
  
  getTypeColor(type) {
    const colors = {
      success: '#00c853',
      error: '#ff4444',
      warning: '#ffc447',
      info: '#2196f3'
    };
    return colors[type] || colors.info;
  }
  
  getTypeIcon(icon, type) {
    const icons = {
      check: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      message: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>',
      calendar: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>'
    };
    return icons[icon] || icons.check;
  }
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  }
  
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.updateNotificationPanel();
    this.updateBellState();
  }
  
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.updateNotificationPanel();
    this.updateBellState();
  }
  
  updateBellState() {
    if (!this.bell) return;
    
    const unread = this.notifications.filter(n => !n.read).length;
    
    if (unread > 0) {
      this.bell.classList.add('unread');
    } else {
      this.bell.classList.remove('unread');
    }
  }
  
  saveNotifications() {
    localStorage.setItem('buildbridge_notifications', JSON.stringify(this.notifications));
  }
  
  loadNotifications() {
    const saved = localStorage.getItem('buildbridge_notifications');
    if (saved) {
      this.notifications = JSON.parse(saved);
    }
  }
  
  bindEvents() {
    // Custom event for other components to trigger notifications
    document.addEventListener('buildbridge:notification', (e) => {
      this.addNotification(e.detail);
    });
    
    // Custom event for native notifications
    document.addEventListener('buildbridge:native-notify', (e) => {
      this.sendNativeNotification(e.detail);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new BrowserNotificationSystem();
  });
} else {
  window.notificationSystem = new BrowserNotificationSystem();
}
