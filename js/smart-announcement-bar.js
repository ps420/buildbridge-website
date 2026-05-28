/**
 * Smart Announcement Bar - v39.0
 * Fortune 500 Professional Announcements
 * Features: Smart targeting, countdown timers, scheduled display, analytics
 */

class SmartAnnouncementBar {
  constructor(options = {}) {
    this.options = {
      storageKey: 'buildbridge_announcements',
      defaultDuration: 0, // 0 = infinite
      autoClose: false,
      autoCloseDelay: 5000,
      ...options
    };
    
    this.announcement = null;
    this.timer = null;
    this.countdownInterval = null;
    this.dismissedKey = null;
    
    this.init();
  }
  
  init() {
    // Check for stored dismissed announcements
    this.dismissedAnnouncements = this.getDismissedAnnouncements();
    
    // Check if there's a pending announcement in localStorage
    this.checkStoredAnnouncement();
    
    console.log('[Smart Announcement] Initialized');
  }
  
  // Create and show announcement
  show(config) {
    const defaults = {
      type: 'info',
      message: '',
      link: null,
      linkText: 'Learn more',
      action: null,
      actionText: 'Action',
      icon: null,
      duration: this.options.defaultDuration,
      dismissible: true,
      id: null,
      position: 'top',
      size: 'normal',
      countdown: null,
      target: null,
      displayOnce: true,
      delay: 0
    };
    
    const settings = { ...defaults, ...config };
    
    // Check if already dismissed
    if (settings.id && this.dismissedAnnouncements.includes(settings.id)) {
      return false;
    }
    
    // Check targeting
    if (settings.target && !this.checkTarget(settings.target)) {
      return false;
    }
    
    // Set dismissed key
    this.dismissedKey = settings.id;
    
    // Delay display if specified
    if (settings.delay > 0) {
      setTimeout(() => this.createAnnouncement(settings), settings.delay);
    } else {
      this.createAnnouncement(settings);
    }
    
    return true;
  }
  
