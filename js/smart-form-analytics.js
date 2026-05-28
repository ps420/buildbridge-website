/**
 * v38.0: Smart Form Analytics
 * Advanced user behavior tracking and form optimization
 * Fortune 500 Data Intelligence Feature
 */

class SmartFormAnalytics {
  constructor(options = {}) {
    this.options = {
      trackFieldTime: options.trackFieldTime !== false,
      trackErrors: options.trackErrors !== false,
      trackCorrections: options.trackCorrections !== false,
      autoSuggest: options.autoSuggest !== false,
      reportInterval: options.reportInterval || 30000,
      ...options
    };
    
    this.forms = new Map();
    this.sessionData = {
      startTime: Date.now(),
      formsStarted: 0,
      formsCompleted: 0,
      fieldsInteracted: new Set(),
      totalErrors: 0,
      corrections: []
    };
    
    this.init();
  }
  
  init() {
    this.discoverForms();
    this.setupGlobalTracking();
    this.startReporting();
  }
  
  discoverForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
      form.id = formId;
      
      const formData = {
        id: formId,
        element: form,
        fields: new Map(),
        startTime: null,
        completionTime: null,
        errors: [],
        abandonmentPoint: null
      };
      
      this.forms.set(formId, formData);
      this.setupFormTracking(formData);
    });
  }
  
  setupFormTracking(formData) {
    const form = formData.element;
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      const fieldId = field.name || field.id || `field-${Math.random().toString(36).substr(2, 9)}`;
      
      const fieldData = {
        id: fieldId,
        element: field,
        type: field.type || field.tagName.toLowerCase(),
        focusCount: 0,
        timeSpent: 0,
        corrections: 0,
        errors: [],
        interactions: []
      };
      
      formData.fields.set(fieldId, fieldData);
      this.setupFieldTracking(fieldData, formData);
    });
    
    // Form start
    form.addEventListener('focusin', () => {
      if (!formData.startTime) {
        formData.startTime = Date.now();
        this.sessionData.formsStarted++;
        this.triggerEvent('formStart', { formId: formData.id });
      }
    }, { once: true });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      formData.completionTime = Date.now();
      this.sessionData.formsCompleted++;
      
      const timeToComplete = formData.completionTime - formData.startTime;
      
      this.triggerEvent('formComplete', {
        formId: formData.id,
        timeToComplete,
        fieldCount: formData.fields.size,
        errorCount: formData.errors.length
      });
      
      this.analyzeFormPerformance(formData);
    });
    
    // Form abandonment detection
    this.detectAbandonment(formData);
  }
  
  setupFieldTracking(fieldData, formData) {
    const field = fieldData.element;
    let focusStartTime = null;
    let lastValue = field.value;
    
    // Focus tracking
    field.addEventListener('focus', () => {
      fieldData.focusCount++;
      focusStartTime = Date.now();
      this.sessionData.fieldsInteracted.add(fieldData.id);
      
      fieldData.interactions.push({
        type: 'focus',
        timestamp: Date.now()
      });
      
      this.triggerEvent('fieldFocus', {
        formId: formData.id,
        fieldId: fieldData.id,
        fieldType: fieldData.type
      });
    });
    
    // Blur tracking
    field.addEventListener('blur', () => {
      if (focusStartTime) {
        fieldData.timeSpent += Date.now() - focusStartTime;
        focusStartTime = null;
      }
      
      // Check for errors on blur
      this.validateField(fieldData, formData);
    });
    
    // Input tracking
    field.addEventListener('input', (e) => {
      const currentValue = e.target.value;
      
      // Detect corrections
      if (currentValue.length < lastValue.length) {
        fieldData.corrections++;
        this.sessionData.corrections.push({
          fieldId: fieldData.id,
          timestamp: Date.now()
        });
      }
      
      lastValue = currentValue;
      
      // Real-time validation feedback
      if (this.options.autoSuggest) {
        this.provideSuggestions(fieldData, currentValue);
      }
    });
    
    // Error detection
    field.addEventListener('invalid', (e) => {
      e.preventDefault();
      
      const error = {
        type: 'validation',
        message: field.validationMessage,
        timestamp: Date.now()
      };
      
      fieldData.errors.push(error);
      formData.errors.push({
        fieldId: fieldData.id,
        ...error
      });
      
      this.sessionData.totalErrors++;
      
      this.triggerEvent('fieldError', {
        formId: formData.id,
        fieldId: fieldData.id,
        error: error.message
      });
      
      this.showFieldError(field, error.message);
    });
  }
  
  validateField(fieldData, formData) {
    const field = fieldData.element;
    
    if (field.validity && !field.validity.valid) {
      const error = {
        type: field.validity.valueMissing ? 'required' : 
               field.validity.typeMismatch ? 'type' : 'validation',
        timestamp: Date.now()
      };
      
      fieldData.errors.push(error);
      this.sessionData.totalErrors++;
    }
  }
  
  showFieldError(field, message) {
    // Remove existing error
    const existing = field.parentElement.querySelector('.field-error-message');
    if (existing) existing.remove();
    
    // Add error styling
    field.classList.add('field-error');
    
    // Create error message
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      display: block;
      font-size: 12px;
      color: #ef4444;
      margin-top: 6px;
      animation: errorSlideIn 0.3s ease;
    `;
    
    field.parentElement.appendChild(errorEl);
    
    // Remove error on input
    field.addEventListener('input', () => {
      field.classList.remove('field-error');
      const error = field.parentElement.querySelector('.field-error-message');
      if (error) error.remove();
    }, { once: true });
  }
  
  provideSuggestions(fieldData, value) {
    // Smart suggestions based on field type
    const suggestions = this.getSmartSuggestions(fieldData.type, value);
    
    if (suggestions.length > 0) {
      this.showSuggestions(fieldData.element, suggestions);
    }
  }
  
  getSmartSuggestions(type, value) {
    const suggestionDB = {
      email: ['gmail.com', 'yahoo.com', 'outlook.com', 'company.co.za'],
      tel: ['+27', '0'],
      text: []
    };
    
    const suggestions = suggestionDB[type] || [];
    
    if (type === 'email' && value.includes('@')) {
      const domain = value.split('@')[1];
      return suggestions.filter(s => s.startsWith(domain) && s !== domain);
    }
    
    return [];
  }
  
  showSuggestions(field, suggestions) {
    // Implementation for autocomplete dropdown
  }
  
  detectAbandonment(formData) {
    let mouseLeaveTime = null;
    
    document.addEventListener('mouseleave', () => {
      mouseLeaveTime = Date.now();
    });
    
    document.addEventListener('mouseenter', () => {
      if (mouseLeaveTime && !formData.completionTime) {
        const awayTime = Date.now() - mouseLeaveTime;
        
        this.triggerEvent('formAbandonmentRisk', {
          formId: formData.id,
          awayTime,
          progress: this.calculateFormProgress(formData)
        });
      }
    });
  }
  
  calculateFormProgress(formData) {
    const totalFields = formData.fields.size;
    const filledFields = Array.from(formData.fields.values())
      .filter(f => f.element.value.trim() !== '').length;
    
    return Math.round((filledFields / totalFields) * 100);
  }
  
  setupGlobalTracking() {
    // Track copy-paste behavior
    document.addEventListener('paste', (e) => {
      const field = e.target;
      if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
        this.triggerEvent('fieldPaste', {
          fieldId: field.name || field.id,
          fieldType: field.type
        });
      }
    });
    
    // Track tab usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.sessionData.tabUsage = (this.sessionData.tabUsage || 0) + 1;
      }
    });
  }
  
  analyzeFormPerformance(formData) {
    const analysis = {
      formId: formData.id,
      timeToComplete: formData.completionTime - formData.startTime,
      averageFieldTime: 0,
      mostProblematicField: null,
      totalCorrections: 0,
      abandonmentRisk: false
    };
    
    let totalFieldTime = 0;
    let maxErrors = 0;
    
    formData.fields.forEach((field, id) => {
      totalFieldTime += field.timeSpent;
      analysis.totalCorrections += field.corrections;
      
      if (field.errors.length > maxErrors) {
        maxErrors = field.errors.length;
        analysis.mostProblematicField = id;
      }
    });
    
    analysis.averageFieldTime = totalFieldTime / formData.fields.size;
    analysis.abandonmentRisk = analysis.timeToComplete > 300000; // 5 minutes
    
    console.log('Form Analysis:', analysis);
    return analysis;
  }
  
  startReporting() {
    setInterval(() => {
      this.generateReport();
    }, this.options.reportInterval);
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      session: {
        duration: Date.now() - this.sessionData.startTime,
        formsStarted: this.sessionData.formsStarted,
        formsCompleted: this.sessionData.formsCompleted,
        completionRate: this.sessionData.formsStarted > 0 
          ? (this.sessionData.formsCompleted / this.sessionData.formsStarted * 100).toFixed(1)
          : 0,
        totalErrors: this.sessionData.totalErrors,
        fieldsInteracted: this.sessionData.fieldsInteracted.size,
        totalCorrections: this.sessionData.corrections.length
      },
      forms: Array.from(this.forms.values()).map(form => ({
        id: form.id,
        started: !!form.startTime,
        completed: !!form.completionTime,
        progress: this.calculateFormProgress(form),
        errorCount: form.errors.length
      }))
    };
    
    console.log('Form Analytics Report:', report);
    return report;
  }
  
  triggerEvent(eventName, data) {
    const event = new CustomEvent('formAnalytics', {
      detail: { eventName, data, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }
  
  // Public API
  getFormData(formId) {
    return this.forms.get(formId);
  }
  
  getSessionReport() {
    return this.generateReport();
  }
  
  getFieldMetrics(formId, fieldId) {
    const form = this.forms.get(formId);
    return form ? form.fields.get(fieldId) : null;
  }
}

// CSS for form analytics
const analyticsStyles = `
  .field-error {
    border-color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.05) !important;
  }
  
  @keyframes errorSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = analyticsStyles;
document.head.appendChild(styleSheet);

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.formAnalytics = new SmartFormAnalytics();
  });
} else {
  window.formAnalytics = new SmartFormAnalytics();
}

export default SmartFormAnalytics;
