/**
 * BuildBridge Multi-Step Quote Request Form
 * Fortune 500 Quality - Progressive form with validation and animations
 */

class MultiStepForm {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.currentStep = 0;
    this.formData = {};
    this.totalSteps = 0;
    this.steps = [];
    this.options = {
      onComplete: options.onComplete || (() => {}),
      onStepChange: options.onStepChange || (() => {}),
      validateStep: options.validateStep || (() => true)
    };
    
    this.init();
  }

  init() {
    this.steps = Array.from(this.container.querySelectorAll('.form-step'));
    this.totalSteps = this.steps.length;
    
    if (this.totalSteps === 0) return;
    
    this.createProgressBar();
    this.createNavigation();
    this.bindEvents();
    this.showStep(0);
  }

  createProgressBar() {
    const progressHTML = `
      <div class="form-progress">
        <div class="form-progress-bar">
          ${this.steps.map((_, i) => `
            <div class="form-progress-step ${i === 0 ? 'active' : ''}" data-step="${i}">
              <span class="step-number">${i + 1}</span>
              <span class="step-label">${this.steps[i].dataset.title || `Step ${i + 1}`}</span>
            </div>
            ${i < this.totalSteps - 1 ? '<div class="form-progress-line"></div>' : ''}
          `).join('')}
        </div>
        <div class="form-progress-track">
          <div class="form-progress-fill" style="width: 0%"></div>
        </div>
      </div>
    `;
    
    this.container.insertAdjacentHTML('afterbegin', progressHTML);
    this.progressFill = this.container.querySelector('.form-progress-fill');
    this.progressSteps = this.container.querySelectorAll('.form-progress-step');
  }

  createNavigation() {
    const navHTML = `
      <div class="form-navigation">
        <button type="button" class="btn btn-secondary form-btn-prev" style="display: none;">
          ← Previous
        </button>
        <button type="button" class="btn form-btn-next">
          Next →
        </button>
        <button type="submit" class="btn form-btn-submit" style="display: none;">
          Submit Request ✓
        </button>
      </div>
    `;
    
    this.container.insertAdjacentHTML('beforeend', navHTML);
    this.prevBtn = this.container.querySelector('.form-btn-prev');
    this.nextBtn = this.container.querySelector('.form-btn-next');
    this.submitBtn = this.container.querySelector('.form-btn-submit');
  }

  bindEvents() {
    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.prevStep());
    this.nextBtn.addEventListener('click', () => this.nextStep());
    
    // Form submission
    const form = this.container.querySelector('form') || this.container;
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Input change tracking
    this.steps.forEach((step, index) => {
      const inputs = step.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.formData[input.name] = input.value;
          this.clearError(input);
        });
        
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.clearError(input);
          }
        });
      });
    });
    
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.matches('textarea')) {
        e.preventDefault();
        if (this.currentStep < this.totalSteps - 1) {
          this.nextStep();
        }
      }
    });
  }

  showStep(index) {
    // Hide all steps
    this.steps.forEach((step, i) => {
      step.classList.remove('active', 'prev', 'next');
      if (i < index) step.classList.add('prev');
      if (i > index) step.classList.add('next');
    });
    
    // Show current step
    this.steps[index].classList.add('active');
    this.currentStep = index;
    
    // Update progress
    this.updateProgress();
    
    // Update buttons
    this.updateButtons();
    
    // Focus first input
    const firstInput = this.steps[index].querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
    
    // Callback
    this.options.onStepChange(index, this.totalSteps);
  }

  updateProgress() {
    const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
    if (this.progressFill) {
      this.progressFill.style.width = `${progress}%`;
    }
    
    // Update step indicators
    this.progressSteps.forEach((step, i) => {
      step.classList.remove('active', 'completed');
      if (i < this.currentStep) {
        step.classList.add('completed');
      } else if (i === this.currentStep) {
        step.classList.add('active');
      }
    });
  }

  updateButtons() {
    // Show/hide previous button
    this.prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
    
    // Show/hide next/submit buttons
    if (this.currentStep === this.totalSteps - 1) {
      this.nextBtn.style.display = 'none';
      this.submitBtn.style.display = 'inline-flex';
    } else {
      this.nextBtn.style.display = 'inline-flex';
      this.submitBtn.style.display = 'none';
    }
  }

  validateCurrentStep() {
    const currentStepEl = this.steps[this.currentStep];
    const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showError(input, 'This field is required');
        isValid = false;
      } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
        this.showError(input, 'Please enter a valid email');
        isValid = false;
      } else if (input.type === 'tel' && !this.isValidPhone(input.value)) {
        this.showError(input, 'Please enter a valid phone number');
        isValid = false;
      }
    });
    
    // Custom validation
    if (isValid) {
      isValid = this.options.validateStep(this.currentStep, this.formData);
    }
    
    return isValid;
  }

  showError(input, message) {
    input.classList.add('error');
    
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    } else {
      const error = document.createElement('span');
      error.className = 'field-error';
      error.textContent = message;
      input.parentElement.appendChild(error);
    }
    
    // Shake animation
    input.closest('.form-step')?.classList.add('shake');
    setTimeout(() => {
      input.closest('.form-step')?.classList.remove('shake');
    }, 500);
  }

  clearError(input) {
    input.classList.remove('error');
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^[\d\s\-+()]{10,}$/.test(phone);
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
    // Animate out current step
    this.steps[this.currentStep].classList.add('slide-out-left');
    
    setTimeout(() => {
      this.steps[this.currentStep].classList.remove('slide-out-left');
      this.showStep(this.currentStep + 1);
      this.steps[this.currentStep].classList.add('slide-in-right');
      
      setTimeout(() => {
        this.steps[this.currentStep].classList.remove('slide-in-right');
      }, 300);
    }, 300);
  }

  prevStep() {
    if (this.currentStep === 0) return;
    
    // Animate out current step
    this.steps[this.currentStep].classList.add('slide-out-right');
    
    setTimeout(() => {
      this.steps[this.currentStep].classList.remove('slide-out-right');
      this.showStep(this.currentStep - 1);
      this.steps[this.currentStep].classList.add('slide-in-left');
      
      setTimeout(() => {
        this.steps[this.currentStep].classList.remove('slide-in-left');
      }, 300);
    }, 300);
  }

  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateCurrentStep()) return;
    
    // Disable buttons
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = 'Submitting...';
    this.prevBtn.disabled = true;
    
    // Collect all data
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading/success state
    this.showSubmitLoading();
    
    // Simulate submission (replace with actual API call)
    setTimeout(() => {
      this.showSubmitSuccess();
      this.options.onComplete(data);
    }, 2000);
  }

  showSubmitLoading() {
    const currentStep = this.steps[this.currentStep];
    currentStep.innerHTML = `
      <div class="form-loading">
        <div class="spinner"></div>
        <p>Processing your request...</p>
      </div>
    `;
  }

  showSubmitSuccess() {
    const currentStep = this.steps[this.currentStep];
    currentStep.innerHTML = `
      <div class="form-success">
        <div class="success-icon">✓</div>
        <h3>Request Submitted!</h3>
        <p>Thank you for your interest. Our team will contact you within 24 hours.</p>
        <div class="success-next-steps">
          <p>What's next?</p>
          <ul>
            <li>📧 Receive confirmation email</li>
            <li>📞 Schedule consultation call</li>
            <li>📋 Get detailed quote</li>
          </ul>
        </div>
        <a href="/" class="btn">Back to Home</a>
      </div>
    `;
    
    // Hide navigation
    this.container.querySelector('.form-navigation').style.display = 'none';
    this.container.querySelector('.form-progress').style.display = 'none';
  }
}

// Initialize multi-step forms on page
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('[data-multi-step], .multi-step-form');
  
  forms.forEach(form => {
    new MultiStepForm(form, {
      onComplete: (data) => {
        console.log('Form submitted:', data);
        if (window.Toast) {
          Toast.success('Quote request submitted successfully!');
        }
      },
      onStepChange: (step, total) => {
        console.log(`Step ${step + 1} of ${total}`);
      }
    });
  });
});

// Export for global access
window.MultiStepForm = MultiStepForm;

console.log('📝 Multi-Step Form initialized');
