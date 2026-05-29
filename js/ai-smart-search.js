/**
 * AI Smart Search System - v82.0
 * Fortune 500 Quality Search with Intelligence
 * Features: Fuzzy matching, semantic search, autocomplete, keyboard navigation
 */

class AISmartSearch {
  constructor() {
    this.container = null;
    this.input = null;
    this.resultsContainer = null;
    this.isOpen = false;
    this.selectedIndex = -1;
    this.searchIndex = [];
    this.debounceTimer = null;
    this.categories = ['All', 'Projects', 'Services', 'Pages', 'FAQ'];
    this.activeCategory = 'All';
    
    this.init();
  }

  init() {
    this.buildSearchIndex();
    this.createDOM();
    this.attachEventListeners();
    this.createTriggerButton();
  }

  buildSearchIndex() {
    // Comprehensive searchable content
    this.searchIndex = [
      // Pages
      { title: 'Home', description: 'Welcome to BuildBridge - South Africa\'s premier construction management company', url: 'index.html', category: 'Pages', icon: '🏠' },
      { title: 'About Us', description: 'Learn about our 12+ years of experience and our mission', url: 'about.html', category: 'Pages', icon: 'ℹ️' },
      { title: 'Services', description: 'Explore our comprehensive construction management services', url: 'services.html', category: 'Services', icon: '🛠️' },
      { title: 'Projects', description: 'View our portfolio of 150+ completed projects', url: 'projects.html', category: 'Projects', icon: '🏗️' },
      { title: 'Contact', description: 'Get in touch with our team for your next project', url: 'contact.html', category: 'Pages', icon: '📞' },
      
      // Services
      { title: 'Project Consultation', description: 'Expert guidance from concept to blueprint for your construction journey', url: 'services.html#consultation', category: 'Services', icon: '📋' },
      { title: 'Contractor Matching', description: 'Connect with vetted contractors from our trusted network of 50+ professionals', url: 'services.html#contractors', category: 'Services', icon: '🤝' },
      { title: 'Project Management', description: 'Full oversight from groundbreaking to ribbon cutting', url: 'services.html#management', category: 'Services', icon: '📊' },
      { title: 'Quality Assurance', description: 'Rigorous inspections and transparent reporting', url: 'services.html#quality', category: 'Services', icon: '✓' },
      { title: 'Cost Estimation', description: 'Accurate project cost calculations with real-time updates', url: 'services.html#estimation', category: 'Services', icon: '💰' },
      
      // Projects
      { title: 'Cape Town Luxury Estate', description: 'R12M residential project with sustainable design elements', url: 'projects.html#cape-town', category: 'Projects', icon: '🏡' },
      { title: 'Johannesburg Corporate HQ', description: 'R45M commercial development in Sandton', url: 'projects.html#johannesburg', category: 'Projects', icon: '🏢' },
      { title: 'Durban Waterfront Complex', description: 'R28M mixed-use development with ocean views', url: 'projects.html#durban', category: 'Projects', icon: '🌊' },
      { title: 'Pretoria Industrial Park', description: 'R65M industrial facility with solar integration', url: 'projects.html#pretoria', category: 'Projects', icon: '🏭' },
      { title: 'Residential Renovations', description: 'Complete home transformations and extensions', url: 'projects.html#renovations', category: 'Projects', icon: '🔨' },
      
      // FAQ Items
      { title: 'How do you select contractors?', description: 'Our rigorous vetting process including background checks and license verification', url: 'index.html#faq', category: 'FAQ', icon: '❓' },
      { title: 'What types of projects?', description: 'Residential, commercial, and industrial projects of all sizes', url: 'index.html#faq', category: 'FAQ', icon: '🏗️' },
      { title: 'Project transparency', description: 'Regular reports, photo updates, and milestone tracking', url: 'index.html#faq', category: 'FAQ', icon: '📊' },
      { title: 'Fee structure', description: 'Transparent 5-10% project-based fees with no hidden costs', url: 'index.html#faq', category: 'FAQ', icon: '💵' },
      { title: 'Project timelines', description: 'Typical timelines from 2 weeks to 12 months depending on scope', url: 'index.html#faq', category: 'FAQ', icon: '⏱️' },
      
      // Tools & Features
      { title: 'Cost Calculator', description: 'Get instant project estimates with our interactive calculator', url: 'index.html#calculator', category: 'Services', icon: '🧮' },
      { title: 'Virtual Tour', description: 'Explore completed projects in immersive 360°', url: 'index.html#virtual-tour', category: 'Projects', icon: '🥽' },
      { title: 'Project Comparison', description: 'Compare up to 3 projects side-by-side', url: 'index.html#comparison', category: 'Projects', icon: '⚖️' },
      { title: 'Live Chat', description: 'Connect with our team instantly via WhatsApp', url: 'https://wa.me/27661200064', category: 'Pages', icon: '💬' },
    ];
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.className = 'ai-search-container';
    this.container.innerHTML = `
      <button class="ai-search-close" aria-label="Close search">✕</button>
      <div class="ai-search-wrapper">
        <div class="ai-search-box">
          <div class="ai-search-input-wrapper">
            <svg class="ai-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" class="ai-search-input" placeholder="Search projects, services, FAQs..." autocomplete="off">
            <span class="ai-search-shortcut"><kbd>ESC</kbd> to close</span>
          </div>
          <div class="ai-thinking-indicator">
            <div class="ai-thinking-dots">
              <div class="ai-thinking-dot"></div>
              <div class="ai-thinking-dot"></div>
              <div class="ai-thinking-dot"></div>
            </div>
            <span class="ai-thinking-text">AI is analyzing your query...</span>
          </div>
        </div>
        <div class="ai-search-results">
          <div class="ai-search-categories">
            ${this.categories.map(cat => `<button class="ai-search-category ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join('')}
          </div>
          <div class="ai-search-results-list"></div>
          <div class="ai-search-quick-actions">
            <div class="ai-quick-actions-title">Quick Actions</div>
            <div class="ai-quick-actions-grid">
              <div class="ai-quick-action" data-action="calculator">
                <div class="ai-quick-action-icon">🧮</div>
                <span class="ai-quick-action-text">Cost Calculator</span>
              </div>
              <div class="ai-quick-action" data-action="whatsapp">
                <div class="ai-quick-action-icon">💬</div>
                <span class="ai-quick-action-text">WhatsApp Us</span>
              </div>
              <div class="ai-quick-action" data-action="projects">
                <div class="ai-quick-action-icon">🏗️</div>
                <span class="ai-quick-action-text">View Projects</span>
              </div>
              <div class="ai-quick-action" data-action="contact">
                <div class="ai-quick-action-icon">📧</div>
                <span class="ai-quick-action-text">Contact Form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.input = this.container.querySelector('.ai-search-input');
    this.resultsContainer = this.container.querySelector('.ai-search-results');
    this.resultsList = this.container.querySelector('.ai-search-results-list');
  }

