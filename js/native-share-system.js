/**
 * v135.0: Native Share API Integration
 * Fortune 500 Quality Social Sharing System
 * Uses Web Share API with comprehensive fallback options
 */

(function() {
  'use strict';
  
  class NativeShareSystem {
    constructor(options = {}) {
      this.options = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || '',
        url: window.location.href,
        fallback: true,
        showFloatingBtn: false,
        ...options
      };
      
      this.hasNativeShare = typeof navigator !== 'undefined' && navigator.share;
      this.overlay = null;
      this.toast = null;
      
      this.init();
    }
    
    init() {
      this.bindButtons();
      
      if (this.options.showFloatingBtn) {
        this.createFloatingButton();
      }
    }
    
    bindButtons() {
      // Find any button with data-share attribute
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-share]');
        if (btn) {
          e.preventDefault();
          this.share(btn.dataset.share);
        }
      });
    }
    
    async share(shareData = {}) {
      const data = {
        title: shareData.title || this.options.title,
        text: shareData.text || this.options.text,
        url: shareData.url || this.options.url
      };
      
      try {
        if (this.hasNativeShare && !shareData.fallback) {
          await navigator.share(data);
          this.showSuccess('Shared successfully!');
          this.trackShare('native');
        } else {
          this.showFallbackUI(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.showFallbackUI(data);
        }
      }
    }
    
    showFallbackUI(data) {
      // Remove existing overlay
      this.hideFallbackUI();
      
      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'native-share-overlay';
      this.overlay.innerHTML = `
        <div class="native-share-sheet">
          <div class="native-share-header">
            <span class="native-share-title">Share</span>
            <button class="native-share-close" aria-label="Close">✕</button>
          </div>
          <div class="native-share-options">
            ${this.renderShareOptions(data)}
          </div>
          <div class="native-share-link-section">
            <div class="native-share-link-label">Page Link</div>
            <div class="native-share-link-box">
              <input type="text" class="native-share-link-input" value="${data.url}" readonly>
              <button class="native-share-link-copy">Copy</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.overlay);
      
      // Animation
      requestAnimationFrame(() => {
        this.overlay.classList.add('active');
      });
      
      // Bind events
      this.bindFallbackEvents(data);
    }
    
    renderShareOptions(data) {
      const shareOptions = [
        { id: 'facebook', name: 'Facebook', icon: '📘', color: 'facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}` },
        { id: 'twitter', name: 'X/Twitter', icon: '𝕏', color: 'twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}` },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'whatsapp', url: `https://wa.me/?text=${encodeURIComponent(data.text + ' ' + data.url)}` },
        { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'linkedin', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}` },
        { id: 'email', name: 'Email', icon: '✉️', color: 'email', url: `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.text + '\n\n' + data.url)}` },
        { id: 'sms', name: 'SMS', icon: '💬', color: 'sms', url: `sms:?body=${encodeURIComponent(data.text + ' ' + data.url)}` },
        { id: 'copy', name: 'Copy', icon: '📋', color: 'copy', action: 'copy' },
        { id: 'print', name: 'Print', icon: '🖨️', color: 'print', action: 'print' }
      ];
      
      // Filter available options
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      return shareOptions
        .filter(opt => {
          if (opt.id === 'sms' && !isMobile) return false;
          return true;
        })
        .map(opt => `
          <div class="native-share-option" data-action="${opt.action || 'open'}" data-url="${opt.url || ''}">
            <div class="native-share-option-icon ${opt.color}">${opt.icon}</div>
            <span class="native-share-option-label">${opt.name}</span>
          </div>
        `).join('');
    }
    
    bindFallbackEvents(data) {
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hideFallbackUI();
        }
      });
      
      // Close button
      const closeBtn = this.overlay.querySelector('.native-share-close');
      closeBtn?.addEventListener('click', () => this.hideFallbackUI());
      
      // Share options
      this.overlay.querySelectorAll('.native-share-option').forEach(option => {
        option.addEventListener('click', () => {
          const action = option.dataset.action;
          const url = option.dataset.url;
          
          if (action === 'copy') {
            this.copyToClipboard(data.url);
            this.trackShare('copy');
          } else if (action === 'print') {
            window.print();
            this.trackShare('print');
          } else if (url) {
            window.open(url, '_blank', 'width=600,height=400');
            this.trackShare(option.closest('.native-share-option').querySelector('.native-share-option-label').textContent.toLowerCase());
          }
        });
      });
      
      // Copy link button
      const copyBtn = this.overlay.querySelector('.native-share-link-copy');
      copyBtn?.addEventListener('click', () => {
        this.copyToClipboard(data.url);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
      
      // Keyboard close
      document.addEventListener('keydown', this.handleKeydown = (e) => {
        if (e.key === 'Escape') {
          this.hideFallbackUI();
        }
      });
    }
    
    hideFallbackUI() {
      if (!this.overlay) return;
      
      this.overlay.classList.remove('active');
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
      }, 300);
      
      document.removeEventListener('keydown', this.handleKeydown);
    }
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showSuccess('Link copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showSuccess('Link copied!');
      }
    }
    
    createFloatingButton() {
      const btn = document.createElement('button');
      btn.className = 'floating-share-btn pulse';
      btn.innerHTML = '⬆️';
      btn.setAttribute('aria-label', 'Share this page');
      btn.addEventListener('click', () => this.share());
      document.body.appendChild(btn);
    }
    
    showSuccess(message) {
      // Remove existing toast
      this.hideToast();
      
      this.toast = document.createElement('div');
      this.toast.className = 'share-success-toast';
      this.toast.innerHTML = `✓ ${message}`;
      document.body.appendChild(this.toast);
      
      requestAnimationFrame(() => {
        this.toast.classList.add('show');
      });
      
      setTimeout(() => this.hideToast(), 3000);
    }
    
    hideToast() {
      if (this.toast) {
        this.toast.classList.remove('show');
        setTimeout(() => {
          this.toast?.remove();
          this.toast = null;
        }, 300);
      }
    }
    
    trackShare(method) {
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: method,
          content_type: 'page',
          item_id: window.location.pathname
        });
      }
      
      // Custom event
      window.dispatchEvent(new CustomEvent('share', {
        detail: { method, url: this.options.url }
      }));
    }
    
    // Static method for quick sharing
    static share(data) {
      const sharer = new NativeShareSystem(data);
      sharer.share(data);
    }
    
    destroy() {
      this.hideFallbackUI();
      this.hideToast();
      document.querySelectorAll('.floating-share-btn').forEach(btn => btn.remove());
    }
  }
  
  // Auto-initialize
  function init() {
    // Check for data attributes on body or container
    const shareConfig = document.querySelector('[data-share-config]');
    if (shareConfig) {
      try {
        const config = JSON.parse(shareConfig.dataset.shareConfig);
        window.shareSystem = new NativeShareSystem(config);
      } catch (e) {
        window.shareSystem = new NativeShareSystem();
      }
    } else {
      window.shareSystem = new NativeShareSystem({ showFloatingBtn: window.innerWidth < 768 });
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope
  window.NativeShareSystem = NativeShareSystem;
})();
