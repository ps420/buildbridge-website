/**
 * Advanced Form Input Interactions
 * Fortune 500 Professional Form Component
 * 
 * Features:
 * - Floating labels with smooth transitions
 * - Real-time validation
 * - Character counters
 * - Password strength indicator
 * - File upload with drag & drop
 * - Input formatting/masking
 */

class AdvancedFormManager {
  constructor(form) {
    this.form = form;
    this.inputs = {};
    
    this.init();
  }
  
  init() {
    this.setupFloatingLabels();
    this.setupValidation();
    this.setupCharacterCounters();
    this.setupPasswordStrength();
    this.setupFileUploads();
    this.setupInputMasking();
    this.setupSubmitHandling();
  }
  
  setupFloatingLabels() {
    const floatingInputs = this.form.querySelectorAll('.form-input-floating input, .form-input-floating textarea, .form-input-floating select');
    
    floatingInputs.forEach(input => {
      // Set placeholder if not set (needed for :placeholder-shown selector)
      if (!input.placeholder && input.tagName !== 'SELECT') {
        input.placeholder = ' ';
      }
      
      // Handle autofill
      input.addEventListener('animationstart', (e) => {
        if (e.animationName === 'onAutoFillStart') {
          input.parentElement.classList.add('input-filled');
        }
      });
    });
  }
  
