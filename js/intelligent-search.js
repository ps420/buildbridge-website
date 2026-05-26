/**
 * BuildBridge Intelligent Search System v1.0
 * Fortune 500 Quality - Real-time search with keyboard shortcuts
 * Features: Fuzzy matching, instant results, keyboard navigation, search history
 */

class IntelligentSearch {
  constructor() {
    this.isOpen = false;
    this.searchIndex = [];
    this.searchHistory = JSON.parse(localStorage.getItem('bb_search_history') || '[]');
    this.selectedIndex = -1;
    this.results = [];
    
    this.init();
  }
  
  init() {
    this.buildSearchIndex();
    this.createDOM();
    this.bindEvents();
    this.setupKeyboardShortcut();
  }
  
  buildSearchIndex() {
    // Index all searchable content
    this.searchIndex = [
      { title: 'Home', url: 'index.html', type: 'page', category: 'Navigation', keywords: 'home main start' },
      { title: 'About BuildBridge', url: 'about.html', type: 'page', category: 'Company', keywords: 'about us company story team mission' },
      { title: 'Our Services', url: 'services.html', type: 'page', category: 'Services', keywords: 'services offerings what we do' },
      { title: 'Project Consultation', url: 'services.html#consultation', type: 'service', category: 'Services', keywords: 'consult advice planning consultation' },
      { title: 'Contractor Matching', url: 'services.html#matching', type: 'service', category: 'Services', keywords: 'contractors builders find match' },
      { title: 'Project Management', url: 'services.html#management', type: 'service', category: 'Services', keywords: 'manage oversight timeline coordination' },
      { title: 'Quality Assurance', url: 'services.html#quality', type: 'service', category: 'Services', keywords: 'quality control inspection standards' },
      { title: 'Projects Gallery', url: 'projects.html', type: 'page', category: 'Work', keywords: 'projects portfolio work showcase' },
      { title: 'Residential Projects', url: 'projects.html#residential', type: 'category', category: 'Work', keywords: 'homes houses residential' },
      { title: 'Commercial Projects', url: 'projects.html#commercial', type: 'category', category: 'Work', keywords: 'commercial office business' },
      { title: 'Contact Us', url: 'contact.html', type: 'page', category: 'Contact', keywords: 'contact reach get in touch' },
      { title: 'WhatsApp Chat', url: 'https://wa.me/27661200064', type: 'external', category: 'Contact', keywords: 'whatsapp chat message' },
      { title: 'Phone Call', url: 'tel:+27661200064', type: 'external', category: 'Contact', keywords: 'phone call number' },
      { title: 'Cost Calculator', url: 'index.html#calculator', type: 'tool', category: 'Tools', keywords: 'calculator estimate cost price' },
      { title: 'FAQ', url: 'index.html#faq', type: 'page', category: 'Support', keywords: 'faq questions help answers' },
      { title: 'Process Timeline', url: 'index.html#process', type: 'page', category: 'About', keywords: 'process how we work steps timeline' },
      { title: 'Testimonials', url: 'index.html#testimonials', type: 'page', category: 'Reviews', keywords: 'reviews testimonials clients' },
      { title: 'Privacy Policy', url: '#privacy', type: 'legal', category: 'Legal', keywords: 'privacy policy legal terms' },
    ];
  }
  
