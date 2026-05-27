/**
 * Dynamic Table of Contents
 * Fortune 500 Grade Navigation Enhancement
 * Auto-generates TOC from page headings with smooth scroll and progress tracking
 */

class DynamicTOC {
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      selector: options.selector || 'h1, h2, h3, h4',
      minHeadings: options.minHeadings || 3,
      offset: options.offset || 100,
      showProgress: options.showProgress !== false,
      collapsible: options.collapsible !== false,
      ...options
    };
    
    this.state = {
      headings: [],
      activeIndex: -1,
      isCollapsed: false,
      scrollProgress: 0
    };
    
    this.elements = {};
    
    this.init();
  }
  
  init() {
    this.scanHeadings();
    
    if (this.state.headings.length < this.options.minHeadings) {
      console.log('📑 Not enough headings for TOC');
      return;
    }
    
    this.createElements();
    this.bindEvents();
    this.update();
    
    console.log(`📑 Dynamic TOC created with ${this.state.headings.length} items`);
  }
  
  scanHeadings() {
    const headings = this.options.container.querySelectorAll(this.options.selector);
    
    this.state.headings = Array.from(headings)
      .filter(heading => {
        // Filter out empty headings and navigation elements
        const text = heading.textContent.trim();
        const isNav = heading.closest('nav, header, .nav, .header');
        return text.length > 0 && !isNav;
      })
      .map((heading, index) => {
        // Ensure heading has an ID
        if (!heading.id) {
          heading.id = this.generateId(heading.textContent, index);
        }
        
        return {
          id: heading.id,
          text: this.cleanText(heading.textContent),
          level: parseInt(heading.tagName.charAt(1)),
          element: heading,
          number: this.generateNumber(index, heading)
        };
      });
  }
  
  generateId(text, index) {
    // Create URL-friendly ID from text
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return baseId || `section-${index}`;
  }
  
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
  }
  
  generateNumber(index, heading) {
    // Generate hierarchical numbering (1, 1.1, 1.1.1, etc.)
    const level = parseInt(heading.tagName.charAt(1));
    const numbers = [];
    
    let count = 0;
    for (let i = 0; i <= index; i++) {
      const h = this.state.headings[i] || { level };
      if (h.level === level) count++;
    }
    
    return numbers.join('.');
  }
  
  createElements() {
    // Main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'toc-wrapper';
    wrapper.setAttribute('role', 'navigation');
    wrapper.setAttribute('aria-label', 'Table of Contents');
    
    // Container
    const container = document.createElement('div');
    container.className = 'toc-container';
    
    // Header
    const header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML = `
      <span class="toc-title">
        <span>📑</span>
        Contents
      </span>
      ${this.options.collapsible ? `
        <button class="toc-toggle" aria-label="Collapse table of contents" title="Collapse">
          ‹
        </button>
      ` : ''}
    `;
    
    // Progress
    let progress = '';
    if (this.options.showProgress) {
      progress = `
        <div class="toc-progress">
          <div class="toc-progress-bar">
            <div class="toc-progress-fill" style="width: 0%"></div>
          </div>
          <div class="toc-progress-text">0% complete</div>
        </div>
      `;
    }
    
    // List
    const list = document.createElement('ul');
    list.className = 'toc-list';
    
    this.state.headings.forEach((heading, index) => {
      const item = document.createElement('li');
      item.className = 'toc-item';
      
      const link = document.createElement('a');
      link.className = 'toc-link';
      link.href = `#${heading.id}`;
      link.setAttribute('data-level', `H${heading.level}`);
      link.setAttribute('data-index', index);
      link.innerHTML = `
        <span class="toc-number">${index + 1}</span>
        <span class="toc-text">${heading.text}</span>
      `;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToHeading(index);
      });
      
      item.appendChild(link);
      list.appendChild(item);
    });
    
    // Assemble
    container.innerHTML = progress;
    container.appendChild(header);
    container.appendChild(list);
    wrapper.appendChild(container);
    
    document.body.appendChild(wrapper);
    
    // Store references
    this.elements = {
      wrapper,
      container,
      header,
      list,
      links: list.querySelectorAll('.toc-link'),
      progressFill: container.querySelector('.toc-progress-fill'),
      progressText: container.querySelector('.toc-progress-text'),
      toggle: container.querySelector('.toc-toggle')
    };
    
    // Create mini indicator
    this.createMiniIndicator();
    
    // Show after delay
    setTimeout(() => {
      wrapper.classList.add('visible');
    }, 1000);
  }
  
  createMiniIndicator() {
    const mini = document.createElement('div');
    mini.className = 'toc-mini';
    mini.innerHTML = `
      <button class="toc-mini-button" aria-label="Show table of contents">
        <span>📑</span>
        <div class="toc-mini-progress" style="--progress: 0%"></div>
      </button>
    `;
    
    mini.querySelector('.toc-mini-button').addEventListener('click', () => {
      this.toggleTOC();
    });
    
    document.body.appendChild(mini);
    this.elements.mini = mini;
    this.elements.miniProgress = mini.querySelector('.toc-mini-progress');
  }
  
  bindEvents() {
    // Scroll tracking
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Toggle button
    if (this.elements.toggle) {
      this.elements.toggle.addEventListener('click', () => {
        this.toggleCollapse();
      });
    }
    
    // Click outside to close (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        const isClickInside = this.elements.wrapper.contains(e.target) ||
                             this.elements.mini?.contains(e.target);
        if (!isClickInside && !this.state.isCollapsed) {
          this.collapse();
        }
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.state.isCollapsed) {
        this.collapse();
      }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const targetIndex = this.state.headings.findIndex(h => h.id === targetId);
        if (targetIndex !== -1) {
          e.preventDefault();
          this.scrollToHeading(targetIndex);
        }
      });
    });
  }
  
  toggleTOC() {
    if (this.state.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }
  
  toggleCollapse() {
    this.state.isCollapsed = !this.state.isCollapsed;
    
    if (this.state.isCollapsed) {
      this.elements.wrapper.classList.add('collapsed');
      this.elements.mini?.classList.add('visible');
      if (this.elements.toggle) {
        this.elements.toggle.innerHTML = '›';
        this.elements.toggle.setAttribute('aria-label', 'Expand table of contents');
      }
    } else {
      this.elements.wrapper.classList.remove('collapsed');
      this.elements.mini?.classList.remove('visible');
      if (this.elements.toggle) {
        this.elements.toggle.innerHTML = '‹';
        this.elements.toggle.setAttribute('aria-label', 'Collapse table of contents');
      }
    }
  }
  
  collapse() {
    if (!this.state.isCollapsed) {
      this.toggleCollapse();
    }
  }
  
  expand() {
    if (this.state.isCollapsed) {
      this.toggleCollapse();
    }
  }
  
  scrollToHeading(index) {
    const heading = this.state.headings[index];
    if (!heading) return;
    
    const rect = heading.element.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top - this.options.offset;
    
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    // Collapse on mobile after selection
    if (window.innerWidth <= 1024) {
      setTimeout(() => this.collapse(), 300);
    }
    
    // Update URL without jumping
    history.pushState(null, null, `#${heading.id}`);
  }
  
  update() {
    const scrollY = window.scrollY + this.options.offset;
    
    // Find active heading
    let activeIndex = -1;
    for (let i = this.state.headings.length - 1; i >= 0; i--) {
      const heading = this.state.headings[i];
      const rect = heading.element.getBoundingClientRect();
      const headingTop = rect.top + window.scrollY;
      
      if (headingTop <= scrollY + 200) {
        activeIndex = i;
        break;
      }
    }
    
    // Update active state
    if (activeIndex !== this.state.activeIndex) {
      this.state.activeIndex = activeIndex;
      
      this.elements.links.forEach((link, index) => {
        link.classList.toggle('active', index === activeIndex);
      });
      
      // Scroll TOC to keep active item visible
      if (activeIndex !== -1) {
        const activeLink = this.elements.links[activeIndex];
        if (activeLink) {
          activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
    
    // Calculate progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.state.scrollProgress = docHeight > 0 ? (window.scrollY / docHeight) : 0;
    
    // Update progress bar
    if (this.elements.progressFill) {
      const progressPercent = Math.round(this.state.scrollProgress * 100);
      this.elements.progressFill.style.width = `${progressPercent}%`;
    }
    
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `${Math.round(this.state.scrollProgress * 100)}% complete`;
    }
    
    // Update mini progress
    if (this.elements.miniProgress) {
      this.elements.miniProgress.style.setProperty('--progress', `${this.state.scrollProgress * 100}%`);
    }
  }
  
  // Public API
  refresh() {
    this.scanHeadings();
    if (this.elements.list) {
      this.elements.list.innerHTML = '';
      this.state.headings.forEach((heading, index) => {
        const item = document.createElement('li');
        item.className = 'toc-item';
        
        const link = document.createElement('a');
        link.className = 'toc-link';
        link.href = `#${heading.id}`;
        link.setAttribute('data-level', `H${heading.level}`);
        link.setAttribute('data-index', index);
        link.innerHTML = `
          <span class="toc-number">${index + 1}</span>
          <span class="toc-text">${heading.text}</span>
        `;
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToHeading(index);
        });
        
        item.appendChild(link);
        this.elements.list.appendChild(item);
      });
      
      this.elements.links = this.elements.list.querySelectorAll('.toc-link');
    }
    this.update();
  }
  
  destroy() {
    this.elements.wrapper?.remove();
    this.elements.mini?.remove();
  }
  
  getStats() {
    return {
      headings: this.state.headings.length,
      activeIndex: this.state.activeIndex,
      progress: this.state.scrollProgress
    };
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dynamicTOC = new DynamicTOC({
      minHeadings: 4
    });
  });
} else {
  window.dynamicTOC = new DynamicTOC({
    minHeadings: 4
  });
}
