/**
 * v90.0: Advanced Sticky Table of Contents
 * Auto-generated TOC with scroll spy
 */

(function() {
  'use strict';

  class StickyTOCAdvanced {
    constructor(options = {}) {
      this.options = {
        contentSelector: 'main, article, [data-toc-content]',
        headingSelector: 'h1, h2, h3',
        tocContainer: '[data-sticky-toc]',
        offset: 120,
        highlightActive: true,
        ...options
      };
      
      this.headings = [];
      this.tocItems = [];
      this.currentActiveId = null;
      this.observer = null;
      
      this.init();
    }

    init() {
      this.findHeadings();
      if (this.headings.length === 0) return;
      
      this.generateTOC();
      this.setupScrollSpy();
      this.bindEvents();
    }

    findHeadings() {
      const content = document.querySelector(this.options.contentSelector);
      if (!content) {
        // Try to find headings anywhere in the document
        this.headings = Array.from(document.querySelectorAll(this.options.headingSelector))
          .filter(h => h.closest('nav') === null) // Exclude nav headings
          .filter(h => h.id || this.generateId(h)); // Ensure all headings have IDs
      } else {
        this.headings = Array.from(content.querySelectorAll(this.options.headingSelector))
          .filter(h => h.id || this.generateId(h));
      }
    }

    generateId(heading) {
      const text = heading.textContent.trim();
      const id = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      // Make unique
      const baseId = id || 'section';
      let uniqueId = baseId;
      let counter = 1;
      while (document.getElementById(uniqueId)) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
      }
      
      heading.id = uniqueId;
      return uniqueId;
    }

    generateTOC() {
      // Check for existing TOC container
      let toc = document.querySelector(this.options.tocContainer);
      
      // If no container, create one in a sidebar or floating position
      if (!toc) {
        toc = this.createTOCContainer();
      }
      
      this.renderTOC(toc);
    }

    createTOCContainer() {
      const toc = document.createElement('aside');
      toc.className = 'sticky-toc sticky-toc-floating';
      toc.setAttribute('data-sticky-toc', '');
      
      document.body.appendChild(toc);
      return toc;
    }

    renderTOC(container) {
      // Add header
      const header = document.createElement('div');
      header.className = 'sticky-toc-header';
      header.innerHTML = `
        <h3 class="sticky-toc-title">Contents</h3>
        <button class="sticky-toc-toggle" aria-label="Toggle TOC">▼</button>
      `;
      
      // Add reading time
      const readingTime = this.calculateReadingTime();
      
      container.innerHTML = '';
      container.appendChild(header);
      
      // Add search
      const searchContainer = document.createElement('div');
      searchContainer.className = 'toc-search-container';
      searchContainer.innerHTML = `
        <span class="toc-search-icon">🔍</span>
        <input type="text" class="toc-search-input" placeholder="Find section...">
      `;
      container.appendChild(searchContainer);
      
      // Build TOC tree
      const nav = document.createElement('nav');
      nav.className = 'sticky-toc-nav';
      
      const list = document.createElement('ul');
      list.className = 'sticky-toc-list';
      
      // Add progress bar
      const progress = document.createElement('div');
      progress.className = 'sticky-toc-progress';
      progress.innerHTML = '<div class="sticky-toc-progress-bar"></div>';
      nav.appendChild(progress);
      
      let currentLevel = 1;
      let currentList = list;
      const stack = [list];
      
      this.headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const item = this.createTOCItem(heading, index);
        
        if (level > currentLevel) {
          // Create nested list
          const sublist = document.createElement('ul');
          sublist.className = 'sticky-toc-sublist';
          const lastItem = currentList.lastElementChild;
          if (lastItem) {
            lastItem.appendChild(sublist);
            stack.push(sublist);
            currentList = sublist;
          }
        } else if (level < currentLevel) {
          // Go back up
          const diff = currentLevel - level;
          for (let i = 0; i < diff && stack.length > 1; i++) {
            stack.pop();
          }
          currentList = stack[stack.length - 1];
        }
        
        currentList.appendChild(item);
        this.tocItems.push({
          element: item,
          target: heading
        });
        
        currentLevel = level;
      });
      
      nav.appendChild(list);
      container.appendChild(nav);
      
      // Add reading time
      const readingTimeEl = document.createElement('div');
      readingTimeEl.className = 'toc-reading-time';
      readingTimeEl.innerHTML = `
        <span class="toc-reading-time-icon">📖</span>
        <span>${readingTime} min read</span>
      `;
      container.appendChild(readingTimeEl);
      
      this.container = container;
      this.progressBar = progress.querySelector('.sticky-toc-progress-bar');
      
      // Setup toggle
      const toggle = header.querySelector('.sticky-toc-toggle');
      toggle.addEventListener('click', () => {
        container.classList.toggle('collapsed');
      });
      
      // Setup search
      const searchInput = container.querySelector('.toc-search-input');
      searchInput.addEventListener('input', (e) => this.filterTOC(e.target.value));
    }

    createTOCItem(heading, index) {
      const item = document.createElement('li');
      item.className = 'sticky-toc-item';
      item.dataset.index = index;
      item.dataset.target = heading.id;
      
      const link = document.createElement('a');
      link.className = 'sticky-toc-link';
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToHeading(heading);
      });
      
      item.appendChild(link);
      return item;
    }

    calculateReadingTime() {
      const content = document.querySelector(this.options.contentSelector);
      if (!content) return 3;
      
      const words = content.textContent.trim().split(/\s+/).length;
      return Math.ceil(words / 200); // Avg reading speed
    }

    setupScrollSpy() {
      const options = {
        rootMargin: `-${this.options.offset}px 0px -70% 0px`,
        threshold: 0
      };
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActiveHeading(entry.target.id);
          }
        });
      }, options);
      
      this.headings.forEach(heading => {
        this.observer.observe(heading);
      });
    }

    setActiveHeading(id) {
      if (this.currentActiveId === id) return;
      this.currentActiveId = id;
      
      this.tocItems.forEach(({ element }) => {
        element.classList.toggle('active', element.dataset.target === id);
      });
      
      // Update progress bar
      this.updateProgressBar();
    }

    updateProgressBar() {
      if (!this.currentActiveId || !this.progressBar) return;
      
      const index = this.headings.findIndex(h => h.id === this.currentActiveId);
      const progress = ((index + 1) / this.headings.length) * 100;
      this.progressBar.style.height = `${progress}%`;
    }

    scrollToHeading(heading) {
      const offset = heading.offsetTop - this.options.offset;
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }

    filterTOC(query) {
      const lowerQuery = query.toLowerCase();
      
      this.tocItems.forEach(({ element }) => {
        const text = element.textContent.toLowerCase();
        const match = text.includes(lowerQuery);
        element.style.display = match ? 'block' : 'none';
      });
    }

    bindEvents() {
      // Update on resize
      window.addEventListener('resize', this.debounce(() => {
        this.findHeadings();
        this.generateTOC();
      }, 250));
    }

    debounce(fn, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    destroy() {
      this.observer?.disconnect();
      this.container?.remove();
    }
  }

  // Bottom bar TOC variant
  class BottomBarTOC {
    constructor() {
      this.headings = [];
      this.init();
    }

    init() {
      this.headings = Array.from(document.querySelectorAll('section[id]'));
      if (this.headings.length === 0) return;
      
      this.createBottomBar();
      this.setupScrollSpy();
    }

    createBottomBar() {
      const bar = document.createElement('div');
      bar.className = 'toc-bottom-bar';
      bar.innerHTML = `
        <div class="toc-bottom-progress"></div>
        <span class="toc-bottom-title">Navigate</span>
        <nav class="toc-bottom-nav"></nav>
      `;
      
      const nav = bar.querySelector('.toc-bottom-nav');
      
      this.headings.forEach(heading => {
        const link = document.createElement('a');
        link.className = 'toc-bottom-link';
        link.href = `#${heading.id}`;
        link.textContent = heading.dataset.navLabel || heading.id;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth' });
        });
        nav.appendChild(link);
      });
      
      document.body.appendChild(bar);
      this.bar = bar;
      this.progress = bar.querySelector('.toc-bottom-progress');
      this.links = bar.querySelectorAll('.toc-bottom-link');
    }

    setupScrollSpy() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActive(entry.target.id);
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px'
      });
      
      this.headings.forEach(heading => observer.observe(heading));
      
      // Progress bar
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
        this.progress.style.width = `${scrolled * 100}%`;
      }, { passive: true });
    }

    setActive(id) {
      this.links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.stickyTOC = new StickyTOCAdvanced();
      window.bottomTOC = new BottomBarTOC();
    });
  } else {
    window.stickyTOC = new StickyTOCAdvanced();
    window.bottomTOC = new BottomBarTOC();
  }
})();
