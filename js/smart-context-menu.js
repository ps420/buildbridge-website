/**
 * SMART CONTEXT MENU - v42 Fortune 500
 * Professional right-click menu system with intelligent context detection
 */

class SmartContextMenu {
  constructor() {
    this.menu = null;
    this.backdrop = null;
    this.submenu = null;
    this.currentTarget = null;
    this.isOpen = false;
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Default menu configurations
    this.defaultMenus = {
      page: this.getPageMenu(),
      image: this.getImageMenu(),
      link: this.getLinkMenu(),
      selection: this.getSelectionMenu(),
      input: this.getInputMenu()
    };
    
    this.init();
  }
  
  init() {
    this.createMenuElement();
    this.bindEvents();
    this.registerKeyboardShortcuts();
  }
  
  createMenuElement() {
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'context-menu-backdrop';
    document.body.appendChild(this.backdrop);
    
    // Create main menu
    this.menu = document.createElement('div');
    this.menu.className = 'context-menu';
    this.menu.setAttribute('role', 'menu');
    document.body.appendChild(this.menu);
    
    // Create submenu
    this.submenu = document.createElement('div');
    this.submenu.className = 'context-submenu';
    this.submenu.setAttribute('role', 'menu');
    document.body.appendChild(this.submenu);
  }
  
