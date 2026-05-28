/**
 * v65.1: Scroll Progress Timeline
 * Visual scroll journey with section milestones
 * Fortune 500 Quality - Elegant & Informative
 */

class ScrollProgressTimeline {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'left',
      offset: options.offset || 30,
      smoothing: options.smoothing || 0.1,
      ...options
    };
    
    this.timeline = null;
    this.sections = [];
    this.items = [];
    this.currentSection = 0;
    this.progressBar = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.findSections();
    if (this.sections.length === 0) return;
    
    this.createTimeline();
    this.bindEvents();
    this.updateActiveSection();
  }
  
  findSections() {
    // Find all major sections with data attributes
    const sectionElements = document.querySelectorAll('section[id], .section[data-section]');
    
    this.sections = Array.from(sectionElements)
      .filter(section => {
        const id = section.id || section.dataset.section;
        return id && id !== '';
      })
      .map((section, index) => ({
        element: section,
        id: section.id || section.dataset.section,
        label: section.dataset.navLabel || section.dataset.section || this.formatLabel(section.id),
        number: index + 1
      }));
  }
  
  formatLabel(id) {
    return id
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  createTimeline() {
    this.timeline = document.createElement('nav');
    this.timeline.className = `scroll-timeline scroll-timeline--${this.options.position}`;
    this.timeline.setAttribute('aria-label', 'Page sections');
    
    // Progress line with gradient
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-timeline-progress';
    this.timeline.appendChild(this.progressBar);
    
    // Create timeline items
    this.sections.forEach((section, index) => {
      const item = document.createElement('div');
      item.className = 'scroll-timeline-item';
      item.dataset.index = index;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `Go to ${section.label}`);
      
      // Number indicator
      const number = document.createElement('span');
      number.className = 'scroll-timeline-number';
      number.textContent = String(section.number).padStart(2, '0');
      
      // Dot
      const dot = document.createElement('div');
      dot.className = 'scroll-timeline-dot';
      
      // Label
      const label = document.createElement('span');
      label.className = 'scroll-timeline-label';
      label.textContent = section.label;
      
      item.appendChild(number);
      item.appendChild(dot);
      item.appendChild(label);
      
      // Click handler
      item.addEventListener('click', () => this.scrollToSection(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToSection(index);
        }
      });
      
      this.timeline.appendChild(item);
      this.items.push(item);
    });
    
    document.body.appendChild(this.timeline);
    
    // Add base styles
    this.addStyles();
  }
  
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .scroll-timeline-progress {
        position: absolute;
        left: ${this.options.position === 'right' ? 'auto' : '15px'};
        right: ${this.options.position === 'right' ? '15px' : 'auto'};
        top: 30px;
        bottom: 30px;
        width: 2px;
        background: rgba(201, 206, 214, 0.1);
        overflow: hidden;
      }
      
      .scroll-timeline-progress::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: var(--progress, 0%);
        background: linear-gradient(
          to bottom,
          #C9CED6,
          rgba(201, 206, 214, 0.5)
        );
        transition: height 0.1s linear;
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Update on scroll
    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      this.updateActiveSection();
      
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    }, { passive: true });
    
    // Update on resize
    window.addEventListener('resize', () => {
      this.debounce(() => this.updateActiveSection(), 100)();
    });
  }
  
  updateActiveSection() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (window.scrollY / docHeight) * 100;
    
    // Update progress bar
    if (this.progressBar) {
      this.timeline.style.setProperty('--progress', `${scrollProgress}%`);
    }
    
    // Find current section
    let newCurrent = 0;
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;
      
      if (scrollPos >= top && scrollPos < bottom) {
        newCurrent = index;
      }
    });
    
    if (newCurrent !== this.currentSection) {
      this.items[this.currentSection]?.classList.remove('active');
      this.currentSection = newCurrent;
      this.items[this.currentSection]?.classList.add('active');
    }
  }
  
  scrollToSection(index) {
    const section = this.sections[index];
    if (section?.element) {
      const offset = 80; // Account for fixed header
      const top = section.element.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  destroy() {
    if (this.timeline) {
      this.timeline.remove();
    }
    clearTimeout(this.scrollTimeout);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on larger screens
  if (window.innerWidth > 1024) {
    window.scrollTimeline = new ScrollProgressTimeline({
      position: 'left',
      offset: 30
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollProgressTimeline;
}
