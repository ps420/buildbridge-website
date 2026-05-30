/**
 * Section Navigation Dots - v111.0
 * Fortune 500 Smooth Section Navigation
 */

class SectionNavigationDots {
  constructor(options = {}) {
    this.options = {
      selector: '[data-section]',
      offset: 100,
      showAfterScroll: 300,
      position: 'right', // 'right' or 'left'
      style: 'default', // 'default', 'compact', 'minimal'
      ...options
    };
    
    this.sections = [];
    this.currentSection = 0;
    this.isVisible = false;
    this.navContainer = null;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createNavigation();
    this.bindEvents();
    this.updateActiveSection();
  }
  
  findSections() {
    this.sections = Array.from(document.querySelectorAll(this.options.selector))
      .map((section, index) => ({
        element: section,
        id: section.id || `section-${index}`,
        label: section.dataset.navLabel || section.dataset.section || `Section ${index + 1}`,
        index: index
      }));
  }
  
  createNavigation() {
    // Remove existing
    const existing = document.querySelector('.section-nav-dots');
    if (existing) existing.remove();
    
    // Create container
    const container = document.createElement('nav');
    container.className = `section-nav-dots ${this.options.position} ${this.options.style}`;
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Page sections');
    
    // Create connection line
    const line = document.createElement('div');
    line.className = 'section-nav-line';
    
    const progress = document.createElement('div');
    progress.className = 'section-nav-progress';
    line.appendChild(progress);
    container.appendChild(line);
    
    // Create dots
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'section-nav-dot';
      dot.setAttribute('data-index', index);
      dot.setAttribute('data-label', section.label);
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
      dot.setAttribute('tabindex', '0');
      
      // Add section number
      const number = document.createElement('span');
      number.className = 'section-nav-number';
      number.textContent = String(index + 1).padStart(2, '0');
      dot.appendChild(number);
      
      // Click handler
      dot.addEventListener('click', () => this.goToSection(index));
      
      // Keyboard handler
      dot.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.goToSection(index);
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            this.focusDot(index + 1);
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            this.focusDot(index - 1);
            break;
          case 'Home':
            e.preventDefault();
            this.focusDot(0);
            break;
          case 'End':
            e.preventDefault();
            this.focusDot(this.sections.length - 1);
            break;
        }
      });
      
      container.appendChild(dot);
    });
    
    document.body.appendChild(container);
    this.navContainer = container;
    this.progressBar = progress;
  }
  
  bindEvents() {
    // Scroll events with RAF throttling
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.findSections();
        this.createNavigation();
      }, 250);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + Arrow keys for section navigation
      if (e.altKey) {
        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.goToSection(this.currentSection + 1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.goToSection(this.currentSection - 1);
            break;
        }
      }
    });
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    
    // Toggle visibility
    if (scrollY > this.options.showAfterScroll) {
      this.showNavigation();
    } else {
      this.hideNavigation();
    }
    
    // Update active section
    this.updateActiveSection();
    
    // Update progress
    this.updateProgress();
  }
  
  updateActiveSection() {
    const scrollPosition = window.scrollY + this.options.offset + (window.innerHeight / 3);
    
    let newSection = 0;
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      
      if (scrollPosition >= sectionTop) {
        newSection = i;
        break;
      }
    }
    
    if (newSection !== this.currentSection) {
      this.currentSection = newSection;
      this.updateDots();
    }
  }
  
  updateDots() {
    const dots = this.navContainer.querySelectorAll('.section-nav-dot');
    
    dots.forEach((dot, index) => {
      const isActive = index === this.currentSection;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }
  
  updateProgress() {
    if (!this.progressBar) return;
    
    const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    this.progressBar.style.height = `${Math.min(100, Math.max(0, scrollProgress))}%`;
  }
  
  goToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    const section = this.sections[index];
    const targetPosition = section.element.getBoundingClientRect().top + window.scrollY - this.options.offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Update current immediately for responsiveness
    this.currentSection = index;
    this.updateDots();
  }
  
  focusDot(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    const dots = this.navContainer.querySelectorAll('.section-nav-dot');
    dots[index].focus();
  }
  
  showNavigation() {
    if (!this.isVisible) {
      this.isVisible = true;
      this.navContainer.classList.add('visible');
    }
  }
  
  hideNavigation() {
    if (this.isVisible) {
      this.isVisible = false;
      this.navContainer.classList.remove('visible');
    }
  }
  
  /**
   * Refresh sections (useful after dynamic content changes)
   */
  refresh() {
    this.findSections();
    this.createNavigation();
    this.updateActiveSection();
  }
  
  /**
   * Destroy the navigation
   */
  destroy() {
    if (this.navContainer) {
      this.navContainer.remove();
      this.navContainer = null;
    }
  }
  
  /**
   * Change the navigation style
   */
  setStyle(style) {
    this.options.style = style;
    this.navContainer.className = `section-nav-dots ${this.options.position} ${style}`;
  }
  
  /**
   * Change the navigation position
   */
  setPosition(position) {
    this.options.position = position;
    this.navContainer.className = `section-nav-dots ${position} ${this.options.style}`;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.sectionNav = new SectionNavigationDots();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SectionNavigationDots;
}
