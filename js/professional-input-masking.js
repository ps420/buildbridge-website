/**
 * Professional Input Masking System v56.0
 * Fortune 500 Form Field Standard
 */

class InputMasking {
  constructor() {
    this.masks = new Map();
    this.init();
  }

  init() {
    this.setupPhoneMasks();
    this.setupCurrencyMasks();
    this.setupDateMasks();
    this.setupCreditCardMasks();
    this.setupPercentageMasks();
    this.setupIDNumberMasks();
    this.setupCharacterCounters();
    this.setupClearButtons();
    this.setupCopyButtons();
  }

  // Phone Number Masking
  setupPhoneMasks() {
    const phoneInputs = document.querySelectorAll('input[data-mask="phone"], input[type="tel"]');
    
    phoneInputs.forEach(input => {
      const country = input.dataset.country || 'ZA';
      const masks = {
        'ZA': '(___) ___-____',
        'US': '(___) ___-____',
        'UK': '____ ___ ____',
        'EU': '___ __ __ __ __'
      };
      
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        const mask = masks[country] || masks['ZA'];
        
        let result = '';
        let valueIndex = 0;
        
        for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
          if (mask[i] === '_') {
            result += value[valueIndex++];
          } else {
            result += mask[i];
            if (valueIndex > 0) result += value[valueIndex++];
          }
        }
        
        e.target.value = result;
        
        // Validate
        this.validatePhone(input, country);
      });

