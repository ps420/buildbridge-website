/**
 * BuildBridge Magnetic Social Share
 * Floating Magnetic Share Buttons - v79.3
 * Fortune 500 Social Sharing Enhancement
 */

(function() {
  'use strict';
  
  class MagneticSocialShare {
    constructor(options = {}) {
      this.options = {
        position: 'right',
        offset: 100,
        mobileBreakpoint: 1024,
        ...options
      };
      
      this.isOpen = false;
      this.shareCount = this.getStoredCount();
      this.init();
    }
    
    init() {
      this.isMobile = window.innerWidth < this.options.mobileBreakpoint;
      
      if (this.isMobile) {
        this.createMobileShare();
      } else {
        this.createDesktopShare();
      }
      
      this.bindEvents();
      console.log('🔗 Magnetic Social Share initialized');
    }
    
    createDesktopShare() {
      const container = document.createElement('div');
      container.className = 'magnetic-share-container';
      container.innerHTML = `
        <button class="magnetic-share-toggle" aria-label="Share this page">
          <span class="pulse-ring"></span>
          🔗
        </button>
        <div class="magnetic-share-menu">
          <button class="magnetic-share-btn twitter" data-platform="twitter" aria-label="Share on Twitter">
            <span class="tooltip">Twitter</span>
            🐦
          </button>
          <button class="magnetic-share-btn facebook" data-platform="facebook" aria-label="Share on Facebook">
            <span class="tooltip">Facebook</span>
            📘
          </button>
          <button class="magnetic-share-btn linkedin" data-platform="linkedin" aria-label="Share on LinkedIn">
            <span class="tooltip">LinkedIn</span>
            💼
          </button>
          <button class="magnetic-share-btn whatsapp" data-platform="whatsapp" aria-label="Share on WhatsApp">
            <span class="tooltip">WhatsApp</span>
            💬
          </button>
          <button class="magnetic-share-btn email" data-platform="email" aria-label="Share via Email">
            <span class="tooltip">Email</span>
            ✉️
          </button>
          <button class="magnetic-share-btn copy" data-platform="copy" aria-label="Copy link">
            <span class="tooltip">Copy Link</span>
            📋
          </button>
        </div>
      `;
      
      document.body.appendChild(container);
      
      this.container = container;
      this.toggle = container.querySelector('.magnetic-share-toggle');
      this.menu = container.querySelector('.magnetic-share-menu');
      
      // Magnetic effect
      this.initMagneticEffect();
    }
    
    createMobileShare() {
      // Mobile trigger
      const trigger = document.createElement('button');
      trigger.className = 'magnetic-share-mobile-trigger';
      trigger.innerHTML = '🔗';
      trigger.setAttribute('aria-label', 'Share this page');
      document.body.appendChild(trigger);
      
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'magnetic-share-overlay';
      document.body.appendChild(overlay);
      
      // Sheet
      const sheet = document.createElement('div');
      sheet.className = 'magnetic-share-sheet';
      sheet.innerHTML = `
        <div class="magnetic-share-sheet-handle"></div>
        <h3 class="magnetic-share-sheet-title">Share this page</h3>
        <div class="magnetic-share-grid">
          <div class="magnetic-share-grid-item" data-platform="twitter">
            <div class="icon" style="background: linear-gradient(135deg, #1da1f2, #0d8bd9);">🐦</div>
            <span class="label">Twitter</span>
          </div>
          <div class="magnetic-share-grid-item" data-platform="facebook">
            <div class="icon" style="background: linear-gradient(135deg, #4267B2, #365899);">📘</div>
            <span class="label">Facebook</span>
          </div>
          <div class="magnetic-share-grid-item" data-platform="linkedin">
            <div class="icon" style="background: linear-gradient(135deg, #0077b5, #005885);">💼</div>
            <span class="label">LinkedIn</span>
          </div>
          <div class="magnetic-share-grid-item" data-platform="whatsapp">
            <div class="icon" style="background: linear-gradient(135deg, #25d366, #128c7e);">💬</div>
            <span class="label">WhatsApp</span>
          </div>
          <div class="magnetic-share-grid-item" data-platform="email">
            <div class="icon" style="background: linear-gradient(135deg, #ea4335, #c53929);">✉️</div>
            <span class="label">Email</span>
          </div>
          <div class="magnetic-share-grid-item" data-platform="copy">
            <div class="icon" style="background: linear-gradient(135deg, #6b7280, #4b5563);">📋</div>
            <span class="label">Copy Link</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(sheet);
      
      this.mobileTrigger = trigger;
      this.mobileOverlay = overlay;
      this.mobileSheet = sheet;
    }
    
    initMagneticEffect() {
      if (!this.container) return;
      
      const buttons = this.container.querySelectorAll('.magnetic-share-btn');
      
      buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          // Update CSS variables for gradient position
          btn.style.setProperty('--mouse-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
          btn.style.setProperty('--mouse-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
          
          // Magnetic pull
          btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.15) translateX(-5px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }
    
    bindEvents() {
      // Desktop toggle
      if (this.toggle) {
        this.toggle.addEventListener('click', () => this.toggleMenu());
      }
      
      // Mobile trigger
      if (this.mobileTrigger) {
        this.mobileTrigger.addEventListener('click', () => this.openMobileSheet());
        this.mobileOverlay.addEventListener('click', () => this.closeMobileSheet());
      }
      
      // Share buttons
      document.querySelectorAll('[data-platform]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const platform = e.currentTarget.dataset.platform;
          this.share(platform);
        });
      });
      
      // Handle resize
      window.addEventListener('resize', () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < this.options.mobileBreakpoint;
        
        if (wasMobile !== this.isMobile) {
          location.reload(); // Simple approach for viewport change
        }
      });
      
      // Keyboard shortcut (Ctrl/Cmd + Shift + S)
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          this.isMobile ? this.openMobileSheet() : this.toggleMenu();
        }
      });
    }
    
    toggleMenu() {
      this.isOpen = !this.isOpen;
      this.toggle.classList.toggle('active', this.isOpen);
      this.menu.classList.toggle('active', this.isOpen);
    }
    
    openMobileSheet() {
      this.mobileOverlay.classList.add('active');
      this.mobileSheet.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Swipe to close
      let startY = 0;
      const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
      };
      
      const handleTouchMove = (e) => {
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) {
          this.mobileSheet.style.transform = `translateY(${deltaY}px)`;
        }
      };
      
      const handleTouchEnd = (e) => {
        const deltaY = e.changedTouches[0].clientY - startY;
        if (deltaY > 100) {
          this.closeMobileSheet();
        } else {
          this.mobileSheet.style.transform = '';
        }
      };
      
      this.mobileSheet.addEventListener('touchstart', handleTouchStart, { once: true });
      this.mobileSheet.addEventListener('touchmove', handleTouchMove, { once: true });
      this.mobileSheet.addEventListener('touchend', handleTouchEnd, { once: true });
    }
    
    closeMobileSheet() {
      this.mobileOverlay.classList.remove('active');
      this.mobileSheet.classList.remove('active');
      this.mobileSheet.style.transform = '';
      document.body.style.overflow = '';
    }
    
    share(platform) {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const description = encodeURIComponent(this.getMetaDescription());
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
        email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`
      };
      
      if (platform === 'copy') {
        this.copyToClipboard(window.location.href);
      } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        this.incrementShareCount();
      }
      
      // Close menu after sharing
      if (this.isOpen) this.toggleMenu();
      if (this.mobileSheet?.classList.contains('active')) this.closeMobileSheet();
    }
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        
        // Show success state
        const copyBtn = document.querySelector('[data-platform="copy"]');
        if (copyBtn) {
          const originalContent = copyBtn.innerHTML;
          copyBtn.classList.add('copied');
          copyBtn.querySelector('.tooltip').textContent = 'Copied!';
          
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('.tooltip').textContent = 'Copy Link';
          }, 2000);
        }
        
        // Show toast notification
        if (window.DynamicIsland) {
          window.DynamicIsland.success('Link Copied', 'URL copied to clipboard');
        }
        
        this.incrementShareCount();
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    
    getMetaDescription() {
      const meta = document.querySelector('meta[name="description"]');
      return meta ? meta.content : '';
    }
    
    incrementShareCount() {
      this.shareCount++;
      localStorage.setItem('buildbridge-share-count', this.shareCount);
      this.updateShareCountBadge();
    }
    
    getStoredCount() {
      return parseInt(localStorage.getItem('buildbridge-share-count')) || 0;
    }
    
    updateShareCountBadge() {
      const toggle = document.querySelector('.magnetic-share-toggle');
      if (toggle && this.shareCount > 0) {
        let badge = toggle.querySelector('.magnetic-share-count');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'magnetic-share-count';
          toggle.appendChild(badge);
        }
        badge.textContent = this.shareCount > 99 ? '99+' : this.shareCount;
      }
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MagneticSocialShare());
  } else {
    new MagneticSocialShare();
  }
  
})();
