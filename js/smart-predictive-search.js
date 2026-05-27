/**
 * v32.0 - Smart Predictive Search
 * Fortune 500 Intelligent Search with Autocomplete & Keyboard Navigation
 */

(function() {
  'use strict';

  class SmartPredictiveSearch {
    constructor() {
      this.overlay = null;
      this.input = null;
      this.resultsContainer = null;
      this.selectedIndex = -1;
      this.searchData = [];
      this.recentSearches = this.loadRecentSearches();
      this.isOpen = false;
      
      // Search index
      this.searchIndex = [
        { title: 'Home', url: 'index.html', description: 'BuildBridge homepage', category: 'Pages', icon: '🏠' },
        { title: 'About Us', url: 'about.html', description: 'Learn about our company and mission', category: 'Pages', icon: '🏢' },
        { title: 'Services', url: 'services.html', description: 'Explore our construction management services', category: 'Pages', icon: '🛠️' },
        { title: 'Projects', url: 'projects.html', description: 'View our portfolio of completed projects', category: 'Pages', icon: '📁' },
        { title: 'Contact', url: 'contact.html', description: 'Get in touch with our team', category: 'Pages', icon: '📞' },
        { title: 'Project Consultation', url: 'services.html#consultation', description: 'Expert guidance from concept to completion', category: 'Services', icon: '📋' },
        { title: 'Contractor Matching', url: 'services.html#matching', description: 'Connect with qualified contractors', category: 'Services', icon: '🤝' },
        { title: 'Project Management', url: 'services.html#management', description: 'End-to-end construction oversight', category: 'Services', icon: '📊' },
        { title: 'Quality Assurance', url: 'services.html#quality', description: 'On-site supervision and quality control', category: 'Services', icon: '✓' },
        { title: 'Residential Projects', url: 'projects.html#residential', description: 'Homes and residential developments', category: 'Projects', icon: '🏘️' },
        { title: 'Commercial Projects', url: 'projects.html#commercial', description: 'Office buildings and retail spaces', category: 'Projects', icon: '🏗️' },
        { title: 'Renovations', url: 'projects.html#renovation', description: 'Transform existing spaces', category: 'Projects', icon: '🔨' },
        { title: 'WhatsApp', url: 'https://wa.me/27661200064', description: 'Chat with us on WhatsApp', category: 'Contact', icon: '💬', external: true },
        { title: 'Email Us', url: 'mailto:info@buildbridge.co.za', description: 'Send us an email inquiry', category: 'Contact', icon: '✉️', external: true },
        { title: 'Get a Quote', url: 'contact.html#quote', description: 'Request a free project quote', category: 'Contact', icon: '📄' }
      ];

      this.init();
    }

    init() {
      this.createSearchButton();
      this.createSearchOverlay();
      this.bindEvents();
      
      console.log('🔍 BuildBridge v32.0: Smart Predictive Search initialized');
    }

    createSearchButton() {
      const nav = document.querySelector('.nav-links');
      if (!nav) return;

      const searchBtn = document.createElement('button');
      searchBtn.className = 'search-trigger-btn';
      searchBtn.innerHTML = '🔍<kbd>Ctrl+K</kbd>';
      searchBtn.setAttribute('aria-label', 'Open search');
      searchBtn.setAttribute('title', 'Search (Ctrl+K)');
      
      // Insert before the WhatsApp button (last child)
      const quoteBtn = document.querySelector('.quote-btn');
      if (quoteBtn) {
        quoteBtn.parentNode.insertBefore(searchBtn, quoteBtn);
      } else {
        nav.appendChild(searchBtn);
      }

      searchBtn.addEventListener('click', () => this.open());
    }

    createSearchOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'smart-search-overlay';
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-label', 'Search');
      this.overlay.setAttribute('aria-modal', 'true');
      
      this.overlay.innerHTML = `
        <button class="search-close-btn" aria-label="Close search">×</button>
        <div class="smart-search-container">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search pages, services, projects..." autocomplete="off" spellcheck="false">
            <span class="search-shortcut">ESC to close</span>
          </div>
          <div class="search-results-container"></div>
        </div>
        <div class="search-tips">
          <div class="search-tip"><kbd>↑↓</kbd> to navigate</div>
          <div class="search-tip"><kbd>↵</kbd> to select</div>
          <div class="search-tip"><kbd>esc</kbd> to close</div>
        </div>
      `;

      document.body.appendChild(this.overlay);

      this.input = this.overlay.querySelector('input');
      this.resultsContainer = this.overlay.querySelector('.search-results-container');
      this.closeBtn = this.overlay.querySelector('.search-close-btn');
    }

    bindEvents() {
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to open
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.toggle();
        }

        // Escape to close
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }

        // Navigation when open
        if (this.isOpen) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateDown();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateUp();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.selectCurrent();
          }
        }
      });

      // Input events
      this.input.addEventListener('input', (e) => this.handleInput(e.target.value));
      
      // Close button
      this.closeBtn.addEventListener('click', () => this.close());
      
      // Click outside to close
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // Backdrop click prevention
      this.overlay.querySelector('.smart-search-container').addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    open() {
      this.isOpen = true;
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus input after animation
      setTimeout(() => {
        this.input.focus();
        this.showDefaultResults();
      }, 100);
    }

    close() {
      this.isOpen = false;
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.input.value = '';
      this.selectedIndex = -1;
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    handleInput(query) {
      this.selectedIndex = -1;
      
      if (!query.trim()) {
        this.showDefaultResults();
        return;
      }

      const results = this.search(query);
      this.renderResults(results, query);
    }

    search(query) {
      const lowerQuery = query.toLowerCase();
      const matches = [];

      // Search through index
      this.searchIndex.forEach(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const descMatch = item.description.toLowerCase().includes(lowerQuery);
        const categoryMatch = item.category.toLowerCase().includes(lowerQuery);

        if (titleMatch || descMatch || categoryMatch) {
          matches.push({
            ...item,
            score: this.calculateScore(item, lowerQuery, titleMatch, descMatch)
          });
        }
      });

      // Sort by score
      matches.sort((a, b) => b.score - a.score);

      return matches;
    }

    calculateScore(item, query, titleMatch, descMatch) {
      let score = 0;
      
      if (titleMatch) {
        if (item.title.toLowerCase().startsWith(query)) score += 10;
        else score += 5;
      }
      
      if (descMatch) score += 2;
      
      // Boost recent searches
      if (this.recentSearches.includes(item.title)) score += 3;

      return score;
    }

    showDefaultResults() {
      const sections = [];

      // Recent searches
      if (this.recentSearches.length > 0) {
        sections.push({
          title: 'Recent Searches',
          type: 'tags',
          items: this.recentSearches
        });
      }

      // Quick actions
      sections.push({
        title: 'Quick Actions',
        type: 'actions',
        items: [
          { icon: '💬', label: 'WhatsApp', url: 'https://wa.me/27661200064', external: true },
          { icon: '📄', label: 'Get Quote', url: 'contact.html#quote' },
          { icon: '📞', label: 'Call Us', url: 'tel:+27661200064' },
          { icon: '✉️', label: 'Email', url: 'mailto:info@buildbridge.co.za' }
        ]
      });

      // Suggested searches
      sections.push({
        title: 'Suggested',
        type: 'results',
        items: this.searchIndex.slice(0, 5)
      });

      this.renderSections(sections);
    }

    renderResults(results, query) {
      if (results.length === 0) {
        this.renderNoResults(query);
        return;
      }

      // Group by category
      const grouped = results.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});

      const sections = Object.entries(grouped).map(([category, items]) => ({
        title: category,
        type: 'results',
        items: items.slice(0, 5) // Limit to 5 per category
      }));

      this.renderSections(sections, query);
    }

    renderNoResults(query) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <div class="search-no-results-icon">🔍</div>
          <h3>No results for "${this.escapeHtml(query)}"</h3>
          <p>Try different keywords or check your spelling</p>
        </div>
      `;
      this.resultsContainer.classList.add('active');
    }

    renderSections(sections, highlightQuery = '') {
      let html = '';

      sections.forEach(section => {
        html += `<div class="search-section">`;
        html += `<div class="search-section-header">${section.title}</div>`;

        switch (section.type) {
          case 'tags':
            html += `<div class="search-tags-container">`;
            section.items.forEach(tag => {
              html += `<span class="search-tag" data-value="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}<span class="remove">×</span></span>`;
            });
            html += `</div>`;
            break;

          case 'actions':
            html += `<div class="search-quick-actions">`;
            section.items.forEach((action, i) => {
              html += `<a href="${action.url}" ${action.external ? 'target="_blank"' : ''} class="quick-action-btn" data-index="${i}">
                <span class="icon">${action.icon}</span>
                <span>${action.label}</span>
              </a>`;
            });
            html += `</div>`;
            break;

          case 'results':
            section.items.forEach((item, i) => {
              const title = highlightQuery 
                ? this.highlightMatch(item.title, highlightQuery)
                : item.title;
              const desc = highlightQuery
                ? this.highlightMatch(item.description, highlightQuery)
                : item.description;

              html += `<a href="${item.url}" ${item.external ? 'target="_blank"' : ''} class="search-result-item" data-index="${i}">
                <div class="result-icon">${item.icon}</div>
                <div class="result-content">
                  <div class="result-title">${title}</div>
                  <div class="result-description">${desc}</div>
                </div>
                <span class="result-shortcut">↵</span>
              </a>`;
            });
            break;
        }

        html += `</div>`;
      });

      this.resultsContainer.innerHTML = html;
      this.resultsContainer.classList.add('active');

      // Add click handlers
      this.resultsContainer.querySelectorAll('.search-result-item, .quick-action-btn').forEach(item => {
        item.addEventListener('click', () => {
          const title = item.querySelector('.result-title')?.textContent;
          if (title) this.addToRecentSearches(title);
          this.close();
        });
      });

      // Tag click handlers
      this.resultsContainer.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          this.input.value = tag.dataset.value;
          this.handleInput(tag.dataset.value);
        });
      });
    }

    highlightMatch(text, query) {
      const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
      return text.replace(regex, '<span class="result-match">$1</span>');
    }

    navigateDown() {
      const items = this.getSelectableItems();
      if (items.length === 0) return;
      
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
      this.updateSelection(items);
    }

    navigateUp() {
      const items = this.getSelectableItems();
      if (items.length === 0) return;
      
      this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
      this.updateSelection(items);
    }

    getSelectableItems() {
      return this.resultsContainer.querySelectorAll('.search-result-item, .quick-action-btn');
    }

    updateSelection(items) {
      items.forEach((item, index) => {
        item.classList.toggle('selected', index === this.selectedIndex);
        if (index === this.selectedIndex) {
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }

    selectCurrent() {
      const items = this.getSelectableItems();
      if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
        items[this.selectedIndex].click();
      }
    }

    addToRecentSearches(query) {
      // Remove if exists
      this.recentSearches = this.recentSearches.filter(s => s !== query);
      // Add to front
      this.recentSearches.unshift(query);
      // Keep only 5
      this.recentSearches = this.recentSearches.slice(0, 5);
      // Save
      this.saveRecentSearches();
    }

    loadRecentSearches() {
      try {
        return JSON.parse(localStorage.getItem('bb_recent_searches') || '[]');
      } catch {
        return [];
      }
    }

    saveRecentSearches() {
      try {
        localStorage.setItem('bb_recent_searches', JSON.stringify(this.recentSearches));
      } catch {}
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SmartPredictiveSearch());
  } else {
    new SmartPredictiveSearch();
  }

  // Expose to global scope
  window.SmartPredictiveSearch = SmartPredictiveSearch;
})();
