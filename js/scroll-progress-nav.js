/**
 * BuildBridge Fortune 500 Scroll Progress Navigation
 * Enhanced scroll tracking with section-aware navigation
 * Version: 2.0 Professional
 */

class BuildBridgeScrollProgress {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'right', // left, right, top, bottom
      showDots: options.showDots !== false,
      showProgress: options.showProgress !== false,
      showLabels: options.showLabels !== false,
      smoothScroll: options.smoothScroll !== false,
      offset: options.offset || 100,
      theme: options.theme || 'dark' // dark, light, chrome
    };

    this.sections = [];
    this.currentSection = 0;
    this.progress = 0;
    this.nav = null;
    this.progressBar = null;
    this.progressRing = null;
    this.isVisible = false;
    
    this.init();
  }

  init() {
    this.scanSections();
    this.createNavigation();
    this.bindEvents();
    this.startRAF();
  }

  scanSections() {
    // Find all sections with data-section attribute
    document.querySelectorAll('[data-section]').forEach((section, index) => {
      const label = section.dataset.navLabel || section.dataset.section || `Section ${index + 1}`;
      
      this.sections.push({
        element: section,
        id: section.id,
        label: label,
        index: index
      });
    });
  }

  createNavigation() {
    // Create container
    this.nav = document.createElement('nav');
    this.nav.className = 'buildbridge-scroll-nav';
    this.nav.setAttribute('aria-label', 'Page sections');
    
    // Position styles
    const positionStyles = this.getPositionStyles();
    
    this.nav.style.cssText = `
      position: fixed;
      ${positionStyles}
      z-index: 1000;
      display: flex;
      flex-direction: ${this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row'};
      align-items: center;
      gap: 16px;
      padding: 20px;
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: ${this.options.position === 'right' ? 'translateX(20px)' : 
                   this.options.position === 'left' ? 'translateX(-20px)' : 'translateY(20px)'};
    `;
    
    // Create progress ring (circular progress)
    if (this.options.showProgress && (this.options.position === 'left' || this.options.position === 'right')) {
      this.createCircularProgress();
    }
    
    // Create section dots
    if (this.options.showDots) {
      this.createSectionDots();
    }
    
    // Create linear progress bar
    if (this.options.showProgress && (this.options.position === 'top' || this.options.position === 'bottom')) {
      this.createLinearProgress();
    }
    
    document.body.appendChild(this.nav);
    
    // Show after delay
    setTimeout(() => {
      this.isVisible = true;
      this.nav.style.opacity = '1';
      this.nav.style.transform = 'translate(0, 0)';
    }, 1000);
  }

  getPositionStyles() {
    switch (this.options.position) {
      case 'left':
        return 'left: 30px; top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'right: 30px; top: 50%; transform: translateY(-50%);';
      case 'top':
        return 'top: 100px; left: 50%; transform: translateX(-50%);';
      case 'bottom':
        return 'bottom: 30px; left: 50%; transform: translateX(-50%);';
      default:
        return 'right: 30px; top: 50%; transform: translateY(-50%);';
    }
  }

  createCircularProgress() {
    const size = 60;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      transform: rotate(-90deg);
    `;
    
    // Background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', size / 2);
    bgCircle.setAttribute('cy', size / 2);
    bgCircle.setAttribute('r', radius);
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', 'rgba(201, 206, 214, 0.1)');
    bgCircle.setAttribute('stroke-width', strokeWidth);
    
    // Progress circle
    this.progressRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.progressRing.setAttribute('cx', size / 2);
    this.progressRing.setAttribute('cy', size / 2);
    this.progressRing.setAttribute('r', radius);
    this.progressRing.setAttribute('fill', 'none');
    this.progressRing.setAttribute('stroke', '#c9ced6');
    this.progressRing.setAttribute('stroke-width', strokeWidth);
    this.progressRing.setAttribute('stroke-linecap', 'round');
    this.progressRing.setAttribute('stroke-dasharray', circumference);
    this.progressRing.setAttribute('stroke-dashoffset', circumference);
    
    // Current section number
    const text = document.createElement('div');
    text.className = 'scroll-nav-counter';
    text.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #c9ced6;
    `;
    text.textContent = '01';
    this.counterEl = text;
    
    const container = document.createElement('div');
    container.style.cssText = 'position: relative;';
    container.appendChild(svg);
    container.appendChild(text);
    
    svg.appendChild(bgCircle);
    svg.appendChild(this.progressRing);
    
    // Store circumference for animations
    this.ringCircumference = circumference;
    
    this.nav.appendChild(container);
  }

  createLinearProgress() {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 200px;
      height: 3px;
      background: rgba(201, 206, 214, 0.1);
      border-radius: 2px;
      overflow: hidden;
    `;
    
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #c9ced6, #ffffff);
      transition: width 0.1s ease;
      border-radius: 2px;
    `;
    
    container.appendChild(this.progressBar);
    this.nav.appendChild(container);
  }

  createSectionDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.style.cssText = `
      display: flex;
      flex-direction: ${this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row'};
      gap: 12px;
      align-items: center;
    `;
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'scroll-nav-dot';
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(201, 206, 214, 0.3);
        background: transparent;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        padding: 0;
      `;
      
      // Label tooltip
      const label = document.createElement('span');
      label.textContent = section.label;
      label.style.cssText = `
        position: absolute;
        ${this.options.position === 'right' ? 'right: 24px' : 'left: 24px'};
        top: 50%;
        transform: translateY(-50%) ${this.options.position === 'right' ? 'translateX(10px)' : 'translateX(-10px)'};
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #c9ced6;
        white-space: nowrap;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        font-family: 'Montserrat', sans-serif;
      `;
      
      dot.appendChild(label);
      
      // Hover effects
      dot.addEventListener('mouseenter', () => {
        label.style.opacity = '1';
        label.style.transform = `translateY(-50%) ${this.options.position === 'right' ? 'translateX(0)' : 'translateX(0)'}`;
        dot.style.borderColor = '#c9ced6';
        dot.style.transform = 'scale(1.2)';
      });
      
      dot.addEventListener('mouseleave', () => {
        label.style.opacity = '0';
        label.style.transform = `translateY(-50%) ${this.options.position === 'right' ? 'translateX(10px)' : 'translateX(-10px)'}`;
        if (index !== this.currentSection) {
          dot.style.borderColor = 'rgba(201, 206, 214, 0.3)';
          dot.style.transform = 'scale(1)';
        }
      });
      
      // Click to navigate
      dot.addEventListener('click', () => {
        this.scrollToSection(index);
      });
      
      dotsContainer.appendChild(dot);
      section.dot = dot;
    });
    
    this.nav.appendChild(dotsContainer);
  }

  bindEvents() {
    // Scroll event
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        this.scrollToSection(this.currentSection + 1);
      } else if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        this.scrollToSection(this.currentSection - 1);
      }
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.updateSectionPositions();
    });
  }

  onScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.body.scrollHeight - windowHeight;
    
    // Calculate overall progress
    this.progress = scrollY / docHeight;
    
    // Find current section
    let activeSection = 0;
    const scrollProgress = scrollY + windowHeight / 2;
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      
      if (scrollProgress >= sectionTop) {
        activeSection = i;
        break;
      }
    }
    
    if (activeSection !== this.currentSection) {
      this.setActiveSection(activeSection);
    }
  }

  setActiveSection(index) {
    const prevIndex = this.currentSection;
    this.currentSection = Math.max(0, Math.min(this.sections.length - 1, index));
    
    // Update dots
    this.sections.forEach((section, i) => {
      if (section.dot) {
        const isActive = i === this.currentSection;
        section.dot.style.background = isActive ? '#c9ced6' : 'transparent';
        section.dot.style.borderColor = isActive ? '#c9ced6' : 'rgba(201, 206, 214, 0.3)';
        section.dot.style.transform = isActive ? 'scale(1.3)' : 'scale(1)';
        section.dot.classList.toggle('active', isActive);
      }
    });
    
    // Update counter
    if (this.counterEl) {
      this.counterEl.textContent = String(this.currentSection + 1).padStart(2, '0');
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('sectionchange', {
      detail: {
        section: this.currentSection,
        sectionId: this.sections[this.currentSection]?.id,
        sectionName: this.sections[this.currentSection]?.label,
        previousSection: prevIndex
      }
    }));
  }

  scrollToSection(index) {
    index = Math.max(0, Math.min(this.sections.length - 1, index));
    const section = this.sections[index];
    
    if (section && section.element) {
      const offset = this.options.offset;
      const targetPos = section.element.getBoundingClientRect().top + window.scrollY - offset;
      
      if (this.options.smoothScroll && window.buildbridgeScroll) {
        window.buildbridgeScroll.scrollTo(targetPos, { duration: 1000 });
      } else {
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    }
  }

  startRAF() {
    this.animate();
  }

  animate() {
    // Update circular progress
    if (this.progressRing && this.ringCircumference) {
      const offset = this.ringCircumference - (this.progress * this.ringCircumference);
      this.progressRing.setAttribute('stroke-dashoffset', offset);
    }
    
    // Update linear progress
    if (this.progressBar) {
      this.progressBar.style.width = `${this.progress * 100}%`;
    }
    
    requestAnimationFrame(this.animate.bind(this));
  }

  updateSectionPositions() {
    // Recalculate section positions after resize
    this.onScroll();
  }

  // Public API
  getCurrentSection() {
    return {
      index: this.currentSection,
      ...this.sections[this.currentSection]
    };
  }

  getProgress() {
    return this.progress;
  }

  goToSection(index) {
    this.scrollToSection(index);
  }

  nextSection() {
    this.scrollToSection(this.currentSection + 1);
  }

  prevSection() {
    this.scrollToSection(this.currentSection - 1);
  }

  show() {
    this.nav.style.opacity = '1';
    this.nav.style.pointerEvents = 'auto';
  }

  hide() {
    this.nav.style.opacity = '0';
    this.nav.style.pointerEvents = 'none';
  }

  destroy() {
    if (this.nav) {
      this.nav.remove();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.buildbridgeScrollProgress = new BuildBridgeScrollProgress({
    position: 'right',
    showDots: true,
    showProgress: true,
    showLabels: true,
    offset: 100
  });
  
  console.log('📊 BuildBridge Scroll Progress initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildBridgeScrollProgress;
}
