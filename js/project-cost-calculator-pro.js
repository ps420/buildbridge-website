/**
 * v88.1: Project Cost Calculator Pro
 * Fortune 500 Interactive Cost Estimation Tool
 */

class ProjectCostCalculatorPro {
  constructor() {
    this.state = {
      projectType: null,
      size: 100,
      quality: 'standard',
      location: 'cape-town'
    };
    
    this.rates = {
      residential: { base: 15000, perSqm: 8500 },
      commercial: { base: 25000, perSqm: 12000 },
      industrial: { base: 35000, perSqm: 9500 },
      renovation: { base: 10000, perSqm: 6500 }
    };
    
    this.qualityMultipliers = {
      budget: 0.8,
      standard: 1,
      premium: 1.4
    };
    
    this.locationMultipliers = {
      'cape-town': 1.15,
      'johannesburg': 1,
      'durban': 0.95,
      'pretoria': 0.9,
      'other': 1
    };
    
    this.init();
  }
  
  init() {
    this.findOrCreateContainer();
    this.bindEvents();
    this.calculate();
  }
  
  findOrCreateContainer() {
    // Check if section already exists
    this.container = document.querySelector('.cost-calculator-pro-section');
    
    if (!this.container) {
      // Insert after stats section or at end of main
      this.container = document.createElement('section');
      this.container.className = 'cost-calculator-pro-section';
      this.container.id = 'cost-calculator';
      this.container.innerHTML = this.getHTML();
      
      const main = document.querySelector('main') || document.body;
      const statsSection = document.querySelector('#stats');
      
      if (statsSection) {
        statsSection.after(this.container);
      } else {
        main.appendChild(this.container);
      }
    }
    
    this.elements = {
      projectTypeCards: this.container.querySelectorAll('.project-type-card'),
      sizeSlider: this.container.querySelector('.size-slider'),
      sizeValue: this.container.querySelector('.size-value'),
      qualityCards: this.container.querySelectorAll('.quality-card'),
      locationSelect: this.container.querySelector('.location-select'),
      estimatedCost: this.container.querySelector('.estimated-cost'),
      costRange: this.container.querySelector('.cost-range'),
      materialCost: this.container.querySelector('.material-cost'),
      laborCost: this.container.querySelector('.labor-cost'),
      overheadCost: this.container.querySelector('.overhead-cost'),
      timelineText: this.container.querySelector('.timeline-text'),
      progressRing: this.container.querySelector('.cost-progress-ring-fill')
    };
  }
  
