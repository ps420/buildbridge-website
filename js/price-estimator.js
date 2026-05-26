/**
 * Price Estimator Widget v1.0
 * Interactive Construction Cost Calculator
 */

class PriceEstimator {
  constructor(container) {
    this.container = container;
    this.currentStep = 0;
    this.answers = {};
    this.pricingData = this.getPricingData();
    
    this.init();
  }

  getPricingData() {
    return {
      projectTypes: {
        residential: { basePrice: 25000, multiplier: 1 },
        commercial: { basePrice: 50000, multiplier: 1.5 },
        industrial: { basePrice: 75000, multiplier: 2 },
        renovation: { basePrice: 15000, multiplier: 0.8 }
      },
      sizes: {
        small: { sqm: 50, label: 'Small (under 100m²)' },
        medium: { sqm: 150, label: 'Medium (100-200m²)' },
        large: { sqm: 300, label: 'Large (200-400m²)' },
        xlarge: { sqm: 500, label: 'Extra Large (400m²+)' }
      },
      finishes: {
        basic: { multiplier: 1, label: 'Basic' },
        standard: { multiplier: 1.3, label: 'Standard' },
        premium: { multiplier: 1.8, label: 'Premium' },
        luxury: { multiplier: 2.5, label: 'Luxury' }
      },
      urgency: {
        normal: { multiplier: 1, label: 'Normal (3-6 months)' },
        expedited: { multiplier: 1.15, label: 'Expedited (2-3 months)' },
        urgent: { multiplier: 1.3, label: 'Urgent (1-2 months)' }
      }
    };
  }

