/**
 * Smart Page Tour System - v90.0
 * Fortune 500 Quality Interactive Onboarding
 * guides first-time visitors through key features
 */

class SmartPageTour {
  constructor(options = {}) {
    this.options = {
      autoStart: true,
      showWelcome: true,
      storageKey: 'buildbridge_tour_completed',
      ...options
    };
    
    this.currentStep = 0;
    this.steps = [];
    this.isActive = false;
    this.elements = {};
    
    // Default tour steps for BuildBridge
    this.defaultSteps = [
      {
        target: '.hero',
        title: 'Welcome to BuildBridge',
        content: 'Your trusted partner in construction management. We connect clients with qualified contractors and manage projects from start to finish.',
        position: 'bottom',
        icon: '🏗️'
      },
      {
        target: '.nav-links',
        title: 'Easy Navigation',
        content: 'Access our services, projects, and team information. Everything you need is just a click away.',
        position: 'bottom',
        icon: '🧭'
      },
      {
        target: '#services',
        title: 'Our Services',
        content: 'From <span class="tour-highlight">project consultation</span> to contractor matching and full project management — we\'ve got you covered.',
        position: 'top',
        icon: '📋'
      },
      {
        target: '#stats',
        title: 'Proven Track Record',
        content: 'With <span class="tour-highlight">150+ projects delivered</span> and R50M+ in value managed, our numbers speak for themselves.',
        position: 'top',
        icon: '📊'
      },
      {
        target: '#projects',
        title: 'Featured Projects',
        content: 'Explore our portfolio of residential, commercial, and industrial construction projects across South Africa.',
        position: 'top',
        icon: '🏢'
      },
      {
        target: '.quote-btn',
        title: 'Get Started Today',
        content: 'Ready to build? Click here to chat with us on WhatsApp and get your free consultation started!',
        position: 'left',
        icon: '💬'
      }
    ];
    
    this.init();
  }
  
  init() {
    // Check if tour was already completed
    if (this.hasCompletedTour() && this.options.autoStart) {
      this.createLaunchButton();
      return;
    }
    
    // Build tour steps
    this.steps = this.options.steps || this.defaultSteps;
    
    // Create DOM elements
    this.createElements();
    
    // Bind events
    this.bindEvents();
    
    // Auto-start if enabled
    if (this.options.autoStart && this.options.showWelcome) {
      setTimeout(() => this.showWelcomeModal(), 1000);
    }
  }
  
  hasCompletedTour() {
    try {
      return localStorage.getItem(this.options.storageKey) === 'true';
    } catch (e) {
      return false;
    }
  }
  
  markTourCompleted() {
    try {
      localStorage.setItem(this.options.storageKey, 'true');
      localStorage.setItem(`${this.options.storageKey}_date`, new Date().toISOString());
    } catch (e) {
      // Silently fail
    }
  }
  
  resetTour() {
    try {
      localStorage.removeItem(this.options.storageKey);
      localStorage.removeItem(`${this.options.storageKey}_date`);
    } catch (e) {
      // Silently fail
    }
    this.currentStep = 0;
  }
  
  createElements() {
    // Overlay
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'tour-overlay';
    document.body.appendChild(this.elements.overlay);
    
    // Spotlight
    this.elements.spotlight = document.createElement('div');
    this.elements.spotlight.className = 'tour-spotlight';
    document.body.appendChild(this.elements.spotlight);
    
    // Tooltip
    this.elements.tooltip = document.createElement('div');
    this.elements.tooltip.className = 'tour-tooltip';
    this.elements.tooltip.innerHTML = `
      <button class="tour-skip" aria-label="Skip tour">
        <span>Skip</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="tour-step-badge">
        <span class="tour-icon">🏗️</span>
        <span class="tour-step-text">Step <span class="current">1</span> of <span class="total">6</span></span>
      </div>
      <div class="tour-progress"></div>
      <h3 class="tour-title"></h3>
      <p class="tour-content"></p>
      <div class="tour-nav">
        <button class="tour-btn tour-btn-secondary tour-prev">← Back</button>
        <button class="tour-btn tour-btn-primary tour-next">Next →</button>
      </div>
    `;
    document.body.appendChild(this.elements.tooltip);
    
    // Cache references
    this.elements.title = this.elements.tooltip.querySelector('.tour-title');
    this.elements.content = this.elements.tooltip.querySelector('.tour-content');
    this.elements.currentStepEl = this.elements.tooltip.querySelector('.current');
    this.elements.totalStepsEl = this.elements.tooltip.querySelector('.total');
    this.elements.stepIcon = this.elements.tooltip.querySelector('.tour-icon');
    this.elements.progress = this.elements.tooltip.querySelector('.tour-progress');
    this.elements.prevBtn = this.elements.tooltip.querySelector('.tour-prev');
    this.elements.nextBtn = this.elements.tooltip.querySelector('.tour-next');
    this.elements.skipBtn = this.elements.tooltip.querySelector('.tour-skip');
    
    // Create progress dots
    this.updateProgressDots();
  }
  