  getHTML() {
    return `
      <div class="cost-calculator-pro-container">
        <div class="cost-calculator-header">
          <p class="eyebrow">Get Started</p>
          <h2>Project Cost Calculator</h2>
          <p>Get an instant estimate for your construction project. Adjust the parameters below to see real-time pricing.</p>
        </div>
        
        <div class="cost-calculator-form">
          <!-- Step 1: Project Type -->
          <div class="calculator-step">
            <div class="calculator-step-header">
              <div class="step-number"><span>1</span></div>
              <h3>Select Project Type</h3>
            </div>
            <div class="project-type-grid">
              <div class="project-type-card" data-type="residential">
                <div class="icon">🏠</div>
                <h4>Residential</h4>
                <p>Homes, apartments</p>
              </div>
              <div class="project-type-card" data-type="commercial">
                <div class="icon">🏢</div>
                <h4>Commercial</h4>
                <p>Offices, retail</p>
              </div>
              <div class="project-type-card" data-type="industrial">
                <div class="icon">🏭</div>
                <h4>Industrial</h4>
                <p>Factories, warehouses</p>
              </div>
              <div class="project-type-card" data-type="renovation">
                <div class="icon">🔨</div>
                <h4>Renovation</h4>
                <p>Remodeling</p>
              </div>
            </div>
          </div>
          
          <!-- Step 2: Project Size -->
          <div class="calculator-step">
            <div class="calculator-step-header">
              <div class="step-number"><span>2</span></div>
              <h3>Project Size</h3>
            </div>
            <div class="size-slider-container">
              <div class="size-slider-header">
                <span>Project Size</span>
                <span class="size-value">100 m²</span>
              </div>
              <input type="range" class="size-slider" min="20" max="2000" value="100" step="10">
              <div class="size-labels">
                <span>20m²</span>
                <span>1000m²</span>
                <span>2000m²</span>
              </div>
            </div>
          </div>
          
          <!-- Step 3: Quality Level -->
          <div class="calculator-step">
            <div class="calculator-step-header">
              <div class="step-number"><span>3</span></div>
              <h3>Quality Level</h3>
            </div>
            <div class="quality-grid">
              <div class="quality-card" data-quality="budget">
                <h4>Budget</h4>
                <div class="price-indicator">
                  <div class="price-dot active"></div>
                  <div class="price-dot"></div>
                  <div class="price-dot"></div>
                </div>
                <p>Essential finishes</p>
              </div>
              <div class="quality-card selected" data-quality="standard">
                <h4>Standard</h4>
                <div class="price-indicator">
                  <div class="price-dot active"></div>
                  <div class="price-dot active"></div>
                  <div class="price-dot"></div>
                </div>
                <p>Quality materials</p>
              </div>
              <div class="quality-card" data-quality="premium">
                <h4>Premium</h4>
                <div class="price-indicator">
                  <div class="price-dot active"></div>
                  <div class="price-dot active"></div>
                  <div class="price-dot active"></div>
                </div>
                <p>Luxury finishes</p>
              </div>
            </div>
          </div>
          
          <!-- Step 4: Location -->
          <div class="calculator-step">
            <div class="calculator-step-header">
              <div class="step-number"><span>4</span></div>
              <h3>Location</h3>
            </div>
            <select class="location-select">
              <option value="cape-town">Cape Town</option>
              <option value="johannesburg">Johannesburg</option>
              <option value="durban">Durban</option>
              <option value="pretoria">Pretoria</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <!-- Results Panel -->
        <div class="cost-calculator-results">
          <div class="results-card">
            <!-- Progress Ring -->
            <div class="cost-progress-ring">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="costGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#C9CED6" />
                    <stop offset="100%" stop-color="#F5F7FA" />
                  </linearGradient>
                </defs>
                <circle class="cost-progress-ring-bg" cx="100" cy="100" r="90"></circle>
                <circle class="cost-progress-ring-fill" cx="100" cy="100" r="90"></circle>
              </svg>
              <div class="cost-progress-content">
                <div class="cost-progress-label">Estimated</div>
                <div class="cost-progress-value">R0</div>
              </div>
            </div>
            
            <div class="results-header">
              <h3>Estimated Project Cost</h3>
              <div class="estimated-cost">R0</div>
              <p class="cost-range">Range: R0 - R0</p>
            </div>
            
            <!-- Cost Breakdown -->
            <div class="cost-breakdown">
              <h4>Cost Breakdown</h4>
              <div class="breakdown-item">
                <span class="breakdown-label">Materials & Equipment</span>
                <span class="breakdown-value material-cost">R0</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Labor & Contractors</span>
                <span class="breakdown-value labor-cost">R0</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Management & Overhead</span>
                <span class="breakdown-value overhead-cost">R0</span>
              </div>
            </div>
            
            <!-- Timeline Estimate -->
            <div class="timeline-estimate">
              <div class="timeline-icon">⏱️</div>
              <div class="timeline-info">
                <h4>Estimated Timeline</h4>
                <p class="timeline-text">3-4 months</p>
              </div>
            </div>
            
            <!-- CTAs -->
            <div class="calculator-cta">
              <a href="https://wa.me/27661200064" class="btn" target="_blank">
                💬 Get Detailed Quote
              </a>
              <button class="btn btn-secondary" onclick="window.print()">
                📄 Print Estimate
              </button>
            </div>
            
            <!-- Features -->
            <div class="calculator-features">
              <h4>What's Included</h4>
              <div class="feature-list">
                <div class="feature-item">Professional project management</div>
                <div class="feature-item">Licensed & insured contractors</div>
                <div class="feature-item">Quality assurance inspections</div>
                <div class="feature-item">Transparent pricing & reporting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Project type selection
    this.elements.projectTypeCards.forEach(card => {
      card.addEventListener('click', () => {
        this.elements.projectTypeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.projectType = card.dataset.type;
        this.updateStepCompletion(1, true);
        this.calculate();
      });
    });
    
    // Size slider
    this.elements.sizeSlider.addEventListener('input', (e) => {
      this.state.size = parseInt(e.target.value);
      this.elements.sizeValue.textContent = `${this.state.size} m²`;
      this.updateStepCompletion(2, true);
      this.calculate();
    });
    
    // Quality selection
    this.elements.qualityCards.forEach(card => {
      card.addEventListener('click', () => {
        this.elements.qualityCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.quality = card.dataset.quality;
        this.updateStepCompletion(3, true);
        this.calculate();
      });
    });
    
    // Location selection
    this.elements.locationSelect.addEventListener('change', (e) => {
      this.state.location = e.target.value;
      this.updateStepCompletion(4, true);
      this.calculate();
    });
  }
  
  updateStepCompletion(step, completed) {
    const stepNumber = this.container.querySelectorAll('.step-number')[step - 1];
    if (stepNumber) {
      stepNumber.classList.toggle('completed', completed);
    }
  }
  
  calculate() {
    if (!this.state.projectType) return;
    
    const rate = this.rates[this.state.projectType];
    const qualityMult = this.qualityMultipliers[this.state.quality];
    const locationMult = this.locationMultipliers[this.state.location];
    
    // Base calculation
    const baseCost = rate.base + (rate.perSqm * this.state.size);
    const adjustedCost = baseCost * qualityMult * locationMult;
    
    // Breakdown
    const materialCost = adjustedCost * 0.45;
    const laborCost = adjustedCost * 0.40;
    const overheadCost = adjustedCost * 0.15;
    
    // Timeline estimate
    const timelineMonths = Math.ceil(this.state.size / 200) + 2;
    const timelineText = timelineMonths <= 3 ? '2-3 months' : 
                        timelineMonths <= 6 ? '4-6 months' : 
                        timelineMonths <= 12 ? '6-12 months' : '12+ months';
    
    // Update UI
    this.updateCostDisplay(adjustedCost);
    this.elements.materialCost.textContent = this.formatCurrency(materialCost);
    this.elements.laborCost.textContent = this.formatCurrency(laborCost);
    this.elements.overheadCost.textContent = this.formatCurrency(overheadCost);
    this.elements.timelineText.textContent = timelineText;
    
    // Update progress ring
    this.updateProgressRing(adjustedCost);
  }
  
  updateCostDisplay(cost) {
    const minCost = cost * 0.9;
    const maxCost = cost * 1.15;
    
    this.elements.estimatedCost.classList.add('updating');
    
    setTimeout(() => {
      this.elements.estimatedCost.textContent = this.formatCurrency(cost);
      this.elements.costRange.textContent = `Range: ${this.formatCurrency(minCost)} - ${this.formatCurrency(maxCost)}`;
      this.elements.estimatedCost.classList.remove('updating');
    }, 150);
    
    // Update progress ring value
    const progressValue = this.container.querySelector('.cost-progress-value');
    if (progressValue) {
      progressValue.textContent = this.formatCompactCurrency(cost);
    }
  }
  
  updateProgressRing(cost) {
    if (!this.elements.progressRing) return;
    
    // Max cost for full ring = 20M
    const maxCost = 20000000;
    const percentage = Math.min(cost / maxCost, 1);
    const circumference = 2 * Math.PI * 90; // r = 90
    const offset = circumference - (percentage * circumference);
    
    this.elements.progressRing.style.strokeDashoffset = offset;
  }
  
  formatCurrency(amount) {
    return 'R' + Math.round(amount).toLocaleString('en-ZA');
  }
  
  formatCompactCurrency(amount) {
    if (amount >= 1000000) {
      return 'R' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return 'R' + (amount / 1000).toFixed(0) + 'K';
    }
    return 'R' + amount.toFixed(0);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProjectCostCalculatorPro());
} else {
  new ProjectCostCalculatorPro();
}
