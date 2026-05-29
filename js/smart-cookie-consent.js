/**
 * Smart Cookie Consent v81.3
 * Fortune 500 GDPR Compliant System
 */

(function() {
  'use strict';

  const CookieConsent = {
    config: {
      cookieName: 'buildbridge_cookie_consent',
      cookieExpiry: 365, // days
      categories: {
        necessary: {
          name: 'Necessary',
          description: 'Essential cookies required for the website to function properly.',
          required: true,
          default: true
        },
        analytics: {
          name: 'Analytics',
          description: 'Help us understand how visitors interact with our website.',
          required: false,
          default: false
        },
        marketing: {
          name: 'Marketing',
          description: 'Used to deliver personalized advertisements.',
          required: false,
          default: false
        },
        preferences: {
          name: 'Preferences',
          description: 'Remember your settings and preferences.',
          required: false,
          default: false
        }
      }
    },
    
    consent: null,
    elements: {},
    
    init() {
      this.loadConsent();
      this.cacheElements();
      this.bindEvents();
      
      // Show banner if no consent stored
      if (!this.consent) {
        this.showBanner();
      } else {
        this.applyConsent();
        this.showSettingsWidget();
      }
    },
    
    cacheElements() {
      this.elements = {
        overlay: document.querySelector('.cookie-consent-overlay'),
        banner: document.querySelector('.cookie-consent-banner'),
        preferencesModal: document.querySelector('.cookie-preferences-modal'),
        settingsWidget: document.querySelector('.cookie-settings-widget'),
        acceptAllBtn: document.querySelector('.cookie-accept-all'),
        acceptSelectedBtn: document.querySelector('.cookie-accept-selected'),
        rejectAllBtn: document.querySelector('.cookie-reject-all'),
        customizeBtn: document.querySelector('.cookie-customize'),
        savePreferencesBtn: document.querySelector('.cookie-save-preferences'),
        closeModalBtn: document.querySelector('.cookie-preferences-close'),
        openSettingsBtn: document.querySelector('.cookie-settings-btn')
      };
    },
    
    bindEvents() {
      // Banner buttons
      this.elements.acceptAllBtn?.addEventListener('click', () => this.acceptAll());
      this.elements.rejectAllBtn?.addEventListener('click', () => this.rejectAll());
      this.elements.customizeBtn?.addEventListener('click', () => this.openPreferences());
      
      // Modal buttons
      this.elements.acceptSelectedBtn?.addEventListener('click', () => this.savePreferences());
      this.elements.savePreferencesBtn?.addEventListener('click', () => this.savePreferences());
      this.elements.closeModalBtn?.addEventListener('click', () => this.closePreferences());
      
      // Settings widget
      this.elements.openSettingsBtn?.addEventListener('click', () => this.openPreferences());
      
      // Close modal on backdrop click
      this.elements.preferencesModal?.addEventListener('click', (e) => {
        if (e.target === this.elements.preferencesModal) {
          this.closePreferences();
        }
      });
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closePreferences();
        }
      });
    },
    
    loadConsent() {
      const stored = localStorage.getItem(this.config.cookieName);
      if (stored) {
        try {
          this.consent = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cookie consent:', e);
        }
      }
    },
    
    saveConsent(preferences) {
      this.consent = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        preferences: preferences
      };
      
      localStorage.setItem(this.config.cookieName, JSON.stringify(this.consent));
      this.applyConsent();
      this.showSettingsWidget();
    },
    
    acceptAll() {
      const preferences = {};
      Object.keys(this.config.categories).forEach(key => {
        preferences[key] = true;
      });
      
      this.saveConsent(preferences);
      this.hideBanner();
      this.showNotification('All cookies accepted', 'success');
    },
    
    rejectAll() {
      const preferences = {};
      Object.keys(this.config.categories).forEach(key => {
        preferences[key] = this.config.categories[key].required;
      });
      
      this.saveConsent(preferences);
      this.hideBanner();
      this.showNotification('Optional cookies rejected', 'info');
    },
    
    savePreferences() {
      const preferences = {};
      Object.keys(this.config.categories).forEach(key => {
        const toggle = document.querySelector(`.cookie-toggle[data-category="${key}"]`);
        preferences[key] = toggle ? toggle.checked : this.config.categories[key].default;
      });
      
      this.saveConsent(preferences);
      this.closePreferences();
      this.hideBanner();
      this.showNotification('Preferences saved', 'success');
    },
    
    applyConsent() {
      if (!this.consent) return;
      
      const { preferences } = this.consent;
      
      // Apply analytics
      if (preferences.analytics) {
        this.enableAnalytics();
      } else {
        this.disableAnalytics();
      }
      
      // Apply marketing
      if (preferences.marketing) {
        this.enableMarketing();
      } else {
        this.disableMarketing();
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
        detail: preferences 
      }));
    },
    
    enableAnalytics() {
      // Enable Google Analytics or similar
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }
    },
    
    disableAnalytics() {
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    },
    
    enableMarketing() {
      if (window.gtag) {
        window.gtag('consent', 'update', { ad_storage: 'granted' });
      }
    },
    
    disableMarketing() {
      if (window.gtag) {
        window.gtag('consent', 'update', { ad_storage: 'denied' });
      }
    },
    
    showBanner() {
      this.elements.overlay?.classList.add('visible');
      this.elements.banner?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    },
    
    hideBanner() {
      this.elements.overlay?.classList.remove('visible');
      this.elements.banner?.classList.remove('visible');
      document.body.style.overflow = '';
    },
    
    openPreferences() {
      this.populatePreferences();
      this.elements.preferencesModal?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    },
    
    closePreferences() {
      this.elements.preferencesModal?.classList.remove('visible');
      document.body.style.overflow = '';
    },
    
    populatePreferences() {
      const container = document.querySelector('.cookie-preferences-body');
      if (!container) return;
      
      container.innerHTML = Object.entries(this.config.categories).map(([key, category]) => `
        <div class="cookie-category">
          <div class="cookie-category-header">
            <div>
              <div class="cookie-category-title">${category.name}</div>
              ${category.required ? '<span class="cookie-category-badge required">Required</span>' : ''}
            </div>
            <input type="checkbox" 
                   class="cookie-toggle" 
                   data-category="${key}"
                   ${category.required ? 'checked disabled' : ''}
                   ${this.consent?.preferences?.[key] || category.default ? 'checked' : ''}>
          </div>
          <p class="cookie-category-description">${category.description}</p>
        </div>
      `).join('');
      
      // Re-bind toggle events
      container.querySelectorAll('.cookie-toggle:not([disabled])').forEach(toggle => {
        toggle.addEventListener('change', () => {
          this.updateAcceptSelectedButton();
        });
      });
      
      this.updateAcceptSelectedButton();
    },
    
    updateAcceptSelectedButton() {
      const hasAnalytics = document.querySelector('.cookie-toggle[data-category="analytics"]')?.checked;
      const btn = this.elements.acceptSelectedBtn;
      if (btn) {
        btn.textContent = hasAnalytics ? 'Accept Selected' : 'Accept Necessary Only';
      }
    },
    
    showSettingsWidget() {
      this.elements.settingsWidget?.classList.add('visible');
    },
    
    showNotification(message, type = 'info') {
      // Simple toast notification
      const toast = document.createElement('div');
      toast.className = `cookie-notification cookie-notification-${type}`;
      toast.innerHTML = `
        <span>${message}</span>
      `;
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(15, 15, 16, 0.95);
        color: #F5F7FA;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        z-index: 100001;
        opacity: 0;
        transition: all 0.3s ease;
        border: 1px solid rgba(201, 206, 214, 0.1);
      `;
      
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },
    
    // Public API
    hasConsent(category) {
      return this.consent?.preferences?.[category] || false;
    },
    
    reset() {
      localStorage.removeItem(this.config.cookieName);
      this.consent = null;
      this.showBanner();
      this.elements.settingsWidget?.classList.remove('visible');
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
  } else {
    CookieConsent.init();
  }

  window.BuildBridgeCookieConsent = CookieConsent;
})();
