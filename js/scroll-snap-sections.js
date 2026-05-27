/**
 * Scroll Snap Sections v20.0
 * Smooth section-based scrolling with indicators
 */

class ScrollSnapSections {
  constructor(options = {}) {
    this.sections = document.querySelectorAll(options.sectionSelector || '[data-snap]');
    if (!this.sections.length) return;
    
    this.config = {
      offset: options.offset || 0,
      duration: options.duration || 800,
      easing: options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)',
      indicators: options.indicators !== false,
      keyboard: options.keyboard !== false,
      wheel: options.wheel !== false,
      ...options
    };
    
    this.currentSection = 0;
    this.isScrolling = false;
    this.indicator = null;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    // Check for mobile
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    
    if (this.config.indicators) {
      this.createIndicators();
    }
    
    this.bindEvents();
    this.updateActiveSection();
    this.observeSections();
  }
  
  createIndicators() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'snap-indicator';
    
    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'snap-indicator-progress';
    progress.innerHTML = '<div class="snap-indicator-progress-bar"></div>';
    this.indicator.appendChild(progress);
    
    // Dots
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'snap-indicator-dot';
      dot.dataset.index = index;
      dot.dataset.label = section.dataset.snapLabel || `Section ${index + 1}`;
      dot.addEventListener('click', () => this.scrollToSection(index));
      this.indicator.appendChild(dot);
    });
    
    document.body.appendChild(this.indicator);
  }
  
  bindEvents() {
    // Keyboard navigation
    if (this.config.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          this.nextSection();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          this.prevSection();
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.scrollToSection(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          this.scrollToSection(this.sections.length - 1);
        }
      });
    }
    
    // Scroll handling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateActiveSection();
      }, 50);
    }, { passive: true });
    
    // Touch handling for swipe
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSection();
        } else {
          this.prevSection();
        }
      }
    }, { passive: true });
  }
  
  observeSections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.3 });
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  scrollToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    this.currentSection = index;
    const section = this.sections[index];
    
    const offset = this.config.offset;
    const targetY = section.offsetTop - offset;
    
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    
    this.updateIndicators();
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
  
  updateActiveSection() {
    const scrollY = window.scrollY + window.innerHeight / 2;
    
    this.sections.forEach((section, index) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      
      if (scrollY >= top && scrollY < bottom) {
        this.currentSection = index;
      }
    });
    
    this.updateIndicators();
    this.updateProgress();
  }
  
  updateIndicators() {
    if (!this.indicator) return;
    
    const dots = this.indicator.querySelectorAll('.snap-indicator-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSection);
    });
  }
  
  updateProgress() {
    if (!this.indicator) return;
    
    const progress = (this.currentSection / (this.sections.length - 1)) * 100;
    const bar = this.indicator.querySelector('.snap-indicator-progress-bar');
    if (bar) {
      bar.style.height = `${progress}%`;
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollSnapSections = new ScrollSnapSections();
  });
} else {
  window.scrollSnapSections = new ScrollSnapSections();
}
