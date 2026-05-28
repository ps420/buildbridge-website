/**
 * Quick Actions FAB v64.3
 * Floating Action Button System
 * Fortune 500 Quality Navigation Enhancement
 */

class QuickActionsFAB {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
      items: [
        { id: 'whatsapp', label: 'WhatsApp', icon: '💬', type: 'whatsapp', number: '+27661200064' },
        { id: 'phone', label: 'Call Us', icon: '📞', type: 'phone', number: '+27661200064' },
        { id: 'email', label: 'Email', icon: '✉️', type: 'email', address: 'info@buildbridge.co.za' },
        { id: 'calculator', label: 'Get Estimate', icon: '💰', type: 'calculator' },
        { id: 'share', label: 'Share', icon: '🔗', type: 'share' },
        { id: 'top', label: 'Back to Top', icon: '↑', type: 'scroll', target: 'top' }
      ],
      showBadge: true,
      badgeCount: 0,
      enableKeyboardShortcuts: true,
      ...options
    };
    
    this.isOpen = false;
    this.container = null;
    this.shortcuts = {};
    
    this.init();
  }
  
  init() {
    this.createFAB();
    this.bindEvents();
    this.setupKeyboardShortcuts();
  }
  
  createFAB() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = `quick-actions-fab position-${this.options.position.replace('-', '')}`;
    
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'fab-backdrop';
    this.backdrop.addEventListener('click', () => this.close());
    document.body.appendChild(this.backdrop);
    
    // Create menu container
    this.menu = document.createElement('div');
    this.menu.className = 'fab-menu';
    this.menu.setAttribute('role', 'menu');
    
    // Create menu items
    this.options.items.forEach((item, index) => {
      const menuItem = this.createMenuItem(item, index);
      this.menu.appendChild(menuItem);
    });
    
    // Create main button
    this.mainButton = document.createElement('button');
    this.mainButton.className = 'fab-main';
    this.mainButton.setAttribute('aria-label', 'Quick actions');
    this.mainButton.setAttribute('aria-expanded', 'false');
    this.mainButton.setAttribute('aria-controls', 'fab-menu');
    this.mainButton.innerHTML = `
      <span class="fab-ripple"></span>
      <span class="fab-icon">+</span>
      ${this.options.showBadge && this.options.badgeCount > 0 ? 
        `<span class="fab-badge">${this.options.badgeCount}</span>` : ''}
    `;
    
    // Create keyboard shortcuts indicator
    if (this.options.enableKeyboardShortcuts) {
      this.shortcutsPanel = document.createElement('div');
      this.shortcutsPanel.className = 'fab-shortcuts';
      this.shortcutsPanel.innerHTML = `
        <h4>Keyboard Shortcuts</h4>
        <div class="fab-shortcut-item">
          <span>Open Menu</span>
          <span class="fab-shortcut-key">/</span>
        </div>
        <div class="fab-shortcut-item">
          <span>WhatsApp</span>
          <span class="fab-shortcut-key">W</span>
        </div>
        <div class="fab-shortcut-item">
          <span>Calculator</span>
          <span class="fab-shortcut-key">C</span>
        </div>
        <div class="fab-shortcut-item">
          <span>Top</span>
          <span class="fab-shortcut-key">T</span>
        </div>
      `;
      this.mainButton.appendChild(this.shortcutsPanel);
    }
    
    // Assemble
    this.container.appendChild(this.menu);
    this.container.appendChild(this.mainButton);
    document.body.appendChild(this.container);
  }
  
  createMenuItem(item, index) {
    const el = document.createElement('div');
    el.className = `fab-item fab-item-${item.id}`;
    el.setAttribute('role', 'menuitem');
    
    // Special handling for share item
    if (item.type === 'share') {
      el.innerHTML = `
        <span class="fab-item-label">${item.label}</span>
        <button class="fab-item-btn" aria-label="${item.label}">${item.icon}</button>
        <div class="fab-share-menu">
          <button class="fab-share-btn" data-share="copy" title="Copy link">📋</button>
          <button class="fab-share-btn" data-share="twitter" title="Share on X">𝕏</button>
          <button class="fab-share-btn" data-share="linkedin" title="Share on LinkedIn">in</button>
          <button class="fab-share-btn" data-share="facebook" title="Share on Facebook">f</button>
        </div>
      `;
      
      // Bind share buttons
      el.querySelectorAll('.fab-share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleShare(btn.dataset.share);
        });
      });
    } else {
      el.innerHTML = `
        <span class="fab-item-label">${item.label}</span>
        <button class="fab-item-btn" aria-label="${item.label}">${item.icon}</button>
      `;
    }
    
    // Bind click
    el.querySelector('.fab-item-btn').addEventListener('click', () => {
      this.handleItemClick(item);
    });
    
    return el;
  }
  
  bindEvents() {
    // Main button click
    this.mainButton.addEventListener('click', () => this.toggle());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Escape to close
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      
      // Open with /
      if (e.key === '/' && !this.isInputFocused()) {
        e.preventDefault();
        this.open();
      }
      
      // Handle shortcuts when open
      if (this.isOpen) {
        this.handleShortcut(e);
      }
    });
    
    // Hide on scroll (optional)
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      // Auto-close when scrolling down
      if (currentScroll > lastScroll && currentScroll > 200 && this.isOpen) {
        this.close();
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }
  
  setupKeyboardShortcuts() {
    this.shortcuts = {
      'w': () => this.triggerItem('whatsapp'),
      'c': () => this.triggerItem('calculator'),
      'e': () => this.triggerItem('email'),
      'p': () => this.triggerItem('phone'),
      's': () => this.triggerItem('share'),
      't': () => this.triggerItem('top'),
    };
  }
  
  handleShortcut(e) {
    const key = e.key.toLowerCase();
    if (this.shortcuts[key]) {
      e.preventDefault();
      this.shortcuts[key]();
      this.close();
    }
    
    // Number keys for items
    const num = parseInt(e.key);
    if (num > 0 && num <= this.options.items.length) {
      e.preventDefault();
      this.handleItemClick(this.options.items[num - 1]);
      this.close();
    }
  }
  
  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.isOpen = true;
    this.menu.classList.add('visible');
    this.backdrop.classList.add('visible');
    this.mainButton.classList.add('active');
    this.mainButton.setAttribute('aria-expanded', 'true');
    
    // Focus first item
    setTimeout(() => {
      const firstItem = this.menu.querySelector('.fab-item-btn');
      if (firstItem) firstItem.focus();
    }, 100);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('fabopened'));
  }
  
  close() {
    this.isOpen = false;
    this.menu.classList.remove('visible');
    this.backdrop.classList.remove('visible');
    this.mainButton.classList.remove('active');
    this.mainButton.setAttribute('aria-expanded', 'false');
    
    // Return focus to main button
    this.mainButton.focus();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('fabclosed'));
  }
  
  handleItemClick(item) {
    switch (item.type) {
      case 'whatsapp':
        this.openWhatsApp(item.number);
        break;
      case 'phone':
        this.makeCall(item.number);
        break;
      case 'email':
        this.sendEmail(item.address);
        break;
      case 'calculator':
        this.openCalculator();
        break;
      case 'scroll':
        this.scrollTo(item.target);
        break;
      case 'share':
        // Share menu is handled separately
        break;
      default:
        if (item.action) {
          item.action();
        }
    }
    
    this.close();
  }
  
  triggerItem(itemId) {
    const item = this.options.items.find(i => i.id === itemId);
    if (item) {
      this.handleItemClick(item);
    }
  }
  
  openWhatsApp(number) {
    const message = 'Hi BuildBridge! I\'m interested in your construction services.';
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  }
  
  makeCall(number) {
    window.location.href = `tel:${number}`;
  }
  
  sendEmail(address) {
    const subject = 'Construction Project Inquiry';
    const body = 'Hi BuildBridge Team,\n\nI\'m interested in discussing a construction project with you.\n\nBest regards';
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  
  openCalculator() {
    if (window.costCalculator) {
      window.costCalculator.open();
    } else {
      // Fallback - could show toast
      this.showToast('Calculator coming soon!', 'info');
    }
  }
  
  scrollTo(target) {
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target.startsWith('#')) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  handleShare(type) {
    const url = window.location.href;
    const title = document.title;
    const text = 'Check out BuildBridge - South Africa\'s premier construction management company!';
    
    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          this.showToast('Link copied to clipboard!', 'success');
        });
        break;
        
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
        
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
        
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
        
      case 'native':
        if (navigator.share) {
          navigator.share({ title, text, url });
        }
        break;
    }
  }
  
  showToast(message, type = 'info') {
    if (window.toastNotification) {
      window.toastNotification.show(message, type);
    } else {
      // Simple fallback toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        z-index: 99999;
        animation: toast-in 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }
  
  updateBadge(count) {
    this.options.badgeCount = count;
    const existingBadge = this.mainButton.querySelector('.fab-badge');
    
    if (count > 0) {
      if (existingBadge) {
        existingBadge.textContent = count;
      } else {
        const badge = document.createElement('span');
        badge.className = 'fab-badge';
        badge.textContent = count;
        this.mainButton.appendChild(badge);
      }
    } else {
      existingBadge?.remove();
    }
  }
  
  addItem(item) {
    this.options.items.push(item);
    const menuItem = this.createMenuItem(item, this.options.items.length - 1);
    this.menu.appendChild(menuItem);
  }
  
  removeItem(itemId) {
    const index = this.options.items.findIndex(i => i.id === itemId);
    if (index > -1) {
      this.options.items.splice(index, 1);
      const menuItems = this.menu.querySelectorAll('.fab-item');
      if (menuItems[index]) {
        menuItems[index].remove();
      }
    }
  }
  
  destroy() {
    this.container?.remove();
    this.backdrop?.remove();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.quickActionsFAB = new QuickActionsFAB({
    position: 'bottom-right',
    showBadge: false,
    enableKeyboardShortcuts: true
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickActionsFAB;
}
