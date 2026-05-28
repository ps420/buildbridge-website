/**
 * Project Cost Calculator v64.1
 * Interactive pricing estimator
 * Fortune 500 Quality Lead Generation Tool
 */

class ProjectCostCalculator {
  constructor(options = {}) {
    this.options = {
      onSubmit: null,
      onClose: null,
      ...options
    };
    
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {
      projectType: null,
      size: 100,
      quality: null,
      contact: {}
    };
    
    this.pricing = {
      residential: { base: 8500, perSqm: 8500 },
      commercial: { base: 12000, perSqm: 12000 },
      industrial: { base: 6500, perSqm: 6500 },
      renovation: { base: 5500, perSqm: 5500 }
    };
    
    this.qualityMultipliers = {
      standard: 1,
      premium: 1.4,
      luxury: 2.1
    };
    
    this.overlay = null;
    this.calculator = null;
    
    this.init();
  }
  
  init() {
    this.createLauncher();
    this.createCalculator();
  }
  
  createLauncher() {
    const launcher = document.createElement('button');
    launcher.className = 'cost-calculator-launcher';
    launcher.setAttribute('aria-label', 'Open cost calculator');
    launcher.innerHTML = `
      <span>💰</span>
      <span>Get Estimate</span>
    `;
    
    launcher.addEventListener('click', () => this.open());
    document.body.appendChild(launcher);
    this.launcher = launcher;
  }
  
