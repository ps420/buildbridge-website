/**
 * v92.0: Advanced Scroll Progress Rings
 * Fortune 500 Circular Progress Indicators with Section Tracking
 */

class ScrollProgressRings {
  constructor(options = {}) {
    this.options = {
      sections: options.sections || '[data-section]',
      containerClass: options.containerClass || 'scroll-progress-rings-container',
      ringSize: options.ringSize || 50,
      showLabels: options.showLabels !== false,
      showPercentages: options.showPercentages || false,
      position: options.position || 'right',
      offset: options.offset || 30,
      ...options
    };
    
    this.sections = [];
    this.rings = [];
    this.currentSection = 0;
    this.scrollProgress = 0;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createContainer();
    this.createRings();
    this.bindEvents();
    this.update();
  }
  
  findSections() {
    const sectionElements = document.querySelectorAll(this.options.sections);
    this.sections = Array.from(sectionElements).map((el, index) => ({
      element: el,
      id: el.id || `section-${index}`,
      label: el.dataset.navLabel || el.dataset.section || `Section ${index + 1}`,
      offsetTop: 0,
      height: 0
    }));
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = this.options.containerClass;
    
    // Position the container
    if (this.options.position === 'left') {
      this.container.style.left = `${this.options.offset}px`;
      this.container.style.right = 'auto';
    }
    
    document.body.appendChild(this.container);
  }
  
  createRings() {
    const radius = (this.options.ringSize - 6) / 2; // Account for stroke width
    const circumference = 2 * Math.PI * radius;
    
    this.sections.forEach((section, index) => {
      const ringItem = document.createElement('div');
      ringItem.className = 'progress-ring-item';
      ringItem.dataset.index = index;
      ringItem.dataset.section = section.id;
      
      // Create SVG ring
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('progress-ring-svg');
      svg.setAttribute('viewBox', `0 0 ${this.options.ringSize} ${this.options.ringSize}`);
      
      // Track circle (background)
      const trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      trackCircle.classList.add('track');
      trackCircle.setAttribute('cx', this.options.ringSize / 2);
      trackCircle.setAttribute('cy', this.options.ringSize / 2);
      trackCircle.setAttribute('r', radius);
      
      // Progress circle
      const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      progressCircle.classList.add('progress');
      progressCircle.setAttribute('cx', this.options.ringSize / 2);
      progressCircle.setAttribute('cy', this.options.ringSize / 2);
      progressCircle.setAttribute('r', radius);
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = circumference;
      
      svg.appendChild(trackCircle);
      svg.appendChild(progressCircle);
      
      // Label
      let labelHTML = '';
      if (this.options.showLabels) {
        labelHTML = `
          <span class="progress-ring-label">
            ${section.label}
            ${this.options.showPercentages ? '<span class="progress-ring-value">0%</span>' : ''}
          </span>
        `;
      }
      
      ringItem.innerHTML = labelHTML;
      ringItem.insertBefore(svg, ringItem.firstChild);
      
      // Click to navigate
      ringItem.addEventListener('click', () => this.navigateToSection(index));
      
      this.container.appendChild(ringItem);
      
      this.rings.push({
        element: ringItem,
        progressCircle: progressCircle,
        circumference: circumference,
        label: ringItem.querySelector('.progress-ring-value'),
        section: section
      });
    });
  }
  
  bindEvents() {
    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Recalculate on resize
    window.addEventListener('resize', () => {
      this.updateSectionMetrics();
      this.update();
    });
    
    // Initial metrics calculation
    this.updateSectionMetrics();
  }
  