  init() {
    this.steps = this.container.querySelectorAll('.estimator-step');
    this.progressSteps = this.container.querySelectorAll('.estimator-progress-step');
    this.navPrev = this.container.querySelector('.btn-prev');
    this.navNext = this.container.querySelector('.btn-next');
    
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Option selection
    this.container.querySelectorAll('.estimator-option').forEach(option => {
      option.addEventListener('click', () => {
        const step = option.closest('.estimator-step');
        const name = step.dataset.question;
        const value = option.dataset.value;
        
        // Remove selected from siblings
        step.querySelectorAll('.estimator-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Add selected to clicked
        option.classList.add('selected');
        
        // Store answer
        this.answers[name] = value;
        
        // Auto-advance after selection
        setTimeout(() => this.nextStep(), 400);
      });
    });

    // Range sliders
    this.container.querySelectorAll('.estimator-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const value = e.target.value;
        const label = e.target.closest('.estimator-slider-group').querySelector('.slider-value');
        if (label) label.textContent = value;
        
        const name = e.target.dataset.question;
        this.answers[name] = parseInt(value);
      });
    });

    // Navigation buttons
    if (this.navPrev) {
      this.navPrev.addEventListener('click', () => this.prevStep());
    }
    if (this.navNext) {
      this.navNext.addEventListener('click', () => this.nextStep());
    }

    // Restart button
    const restartBtn = this.container.querySelector('.btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    // Contact button
    const contactBtn = this.container.querySelector('.btn-contact');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        // Navigate to contact section
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      // Validate current step
      if (!this.validateCurrentStep()) {
        this.showValidationError();
        return;
      }
      
      this.currentStep++;
      this.updateUI();
      
      // Calculate and show result on final step
      if (this.currentStep === this.steps.length - 1) {
        this.calculateAndShowResult();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateUI();
    }
  }

  validateCurrentStep() {
    const currentStepEl = this.steps[this.currentStep];
    const question = currentStepEl.dataset.question;
    
    // If it's the result step, always valid
    if (currentStepEl.classList.contains('estimator-result')) return true;
    
    return this.answers.hasOwnProperty(question);
  }

  showValidationError() {
    // Shake animation on options
    const options = this.steps[this.currentStep].querySelector('.estimator-options');
    if (options) {
      options.style.animation = 'shake 0.5s ease';
      setTimeout(() => {
        options.style.animation = '';
      }, 500);
    }
    
    // Show toast
    if (window.Toast) {
      Toast.warning('Please select an option to continue');
    }
  }

  updateUI() {
    // Show/hide steps
    this.steps.forEach((step, index) => {
      step.classList.toggle('active', index === this.currentStep);
    });

    // Update progress bar
    this.progressSteps.forEach((step, index) => {
      step.classList.remove('completed', 'active');
      if (index < this.currentStep) {
        step.classList.add('completed');
      } else if (index === this.currentStep) {
        step.classList.add('active');
      }
    });

    // Update navigation buttons
    if (this.navPrev) {
      this.navPrev.style.visibility = this.currentStep === 0 ? 'hidden' : 'visible';
    }
    if (this.navNext) {
      const isLastStep = this.currentStep === this.steps.length - 1;
      this.navNext.textContent = isLastStep ? 'Finish' : 'Next';
      this.navNext.disabled = false;
    }
  }

  calculateAndShowResult() {
    const { projectType, size, finish, urgency } = this.answers;
    
    // Get pricing data
    const typeData = this.pricingData.projectTypes[projectType] || this.pricingData.projectTypes.residential;
    const sizeData = this.pricingData.sizes[size] || this.pricingData.sizes.medium;
    const finishData = this.pricingData.finishes[finish] || this.pricingData.finishes.standard;
    const urgencyData = this.pricingData.urgency[urgency] || this.pricingData.urgency.normal;

    // Calculate base price per square meter
    const basePricePerSqm = 2500; // ZAR per m²
    const baseCost = sizeData.sqm * basePricePerSqm * typeData.multiplier;
    
    // Apply finish multiplier
    const finishCost = baseCost * finishData.multiplier;
    
    // Apply urgency multiplier
    const urgencyCost = finishCost * urgencyData.multiplier;
    
    // Range (±20%)
    const minPrice = Math.round(urgencyCost * 0.8);
    const maxPrice = Math.round(urgencyCost * 1.2);
    const avgPrice = Math.round(urgencyCost);

    // Update display
    const priceEl = this.container.querySelector('.estimator-price');
    const rangeEl = this.container.querySelector('.estimator-price-range');
    
    // Animate price counting
    this.animatePrice(priceEl, avgPrice);
    
    if (rangeEl) {
      rangeEl.textContent = `Estimated range: R${this.formatNumber(minPrice)} - R${this.formatNumber(maxPrice)}`;
    }

    // Update breakdown
    this.updateBreakdown({
      'Base Construction': baseCost,
      'Finish Upgrade': finishCost - baseCost,
      'Urgency Fee': urgencyCost - finishCost,
      'Estimated Total': urgencyCost
    });

    // Dispatch event
    window.dispatchEvent(new CustomEvent('estimatorComplete', {
      detail: { 
        estimate: avgPrice,
        range: { min: minPrice, max: maxPrice },
        answers: this.answers
      }
    }));
  }

  animatePrice(element, targetValue) {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
      
      element.textContent = `R${this.formatNumber(currentValue)}`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.classList.add('animate');
      }
    };

    requestAnimationFrame(animate);
  }

  updateBreakdown(items) {
    const container = this.container.querySelector('.estimator-breakdown');
    if (!container) return;

    container.innerHTML = '';
    
    Object.entries(items).forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'estimator-breakdown-item';
      item.innerHTML = `
        <span>${label}</span>
        <span>R${this.formatNumber(Math.round(value))}</span>
      `;
      container.appendChild(item);
    });
  }

  formatNumber(num) {
    return num.toLocaleString('en-ZA');
  }

  restart() {
    this.currentStep = 0;
    this.answers = {};
    
    // Clear selections
    this.container.querySelectorAll('.estimator-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    this.updateUI();
  }

  // Public API
  getEstimate() {
    return this.answers;
  }

  setStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
      this.updateUI();
    }
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.price-estimator').forEach(estimator => {
    estimator._instance = new PriceEstimator(estimator);
  });
});

// Export
window.PriceEstimator = PriceEstimator;
