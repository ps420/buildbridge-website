/**
 * ADVANCED FORM VALIDATION
 * Fortune 500 Quality Form Validation System
 * 
 * Features:
 * - Real-time validation
 * - Custom validation rules
 * - Password strength meter
 * - Character counters
 * - Form progress tracking
 * - Accessibility support
 */

class FormValidator {
  constructor(form, options = {}) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    if (!this.form) return;

    this.options = {
      validateOnBlur: true,
      validateOnInput: true,
      validateOnSubmit: true,
      showSuccessState: true,
      showValidationMessages: true,
      liveValidationDelay: 500,
      ...options
    };

    this.fields = new Map();
    this.isSubmitting = false;

    // Validation rules
    this.rules = {
      required: (value) => ({
        valid: value.trim().length > 0,
        message: 'This field is required'
      }),
      
      email: (value) => ({
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
      }),
      
      phone: (value) => ({
        valid: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value.replace(/\s/g, '')),
        message: 'Please enter a valid phone number'
      }),
      
      saPhone: (value) => ({
        valid: /^(\+27|0)[6-8][0-9]{8}$/.test(value.replace(/\s/g, '')),
        message: 'Please enter a valid South African phone number'
      }),
      
      minLength: (value, length) => ({
        valid: value.length >= length,
        message: `Must be at least ${length} characters`
      }),
      
      maxLength: (value, length) => ({
        valid: value.length <= length,
        message: `Must be no more than ${length} characters`
      }),
      
