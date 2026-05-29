/**
 * Dynamic Content Personalization - v82.1
 * Fortune 500 Adaptive Content System
 * Features: Interest tracking, behavioral analysis, personalized recommendations
 */

class DynamicPersonalization {
  constructor() {
    this.userId = this.getUserId();
    this.preferences = this.loadPreferences();
    this.behavior = this.loadBehavior();
    this.sessionStart = Date.now();
    this.pageViews = 0;
    this.interests = new Map();
    
    this.init();
  }

  init() {
    this.trackPageView();
    this.analyzeContent();
    this.injectPersonalizedElements();
    this.startBehavioralTracking();
    this.showPersonalizedNotifications();
    
    console.log('🎯 BuildBridge v82.1: Dynamic Personalization active for user', this.userId.slice(0, 8));
  }

  getUserId() {
    let id = localStorage.getItem('bb_user_id');
    if (!id) {
      id = 'bb_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('bb_user_id', id);
    }
    return id;
  }

  loadPreferences() {
    const saved = localStorage.getItem('bb_preferences');
    return saved ? JSON.parse(saved) : {
      interests: [],
      projectTypes: [],
      budgetRange: null,
      location: null,
      lastVisit: null
    };
  }

  savePreferences() {
    localStorage.setItem('bb_preferences', JSON.stringify(this.preferences));
  }

  loadBehavior() {
    const saved = localStorage.getItem('bb_behavior');
    return saved ? JSON.parse(saved) : {
      pagesViewed: [],
      timeOnSite: 0,
      interactions: [],
      scrollDepth: 0,
      returnVisits: 0
    };
  }

  saveBehavior() {
    localStorage.setItem('bb_behavior', JSON.stringify(this.behavior));
  }

  trackPageView() {
    this.pageViews++;
    const page = window.location.pathname;
    
    if (!this.behavior.pagesViewed.includes(page)) {
      this.behavior.pagesViewed.push(page);
    }
    
    // Track return visits
    if (this.preferences.lastVisit) {
      const lastVisit = new Date(this.preferences.lastVisit);
      const now = new Date();
      if (now - lastVisit > 24 * 60 * 60 * 1000) {
        this.behavior.returnVisits++;
      }
    }
    
    this.preferences.lastVisit = new Date().toISOString();
    this.savePreferences();
    this.saveBehavior();
  }

