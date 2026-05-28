/**
 * Offline Status Indicator v64.2
 * Network connection monitoring
 * Fortune 500 Quality UX Enhancement
 */

class OfflineStatusIndicator {
  constructor(options = {}) {
    this.options = {
      showModalOnOffline: true,
      enableSync: true,
      enableSaveOffline: true,
      ...options
    };
    
    this.isOnline = navigator.onLine;
    this.connectionSpeed = null;
    this.syncQueue = [];
    
    this.elements = {};
    
    this.init();
  }
  
  init() {
    this.createIndicator();
    this.bindEvents();
    this.checkConnectionSpeed();
    
    // Initial state check
    if (!this.isOnline) {
      this.goOffline();
    }
  }
  
  createIndicator() {
    // Main status bar
    const indicator = document.createElement('div');
    indicator.className = 'offline-status-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.innerHTML = `
      <div class="status-bar ${this.isOnline ? 'online' : 'offline'}">
        <span class="status-icon">${this.isOnline ? '✓' : '⚠️'}</span>
        <span class="status-text">
          ${this.isOnline ? 'You\'re back online' : 'You\'re offline. Check your connection.'}
        </span>
        ${!this.isOnline ? '<button class="status-action" id="retry-connection">Retry</button>' : ''}
      </div>
    `;
    
    document.body.appendChild(indicator);
    this.elements.indicator = indicator;
    
    // Offline modal
    if (this.options.showModalOnOffline) {
      const modal = document.createElement('div');
      modal.className = 'offline-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Connection Status');
      modal.innerHTML = `
        <div class="offline-modal">
          <div class="offline-modal-icon">📡</div>
          <h3>No Internet Connection</h3>
          <p>It looks like you're offline. Don't worry - you can still browse previously loaded content. We'll sync everything once you're back online.</p>
          <div class="offline-modal-actions">
            <button class="offline-btn offline-btn-primary" id="modal-retry">Try Again</button>
            <button class="offline-btn offline-btn-secondary" id="modal-continue">Continue Browsing</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      this.elements.modal = modal;
    }
    
    // Offline indicator dot
    const dot = document.createElement('div');
    dot.className = 'offline-indicator-dot';
    dot.setAttribute('title', 'Offline mode');
    document.body.appendChild(dot);
    this.elements.dot = dot;
    
    // Connection quality indicator
    const quality = document.createElement('div');
    quality.className = 'connection-quality';
    quality.innerHTML = `
      <div class="connection-bars">
        <div class="connection-bar"></div>
        <div class="connection-bar"></div>
        <div class="connection-bar"></div>
        <div class="connection-bar"></div>
      </div>
      <span class="connection-text" id="connection-text">Good</span>
    `;
    document.body.appendChild(quality);
    this.elements.quality = quality;
    
    // Sync status
    if (this.options.enableSync) {
      const sync = document.createElement('div');
      sync.className = 'sync-status';
      sync.innerHTML = `
        <div class="sync-spinner"></div>
        <span class="sync-text">Syncing changes...</span>
      `;
      document.body.appendChild(sync);
      this.elements.sync = sync;
    }
    
