/* ========================================
   v100.0: Interactive Construction Cost Estimator
   Fortune 500 Quality Project Calculator
   ======================================== */

class ConstructionCostEstimator {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {
      projectType: null,
      squareMeters: 100,
      quality: null,
      location: '',
      timeline: 'standard'
    };
    
    // Pricing rates per m² in ZAR
    this.rates = {
      residential: {
        basic: { min: 8000, max: 12000 },
        standard: { min: 12000, max: 18000 },
        premium: { min: 18000, max: 25000 },
        luxury: { min: 25000, max: 40000 }
      },
      commercial: {
        basic: { min: 10000, max: 15000 },
        standard: { min: 15000, max: 22000 },
        premium: { min: 22000, max: 32000 },
        luxury: { min: 32000, max: 50000 }
      },
      renovation: {
        basic: { min: 6000, max: 10000 },
        standard: { min: 10000, max: 16000 },
        premium: { min: 16000, max: 24000 },
        luxury: { min: 24000, max: 35000 }
      },
      industrial: {
        basic: { min: 7000, max: 11000 },
        standard: { min: 11000, max: 16000 },
        premium: { min: 16000, max: 22000 },
        luxury: { min: 22000, max: 32000 }
      }
    };
    
    // Location multipliers
    this.locationMultipliers = {
      'Cape Town': 1.15,
      'Johannesburg': 1.0,
      'Pretoria': 0.95,
      'Durban': 0.95,
      'Port Elizabeth': 0.90,
      'Bloemfontein': 0.85,
      'other': 0.90
    };
    
    // Timeline factors
    this.timelineFactors = {
      urgent: 1.15,
      standard: 1.0,
      flexible: 0.95
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateStepIndicator();
    this.updateSizeDisplay();
  }
  
