/**
 * Smart Print Button - v137.0
 * Professional print functionality with preview options
 */

class SmartPrintButton {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'bottom-left',
      showTooltip: options.showTooltip !== false,
      ...options
    };

    this.button = null;
    this.init();
  }

  init() {
    this.createButton();
    this.bindEvents();
  }

  createButton() {
    this.button = document.createElement('button');
    this.button.className = 'smart-print-btn';
    this.button.setAttribute('aria-label', 'Print this page');
    this.button.setAttribute('title', 'Print (Ctrl+P)');
    this.button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      ${this.options.showTooltip ? '<span class="smart-print-tooltip">Print Page</span>' : ''}
    `;

    document.body.appendChild(this.button);
  }

  bindEvents() {
    this.button.addEventListener('click', () => {
      this.print();
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        // Let default browser print handle it
      }
    });
  }

  print() {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('beforeprint'));
    
    // Small delay to allow any custom handlers
    setTimeout(() => {
      window.print();
      window.dispatchEvent(new CustomEvent('afterprint'));
    }, 100);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartPrint = new SmartPrintButton();
  });
} else {
  window.smartPrint = new SmartPrintButton();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPrintButton;
}
