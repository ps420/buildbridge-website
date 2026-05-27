/**
 * BuildBridge Motion Preference Manager v14.2
 * Accessibility-first animation respect and user controls
 */

(function() {
  'use strict';

  // ============================================
  // Motion Preference Manager
  // ============================================
  class MotionPreferenceManager {
    constructor() {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.userPreference = localStorage.getItem('motion-preference');
      this.isMotionDisabled = this.userPreference === 'disabled' || 
                             (!this.userPreference && this.prefersReducedMotion.matches);
      
      this.init();
    }
    
    init() {
      // Apply initial state
      this.applyMotionState();
      
      // Listen for system preference changes
      this.prefersReducedMotion.addEventListener('change', (e) => {
        if (!this.userPreference) {
          this.isMotionDisabled = e.matches;
          this.applyMotionState();
        }
      });
      
      // Create UI toggle
      this.createToggle();
      
      // Handle visibility changes (pause animations when hidden)
      this.handleVisibilityChanges();
      
      // Announce to screen readers
      this.announceMotionState();
    }
    
    applyMotionState() {
      const body = document.body;
      
      if (this.isMotionDisabled) {
        body.classList.add('motion-disabled');
        body.classList.remove('motion-enabled');
        
        // Disable Lenis smooth scroll
        if (window.lenis) {
          window.lenis.destroy();
        }
        
        // Pause all GSAP animations
        if (window.gsap) {
          window.gsap.globalTimeline.pause();
        }
        
        // Stop RAF loops for particles
        this.pauseParticleAnimations();
        
      } else {
        body.classList.remove('motion-disabled');
        body.classList.add('motion-enabled');
        
        // Resume GSAP
        if (window.gsap) {
          window.gsap.globalTimeline.resume();
        }
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('motionPreferenceChange', {
        detail: { reducedMotion: this.isMotionDisabled }
      }));
    }
    
    pauseParticleAnimations() {
      // Find and pause particle animation frames
      if (window.particleRAF) {
        cancelAnimationFrame(window.particleRAF);
      }
      
      // Disable WebGL contexts
      document.querySelectorAll('canvas').forEach(canvas => {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
          // Extension to pause WebGL rendering
          canvas.dataset.paused = 'true';
        }
      });
    }
    
    createToggle() {
      // Only create if not already exists and not already respecting system preference
      if (document.querySelector('.motion-toggle')) return;
      
      const toggle = document.createElement('button');
      toggle.className = 'motion-toggle';
      toggle.setAttribute('aria-label', 'Toggle animations');
      toggle.setAttribute('aria-pressed', !this.isMotionDisabled);
      toggle.innerHTML = `
        <span class="motion-icon">${this.isMotionDisabled ? '⏸️' : '▶️'}</span>
        <span class="motion-toggle-tooltip">
          ${this.isMotionDisabled ? 'Enable animations' : 'Disable animations'}
        </span>
      `;
      
      if (this.isMotionDisabled) {
        toggle.classList.add('active');
      }
      
      toggle.addEventListener('click', () => this.toggleMotion());
      
      document.body.appendChild(toggle);
      this.toggle = toggle;
    }
    
    toggleMotion() {
      this.isMotionDisabled = !this.isMotionDisabled;
      this.userPreference = this.isMotionDisabled ? 'disabled' : 'enabled';
      localStorage.setItem('motion-preference', this.userPreference);
      
      this.applyMotionState();
      this.updateToggleUI();
      this.announceMotionState();
      
      // Show toast notification
      if (window.Toast) {
        const message = this.isMotionDisabled 
          ? 'Animations disabled for accessibility' 
          : 'Animations enabled';
        Toast.info(message, { duration: 3000 });
      }
    }
    
    updateToggleUI() {
      if (!this.toggle) return;
      
      this.toggle.classList.toggle('active', this.isMotionDisabled);
      this.toggle.setAttribute('aria-pressed', !this.isMotionDisabled);
      
      const icon = this.toggle.querySelector('.motion-icon');
      const tooltip = this.toggle.querySelector('.motion-toggle-tooltip');
      
      if (icon) icon.textContent = this.isMotionDisabled ? '⏸️' : '▶️';
      if (tooltip) {
        tooltip.textContent = this.isMotionDisabled 
          ? 'Enable animations' 
          : 'Disable animations';
      }
    }
    
    handleVisibilityChanges() {
      // Pause expensive animations when tab is hidden
      document.addEventListener('visibilitychange', () => {
        const isHidden = document.hidden;
        
        if (isHidden && !this.isMotionDisabled) {
          // Tab hidden - pause non-essential animations
          document.body.classList.add('tab-hidden');
          
          if (window.gsap) {
            window.gsap.globalTimeline.pause();
          }
        } else if (!isHidden && !this.isMotionDisabled) {
          // Tab visible - resume animations
          document.body.classList.remove('tab-hidden');
          
          if (window.gsap) {
            window.gsap.globalTimeline.resume();
          }
        }
      });
    }
    
    announceMotionState() {
      // Create or update aria-live region
      let announcer = document.getElementById('motion-announcer');
      
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'motion-announcer';
        announcer.className = 'motion-status-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
      }
      
      const message = this.isMotionDisabled 
        ? 'Animations are now disabled. The page will display without motion effects.' 
        : 'Animations are now enabled.';
      
      announcer.textContent = message;
    }
    
    // Public API
    static getInstance() {
      if (!MotionPreferenceManager.instance) {
        MotionPreferenceManager.instance = new MotionPreferenceManager();
      }
      return MotionPreferenceManager.instance;
    }
    
    static isReducedMotion() {
      return MotionPreferenceManager.getInstance().isMotionDisabled;
    }
    
    static setReducedMotion(value) {
      const instance = MotionPreferenceManager.getInstance();
      instance.isMotionDisabled = value;
      instance.userPreference = value ? 'disabled' : 'enabled';
      localStorage.setItem('motion-preference', instance.userPreference);
      instance.applyMotionState();
      instance.updateToggleUI();
    }
  }

  // ============================================
  // Reduced Motion Detection Helper
  // ============================================
  const MotionUtils = {
    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    prefersHighContrast() {
      return window.matchMedia('(prefers-contrast: more)').matches;
    },
    
    prefersColorScheme() {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
      return 'no-preference';
    },
    
    // Animation helpers that respect preferences
    animate(element, keyframes, options = {}) {
      const shouldAnimate = !MotionPreferenceManager.isReducedMotion();
      
      if (!shouldAnimate) {
        // Jump to end state
        const lastFrame = keyframes[keyframes.length - 1];
        Object.assign(element.style, lastFrame);
        return Promise.resolve();
      }
      
      return element.animate(keyframes, {
        fill: 'forwards',
        ...options
      }).finished;
    },
    
    // Smooth scroll that respects preferences
    scrollTo(target, options = {}) {
      const shouldSmooth = !MotionPreferenceManager.isReducedMotion();
      
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
        
      if (!element) return;
      
      element.scrollIntoView({
        behavior: shouldSmooth ? (options.behavior || 'smooth') : 'auto',
        block: options.block || 'start'
      });
    },
    
    // Transition helper
    transition(element, properties, duration = 300) {
      const shouldTransition = !MotionPreferenceManager.isReducedMotion();
      const actualDuration = shouldTransition ? duration : 0;
      
      element.style.transition = Object.keys(properties)
        .map(prop => `${prop} ${actualDuration}ms ease`)
        .join(', ');
        
      Object.assign(element.style, properties);
      
      return new Promise(resolve => {
        setTimeout(resolve, actualDuration);
      });
    }
  };

  // ============================================
  // Auto-detect and respect user preferences
  // ============================================
  function detectAndApplyPreferences() {
    // Check for saved preference
    const savedPref = localStorage.getItem('motion-preference');
    
    if (savedPref === 'disabled') {
      document.body.classList.add('motion-disabled');
    } else if (savedPref === 'enabled') {
      document.body.classList.add('motion-enabled');
    } else {
      // Check system preference
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        document.body.classList.add('motion-disabled');
      }
    }
  }

  // Apply immediately to prevent flash of animated content
  detectAndApplyPreferences();

  // ============================================
  // Initialize when DOM is ready
  // ============================================
  function init() {
    MotionPreferenceManager.getInstance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Expose API globally
  // ============================================
  window.MotionPreference = MotionPreferenceManager;
  window.MotionUtils = MotionUtils;

})();
