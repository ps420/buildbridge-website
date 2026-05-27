/**
 * Project Shuffle Filter - v22.0 Professional Enhancement
 * Advanced filtering with smooth shuffle animations
 */

class ProjectShuffleFilter {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '.shuffle-projects');
    this.filterContainer = document.querySelector(options.filters || '.shuffle-filters');
    this.animationDuration = options.duration || 600;
    this.staggerDelay = options.stagger || 50;
    
    if (!this.container) return;
    
    this.items = Array.from(this.container.querySelectorAll('.shuffle-item'));
    this.filters = this.filterContainer ? 
      Array.from(this.filterContainer.querySelectorAll('.shuffle-filter')) : [];
    this.activeFilter = 'all';
    
    this.init();
  }
  
  init() {
    // Initial setup
    this.items.forEach((item, index) => {
      item.style.transition = 'none';
      item.dataset.originalIndex = index;
      
      // Store position data
      const rect = item.getBoundingClientRect();
      item.dataset.width = rect.width;
      item.dataset.height = rect.height;
    });
    
    this.bindEvents();
    this.applyFilter('all', false);
  }
  
  bindEvents() {
    // Filter button clicks
    this.filters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter === this.activeFilter) return;
        
        this.setActiveFilter(e.target);
        this.applyFilter(filter, true);
      });
    });
    
    // Window resize - recalculate
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.items.forEach(item => {
          const rect = item.getBoundingClientRect();
          item.dataset.width = rect.width;
          item.dataset.height = rect.height;
        });
      }, 250);
    });
  }
  
  setActiveFilter(activeBtn) {
    this.filters.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }
  
  applyFilter(filter, animate = true) {
    this.activeFilter = filter;
    
    // Get visible items
    const visibleItems = this.items.filter(item => {
      const categories = item.dataset.categories?.split(' ') || [];
      return filter === 'all' || categories.includes(filter);
    });
    
    const hiddenItems = this.items.filter(item => {
      const categories = item.dataset.categories?.split(' ') || [];
      return filter !== 'all' && !categories.includes(filter);
    });
    
    if (animate) {
      this.animateFilterChange(visibleItems, hiddenItems);
    } else {
      this.setItemStates(visibleItems, hiddenItems);
    }
    
    // Update counter if exists
    this.updateCounter(visibleItems.length);
  }
  
  animateFilterChange(visibleItems, hiddenItems) {
    // Store current positions
    const positions = new Map();
    this.items.forEach(item => {
      const rect = item.getBoundingClientRect();
      positions.set(item, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
    });
    
    // Apply new states
    this.setItemStates(visibleItems, hiddenItems);
    
    // Force reflow
    this.container.offsetHeight;
    
    // Calculate new positions and animate
    visibleItems.forEach((item, index) => {
      const oldPos = positions.get(item);
      const newRect = item.getBoundingClientRect();
      
      const deltaX = oldPos.left - newRect.left;
      const deltaY = oldPos.top - newRect.top;
      
      // Apply transform to maintain old position
      item.style.transition = 'none';
      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      
      // Animate to new position
      requestAnimationFrame(() => {
        item.style.transition = `
          transform ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1) ${index * this.staggerDelay}ms,
          opacity ${this.animationDuration}ms ease ${index * this.staggerDelay}ms
        `;
        item.style.transform = 'translate(0, 0)';
        item.style.opacity = '1';
      });
    });
    
    // Animate hidden items out
    hiddenItems.forEach((item, index) => {
      item.style.transition = `opacity ${this.animationDuration / 2}ms ease`;
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
    });
    
    // Update grid after animation
    setTimeout(() => {
      this.items.forEach(item => {
        item.style.transition = '';
        item.style.transform = '';
      });
    }, this.animationDuration + (visibleItems.length * this.staggerDelay));
  }
  
  setItemStates(visibleItems, hiddenItems) {
    // Update grid positions
    visibleItems.forEach(item => {
      item.classList.remove('shuffle-hidden');
      item.style.display = '';
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
      item.style.position = '';
    });
    
    hiddenItems.forEach(item => {
      item.classList.add('shuffle-hidden');
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      item.style.pointerEvents = 'none';
    });
  }
  
  updateCounter(count) {
    const counter = document.querySelector('.shuffle-counter');
    if (counter) {
      // Animate number change
      const current = parseInt(counter.textContent) || 0;
      this.animateNumber(counter, current, count, 500);
    }
  }
  
  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Search functionality
  search(query) {
    const lowerQuery = query.toLowerCase();
    
    this.items.forEach(item => {
      const title = item.querySelector('.shuffle-title')?.textContent.toLowerCase() || '';
      const description = item.querySelector('.shuffle-desc')?.textContent.toLowerCase() || '';
      const categories = item.dataset.categories?.toLowerCase() || '';
      
      const matches = title.includes(lowerQuery) || 
                     description.includes(lowerQuery) || 
                     categories.includes(lowerQuery);
      
      if (matches) {
        item.classList.remove('shuffle-search-hidden');
      } else {
        item.classList.add('shuffle-search-hidden');
      }
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.shuffle-projects').forEach(container => {
    new ProjectShuffleFilter({
      container: container,
      duration: 600,
      stagger: 60
    });
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectShuffleFilter;
}
