// BuildBridge - Interactive Step Indicators
// Fortune 500-style animated process steps
// Version 5.0 Professional Enhancement

class StepIndicators {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      steps: options.steps || [],
      currentStep: options.currentStep || 0,
      orientation: options.orientation || 'horizontal', // 'horizontal', 'vertical', 'circular'
      animation: options.animation || 'slide', // 'slide', 'fade', 'scale'
      interactive: options.interactive !== false,
      ...options
    };
    
    this.steps = [];
    this.progressLine = null;
    
    this.init();
  }
  
  init() {
    this.parseSteps();
    this.createStructure();
    this.bindEvents();
    this.goToStep(this.options.currentStep);
  }
  
  parseSteps() {
    // Check for data-steps attribute
    if (this.container.dataset.steps) {
      try {
        this.options.steps = JSON.parse(this.container.dataset.steps);
      } catch (e) {
        console.warn('Invalid steps data');
      }
    }
    
    // Or find step elements
    if (this.options.steps.length === 0) {
      const stepElements = this.container.querySelectorAll('[data-step]');
      stepElements.forEach(el => {
        this.options.steps.push({
          label: el.dataset.stepLabel || el.querySelector('.step-label')?.textContent || '',
          description: el.dataset.stepDescription || '',
          icon: el.dataset.stepIcon || ''
        });
      });
    }
  }
  
  createStructure() {
    this.container.classList.add('step-indicator-container');
    this.container.classList.add(`step-indicator-${this.options.orientation}`);
    
    // Create progress line/track
    this.progressTrack = document.createElement('div');
    this.progressTrack.className = 'step-progress-track';
    this.container.appendChild(this.progressTrack);
    
    this.progressLine = document.createElement('div');
    this.progressLine.className = 'step-progress-line';
    this.progressTrack.appendChild(this.progressLine);
    
    // Create step items
    this.options.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'step-item';
      stepEl.dataset.index = index;
      
      if (this.options.interactive) {
        stepEl.tabIndex = 0;
        stepEl.setAttribute('role', 'button');
        stepEl.setAttribute('aria-label', `Step ${index + 1}: ${step.label}`);
      }
      
      // Step node
      const node = document.createElement('div');
      node.className = 'step-node';
      
      if (step.icon) {
        node.innerHTML = `<span class="step-icon">${step.icon}</span>`;
      } else {
        node.innerHTML = `<span class="step-number">${index + 1}</span>`;
      }
      
      // Checkmark for completed steps
      const checkmark = document.createElement('span');
      checkmark.className = 'step-checkmark';
      checkmark.innerHTML = '✓';
      node.appendChild(checkmark);
      
      stepEl.appendChild(node);
      
      // Step label
      if (step.label) {
        const label = document.createElement('div');
        label.className = 'step-label';
        label.textContent = step.label;
        stepEl.appendChild(label);
      }
      
      // Step description
      if (step.description) {
        const desc = document.createElement('div');
        desc.className = 'step-description';
        desc.textContent = step.description;
        stepEl.appendChild(desc);
      }
      
      this.container.appendChild(stepEl);
      this.steps.push({
        element: stepEl,
        node: node,
        data: step,
        index: index
      });
    });
  }
  
  bindEvents() {
    if (!this.options.interactive) return;
    
    this.steps.forEach((step, index) => {
      step.element.addEventListener('click', () => this.goToStep(index));
      step.element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goToStep(index);
        }
      });
    });
    
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      const currentIndex = this.getCurrentStep();
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < this.steps.length - 1) {
          this.goToStep(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          this.goToStep(currentIndex - 1);
        }
      }
    });
  }
  
  goToStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    
    this.options.currentStep = index;
    
    // Update step states
    this.steps.forEach((step, i) => {
      step.element.classList.remove('active', 'completed', 'upcoming');
      
      if (i < index) {
        step.element.classList.add('completed');
      } else if (i === index) {
        step.element.classList.add('active');
        
        // Animation based on type
        switch (this.options.animation) {
          case 'scale':
            step.node.style.animation = 'step-scale-in 0.4s ease';
            break;
          case 'fade':
            step.element.style.animation = 'step-fade-in 0.4s ease';
            break;
          case 'slide':
          default:
            step.node.style.animation = 'step-slide-in 0.4s ease';
            break;
        }
      } else {
        step.element.classList.add('upcoming');
      }
    });
    
    // Update progress line
    this.updateProgress();
    
    // Custom event
    this.container.dispatchEvent(new CustomEvent('stepchange', {
      detail: { step: index, stepData: this.steps[index].data }
    }));
  }
  
  updateProgress() {
    const progress = (this.options.currentStep / (this.steps.length - 1)) * 100;
    
    if (this.options.orientation === 'horizontal') {
      this.progressLine.style.width = `${progress}%`;
    } else if (this.options.orientation === 'vertical') {
      this.progressLine.style.height = `${progress}%`;
    } else if (this.options.orientation === 'circular') {
      const circumference = 2 * Math.PI * 45; // r=45
      const offset = circumference - (progress / 100) * circumference;
      this.progressLine.style.strokeDashoffset = offset;
    }
  }
  
  getCurrentStep() {
    return this.options.currentStep;
  }
  
  nextStep() {
    if (this.options.currentStep < this.steps.length - 1) {
      this.goToStep(this.options.currentStep + 1);
    }
  }
  
  prevStep() {
    if (this.options.currentStep > 0) {
      this.goToStep(this.options.currentStep - 1);
    }
  }
}