  updateSectionMetrics() {
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.offsetTop = window.pageYOffset + rect.top;
      section.height = rect.height;
    });
  }
  
  update() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    
    // Update each ring
    this.rings.forEach((ring, index) => {
      const section = ring.section;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.height;
      
      // Calculate progress through this section
      let progress = 0;
      
      if (scrollTop + windowHeight > sectionTop && scrollTop < sectionTop + sectionHeight) {
        // Section is in view
        const visibleTop = Math.max(scrollTop, sectionTop);
        const visibleBottom = Math.min(scrollTop + windowHeight, sectionTop + sectionHeight);
        const visibleHeight = visibleBottom - visibleTop;
        
        progress = visibleHeight / sectionHeight;
        
        // Also calculate how far through the section we've scrolled
        const scrolledInSection = scrollTop - sectionTop + windowHeight;
        const scrollProgress = Math.max(0, Math.min(1, scrolledInSection / (sectionHeight + windowHeight)));
        
        // Use the larger of the two for visual feedback
        progress = Math.max(progress, scrollProgress);
        
        // Mark as current section
        if (scrollTop >= sectionTop - windowHeight / 2) {
          this.currentSection = index;
        }
      } else if (scrollTop > sectionTop + sectionHeight) {
        // Section is above viewport (completed)
        progress = 1;
      }
      
      // Update ring visual
      const offset = ring.circumference - (progress * ring.circumference);
      ring.progressCircle.style.strokeDashoffset = offset;
      
      // Update percentage label
      if (ring.label) {
        ring.label.textContent = `${Math.round(progress * 100)}%`;
      }
      
      // Update active states
      ring.element.classList.toggle('active', index === this.currentSection);
      ring.element.classList.toggle('completed', progress >= 1);
      ring.element.classList.toggle('current', index === this.currentSection && progress < 1);
    });
  }
  
  navigateToSection(index) {
    const section = this.sections[index];
    if (section && section.element) {
      section.element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
  
  // Static method for easy initialization
  static init(options = {}) {
    return new ScrollProgressRings(options);
  }
}

// Stats Rings component for showcasing metrics
class StatsRings {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      value: parseInt(element.dataset.statsValue) || 0,
      max: parseInt(element.dataset.statsMax) || 100,
      suffix: element.dataset.statsSuffix || '',
      prefix: element.dataset.statsPrefix || '',
      label: element.dataset.statsLabel || '',
      duration: parseInt(element.dataset.statsDuration) || 2000,
      size: parseInt(element.dataset.statsSize) || 150,
      ...options
    };
    
    this.progress = 0;
    this.animated = false;
    
    this.init();
  }
  
  init() {
    this.createRing();
    this.observe();
  }
  
  createRing() {
    const radius = (this.options.size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = (this.options.value / this.options.max) * 100;
    
    this.element.classList.add('stats-ring');
    
    // Add animated class if requested
    if (this.element.dataset.statsAnimated === 'true') {
      this.element.classList.add('animated');
    }
    
    this.element.innerHTML = `
      <svg class="stats-ring-svg" viewBox="0 0 ${this.options.size} ${this.options.size}">
        <defs>
          <linearGradient id="statsGradient-${this.options.label.replace(/\s+/g, '-')}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F5F7FA;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle class="track" cx="${this.options.size / 2}" cy="${this.options.size / 2}" r="${radius}"></circle>
        <circle class="progress" cx="${this.options.size / 2}" cy="${this.options.size / 2}" r="${radius}"></circle>
      </svg>
      <div class="stats-ring-content">
        <div class="stats-ring-value">${this.options.prefix}0${this.options.suffix}</div>
        <div class="stats-ring-label">${this.options.label}</div>
      </div>
      <div class="stats-ring-title">${this.element.dataset.statsTitle || ''}</div>
    `;
    
    this.progressCircle = this.element.querySelector('.progress');
    this.valueElement = this.element.querySelector('.stats-ring-value');
    
    // Set initial state
    this.progressCircle.style.strokeDasharray = circumference;
    this.progressCircle.style.strokeDashoffset = circumference;
    this.circumference = circumference;
    this.targetOffset = circumference - ((percentage / 100) * circumference);
  }
  
  observe() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animate();
          this.animated = true;
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(this.element);
  }
  
  animate() {
    const startTime = performance.now();
    const duration = this.options.duration;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Update ring progress
      const currentOffset = this.circumference - (easeOut * (this.circumference - this.targetOffset));
      this.progressCircle.style.strokeDashoffset = currentOffset;
      
      // Update counter
      const currentValue = Math.round(easeOut * this.options.value);
      this.valueElement.textContent = `${this.options.prefix}${currentValue}${this.options.suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  static init(selector = '[data-stats-ring]') {
    document.querySelectorAll(selector).forEach(el => new StatsRings(el));
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll progress rings if container exists
  const scrollRingsContainer = document.querySelector('[data-scroll-rings]');
  if (scrollRingsContainer || document.querySelector('[data-section]')) {
    ScrollProgressRings.init({
      showLabels: true,
      showPercentages: false
    });
  }
  
  // Initialize stats rings
  StatsRings.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollProgressRings, StatsRings };
}
