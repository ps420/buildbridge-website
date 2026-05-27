/**
 * v31.0 - Floating Action Button
 * Quick access contact menu with expandable options
 */

(function() {
  'use strict';

  class FloatingActionButton {
    constructor() {
      this.container = document.querySelector('.fab-container');
      this.mainBtn = document.querySelector('.fab-main');
      this.isOpen = false;
      
      this.init();
    }

    init() {
      if (!this.container || !this.mainBtn) return;

      this.bindEvents();
      this.trackPageTime();
    }

    bindEvents() {
      // Toggle menu on click
      this.mainBtn.addEventListener('click', () => this.toggle());

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target) && this.isOpen) {
          this.close();
        }
      });

      // Keyboard accessibility
      this.mainBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Track fab item clicks
      const fabItems = this.container.querySelectorAll('.fab-item');
      fabItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const type = item.classList.contains('call') ? 'phone' :
                      item.classList.contains('whatsapp') ? 'whatsapp' :
                      item.classList.contains('email') ? 'email' : 'chat';
          
          // Analytics tracking (if available)
          if (window.gtag) {
            gtag('event', 'fab_click', {
              method: type
            });
          }
        });
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.container.classList.add('open');
      this.mainBtn.classList.add('active');
      this.mainBtn.setAttribute('aria-expanded', 'true');
      
      // Animate items in
      const items = this.container.querySelectorAll('.fab-item');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 50}ms`;
      });
    }

    close() {
      this.isOpen = false;
      this.container.classList.remove('open');
      this.mainBtn.classList.remove('active');
      this.mainBtn.setAttribute('aria-expanded', 'false');
      
      // Reset delays
      const items = this.container.querySelectorAll('.fab-item');
      items.forEach(item => {
        item.style.transitionDelay = '';
      });
    }

    trackPageTime() {
      // Show notification badge after 30 seconds
      setTimeout(() => {
        if (!this.isOpen) {
          this.showBadge();
        }
      }, 30000);
    }

    showBadge() {
      if (!this.mainBtn.querySelector('.fab-badge')) {
        const badge = document.createElement('span');
        badge.className = 'fab-badge';
        badge.textContent = '1';
        this.mainBtn.appendChild(badge);
      }
    }

    hideBadge() {
      const badge = this.mainBtn.querySelector('.fab-badge');
      if (badge) {
        badge.remove();
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FloatingActionButton());
  } else {
    new FloatingActionButton();
  }

  // Expose to global scope
  window.FloatingActionButton = FloatingActionButton;
})();
