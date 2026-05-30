/**
 * v114.0: Scroll Progress Ring Cursor
 * Fortune 500 Professional Feature
 * Circular scroll progress indicator following cursor
 */

class ScrollProgressRingCursor {
  constructor(options = {}) {
    this.options = {
      size: options.size || 50,
      strokeWidth: options.strokeWidth || 3,
      showPercentage: options.showPercentage !== false,
      milestoneNotifications: options.milestoneNotifications !== false,
      ...options
    };
    
    this.element = null;
    this.progressFill = null;
    this.percentageText = null;
    this.currentProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isVisible = false;
    this.milestonesReached = new Set();
    this.rafId = null;
    this.hideTimeout = null;
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.createElement();
    this.bindEvents();
    this.startLoop();
  }
  
  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'scroll-progress-ring';
    this.element.style.width = `${this.options.size}px`;
    this.element.style.height = `${this.options.size}px`;
    
    const radius = (this.options.size - this.options.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    this.element.innerHTML = `
      <svg viewBox="0 0 ${this.options.size} ${this.options.size}">
        <circle class="progress-bg" 
                cx="${this.options.size / 2}" 
                cy="${this.options.size / 2}" 
                r="${radius}"
                stroke-width="${this.options.strokeWidth}"></circle>
        <circle class="progress-fill" 
                cx="${this.options.size / 2}" 
                cy="${this.options.size / 2}" 
                r="${radius}"
                stroke-width="${this.options.strokeWidth}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference}"></circle>
      </svg>
      ${this.options.showPercentage ? '<span class="progress-percentage">0%</span>' : ''}
    `;
    
    this.progressFill = this.element.querySelector('.progress-fill');
    this.percentageText = this.element.querySelector('.progress-percentage');
    
    document.body.appendChild(this.element);
  }
  
  bindEvents() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      if (!this.isVisible) {
        this.show();
      }
      
      // Hide after inactivity
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.hide(), 2000);
    });
    
    // Track scroll progress
    window.addEventListener('scroll', () => {
      this.updateProgress();
    }, { passive: true });
    
    // Show percentage on scroll
    window.addEventListener('scroll', () => {
      this.element?.classList.add('show-percentage');
      clearTimeout(this.showPercentageTimeout);
      this.showPercentageTimeout = setTimeout(() => {
        this.element?.classList.remove('show-percentage');
      }, 1000);
    }, { passive: true });
    
    // Initial progress calculation
    this.updateProgress();
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    this.currentProgress = Math.min(100, Math.max(0, progress));
    
    const radius = (this.options.size - this.options.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.currentProgress / 100) * circumference;
    
    if (this.progressFill) {
      this.progressFill.style.strokeDashoffset = offset;
    }
    
    if (this.percentageText) {
      this.percentageText.textContent = `${Math.round(this.currentProgress)}%`;
    }
    
    // Update color based on progress
    this.updateColorClass();
    
    // Check milestones
    this.checkMilestones();
  }
  
  updateColorClass() {
    if (!this.element) return;
    
    this.element.classList.remove(
      'progress-0-25', 'progress-25-50', 
      'progress-50-75', 'progress-75-100'
    );
    
    if (this.currentProgress < 25) {
      this.element.classList.add('progress-0-25');
    } else if (this.currentProgress < 50) {
      this.element.classList.add('progress-25-50');
    } else if (this.currentProgress < 75) {
      this.element.classList.add('progress-50-75');
    } else {
      this.element.classList.add('progress-75-100');
    }
  }
  
  checkMilestones() {
    if (!this.options.milestoneNotifications) return;
    
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (this.currentProgress >= milestone && !this.milestonesReached.has(milestone)) {
        this.milestonesReached.add(milestone);
        this.triggerMilestoneAnimation(milestone);
      }
    });
  }
  
  triggerMilestoneAnimation(milestone) {
    if (!this.element) return;
    
    this.element.classList.add(`milestone-${milestone}`);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('scrollMilestone', {
      detail: { milestone, progress: this.currentProgress }
    }));
    
    setTimeout(() => {
      this.element?.classList.remove(`milestone-${milestone}`);
    }, 600);
  }
  
  startLoop() {
    const animate = () => {
      if (this.element) {
        this.element.style.left = `${this.mouseX}px`;
        this.element.style.top = `${this.mouseY}px`;
      }
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  show() {
    this.isVisible = true;
    this.element?.classList.add('visible');
  }
  
  hide() {
    this.isVisible = false;
    this.element?.classList.remove('visible');
  }
  
  destroy() {
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.hideTimeout);
    clearTimeout(this.showPercentageTimeout);
    this.element?.remove();
  }
  
  // Reset milestones (useful for SPAs)
  resetMilestones() {
    this.milestonesReached.clear();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollProgressRing = new ScrollProgressRingCursor();
  });
} else {
  window.scrollProgressRing = new ScrollProgressRingCursor();
}
