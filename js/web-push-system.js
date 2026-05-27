/**
 * Web Push Notification System
 * Fortune 500 Grade Engagement Platform
 * Handles push permission, subscription, and notification management
 */

class WebPushSystem {
  constructor(options = {}) {
    this.options = {
      publicKey: options.publicKey || null,
      serviceWorkerPath: options.serviceWorkerPath || '/sw.js',
      delayMs: options.delayMs || 15000,
      showWidget: options.showWidget !== false,
      ...options
    };
    
    this.state = {
      supported: false,
      permission: 'default',
      subscribed: false,
      subscription: null,
      dismissed: false
    };
    
    this.storageKey = 'buildbridge_push_status';
    
    this.init();
  }
  
  init() {
    // Check browser support
    this.state.supported = 'PushManager' in window && 'Notification' in window;
    
    if (!this.state.supported) {
      console.log('🔔 Push notifications not supported');
      return;
    }
    
    // Load saved state
    this.loadState();
    
    // Check current permission
    this.state.permission = Notification.permission;
    
    // Initialize based on state
    if (this.state.permission === 'granted') {
      this.initializePush();
      this.showStatusIndicator();
    } else if (this.state.permission === 'denied') {
      console.log('🔔 Push permission denied');
    } else if (this.options.showWidget && !this.state.dismissed) {
      // Show permission widget after delay
      setTimeout(() => {
        this.showPermissionWidget();
      }, this.options.delayMs);
    }
    
    console.log('🔔 Web Push System initialized');
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.dismissed = parsed.dismissed || false;
        this.state.subscribed = parsed.subscribed || false;
      }
    } catch (e) {
      console.warn('Could not load push state');
    }
  }
  
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        dismissed: this.state.dismissed,
        subscribed: this.state.subscribed,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not save push state');
    }
  }
  
  showPermissionWidget() {
    // Don't show if already interacted
    if (this.state.permission !== 'default' || this.state.dismissed) return;
    
    const widget = document.createElement('div');
    widget.className = 'push-widget';
    widget.innerHTML = `
      <button class="push-widget-close" aria-label="Dismiss">×</button>
      <div class="push-widget-header">
        <div class="push-widget-icon">🔔</div>
        <div>
          <h3 class="push-widget-title">Stay Updated</h3>
          <p class="push-widget-subtitle">Get instant notifications</p>
        </div>
      </div>
      <p class="push-widget-text">
        Enable notifications to receive updates about new projects, industry insights, and exclusive offers from BuildBridge.
      </p>
      <ul class="push-widget-benefits">
        <li>New project announcements</li>
        <li>Construction tips & insights</li>
        <li>Exclusive client offers</li>
      </ul>
      <div class="push-widget-actions">
        <button class="push-widget-btn push-widget-btn-secondary" data-action="dismiss">
          Not now
        </button>
        <button class="push-widget-btn push-widget-btn-primary" data-action="subscribe">
          Enable
        </button>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Show animation
    requestAnimationFrame(() => {
      widget.classList.add('visible');
    });
    
    // Event listeners
    widget.querySelector('.push-widget-close').addEventListener('click', () => {
      this.dismissWidget(widget);
    });
    
    widget.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'dismiss') {
          this.dismissWidget(widget);
        } else if (action === 'subscribe') {
          this.requestPermission(widget);
        }
      });
    });
    
    // Auto-hide after 30 seconds if not interacted
    setTimeout(() => {
      if (widget.parentNode) {
        this.dismissWidget(widget);
      }
    }, 30000);
  }
  
  dismissWidget(widget) {
    this.state.dismissed = true;
    this.saveState();
    
    widget.style.transform = 'translateY(150%)';
    widget.style.opacity = '0';
    
    setTimeout(() => widget.remove(), 500);
  }
  
  async requestPermission(widget) {
    try {
      const result = await Notification.requestPermission();
      this.state.permission = result;
      
      if (result === 'granted') {
        await this.initializePush();
        this.showStatusIndicator();
        this.dismissWidget(widget);
        this.showPreviewModal();
      } else if (result === 'denied') {
        this.dismissWidget(widget);
        this.showToast('Notification permission denied', 'info');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      this.showToast('Could not enable notifications', 'error');
    }
  }
  
  async initializePush() {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register(
        this.options.serviceWorkerPath
      );
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Subscribe to push
      if (this.options.publicKey) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.options.publicKey)
        });
        
        this.state.subscription = subscription;
        this.state.subscribed = true;
        this.saveState();
        
        console.log('🔔 Push subscription created');
        
        // Send subscription to server (mock)
        this.sendSubscriptionToServer(subscription);
      }
    } catch (error) {
      console.error('Error initializing push:', error);
    }
  }
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
  
  sendSubscriptionToServer(subscription) {
    // In production, send this to your backend
    console.log('Subscription to send to server:', subscription);
    
    // Mock API call
    fetch('/api/push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    }).catch(() => {
      // Silent fail - subscription stored locally
    });
  }
  
  showStatusIndicator() {
    // Remove existing indicator
    const existing = document.querySelector('.push-status');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'push-status';
    indicator.innerHTML = `
      <div class="push-status-icon ${this.state.permission !== 'granted' ? 'disabled' : ''}"></div>
      <span class="push-status-text">Notifications ${this.state.permission === 'granted' ? 'on' : 'off'}</span>
    `;
    
    indicator.addEventListener('click', () => {
      this.showSettingsPanel();
    });
    
    document.body.appendChild(indicator);
    
    // Show after delay
    setTimeout(() => {
      indicator.classList.add('visible');
    }, 2000);
  }
  
  showPreviewModal() {
    const modal = document.createElement('div');
    modal.className = 'push-preview-modal';
    modal.innerHTML = `
      <div class="push-preview-content">
        <div class="push-preview-icon">🎉</div>
        <h3 class="push-preview-title">You're all set!</h3>
        <p class="push-preview-text">
          You'll now receive notifications about new projects, insights, and special offers.
        </p>
        <div class="push-notification-preview">
          <div class="push-notification-header">
            <div class="push-notification-icon">🏗️</div>
            <span class="push-notification-app">BuildBridge</span>
            <span class="push-notification-time">Now</span>
          </div>
          <div class="push-notification-title">Welcome to BuildBridge!</div>
          <div class="push-notification-body">
            Thanks for enabling notifications. We'll keep you updated on exciting news.
          </div>
        </div>
        <button class="cookie-btn cookie-btn-primary" data-action="close" style="width: 100%;">
          Got it
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    
    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 400);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 400);
      }
    });
    
    // Send welcome notification
    setTimeout(() => {
      this.sendWelcomeNotification();
    }, 1000);
  }
  
  showSettingsPanel() {
    const existing = document.querySelector('.push-settings');
    if (existing) {
      existing.classList.add('active');
      return;
    }
    
    const panel = document.createElement('div');
    panel.className = 'push-settings';
    panel.innerHTML = `
      <div class="push-settings-header">
        <h3 class="push-settings-title">🔔 Notification Settings</h3>
        <button class="push-settings-close" aria-label="Close">×</button>
      </div>
      <div class="push-settings-list">
        <div class="push-setting-item">
          <div class="push-setting-info">
            <div class="push-setting-name">Push Notifications</div>
            <div class="push-setting-desc">Receive browser notifications</div>
          </div>
          <div class="cookie-toggle ${this.state.permission === 'granted' ? 'active' : ''}" data-setting="push">
            <div class="cookie-toggle-slider"></div>
          </div>
        </div>
        <div class="push-setting-item">
          <div class="push-setting-info">
            <div class="push-setting-name">New Projects</div>
            <div class="push-setting-desc">When we complete new projects</div>
          </div>
          <div class="cookie-toggle active" data-setting="projects">
            <div class="cookie-toggle-slider"></div>
          </div>
        </div>
        <div class="push-setting-item">
          <div class="push-setting-info">
            <div class="push-setting-name">Industry Insights</div>
            <div class="push-setting-desc">Construction tips and trends</div>
          </div>
          <div class="cookie-toggle active" data-setting="insights">
            <div class="cookie-toggle-slider"></div>
          </div>
        </div>
        <div class="push-setting-item">
          <div class="push-setting-info">
            <div class="push-setting-name">Special Offers</div>
            <div class="push-setting-desc">Exclusive client promotions</div>
          </div>
          <div class="cookie-toggle" data-setting="offers">
            <div class="cookie-toggle-slider"></div>
          </div>
        </div>
      </div>
      <button class="push-test-btn" ${this.state.permission !== 'granted' ? 'disabled' : ''}>
        🧪 Send Test Notification
      </button>
    `;
    
    document.body.appendChild(panel);
    
    requestAnimationFrame(() => {
      panel.classList.add('active');
    });
    
    // Close button
    panel.querySelector('.push-settings-close').addEventListener('click', () => {
      panel.classList.remove('active');
    });
    
    // Toggle switches
    panel.querySelectorAll('.cookie-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const setting = toggle.dataset.setting;
        
        if (setting === 'push') {
          if (this.state.permission === 'granted') {
            this.unsubscribe();
            toggle.classList.remove('active');
          } else {
            this.requestPermission();
          }
        } else {
          toggle.classList.toggle('active');
        }
      });
    });
    
    // Test button
    panel.querySelector('.push-test-btn').addEventListener('click', () => {
      if (this.state.permission === 'granted') {
        this.showLocalNotification({
          title: 'Test Notification',
          body: 'This is a test notification from BuildBridge!',
          icon: '/assets/BuildBridge_Icon_Mark.svg'
        });
      }
    });
    
    // Close on overlay click
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !e.target.closest('.push-status')) {
        panel.classList.remove('active');
      }
    }, { once: true });
  }
  
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        this.state.subscribed = false;
        this.state.subscription = null;
        this.saveState();
        
        this.showToast('Notifications disabled', 'info');
        this.showStatusIndicator();
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }
  
  sendWelcomeNotification() {
    this.showLocalNotification({
      title: 'Welcome to BuildBridge! 🏗️',
      body: 'You\'ll now receive updates about our latest projects and insights.',
      icon: '/assets/BuildBridge_Icon_Mark.svg',
      badge: '/assets/BuildBridge_Icon_Mark.svg',
      tag: 'welcome',
      requireInteraction: false
    });
  }
  
  showLocalNotification(options) {
    if (this.state.permission !== 'granted') return;
    
    const notificationOptions = {
      icon: options.icon || '/assets/BuildBridge_Icon_Mark.svg',
      badge: options.badge || '/assets/BuildBridge_Icon_Mark.svg',
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
      ...options
    };
    
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(options.title, notificationOptions);
    });
  }
  
  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
  
  // Public API
  getStatus() {
    return {
      supported: this.state.supported,
      permission: this.state.permission,
      subscribed: this.state.subscribed
    };
  }
  
  sendNotification(options) {
    this.showLocalNotification(options);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pushSystem = new WebPushSystem({
      // In production, add your VAPID public key here
      // publicKey: 'YOUR_VAPID_PUBLIC_KEY'
    });
  });
} else {
  window.pushSystem = new WebPushSystem({
    // publicKey: 'YOUR_VAPID_PUBLIC_KEY'
  });
}
