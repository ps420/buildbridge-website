/**
 * BuildBridge Interactive Cost Calculator
 * Fortune 500 Quality - Professional project cost estimation
 */

class CostCalculator {
  constructor(container) {
    this.container = container;
    this.currentStep = 0;
    this.answers = {};
    this.steps = [
      {
        id: 'project-type',
        question: 'What type of project are you planning?',
        options: [
          { id: 'residential', label: 'Residential', icon: '🏠', description: 'House, apartment, or estate' },
          { id: 'commercial', label: 'Commercial', icon: '🏢', description: 'Office, retail, or hospitality' },
          { id: 'industrial', label: 'Industrial', icon: '🏭', description: 'Factory, warehouse, or plant' },
          { id: 'renovation', label: 'Renovation', icon: '🔨', description: 'Upgrade or remodel existing' }
        ]
      },
      {
        id: 'project-size',
        question: 'What is the approximate size?',
        options: [
          { id: 'small', label: 'Small', icon: '📏', description: 'Under 200m²', multiplier: 1 },
          { id: 'medium', label: 'Medium', icon: '📐', description: '200-500m²', multiplier: 1.5 },
          { id: 'large', label: 'Large', icon: '🏗️', description: '500-1000m²', multiplier: 2.5 },
          { id: 'xlarge', label: 'X-Large', icon: '🏛️', description: 'Over 1000m²', multiplier: 4 }
        ]
      },
      {
        id: 'quality-level',
        question: 'What quality level are you targeting?',
        options: [
          { id: 'standard', label: 'Standard', icon: '⭐', description: 'Quality finishes at good value', multiplier: 1 },
          { id: 'premium', label: 'Premium', icon: '⭐⭐', description: 'High-end materials & finishes', multiplier: 1.8 },
          { id: 'luxury', label: 'Luxury', icon: '⭐⭐⭐', description: 'Best-in-class specifications', multiplier: 3 }
        ]
      },
      {
        id: 'timeline',
        question: 'What is your preferred timeline?',
        options: [
          { id: 'standard', label: 'Standard', icon: '📅', description: 'Normal construction schedule', multiplier: 1 },
          { id: 'accelerated', label: 'Accelerated', icon: '⚡', description: 'Faster delivery (+15% cost)', multiplier: 1.15 },
          { id: 'urgent', label: 'Urgent', icon: '🚀', description: 'Fastest possible (+30% cost)', multiplier: 1.3 }
        ]
      }
    ];
    
    // Base rates per m² in ZAR
    this.baseRates = {
      residential: 18000,
      commercial: 22000,
      industrial: 15000,
      renovation: 12000
    };
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.updateProgress();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="calculator-wrapper">
        <div class="calculator-header">
          <div class="calculator-progress">
            ${this.steps.map((_, i) => `
              <div class="progress-step ${i === 0 ? 'active' : ''}" data-step="${i}"></div>
            `).join('')}
          </div>
          <div class="step-indicator">
            <span class="step-current">1</span>
            <span class="step-divider">/</span>
            <span class="step-total">${this.steps.length}</span>
          </div>
        </div>
        
        <div class="calculator-content">
          ${this.steps.map((step, i) => `
            <div class="calculator-step ${i === 0 ? 'active' : ''}" data-step="${i}">
              <h3 class="step-question">${step.question}</h3>
              <div class="step-options">
                ${step.options.map(option => `
                  <button class="option-card" data-value="${option.id}" data-multiplier="${option.multiplier || 1}">
                    <span class="option-icon">${option.icon}</span>
                    <span class="option-label">${option.label}</span>
                    <span class="option-description">${option.description}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          <div class="calculator-result">
            <div class="result-icon">💰</div>
            <h3 class="result-title">Estimated Project Cost</h3>
            <div class="result-amount">
              <span class="result-currency">R</span>
              <span class="result-number">0</span>
            </div>
            <p class="result-range">Typical range: <span class="range-low">R0</span> - <span class="range-high">R0</span></p>
            <p class="result-disclaimer">This is an indicative estimate based on your selections. Actual costs may vary based on specific requirements, location, and market conditions.</p>
            <div class="result-actions">
              <a href="https://wa.me/27661200064?text=Hi BuildBridge, I used your cost calculator and would like to discuss my project." 
                 class="btn btn-primary" target="_blank">
                💬 Discuss on WhatsApp
              </a>
              <button class="btn btn-secondary" onclick="this.closest('.cost-calculator').querySelector('.calculator-wrapper').dispatchEvent(new CustomEvent('restart'))">
                Start Over
              </button>
            </div>
          </div>
        </div>
        
        <div class="calculator-footer">
          <button class="btn-back" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <button class="btn-next" disabled>
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.wrapper = this.container.querySelector('.calculator-wrapper');
    this.progressSteps = this.container.querySelectorAll('.progress-step');
    this.stepElements = this.container.querySelectorAll('.calculator-step');
    this.resultElement = this.container.querySelector('.calculator-result');
    this.btnBack = this.container.querySelector('.btn-back');
    this.btnNext = this.container.querySelector('.btn-next');
    this.stepCurrent = this.container.querySelector('.step-current');
  }
  
  bindEvents() {
    // Option selection
    this.container.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => this.selectOption(card));
    });
    
    // Navigation
    this.btnBack.addEventListener('click', () => this.goToStep(this.currentStep - 1));
    this.btnNext.addEventListener('click', () => this.goToStep(this.currentStep + 1));
    
