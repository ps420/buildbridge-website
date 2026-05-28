/**
 * v50.0 Smart Content Personalization System
 * Fortune 500 Dynamic Content Adaptation Engine
 */

class SmartContentPersonalization {
  constructor() {
    this.userProfile = null;
    this.contentVariants = new Map();
    this.behavioralData = {
      scrollDepth: 0,
      timeOnPage: 0,
      interactions: [],
      interests: new Set(),
      returningVisitor: false,
      visitCount: 0,
      lastVisit: null
    };
    this.observers = new Map();
    this.init();
  }

  init() {
    this.loadUserProfile();
    this.setupObservers();
    this.trackBehavior();
    this.applyPersonalization();
    this.setupExitIntent();
    console.log('🎯 Smart Content Personalization v50.0 initialized');
  }

  loadUserProfile() {
    const saved = localStorage.getItem('bb_user_profile');
    const visitData = localStorage.getItem('bb_visit_data');
    
    if (visitData) {
      const data = JSON.parse(visitData);
      this.behavioralData.visitCount = data.count || 0;
      this.behavioralData.lastVisit = data.lastVisit;
      this.behavioralData.returningVisitor = data.count > 1;
      
      // Update visit count
      localStorage.setItem('bb_visit_data', JSON.stringify({
        count: data.count + 1,
        lastVisit: Date.now()
      }));
    } else {
      localStorage.setItem('bb_visit_data', JSON.stringify({
        count: 1,
        lastVisit: Date.now()
      }));
    }

    if (saved) {
      this.userProfile = JSON.parse(saved);
    } else {
      this.userProfile = {
        interests: [],
        preferredContent: 'default',
        interactionHistory: [],
        deviceContext: this.detectDeviceContext(),
        timeContext: this.getTimeContext()
      };
    }

    // Show returning visitor badge if applicable
    if (this.behavioralData.returningVisitor) {
      this.showReturningBadge();
    }
  }

  detectDeviceContext() {
    return {
      isMobile: window.matchMedia('(pointer: coarse)').matches,
      isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches,
      isDesktop: window.matchMedia('(min-width: 1025px)').matches,
      connection: navigator.connection ? navigator.connection.effectiveType : '4g'
    };
  }

