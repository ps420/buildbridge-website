/**
 * BuildBridge Smart Table of Contents
 * Auto-generated TOC with Scroll Spy - v79.1
 * Fortune 500 Navigation Enhancement
 */

(function() {
  'use strict';
  
  class SmartTOC {
    constructor(options = {}) {
      this.options = {
        contentSelector: 'main, [role="main"], article, .content',
        headingSelectors: 'h1[data-nav-label], h2[data-nav-label], h3[data-nav-label], section[data-nav-label]',
        offset: 100,
        duration: 800,
        mobileBreakpoint: 1200,
        ...options
      };
      
      this.headings = [];
      this.tocItems = [];
      this.currentActive = null;
      this.container = null;
      this.progressBar = null;
      this.isMobile = window.innerWidth < this.options.mobileBreakpoint;
      this.isMinimized = false;
      
      this.init();
    }
    
    init() {
      this.findHeadings();
      if (this.headings.length < 2) return; // Don't show TOC for single section
      
      this.createTOC();
      this.bindEvents();
      this.updateActiveItem();
      
      // Show after a delay for smooth entrance
      setTimeout(() => {
        if (this.container) {
          this.container.classList.add('visible');
        }
      }, 500);
      
      console.log('📑 Smart TOC initialized with', this.headings.length, 'sections');
    }
    
    findHeadings() {
      const content = document.querySelector(this.options.contentSelector) || document.body;
      const headings = content.querySelectorAll(this.options.headingSelectors);
      
      this.headings = Array.from(headings).map((heading, index) => {
        // Ensure ID exists
        if (!heading.id) {
          const label = heading.dataset.navLabel || heading.textContent.trim();
          heading.id = this.slugify(label) + '-' + index;
        }
        
        return {
          element: heading,
          id: heading.id,
          label: heading.dataset.navLabel || heading.querySelector('h1, h2, h3')?.textContent || heading.textContent.trim(),
          level: this.getLevel(heading),
          offsetTop: 0
        };
      });
      
      this.calculateOffsets();
    }
    
    getLevel(heading) {
      if (heading.tagName === 'H1' || heading.querySelector('h1')) return 1;
      if (heading.tagName === 'H2' || heading.querySelector('h2')) return 2;
      if (heading.tagName === 'H3' || heading.querySelector('h3')) return 3;
      return 1;
    }
    
    calculateOffsets() {
      this.headings.forEach(h => {
        h.offsetTop = h.element.offsetTop;
      });
    }
    
    createTOC() {
      // Check if mobile
      this.isMobile = window.innerWidth < this.options.mobileBreakpoint;
      
      if (this.isMobile) {
        this.createMobileTOC();
      } else {
        this.createDesktopTOC();
      }
    }
    
    createDesktopTOC() {
      this.container = document.createElement('nav');
      this.container.className = 'smart-toc-container';
      this.container.setAttribute('role', 'navigation');
      this.container.setAttribute('aria-label', 'Table of contents');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'smart-toc-wrapper';
      
      // Header
      const header = document.createElement('div');
      header.className = 'smart-toc-header';
      header.innerHTML = `
        <h3 class="smart-toc-title">On this page</h3>
        <button class="smart-toc-toggle" aria-label="Toggle TOC">◀</button>
      `;
      
      // Progress bar
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'smart-toc-progress-bar';
      
      const progress = document.createElement('div');
      progress.className = 'smart-toc-progress';
      progress.appendChild(this.progressBar);
      
      // List
      const list = document.createElement('ul');
      list.className = 'smart-toc-list';
      
      this.headings.forEach((heading, index) => {
        const item = document.createElement('li');
        item.className = `smart-toc-item level-${heading.level}`;
        
        const link = document.createElement('a');
        link.className = 'smart-toc-link';
        link.href = `#${heading.id}`;
        link.dataset.index = index;
        link.innerHTML = `<span>${this.escapeHtml(heading.label)}</span>`;
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToSection(heading.id);
        });
        
        item.appendChild(link);
        list.appendChild(item);
        
        this.tocItems.push({
          heading,
          item,
          link
        });
      });
      
      wrapper.appendChild(header);
      wrapper.appendChild(progress);
      wrapper.appendChild(list);
      this.container.appendChild(wrapper);
      document.body.appendChild(this.container);
      
      // Toggle functionality
      const toggle = header.querySelector('.smart-toc-toggle');
      toggle.addEventListener('click', () => this.toggleMinimize());
    }
    
    createMobileTOC() {
      // Trigger button
      const trigger = document.createElement('button');
      trigger.className = 'smart-toc-mobile-trigger';
      trigger.innerHTML = '📑';
      trigger.setAttribute('aria-label', 'Open table of contents');
      trigger.addEventListener('click', () => this.openMobileSheet());
      document.body.appendChild(trigger);
      
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'smart-toc-mobile-overlay';
      overlay.addEventListener('click', () => this.closeMobileSheet());
      document.body.appendChild(overlay);
      this.mobileOverlay = overlay;
      
      // Sheet
      const sheet = document.createElement('div');
      sheet.className = 'smart-toc-mobile-sheet';
      sheet.innerHTML = `
        <div class="smart-toc-mobile-handle"></div>
        <h3 class="smart-toc-mobile-title">On this page</h3>
        <ul class="smart-toc-mobile-list"></ul>
      `;
      
      const list = sheet.querySelector('.smart-toc-mobile-list');
      list.className = 'smart-toc-list';
      
      this.headings.forEach((heading, index) => {
        const item = document.createElement('li');
        item.className = `smart-toc-item level-${heading.level}`;
        
        const link = document.createElement('a');
        link.className = 'smart-toc-link';
        link.href = `#${heading.id}`;
        link.dataset.index = index;
        link.innerHTML = `<span>${this.escapeHtml(heading.label)}</span>`;
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeMobileSheet();
          setTimeout(() => this.scrollToSection(heading.id), 300);
        });
        
        item.appendChild(link);
        list.appendChild(item);
        
        this.tocItems.push({
          heading,
          item,
          link
        });
      });
      
      // Swipe to close
      let startY = 0;
      sheet.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      });
      
      sheet.addEventListener('touchmove', (e) => {
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) {
          sheet.style.transform = `translateY(${deltaY}px)`;
        }
      });
      
      sheet.addEventListener('touchend', (e) => {
        const deltaY = e.changedTouches[0].clientY - startY;
        if (deltaY > 100) {
          this.closeMobileSheet();
        } else {
          sheet.style.transform = '';
        }
      });
      
      document.body.appendChild(sheet);
      this.mobileSheet = sheet;
    }
    
    openMobileSheet() {
      this.mobileOverlay.classList.add('active');
      this.mobileSheet.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.updateActiveItem();
    }
    
    closeMobileSheet() {
      this.mobileOverlay.classList.remove('active');
      this.mobileSheet.classList.remove('active');
      document.body.style.overflow = '';
      this.mobileSheet.style.transform = '';
    }
    
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      this.container.classList.toggle('minimized', this.isMinimized);
    }
    
    scrollToSection(id) {
      const element = document.getElementById(id);
      if (!element) return;
      
      const offset = element.offsetTop - this.options.offset;
      
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
      
      // Update URL without jumping
      history.pushState(null, null, `#${id}`);
    }
    
    bindEvents() {
      // Scroll spy
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveItem();
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Recalculate on resize
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.calculateOffsets();
          const wasMobile = this.isMobile;
          this.isMobile = window.innerWidth < this.options.mobileBreakpoint;
          
          if (wasMobile !== this.isMobile) {
            // Recreate TOC for new viewport
            if (this.container) this.container.remove();
            if (this.mobileSheet) this.mobileSheet.remove();
            if (this.mobileOverlay) this.mobileOverlay.remove();
            const trigger = document.querySelector('.smart-toc-mobile-trigger');
            if (trigger) trigger.remove();
            
            this.tocItems = [];
            this.createTOC();
          }
        }, 250);
      });
      
      // Handle hash on load
      if (window.location.hash) {
        setTimeout(() => {
          const id = window.location.hash.slice(1);
          this.scrollToSection(id);
        }, 100);
      }
    }
    
    updateActiveItem() {
      const scrollPos = window.scrollY + this.options.offset + 50;
      
      let activeIndex = -1;
      for (let i = this.headings.length - 1; i >= 0; i--) {
        if (this.headings[i].offsetTop <= scrollPos) {
          activeIndex = i;
          break;
        }
      }
      
      if (activeIndex === -1) activeIndex = 0;
      
      if (this.currentActive !== activeIndex) {
        // Remove old active
        this.tocItems.forEach((item, i) => {
          item.link.classList.toggle('active', i === activeIndex);
        });
        
        this.currentActive = activeIndex;
        
        // Scroll TOC to keep active item visible
        const activeItem = this.tocItems[activeIndex];
        if (activeItem && !this.isMobile) {
          activeItem.item.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }
    
    updateProgress() {
      if (!this.progressBar) return;
      
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      this.progressBar.style.height = `${Math.min(progress, 100)}%`;
    }
    
    slugify(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SmartTOC());
  } else {
    new SmartTOC();
  }
  
})();
