/**
 * Smart Contact Form
 * v77.0: Fortune 500 Lead Capture System
 */

class SmartContactForm {
  constructor(formElement, options = {}) {
    this.form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
    this.options = {
      endpoint: options.endpoint || '/api/contact',
      enableAutoSave: options.enableAutoSave !== false,
      autoSaveInterval: options.autoSaveInterval || 5000,
      showProgress: options.showProgress !== false,
      enableValidation: options.enableValidation !== false,
      ...options
    };
    
    this.fields = {};
    this.isSubmitting = false;
    this.formData = {};
    this.autoSaveTimer = null;
    this.currentStep = 1;
    this.totalSteps = 3;
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.cacheFields();
    this.bindEvents();
    this.loadAutoSave();
    this.updateProgress();
  }
  
  cacheFields() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const name = input.name;
      if (name) {
        this.fields[name] = {
          element: input,
          touched: false,
          valid: false
        };
      }
    });
  }
  
  bindEvents() {
    // Input events
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      const input = field.element;
      
      // Focus
      input.addEventListener('focus', () => {
        field.touched = true;
        this.hideError(fieldName);
      });
      
      // Input with debounced validation
      input.addEventListener('input', (e) => {
        this.formData[fieldName] = e.target.value;
        this.debounceValidation(fieldName);
        this.updateProgress();
        
        if (this.options.enableAutoSave) {
          this.debounceAutoSave();
        }
      });
      
      // Blur - immediate validation
      input.addEventListener('blur', () => {
        field.touched = true;
        this.validateField(fieldName);
      });
      
      // Character counter for textarea
      if (input.tagName === 'TEXTAREA' && input.dataset.maxLength) {
        this.addCharacterCounter(input);
      }
    });
    
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // File upload
    const fileInput = this.form.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    
    // Checkbox/radio groups
    this.form.querySelectorAll('.form-checkbox input, .form-radio input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateProgress();
        if (this.options.enableAutoSave) {
          this.debounceAutoSave();
        }
      });
    });
  }
  
  debounceValidation(fieldName) {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    this.validationTimeout = setTimeout(() => {
      this.validateField(fieldName);
    }, 300);
  }
  
  debounceAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.saveToStorage();
    }, this.options.autoSaveInterval);
  }
  
  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return false;
    
    const input = field.element;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required check
    if (input.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Pattern validation
    if (isValid && value && input.pattern) {
      const pattern = new RegExp(input.pattern);
      if (!pattern.test(value)) {
        isValid = false;
        errorMessage = input.dataset.error || 'Please enter a valid value';
      }
    }
    
    // Email validation
    if (isValid && value && input.type === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    // Phone validation
    if (isValid && value && input.type === 'tel') {
      const phonePattern = /^[\d\s\-\+\(\)]{10,20}$/;
      if (!phonePattern.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }
    
    // Min length
    if (isValid && value && input.minLength && value.length < input.minLength) {
      isValid = false;
      errorMessage = `Minimum ${input.minLength} characters required`;
    }
    
    // Max length
    if (isValid && value && input.maxLength && value.length > input.maxLength) {
      isValid = false;
      errorMessage = `Maximum ${input.maxLength} characters allowed`;
    }
    
    // Custom validation function
    if (isValid && value && input.dataset.validate) {
      const customValid = this.customValidation(input.dataset.validate, value);
      if (!customValid) {
        isValid = false;
        errorMessage = input.dataset.error || 'Invalid value';
      }
    }
    
    field.valid = isValid;
    this.updateFieldUI(fieldName, isValid, errorMessage);
    
    return isValid;
  }
  
  customValidation(type, value) {
    switch (type) {
      case 'sa-phone':
        return /^0[1-9][\d\s]{8,}$/.test(value.replace(/\s/g, ''));
      case 'budget':
        const num = parseInt(value.replace(/[^\d]/g, ''));
        return num >= 50000 && num <= 500000000;
      default:
        return true;
    }
  }
  
  updateFieldUI(fieldName, isValid, errorMessage) {
    const field = this.fields[fieldName];
    const input = field.element;
    const formGroup = input.closest('.form-group');
    
    // Remove existing states
    input.classList.remove('valid', 'error');
    formGroup?.querySelector('.error-message')?.classList.remove('visible');
    
    if (field.touched) {
      if (isValid) {
        input.classList.add('valid');
      } else {
        input.classList.add('error');
        if (errorMessage) {
          this.showError(fieldName, errorMessage);
        }
      }
    }
  }
  
  showError(fieldName, message) {
    const field = this.fields[fieldName];
    const formGroup = field.element.closest('.form-group');
    let errorEl = formGroup?.querySelector('.error-message');
    
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      formGroup?.appendChild(errorEl);
    }
    
    errorEl.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      ${message}
    `;
    errorEl.classList.add('visible');
  }
  
  hideError(fieldName) {
    const field = this.fields[fieldName];
    const formGroup = field.element.closest('.form-group');
    const errorEl = formGroup?.querySelector('.error-message');
    
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }
  
  addCharacterCounter(textarea) {
    const maxLength = parseInt(textarea.dataset.maxLength);
    const formGroup = textarea.closest('.form-group');
    
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.textContent = `0/${maxLength}`;
    formGroup.style.position = 'relative';
    formGroup.appendChild(counter);
    
    textarea.addEventListener('input', () => {
      const length = textarea.value.length;
      counter.textContent = `${length}/${maxLength}`;
      
      if (length > maxLength) {
        counter.style.color = '#ef4444';
      } else if (length > maxLength * 0.9) {
        counter.style.color = '#f59e0b';
      } else {
        counter.style.color = '';
      }
    });
  }
  
  handleFileSelect(e) {
    const file = e.target.files[0];
    const label = e.target.closest('.form-file-upload').querySelector('.form-file-label');
    
    if (file) {
      label.classList.add('has-file');
      label.querySelector('.form-file-text').innerHTML = 
        `<strong>${file.name}</strong><br><span style="font-size: 12px; color: var(--slate);">${this.formatFileSize(file.size)}</span>`;
    }
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  updateProgress() {
    if (!this.options.showProgress) return;
    
    const totalFields = Object.keys(this.fields).length;
    const filledFields = Object.values(this.fields).filter(f => f.element.value.trim() !== '').length;
    const progress = Math.round((filledFields / totalFields) * 100);
    
    const steps = this.form.querySelectorAll('.form-progress-step');
    const stepCount = steps.length;
    
    steps.forEach((step, index) => {
      step.classList.remove('completed', 'active');
      
      const threshold = ((index + 1) / stepCount) * 100;
      
      if (progress >= threshold) {
        step.classList.add('completed');
      } else if (progress >= threshold - (100 / stepCount)) {
        step.classList.add('active');
      }
    });
  }
  
  validateAll() {
    let allValid = true;
    
    Object.keys(this.fields).forEach(fieldName => {
      this.fields[fieldName].touched = true;
      const isValid = this.validateField(fieldName);
      if (!isValid) allValid = false;
    });
    
    return allValid;
  }
  
  async handleSubmit() {
    if (this.isSubmitting) return;
    
    // Validate all fields
    if (!this.validateAll()) {
      // Scroll to first error
      const firstError = this.form.querySelector('.form-input.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }
    
    this.isSubmitting = true;
    const submitBtn = this.form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
      // Simulate API call
      await this.simulateSubmit();
      
      // Show success
      this.showSuccess();
      
      // Clear autosave
      this.clearStorage();
      
      // Track event
      this.trackEvent('form_submit_success');
      
    } catch (error) {
      this.showError('form', 'Something went wrong. Please try again.');
      this.trackEvent('form_submit_error');
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }
  
  simulateSubmit() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  
  showSuccess() {
    const wrapper = this.form.closest('.smart-contact-form-wrapper');
    
    wrapper.innerHTML = `
      <div class="form-success">
        <div class="form-success-icon">✓</div>
        <h3>Message Sent Successfully!</h3>
        <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
        <a href="index.html" class="btn">Return to Home</a>
      </div>
    `;
    
    // Trigger confetti if available
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
  
  saveToStorage() {
    try {
      localStorage.setItem('contactForm-draft', JSON.stringify(this.formData));
      localStorage.setItem('contactForm-timestamp', Date.now().toString());
    } catch (e) {
      console.warn('Could not save form draft');
    }
  }
  
  loadAutoSave() {
    try {
      const saved = localStorage.getItem('contactForm-draft');
      const timestamp = localStorage.getItem('contactForm-timestamp');
      
      if (saved && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (age < maxAge) {
          const data = JSON.parse(saved);
          Object.keys(data).forEach(key => {
            const field = this.fields[key];
            if (field) {
              field.element.value = data[key];
              this.formData[key] = data[key];
            }
          });
          this.updateProgress();
        } else {
          this.clearStorage();
        }
      }
    } catch (e) {
      console.warn('Could not load form draft');
    }
  }
  
  clearStorage() {
    try {
      localStorage.removeItem('contactForm-draft');
      localStorage.removeItem('contactForm-timestamp');
    } catch (e) {
      console.warn('Could not clear form draft');
    }
  }
  
  trackEvent(eventName) {
    if (window.gtag) {
      gtag('event', eventName, {
        event_category: 'contact_form',
        event_label: 'buildbridge_contact'
      });
    }
    
    if (window.fbq) {
      fbq('track', eventName);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.smart-contact-form');
  forms.forEach(form => {
    new SmartContactForm(form);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartContactForm;
}
