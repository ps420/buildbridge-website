/**
 * Advanced Form Inputs v123.0
 * Fortune 500 Quality Form Field Animations & Interactions
 */

(function() {
  'use strict';

  class AdvancedFormInputs {
    constructor(form) {
      this.form = form;
      this.inputs = form.querySelectorAll('input, textarea, select');
      this.submitBtn = form.querySelector('button[type="submit"]');
      
      this.init();
    }

    init() {
      this.inputs.forEach(input => this.enhanceInput(input));
      this.bindFormEvents();
    }

    enhanceInput(input) {
      const wrapper = input.closest('.form-group-advanced, .input-floating-label, .input-with-icon');
      
      if (!wrapper) return;
      
      // Character counter for textareas
      if (input.tagName === 'TEXTAREA' && input.dataset.maxLength) {
        this.addCharCounter(input, wrapper);
      }
      
      // Password toggle
      if (input.type === 'password') {
        this.addPasswordToggle(input, wrapper);
      }
      
      // Real-time validation
      if (input.dataset.validate) {
        this.addRealTimeValidation(input, wrapper);
      }
      
      // Focus animations
      input.addEventListener('focus', () => {
        wrapper.classList.add('input-focused');
      });
      
      input.addEventListener('blur', () => {
        wrapper.classList.remove('input-focused');
        if (input.value) {
          wrapper.classList.add('input-has-value');
        } else {
          wrapper.classList.remove('input-has-value');
        }
      });
    }

    addCharCounter(input, wrapper) {
      const maxLength = parseInt(input.dataset.maxLength);
      const counter = document.createElement('span');
      counter.className = 'input-char-counter';
      counter.textContent = `0 / ${maxLength}`;
      wrapper.appendChild(counter);
      
      input.addEventListener('input', () => {
        const length = input.value.length;
        counter.textContent = `${length} / ${maxLength}`;
        
        counter.classList.remove('warning', 'error');
        if (length > maxLength * 0.9) {
          counter.classList.add('error');
        } else if (length > maxLength * 0.8) {
          counter.classList.add('warning');
        }
      });
    }

    addPasswordToggle(input, wrapper) {
      wrapper.classList.add('input-password-toggle');
      
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'password-toggle-btn';
      toggleBtn.innerHTML = '👁️';
      toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
      
      toggleBtn.addEventListener('click', () => {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        toggleBtn.innerHTML = type === 'password' ? '👁️' : '🙈';
      });
      
      wrapper.appendChild(toggleBtn);
    }

    addRealTimeValidation(input, wrapper) {
      const rules = input.dataset.validate.split(',');
      const errorMsg = document.createElement('span');
      errorMsg.className = 'input-error-message';
      wrapper.appendChild(errorMsg);
      
      const validate = () => {
        const value = input.value.trim();
        let isValid = true;
        let error = '';
        
        for (const rule of rules) {
          const [type, param] = rule.split(':');
          
          switch(type) {
            case 'required':
              if (!value) {
                isValid = false;
                error = 'This field is required';
              }
              break;
            case 'email':
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                error = 'Please enter a valid email';
              }
              break;
            case 'min':
              if (value.length < parseInt(param)) {
                isValid = false;
                error = `Minimum ${param} characters required`;
              }
              break;
            case 'phone':
              if (value && !/^[\d\s\-+()]{10,}$/.test(value)) {
                isValid = false;
                error = 'Please enter a valid phone number';
              }
              break;
          }
          
          if (!isValid) break;
        }
        
        wrapper.classList.remove('input-valid', 'input-invalid');
        
        if (input.value && isValid) {
          wrapper.classList.add('input-valid');
        } else if (input.value && !isValid) {
          wrapper.classList.add('input-invalid');
          errorMsg.textContent = error;
        }
        
        return isValid;
      };
      
      input.addEventListener('blur', validate);
      input.addEventListener('input', () => {
        if (wrapper.classList.contains('input-invalid')) {
          validate();
        }
      });
    }

    bindFormEvents() {
      if (!this.submitBtn) return;
      
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        this.inputs.forEach(input => {
          const wrapper = input.closest('.form-group-advanced');
          if (wrapper && input.dataset.validate) {
            const event = new Event('blur');
            input.dispatchEvent(event);
            if (wrapper.classList.contains('input-invalid')) {
              isValid = false;
            }
          }
        });
        
        if (!isValid) {
          // Shake invalid fields
          this.form.querySelectorAll('.input-invalid').forEach(wrapper => {
            wrapper.style.animation = 'none';
            setTimeout(() => {
              wrapper.style.animation = '';
            }, 10);
          });
          return;
        }
        
        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success
        this.submitBtn.classList.remove('loading');
        this.submitBtn.classList.add('success');
        this.submitBtn.textContent = '✓ Sent!';
        
        // Reset after delay
        setTimeout(() => {
          this.submitBtn.classList.remove('success');
          this.submitBtn.disabled = false;
          this.submitBtn.textContent = this.submitBtn.dataset.originalText || 'Send Message';
          this.form.reset();
          this.form.querySelectorAll('.input-valid').forEach(el => {
            el.classList.remove('input-valid');
          });
        }, 3000);
      });
    }
  }

  // File Input Enhancement
  class FileInputEnhancer {
    constructor(input) {
      this.input = input;
      this.init();
    }

    init() {
      const wrapper = document.createElement('div');
      wrapper.className = 'file-input-wrapper';
      
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'file-input-btn';
      button.innerHTML = '📎 Choose File';
      
      const filename = document.createElement('span');
      filename.className = 'file-name';
      filename.textContent = 'No file chosen';
      
      this.input.parentNode.insertBefore(wrapper, this.input);
      wrapper.appendChild(this.input);
      wrapper.appendChild(button);
      wrapper.appendChild(filename);
      
      button.addEventListener('click', () => this.input.click());
      
      this.input.addEventListener('change', () => {
        if (this.input.files.length > 0) {
          filename.textContent = this.input.files[0].name;
          button.innerHTML = '📄 Change File';
        }
      });
    }
  }

  // Range Slider Enhancer
  class RangeSliderEnhancer {
    constructor(input) {
      this.input = input;
      this.init();
    }

    init() {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-range-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.paddingTop = '30px';
      
      const value = document.createElement('span');
      value.className = 'range-value';
      value.textContent = this.input.value;
      
      this.input.parentNode.insertBefore(wrapper, this.input);
      wrapper.appendChild(value);
      wrapper.appendChild(this.input);
      
      this.updateValue(value);
      
      this.input.addEventListener('input', () => this.updateValue(value));
    }

    updateValue(element) {
      const percent = (this.input.value - this.input.min) / (this.input.max - this.input.min);
      const left = percent * (this.input.offsetWidth - 20) + 10;
      element.textContent = this.input.value;
      element.style.left = `${left}px`;
    }
  }

  // Initialize on DOM ready
  function init() {
    // Enhance all forms
    document.querySelectorAll('form').forEach(form => {
      new AdvancedFormInputs(form);
    });
    
    // Enhance file inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
      new FileInputEnhancer(input);
    });
    
    // Enhance range inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
      new RangeSliderEnhancer(input);
    });
    
    // Log initialization
    console.log('📝 Advanced Form Inputs v123.0 initialized');
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.AdvancedFormInputs = AdvancedFormInputs;
})();
