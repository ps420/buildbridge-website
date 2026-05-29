/**
 * v84.1: Smart Content Personalization Engine
 * Fortune 500 Adaptive Content System
 * Personalizes content based on user behavior, time, and preferences
 */

(function() {
  'use strict';

  class PersonalizationEngine {
    constructor() {
      this.userProfile = this.loadUserProfile();
      this.currentSection = null;
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    loadUserProfile() {
      const defaultProfile = {
        visitCount: 0,
        interests: [],
        viewedPages: [],
        lastVisit: null,
        preferredTime: null,
        location: null,
        sessionStart: Date.now()
      };

      try {
        const saved = localStorage.getItem('buildbridge_user_profile');
        return saved ? JSON.parse(saved) : defaultProfile;
      } catch (e) {
        return defaultProfile;
      }
    }

    saveUserProfile() {
      try {
        localStorage.setItem('buildbridge_user_profile', JSON.stringify(this.userProfile));
      } catch (e) {
        console.log('Could not save user profile');
      }
    }

    setup() {
      this.updateVisitData();
      this.trackPageView();
      this.renderPersonalizedContent();
      this.attachEventListeners();
      this.startBehaviorTracking();
    }

    updateVisitData() {
      this.userProfile.visitCount++;
      this.userProfile.lastVisit = Date.now();
      this.saveUserProfile();
    }

    trackPageView() {
      const pageName = document.title || window.location.pathname;
      const viewData = {
        page: pageName,
        timestamp: Date.now(),
        timeSpent: 0
      };
      
      this.userProfile.viewedPages.unshift(viewData);
      if (this.userProfile.viewedPages.length > 20) {
        this.userProfile.viewedPages.pop();
      }
      this.saveUserProfile();

      // Track time on page
      const startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        viewData.timeSpent = Date.now() - startTime;
        this.saveUserProfile();
      });
    }

    getTimeBasedGreeting() {
      const hour = new Date().getHours();
      let greeting, className;
      
      if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
        className = 'greeting-morning';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
        className = 'greeting-afternoon';
      } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening';
        className = 'greeting-evening';
      } else {
        greeting = 'Good Night';
        className = 'greeting-night';
      }
      
      return { greeting, className };
    }

    getPersonalizedMessage() {
      const visitCount = this.userProfile.visitCount;
      const lastVisit = this.userProfile.lastVisit;
      const daysSinceLastVisit = lastVisit ? Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24)) : 0;

      if (visitCount === 1) {
        return {
          headline: 'Welcome to BuildBridge',
          message: 'Discover how we connect you with South Africa\'s finest contractors for your construction projects.'
        };
      } else if (daysSinceLastVisit > 30) {
        return {
          headline: 'Welcome Back!',
          message: `It's been ${daysSinceLastVisit} days! We have new projects and services tailored for you.`
        };
      } else if (visitCount > 5) {
        return {
          headline: 'Great to See You Again',
          message: 'Based on your interests, we\'ve curated personalized recommendations just for you.'
        };
      } else {
        return {
          headline: 'Welcome Back',
          message: 'Continue exploring our construction management services.'
        };
      }
    }

    getRecommendations() {
      const recommendations = [
        {
          id: 'residential',
          icon: '🏠',
          title: 'Residential Construction',
          description: 'Custom homes, renovations, and extensions tailored to your lifestyle.',
          priority: this.userProfile.interests.includes('residential') ? 'recommended' : 'popular',
          stats: { value: '150+', label: 'Homes Built' },
          action: 'Explore'
        },
        {
          id: 'commercial',
          icon: '🏢',
          title: 'Commercial Projects',
          description: 'Office buildings, retail spaces, and industrial facilities.',
          priority: this.userProfile.interests.includes('commercial') ? 'recommended' : 'trending',
          stats: { value: '85+', label: 'Projects' },
          action: 'View'
        },
        {
          id: 'consultation',
          icon: '💬',
          title: 'Free Consultation',
          description: 'Get expert advice on your construction project. No obligation.',
          priority: 'popular',
          stats: { value: '98%', label: 'Satisfaction' },
          action: 'Book Now'
        }
      ];

      // Sort based on interests
      if (this.userProfile.interests.length > 0) {
        recommendations.sort((a, b) => {
          const aMatch = this.userProfile.interests.includes(a.id) ? 1 : 0;
          const bMatch = this.userProfile.interests.includes(b.id) ? 1 : 0;
          return bMatch - aMatch;
        });
      }

      return recommendations;
    }

    getBehaviorInsights() {
      const pageViews = this.userProfile.viewedPages.length;
      const avgTime = this.userProfile.viewedPages.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / (pageViews || 1);
      
      return [
        { value: this.userProfile.visitCount, label: 'Total Visits' },
        { value: pageViews, label: 'Pages Viewed' },
        { value: Math.floor(avgTime / 1000) + 's', label: 'Avg. Time' },
        { value: this.userProfile.interests.length, label: 'Interests' }
      ];
    }

    getRecentlyViewed() {
      const recentPages = this.userProfile.viewedPages.slice(0, 5);
      const pageIcons = {
        'services': '🔧',
        'projects': '🏗️',
        'contact': '📞',
        'about': 'ℹ️',
        'default': '📄'
      };

      return recentPages.map(page => {
        const pageKey = Object.keys(pageIcons).find(key => page.page.toLowerCase().includes(key)) || 'default';
        const timeAgo = this.getTimeAgo(page.timestamp);
        
        return {
          icon: pageIcons[pageKey],
          title: page.page.replace('BuildBridge | ', '').replace(' - BuildBridge', ''),
          time: timeAgo
        };
      });
    }

    getTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    }

    renderPersonalizedContent() {
      const container = document.querySelector('.personalized-content-section');
      if (!container) return;

      const { greeting, className } = this.getTimeBasedGreeting();
      const message = this.getPersonalizedMessage();
      const recommendations = this.getRecommendations();
      const insights = this.getBehaviorInsights();
      const recentlyViewed = this.getRecentlyViewed();

      container.innerHTML = `
        <div class="personalization-container">
          <!-- Personalized Banner -->
          <div class="personalized-banner personalization-animate">
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-greeting ${className}">${greeting}</div>
                <h2 class="banner-headline">${message.headline}</h2>
                <p class="banner-message">${message.message}</p>
              </div>
              <div class="banner-cta">
                <a href="services.html" class="btn">Our Services</a>
                <a href="contact.html" class="btn ghost">Get Quote</a>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="recommendation-section personalization-animate" style="animation-delay: 0.1s;">
            <div class="recommendation-header">
              <h3 class="recommendation-title">
                <span>Recommended For You</span>
                <span class="recommendation-badge">AI Curated</span>
              </h3>
              <div class="personalization-toggle" id="personalizationToggle">
                <span>Personalization</span>
                <div class="toggle-switch active"></div>
              </div>
            </div>

            <div class="recommendation-grid">
              ${recommendations.map((rec, index) => `
                <div class="smart-card ${rec.priority}" data-interest="${rec.id}" style="animation-delay: ${index * 0.1}s;">
                  ${rec.priority !== 'popular' ? `<span class="card-priority-badge ${rec.priority}">${rec.priority}</span>` : ''}
                  <div class="smart-card-icon">${rec.icon}</div>
                  <h4 class="smart-card-title">${rec.title}</h4>
                  <p class="smart-card-description">${rec.description}</p>
                  <div class="smart-card-meta">
                    <div class="meta-stat">
                      <span>${rec.stats.value}</span>
                      <span>${rec.stats.label}</span>
                    </div>
                    <div class="card-action">
                      <span>${rec.action}</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Interest Tags -->
            <div class="interest-tags">
              <span style="color: var(--slate); font-size: 12px; margin-right: 10px;">Popular interests:</span>
              ${['Residential', 'Commercial', 'Renovation', 'New Build', 'Project Management'].map(tag => `
                <button class="interest-tag ${this.userProfile.interests.includes(tag.toLowerCase()) ? 'active' : ''}" data-tag="${tag.toLowerCase()}">
                  ${tag}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Behavior Insights -->
          ${this.userProfile.visitCount > 1 ? `
            <div class="behavior-insights personalization-animate" style="animation-delay: 0.2s;">
              <div class="insights-header">
                <h4 class="insights-title">Your Journey</h4>
                <span style="font-size: 12px; color: var(--slate);">Updated in real-time</span>
              </div>
              <div class="insights-grid">
                ${insights.map(insight => `
                  <div class="insight-item">
                    <div class="insight-value">${insight.value}</div>
                    <div class="insight-label">${insight.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Recently Viewed -->
          ${recentlyViewed.length > 1 ? `
            <div class="recently-viewed personalization-animate" style="animation-delay: 0.3s;">
              <div class="recently-viewed-header">
                <h4 class="recently-viewed-title">Recently Viewed</h4>
                <button class="clear-history" id="clearHistory">Clear History</button>
              </div>
              <div class="recent-strip">
                ${recentlyViewed.map(item => `
                  <div class="recent-item">
                    <div class="recent-item-icon">${item.icon}</div>
                    <div class="recent-item-title">${item.title}</div>
                    <div class="recent-item-time">${item.time}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      this.currentSection = container;
    }

    attachEventListeners() {
      if (!this.currentSection) return;

      // Interest tag clicks
      const interestTags = this.currentSection.querySelectorAll('.interest-tag');
      interestTags.forEach(tag => {
        tag.addEventListener('click', () => {
          const interest = tag.dataset.tag;
          if (tag.classList.contains('active')) {
            tag.classList.remove('active');
            this.userProfile.interests = this.userProfile.interests.filter(i => i !== interest);
          } else {
            tag.classList.add('active');
            this.userProfile.interests.push(interest);
          }
          this.saveUserProfile();
          this.showToast('Preferences updated!');
        });
      });

      // Personalization toggle
      const toggle = this.currentSection.querySelector('#personalizationToggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const switchEl = toggle.querySelector('.toggle-switch');
          switchEl.classList.toggle('active');
          this.showToast(switchEl.classList.contains('active') ? 'Personalization enabled' : 'Personalization disabled');
        });
      }

      // Clear history
      const clearBtn = this.currentSection.querySelector('#clearHistory');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.userProfile.viewedPages = [];
          this.saveUserProfile();
          this.showToast('History cleared');
          setTimeout(() => this.renderPersonalizedContent(), 500);
        });
      }

      // Smart card clicks - track interests
      const smartCards = this.currentSection.querySelectorAll('.smart-card');
      smartCards.forEach(card => {
        card.addEventListener('click', () => {
          const interest = card.dataset.interest;
          if (interest && !this.userProfile.interests.includes(interest)) {
            this.userProfile.interests.push(interest);
            this.saveUserProfile();
          }
        });
      });
    }

    startBehaviorTracking() {
      // Track scroll depth
      let maxScroll = 0;
      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
        }
      }, { passive: true });

      // Track section visibility
      const sections = document.querySelectorAll('[data-track]');
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.dataset.track;
            if (!this.userProfile.interests.includes(sectionName)) {
              // Could add to interests after multiple views
            }
          }
        });
      }, { threshold: 0.5 });

      sections.forEach(section => sectionObserver.observe(section));
    }

    showToast(message) {
      // Use existing toast system if available
      if (window.showToast) {
        window.showToast(message, 'info');
        return;
      }

      // Simple fallback toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(15, 15, 16, 0.95);
        border: 1px solid rgba(201, 206, 214, 0.2);
        padding: 16px 32px;
        border-radius: 8px;
        color: var(--white);
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  }

  // Initialize personalization engine
  new PersonalizationEngine();

})();
