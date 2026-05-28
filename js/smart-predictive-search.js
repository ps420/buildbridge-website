/**
 * Smart Predictive Search with AI Autocomplete
 * Fortune 500 Intelligent Search Experience
 * Version: v54.0
 */

class SmartPredictiveSearch {
  constructor(options = {}) {
    this.container = null;
    this.searchInput = null;
    this.suggestionsList = null;
    this.overlay = null;
    this.selectedIndex = -1;
    this.suggestions = [];
    this.searchHistory = [];
    this.isOpen = false;
    this.debounceTimer = null;
    this.currentQuery = '';
    
    // Configuration
    this.config = {
      placeholder: options.placeholder || 'Search projects, services, help articles...',
      maxSuggestions: options.maxSuggestions || 8,
      minQueryLength: options.minQueryLength || 1,
      debounceMs: options.debounceMs || 150,
      highlightMatches: options.highlightMatches !== false,
      showRecentSearches: options.showRecentSearches !== false,
      maxRecentSearches: options.maxRecentSearches || 5,
      fuzzyMatch: options.fuzzyMatch !== false,
      aiAssist: options.aiAssist !== false,
      trendingSearches: options.trendingSearches || [
        'residential projects',
        'cost calculator',
        'contractor matching',
        'project timeline',
        'commercial buildings'
      ]
    };
    
    // Search index - content that can be searched
    this.searchIndex = [
      { type: 'page', title: 'Home', url: 'index.html', keywords: ['home', 'main', 'landing', 'start'] },
      { type: 'page', title: 'About Us', url: 'about.html', keywords: ['about', 'company', 'team', 'story', 'history'] },
      { type: 'page', title: 'Services', url: 'services.html', keywords: ['services', 'what we do', 'offerings', 'capabilities'] },
      { type: 'page', title: 'Projects', url: 'projects.html', keywords: ['projects', 'portfolio', 'work', 'gallery', 'showcase'] },
      { type: 'page', title: 'Contact', url: 'contact.html', keywords: ['contact', 'reach us', 'get in touch', 'inquiry'] },
      { type: 'service', title: 'Project Consultation', url: 'services.html#consultation', keywords: ['consultation', 'advice', 'planning', 'assessment', 'quote'] },
      { type: 'service', title: 'Contractor Matching', url: 'services.html#matching', keywords: ['contractors', 'builders', 'matching', 'find', 'network'] },
      { type: 'service', title: 'Project Management', url: 'services.html#management', keywords: ['management', 'oversight', 'coordination', 'supervision'] },
      { type: 'service', title: 'Quality Assurance', url: 'services.html#quality', keywords: ['quality', 'inspection', 'assurance', 'standards', 'control'] },
      { type: 'project', title: 'Cape Town Residential', url: 'projects.html#cape-town', keywords: ['cape town', 'residential', 'house', 'home', 'luxury'] },
      { type: 'project', title: 'Johannesburg Commercial', url: 'projects.html#johannesburg', keywords: ['johannesburg', 'commercial', 'office', 'business'] },
      { type: 'project', title: 'Durban Waterfront', url: 'projects.html#durban', keywords: ['durban', 'waterfront', 'mixed-use', 'development'] },
      { type: 'feature', title: 'Cost Calculator', url: 'index.html#cost-calculator', keywords: ['calculator', 'estimate', 'cost', 'price', 'budget', 'quote'] },
      { type: 'feature', title: 'Virtual Tour', url: 'index.html#virtual-tour', keywords: ['virtual tour', '360', 'experience', 'walkthrough', 'view'] },
      { type: 'help', title: 'FAQ', url: 'index.html#faq', keywords: ['faq', 'questions', 'help', 'common', 'answers'] },
      { type: 'help', title: 'Process Timeline', url: 'index.html#process', keywords: ['process', 'how we work', 'timeline', 'steps', 'workflow'] },
      { type: 'contact', title: 'WhatsApp Chat', url: 'https://wa.me/27661200064', keywords: ['whatsapp', 'chat', 'message', 'quick contact'], external: true },
      { type: 'contact', title: 'Call Us', url: 'tel:+27661200064', keywords: ['call', 'phone', 'telephone', 'contact number'], external: true }
    ];
    
    // Fuzzy matching scores
    this.fuzzyThreshold = 0.4;
    
    this.init();
  }
  
