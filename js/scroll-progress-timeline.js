/**
 * Scroll Progress Timeline - v22.1 Professional Enhancement
 * Visual timeline showing scroll progress through page sections
 */

class ScrollProgressTimeline {
  constructor(options = {}) {
    this.sections = options.sections || '[data-section]';
    this.container = options.container || document.body;
    this.position = options.position || 'right';
    this.showLabels = options.showLabels !== false;
    this.showProgress = options.showProgress !== false;
    
    this.currentSection = 0;
    this.sectionsList = [];
    
    this.init();
  }
  
  init() {
    this.detectSections();
    this.createTimeline();
    this.bindEvents();
    this.updateActiveSection();
  }
  
  detectSections() {
    const elements = document.querySelectorAll(this.sections);
    this.sectionsList = Array.from(elements).map((el, index) => ({
      id: el.id || `section-${index}`,
      label: el.dataset.navLabel || el.dataset.section || `Section ${index + 1}`,
      element: el,
      index
    }));
  }
  
  createTimeline() {
    this.timeline = document.createElement('nav');
    this.timeline.className = `scroll-timeline scroll-timeline--${this.position}`;
    this.timeline.setAttribute('aria-label', 'Page sections');
    
    // Create progress container
    if (this.showProgress) {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'scroll-timeline__progress';
      this.timeline.appendChild(this.progressBar);
    }
    
    // Create dots container
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'scroll-timeline__dots';
    
    this.sectionsList.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'scroll-timeline__dot';
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      dot.dataset.index = index;
      dot.dataset.section = section.id;
      
      // Add label if enabled
      if (this.showLabels) {
        const label = document.createElement('span');
        label.className = 'scroll-timeline__label';
        label.textContent = section.label;
        dot.appendChild(label);
      }
      
      // Add tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'scroll-timeline__tooltip';
      tooltip.textContent = section.label;
      dot.appendChild(tooltip);
      
      dot.addEventListener('click', () => this.scrollToSection(index));
      this.dotsContainer.appendChild(dot);
    });
    
    this.timeline.appendChild(this.dotsContainer);
    this.container.appendChild(this.timeline);
    
    // Create mobile timeline
    this.createMobileTimeline();
  }
  
  createMobileTimeline() {
    this.mobileTimeline = document.createElement('div');
    this.mobileTimeline.className = 'scroll-timeline-mobile';
    
    const progress = document.createElement('div');
    progress.className = 'scroll-timeline-mobile__progress';
    
    const bar = document.createElement('div');
    bar.className = 'scroll-timeline-mobile__bar';
    progress.appendChild(bar);
    
    this.mobileTimeline.appendChild(progress);
    
    // Section name display
    this.mobileLabel = document.createElement('span');
    this.mobileLabel.className = 'scroll-timeline-mobile__label';
    this.mobileTimeline.appendChild(this.mobileLabel);
    
    document.body.appendChild(this.mobileTimeline);
  }
  
  bindEvents() {
    // Scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.navigateSection(1);
      } else if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        this.navigateSection(-1);
      }
    });
    
    // Show/hide on scroll direction
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      if (currentScrollY > 100) {
        this.timeline.classList.add('scroll-timeline--visible');
      } else {
        this.timeline.classList.remove('scroll-timeline--visible');
      }
      
      lastScrollY = currentScrollY;
      
      // Hide after inactivity
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.timeline.classList.remove('scroll-timeline--active');
      }, 2000);
      
      this.timeline.classList.add('scroll-timeline--active');
    }, { passive: true });
  }
  
  updateActiveSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    let activeIndex = 0;
    this.sectionsList.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      
      if (scrollPosition >= sectionTop) {
        activeIndex = index;
      }
    });
    
    if (activeIndex !== this.currentSection) {
      this.currentSection = activeIndex;
      this.highlightDot(activeIndex);
    }
    
    // Update progress
    this.updateProgress();
  }
  
  highlightDot(index) {
    const dots = this.dotsContainer.querySelectorAll('.scroll-timeline__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.classList.toggle('visited', i < index);
    });
    
    // Update mobile label
    if (this.mobileLabel) {
      this.mobileLabel.textContent = this.sectionsList[index]?.label || '';
      this.mobileLabel.classList.add('visible');
      
      clearTimeout(this.labelTimeout);
      this.labelTimeout = setTimeout(() => {
        this.mobileLabel.classList.remove('visible');
      }, 2000);
    }
  }
  
  updateProgress() {
    if (!this.progressBar && !this.mobileTimeline) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.height = `${progress}%`;
    }
    
    if (this.mobileTimeline) {
      const bar = this.mobileTimeline.querySelector('.scroll-timeline-mobile__bar');
      if (bar) {
        bar.style.width = `${progress}%`;
      }
    }
  }
  
  scrollToSection(index) {
    const section = this.sectionsList[index];
    if (section) {
      const offset = section.element.offsetTop - 100;
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  }
  
  navigateSection(direction) {
    const newIndex = Math.max(0, Math.min(
      this.sectionsList.length - 1,
      this.currentSection + direction
    ));
    this.scrollToSection(newIndex);
  }
  
  destroy() {
    this.timeline?.remove();
    this.mobileTimeline?.remove();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.scrollTimeline = new ScrollProgressTimeline({
      position: 'right',
      showLabels: true,
      showProgress: true
    });
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollProgressTimeline;
}