  createAnnouncement(settings) {
    // Remove existing
    this.hide();
    
    // Create container
    this.announcement = document.createElement('div');
    this.announcement.className = `smart-announcement smart-announcement--${settings.type} smart-announcement--${settings.position} smart-announcement--${settings.size}`;
    this.announcement.setAttribute('role', 'alert');
    
    if (settings.id) {
      this.announcement.dataset.id = settings.id;
    }
    
    // Build content
    const icon = settings.icon || this.getDefaultIcon(settings.type);
    
    let contentHTML = '';
    
    if (settings.countdown) {
      contentHTML = this.buildCountdownContent(settings, icon);
    } else {
      contentHTML = this.buildStandardContent(settings, icon);
    }
    
    this.announcement.innerHTML = `
      <div class="smart-announcement__inner">
        <div class="smart-announcement__content">
          ${contentHTML}
        </div>
        ${settings.dismissible ? `
          <button class="smart-announcement__close" aria-label="Dismiss announcement">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
        ${settings.duration > 0 ? `
          <div class="smart-announcement__progress">
            <div class="smart-announcement__progress-bar"></div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(this.announcement);
    
    // Add body class for nav compensation
    document.body.classList.add(`has-announcement--${settings.size}`);
    
    // Bind events
    this.bindEvents(settings);
    
    // Trigger animation
    requestAnimationFrame(() => {
      this.announcement.classList.add('is-visible');
      
      // Track impression
      this.trackEvent('announcement_shown', { type: settings.type, id: settings.id });
    });
    
    // Start countdown if specified
    if (settings.countdown) {
      this.startCountdown(settings.countdown);
    }
    
    // Auto close if specified
    if (settings.duration > 0) {
      this.startAutoClose(settings.duration);
    } else if (this.options.autoClose) {
      this.startAutoClose(this.options.autoCloseDelay);
    }
  }
  
  buildStandardContent(settings, icon) {
    let html = '';
    
    if (icon) {
      html += `<span class="smart-announcement__icon">${icon}</span>`;
    }
    
    html += `<span class="smart-announcement__text">${settings.message}</span>`;
    
    if (settings.link) {
      html += `
        <a href="${settings.link}" class="smart-announcement__link" data-announcement-link>
          ${settings.linkText}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      `;
    }
    
    if (settings.action) {
      html += `
        <button class="smart-announcement__action" data-announcement-action>
          ${settings.actionText}
        </button>
      `;
    }
    
    return html;
  }
  
  buildCountdownContent(settings, icon) {
    const { endDate, prefix = '', suffix = '' } = settings.countdown;
    
    return `
      ${icon ? `<span class="smart-announcement__icon">${icon}</span>` : ''}
      <span class="smart-announcement__text">
        ${prefix}
        <span class="smart-announcement__countdown" data-countdown-end="${endDate}">
          <span class="days">00</span>d
          <span class="hours">00</span>h
          <span class="minutes">00</span>m
          <span class="seconds">00</span>s
        </span>
        ${suffix}
      </span>
      ${settings.link ? `
        <a href="${settings.link}" class="smart-announcement__link" data-announcement-link>
          ${settings.linkText}
        </a>
      ` : ''}
    `;
  }
  
  getDefaultIcon(type) {
    const icons = {
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      promo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v13M8 14l4 4 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    };
    return icons[type] || icons.info;
  }
  
  bindEvents(settings) {
    // Close button
    const closeBtn = this.announcement.querySelector('.smart-announcement__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(true));
    }
    
    // Link click
    const link = this.announcement.querySelector('[data-announcement-link]');
    if (link) {
      link.addEventListener('click', (e) => {
        this.trackEvent('announcement_link_click', { 
          type: settings.type, 
          id: settings.id,
          href: link.href 
        });
        
        if (settings.linkTarget === '_blank') {
          e.preventDefault();
          window.open(link.href, '_blank');
        }
      });
    }
    
    // Action button
    const actionBtn = this.announcement.querySelector('[data-announcement-action]');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        this.trackEvent('announcement_action_click', { 
          type: settings.type, 
          id: settings.id 
        });
        
        if (settings.action && typeof settings.action === 'function') {
          settings.action();
        }
      });
    }
  }
  
  startCountdown(countdownData) {
    const endDate = new Date(countdownData.endDate).getTime();
    const countdownEl = this.announcement.querySelector('.smart-announcement__countdown');
    
    if (!countdownEl) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        clearInterval(this.countdownInterval);
        countdownEl.innerHTML = '<span>Expired</span>';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      countdownEl.querySelector('.days').textContent = String(days).padStart(2, '0');
      countdownEl.querySelector('.hours').textContent = String(hours).padStart(2, '0');
      countdownEl.querySelector('.minutes').textContent = String(minutes).padStart(2, '0');
      countdownEl.querySelector('.seconds').textContent = String(seconds).padStart(2, '0');
    };
    
    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }
  
  startAutoClose(duration) {
    const progressBar = this.announcement.querySelector('.smart-announcement__progress-bar');
    
    if (progressBar) {
      progressBar.style.animation = `progress ${duration}ms linear forwards`;
    }
    
    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }
  
  dismiss(permanent = false) {
    if (permanent && this.dismissedKey) {
      this.addDismissedAnnouncement(this.dismissedKey);
    }
    
    this.trackEvent('announcement_dismissed', { 
      id: this.dismissedKey,
      permanent: permanent 
    });
    
    this.hide();
  }
  
  hide() {
    if (!this.announcement) return;
    
    // Clear timers
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    
    // Animate out
    this.announcement.classList.remove('is-visible');
    this.announcement.classList.add('is-dismissed');
    
    // Remove body classes
    document.body.classList.remove(
      'has-announcement',
      'has-announcement--compact',
      'has-announcement--normal',
      'has-announcement--large'
    );
    
    // Remove from DOM
    setTimeout(() => {
      if (this.announcement && this.announcement.parentNode) {
        this.announcement.remove();
      }
      this.announcement = null;
    }, 500);
  }
  
  checkTarget(target) {
    // Check URL path
    if (target.path && !window.location.pathname.match(new RegExp(target.path))) {
      return false;
    }
    
    // Check referrer
    if (target.referrer && !document.referrer.includes(target.referrer)) {
      return false;
    }
    
    // Check query params
    if (target.params) {
      const urlParams = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(target.params)) {
        if (urlParams.get(key) !== value) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // LocalStorage methods
  getDismissedAnnouncements() {
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
  
  addDismissedAnnouncement(id) {
    if (!this.dismissedAnnouncements.includes(id)) {
      this.dismissedAnnouncements.push(id);
      localStorage.setItem(
        this.options.storageKey, 
        JSON.stringify(this.dismissedAnnouncements)
      );
    }
  }
  
  clearDismissedAnnouncements() {
    this.dismissedAnnouncements = [];
    localStorage.removeItem(this.options.storageKey);
  }
  
  checkStoredAnnouncement() {
    // Check for emergency announcements that bypass dismiss
    const emergency = localStorage.getItem(`${this.options.storageKey}_emergency`);
    if (emergency) {
      const data = JSON.parse(emergency);
      if (data.expires > Date.now()) {
        this.show(data.config);
      } else {
        localStorage.removeItem(`${this.options.storageKey}_emergency`);
      }
    }
  }
  
  // Analytics
  trackEvent(event, data) {
    if (window.gtag) {
      window.gtag('event', event, data);
    }
    console.log(`[Announcement] ${event}:`, data);
  }
  
  // Public API methods
  showPromo(message, options = {}) {
    return this.show({
      type: 'promo',
      message,
      ...options
    });
  }
  
  showInfo(message, options = {}) {
    return this.show({
      type: 'info',
      message,
      ...options
    });
  }
  
  showSuccess(message, options = {}) {
    return this.show({
      type: 'success',
      message,
      ...options
    });
  }
  
  showWarning(message, options = {}) {
    return this.show({
      type: 'warning',
      message,
      ...options
    });
  }
  
  showError(message, options = {}) {
    return this.show({
      type: 'error',
      message,
      ...options
    });
  }
  
  showCountdown(endDate, message, options = {}) {
    return this.show({
      type: 'promo',
      message,
      countdown: { endDate, ...options.countdown },
      ...options
    });
  }
  
  showCookieConsent(message, onAccept, onDecline) {
    return this.show({
      type: 'cookies',
      message,
      position: 'bottom',
      size: 'large',
      dismissible: false,
      duration: 0,
      action: onAccept,
      actionText: 'Accept All',
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.announcementBar = new SmartAnnouncementBar();
  });
} else {
  window.announcementBar = new SmartAnnouncementBar();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartAnnouncementBar;
}
