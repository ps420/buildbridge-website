/**
 * Smart Search Overlay - Fortune 500 Quality In-Page Search
 * Fast, keyboard-accessible search for quick content discovery
 */

(function() {
  'use strict';

  // Search configuration
  const CONFIG = {
    minQueryLength: 2,
    maxResults: 10,
    debounceDelay: 150,
    searchFields: ['textContent', 'innerText'],
    highlightClass: 'search-highlight'
  };

  // Search index - populated when page loads
  let searchIndex = [];
  let activeQuery = '';
  let selectedIndex = -1;
  let debounceTimer = null;

  // DOM Elements
  let overlay = null;
  let input = null;
  let resultsContainer = null;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    buildSearchIndex();
    createSearchOverlay();
    createSearchTrigger();
    bindKeyboardShortcuts();
    bindDocumentClick();
  }

  /**
   * Build search index from page content
   */
  function buildSearchIndex() {
    const sections = document.querySelectorAll('[data-section], section[id]');
    const searchableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .service-card, .project-card, .faq-item');
    
    searchIndex = [];

    // Index sections
    sections.forEach(section => {
      const id = section.id || section.dataset.section;
      const label = section.dataset.navLabel || getSectionTitle(section);
      const text = extractSearchableText(section);
      
      if (text && text.length > 10) {
        searchIndex.push({
          id,
          type: 'section',
          title: label,
          preview: truncate(text, 120),
          text: text.toLowerCase(),
          element: section,
          icon: getSectionIcon(section)
        });
      }
    });

    // Index specific elements
    searchableElements.forEach((el, index) => {
      const text = extractSearchableText(el);
      const title = getElementTitle(el);
      
      if (text && text.length > 20 && title) {
        const section = el.closest('[data-section], section[id]');
        
        searchIndex.push({
          id: `result-${index}`,
          type: 'element',
          title: title,
          preview: truncate(text, 120),
          text: text.toLowerCase(),
          element: el,
          section: section?.dataset.navLabel || section?.id || '',
          icon: getElementIcon(el),
          parentId: section?.id
        });
      }
    });

    console.log(`[Search] Indexed ${searchIndex.length} items`);
  }

  /**
   * Create the search overlay DOM
   */
  function createSearchOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Site search');
    overlay.setAttribute('aria-modal', 'true');
    
    overlay.innerHTML = `
      <button class="search-close" aria-label="Close search" title="Close (Esc)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="search-overlay-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search for services, projects, or information..." 
            aria-label="Search"
            autocomplete="off"
            spellcheck="false"
          >
          <div class="search-shortcut">
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        </div>
        
        <div class="search-results" role="listbox" aria-label="Search results"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Cache references
    input = overlay.querySelector('.search-input');
    resultsContainer = overlay.querySelector('.search-results');

    // Bind events
    overlay.querySelector('.search-close').addEventListener('click', closeSearch);
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeydown);
  }

  /**
   * Create floating search trigger button
   */
  function createSearchTrigger() {
    const trigger = document.createElement('button');
    trigger.className = 'search-trigger';
    trigger.setAttribute('aria-label', 'Open search');
    trigger.setAttribute('title', 'Search (⌘K)');
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span class="search-trigger-tooltip">Search <kbd>⌘</kbd><kbd>K</kbd></span>
    `;

    trigger.addEventListener('click', openSearch);
    document.body.appendChild(trigger);
  }

  /**
   * Bind keyboard shortcuts
   */
  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }

      // Esc to close
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeSearch();
      }
    });
  }

  /**
   * Bind document click for result navigation
   */
  function bindDocumentClick() {
    resultsContainer.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.search-result-item');
      if (resultItem) {
        const index = parseInt(resultItem.dataset.index);
        selectResult(index);
      }
    });
  }

  /**
   * Open search overlay
   */
  function openSearch() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus input after animation
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);

    // Announce to screen readers
    announceToScreenReader('Search dialog opened');
  }

  /**
   * Close search overlay
   */
  function closeSearch() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    input.value = '';
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('has-results');
    activeQuery = '';
    selectedIndex = -1;
  }

  /**
   * Handle search input
   */
  function handleInput(e) {
    const query = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < CONFIG.minQueryLength) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('has-results');
      activeQuery = '';
      selectedIndex = -1;
      return;
    }

    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, CONFIG.debounceDelay);
  }

  /**
   * Perform the search
   */
  function performSearch(query) {
    activeQuery = query.toLowerCase();
    const results = [];

    searchIndex.forEach((item, index) => {
      const score = calculateRelevanceScore(item, activeQuery);
      if (score > 0) {
        results.push({ ...item, score, index });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = results.slice(0, CONFIG.maxResults);

    renderResults(limitedResults, activeQuery);
  }

  /**
   * Calculate relevance score for search result
   */
  function calculateRelevanceScore(item, query) {
    let score = 0;
    const queryWords = query.split(/\s+/);
    
    // Title exact match (highest priority)
    if (item.title.toLowerCase().includes(query)) {
      score += 100;
    }
    
    // Title word match
    queryWords.forEach(word => {
      if (item.title.toLowerCase().includes(word)) {
        score += 50;
      }
    });

    // Content match
    if (item.text.includes(query)) {
      score += 30;
    }

    // Word match in content
    queryWords.forEach(word => {
      const matches = (item.text.match(new RegExp(word, 'g')) || []).length;
      score += matches * 10;
    });

    // Boost sections over elements
    if (item.type === 'section') {
      score *= 1.2;
    }

    return score;
  }

  /**
   * Render search results
   */
  function renderResults(results, query) {
    selectedIndex = -1;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>No results found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      `;
      resultsContainer.classList.add('has-results');
      return;
    }

    const resultsHTML = results.map((result, idx) => {
      const highlightedPreview = highlightMatches(result.preview, query);
      
      return `
        <a href="#${result.id}" 
           class="search-result-item" 
           data-index="${idx}"
           role="option"
           data-parent="${result.parentId || result.id}">
          <div class="search-result-icon">${result.icon}</div>
          <div class="search-result-content">
            <div class="search-result-title">${escapeHtml(result.title)}</div>
            <div class="search-result-preview">${highlightedPreview}</div>
          </div>
          ${result.section ? `<span class="search-result-section">${escapeHtml(result.section)}</span>` : ''}
        </a>
      `;
    }).join('');

    resultsContainer.innerHTML = `
      <div class="search-results-header">
        <span>${results.length} result${results.length !== 1 ? 's' : ''}</span>
        <span class="search-results-count">Use ↑↓ to navigate, ↵ to select</span>
      </div>
      ${resultsHTML}
    `;

    resultsContainer.classList.add('has-results');

    // Store current results for keyboard navigation
    resultsContainer.dataset.resultCount = results.length;
    window._currentSearchResults = results;
  }

  /**
   * Handle keyboard navigation in search
   */
  function handleKeydown(e) {
    const resultCount = parseInt(resultsContainer.dataset.resultCount) || 0;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % resultCount;
        updateSelection();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex <= 0 ? resultCount - 1 : selectedIndex - 1;
        updateSelection();
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectResult(selectedIndex);
        } else if (resultCount > 0) {
          selectResult(0);
        }
        break;
    }
  }

  /**
   * Update visual selection
   */
  function updateSelection() {
    const items = resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex);
      item.setAttribute('aria-selected', idx === selectedIndex ? 'true' : 'false');
    });

    // Scroll selected into view
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /**
   * Select a search result and navigate to it
   */
  function selectResult(index) {
    const results = window._currentSearchResults;
    if (!results || !results[index]) return;

    const result = results[index];
    closeSearch();

    // Navigate to element
    const targetId = result.parentId || result.id;
    const target = document.getElementById(targetId);
    
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight target briefly
      target.style.transition = 'box-shadow 0.3s ease';
      target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.5)';
      
      setTimeout(() => {
        target.style.boxShadow = '';
      }, 2000);
    }
  }

  /**
   * Helper: Extract searchable text from element
   */
  function extractSearchableText(element) {
    const clone = element.cloneNode(true);
    // Remove script and style elements
    clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return clone.textContent.trim().replace(/\s+/g, ' ');
  }

  /**
   * Helper: Get section title
   */
  function getSectionTitle(section) {
    const heading = section.querySelector('h1, h2, h3');
    return heading ? heading.textContent.trim() : section.dataset.section || 'Section';
  }

  /**
   * Helper: Get element title
   */
  function getElementTitle(element) {
    const heading = element.querySelector('h3, h4, h2');
    return heading ? heading.textContent.trim() : null;
  }

  /**
   * Helper: Get section icon based on content
   */
  function getSectionIcon(section) {
    const id = section.id || '';
    if (id.includes('service')) return '🔧';
    if (id.includes('project')) return '🏗️';
    if (id.includes('about')) return '🏢';
    if (id.includes('contact')) return '📞';
    if (id.includes('faq')) return '❓';
    if (id.includes('testimonial')) return '💬';
    if (id.includes('process')) return '📋';
    return '📄';
  }

  /**
   * Helper: Get element icon
   */
  function getElementIcon(element) {
    if (element.classList.contains('service-card')) return '🔧';
    if (element.classList.contains('project-card')) return '🏗️';
    if (element.classList.contains('faq-item')) return '❓';
    return '📄';
  }

  /**
   * Helper: Truncate text
   */
  function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Helper: Highlight search matches
   */
  function highlightMatches(text, query) {
    const words = query.split(/\s+/).filter(w => w.length > 0);
    let highlighted = escapeHtml(text);
    
    words.forEach(word => {
      const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  }

  /**
   * Helper: Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Helper: Escape regex special characters
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Helper: Announce to screen readers
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Expose API for external use
  window.BuildBridgeSearch = {
    open: openSearch,
    close: closeSearch,
    reindex: buildSearchIndex
  };

})();
