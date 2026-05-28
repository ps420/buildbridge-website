/**
 * v50.0: Professional Cookie Consent System
 * Fortune 500 GDPR/CCPA Compliant Cookie Management
 */

(function() {
  'use strict';

  const COOKIE_CONFIG = {
    storageKey: 'buildbridge_cookie_consent',
    version: '1.0',
    expiryDays: 365,
    cookieTypes: {
      necessary: {
        name: 'Necessary',
        description: 'Essential cookies required for the website to function properly. These cannot be disabled.',
        required: true,
        cookies: ['session', 'csrf', 'cookie_consent']
      },
      analytics: {
        name: 'Analytics',
        description: 'Help us understand how visitors interact with our website by collecting anonymous data.',
        required: false,
        cookies: ['_ga', '_gid', '_gat']
      },
      marketing: {
        name: 'Marketing',
        description: 'Used to deliver personalized advertisements and measure their effectiveness.',
        required: false,
        cookies: ['_fbp', 'fr', 'tr']
      },
      preferences: {
        name: 'Preferences',
        description: 'Remember your settings and preferences for a better experience.',
        required: false,
        cookies: ['theme', 'language', 'font_size']
      }
    }
  };

  class CookieConsent {
    constructor() {
      this.consent = null;
      this.modalOpen = false;
      this.init();
    }

    init() {
      this.loadConsent();
      this.createDOM();
      this.attachEvents();
      
      // Show banner if no consent or version mismatch
      if (!this.consent || this.consent.version !== COOKIE_CONFIG.version) {
        this.showBanner();
      } else {
        this.applyConsent();
        this.showSettingsButton();
      }
    }

    loadConsent() {
      try {
        const saved = localStorage.getItem(COOKIE_CONFIG.storageKey);
        if (saved) {
          this.consent = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load cookie consent');
      }
    }

    saveConsent(preferences) {
      this.consent = {
        version: COOKIE_CONFIG.version,
        date: new Date().toISOString(),
        preferences: preferences
      };

      try {
        localStorage.setItem(COOKIE_CONFIG.storageKey, JSON.stringify(this.consent));
      } catch (e) {
        console.warn('Failed to save cookie consent');
      }

      this.applyConsent();
      this.hideBanner();
      this.showSettingsButton();
      this.hideModal();
    }

    applyConsent() {
      if (!this.consent) return;

      const p = this.consent.preferences;

      // Apply analytics
      if (p.analytics) {
        this.enableAnalytics();
      } else {
        this.disableAnalytics();
      }

      // Apply marketing
      if (p.marketing) {
        this.enableMarketing();
      } else {
        this.disableMarketing();
      }

      // Apply preferences
      if (p.preferences) {
        this.enablePreferences();
      }

      // Dispatch event
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
        detail: this.consent.preferences 
      }));
    }

    enableAnalytics() {
      // Enable Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
      console.log('Analytics enabled');
    }

    disableAnalytics() {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
      // Clear analytics cookies
      this.clearCookies(['_ga', '_gid', '_gat']);
      console.log('Analytics disabled');
    }

    enableMarketing() {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
      console.log('Marketing enabled');
    }

    disableMarketing() {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
      this.clearCookies(['_fbp', 'fr', 'tr']);
      console.log('Marketing disabled');
    }

    enablePreferences() {
      console.log('Preferences enabled');
    }

    clearCookies(names) {
      const domain = window.location.hostname;
      names.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      });
    }

    createDOM() {
      // Banner
      const banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.id = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie Consent');
      banner.innerHTML = `
        <div class="cookie-banner-header">
          <div class="cookie-icon">🍪</div>
          <div class="cookie-banner-title">
            <h3>We value your privacy</h3>
            <p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
          </div>
        </div>
        <div class="cookie-banner-actions">
          <button class="cookie-btn cookie-btn-primary" id="cookie-accept-all">
            Accept All
          </button>
          <button class="cookie-btn cookie-btn-secondary" id="cookie-reject-all">
            Reject All
          </button>
          <button class="cookie-btn cookie-btn-text" id="cookie-customize">
            Customize Preferences
          </button>
        </div>
      `;
      document.body.appendChild(banner);
      this.banner = banner;

      // Modal
      const modal = document.createElement('div');
      modal.className = 'cookie-modal';
      modal.id = 'cookie-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'cookie-modal-title');
      document.body.appendChild(modal);
      this.modal = modal;

      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'cookie-modal-overlay';
      overlay.id = 'cookie-overlay';
      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Settings Button
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'cookie-settings-btn';
      settingsBtn.id = 'cookie-settings-btn';
      settingsBtn.setAttribute('aria-label', 'Cookie Settings');
      settingsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      `;
      document.body.appendChild(settingsBtn);
      this.settingsBtn = settingsBtn;
    }

    attachEvents() {
      // Banner buttons
      this.banner.querySelector('#cookie-accept-all').addEventListener('click', () => {
        this.saveConsent({
          necessary: true,
          analytics: true,
          marketing: true,
          preferences: true
        });
      });

      this.banner.querySelector('#cookie-reject-all').addEventListener('click', () => {
        this.saveConsent({
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false
        });
      });

      this.banner.querySelector('#cookie-customize').addEventListener('click', () => {
        this.showModal();
      });

      // Settings button
      this.settingsBtn.addEventListener('click', () => {
        this.showModal();
      });

      // Overlay click
      this.overlay.addEventListener('click', () => {
        this.hideModal();
      });

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modalOpen) {
          this.hideModal();
        }
      });
    }

    showBanner() {
      setTimeout(() => {
        this.banner.classList.add('visible');
      }, 1000);
    }

    hideBanner() {
      this.banner.classList.remove('visible');
    }

    showSettingsButton() {
      this.settingsBtn.classList.add('visible');
    }

    showModal() {
      this.renderModal();
      this.modalOpen = true;
      this.modal.classList.add('visible');
      this.overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }

    hideModal() {
      this.modalOpen = false;
      this.modal.classList.remove('visible');
      this.overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }

    renderModal() {
      const prefs = this.consent?.preferences || {};

      this.modal.innerHTML = `
        <div class="cookie-modal-header">
          <div class="cookie-modal-title">
            <h2 id="cookie-modal-title">Cookie Preferences</h2>
            <p>Manage your cookie preferences below</p>
          </div>
          <button class="cookie-modal-close" id="cookie-modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="cookie-modal-content">
          ${Object.entries(COOKIE_CONFIG.cookieTypes).map(([key, type]) => `
            <div class="cookie-category">
              <div class="cookie-category-header">
                <div class="cookie-category-title">
                  <div class="cookie-category-icon">
                    ${key === 'necessary' ? '🔒' : key === 'analytics' ? '📊' : key === 'marketing' ? '📢' : '⚙️'}
                  </div>
                  <div>
                    <h4>${type.name}</h4>
                    ${type.required ? '<span>Required</span>' : ''}
                  </div>
                </div>
                <div class="cookie-toggle ${prefs[key] !== false ? 'active' : ''} ${type.required ? 'disabled' : ''}" 
                     data-cookie-type="${key}">
                  <div class="cookie-toggle-knob"></div>
                </div>
              </div>
              <p>${type.description}</p>
              <div class="cookie-types">
                ${type.cookies.map(c => `<span class="cookie-type-tag">${c}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cookie-modal-footer">
          <p>Read our <a href="/privacy-policy.html" target="_blank">Privacy Policy</a> for more information</p>
          <div style="display: flex; gap: 12px;">
            <button class="cookie-btn cookie-btn-secondary" id="cookie-modal-cancel">Cancel</button>
            <button class="cookie-btn cookie-btn-primary" id="cookie-modal-save">Save Preferences</button>
          </div>
        </div>
      `;

      // Modal events
      this.modal.querySelector('#cookie-modal-close').addEventListener('click', () => {
        this.hideModal();
      });

      this.modal.querySelector('#cookie-modal-cancel').addEventListener('click', () => {
        this.hideModal();
      });

      this.modal.querySelector('#cookie-modal-save').addEventListener('click', () => {
        this.saveConsent({
          necessary: true,
          analytics: this.isToggleActive('analytics'),
          marketing: this.isToggleActive('marketing'),
          preferences: this.isToggleActive('preferences')
        });
      });

      // Toggle clicks
      this.modal.querySelectorAll('.cookie-toggle:not(.disabled)').forEach(toggle => {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('active');
        });
      });
    }

    isToggleActive(type) {
      const toggle = this.modal.querySelector(`[data-cookie-type="${type}"]`);
      return toggle?.classList.contains('active');
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CookieConsent());
  } else {
    new CookieConsent();
  }
})();
