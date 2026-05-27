/**
 * COST CALCULATOR PRO v29.0
 * Fortune 500 Quality Interactive Cost Estimator
 * Real-time calculations with animated visualizations
 */

(function() {
  'use strict';
  
  const CostCalculator = {
    // Configuration
    config: {
      baseRates: {
        residential: 8500,  // per sqm
        commercial: 12000,  // per sqm
        industrial: 9500,   // per sqm
        renovation: 6500,   // per sqm
        luxury: 18000       // per sqm
      },
      qualityMultipliers: {
        standard: 1.0,
        premium: 1.35,
        luxury: 1.85
      },
      locationMultipliers: {
        'western-cape': 1.0,
        'gauteng': 1.15,
        'kwazulu-natal': 0.95,
        'eastern-cape': 0.85,
        'other': 0.9
      },
      complexityMultipliers: {
        1: 1.0,   // Simple
        2: 1.1,   // Moderate
        3: 1.25,  // Complex
        4: 1.45,  // Highly Complex
        5: 1.7    // Extreme
      },
      costBreakdown: {
        materials: 0.42,
        labor: 0.28,
        overhead: 0.18,
        permits: 0.07,
        contingency: 0.05
      }
    },
    
    // State
    state: {
      projectType: 'residential',
      squareMeters: 150,
      qualityLevel: 'standard',
      location: 'western-cape',
      complexity: 2,
      stories: 1,
      totalCost: 0
    },
    
    // DOM Elements cache
    elements: {},
    
    /**
     * Initialize the calculator
     */
    init() {
      this.cacheElements();
      this.bindEvents();
      this.updateCalculations();
      this.createTooltip();
      console.log('🧮 Cost Calculator Pro initialized');
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
      this.elements = {
        // Inputs
        projectTypeBtns: document.querySelectorAll('.calculator-type-btn'),
        squareMeterSlider: document.getElementById('calc-square-meters'),
        squareMeterValue: document.querySelector('.calc-square-meters-value'),
        qualityBtns: document.querySelectorAll('.calculator-quality-btn'),
        locationSelect: document.getElementById('calc-location'),
        complexitySlider: document.getElementById('calc-complexity'),
        complexityValue: document.querySelector('.calc-complexity-value'),
        storiesSlider: document.getElementById('calc-stories'),
        storiesValue: document.querySelector('.calc-stories-value'),
        
        // Results
        totalCost: document.querySelector('.calculator-total'),
        breakdownItems: document.querySelectorAll('.calc-breakdown-value'),
        costBarFills: document.querySelectorAll('.calculator-cost-bar-fill'),
        timeEstimate: document.querySelector('.calculator-time-value'),
        
        // Sliders with fills
        sliders: document.querySelectorAll('.calculator-slider[data-fill-target]')
      };
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
      // Project type selection
      this.elements.projectTypeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const type = e.currentTarget.dataset.type;
          this.setProjectType(type);
        });
      });
      
      // Quality level selection
      this.elements.qualityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const quality = e.currentTarget.dataset.quality;
          this.setQualityLevel(quality);
        });
      });
      
      // Square meter slider
      if (this.elements.squareMeterSlider) {
        this.elements.squareMeterSlider.addEventListener('input', (e) => {
          this.setSquareMeters(parseInt(e.target.value));
        });
      }
      
      // Location select
      if (this.elements.locationSelect) {
        this.elements.locationSelect.addEventListener('change', (e) => {
          this.setLocation(e.target.value);
        });
      }
      
      // Complexity slider
      if (this.elements.complexitySlider) {
        this.elements.complexitySlider.addEventListener('input', (e) => {
          this.setComplexity(parseInt(e.target.value));
        });
      }
      
      // Stories slider
      if (this.elements.storiesSlider) {
        this.elements.storiesSlider.addEventListener('input', (e) => {
          this.setStories(parseInt(e.target.value));
        });
      }
      
      // Update slider fills on input
      this.elements.sliders.forEach(slider => {
        slider.addEventListener('input', () => this.updateSliderFill(slider));
        // Initial fill
        this.updateSliderFill(slider);
      });
      
      // Info tooltips
      document.querySelectorAll('.calculator-info-icon').forEach(icon => {
        icon.addEventListener('mouseenter', (e) => this.showTooltip(e));
        icon.addEventListener('mouseleave', () => this.hideTooltip());
      });
    },
    
    /**
     * Update slider fill
     */
    updateSliderFill(slider) {
      const min = parseInt(slider.min) || 0;
      const max = parseInt(slider.max) || 100;
      const value = parseInt(slider.value);
      const percentage = ((value - min) / (max - min)) * 100;
      
      const fillTarget = document.getElementById(slider.dataset.fillTarget);
      if (fillTarget) {
        fillTarget.style.width = `${percentage}%`;
      }
    },
    
    /**
     * Set project type
     */
    setProjectType(type) {
      this.state.projectType = type;
      
      // Update UI
      this.elements.projectTypeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
      });
      
      this.animateUpdate();
    },
    
    /**
     * Set quality level
     */
    setQualityLevel(quality) {
      this.state.qualityLevel = quality;
      
      // Update UI
      this.elements.qualityBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.quality === quality);
      });
      
      this.animateUpdate();
    },
    
    /**
     * Set square meters
     */
    setSquareMeters(sqm) {
      this.state.squareMeters = sqm;
      
      if (this.elements.squareMeterValue) {
        this.elements.squareMeterValue.textContent = `${sqm} m²`;
      }
      
      this.updateCalculations();
    },
    
    /**
     * Set location
     */
    setLocation(location) {
      this.state.location = location;
      this.animateUpdate();
    },
    
    /**
     * Set complexity
     */
    setComplexity(level) {
      this.state.complexity = level;
      
      if (this.elements.complexityValue) {
        const labels = ['Simple', 'Moderate', 'Complex', 'Very Complex', 'Extreme'];
        this.elements.complexityValue.textContent = labels[level - 1];
      }
      
      this.updateCalculations();
    },
    
    /**
     * Set number of stories
     */
    setStories(stories) {
      this.state.stories = stories;
      
      if (this.elements.storiesValue) {
        this.elements.storiesValue.textContent = stories === 1 ? 'Single' : `${stories} Stories`;
      }
      
      this.updateCalculations();
    },
    
    /**
     * Animate update
     */
    animateUpdate() {
      const resultsCard = document.querySelector('.calculator-results-card');
      if (resultsCard) {
        resultsCard.style.transform = 'scale(0.98)';
        setTimeout(() => {
          resultsCard.style.transform = '';
        }, 150);
      }
      
      this.updateCalculations();
    },
    
    /**
     * Calculate and update all values
     */
    updateCalculations() {
      const { projectType, squareMeters, qualityLevel, location, complexity, stories } = this.state;
      const { baseRates, qualityMultipliers, locationMultipliers, complexityMultipliers, costBreakdown } = this.config;
      
      // Calculate base cost
      const baseRate = baseRates[projectType] || baseRates.residential;
      const qualityMultiplier = qualityMultipliers[qualityLevel] || 1;
      const locationMultiplier = locationMultipliers[location] || 1;
      const complexityMultiplier = complexityMultipliers[complexity] || 1;
      const storiesMultiplier = 1 + ((stories - 1) * 0.15); // 15% per additional story
      
      let totalCost = baseRate * squareMeters * qualityMultiplier * locationMultiplier * complexityMultiplier * storiesMultiplier;
      
      // Round to nearest thousand
      totalCost = Math.round(totalCost / 1000) * 1000;
      
      this.state.totalCost = totalCost;
      
      // Update displays
      this.updateTotalDisplay(totalCost);
      this.updateBreakdown(totalCost, costBreakdown);
      this.updateTimeEstimate(squareMeters, complexity, stories);
    },
    
    /**
     * Update total cost display with animation
     */
    updateTotalDisplay(newValue) {
      const element = this.elements.totalCost;
      if (!element) return;
      
      const currentValue = this.parseCurrency(element.textContent) || 0;
      this.animateNumber(element, currentValue, newValue, 600);
    },
    
    /**
     * Animate number change
     */
    animateNumber(element, start, end, duration) {
      const startTime = performance.now();
      const formatNumber = (num) => {
        return 'R ' + num.toLocaleString('en-ZA');
      };
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutExpo)
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        
        const currentValue = Math.round(start + (end - start) * easeProgress);
        element.textContent = formatNumber(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    /**
     * Parse currency string to number
     */
    parseCurrency(str) {
      if (!str) return 0;
      return parseInt(str.replace(/[^0-9]/g, '')) || 0;
    },
    
    /**
     * Update cost breakdown
     */
    updateBreakdown(total, breakdown) {
      const categories = [
        { key: 'materials', icon: '🧱', label: 'Materials' },
        { key: 'labor', icon: '👷', label: 'Labor' },
        { key: 'overhead', icon: '🏢', label: 'Overhead' },
        { key: 'permits', icon: '📋', label: 'Permits' },
        { key: 'contingency', icon: '⚠️', label: 'Contingency' }
      ];
      
      // Update breakdown values
      categories.forEach((cat, index) => {
        const value = Math.round(total * breakdown[cat.key]);
        const elements = document.querySelectorAll('.calc-breakdown-value');
        if (elements[index]) {
          elements[index].textContent = 'R ' + value.toLocaleString('en-ZA');
        }
      });
      
      // Update cost bars
      const maxCost = total * Math.max(...Object.values(breakdown));
      categories.forEach((cat, index) => {
        const value = total * breakdown[cat.key];
        const percentage = (value / maxCost) * 100;
        const bars = document.querySelectorAll('.calculator-cost-bar-fill');
        if (bars[index]) {
          bars[index].style.width = `${percentage}%`;
        }
      });
    },
    
    /**
     * Update time estimate
     */
    updateTimeEstimate(sqm, complexity, stories) {
      // Base time calculation
      let baseMonths = Math.ceil(sqm / 50); // ~50sqm per month base
      
      // Complexity multiplier
      const complexityMultipliers = [0.8, 1, 1.3, 1.7, 2.2];
      baseMonths *= complexityMultipliers[complexity - 1] || 1;
      
      // Stories multiplier
      baseMonths *= (1 + (stories - 1) * 0.2);
      
      // Round to reasonable timeframe
      const totalMonths = Math.max(2, Math.ceil(baseMonths));
      
      let timeText;
      if (totalMonths < 12) {
        timeText = `${totalMonths} Months`;
      } else {
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        if (months === 0) {
          timeText = `${years} Year${years > 1 ? 's' : ''}`;
        } else {
          timeText = `${years}y ${months}m`;
        }
      }
      
      if (this.elements.timeEstimate) {
        this.elements.timeEstimate.textContent = timeText;
      }
    },
    
    /**
     * Create tooltip element
     */
    createTooltip() {
      if (document.querySelector('.calculator-tooltip')) return;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'calculator-tooltip';
      document.body.appendChild(tooltip);
      this.elements.tooltip = tooltip;
    },
    
    /**
     * Show tooltip
     */
    showTooltip(e) {
      const tooltip = this.elements.tooltip;
      if (!tooltip) return;
      
      const text = e.target.dataset.tooltip;
      if (!text) return;
      
      tooltip.textContent = text;
      tooltip.classList.add('visible');
      
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    },
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
      const tooltip = this.elements.tooltip;
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    },
    
    /**
     * Get current estimate as formatted object
     */
    getEstimate() {
      return {
        totalCost: this.state.totalCost,
        formattedTotal: 'R ' + this.state.totalCost.toLocaleString('en-ZA'),
        projectType: this.state.projectType,
        squareMeters: this.state.squareMeters,
        qualityLevel: this.state.qualityLevel,
        location: this.state.location,
        complexity: this.state.complexity,
        stories: this.state.stories
      };
    },
    
    /**
     * Export estimate (for email/quote)
     */
    exportEstimate() {
      const estimate = this.getEstimate();
      const breakdown = this.config.costBreakdown;
      
      return {
        ...estimate,
        breakdown: {
          materials: Math.round(estimate.totalCost * breakdown.materials),
          labor: Math.round(estimate.totalCost * breakdown.labor),
          overhead: Math.round(estimate.totalCost * breakdown.overhead),
          permits: Math.round(estimate.totalCost * breakdown.permits),
          contingency: Math.round(estimate.totalCost * breakdown.contingency)
        },
        timestamp: new Date().toISOString()
      };
    }
  };
  
  // Expose to global scope
  window.CostCalculator = CostCalculator;
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CostCalculator.init());
  } else {
    CostCalculator.init();
  }
})();
