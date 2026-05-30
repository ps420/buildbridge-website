/**
 * v115.0: Smart Clipboard Feedback System
 * Fortune 500 Professional Feature
 * Visual feedback and smart copy functionality
 */

class SmartClipboardFeedback {
  constructor(options = {}) {
    this.options = {
      showToast: options.showToast !== false,
      showTooltip: options.showTooltip !== false,
      enableSelectionCopy: options.enableSelectionCopy !== false,
      addCopyButtons: options.addCopyButtons !== false,
      toastDuration: options.toastDuration || 2500,
      ...options
    };
    
    this.toastElement = null;
    this.tooltipElement = null;
    this.selectionButton = null;
    this.hideToastTimeout = null;
    this.hideTooltipTimeout = null;
    this.lastSelection = '';
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.addCopyButtonsToElements();
  }
  
  createElements() {
    // Toast notification
    if (this.options.showToast) {
      this.toastElement = document.createElement('div');
      this.toastElement.className = 'copy-toast';
      this.toastElement.innerHTML = `
        <div class="copy-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" class="copy-feedback-check"/>
          </svg>
        </div>
        <div class="copy-toast-content">
          <span class="copy-toast-title">Copied to clipboard</span>
          <span class="copy-toast-text">Ready to paste</span>
        </div>
      `;
      document.body.appendChild(this.toastElement);
    }
    
    // Tooltip feedback
    if (this.options.showTooltip) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.className = 'copy-feedback';
      this.tooltipElement.innerHTML = `
        <span class="copy-feedback-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" class="copy-feedback-check"/>
          </svg>
        </span>
        <span class="copy-feedback-text">Copied!</span>
      `;
      document.body.appendChild(this.tooltipElement);
    }
    