  getTimeContext() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  setupObservers() {
    // Intersection Observer for content visibility
    this.observers.content = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleContentVisible(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // Observe all personalizable content
    document.querySelectorAll('[data-personalize]').forEach(el => {
      this.observers.content.observe(el);
    });

    // Observe interest triggers
    document.querySelectorAll('[data-interest]').forEach(el => {
      el.addEventListener('mouseenter', () => this.registerInterest(el.dataset.interest));
      el.addEventListener('click', () => this.registerInterest(el.dataset.interest, 2));
    });
  }

  trackBehavior() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.behavioralData.scrollDepth = maxScroll;
        this.updateScrollPersonalization(maxScroll);
      }
    }, { passive: true });

    // Track time on page
    setInterval(() => {
      this.behavioralData.timeOnPage += 1;
      if (this.behavioralData.timeOnPage === 30) {
        this.triggerEngagedUserContent();
      }
    }, 1000);

    // Track interactions
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        this.behavioralData.interactions.push({
          type: target.dataset.track,
          timestamp: Date.now(),
          element: target.tagName
        });
        this.analyzeInteractions();
      }
    });
  }

  registerInterest(interest, weight = 1) {
    this.behavioralData.interests.add(interest);
    
    if (!this.userProfile.interests.includes(interest)) {
      this.userProfile.interests.push(interest);
      this.saveProfile();
    }

    // Highlight related content
    this.highlightInterestContent(interest);
  }

  highlightInterestContent(interest) {
    document.querySelectorAll(`[data-interest-match="${interest}"]`).forEach(el => {
      el.classList.add('interest-highlight', 'active');
      setTimeout(() => el.classList.remove('active'), 3000);
    });
  }

  updateScrollPersonalization(depth) {
    // Reveal deeper content as user scrolls
    if (depth > 25) {
      document.querySelectorAll('.reveal-depth-1').forEach(el => {
        el.classList.add('personalized-visible');
      });
    }
    if (depth > 50) {
      document.querySelectorAll('.reveal-depth-2').forEach(el => {
        el.classList.add('personalized-visible');
      });
    }
    if (depth > 75) {
      document.querySelectorAll('.reveal-depth-3').forEach(el => {
        el.classList.add('personalized-visible');
      });
      this.showDeepEngagementContent();
    }
  }

  triggerEngagedUserContent() {
    // Show special content for engaged users (30+ seconds)
    document.querySelectorAll('[data-engaged-user]').forEach(el => {
      el.classList.remove('personalized-hidden');
      el.classList.add('personalized-visible');
    });
  }

  showDeepEngagementContent() {
    // Premium content for users who scroll deep
    document.querySelectorAll('[data-deep-engagement]').forEach(el => {
      el.classList.add('content-fade-enter');
    });
  }

  applyPersonalization() {
    // Apply time-based content
    this.applyTimeBasedContent();
    
    // Apply device-based adaptations
    this.applyDeviceAdaptations();
    
    // Apply interest-based recommendations
    this.applyInterestRecommendations();
    
    // Apply returning visitor customizations
    if (this.behavioralData.returningVisitor) {
      this.applyReturningVisitorExperience();
    }
  }

  applyTimeBasedContent() {
    const timeContext = this.getTimeContext();
    document.querySelectorAll(`[data-time-context="${timeContext}"]`).forEach(el => {
      el.classList.add('active');
    });

    // Update greeting if present
    const greeting = document.querySelector('[data-personalized-greeting]');
    if (greeting) {
      const greetings = {
        morning: 'Good Morning',
        afternoon: 'Good Afternoon',
        evening: 'Good Evening',
        night: 'Good Evening'
      };
      greeting.textContent = greetings[timeContext];
    }
  }

  applyDeviceAdaptations() {
    const context = this.detectDeviceContext();
    
    if (context.isMobile) {
      document.body.classList.add('mobile-optimized');
      // Simplify content for mobile
      document.querySelectorAll('[data-mobile-simplified]').forEach(el => {
        el.classList.add('simplified-view');
      });
    }

    if (context.connection === 'slow-2g' || context.connection === '2g') {
      document.body.classList.add('low-bandwidth');
      // Disable heavy animations
      document.querySelectorAll('[data-heavy-animation]').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  applyInterestRecommendations() {
    if (this.userProfile.interests.length === 0) return;

    // Sort recommendation cards by relevance
    const cards = document.querySelectorAll('.recommendation-card');
    cards.forEach(card => {
      const cardInterests = card.dataset.interests?.split(',') || [];
      const matchCount = cardInterests.filter(i => 
        this.userProfile.interests.includes(i)
      ).length;
      
      if (matchCount > 0) {
        card.style.order = -matchCount;
        card.querySelectorAll('.relevance-dot').forEach((dot, i) => {
          if (i < matchCount) dot.classList.add('active');
        });
      }
    });
  }

  applyReturningVisitorExperience() {
    // Skip intro animations
    document.querySelectorAll('[data-skip-returning]').forEach(el => {
      el.style.animation = 'none';
      el.style.opacity = '1';
    });

    // Show personalized welcome back message
    const welcomeBack = document.querySelector('[data-welcome-back]');
    if (welcomeBack) {
      welcomeBack.textContent = `Welcome back! You've visited ${this.behavioralData.visitCount} times.`;
      welcomeBack.classList.add('personalized-visible');
    }
  }

  showReturningBadge() {
    const badge = document.createElement('div');
    badge.className = 'returning-badge';
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
      <span>Welcome Back${this.behavioralData.visitCount > 2 ? ' (Visit #' + this.behavioralData.visitCount + ')' : ''}</span>
    `;
    
    const hero = document.querySelector('.hero, [data-hero]');
    if (hero) {
      hero.insertAdjacentElement('afterbegin', badge);
    }
  }

  setupExitIntent() {
    // Detect mouse leaving viewport (desktop only)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let exitTriggered = false;
    document.addEventListener('mouseout', (e) => {
      if (exitTriggered) return;
      if (e.clientY < 10) {
        exitTriggered = true;
        this.showExitIntentModal();
      }
    });
  }

  showExitIntentModal() {
    // Only show if user has been engaged
    if (this.behavioralData.timeOnPage < 10) return;

    const modal = document.querySelector('.exit-intent-modal');
    if (modal) {
      // Personalize exit intent based on interests
      const primaryInterest = this.userProfile.interests[0];
      const headline = modal.querySelector('[data-exit-headline]');
      
      if (headline && primaryInterest) {
        const messages = {
          'residential': 'Wait! Don\'t miss out on your dream home project.',
          'commercial': 'Still planning your commercial space? Let us help.',
          'renovation': 'Before you go - get your free renovation estimate.',
          'consultation': 'One-minute consultation could save you thousands.'
        };
        headline.textContent = messages[primaryInterest] || 'Wait! Don\'t leave empty-handed.';
      }
      
      modal.classList.add('active');
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  analyzeInteractions() {
    // Simple pattern analysis
    const clicks = this.behavioralData.interactions.filter(i => i.type === 'click');
    
    if (clicks.length > 5) {
      this.userProfile.preferredContent = 'engaged';
      this.saveProfile();
    }
  }

  handleContentVisible(element) {
    const variant = element.dataset.personalize;
    
    if (variant === 'interest-based' && this.userProfile.interests.length > 0) {
      element.classList.add('personalized-visible');
    } else if (variant === 'returning' && this.behavioralData.returningVisitor) {
      element.classList.add('personalized-visible');
    } else if (variant === 'time-based') {
      element.classList.add('personalized-visible');
    } else if (variant === 'scroll-depth') {
      // Handled by scroll
    } else {
      element.classList.add('personalized-visible');
    }
  }

  switchContext(context) {
    this.userProfile.preferredContent = context;
    this.saveProfile();

    // Animate content switch
    document.querySelectorAll('[data-context-content]').forEach(el => {
      if (el.dataset.contextContent === context) {
        el.classList.remove('personalized-hidden', 'content-fade-exit');
        el.classList.add('content-fade-enter');
      } else {
        el.classList.add('content-fade-exit');
        setTimeout(() => el.classList.add('personalized-hidden'), 300);
      }
    });

    // Update active state on switcher
    document.querySelectorAll('.context-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.context === context);
    });
  }

  saveProfile() {
    localStorage.setItem('bb_user_profile', JSON.stringify(this.userProfile));
  }

  // Public API for manual personalization triggers
  setInterest(interest) {
    this.registerInterest(interest, 3);
  }

  clearInterests() {
    this.userProfile.interests = [];
    this.saveProfile();
  }

  getProfile() {
    return { ...this.userProfile, ...this.behavioralData };
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentPersonalization = new SmartContentPersonalization();
  });
} else {
  window.contentPersonalization = new SmartContentPersonalization();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartContentPersonalization;
}