    // Restart
    this.wrapper.addEventListener('restart', () => this.restart());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.container.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowLeft' && this.currentStep > 0) {
        this.goToStep(this.currentStep - 1);
      } else if (e.key === 'ArrowRight' && this.hasAnswer(this.currentStep)) {
        if (this.currentStep < this.steps.length - 1) {
          this.goToStep(this.currentStep + 1);
        }
      }
    });
  }
  
  selectOption(card) {
    const stepEl = card.closest('.calculator-step');
    const stepIndex = parseInt(stepEl.dataset.step);
    const value = card.dataset.value;
    
    // Remove previous selection
    stepEl.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // Store answer
    this.answers[this.steps[stepIndex].id] = {
      value: value,
      multiplier: parseFloat(card.dataset.multiplier) || 1
    };
    
    // Animate selection
    this.animateSelection(card);
    
    // Update navigation
    this.updateNavigation();
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (stepIndex < this.steps.length - 1) {
        this.goToStep(stepIndex + 1);
      } else {
        this.showResults();
      }
    }, 400);
  }
  
  animateSelection(card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  }
  
  goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    // Check if we can proceed
    if (stepIndex > 0 && !this.hasAnswer(stepIndex - 1)) {
      // Shake the current step to indicate we need an answer
      this.stepElements[this.currentStep].classList.add('shake');
      setTimeout(() => {
        this.stepElements[this.currentStep].classList.remove('shake');
      }, 400);
      return;
    }
    
    // Update current step
    this.stepElements[this.currentStep].classList.remove('active');
    this.currentStep = stepIndex;
    this.stepElements[this.currentStep].classList.add('active');
    
    // Update progress
    this.updateProgress();
    this.updateNavigation();
    
    // Update step indicator
    this.stepCurrent.textContent = this.currentStep + 1;
    
    // Animate entrance
    this.stepElements[this.currentStep].style.animation = 'none';
    setTimeout(() => {
      this.stepElements[this.currentStep].style.animation = '';
    }, 10);
  }
  
  hasAnswer(stepIndex) {
    return !!this.answers[this.steps[stepIndex].id];
  }
  
  updateProgress() {
    this.progressSteps.forEach((step, i) => {
      step.classList.remove('active', 'completed');
      if (i < this.currentStep) {
        step.classList.add('completed');
      } else if (i === this.currentStep) {
        step.classList.add('active');
      }
    });
  }
  
  updateNavigation() {
    // Back button
    this.btnBack.disabled = this.currentStep === 0;
    
    // Next button
    const hasCurrentAnswer = this.hasAnswer(this.currentStep);
    this.btnNext.disabled = !hasCurrentAnswer;
    
    if (this.currentStep === this.steps.length - 1 && hasCurrentAnswer) {
      this.btnNext.innerHTML = `
        See Estimate
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5l7 7-7 7"/>
        </svg>
      `;
    } else {
      this.btnNext.innerHTML = `
        Next
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      `;
    }
  }
  
  calculateEstimate() {
    const projectType = this.answers['project-type']?.value;
    const size = this.answers['project-size'];
    const quality = this.answers['quality-level'];
    const timeline = this.answers['timeline'];
    
    if (!projectType || !size || !quality) return null;
    
    // Base calculation
    const baseRate = this.baseRates[projectType];
    const sizeMultiplier = size.multiplier;
    const qualityMultiplier = quality.multiplier;
    const timelineMultiplier = timeline?.multiplier || 1;
    
    // Size base area (m²)
    const baseAreas = { small: 150, medium: 350, large: 750, xlarge: 1500 };
    const area = baseAreas[size.value] || 350;
    
    // Calculate
    const baseCost = baseRate * area;
    const adjustedCost = baseCost * qualityMultiplier * timelineMultiplier;
    
    return {
      estimate: adjustedCost,
      low: adjustedCost * 0.85,
      high: adjustedCost * 1.15,
      area: area
    };
  }
  
  showResults() {
    const result = this.calculateEstimate();
    if (!result) return;
    
    // Hide steps, show result
    this.stepElements[this.currentStep].classList.remove('active');
    this.resultElement.classList.add('active');
    
    // Animate numbers
    this.animateNumber(this.resultElement.querySelector('.result-number'), result.estimate);
    this.resultElement.querySelector('.range-low').textContent = this.formatCurrency(result.low);
    this.resultElement.querySelector('.range-high').textContent = this.formatCurrency(result.high);
    
    // Update navigation
    this.btnBack.disabled = false;
    this.btnNext.style.display = 'none';
    this.stepCurrent.textContent = '✓';
    
    // Mark all steps complete
    this.progressSteps.forEach(step => step.classList.add('completed'));
    
    // Trigger result animation
    setTimeout(() => {
      this.resultElement.classList.add('result--animated');
    }, 100);
  }
  
  animateNumber(element, target) {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing (ease-out-expo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = start + (target - start) * eased;
      element.textContent = this.formatNumber(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  
  formatCurrency(num) {
    return 'R ' + this.formatNumber(Math.round(num));
  }
  
  restart() {
    this.currentStep = 0;
    this.answers = {};
    
    // Reset UI
    this.stepElements.forEach((el, i) => {
      el.classList.remove('active');
      if (i === 0) el.classList.add('active');
    });
    
    this.resultElement.classList.remove('active', 'result--animated');
    this.btnNext.style.display = '';
    
    // Clear selections
    this.container.querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    this.updateProgress();
    this.updateNavigation();
    this.stepCurrent.textContent = '1';
  }
}

// Initialize all calculators
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cost-calculator').forEach(calculator => {
    new CostCalculator(calculator);
  });
});

// Export
window.CostCalculator = CostCalculator;
