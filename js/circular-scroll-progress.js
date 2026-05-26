/**
 * BuildBridge Circular Scroll Progress
 * Fortune 500 Quality - Circular progress indicator that shows scroll position
 * Features: Smooth animation, percentage display, scroll-to-top on click
 */

class CircularScrollProgress {
  constructor(options = {}) {
    this.size = options.size || 60;
    this.strokeWidth = options.strokeWidth || 4;
    this.color = options.color || '#C9CED6';
    this.bgColor = options.bgColor || 'rgba(201, 206, 214, 0.1)';
    this.showPercentage = options.showPercentage !== false;
    this.clickToTop = options.clickToTop !== false;
    this.position = options.position || 'bottom-right'; // bottom-right, bottom-left, top-right, top-left
    
    this.container = null;
    this.circle = null;
    this.progress = 0;
    this.circumference = 0;
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.calculateCircumference();
    this.bindEvents();
    this.setPosition();
  }
  
  createElement() {
    this.container = document.createElement('div');
    this.container.className = 'circular-scroll-progress';
    this.container.style.cssText = `
      position: fixed;
      width: ${this.size}px;
      height: ${this.size}px;
      z-index: 9999;
      cursor: ${this.clickToTop ? 'pointer' : 'default'};
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: ${this.clickToTop ? 'auto' : 'none'};
    `;
    
    const radius = (this.size - this.strokeWidth) / 2;
    this.circumference = 2 * Math.PI * radius;
    
    this.container.innerHTML = `
      <svg width="${this.size}" height="${this.size}" viewBox="0 0 ${this.size} ${this.size}">
        <!-- Background circle -->
        <circle
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          fill="none"
          stroke="${this.bgColor}"
          stroke-width="${this.strokeWidth}"
        />
        <!-- Progress circle -->
        <circle
          class="circular-progress-ring"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          fill="none"
          stroke="${this.color}"
          stroke-width="${this.strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${this.circumference}"
          stroke-dashoffset="${this.circumference}"
          transform="rotate(-90 ${this.size / 2} ${this.size / 2})"
          style="transition: stroke-dashoffset 0.1s ease-out;"
        />
      </svg>
      ${this.showPercentage ? `
        <span class="circular-progress-text" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: ${this.size * 0.25}px;
          font-weight: 600;
          color: ${this.color};
          font-family: 'Montserrat', sans-serif;
        ">0%</span>
      ` : ''}
    `;
    
    this.circle = this.container.querySelector('.circular-progress-ring');
    this.text = this.container.querySelector('.circular-progress-text');
    
    document.body.appendChild(this.container);
  }
  
  calculateCircumference() {
    const radius = (this.size - this.strokeWidth) / 2;
    this.circumference = 2 * Math.PI * radius;
  }
  
  setPosition() {
    const offset = 30;
    switch (this.position) {
      case 'bottom-right':
        this.container.style.right = `${offset}px`;
        this.container.style.bottom = `${offset}px`;
        break;
      case 'bottom-left':
        this.container.style.left = `${offset}px`;
        this.container.style.bottom = `${offset}px`;
        break;
      case 'top-right':
        this.container.style.right = `${offset}px`;
        this.container.style.top = `${offset}px`;
        break;
      case 'top-left':
        this.container.style.left = `${offset}px`;
        this.container.style.top = `${offset}px`;
        break;
    }
  }
  
  bindEvents() {
    // Scroll event
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
    
    // Click to scroll to top
    if (this.clickToTop) {
      this.container.addEventListener('click', () => {
        this.scrollToTop();
      });
      
      // Hover effect
      this.container.addEventListener('mouseenter', () => {
        this.container.style.transform = 'scale(1.1)';
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.container.style.transform = 'scale(1)';
      });
    }
    
    // Initial update
    this.updateProgress();
  }
  
  updateProgress() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    this.progress = docHeight > 0 ? scrollTop / docHeight : 0;
    
    const offset = this.circumference - (this.progress * this.circumference);
    this.circle.style.strokeDashoffset = offset;
    
    if (this.text) {
      this.text.textContent = `${Math.round(this.progress * 100)}%`;
    }
    
    // Show/hide based on scroll position
    if (this.progress > 0.05) {
      this.container.style.opacity = '1';
      this.container.style.transform = 'scale(1)';
      this.container.style.pointerEvents = 'auto';
    } else {
      this.container.style.opacity = '0';
      this.container.style.transform = 'scale(0.8)';
      this.container.style.pointerEvents = 'none';
    }
  }
  
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Add click animation
    this.container.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.container.style.transform = 'scale(1)';
    }, 150);
  }
  
  setColor(color) {
    this.color = color;
    this.circle.style.stroke = color;
    if (this.text) {
      this.text.style.color = color;
    }
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only init on non-touch devices or if explicitly enabled
  if (!window.matchMedia('(pointer: coarse)').matches) {
    window.circularProgress = new CircularScrollProgress({
      size: 60,
      strokeWidth: 4,
      color: '#C9CED6',
      position: 'bottom-right'
    });
  }
});

// Export
window.CircularScrollProgress = CircularScrollProgress;