  createLaunchButton() {
    const btn = document.createElement('button');
    btn.className = 'tour-launch-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <span class="tour-launch-tooltip">Take a tour</span>
    `;
    btn.setAttribute('aria-label', 'Start page tour');
    btn.addEventListener('click', () => {
      this.resetTour();
      this.createElements();
      this.bindEvents();
      this.start();
    });
    document.body.appendChild(btn);
  }
  
  createWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'tour-welcome-modal';
    modal.innerHTML = `
      <div class="tour-welcome-backdrop"></div>
      <div class="tour-welcome-content">
        <div class="tour-welcome-icon">👋</div>
        <h2>Welcome to BuildBridge</h2>
        <p>Let us show you around! This quick tour will help you discover how we can help bring your construction project to life.</p>
        <div class="tour-welcome-features">
          <div class="tour-welcome-feature">
            <div class="tour-welcome-feature-icon">⚡</div>
            <div class="tour-welcome-feature-text">2 Minute Tour</div>
          </div>
          <div class="tour-welcome-feature">
            <div class="tour-welcome-feature-icon">🎯</div>
            <div class="tour-welcome-feature-text">Key Features</div>
          </div>
          <div class="tour-welcome-feature">
            <div class="tour-welcome-feature-icon">💡</div>
            <div class="tour-welcome-feature-text">Pro Tips</div>
          </div>
        </div>
        <div class="tour-welcome-actions">
          <button class="tour-welcome-btn tour-welcome-btn-secondary tour-decline">Maybe Later</button>
          <button class="tour-welcome-btn tour-welcome-btn-primary tour-accept">Start Tour 🚀</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }
  
  showWelcomeModal() {
    this.elements.welcomeModal = this.createWelcomeModal();
    
    // Force reflow
    this.elements.welcomeModal.offsetHeight;
    
    requestAnimationFrame(() => {
      this.elements.welcomeModal.classList.add('active');
    });
    
    // Bind buttons
    this.elements.welcomeModal.querySelector('.tour-accept').addEventListener('click', () => {
      this.hideWelcomeModal();
      setTimeout(() => this.start(), 400);
    });
    
    this.elements.welcomeModal.querySelector('.tour-decline').addEventListener('click', () => {
      this.hideWelcomeModal();
      this.markTourCompleted();
      this.createLaunchButton();
    });
    
    this.elements.welcomeModal.querySelector('.tour-welcome-backdrop').addEventListener('click', () => {
      this.hideWelcomeModal();
      this.createLaunchButton();
    });
  }
  
  hideWelcomeModal() {
    if (this.elements.welcomeModal) {
      this.elements.welcomeModal.classList.remove('active');
      setTimeout(() => {
        this.elements.welcomeModal.remove();
        this.elements.welcomeModal = null;
      }, 500);
    }
  }
  
  updateProgressDots() {
    this.elements.progress.innerHTML = this.steps.map((_, i) => 
      `<div class="tour-progress-dot ${i === 0 ? 'active' : ''}"></div>`
    ).join('');
  }
  