  createCalculator() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'cost-calculator-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Project Cost Calculator');
    
    this.overlay.innerHTML = `
      <div class="cost-calculator">
        <div class="cost-calculator-header">
          <h2 class="cost-calculator-title">
            <span>📊</span>
            Project Cost Calculator
          </h2>
          <button class="cost-calculator-close" aria-label="Close calculator">×</button>
        </div>
        
        <div class="cost-calculator-body">
          <div class="calculator-progress">
            <div class="progress-line" style="width: 0%"></div>
            <div class="progress-step active" data-step="1">
              <div class="step-number">1</div>
              <span class="step-label">Type</span>
            </div>
            <div class="progress-step" data-step="2">
              <div class="step-number">2</div>
              <span class="step-label">Size</span>
            </div>
            <div class="progress-step" data-step="3">
              <div class="step-number">3</div>
              <span class="step-label">Quality</span>
            </div>
            <div class="progress-step" data-step="4">
              <div class="step-number">4</div>
              <span class="step-label">Results</span>
            </div>
          </div>
          
          <!-- Step 1: Project Type -->
          <div class="calculator-step active" data-step="1">
            <h3 class="step-title">What type of project?</h3>
            <p class="step-subtitle">Select the category that best describes your construction needs.</p>
            <div class="option-grid">
              <div class="option-card" data-value="residential">
                <div class="option-icon">🏠</div>
                <div class="option-title">Residential</div>
                <div class="option-desc">Homes, apartments, estates</div>
              </div>
              <div class="option-card" data-value="commercial">
                <div class="option-icon">🏢</div>
                <div class="option-title">Commercial</div>
                <div class="option-desc">Offices, retail, hospitality</div>
              </div>
              <div class="option-card" data-value="industrial">
                <div class="option-icon">🏭</div>
                <div class="option-title">Industrial</div>
                <div class="option-desc">Warehouses, factories</div>
              </div>
              <div class="option-card" data-value="renovation">
                <div class="option-icon">🔨</div>
                <div class="option-title">Renovation</div>
                <div class="option-desc">Upgrades, remodeling</div>
              </div>
            </div>
          </div>
          
          <!-- Step 2: Project Size -->
          <div class="calculator-step" data-step="2">
            <h3 class="step-title">What is the project size?</h3>
            <p class="step-subtitle">Estimate the total floor area of your project in square meters.</p>
            <div class="size-slider-container">
              <div class="size-display">
                <span class="size-value" id="size-value">100 m²</span>
                <span class="size-label">Total area</span>
              </div>
              <div class="slider-track">
                <div class="slider-fill" id="slider-fill" style="width: 10%"></div>
              </div>
              <input type="range" class="size-slider" id="size-slider" 
                     min="50" max="5000" value="100" step="50">
              <div class="slider-marks">
                <span>50m²</span>
                <span>1000m²</span>
                <span>2500m²</span>
                <span>5000m²</span>
              </div>
            </div>
          </div>
          
          <!-- Step 3: Quality Level -->
          <div class="calculator-step" data-step="3">
            <h3 class="step-title">What quality level?</h3>
            <p class="step-subtitle">Choose the finish quality that matches your vision and budget.</p>
            <div class="option-grid">
              <div class="option-card" data-value="standard">
                <div class="option-icon">✓</div>
                <div class="option-title">Standard</div>
                <div class="option-desc">Quality finishes, cost-effective</div>
              </div>
              <div class="option-card" data-value="premium">
                <div class="option-icon">⭐</div>
                <div class="option-title">Premium</div>
                <div class="option-desc">High-end materials & design</div>
              </div>
              <div class="option-card" data-value="luxury">
                <div class="option-icon">💎</div>
                <div class="option-title">Luxury</div>
                <div class="option-desc">Bespoke, top-tier everything</div>
              </div>
            </div>
          </div>
          
          <!-- Step 4: Contact & Results -->
          <div class="calculator-step" data-step="4">
            <div id="results-container">
              <div class="calculator-results">
                <div class="result-amount" id="result-amount">R 0</div>
                <div class="result-label">Estimated project cost</div>
                <div class="result-breakdown" id="result-breakdown">
                  <!-- Breakdown items will be inserted here -->
                </div>
                <p class="result-note">
                  This is a rough estimate. Actual costs may vary based on location, 
                  complexity, and market conditions. For a detailed quote, 
                  please contact our team.
                </p>
              </div>
              
              <div id="contact-form-section">
                <h4 style="font-family: 'Montserrat', sans-serif; font-size: 16px; margin-bottom: 16px; color: #F5F7FA;">
                  Get a detailed quote
                </h4>
                <form class="calculator-form" id="calc-contact-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="calc-name">Your Name</label>
                      <input type="text" id="calc-name" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                      <label for="calc-phone">Phone Number</label>
                      <input type="tel" id="calc-phone" placeholder="+27 12 345 6789" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="calc-email">Email Address</label>
                    <input type="email" id="calc-email" placeholder="john@example.com" required>
                  </div>
                  <div class="form-group">
                    <label for="calc-message">Project Details (Optional)</label>
                    <textarea id="calc-message" rows="3" placeholder="Tell us more about your project..."></textarea>
                  </div>
                </form>
              </div>
            </div>
            
            <div id="success-section" style="display: none; text-align: center; padding: 40px 0;">
              <div class="success-animation">
                <div class="success-checkmark">✓</div>
              </div>
              <h3 style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: #F5F7FA; margin-bottom: 12px;">
                Request Sent!
              </h3>
              <p style="font-size: 15px; color: rgba(201, 206, 214, 0.7);">
                Our team will contact you within 24 hours with a detailed quote.
              </p>
            </div>
          </div>
        </div>
        
        <div class="calculator-footer">
          <button class="calc-btn calc-btn-secondary" id="calc-prev" style="display: none;">
            ← Back
          </button>
          <button class="calc-btn calc-btn-primary" id="calc-next">
            Continue →
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    this.bindEvents();
  }
  
  bindEvents() {
    // Close button
    this.overlay.querySelector('.cost-calculator-close').addEventListener('click', () => this.close());
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
    
    // Project type selection
    this.overlay.querySelectorAll('[data-step="1"] .option-card').forEach(card => {
      card.addEventListener('click', () => {
        this.overlay.querySelectorAll('[data-step="1"] .option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.projectType = card.dataset.value;
        this.updateNextButton();
      });
    });
    
    // Size slider
    const sizeSlider = this.overlay.querySelector('#size-slider');
    const sizeValue = this.overlay.querySelector('#size-value');
    const sliderFill = this.overlay.querySelector('#slider-fill');
    
    sizeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.formData.size = value;
      sizeValue.textContent = `${value.toLocaleString()} m²`;
      sliderFill.style.width = `${((value - 50) / 4950) * 100}%`;
    });
    
    // Quality selection
    this.overlay.querySelectorAll('[data-step="3"] .option-card').forEach(card => {
      card.addEventListener('click', () => {
        this.overlay.querySelectorAll('[data-step="3"] .option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.quality = card.dataset.value;
        this.updateNextButton();
      });
    });
    
    // Navigation buttons
    this.overlay.querySelector('#calc-prev').addEventListener('click', () => this.prevStep());
    this.overlay.querySelector('#calc-next').addEventListener('click', () => this.nextStep());
  }
  
  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    setTimeout(() => {
      this.overlay.querySelector('.cost-calculator-close').focus();
    }, 100);
  }
  
  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.showStep(this.currentStep);
      
      if (this.currentStep === this.totalSteps) {
        this.calculateAndShowResults();
      }
    } else {
      this.submitForm();
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }
  
  showStep(step) {
    // Update progress
    const progress = ((step - 1) / (this.totalSteps - 1)) * 100;
    this.overlay.querySelector('.progress-line').style.width = `${progress}%`;
    
    // Update step indicators
    this.overlay.querySelectorAll('.progress-step').forEach((el, idx) => {
      const stepNum = idx + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === step) {
        el.classList.add('active');
      } else if (stepNum < step) {
        el.classList.add('completed');
      }
    });
    
    // Show/hide steps
    this.overlay.querySelectorAll('.calculator-step').forEach(el => {
      el.classList.remove('active');
    });
    const currentStepEl = this.overlay.querySelector(`.calculator-step[data-step="${step}"]`);
    if (currentStepEl) {
      currentStepEl.classList.add('active');
    }
    
    // Update buttons
    const prevBtn = this.overlay.querySelector('#calc-prev');
    const nextBtn = this.overlay.querySelector('#calc-next');
    
    prevBtn.style.display = step === 1 ? 'none' : 'flex';
    
    if (step === this.totalSteps) {
      nextBtn.textContent = 'Get Quote →';
      nextBtn.disabled = !this.validateContactForm();
    } else {
      nextBtn.textContent = 'Continue →';
      nextBtn.disabled = false;
    }
    
    // Validate current step
    this.updateNextButton();
  }
  
  updateNextButton() {
    const nextBtn = this.overlay.querySelector('#calc-next');
    
    if (this.currentStep === 1) {
      nextBtn.disabled = !this.formData.projectType;
    } else if (this.currentStep === 3) {
      nextBtn.disabled = !this.formData.quality;
    } else if (this.currentStep === 4) {
      nextBtn.disabled = !this.validateContactForm();
    }
  }
  
  validateContactForm() {
    const name = this.overlay.querySelector('#calc-name')?.value;
    const phone = this.overlay.querySelector('#calc-phone')?.value;
    const email = this.overlay.querySelector('#calc-email')?.value;
    
    return name && phone && email && email.includes('@');
  }
  
  calculateAndShowResults() {
    const type = this.pricing[this.formData.projectType];
    const quality = this.qualityMultipliers[this.formData.quality];
    const size = this.formData.size;
    
    const baseCost = type.base * (size / 50); // Base calculation
    const adjustedCost = baseCost * quality;
    const contingency = adjustedCost * 0.15; // 15% contingency
    const totalCost = adjustedCost + contingency;
    
    this.formData.estimates = {
      base: baseCost,
      adjusted: adjustedCost,
      contingency: contingency,
      total: totalCost
    };
    
    // Display results
    const resultAmount = this.overlay.querySelector('#result-amount');
    const resultBreakdown = this.overlay.querySelector('#result-breakdown');
    
    // Animate number counting
    this.animateNumber(resultAmount, 0, totalCost, 1500, (val) => `R ${(val / 1000000).toFixed(1)}M`);
    
    // Show breakdown
    resultBreakdown.innerHTML = `
      <div class="breakdown-item">
        <span class="breakdown-label">Base Cost (${size} m²)</span>
        <span class="breakdown-value">R ${(adjustedCost / 1000000).toFixed(2)}M</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Quality Level (${this.formData.quality})</span>
        <span class="breakdown-value">× ${quality}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Contingency (15%)</span>
        <span class="breakdown-value">R ${(contingency / 1000000).toFixed(2)}M</span>
      </div>
    `;
    
    // Bind contact form validation
    const formInputs = this.overlay.querySelectorAll('#calc-contact-form input, #calc-contact-form textarea');
    formInputs.forEach(input => {
      input.addEventListener('input', () => this.updateNextButton());
    });
  }
  
  animateNumber(element, start, end, duration, formatter) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeOutQuart;
      
      element.textContent = formatter(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  submitForm() {
    // Collect contact data
    this.formData.contact = {
      name: this.overlay.querySelector('#calc-name').value,
      phone: this.overlay.querySelector('#calc-phone').value,
      email: this.overlay.querySelector('#calc-email').value,
      message: this.overlay.querySelector('#calc-message').value
    };
    
    // Hide form, show success
    const resultsContainer = this.overlay.querySelector('#results-container');
    const successSection = this.overlay.querySelector('#success-section');
    const nextBtn = this.overlay.querySelector('#calc-next');
    
    resultsContainer.style.display = 'none';
    successSection.style.display = 'block';
    nextBtn.style.display = 'none';
    this.overlay.querySelector('#calc-prev').style.display = 'none';
    
    // Trigger callback
    if (this.options.onSubmit) {
      this.options.onSubmit(this.formData);
    }
    
    // Send to WhatsApp (for demo)
    this.sendToWhatsApp();
    
    // Reset after delay
    setTimeout(() => {
      this.reset();
      this.close();
    }, 4000);
  }
  
  sendToWhatsApp() {
    const { projectType, size, quality, estimates, contact } = this.formData;
    const total = (estimates.total / 1000000).toFixed(2);
    
    const message = `Hi BuildBridge! I'm interested in a construction project.%0A%0A` +
      `*Project Details:*%0A` +
      `• Type: ${projectType}%0A` +
      `• Size: ${size} m²%0A` +
      `• Quality: ${quality}%0A` +
      `• Estimated Budget: R ${total}M%0A%0A` +
      `*Contact:*%0A` +
      `• Name: ${contact.name}%0A` +
      `• Phone: ${contact.phone}%0A` +
      `• Email: ${contact.email}%0A` +
      (contact.message ? `%0A*Message:*%0A${contact.message}` : '');
    
    // In production, this would open WhatsApp
    console.log('WhatsApp message:', message);
  }
  
  reset() {
    this.currentStep = 1;
    this.formData = {
      projectType: null,
      size: 100,
      quality: null,
      contact: {}
    };
    
    // Reset UI
    this.overlay.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    this.overlay.querySelector('#size-slider').value = 100;
    this.overlay.querySelector('#size-value').textContent = '100 m²';
    this.overlay.querySelector('#slider-fill').style.width = '10%';
    this.overlay.querySelector('#calc-contact-form').reset();
    
    // Show results container again
    this.overlay.querySelector('#results-container').style.display = 'block';
    this.overlay.querySelector('#success-section').style.display = 'none';
    this.overlay.querySelector('#calc-next').style.display = 'flex';
    
    this.showStep(1);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.costCalculator = new ProjectCostCalculator({
    onSubmit: (data) => {
      console.log('Calculator submission:', data);
      // Here you would send to your backend
    },
    onClose: () => {
      console.log('Calculator closed');
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectCostCalculator;
}