      // Add country code selector for South Africa
      if (country === 'ZA' && input.parentElement) {
        this.addCountrySelector(input);
      }
    });
  }

  addCountrySelector(input) {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-phone input-masked';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const countrySelect = document.createElement('div');
    countrySelect.className = 'phone-country-select';
    countrySelect.innerHTML = '<span class="flag">🇿🇦</span><span class="code">+27</span>';
    wrapper.insertBefore(countrySelect, input);

    // Country dropdown
    const countries = [
      { code: 'ZA', flag: '🇿🇦', dial: '+27' },
      { code: 'US', flag: '🇺🇸', dial: '+1' },
      { code: 'UK', flag: '🇬🇧', dial: '+44' },
      { code: 'DE', flag: '🇩🇪', dial: '+49' },
      { code: 'AU', flag: '🇦🇺', dial: '+61' }
    ];

    countrySelect.addEventListener('click', () => {
      // Toggle dropdown
      this.showCountryDropdown(countrySelect, countries, (selected) => {
        countrySelect.innerHTML = `<span class="flag">${selected.flag}</span><span class="code">${selected.dial}</span>`;
        input.dataset.country = selected.code;
      });
    });
  }

  // Currency Masking
  setupCurrencyMasks() {
    const currencyInputs = document.querySelectorAll('input[data-mask="currency"], input[data-type="currency"]');
    
    currencyInputs.forEach(input => {
      const currency = input.dataset.currency || 'R';
      
      // Wrap in container
      const wrapper = document.createElement('div');
      wrapper.className = 'input-currency input-masked';
      wrapper.dataset.currency = currency;
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        
        // Handle decimal points
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Format with thousand separators
        if (value) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            e.target.value = this.formatCurrency(numValue, false);
          }
        }
      });

      input.addEventListener('blur', (e) => {
        const value = parseFloat(e.target.value.replace(/[^\d.]/g, ''));
        if (!isNaN(value)) {
          e.target.value = this.formatCurrency(value, true);
        }
      });

      input.addEventListener('focus', (e) => {
        // Remove formatting on focus for easier editing
        e.target.value = e.target.value.replace(/[^\d.]/g, '');
      });
    });
  }

  formatCurrency(value, withSymbol = true) {
    const formatter = new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return withSymbol ? `R ${formatter.format(value)}` : formatter.format(value);
  }

  // Date Masking
  setupDateMasks() {
    const dateInputs = document.querySelectorAll('input[data-mask="date"], input[data-type="date"]');
    
    dateInputs.forEach(input => {
      const format = input.dataset.format || 'DD/MM/YYYY';
      
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (format === 'DD/MM/YYYY') {
          if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
          if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
        } else if (format === 'MM/DD/YYYY') {
          if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
          if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
        } else if (format === 'YYYY-MM-DD') {
          if (value.length >= 4) value = value.slice(0, 4) + '-' + value.slice(4);
          if (value.length >= 7) value = value.slice(0, 7) + '-' + value.slice(7, 9);
        }
        
        e.target.value = value;
        this.validateDate(input, format);
      });
    });
  }

  // Credit Card Masking
  setupCreditCardMasks() {
    const cardInputs = document.querySelectorAll('input[data-mask="creditcard"], input[data-type="creditcard"]');
    
    cardInputs.forEach(input => {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-credit-card input-masked';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const typeIndicator = document.createElement('span');
      typeIndicator.className = 'card-type-indicator';
      wrapper.appendChild(typeIndicator);

      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Add spaces every 4 digits
        value = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = value;
        
        // Detect card type
        const cardType = this.detectCardType(value.replace(/\s/g, ''));
        if (cardType) {
          typeIndicator.textContent = cardType.icon;
          typeIndicator.classList.add('visible');
        } else {
          typeIndicator.classList.remove('visible');
        }
      });
    });
  }

  detectCardType(number) {
    const patterns = {
      visa: { pattern: /^4/, icon: '💳' },
      mastercard: { pattern: /^5[1-5]/, icon: '💳' },
      amex: { pattern: /^3[47]/, icon: '💳' }
    };
    
    for (const [type, data] of Object.entries(patterns)) {
      if (data.pattern.test(number)) {
        return { type, icon: data.icon };
      }
    }
    return null;
  }

  // Percentage Masking
  setupPercentageMasks() {
    const percentInputs = document.querySelectorAll('input[data-mask="percentage"], input[data-type="percentage"]');
    
    percentInputs.forEach(input => {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-percentage input-masked';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        const numValue = parseFloat(value);
        
        if (!isNaN(numValue) && numValue <= 100) {
          e.target.dataset.value = numValue;
        } else if (numValue > 100) {
          e.target.value = '100';
        }
      });
    });
  }

  // South African ID Number Masking
  setupIDNumberMasks() {
    const idInputs = document.querySelectorAll('input[data-mask="sa-id"], input[data-type="sa-id"]');
    
    idInputs.forEach(input => {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-sa-id input-masked';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const indicator = document.createElement('span');
      indicator.className = 'id-validation-indicator';
      wrapper.appendChild(indicator);

      input.setAttribute('maxlength', '13');
      
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 13);
        
        if (e.target.value.length === 13) {
          const isValid = this.validateSAID(e.target.value);
          indicator.textContent = isValid ? '✓' : '✕';
          indicator.className = 'id-validation-indicator ' + (isValid ? 'valid' : 'invalid');
          wrapper.classList.toggle('valid', isValid);
          wrapper.classList.toggle('invalid', !isValid);
        } else {
          indicator.className = 'id-validation-indicator';
          wrapper.classList.remove('valid', 'invalid');
        }
      });
    });
  }

  validateSAID(id) {
    if (id.length !== 13) return false;
    
    // Luhn algorithm validation
    let sum = 0;
    let alternate = false;
    
    for (let i = id.length - 1; i >= 0; i--) {
      let n = parseInt(id.substring(i, i + 1), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  }

  // Character Counter
  setupCharacterCounters() {
    const counterInputs = document.querySelectorAll('textarea[data-maxlength], input[data-maxlength]');
    
    counterInputs.forEach(input => {
      const maxLength = parseInt(input.dataset.maxlength);
      
      const counter = document.createElement('div');
      counter.className = 'char-counter';
      input.parentNode.appendChild(counter);

      const updateCounter = () => {
        const remaining = maxLength - input.value.length;
        counter.textContent = `${input.value.length} / ${maxLength}`;
        
        counter.classList.remove('warning', 'danger');
        if (remaining < 20) counter.classList.add('warning');
        if (remaining < 10) counter.classList.add('danger');
      };

      input.addEventListener('input', updateCounter);
      updateCounter();
    });
  }

  // Clear Buttons
  setupClearButtons() {
    const inputs = document.querySelectorAll('input[data-clearable], .input-with-clear input');
    
    inputs.forEach(input => {
      const wrapper = input.closest('.input-masked') || input.parentElement;
      wrapper.classList.add('input-with-clear');
      
      const clearBtn = document.createElement('button');
      clearBtn.className = 'input-clear-btn';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '✕';
      clearBtn.setAttribute('aria-label', 'Clear input');
      wrapper.appendChild(clearBtn);

      clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  // Copy to Clipboard Buttons
  setupCopyButtons() {
    const inputs = document.querySelectorAll('input[data-copyable]');
    
    inputs.forEach(input => {
      const wrapper = input.closest('.input-masked') || input.parentElement;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'mask-copy-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy to clipboard');
      wrapper.appendChild(copyBtn);

      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(input.value).then(() => {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }

  // Validation Methods
  validatePhone(input, country) {
    const value = input.value.replace(/\D/g, '');
    const minLength = country === 'ZA' ? 10 : 10;
    const isValid = value.length >= minLength;
    
    this.showValidation(input, isValid, isValid ? 'Valid phone number' : 'Please enter a valid phone number');
  }

  validateDate(input, format) {
    const value = input.value;
    let isValid = false;
    
    if (format === 'DD/MM/YYYY') {
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (match) {
        const [_, day, month, year] = match;
        const date = new Date(year, month - 1, day);
        isValid = date.getDate() == day && date.getMonth() == month - 1;
      }
    }
    
    this.showValidation(input, isValid, isValid ? 'Valid date' : 'Please enter a valid date');
  }

  showValidation(input, isValid, message) {
    const wrapper = input.closest('.input-masked');
    if (!wrapper) return;

    // Remove existing message
    const existing = wrapper.querySelector('.mask-validation-message');
    if (existing) existing.remove();

    // Only show if there's a value
    if (!input.value) {
      wrapper.classList.remove('valid', 'invalid');
      return;
    }

    // Add validation classes
    wrapper.classList.toggle('valid', isValid);
    wrapper.classList.toggle('invalid', !isValid);

    // Create message
    const msgEl = document.createElement('div');
    msgEl.className = `mask-validation-message ${isValid ? 'success' : 'error'}`;
    msgEl.innerHTML = `${isValid ? '✓' : '✕'} ${message}`;
    wrapper.appendChild(msgEl);

    // Show with animation
    requestAnimationFrame(() => msgEl.classList.add('visible'));
  }

  // Utility: Format number
  formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  // Utility: Unmask value
  unmask(input) {
    return input.value.replace(/[^\d]/g, '');
  }
}

// Initialize
const inputMasking = new InputMasking();

// Export
window.InputMasking = InputMasking;
window.inputMasking = inputMasking;