  bindEvents() {
    // Context menu event
    document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    
    // Close on backdrop click
    this.backdrop.addEventListener('click', () => this.close());
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        if (this.submenu.classList.contains('active')) {
          this.closeSubmenu();
        } else {
          this.close();
        }
      }
    });
    
    // Close on scroll
    window.addEventListener('scroll', () => {
      if (this.isOpen) this.close();
    }, { passive: true });
    
    // Close on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (this.isOpen) this.close();
    });
    
    // Handle menu item clicks
    this.menu.addEventListener('click', (e) => this.handleMenuClick(e));
    this.submenu.addEventListener('click', (e) => this.handleSubmenuClick(e));
    
    // Handle hover for submenus (desktop only)
    if (!this.isMobile) {
      this.menu.addEventListener('mouseover', (e) => this.handleMenuHover(e));
    }
  }
  
  handleContextMenu(e) {
    // Don't show on form elements that have their own context menus
    if (e.target.closest('input, textarea, select, [contenteditable]')) {
      return;
    }
    
    // Don't show if holding Shift (allow browser menu)
    if (e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    
    this.currentTarget = e.target;
    const menuType = this.detectContext(e.target);
    const menuConfig = this.buildMenuConfig(menuType, e.target);
    
    this.show(e.clientX, e.clientY, menuConfig);
  }
  
  detectContext(target) {
    // Check for text selection
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      return 'selection';
    }
    
    // Check for image
    if (target.tagName === 'IMG' || target.closest('img')) {
      return 'image';
    }
    
    // Check for link
    if (target.tagName === 'A' || target.closest('a')) {
      return 'link';
    }
    
    // Check for input
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return 'input';
    }
    
    // Default to page
    return 'page';
  }
  
  buildMenuConfig(type, target) {
    const baseConfig = this.defaultMenus[type] || this.defaultMenus.page;
    
    // Add context-specific items
    switch (type) {
      case 'selection':
        return this.buildSelectionMenu(target, baseConfig);
      case 'image':
        return this.buildImageMenu(target, baseConfig);
      case 'link':
        return this.buildLinkMenu(target, baseConfig);
      default:
        return baseConfig;
    }
  }
  
  getPageMenu() {
    return {
      header: null,
      sections: [
        {
          items: [
            { icon: '🏠', label: 'Home', action: 'navigate', url: 'index.html', shortcut: 'Alt+H' },
            { icon: '📋', label: 'Services', action: 'navigate', url: 'services.html' },
            { icon: '📁', label: 'Projects', action: 'navigate', url: 'projects.html' },
            { icon: '👥', label: 'About Us', action: 'navigate', url: 'about.html' },
            { icon: '✉️', label: 'Contact', action: 'navigate', url: 'contact.html' }
          ]
        },
        {
          items: [
            { icon: '🔔', label: 'Notifications', action: 'notifications', shortcut: 'Alt+N' },
            { icon: '🔍', label: 'Search', action: 'search', shortcut: 'Ctrl+K' },
            { icon: '⚙️', label: 'Settings', action: 'settings' }
          ]
        },
        {
          items: [
            { icon: '📤', label: 'Share Page', action: 'share' },
            { icon: '🔗', label: 'Copy Link', action: 'copyUrl', shortcut: 'Ctrl+Shift+C' },
            { icon: '💾', label: 'Save Page', action: 'save', shortcut: 'Ctrl+S' }
          ]
        },
        {
          items: [
            { icon: '🔄', label: 'Reload', action: 'reload', shortcut: 'Ctrl+R' },
            { icon: '⬆️', label: 'Back to Top', action: 'scrollTop' }
          ]
        }
      ]
    };
  }
  
  getSelectionMenu() {
    return {
      header: {
        type: 'selection',
        text: 'Selected Text'
      },
      sections: [
        {
          items: [
            { icon: '📋', label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
            { icon: '✂️', label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
            { icon: '📄', label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' }
          ]
        },
        {
          items: [
            { icon: '🔍', label: 'Search Google', action: 'searchGoogle' },
            { icon: '🌐', label: 'Translate', action: 'translate' },
            { icon: '📝', label: 'Define', action: 'define' }
          ]
        },
        {
          items: [
            { icon: '💬', label: 'WhatsApp Share', action: 'shareWhatsApp' },
            { icon: '🐦', label: 'Tweet This', action: 'tweet' },
            { icon: '📧', label: 'Email Selection', action: 'emailSelection' }
          ]
        }
      ]
    };
  }
  
  getImageMenu() {
    return {
      header: {
        type: 'image',
        title: 'Image Options'
      },
      sections: [
        {
          items: [
            { icon: '👁️', label: 'View Image', action: 'viewImage' },
            { icon: '💾', label: 'Save Image', action: 'saveImage' },
            { icon: '📋', label: 'Copy Image', action: 'copyImage' },
            { icon: '🔗', label: 'Copy Image Address', action: 'copyImageUrl' }
          ]
        },
        {
          items: [
            { icon: '🔍', label: 'Search with Google', action: 'searchImage' },
            { icon: '🎨', label: 'Open in New Tab', action: 'openImageTab' }
          ]
        },
        {
          items: [
            { icon: '📤', label: 'Share Image', action: 'shareImage' },
            { icon: '💬', label: 'Share on WhatsApp', action: 'shareImageWhatsApp' }
          ]
        }
      ]
    };
  }
  
  getLinkMenu() {
    return {
      header: {
        type: 'link',
        title: 'Link Options'
      },
      sections: [
        {
          items: [
            { icon: '🔗', label: 'Open Link', action: 'openLink' },
            { icon: '🪟', label: 'Open in New Tab', action: 'openLinkTab', shortcut: 'Ctrl+Click' },
            { icon: '📋', label: 'Copy Link Address', action: 'copyLinkUrl', shortcut: 'Ctrl+C' }
          ]
        },
        {
          items: [
            { icon: '💬', label: 'Share Link', action: 'shareLink' },
            { icon: '📧', label: 'Email Link', action: 'emailLink' }
          ]
        },
        {
          items: [
            { icon: '🔖', label: 'Bookmark Page', action: 'bookmark' },
            { icon: '🔗', label: 'Copy Page Link', action: 'copyPageUrl' }
          ]
        }
      ]
    };
  }
  
  getInputMenu() {
    return {
      sections: [
        {
          items: [
            { icon: '↩️', label: 'Undo', action: 'undo', shortcut: 'Ctrl+Z' },
            { icon: '↪️', label: 'Redo', action: 'redo', shortcut: 'Ctrl+Y' }
          ]
        },
        {
          items: [
            { icon: '✂️', label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
            { icon: '📋', label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
            { icon: '📄', label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' }
          ]
        },
        {
          items: [
            { icon: '✓', label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' },
            { icon: '🗑️', label: 'Delete', action: 'delete', shortcut: 'Del' }
          ]
        }
      ]
    };
  }
  
  buildSelectionMenu(target, baseConfig) {
    const selection = window.getSelection();
    const text = selection.toString().trim().substring(0, 30);
    
    return {
      ...baseConfig,
      header: {
        type: 'selection',
        text: text.length > 27 ? text + '...' : text
      }
    };
  }
  
  buildImageMenu(target, baseConfig) {
    const img = target.tagName === 'IMG' ? target : target.closest('img');
    const src = img?.src || '';
    
    return {
      ...baseConfig,
      header: {
        type: 'image',
        title: 'Image Options',
        src: src
      }
    };
  }
  
  buildLinkMenu(target, baseConfig) {
    const link = target.tagName === 'A' ? target : target.closest('a');
    const href = link?.href || '';
    const text = link?.textContent?.trim() || 'Link';
    
    return {
      ...baseConfig,
      header: {
        type: 'link',
        title: text.substring(0, 40),
        url: href
      }
    };
  }
  
  show(x, y, config) {
    this.isOpen = true;
    this.menu.innerHTML = this.renderMenu(config);
    
    // Position menu
    this.positionMenu(x, y);
    
    // Show elements
    this.backdrop.classList.add('active');
    this.menu.classList.add('active');
    
    // Focus management
    this.menu.focus();
    
    // Announce to screen readers
    this.announceMenu(config);
  }
  
  positionMenu(x, y) {
    const menuRect = this.menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let menuX = x;
    let menuY = y;
    
    // Adjust if menu goes off right edge
    if (x + menuRect.width > viewportWidth) {
      menuX = x - menuRect.width;
    }
    
    // Adjust if menu goes off bottom edge
    if (y + menuRect.height > viewportHeight) {
      menuY = y - menuRect.height;
    }
    
    // Ensure menu stays within viewport
    menuX = Math.max(10, Math.min(menuX, viewportWidth - menuRect.width - 10));
    menuY = Math.max(10, Math.min(menuY, viewportHeight - menuRect.height - 10));
    
    this.menu.style.left = `${menuX}px`;
    this.menu.style.top = `${menuY}px`;
  }
  
  renderMenu(config) {
    let html = '';
    
    // Render header if present
    if (config.header) {
      html += this.renderHeader(config.header);
    }
    
    // Render sections
    if (config.sections) {
      config.sections.forEach((section, index) => {
        html += `<div class="context-menu-section">`;
        section.items.forEach(item => {
          html += this.renderMenuItem(item);
        });
        html += `</div>`;
      });
    }
    
    return html;
  }
  
  renderHeader(header) {
    if (header.type === 'selection') {
      return `
        <div class="context-menu-selection-info">
          <div class="context-menu-selection-text">"${header.text}"</div>
        </div>
      `;
    }
    
    if (header.type === 'image' && header.src) {
      return `
        <div class="context-menu-image-preview">
          <img src="${header.src}" alt="Preview">
        </div>
      `;
    }
    
    if (header.type === 'link' && header.url) {
      const url = new URL(header.url);
      return `
        <div class="context-menu-link-info">
          <div class="context-menu-link-url">${header.url.substring(0, 50)}${header.url.length > 50 ? '...' : ''}</div>
          <div class="context-menu-link-domain">${url.hostname}</div>
        </div>
      `;
    }
    
    return '';
  }
  
  renderMenuItem(item) {
    const disabled = item.disabled ? 'disabled' : '';
    const danger = item.danger ? 'danger' : '';
    const hasSubmenu = item.submenu ? 'has-submenu' : '';
    
    return `
      <div class="context-menu-item ${disabled} ${danger} ${hasSubmenu}" 
           data-action="${item.action}"
           ${item.url ? `data-url="${item.url}"` : ''}
           role="menuitem"
           tabindex="${item.disabled ? '-1' : '0'}">
        <span class="context-menu-icon">${item.icon}</span>
        <span class="context-menu-label">${item.label}</span>
        ${item.shortcut ? `<span class="context-menu-shortcut">${item.shortcut}</span>` : ''}
      </div>
    `;
  }
  
  handleMenuClick(e) {
    const item = e.target.closest('.context-menu-item');
    if (!item || item.classList.contains('disabled')) return;
    
    const action = item.dataset.action;
    this.executeAction(action, item.dataset);
    
    // Don't close for submenu triggers
    if (!item.classList.contains('has-submenu')) {
      this.close();
    }
  }
  
  handleSubmenuClick(e) {
    const item = e.target.closest('.context-menu-item');
    if (!item || item.classList.contains('disabled')) return;
    
    const action = item.dataset.action;
    this.executeAction(action, item.dataset);
    this.close();
  }
  
  handleMenuHover(e) {
    const item = e.target.closest('.context-menu-item.has-submenu');
    if (!item) {
      this.closeSubmenu();
      return;
    }
    
    // Show submenu
    this.showSubmenu(item);
  }
  
  showSubmenu(parentItem) {
    const submenuConfig = parentItem.dataset.submenu;
    if (!submenuConfig) return;
    
    // Parse and render submenu
    this.submenu.innerHTML = this.renderMenu(JSON.parse(submenuConfig));
    
    // Position submenu
    const parentRect = parentItem.getBoundingClientRect();
    const submenuRect = this.submenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    let submenuX = parentRect.right + 4;
    let submenuY = parentRect.top;
    
    // Adjust if goes off right edge
    if (submenuX + submenuRect.width > viewportWidth) {
      submenuX = parentRect.left - submenuRect.width - 4;
    }
    
    this.submenu.style.left = `${submenuX}px`;
    this.submenu.style.top = `${submenuY}px`;
    
    this.submenu.classList.add('active');
  }
  
  closeSubmenu() {
    this.submenu.classList.remove('active');
  }
  
  executeAction(action, dataset) {
    switch (action) {
      // Navigation
      case 'navigate':
        if (dataset.url) window.location.href = dataset.url;
        break;
      case 'openLink':
        if (this.currentTarget.closest('a')) {
          window.location.href = this.currentTarget.closest('a').href;
        }
        break;
      case 'openLinkTab':
        if (this.currentTarget.closest('a')) {
          window.open(this.currentTarget.closest('a').href, '_blank');
        }
        break;
      case 'openImageTab':
        if (this.currentTarget.tagName === 'IMG' || this.currentTarget.closest('img')) {
          const img = this.currentTarget.tagName === 'IMG' ? this.currentTarget : this.currentTarget.closest('img');
          window.open(img.src, '_blank');
        }
        break;
        
      // Copy operations
      case 'copy':
        this.copySelection();
        break;
      case 'copyUrl':
        this.copyToClipboard(window.location.href);
        break;
      case 'copyLinkUrl':
        if (this.currentTarget.closest('a')) {
          this.copyToClipboard(this.currentTarget.closest('a').href);
        }
        break;
      case 'copyImageUrl':
        if (this.currentTarget.tagName === 'IMG' || this.currentTarget.closest('img')) {
          const img = this.currentTarget.tagName === 'IMG' ? this.currentTarget : this.currentTarget.closest('img');
          this.copyToClipboard(img.src);
        }
        break;
        
      // Page operations
      case 'reload':
        window.location.reload();
        break;
      case 'scrollTop':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'save':
        window.print();
        break;
        
      // Search & Translate
      case 'searchGoogle':
        const searchText = window.getSelection().toString();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`, '_blank');
        break;
      case 'translate':
        const translateText = window.getSelection().toString();
        window.open(`https://translate.google.com/?text=${encodeURIComponent(translateText)}`, '_blank');
        break;
      case 'searchImage':
        if (this.currentTarget.tagName === 'IMG' || this.currentTarget.closest('img')) {
          const img = this.currentTarget.tagName === 'IMG' ? this.currentTarget : this.currentTarget.closest('img');
          window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(img.src)}`, '_blank');
        }
        break;
        
      // Sharing
      case 'shareWhatsApp':
        const shareText = window.getSelection().toString() || document.title;
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' - ' + window.location.href)}`, '_blank');
        break;
      case 'shareImageWhatsApp':
        if (this.currentTarget.tagName === 'IMG' || this.currentTarget.closest('img')) {
          const img = this.currentTarget.tagName === 'IMG' ? this.currentTarget : this.currentTarget.closest('img');
          window.open(`https://wa.me/?text=${encodeURIComponent('Check out this image: ' + img.src)}`, '_blank');
        }
        break;
      case 'tweet':
        const tweetText = window.getSelection().toString().substring(0, 280) || document.title;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
        break;
      case 'emailSelection':
        const emailText = window.getSelection().toString();
        window.location.href = `mailto:?subject=${encodeURIComponent('Shared from BuildBridge')}&body=${encodeURIComponent(emailText + '\n\nFrom: ' + window.location.href)}`;
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: window.location.href
          });
        } else {
          this.copyToClipboard(window.location.href);
          this.showToast('Link copied to clipboard');
        }
        break;
        
      // Feature triggers
      case 'notifications':
        const toggle = document.querySelector('.notification-toggle');
        if (toggle) toggle.click();
        break;
      case 'search':
        const searchInput = document.querySelector('.portfolio-search');
        if (searchInput) {
          searchInput.scrollIntoView({ behavior: 'smooth' });
          searchInput.focus();
        }
        break;
      case 'settings':
        this.showToast('Settings feature coming soon');
        break;
        
      // Image operations
      case 'viewImage':
      case 'saveImage':
        if (this.currentTarget.tagName === 'IMG' || this.currentTarget.closest('img')) {
          const img = this.currentTarget.tagName === 'IMG' ? this.currentTarget : this.currentTarget.closest('img');
          const link = document.createElement('a');
          link.href = img.src;
          link.download = img.src.split('/').pop() || 'image';
          link.target = '_blank';
          link.click();
        }
        break;
      case 'copyImage':
        this.showToast('Image copying requires additional permissions');
        break;
        
      // Input operations
      case 'cut':
        document.execCommand('cut');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'selectAll':
        document.execCommand('selectAll');
        break;
      case 'delete':
        document.execCommand('delete');
        break;
      case 'bookmark':
        this.showToast('Press Ctrl+D to bookmark this page');
        break;
        
      default:
        console.log('Action not implemented:', action);
    }
  }
  
  copySelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      document.execCommand('copy');
      this.showToast('Copied to clipboard');
    }
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard');
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('Copied to clipboard');
    }
  }
  
  showToast(message) {
    // Use notification center if available
    if (window.notificationCenter && window.notificationCenter.showToast) {
      window.notificationCenter.showToast({
        type: 'success',
        title: message,
        message: '',
        duration: 2000
      });
    } else {
      // Simple fallback toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 15, 16, 0.98);
        color: #F5F7FA;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        z-index: 100001;
        animation: fadeInUp 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  }
  
  close() {
    this.isOpen = false;
    this.backdrop.classList.remove('active');
    this.menu.classList.remove('active');
    this.closeSubmenu();
    this.currentTarget = null;
  }
  
  announceMenu(config) {
    // Create live region for screen readers
    let announcement = 'Context menu opened.';
    if (config.header && config.header.text) {
      announcement += ` Selected: ${config.header.text}`;
    }
    
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = 'position:absolute;left:-10000px;';
    liveRegion.textContent = announcement;
    document.body.appendChild(liveRegion);
    setTimeout(() => liveRegion.remove(), 1000);
  }
  
  registerKeyboardShortcuts() {
    // Alt+H for home
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = 'index.html';
      }
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const toggle = document.querySelector('.notification-toggle');
        if (toggle) toggle.click();
      }
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.smartContextMenu = new SmartContextMenu();
});

// CSS for toast animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);