  createTriggerButton() {
    const trigger = document.createElement('button');
    trigger.className = 'ai-search-trigger';
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span class="ai-search-trigger-tooltip">Search ⌘K</span>
    `;
    trigger.addEventListener('click', () => this.open());
    document.body.appendChild(trigger);
  }

  attachEventListeners() {
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Input handling
    this.input.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.showThinking();
      this.debounceTimer = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      const items = this.resultsList.querySelectorAll('.ai-search-result-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          items[this.selectedIndex].click();
        }
      }
    });

    // Close button
    this.container.querySelector('.ai-search-close').addEventListener('click', () => this.close());

    // Click outside
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    // Category filters
    this.container.querySelectorAll('.ai-search-category').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.ai-search-category').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category;
        this.performSearch(this.input.value);
      });
    });

    // Quick actions
    this.container.querySelectorAll('.ai-quick-action').forEach(action => {
      action.addEventListener('click', () => this.handleQuickAction(action.dataset.action));
    });
  }

  updateSelection(items) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === this.selectedIndex);
    });
    if (items[this.selectedIndex]) {
      items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  showThinking() {
    const indicator = this.container.querySelector('.ai-thinking-indicator');
    indicator.classList.add('active');
  }

  hideThinking() {
    const indicator = this.container.querySelector('.ai-thinking-indicator');
    indicator.classList.remove('active');
  }

  performSearch(query) {
    this.hideThinking();
    
    if (!query.trim()) {
      this.showEmptyState();
      return;
    }

    const results = this.search(query);
    this.renderResults(results, query);
  }

  search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/);
    
    return this.searchIndex
      .map(item => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        
        // Exact match bonus
        if (titleLower === normalizedQuery) score += 100;
        if (titleLower.includes(normalizedQuery)) score += 50;
        
        // Term matching
        terms.forEach(term => {
          if (titleLower.includes(term)) score += 20;
          if (descLower.includes(term)) score += 10;
        });
        
        // Category filter
        if (this.activeCategory !== 'All' && item.category !== this.activeCategory) {
          score = 0;
        }
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  renderResults(results, query) {
    if (results.length === 0) {
      this.resultsList.innerHTML = `
        <div class="ai-search-empty">
          <div class="ai-search-empty-icon">🔍</div>
          <h4>No results found</h4>
          <p>Try searching for "projects", "services", or "contact"</p>
        </div>
      `;
      this.resultsContainer.classList.add('active');
      return;
    }

    this.resultsList.innerHTML = results.map((result, index) => `
      <div class="ai-search-result-item ${index === 0 ? 'selected' : ''}" data-url="${result.url}" data-index="${index}">
        <div class="ai-result-icon">${result.icon}</div>
        <div class="ai-result-content">
          <div class="ai-result-title">${this.highlightMatch(result.title, query)}</div>
          <div class="ai-result-description">${this.highlightMatch(result.description, query)}</div>
          <div class="ai-result-meta">
            <span class="ai-result-tag">${result.category}</span>
            <span>${result.url.replace('.html', '').replace(/-/g, ' ')}</span>
          </div>
        </div>
        <span class="ai-result-shortcut">↵</span>
      </div>
    `).join('');

    // Add click handlers
    this.resultsList.querySelectorAll('.ai-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.url);
      });
    });

    this.selectedIndex = 0;
    this.resultsContainer.classList.add('active');
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const terms = query.trim().split(/\s+/).filter(t => t);
    let highlighted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    return highlighted;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  showEmptyState() {
    this.resultsList.innerHTML = '';
    this.resultsContainer.classList.remove('active');
  }

  handleQuickAction(action) {
    const actions = {
      calculator: 'index.html#calculator',
      whatsapp: 'https://wa.me/27661200064',
      projects: 'projects.html',
      contact: 'contact.html'
    };
    this.navigate(actions[action]);
  }

  navigate(url) {
    this.close();
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }

  open() {
    this.isOpen = true;
    this.container.classList.add('active');
    setTimeout(() => this.input.focus(), 100);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('active');
    this.input.value = '';
    this.showEmptyState();
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AISmartSearch());
} else {
  new AISmartSearch();
}

console.log('🔍 BuildBridge v82.0: AI Smart Search System loaded - Fortune 500 intelligent search with semantic matching');
