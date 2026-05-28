/**
 * FLOATING ACTION MENU - v43 Fortune 500
 * Quick access menu with expandable actions
 */

class FloatingActionMenu {
  constructor() {
    this.isOpen = false;
    this.scrollProgress = 0;
    this.config = {
      mainAction: {
        icon: 'plus',
        tooltip: 'Quick Actions'
      },
      actions: [
        {
          id: 'whatsapp',
          icon: '💬',
          label: 'WhatsApp Us',
          action: () => window.open('https://wa.me/27661200064', '_blank'),
          priority: 'high'
        },
        {
          id: 'call',
          icon: '📞',
          label: 'Call Now',
          action: () => window.location.href = 'tel:+27661200064',
          priority: 'high'
        },
        {
          id: 'quote',
          icon: '📋',
          label: 'Get Quote',
          action: () => window.location.href = 'contact.html',
          priority: 'medium'
        },
        {
          id: 'email',
          icon: '✉️',
          label: 'Send Email',
          action: () => window.location.href = 'mailto:info@buildbridge.co.za',
          priority: 'medium'
        },
        {
          id: 'share',
          icon: '📤',
          label: 'Share Page',
          action: () => this.sharePage(),
          priority: 'low'
        }
      ],
      quickBarActions: [
        { id: 'home', icon: 'home', label: 'Home', url: 'index.html' },
        { id: 'services', icon: 'briefcase', label: 'Services', url: 'services.html' },
        { id: 'projects', icon: 'folder', label: 'Projects', url: 'projects.html' },
        { id: 'contact', icon: 'mail', label: 'Contact', url: 'contact.html' }
      ]
    };
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.initScrollProgress();
    this.initBackToTop();
  }
  
  createElements() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'floating-action-menu';
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Quick actions');
    
    // Create FAB actions container
    this.actionsContainer = document.createElement('div');
    this.actionsContainer.className = 'fab-actions';
    
    // Create action buttons
    this.config.actions.forEach(action => {
      const actionEl = document.createElement('div');
      actionEl.className = 'fab-action';
      actionEl.innerHTML = `
        <span class="fab-action-label">${action.label}</span>
        <button class="fab-action-btn" aria-label="${action.label}">
          ${action.icon}
        </button>
      `;
      actionEl.querySelector('.fab-action-btn').addEventListener('click', () => {
        action.action();
        this.close();
      });
      this.actionsContainer.appendChild(actionEl);
    });
    
