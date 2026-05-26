/**
 * Animated Pricing Table
 * Toggle between monthly/yearly with smooth animations
 */

(function() {
  'use strict';

  class PricingTable {
    constructor(section) {
      this.section = section;
      this.toggle = section.querySelector('.pricing-toggle-switch');
      this.monthlyLabel = section.querySelector('.pricing-toggle-label[data-plan="monthly"]');
      this.yearlyLabel = section.querySelector('.pricing-toggle-label[data-plan="yearly"]');
      this.isYearly = false;
      
      this.init();
    }

    init() {
      if (this.toggle) {
        this.toggle.addEventListener('click', () => this.togglePlan());
      }
      
      if (this.monthlyLabel) {
        this.monthlyLabel.addEventListener('click', () => this.setPlan(false));
      }
      
      if (this.yearlyLabel) {
        this.yearlyLabel.addEventListener('click', () => this.setPlan(true));
      }
      
      this.initFAQ();
    }

    setPlan(yearly) {
      if (this.isYearly === yearly) return;
      this.isYearly = yearly;
      this.updateUI();
    }

    togglePlan() {
      this.isYearly = !this.isYearly;
      this.updateUI();
    }

    updateUI() {
      // Update toggle switch
      this.toggle.classList.toggle('active', this.isYearly);
      
      // Update labels
      this.monthlyLabel.classList.toggle('active', !this.isYearly);
      this.yearlyLabel.classList.toggle('active', this.isYearly);
      
      // Update section class for price display
      this.section.classList.toggle('pricing-show-yearly', this.isYearly);
      
      // Animate price change
      this.animatePriceChange();
      
      // Store preference
      localStorage.setItem('pricing-plan', this.isYearly ? 'yearly' : 'monthly');
      
      // Dispatch custom event
      this.section.dispatchEvent(new CustomEvent('pricing:change', {
        detail: { isYearly: this.isYearly }
      }));
    }

    animatePriceChange() {
      const amounts = this.section.querySelectorAll('.pricing-amount');
      
      amounts.forEach(amount => {
        amount.classList.add('changing');
        
        setTimeout(() => {
          amount.classList.remove('changing');
        }, 300);
      });
    }

    initFAQ() {
      const faqItems = this.section.querySelectorAll('.pricing-faq-item');
      
      faqItems.forEach(item => {
        const question = item.querySelector('.pricing-faq-question');
        
        if (question) {
          question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            
            // Close all others
            faqItems.forEach(i => i.classList.remove('open'));
            
            // Toggle current
            if (!isOpen) {
              item.classList.add('open');
            }
          });
        }
      });
    }
  }

  // Initialize all pricing tables
  function init() {
    const pricingSections = document.querySelectorAll('.pricing-section');
    
    pricingSections.forEach(section => {
      new PricingTable(section);
    });
    
    // Check for stored preference
    const storedPlan = localStorage.getItem('pricing-plan');
    if (storedPlan === 'yearly') {
      pricingSections.forEach(section => {
        const table = new PricingTable(section);
        table.setPlan(true);
      });
    }
    
    if (pricingSections.length > 0) {
      console.log('💰 Pricing Table initialized');
    }
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
