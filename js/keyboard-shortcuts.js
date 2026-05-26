/**
 * Keyboard Shortcuts Help Panel
 * Display and manage keyboard shortcuts
 */

class KeyboardShortcuts {
  constructor(options = {}) {
    this.options = {
      showHint: options.showHint !== false,
      hintDelay: options.hintDelay || 10000,
      ...options
    };
    
    this.shortcuts = [
      {
        category: 'Navigation',
        icon: '🧭',
        items: [
          { keys: ['?'], description: 'Show keyboard shortcuts', ctrl: false },
          { keys: ['Esc'], description: 'Close dialogs / menus', ctrl: false },
          { keys: ['Tab'], description: 'Navigate between elements', ctrl: false },
          { keys: ['Enter'], description: 'Activate selected element', ctrl: false },
        ]
      },
      {
        category: 'Quick Actions',
        icon: '⚡',
        items: [
          { keys: ['K'], description: 'Open command palette', ctrl: true },
          { keys: ['/'], description: 'Focus search', ctrl: false },
          { keys: ['C'], description: 'Open contact widget', ctrl: true },
          { keys: ['W'], description: 'Open WhatsApp chat', ctrl: true },
        ]
      },
      {
        category: 'Page Navigation',
        icon: '📄',
        items: [
          { keys: ['Home'], description: 'Scroll to top', ctrl: false },
          { keys: ['End'], description: 'Scroll to bottom', ctrl: false },
          { keys: ['←'], description: 'Previous testimonial', ctrl: false },
          { keys: ['→'], description: 'Next testimonial', ctrl: false },
        ]
      },
      {
        category: 'Accessibility',
        icon: '♿',
        items: [
          { keys: ['Skip'], description: 'Skip to main content', ctrl: false, special: true },
          { keys: ['Space'], description: 'Scroll down page', ctrl: false },
          { keys: ['+'], description: 'Zoom in', ctrl: true },
          { keys: ['−'], description: 'Zoom out', ctrl: true },
        ]
      }
    ];
    
    this.modal = null;
    this.isVisible = false;
    this.hintShown = sessionStorage.getItem('shortcutsHintShown');
    
    this.init();
  }
  
  init() {
    this.bindKeys();
    this.showHintIfNeeded();
  }
  
