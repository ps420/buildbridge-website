/**
 * BuildBridge v27.0 - Floating Label Forms
 * Fortune 500 Quality Form Interactions
 */

class FloatingLabelForms {
  constructor(options = {}) {
    this.options = {
      formSelector: '.floating-form',
      inputSelector: '.floating-input',
      validateOnBlur: true,
      enableCharCounter: true,
      ...options
    };
    
    this.forms = [];
    this.init();
  }
  
  init() {
    this.findForms();
    this.bindEvents();
  }
  
  findForms() {
    const formElements = document.querySelectorAll(this.options.formSelector);
    this.forms = Array.from(formElements).map(form => ({
      element: form,
      inputs: Array.from(form.querySelectorAll(this.options.inputSelector)),
      submitBtn: form.querySelector('.form-submit')
    }));
  }
  
  bindEvents() {
    this.forms.forEach(form => {
      form.inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        input.addEventListener('focus', () => formGroup.classList.add('focused'));
        input.addEventListener('blur', () => {
          formGroup.classList.remove('focused');
          this.checkValue(input);
          if (this.options.validateOnBlur) this.validateInput(input);
        });
        
        input.addEventListener('input', () => {
          this.checkValue(input);
          this.updateCharCounter(input);
        });
        
        this.checkValue(input);
      });
      
      if (form.submitBtn) {
        form.submitBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleSubmit(form);
        });
      }
    });
  }
  
  checkValue(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.toggle('has-value', input.value.trim() !== '');
  }
  
  updateCharCounter(input) {
    if (!this.options.enableCharCounter) return;
    const maxLength = input.getAttribute('maxlength');
    if (!maxLength) return;
    
    const counter = input.parentElement.querySelector('.char-counter');
    if (!counter) return;
    
    const current = input.value.length;
    const max = parseInt(maxLength);
    counter.textContent = `${current}/${max}`;
    counter.classList.toggle('warning', max - current < 20);
    counter.classList.toggle('error', max - current < 10);
  }
  
  validateInput(input) {
    const formGroup = input.closest('.form-group');
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    if (input.required && value === '') {
      isValid = false;
      message = 'This field is required';
    } else if (input.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      message = 'Please enter a valid email';
    }
    
    this.setValidationState(formGroup, isValid, message);
    return isValid;
  }
  
  setValidationState(formGroup, isValid, message) {
    formGroup.classList.remove('valid', 'invalid');
    const existing = formGroup.querySelector('.validation-message');
    if (existing) existing.remove();
    
    if (isValid) {
      formGroup.classList.add('valid');
    } else {
      formGroup.classList.add('invalid');
      const msg = document.createElement('span');
      msg.className = 'validation-message';
      msg.textContent = message;
      formGroup.appendChild(msg);
    }
  }
  
  async handleSubmit(form) {
    const btn = form.submitBtn;
    let isFormValid = true;
    
    form.inputs.forEach(input => {
      if (!this.validateInput(input)) isFormValid = false;
    });
    
    if (!isFormValid) {
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 500);
      return;
    }
    
    btn.classList.add('loading');
    btn.disabled = true;
    
    await new Promise(r => setTimeout(r, 1500));
    
    btn.classList.remove('loading');
    btn.classList.add('success');
    btn.innerHTML = '<span class="form-submit-success">✓</span>';
    
    setTimeout(() => {
      btn.classList.remove('success');
      btn.disabled = false;
      btn.innerHTML = 'Submit';
      form.element.reset();
      form.inputs.forEach(input => {
        input.closest('.form-group').classList.remove('has-value', 'valid');
      });
    }, 2000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.floatingLabelForms = new FloatingLabelForms();
  });
} else {
  window.floatingLabelForms = new FloatingLabelForms();
}
