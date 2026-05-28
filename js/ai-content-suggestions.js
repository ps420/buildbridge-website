/**
 * v38.0: AI Content Suggestion Engine
 * Smart content recommendations based on user behavior
 * Fortune 500 Next-Gen Personalization Feature
 */

class AIContentSuggestions {
  constructor(options = {}) {
    this.options = {
      maxSuggestions: options.maxSuggestions || 3,
      suggestionDelay: options.suggestionDelay || 3000,
      minReadTime: options.minReadTime || 5000,
      ...options
    };
    
    this.userBehavior = {
      pagesVisited: [],
      timeOnPage: 0,
      scrollDepth: 0,
      interests: new Map(),
      interactionCount: 0
    };
    
    this.suggestions = [
      {
        id: 'services',
        title: 'Explore Our Services',
        description: 'Discover comprehensive construction management solutions tailored to your project needs.',
        icon: '🏗️',
        link: 'services.html',
        keywords: ['service', 'consultation', 'contractor', 'management']
      },
      {
        id: 'projects',
        title: 'View Our Projects',
        description: 'See our portfolio of successful residential, commercial, and industrial developments.',
        icon: '🏢',
        link: 'projects.html',
        keywords: ['project', 'portfolio', 'work', 'residential', 'commercial']
      },
      {
        id: 'cost-calculator',
        title: 'Get a Cost Estimate',
        description: 'Use our intelligent calculator to estimate your project budget in minutes.',
        icon: '📊',
        link: '#cost-calculator',
        keywords: ['cost', 'price', 'budget', 'estimate', 'calculator']
      },
      {
        id: 'contact',
        title: 'Start Your Project',
        description: 'Ready to begin? Get in touch with our team for a free consultation.',
        icon: '💬',
        link: 'contact.html',
        keywords: ['contact', 'whatsapp', 'call', 'start', 'begin']
      },
      {
        id: 'about',
        title: 'Learn About Us',
        description: 'Meet the BuildBridge team and discover our approach to construction management.',
        icon: '👥',
        link: 'about.html',
        keywords: ['about', 'team', 'company', 'who', 'story']
      },
      {
        id: 'faq',
        title: 'Common Questions',
        description: 'Find answers to frequently asked questions about our process and services.',
        icon: '❓',
        link: '#faq',
        keywords: ['faq', 'question', 'how', 'what', 'help']
      }
    ];
    
    this.init();
  }
  
  init() {
    this.trackBehavior();
    this.createSuggestionWidget();
    this.scheduleSuggestions();
  }
  
