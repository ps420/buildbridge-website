/**
 * v100.0: Liquid Morphing Buttons JavaScript
 * Interactive fluid button effects with mouse tracking and ripple animations
 * Created by: Godzai
 */

(function() {
  'use strict';

  // Initialize Liquid Buttons
  function initLiquidButtons() {
    // Add ripple effect to liquid buttons
    document.querySelectorAll('.liquid-btn').forEach(btn => {
      // Create fill element if not present
      if (!btn.querySelector('.liquid-btn-fill')) {
        const fill = document.createElement('span');
        fill.className = 'liquid-btn-fill';
        btn.appendChild(fill);
      }
      
      // Add ripple on click
      btn.addEventListener('click', function(e) {
        createRipple(this, e);
      });
    });

    // Magnetic button effect
    document.querySelectorAll('.liquid-magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', handleMagneticMove);
      btn.addEventListener('mouseleave', handleMagneticLeave);
    });

    // Morphing border button glow intensity
    document.querySelectorAll('.liquid-morph-btn').forEach(btn => {
      btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.setProperty('--glow-x', `${x}%`);
        this.style.setProperty('--glow-y', `${y}%`);
      });
    });

    // Shiny button sweep effect enhancement
    document.querySelectorAll('.liquid-shiny-btn').forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.animationDelay = '0s';
      });
    });

    console.log('💧 Liquid Morphing Buttons v100.0 initialized');
  }

  // Create ripple effect
  function createRipple(btn, e) {
    const ripple = document.createElement('span');
    ripple.className = 'liquid-btn-ripple';
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    btn.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
  }

  // Magnetic button mouse move handler
  function handleMagneticMove(e) {
    const btn = this;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation
    const rotateX = (y / rect.height) * -20;
    const rotateY = (x / rect.width) * 20;
    
    btn.style.setProperty('--rx', `${rotateX}deg`);
    btn.style.setProperty('--ry', `${rotateY}deg`);
    
    // Add magnetic pull
    const magneticPull = 0.15;
    const moveX = x * magneticPull;
    const moveY = y * magneticPull;
    
    btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // Magnetic button mouse leave handler
  function handleMagneticLeave() {
    this.style.transform = '';
    this.style.setProperty('--rx', '0deg');
    this.style.setProperty('--ry', '0deg');
  }

  // Liquid button state management
  const LiquidButtonAPI = {
    // Set loading state
    setLoading: function(selector, loading = true) {
      const btns = document.querySelectorAll(selector);
      btns.forEach(btn => {
        btn.classList.toggle('loading', loading);
        if (loading) {
          btn.dataset.originalText = btn.innerHTML;
          btn.innerHTML = 'Loading...';
        } else {
          btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        }
      });
    },

    // Set success state
    setSuccess: function(selector, message = 'Success!') {
      const btns = document.querySelectorAll(selector);
      btns.forEach(btn => {
        btn.classList.add('success');
        btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
        btn.innerHTML = `<span class="success-icon">✓</span> ${message}`;
        
        setTimeout(() => {
          btn.classList.remove('success');
          btn.innerHTML = btn.dataset.originalText;
        }, 2000);
      });
    },

    // Trigger ripple manually
    triggerRipple: function(selector) {
      const btns = document.querySelectorAll(selector);
      btns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const fakeEvent = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        };
        createRipple(btn, fakeEvent);
      });
    }
  };

  // Expose API globally
  window.LiquidButtons = LiquidButtonAPI;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiquidButtons);
  } else {
    initLiquidButtons();
  }

  // Re-initialize on dynamic content changes
  window.initLiquidButtons = initLiquidButtons;

})();