    // Selection copy button
    if (this.options.enableSelectionCopy && !window.matchMedia('(pointer: coarse)').matches) {
      this.selectionButton = document.createElement('button');
      this.selectionButton.className = 'selection-copy-btn';
      this.selectionButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
        <span class="copy-shortcut-hint">Ctrl+C</span>
      `;
      this.selectionButton.addEventListener('click', () => this.copySelection());
      document.body.appendChild(this.selectionButton);
    }
  }
  
  bindEvents() {
    // Track text selection
    if (this.options.enableSelectionCopy) {
      document.addEventListener('selectionchange', () => {
        this.handleSelectionChange();
      });
      
      // Hide selection button on scroll
      window.addEventListener('scroll', () => {
        this.hideSelectionButton();
      }, { passive: true });
      
      // Hide on click outside
      document.addEventListener('mousedown', (e) => {
        if (!this.selectionButton?.contains(e.target)) {
          this.hideSelectionButton();
        }
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Let default copy happen, then show feedback
        setTimeout(() => this.showToast(), 100);
      }
    });
    
    // Copy buttons click handler
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.smart-copy-btn');
      if (copyBtn) {
        e.preventDefault();
        this.handleCopyButtonClick(copyBtn);
      }
    });
  }
  
  addCopyButtonsToElements() {
    if (!this.options.addCopyButtons) return;
    
    // Add to code blocks
    document.querySelectorAll('pre, code').forEach(el => {
      if (!el.querySelector('.smart-copy-btn') && !el.closest('.no-copy')) {
        el.classList.add('copy-enabled');
        const btn = document.createElement('button');
        btn.className = 'smart-copy-btn';
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        `;
        btn.setAttribute('aria-label', 'Copy to clipboard');
        
        // Position relative if not already
        if (getComputedStyle(el).position === 'static') {
          el.style.position = 'relative';
        }
        
        el.appendChild(btn);
      }
    });
    
    // Add to specific data-copy elements
    document.querySelectorAll('[data-copy]').forEach(el => {
      if (!el.querySelector('.smart-copy-btn')) {
        el.classList.add('copy-enabled');
        el.style.position = 'relative';
        const btn = document.createElement('button');
        btn.className = 'smart-copy-btn';
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        `;
        btn.setAttribute('data-copy-text', el.dataset.copy);
        el.appendChild(btn);
      }
    });
  }
  
  handleSelectionChange() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text !== this.lastSelection) {
      this.lastSelection = text;
      this.showSelectionButton(selection);
    } else if (!text) {
      this.hideSelectionButton();
    }
  }
  
  showSelectionButton(selection) {
    if (!this.selectionButton) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Position above selection
    const top = rect.top + window.scrollY - 50;
    const left = rect.left + window.scrollX + (rect.width / 2);
    
    this.selectionButton.style.top = `${Math.max(10, top)}px`;
    this.selectionButton.style.left = `${left}px`;
    this.selectionButton.style.transform = 'translateX(-50%)';
    this.selectionButton.classList.add('visible');
  }
  
  hideSelectionButton() {
    this.selectionButton?.classList.remove('visible');
    this.lastSelection = '';
  }
  
  copySelection() {
    const selection = window.getSelection().toString();
    if (selection) {
      this.copyToClipboard(selection);
      this.hideSelectionButton();
      window.getSelection().removeAllRanges();
    }
  }
  
  handleCopyButtonClick(button) {
    const container = button.closest('.copy-enabled, pre, code, [data-copy]');
    let text;
    
    // Get text from data attribute
    if (button.dataset.copyText) {
      text = button.dataset.copyText;
    } else if (container?.dataset.copy) {
      text = container.dataset.copy;
    } else {
      // Get text from element
      const clone = container.cloneNode(true);
      clone.querySelectorAll('.smart-copy-btn').forEach(btn => btn.remove());
      text = clone.textContent.trim();
    }
    
    if (text) {
      this.copyToClipboard(text);
      
      // Visual feedback on button
      const originalHTML = button.innerHTML;
      button.classList.add('copied');
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      
      // Add flash effect to container
      container?.classList.add('copy-flash');
      
      // Add ripple effect
      this.createRipple(button);
      
      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHTML;
        container?.classList.remove('copy-flash');
      }, 2000);
    }
  }
  
  createRipple(element) {
    const ripple = document.createElement('span');
    ripple.className = 'copy-ripple';
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast();
      this.showTooltip();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('clipboardCopy', {
        detail: { text: text.substring(0, 100) } // Truncate for privacy
      }));
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      this.fallbackCopy(text);
    }
  }
  
  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      this.showToast();
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textarea);
  }
  
  showToast() {
    if (!this.toastElement) return;
    
    clearTimeout(this.hideToastTimeout);
    this.toastElement.classList.add('visible');
    
    // Animate checkmark
    const check = this.toastElement.querySelector('.copy-feedback-check');
    if (check) {
      check.style.animation = 'none';
      check.offsetHeight; // Trigger reflow
      check.style.animation = 'checkmark-draw 0.4s ease forwards';
    }
    
    this.hideToastTimeout = setTimeout(() => {
      this.toastElement.classList.remove('visible');
    }, this.options.toastDuration);
  }
  
  showTooltip() {
    if (!this.tooltipElement) return;
    
    clearTimeout(this.hideTooltipTimeout);
    
    // Position near cursor or selection
    const selection = window.getSelection();
    let rect;
    
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      rect = range.getBoundingClientRect();
    } else {
      rect = { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    }
    
    this.tooltipElement.style.left = `${rect.left + window.scrollX}px`;
    this.tooltipElement.style.top = `${rect.top + window.scrollY - 40}px`;
    this.tooltipElement.classList.add('visible');
    
    this.hideTooltipTimeout = setTimeout(() => {
      this.tooltipElement.classList.remove('visible');
    }, 1500);
  }
  
  destroy() {
    clearTimeout(this.hideToastTimeout);
    clearTimeout(this.hideTooltipTimeout);
    this.toastElement?.remove();
    this.tooltipElement?.remove();
    this.selectionButton?.remove();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartClipboard = new SmartClipboardFeedback();
  });
} else {
  window.smartClipboard = new SmartClipboardFeedback();
}
