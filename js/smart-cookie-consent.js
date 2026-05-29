/**
 * BuildBridge - Smart Cookie Consent
 * Fortune 500 GDPR-Compliant Cookie Manager
 */

class SmartCookieConsent {
  constructor(options = {}) {
    this.options = {
      autoShow: true,
      cookieName: 'buildbridge_cookie_consent',
      cookieExpiry: 365,
      showDelay: 1500,
      position: 'bottom',
      theme: 'dark',
      ...options
    };
    
    this.consent = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      functional: false,
      preferences: false
    };
    
    this.cookies = {
      necessary: [
        { name: 'buildbridge_session', provider: 'BuildBridge', expiry: 'Session', description: 'Maintains user session state' },
        { name: 'buildbridge_consent', provider: 'BuildBridge', expiry: '1 year', description: 'Stores cookie consent preferences' },
        { name: 'csrf_token', provider: 'BuildBridge', expiry: 'Session', description: 'Security token for form submissions' }
      ],
      analytics: [
        { name: '_ga', provider: 'Google Analytics', expiry: '2 years', description: 'Distinguishes unique users' },
        { name: '_gid', provider: 'Google Analytics', expiry: '24 hours', description: 'Distinguishes unique users' },
        { name: '_gat', provider: 'Google Analytics', expiry: '1 minute', description: 'Throttles request rate' }
      ],
      marketing: [
        { name: '_fbp', provider: 'Meta', expiry: '3 months', description: 'Facebook Pixel identifier' },
        { name: '_gcl_au', provider: 'Google', expiry: '90 days', description: 'Google Ads conversion tracking' }
      ],
      functional: [
        { name: 'buildbridge_language', provider: 'BuildBridge', expiry: '1 year', description: 'Stores language preference' },
        { name: 'buildbridge_theme', provider: 'BuildBridge', expiry: '1 year', description: 'Stores theme preference' }
      ],
      preferences: [
        { name: 'buildbridge_notifications', provider: 'BuildBridge', expiry: '1 year', description: 'Notification preferences' }
      ]
    };
    
