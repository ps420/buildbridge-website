// BuildBridge - Animated Number Lines & Progress Lines
// Fortune 500-style animated data visualization lines
// Version 5.0 Professional Enhancement

class AnimatedLine {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      direction: options.direction || 'horizontal', // 'horizontal' or 'vertical'
      color: options.color || 'var(--chrome)',
      glowColor: options.glowColor || 'rgba(201, 206, 214, 0.5)',
      duration: options.duration || 1500,
      trigger: options.trigger || 'scroll',
      easing: options.easing || 'ease-out',
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.createLine();
    this.setupTrigger();
  }
  
  createLine() {
    this.element.classList.add('animated-line-container');
    
    // Create line element
    this.line = document.createElement('div');
    this.line.className = `animated-line animated-line-${this.options.direction}`;
    this.line.style.cssText = `
      position: absolute;
      background: ${this.options.color};
      transition: transform ${this.options.duration}ms ${this.options.easing};
    `;
    
    if (this.options.direction === 'horizontal') {
      this.line.style.cssText += `
        height: 2px;
        left: 0;
        top: 50%;
        transform: translateY(-50%) scaleX(0);
        transform-origin: left;
        width: 100%;
      `;
    } else {
      this.line.style.cssText += `
        width: 2px;
        top: 0;
        left: 50%;
        transform: translateX(-50%) scaleY(0);
        transform-origin: top;
        height: 100%;
      `;
    }
    
    // Add glow effect
    if (this.options.glowColor) {
      this.line.style.boxShadow = `0 0 20px ${this.options.glowColor}, 0 0 40px ${this.options.glowColor}`;
    }
    
    this.element.appendChild(this.line);
  }
  
  setupTrigger() {
    if (this.options.trigger === 'scroll') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      this.observer.observe(this.element);
    } else if (this.options.trigger === 'load') {
      setTimeout(() => this.animate(), 100);
    }
  }
  
  animate() {
    if (this.options.direction === 'horizontal') {
      this.line.style.transform = 'translateY(-50%) scaleX(1)';
    } else {
      this.line.style.transform = 'translateX(-50%) scaleY(1)';
    }
  }
}