    // Save for offline button
    if (this.options.enableSaveOffline) {
      const saveBtn = document.createElement('button');
      saveBtn.className = 'save-offline-btn';
      saveBtn.innerHTML = '💾 Save for Offline';
      saveBtn.addEventListener('click', () => this.saveCurrentPage());
      document.body.appendChild(saveBtn);
      this.elements.saveBtn = saveBtn;
    }
  }
  
  bindEvents() {
    // Network status events
    window.addEventListener('online', () => this.goOnline());
    window.addEventListener('offline', () => this.goOffline());
    
    // Retry buttons
    document.getElementById('retry-connection')?.addEventListener('click', () => {
      this.checkConnection();
    });
    
    document.getElementById('modal-retry')?.addEventListener('click', () => {
      this.checkConnection();
    });
    
    document.getElementById('modal-continue')?.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Close modal on overlay click
    this.elements.modal?.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.hideModal();
      }
    });
    
    // Before unload - save unsynced data
    window.addEventListener('beforeunload', () => {
      if (this.syncQueue.length > 0) {
        localStorage.setItem('bb_sync_queue', JSON.stringify(this.syncQueue));
      }
    });
    
    // Restore sync queue
    const savedQueue = localStorage.getItem('bb_sync_queue');
    if (savedQueue) {
      this.syncQueue = JSON.parse(savedQueue);
      localStorage.removeItem('bb_sync_queue');
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }
    
    // Visibility change - check connection when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkConnection();
      }
    });
  }
  
  goOnline() {
    this.isOnline = true;
    
    // Update status bar
    const statusBar = this.elements.indicator.querySelector('.status-bar');
    statusBar.className = 'status-bar online';
    statusBar.innerHTML = `
      <span class="status-icon">✓</span>
      <span class="status-text">You're back online</span>
    `;
    
    this.elements.indicator.classList.add('visible');
    
    // Hide offline dot
    this.elements.dot.classList.remove('visible');
    
    // Hide modal if open
    this.hideModal();
    
    // Show connection quality
    this.showConnectionQuality();
    
    // Process sync queue
    if (this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
    
    // Hide after animation completes
    setTimeout(() => {
      this.elements.indicator.classList.remove('visible');
    }, 2500);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('networkstatuschange', {
      detail: { online: true }
    }));
  }
  
  goOffline() {
    this.isOnline = false;
    
    // Update status bar
    const statusBar = this.elements.indicator.querySelector('.status-bar');
    statusBar.className = 'status-bar offline';
    statusBar.innerHTML = `
      <span class="status-icon">⚠️</span>
      <span class="status-text">You're offline. Check your connection.</span>
      <button class="status-action" id="retry-connection">Retry</button>
    `;
    
    this.elements.indicator.classList.add('visible');
    
    // Show offline dot
    this.elements.dot.classList.add('visible');
    
    // Show modal
    this.showModal();
    
    // Hide connection quality
    this.elements.quality.classList.remove('visible');
    
    // Show save button
    if (this.elements.saveBtn) {
      this.elements.saveBtn.classList.add('visible');
    }
    
    // Rebind retry button
    document.getElementById('retry-connection')?.addEventListener('click', () => {
      this.checkConnection();
    });
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('networkstatuschange', {
      detail: { online: false }
    }));
  }
  
  showModal() {
    if (this.elements.modal && this.options.showModalOnOffline) {
      this.elements.modal.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  }
  
  hideModal() {
    if (this.elements.modal) {
      this.elements.modal.classList.remove('visible');
      document.body.style.overflow = '';
    }
  }
  
  checkConnection() {
    // Try to fetch a small resource to verify connection
    fetch('assets/BuildBridge_Icon_Mark.svg', { 
      method: 'HEAD',
      cache: 'no-store' 
    })
      .then(() => {
        if (!this.isOnline) {
          this.goOnline();
        }
      })
      .catch(() => {
        if (this.isOnline) {
          this.goOffline();
        }
      });
  }
  
  async checkConnectionSpeed() {
    if (!this.isOnline) return;
    
    const startTime = performance.now();
    
    try {
      await fetch('assets/BuildBridge_Icon_Mark.svg', { 
        method: 'HEAD',
        cache: 'no-store' 
      });
      
      const duration = performance.now() - startTime;
      this.connectionSpeed = duration;
      
      this.updateConnectionQualityUI(duration);
    } catch (e) {
      this.connectionSpeed = null;
    }
  }
  
  updateConnectionQualityUI(duration) {
    const quality = this.elements.quality;
    const text = document.getElementById('connection-text');
    
    quality.classList.remove('excellent', 'good', 'slow', 'poor');
    
    if (duration < 100) {
      quality.classList.add('excellent');
      text.textContent = 'Excellent';
    } else if (duration < 300) {
      quality.classList.add('good');
      text.textContent = 'Good';
    } else if (duration < 1000) {
      quality.classList.add('slow');
      text.textContent = 'Slow';
    } else {
      quality.classList.add('poor');
      text.textContent = 'Poor';
    }
  }
  
  showConnectionQuality() {
    if (!this.isOnline) return;
    
    this.elements.quality.classList.add('visible');
    this.checkConnectionSpeed();
    
    // Hide after 5 seconds
    setTimeout(() => {
      this.elements.quality.classList.remove('visible');
    }, 5000);
  }
  
  queueSync(data) {
    this.syncQueue.push({
      ...data,
      timestamp: Date.now(),
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
  
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    // Show sync indicator
    if (this.elements.sync) {
      this.elements.sync.classList.add('visible');
    }
    
    const queue = [...this.syncQueue];
    const processed = [];
    
    for (const item of queue) {
      try {
        // In production, this would send to your backend
        console.log('Syncing:', item);
        await this.simulateSync(item);
        processed.push(item.id);
      } catch (e) {
        console.error('Sync failed for item:', item, e);
      }
    }
    
    // Remove processed items
    this.syncQueue = this.syncQueue.filter(item => !processed.includes(item.id));
    
    // Update sync indicator
    if (this.elements.sync) {
      const spinner = this.elements.sync.querySelector('.sync-spinner');
      const text = this.elements.sync.querySelector('.sync-text');
      
      spinner.style.display = 'none';
      text.textContent = 'All changes synced!';
      text.classList.add('sync-complete');
      
      setTimeout(() => {
        this.elements.sync.classList.remove('visible');
        spinner.style.display = '';
        text.textContent = 'Syncing changes...';
        text.classList.remove('sync-complete');
      }, 2000);
    }
  }
  
  simulateSync(item) {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
  
  saveCurrentPage() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      content: document.documentElement.outerHTML.substring(0, 50000) // Limit size
    };
    
    // Get existing saved pages
    const saved = JSON.parse(localStorage.getItem('bb_offline_pages') || '[]');
    
    // Check if already saved
    const existingIndex = saved.findIndex(p => p.url === pageData.url);
    if (existingIndex >= 0) {
      saved[existingIndex] = pageData;
    } else {
      saved.push(pageData);
    }
    
    // Limit to 10 saved pages
    if (saved.length > 10) {
      saved.shift();
    }
    
    localStorage.setItem('bb_offline_pages', JSON.stringify(saved));
    
    // Show toast
    if (window.toastNotification) {
      window.toastNotification.show('Page saved for offline viewing', 'success');
    }
  }
  
  getOfflinePages() {
    return JSON.parse(localStorage.getItem('bb_offline_pages') || '[]');
  }
  
  clearOfflinePages() {
    localStorage.removeItem('bb_offline_pages');
  }
  
  destroy() {
    Object.values(this.elements).forEach(el => el?.remove());
    this.elements = {};
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.offlineStatus = new OfflineStatusIndicator({
    showModalOnOffline: true,
    enableSync: true,
    enableSaveOffline: true
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineStatusIndicator;
}