  init() {
    this.loadSearchHistory();
    this.createUI();
    this.bindEvents();
    this.injectGlobalShortcut();
  }
  
  loadSearchHistory() {
    try {
      const saved = localStorage.getItem('buildbridge-search-history');
      this.searchHistory = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.searchHistory = [];
    }
  }
  
  saveSearchHistory() {
    try {
      localStorage.setItem('buildbridge-search-history', JSON.stringify(this.searchHistory.slice(0, this.config.maxRecentSearches)));
    } catch (e) {}
  }
  
  createUI() {
    // Create search overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'smart-search-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    
    // Create search container
    this.container = document.createElement('div');
    this.container.className = 'smart-search-container';
    this.container.setAttribute('role', 'search');
    this.container.setAttribute('aria-label', 'Site search');
    
    this.container.innerHTML = `
      <div class="smart-search-header">
        <div class="smart-search-input-wrapper">
          <svg class="smart-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            class="smart-search-input" 
            placeholder="${this.config.placeholder}"
            aria-label="Search"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          >
          <button class="smart-search-close" aria-label="Close search">✕</button>
          <kbd class="smart-search-shortcut">ESC</kbd>
        </div>
      </div>
      
      <div class="smart-search-suggestions" role="listbox" aria-label="Search suggestions">
        <div class="smart-search-section recent-searches" style="display: none;">
          <div class="smart-search-section-title">Recent Searches</div>
          <div class="smart-search-section-items"></div>
        </div>
        
        <div class="smart-search-section trending-searches">
          <div class="smart-search-section-title">Trending</div>
          <div class="smart-search-section-items">
            ${this.config.trendingSearches.map(term => `
              <button class="smart-search-trending-item" data-query="${term}">
                <span class="trending-icon">🔥</span>
                <span>${term}</span>
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="smart-search-section results" style="display: none;">
          <div class="smart-search-section-title">Results</div>
          <div class="smart-search-section-items"></div>
        </div>
        
        <div class="smart-search-empty" style="display: none;">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No results found</div>
          <div class="empty-text">Try different keywords or check spelling</div>
        </div>
      </div>
      
      <div class="smart-search-footer">
        <div class="smart-search-shortcuts-help">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Select</span>
          <span><kbd>esc</kbd> Close</span>
        </div>
      </div>
    `;
    
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
    
    // Cache elements
    this.searchInput = this.container.querySelector('.smart-search-input');
    this.suggestionsContainer = this.container.querySelector('.smart-search-suggestions');
    this.closeBtn = this.container.querySelector('.smart-search-close');
    this.recentSection = this.container.querySelector('.recent-searches');
    this.resultsSection = this.container.querySelector('.results');
    this.emptyState = this.container.querySelector('.smart-search-empty');
  }
  
  injectGlobalShortcut() {
    // Add keyboard shortcut hint to header
    const header = document.querySelector('.nav');
    if (header) {
      const shortcutBtn = document.createElement('button');
      shortcutBtn.className = 'smart-search-trigger-btn';
      shortcutBtn.setAttribute('aria-label', 'Open search (Press /)');
      shortcutBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search</span>
        <kbd>/</kbd>
      `;
      shortcutBtn.addEventListener('click', () => this.open());
      
      // Insert before the WhatsApp button
      const whatsappBtn = header.querySelector('.quote-btn');
      if (whatsappBtn) {
        header.insertBefore(shortcutBtn, whatsappBtn);
      }
    }
  }
  
  bindEvents() {
    // Global keyboard shortcut
    document.addEventListener('keydown', (e) => {
      // Open with /
      if (e.key === '/' && !this.isOpen && 
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.open();
      }
      
      // Close with Escape
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Input handling
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.currentQuery = e.target.value.trim();
      
      if (this.currentQuery.length === 0) {
        this.showDefaultState();
        return;
      }
      
      this.debounceTimer = setTimeout(() => {
        this.performSearch(this.currentQuery);
      }, this.config.debounceMs);
    });
    
    // Keyboard navigation in suggestions
    this.searchInput.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.navigateSuggestions(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateSuggestions(-1);
          break;
        case 'Enter':
          e.preventDefault();
          this.selectSuggestion(this.selectedIndex);
          break;
        case 'Tab':
          if (this.suggestions.length > 0) {
            e.preventDefault();
            this.selectSuggestion(0);
          }
          break;
      }
    });
    
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
    
    // Trending searches
    this.container.querySelectorAll('.smart-search-trending-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        this.searchInput.value = query;
        this.performSearch(query);
      });
    });
  }
  
  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      this.searchInput.focus();
      this.showDefaultState();
    }, 100);
    
    // Log search open
    this.logEvent('search_open');
  }
  
  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.searchInput.value = '';
    this.currentQuery = '';
    this.selectedIndex = -1;
  }
  
  showDefaultState() {
    this.resultsSection.style.display = 'none';
    this.emptyState.style.display = 'none';
    
    if (this.config.showRecentSearches && this.searchHistory.length > 0) {
      this.showRecentSearches();
    } else {
      this.recentSection.style.display = 'none';
    }
  }
  
  showRecentSearches() {
    const itemsContainer = this.recentSection.querySelector('.smart-search-section-items');
    itemsContainer.innerHTML = this.searchHistory.map((term, i) => `
      <button class="smart-search-suggestion" data-query="${term}" data-index="${i}">
        <span class="suggestion-icon">🕐</span>
        <span class="suggestion-text">${term}</span>
        <button class="suggestion-remove" data-term="${term}" aria-label="Remove from history">✕</button>
      </button>
    `).join('');
    
    // Bind click handlers
    itemsContainer.querySelectorAll('.smart-search-suggestion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!e.target.classList.contains('suggestion-remove')) {
          const query = btn.dataset.query;
          this.searchInput.value = query;
          this.performSearch(query);
        }
      });
    });
    
    itemsContainer.querySelectorAll('.suggestion-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const term = btn.dataset.term;
        this.searchHistory = this.searchHistory.filter(t => t !== term);
        this.saveSearchHistory();
        this.showDefaultState();
      });
    });
    
    this.recentSection.style.display = 'block';
  }
  
  performSearch(query) {
    if (query.length < this.config.minQueryLength) {
      this.showDefaultState();
      return;
    }
    
    this.suggestions = this.findMatches(query);
    this.selectedIndex = -1;
    
    if (this.suggestions.length === 0) {
      this.showEmptyState();
    } else {
      this.showResults(query);
    }
    
    // Add to history if it's a new search
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.saveSearchHistory();
    }
  }
  
  findMatches(query) {
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    // Score and sort matches
    this.searchIndex.forEach(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      
      // Exact title match
      if (titleLower === lowerQuery) score += 100;
      // Title starts with query
      else if (titleLower.startsWith(lowerQuery)) score += 80;
      // Title contains query
      else if (titleLower.includes(lowerQuery)) score += 60;
      
      // Keyword matches
      item.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (keywordLower === lowerQuery) score += 50;
        else if (keywordLower.startsWith(lowerQuery)) score += 40;
        else if (keywordLower.includes(lowerQuery)) score += 30;
      });
      
      // Fuzzy matching for typos
      if (this.config.fuzzyMatch && score === 0) {
        const fuzzyScore = this.calculateFuzzyScore(lowerQuery, titleLower);
        if (fuzzyScore >= this.fuzzyThreshold) {
          score += fuzzyScore * 25;
        }
      }
      
      if (score > 0) {
        matches.push({ ...item, score, matchReason: this.getMatchReason(item, lowerQuery) });
      }
    });
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    return matches.slice(0, this.config.maxSuggestions);
  }
  
  calculateFuzzyScore(query, target) {
    // Simple Levenshtein distance implementation
    const matrix = [];
    for (let i = 0; i <= target.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= query.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= target.length; i++) {
      for (let j = 1; j <= query.length; j++) {
        const cost = target[i - 1] === query[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[target.length][query.length];
    const maxLength = Math.max(query.length, target.length);
    return 1 - distance / maxLength;
  }
  
  getMatchReason(item, query) {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes(query)) return 'title';
    
    for (const keyword of item.keywords) {
      if (keyword.toLowerCase().includes(query)) return 'keyword';
    }
    
    return 'fuzzy';
  }
  
  highlightMatch(text, query) {
    if (!this.config.highlightMatches) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  showResults(query) {
    this.recentSection.style.display = 'none';
    this.emptyState.style.display = 'none';
    
    const itemsContainer = this.resultsSection.querySelector('.smart-search-section-items');
    itemsContainer.innerHTML = this.suggestions.map((item, i) => {
      const highlightedTitle = this.highlightMatch(item.title, query);
      const typeLabels = {
        page: '📄',
        service: '⚙️',
        project: '🏗️',
        feature: '✨',
        help: '❓',
        contact: '📞'
      };
      
      return `
        <a href="${item.url}" 
           class="smart-search-suggestion ${item.external ? 'external' : ''}" 
           data-index="${i}"
           ${item.external ? 'target="_blank" rel="noopener"' : ''}>
          <span class="suggestion-icon">${typeLabels[item.type] || '📄'}</span>
          <div class="suggestion-content">
            <span class="suggestion-text">${highlightedTitle}</span>
            <span class="suggestion-type">${item.type}</span>
          </div>
          ${item.external ? '<span class="suggestion-external">↗</span>' : ''}
        </a>
      `;
    }).join('');
    
    this.resultsSection.style.display = 'block';
  }
  
  showEmptyState() {
    this.recentSection.style.display = 'none';
    this.resultsSection.style.display = 'none';
    this.emptyState.style.display = 'block';
    
    // AI suggestion
    if (this.config.aiAssist) {
      this.emptyState.innerHTML += `
        <div class="ai-suggestion">
          <div class="ai-icon">🤖</div>
          <p>Try searching for:</p>
          <div class="ai-suggestions">
            ${this.config.trendingSearches.slice(0, 3).map(term => `
              <button class="ai-suggestion-btn" data-query="${term}">${term}</button>
            `).join('')}
          </div>
        </div>
      `;
      
      this.emptyState.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const query = btn.dataset.query;
          this.searchInput.value = query;
          this.performSearch(query);
        });
      });
    }
  }
  
  navigateSuggestions(direction) {
    const totalItems = this.suggestions.length;
    if (totalItems === 0) return;
    
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) {
      this.selectedIndex = totalItems - 1;
    } else if (this.selectedIndex >= totalItems) {
      this.selectedIndex = 0;
    }
    
    this.updateSelection();
  }
  
  updateSelection() {
    const items = this.container.querySelectorAll('.smart-search-suggestion');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === this.selectedIndex);
      if (i === this.selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
  
  selectSuggestion(index) {
    if (index < 0 || index >= this.suggestions.length) return;
    
    const item = this.suggestions[index];
    this.logEvent('search_select', { query: this.currentQuery, result: item.title });
    
    if (item.external) {
      window.open(item.url, '_blank');
    } else {
      window.location.href = item.url;
    }
    
    this.close();
  }
  
  logEvent(event, data = {}) {
    // Analytics logging
    if (window.gtag) {
      gtag('event', event, {
        event_category: 'search',
        ...data
      });
    }
    
    console.log(`Search: ${event}`, data);
  }
  
  // Public API
  addToIndex(item) {
    this.searchIndex.push(item);
  }
  
  removeFromIndex(url) {
    this.searchIndex = this.searchIndex.filter(item => item.url !== url);
  }
  
  clearHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }
  
  destroy() {
    this.close();
    if (this.overlay) {
      this.overlay.remove();
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartSearch = new SmartPredictiveSearch();
  });
} else {
  window.smartSearch = new SmartPredictiveSearch();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPredictiveSearch;
}