      url: (value) => ({
        valid: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value),
        message: 'Please enter a valid URL'
      }),
      
      numeric: (value) => ({
        valid: /^[0-9]+$/.test(value),
        message: 'Must contain only numbers'
      }),
      
      alphanumeric: (value) => ({
        valid: /^[a-zA-Z0-9]+$/.test(value),
        message: 'Must contain only letters and numbers'
      }),
      
      match: (value, otherField) => ({
        valid: value === this.form.querySelector(`[name="${otherField}"]`)?.value,
        message: 'Fields do not match'
      })
    };

    this.init();
  }

  init() {
    this.form.classList.add('form-validated');
    this.collectFields();
    this.bindEvents();
    this.createValidationIcons();
  }

  collectFields() {
    const inputs = this.form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const fieldName = input.name;
      if (!fieldName) return;

      const rules = this.parseRules(input);
      const wrapper = this.createWrapper(input);
      
      this.fields.set(fieldName, {
        element: input,
        wrapper: wrapper,
        rules: rules,
        isValid: false,
        isTouched: false,
        validationMessage: null,
        debounceTimer: null
      });

      // Add character counter if maxLength exists
      if (input.maxLength > 0) {
        this.addCharCounter(input);
      }

      // Add password strength meter if password field
      if (input.type === 'password' && input.dataset.strength === 'true') {
        this.addPasswordStrength(input);
      }
    });

    // Add form progress if enabled
    if (this.options.showProgress) {
      this.addFormProgress();
    }
  }

  parseRules(input) {
    const rules = [];
    const dataset = input.dataset;

    if (input.required) rules.push('required');
    if (dataset.validate) {
      dataset.validate.split(',').forEach(rule => {
        const [ruleName, param] = rule.trim().split(':');
        rules.push({ name: ruleName, param });
      });
    }
    if (input.type === 'email') rules.push('email');
    if (input.type === 'tel' && dataset.validate === 'sa') rules.push('saPhone');
    if (input.type === 'tel' && !dataset.validate) rules.push('phone');
    if (input.type === 'url') rules.push('url');
    if (dataset.minLength) rules.push({ name: 'minLength', param: parseInt(dataset.minLength) });
    if (input.minLength > 0) rules.push({ name: 'minLength', param: input.minLength });
    if (dataset.match) rules.push({ name: 'match', param: dataset.match });

    return rules;
  }

  createWrapper(input) {
    const parent = input.parentElement;
    
    // Check if already wrapped
    if (parent.classList.contains('input-wrapper')) {
      return parent;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    return wrapper;
  }

  createValidationIcons() {
    const iconSVGs = {
      valid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M20 6L9 17l-5-5"/>
      </svg>`,
      invalid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>`,
      validating: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>`
    };

    this.fields.forEach((field, name) => {
      const { wrapper } = field;

      // Create icons
      Object.keys(iconSVGs).forEach(type => {
        const icon = document.createElement('div');
        icon.className = `validation-icon ${type}`;
        icon.innerHTML = iconSVGs[type];
        icon.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(icon);
      });

      // Create validation message container
      const message = document.createElement('div');
      message.className = 'validation-message';
      message.id = `validation-message-${name}`;
      wrapper.appendChild(message);

      // Link message to input for accessibility
      field.element.setAttribute('aria-describedby', message.id);
    });
  }

  addCharCounter(input) {
    const maxLength = input.maxLength;
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = `0/${maxLength}`;

    input.parentNode.appendChild(counter);

    input.addEventListener('input', () => {
      const length = input.value.length;
      counter.textContent = `${length}/${maxLength}`;

      // Visual feedback
      counter.classList.remove('warning', 'danger');
      if (length > maxLength * 0.9) {
        counter.classList.add('danger');
      } else if (length > maxLength * 0.8) {
        counter.classList.add('warning');
      }
    });
  }

  addPasswordStrength(input) {
    const container = document.createElement('div');
    container.className = 'password-strength';
    container.innerHTML = `
      <div class="strength-bar">
        <div class="strength-fill"></div>
      </div>
      <div class="strength-text">
        <span class="strength-label">Password strength</span>
        <span class="strength-status"></span>
      </div>
    `;

    input.parentNode.appendChild(container);

    const fill = container.querySelector('.strength-fill');
    const status = container.querySelector('.strength-status');

    input.addEventListener('input', () => {
      const value = input.value;
      const strength = this.calculatePasswordStrength(value);

      fill.className = 'strength-fill';
      status.className = 'strength-status';

      if (value.length === 0) {
        status.textContent = '';
        return;
      }

      if (strength < 30) {
        fill.classList.add('weak');
        status.classList.add('weak');
        status.textContent = 'Weak';
      } else if (strength < 70) {
        fill.classList.add('fair');
        status.classList.add('fair');
        status.textContent = 'Fair';
      } else {
        fill.classList.add('strong');
        status.classList.add('strong');
        status.textContent = 'Strong';
      }
    });
  }

  calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 30;

    return score;
  }

  addFormProgress() {
    const progress = document.createElement('div');
    progress.className = 'form-progress';
    progress.innerHTML = `
      <div class="form-progress-header">
        <span class="form-progress-title">Form Progress</span>
        <span class="form-progress-percent">0%</span>
      </div>
      <div class="form-progress-bar">
        <div class="form-progress-fill" style="width: 0%"></div>
      </div>
    `;

    this.form.insertBefore(progress, this.form.firstChild);
    this.progressBar = progress;
  }

  updateFormProgress() {
    if (!this.progressBar) return;

    const total = this.fields.size;
    const valid = Array.from(this.fields.values()).filter(f => f.isValid).length;
    const percent = Math.round((valid / total) * 100);

    const fill = this.progressBar.querySelector('.form-progress-fill');
    const percentText = this.progressBar.querySelector('.form-progress-percent');

    fill.style.width = `${percent}%`;
    percentText.textContent = `${percent}%`;
  }

  bindEvents() {
    // Field events
    this.fields.forEach((field, name) => {
      const { element } = field;

      if (this.options.validateOnBlur) {
        element.addEventListener('blur', () => {
          field.isTouched = true;
          this.validateField(name);
        });
      }

      if (this.options.validateOnInput) {
        element.addEventListener('input', () => {
          // Debounce validation
          clearTimeout(field.debounceTimer);
          field.debounceTimer = setTimeout(() => {
            if (field.isTouched) {
              this.validateField(name);
            }
          }, this.options.liveValidationDelay);
        });
      }

      // Change event for selects
      element.addEventListener('change', () => {
        field.isTouched = true;
        this.validateField(name);
      });
    });

    // Form submit
    if (this.options.validateOnSubmit) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(e);
      });
    }
  }

  validateField(fieldName) {
    const field = this.fields.get(fieldName);
    if (!field) return { valid: true };

    const { element, wrapper, rules } = field;
    const value = element.value;

    // Clear previous state
    wrapper.classList.remove('is-valid', 'is-invalid', 'is-validating');
    field.isValid = false;
    field.validationMessage = null;

    // Run all rules
    for (const rule of rules) {
      let result;

      if (typeof rule === 'string') {
        // Simple rule
        if (this.rules[rule]) {
          result = this.rules[rule](value);
        }
      } else {
        // Rule with parameter
        if (this.rules[rule.name]) {
          result = this.rules[rule.name](value, rule.param);
        }
      }

      if (result && !result.valid) {
        field.isValid = false;
        field.validationMessage = result.message;
        this.setFieldState(field, 'invalid', result.message);
        this.updateFormProgress();
        return result;
      }
    }

    // All rules passed
    field.isValid = true;
    if (this.options.showSuccessState) {
      this.setFieldState(field, 'valid');
    }
    this.updateFormProgress();
    return { valid: true };
  }

  setFieldState(field, state, message = null) {
    const { wrapper, element } = field;

    wrapper.classList.remove('is-valid', 'is-invalid', 'is-validating');
    wrapper.classList.add(`is-${state}`);

    // Update ARIA
    if (state === 'invalid') {
      element.setAttribute('aria-invalid', 'true');
    } else {
      element.removeAttribute('aria-invalid');
    }

    // Show message
    if (message && this.options.showValidationMessages) {
      this.showValidationMessage(field, message, state);
    } else {
      this.hideValidationMessage(field);
    }
  }

  showValidationMessage(field, message, type) {
    const messageEl = field.wrapper.querySelector('.validation-message');
    if (!messageEl) return;

    messageEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'invalid' 
          ? '<circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>'
          : '<path d="M20 6L9 17l-5-5"/>'
        }
      </svg>
      ${message}
    `;
    messageEl.className = `validation-message ${type} show`;
  }

  hideValidationMessage(field) {
    const messageEl = field.wrapper.querySelector('.validation-message');
    if (messageEl) {
      messageEl.classList.remove('show');
    }
  }

  validateAll() {
    let isValid = true;

    this.fields.forEach((field, name) => {
      field.isTouched = true;
      const result = this.validateField(name);
      if (!result.valid) isValid = false;
    });

    return isValid;
  }

  async handleSubmit(e) {
    if (this.isSubmitting) return;

    const submitBtn = this.form.querySelector('[type="submit"]');
    const isValid = this.validateAll();

    if (!isValid) {
      // Focus first invalid field
      const firstInvalid = this.form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.isSubmitting = true;

    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    // Dispatch submit event for external handling
    const submitEvent = new CustomEvent('formValidatedSubmit', {
      detail: {
        form: this.form,
        data: this.getFormData(),
        validator: this
      },
      cancelable: true
    });

    const shouldContinue = this.form.dispatchEvent(submitEvent);

    if (shouldContinue && this.options.onSubmit) {
      try {
        await this.options.onSubmit(this.getFormData());
        this.showSubmitSuccess(submitBtn);
      } catch (error) {
        this.showSubmitError(submitBtn, error);
      }
    }
  }

  showSubmitSuccess(button) {
    if (button) {
      button.classList.remove('is-loading');
      button.classList.add('is-success');
      button.textContent = 'Success!';
    }

    // Reset after delay
    setTimeout(() => {
      this.resetForm();
      if (button) {
        button.classList.remove('is-success');
        button.disabled = false;
        button.textContent = this.options.submitText || 'Submit';
      }
      this.isSubmitting = false;
    }, 2000);
  }

  showSubmitError(button, error) {
    if (button) {
      button.classList.remove('is-loading');
      button.classList.add('is-error');
      button.textContent = 'Error';
    }

    console.error('Form submission error:', error);

    setTimeout(() => {
      if (button) {
        button.classList.remove('is-error');
        button.disabled = false;
        button.textContent = this.options.submitText || 'Submit';
      }
      this.isSubmitting = false;
    }, 2000);
  }

  getFormData() {
    const data = {};
    this.fields.forEach((field, name) => {
      data[name] = field.element.value;
    });
    return data;
  }

  resetForm() {
    this.form.reset();
    this.fields.forEach((field, name) => {
      field.isValid = false;
      field.isTouched = false;
      field.validationMessage = null;
      field.wrapper.classList.remove('is-valid', 'is-invalid', 'is-validating');
      this.hideValidationMessage(field);
    });
    this.updateFormProgress();
  }

  // Public API
  isValid() {
    return Array.from(this.fields.values()).every(f => f.isValid);
  }

  getField(name) {
    return this.fields.get(name);
  }

  addRule(name, validator) {
    this.rules[name] = validator;
  }

  destroy() {
    this.fields.forEach((field, name) => {
      clearTimeout(field.debounceTimer);
    });
    this.fields.clear();
  }
}

// Auto-initialize forms with data-validate attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    new FormValidator(form, {
      showProgress: form.dataset.progress === 'true',
      submitText: form.querySelector('[type="submit"]')?.textContent
    });
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}