  bindEvents() {
    // Project type selection
    document.querySelectorAll('.project-type-card').forEach(card => {
      card.addEventListener('click', () => this.selectProjectType(card));
    });
    
    // Quality selection
    document.querySelectorAll('.quality-option').forEach(option => {
      option.addEventListener('click', () => this.selectQuality(option));
    });
    
    // Size slider
    const sizeSlider = document.querySelector('.size-slider');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        this.formData.squareMeters = parseInt(e.target.value);
        this.updateSizeDisplay();
      });
    }
    
    // Location input
    const locationInput = document.querySelector('#estimator-location');
    if (locationInput) {
      locationInput.addEventListener('change', (e) => {
        this.formData.location = e.target.value;
      });
    }
    
    // Timeline selection
    document.querySelectorAll('input[name="timeline"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.formData.timeline = e.target.value;
      });
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn.next').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });
    
    document.querySelectorAll('.nav-btn.prev').forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });
    
    // Calculate button
    const calculateBtn = document.querySelector('.nav-btn.calculate');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.calculateEstimate());
    }
    
    // Book consultation button
    const bookBtn = document.querySelector('.btn-book-consultation');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => this.bookConsultation());
    }
    
    // Download estimate button
    const downloadBtn = document.querySelector('.btn-download-estimate');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadEstimate());
    }
  }
  
  selectProjectType(card) {
    document.querySelectorAll('.project-type-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    this.formData.projectType = card.dataset.type;
    this.enableNextButton();
  }
  
  selectQuality(option) {
    document.querySelectorAll('.quality-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    this.formData.quality = option.dataset.quality;
    this.enableNextButton();
  }
  
  updateSizeDisplay() {
    const display = document.querySelector('.size-value-display .value');
    if (display) {
      display.textContent = this.formData.squareMeters.toLocaleString();
    }
  }
  
  enableNextButton() {
    const nextBtn = document.querySelector(`.form-step[data-step="${this.currentStep}"] .nav-btn.next`);
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }
  
  goToStep(step) {
    // Hide current step
    document.querySelector(`.form-step[data-step="${this.currentStep}"]`).classList.remove('active');
    
    // Show new step
    this.currentStep = step;
    document.querySelector(`.form-step[data-step="${this.currentStep}"]`).classList.add('active');
    
    this.updateStepIndicator();
    this.updateNavigationButtons();
  }
  
  updateStepIndicator() {
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index < this.currentStep - 1) {
        dot.classList.add('completed');
      } else if (index === this.currentStep - 1) {
        dot.classList.add('active');
      }
    });
  }
  
  updateNavigationButtons() {
    const currentStepEl = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
    const prevBtn = currentStepEl.querySelector('.nav-btn.prev');
    const nextBtn = currentStepEl.querySelector('.nav-btn.next');
    
    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }
  }
  
  calculateEstimate() {
    // Show loading
    const loading = document.querySelector('.calculator-loading');
    if (loading) loading.classList.add('active');
    
    // Simulate calculation delay
    setTimeout(() => {
      const estimate = this.computeCost();
      this.displayResults(estimate);
      
      if (loading) loading.classList.remove('active');
      
      // Hide empty state, show results
      document.querySelector('.results-empty').style.display = 'none';
      document.querySelector('.results-content').style.display = 'block';
      
      // Animate results
      this.animateResults(estimate);
    }, 1500);
  }
  
  computeCost() {
    const rates = this.rates[this.formData.projectType][this.formData.quality];
    const locationMult = this.locationMultipliers[this.formData.location] || 1.0;
    const timelineMult = this.timelineFactors[this.formData.timeline];
    
    const baseMin = rates.min * this.formData.squareMeters;
    const baseMax = rates.max * this.formData.squareMeters;
    
    const min = Math.round(baseMin * locationMult * timelineMult);
    const max = Math.round(baseMax * locationMult * timelineMult);
    const average = Math.round((min + max) / 2);
    
    // Breakdown calculations
    const materials = Math.round(average * 0.45);
    const labor = Math.round(average * 0.30);
    const overhead = Math.round(average * 0.15);
    const contingency = Math.round(average * 0.10);
    
    // Timeline estimate (rough approximation)
    const baseWeeks = Math.ceil(this.formData.squareMeters / 50);
    const timelineWeeks = this.formData.timeline === 'urgent' ? 
      Math.ceil(baseWeeks * 0.7) : 
      this.formData.timeline === 'flexible' ? 
        Math.ceil(baseWeeks * 1.2) : baseWeeks;
    
    return {
      min,
      max,
      average,
      breakdown: { materials, labor, overhead, contingency },
      timelineWeeks,
      perSquareMeter: Math.round(average / this.formData.squareMeters)
    };
  }
  
  displayResults(estimate) {
    // Main cost display
    const costEl = document.querySelector('.estimated-cost');
    if (costEl) {
      costEl.innerHTML = `R${this.formatCurrency(estimate.average)}`;
    }
    
    // Range
    const rangeEl = document.querySelector('.cost-range');
    if (rangeEl) {
      rangeEl.textContent = `Range: R${this.formatCurrency(estimate.min)} - R${this.formatCurrency(estimate.max)}`;
    }
    
    // Breakdown
    this.updateBreakdown(estimate.breakdown, estimate.average);
    
    // Timeline
    const timelineEl = document.querySelector('.timeline-value');
    if (timelineEl) {
      timelineEl.textContent = `${estimate.timelineWeeks} Weeks`;
    }
    
    const timelineBar = document.querySelector('.timeline-bar .fill');
    if (timelineBar) {
      const maxWeeks = 52;
      const percentage = Math.min((estimate.timelineWeeks / maxWeeks) * 100, 100);
      timelineBar.style.width = `${percentage}%`;
    }
    
    // Store for download
    this.lastEstimate = estimate;
  }
  
  updateBreakdown(breakdown, total) {
    const items = [
      { key: 'materials', label: 'Materials & Supplies', icon: '📦' },
      { key: 'labor', label: 'Labor & Craftsmanship', icon: '👷' },
      { key: 'overhead', label: 'Project Management', icon: '📊' },
      { key: 'contingency', label: 'Contingency', icon: '🛡️' }
    ];
    
    items.forEach(item => {
      const value = breakdown[item.key];
      const percentage = (value / total) * 100;
      
      const row = document.querySelector(`.breakdown-item[data-type="${item.key}"]`);
      if (row) {
        row.querySelector('.value').textContent = `R${this.formatCurrency(value)}`;
        row.querySelector('.bar-fill').style.width = `${percentage}%`;
      }
    });
  }
  
  animateResults(estimate) {
    // Animate cost counter
    const costEl = document.querySelector('.estimated-cost');
    if (costEl) {
      this.animateCounter(costEl, 0, estimate.average, 1500, 'R');
    }
    
    // Animate breakdown bars
    setTimeout(() => {
      document.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    }, 100);
  }
  
  animateCounter(element, start, end, duration, prefix = '') {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * easeOutQuart);
      
      element.textContent = prefix + this.formatCurrency(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  formatCurrency(value) {
    return value.toLocaleString('en-ZA');
  }
  
  bookConsultation() {
    // Store estimate in session and redirect
    sessionStorage.setItem('costEstimate', JSON.stringify({
      ...this.formData,
      ...this.lastEstimate,
      date: new Date().toISOString()
    }));
    
    // Show toast notification
    if (typeof showToast === 'function') {
      showToast('Redirecting to consultation booking...', 'info');
    }
    
    // Redirect to contact page with estimate data
    setTimeout(() => {
      window.location.href = 'contact.html?estimate=true';
    }, 1000);
  }
  
  downloadEstimate() {
    const estimate = {
      ...this.formData,
      ...this.lastEstimate,
      date: new Date().toLocaleDateString('en-ZA'),
      company: 'BuildBridge Construction Management'
    };
    
    // Create text content
    const content = `
BUILDBRIDGE CONSTRUCTION ESTIMATE
================================
Generated: ${estimate.date}

PROJECT DETAILS
---------------
Type: ${this.capitalizeFirst(estimate.projectType)}
Size: ${estimate.squareMeters} m²
Quality: ${this.capitalizeFirst(estimate.quality)}
Location: ${estimate.location || 'Not specified'}
Timeline: ${this.capitalizeFirst(estimate.timeline)}

COST ESTIMATE
-------------
Estimated Total: R${this.formatCurrency(estimate.average)}
Range: R${this.formatCurrency(estimate.min)} - R${this.formatCurrency(estimate.max)}
Rate: R${estimate.perSquareMeter} per m²

BREAKDOWN
---------
Materials & Supplies: R${this.formatCurrency(estimate.breakdown.materials)}
Labor & Craftsmanship: R${this.formatCurrency(estimate.breakdown.labor)}
Project Management: R${this.formatCurrency(estimate.breakdown.overhead)}
Contingency: R${this.formatCurrency(estimate.breakdown.contingency)}

ESTIMATED TIMELINE
------------------
${estimate.timelineWeeks} Weeks

Disclaimer: This is an estimate only. Actual costs may vary based on 
site conditions, material availability, and project specifications.
Contact BuildBridge for a detailed quotation.

📞 +27 66 120 0064
🌐 buildbridge.co.za
`;
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BuildBridge-Estimate-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
      showToast('Estimate downloaded successfully!', 'success');
    }
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const estimatorSection = document.querySelector('.cost-estimator-section');
  if (estimatorSection) {
    window.costEstimator = new ConstructionCostEstimator();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConstructionCostEstimator;
}
