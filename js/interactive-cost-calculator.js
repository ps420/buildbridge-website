/**
 * INTERACTIVE COST CALCULATOR v35.0
 * Fortune 500 Real-time Project Estimator
 */

(function() {
  'use strict';

  // Calculator State
  const state = {
    projectSize: 150, // m²
    projectType: 'residential',
    qualityLevel: 'standard',
    features: [],
    location: 'urban'
  };

  // Pricing Configuration (ZAR)
  const pricing = {
    baseRates: {
      residential: { min: 8000, max: 12000, perSqm: true },
      commercial: { min: 10000, max: 15000, perSqm: true },
      industrial: { min: 6000, max: 9000, perSqm: true },
      renovation: { min: 4500, max: 8000, perSqm: true }
    },
    qualityMultipliers: {
      basic: 0.85,
      standard: 1.0,
      premium: 1.35,
      luxury: 1.8
    },
    featureCosts: {
      smartHome: { min: 150000, max: 450000, label: 'Smart Home Integration' },
      solar: { min: 200000, max: 800000, label: 'Solar Power System' },
      pool: { min: 300000, max: 1200000, label: 'Swimming Pool' },
      security: { min: 75000, max: 300000, label: 'Advanced Security' },
      landscaping: { min: 100000, max: 600000, label: 'Landscaping' },
      basement: { min: 400000, max: 1500000, label: 'Basement/Underground' },
      elevator: { min: 250000, max: 600000, label: 'Private Elevator' },
      wineCellar: { min: 180000, max: 500000, label: 'Wine Cellar' }
    },
    timelineBase: {
      residential: 4, // months per 100m²
      commercial: 3,
      industrial: 2.5,
      renovation: 2
    }
  };

  // DOM Elements Cache
  let elements = {};

  // Initialize Calculator
  function init() {
    if (!document.querySelector('.cost-calculator-section')) return;
    
    cacheElements();
    bindEvents();
    updateCalculation();
    
    console.log('✅ Cost Calculator initialized');
  }

  function cacheElements() {
    elements = {
      sizeSlider: document.querySelector('.calculator-slider[data-input="size"]'),
      sizeValue: document.querySelector('.input-value[data-output="size"]'),
      projectTypeOptions: document.querySelectorAll('.project-type-option'),
      qualityOptions: document.querySelectorAll('.quality-option'),
      featureCheckboxes: document.querySelectorAll('.feature-checkbox'),
      resultAmount: document.querySelector('.result-amount'),
      resultRange: document.querySelector('.result-range'),
      breakdownItems: document.querySelectorAll('.breakdown-item'),
      timelineValue: document.querySelector('.timeline-value'),
      timelineProgress: document.querySelector('.timeline-progress'),
      timelineBar: document.querySelector('.timeline-bar')
    };
  }

  function bindEvents() {
    // Project Size Slider
    if (elements.sizeSlider) {
      const track = elements.sizeSlider.querySelector('.calculator-slider-track');
      const thumb = elements.sizeSlider.querySelector('.calculator-slider-thumb');
      let isDragging = false;

      const updateSlider = (e) => {
        const rect = elements.sizeSlider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const value = Math.round(percent * 950 + 50); // 50 to 1000 m²
        
        state.projectSize = value;
        track.style.width = `${percent * 100}%`;
        thumb.style.left = `${percent * 100}%`;
        elements.sizeValue.textContent = `${value} m²`;
        updateCalculation();
      };

      thumb.addEventListener('mousedown', () => isDragging = true);
      thumb.addEventListener('touchstart', () => isDragging = true);
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          e.preventDefault();
          updateSlider(e);
        }
      });
      
      document.addEventListener('touchmove', (e) => {
        if (isDragging) {
          e.preventDefault();
          updateSlider(e);
        }
      });
      
      document.addEventListener('mouseup', () => isDragging = false);
      document.addEventListener('touchend', () => isDragging = false);
      
      elements.sizeSlider.addEventListener('click', updateSlider);
    }

    // Project Type Selection
    elements.projectTypeOptions.forEach(option => {
      option.addEventListener('click', () => {
        elements.projectTypeOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        state.projectType = option.dataset.type;
        updateCalculation();
      });
    });

    // Quality Level Selection
    elements.qualityOptions.forEach(option => {
      option.addEventListener('click', () => {
        elements.qualityOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        state.qualityLevel = option.dataset.quality;
        updateCalculation();
      });
    });

    // Feature Checkboxes
    elements.featureCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('selected');
        const feature = checkbox.dataset.feature;
        
        if (checkbox.classList.contains('selected')) {
          if (!state.features.includes(feature)) {
            state.features.push(feature);
          }
        } else {
          state.features = state.features.filter(f => f !== feature);
        }
        updateCalculation();
      });
    });

    // CTA Buttons
    const consultBtn = document.querySelector('.calculator-cta .btn-primary');
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        // Store estimate in localStorage for consultation form
        localStorage.setItem('buildbridge_estimate', JSON.stringify({
          ...state,
          estimate: calculateEstimate(),
          timestamp: new Date().toISOString()
        }));
        
        window.location.href = 'contact.html?estimate=true';
      });
    }
  }

  function calculateEstimate() {
    const baseRate = pricing.baseRates[state.projectType];
    const multiplier = pricing.qualityMultipliers[state.qualityLevel];
    
    // Base construction cost
    const baseMin = baseRate.min * state.projectSize * multiplier;
    const baseMax = baseRate.max * state.projectSize * multiplier;
    
    // Feature costs
    let featuresMin = 0;
    let featuresMax = 0;
    const featureBreakdown = [];
    
    state.features.forEach(featureKey => {
      const feature = pricing.featureCosts[featureKey];
      if (feature) {
        featuresMin += feature.min;
        featuresMax += feature.max;
        featureBreakdown.push({
          label: feature.label,
          min: feature.min,
          max: feature.max
        });
      }
    });
    
    const totalMin = baseMin + featuresMin;
    const totalMax = baseMax + featuresMax;
    
    // Calculate timeline
    const baseTimeline = pricing.timelineBase[state.projectType];
    const timelineMonths = Math.max(2, Math.round(baseTimeline * (state.projectSize / 100) * (state.qualityLevel === 'luxury' ? 1.5 : 1)));
    
    return {
      base: { min: baseMin, max: baseMax },
      features: { min: featuresMin, max: featuresMax, breakdown: featureBreakdown },
      total: { min: totalMin, max: totalMax },
      timeline: timelineMonths
    };
  }

  function formatCurrency(value) {
    if (value >= 1000000) {
      return `R${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `R${(value / 1000).toFixed(0)}K`;
    }
    return `R${value}`;
  }

  function updateCalculation() {
    const estimate = calculateEstimate();
    
    // Animate result update
    if (elements.resultAmount) {
      elements.resultAmount.classList.add('updating');
      setTimeout(() => elements.resultAmount.classList.remove('updating'), 300);
      
      // Display average estimate
      const avgEstimate = (estimate.total.min + estimate.total.max) / 2;
      elements.resultAmount.textContent = formatCurrency(avgEstimate);
    }
    
    if (elements.resultRange) {
      elements.resultRange.textContent = `Range: ${formatCurrency(estimate.total.min)} - ${formatCurrency(estimate.total.max)}`;
    }
    
    // Update breakdown
    updateBreakdown(estimate);
    
    // Update timeline
    if (elements.timelineValue) {
      elements.timelineValue.textContent = `${estimate.timeline} Months`;
    }
    if (elements.timelineProgress) {
      const maxTimeline = 36; // 3 years max
      const progressPercent = Math.min(100, (estimate.timeline / maxTimeline) * 100);
      elements.timelineProgress.style.width = `${progressPercent}%`;
    }
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('calculatorUpdate', { 
      detail: { state, estimate } 
    }));
  }

  function updateBreakdown(estimate) {
    const breakdowns = [
      { label: 'Construction Base', min: estimate.base.min, max: estimate.base.max },
      { label: 'Features & Add-ons', min: estimate.features.min, max: estimate.features.max },
      { label: 'Project Management', min: estimate.total.min * 0.08, max: estimate.total.max * 0.08 },
      { label: 'Contingency (10%)', min: estimate.total.min * 0.10, max: estimate.total.max * 0.10 }
    ];
    
    const breakdownItems = document.querySelectorAll('.breakdown-item');
    breakdownItems.forEach((item, index) => {
      if (breakdowns[index]) {
        const valueEl = item.querySelector('.breakdown-value');
        const bd = breakdowns[index];
        const avg = (bd.min + bd.max) / 2;
        valueEl.textContent = formatCurrency(avg);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global scope for debugging
  window.BuildBridgeCalculator = { state, pricing, calculateEstimate };

})();
