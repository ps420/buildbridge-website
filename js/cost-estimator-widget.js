/**
 * BuildBridge Interactive Cost Estimator Widget v29.0
 * Fortune 500 Professional Project Cost Calculator
 * Features: Real-time calculation, animated results, export to PDF/Email
 */

class CostEstimatorWidget {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      currency: options.currency || 'R',
      taxRate: options.taxRate || 0.15,
      rates: {
        residential: { base: 8500, perSqm: 18500 },
        commercial: { base: 12000, perSqm: 22000 },
        industrial: { base: 15000, perSqm: 18000 },
        renovation: { base: 5000, perSqm: 12000 }
      },
      multipliers: {
        standard: 1.0,
        premium: 1.35,
        luxury: 1.85
      },
      urgencyMultipliers: {
        normal: 1.0,
        moderate: 1.15,
        urgent: 1.35
      }
    };
    
    this.state = {
      projectType: 'residential',
      projectSize: 100,
      finishLevel: 'standard',
      urgency: 'normal',
      extras: {
        projectManagement: true,
        qualityAssurance: true,
        postConstruction: false,
        greenCertification: false
      }
    };
    
    this.results = {
      baseCost: 0,
      finishPremium: 0,
      extrasCost: 0,
      urgencyCost: 0,
      subtotal: 0,
      vat: 0,
      total: 0
    };
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.calculate();
    this.animateEntry();
  }

  render() {
    this.container.innerHTML = `
      <div class="cost-estimator">
        <div class="estimator-header">
          <div class="estimator-icon">🧮</div>
          <h3>Project Cost Estimator</h3>
          <p>Get an instant estimate for your construction project</p>
        </div>
        
        <div class="estimator-body">
          <!-- Project Type -->
          <div class="estimator-field">
            <label>Project Type</label>
            <div class="estimator-options type-options">
              <button class="type-option active" data-type="residential">
                <span class="option-icon">🏠</span>
                <span class="option-label">Residential</span>
              </button>
              <button class="type-option" data-type="commercial">
                <span class="option-icon">🏢</span>
                <span class="option-label">Commercial</span>
              </button>
              <button class="type-option" data-type="industrial">
                <span class="option-icon">🏭</span>
                <span class="option-label">Industrial</span>
              </button>
              <button class="type-option" data-type="renovation">
                <span class="option-icon">🔨</span>
                <span class="option-label">Renovation</span>
              </button>
            </div>
          </div>
          
          <!-- Project Size -->
          <div class="estimator-field">
            <label>Project Size (m²)</label>
            <div class="size-slider-container">
              <input type="range" class="size-slider" min="50" max="5000" value="100" step="10">
              <div class="size-display">
                <span class="size-value">100</span>
                <span class="size-unit">m²</span>
              </div>
            </div>
            <div class="size-presets">
              <button data-size="100">Small (100m²)</button>
              <button data-size="300">Medium (300m²)</button>
              <button data-size="1000">Large (1000m²)</button>
              <button data-size="2000">XL (2000m²)</button>
            </div>
          </div>
          
          <!-- Finish Level -->
          <div class="estimator-field">
            <label>Finish Level</label>
            <div class="finish-options">
              <button class="finish-option" data-finish="standard">
                <span class="finish-name">Standard</span>
                <span class="finish-desc">Quality materials, functional design</span>
              </button>
              <button class="finish-option active" data-finish="premium">
                <span class="finish-name">Premium</span>
                <span class="finish-desc">High-end finishes, modern aesthetics</span>
              </button>
              <button class="finish-option" data-finish="luxury">
                <span class="finish-name">Luxury</span>
                <span class="finish-desc">Bespoke design, premium materials</span>
              </button>
            </div>
          </div>
          
          <!-- Timeline -->
          <div class="estimator-field">
            <label>Project Urgency</label>
            <div class="urgency-slider">
              <input type="range" min="0" max="2" value="0" step="1" class="urgency-input">
              <div class="urgency-labels">
                <span>Standard</span>
                <span>Moderate</span>
                <span>Urgent</span>
              </div>
            </div>
          </div>
          
          <!-- Extras -->
          <div class="estimator-field">
            <label>Additional Services</label>
            <div class="extras-grid">
              <label class="extra-option active">
                <input type="checkbox" checked data-extra="projectManagement">
                <span class="extra-check"></span>
                <span class="extra-content">
                  <strong>Project Management</strong>
                  <small>End-to-end oversight</small>
                </span>
                <span class="extra-price">+8%</span>
              </label>
              <label class="extra-option active">
                <input type="checkbox" checked data-extra="qualityAssurance">
                <span class="extra-check"></span>
                <span class="extra-content">
                  <strong>Quality Assurance</strong>
                  <small>Inspections & compliance</small>
                </span>
                <span class="extra-price">+5%</span>
              </label>
              <label class="extra-option">
                <input type="checkbox" data-extra="postConstruction">
                <span class="extra-check"></span>
                <span class="extra-content">
                  <strong>After-Care Support</strong>
                  <small>6-month maintenance</small>
                </span>
                <span class="extra-price">+3%</span>
              </label>
              <label class="extra-option">
                <input type="checkbox" data-extra="greenCertification">
                <span class="extra-check"></span>
                <span class="extra-content">
                  <strong>Green Building</strong>
                  <small>Eco certification</small>
                </span>
                <span class="extra-price">+6%</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Results -->
        <div class="estimator-results">
          <div class="results-header">
            <h4>Estimated Investment</h4>
            <span class="results-badge">Instant Quote</span>
          </div>
          
          <div class="results-breakdown">
            <div class="breakdown-item">
              <span>Base Construction</span>
              <span class="breakdown-value" data-result="baseCost">R0</span>
            </div>
            <div class="breakdown-item">
              <span>Finish Premium</span>
              <span class="breakdown-value" data-result="finishPremium">R0</span>
            </div>
            <div class="breakdown-item">
              <span>Additional Services</span>
              <span class="breakdown-value" data-result="extrasCost">R0</span>
            </div>
            <div class="breakdown-item urgency-line">
              <span>Urgency Adjustment</span>
              <span class="breakdown-value" data-result="urgencyCost">R0</span>
            </div>
            <div class="breakdown-divider"></div>
            <div class="breakdown-item subtotal">
              <span>Subtotal</span>
              <span class="breakdown-value" data-result="subtotal">R0</span>
            </div>
            <div class="breakdown-item vat">
              <span>VAT (15%)</span>
              <span class="breakdown-value" data-result="vat">R0</span>
            </div>
          </div>
          
          <div class="results-total">
            <div class="total-label">
              Total Estimated Cost
              <small>Subject to detailed assessment</small>
            </div>
            <div class="total-value" data-result="total">R0</div>
          </div>
          
          <div class="results-actions">
            <button class="btn btn-primary" onclick="costEstimator.exportToEmail()">
              <span>📧</span> Email Quote
            </button>
            <button class="btn btn-secondary" onclick="costEstimator.requestConsultation()">
              <span>📞</span> Free Consultation
            </button>
          </div>
          
          <div class="results-disclaimer">
            <p>⚠️ This is an estimate based on industry averages. Final costs may vary based on site conditions, material availability, and specific project requirements.</p>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Project type selection
    this.container.querySelectorAll('.type-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.type-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.projectType = btn.dataset.type;
        this.calculate();
      });
    });

    // Size slider
    const sizeSlider = this.container.querySelector('.size-slider');
    const sizeValue = this.container.querySelector('.size-value');
    
    sizeSlider.addEventListener('input', () => {
      this.state.projectSize = parseInt(sizeSlider.value);
      sizeValue.textContent = this.state.projectSize.toLocaleString();
      this.calculate();
    });

    // Size presets
    this.container.querySelectorAll('.size-presets button').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size);
        sizeSlider.value = size;
        sizeValue.textContent = size.toLocaleString();
        this.state.projectSize = size;
        this.calculate();
      });
    });

    // Finish level
    this.container.querySelectorAll('.finish-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.finish-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.finishLevel = btn.dataset.finish;
        this.calculate();
      });
    });

    // Urgency slider
    const urgencyInput = this.container.querySelector('.urgency-input');
    urgencyInput.addEventListener('input', () => {
      const levels = ['normal', 'moderate', 'urgent'];
      this.state.urgency = levels[parseInt(urgencyInput.value)];
      this.calculate();
    });

    // Extras
    this.container.querySelectorAll('.extra-option input').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const extra = checkbox.dataset.extra;
        this.state.extras[extra] = checkbox.checked;
        checkbox.closest('.extra-option').classList.toggle('active', checkbox.checked);
        this.calculate();
      });
    });
  }

  calculate() {
    const rates = this.options.rates[this.state.projectType];
    const baseRate = rates.base + (rates.perSqm * this.state.projectSize);
    
    const finishMultiplier = this.options.multipliers[this.state.finishLevel];
    const urgencyMultiplier = this.options.urgencyMultipliers[this.state.urgency];
    
    // Calculate extras
    let extrasCost = 0;
    if (this.state.extras.projectManagement) extrasCost += baseRate * 0.08;
    if (this.state.extras.qualityAssurance) extrasCost += baseRate * 0.05;
    if (this.state.extras.postConstruction) extrasCost += baseRate * 0.03;
    if (this.state.extras.greenCertification) extrasCost += baseRate * 0.06;
    
    // Calculate all values
    this.results.baseCost = baseRate;
    this.results.finishPremium = baseRate * (finishMultiplier - 1);
    this.results.extrasCost = extrasCost;
    this.results.urgencyCost = (baseRate + this.results.finishPremium + extrasCost) * (urgencyMultiplier - 1);
    this.results.subtotal = baseRate + this.results.finishPremium + extrasCost + this.results.urgencyCost;
    this.results.vat = this.results.subtotal * this.options.taxRate;
    this.results.total = this.results.subtotal + this.results.vat;
    
    this.updateDisplay();
  }

  updateDisplay() {
    const format = (val) => this.options.currency + val.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
    
    // Update all result fields with animation
    this.container.querySelectorAll('[data-result]').forEach(el => {
      const key = el.dataset.result;
      const newValue = this.results[key];
      const formatted = format(newValue);
      
      if (el.textContent !== formatted) {
        this.animateValue(el, el.textContent, formatted);
      }
    });
    
    // Show/hide urgency line
    const urgencyLine = this.container.querySelector('.urgency-line');
    if (this.state.urgency === 'normal') {
      urgencyLine.style.display = 'none';
    } else {
      urgencyLine.style.display = 'flex';
    }
  }

  animateValue(element, from, to) {
    element.style.transform = 'scale(1.05)';
    element.style.color = 'var(--chrome, #C9CED6)';
    
    setTimeout(() => {
      element.textContent = to;
      element.style.transform = 'scale(1)';
      element.style.color = '';
    }, 150);
  }

  animateEntry() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('estimator-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(this.container);
  }

  exportToEmail() {
    const subject = encodeURIComponent('BuildBridge Project Quote Request');
    const body = encodeURIComponent(this.generateQuoteText());
    window.location.href = `mailto:info@buildbridge.co.za?subject=${subject}&body=${body}`;
  }

  requestConsultation() {
    // Store quote data in session
    sessionStorage.setItem('buildbridge_quote', JSON.stringify({
      ...this.state,
      results: this.results,
      date: new Date().toISOString()
    }));
    
    // Redirect to contact page with quote data
    window.location.href = 'contact.html?source=cost-estimator';
  }

  generateQuoteText() {
    const format = (val) => this.options.currency + val.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
    
    return `
BuildBridge Project Estimate
============================

Project Details:
- Type: ${this.state.projectType.charAt(0).toUpperCase() + this.state.projectType.slice(1)}
- Size: ${this.state.projectSize} m²
- Finish Level: ${this.state.finishLevel.charAt(0).toUpperCase() + this.state.finishLevel.slice(1)}
- Timeline: ${this.state.urgency.charAt(0).toUpperCase() + this.state.urgency.slice(1)}

Cost Breakdown:
- Base Construction: ${format(this.results.baseCost)}
- Finish Premium: ${format(this.results.finishPremium)}
- Additional Services: ${format(this.results.extrasCost)}
${this.state.urgency !== 'normal' ? `- Urgency Adjustment: ${format(this.results.urgencyCost)}` : ''}
- Subtotal: ${format(this.results.subtotal)}
- VAT (15%): ${format(this.results.vat)}

TOTAL ESTIMATE: ${format(this.results.total)}

Notes: This estimate is based on industry averages. A detailed assessment is required for an accurate quote.

Please contact me to discuss this project further.
    `.trim();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const estimatorContainers = document.querySelectorAll('.cost-estimator-container');
  
  estimatorContainers.forEach(container => {
    window.costEstimator = new CostEstimatorWidget(container);
  });
});

export default CostEstimatorWidget;