  bindEvents() {
    this.elements.nextBtn.addEventListener('click', () => this.next());
    this.elements.prevBtn.addEventListener('click', () => this.prev());
    this.elements.skipBtn.addEventListener('click', () => this.end());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      
      switch(e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.prev();
          break;
        case 'Escape':
          e.preventDefault();
          this.end();
          break;
      }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (!this.isActive) return;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.positionSpotlight();
        this.positionTooltip();
      }, 100);
    });
    
    // Handle scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isActive) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.positionSpotlight();
        this.positionTooltip();
      }, 50);
    }, { passive: true });
  }
  
  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.elements.overlay.classList.add('active');
    this.showStep(0);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('tour:start', { 
      detail: { totalSteps: this.steps.length } 
    }));
  }
  
  showStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    
    this.currentStep = index;
    const step = this.steps[index];
    
    // Update content
    this.elements.title.textContent = step.title;
    this.elements.content.innerHTML = step.content;
    this.elements.currentStepEl.textContent = index + 1;
    this.elements.totalStepsEl.textContent = this.steps.length;
    this.elements.stepIcon.textContent = step.icon || '🏗️';
    
    // Update progress
    const dots = this.elements.progress.querySelectorAll('.tour-progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.classList.toggle('completed', i < index);
    });
    
    // Update buttons
    this.elements.prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    this.elements.nextBtn.textContent = index === this.steps.length - 1 ? 'Finish ✓' : 'Next →';
    
    // Find target element
    const target = document.querySelector(step.target);
    if (target) {
      // Scroll to element
      this.scrollToElement(target);
      
      // Position spotlight and tooltip
      setTimeout(() => {
        this.positionSpotlight();
        this.positionTooltip();
      }, 300);
    }
    
    // Show tooltip
    this.elements.tooltip.classList.add('active');
    this.elements.spotlight.classList.add('pulse');
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('tour:step', { 
      detail: { step: index, total: this.steps.length } 
    }));
  }
  
  scrollToElement(element) {
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    if (!isInViewport) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  }
  
  positionSpotlight() {
    const step = this.steps[this.currentStep];
    const target = document.querySelector(step.target);
    
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const padding = 8;
    
    this.elements.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.elements.spotlight.style.height = `${rect.height + padding * 2}px`;
    this.elements.spotlight.style.left = `${rect.left + window.scrollX - padding}px`;
    this.elements.spotlight.style.top = `${rect.top + window.scrollY - padding}px`;
  }
  
  positionTooltip() {
    const step = this.steps[this.currentStep];
    const target = document.querySelector(step.target);
    
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const tooltipRect = this.elements.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let position = step.position || 'bottom';
    let left, top;
    
    // Calculate position
    const gap = 20;
    
    switch(position) {
      case 'top':
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        top = rect.top - tooltipRect.height - gap;
        break;
      case 'bottom':
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        top = rect.bottom + gap;
        break;
      case 'left':
        left = rect.left - tooltipRect.width - gap;
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        left = rect.right + gap;
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        break;
    }
    
    // Boundary checks
    left = Math.max(20, Math.min(left, viewportWidth - tooltipRect.width - 20));
    top = Math.max(20, Math.min(top, viewportHeight - tooltipRect.height - 20));
    
    // Adjust position class
    this.elements.tooltip.className = `tour-tooltip active position-${position}`;
    
    this.elements.tooltip.style.left = `${left + window.scrollX}px`;
    this.elements.tooltip.style.top = `${top + window.scrollY}px`;
    this.elements.tooltip.style.position = 'absolute';
  }
  
  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.complete();
    }
  }
  
  prev() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  complete() {
    // Show completion animation
    this.createConfetti();
    
    // Show completion message
    this.elements.title.textContent = '🎉 Tour Complete!';
    this.elements.content.innerHTML = 'You\'re all set! Start your project today with a <span class="tour-highlight">free consultation</span>.';
    this.elements.nav.innerHTML = `
      <button class="tour-btn tour-btn-primary tour-finish" style="width: 100%;">
        Get Started Now 🚀
      </button>
    `;
    
    this.elements.tooltip.querySelector('.tour-finish').addEventListener('click', () => {
      this.end();
      window.open('https://wa.me/27661200064', '_blank');
    });
    
    this.markTourCompleted();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('tour:complete'));
  }
  
  createConfetti() {
    const colors = ['#c9ced6', '#ffffff', '#a0a8b3', '#7a8291'];
    const container = document.createElement('div');
    container.className = 'tour-completion-confetti';
    
    for (let i = 0; i < 30; i++) {
      const piece = document.createElement('div');
      piece.className = 'tour-confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.animationDuration = `${2 + Math.random() * 1}s`;
      container.appendChild(piece);
    }
    
    this.elements.tooltip.appendChild(container);
  }
  
  end() {
    this.isActive = false;
    
    this.elements.overlay.classList.remove('active');
    this.elements.tooltip.classList.remove('active');
    this.elements.spotlight.style.width = '0';
    this.elements.spotlight.style.height = '0';
    this.elements.spotlight.classList.remove('pulse');
    
    this.markTourCompleted();
    
    // Create launch button for future use
    setTimeout(() => {
      if (!document.querySelector('.tour-launch-btn')) {
        this.createLaunchButton();
      }
    }, 500);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('tour:end', { 
      detail: { completed: this.currentStep >= this.steps.length - 1 } 
    }));
  }
  
  destroy() {
    this.end();
    
    // Remove all elements
    Object.values(this.elements).forEach(el => {
      if (el && el.remove) el.remove();
    });
    
    const launchBtn = document.querySelector('.tour-launch-btn');
    if (launchBtn) launchBtn.remove();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.buildBridgeTour = new SmartPageTour();
  });
} else {
  window.buildBridgeTour = new SmartPageTour();
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPageTour;
}
