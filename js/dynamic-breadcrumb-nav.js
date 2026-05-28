/**
 * Dynamic Breadcrumb Navigation - v40.0
 * Fortune 500 Professional Breadcrumb System
 * With Schema.org structured data and dynamic generation
 */

class DynamicBreadcrumb {
  constructor(options = {}) {
    this.options = {
      container: '.breadcrumb-container',
      homeLabel: 'Home',
      homeUrl: 'index.html',
      homeIcon: '🏠',
      separator: 'chevron',
      maxItems: 5,
      autoGenerate: true,
      schemaOrg: true,
      ...options
    };
    
    this.container = null;
    this.breadcrumbData = [];
    
    this.init();
  }
  
  init() {
    this.container = document.querySelector(this.options.container);
    if (!this.container) return;
    
    if (this.options.autoGenerate) {
      this.generateFromURL();
    } else {
      this.parseFromDOM();
    }
    
    this.render();
    this.bindEvents();
  }
  
  generateFromURL() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p && !p.endsWith('.html'));
    const filename = path.split('/').pop() || 'index.html';
    
    // Start with home
    this.breadcrumbData = [{
      label: this.options.homeLabel,
      url: this.options.homeUrl,
      icon: this.options.homeIcon,
      isHome: true
    }];
    
    // Add path segments
    let currentPath = '';
    pathParts.forEach(part => {
      currentPath += `/${part}`;
      this.breadcrumbData.push({
        label: this.formatLabel(part),
        url: currentPath + '/',
        icon: null,
        isHome: false
      });
    });
    
    // Add current page
    if (filename !== 'index.html' && filename !== '') {
      const currentLabel = document.querySelector('h1')?.textContent?.trim() || 
                          this.formatLabel(filename.replace('.html', ''));
      
      this.breadcrumbData.push({
        label: currentLabel,
        url: null, // Current page has no URL
        icon: null,
        isHome: false,
        isCurrent: true
      });
    }
    
    // Limit items if needed
    if (this.breadcrumbData.length > this.options.maxItems) {
      const keepStart = 1; // Keep home
      const keepEnd = 2;   // Keep parent and current
      const hiddenCount = this.breadcrumbData.length - keepStart - keepEnd;
      
      const start = this.breadcrumbData.slice(0, keepStart);
      const hidden = this.breadcrumbData.slice(keepStart, -keepEnd);
      const end = this.breadcrumbData.slice(-keepEnd);
      
      this.breadcrumbData = [
        ...start,
        { label: '...', url: null, hiddenItems: hidden },
        ...end
      ];
    }
  }
  
  parseFromDOM() {
    const list = this.container.querySelector('.breadcrumb');
    if (!list) return;
    
    this.breadcrumbData = Array.from(list.querySelectorAll('li')).map(item => {
      const link = item.querySelector('a');
      const isCurrent = item.classList.contains('current') || !link;
      
      return {
        label: link?.textContent?.trim() || item.textContent?.trim(),
        url: link?.getAttribute('href'),
        isCurrent,
        isHome: item.classList.contains('home')
      };
    });
  }
  
  render() {
    const separatorIcon = this.getSeparatorIcon();
    
    let html = '';
    
    // Schema.org wrapper
    if (this.options.schemaOrg) {
      html += `<ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">`;
    } else {
      html += `<ol class="breadcrumb">`;
    }
    
    this.breadcrumbData.forEach((item, index) => {
      const position = index + 1;
      const isLast = index === this.breadcrumbData.length - 1;
      
      // Schema.org attributes
      const schemaAttrs = this.options.schemaOrg 
        ? `itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"`
        : '';
      
      html += `<li class="breadcrumb-item ${item.isCurrent ? 'current' : ''}" ${schemaAttrs}>`;
      
      // Hidden dropdown for collapsed items
      if (item.hiddenItems) {
        html += this.renderDropdown(item, index);
      } else if (item.isCurrent) {
        // Current page (no link)
        html += `<span class="breadcrumb-link" ${this.options.schemaOrg ? 'itemprop="name"' : ''}>${this.escapeHtml(item.label)}</span>`;
        if (this.options.schemaOrg) {
          html += `<meta itemprop="position" content="${position}" />`;
        }
      } else {
        // Regular link
        const content = item.icon 
          ? `<span class="icon">${item.icon}</span><span ${this.options.schemaOrg ? 'itemprop="name"' : ''}>${this.escapeHtml(item.label)}</span>`
          : `<span ${this.options.schemaOrg ? 'itemprop="name"' : ''}>${this.escapeHtml(item.label)}</span>`;
        
        if (this.options.schemaOrg) {
          html += `<a href="${item.url}" class="breadcrumb-link" itemprop="item">${content}</a>`;
          html += `<meta itemprop="position" content="${position}" />`;
        } else {
          html += `<a href="${item.url}" class="breadcrumb-link">${content}</a>`;
        }
      }
      
      // Separator (not for last item)
      if (!isLast && !item.hiddenItems) {
        html += `<span class="breadcrumb-separator" aria-hidden="true">${separatorIcon}</span>`;
      }
      
      html += `</li>`;
    });
    
    html += `</ol>`;
    
    // Update container
    const wrapper = this.container.querySelector('.breadcrumb-wrapper') || this.container;
    
    if (this.container.querySelector('.breadcrumb-wrapper')) {
      this.container.querySelector('.breadcrumb-wrapper').innerHTML = html;
    } else {
      wrapper.innerHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb-wrapper">
          ${html}
        </nav>
      `;
    }
  }
  
  renderDropdown(item, index) {
    const items = item.hiddenItems.map((hiddenItem, i) => `
      <a href="${hiddenItem.url}" class="breadcrumb-dropdown-item">
        <span class="icon">📁</span>
        ${this.escapeHtml(hiddenItem.label)}
      </a>
    `).join('');
    
    return `
      <div class="breadcrumb-dropdown" data-dropdown="${index}">
        <button class="breadcrumb-dropdown-trigger" aria-label="Show more navigation">
          ...
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="breadcrumb-dropdown-menu">
          ${items}
        </div>
      </div>
      <span class="breadcrumb-separator" aria-hidden="true">${this.getSeparatorIcon()}</span>
    `;
  }
  
  getSeparatorIcon() {
    switch (this.options.separator) {
      case 'slash':
        return '/';
      case 'arrow':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
      case 'bullet':
        return '•';
      case 'chevron':
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
    }
  }
  
  formatLabel(str) {
    return str
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\.html?$/i, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  bindEvents() {
    // Dropdown toggles
    this.container.querySelectorAll('.breadcrumb-dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = trigger.closest('.breadcrumb-dropdown');
        const isOpen = dropdown.classList.contains('is-open');
        
        // Close others
        this.container.querySelectorAll('.breadcrumb-dropdown.is-open').forEach(d => {
          d.classList.remove('is-open');
        });
        
        // Toggle current
        dropdown.classList.toggle('is-open', !isOpen);
      });
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      this.container.querySelectorAll('.breadcrumb-dropdown.is-open').forEach(d => {
        d.classList.remove('is-open');
      });
    });
    
    // Auto-hide on scroll (if enabled)
    if (this.container.classList.contains('auto-hide')) {
      let lastScroll = 0;
      
      window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
          this.container.classList.add('is-hidden');
        } else {
          this.container.classList.remove('is-hidden');
        }
        
        lastScroll = currentScroll;
      }, { passive: true });
    }
  }
  
  // Public API
  setItems(items) {
    this.breadcrumbData = items;
    this.render();
    this.bindEvents();
  }
  
  addItem(item) {
    this.breadcrumbData.push(item);
    this.render();
    this.bindEvents();
  }
  
  update() {
    this.generateFromURL();
    this.render();
    this.bindEvents();
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.breadcrumb = new DynamicBreadcrumb();
  });
} else {
  window.breadcrumb = new DynamicBreadcrumb();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicBreadcrumb;
}
