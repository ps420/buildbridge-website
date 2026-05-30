/**
 * Dynamic Copyright Year Updater - v112.0
 * Fortune 500 Professional Copyright Management
 */

class DynamicCopyrightYear {
  constructor(options = {}) {
    this.options = {
      selector: '.copyright-year, [data-copyright-year]',
      updateInterval: 60000, // Check every minute
      watchForMutations: true,
      format: '© {year} {company}',
      companyName: 'BuildBridge',
      startYear: null, // For range format (e.g., 2020-2024)
      ...options
    };
    
    this.elements = [];
    this.currentYear = new Date().getFullYear();
    this.updateTimer = null;
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.findElements();
    this.updateAll();
    this.startAutoUpdate();
    
    if (this.options.watchForMutations) {
      this.setupMutationObserver();
    }
  }
  
  findElements() {
    this.elements = Array.from(document.querySelectorAll(this.options.selector));
    
    // Also look for copyright text patterns in footers
    const footer = document.querySelector('footer, .footer, [role="contentinfo"]');
    if (footer) {
      const walker = document.createTreeWalker(
        footer,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.match(/©\s*\d{4}/) || node.textContent.match(/copyright\s*\d{4}/i)) {
          // Mark this text node for updating
          if (!node.parentElement.hasAttribute('data-copyright-managed')) {
            node.parentElement.setAttribute('data-copyright-managed', 'true');
            this.elements.push(node.parentElement);
          }
        }
      }
    }
  }
  
  updateAll() {
    const year = this.getCurrentYear();
    const yearRange = this.getYearRange();
    
    this.elements.forEach(el => {
      this.updateElement(el, year, yearRange);
    });
  }
  
  updateElement(element, year, yearRange) {
    // Determine format from data attributes or options
    const format = element.dataset.copyrightFormat || this.options.format;
    const company = element.dataset.company || this.options.companyName;
    const useRange = element.hasAttribute('data-copyright-range') || this.options.startYear;
    
    let text;
    
    if (useRange && yearRange) {
      text = format
        .replace('{year}', yearRange)
        .replace('{company}', company);
    } else {
      text = format
        .replace('{year}', year)
        .replace('{company}', company);
    }
    
    // Check if element has specific text content or needs format replacement
    if (element.hasAttribute('data-copyright-year')) {
      element.textContent = text;
    } else if (element.classList.contains('copyright-year')) {
      element.textContent = year;
    } else {
      // Replace year in existing text
      const currentText = element.textContent;
      const updatedText = currentText
        .replace(/©\s*\d{4}(-\d{4})?/g, `© ${yearRange || year}`)
        .replace(/copyright\s*\d{4}(-\d{4})?/gi, `Copyright ${yearRange || year}`);
      
      if (currentText !== updatedText) {
        element.textContent = updatedText;
      }
    }
    
    // Update title attribute if present
    if (element.hasAttribute('title')) {
      const title = element.getAttribute('title');
      const updatedTitle = title
        .replace(/©\s*\d{4}(-\d{4})?/g, `© ${yearRange || year}`)
        .replace(/copyright\s*\d{4}(-\d{4})?/gi, `Copyright ${yearRange || year}`);
      element.setAttribute('title', updatedTitle);
    }
  }
  
  getCurrentYear() {
    return new Date().getFullYear();
  }
  
  getYearRange() {
    const startYear = this.options.startYear || 
      parseInt(document.querySelector('[data-copyright-start]')?.dataset.copyrightStart);
    
    if (!startYear) return null;
    
    const currentYear = this.getCurrentYear();
    
    if (startYear === currentYear) {
      return String(currentYear);
    }
    
    return `${startYear}-${currentYear}`;
  }
  
  startAutoUpdate() {
    // Check for year change periodically
    this.updateTimer = setInterval(() => {
      const newYear = this.getCurrentYear();
      if (newYear !== this.currentYear) {
        this.currentYear = newYear;
        this.updateAll();
        console.log(`[Copyright Year] Updated to ${newYear}`);
      }
    }, this.options.updateInterval);
  }
  
  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if new elements match our selector
              if (node.matches && (node.matches(this.options.selector) || 
                  node.querySelector(this.options.selector))) {
                shouldRefresh = true;
              }
              
              // Check for copyright patterns
              if (node.textContent && (node.textContent.match(/©\s*\d{4}/) || 
                  node.textContent.match(/copyright\s*\d{4}/i))) {
                shouldRefresh = true;
              }
            }
          });
        }
      });
      
      if (shouldRefresh) {
        this.refresh();
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Refresh and find new elements
   */
  refresh() {
    this.findElements();
    this.updateAll();
  }
  
  /**
   * Force update with a specific year
   */
  forceYear(year) {
    this.currentYear = year;
    this.updateAll();
  }
  
  /**
   * Set the company name
   */
  setCompanyName(name) {
    this.options.companyName = name;
    this.updateAll();
  }
  
  /**
   * Set the start year for range display
   */
  setStartYear(year) {
    this.options.startYear = year;
    this.updateAll();
  }
  
  /**
   * Stop auto updates
   */
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * Restart auto updates
   */
  restart() {
    this.stop();
    this.startAutoUpdate();
    if (this.options.watchForMutations) {
      this.setupMutationObserver();
    }
  }
  
  /**
   * Destroy the instance
   */
  destroy() {
    this.stop();
    this.elements = [];
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.copyrightYear = new DynamicCopyrightYear({
    companyName: 'BuildBridge',
    startYear: 2012 // BuildBridge founding year
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicCopyrightYear;
}
