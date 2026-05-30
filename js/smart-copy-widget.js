/**
 * Smart Copy Widget - v137.1
 * One-click contact information copying with visual feedback
 * Fortune 500 Professional User Experience
 */

class SmartCopyWidget {
  constructor(options = {}) {
    this.items = options.items || [
      { type: 'phone', value: '+27661200064', label: 'Copy Phone', icon: 'phone' },
      { type: 'email', value: 'info@buildbridge.co.za', label: 'Copy Email', icon: 'email' },
      { type: 'address', value: 'Cape Town, South Africa', label: 'Copy Address', icon: 'location' }
    ];
    this.position = options.position || 'bottom-left';
    this.showOnPages = options.showOnPages || ['all'];
    this.animationDelay = options.animationDelay || 2000;
    
    this.widget = null;
    this.isVisible = false;
    
    this.init();
  }

  init() {
    // Check if we should show on this page
    if (!this.shouldShowOnPage()) return;
    
    // Delay showing to not distract on initial load
    setTimeout(() => {
      this.createWidget();
      this.bindEvents();
      this.observeVisibility();
    }, this.animationDelay);
  }

  shouldShowOnPage() {
    if (this.showOnPages.includes('all')) return true;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return this.showOnPages.some(page => 
      currentPage === page || 
      currentPage === page.replace('.html', '') ||
      (page === 'index' && (currentPage === '' || currentPage === 'index.html'))
    );
  }

  createWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'smart-copy-widget';
    this.widget.setAttribute('aria-label', 'Quick copy contact information');
    this.widget.setAttribute('role', 'complementary');

    this.items.forEach((item, index) => {
      const button = this.createCopyButton(item, index);
      this.widget.appendChild(button);
    });

    document.body.appendChild(this.widget);
    this.isVisible = true;
  }

  createCopyButton(item, index) {
    const button = document.createElement('button');
    button.className = 'smart-copy-item';
    button.setAttribute('data-copy-type', item.type);
    button.setAttribute('data-copy-value', item.value);
    button.setAttribute('aria-label', `Copy ${item.type}: ${item.value}`);
    button.style.animationDelay = `${index * 0.1}s`;

    const icon = document.createElement('span');
    icon.className = 'copy-icon';
    icon.innerHTML = this.getIconSvg(item.icon);

    const text = document.createElement('span');
    text.className = 'copy-text';
    text.textContent = item.label;

    const feedback = document.createElement('span');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'Copied!';
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('role', 'status');

    button.appendChild(icon);
    button.appendChild(text);
    button.appendChild(feedback);

    return button;
  }

  getIconSvg(iconName) {
    const icons = {
      phone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`,
      email: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`,
      location: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
      link: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
      check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`
    };
    return icons[iconName] || icons.link;
  }

  bindEvents() {
    if (!this.widget) return;

    this.widget.addEventListener('click', (e) => {
      const button = e.target.closest('.smart-copy-item');
      if (button) {
        this.handleCopy(button);
      }
    });

    // Keyboard accessibility
    this.widget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const button = e.target.closest('.smart-copy-item');
        if (button) {
          e.preventDefault();
          this.handleCopy(button);
        }
      }
    });
  }

  async handleCopy(button) {
    const value = button.getAttribute('data-copy-value');
    const feedback = button.querySelector('.copy-feedback');

    try {
      await navigator.clipboard.writeText(value);
      this.showSuccess(button, feedback);
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopy(value, button, feedback);
    }
  }

  showSuccess(button, feedback) {
    button.classList.add('copied');
    feedback.classList.add('show');
    feedback.textContent = 'Copied!';
    feedback.classList.remove('error');

    // Announce to screen readers
    this.announceToScreenReader(`Copied to clipboard: ${button.getAttribute('data-copy-value')}`);

    setTimeout(() => {
      feedback.classList.remove('show');
      button.classList.remove('copied');
    }, 2000);
  }

  showError(button, feedback) {
    button.classList.add('copied');
    feedback.classList.add('show', 'error');
    feedback.textContent = 'Failed to copy';

    setTimeout(() => {
      feedback.classList.remove('show', 'error');
      button.classList.remove('copied');
    }, 2000);
  }

  fallbackCopy(text, button, feedback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        this.showSuccess(button, feedback);
      } else {
        this.showError(button, feedback);
      }
    } catch (err) {
      document.body.removeChild(textArea);
      this.showError(button, feedback);
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  observeVisibility() {
    // Hide when scrolling down, show when scrolling up
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 200) {
            this.hide();
          } else {
            this.show();
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  hide() {
    if (this.widget && this.isVisible) {
      this.widget.style.opacity = '0';
      this.widget.style.transform = 'translateX(-20px)';
      this.widget.style.pointerEvents = 'none';
      this.isVisible = false;
    }
  }

  show() {
    if (this.widget && !this.isVisible) {
      this.widget.style.opacity = '1';
      this.widget.style.transform = 'translateX(0)';
      this.widget.style.pointerEvents = 'auto';
      this.isVisible = true;
    }
  }

  // Static method for inline copy buttons
  static initInlineCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(el => {
      el.addEventListener('click', async () => {
        const value = el.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(value);
          el.classList.add('copied');
          setTimeout(() => el.classList.remove('copied'), 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartCopyWidget = new SmartCopyWidget();
    SmartCopyWidget.initInlineCopyButtons();
  });
} else {
  window.smartCopyWidget = new SmartCopyWidget();
  SmartCopyWidget.initInlineCopyButtons();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartCopyWidget;
}
