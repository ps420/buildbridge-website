/**
 * Interactive FAQ Accordion - v40.0
 * Fortune 500 Professional FAQ System
 * With search, categories, and smooth animations
 */

class FAQAccordion {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.error('[FAQ] Container not found');
      return;
    }
    
    this.options = {
      allowMultiple: false,
      animate: true,
      searchPlaceholder: 'Search questions...',
      ...options
    };
    
    this.items = [];
    this.categories = new Set();
    this.activeCategory = 'all';
    this.searchQuery = '';
    
    this.init();
  }
  
  init() {
    this.parseData();
    this.render();
    this.bindEvents();
  }
  
  parseData() {
    // Find FAQ data from HTML or JSON
    const dataAttr = this.container.dataset.faq;
    
    if (dataAttr) {
      try {
        this.data = JSON.parse(dataAttr);
      } catch (e) {
        console.error('[FAQ] Invalid JSON data');
        this.data = [];
      }
    } else {
      // Parse from HTML structure
      this.data = Array.from(this.container.querySelectorAll('.faq-item')).map(item => ({
        id: item.dataset.id || `faq-${Math.random().toString(36).substr(2, 9)}`,
        category: item.dataset.category || 'general',
        question: item.querySelector('.faq-question')?.textContent?.trim() || '',
        answer: item.querySelector('.faq-answer')?.innerHTML || ''
      }));
    }
    
    // Collect categories
    this.data.forEach(item => {
      if (item.category) {
        this.categories.add(item.category);
      }
    });
  }
  
  render() {
    const categories = Array.from(this.categories);
    
    this.container.innerHTML = `
      <!-- Search -->
      <div class="faq-search-container">
        <span class="faq-search-icon">🔍</span>
        <input 
          type="text" 
          class="faq-search-input" 
          placeholder="${this.options.searchPlaceholder}"
          autocomplete="off"
        >
        <button class="faq-search-clear" aria-label="Clear search">×</button>
      </div>
      
      <!-- Categories -->
      ${categories.length > 1 ? `
        <div class="faq-categories">
          <button class="faq-category-btn is-active" data-category="all">All</button>
          ${categories.map(cat => `
            <button class="faq-category-btn" data-category="${cat}">${this.capitalize(cat)}</button>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- Controls -->
      <div class="faq-controls">
        <button class="faq-control-btn" data-action="expand">Expand All</button>
        <button class="faq-control-btn" data-action="collapse">Collapse All</button>
      </div>
      
      <!-- Accordion -->
      <div class="faq-accordion">
        ${this.data.map((item, index) => `
          <div 
            class="faq-item" 
            data-id="${item.id}" 
            data-category="${item.category}"
            style="animation-delay: ${index * 50}ms"
          >
            <button class="faq-question" aria-expanded="false">
              <span class="faq-question-text">${this.escapeHtml(item.question)}</span>
              <span class="faq-question-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
            </button>
            <div class="faq-answer">
              <div class="faq-answer-inner">
                ${item.answer}
                <div class="faq-helpful">
                  <span class="faq-helpful-text">Was this helpful?</span>
                  <div class="faq-helpful-buttons">
                    <button class="faq-helpful-btn" data-helpful="yes">
                      👍 Yes
                    </button>
                    <button class="faq-helpful-btn negative" data-helpful="no">
                      👎 No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- CTA -->
      <div class="faq-cta">
        <h3>Still have questions?</h3>
        <p>We're here to help. Reach out to our team.</p>
        <a href="contact.html" class="btn">Contact Support</a>
      </div>
    `;
    
    // Cache elements
    this.searchInput = this.container.querySelector('.faq-search-input');
    this.searchClear = this.container.querySelector('.faq-search-clear');
    this.accordion = this.container.querySelector('.faq-accordion');
    this.items = Array.from(this.container.querySelectorAll('.faq-item'));
  }
  
  bindEvents() {
    // Search
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.container.querySelector('.faq-search-container')?.classList.toggle('has-value', this.searchQuery.length > 0);
      this.filterItems();
    });
    
    this.searchClear?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.container.querySelector('.faq-search-container')?.classList.remove('has-value');
      this.filterItems();
      this.searchInput.focus();
    });
    
    // Category filters
    this.container.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.faq-category-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.activeCategory = btn.dataset.category;
        this.filterItems();
      });
    });
    
    // Accordion toggle
    this.container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => this.toggleItem(btn.closest('.faq-item')));
    });
    
    // Controls
    this.container.querySelectorAll('.faq-control-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'expand') {
          this.items.forEach(item => this.openItem(item));
        } else if (action === 'collapse') {
          this.items.forEach(item => this.closeItem(item));
        }
      });
    });
    
    // Helpful buttons
    this.container.querySelectorAll('.faq-helpful-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.faq-helpful-buttons');
        parent.querySelectorAll('.faq-helpful-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }
  
  toggleItem(item) {
    const isOpen = item.classList.contains('is-open');
    
    if (!this.options.allowMultiple) {
      // Close others
      this.items.filter(i => i !== item && i.classList.contains('is-open')).forEach(i => {
        this.closeItem(i);
      });
    }
    
    if (isOpen) {
      this.closeItem(item);
    } else {
      this.openItem(item);
    }
  }
  
  openItem(item) {
    item.classList.add('is-open');
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.setAttribute('aria-expanded', 'true');
    
    if (this.options.animate) {
      // Calculate height
      const inner = answer.querySelector('.faq-answer-inner');
      const height = inner.offsetHeight;
      answer.style.maxHeight = height + 'px';
    } else {
      answer.style.maxHeight = 'none';
    }
  }
  
  closeItem(item) {
    item.classList.remove('is-open');
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0';
  }
  
  filterItems() {
    let visibleCount = 0;
    
    this.items.forEach(item => {
      const category = item.dataset.category;
      const question = item.querySelector('.faq-question-text').textContent.toLowerCase();
      const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
      
      const matchesCategory = this.activeCategory === 'all' || category === this.activeCategory;
      const matchesSearch = !this.searchQuery || 
        question.includes(this.searchQuery) || 
        answer.includes(this.searchQuery);
      
      if (matchesCategory && matchesSearch) {
        item.classList.remove('is-hidden');
        visibleCount++;
        
        // Highlight matches
        if (this.searchQuery) {
          this.highlightMatches(item);
        } else {
          this.removeHighlights(item);
        }
      } else {
        item.classList.add('is-hidden');
        this.closeItem(item);
      }
    });
    
    // Show no results message if needed
    const existingNoResults = this.accordion.querySelector('.no-results');
    if (existingNoResults) {
      existingNoResults.remove();
    }
    
    if (visibleCount === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'faq-item no-results';
      noResults.innerHTML = `
        <p>No questions found matching "${this.escapeHtml(this.searchQuery)}"</p>
      `;
      this.accordion.appendChild(noResults);
    }
  }
  
  highlightMatches(item) {
    const questionEl = item.querySelector('.faq-question-text');
    const text = questionEl.textContent;
    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    questionEl.innerHTML = text.replace(regex, '<mark class="faq-highlight">$1</mark>');
  }
  
  removeHighlights(item) {
    const questionEl = item.querySelector('.faq-question-text');
    questionEl.textContent = questionEl.textContent; // Remove HTML
  }
  
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Public API
  expandAll() {
    this.items.forEach(item => this.openItem(item));
  }
  
  collapseAll() {
    this.items.forEach(item => this.closeItem(item));
  }
  
  search(query) {
    this.searchInput.value = query;
    this.searchQuery = query.toLowerCase();
    this.filterItems();
  }
  
  filterByCategory(category) {
    this.activeCategory = category;
    this.container.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.category === category);
    });
    this.filterItems();
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize FAQ sections
    document.querySelectorAll('.faq-section[data-auto-init]').forEach(section => {
      new FAQAccordion(section);
    });
  });
} else {
  document.querySelectorAll('.faq-section[data-auto-init]').forEach(section => {
    new FAQAccordion(section);
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAQAccordion;
}