  createDOM() {
    // Search overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'search-overlay';
    this.overlay.innerHTML = `
      <div class="search-backdrop"></div>
      <div class="search-container">
        <div class="search-header">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" class="search-input" placeholder="Search anything... (Press / to open)" autocomplete="off">
            <button class="search-clear" aria-label="Clear search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <kbd class="search-shortcut">ESC</kbd>
          </div>
          <button class="search-close" aria-label="Close search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="search-body">
          <div class="search-results-container">
            <div class="search-results"></div>
            <div class="search-empty">
              <div class="search-empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try adjusting your search terms</p>
            </div>
            <div class="search-initial">
              <div class="search-suggestions">
                <h4>Suggested</h4>
                <div class="suggestion-chips">
                  <button class="suggestion-chip" data-query="services">Services</button>
                  <button class="suggestion-chip" data-query="projects">Projects</button>
                  <button class="suggestion-chip" data-query="contact">Contact</button>
                  <button class="suggestion-chip" data-query="calculator">Calculator</button>
                </div>
              </div>
              ${this.searchHistory.length ? `
                <div class="search-history">
                  <h4>Recent Searches</h4>
                  <div class="history-items">
                    ${this.searchHistory.slice(0, 5).map(item => `
                      <button class="history-item" data-query="${item}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/>
                          <path d="M12 7v5l3 3"/>
                        </svg>
                        <span>${item}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              <div class="search-shortcuts-help">
                <h4>Keyboard Shortcuts</h4>
                <div class="shortcuts-list">
                  <div class="shortcut-item">
                    <kbd>↑</kbd><kbd>↓</kbd>
                    <span>Navigate results</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>↵</kbd>
                    <span>Open selected</span>
                  </div>
                  <div class="shortcut-item">
                    <kbd>esc</kbd>
                    <span>Close search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="search-footer">
            <span class="search-stats">Powered by BuildBridge</span>
            <div class="search-nav-hint">
              <kbd>↑</kbd><kbd>↓</kbd> to navigate
              <kbd>↵</kbd> to select
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Cache DOM elements
    this.input = this.overlay.querySelector('.search-input');
    this.resultsContainer = this.overlay.querySelector('.search-results');
    this.emptyState = this.overlay.querySelector('.search-empty');
    this.initialState = this.overlay.querySelector('.search-initial');
    this.clearBtn = this.overlay.querySelector('.search-clear');
  }
  
  bindEvents() {
    // Open/Close
    this.overlay.querySelector('.search-close').addEventListener('click', () => this.close());
    this.overlay.querySelector('.search-backdrop').addEventListener('click', () => this.close());
    
    // Input handling
    this.input.addEventListener('input', (e) => this.handleInput(e.target.value));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Clear button
    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.input.focus();
      this.showInitialState();
    });
    
    // Suggestion chips
    this.overlay.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.input.value = chip.dataset.query;
        this.handleInput(chip.dataset.query);
      });
    });
    
    // History items
    this.overlay.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        this.input.value = item.dataset.query;
        this.handleInput(item.dataset.query);
      });
    });
  }
  
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K or / to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      if (e.key === '/' && !this.isOpen && !this.isInputFocused()) {
        e.preventDefault();
        this.open();
      }
      // ESC to close
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }
  
  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus input after animation
    setTimeout(() => {
      this.input.focus();
      this.showInitialState();
    }, 100);
    
    // Announce to screen readers
    this.announce('Search dialog opened. Type to search.');
  }
  
  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.input.value = '';
    this.selectedIndex = -1;
    
    // Announce to screen readers
    this.announce('Search dialog closed.');
  }
  
  handleInput(query) {
    const trimmed = query.trim();
    
    // Toggle clear button
    this.clearBtn.style.opacity = trimmed ? '1' : '0';
    this.clearBtn.style.pointerEvents = trimmed ? 'auto' : 'none';
    
    if (!trimmed) {
      this.showInitialState();
      return;
    }
    
    this.search(trimmed);
  }
  
  search(query) {
    const lowercaseQuery = query.toLowerCase();
    
    // Fuzzy search algorithm
    this.results = this.searchIndex.filter(item => {
      const title = item.title.toLowerCase();
      const keywords = item.keywords.toLowerCase();
      const category = item.category.toLowerCase();
      
      return title.includes(lowercaseQuery) ||
             keywords.includes(lowercaseQuery) ||
             category.includes(lowercaseQuery) ||
             this.fuzzyMatch(title, lowercaseQuery);
    });
    
    // Sort by relevance
    this.results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(lowercaseQuery);
      const bTitle = b.title.toLowerCase().includes(lowercaseQuery);
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });
    
    this.renderResults(query);
  }
  
  fuzzyMatch(str, pattern) {
    const patternChars = pattern.split('');
    let strIndex = 0;
    
    for (const char of patternChars) {
      strIndex = str.indexOf(char, strIndex);
      if (strIndex === -1) return false;
      strIndex++;
    }
    return true;
  }
  
  renderResults(query) {
    if (this.results.length === 0) {
      this.showEmptyState();
      return;
    }
    
    this.hideAllStates();
    this.resultsContainer.style.display = 'block';
    
    // Group by category
    const grouped = this.results.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    // Render grouped results
    this.resultsContainer.innerHTML = Object.entries(grouped).map(([category, items]) => `
      <div class="search-group">
        <div class="search-group-header">${category}</div>
        ${items.map((item, index) => this.renderResultItem(item, index)).join('')}
      </div>
    `).join('');
    
    // Bind result clicks
    this.resultsContainer.querySelectorAll('.search-result-item').forEach((el, index) => {
      el.addEventListener('click', () => this.selectResult(index));
      el.addEventListener('mouseenter', () => this.setSelectedIndex(index));
    });
    
    // Announce results count
    this.announce(`${this.results.length} results found`);
  }
  
  renderResultItem(item, index) {
    const icons = {
      page: '📄',
      service: '⚙️',
      category: '📁',
      external: '↗️',
      tool: '🛠️',
      legal: '⚖️'
    };
    
    return `
      <a href="${item.url}" class="search-result-item" data-index="${index}" ${item.type === 'external' ? 'target="_blank"' : ''}>
        <div class="result-icon">${icons[item.type] || '📄'}</div>
        <div class="result-content">
          <div class="result-title">${this.highlightMatch(item.title)}</div>
          <div class="result-meta">${item.category} • ${item.type}</div>
        </div>
        <div class="result-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </a>
    `;
  }
  
  highlightMatch(text) {
    const query = this.input.value.trim();
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  handleKeydown(e) {
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateResults(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateResults(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
          this.selectResult(this.selectedIndex);
        } else if (this.results.length > 0) {
          this.selectResult(0);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }
  
  navigateResults(direction) {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    if (!items.length) return;
    
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) this.selectedIndex = items.length - 1;
    if (this.selectedIndex >= items.length) this.selectedIndex = 0;
    
    this.setSelectedIndex(this.selectedIndex);
  }
  
  setSelectedIndex(index) {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });
    
    this.selectedIndex = index;
    
    // Scroll into view
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }
  
  selectResult(index) {
    const item = this.results[index];
    if (!item) return;
    
    // Add to history
    this.addToHistory(this.input.value.trim());
    
    // Navigate
    if (item.type === 'external') {
      window.open(item.url, '_blank');
    } else {
      window.location.href = item.url;
    }
    
    this.close();
  }
  
  addToHistory(query) {
    if (!query || query.length < 2) return;
    
    this.searchHistory = [query, ...this.searchHistory.filter(q => q !== query)].slice(0, 10);
    localStorage.setItem('bb_search_history', JSON.stringify(this.searchHistory));
  }
  
  showInitialState() {
    this.resultsContainer.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.initialState.style.display = 'block';
    this.selectedIndex = -1;
  }
  
  showEmptyState() {
    this.resultsContainer.style.display = 'none';
    this.initialState.style.display = 'none';
    this.emptyState.style.display = 'flex';
    this.selectedIndex = -1;
  }
  
  hideAllStates() {
    this.initialState.style.display = 'none';
    this.emptyState.style.display = 'none';
  }
  
  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.buildBridgeSearch = new IntelligentSearch();
});

// Add search trigger button to nav
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  if (nav) {
    const searchTrigger = document.createElement('button');
    searchTrigger.className = 'nav-search-trigger';
    searchTrigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <span>Search</span>
      <kbd>/</kbd>
    `;
    searchTrigger.addEventListener('click', () => {
      if (window.buildBridgeSearch) window.buildBridgeSearch.open();
    });
    
    // Insert before mobile menu button or at end of nav
    const mobileMenuBtn = nav.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      nav.insertBefore(searchTrigger, mobileMenuBtn);
    } else {
      nav.appendChild(searchTrigger);
    }
  }
});