// Progress Line that fills based on scroll or value
class ProgressLine {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      direction: options.direction || 'horizontal',
      color: options.color || 'var(--chrome)',
      trackColor: options.trackColor || 'rgba(201, 206, 214, 0.1)',
      height: options.height || 4,
      fillMode: options.fillMode || 'scroll', // 'scroll', 'value', 'manual'
      targetValue: options.targetValue || 100,
      duration: options.duration || 2000,
      showPercentage: options.showPercentage || false,
      animated: options.animated !== false,
      ...options
    };
    
    this.currentValue = 0;
    this.targetValue = 0;
    
    this.init();
  }
  
  init() {
    this.createStructure();
    
    if (this.options.fillMode === 'scroll') {
      this.bindScroll();
    } else if (this.options.fillMode === 'value') {
      this.setValue(0);
      this.observeForAnimation();
    }
  }
  
  createStructure() {
    this.element.classList.add('progress-line-container');
    this.element.style.cssText = `
      position: relative;
      background: ${this.options.trackColor};
      border-radius: ${this.options.height / 2}px;
      overflow: hidden;
    `;
    
    if (this.options.direction === 'horizontal') {
      this.element.style.height = this.options.height + 'px';
    } else {
      this.element.style.width = this.options.height + 'px';
      this.element.style.height = '100%';
    }
    
    // Create fill element
    this.fill = document.createElement('div');
    this.fill.className = 'progress-line-fill';
    this.fill.style.cssText = `
      position: absolute;
      background: linear-gradient(90deg, ${this.options.color}, var(--white));
      transition: ${this.options.animated ? 'all 0.3s ease' : 'none'};
      border-radius: ${this.options.height / 2}px;
    `;
    
    if (this.options.direction === 'horizontal') {
      this.fill.style.cssText += `
        height: 100%;
        left: 0;
        top: 0;
        width: 0%;
      `;
    } else {
      this.fill.style.cssText += `
        width: 100%;
        bottom: 0;
        left: 0;
        height: 0%;
      `;
    }
    
    this.element.appendChild(this.fill);
    
    // Add percentage label if requested
    if (this.options.showPercentage) {
      this.label = document.createElement('span');
      this.label.className = 'progress-line-label';
      this.label.textContent = '0%';
      this.element.appendChild(this.label);
    }
  }
  
  observeForAnimation() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateToValue(this.options.targetValue);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    this.observer.observe(this.element);
  }
  
  bindScroll() {
    const updateProgress = () => {
      const rect = this.element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the element's parent section has been scrolled
      const parent = this.element.closest('section') || this.element.parentElement;
      if (!parent) return;
      
      const parentRect = parent.getBoundingClientRect();
      const parentHeight = parentRect.height;
      const scrollProgress = (windowHeight - parentRect.top) / (windowHeight + parentHeight);
      
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      this.setValue(clampedProgress * 100);
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
  
  setValue(percentage) {
    this.currentValue = percentage;
    
    if (this.options.direction === 'horizontal') {
      this.fill.style.width = percentage + '%';
    } else {
      this.fill.style.height = percentage + '%';
    }
    
    if (this.label) {
      this.label.textContent = Math.round(percentage) + '%';
    }
  }
  
  animateToValue(targetValue) {
    const startValue = this.currentValue;
    const startTime = performance.now();
    const duration = this.options.duration;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeProgress;
      
      this.setValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}

// Stats line - Animated line connecting stats
class StatsLine {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.stats = [];
    this.lines = [];
    
    this.init();
  }
  
  init() {
    this.findStats();
    this.createConnectingLines();
    this.animateLines();
  }
  
  findStats() {
    this.stats = Array.from(this.container.querySelectorAll('.stat-item'));
  }
  
  createConnectingLines() {
    // Create SVG overlay
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.classList.add('stats-connecting-lines');
    this.svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    
    this.container.style.position = 'relative';
    this.container.appendChild(this.svg);
    
    // Create lines between stats
    for (let i = 0; i < this.stats.length - 1; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'rgba(201, 206, 214, 0.2)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '5,5');
      line.classList.add('stats-connector');
      this.svg.appendChild(line);
      this.lines.push(line);
    }
    
    this.updateLines();
    window.addEventListener('resize', () => this.updateLines());
  }
  
  updateLines() {
    const containerRect = this.container.getBoundingClientRect();
    
    this.stats.forEach((stat, i) => {
      if (i < this.stats.length - 1) {
        const rect1 = stat.getBoundingClientRect();
        const rect2 = this.stats[i + 1].getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - containerRect.left;
        const y1 = rect1.top + rect1.height / 2 - containerRect.top;
        const x2 = rect2.left + rect2.width / 2 - containerRect.left;
        const y2 = rect2.top + rect2.height / 2 - containerRect.top;
        
        const line = this.lines[i];
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
      }
    });
  }
  
  animateLines() {
    this.lines.forEach((line, index) => {
      const length = Math.sqrt(
        Math.pow(parseFloat(line.getAttribute('x2')) - parseFloat(line.getAttribute('x1')), 2) +
        Math.pow(parseFloat(line.getAttribute('y2')) - parseFloat(line.getAttribute('y1')), 2)
      );
      
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      
      setTimeout(() => {
        line.style.transition = 'stroke-dashoffset 1s ease';
        line.style.strokeDashoffset = '0';
      }, index * 200);
    });
  }
}

// Reading progress with section markers
class ReadingProgressAdvanced {
  constructor() {
    this.container = null;
    this.sections = [];
    this.markers = [];
    this.init();
  }
  
  init() {
    this.findSections();
    this.createContainer();
    this.createMarkers();
    this.bindScroll();
  }
  
  findSections() {
    this.sections = Array.from(document.querySelectorAll('section[id]'));
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'reading-progress-advanced';
    document.body.appendChild(this.container);
  }
  
  createMarkers() {
    this.sections.forEach((section, index) => {
      const marker = document.createElement('button');
      marker.className = 'reading-progress-marker';
      marker.setAttribute('aria-label', `Go to ${section.id}`);
      
      const label = document.createElement('span');
      label.className = 'marker-label';
      label.textContent = section.querySelector('h2')?.textContent || section.id;
      marker.appendChild(label);
      
      marker.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });
      
      this.container.appendChild(marker);
      this.markers.push({ element: marker, section });
    });
  }
  
  bindScroll() {
    window.addEventListener('scroll', () => {
      this.updateMarkers();
    }, { passive: true });
    
    this.updateMarkers();
  }
  
  updateMarkers() {
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    
    this.markers.forEach(({ element, section }, index) => {
      const rect = section.getBoundingClientRect();
      const isActive = rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
      
      element.classList.toggle('active', isActive);
      element.classList.toggle('passed', rect.bottom < window.innerHeight / 2);
      
      // Position marker based on section position in document
      const sectionProgress = section.offsetTop / document.documentElement.scrollHeight;
      element.style.top = `${sectionProgress * 100}%`;
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize animated lines
  document.querySelectorAll('[data-animated-line]').forEach(el => {
    new AnimatedLine(el, {
      direction: el.dataset.lineDirection || 'horizontal',
      trigger: el.dataset.lineTrigger || 'scroll'
    });
  });
  
  // Initialize progress lines
  document.querySelectorAll('[data-progress-line]').forEach(el => {
    new ProgressLine(el, {
      fillMode: el.dataset.fillMode || 'scroll',
      targetValue: parseFloat(el.dataset.targetValue) || 100,
      showPercentage: el.dataset.showPercentage === 'true'
    });
  });
  
  // Initialize stats line if container exists
  if (document.querySelector('.stats-grid')) {
    new StatsLine('.stats-grid');
  }
  
  // Initialize advanced reading progress
  if (document.body.dataset.readingProgress === 'advanced') {
    window.readingProgressAdvanced = new ReadingProgressAdvanced();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimatedLine, ProgressLine, StatsLine, ReadingProgressAdvanced };
}
