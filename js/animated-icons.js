/**
 * BuildBridge Animated SVG Icon System
 * Professional animated icons to replace emojis
 * Version: 1.0.0
 */

const AnimatedIcons = {
  // Service Icons
  consultation: `
    <svg class="icon-animated icon-consultation" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle class="icon-circle" cx="32" cy="20" r="8" stroke="currentColor" stroke-width="2"/>
      <path class="icon-path" d="M16 52C16 43.163 23.163 36 32 36C40.837 36 48 43.163 48 52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle class="icon-pulse" cx="48" cy="16" r="4" fill="currentColor" opacity="0.5"/>
    </svg>
  `,
  
  contractor: `
    <svg class="icon-animated icon-contractor" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="icon-handshake-left" d="M20 36L12 44L20 52" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="icon-handshake-right" d="M44 36L52 44L44 52" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="icon-handshake-center" d="M16 44H48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle class="icon-dot-left" cx="20" cy="24" r="4" fill="currentColor"/>
      <circle class="icon-dot-right" cx="44" cy="24" r="4" fill="currentColor"/>
    </svg>
  `,
  
  management: `
    <svg class="icon-animated icon-management" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect class="icon-rect" x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
      <path class="icon-chart" d="M20 44L28 32L36 38L44 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle class="icon-point-1" cx="28" cy="32" r="2" fill="currentColor"/>
      <circle class="icon-point-2" cx="36" cy="38" r="2" fill="currentColor"/>
      <circle class="icon-point-3" cx="44" cy="24" r="2" fill="currentColor"/>
    </svg>
  `,
  
  quality: `
    <svg class="icon-animated icon-quality" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="icon-shield" d="M32 8L48 16V32C48 44 32 56 32 56C32 56 16 44 16 32V16L32 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path class="icon-check" d="M24 32L30 38L40 26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  
  // Process Icons
  chat: `
    <svg class="icon-animated icon-chat" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect class="icon-bubble" x="8" y="12" width="48" height="36" rx="8" stroke="currentColor" stroke-width="2"/>
      <path class="icon-tail" d="M24 48L20 56L32 48" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <line class="icon-line-1" x1="20" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line class="icon-line-2" x1="20" y1="32" x2="36" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line class="icon-line-3" x1="20" y1="40" x2="28" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  
  search: `
    <svg class="icon-animated icon-search" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle class="icon-circle" cx="28" cy="28" r="14" stroke="currentColor" stroke-width="2"/>
      <path class="icon-handle" d="M38 38L52 52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path class="icon-ring" d="M28 20V24M28 32V36M20 28H24M32 28H36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>
  `,
  
  clipboard: `
    <svg class="icon-animated icon-clipboard" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect class="icon-board" x="12" y="16" width="40" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
      <rect class="icon-clip" x="24" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <line class="icon-check-1" x1="22" y1="36" x2="28" y2="42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line class="icon-check-2" x1="28" y1="42" x2="42" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  
  // Social Icons
  linkedin: `
    <svg class="icon-social icon-linkedin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  `,
  
  instagram: `
    <svg class="icon-social icon-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  `,
  
  facebook: `
    <svg class="icon-social icon-facebook" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  `,
  
  twitter: `
    <svg class="icon-social icon-twitter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  `,
  
  whatsapp: `
    <svg class="icon-social icon-whatsapp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  `,
  
  // Contact Icons
  phone: `
    <svg class="icon-contact icon-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  `,
  
  email: `
    <svg class="icon-contact icon-email" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  `,
  
  location: `
    <svg class="icon-contact icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `,
  
  arrow: `
    <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  `,
  
  arrowRight: `
    <svg class="icon-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  `,
  
  check: `
    <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `
};

// Icon Manager Class
class IconManager {
  constructor() {
    this.iconMap = {
      // Service cards
      '📋': 'consultation',
      '🤝': 'contractor',
      '📊': 'management',
      '✓': 'quality',
      // Process icons
      '💬': 'chat',
      '🔍': 'search',
      '✓': 'quality',
      // Contact
      '📞': 'phone',
      '📍': 'location'
    };
  }
  
  replaceIcons() {
    // Replace service icons
    document.querySelectorAll('.service-icon').forEach(el => {
      const emoji = el.textContent.trim();
      const iconKey = this.iconMap[emoji];
      if (iconKey && AnimatedIcons[iconKey]) {
        el.innerHTML = AnimatedIcons[iconKey];
        el.classList.add('icon-replaced');
      }
    });
    
    // Replace timeline icons
    document.querySelectorAll('.timeline-icon-inner').forEach(el => {
      const emoji = el.textContent.trim();
      const iconKey = this.iconMap[emoji];
      if (iconKey && AnimatedIcons[iconKey]) {
        el.innerHTML = AnimatedIcons[iconKey];
        el.classList.add('icon-replaced');
      }
    });
    
    // Replace social links
    document.querySelectorAll('.social-links a, .footer-links a').forEach(el => {
      const text = el.textContent.trim().toLowerCase();
      if (AnimatedIcons[text]) {
        el.innerHTML = AnimatedIcons[text];
        el.classList.add('icon-only');
      }
    });
    
    // Replace contact icons
    document.querySelectorAll('.contact-item .icon').forEach(el => {
      const emoji = el.textContent.trim();
      const iconKey = this.iconMap[emoji];
      if (iconKey && AnimatedIcons[iconKey]) {
        el.innerHTML = AnimatedIcons[iconKey];
        el.classList.add('icon-replaced');
      }
    });
  }
  
  // Get icon by key
  get(key) {
    return AnimatedIcons[key] || '';
  }
  
  // Render icon to element
  render(element, iconKey) {
    if (AnimatedIcons[iconKey]) {
      element.innerHTML = AnimatedIcons[iconKey];
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const iconManager = new IconManager();
  iconManager.replaceIcons();
  
  // Expose globally
  window.BuildBridgeIcons = iconManager;
  window.AnimatedIcons = AnimatedIcons;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimatedIcons, IconManager };
}
