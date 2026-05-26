// BuildBridge - Scroll Reveal Navigation
// Fortune 500-style section navigation with progress indicators
// Version 5.0 Professional Enhancement

class ScrollRevealNav {
  constructor() {
    this.sections = [];
    this.navContainer = null;
    this.activeIndex = -1;
    this.isVisible = false;
    this.observers = [];
    
    this.init();
  }
  
  init() {
    this.findSections();
    if (this.sections.length === 0) return;
    
    this.createNavigation();
    this.setupObservers();
    this.bindEvents();
    this.handleScroll();
  }
  
  findSections() {
    // Find all sections with data-nav-label or main sections
    const sectionSelectors = [
      'section[data-nav-label]',
      'section[id]',
      '.section[id]'
    ];
    
    sectionSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(section => {
        if (!this.sections.find(s => s.element === section)) {
          const id = section.id || section.getAttribute('data-nav-label')?.toLowerCase().replace(/\s+/g, '-');
          const label = section.getAttribute('data-nav-label') || 
                       section.querySelector('h2')?.textContent || 
                       id?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ||
                       'Section';
          
          if (id && label) {
            this.sections.push({
              element: section,
              id: id,
              label: label,
              progress: 0
            });
          }
        }
      });
    });
  }
  
  createNavigation() {
    // Create navigation container
    this.navContainer = document.createElement('nav');
    this.navContainer.className = 'scroll-reveal-nav';
    this.navContainer.setAttribute('aria-label', 'Section navigation');
    
    // Create navigation items
    this.sections.forEach((section, index) => {
      const item = document.createElement('button');
      item.className = 'scroll-nav-item';
      item.setAttribute('data-index', index);
      item.setAttribute('data-section', section.id);
      item.setAttribute('aria-label', `Navigate to ${section.label}`);
      
      // Progress ring
      const progressRing = document.createElement('div');
      progressRing.className = 'scroll-nav-progress';
      item.appendChild(progressRing);
      
      // Label tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'scroll-nav-tooltip';
      tooltip.textContent = section.label;
      item.appendChild(tooltip);
      
      // Click handler
      item.addEventListener('click', () => this.navigateToSection(index));
      
      this.navContainer.appendChild(item);
      section.navItem = item;
      section.progressRing = progressRing;
    });
    
    document.body.appendChild(this.navContainer);
    
    // Add progress line
    this.progressLine = document.createElement('div');
    this.progressLine.className = 'scroll-nav-line';
    this.navContainer.insertBefore(this.progressLine, this.navContainer.firstChild);
  }
  
  setupObservers() {
    // Use Intersection Observer to track section visibility
    const observerOptions = {
      threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
      rootMargin: '-10% 0px -10% 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = this.sections.find(s => s.element === entry.target);
        if (section) {
          section.progress = entry.intersectionRatio;
          section.isIntersecting = entry.isIntersecting;
          this.updateProgress(section);
        }
      });
      this.updateActiveSection();
    }, observerOptions);
    
    this.sections.forEach(section => {
      this.observer.observe(section.element);
    });
  }
  
  bindEvents() {
    // Show/hide based on scroll
    let lastScroll = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      // Show after scrolling past hero
      if (currentScroll > window.innerHeight * 0.5) {
        if (!this.isVisible) {
          this.showNavigation();
        }
      } else {
        if (this.isVisible) {
          this.hideNavigation();
        }
      }
      
      // Update progress line
      this.updateGlobalProgress();
      
      lastScroll = currentScroll;
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (this.sections[index]) {
          this.navigateToSection(index);
        }
      }
    });
  }
  
  showNavigation() {
    this.navContainer.classList.add('visible');
    this.isVisible = true;
  }
  
  hideNavigation() {
    this.navContainer.classList.remove('visible');
    this.isVisible = false;
  }
  
  updateProgress(section) {
    // Update individual section progress ring
    if (section.progressRing) {
      const circumference = 2 * Math.PI * 14; // Circle with r=14
      const offset = circumference * (1 - section.progress);
      section.progressRing.style.strokeDashoffset = offset;
      
      // Add active class when section is in view
      if (section.progress > 0.3) {
        section.navItem.classList.add('in-view');
      } else {
        section.navItem.classList.remove('in-view');
      }
    }
  }
  
  updateActiveSection() {
    // Find the section with highest progress
    let maxProgress = 0;
    let activeIndex = -1;
    
    this.sections.forEach((section, index) => {
      if (section.progress > maxProgress) {
        maxProgress = section.progress;
        activeIndex = index;
      }
    });
    
    if (activeIndex !== this.activeIndex) {
      // Remove old active
      if (this.sections[this.activeIndex]) {
        this.sections[this.activeIndex].navItem.classList.remove('active');
      }
      
      // Set new active
      this.activeIndex = activeIndex;
      if (this.sections[activeIndex]) {
        this.sections[activeIndex].navItem.classList.add('active');
      }
    }
  }
  
  updateGlobalProgress() {
    // Calculate overall page progress
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    
    if (this.progressLine) {
      this.progressLine.style.height = `${progress * 100}%`;
    }
  }
  
  navigateToSection(index) {
    const section = this.sections[index];
    if (!section) return;
    
    // Smooth scroll to section
    const offsetTop = section.element.offsetTop - 100; // Account for fixed header
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
    
    // Visual feedback
    section.navItem.classList.add('clicked');
    setTimeout(() => {
      section.navItem.classList.remove('clicked');
    }, 300);
    
    // Announce to screen readers
    this.announceToScreenReader(`Navigated to ${section.label}`);
  }
  
  announceToScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    document.body.appendChild(announcer);
    
    setTimeout(() => announcer.remove(), 1000);
  }
  
  handleScroll() {
    this.updateGlobalProgress();
    if (window.scrollY > window.innerHeight * 0.5) {
      this.showNavigation();
    }
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.navContainer) {
      this.navContainer.remove();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollRevealNav = new ScrollRevealNav();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollRevealNav;
}
