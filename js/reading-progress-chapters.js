/**
 * Reading Progress with Chapter Markers - v108.0
 * Fortune 500 Professional Reading Experience
 */

class ReadingProgressChapters {
  constructor(options = {}) {
    this.options = {
      selector: '[data-section]',
      offset: 100,
      showAfterScroll: 300,
      mobileBreakpoint: 768,
      ...options
    };
    
    this.sections = [];
    this.currentSection = 0;
    this.isVisible = false;
    this.scrollProgress = 0;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createMarkers();
    this.bindEvents();
    this.updateProgress();
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
  
  createMarkers() {
    // Check if mobile
    const isMobile = window.innerWidth <= this.options.mobileBreakpoint;
    
    if (isMobile) {
      this.createMobileProgress();
    } else {
      this.createDesktopMarkers();
    }
    
    this.createSectionCounter();
  }
  
  createDesktopMarkers() {
    // Remove existing
    const existing = document.querySelector('.reading-progress-chapters');
    if (existing) existing.remove();
    
    // Create container
    const container = document.createElement('div');
    container.className = 'reading-progress-chapters';
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Reading progress');
    
    // Create progress line
    const progressLine = document.createElement('div');
    progressLine.className = 'chapter-progress-line';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'chapter-progress-fill';
    progressLine.appendChild(progressFill);
    container.appendChild(progressLine);
    
    // Create chapter markers
    this.sections.forEach((section, index) => {
      const marker = document.createElement('button');
      marker.className = 'chapter-marker';
      marker.setAttribute('data-index', index);
      marker.setAttribute('data-label', section.label);
      marker.setAttribute('aria-label', `Go to ${section.label}`);
      marker.setAttribute('tabindex', '0');
      
      marker.addEventListener('click', () => this.goToSection(index));
      marker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goToSection(index);
        }
      });
      
      container.appendChild(marker);
    });
    
    document.body.appendChild(container);
    this.container = container;
    this.progressFill = progressFill;
  }
  
  createMobileProgress() {
    // Remove existing mobile elements
    const existing = document.querySelector('.mobile-reading-progress');
    if (existing) existing.remove();
    
    // Create mobile progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'mobile-reading-progress';
    progressBar.innerHTML = '<div class="mobile-reading-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    this.mobileProgressBar = progressBar.querySelector('.mobile-reading-progress-bar');
    
    // Create mobile chapter labels
    const labels = document.createElement('div');
    labels.className = 'mobile-chapter-labels';
    labels.innerHTML = `
      <span class="chapter-number">1</span>
      <span class="chapter-name">Loading...</span>
    `;
    document.body.appendChild(labels);
    
    this.mobileLabels = labels;
    this.mobileChapterNumber = labels.querySelector('.chapter-number');
    this.mobileChapterName = labels.querySelector('.chapter-name');
  }
  
  createSectionCounter() {
    const existing = document.querySelector('.reading-section-counter');
    if (existing) existing.remove();
    
    const counter = document.createElement('div');
    counter.className = 'reading-section-counter';
    counter.innerHTML = `
      <span class="current">1</span>
      <span class="separator">/</span>
      <span class="total">${this.sections.length}</span>
    `;
    
    document.body.appendChild(counter);
    this.sectionCounter = counter;
    this.currentCounter = counter.querySelector('.current');
  }
  
  bindEvents() {
    // Scroll events with throttling
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
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.goToNextSection();
      } else if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        this.goToPreviousSection();
      }
    });
  }
  
  updateProgress() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
    
    // Toggle visibility
    if (scrollY > this.options.showAfterScroll) {
      this.showElements();
    } else {
      this.hideElements();
    }
    
    // Find current section
    this.currentSection = this.findCurrentSection(scrollY);
    
    // Update markers
    this.updateMarkers();
    
    // Update progress fill
    this.updateProgressFill();
    
    // Update counter
    this.updateCounter();
    
    // Update mobile
    if (window.innerWidth <= this.options.mobileBreakpoint) {
      this.updateMobileProgress();
    }
  }
  
  findCurrentSection(scrollY) {
    const scrollPosition = scrollY + this.options.offset + (window.innerHeight / 3);
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      
      if (scrollPosition >= sectionTop) {
        return i;
      }
    }
    
    return 0;
  }
  
  updateMarkers() {
    const markers = document.querySelectorAll('.chapter-marker');
    
    markers.forEach((marker, index) => {
      marker.classList.remove('completed', 'active');
      
      if (index < this.currentSection) {
        marker.classList.add('completed');
      } else if (index === this.currentSection) {
        marker.classList.add('active');
      }
    });
  }
  
  updateProgressFill() {
    if (this.progressFill) {
      // Calculate fill based on section progress
      const totalSections = this.sections.length;
      const sectionProgress = this.currentSection / (totalSections - 1);
      const pixelProgress = (this.scrollProgress / 100) * sectionProgress * 100;
      
      this.progressFill.style.height = `${Math.min(100, pixelProgress)}%`;
    }
  }
  
  updateCounter() {
    if (this.currentCounter) {
      this.currentCounter.textContent = this.currentSection + 1;
    }
  }
  
  updateMobileProgress() {
    if (this.mobileProgressBar) {
      this.mobileProgressBar.style.width = `${this.scrollProgress}%`;
    }
    
    if (this.mobileLabels && this.mobileChapterNumber && this.mobileChapterName) {
      const section = this.sections[this.currentSection];
      if (section) {
        this.mobileChapterNumber.textContent = this.currentSection + 1;
        this.mobileChapterName.textContent = section.label;
        this.mobileLabels.classList.add('visible');
        
        // Hide after delay
        clearTimeout(this.mobileLabelTimeout);
        this.mobileLabelTimeout = setTimeout(() => {
          this.mobileLabels.classList.remove('visible');
        }, 2000);
      }
    }
  }
  
  showElements() {
    if (!this.isVisible) {
      this.isVisible = true;
      if (this.container) this.container.classList.add('visible');
      if (this.sectionCounter) this.sectionCounter.classList.add('visible');
    }
  }
  
  hideElements() {
    if (this.isVisible) {
      this.isVisible = false;
      if (this.container) this.container.classList.remove('visible');
      if (this.sectionCounter) this.sectionCounter.classList.remove('visible');
    }
  }
  
  goToSection(index) {
    if (index >= 0 && index < this.sections.length) {
      const section = this.sections[index];
      const offset = this.options.offset;
      const targetPosition = section.element.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  goToNextSection() {
    if (this.currentSection < this.sections.length - 1) {
      this.goToSection(this.currentSection + 1);
    }
  }
  
  goToPreviousSection() {
    if (this.currentSection > 0) {
      this.goToSection(this.currentSection - 1);
    }
  }
  
  handleResize() {
    const isMobile = window.innerWidth <= this.options.mobileBreakpoint;
    
    // Re-create appropriate UI
    if (isMobile) {
      if (this.container) {
        this.container.remove();
        this.container = null;
      }
      this.createMobileProgress();
    } else {
      const existingMobile = document.querySelector('.mobile-reading-progress');
      if (existingMobile) existingMobile.remove();
      
      const existingLabels = document.querySelector('.mobile-chapter-labels');
      if (existingLabels) existingLabels.remove();
      
      this.createDesktopMarkers();
    }
    
    this.updateProgress();
  }
  
  // Public API
  refresh() {
    this.findSections();
    this.handleResize();
  }
  
  destroy() {
    if (this.container) this.container.remove();
    if (this.sectionCounter) this.sectionCounter.remove();
    
    const mobileProgress = document.querySelector('.mobile-reading-progress');
    if (mobileProgress) mobileProgress.remove();
    
    const mobileLabels = document.querySelector('.mobile-chapter-labels');
    if (mobileLabels) mobileLabels.remove();
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.readingProgress = new ReadingProgressChapters();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReadingProgressChapters;
}