    // Create main FAB button
    this.mainButton = document.createElement('button');
    this.mainButton.className = 'fab-main';
    this.mainButton.setAttribute('aria-label', 'Toggle quick actions');
    this.mainButton.setAttribute('aria-expanded', 'false');
    this.mainButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span class="fab-tooltip">${this.config.mainAction.tooltip}</span>
    `;
    
    // Assemble
    this.container.appendChild(this.actionsContainer);
    this.container.appendChild(this.mainButton);
    document.body.appendChild(this.container);
    
    // Create scroll progress indicator
    this.createScrollProgress();
    
    // Create quick bar for mobile
    this.createQuickBar();
  }
  
  createScrollProgress() {
    this.scrollProgressEl = document.createElement('div');
    this.scrollProgressEl.className = 'fab-scroll-progress';
    this.scrollProgressEl.innerHTML = `
      <svg viewBox="0 0 60 60">
        <circle class="progress-bg" cx="30" cy="30" r="28"></circle>
        <circle class="progress-fill" cx="30" cy="30" r="28"></circle>
      </svg>
    `;
    document.body.appendChild(this.scrollProgressEl);
    
    this.progressCircle = this.scrollProgressEl.querySelector('.progress-fill');
  }
  
  createQuickBar() {
    this.quickBar = document.createElement('div');
    this.quickBar.className = 'fab-quick-bar';
    
    const iconMap = {
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
    };
    
    this.config.quickBarActions.forEach(action => {
      const btn = document.createElement('a');
      btn.className = 'fab-quick-item';
      btn.href = action.url;
      btn.innerHTML = `${iconMap[action.icon]}<span>${action.label}</span>`;
      this.quickBar.appendChild(btn);
    });
    
    document.body.appendChild(this.quickBar);
    
    // Show quick bar on scroll for mobile
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.initMobileQuickBar();
    }
  }
  
  initMobileQuickBar() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateQuickBar = () => {
      const scrollY = window.scrollY;
      const scrollingDown = scrollY > lastScrollY;
      
      if (scrollY > 200 && scrollingDown) {
        this.quickBar.classList.add('visible');
      } else if (scrollY < 100 || !scrollingDown) {
        this.quickBar.classList.remove('visible');
      }
      
      lastScrollY = scrollY;
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateQuickBar);
        ticking = true;
      }
    }, { passive: true });
  }
  
  bindEvents() {
    // Toggle menu
    this.mainButton.addEventListener('click', () => this.toggle());
    
    // Close on backdrop click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Touch gestures for mobile
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      // Swipe up near bottom right to open FAB
      if (diff > 50 && e.changedTouches[0].clientX > window.innerWidth - 100) {
        if (!this.isOpen) this.open();
      }
    }, { passive: true });
  }
  
  initScrollProgress() {
    const circumference = 2 * Math.PI * 28; // r=28
    
    let ticking = false;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      
      const offset = circumference - (this.scrollProgress * circumference);
      if (this.progressCircle) {
        this.progressCircle.style.strokeDashoffset = offset;
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    
    // Initial update
    updateProgress();
  }
  
  initBackToTop() {
    this.backToTop = document.createElement('button');
    this.backToTop.className = 'fab-back-to-top';
    this.backToTop.setAttribute('aria-label', 'Back to top');
    this.backToTop.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    
    this.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.close();
    });
    
    document.body.appendChild(this.backToTop);
    
    // Show/hide based on scroll
    let ticking = false;
    const updateBackToTop = () => {
      if (window.scrollY > 500) {
        this.backToTop.classList.add('visible');
      } else {
        this.backToTop.classList.remove('visible');
      }
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBackToTop);
        ticking = true;
      }
    }, { passive: true });
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.isOpen = true;
    this.container.classList.add('active');
    this.mainButton.classList.add('active');
    this.mainButton.setAttribute('aria-expanded', 'true');
    
    // Announce to screen readers
    this.announceMenu(true);
  }
  
  close() {
    this.isOpen = false;
    this.container.classList.remove('active');
    this.mainButton.classList.remove('active');
    this.mainButton.setAttribute('aria-expanded', 'false');
    
    this.announceMenu(false);
  }
  
  announceMenu(isOpen) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position:absolute;left:-10000px;';
    announcement.textContent = isOpen ? 'Quick actions menu opened' : 'Quick actions menu closed';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
  
  sharePage() {
    const shareData = {
      title: document.title,
      text: 'Check out BuildBridge - Construction Management Experts',
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showToast('Link copied to clipboard');
      });
    }
  }
  
  showToast(message) {
    if (window.notificationCenter && window.notificationCenter.showToast) {
      window.notificationCenter.showToast({
        type: 'success',
        title: message,
        message: '',
        duration: 2000
      });
    }
  }
  
  // Public API methods
  addAction(action) {
    const actionEl = document.createElement('div');
    actionEl.className = 'fab-action';
    actionEl.innerHTML = `
      <span class="fab-action-label">${action.label}</span>
      <button class="fab-action-btn" aria-label="${action.label}">
        ${action.icon}
      </button>
    `;
    actionEl.querySelector('.fab-action-btn').addEventListener('click', () => {
      action.action();
      this.close();
    });
    this.actionsContainer.appendChild(actionEl);
  }
  
  removeAction(id) {
    const actions = this.actionsContainer.querySelectorAll('.fab-action');
    actions.forEach((action, index) => {
      if (this.config.actions[index] && this.config.actions[index].id === id) {
        action.remove();
      }
    });
  }
  
  updateBadge(count) {
    let badge = this.mainButton.querySelector('.fab-badge');
    
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'fab-badge';
        this.mainButton.appendChild(badge);
      }
      badge.textContent = count > 99 ? '99+' : count;
    } else if (badge) {
      badge.remove();
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.floatingActionMenu = new FloatingActionMenu();
});
