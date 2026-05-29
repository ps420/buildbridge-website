/**
 * v73.0: Interactive Pricing Calculator
 * Dynamic Project Estimator with Animations
 */

(function() {
  'use strict';

  const PricingCalculator = {
    config: {
      currencySymbol: 'R',
      minPrice: 50000,
      maxPrice: 5000000,
      animationDuration: 500
    },

    state: {
      currentStep: 1,
      projectType: null,
      squareMeters: 100,
      rooms: 3,
      features: [],
      finishLevel: 'standard'
    },

    data: {
      projectTypes: [
        { id: 'residential', name: 'Residential', icon: '🏠', basePrice: 15000, unit: 'per m²' },
        { id: 'commercial', name: 'Commercial', icon: '🏢', basePrice: 18000, unit: 'per m²' },
        { id: 'renovation', name: 'Renovation', icon: '🔨', basePrice: 12000, unit: 'per m²' },
        { id: 'extension', name: 'Extension', icon: '📐', basePrice: 14000, unit: 'per m²' }
      ],
      features: [
        { id: 'smart-home', name: 'Smart Home System', description: 'Automation & Controls', price: 45000 },
        { id: 'solar', name: 'Solar Installation', description: '5kW Solar System', price: 85000 },
        { id: 'pool', name: 'Swimming Pool', description: 'Concrete Pool', price: 180000 },
        { id: 'landscaping', name: 'Landscaping', description: 'Garden Design', price: 35000 },
        { id: 'security', name: 'Security System', description: 'CCTV & Alarm', price: 25000 },
        { id: 'garage', name: 'Double Garage', description: 'Automated Doors', price: 120000 }
      ],
      finishMultipliers: {
        basic: 0.85,
        standard: 1.0,
        premium: 1.35,
        luxury: 1.85
      }
    },

    init() {
      this.container = document.querySelector('.pricing-calculator');
      if (!this.container) return;

      this.renderStep1();
      this.renderStep2();
      this.renderStep3();
      this.bindEvents();
      this.updatePrice();
      this.updateProgress();
    },

    renderStep1() {
      const step = this.container.querySelector('#calculator-step-1 .project-type-grid');
      if (!step) return;

      step.innerHTML = this.data.projectTypes.map(type => `
        <div class="project-type-card" data-type="${type.id}">
          <div class="project-type-icon">${type.icon}</div>
          <div class="project-type-name">${type.name}</div>
          <div class="project-type-price">From ${this.config.currencySymbol}${type.basePrice.toLocaleString()} ${type.unit}</div>
        </div>
      `).join('');
    },

    renderStep2() {
      const step = this.container.querySelector('#calculator-step-2');
      if (!step) return;

      // Sliders are static in HTML, update values dynamically
    },

    renderStep3() {
      const step = this.container.querySelector('#calculator-step-3 .calculator-features');
      if (!step) return;

      step.innerHTML = this.data.features.map(feature => `
        <div class="calculator-feature" data-feature="${feature.id}">
          <div class="calculator-feature-checkbox"></div>
          <div class="calculator-feature-text">
            <div class="calculator-feature-name">${feature.name}</div>
            <div class="calculator-feature-desc">${feature.description}</div>
          </div>
          <div class="calculator-feature-price">+${this.config.currencySymbol}${feature.price.toLocaleString()}</div>
        </div>
      `).join('');
    },

    bindEvents() {
      // Project type selection
      this.container.querySelectorAll('.project-type-card').forEach(card => {
        card.addEventListener('click', () => {
          this.container.querySelectorAll('.project-type-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.state.projectType = card.dataset.type;
          this.updatePrice();
        });
      });

      // Feature toggles
      this.container.querySelectorAll('.calculator-feature').forEach(feature => {
        feature.addEventListener('click', () => {
          feature.classList.toggle('selected');
          const featureId = feature.dataset.feature;
          
          if (feature.classList.contains('selected')) {
            if (!this.state.features.includes(featureId)) {
              this.state.features.push(featureId);
            }
          } else {
            this.state.features = this.state.features.filter(f => f !== featureId);
          }
          
          this.updatePrice();
        });
      });

      // Slider interactions
      this.setupSliders();

      // Navigation
      this.container.querySelectorAll('.calculator-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const direction = btn.classList.contains('calculator-nav-btn--next') ? 1 : -1;
          this.navigate(direction);
        });
      });
    },

    setupSliders() {
      this.container.querySelectorAll('.calculator-slider').forEach(slider => {
        const track = slider.querySelector('.calculator-slider-track');
        const thumb = slider.querySelector('.calculator-slider-thumb');
        const valueDisplay = slider.closest('.calculator-slider-group')?.querySelector('.calculator-slider-value');
        const min = parseFloat(slider.dataset.min) || 0;
        const max = parseFloat(slider.dataset.max) || 100;
        const step = parseFloat(slider.dataset.step) || 1;
        const param = slider.dataset.param;

        let isDragging = false;

        const updateSlider = (clientX) => {
          const rect = slider.getBoundingClientRect();
          const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          const value = Math.round((min + percentage * (max - min)) / step) * step;
          
          track.style.width = (percentage * 100) + '%';
          thumb.style.left = (percentage * 100) + '%';
          
          if (valueDisplay) {
            const suffix = slider.dataset.suffix || '';
            valueDisplay.textContent = value.toLocaleString() + suffix;
          }
          
          if (param) {
            this.state[param] = value;
            this.updatePrice();
          }
        };

        thumb.addEventListener('mousedown', (e) => {
          isDragging = true;
          e.preventDefault();
        });

        slider.addEventListener('click', (e) => {
          if (e.target !== thumb) {
            updateSlider(e.clientX);
          }
        });

        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            updateSlider(e.clientX);
          }
        });

        document.addEventListener('mouseup', () => {
          isDragging = false;
        });

        // Touch support
        thumb.addEventListener('touchstart', (e) => {
          isDragging = true;
        });

        document.addEventListener('touchmove', (e) => {
          if (isDragging) {
            updateSlider(e.touches[0].clientX);
          }
        });

        document.addEventListener('touchend', () => {
          isDragging = false;
        });
      });
    },

    navigate(direction) {
      const newStep = this.state.currentStep + direction;
      
      if (newStep < 1 || newStep > 3) return;
      
      // Validation
      if (direction > 0 && this.state.currentStep === 1 && !this.state.projectType) {
        this.showToast('Please select a project type');
        return;
      }

      // Hide current step
      const currentStepEl = this.container.querySelector(`#calculator-step-${this.state.currentStep}`);
      currentStepEl?.classList.remove('active');

      // Show new step
      this.state.currentStep = newStep;
      const newStepEl = this.container.querySelector(`#calculator-step-${newStep}`);
      newStepEl?.classList.add('active');

      this.updateProgress();
      this.updateNavButtons();
    },

    updateProgress() {
      const progressFill = this.container.querySelector('.calculator-progress-line-fill');
      const steps = this.container.querySelectorAll('.calculator-progress-step');
      
      if (progressFill) {
        const progress = ((this.state.currentStep - 1) / 2) * 100;
        progressFill.style.width = progress + '%';
      }

      steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < this.state.currentStep) {
          step.classList.add('completed');
        } else if (index + 1 === this.state.currentStep) {
          step.classList.add('active');
        }
      });
    },

    updateNavButtons() {
      const prevBtn = this.container.querySelector('.calculator-nav-btn--prev');
      const nextBtn = this.container.querySelector('.calculator-nav-btn--next');
      
      if (prevBtn) {
        prevBtn.style.visibility = this.state.currentStep === 1 ? 'hidden' : 'visible';
      }
      
      if (nextBtn) {
        if (this.state.currentStep === 3) {
          nextBtn.textContent = 'Get Quote →';
          nextBtn.classList.add('calculator-nav-btn--submit');
          nextBtn.onclick = () => this.submitQuote();
        } else {
          nextBtn.textContent = 'Next →';
          nextBtn.classList.remove('calculator-nav-btn--submit');
        }
      }
    },

    calculatePrice() {
      if (!this.state.projectType) return 0;

      const type = this.data.projectTypes.find(t => t.id === this.state.projectType);
      if (!type) return 0;

      // Base calculation
      let basePrice = type.basePrice * this.state.squareMeters;
      
      // Rooms adjustment
      basePrice += (this.state.rooms - 3) * 50000;

      // Features
      const featuresPrice = this.state.features.reduce((total, featureId) => {
        const feature = this.data.features.find(f => f.id === featureId);
        return total + (feature?.price || 0);
      }, 0);

      // Apply finish multiplier
      const multiplier = this.data.finishMultipliers[this.state.finishLevel] || 1;
      
      return Math.round((basePrice + featuresPrice) * multiplier);
    },

    updatePrice() {
      const price = this.calculatePrice();
      const display = this.container.querySelector('.price-amount');
      const rangeFill = this.container.querySelector('.price-range-fill');
      
      if (display) {
        this.animateNumber(display, parseInt(display.dataset.value) || 0, price);
        display.dataset.value = price;
      }

      if (rangeFill) {
        const percentage = Math.min(100, (price / this.config.maxPrice) * 100);
        rangeFill.style.width = percentage + '%';
      }

      this.updateBreakdown();
    },

    animateNumber(element, start, end) {
      const duration = 500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeProgress);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },

    updateBreakdown() {
      const container = this.container.querySelector('.price-breakdown');
      if (!container || !this.state.projectType) return;

      const type = this.data.projectTypes.find(t => t.id === this.state.projectType);
      const basePrice = type ? type.basePrice * this.state.squareMeters : 0;
      const featuresPrice = this.state.features.reduce((total, fid) => {
        const f = this.data.features.find(feat => feat.id === fid);
        return total + (f?.price || 0);
      }, 0);

      // Simple breakdown - could be expanded
      const multiplier = this.data.finishMultipliers[this.state.finishLevel] || 1;
      const finishLabel = this.state.finishLevel.charAt(0).toUpperCase() + this.state.finishLevel.slice(1);

      container.innerHTML = `
        <div class="price-breakdown-item">
          <span class="price-breakdown-label">
            <span class="price-breakdown-dot" style="background: #C9CED6;"></span>
            Base (${type?.name})
          </span>
          <span class="price-breakdown-value">${this.config.currencySymbol}${basePrice.toLocaleString()}</span>
        </div>
        ${featuresPrice > 0 ? `
        <div class="price-breakdown-item">
          <span class="price-breakdown-label">
            <span class="price-breakdown-dot" style="background: #8A9199;"></span>
            Features (${this.state.features.length})
          </span>
          <span class="price-breakdown-value">${this.config.currencySymbol}${featuresPrice.toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="price-breakdown-item">
          <span class="price-breakdown-label">
            <span class="price-breakdown-dot" style="background: #6B7280;"></span>
            ${finishLabel} Finish
          </span>
          <span class="price-breakdown-value">x${multiplier}</span>
        </div>
        <div class="price-breakdown-item price-breakdown-item--total">
          <span class="price-breakdown-label">Estimated Total</span>
          <span class="price-breakdown-value">${this.config.currencySymbol}${this.calculatePrice().toLocaleString()}</span>
        </div>
      `;
    },

    submitQuote() {
      const price = this.calculatePrice();
      
      // Show success
      const form = this.container.querySelector('.calculator-form');
      form.innerHTML = `
        <div class="calculator-result">
          <div class="calculator-result-icon">✓</div>
          <h3 class="calculator-result-title">Quote Ready!</h3>
          <p class="calculator-result-text">
            Your estimated project cost is <strong>${this.config.currencySymbol}${price.toLocaleString()}</strong>.
            Contact us for a detailed consultation and final quote.
          </p>
          <a href="https://wa.me/27661200064?text=Hi! I got a quote of ${this.config.currencySymbol}${price.toLocaleString()} for a ${this.state.projectType} project. Can we discuss?" 
             class="btn" target="_blank">Discuss on WhatsApp</a>
        </div>
      `;
    },

    showToast(message) {
      // Simple toast implementation
      const toast = document.createElement('div');
      toast.className = 'pricing-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f0f10;
        color: #C9CED6;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        z-index: 9999;
        border: 1px solid rgba(201, 206, 214, 0.2);
        animation: toast-in 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  // Add toast animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PricingCalculator.init());
  } else {
    PricingCalculator.init();
  }

  window.BuildBridgePricing = PricingCalculator;
})();
