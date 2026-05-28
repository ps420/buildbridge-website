/**
 * ROI Calculator Widget (v38.0)
 * Interactive project ROI estimator for construction projects
 */

class ROICalculator {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      currency: 'R',
      projectTypes: {
        residential: { multiplier: 1.15, label: 'Residential' },
        commercial: { multiplier: 1.25, label: 'Commercial' },
        industrial: { multiplier: 1.35, label: 'Industrial' }
      },
      qualityLevels: {
        standard: { multiplier: 1.0, label: 'Standard' },
        premium: { multiplier: 1.3, label: 'Premium' },
        luxury: { multiplier: 1.8, label: 'Luxury' }
      },
      onCalculate: null,
      onSave: null,
      onContact: null,
      ...options
    };
    
    this.state = {
      projectValue: 1000000,
      projectType: 'residential',
      qualityLevel: 'standard',
      timeline: 12,
      includesManagement: true,
      includesDesign: false,
      includesPermits: true
    };
    
    this.cache = {};
    
    this.init();
  }
  
  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateDisplay();
    this.animateEntrance();
  }
  
  cacheElements() {
    // Input elements
    this.projectValueInput = this.container.querySelector('[data-input="project-value"]');
    this.projectValueDisplay = this.container.querySelector('[data-display="project-value"]');
    this.projectTypeBtns = this.container.querySelectorAll('[data-project-type]');
    this.qualityBtns = this.container.querySelectorAll('[data-quality]');
    this.timelineInput = this.container.querySelector('[data-input="timeline"]');
    this.timelineDisplay = this.container.querySelector('[data-display="timeline"]');
    this.checkboxes = this.container.querySelectorAll('[data-checkbox]');
    
    // Output elements
    this.roiDisplay = this.container.querySelector('[data-output="roi"]');
    this.totalValueDisplay = this.container.querySelector('[data-output="total-value"]');
    this.managementCostDisplay = this.container.querySelector('[data-output="management-cost"]');
    this.savingsDisplay = this.container.querySelector('[data-output="savings"]');
    this.breakdownBars = this.container.querySelectorAll('[data-breakdown-bar]');
    this.chartBars = this.container.querySelectorAll('[data-chart-bar]');
    
    // Action buttons
    this.ctaBtn = this.container.querySelector('[data-action="contact"]');
    this.saveBtn = this.container.querySelector('[data-action="save"]');
    this.shareBtn = this.container.querySelector('[data-action="share"]');
  }
  
  bindEvents() {
    // Project value slider
    if (this.projectValueInput) {
      this.projectValueInput.addEventListener('input', (e) => {
        this.state.projectValue = parseInt(e.target.value);
        this.updateDisplay();
        this.debounceCalculate();
      });
    }
    
    // Project type buttons
    this.projectTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.projectType = btn.dataset.projectType;
        this.updateProjectTypeUI();
        this.debounceCalculate();
      });
    });
    
    // Quality level buttons
    this.qualityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.qualityLevel = btn.dataset.quality;
        this.updateQualityUI();
        this.debounceCalculate();
      });
    });
    
    // Timeline slider
    if (this.timelineInput) {
      this.timelineInput.addEventListener('input', (e) => {
        this.state.timeline = parseInt(e.target.value);
        this.updateTimelineDisplay();
        this.debounceCalculate();
      });
    }
    
    // Checkboxes
    this.checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', () => {
        const key = checkbox.dataset.checkbox;
        this.state[key] = !this.state[key];
        this.updateCheckboxUI(checkbox);
        this.debounceCalculate();
      });
    });
    
    // CTA button
    if (this.ctaBtn) {
      this.ctaBtn.addEventListener('click', () => {
        this.handleContact();
      });
    }
    
    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        this.handleSave();
      });
    }
    
    // Share button
    if (this.shareBtn) {
      this.shareBtn.addEventListener('click', () => {
        this.handleShare();
      });
    }
  }
  
  debounceCalculate() {
    clearTimeout(this.calculateTimeout);
    this.calculateTimeout = setTimeout(() => this.calculate(), 100);
  }
  
  calculate() {
    const { projectValue, projectType, qualityLevel, timeline, includesManagement, includesDesign, includesPermits } = this.state;
    
    // Get multipliers
    const typeMultiplier = this.options.projectTypes[projectType].multiplier;
    const qualityMultiplier = this.options.qualityLevels[qualityLevel].multiplier;
    
    // Calculate base costs
    const baseManagementFee = 0.08; // 8% base management fee
    const managementFee = includesManagement ? baseManagementFee * typeMultiplier : 0;
    const designFee = includesDesign ? 0.05 : 0;
    const permitFee = includesPermits ? 0.02 : 0;
    
    // Timeline impact (longer timelines cost more)
    const timelineMultiplier = 1 + (timeline - 6) * 0.01;
    
    // Calculate total management cost
    const totalManagementCost = projectValue * (managementFee + designFee + permitFee) * timelineMultiplier * qualityMultiplier;
    
    // Calculate estimated value increase from professional management
    const valueIncrease = projectValue * (0.15 * typeMultiplier - 0.05); // 10-15% value increase
    
    // Calculate savings from avoiding overruns
    const overrunSavings = projectValue * 0.12; // 12% typical savings
    
    // Total ROI
    const totalROI = valueIncrease + overrunSavings - totalManagementCost;
    const roiPercentage = (totalROI / projectValue) * 100;
    
    // Calculate 5-year projection
    const projections = [];
    for (let year = 1; year <= 5; year++) {
      const appreciation = projectValue * Math.pow(1.06, year); // 6% annual appreciation
      const accumulatedROI = totalROI * year;
      projections.push({
        year,
        totalValue: appreciation + accumulatedROI,
        roi: accumulatedROI
      });
    }
    
    this.cache = {
      totalManagementCost,
      valueIncrease,
      overrunSavings,
      totalROI,
      roiPercentage,
      projections,
      finalValue: projectValue + totalROI
    };
    
    this.updateResults();
    this.updateChart(projections);
    
    if (this.options.onCalculate) {
      this.options.onCalculate(this.cache);
    }
  }
  
  updateDisplay() {
    // Update slider displays
    if (this.projectValueDisplay) {
      this.projectValueDisplay.textContent = this.formatCurrency(this.state.projectValue);
    }
    
    this.updateTimelineDisplay();
    this.updateProjectTypeUI();
    this.updateQualityUI();
    
    // Update checkbox states
    this.checkboxes.forEach(checkbox => {
      this.updateCheckboxUI(checkbox);
    });
  }
  
  updateTimelineDisplay() {
    if (this.timelineDisplay) {
      this.timelineDisplay.textContent = `${this.state.timeline} months`;
    }
  }
  
  updateProjectTypeUI() {
    this.projectTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.projectType === this.state.projectType);
    });
  }
  
  updateQualityUI() {
    this.qualityBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quality === this.state.qualityLevel);
    });
  }
  
  updateCheckboxUI(checkbox) {
    const key = checkbox.dataset.checkbox;
    checkbox.classList.toggle('checked', this.state[key]);
  }
  
  updateResults() {
    const { roiPercentage, totalManagementCost, valueIncrease, overrunSavings, totalROI, finalValue } = this.cache;
    
    // Animate ROI percentage
    if (this.roiDisplay) {
      this.animateNumber(this.roiDisplay, roiPercentage, '%', 1);
    }
    
    // Update breakdown values
    if (this.totalValueDisplay) {
      this.totalValueDisplay.textContent = this.formatCurrency(finalValue);
    }
    
    if (this.managementCostDisplay) {
      this.managementCostDisplay.textContent = this.formatCurrency(totalManagementCost);
    }
    
    if (this.savingsDisplay) {
      this.savingsDisplay.textContent = this.formatCurrency(totalROI);
      this.savingsDisplay.classList.toggle('positive', totalROI > 0);
      this.savingsDisplay.classList.toggle('negative', totalROI < 0);
    }
    
    // Update breakdown bars
    if (this.breakdownBars.length) {
      const max = Math.max(valueIncrease, overrunSavings, totalManagementCost, 1);
      
      this.breakdownBars.forEach(bar => {
        const type = bar.dataset.breakdownBar;
        let value = 0;
        let percentage = 0;
        
        switch (type) {
          case 'value-increase':
            value = valueIncrease;
            percentage = (value / max) * 100;
            break;
          case 'savings':
            value = overrunSavings;
            percentage = (value / max) * 100;
            break;
          case 'cost':
            value = totalManagementCost;
            percentage = (value / max) * 100;
            break;
        }
        
        const fill = bar.querySelector('.roi-breakdown-fill') || bar;
        if (fill) {
          fill.style.width = `${percentage}%`;
          fill.classList.toggle('green', type !== 'cost');
          fill.classList.toggle('red', type === 'cost');
        }
      });
    }
  }
  
  updateChart(projections) {
    if (!this.chartBars.length) return;
    
    const maxValue = Math.max(...projections.map(p => p.totalValue));
    
    this.chartBars.forEach((bar, index) => {
      const projection = projections[index];
      if (projection) {
        const height = (projection.totalValue / maxValue) * 100;
        bar.style.height = `${Math.max(height, 20)}%`;
        bar.dataset.year = `Year ${projection.year}`;
        bar.dataset.value = this.formatCurrencyShort(projection.totalValue);
        bar.classList.toggle('active', index === projections.length - 1);
        
        // Animate height
        setTimeout(() => {
          bar.style.height = `${Math.max(height, 20)}%`;
        }, index * 100);
      }
    });
  }
  
  animateNumber(element, value, suffix = '', decimals = 0) {
    const start = parseFloat(element.dataset.value) || 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      element.textContent = current.toFixed(decimals) + suffix;
      element.dataset.value = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  formatCurrency(value) {
    return this.options.currency + ' ' + value.toLocaleString('en-ZA');
  }
  
  formatCurrencyShort(value) {
    if (value >= 1000000) {
      return this.options.currency + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return this.options.currency + (value / 1000).toFixed(0) + 'K';
    }
    return this.options.currency + value.toLocaleString('en-ZA');
  }
  
  handleContact() {
    // Build query params with calculator results
    const params = new URLSearchParams({
      project_value: this.state.projectValue,
      project_type: this.state.projectType,
      roi_estimate: this.cache.roiPercentage.toFixed(1),
      source: 'roi_calculator'
    });
    
    // Show success message
    this.showSuccess('Your estimate has been saved. Redirecting to contact form...');
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = `contact.html?${params.toString()}`;
    }, 1500);
    
    if (this.options.onContact) {
      this.options.onContact(this.state, this.cache);
    }
  }
  
  handleSave() {
    // Save to localStorage
    const saveData = {
      timestamp: new Date().toISOString(),
      inputs: this.state,
      results: this.cache
    };
    
    const saved = JSON.parse(localStorage.getItem('roi_calculations') || '[]');
    saved.push(saveData);
    localStorage.setItem('roi_calculations', JSON.stringify(saved.slice(-10))); // Keep last 10
    
    this.showSuccess('Calculation saved successfully!');
    
    if (this.options.onSave) {
      this.options.onSave(saveData);
    }
  }
  
  handleShare() {
    const shareData = {
      title: 'BuildBridge ROI Calculator',
      text: `My construction project ROI estimate: ${this.cache.roiPercentage.toFixed(1)}% return with BuildBridge professional management`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }
  
  copyToClipboard() {
    const text = `${shareData.text}\n\n${shareData.url}`;
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess('Results copied to clipboard!');
    });
  }
  
  showSuccess(message) {
    const successEl = this.container.querySelector('.roi-success-message');
    if (successEl) {
      successEl.querySelector('span').textContent = message;
      successEl.classList.add('visible');
      setTimeout(() => successEl.classList.remove('visible'), 3000);
    }
  }
  
  animateEntrance() {
    const elements = this.container.querySelectorAll('.roi-input-group, .roi-result-card');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
    // Trigger initial calculation
    setTimeout(() => this.calculate(), 500);
  }
  
  // Public API
  getResults() {
    return this.cache;
  }
  
  setValues(values) {
    this.state = { ...this.state, ...values };
    this.updateDisplay();
    this.calculate();
  }
  
  reset() {
    this.state = {
      projectValue: 1000000,
      projectType: 'residential',
      qualityLevel: 'standard',
      timeline: 12,
      includesManagement: true,
      includesDesign: false,
      includesPermits: true
    };
    this.updateDisplay();
    this.calculate();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-roi-calculator]').forEach(el => {
    new ROICalculator(el);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ROICalculator;
}