  trackBehavior() {
    // Track page visit
    this.userBehavior.pagesVisited.push({
      url: window.location.pathname,
      timestamp: Date.now()
    });
    
    // Track time on page
    let startTime = Date.now();
    let isActive = true;
    
    setInterval(() => {
      if (isActive) {
        this.userBehavior.timeOnPage += 1000;
      }
    }, 1000);
    
    // Track activity
    ['click', 'scroll', 'keypress'].forEach(event => {
      document.addEventListener(event, () => {
        this.userBehavior.interactionCount++;
        isActive = true;
      }, { passive: true });
    });
    
    document.addEventListener('visibilitychange', () => {
      isActive = !document.hidden;
    });
    
    // Track scroll depth
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      this.userBehavior.scrollDepth = Math.max(this.userBehavior.scrollDepth, scrollPercent);
    }, { passive: true });
    
    // Extract interests from page content
    this.analyzeContent();
  }
  
  analyzeContent() {
    const content = document.body.innerText.toLowerCase();
    
    this.suggestions.forEach(suggestion => {
      let relevance = 0;
      suggestion.keywords.forEach(keyword => {
        const matches = (content.match(new RegExp(keyword, 'gi')) || []).length;
        relevance += matches;
      });
      this.userBehavior.interests.set(suggestion.id, relevance);
    });
  }
  
  getRelevantSuggestions() {
    // Filter out current page
    const currentPath = window.location.pathname;
    const filtered = this.suggestions.filter(s => {
      return !currentPath.includes(s.link.replace('.html', '')) && s.link !== '#';
    });
    
    // Sort by relevance
    filtered.sort((a, b) => {
      const scoreA = this.userBehavior.interests.get(a.id) || 0;
      const scoreB = this.userBehavior.interests.get(b.id) || 0;
      return scoreB - scoreA;
    });
    
    // If no clear interests, suggest based on typical user journey
    if (this.userBehavior.interactionCount < 3 && this.userBehavior.timeOnPage < this.options.minReadTime) {
      return filtered.slice(0, this.options.maxSuggestions);
    }
    
    return filtered.slice(0, this.options.maxSuggestions);
  }
  
  createSuggestionWidget() {
    const widget = document.createElement('div');
    widget.className = 'ai-suggestions-widget';
    widget.innerHTML = `
      <div class="ai-suggestions-header">
        <span class="ai-suggestions-icon">✨</span>
        <span class="ai-suggestions-title">Recommended for You</span>
        <button class="ai-suggestions-close" aria-label="Close suggestions">×</button>
      </div>
      <div class="ai-suggestions-content"></div>
    `;
    
    document.body.appendChild(widget);
    this.widget = widget;
    this.contentArea = widget.querySelector('.ai-suggestions-content');
    
    // Close button
    widget.querySelector('.ai-suggestions-close').addEventListener('click', () => {
      this.hideWidget();
    });
    
    // Minimize on scroll
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        widget.classList.add('minimized');
      } else {
        widget.classList.remove('minimized');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }
  
  scheduleSuggestions() {
    setTimeout(() => {
      if (this.userBehavior.timeOnPage >= this.options.minReadTime) {
        this.showSuggestions();
      } else {
        this.scheduleSuggestions();
      }
    }, this.options.suggestionDelay);
  }
  
  showSuggestions() {
    const suggestions = this.getRelevantSuggestions();
    
    if (suggestions.length === 0) return;
    
    this.contentArea.innerHTML = suggestions.map(s => `
      <a href="${s.link}" class="ai-suggestion-card" data-suggestion-id="${s.id}">
        <span class="ai-suggestion-icon">${s.icon}</span>
        <div class="ai-suggestion-info">
          <h4>${s.title}</h4>
          <p>${s.description}</p>
        </div>
        <span class="ai-suggestion-arrow">→</span>
      </a>
    `).join('');
    
    // Animate in
    this.widget.classList.add('visible');
    
    // Track clicks
    this.contentArea.querySelectorAll('.ai-suggestion-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const suggestionId = card.dataset.suggestionId;
        this.trackSuggestionClick(suggestionId);
      });
    });
    
    // Stagger animation
    const cards = this.contentArea.querySelectorAll('.ai-suggestion-card');
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.1}s`;
    });
  }
  
  hideWidget() {
    this.widget.classList.remove('visible');
    localStorage.setItem('aiSuggestionsDismissed', Date.now());
  }
  
  trackSuggestionClick(id) {
    // Could send to analytics
    console.log(`AI Suggestion clicked: ${id}`);
  }
  
  // Public API
  getBehaviorReport() {
    return {
      ...this.userBehavior,
      interests: Object.fromEntries(this.userBehavior.interests)
    };
  }
}

// CSS injection
const aiSuggestionsStyles = `
.ai-suggestions-widget {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 360px;
  background: linear-gradient(145deg, rgba(23, 25, 29, 0.98), rgba(26, 28, 33, 0.99));
  border: 1px solid rgba(201, 206, 214, 0.15);
  border-radius: 16px;
  padding: 20px;
  z-index: 998;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  transform: translateY(20px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-suggestions-widget.visible {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.ai-suggestions-widget.minimized {
  transform: translateY(calc(100% - 60px));
}

.ai-suggestions-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 206, 214, 0.1);
}

.ai-suggestions-icon {
  font-size: 18px;
}

.ai-suggestions-title {
  flex: 1;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-suggestions-close {
  width: 28px;
  height: 28px;
  background: rgba(201, 206, 214, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--chrome);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.ai-suggestions-close:hover {
  background: rgba(201, 206, 214, 0.2);
  color: var(--white);
}

.ai-suggestion-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(201, 206, 214, 0.05);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateX(20px);
  animation: ai-card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.3s ease;
}

@keyframes ai-card-enter {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-suggestion-card:hover {
  background: rgba(201, 206, 214, 0.1);
  transform: translateX(5px);
}

.ai-suggestion-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(201, 206, 214, 0.15), rgba(201, 206, 214, 0.05));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.ai-suggestion-info {
  flex: 1;
  min-width: 0;
}

.ai-suggestion-info h4 {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ai-suggestion-info p {
  font-size: 12px;
  color: var(--chrome);
  line-height: 1.4;
  opacity: 0.8;
  margin: 0;
}

.ai-suggestion-arrow {
  color: var(--chrome);
  font-size: 18px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.ai-suggestion-card:hover .ai-suggestion-arrow {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .ai-suggestions-widget {
    left: 20px;
    right: 20px;
    width: auto;
    bottom: 80px;
  }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = aiSuggestionsStyles;
document.head.appendChild(styleSheet);

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.aiContentEngine = new AIContentSuggestions();
  });
} else {
  window.aiContentEngine = new AIContentSuggestions();
}

export default AIContentSuggestions;
