/**
 * v116.0: Text Selection Toolbar
 * Fortune 500 Professional Feature
 * Contextual toolbar for text selection actions
 */

class TextSelectionToolbar {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'above', // above, below
      buttons: options.buttons || ['copy', 'highlight', 'share', 'search'],
      showCharCount: options.showCharCount !== false,
      maxSelectionLength: options.maxSelectionLength || 1000,
      ...options
    };
    
    this.toolbar = null;
    this.currentSelection = '';
    this.selectionRange = null;
    this.hideTimeout = null;
    this.highlightedRanges = [];
    
    this.init();
  }
  
  init() {
    // Skip on touch devices (native handles this better)
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.createToolbar();
    this.bindEvents();
  }
  
  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'text-selection-toolbar';
    this.toolbar.setAttribute('role', 'toolbar');
    this.toolbar.setAttribute('aria-label', 'Text selection actions');
    
    const buttonsHTML = this.options.buttons.map(btn => this.getButtonHTML(btn)).join('');
    
    this.toolbar.innerHTML = buttonsHTML;
    document.body.appendChild(this.toolbar);
    
    // Bind button clicks
    this.toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleButtonClick(e, btn.dataset.action));
    });
  }
  
  getButtonHTML(type) {
    const buttons = {
      copy: `
        <button class="toolbar-btn" data-action="copy" title="Copy" aria-label="Copy selection">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      `,
      highlight: `
        <div class="toolbar-btn toolbar-highlight" title="Highlight">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 11-6 6v3h9l3-3"/>
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
            <path d="M14 4l2.6 2.6"/>
          </svg>
          <div class="highlight-colors">
            <span class="highlight-color yellow" data-color="yellow" title="Yellow highlight"></span>
            <span class="highlight-color green" data-color="green" title="Green highlight"></span>
            <span class="highlight-color blue" data-color="blue" title="Blue highlight"></span>
            <span class="highlight-color pink" data-color="pink" title="Pink highlight"></span>
          </div>
        </div>
      `,
      share: `
        <div class="toolbar-btn toolbar-share" title="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <div class="toolbar-share-menu">
            <div class="share-option" data-share="twitter">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </div>
            <div class="share-option" data-share="linkedin">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Share on LinkedIn
            </div>
            <div class="share-option" data-share="email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Share via Email
            </div>
            <div class="share-option" data-share="native">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              More options...
            </div>
          </div>
        </div>
      `,
      search: `
        <button class="toolbar-btn" data-action="search" title="Search on Google" aria-label="Search selection on Google">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      `,
      quote: `
        <button class="toolbar-btn" data-action="quote" title="Create quote" aria-label="Create quote from selection">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          </svg>
        </button>
      `,
      tweet: `
        <button class="toolbar-btn with-text" data-action="tweet" title="Tweet this" aria-label="Tweet selected text">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg>
          Tweet
        </button>
      `
    };
    
    // Add divider before char count
    const charCountHTML = this.options.showCharCount ? `
      <div class="toolbar-char-count">
        <span class="char-count-value">0</span> chars
      </div>
    ` : '';
    
    const divider = this.options.showCharCount ? '<div class="toolbar-divider"></div>' : '';
    
    return buttonsHTML.charCountHTML ? buttonsHTML + divider + charCountHTML : buttonsHTML;
  }
  
  bindEvents() {
    // Selection change
    document.addEventListener('selectionchange', () => {
      this.debouncedUpdateToolbar();
    });
    
    // Hide on scroll
    window.addEventListener('scroll', () => {
      this.hide();
    }, { passive: true });
    
    // Hide on click outside
    document.addEventListener('mousedown', (e) => {
      if (!this.toolbar.contains(e.target)) {
        this.hide();
      }
    });
    
    // Highlight color selection
    this.toolbar.querySelectorAll('.highlight-color').forEach(color => {
      color.addEventListener('click', (e) => {
        e.stopPropagation();
        this.highlightSelection(color.dataset.color);
      });
    });
    
    // Share option selection
    this.toolbar.querySelectorAll('.share-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shareSelection(option.dataset.share);
      });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
        window.getSelection().removeAllRanges();
      }
    });
  }
  
  debouncedUpdateToolbar() {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => this.updateToolbar(), 100);
  }
  
  updateToolbar() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (!text || text.length > this.options.maxSelectionLength) {
      this.hide();
      return;
    }
    
    // Save selection data
    this.currentSelection = text;
    if (selection.rangeCount > 0) {
      this.selectionRange = selection.getRangeAt(0).cloneRange();
    }
    
    // Update character count
    const charCountEl = this.toolbar.querySelector('.char-count-value');
    if (charCountEl) {
      charCountEl.textContent = text.length;
    }
    
    // Position toolbar
    this.positionToolbar(selection);
    
    // Show toolbar
    this.show();
  }
  
  positionToolbar(selection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const toolbarRect = this.toolbar.getBoundingClientRect();
    let top, left;
    
    if (this.options.position === 'above') {
      top = rect.top + window.scrollY - toolbarRect.height - 15;
    } else {
      top = rect.bottom + window.scrollY + 15;
    }
    
    left = rect.left + window.scrollX + (rect.width / 2);
    
    // Keep within viewport
    const minLeft = toolbarRect.width / 2 + 10;
    const maxLeft = window.innerWidth - toolbarRect.width / 2 - 10;
    left = Math.max(minLeft, Math.min(maxLeft, left));
    
    this.toolbar.style.top = `${Math.max(10, top)}px`;
    this.toolbar.style.left = `${left}px`;
  }
  
  show() {
    clearTimeout(this.hideTimeout);
    this.toolbar.classList.add('visible');
  }
  
  hide() {
    this.toolbar.classList.remove('visible');
  }
  
  handleButtonClick(e, action) {
    e.stopPropagation();
    
    switch (action) {
      case 'copy':
        this.copySelection();
        break;
      case 'search':
        this.searchSelection();
        break;
      case 'quote':
        this.createQuote();
        break;
      case 'tweet':
        this.tweetSelection();
        break;
    }
    
    this.hide();
  }
  
  async copySelection() {
    try {
      await navigator.clipboard.writeText(this.currentSelection);
      this.showToast('Copied to clipboard');
    } catch (err) {
      this.fallbackCopy();
    }
  }
  
  fallbackCopy() {
    const textarea = document.createElement('textarea');
    textarea.value = this.currentSelection;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast('Copied to clipboard');
  }
  
  searchSelection() {
    const query = encodeURIComponent(this.currentSelection);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }
  
  tweetSelection() {
    const text = encodeURIComponent(`"${this.currentSelection.substring(0, 250)}..."`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }
  
  shareSelection(method) {
    const text = this.currentSelection;
    const url = window.location.href;
    
    switch (method) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.substring(0, 200))}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            text: text,
            url: url
          });
        }
        break;
    }
    
    this.hide();
  }
  
  highlightSelection(color) {
    if (!this.selectionRange) return;
    
    const span = document.createElement('span');
    span.className = `text-selection-highlighted ${color}`;
    span.dataset.highlighted = 'true';
    
    try {
      this.selectionRange.surroundContents(span);
      this.highlightedRanges.push(span);
      this.showToast('Text highlighted');
      
      // Store in localStorage
      this.saveHighlight(this.currentSelection, color);
    } catch (e) {
      // Complex selections that cross elements
      const contents = this.selectionRange.extractContents();
      span.appendChild(contents);
      this.selectionRange.insertNode(span);
      this.highlightedRanges.push(span);
    }
    
    window.getSelection().removeAllRanges();
    this.hide();
  }
  
  saveHighlight(text, color) {
    const highlights = JSON.parse(localStorage.getItem('bb_highlights') || '[]');
    highlights.push({
      text: text.substring(0, 200),
      color: color,
      url: window.location.href,
      date: new Date().toISOString()
    });
    localStorage.setItem('bb_highlights', JSON.stringify(highlights.slice(-50))); // Keep last 50
  }
  
  createQuote() {
    this.hide();
    
    // Dispatch event for external quote handling
    window.dispatchEvent(new CustomEvent('quoteSelection', {
      detail: {
        text: this.currentSelection,
        url: window.location.href,
        title: document.title
      }
    }));
    
    // Show toast
    this.showToast('Quote created');
  }
  
  showToast(message) {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      // Simple toast fallback
      const toast = document.createElement('div');
      toast.className = 'copy-toast visible';
      toast.innerHTML = `
        <div class="copy-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span>${message}</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }
  }
  
  clearHighlights() {
    this.highlightedRanges.forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });
    this.highlightedRanges = [];
  }
  
  destroy() {
    clearTimeout(this.hideTimeout);
    clearTimeout(this.updateTimeout);
    this.toolbar?.remove();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.textSelectionToolbar = new TextSelectionToolbar();
  });
} else {
  window.textSelectionToolbar = new TextSelectionToolbar();
}
