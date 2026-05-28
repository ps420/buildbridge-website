/**
 * v65.3: Animated Breadcrumbs
 * Dynamic breadcrumb navigation with animations
 * Fortune 500 Quality - Elegant UX Navigation
 */

class AnimatedBreadcrumbs {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.options = {
      homeLabel: options.homeLabel || 'Home',
      separator: options.separator || 'chevron',
      maxItems: options.maxItems || 4,
      animate: options.animate !== false,
      ...options
    };
    
    this.items = [];
    this.homeUrl = options.homeUrl || 'index.html';
    
    if (this.container) {
      this.init();
    }
  }
  
  init() {
    this.parseBreadcrumbs();
    this.createBreadcrumbs();
    this.addStyles();
  }
  
  parseBreadcrumbs() {
    // Try to get from JSON-LD structured data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd.textContent);
        const breadcrumbData = Array.isArray(data) 
          ? data.find(item => item['@type'] === 'BreadcrumbList')
          : data['@graph']?.find(item => item['@type'] === 'BreadcrumbList');
        
        if (breadcrumbData?.itemListElement) {
          this.items = breadcrumbData.itemListElement.map(item => ({
            name: item.name,
            url: item.item || '#',
            current: !item.item
          }));
          return;
        }
      } catch (e) {
        console.log('Could not parse breadcrumb JSON-LD');
      }
    }
    
    // Generate from page structure
    this.generateFromStructure();
  }
  
  generateFromStructure() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && !s.endsWith('.html'));
    const currentPage = path.split('/').pop() || 'index.html';
    const pageName = document.title.split('|')[0].trim() || 'Current Page';
    
    // Start with Home
    this.items = [{
      name: this.options.homeLabel,
      url: this.homeUrl,
      current: false
    }];
    
    // Add current page
    this.items.push({
      name: pageName,
      url: null,
      current: true
    });
  }
  
  createBreadcrumbs() {
    // Clear existing
    this.container.innerHTML = '';
    this.container.className = 'breadcrumb-container';
    
    // Create list
    const list = document.createElement('ol');
    list.className = 'breadcrumb-list';
    list.setAttribute('aria-label', 'Breadcrumb');
    
    // Check if we need to collapse
    const shouldCollapse = this.items.length > this.options.maxItems;
    
    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';
      li.style.animationDelay = `${index * 0.1}s`;
      
      if (shouldCollapse && index > 0 && index < this.items.length - 2) {
        // Collapse middle items
        if (index === 1) {
          li.innerHTML = `
            <span class="breadcrumb-ellipsis" title="More pages">...</span>
          `;
          list.appendChild(li);
          
          // Add separator
          if (index < this.items.length - 1) {
            list.appendChild(this.createSeparator());
          }
        }
        return;
      }
      
      if (item.current) {
        // Current page
        li.innerHTML = `
          <span class="breadcrumb-current" aria-current="page">${this.escapeHtml(item.name)}</span>
        `;
      } else {
        // Link
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'breadcrumb-link';
        
        // Add home icon for first item
        if (index === 0) {
          link.innerHTML = `
            <svg class="breadcrumb-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>${this.escapeHtml(item.name)}</span>
          `;
        } else {
          link.textContent = item.name;
        }
        
        li.appendChild(link);
      }
      
      list.appendChild(li);
      
      // Add separator
      if (index < this.items.length - 1) {
        list.appendChild(this.createSeparator());
      }
    });
    
    this.container.appendChild(list);
    
    // Add progress bar at bottom
    const progress = document.createElement('div');
    progress.className = 'breadcrumb-progress';
    progress.style.width = '100%';
    this.container.appendChild(progress);
  }
  
  createSeparator() {
    const separator = document.createElement('li');
    separator.className = 'breadcrumb-separator';
    separator.setAttribute('aria-hidden', 'true');
    
    if (this.options.separator === 'chevron') {
      separator.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
    } else if (this.options.separator === 'slash') {
      separator.textContent = '/';
    } else if (this.options.separator === 'arrow') {
      separator.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
    }
    
    return separator;
  }
  
  addStyles() {
    if (!this.options.animate) return;
    
    // Add animation classes
    this.container.querySelectorAll('.breadcrumb-item').forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-10px)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 100 + index * 100);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Public method to update breadcrumbs
  update(newItems) {
    this.items = newItems;
    this.createBreadcrumbs();
  }
  
  // Public method to add a new breadcrumb
  add(name, url = null) {
    this.items.push({
      name,
      url,
      current: !url
    });
    
    // Make previous current item non-current
    const prevCurrent = this.items.find(item => item.current && item.url);
    if (prevCurrent) {
      prevCurrent.current = false;
    }
    
    this.createBreadcrumbs();
  }
  
  // Public method to go back
  back() {
    if (this.items.length > 1) {
      const prevItem = this.items[this.items.length - 2];
      if (prevItem.url) {
        window.location.href = prevItem.url;
      }
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize containers with data-breadcrumbs attribute
  document.querySelectorAll('[data-breadcrumbs]').forEach(container => {
    window.breadcrumbs = new AnimatedBreadcrumbs(container);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimatedBreadcrumbs;
}
