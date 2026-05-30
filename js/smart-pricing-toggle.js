/**
 * v102.0: Smart Pricing Toggle JavaScript
 * Interactive pricing switcher with animated price transitions
 * Created by: Godzai
 */

(function() {
  'use strict';

  // Pricing data structure
  const pricingData = {
    monthly: {
      starter: { price: 2499, period: '/month' },
      professional: { price: 4999, period: '/month' },
      enterprise: { price: 8999, period: '/month' }
    },
    yearly: {
      starter: { price: 2124, period: '/month', save: '15%' },
      professional: { price: 3999, period: '/month', save: '20%' },
      enterprise: { price: 6749, period: '/month', save: '25%' }
    }
  };

  // Initialize pricing toggle
  function initSmartPricing() {
    const toggle = document.querySelector('.toggle-switch');
    if (!toggle) return;

    // Add click handler
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const isYearly = toggle.classList.contains('active');
      
      // Update labels
      document.querySelectorAll('.toggle-label').forEach(label => {
        label.classList.toggle('active', 
          (label.dataset.plan === 'yearly' && isYearly) || 
          (label.dataset.plan === 'monthly' && !isYearly)
        );
      });
      
      // Update prices with animation
      updatePrices(isYearly ? 'yearly' : 'monthly');
      
      // Save preference
      localStorage.setItem('buildbridge-pricing-plan', isYearly ? 'yearly' : 'monthly');
    });

    // Restore saved preference
    const savedPlan = localStorage.getItem('buildbridge-pricing-plan');
    if (savedPlan === 'yearly') {
      toggle.classList.add('active');
      document.querySelector('.toggle-label[data-plan="yearly"]').classList.add('active');
      document.querySelector('.toggle-label[data-plan="monthly"]').classList.remove('active');
      updatePrices('yearly');
    }

    // Initialize feature tooltips
    initFeatureTooltips();
    
    console.log('💰 Smart Pricing Toggle v102.0 initialized');
  }

  // Update prices with animation
  function updatePrices(plan) {
    const cards = document.querySelectorAll('.smart-pricing-card');
    
    cards.forEach((card, index) => {
      const planType = ['starter', 'professional', 'enterprise'][index];
      if (!planType) return;
      
      const data = pricingData[plan][planType];
      const priceEl = card.querySelector('.price-amount');
      const periodEl = card.querySelector('.price-period');
      
      if (!priceEl || !data) return;
      
      // Animate out
      priceEl.classList.add('changing');
      
      setTimeout(() => {
        // Update price
        animateNumber(priceEl, parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0, data.price);
        
        // Update period
        periodEl.textContent = data.period;
        
        // Show savings badge
        const existingBadge = card.querySelector('.pricing-savings');
        if (existingBadge) existingBadge.remove();
        
        if (data.save) {
          const badge = document.createElement('div');
          badge.className = 'pricing-savings';
          badge.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 4px 12px;
            background: linear-gradient(135deg, #4ade80, #22c55e);
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            color: #fff;
            animation: fade-in 0.3s ease;
          `;
          badge.textContent = `Save ${data.save}`;
          card.appendChild(badge);
        }
        
        // Animate in
        setTimeout(() => {
          priceEl.classList.remove('changing');
          priceEl.classList.add('animating');
          setTimeout(() => priceEl.classList.remove('animating'), 400);
        }, 50);
      }, 200);
    });
  }

  // Animate number counting
  function animateNumber(element, start, end) {
    const duration = 600;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * easeOutQuart);
      
      element.textContent = `R ${current.toLocaleString()}`;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // Initialize feature tooltips
  function initFeatureTooltips() {
    const infoIcons = document.querySelectorAll('.info-icon');
    
    infoIcons.forEach(icon => {
      const tooltipText = icon.dataset.tooltip || 'More information';
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'pricing-tooltip';
      tooltip.textContent = tooltipText;
      tooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
        padding: 8px 16px;
        background: rgba(15, 15, 16, 0.95);
        border: 1px solid rgba(201, 206, 214, 0.2);
        border-radius: 8px;
        font-size: 12px;
        color: #F5F7FA;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 100;
      `;
      
      icon.style.position = 'relative';
      icon.appendChild(tooltip);
      
      icon.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
      });
      
      icon.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.transform = 'translateX(-50%) translateY(-10px)';
      });
    });
  }

  // Highlight feature comparison rows
  function initComparisonHighlight() {
    const table = document.querySelector('.pricing-comparison-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        rows.forEach(r => {
          if (r !== row) {
            r.style.opacity = '0.5';
          }
        });
      });
      
      row.addEventListener('mouseleave', () => {
        rows.forEach(r => {
          r.style.opacity = '1';
        });
      });
    });
  }

  // Initialize scroll reveal for pricing cards
  function initPricingCardsReveal() {
    const cards = document.querySelectorAll('.smart-pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      observer.observe(card);
    });
  }

  // Add click tracking for buttons
  function initButtonTracking() {
    document.querySelectorAll('.pricing-card-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        const plan = ['Starter', 'Professional', 'Enterprise'][index];
        const isYearly = document.querySelector('.toggle-switch')?.classList.contains('active');
        
        // Track event (would integrate with analytics)
        console.log(`Pricing plan selected: ${plan} (${isYearly ? 'yearly' : 'monthly'})`);
        
        // Show toast notification
        if (window.Toast) {
          Toast.info(`Starting ${plan} plan signup...`, {
            duration: 3000
          });
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSmartPricing();
      initComparisonHighlight();
      initPricingCardsReveal();
      initButtonTracking();
    });
  } else {
    initSmartPricing();
    initComparisonHighlight();
    initPricingCardsReveal();
    initButtonTracking();
  }

  // Expose API
  window.SmartPricing = {
    switchPlan: function(plan) {
      const toggle = document.querySelector('.toggle-switch');
      if (!toggle) return;
      
      const shouldBeActive = plan === 'yearly';
      if (toggle.classList.contains('active') !== shouldBeActive) {
        toggle.click();
      }
    },
    getCurrentPlan: function() {
      const toggle = document.querySelector('.toggle-switch');
      return toggle?.classList.contains('active') ? 'yearly' : 'monthly';
    }
  };

})();