  setupValidation() {
    const inputs = this.form.querySelectorAll('[data-validate]');
    
    inputs.forEach(input => {
      const rules = input.dataset.validate.split('|');
      
      input.addEventListener('blur', () => this.validateInput(input, rules));
      input.addEventListener('input', () => {
        if (input.classList.contains('input-invalid')) {
          this.validateInput(input, rules);
        }
      });
    });
    
    // Form-level validation
    this.form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        const rules = input.dataset.validate.split('|');
        if (!this.validateInput(input, rules)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Focus first invalid input
        const firstInvalid = this.form.querySelector('.input-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }
  
  validateInput(input, rules) {
    const value = input.value.trim();
    const parent = input.closest('.form-input-floating') || input.parentElement;
    let isValid = true;
    let errorMessage = '';
    
    for (const rule of rules) {
      const [ruleName, ruleValue] = rule.split(':');
      
      switch(ruleName) {
        case 'required':
          if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email';
          }
          break;
          
        case 'min':
          if (value.length < parseInt(ruleValue)) {
            isValid = false;
            errorMessage = `Minimum ${ruleValue} characters required`;
          }
          break;
          
        case 'max':
          if (value.length > parseInt(ruleValue)) {
            isValid = false;
            errorMessage = `Maximum ${ruleValue} characters allowed`;
          }
          break;
          
        case 'phone':
          const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
          if (value && !phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
          }
          break;
          
        case 'match':
          const matchInput = this.form.querySelector(`[name="${ruleValue}"]`);
          if (matchInput && value !== matchInput.value) {
            isValid = false;
            errorMessage = 'Passwords do not match';
          }
          break;
      }
      
      if (!isValid) break;
    }
    
    // Update visual state
    parent.classList.remove('input-valid', 'input-invalid');
    
    // Remove existing error message
    const existingError = parent.querySelector('.input-error-message');
    if (existingError) existingError.remove();
    
    if (value && isValid) {
      parent.classList.add('input-valid');
    } else if (!isValid && value) {
      parent.classList.add('input-invalid');
      
      // Add error message
      const errorEl = document.createElement('span');
      errorEl.className = 'input-error-message';
      errorEl.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px; display: block;';
      errorEl.textContent = errorMessage;
      parent.appendChild(errorEl);
    }
    
    return isValid;
  }
  
  setupCharacterCounters() {
    const counters = this.form.querySelectorAll('[data-char-counter]');
    
    counters.forEach(input => {
      const maxLength = parseInt(input.dataset.charCounter);
      const warningThreshold = parseInt(input.dataset.charWarning) || maxLength * 0.8;
      
      // Create counter element
      const counter = document.createElement('span');
      counter.className = 'form-char-counter';
      input.parentElement.appendChild(counter);
      
      const updateCounter = () => {
        const length = input.value.length;
        const remaining = maxLength - length;
        
        counter.textContent = `${length}/${maxLength}`;
        counter.classList.remove('warning', 'error');
        
        if (length >= maxLength) {
          counter.classList.add('error');
        } else if (length >= warningThreshold) {
          counter.classList.add('warning');
        }
      };
      
      input.addEventListener('input', updateCounter);
      updateCounter();
    });
  }
  
  setupPasswordStrength() {
    const passwords = this.form.querySelectorAll('[data-password-strength]');
    
    passwords.forEach(input => {
      // Create strength indicator
      const strengthEl = document.createElement('div');
      strengthEl.className = 'form-password-strength';
      strengthEl.innerHTML = `
        <div class="password-strength-bar">
          <div class="password-strength-fill"></div>
        </div>
        <div class="password-strength-text"></div>
      `;
      input.parentElement.appendChild(strengthEl);
      
      const fill = strengthEl.querySelector('.password-strength-fill');
      const text = strengthEl.querySelector('.password-strength-text');
      
      input.addEventListener('input', () => {
        const strength = this.calculatePasswordStrength(input.value);
        
        fill.className = 'password-strength-fill ' + strength.level;
        text.textContent = strength.message;
      });
    });
    
    // Setup password toggle
    const toggles = this.form.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.textContent = isPassword ? '🙈' : '👁️';
      });
    });
  }
  
  calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 'weak', message: 'Weak password' };
    if (score === 3) return { level: 'fair', message: 'Fair password' };
    if (score === 4) return { level: 'good', message: 'Good password' };
    return { level: 'strong', message: 'Strong password' };
  }
  
  setupFileUploads() {
    const uploads = this.form.querySelectorAll('.form-file-upload');
    
    uploads.forEach(upload => {
      const input = upload.querySelector('input[type="file"]');
      const icon = upload.querySelector('.file-upload-icon');
      const text = upload.querySelector('.file-upload-text');
      const hint = upload.querySelector('.file-upload-hint');
      
      // Drag & drop
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        upload.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });
      
      ['dragenter', 'dragover'].forEach(eventName => {
        upload.addEventListener(eventName, () => upload.classList.add('dragover'));
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        upload.addEventListener(eventName, () => upload.classList.remove('dragover'));
      });
      
      upload.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
          input.files = files;
          this.updateFileUploadDisplay(upload, files[0]);
        }
      });
      
      input.addEventListener('change', () => {
        if (input.files.length) {
          this.updateFileUploadDisplay(upload, input.files[0]);
        }
      });
    });
  }
  
  updateFileUploadDisplay(upload, file) {
    const icon = upload.querySelector('.file-upload-icon');
    const text = upload.querySelector('.file-upload-text');
    const hint = upload.querySelector('.file-upload-hint');
    
    icon.textContent = '📄';
    text.textContent = file.name;
    hint.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }
  
  setupInputMasking() {
    const maskedInputs = this.form.querySelectorAll('[data-mask]');
    
    maskedInputs.forEach(input => {
      const mask = input.dataset.mask;
      
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = '';
        let valueIndex = 0;
        
        for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
          if (mask[i] === '9') {
            formatted += value[valueIndex++];
          } else {
            formatted += mask[i];
            if (valueIndex <= i) valueIndex++;
          }
        }
        
        e.target.value = formatted;
      });
    });
  }
  
  setupSubmitHandling() {
    const submitBtn = this.form.querySelector('.btn-advanced[type="submit"]');
    if (!submitBtn) return;
    
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      try {
        // Simulate form submission
        await this.simulateSubmission();
        
        // Show success
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        
        setTimeout(() => {
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
          this.form.reset();
        }, 2000);
        
      } catch (error) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Show error
        this.showFormError(error.message);
      }
    });
  }
  
  simulateSubmission() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  
  showFormError(message) {
    // Could implement toast notification here
    console.error('Form error:', message);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-advanced-form]').forEach(form => {
    new AdvancedFormManager(form);
  });
});

// CSS for autofill detection
const style = document.createElement('style');
style.textContent = `
  @keyframes onAutoFillStart { from { } to { } }
  input:-webkit-autofill { animation-name: onAutoFillStart; }
`;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedFormManager;
}
