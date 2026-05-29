/**
 * Smart FAQ Accordion v80.4
 * Fortune 500 Expandable FAQ System
 */

(function() {
  'use strict';
  
  const SmartFAQ = {
    options: {
      allowMultiple: false,
      searchMinLength: 2,
      defaultCategory: 'all'
    },
    
    faqs: [],
    
    init(selector = '.faq-section', options = {}) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(el => {
        this.createFAQ(el, { ...this.options, ...options });
      });
    },
    
    createFAQ(element, options) {
      const accordion = element.querySelector('.faq-accordion');
      if (!accordion) return;
      
      const faq = {
        element: element,
        accordion: accordion,
        items: Array.from(accordion.querySelectorAll('.faq-item')),
        categories: element.querySelector('.faq-categories'),
        searchInput: element.querySelector('.faq-search'),
        options: options
      };
      
      // Bind accordion events
      this.bindAccordionEvents(faq);
      
      // Bind search
      if (faq.searchInput) {
        this.bindSearch(faq);
      }
      
      // Bind categories
      if (faq.categories) {
        this.bindCategories(faq);
      }
      
      // Bind controls
      const expandAll = element.querySelector('.faq-expand-all');
      const collapseAll = element.querySelector('.faq-collapse-all');
      
      if (expandAll) {
        expandAll.addEventListener('click', () => this.expandAll(faq));
      }
      if (collapseAll) {
        collapseAll.addEventListener('click', () => this.collapseAll(faq));
      }
      
      this.faqs.push(faq);
      
      // Update counter
      this.updateCounter(faq);
    },
    
    bindAccordionEvents(faq) {
      faq.items.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', () => this.toggleItem(faq, item));
        
        // Keyboard navigation
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleItem(faq, item);
          }
        });
      });
    },
    
    toggleItem(faq, item) {
      const isActive = item.classList.contains('active');
      
      // Close others if not allowing multiple
      if (!faq.options.allowMultiple && !isActive) {
        this.collapseAll(faq);
      }
      
      // Toggle current
      if (isActive) {
        this.collapseItem(item);
      } else {
        this.expandItem(item);
      }
    },
    
    expandItem(item) {
      item.classList.add('active');
      
      const answer = item.querySelector('.faq-answer');
      const inner = item.querySelector('.faq-answer-inner');
      
      if (answer && inner) {
        answer.style.maxHeight = inner.offsetHeight + 'px';
      }
    },
    
    collapseItem(item) {
      item.classList.remove('active');
      
      const answer = item.querySelector('.faq-answer');
      if (answer) {
        answer.style.maxHeight = '0';
      }
    },
    
    expandAll(faq) {
      faq.items.forEach(item => {
        if (!item.classList.contains('hidden')) {
          this.expandItem(item);
        }
      });
    },
    
    collapseAll(faq) {
      faq.items.forEach(item => {
        this.collapseItem(item);
      });
    },
    
    bindSearch(faq) {
      const { searchInput } = faq;
      const clearBtn = faq.element.querySelector('.faq-search-clear');
      
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        
        // Toggle clear button
        searchInput.parentElement.classList.toggle('has-value', query.length > 0);
        
        this.performSearch(faq, query);
      });
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          searchInput.parentElement.classList.remove('has-value');
          this.performSearch(faq, '');
          searchInput.focus();
        });
      }
    },
    
    performSearch(faq, query) {
      const noResults = faq.element.querySelector('.faq-no-results');
      let visibleCount = 0;
      
      faq.items.forEach(item => {
        const question = item.querySelector('.faq-question-text')?.textContent.toLowerCase() || '';
        const answer = item.querySelector('.faq-answer-inner')?.textContent.toLowerCase() || '';
        
        // Check if matches
        const matches = query.length < faq.options.searchMinLength || 
                       question.includes(query) || 
                       answer.includes(query);
        
        if (matches) {
          item.classList.remove('hidden');
          visibleCount++;
          
          // Highlight matches
          if (query.length >= faq.options.searchMinLength) {
            this.highlightMatches(item, query);
          } else {
            this.clearHighlights(item);
          }
        } else {
          item.classList.add('hidden');
          this.collapseItem(item);
        }
      });
      
      // Show/hide no results
      if (noResults) {
        noResults.classList.toggle('visible', visibleCount === 0 && query.length > 0);
      }
      
      this.updateCounter(faq, visibleCount);
    },
    
    highlightMatches(item, query) {
      const questionEl = item.querySelector('.faq-question-text');
      
      if (questionEl && !questionEl.dataset.original) {
        questionEl.dataset.original = questionEl.textContent;
      }
      
      if (questionEl) {
        const regex = new RegExp(`(${query})`, 'gi');
        questionEl.innerHTML = questionEl.dataset.original.replace(regex, '<mark class="faq-highlight">$1</mark>');
      }
    },
    
    clearHighlights(item) {
      const questionEl = item.querySelector('.faq-question-text');
      if (questionEl && questionEl.dataset.original) {
        questionEl.textContent = questionEl.dataset.original;
      }
    },
    
    bindCategories(faq) {
      const buttons = faq.categories.querySelectorAll('.faq-category');
      
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Update active state
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          // Filter items
          const category = btn.dataset.category;
          this.filterByCategory(faq, category);
        });
      });
    },
    
    filterByCategory(faq, category) {
      let visibleCount = 0;
      
      faq.items.forEach(item => {
        const itemCategory = item.dataset.category || 'general';
        
        if (category === 'all' || itemCategory === category) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
          this.collapseItem(item);
        }
      });
      
      this.updateCounter(faq, visibleCount);
    },
    
    updateCounter(faq, count) {
      const counter = faq.element.querySelector('.faq-counter');
      if (!counter) return;
      
      const visible = count !== undefined ? count : faq.items.filter(i => !i.classList.contains('hidden')).length;
      const total = faq.items.length;
      
      counter.textContent = `Showing ${visible} of ${total} FAQs`;
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartFAQ.init());
  } else {
    SmartFAQ.init();
  }
  
  window.BuildBridgeFAQ = SmartFAQ;
})();