  bindKeys() {
    document.addEventListener('keydown', (e) => {
      // Show shortcuts on '?' key (not in input fields)
      if (e.key === '?' && !this.isInputField(e.target)) {
        e.preventDefault();
        this.toggle();
      }
      
      // Close on Escape
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
      
      // Command palette on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      
      // Contact widget on Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && window.quickContact) {
        e.preventDefault();
        window.quickContact.open();
      }
      
      // WhatsApp on Ctrl/Cmd + W
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        window.open('https://wa.me/+27661200064', '_blank');
      }
      
      // Home key - scroll to top
      if (e.key === 'Home' && !this.isInputField(e.target)) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // End key - scroll to bottom
      if (e.key === 'End' && !this.isInputField(e.target)) {
        e.preventDefault();
        window.scrollTo({ 
          top: document.documentElement.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    });
  }
  
  isInputField(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || 
           element.contentEditable === 'true';
  }
  
  createModal() {
    if (this.modal) return;
    
    this.modal = document.createElement('div');
    this.modal.className = 'keyboard-shortcuts-modal';
    this.modal.innerHTML = `
      <div class="keyboard-shortcuts-backdrop"></div>
      <div class="keyboard-shortcuts-content">
        <div class="keyboard-shortcuts-header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <button class="keyboard-shortcuts-close">&times;</button>
        </div>
        <div class="keyboard-shortcuts-body">
          ${this.renderShortcuts()}
          <div class="shortcuts-footer">
            <p>Press <kbd class="key">?</kbd> anytime to show this panel</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    
    // Close handlers
    this.modal.querySelector('.keyboard-shortcuts-backdrop').addEventListener('click', () => this.hide());
    this.modal.querySelector('.keyboard-shortcuts-close').addEventListener('click', () => this.hide());
  }
  
  renderShortcuts() {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? '⌘' : 'Ctrl';
    const altKey = isMac ? '⌥' : 'Alt';
    
    return this.shortcuts.map(section => `
      <div class="shortcuts-section">
        <h4><span>${section.icon}</span> ${section.category}</h4>
        <div class="shortcuts-list">
          ${section.items.map(item => `
            <div class="shortcut-item">
              <span class="shortcut-description">${item.description}</span>
              <span class="shortcut-keys">
                ${item.ctrl ? `<kbd class="key modifier">${modifierKey}</kbd>` : ''}
                ${item.keys.map(key => `<kbd class="key">${key}</kbd>`).join('')}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
  
  toggle() {
    this.isVisible ? this.hide() : this.show();
  }
  
  show() {
    this.createModal();
    this.modal.classList.add('active');
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    
    // Track view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_shortcuts', {
        'event_category': 'engagement',
        'event_label': 'keyboard_shortcuts'
      });
    }
  }
  
  hide() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.isVisible = false;
    document.body.style.overflow = '';
    
    // Remove after animation
    setTimeout(() => {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
    }, 300);
  }
  
  showHintIfNeeded() {
    if (!this.options.showHint || this.hintShown) return;
    
    setTimeout(() => {
      // Only show if user hasn't interacted with shortcuts
      if (sessionStorage.getItem('shortcutsHintShown')) return;
      
      const hint = document.createElement('div');
      hint.className = 'keyboard-shortcuts-hint';
      hint.innerHTML = `
        <span>Tip: Press</span>
        <kbd class="key">?</kbd>
        <span>for keyboard shortcuts</span>
        <button class="close-hint">&times;</button>
      `;
      
      document.body.appendChild(hint);
      
      // Show hint
      requestAnimationFrame(() => hint.classList.add('show'));
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 400);
      }, 8000);
      
      // Close button
      hint.querySelector('.close-hint').addEventListener('click', () => {
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 400);
      });
      
      // Mark as shown
      sessionStorage.setItem('shortcutsHintShown', 'true');
    }, this.options.hintDelay);
  }
  
  openCommandPalette() {
    // Trigger existing command palette if available
    if (window.CommandPalette) {
      window.CommandPalette.open();
    } else if (window.commandPalette) {
      window.commandPalette.open();
    } else {
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('openCommandPalette'));
    }
  }
}

/**
 * Additional keyboard navigation enhancements
 */
class KeyboardNavigator {
  constructor() {
    this.init();
  }
  
  init() {
    // Enhance focus states
    this.addFocusStyles();
    
    // Tab navigation hints
    this.addTabNavigation();
    
    // Quick scroll shortcuts
    this.addScrollShortcuts();
  }
  
  addFocusStyles() {
    // Add focus-visible class handling
    document.addEventListener('mousedown', () => {
      document.body.classList.add('using-mouse');
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('using-mouse');
      }
    });
  }
  
  addTabNavigation() {
    // Highlight current section when tabbing
    const sections = document.querySelectorAll('section[id]');
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        setTimeout(() => {
          const focused = document.activeElement;
          const section = focused.closest('section');
          
          if (section) {
            section.classList.add('keyboard-focused');
            setTimeout(() => section.classList.remove('keyboard-focused'), 1000);
          }
        }, 0);
      }
    });
  }
  
  addScrollShortcuts() {
    // Space to scroll down (standard)
    // Page Up/Down for faster scrolling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PageDown' && !this.isInputField(e.target)) {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }
      
      if (e.key === 'PageUp' && !this.isInputField(e.target)) {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      }
    });
  }
  
  isInputField(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || 
           element.contentEditable === 'true';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.keyboardShortcuts = new KeyboardShortcuts({
    showHint: true,
    hintDelay: 15000 // Show after 15 seconds
  });
  
  new KeyboardNavigator();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeyboardShortcuts, KeyboardNavigator };
}
