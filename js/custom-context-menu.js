/**
 * Custom Context Menu System v56.0
 * Fortune 500 Right-Click Experience
 */

class CustomContextMenu {
  constructor() {
    this.menu = null;
    this.backdrop = null;
    this.isEnabled = true;
    this.currentTarget = null;
    this.submenuTimer = null;
    this.init();
  }

  init() {
    this.createMenuElement();
    this.createBackdrop();
    this.setupEventListeners();
    this.loadSettings();
  }

  createMenuElement() {
    this.menu = document.createElement('div');
    this.menu.className = 'custom-context-menu';
    this.menu.setAttribute('role', 'menu');
    document.body.appendChild(this.menu);
  }

  createBackdrop() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'context-menu-backdrop';
    document.body.appendChild(this.backdrop);

    this.backdrop.addEventListener('click', () => this.hide());
  }

  setupEventListeners() {
    // Main context menu trigger
    document.addEventListener('contextmenu', (e) => {
      if (!this.isEnabled) return;
      
      // Don't show on form elements
      if (e.target.matches('input, textarea, select, [contenteditable]')) {
        return;
      }

      e.preventDefault();
      this.currentTarget = e.target;
      this.show(e.clientX, e.clientY, e.target);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });

    // Close on scroll
    document.addEventListener('scroll', () => this.hide(), { passive: true });

    // Close on resize
    window.addEventListener('resize', () => this.hide());
  }

  show(x, y, target) {
    // Resume audio context if needed
    if (window.audioFeedback && window.audioFeedback.audioContext?.state === 'suspended') {
      window.audioFeedback.audioContext.resume();
    }

    // Build menu based on target
    const menuData = this.buildMenuForTarget(target);
    this.renderMenu(menuData);

    // Position menu
    this.positionMenu(x, y);

    // Show
    this.menu.classList.add('visible', 'animate-in');
    this.backdrop.classList.add('visible');

    // Play sound
    if (window.audioFeedback) {
      window.audioFeedback.play('click');
    }

    // Focus management
    this.setupMenuFocus();
  }

  hide() {
    this.menu.classList.remove('visible', 'animate-in');
    this.backdrop.classList.remove('visible');
    this.currentTarget = null;

    // Clear submenus
    this.menu.querySelectorAll('.submenu').forEach(sub => sub.remove());
  }

  buildMenuForTarget(target) {
    const selection = window.getSelection().toString().trim();
    const isLink = target.closest('a');
    const isImage = target.tagName === 'IMG';
    const isInput = target.matches('input, textarea');

    let sections = [];

    // Selection section
    if (selection) {
      sections.push({
        type: 'selection',
        selection: selection
      });
    }

    // Image section
    if (isImage) {
      sections.push({
        type: 'image',
        src: target.src,
        alt: target.alt
      });
    }

    // Link section
    if (isLink) {
      sections.push({
        type: 'link',
        url: isLink.href,
        text: isLink.textContent.trim()
      });
    }

    // Navigation section
    sections.push({
      type: 'nav',
      items: [
        { icon: '🏠', label: 'Home', action: () => window.location.href = 'index.html', shortcut: 'Alt+1' },
        { icon: 'ℹ️', label: 'About', action: () => window.location.href = 'about.html' },
        { icon: '🛠️', label: 'Services', action: () => window.location.href = 'services.html' },
        { icon: '📁', label: 'Projects', action: () => window.location.href = 'projects.html' },
        { icon: '📞', label: 'Contact', action: () => window.location.href = 'contact.html' }
      ]
    });

    // Actions section
    const actionItems = [];

    if (selection) {
      actionItems.push(
        { icon: '📋', label: 'Copy', action: () => this.copyToClipboard(selection), shortcut: 'Ctrl+C' },
        { icon: '🔍', label: 'Search Google', action: () => window.open(`https://google.com/search?q=${encodeURIComponent(selection)}`, '_blank') }
      );
    }

    actionItems.push(
      { icon: '🔖', label: 'Bookmark Page', action: () => this.showBookmarkDialog() },
      { icon: '🔗', label: 'Copy Page Link', action: () => this.copyToClipboard(window.location.href), shortcut: 'Alt+C' }
    );

    if (isLink) {
      actionItems.push(
        { icon: '↗️', label: 'Open in New Tab', action: () => window.open(isLink.href, '_blank') },
        { icon: '🔗', label: 'Copy Link', action: () => this.copyToClipboard(isLink.href) }
      );
    }

    if (isImage) {
      actionItems.push(
        { icon: '💾', label: 'Save Image', action: () => this.downloadImage(target.src) },
        { icon: '🔗', label: 'Copy Image URL', action: () => this.copyToClipboard(target.src) },
        { icon: '🔍', label: 'View Image', action: () => window.open(target.src, '_blank') }
      );
    }

    sections.push({
      type: 'actions',
      items: actionItems
    });

    // Tools section
    sections.push({
      type: 'tools',
      items: [
        { icon: '📖', label: 'Reading Mode', action: () => this.toggleReadingMode() },
        { icon: '🔊', label: 'Toggle Audio', action: () => this.toggleAudioFeedback() },
        { icon: '🎨', label: 'Inspect Element', action: () => this.inspectElement(target) },
        { icon: '📊', label: 'Page Info', action: () => this.showPageInfo() }
      ]
    });

    // System section
    sections.push({
      type: 'system',
      items: [
        { icon: '↩️', label: 'Back', action: () => history.back(), shortcut: 'Alt+←' },
        { icon: '↪️', label: 'Forward', action: () => history.forward(), shortcut: 'Alt+→' },
        { icon: '🔄', label: 'Reload', action: () => location.reload(), shortcut: 'Ctrl+R' }
      ]
    });

    return sections;
  }

  renderMenu(sections) {
    this.menu.innerHTML = '';

    sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'context-menu-section';

      switch (section.type) {
        case 'selection':
          sectionEl.appendChild(this.createSelectionInfo(section.selection));
          break;

        case 'image':
          sectionEl.appendChild(this.createImagePreview(section.src));
          break;

        case 'link':
          sectionEl.appendChild(this.createLinkInfo(section.url));
          break;

        case 'nav':
        case 'actions':
        case 'tools':
        case 'system':
          section.items.forEach(item => {
            sectionEl.appendChild(this.createMenuItem(item));
          });
          break;
      }

      this.menu.appendChild(sectionEl);
    });
  }

  createSelectionInfo(text) {
    const info = document.createElement('div');
    info.className = 'context-selection-info';
    info.innerHTML = `
      <div class="context-selection-label">Selected Text</div>
      <div class="context-selection-text">${this.escapeHtml(text)}</div>
    `;
    return info;
  }

  createImagePreview(src) {
    const preview = document.createElement('div');
    preview.className = 'context-menu-image-preview';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    preview.appendChild(img);
    return preview;
  }

  createLinkInfo(url) {
    const info = document.createElement('div');
    info.className = 'context-menu-link-info';
    info.innerHTML = `<div class="context-menu-link-url">${this.escapeHtml(url)}</div>`;
    return info;
  }

  createMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('tabindex', '-1');

    if (item.danger) menuItem.classList.add('danger');
    if (item.accent) menuItem.classList.add('accent');

    menuItem.innerHTML = `
      <span class="context-menu-icon">${item.icon}</span>
      <span class="context-menu-label">${item.label}</span>
      ${item.shortcut ? `<span class="context-menu-shortcut">${item.shortcut}</span>` : ''}
      ${item.submenu ? '<span class="context-menu-arrow">▶</span>' : ''}
    `;

    menuItem.addEventListener('click', () => {
      item.action();
      this.hide();
    });

    menuItem.addEventListener('mouseenter', () => {
      menuItem.focus();
      if (item.submenu) {
        this.showSubmenu(menuItem, item.submenu);
      }
    });

    return menuItem;
  }

  positionMenu(x, y) {
    const menuRect = this.menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = x;
    let top = y;

    // Adjust if menu goes off screen
    if (left + menuRect.width > windowWidth) {
      left = windowWidth - menuRect.width - 10;
    }

    if (top + menuRect.height > windowHeight) {
      top = windowHeight - menuRect.height - 10;
    }

    this.menu.style.left = `${left}px`;
    this.menu.style.top = `${top}px`;
  }

  setupMenuFocus() {
    const items = this.menu.querySelectorAll('.context-menu-item:not(.disabled)');
    if (items.length > 0) {
      items[0].setAttribute('tabindex', '0');
      items[0].focus();
    }

    this.menu.addEventListener('keydown', (e) => {
      const current = document.activeElement;
      const items = Array.from(this.menu.querySelectorAll('.context-menu-item:not(.disabled)'));
      const currentIndex = items.indexOf(current);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
          break;

        case 'Enter':
          e.preventDefault();
          current.click();
          break;

        case 'Home':
          e.preventDefault();
          items[0].focus();
          break;

        case 'End':
          e.preventDefault();
          items[items.length - 1].focus();
          break;
      }
    });
  }

  // Actions
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard');
      if (window.audioFeedback) window.audioFeedback.play('success');
    } catch (err) {
      this.showToast('Failed to copy');
      if (window.audioFeedback) window.audioFeedback.play('error');
    }
  }

  downloadImage(src) {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'image';
    link.click();
    this.showToast('Downloading image...');
  }

  showBookmarkDialog() {
    if (confirm('Add this page to bookmarks?\n\nUse Ctrl+D for browser bookmarks')) {
      this.showToast('Use Ctrl+D to bookmark this page');
    }
  }

  toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    this.showToast(document.body.classList.contains('reading-mode') ? 'Reading mode enabled' : 'Reading mode disabled');
  }

  toggleAudioFeedback() {
    if (window.audioFeedback) {
      window.audioFeedback.toggleAudio();
    }
  }

  inspectElement(target) {
    this.showToast('Right-click and select "Inspect" for developer tools');
  }

  showPageInfo() {
    const info = `
      Title: ${document.title}
      URL: ${window.location.href}
      Domain: ${window.location.hostname}
      Last Modified: ${new Date(document.lastModified).toLocaleString()}
    `;
    alert(info);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'context-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(15, 15, 16, 0.95);
      color: #F5F7FA;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      z-index: 100001;
      opacity: 0;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Toggle context menu on/off
  toggle() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('customContextMenuEnabled', this.isEnabled);
    this.showToast(this.isEnabled ? 'Custom context menu enabled' : 'Default context menu restored');
    return this.isEnabled;
  }

  loadSettings() {
    const saved = localStorage.getItem('customContextMenuEnabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }
}

// Initialize
const contextMenu = new CustomContextMenu();

// Export
window.CustomContextMenu = CustomContextMenu;
window.contextMenu = contextMenu;
