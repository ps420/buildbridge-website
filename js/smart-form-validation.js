/**
 * v65.2: Smart Form Validation
 * Real-time validation with visual feedback
 * Fortune 500 Quality - Polished & Accessible
 */

class SmartFormValidation {
  constructor(form, options = {}) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    this.options = {
      validateOnInput: options.validateOnInput !== false,
      validateOnBlur: options.validateOnBlur !== false,
      validateOnSubmit: options.validateOnSubmit !== false,
      showSuccess: options.showSuccess !== false,
      showRequirements: options.showRequirements !== false,
      ...options
    };
    
    this.fields = [];
    this.isSubmitting = false;
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.findFields();
    this.bindEvents();
    this.createSuccessMessage();
  }
  
  findFields() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.type === 'submit' || input.type === 'button') return;
      
      const field = {
        element: input,
        container: input.closest('.form-field') || this.createFieldContainer(input),
        type: input.type || input.tagName.toLowerCase(),
        validations: this.getValidations(input),
        requirementsList: null
      };
      
      this.setupField(field);
      this.fields.push(field);
    });
  }
  
  createFieldContainer(input) {
    const container = document.createElement('div');
    container.className = 'form-field';
    input.parentNode.insertBefore(container, input);
    container.appendChild(input);
    return container;
  }
  
  getValidations(input) {
    const validations = [];
    
    if (input.required) {
      validations.push({
        type: 'required',
        message: 'This field is required',
        test: value => value.trim().length > 0
      });
    }
    
    if (input.type === 'email') {
      validations.push({
        type: 'email',
        message: 'Please enter a valid email address',
        test: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      });
    }
    
    if (input.type === 'tel') {
      validations.push({
        type: 'phone',
        message: 'Please enter a valid phone number',
        test: value => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10
      });
    }
    
    if (input.minLength) {
      validations.push({
        type: 'minLength',
        message: `Minimum ${input.minLength} characters required`,
        test: value => value.length >= parseInt(input.minLength)
      });
    }
    
    if (input.maxLength) {
      validations.push({
        type: 'maxLength',
        message: `Maximum ${input.maxLength} characters allowed`,
        test: value => value.length <= parseInt(input.maxLength)
      });
    }
    
    if (input.pattern) {
      const pattern = new RegExp(input.pattern);
      validations.push({
        type: 'pattern',
        message: input.dataset.patternMessage || 'Please match the requested format',
        test: value => pattern.test(value)
      });
    }
    
    // Custom validations from data attributes
    if (input.dataset.validateMatch) {
      const matchField = document.querySelector(input.dataset.validateMatch);
      validations.push({
        type: 'match',
        message: 'Passwords do not match',
        test: value => matchField && value === matchField.value
      });
    }
    
    return validations;
  }
  
  setupField(field) {
    const { element, container } = field;
    
    // Add styling classes
    element.classList.add('form-input');
    
    // Create floating label if not exists
    if (!container.querySelector('.form-label') && element.placeholder) {
      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = element.placeholder;
      element.removeAttribute('placeholder');
      element.setAttribute('placeholder', ' '); // For CSS :placeholder-shown
      container.appendChild(label);
    }
    
    // Create validation icon
    const icon = document.createElement('div');
    icon.className = 'form-validation-icon';
    icon.innerHTML = `
      <span class="valid-icon">✓</span>
      <span class="invalid-icon">✕</span>
    `;
    container.appendChild(icon);
    
    // Create validation message
    const message = document.createElement('div');
    message.className = 'form-validation-message';
    container.appendChild(message);
    
    // Create character counter if maxLength
    if (element.maxLength) {
      const counter = document.createElement('div');
      counter.className = 'form-char-counter';
      counter.textContent = `0/${element.maxLength}`;
      container.appendChild(counter);
      field.charCounter = counter;
    }
    
    // Create requirements list if specified
    if (this.options.showRequirements && element.dataset.requirements) {
      this.createRequirementsList(field);
    }
  }
  
  createRequirementsList(field) {
    const requirements = field.element.dataset.requirements.split(',');
    const list = document.createElement('ul');
    list.className = 'form-requirements';
    
    const requirementMap = {
      'uppercase': { text: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
      'lowercase': { text: 'One lowercase letter', test: v => /[a-z]/.test(v) },
      'number': { text: 'One number', test: v => /\d/.test(v) },
      'special': { text: 'One special character', test: v => /[!@#$%^&*]/.test(v) },
      'min8': { text: 'At least 8 characters', test: v => v.length >= 8 }
    };
    
    requirements.forEach(req => {
      if (requirementMap[req]) {
        const li = document.createElement('li');
        li.dataset.req = req;
        li.textContent = requirementMap[req].text;
        list.appendChild(li);
      }
    });
    
    field.container.appendChild(list);
    field.requirementsList = list;
    field.requirementTests = requirements.map(r => requirementMap[r]).filter(Boolean);
  }
  
  bindEvents() {
    this.fields.forEach(field => {
      const { element } = field;
      
      if (this.options.validateOnInput) {
        element.addEventListener('input', () => this.handleInput(field));
      }
      
      if (this.options.validateOnBlur) {
        element.addEventListener('blur', () => this.handleBlur(field));
      }
      
      element.addEventListener('focus', () => this.handleFocus(field));
    });
    
    if (this.options.validateOnSubmit) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
  
  handleInput(field) {
    const { element, charCounter, requirementTests } = field;
    const value = element.value;
    
    // Update character counter
    if (charCounter && element.maxLength) {
      const count = value.length;
      charCounter.textContent = `${count}/${element.maxLength}`;
      
      if (count > element.maxLength * 0.9) {
        charCounter.classList.add('warning');
      } else {
        charCounter.classList.remove('warning');
      }
      
      if (count >= element.maxLength) {
        charCounter.classList.add('error');
      } else {
        charCounter.classList.remove('error');
      }
    }
    
    // Update requirements list
    if (requirementTests && field.requirementsList) {
      requirementTests.forEach((req, index) => {
        const li = field.requirementsList.children[index];
        if (li) {
          li.classList.toggle('valid', req.test(value));
        }
      });
    }
    
    // Real-time validation (but don't show errors until blur)
    if (field.container.classList.contains('touched')) {
      this.validateField(field, false);
    }
  }
  
  handleBlur(field) {
    field.container.classList.add('touched');
    this.validateField(field, true);
  }
  
  handleFocus(field) {
    field.container.classList.add('focused');
  }
  
  validateField(field, showError = false) {
    const { element, validations, container } = field;
    const value = element.value;
    
    let isValid = true;
    let errorMessage = '';
    
    for (const validation of validations) {
      if (!validation.test(value)) {
        isValid = false;
        errorMessage = validation.message;
        break;
      }
    }
    
    // Update UI
    container.classList.remove('valid', 'invalid');
    
    if (value.length > 0 || showError) {
      if (isValid && this.options.showSuccess) {
        container.classList.add('valid');
      } else if (!isValid && showError) {
        container.classList.add('invalid');
        const messageEl = container.querySelector('.form-validation-message');
        if (messageEl) {
          messageEl.textContent = errorMessage;
        }
      }
    }
    
    return isValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate all fields
    let isFormValid = true;
    this.fields.forEach(field => {
      field.container.classList.add('touched');
      if (!this.validateField(field, true)) {
        isFormValid = false;
      }
    });
    
    if (isFormValid) {
      this.submitForm();
    } else {
      // Focus first invalid field
      const firstInvalid = this.fields.find(f => f.container.classList.contains('invalid'));
      if (firstInvalid) {
        firstInvalid.element.focus();
      }
    }
  }
  
  submitForm() {
    this.isSubmitting = true;
    
    const submitBtn = this.form.querySelector('.form-submit, button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
    }
    
    // Simulate API call
    setTimeout(() => {
      this.showSuccess();
      this.form.reset();
      this.fields.forEach(field => {
        field.container.classList.remove('valid', 'invalid', 'touched');
      });
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
      
      this.isSubmitting = false;
    }, 2000);
  }
  
  createSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = `
      <div class="form-success-icon">✓</div>
      <h3>Thank You!</h3>
      <p>Your message has been sent successfully. We'll get back to you soon.</p>
    `;
    
    this.form.parentNode.insertBefore(successDiv, this.form.nextSibling);
    this.successMessage = successDiv;
  }
  
  showSuccess() {
    this.form.style.display = 'none';
    this.successMessage.classList.add('visible');
    
    setTimeout(() => {
      this.successMessage.classList.remove('visible');
      this.form.style.display = 'block';
    }, 5000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize forms with data-validate attribute
  document.querySelectorAll('form[data-validate]').forEach(form => {
    new SmartFormValidation(form);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartFormValidation;
}
