/**
 * v90.0: Floating Action Menu System
 * Multi-action floating button with smart interactions
 */

(function() {
  'use strict';

  class FloatingActionMenu {
    constructor(options = {}) {
      this.options = {
        position: 'right',
        actions: [
          { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/27661200064', type: 'link' },
          { icon: '📧', label: 'Email', href: 'mailto:info@buildbridge.co.za', type: 'link' },
          { icon: '📞', label: 'Call', href: 'tel:+27661200064', type: 'link' }
        ],
        showScrollTop: true,
        showWhatsApp: true,
        ...options
      };
      
      this.container = null;
      this.isExpanded = false;
      this.scrollTopBtn = null;
      this.whatsappBtn = null;
      
      this.init();
    }

    init() {
      this.createContainer();
      if (this.options.showWhatsApp) this.createWhatsAppButton();
      if (this.options.showScrollTop) this.createScrollTopButton();
      this.bindEvents();
    }

    createContainer() {
      if (document.querySelector('.fab-container')) return;
      
      const container = document.createElement('div');
      container.className = 'fab-container';
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'fab-actions';
      
      this.options.actions.forEach(action => {
        const actionEl = this.createAction(action);
        actionsDiv.appendChild(actionEl);
      });
      
      const mainBtn = document.createElement('button');
      mainBtn.className = 'fab-main';
      mainBtn.setAttribute('aria-label', 'Quick Actions');
      mainBtn.innerHTML = '<span class="fab-main-icon">+</span>';
      mainBtn.addEventListener('click', () => this.toggle());
      
      container.appendChild(actionsDiv);
      container.appendChild(mainBtn);
      
      document.body.appendChild(container);
      this.container = container;
    }

    createAction(action) {
      const div = document.createElement('div');
      div.className = 'fab-action';
      
      const label = document.createElement('span');
      label.className = 'fab-action-label';
      label.textContent = action.label;
      
      let btn;
      if (action.type === 'link') {
        btn = document.createElement('a');
        btn.href = action.href;
        btn.target = action.href.startsWith('http') ? '_blank' : '_self';
      } else {
        btn = document.createElement('button');
        btn.addEventListener('click', () => { this.close(); });
      }
      
      btn.className = 'fab-action-btn';
      btn.innerHTML = action.icon;
      
      div.appendChild(label);
      div.appendChild(btn);
      return div;
    }

    createWhatsAppButton() {
      if (document.querySelector('.fab-whatsapp')) return;
      
      const btn = document.createElement('a');
      btn.className = 'fab-whatsapp';
      btn.href = 'https://wa.me/27661200064';
      btn.target = '_blank';
      btn.setAttribute('aria-label', 'Chat on WhatsApp');
      btn.innerHTML = '💬<span class="fab-whatsapp-tooltip">Chat with us</span>';
      
      document.body.appendChild(btn);
      this.whatsappBtn = btn;
    }

    createScrollTopButton() {
      if (document.querySelector('.fab-scroll-top')) return;
      
      const btn = document.createElement('button');
      btn.className = 'fab-scroll-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.innerHTML = '↑';
      
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      document.body.appendChild(btn);
      this.scrollTopBtn = btn;
      
      window.addEventListener('scroll', this.throttle(() => {
        if (window.pageYOffset > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }, 100), { passive: true });
    }

    toggle() {
      this.isExpanded = !this.isExpanded;
      this.container.classList.toggle('expanded', this.isExpanded);
      
      if (this.isExpanded) {
        setTimeout(() => {
          document.addEventListener('click', this.handleOutsideClick);
        }, 0);
      }
    }

    close() {
      this.isExpanded = false;
      this.container.classList.remove('expanded');
      document.removeEventListener('click', this.handleOutsideClick);
    }

    handleOutsideClick = (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    }

    throttle(fn, wait) {
      let lastTime = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    }

    bindEvents() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isExpanded) {
          this.close();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.fabMenu = new FloatingActionMenu();
    });
  } else {
    window.fabMenu = new FloatingActionMenu();
  }
})();
