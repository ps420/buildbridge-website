/**
 * Smart Content Personalization System (v37.0)
 * Adapts content based on user behavior, scroll patterns, and interests
 */

class SmartPersonalization {
  constructor() {
    this.userProfile = this.loadProfile();
    this.sessionData = {
      startTime: Date.now(),
      pageViews: 0,
      interactions: [],
      scrollDepth: 0,
      interests: {},
      timeOnSections: {}
    };
    this.observers = new Map();
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    this.startSessionTracking();
    this.setupIntersectionObserver();
    this.setupClickTracking();
    this.setupScrollTracking();
    this.setupSectionTimers();
    this.displayPersonalizedContent();
    this.createPersonalizationUI();
    
    this.isInitialized = true;
    console.log('Smart Personalization initialized');
  }
  
  // Load or create user profile from localStorage
  loadProfile() {
    const stored = localStorage.getItem('buildbridge_user_profile');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      visitCount: 0,
      preferredSections: [],
      interests: {
        residential: 0,
        commercial: 0,
        industrial: 0,
        renovations: 0,
        consultations: 0
      },
      lastVisit: null,
      viewedProjects: [],
      ctaEngagement: 0,
      contentPreferences: {}
    };
  }
  
  saveProfile() {
    localStorage.setItem('buildbridge_user_profile', JSON.stringify(this.userProfile));
  }
  
  startSessionTracking() {
    this.userProfile.visitCount++;
    this.userProfile.lastVisit = Date.now();
    this.saveProfile();
    
    // Track session duration
    this.sessionData.startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }
  
  endSession() {
    const sessionDuration = Date.now() - this.sessionData.startTime;
    
    // Update profile with session data
    Object.entries(this.sessionData.timeOnSections).forEach(([section, time]) => {
      if (!this.userProfile.contentPreferences[section]) {
        this.userProfile.contentPreferences[section] = 0;
      }
      this.userProfile.contentPreferences[section] += time;
    });
    
    this.saveProfile();
  }
  
  // Track which sections users spend time on
  setupSectionTimers() {
    const sections = document.querySelectorAll('[data-track-section]');
    
    sections.forEach(section => {
      const sectionName = section.dataset.trackSection;
      let enterTime = null;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            enterTime = Date.now();
          } else if (enterTime) {
            const timeSpent = Date.now() - enterTime;
            if (!this.sessionData.timeOnSections[sectionName]) {
              this.sessionData.timeOnSections[sectionName] = 0;
            }
            this.sessionData.timeOnSections[sectionName] += timeSpent;
            enterTime = null;
            
            // Update interest score
            this.updateInterestScore(sectionName, timeSpent / 1000);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(section);
    });
  }
  
  updateInterestScore(category, value) {
    if (!this.userProfile.interests[category]) {
      this.userProfile.interests[category] = 0;
    }
    this.userProfile.interests[category] += value;
    this.saveProfile();
  }
  
  // Track scroll depth
  setupScrollTracking() {
    let maxScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            this.sessionData.scrollDepth = maxScroll;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  // Track element clicks
  setupClickTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        const trackData = target.dataset.track;
        this.trackInteraction(trackData);
      }
    });
  }
  
  trackInteraction(type) {
    this.sessionData.interactions.push({
      type,
      timestamp: Date.now(),
      page: location.pathname
    });
    
    // Update interests based on interaction
    if (type.includes('residential')) this.updateInterestScore('residential', 5);
    if (type.includes('commercial')) this.updateInterestScore('commercial', 5);
    if (type.includes('industrial')) this.updateInterestScore('industrial', 5);
    if (type.includes('consultation')) this.updateInterestScore('consultations', 10);
  }
  
  // Intersection observer for view tracking
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Add reveal animation
          element.classList.add('section-revealed');
          
          // Track view
          if (element.dataset.trackSection) {
            this.sessionData.pageViews++;
          }
        }
      });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('section, [data-animate]').forEach(el => {
      observer.observe(el);
    });
  }
  
  // Display personalized content based on profile
  displayPersonalizedContent() {
    this.showPersonalizedGreeting();
    this.highlightRelevantSections();
    this.showRecommendedContent();
    this.updateDynamicCTA();
  }
  
  showPersonalizedGreeting() {
    // Only show for returning visitors
    if (this.userProfile.visitCount < 2) return;
    
    const topInterest = this.getTopInterest();
    const banner = document.createElement('div');
    banner.className = 'personalization-banner';
    
    const messages = {
      residential: "Based on your interest, check out our luxury residential projects",
      commercial: "Explore our commercial developments tailored to your interests",
      industrial: "Discover industrial solutions that match your requirements",
      renovations: "See our latest renovation transformations",
      consultations: "Ready to start? Book a free consultation today"
    };
    
    banner.innerHTML = `
      <div class="personalization-banner-content">
        <div class="personalization-message">
          <span>👋</span>
          <span>Welcome back! ${messages[topInterest] || 'Explore what\'s new since your last visit'}</span>
        </div>
        <button class="personalization-close" aria-label="Close">×</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Show with delay
    setTimeout(() => banner.classList.add('visible'), 1000);
    
    // Close button
    banner.querySelector('.personalization-close').addEventListener('click', () => {
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 500);
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 500);
    }, 8000);
  }
  
  getTopInterest() {
    const entries = Object.entries(this.userProfile.interests);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }
  
  highlightRelevantSections() {
    const topInterest = this.getTopInterest();
    if (!topInterest) return;
    
    // Find sections matching top interest
    document.querySelectorAll(`[data-interest="${topInterest}"]`).forEach(section => {
      section.classList.add('highlighted');
      
      // Add interest badge
      const badge = document.createElement('span');
      badge.className = 'interest-badge active';
      badge.textContent = 'Recommended';
      
      const title = section.querySelector('h2, h3');
      if (title) {
        title.insertAdjacentElement('beforebegin', badge);
      }
    });
  }
  
  showRecommendedContent() {
    const recommendations = this.generateRecommendations();
    
    recommendations.forEach((rec, index) => {
      const element = document.querySelector(rec.selector);
      if (element) {
        element.classList.add('recommended-card');
        element.style.animationDelay = `${index * 0.1}s`;
        
        // Add recommendation score
        const score = document.createElement('div');
        score.className = 'recommendation-score';
        score.textContent = `${Math.round(rec.score)}% match`;
        element.appendChild(score);
      }
    });
  }
  
  generateRecommendations() {
    const candidates = [];
    
    // Score each potential recommendation
    document.querySelectorAll('[data-recommendation]').forEach(el => {
      let score = 50; // Base score
      
      const category = el.dataset.category;
      if (category && this.userProfile.interests[category]) {
        score += this.userProfile.interests[category] * 2;
      }
      
      // Boost new content
      if (el.dataset.new === 'true') score += 20;
      
      // Boost featured content
      if (el.dataset.featured === 'true') score += 15;
      
      candidates.push({
        selector: `[data-recommendation="${el.dataset.recommendation}"]`,
        score: Math.min(score, 100),
        element: el
      });
    });
    
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }
  
  updateDynamicCTA() {
    const cta = document.createElement('div');
    cta.className = 'dynamic-cta';
    
    const topInterest = this.getTopInterest();
    const ctaConfig = {
      residential: {
        text: 'Start your dream home project',
        btn: 'Get Quote',
        link: 'contact.html?type=residential'
      },
      commercial: {
        text: 'Scale your business with us',
        btn: 'Consult Now',
        link: 'contact.html?type=commercial'
      },
      industrial: {
        text: 'Build industrial excellence',
        btn: 'Enquire Today',
        link: 'contact.html?type=industrial'
      },
      default: {
        text: 'Ready to start your project?',
        btn: 'Let\'s Talk',
        link: 'contact.html'
      }
    };
    
    const config = ctaConfig[topInterest] || ctaConfig.default;
    
    cta.innerHTML = `
      <div class="dynamic-cta-message">${config.text}</div>
      <a href="${config.link}" class="dynamic-cta-btn">${config.btn}</a>
    `;
    
    document.body.appendChild(cta);
    
    // Show after user has scrolled a bit
    let shown = false;
    window.addEventListener('scroll', () => {
      if (!shown && window.scrollY > 500) {
        cta.classList.add('visible');
        shown = true;
      }
    }, { passive: true });
    
    // Hide on contact page
    if (location.pathname.includes('contact')) {
      cta.style.display = 'none';
    }
  }
  
  // Create personalization UI panel
  createPersonalizationUI() {
    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'personalization-toggle';
    toggle.innerHTML = '✨';
    toggle.setAttribute('aria-label', 'Personalization settings');
    document.body.appendChild(toggle);
    
    // Panel
    const panel = document.createElement('div');
    panel.className = 'personalization-panel';
    panel.innerHTML = `
      <div class="personalization-panel-header">
        <div class="personalization-panel-title">Your Preferences</div>
        <div class="personalization-panel-subtitle">Customize your experience</div>
      </div>
      <div class="personalization-panel-content">
        <div class="personalization-section">
          <div class="personalization-section-title">Your Interests</div>
          ${this.renderInterestBars()}
        </div>
        <div class="personalization-section">
          <div class="personalization-section-title">Content Preferences</div>
          <div class="preference-pills">
            ${this.renderPreferencePills()}
          </div>
        </div>
        <div class="personalization-section">
          <div class="personalization-section-title">Session Stats</div>
          <div class="interest-bar">
            <div class="interest-bar-label">
              <span>Time on site</span>
              <span id="session-time">0:00</span>
            </div>
          </div>
          <div class="interest-bar">
            <div class="interest-bar-label">
              <span>Pages viewed</span>
              <span>${this.sessionData.pageViews}</span>
            </div>
          </div>
          <div class="interest-bar">
            <div class="interest-bar-label">
              <span>Scroll depth</span>
              <span id="scroll-depth">0%</span>
            </div>
            <div class="interest-bar-track">
              <div class="interest-bar-fill" id="scroll-depth-bar" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    
    // Toggle functionality
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
    
    // Update session time
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.sessionData.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timeEl = document.getElementById('session-time');
      if (timeEl) {
        timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
    
    // Update scroll depth
    window.addEventListener('scroll', () => {
      const depthEl = document.getElementById('scroll-depth');
      const depthBar = document.getElementById('scroll-depth-bar');
      if (depthEl && depthBar) {
        const depth = Math.round(this.sessionData.scrollDepth);
        depthEl.textContent = `${depth}%`;
        depthBar.style.width = `${depth}%`;
      }
    }, { passive: true });
  }
  
  renderInterestBars() {
    const interests = this.userProfile.interests;
    const maxValue = Math.max(...Object.values(interests), 1);
    
    return Object.entries(interests).map(([key, value]) => {
      const percentage = (value / maxValue) * 100;
      return `
        <div class="interest-bar">
          <div class="interest-bar-label">
            <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span>${Math.round(value)} pts</span>
          </div>
          <div class="interest-bar-track">
            <div class="interest-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  renderPreferencePills() {
    const preferences = [
      { id: 'show-pricing', label: 'Show pricing' },
      { id: 'new-projects', label: 'New projects' },
      { id: 'case-studies', label: 'Case studies' },
      { id: 'testimonials', label: 'Testimonials' },
      { id: 'team-info', label: 'Team info' }
    ];
    
    return preferences.map(pref => `
      <button class="preference-pill" data-pref="${pref.id}">
        <span class="check-icon">✓</span>
        ${pref.label}
      </button>
    `).join('');
  }
  
  // Public API
  static getProfile() {
    return window.smartPersonalization?.userProfile;
  }
  
  static track(event, data) {
    window.smartPersonalization?.trackInteraction(event);
  }
  
  static updateInterest(category, value) {
    window.smartPersonalization?.updateInterestScore(category, value);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartPersonalization = new SmartPersonalization();
  });
} else {
  window.smartPersonalization = new SmartPersonalization();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPersonalization;
}
