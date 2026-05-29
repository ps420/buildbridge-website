/* ============================================
   v67.0: SCROLL PROGRESS INDICATOR
   Fortune 500 Professional Navigation Aid
   ============================================ */

class ScrollProgressIndicator {
  constructor(options = {}) {
    this.sections = [];
    this.currentSection = 0;
    this.progress = 0;
    this.isVisible = false;
    this.options = {
      threshold: options.threshold || 0.3,
      showLabels: options.showLabels !== false,
      showPercentage: options.showPercentage !== false,
      mobileBar: options.mobileBar !== false,
      highlightCurrent: options.highlightCurrent !== false,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createIndicator();
    this.bindEvents();
    this.updateProgress();
    
    // Show after short delay
    setTimeout(() => {
      this.show();
    }, 1000);
  }
  
  findSections() {
    // Find all major sections with data-section attribute
    const sectionElements = document.querySelectorAll('[data-section]');
    
    this.sections = Array.from(sectionElements).map((el, index) => {
      const label = el.dataset.navLabel || el.dataset.section || `Section ${index + 1}`;
      return {
        element: el,
        label: label,
        id: el.id || `section-${index}`
      };
    }).filter(section => {
      // Only include visible sections
      const style = window.getComputedStyle(section.element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }
  
  createIndicator() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'scroll-progress-indicator';
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Page sections');
    
    // Current section name
    if (this.options.showLabels) {
      this.currentSectionEl = document.createElement('div');
      this.currentSectionEl.className = 'scroll-current-section';
      this.currentSectionEl.textContent = this.sections[0]?.label || 'Start';
      this.container.appendChild(this.currentSectionEl);
    }
    
    // Progress track with dots
    const track = document.createElement('div');
    track.className = 'scroll-progress-track';
    
    // Progress fill
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'scroll-progress-fill';
    track.appendChild(this.progressFill);
    
    // Section dots
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'scroll-section-dots';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'scroll-section-dot';
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      dot.setAttribute('data-index', index);
      
      if (index === 0) {
        dot.classList.add('active');
      }
      
      // Label tooltip
      if (this.options.showLabels) {
        const label = document.createElement('span');
        label.className = 'scroll-section-label';
        label.textContent = section.label;
        dot.appendChild(label);
      }
      
      // Click to scroll
      dot.addEventListener('click', () => {
        this.scrollToSection(index);
      });
      
      this.dotsContainer.appendChild(dot);
    });
    
    track.appendChild(this.dotsContainer);
    this.container.appendChild(track);
    
    // Percentage
    if (this.options.showPercentage) {
      this.percentageEl = document.createElement('div');
      this.percentageEl.className = 'scroll-progress-percentage';
      this.percentageEl.textContent = '0%';
      this.container.appendChild(this.percentageEl);
    }
    
    document.body.appendChild(this.container);
    
    // Mobile top bar
    if (this.options.mobileBar) {
      this.mobileBar = document.createElement('div');
      this.mobileBar.className = 'scroll-progress-bar-top';
      this.mobileBar.innerHTML = '<div class="progress-fill"></div>';
      document.body.appendChild(this.mobileBar);
      this.mobileFill = this.mobileBar.querySelector('.progress-fill');
    }
  }
  
  bindEvents() {
    // Scroll handler with RAF throttling
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        this.nextSection();
      } else if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        this.prevSection();
      }
    });
    
    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.findSections();
        this.updateProgress();
      }, 250);
    });
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    
    // Update fill height
    if (this.progressFill) {
      this.progressFill.style.height = `${this.progress}%`;
    }
    
    // Update percentage
    if (this.percentageEl) {
      this.percentageEl.textContent = `${Math.round(this.progress)}%`;
    }
    
    // Update mobile bar
    if (this.mobileFill) {
      this.mobileFill.style.width = `${this.progress}%`;
    }
    
    // Determine current section
    this.updateCurrentSection(scrollTop);
  }
  
  updateCurrentSection(scrollTop) {
    const viewportCenter = scrollTop + (window.innerHeight / 2);
    
    let newCurrentSection = 0;
    
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      const rect = section.element.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
        newCurrentSection = i;
        break;
      }
    }
    
    if (newCurrentSection !== this.currentSection) {
      this.setCurrentSection(newCurrentSection);
    }
  }
  
  setCurrentSection(index) {
    // Update dots
    const dots = this.dotsContainer.querySelectorAll('.scroll-section-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update current section label
    if (this.currentSectionEl && this.sections[index]) {
      this.currentSectionEl.textContent = this.sections[index].label;
    }
    
    // Highlight section
    if (this.options.highlightCurrent) {
      this.sections.forEach((section, i) => {
        section.element.classList.toggle('highlighted', i === index);
      });
    }
    
    this.currentSection = index;
  }
  
  scrollToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    const section = this.sections[index];
    const offset = 100; // Account for fixed header
    const targetTop = section.element.getBoundingClientRect().top + window.scrollY - offset;
    
    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  }
  
  nextSection() {
    if (this.currentSection < this.sections.length - 1) {
      this.scrollToSection(this.currentSection + 1);
    }
  }
  
  prevSection() {
    if (this.currentSection > 0) {
      this.scrollToSection(this.currentSection - 1);
    }
  }
  
  show() {
    this.isVisible = true;
    this.container.classList.add('visible');
    if (this.mobileBar) {
      this.mobileBar.classList.add('visible');
    }
  }
  
  hide() {
    this.isVisible = false;
    this.container.classList.remove('visible');
    if (this.mobileBar) {
      this.mobileBar.classList.remove('visible');
    }
  }
  
  destroy() {
    this.container.remove();
    if (this.mobileBar) {
      this.mobileBar.remove();
    }
  }
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on non-touch devices for full experience
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  
  window.scrollProgressIndicator = new ScrollProgressIndicator({
    showLabels: true,
    showPercentage: true,
    mobileBar: true,
    highlightCurrent: !isTouch
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollProgressIndicator;
}
