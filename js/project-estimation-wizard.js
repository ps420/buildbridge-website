/**
 * Project Estimation Wizard v126.2
 * Fortune 500 Interactive Project Cost Calculator
 */

(function() {
  'use strict';

  class ProjectEstimationWizard {
    constructor() {
      this.currentStep = 1;
      this.totalSteps = 4;
      this.data = {
        projectType: null,
        size: 100,
        features: [],
        location: null
      };
      this.pricing = {
        residential: { base: 8000, perSqm: 1200 },
        commercial: { base: 15000, perSqm: 1800 },
        industrial: { base: 25000, perSqm: 2200 },
        mixed: { base: 20000, perSqm: 2000 }
      };
      
      this.init();
    }

    init() {
      this.createMarkup();
      this.bindEvents();
    }

    createMarkup() {
      // Check if markup already exists
      if (document.getElementById('projectWizardOverlay')) return;

      const markup = `
        <div class="project-wizard-overlay" id="projectWizardOverlay">
          <div class="project-wizard-container">
            <div class="project-wizard-header">
              <div class="project-wizard-title">Cost Estimator</div>
              <button class="project-wizard-close" aria-label="Close">✕</button>
            </div>
            
            <div class="project-wizard-progress">
              <div class="wizard-progress-step">
                <span class="wizard-step-number active" data-step="1">1</span>
              </div>
              <div class="wizard-step-line"></div>
              <div class="wizard-progress-step">
                <span class="wizard-step-number" data-step="2">2</span>
              </div>
              <div class="wizard-step-line"></div>
              <div class="wizard-progress-step">
                <span class="wizard-step-number" data-step="3">3</span>
              </div>
              <div class="wizard-step-line"></div>
              <div class="wizard-progress-step">
                <span class="wizard-step-number" data-step="4">4</span>
              </div>
            </div>
            
            <div class="project-wizard-content">
              <!-- Step 1: Project Type -->
              <div class="wizard-step active" data-step="1">
                <div class="wizard-step-header">
                  <h3 class="wizard-step-title">What are you building?</h3>
                  <p class="wizard-step-subtitle">Select the type of project to get started with your estimate</p>
                </div>
                <div class="wizard-project-types">
                  <div class="wizard-project-card" data-type="residential">
                    <div class="wizard-project-icon">🏠</div>
                    <div class="wizard-project-name">Residential</div>
                    <div class="wizard-project-desc">Homes, apartments, renovations</div>
                  </div>
                  <div class="wizard-project-card" data-type="commercial">
                    <div class="wizard-project-icon">🏢</div>
                    <div class="wizard-project-name">Commercial</div>
                    <div class="wizard-project-desc">Offices, retail, hospitality</div>
                  </div>
                  <div class="wizard-project-card" data-type="industrial">
                    <div class="wizard-project-icon">🏭</div>
                    <div class="wizard-project-name">Industrial</div>
                    <div class="wizard-project-desc">Warehouses, factories, plants</div>
                  </div>
                </div>
              </div>
              
              <!-- Step 2: Size -->
              <div class="wizard-step" data-step="2">
                <div class="wizard-step-header">
                  <h3 class="wizard-step-title">Project Size</h3>
                  <p class="wizard-step-subtitle">Adjust the slider to match your project size in square meters</p>
                </div>
                <div class="wizard-range-container">
                  <div class="wizard-range-value"><span id="sizeValue">100</span> m²</div>
                  <input type="range" class="wizard-range-slider" id="sizeSlider" min="50" max="5000" value="100" step="10">
                  <div class="wizard-range-labels">
                    <span>50 m²</span>
                    <span>5000+ m²</span>
                  </div>
                </div>
              </div>
              
              <!-- Step 3: Features -->
              <div class="wizard-step" data-step="3">
                <div class="wizard-step-header">
                  <h3 class="wizard-step-title">Additional Features</h3>
                  <p class="wizard-step-subtitle">Select features that apply to your project</p>
                </div>
                <div class="wizard-features">
                  <div class="wizard-feature-item" data-feature="premium-finish">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Premium Finishes</span>
                    <span class="wizard-feature-price">+R 250k</span>
                  </div>
                  <div class="wizard-feature-item" data-feature="smart-home">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Smart Home Integration</span>
                    <span class="wizard-feature-price">+R 180k</span>
                  </div>
                  <div class="wizard-feature-item" data-feature="solar">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Solar Power System</span>
                    <span class="wizard-feature-price">+R 320k</span>
                  </div>
                  <div class="wizard-feature-item" data-feature="security">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Advanced Security</span>
                    <span class="wizard-feature-price">+R 95k</span>
                  </div>
                  <div class="wizard-feature-item" data-feature="landscaping">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Landscaping</span>
                    <span class="wizard-feature-price">+R 150k</span>
                  </div>
                  <div class="wizard-feature-item" data-feature="pool">
                    <div class="wizard-feature-checkbox">✓</div>
                    <span class="wizard-feature-text">Swimming Pool</span>
                    <span class="wizard-feature-price">+R 450k</span>
                  </div>
                </div>
              </div>
              
              <!-- Step 4: Results -->
              <div class="wizard-step" data-step="4">
                <div class="wizard-step-header">
                  <h3 class="wizard-step-title">Your Estimate</h3>
                  <p class="wizard-step-subtitle">Based on your selections, here's what to expect</p>
                </div>
                <div class="wizard-results">
                  <div class="wizard-estimate-container">
                    <div class="wizard-estimate-label">Estimated Project Cost</div>
                    <div class="wizard-estimate-value" id="estimateValue">R 0</div>
                    <div class="wizard-estimate-range">Range: <span id="estimateRange">R 0 - R 0</span></div>
                  </div>
                  <div class="wizard-breakdown">
                    <div class="wizard-breakdown-item">
                      <div class="wizard-breakdown-label">Base Cost</div>
                      <div class="wizard-breakdown-value" id="breakdownBase">R 0</div>
                    </div>
                    <div class="wizard-breakdown-item">
                      <div class="wizard-breakdown-label">Per m²</div>
                      <div class="wizard-breakdown-value" id="breakdownSqm">R 0</div>
                    </div>
                    <div class="wizard-breakdown-item">
                      <div class="wizard-breakdown-label">Features</div>
                      <div class="wizard-breakdown-value" id="breakdownFeatures">R 0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="project-wizard-nav">
              <button class="wizard-btn wizard-btn-secondary" id="wizardBack" disabled>Back</button>
              <button class="wizard-btn wizard-btn-primary" id="wizardNext">Next →</button>
            </div>
          </div>
        </div>
        
        <button class="project-wizard-trigger" id="projectWizardTrigger">
          <span>🧮</span>
          Get Estimate
        </button>
      `;

      document.body.insertAdjacentHTML('beforeend', markup);
    }

    bindEvents() {
      // Trigger button
      const trigger = document.getElementById('projectWizardTrigger');
      if (trigger) {
        trigger.addEventListener('click', () => this.open());
      }

      // Close button
      const closeBtn = document.querySelector('.project-wizard-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      // Overlay click
      const overlay = document.getElementById('projectWizardOverlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.close();
        });
      }

      // Navigation buttons
      const backBtn = document.getElementById('wizardBack');
      const nextBtn = document.getElementById('wizardNext');
      if (backBtn) backBtn.addEventListener('click', () => this.prevStep());
      if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());

      // Project type selection
      document.querySelectorAll('.wizard-project-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.wizard-project-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.data.projectType = card.dataset.type;
        });
      });

      // Range slider
      const slider = document.getElementById('sizeSlider');
      const value = document.getElementById('sizeValue');
      if (slider && value) {
        slider.addEventListener('input', () => {
          this.data.size = parseInt(slider.value);
          value.textContent = slider.value;
        });
      }

      // Feature selection
      document.querySelectorAll('.wizard-feature-item').forEach(item => {
        item.addEventListener('click', () => {
          item.classList.toggle('selected');
          const feature = item.dataset.feature;
          
          if (item.classList.contains('selected')) {
            this.data.features.push(feature);
          } else {
            this.data.features = this.data.features.filter(f => f !== feature);
          }
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!document.getElementById('projectWizardOverlay')?.classList.contains('active')) return;
        
        if (e.key === 'Escape') this.close();
      });
    }

    open() {
      const overlay = document.getElementById('projectWizardOverlay');
      if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Hide trigger button
        const trigger = document.getElementById('projectWizardTrigger');
        if (trigger) trigger.classList.add('hidden');
      }
    }

    close() {
      const overlay = document.getElementById('projectWizardOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Show trigger button
        const trigger = document.getElementById('projectWizardTrigger');
        if (trigger) trigger.classList.remove('hidden');
      }
    }

    nextStep() {
      if (this.currentStep === 1 && !this.data.projectType) {
        this.showToast('Please select a project type');
        return;
      }

      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);
      } else {
        this.close();
      }
    }

    prevStep() {
      if (this.currentStep > 1) {
        this.goToStep(this.currentStep - 1);
      }
    }

    goToStep(step) {
      // Update current step
      this.currentStep = step;

      // Update step indicators
      document.querySelectorAll('.wizard-step-number').forEach((num, index) => {
        num.classList.remove('active', 'completed');
        if (index + 1 < step) num.classList.add('completed');
        else if (index + 1 === step) num.classList.add('active');
      });

      // Update progress lines
      document.querySelectorAll('.wizard-step-line').forEach((line, index) => {
        line.classList.toggle('completed', index < step - 1);
      });

      // Update steps visibility
      document.querySelectorAll('.wizard-step').forEach(s => {
        s.classList.remove('active', 'prev');
        const stepNum = parseInt(s.dataset.step);
        if (stepNum === step) s.classList.add('active');
        else if (stepNum < step) s.classList.add('prev');
      });

      // Update navigation buttons
      document.getElementById('wizardBack').disabled = step === 1;
      const nextBtn = document.getElementById('wizardNext');
      nextBtn.textContent = step === this.totalSteps ? 'Finish ✓' : 'Next →';

      // Calculate estimate if on results step
      if (step === 4) {
        this.calculateEstimate();
      }
    }

    calculateEstimate() {
      const pricing = this.pricing[this.data.projectType] || this.pricing.residential;
      
      // Feature costs
      const featureCosts = {
        'premium-finish': 250000,
        'smart-home': 180000,
        'solar': 320000,
        'security': 95000,
        'landscaping': 150000,
        'pool': 450000
      };

      const baseCost = pricing.base;
      const sqmCost = pricing.perSqm * this.data.size;
      const featuresCost = this.data.features.reduce((sum, f) => sum + (featureCosts[f] || 0), 0);
      
      const total = baseCost + sqmCost + featuresCost;
      const min = Math.round(total * 0.9);
      const max = Math.round(total * 1.15);

      // Format currency
      const formatCurrency = (val) => 'R ' + (val / 1000000).toFixed(2) + 'M';
      const formatCurrencyFull = (val) => 'R ' + val.toLocaleString();

      // Update display
      document.getElementById('estimateValue').textContent = formatCurrency(total);
      document.getElementById('estimateRange').textContent = `${formatCurrencyFull(min)} - ${formatCurrencyFull(max)}`;
      document.getElementById('breakdownBase').textContent = formatCurrencyFull(baseCost);
      document.getElementById('breakdownSqm').textContent = formatCurrencyFull(sqmCost);
      document.getElementById('breakdownFeatures').textContent = formatCurrencyFull(featuresCost);
    }

    showToast(message) {
      // Use existing toast system if available
      if (window.showToast) {
        window.showToast(message, 'warning');
      } else {
        alert(message);
      }
    }
  }

  // Initialize
  function init() {
    new ProjectEstimationWizard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ProjectEstimationWizard = ProjectEstimationWizard;
})();
