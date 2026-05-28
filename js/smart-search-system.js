/**
 * Smart Predictive Search System v1.0
 * Fortune 500 Quality - AI-Powered Site Search
 * Features: Fuzzy matching, predictive suggestions, keyboard navigation, search history
 */

class SmartSearchSystem {
  constructor() {
    this.isOpen = false;
    this.searchIndex = [];
    this.searchHistory = JSON.parse(localStorage.getItem('bb_search_history') || '[]');
    this.selectedIndex = -1;
    this.currentSuggestions = [];
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.buildSearchIndex();
    this.createSearchUI();
    this.attachEventListeners();
    this.prefetchContent();
  }

  buildSearchIndex() {
    // Build searchable index from page content
    const pages = [
      {
        title: 'Home',
        url: 'index.html',
        description: 'BuildBridge - South Africa\'s premier construction management company',
        keywords: ['home', 'buildbridge', 'construction', 'management', 'south africa'],
        category: 'page',
        icon: '🏠'
      },
      {
        title: 'About Us',
        url: 'about.html',
        description: 'Learn about BuildBridge, our mission, values, and leadership team',
        keywords: ['about', 'company', 'mission', 'values', 'team', 'leadership'],
        category: 'page',
        icon: 'ℹ️'
      },
      {
        title: 'Our Services',
        url: 'services.html',
        description: 'Comprehensive construction management services including consultation, contractor matching, and project management',
        keywords: ['services', 'consultation', 'contractor matching', 'project management', 'quality assurance'],
        category: 'page',
        icon: '🏗️'
      },
      {
        title: 'Projects',
        url: 'projects.html',
        description: 'Explore our portfolio of residential, commercial, and industrial construction projects',
        keywords: ['projects', 'portfolio', 'residential', 'commercial', 'industrial', 'gallery'],
        category: 'page',
        icon: '📁'
      },
      {
        title: 'Contact Us',
        url: 'contact.html',
        description: 'Get in touch with BuildBridge for your construction project needs',
        keywords: ['contact', 'get in touch', 'phone', 'email', 'whatsapp', 'consultation'],
        category: 'page',
        icon: '📞'
      },
      {
        title: 'Project Consultation',
        url: 'services.html#consultation',
        description: 'Expert guidance from concept to completion for your construction project',
        keywords: ['consultation', 'planning', 'advice', 'expert', 'guidance'],
        category: 'service',
        icon: '📋'
      },
      {
        title: 'Contractor Matching',
        url: 'services.html#contractors',
        description: 'Connect with vetted, qualified contractors suited to your project needs',
        keywords: ['contractors', 'matching', 'vetted', 'qualified', 'network'],
        category: 'service',
        icon: '🤝'
      },
      {
        title: 'Project Management',
        url: 'services.html#management',
        description: 'Full oversight of timelines, communication, quality and progress',
        keywords: ['management', 'oversight', 'timelines', 'coordination', 'monitoring'],
        category: 'service',
        icon: '📊'
      },
      {
        title: 'Quality Assurance',
        url: 'services.html#quality',
        description: 'Transparent, professional, and accountable project delivery',
        keywords: ['quality', 'assurance', 'transparency', 'accountability', 'standards'],
        category: 'service',
        icon: '✓'
      },
      {
        title: 'Residential Projects',
        url: 'projects.html?filter=residential',
        description: 'Custom homes, renovations, and residential developments',
        keywords: ['residential', 'homes', 'houses', 'renovations', 'custom'],
        category: 'project',
        icon: '🏡'
      },
      {
        title: 'Commercial Projects',
        url: 'projects.html?filter=commercial',
        description: 'Office buildings, retail spaces, and commercial developments',
        keywords: ['commercial', 'offices', 'retail', 'business', 'corporate'],
        category: 'project',
        icon: '🏢'
      },
      {
        title: 'Industrial Projects',
        url: 'projects.html?filter=industrial',
        description: 'Manufacturing facilities, warehouses, and industrial parks',
        keywords: ['industrial', 'warehouses', 'manufacturing', 'factories', 'logistics'],
        category: 'project',
        icon: '🏭'
      },
      {
        title: 'Cost Calculator',
        url: 'index.html#cost-calculator',
        description: 'Get instant cost estimates for your construction project',
        keywords: ['calculator', 'cost', 'estimate', 'pricing', 'budget'],
        category: 'tool',
        icon: '🧮'
      },
      {
        title: 'Virtual Tour',
        url: 'index.html#virtual-tour',
        description: 'Take an immersive 360° tour of our completed projects',
        keywords: ['virtual tour', '360', 'immersive', 'explore', 'walkthrough'],
        category: 'feature',
        icon: '🥽'
      },
      {
        title: 'Watch Our Showreel',
        url: 'index.html#video-hero',
        description: 'See our construction projects in action',
        keywords: ['video', 'showreel', 'watch', 'demo', 'portfolio'],
        category: 'feature',
        icon: '🎬'
      },
      {
        title: 'Client Testimonials',
        url: 'index.html#testimonials',
        description: 'Read what our clients say about working with BuildBridge',
        keywords: ['testimonials', 'reviews', 'feedback', 'clients', 'satisfaction'],
        category: 'feature',
        icon: '💬'
      },
      {
        title: 'FAQ',
        url: 'index.html#faq',
        description: 'Common questions about our construction management services',
        keywords: ['faq', 'questions', 'answers', 'help', 'information'],
        category: 'feature',
        icon: '❓'
      },
      {
        title: 'WhatsApp Contact',
        url: 'https://wa.me/27661200064',
        description: 'Chat with us directly on WhatsApp for quick responses',
        keywords: ['whatsapp', 'chat', 'message', 'contact', 'quick'],
        category: 'contact',
        icon: '💬'
      },
      {
        title: 'Our Process',
        url: 'index.html#process',
        description: 'Learn about our streamlined construction process',
        keywords: ['process', 'how we work', 'workflow', 'methodology', 'approach'],
        category: 'feature',
        icon: '🔄'
      },
      {
        title: 'Team',
        url: 'index.html#team',
        description: 'Meet our leadership team of construction experts',
        keywords: ['team', 'leadership', 'experts', 'staff', 'people'],
        category: 'feature',
        icon: '👥'
      }
    ];

    // Extract additional content from current page
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
      if (heading.textContent.trim() && heading.id) {
        pages.push({
          title: heading.textContent.trim(),
          url: `${window.location.pathname}#${heading.id}`,
          description: `Section on ${document.title}`,
          keywords: heading.textContent.toLowerCase().split(' '),
          category: 'section',
          icon: '📄'
        });
      }
    });

    this.searchIndex = pages;
  }

  createSearchUI() {
    // Create trigger button
    const trigger = document.createElement('button');
    trigger.className = 'search-trigger';
    trigger.setAttribute('aria-label', 'Open search');
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <kbd>Ctrl+K</kbd>
    `;
    document.body.appendChild(trigger);
    this.trigger = trigger;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <button class="search-close" aria-label="Close search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
      
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" class="search-input" placeholder="Search for pages, services, projects..." autocomplete="off" spellcheck="false">
          <button class="search-clear" aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="search-suggestions">
          <div class="quick-actions">
            <div class="quick-action" data-url="index.html">
              <div class="quick-action-icon">🏠</div>
              <span class="quick-action-label">Home</span>
            </div>
            <div class="quick-action" data-url="services.html">
              <div class="quick-action-icon">🏗️</div>
              <span class="quick-action-label">Services</span>
            </div>
            <div class="quick-action" data-url="projects.html">
              <div class="quick-action-icon">📁</div>
              <span class="quick-action-label">Projects</span>
            </div>
            <div class="quick-action" data-url="contact.html">
              <div class="quick-action-icon">📞</div>
              <span class="quick-action-label">Contact</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.input = overlay.querySelector('.search-input');
    this.clearBtn = overlay.querySelector('.search-clear');
    this.suggestions = overlay.querySelector('.search-suggestions');
    this.closeBtn = overlay.querySelector('.search-close');
  }

  attachEventListeners() {
    // Open/Close
    this.trigger.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      
      // Escape to close
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      
      // Arrow navigation
      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateSuggestions(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateSuggestions(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectSuggestion();
        }
      }
    });
    
    // Input handling
    this.input.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      const query = e.target.value.trim();
      
      this.clearBtn.classList.toggle('visible', query.length > 0);
      
      if (query.length === 0) {
        this.showDefaultSuggestions();
        return;
      }
      
      this.debounceTimer = setTimeout(() => {
        this.search(query);
      }, 150);
    });
    
    // Clear button
    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.input.focus();
      this.clearBtn.classList.remove('visible');
      this.showDefaultSuggestions();
    });
    
    // Quick actions
    this.suggestions.querySelectorAll('.quick-action').forEach(action => {
      action.addEventListener('click', () => {
        this.navigate(action.dataset.url);
      });
    });
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      this.input.focus();
      this.showDefaultSuggestions();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      this.input.value = '';
      this.clearBtn.classList.remove('visible');
      this.selectedIndex = -1;
    }, 300);
  }

  search(query) {
    const results = this.performSearch(query);
    this.currentSuggestions = results;
    this.renderSuggestions(results, query);
  }

  performSearch(query) {
    const lowerQuery = query.toLowerCase();
    const scored = this.searchIndex.map(item => {
      let score = 0;
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      
      // Exact match in title
      if (title === lowerQuery) score += 100;
      // Title starts with query
      else if (title.startsWith(lowerQuery)) score += 80;
      // Title contains query
      else if (title.includes(lowerQuery)) score += 60;
      // Keyword match
      else if (item.keywords.some(k => k.includes(lowerQuery))) score += 40;
      // Description contains query
      else if (description.includes(lowerQuery)) score += 20;
      
      // Fuzzy match
      if (this.fuzzyMatch(title, lowerQuery)) score += 10;
      
      return { ...item, score };
    }).filter(item => item.score > 0);
    
    return scored.sort((a, b) => b.score - a.score).slice(0, 8);
  }

  fuzzyMatch(str, query) {
    let queryIdx = 0;
    for (let i = 0; i < str.length && queryIdx < query.length; i++) {
      if (str[i] === query[queryIdx]) queryIdx++;
    }
    return queryIdx === query.length;
  }

  renderSuggestions(results, query) {
    if (results.length === 0) {
      this.suggestions.innerHTML = `
        <div class="search-no-results">
          <div class="search-no-results-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3>No results found</h3>
          <p>Try different keywords or browse our quick actions below</p>
        </div>
        <div class="quick-actions">
          <div class="quick-action" data-url="index.html">
            <div class="quick-action-icon">🏠</div>
            <span class="quick-action-label">Home</span>
          </div>
          <div class="quick-action" data-url="services.html">
            <div class="quick-action-icon">🏗️</div>
            <span class="quick-action-label">Services</span>
          </div>
          <div class="quick-action" data-url="projects.html">
            <div class="quick-action-icon">📁</div>
            <span class="quick-action-label">Projects</span>
          </div>
          <div class="quick-action" data-url="contact.html">
            <div class="quick-action-icon">📞</div>
            <span class="quick-action-label">Contact</span>
          </div>
        </div>
      `;
      
      this.suggestions.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', () => this.navigate(action.dataset.url));
      });
      
      this.suggestions.classList.add('active');
      return;
    }
    
    // Group by category
    const grouped = results.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    const categoryLabels = {
      page: 'Pages',
      service: 'Services',
      project: 'Projects',
      feature: 'Features',
      tool: 'Tools',
      contact: 'Contact',
      section: 'Sections'
    };
    
    let html = '';
    
    Object.entries(grouped).forEach(([category, items]) => {
      html += `
        <div class="suggestion-section">
          <div class="suggestion-header">
            <span class="suggestion-title">${categoryLabels[category] || category}</span>
            <span class="suggestion-count">${items.length}</span>
          </div>
          <ul class="suggestion-list">
            ${items.map((item, idx) => this.renderSuggestionItem(item, query, idx)).join('')}
          </ul>
        </div>
      `;
    });
    
    html += `
      <div class="search-stats">
        <div class="search-stat">
          <span>${results.length}</span>
          <span>results</span>
        </div>
        <div class="search-stat">
          <span>↑↓</span>
          <span>to navigate</span>
        </div>
        <div class="search-stat">
          <span>↵</span>
          <span>to select</span>
        </div>
        <div class="search-stat">
          <span>esc</span>
          <span>to close</span>
        </div>
      </div>
    `;
    
    this.suggestions.innerHTML = html;
    this.suggestions.classList.add('active');
    
    // Attach click handlers
    this.suggestions.querySelectorAll('.suggestion-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        const result = results[idx];
        this.addToHistory(result);
        this.navigate(result.url);
      });
    });
  }

  renderSuggestionItem(item, query, idx) {
    const highlightedTitle = this.highlightMatch(item.title, query);
    
    return `
      <li class="suggestion-item" data-index="${idx}">
        <div class="suggestion-icon">${item.icon}</div>
        <div class="suggestion-content">
          <div class="suggestion-title-text">${highlightedTitle}</div>
          <div class="suggestion-description">${item.description}</div>
        </div>
        <div class="suggestion-meta">
          <span class="suggestion-type">${item.category}</span>
          ${idx < 5 ? `<span class="suggestion-shortcut">${idx === 0 ? '↵' : ''}</span>` : ''}
        </div>
      </li>
    `;
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  navigateSuggestions(direction) {
    const items = this.suggestions.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;
    
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) this.selectedIndex = items.length - 1;
    if (this.selectedIndex >= items.length) this.selectedIndex = 0;
    
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === this.selectedIndex);
    });
    
    // Scroll into view
    const selected = items[this.selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  selectSuggestion() {
    const items = this.suggestions.querySelectorAll('.suggestion-item');
    if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
      items[this.selectedIndex].click();
    } else if (this.currentSuggestions.length > 0) {
      this.addToHistory(this.currentSuggestions[0]);
      this.navigate(this.currentSuggestions[0].url);
    }
  }

  showDefaultSuggestions() {
    this.selectedIndex = -1;
    
    // Show recent searches and popular items
    let html = '<div class="suggestion-section">';
    
    if (this.searchHistory.length > 0) {
      html += `
        <div class="suggestion-header">
          <span class="suggestion-title">Recent Searches</span>
          <span class="suggestion-count">${this.searchHistory.length}</span>
        </div>
        <ul class="suggestion-list">
          ${this.searchHistory.slice(0, 3).map((item, idx) => `
            <li class="suggestion-item" data-history="${idx}">
              <div class="suggestion-icon">🕐</div>
              <div class="suggestion-content">
                <div class="suggestion-title-text">${item.title}</div>
                <div class="suggestion-description">${item.description}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    }
    
    html += '</div>';
    
    // Quick actions
    html += `
      <div class="quick-actions">
        <div class="quick-action" data-url="services.html">
          <div class="quick-action-icon">🏗️</div>
          <span class="quick-action-label">Services</span>
        </div>
        <div class="quick-action" data-url="projects.html">
          <div class="quick-action-icon">📁</div>
          <span class="quick-action-label">Projects</span>
        </div>
        <div class="quick-action" data-url="contact.html">
          <div class="quick-action-icon">📞</div>
          <span class="quick-action-label">Contact</span>
        </div>
        <div class="quick-action" data-url="index.html#cost-calculator">
          <div class="quick-action-icon">🧮</div>
          <span class="quick-action-label">Calculator</span>
        </div>
      </div>
    `;
    
    this.suggestions.innerHTML = html;
    this.suggestions.classList.add('active');
    
    // Attach handlers
    this.suggestions.querySelectorAll('.quick-action').forEach(action => {
      action.addEventListener('click', () => this.navigate(action.dataset.url));
    });
    
    this.suggestions.querySelectorAll('[data-history]').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.history);
        this.navigate(this.searchHistory[idx].url);
      });
    });
  }

  addToHistory(item) {
    // Remove if exists
    this.searchHistory = this.searchHistory.filter(h => h.url !== item.url);
    // Add to front
    this.searchHistory.unshift(item);
    // Keep only 5
    this.searchHistory = this.searchHistory.slice(0, 5);
    // Save
    localStorage.setItem('bb_search_history', JSON.stringify(this.searchHistory));
  }

  navigate(url) {
    this.close();
    
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url.includes('#')) {
      const [page, hash] = url.split('#');
      if (page && page !== window.location.pathname.split('/').pop()) {
        window.location.href = url;
      } else {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Highlight element briefly
          element.style.transition = 'box-shadow 0.3s ease';
          element.style.boxShadow = '0 0 0 4px rgba(201, 206, 214, 0.3)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);
        }
      }
    } else {
      window.location.href = url;
    }
  }

  prefetchContent() {
    // Prefetch likely navigation targets
    const prefetchUrls = ['services.html', 'projects.html', 'contact.html'];
    prefetchUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartSearch = new SmartSearchSystem();
  });
} else {
  window.smartSearch = new SmartSearchSystem();
}