  analyzeContent() {
    // Analyze page content for interests
    const content = document.body.innerText.toLowerCase();
    
    const interestKeywords = {
      'residential': ['home', 'house', 'residential', 'apartment', 'villa', 'estate'],
      'commercial': ['office', 'commercial', 'retail', 'shop', 'business'],
      'industrial': ['warehouse', 'factory', 'industrial', 'manufacturing', 'logistics'],
      'renovation': ['renovation', 'remodel', 'upgrade', 'refurbish', 'restore'],
      'luxury': ['luxury', 'premium', 'high-end', 'exclusive', 'bespoke'],
      'sustainable': ['green', 'sustainable', 'eco', 'solar', 'energy-efficient']
    };
    
    Object.entries(interestKeywords).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        const matches = (content.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);
      
      if (score > 0) {
        this.interests.set(category, (this.interests.get(category) || 0) + score);
      }
    });
  }

  injectPersonalizedElements() {
    this.injectPersonalizedGreeting();
    this.injectInterestRecommendations();
    this.injectBehavioralIndicator();
  }

  injectPersonalizedGreeting() {
    const hero = document.querySelector('.hero-copy');
    if (!hero) return;
    
    const hour = new Date().getHours();
    let greeting = 'Welcome';
    let icon = '👋';
    
    if (hour < 12) { greeting = 'Good morning'; icon = '🌅'; }
    else if (hour < 17) { greeting = 'Good afternoon'; icon = '☀️'; }
    else { greeting = 'Good evening'; icon = '🌙'; }
    
    // Add return visitor personalization
    if (this.behavior.returnVisits > 0) {
      greeting = 'Welcome back';
      icon = '✨';
    }
    
    const greetingEl = document.createElement('div');
    greetingEl.className = 'personalized-greeting';
    greetingEl.innerHTML = `
      <span class="personalized-greeting-icon">${icon}</span>
      <span class="personalized-greeting-text">${greeting}${this.behavior.returnVisits > 0 ? ` (Visit #${this.behavior.returnVisits + 1})` : ''}</span>
    `;
    
    hero.insertBefore(greetingEl, hero.firstChild);
  }

  injectInterestRecommendations() {
    // Sort interests by score
    const sortedInterests = [...this.interests.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sortedInterests.length === 0) return;
    
    const topInterest = sortedInterests[0][0];
    
    const recommendations = {
      'residential': [
        { icon: '🏡', title: 'Custom Home Building', desc: 'Design and build your dream home from scratch', match: '98%' },
        { icon: '🏠', title: 'Home Extensions', desc: 'Expand your living space with expert additions', match: '94%' },
        { icon: '🔨', title: 'Kitchen Renovations', desc: 'Transform your kitchen into a culinary haven', match: '91%' }
      ],
      'commercial': [
        { icon: '🏢', title: 'Office Fit-Outs', desc: 'Modern workspaces designed for productivity', match: '97%' },
        { icon: '🏬', title: 'Retail Spaces', desc: 'Customer-focused retail environments', match: '95%' },
        { icon: '🏭', title: 'Industrial Units', desc: 'Efficient industrial facilities', match: '92%' }
      ],
      'industrial': [
        { icon: '🏭', title: 'Warehouse Construction', desc: 'Large-scale storage and logistics facilities', match: '99%' },
        { icon: '🚛', title: 'Distribution Centers', desc: 'Optimized for supply chain efficiency', match: '96%' },
        { icon: '⚡', title: 'Manufacturing Plants', desc: 'Purpose-built production facilities', match: '93%' }
      ],
      'renovation': [
        { icon: '🔨', title: 'Home Renovations', desc: 'Complete home transformations', match: '98%' },
        { icon: '🎨', title: 'Interior Updates', desc: 'Modernize your living spaces', match: '95%' },
        { icon: '🏚️', title: 'Heritage Restoration', desc: 'Preserve and restore historic properties', match: '91%' }
      ],
      'luxury': [
        { icon: '✨', title: 'Luxury Estates', desc: 'Bespoke high-end residences', match: '99%' },
        { icon: '💎', title: 'Premium Finishes', desc: 'Marble, hardwood, and custom craftsmanship', match: '96%' },
        { icon: '🏊', title: 'Custom Amenities', desc: 'Pools, home theaters, wine cellars', match: '93%' }
      ],
      'sustainable': [
        { icon: '🌱', title: 'Green Building', desc: 'Eco-friendly construction practices', match: '98%' },
        { icon: '☀️', title: 'Solar Integration', desc: 'Renewable energy solutions', match: '95%' },
        { icon: '💧', title: 'Water Efficiency', desc: 'Sustainable water management systems', match: '92%' }
      ]
    };
    
    const items = recommendations[topInterest] || recommendations['residential'];
    
    const section = document.createElement('div');
    section.className = 'interest-recommendations';
    section.innerHTML = `
      <div class="interest-header">
        <div class="interest-title">
          <div class="interest-title-icon">🎯</div>
          <div>
            <h3>Recommended for You</h3>
            <p>Based on your browsing behavior</p>
          </div>
        </div>
        <div class="interest-badge">
          <span class="interest-badge-dot"></span>
          <span>AI-Powered</span>
        </div>
      </div>
      <div class="personalized-grid">
        ${items.map(item => `
          <div class="personalized-card" onclick="window.location.href='services.html'">
            <div class="personalized-card-icon">${item.icon}</div>
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
            <span class="personalized-card-match">${item.match} match</span>
          </div>
        `).join('')}
      </div>
    `;
    
    // Insert after hero section
    const hero = document.querySelector('.hero');
    if (hero && hero.nextElementSibling) {
      hero.parentNode.insertBefore(section, hero.nextElementSibling);
    }
  }

  injectBehavioralIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'behavioral-indicator';
    
    // Determine message based on behavior
    let message = '';
    let icon = '';
    
    if (this.behavior.returnVisits > 2) {
      message = 'Detected returning visitor. <strong>Returning Client pricing</strong> available.';
      icon = '🏆';
    } else if (this.pageViews > 5) {
      message = 'You\'ve viewed <strong>' + this.pageViews + ' pages</strong>. Save this session?';
      icon = '📑';
    } else if (this.interests.size > 0) {
      const topInterest = [...this.interests.entries()].sort((a, b) => b[1] - a[1])[0][0];
      message = `Interested in <strong>${topInterest}</strong> projects? Get a tailored quote.`;
      icon = '💡';
    } else {
      return; // Don't show if no behavior detected
    }
    
    indicator.innerHTML = `
      <div class="behavioral-indicator-icon">${icon}</div>
      <span class="behavioral-indicator-text">${message}</span>
    `;
    
    document.body.appendChild(indicator);
    
    // Show after delay
    setTimeout(() => indicator.classList.add('active'), 2000);
    
    // Hide on click
    indicator.addEventListener('click', () => {
      indicator.classList.remove('active');
    });
  }

  startBehavioralTracking() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercent);
      this.behavior.scrollDepth = Math.round(maxScroll);
    }, { passive: true });
    
    // Track time on site
    setInterval(() => {
      this.behavior.timeOnSite += 1;
      if (this.behavior.timeOnSite % 60 === 0) {
        this.saveBehavior();
      }
    }, 1000);
    
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .service-card, .project-card');
      if (target) {
        this.behavior.interactions.push({
          type: target.tagName.toLowerCase(),
          text: target.innerText.slice(0, 50),
          timestamp: Date.now()
        });
        
        // Keep only last 50 interactions
        if (this.behavior.interactions.length > 50) {
          this.behavior.interactions = this.behavior.interactions.slice(-50);
        }
      }
    });
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveBehavior();
    });
  }

  showPersonalizedNotifications() {
    // Show smart notification based on behavior
    setTimeout(() => {
      if (this.behavior.returnVisits === 0 && this.pageViews >= 3) {
        this.showNotification({
          title: '💬 Need Help?',
          message: 'Our team is available to answer any questions about your project. Get expert advice in minutes.',
          primaryAction: { text: 'Chat Now', url: 'https://wa.me/27661200064' },
          secondaryAction: { text: 'Later', dismiss: true }
        });
      } else if (this.behavior.scrollDepth > 50 && !this.preferences.interests.includes('calculator')) {
        this.showNotification({
          title: '🧮 Planning Your Budget?',
          message: 'Try our interactive cost calculator to get an instant estimate for your project.',
          primaryAction: { text: 'Try Calculator', url: 'index.html#calculator' },
          secondaryAction: { text: 'Dismiss', dismiss: true }
        });
      }
    }, 15000);
  }

  showNotification({ title, message, primaryAction, secondaryAction }) {
    const banner = document.createElement('div');
    banner.className = 'smart-notification-banner';
    banner.innerHTML = `
      <div class="smart-notification-header">
        <span class="smart-notification-title">${title}</span>
        <button class="smart-notification-close">✕</button>
      </div>
      <div class="smart-notification-content">${message}</div>
      <div class="smart-notification-actions">
        <button class="smart-notification-btn primary">${primaryAction.text}</button>
        <button class="smart-notification-btn secondary">${secondaryAction.text}</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Animate in
    requestAnimationFrame(() => banner.classList.add('active'));
    
    // Event handlers
    banner.querySelector('.smart-notification-close').addEventListener('click', () => {
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 500);
    });
    
    banner.querySelector('.smart-notification-btn.primary').addEventListener('click', () => {
      if (primaryAction.url) {
        window.location.href = primaryAction.url;
      }
    });
    
    banner.querySelector('.smart-notification-btn.secondary').addEventListener('click', () => {
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 500);
    });
    
    // Auto dismiss after 30 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.classList.remove('active');
        setTimeout(() => banner.remove(), 500);
      }
    }, 30000);
  }

  // Public API for external integrations
  trackEvent(event, data) {
    this.behavior.interactions.push({
      type: 'event',
      event,
      data,
      timestamp: Date.now()
    });
    this.saveBehavior();
  }

  setPreference(key, value) {
    this.preferences[key] = value;
    this.savePreferences();
  }

  getPreferences() {
    return this.preferences;
  }

  getBehavior() {
    return this.behavior;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.BuildBridgePersonalization = new DynamicPersonalization();
  });
} else {
  window.BuildBridgePersonalization = new DynamicPersonalization();
}
