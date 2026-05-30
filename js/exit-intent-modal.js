/**
 * Exit Intent Modal - v138.1
 * Fortune 500 Lead Capture Before Leave
 * Detects exit intent and displays compelling offer
 */

(function() {
  'use strict';

  const ExitIntentModal = {
    config: {
      cooldownDays: 7,
      minTimeOnSite: 5000,
      minScrollDepth: 20,
      storageKey: 'bb_exit_intent_shown',
      conversionKey: 'bb_exit_intent_converted',
      triggerDelay: 500,
      showOncePerSession: true
    },

    state: {
      hasShown: false,
      isActive: false,
      startTime: Date.now(),
      maxScrollDepth: 0,
      mouseHistory: [],
      hasInteracted: false
    },

    init() {
      // Check if already shown recently
      const lastShown = localStorage.getItem(this.config.storageKey);
      const hasConverted = localStorage.getItem(this.config.conversionKey);
      
      if (hasConverted) return;
      
      if (lastShown) {
        const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSince < this.config.cooldownDays) return;
      }

      this.bindEvents();
    },

    bindEvents() {
      // Track scroll depth
      window.addEventListener('scroll', () => this.trackScroll(), { passive: true });
      
      // Track mouse movement for exit intent
      document.addEventListener('mousemove', (e) => this.trackMouse(e));
      
      // Track engagement
      document.addEventListener('click', () => {
        this.state.hasInteracted = true;
      });
      
      // Mobile: detect tab switch
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.shouldShow()) {
          setTimeout(() => this.show(), 100);
        }
      });

      // Clear on page hide (new session)
      window.addEventListener('pagehide', () => {
        if (this.config.showOncePerSession) {
          sessionStorage.removeItem('bb_exit_intent_session');
        }
      });
    },

    trackScroll() {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      this.state.maxScrollDepth = Math.max(this.state.maxScrollDepth, scrollPercent);
    },

    trackMouse(e) {
      // Store mouse position history
      this.state.mouseHistory.push({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      });

      // Keep only last 10 positions
      if (this.state.mouseHistory.length > 10) {
        this.state.mouseHistory.shift();
      }

      // Detect exit intent - mouse moving rapidly toward top
      this.detectExitIntent(e);
    },

    detectExitIntent(e) {
      if (this.state.hasShown || this.state.isActive) return;
      
      // Check if mouse is near top of viewport
      if (e.clientY > 20) return;
      
      // Check for rapid upward movement
      if (this.state.mouseHistory.length < 5) return;
      
      const recent = this.state.mouseHistory.slice(-5);
      const velocity = recent[recent.length - 1].y - recent[0].y;
      const timeDiff = recent[recent.length - 1].time - recent[0].time;
      
      // Fast upward movement (exit intent)
      if (velocity < -100 && timeDiff < 200) {
        if (this.shouldShow()) {
          setTimeout(() => this.show(), this.config.triggerDelay);
        }
      }
    },

    shouldShow() {
      // Check session
      if (this.config.showOncePerSession && sessionStorage.getItem('bb_exit_intent_session')) {
        return false;
      }

      // Minimum time on site
      if (Date.now() - this.state.startTime < this.config.minTimeOnSite) {
        return false;
      }

      // Minimum scroll depth
      if (this.state.maxScrollDepth < this.config.minScrollDepth) {
        return false;
      }

      // Don't show if user just arrived
      if (!this.state.hasInteracted && this.state.maxScrollDepth < 30) {
        return false;
      }

      return true;
    },

    show() {
      if (this.state.hasShown || this.state.isActive) return;
      
      this.state.isActive = true;
      this.state.hasShown = true;
      
      // Record session
      sessionStorage.setItem('bb_exit_intent_session', 'true');
      localStorage.setItem(this.config.storageKey, Date.now().toString());

      this.createModal();
      this.trackEvent('exit_intent_shown');
    },

    createModal() {
      const overlay = document.createElement('div');
      overlay.className = 'exit-intent-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'exit-intent-title');
      
      overlay.innerHTML = `
        <div class="exit-intent-modal">
          <button class="exit-intent-close" aria-label="Close offer">×</button>
          
          <div class="exit-intent-content">
            <div class="exit-intent-badge">
              <span>⚡</span>
              <span>Wait! Special Offer</span>
            </div>
            
            <h2 id="exit-intent-title" class="exit-intent-title">
              Get a <span class="highlight">Free Project Consultation</span> Worth R2,500
            </h2>
            
            <p class="exit-intent-subtitle">
              Before you go, claim your complimentary consultation with our expert team. 
              We'll assess your project needs and provide a detailed roadmap.
            </p>
            
            <div class="exit-intent-benefits">
              <div class="exit-intent-benefit">
                <div class="exit-intent-benefit-icon">✓</div>
                <span class="exit-intent-benefit-text">Detailed project assessment & feasibility study</span>
              </div>
              <div class="exit-intent-benefit">
                <div class="exit-intent-benefit-icon">✓</div>
                <span class="exit-intent-benefit-text">Accurate budget estimation & timeline planning</span>
              </div>
              <div class="exit-intent-benefit">
                <div class="exit-intent-benefit-icon">✓</div>
                <span class="exit-intent-benefit-text">Matched with 3 qualified contractors</span>
              </div>
              <div class="exit-intent-benefit">
                <div class="exit-intent-benefit-icon">✓</div>
                <span class="exit-intent-benefit-text">No obligation, 100% confidential</span>
              </div>
            </div>
            
            <form class="exit-intent-form" onsubmit="return false;">
              <div class="exit-intent-input-group">
                <input 
                  type="text" 
                  class="exit-intent-input" 
                  placeholder="Your Name" 
                  required
                  aria-label="Your name"
                >
                <input 
                  type="tel" 
                  class="exit-intent-input" 
                  placeholder="Phone Number" 
                  required
                  aria-label="Phone number"
                >
              </div>
              <input 
                type="email" 
                class="exit-intent-input" 
                placeholder="Email Address" 
                required
                aria-label="Email address"
              >
              <button type="submit" class="exit-intent-submit magnetic">
                <span>Claim My Free Consultation</span>
                <span>→</span>
              </button>
            </form>
            
            <div class="exit-intent-social-proof">
              <div class="exit-intent-avatars">
                <div class="exit-intent-avatar">J</div>
                <div class="exit-intent-avatar">S</div>
                <div class="exit-intent-avatar">M</div>
              </div>
              <span><strong>47 people</strong> claimed today</span>
            </div>
            
            <div class="exit-intent-urgency">
              <span class="exit-intent-urgency-icon">⏰</span>
              <span>Limited to 10 consultations per week</span>
            </div>
            
            <div class="exit-intent-alternatives">
              <button class="exit-intent-alt-btn" data-action="whatsapp">
                <span>💬</span>
                <span>Chat on WhatsApp</span>
              </button>
              <button class="exit-intent-alt-btn" data-action="call">
                <span>📞</span>
                <span>Call Now</span>
              </button>
            </div>
            
            <p class="exit-intent-privacy">
              🔒 Your information is secure. 
              <a href="privacy.html" target="_blank">Privacy Policy</a>
            </p>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      this.overlay = overlay;
      
      // Trigger animation
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
      
      this.bindModalEvents();
    },

    bindModalEvents() {
      // Close button
      this.overlay.querySelector('.exit-intent-close').addEventListener('click', () => {
        this.close();
        this.trackEvent('exit_intent_closed');
      });
      
      // Click outside to close
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
          this.trackEvent('exit_intent_dismissed');
        }
      });
      
      // Form submission
      const form = this.overlay.querySelector('.exit-intent-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
      
      // Alternative actions
      this.overlay.querySelectorAll('.exit-intent-alt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'whatsapp') {
            window.open('https://wa.me/27661200064', '_blank');
            this.trackEvent('exit_intent_whatsapp');
          } else if (action === 'call') {
            window.location.href = 'tel:+27661200064';
            this.trackEvent('exit_intent_call');
          }
          this.close();
        });
      });
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isActive) {
          this.close();
        }
      });
    },

    handleSubmit(form) {
      const submitBtn = form.querySelector('.exit-intent-submit');
      const formData = new FormData(form);
      
      // Show loading state
      submitBtn.innerHTML = '<span>Processing...</span>';
      submitBtn.disabled = true;
      
      // Simulate submission (replace with actual endpoint)
      setTimeout(() => {
        this.showSuccess();
        this.markConverted();
        this.trackEvent('exit_intent_converted');
      }, 1500);
    },

    showSuccess() {
      const modal = this.overlay.querySelector('.exit-intent-modal');
      const content = this.overlay.querySelector('.exit-intent-content');
      
      content.innerHTML = `
        <div class="exit-intent-success">
          <div class="exit-intent-success-icon">✓</div>
          <h3>You're All Set!</h3>
          <p>Thank you for your interest. Our team will contact you within 24 hours to schedule your free consultation.</p>
          <button class="exit-intent-submit" onclick="ExitIntentModal.close()" style="margin-top: 20px;">
            Continue Browsing
          </button>
        </div>
      `;
      
      // Auto close after delay
      setTimeout(() => {
        this.close();
      }, 5000);
    },

    markConverted() {
      localStorage.setItem(this.config.conversionKey, Date.now().toString());
    },

    close() {
      if (!this.state.isActive) return;
      
      this.state.isActive = false;
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      
      setTimeout(() => {
        this.overlay.remove();
      }, 400);
    },

    trackEvent(eventName) {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'exit_intent',
          non_interaction: false
        });
      }
      
      // Facebook Pixel
      if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName);
      }
      
      console.log('[Exit Intent]', eventName);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ExitIntentModal.init());
  } else {
    ExitIntentModal.init();
  }

  // Expose to global scope
  window.ExitIntentModal = ExitIntentModal;
})();
