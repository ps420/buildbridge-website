/**
 * Smart Scroll Spy Navigation v56.0
 * Fortune 500 Section Indicator System
 */

class ScrollSpyNavigation {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || 'section[id], [data-section]',
      offset: options.offset || 100,
      threshold: options.threshold || 0.3,
      ...options
    };
    
    this.sections = [];
    this.currentSection = null;
    this.container = null;
    this.progressFill = null;
    this.dots = [];
    this.scrollProgress = 0;
    
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.findSections();
    if (this.sections.length < 3) {
      console.log('ScrollSpy: Not enough sections to display navigation');
      return;
    }
    
    this.createContainer();
    this.createDots();
    this.attachEvents();
    this.updateActiveSection();
    
    // Show after delay
    setTimeout(() => {
      this.container.classList.add('visible');
    }, 1000);
    
    console.log(`🎯 ScrollSpy: Initialized with ${this.sections.length} sections`);
  }

  findSections() {
    const elements = document.querySelectorAll(this.options.selector);
    this.sections = Array.from(elements).map((el, index) => ({
      element: el,
      id: el.id || `section-${index}`,
      label: el.getAttribute('data-nav-label') || 
             el.getAttribute('aria-label') || 
             el.querySelector('h2')?.textContent || 
             `Section ${index + 1}`,
      index: index
    }));
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'scroll-spy-container';
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Page section navigation');
    
    // Create progress track
    const progressTrack = document.createElement('div');
    progressTrack.className = 'scroll-spy-progress';
    
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'scroll-spy-progress-fill';
    this.progressFill.style.height = '0%';
    
    progressTrack.appendChild(this.progressFill);
    this.container.appendChild(progressTrack);
    
    document.body.appendChild(this.container);
  }

  createDots() {
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'scroll-spy-dot';
      dot.setAttribute('data-section-index', index);
      dot.setAttribute('data-section-id', section.id);
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      dot.setAttribute('tabindex', '0');
      
      // Section number
      const number = document.createElement('span');
      number.className = 'scroll-spy-number';
      number.textContent = String(index + 1).padStart(2, '0');
      dot.appendChild(number);
      
      // Label tooltip
      const label = document.createElement('span');
      label.className = 'scroll-spy-label';
      label.textContent = section.label;
      dot.appendChild(label);
      
      // Click handler
      dot.addEventListener('click', () => this.navigateToSection(index));
      
      // Keyboard handler
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.navigateToSection(index);
        }
      });
      
      this.container.appendChild(dot);
      this.dots.push(dot);
    });
  }

  attachEvents() {
    // Throttled scroll handler
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateActiveSection();
          this.updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Update on resize
    window.addEventListener('resize', () => {
      this.updateActiveSection();
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateNext();
      }
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigatePrevious();
      }
      if (e.altKey && e.key === 'Home') {
        e.preventDefault();
        this.navigateToSection(0);
      }
      if (e.altKey && e.key === 'End') {
        e.preventDefault();
        this.navigateToSection(this.sections.length - 1);
      }
    });
  }

  updateActiveSection() {
    const scrollPos = window.scrollY + this.options.offset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    let activeIndex = 0;
    let maxVisibility = 0;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const visibility = this.calculateVisibility(rect, windowHeight);
      
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        activeIndex = index;
      }
    });
    
    // Update current section
    if (this.currentSection !== activeIndex) {
      this.currentSection = activeIndex;
      this.updateDots(activeIndex);
      
      // Announce to screen readers
      this.announceToScreenReader(`Now viewing ${this.sections[activeIndex].label}`);
    }
  }

  calculateVisibility(rect, windowHeight) {
    // Calculate what percentage of the element is visible in the viewport
    const top = Math.max(0, rect.top);
    const bottom = Math.min(windowHeight, rect.bottom);
    const visibleHeight = Math.max(0, bottom - top);
    const elementHeight = rect.height;
    
    return visibleHeight / elementHeight;
  }

  updateDots(activeIndex) {
    this.dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = (scrollTop / docHeight) * 100;
    
    if (this.progressFill) {
      this.progressFill.style.height = `${this.scrollProgress}%`;
    }
  }

  navigateToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    const section = this.sections[index];
    const offsetTop = section.element.offsetTop - this.options.offset;
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
    
    // Update immediately for feedback
    this.currentSection = index;
    this.updateDots(index);
  }

  navigateNext() {
    const nextIndex = (this.currentSection + 1) % this.sections.length;
    this.navigateToSection(nextIndex);
  }

  navigatePrevious() {
    const prevIndex = (this.currentSection - 1 + this.sections.length) % this.sections.length;
    this.navigateToSection(prevIndex);
  }

  announceToScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(announcer);
    announcer.textContent = message;
    
    setTimeout(() => announcer.remove(), 1000);
  }

  // Public API methods
  refresh() {
    this.findSections();
    this.container.innerHTML = '';
    const progressTrack = document.createElement('div');
    progressTrack.className = 'scroll-spy-progress';
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'scroll-spy-progress-fill';
    this.progressFill.style.height = '0%';
    progressTrack.appendChild(this.progressFill);
    this.container.appendChild(progressTrack);
    this.dots = [];
    this.createDots();
    this.updateActiveSection();
  }

  show() {
    this.container.classList.add('visible');
  }

  hide() {
    this.container.classList.remove('visible');
  }

  destroy() {
    window.removeEventListener('scroll', this.updateActiveSection);
    window.removeEventListener('resize', this.updateActiveSection);
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Initialize
const scrollSpy = new ScrollSpyNavigation({
  offset: 150,
  threshold: 0.3
});

// Export for global access
window.ScrollSpyNavigation = ScrollSpyNavigation;
window.scrollSpy = scrollSpy;

// Re-initialize on page load complete
window.addEventListener('load', () => {
  scrollSpy.refresh();
});

// Auto-reveal after scroll begins
let hasScrolled = false;
window.addEventListener('scroll', () => {
  if (!hasScrolled) {
    hasScrolled = true;
    setTimeout(() => {
      scrollSpy.show();
    }, 500);
  }
}, { passive: true, once: true });
