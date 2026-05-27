/**
 * Smart Clipboard System - Fortune 500 Quality
 * Professional copy-to-clipboard functionality with enhanced UX
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    toastDuration: 3000,
    historyLimit: 20,
    storageKey: 'clipboard-history',
    fallbackEnabled: true
  };

  // State
  let clipboardHistory = [];
  let selectionPopup = null;
  let toastEl = null;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadHistory();
    createToastElement();
    createSelectionPopup();
    bindAutoCopyElements();
    bindSelectionEvents();
    
    console.log('[Smart Clipboard] Initialized');
  }

  /**
   * Load clipboard history from storage
   */
  function loadHistory() {
    try {
      const stored = sessionStorage.getItem(CONFIG.storageKey);
      if (stored) {
        clipboardHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Smart Clipboard] Could not load history');
    }
  }

  /**
   * Save clipboard history
   */
  function saveHistory() {
    try {
      sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(clipboardHistory));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Create toast notification element
   */
  function createToastElement() {
    toastEl = document.createElement('div');
    toastEl.className = 'clipboard-toast';
    toastEl.innerHTML = `
      <div class="clipboard-toast-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="clipboard-toast-content">
        <span class="clipboard-toast-title">Copied to clipboard</span>
        <span class="clipboard-toast-text"></span>
      </div>
    `;
    document.body.appendChild(toastEl);
  }

  /**
   * Create text selection popup
   */
  function createSelectionPopup() {
    selectionPopup = document.createElement('div');
    selectionPopup.className = 'text-selection-popup';
    selectionPopup.innerHTML = `
      <button class="selection-copy-btn" title="Copy" aria-label="Copy selected text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button class="selection-share-btn" title="Share" aria-label="Share selected text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
    `;
    document.body.appendChild(selectionPopup);

    // Bind popup buttons
    selectionPopup.querySelector('.selection-copy-btn').addEventListener('click', () => {
      const selection = window.getSelection().toString();
      if (selection) {
        copyToClipboard(selection, 'Selected text');
        hideSelectionPopup();
      }
    });

    selectionPopup.querySelector('.selection-share-btn').addEventListener('click', () => {
      const selection = window.getSelection().toString();
      if (selection && navigator.share) {
        navigator.share({
          text: selection,
          title: document.title,
          url: window.location.href
        });
        hideSelectionPopup();
      }
    });
  }

  /**
   * Bind auto-copy buttons
   */
  function bindAutoCopyElements() {
    // Data attribute copy buttons
    document.querySelectorAll('[data-copy]').forEach(el => {
      if (!el.classList.contains('copy-bound')) {
        el.classList.add('copy-bound');
        el.addEventListener('click', () => {
          const text = el.dataset.copy;
          const label = el.dataset.copyLabel || text;
          copyToClipboard(text, label);
        });
      }
    });

    // Auto-detect copyable elements
    document.querySelectorAll('.copy-email, .copy-phone, .copy-link').forEach(el => {
      if (!el.classList.contains('copy-bound')) {
        el.classList.add('copy-bound');
        el.addEventListener('click', () => {
          const text = el.textContent.trim();
          const type = el.classList.contains('copy-email') ? 'Email' :
                       el.classList.contains('copy-phone') ? 'Phone' : 'Link';
          copyToClipboard(text, type);
        });
      }
    });

    // Input copy buttons
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
      if (!btn.classList.contains('copy-bound')) {
        btn.classList.contains('copy-bound');
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.copyTarget;
          const target = document.getElementById(targetId) || document.querySelector(targetId);
          if (target) {
            const text = target.value || target.textContent;
            const label = btn.dataset.copyLabel || 'Content';
            copyToClipboard(text, label);
          }
        });
      }
    });
  }

  /**
   * Bind text selection events
   */
  function bindSelectionEvents() {
    let selectionTimeout;

    document.addEventListener('selectionchange', () => {
      clearTimeout(selectionTimeout);
      
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text.length > 0 && text.length < 1000) {
          showSelectionPopup(selection);
        } else {
          hideSelectionPopup();
        }
      }, 200);
    });

    // Hide popup when clicking elsewhere
    document.addEventListener('mousedown', (e) => {
      if (!selectionPopup.contains(e.target)) {
        hideSelectionPopup();
      }
    });
  }

  /**
   * Show selection popup near selection
   */
  function showSelectionPopup(selection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    selectionPopup.style.left = `${rect.left + rect.width / 2 - 40}px`;
    selectionPopup.style.top = `${rect.top - 50 + window.scrollY}px`;
    selectionPopup.classList.add('show');
  }

  /**
   * Hide selection popup
   */
  function hideSelectionPopup() {
    selectionPopup.classList.remove('show');
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text, label = 'Item') {
    if (!text) return false;
    
    text = text.trim();
    
    try {
      // Try modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position: fixed; left: -9999px; top: 0;';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textarea);
        }
      }
      
      // Add to history
      addToHistory(text, label);
      
      // Show success feedback
      showToast(label, truncate(text, 50));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('clipboard:copied', {
        detail: { text, label }
      }));
      
      return true;
    } catch (err) {
      console.error('[Smart Clipboard] Copy failed:', err);
      showToast('Copy failed', 'Please try again', 'error');
      return false;
    }
  }

  /**
   * Add item to clipboard history
   */
  function addToHistory(text, label) {
    // Remove duplicates
    clipboardHistory = clipboardHistory.filter(item => item.text !== text);
    
    // Add to beginning
    clipboardHistory.unshift({
      text,
      label,
      timestamp: Date.now()
    });
    
    // Limit history
    if (clipboardHistory.length > CONFIG.historyLimit) {
      clipboardHistory = clipboardHistory.slice(0, CONFIG.historyLimit);
    }
    
    saveHistory();
  }

  /**
   * Show toast notification
   */
  function showToast(title, text = '', type = 'success') {
    const iconEl = toastEl.querySelector('.clipboard-toast-icon');
    const titleEl = toastEl.querySelector('.clipboard-toast-title');
    const textEl = toastEl.querySelector('.clipboard-toast-text');
    
    // Set icon based on type
    if (type === 'error') {
      iconEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
      iconEl.style.background = 'rgba(239, 68, 68, 0.15)';
      iconEl.style.color = '#ef4444';
      toastEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    } else {
      iconEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      iconEl.style.background = 'rgba(34, 197, 94, 0.15)';
      iconEl.style.color = '#22c55e';
      toastEl.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    }
    
    titleEl.textContent = title;
    textEl.textContent = text;
    
    toastEl.classList.add('show');
    
    // Auto-hide
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, type === 'error' ? 4000 : CONFIG.toastDuration);
  }

  /**
   * Copy current page URL
   */
  function copyPageUrl() {
    const url = window.location.href;
    const title = document.title;
    copyToClipboard(url, 'Page URL');
  }

  /**
   * Copy page metadata
   */
  function copyPageMeta() {
    const meta = {
      title: document.title,
      url: window.location.href,
      description: document.querySelector('meta[name="description"]')?.content || ''
    };
    const text = `${meta.title}\n${meta.url}${meta.description ? '\n\n' + meta.description : ''}`;
    copyToClipboard(text, 'Page info');
  }

  /**
   * Copy all contact info
   */
  function copyContactInfo() {
    const contactSection = document.querySelector('#contact, .contact-section');
    if (!contactSection) {
      copyToClipboard('info@buildbridge.co.za\n+27 66 120 0064', 'Contact info');
      return;
    }
    
    const text = extractContactInfo(contactSection);
    copyToClipboard(text, 'Contact info');
  }

  /**
   * Extract contact info from element
   */
  function extractContactInfo(element) {
    const phone = element.querySelector('.contact-item[href^="tel:"]')?.textContent?.trim();
    const email = element.querySelector('.contact-item[href^="mailto:"]')?.textContent?.trim();
    const text = [];
    
    if (phone) text.push(phone);
    if (email) text.push(email);
    
    return text.join('\n') || 'BuildBridge\ninfo@buildbridge.co.za\n+27 66 120 0064';
  }

  /**
   * Truncate text
   */
  function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Create a copy button
   */
  function createCopyButton(text, label = 'Copy', options = {}) {
    const btn = document.createElement('button');
    btn.className = 'copy-button';
    if (options.iconOnly) btn.className += ' copy-button-icon';
    if (options.className) btn.className += ' ' + options.className;
    
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      ${options.iconOnly ? '' : `<span>${label}</span>`}
    `;
    
    btn.addEventListener('click', () => {
      copyToClipboard(text, label);
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    });
    
    return btn;
  }

  /**
   * Create share panel
   */
  function createSharePanel() {
    const panel = document.createElement('div');
    panel.className = 'share-copy-panel';
    panel.innerHTML = `
      <div class="share-copy-panel-title">Share This Page</div>
      <div class="share-copy-options">
        <div class="share-copy-option" data-share="copy-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Copy Link</span>
        </div>
        <div class="share-copy-option" data-share="whatsapp">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp</span>
        </div>
        <div class="share-copy-option" data-share="email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Email</span>
        </div>
        <div class="share-copy-option" data-share="native">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </div>
      </div>
    `;
    
    // Bind share options
    panel.querySelectorAll('[data-share]').forEach(option => {
      option.addEventListener('click', () => {
        const shareType = option.dataset.share;
        handleShare(shareType, option);
      });
    });
    
    return panel;
  }

  /**
   * Handle share action
   */
  async function handleShare(type, element) {
    const url = window.location.href;
    const title = document.title;
    const text = document.querySelector('meta[name="description"]')?.content || '';
    
    switch(type) {
      case 'copy-link':
        const success = await copyToClipboard(url, 'Link');
        if (success) {
          element.classList.add('copied');
          element.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            element.classList.remove('copied');
            element.querySelector('span').textContent = 'Copy Link';
          }, 2000);
        }
        break;
        
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
        window.open(whatsappUrl, '_blank');
        break;
        
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
        
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (err) {
            // User cancelled
          }
        } else {
          copyToClipboard(url, 'Link');
        }
        break;
    }
  }

  /**
   * Auto-enhance existing elements
   */
  function enhanceElements() {
    // Add copy buttons to contact info
    document.querySelectorAll('.contact-item[href^="tel:"]').forEach(el => {
      if (!el.querySelector('.copy-inline')) {
        const phone = el.getAttribute('href').replace('tel:', '').replace(/\s/g, '');
        const copyBtn = document.createElement('span');
        copyBtn.className = 'copy-inline';
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
        copyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          copyToClipboard(phone, 'Phone');
        });
        el.appendChild(copyBtn);
      }
    });

    // Enhance email links
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      if (!el.classList.contains('copy-enhanced')) {
        el.classList.add('copy-enhanced');
        el.addEventListener('contextmenu', (e) => {
          // Right-click to copy
          e.preventDefault();
          const email = el.getAttribute('href').replace('mailto:', '');
          copyToClipboard(email, 'Email');
        });
      }
    });
  }

  // Expose API
  window.BuildBridgeClipboard = {
    copy: copyToClipboard,
    copyUrl: copyPageUrl,
    copyMeta: copyPageMeta,
    copyContact: copyContactInfo,
    createButton: createCopyButton,
    createSharePanel,
    getHistory: () => [...clipboardHistory],
    clearHistory: () => {
      clipboardHistory = [];
      saveHistory();
    },
    enhanceElements,
    bindElements: bindAutoCopyElements
  };

  // Auto-enhance on load
  setTimeout(enhanceElements, 1000);

})();
