/**
 * Cookie Consent System v1.0
 * Fortune 500 Grade GDPR Compliance
 * Fully featured cookie management with granular control
 */

class CookieConsentSystem {
  constructor() {
    this.consentKey = 'buildbridge_cookie_consent';
    this.consentVersion = '1.0';
    this.consent = this.loadConsent();
    
    this.categories = {
      necessary: {
        id: 'necessary',
        name: 'Necessary',
        description: 'Essential cookies required for the website to function properly. These cannot be disabled.',
        required: true,
        icon: '🔒',
        cookies: [
          { name: 'session_id', duration: 'Session', purpose: 'Maintains your session' },
          { name: 'cookie_consent', duration: '1 year', purpose: 'Stores your consent preferences' }
        ]
      },
      analytics: {
        id: 'analytics',
        name: 'Analytics',
        description: 'Help us understand how visitors interact with our website by collecting anonymous data.',
        required: false,
        icon: '📊',
        cookies: [
          { name: '_ga', duration: '2 years', purpose: 'Google Analytics tracking' },
          { name: '_gid', duration: '24 hours', purpose: 'Google Analytics user ID' }
        ]
      },
      marketing: {
        id: 'marketing',
        name: 'Marketing',
        description: 'Used to deliver personalized advertisements and measure their effectiveness.',
        required: false,
        icon: '📢',
        cookies: [
          { name: '_fbp', duration: '90 days', purpose: 'Facebook Pixel tracking' },
          { name: 'ads_prefs', duration: '1 year', purpose: 'Ad preference storage' }
        ]
      },
      functional: {
        id: 'functional',
        name: 'Functional',
        description: 'Enable enhanced functionality and personalization, such as remembering preferences.',
        required: false,
        icon: '⚙️',
        cookies: [
          { name: 'theme_pref', duration: '1 year', purpose: 'Dark/light mode preference' },
          { name: 'lang', duration: '1 year', purpose: 'Language preference' }
        ]
      }
    };
    
    this.init();
  }
  
  init() {
    // Check if consent was already given
    if (!this.consent || this.consent.version !== this.consentVersion) {
      this.showBanner();
    }
    
    // Initialize widgets
    this.createFloatingWidget();
    this.createMiniIndicator();
    
    // Apply consent settings
    this.applyConsent();
    
    console.log('🍪 Cookie Consent System initialized');
  }
  
  loadConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }
  
  saveConsent(choices) {
    this.consent = {
      version: this.consentVersion,
      timestamp: new Date().toISOString(),
      choices: choices
    };
    
    try {
      localStorage.setItem(this.consentKey, JSON.stringify(this.consent));
    } catch (e) {
      console.warn('Could not save cookie consent');
    }
    
    this.applyConsent();
    this.updateIndicator();
  }
  
  getDefaultChoices() {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
  }
  
  showBanner() {
    // Remove existing banner
    const existing = document.querySelector('.cookie-banner');
    if (existing) existing.remove();
    
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-content">
          <h3 class="cookie-banner-title">We value your privacy</h3>
          <p class="cookie-banner-text">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            <a href="privacy.html">Read our Cookie Policy</a>
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button class="cookie-btn cookie-btn-tertiary" data-action="customize">Customize</button>
          <button class="cookie-btn cookie-btn-secondary" data-action="reject">Reject All</button>
          <button class="cookie-btn cookie-btn-primary" data-action="accept">Accept All</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Trigger animation
    requestAnimationFrame(() => {
      banner.classList.add('active');
    });
    
    // Event listeners
    banner.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleBannerAction(action, banner);
      });
    });
  }
  
  hideBanner(banner) {
    banner.classList.remove('active');
    setTimeout(() => banner.remove(), 600);
  }
  
  handleBannerAction(action, banner) {
    switch (action) {
      case 'accept':
        this.saveConsent({
          necessary: true,
          analytics: true,
          marketing: true,
          functional: true
        });
        this.hideBanner(banner);
        this.showToast('All cookies accepted', 'success');
        break;
        
      case 'reject':
        this.saveConsent({
          necessary: true,
          analytics: false,
          marketing: false,
          functional: false
        });
        this.hideBanner(banner);
        this.showToast('Only necessary cookies enabled', 'info');
        break;
        
      case 'customize':
        this.hideBanner(banner);
        this.showModal();
        break;
    }
  }
  
  showModal() {
    // Remove existing modal
    const existing = document.querySelector('.cookie-modal-overlay');
    if (existing) existing.remove();
    
    const choices = this.consent?.choices || this.getDefaultChoices();
    
    const overlay = document.createElement('div');
    overlay.className = 'cookie-modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'cookie-modal';
    
    modal.innerHTML = `
      <div class="cookie-modal-header" style="position: relative;">
        <h2 class="cookie-modal-title">Cookie Preferences</h2>
        <p class="cookie-modal-subtitle">Manage your cookie preferences below. Necessary cookies are always enabled as they are essential for the website to function.</p>
        <button class="cookie-modal-close" aria-label="Close">×</button>
      </div>
      <div class="cookie-modal-body">
        ${Object.values(this.categories).map(cat => this.renderCategory(cat, choices[cat.id])).join('')}
      </div>
      <div class="cookie-modal-footer">
        <button class="cookie-btn cookie-btn-secondary" data-modal-action="reject">Reject All</button>
        <button class="cookie-btn cookie-btn-primary" data-modal-action="save">Save Preferences</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    modal.querySelector('.cookie-modal-close').addEventListener('click', () => {
      this.hideModal(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hideModal(overlay);
    });
    
    modal.querySelectorAll('[data-modal-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.modalAction;
        if (action === 'reject') {
          this.saveConsent(this.getDefaultChoices());
          this.hideModal(overlay);
          this.showToast('Preferences saved', 'success');
        } else if (action === 'save') {
          const newChoices = { necessary: true };
          modal.querySelectorAll('.cookie-toggle[data-category]').forEach(toggle => {
            newChoices[toggle.dataset.category] = toggle.classList.contains('active');
          });
          this.saveConsent(newChoices);
          this.hideModal(overlay);
          this.showToast('Preferences saved', 'success');
        }
      });
    });
    
    // Toggle listeners
    modal.querySelectorAll('.cookie-toggle:not(.disabled)').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    });
    
    // Keyboard trap
    this.trapFocus(modal);
    
    // Show modal
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  }
  
  hideModal(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
  }
  
  renderCategory(category, enabled) {
    const isRequired = category.required;
    const toggleClass = isRequired ? 'disabled' : (enabled ? 'active' : '');
    const badge = isRequired 
      ? '<span class="cookie-category-badge required">Required</span>' 
      : '';
    
    return `
      <div class="cookie-category">
        <div class="cookie-category-header">
          <div class="cookie-category-title">
            <span class="cookie-category-icon">${category.icon}</span>
            ${category.name}
            ${badge}
          </div>
          <div class="cookie-toggle ${toggleClass}" data-category="${category.id}">
            <div class="cookie-toggle-slider"></div>
          </div>
        </div>
        <p class="cookie-category-description">${category.description}</p>
        <div class="cookie-details">
          <div class="cookie-details-row">
            <span class="cookie-details-label">Cookies in this category:</span>
            <span class="cookie-details-value">${category.cookies.length}</span>
          </div>
          <ul class="cookie-list">
            ${category.cookies.map(c => `
              <li>
                <span class="cookie-name">${c.name}</span>
                <span class="cookie-duration">${c.duration}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
  
  createFloatingWidget() {
    const widget = document.createElement('div');
    widget.className = 'cookie-widget';
    widget.innerHTML = '🍪';
    widget.setAttribute('aria-label', 'Manage cookie preferences');
    widget.setAttribute('role', 'button');
    widget.setAttribute('tabindex', '0');
    
    widget.addEventListener('click', () => this.showModal());
    widget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showModal();
      }
    });
    
    // Show widget after delay
    setTimeout(() => {
      document.body.appendChild(widget);
    }, 2000);
  }
  
  createMiniIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'cookie-indicator';
    indicator.innerHTML = `
      <span class="cookie-indicator-status"></span>
      <span class="cookie-indicator-text">Cookie Settings</span>
    `;
    
    indicator.addEventListener('click', () => this.showModal());
    
    document.body.appendChild(indicator);
    this.indicator = indicator;
    this.updateIndicator();
  }
  
  updateIndicator() {
    if (!this.indicator || !this.consent) return;
    
    const choices = this.consent.choices;
    const allEnabled = Object.entries(choices).every(([k, v]) => k === 'necessary' || v);
    const someEnabled = Object.entries(choices).some(([k, v]) => k !== 'necessary' && v);
    
    const status = this.indicator.querySelector('.cookie-indicator-status');
    
    if (allEnabled) {
      status.className = 'cookie-indicator-status';
    } else if (someEnabled) {
      status.className = 'cookie-indicator-status partial';
    } else {
      status.className = 'cookie-indicator-status';
      status.style.background = '#6B7280';
    }
  }
  
  applyConsent() {
    if (!this.consent) return;
    
    const { choices } = this.consent;
    
    // Emit event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieconsentchange', { 
      detail: choices 
    }));
    
    // Enable/disable analytics
    if (choices.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Enable/disable marketing
    if (choices.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }
    
    console.log('🍪 Cookie preferences applied:', choices);
  }
  
  enableAnalytics() {
    window.gtagConsentGranted = true;
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }
  
  disableAnalytics() {
    window.gtagConsentGranted = false;
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
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
  }
  
  showToast(message, type = 'info') {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
  
  trapFocus(element) {
    const focusable = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    first?.focus();
    
    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
  
  // Public API
  getConsent() {
    return this.consent;
  }
  
  hasConsent(category) {
    return this.consent?.choices?.[category] || false;
  }
  
  resetConsent() {
    localStorage.removeItem(this.consentKey);
    this.consent = null;
    this.showBanner();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsentSystem();
  });
} else {
  window.cookieConsent = new CookieConsentSystem();
}