    this.init();
  }
  
  init() {
    this.loadConsent();
    this.render();
    this.setupEventListeners();
    
    if (this.options.autoShow && !this.hasConsent()) {
      setTimeout(() => this.showBanner(), this.options.showDelay);
    } else if (this.hasConsent()) {
      this.applyConsent();
    }
  }
  
  loadConsent() {
    const saved = this.getCookie(this.options.cookieName);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.consent = { ...this.consent, ...parsed };
      } catch (e) {
        console.warn('Failed to parse cookie consent');
      }
    }
  }
  
  saveConsent() {
    const consentData = {
      ...this.consent,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    this.setCookie(this.options.cookieName, JSON.stringify(consentData), this.options.cookieExpiry);
  }
  
  hasConsent() {
    return !!this.getCookie(this.options.cookieName);
  }
  
  applyConsent() {
    // Apply analytics if consented
    if (this.consent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Apply marketing if consented
    if (this.consent.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }
    
    // Apply functional if consented
    if (this.consent.functional) {
      this.enableFunctional();
    }
    
    // Fire consent change event
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: this.consent }));
  }
  
  enableAnalytics() {
    // Enable Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
    
    // Enable other analytics
    document.querySelectorAll('[data-analytics-disabled]').forEach(el => {
      el.removeAttribute('data-analytics-disabled');
    });
  }
  
  disableAnalytics() {
    // Disable Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
    
    // Block analytics cookies
    this.blockCookies('analytics');
  }
  
  enableMarketing() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
  }
  
  disableMarketing() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    this.blockCookies('marketing');
  }
  
  enableFunctional() {
    // Functional cookies are enabled by default
  }
  
  blockCookies(category) {
    // Block specific cookies from being set
    const cookies = this.cookies[category] || [];
    cookies.forEach(cookie => {
      if (this.getCookie(cookie.name)) {
        this.deleteCookie(cookie.name);
      }
    });
  }
  
  render() {
    // Check if already rendered
    if (document.querySelector('.cookie-consent-banner')) return;
    
    const banner = document.createElement('div');
    banner.className = `cookie-consent-banner ${this.options.theme}`;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie Consent');
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h2 class="cookie-banner-title">
            <span>🍪</span>
            Cookie Preferences
          </h2>
          <p class="cookie-banner-description">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            <a href="privacy.html" target="_blank">Read our Cookie Policy</a>
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button class="cookie-btn cookie-btn-primary" id="cookieAcceptAll">
            Accept All
          </button>
          <button class="cookie-btn cookie-btn-secondary" id="cookieCustomize">
            Customize
          </button>
          <button class="cookie-btn cookie-btn-text" id="cookieRejectAll">
            Reject All
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    this.banner = banner;
    
    // Create preferences modal
    this.renderPreferencesModal();
    
    // Create widget button
    this.renderWidget();
    
    // Create toast container
    this.renderToast();
  }
  
  renderPreferencesModal() {
    const modal = document.createElement('div');
    modal.className = 'cookie-preferences-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cookie Preferences Settings');
    
    const categoriesHTML = Object.entries(this.cookies).map(([key, cookies]) => `
      <div class="cookie-category" data-category="${key}">
        <div class="cookie-category-header">
          <div class="cookie-category-title">
            <h3>${this.getCategoryLabel(key)}</h3>
            ${key === 'necessary' ? '<span class="cookie-category-badge required">Required</span>' : ''}
          </div>
          <label class="cookie-toggle">
            <input type="checkbox" data-category="${key}" ${this.consent[key] ? 'checked' : ''} ${key === 'necessary' ? 'disabled' : ''}>
            <span class="cookie-toggle-slider"></span>
          </label>
        </div>
        <p class="cookie-category-description">
          ${this.getCategoryDescription(key)}
        </p>
        <div class="cookie-details">
          <div class="cookie-details-toggle">
            <span>View ${cookies.length} cookies <svg class="cookie-details-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          </div>
          <div class="cookie-details-list">
            ${cookies.map(cookie => `
              <div class="cookie-detail-item">
                <span class="cookie-detail-name">${cookie.name}</span>
                <span class="cookie-detail-value">${cookie.provider} • ${cookie.expiry}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div class="cookie-preferences-content">
        <div class="cookie-preferences-header">
          <h2><span>⚙️</span> Cookie Preferences</h2>
          <button class="cookie-preferences-close" aria-label="Close">×</button>
        </div>
        <div class="cookie-preferences-body">
          <p class="cookie-intro">
            Manage your cookie preferences below. Necessary cookies are always enabled as they are essential for the website to function. 
            For more information, please read our <a href="privacy.html" target="_blank">Privacy Policy</a>.
          </p>
          ${categoriesHTML}
        </div>
        <div class="cookie-preferences-footer">
          <button class="cookie-btn cookie-btn-secondary" id="cookieSavePreferences">
            Save Preferences
          </button>
          <button class="cookie-btn cookie-btn-primary" id="cookieAcceptAllModal">
            Accept All
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Setup details toggles
    modal.querySelectorAll('.cookie-details-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.parentElement.classList.toggle('expanded');
      });
    });
  }
  
  renderWidget() {
    const widget = document.createElement('div');
    widget.className = 'cookie-widget';
    widget.setAttribute('aria-label', 'Manage cookie preferences');
    widget.setAttribute('role', 'button');
    widget.setAttribute('tabindex', '0');
    widget.innerHTML = '🍪';
    widget.title = 'Cookie Preferences';
    
    document.body.appendChild(widget);
    this.widget = widget;
    
    // Show widget after initial interaction
    setTimeout(() => {
      if (this.hasConsent()) {
        widget.classList.add('visible');
      }
    }, 5000);
  }
  
  renderToast() {
    const toast = document.createElement('div');
    toast.className = 'cookie-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="cookie-toast-icon">✓</div>
      <div class="cookie-toast-content">
        <h4>Preferences Saved</h4>
        <p>Your cookie preferences have been updated.</p>
      </div>
    `;
    
    document.body.appendChild(toast);
    this.toast = toast;
  }
  
  setupEventListeners() {
    // Banner buttons
    const acceptAll = this.banner?.querySelector('#cookieAcceptAll');
    const customize = this.banner?.querySelector('#cookieCustomize');
    const rejectAll = this.banner?.querySelector('#cookieRejectAll');
    
    acceptAll?.addEventListener('click', () => this.acceptAll());
    customize?.addEventListener('click', () => this.showPreferences());
    rejectAll?.addEventListener('click', () => this.rejectAll());
    
    // Modal buttons
    const closeModal = this.modal?.querySelector('.cookie-preferences-close');
    const savePreferences = this.modal?.querySelector('#cookieSavePreferences');
    const acceptAllModal = this.modal?.querySelector('#cookieAcceptAllModal');
    
    closeModal?.addEventListener('click', () => this.hidePreferences());
    savePreferences?.addEventListener('click', () => this.savePreferences());
    acceptAllModal?.addEventListener('click', () => {
      this.acceptAll();
      this.hidePreferences();
    });
    
    // Category toggles
    this.modal?.querySelectorAll('.cookie-toggle input:not(:disabled)').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const category = e.target.dataset.category;
        this.consent[category] = e.target.checked;
      });
    });
    
    // Widget
    this.widget?.addEventListener('click', () => this.showPreferences());
    this.widget?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showPreferences();
      }
    });
    
    // Close modal on backdrop click
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hidePreferences();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('visible')) {
        this.hidePreferences();
      }
    });
  }
  
  showBanner() {
    this.banner?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  
  hideBanner() {
    this.banner?.classList.remove('visible');
    document.body.style.overflow = '';
    
    // Show widget after hiding banner
    setTimeout(() => {
      this.widget?.classList.add('visible');
    }, 500);
  }
  
  showPreferences() {
    this.modal?.classList.add('visible');
    document.body.style.overflow = 'hidden';
    
    // Update toggles to match current consent
    this.modal?.querySelectorAll('.cookie-toggle input').forEach(toggle => {
      const category = toggle.dataset.category;
      toggle.checked = this.consent[category];
    });
    
    // Focus management
    const closeBtn = this.modal?.querySelector('.cookie-preferences-close');
    closeBtn?.focus();
  }
  
  hidePreferences() {
    this.modal?.classList.remove('visible');
    document.body.style.overflow = '';
  }
  
  acceptAll() {
    Object.keys(this.consent).forEach(key => {
      this.consent[key] = true;
    });
    
    this.saveConsent();
    this.applyConsent();
    this.hideBanner();
    this.showToast('All cookies accepted', 'Your preferences have been saved.');
  }
  
  rejectAll() {
    // Only keep necessary cookies
    Object.keys(this.consent).forEach(key => {
      this.consent[key] = key === 'necessary';
    });
    
    this.saveConsent();
    this.applyConsent();
    this.hideBanner();
    this.showToast('Cookies rejected', 'Only necessary cookies are now active.');
  }
  
  savePreferences() {
    this.saveConsent();
    this.applyConsent();
    this.hidePreferences();
    this.hideBanner();
    this.showToast('Preferences saved', 'Your cookie settings have been updated.');
  }
  
  showToast(title, message) {
    if (!this.toast) return;
    
    this.toast.querySelector('h4').textContent = title;
    this.toast.querySelector('p').textContent = message;
    this.toast.classList.add('visible', 'success');
    
    setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 4000);
  }
  
  getCategoryLabel(key) {
    const labels = {
      necessary: 'Necessary',
      analytics: 'Analytics',
      marketing: 'Marketing',
      functional: 'Functional',
      preferences: 'Preferences'
    };
    return labels[key] || key;
  }
  
  getCategoryDescription(key) {
    const descriptions = {
      necessary: 'Essential cookies required for the website to function properly. These cannot be disabled.',
      analytics: 'Help us understand how visitors interact with our website by collecting anonymous data.',
      marketing: 'Used to deliver personalized advertisements and measure their effectiveness.',
      functional: 'Enable enhanced functionality and personalization, such as language preferences.',
      preferences: 'Remember your settings and preferences for a better experience.'
    };
    return descriptions[key] || '';
  }
  
  // Cookie utilities
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
  
  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
  
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  }
  
  // Public API
  getConsent() {
    return { ...this.consent };
  }
  
  hasCategory(category) {
    return this.consent[category] === true;
  }
  
  openPreferences() {
    this.showPreferences();
  }
  
  reset() {
    this.deleteCookie(this.options.cookieName);
    location.reload();
  }
}

// Auto-initialize
let cookieConsent;

document.addEventListener('DOMContentLoaded', () => {
  cookieConsent = new SmartCookieConsent();
  window.cookieConsent = cookieConsent;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartCookieConsent;
}
