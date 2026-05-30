/**
 * v136.0: Reduced Motion Accessibility Support
 * Fortune 500 Quality Motion Sensitivity Support
 * Respects user preferences and provides manual controls
 */

(function() {
  'use strict';
  
  class ReducedMotionAccessibility {
    constructor() {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
      this.userPreference = this.loadPreference();
      this.isReducedMotion = false;
      
      this.init();
    }
    
    init() {
      this.checkPreferences();
      this.createControls();
      this.bindEvents();
      this.observeChanges();
      
      // Show announcement if user has reduced motion preference
      if (this.prefersReducedMotion.matches && !this.hasSeenAnnouncement()) {
        this.showAnnouncement();
      }
    }
    
    loadPreference() {
      try {
        const saved = localStorage.getItem('buildbridge-reduced-motion');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    
    savePreference(preference) {
      try {
        localStorage.setItem('buildbridge-reduced-motion', JSON.stringify(preference));
      } catch (e) {
        console.warn('Storage access denied');
      }
    }
    
    checkPreferences() {
      // User preference takes priority, then system preference
      if (this.userPreference !== null) {
        this.isReducedMotion = this.userPreference.reducedMotion;
      } else {
        this.isReducedMotion = this.prefersReducedMotion.matches;
      }
      
      this.applyReducedMotion(this.isReducedMotion);
    }
    
    applyReducedMotion(enabled) {
      document.documentElement.setAttribute('data-reduced-motion', enabled);
      
      // Stop all animations
      if (enabled) {
        document.querySelectorAll('[data-animation]').forEach(el => {
          el.style.animationPlayState = 'paused';
        });
        
        // Pause video backgrounds
        document.querySelectorAll('video[autoplay]').forEach(video => {
          video.pause();
        });
        
        // Stop parallax
        if (window.parallaxControllers) {
          window.parallaxControllers.forEach(ctrl => ctrl.pause?.());
        }
      } else {
        document.querySelectorAll('[data-animation]').forEach(el => {
          el.style.animationPlayState = 'running';
        });
        
        // Resume videos
        document.querySelectorAll('video[autoplay]').forEach(video => {
          video.play();
        });
        
        // Resume parallax
        if (window.parallaxControllers) {
          window.parallaxControllers.forEach(ctrl => ctrl.resume?.());
        }
      }
      
      this.updateControls();
    }
    
    createControls() {
      // Skip if button already exists
      if (document.querySelector('.reduced-motion-toggle')) return;
      
      // Create toggle button
      const toggle = document.createElement('button');
      toggle.className = 'reduced-motion-toggle';
      toggle.setAttribute('aria-label', 'Toggle reduced motion');
      toggle.innerHTML = `
        <span>${this.isReducedMotion ? '⏸️' : '▶️'}</span>
        <span class="reduced-motion-tooltip">${this.isReducedMotion ? 'Reduced motion on' : 'Animations on'}</span>
      `;
      
      if (this.isReducedMotion) {
        toggle.classList.add('active');
      }
      
      document.body.appendChild(toggle);
      
      // Create indicator badges
      this.createIndicator();
    }
    
    createIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'accessibility-indicator';
      indicator.innerHTML = `
        <div class="accessibility-badge" id="motion-badge">
          <span class="accessibility-badge-icon">⏸️</span>
          <span>Reduced Motion Active</span>
        </div>
        <div class="accessibility-badge" id="contrast-badge">
          <span class="accessibility-badge-icon">◐</span>
          <span>High Contrast</span>
        </div>
      `;
      
      document.body.appendChild(indicator);
      
      // Show badges based on preferences
      if (this.isReducedMotion) {
        document.getElementById('motion-badge')?.classList.add('show');
      }
      if (this.prefersHighContrast.matches) {
        document.getElementById('contrast-badge')?.classList.add('show');
      }
    }
    
    updateControls() {
      const toggle = document.querySelector('.reduced-motion-toggle');
      if (toggle) {
        toggle.classList.toggle('active', this.isReducedMotion);
        toggle.querySelector('span:first-child').textContent = this.isReducedMotion ? '⏸️' : '▶️';
        toggle.querySelector('.reduced-motion-tooltip').textContent = 
          this.isReducedMotion ? 'Reduced motion on' : 'Animations on';
      }
      
      const motionBadge = document.getElementById('motion-badge');
      motionBadge?.classList.toggle('show', this.isReducedMotion);
    }
    
    bindEvents() {
      // Toggle button click
      document.addEventListener('click', (e) => {
        if (e.target.closest('.reduced-motion-toggle')) {
          this.toggleReducedMotion();
        }
        
        // Close announcement
        if (e.target.closest('.motion-respect-announcement-close')) {
          document.querySelector('.motion-respect-announcement')?.remove();
          this.markAnnouncementSeen();
        }
      });
      
      // Keyboard shortcut (Alt + M)
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          this.toggleReducedMotion();
        }
      });
    }
    
    observeChanges() {
      // Watch for system preference changes
      this.prefersReducedMotion.addEventListener('change', (e) => {
        if (this.userPreference === null) {
          this.isReducedMotion = e.matches;
          this.applyReducedMotion(this.isReducedMotion);
        }
      });
      
      this.prefersHighContrast.addEventListener('change', (e) => {
        document.getElementById('contrast-badge')?.classList.toggle('show', e.matches);
      });
    }
    
    toggleReducedMotion() {
      this.isReducedMotion = !this.isReducedMotion;
      this.userPreference = { reducedMotion: this.isReducedMotion };
      this.savePreference(this.userPreference);
      this.applyReducedMotion(this.isReducedMotion);
      
      // Announce to screen readers
      this.announceChange(this.isReducedMotion ? 
        'Reduced motion enabled' : 
        'Animations enabled'
      );
    }
    
    showAnnouncement() {
      const announcement = document.createElement('div');
      announcement.className = 'motion-respect-announcement';
      announcement.innerHTML = `
        <button class="motion-respect-announcement-close" aria-label="Close">✕</button>
        <div class="motion-respect-announcement-title">
          <span>♿</span>
          <span>Accessibility Noticed</span>
        </div>
        <p>We've detected you prefer reduced motion. Animations are now minimized for your comfort.</p>
      `;
      
      document.body.appendChild(announcement);
      
      requestAnimationFrame(() => {
        announcement.classList.add('show');
      });
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        announcement?.remove();
      }, 8000);
    }
    
    hasSeenAnnouncement() {
      try {
        return localStorage.getItem('buildbridge-motion-announcement') === 'seen';
      } catch (e) {
        return false;
      }
    }
    
    markAnnouncementSeen() {
      try {
        localStorage.setItem('buildbridge-motion-announcement', 'seen');
      } catch (e) {}
    }
    
    announceChange(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
    
    // Public API
    enableReducedMotion() {
      this.isReducedMotion = true;
      this.userPreference = { reducedMotion: true };
      this.savePreference(this.userPreference);
      this.applyReducedMotion(true);
    }
    
    disableReducedMotion() {
      this.isReducedMotion = false;
      this.userPreference = { reducedMotion: false };
      this.savePreference(this.userPreference);
      this.applyReducedMotion(false);
    }
    
    resetToSystem() {
      this.userPreference = null;
      this.savePreference(null);
      this.isReducedMotion = this.prefersReducedMotion.matches;
      this.applyReducedMotion(this.isReducedMotion);
    }
    
    getStatus() {
      return {
        isReducedMotion: this.isReducedMotion,
        systemPreference: this.prefersReducedMotion.matches,
        isUserOverride: this.userPreference !== null
      };
    }
    
    destroy() {
      document.querySelectorAll('.reduced-motion-toggle, .accessibility-indicator, .motion-respect-announcement')
        .forEach(el => el.remove());
    }
  }
  
  // Initialize
  function init() {
    if (window.reducedMotionAccess) {
      window.reducedMotionAccess.destroy();
    }
    window.reducedMotionAccess = new ReducedMotionAccessibility();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope
  window.ReducedMotionAccessibility = ReducedMotionAccessibility;
})();