// Scroll-Linked Step Indicator
class ScrollLinkedSteps {
  constructor(containerSelector, sectionsSelector) {
    this.container = document.querySelector(containerSelector);
    this.sections = document.querySelectorAll(sectionsSelector);
    if (!this.container || this.sections.length === 0) return;
    
    this.currentStep = 0;
    this.init();
  }
  
  init() {
    this.createIndicators();
    this.bindScroll();
  }
  
  createIndicators() {
    this.container.innerHTML = '';
    this.container.classList.add('scroll-step-indicator');
    
    this.sections.forEach((section, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'scroll-step-item';
      indicator.setAttribute('data-index', index);
      
      const label = section.getAttribute('data-step-label') || 
                   section.querySelector('h2')?.textContent || 
                   `Step ${index + 1}`;
      
      indicator.innerHTML = `
        <span class="scroll-step-number">${index + 1}</span>
        <span class="scroll-step-label">${label}</span>
      `;
      
      indicator.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      this.container.appendChild(indicator);
    });
    
    this.indicators = this.container.querySelectorAll('.scroll-step-item');
  }
  
  bindScroll() {
    const observerOptions = {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(this.sections).indexOf(entry.target);
          this.setActiveStep(index);
        }
      });
    }, observerOptions);
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  setActiveStep(index) {
    this.indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
      indicator.classList.toggle('completed', i < index);
    });
  }
}

// Process flow animation
class ProcessFlow {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      autoPlay: options.autoPlay || false,
      interval: options.interval || 3000,
      ...options
    };
    
    this.steps = [];
    this.currentStep = 0;
    this.timer = null;
    
    this.init();
  }
  
  init() {
    this.findSteps();
    this.createConnections();
    this.animateOnScroll();
    
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }
  
  findSteps() {
    this.steps = Array.from(this.container.querySelectorAll('.process-step, [data-process-step]'));
    
    this.steps.forEach((step, index) => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(30px)';
      step.dataset.index = index;
    });
  }
  
  createConnections() {
    // Create SVG connections between steps
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('process-connections');
    svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    
    this.container.style.position = 'relative';
    this.container.insertBefore(svg, this.container.firstChild);
    
    // Draw connections
    this.drawConnections = () => {
      svg.innerHTML = '';
      
      for (let i = 0; i < this.steps.length - 1; i++) {
        const rect1 = this.steps[i].getBoundingClientRect();
        const rect2 = this.steps[i + 1].getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - containerRect.left;
        const y1 = rect1.bottom - containerRect.top;
        const x2 = rect2.left + rect2.width / 2 - containerRect.left;
        const y2 = rect2.top - containerRect.top;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${x1} ${(y1 + y2) / 2} ${(x1 + x2) / 2} ${(y1 + y2) / 2} T ${x2} ${y2}`);
        path.setAttribute('stroke', 'rgba(201, 206, 214, 0.2)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '5, 5');
        path.classList.add('process-connection');
        
        svg.appendChild(path);
      }
    };
    
    window.addEventListener('resize', this.drawConnections);
    setTimeout(this.drawConnections, 100);
  }
  
  animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const step = entry.target;
          const index = parseInt(step.dataset.index);
          
          setTimeout(() => {
            step.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
            step.classList.add('process-step-active');
          }, index * 200);
          
          observer.unobserve(step);
        }
      });
    }, { threshold: 0.3 });
    
    this.steps.forEach(step => observer.observe(step));
  }
  
  startAutoPlay() {
    this.timer = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.highlightStep(this.currentStep);
    }, this.options.interval);
  }
  
  highlightStep(index) {
    this.steps.forEach((step, i) => {
      step.classList.toggle('process-step-highlight', i === index);
    });
  }
  
  stopAutoPlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize step indicators
  document.querySelectorAll('[data-step-indicator]').forEach(el => {
    new StepIndicators(el, {
      orientation: el.dataset.orientation || 'horizontal',
      animation: el.dataset.animation || 'slide'
    });
  });
  
  // Initialize scroll-linked steps
  if (document.querySelector('.scroll-step-indicator') && document.querySelectorAll('.process-section').length) {
    new ScrollLinkedSteps('.scroll-step-indicator', '.process-section');
  }
  
  // Initialize process flow
  document.querySelectorAll('[data-process-flow]').forEach(el => {
    new ProcessFlow(el, {
      autoPlay: el.dataset.autoPlay === 'true'
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StepIndicators, ScrollLinkedSteps, ProcessFlow };
}
