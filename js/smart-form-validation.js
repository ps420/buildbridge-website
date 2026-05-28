/**
 * v55.0: Smart Form Validation System
 * Fortune 500 - Real-time validation with visual feedback
 */

class SmartFormValidation {
  constructor(formSelector, options = {}) {
    this.form = typeof formSelector === 'string' 
      ? document.querySelector(formSelector) 
      : formSelector;
    
    if (!this.form) {
      console.warn('SmartFormValidation: Form not found');
      return;
    }
    
    this.options = {
      validateOnBlur: true,
      validateOnInput: false,
      showSuccessState: true,
      shakeOnError: true,
      scrollToFirstError: true,
      customValidators: {},
      messages: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        minLength: 'Must be at least {min} characters',
        maxLength: 'Must be no more than {max} characters',
        pattern: 'Please match the requested format',
        match: 'Fields do not match',
      },
      ...options
    };
    
    this.fields = [];
    this.isValid = false;
    
    this.init();
  }
  
  init() {
    this.findFields();
    this.bindEvents();
    this.addStyles();
  }
  
  findFields() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    this.fields = Array.from(inputs).map(input => {
      const field = {
        element: input,
        name: input.name,
        type: input.type || input.tagName.toLowerCase(),
        rules: this.parseRules(input),
        errorElement: null,
        isValid: true,
        touched: false
      };
      
      // Create error message element
      field.errorElement = this.createErrorElement(input);
      
      return field;
    });
  }
  
  parseRules(input) {
    const rules = [];
    
    if (input.required) {
      rules.push({ type: 'required' });
    }
    
    if (input.type === 'email') {
      rules.push({ type: 'email' });
    }
    
    if (input.type === 'tel') {
      rules.push({ type: 'phone' });
    }
    
    if (input.minLength > 0) {
      rules.push({ type: 'minLength', value: input.minLength });
    }
    
    if (input.maxLength > 0) {
      rules.push({ type: 'maxLength', value: input.maxLength });
    }
    
    if (input.pattern) {
      rules.push({ type: 'pattern', value: input.pattern });
    }
    
    // Check for match attribute
    if (input.dataset.match) {
      rules.push({ type: 'match', target: input.dataset.match });
    }
    
    // Custom validation from data attributes
    if (input.dataset.validate) {
      rules.push({ type: 'custom', validator: input.dataset.validate });
    }
    
    return rules;
  }
  
  createErrorElement(input) {
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error-message';
    errorEl.setAttribute('aria-live', 'polite');
    errorEl.style.cssText = `
      display: none;
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      transition: all 0.3s ease;
    `;
    
    // Insert after input wrapper or input
    const wrapper = input.closest('.form-field') || input.parentElement;
    if (wrapper) {
      wrapper.appendChild(errorEl);
    } else {
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    
    return errorEl;
  }
  
  bindEvents() {
    this.fields.forEach(field => {
      const input = field.element;
      
      // Validate on blur
      if (this.options.validateOnBlur) {
        input.addEventListener('blur', () => {
          field.touched = true;
          this.validateField(field);
        });
      }
      
      // Validate on input (with debounce)
      if (this.options.validateOnInput) {
        let debounceTimer;
        input.addEventListener('input', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (field.touched) {
              this.validateField(field);
            }
          }, 300);
        });
      }
      
      // Clear error on focus
      input.addEventListener('focus', () => {
        this.clearError(field);
      });
    });
    
    // Form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.onSubmitSuccess();
      } else {
        this.onSubmitError();
      }
    });
  }
  
  validateField(field) {
    const value = field.element.value.trim();
    let error = null;
    
    for (const rule of field.rules) {
      error = this.checkRule(rule, value, field);
      if (error) break;
    }
    
    if (error) {
      this.showError(field, error);
      field.isValid = false;
    } else {
      this.showSuccess(field);
      field.isValid = true;
    }
    
    // Update field state class
    const wrapper = field.element.closest('.form-field') || field.element.parentElement;
    if (wrapper) {
      wrapper.classList.remove('valid', 'invalid');
      wrapper.classList.add(field.isValid ? 'valid' : 'invalid');
    }
    
    return field.isValid;
  }
  
  checkRule(rule, value, field) {
    switch (rule.type) {
      case 'required':
        if (!value) return this.options.messages.required;
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) return this.options.messages.email;
        break;
        
      case 'phone':
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (value && !phoneRegex.test(value)) return this.options.messages.phone;
        break;
        
      case 'minLength':
        if (value.length < rule.value) {
          return this.options.messages.minLength.replace('{min}', rule.value);
        }
        break;
        
      case 'maxLength':
        if (value.length > rule.value) {
          return this.options.messages.maxLength.replace('{max}', rule.value);
        }
        break;
        
      case 'pattern':
        const pattern = new RegExp(rule.value);
        if (value && !pattern.test(value)) return this.options.messages.pattern;
        break;
        
      case 'match':
        const targetField = this.fields.find(f => f.name === rule.target);
        if (targetField && value !== targetField.element.value) {
          return this.options.messages.match;
        }
        break;
        
      case 'custom':
        if (this.options.customValidators[rule.validator]) {
          const result = this.options.customValidators[rule.validator](value, field);
          if (result !== true) return result;
        }
        break;
    }
    
    return null;
  }
  
  showError(field, message) {
    field.errorElement.textContent = message;
    field.errorElement.style.display = 'block';
    
    // Update input styling
    field.element.classList.add('error');
    field.element.classList.remove('success');
    field.element.setAttribute('aria-invalid', 'true');
    
    // Shake animation
    if (this.options.shakeOnError) {
      const wrapper = field.element.closest('.form-field') || field.element.parentElement;
      if (wrapper) {
        wrapper.classList.add('shake-invalid');
        setTimeout(() => wrapper.classList.remove('shake-invalid'), 500);
      }
    }
  }
  
  showSuccess(field) {
    field.errorElement.style.display = 'none';
    field.errorElement.textContent = '';
    
    if (this.options.showSuccessState) {
      field.element.classList.add('success');
    }
    field.element.classList.remove('error');
    field.element.setAttribute('aria-invalid', 'false');
  }
  
  clearError(field) {
    field.errorElement.style.display = 'none';
    field.element.classList.remove('error');
  }
  
  validate() {
    let allValid = true;
    let firstError = null;
    
    this.fields.forEach(field => {
      field.touched = true;
      if (!this.validateField(field)) {
        allValid = false;
        if (!firstError) firstError = field;
      }
    });
    
    this.isValid = allValid;
    
    if (!allValid && firstError && this.options.scrollToFirstError) {
      firstError.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.element.focus();
    }
    
    return allValid;
  }
  
  onSubmitSuccess() {
    // Dispatch custom event
    this.form.dispatchEvent(new CustomEvent('formValid', {
      detail: { form: this.form, fields: this.fields }
    }));
    
    console.log('✅ Form validation passed');
  }
  
  onSubmitError() {
    // Dispatch custom event
    this.form.dispatchEvent(new CustomEvent('formInvalid', {
      detail: { form: this.form, invalidFields: this.fields.filter(f => !f.isValid) }
    }));
    
    console.warn('❌ Form validation failed');
  }
  
  addStyles() {
    const styleId = 'smart-form-validation-styles';
    if (document.getElementById(styleId)) return;
    
    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
      .form-field {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .form-field input,
      .form-field textarea,
      .form-field select {
        transition: all 0.3s ease;
        border: 2px solid rgba(201, 206, 214, 0.2);
      }
      
      .form-field input:focus,
      .form-field textarea:focus,
      .form-field select:focus {
        border-color: rgba(201, 206, 214, 0.5);
        outline: none;
      }
      
      .form-field.invalid input,
      .form-field.invalid textarea,
      .form-field.invalid select {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.05);
      }
      
      .form-field.valid input,
      .form-field.valid textarea,
      .form-field.valid select {
        border-color: #22c55e;
      }
      
      .form-field.valid input:not(:focus),
      .form-field.valid textarea:not(:focus),
      .form-field.valid select:not(:focus) {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 20px;
        padding-right: 40px;
      }
      
      @keyframes form-field-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
      }
      
      .form-field.shake-invalid {
        animation: form-field-shake 0.5s ease-in-out;
      }
      
      .form-error-message {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .form-error-message::before {
        content: '⚠';
        font-size: 14px;
      }
      
      .form-field-label {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--chrome);
      }
      
      .form-field-label .required {
        color: #ef4444;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Public API
  reset() {
    this.fields.forEach(field => {
      field.element.value = '';
      field.element.classList.remove('error', 'success');
      field.errorElement.style.display = 'none';
      field.touched = false;
      field.isValid = true;
    });
  }
  
  destroy() {
    // Clean up event listeners
    this.fields.forEach(field => {
      field.element.removeEventListener('blur', this.validateField);
      field.element.removeEventListener('input', this.validateField);
      field.element.removeEventListener('focus', this.clearError);
    });
  }
}

// Auto-initialize forms with data attribute
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    new SmartFormValidation(form);
  });
  
  if (forms.length > 0) {
    console.log('📝 SmartFormValidation initialized for ' + forms.length + ' form(s)');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartFormValidation;
}
