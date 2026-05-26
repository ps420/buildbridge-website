/**
 * Smart Button Controller
 * Advanced button interactions and state management
 */

class SmartButtonController {
  constructor() {
    this.buttons = [];
    this.init();
  }
  
  init() {
    this.findButtons();
    this.bindEvents();
  }
  
  findButtons() {
    document.querySelectorAll('.btn-smart, [data-smart-btn]').forEach(btn => {
      this.enhanceButton(btn);
    });
  }
  
  enhanceButton(button) {
    // Add smart button class
    button.classList.add('btn-smart');
    
    // Wrap text content
    if (!button.querySelector('.btn-text')) {
      const text = button.textContent.trim();
      button.innerHTML = `<span class="btn-text">${text}</span>`;
      
      // Add loader element
      const loader = document.createElement('span');
      loader.className = 'btn-loader';
      loader.setAttribute('aria-hidden', 'true');
      button.appendChild(loader);
      
      // Add success icon
      const successIcon = document.createElement('span');
      successIcon.className = 'btn-success-icon';
      successIcon.innerHTML = '✓';
      successIcon.setAttribute('aria-hidden', 'true');
      button.appendChild(successIcon);
    }
    
    // Store reference
    this.buttons.push(button);
    
    // Add ripple support
    if (button.classList.contains('ripple') || button.dataset.ripple !== 'false') {
      this.addRippleEffect(button);
    }
    
    // Add magnetic effect for desktop
    if (window.matchMedia('(pointer: fine)').matches && button.classList.contains('magnetic')) {
      this.addMagneticEffect(button);
    }
  }
  
  addRippleEffect(button) {
    button.addEventListener('click', (e) => {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;
      
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }
  
  addMagneticEffect(button) {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  }
  
  // Public API for state changes
  setLoading(button, isLoading) {
    button.classList.toggle('loading', isLoading);
    button.setAttribute('aria-busy', isLoading);
    
    if (isLoading) {
      button.dataset.originalText = button.querySelector('.btn-text')?.textContent || '';
    }
  }
  
  setSuccess(button, duration = 2000) {
    button.classList.remove('loading');
    button.classList.add('success');
    
    setTimeout(() => {
      button.classList.remove('success');
    }, duration);
  }
  
  setError(button, duration = 2000) {
    button.classList.remove('loading');
    button.classList.add('error');
    
    setTimeout(() => {
      button.classList.remove('error');
    }, duration);
  }
  
  setDisabled(button, isDisabled) {
    button.disabled = isDisabled;
    button.classList.toggle('disabled', isDisabled);
    button.setAttribute('aria-disabled', isDisabled);
  }
  
  // Simulate async action with loading state
  async handleAsync(button, action) {
    this.setLoading(button, true);
    
    try {
      await action();
      this.setSuccess(button);
    } catch (error) {
      this.setError(button);
      console.error('Button action failed:', error);
    }
  }
  
  bindEvents() {
    // Handle form submissions
    document.querySelectorAll('form').forEach(form => {
      const submitBtn = form.querySelector('.btn-smart[type="submit"], [type="submit"]');
      if (submitBtn) {
        form.addEventListener('submit', (e) => {
          // If form has validation issues, don't show loading
          if (!form.checkValidity()) return;
          
          e.preventDefault();
          this.handleAsync(submitBtn, async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message if available
            const successEl = form.querySelector('.form-success');
            if (successEl) {
              form.style.display = 'none';
              successEl.style.display = 'block';
            }
          });
        });
      }
    });
    
    // Handle buttons with data-async
    document.querySelectorAll('[data-async]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAsync(btn, async () => {
          const delay = parseInt(btn.dataset.asyncDelay) || 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Execute callback if provided
          const callback = btn.dataset.asyncCallback;
          if (callback && window[callback]) {
            window[callback](btn);
          }
        });
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.smartButtonController = new SmartButtonController();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartButtonController;
}
