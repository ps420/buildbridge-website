/**
 * v118.0: Form Character Counter
 * Fortune 500 Professional Feature
 * Real-time character counting, typing speed, and form analytics
 */

class FormCharacterCounter {
  constructor(options = {}) {
    this.options = {
      autoInit: options.autoInit !== false,
      showTypingSpeed: options.showTypingSpeed !== false,
      showWordCount: options.showWordCount !== false,
      showAutoSave: options.showAutoSave !== false,
      autoSaveInterval: options.autoSaveInterval || 3000,
      typingTimeout: options.typingTimeout || 3000,
      chartBars: options.chartBars || 20,
      ...options
    };
    
    this.instances = new Map();
    this.typingHistory = [];
    this.isTyping = false;
    this.typingStartTime = null;
    this.autoSaveTimeout = null;
    this.analyticsPanel = null;
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  init() {
    this.findAndEnhanceInputs();
    this.bindEvents();
  }
  
  findAndEnhanceInputs() {
    // Find inputs with data-max-length
    document.querySelectorAll('[data-max-length]').forEach(input => {
      this.enhanceInput(input);
    });
    
    // Find forms with analytics enabled
    document.querySelectorAll('form[data-analytics]').forEach(form => {
      this.attachFormAnalytics(form);
    });
  }
  
  enhanceInput(input) {
    if (this.instances.has(input)) return;
    
    const maxLength = parseInt(input.dataset.maxLength) || input.maxLength;
    const showRing = input.dataset.showRing !== undefined;
    const showWords = input.dataset.showWords !== undefined || this.options.showWordCount;
    
    // Wrap input if needed
    let wrapper = input.parentElement;
    if (!wrapper.classList.contains('char-counter-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'char-counter-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }
    
    // Create counter element
    const counter = document.createElement('div');
    counter.className = showRing ? 'char-counter-ring' : 'char-counter';
    
    if (showRing) {
      const circumference = 2 * Math.PI * 12; // r=12
      counter.innerHTML = `
        <svg viewBox="0 0 32 32">
          <circle class="char-counter-ring-bg" cx="16" cy="16" r="12"/>
          <circle class="char-counter-ring-fill" cx="16" cy="16" r="12" 
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${circumference}"/>
        </svg>
        <span class="char-counter-ring-text">0</span>
      `;
    } else {
      counter.innerHTML = `
        <span class="char-counter-current">0</span>
        <span class="char-counter-separator">/</span>
        <span class="char-counter-max">${maxLength}</span>
      `;
    }
    
    wrapper.appendChild(counter);
    
    // Create typing speed indicator
    let speedIndicator = null;
    if (this.options.showTypingSpeed) {
      speedIndicator = document.createElement('div');
      speedIndicator.className = 'typing-speed-indicator';
      speedIndicator.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span class="typing-speed-value">0</span> WPM
      `;
      wrapper.appendChild(speedIndicator);
    }
    
    // Create auto-save indicator
    let autoSaveIndicator = null;
    if (this.options.showAutoSave && input.dataset.autoSave !== 'false') {
      autoSaveIndicator = document.createElement('div');
      autoSaveIndicator.className = 'auto-save-indicator';
      autoSaveIndicator.innerHTML = `
        <span class="auto-save-text">Saved</span>
      `;
      wrapper.appendChild(autoSaveIndicator);
    }
    
    // Create validation icon
    const validationIcon = document.createElement('div');
    validationIcon.className = 'validation-icon';
    validationIcon.innerHTML = `
      <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    `;
    wrapper.appendChild(validationIcon);
    
    // Store instance
    this.instances.set(input, {
      wrapper,
      counter,
      speedIndicator,
      autoSaveIndicator,
      validationIcon,
      maxLength,
      showRing,
      showWords,
      typingStart: null,
      lastLength: 0,
      keystrokes: 0
    });
    
    // Initial update
    this.updateCounter(input);
  }
  
  bindEvents() {
    // Input events
    document.addEventListener('input', (e) => {
      if (this.instances.has(e.target)) {
        this.handleInput(e.target);
      }
    });
    
    // Focus/blur events
    document.addEventListener('focusin', (e) => {
      if (this.instances.has(e.target)) {
        this.handleFocus(e.target);
      }
    });
    
    document.addEventListener('focusout', (e) => {
      if (this.instances.has(e.target)) {
        this.handleBlur(e.target);
      }
    });
    
    // Keyboard events for typing speed
    document.addEventListener('keydown', (e) => {
      if (this.instances.has(e.target) && e.key.length === 1) {
        this.handleKeystroke(e.target);
      }
    });
    
    // Global typing end detection
    setInterval(() => this.checkTypingEnd(), 1000);
  }
  
  handleInput(input) {
    const instance = this.instances.get(input);
    
    // Update counter
    this.updateCounter(input);
    
    // Start typing session
    if (!instance.typingStart) {
      instance.typingStart = Date.now();
      this.isTyping = true;
    }
    
    // Schedule auto-save
    if (instance.autoSaveIndicator) {
      this.scheduleAutoSave(input);
    }
    
    // Validate
    this.validateInput(input);
  }
  
  handleKeystroke(input) {
    const instance = this.instances.get(input);
    instance.keystrokes++;
    
    // Show typing speed indicator
    if (instance.speedIndicator) {
      instance.speedIndicator.classList.add('visible', 'typing');
    }
    
    // Clear previous timeout
    clearTimeout(instance.typingTimeout);
    
    // Set new timeout
    instance.typingTimeout = setTimeout(() => {
      this.calculateTypingSpeed(input);
    }, 1000);
  }
  
  calculateTypingSpeed(input) {
    const instance = this.instances.get(input);
    
    if (!instance.typingStart || instance.keystrokes === 0) return;
    
    const elapsedMinutes = (Date.now() - instance.typingStart) / 60000;
    if (elapsedMinutes < 0.1) return; // Need at least 6 seconds
    
    const wpm = Math.round((instance.keystrokes / 5) / elapsedMinutes);
    
    // Update display
    if (instance.speedIndicator) {
      const valueEl = instance.speedIndicator.querySelector('.typing-speed-value');
      valueEl.textContent = Math.min(999, wpm);
      
      instance.speedIndicator.classList.remove('fast');
      if (wpm > 60) {
        instance.speedIndicator.classList.add('fast');
      }
    }
    
    // Add to history
    this.typingHistory.push(wpm);
    if (this.typingHistory.length > this.options.chartBars) {
      this.typingHistory.shift();
    }
    
    // Update analytics panel
    this.updateAnalyticsPanel();
  }
  
  checkTypingEnd() {
    this.instances.forEach((instance, input) => {
      if (instance.typingStart && Date.now() - instance.typingStart > this.options.typingTimeout) {
        // Typing session ended
        instance.typingStart = null;
        instance.keystrokes = 0;
        
        if (instance.speedIndicator) {
          instance.speedIndicator.classList.remove('visible', 'typing');
        }
      }
    });
  }
  
  updateCounter(input) {
    const instance = this.instances.get(input);
    const value = input.value || input.textContent || '';
    const count = instance.showWords ? value.trim().split(/\s+/).filter(w => w).length : value.length;
    const max = instance.maxLength;
    const percentage = max ? (count / max) * 100 : 0;
    
    if (instance.showRing) {
      // Ring display
      const circumference = 2 * Math.PI * 12;
      const offset = circumference - (percentage / 100) * circumference;
      const ringFill = instance.counter.querySelector('.char-counter-ring-fill');
      const ringText = instance.counter.querySelector('.char-counter-ring-text');
      
      if (ringFill) ringFill.style.strokeDashoffset = offset;
      if (ringText) ringText.textContent = count;
      
      // Update ring color
      instance.counter.classList.remove('warning', 'danger', 'success');
      if (percentage >= 100) {
        instance.counter.classList.add('danger');
      } else if (percentage >= 80) {
        instance.counter.classList.add('warning');
      } else if (percentage > 0) {
        instance.counter.classList.add('success');
      }
    } else {
      // Text display
      const currentEl = instance.counter.querySelector('.char-counter-current');
      if (currentEl) currentEl.textContent = count;
      
      // Update counter color
      instance.counter.classList.remove('warning', 'danger', 'success');
      if (percentage >= 100) {
        instance.counter.classList.add('danger');
      } else if (percentage >= 80) {
        instance.counter.classList.add('warning');
      }
    }
  }
  
  validateInput(input) {
    const instance = this.instances.get(input);
    const value = input.value || '';
    const isValid = input.checkValidity && input.checkValidity();
    const isTooLong = instance.maxLength && value.length > instance.maxLength;
    
    instance.validationIcon.classList.remove('visible', 'success', 'error');
    
    if (value.length > 0) {
      if (isValid && !isTooLong) {
        instance.validationIcon.classList.add('visible', 'success');
      } else if (isTooLong) {
        instance.validationIcon.classList.add('visible', 'error');
      }
    }
  }
  
  scheduleAutoSave(input) {
    const instance = this.instances.get(input);
    
    clearTimeout(this.autoSaveTimeout);
    
    instance.autoSaveIndicator.classList.add('visible', 'saving');
    instance.autoSaveIndicator.innerHTML = `
      <span class="auto-save-spinner"></span>
      <span class="auto-save-text">Saving...</span>
    `;
    
    this.autoSaveTimeout = setTimeout(() => {
      this.performAutoSave(input);
    }, this.options.autoSaveInterval);
  }
  
  performAutoSave(input) {
    const instance = this.instances.get(input);
    
    // Save to localStorage
    const formId = input.closest('form')?.id || 'default';
    const fieldName = input.name || input.id || 'field';
    const key = `bb_autosave_${formId}_${fieldName}`;
    
    localStorage.setItem(key, input.value);
    localStorage.setItem(`${key}_time`, Date.now().toString());
    
    // Update indicator
    instance.autoSaveIndicator.classList.remove('saving');
    instance.autoSaveIndicator.classList.add('saved');
    instance.autoSaveIndicator.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span class="auto-save-text">Saved</span>
    `;
    
    // Hide after delay
    setTimeout(() => {
      instance.autoSaveIndicator.classList.remove('visible');
    }, 2000);
  }
  
  handleFocus(input) {
    // Show counter
    const instance = this.instances.get(input);
    instance.counter.style.opacity = '1';
    
    // Show analytics panel
    this.showAnalyticsPanel();
  }
  
  handleBlur(input) {
    const instance = this.instances.get(input);
    
    // Don't hide immediately to allow reading
    setTimeout(() => {
      if (document.activeElement !== input) {
        instance.counter.style.opacity = '0.7';
      }
    }, 100);
  }
  
  showAnalyticsPanel() {
    if (this.analyticsPanel) {
      this.analyticsPanel.classList.add('visible');
      return;
    }
    
    this.analyticsPanel = document.createElement('div');
    this.analyticsPanel.className = 'typing-analytics';
    this.analyticsPanel.innerHTML = `
      <div class="typing-analytics-header">
        <span class="typing-analytics-title">Typing Analytics</span>
        <button class="typing-analytics-close" aria-label="Close analytics">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="typing-analytics-content">
        <div class="typing-stat">
          <span class="typing-stat-label">Current WPM</span>
          <span class="typing-stat-value current-wpm">0</span>
        </div>
        <div class="typing-stat">
          <span class="typing-stat-label">Average WPM</span>
          <span class="typing-stat-value avg-wpm">0</span>
        </div>
        <div class="typing-stat">
          <span class="typing-stat-label">Session Time</span>
          <span class="typing-stat-value session-time">0:00</span>
        </div>
        <div class="typing-stat">
          <span class="typing-stat-label">Total Keystrokes</span>
          <span class="typing-stat-value total-keystrokes">0</span>
        </div>
        <div class="typing-chart"></div>
      </div>
    `;
    
    document.body.appendChild(this.analyticsPanel);
    
    // Close button
    this.analyticsPanel.querySelector('.typing-analytics-close').addEventListener('click', () => {
      this.analyticsPanel.classList.remove('visible');
    });
    
    this.updateAnalyticsPanel();
  }
  
  updateAnalyticsPanel() {
    if (!this.analyticsPanel) return;
    
    // Calculate stats
    let totalKeystrokes = 0;
    let currentWPM = 0;
    
    this.instances.forEach(instance => {
      totalKeystrokes += instance.keystrokes;
      if (instance.typingStart) {
        const elapsed = (Date.now() - instance.typingStart) / 60000;
        if (elapsed > 0) {
          currentWPM = Math.round((instance.keystrokes / 5) / elapsed);
        }
      }
    });
    
    const avgWPM = this.typingHistory.length > 0 
      ? Math.round(this.typingHistory.reduce((a, b) => a + b, 0) / this.typingHistory.length)
      : 0;
    
    // Update display
    this.analyticsPanel.querySelector('.current-wpm').textContent = currentWPM;
    this.analyticsPanel.querySelector('.avg-wpm').textContent = avgWPM;
    this.analyticsPanel.querySelector('.total-keystrokes').textContent = totalKeystrokes.toLocaleString();
    
    // Update chart
    this.updateChart();
  }
  
  updateChart() {
    const chart = this.analyticsPanel.querySelector('.typing-chart');
    if (!chart) return;
    
    // Ensure we have data
    while (this.typingHistory.length < this.options.chartBars) {
      this.typingHistory.unshift(0);
    }
    
    const maxWPM = Math.max(...this.typingHistory, 60);
    
    chart.innerHTML = this.typingHistory.map((wpm, i) => {
      const height = maxWPM > 0 ? (wpm / maxWPM) * 100 : 0;
      const isActive = i === this.typingHistory.length - 1;
      const isFast = wpm > 60;
      return `<div class="typing-chart-bar ${isActive ? 'active' : ''} ${isFast ? 'fast' : ''}" style="height: ${Math.max(4, height)}%"></div>`;
    }).join('');
  }
  
  attachFormAnalytics(form) {
    // Create status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'form-status-bar';
    statusBar.innerHTML = `
      <div class="form-status-left">
        <div class="form-status-item">
          <strong>0</strong> fields completed
        </div>
        <div class="form-status-item">
          <strong>0%</strong> complete
        </div>
        <div class="form-status-progress">
          <div class="form-status-progress-fill" style="width: 0%"></div>
        </div>
      </div>
      <div class="form-status-item">
        Est. time: <strong>2 min</strong>
      </div>
    `;
    
    document.body.appendChild(statusBar);
    
    // Update on input
    const updateProgress = () => {
      const fields = form.querySelectorAll('input, textarea, select');
      const filled = Array.from(fields).filter(f => {
        if (f.type === 'checkbox' || f.type === 'radio') return f.checked;
        return f.value.trim() !== '';
      }).length;
      const total = fields.length;
      const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
      
      const progressFill = statusBar.querySelector('.form-status-progress-fill');
      const completedEl = statusBar.querySelector('.form-status-item strong');
      const percentEl = statusBar.querySelectorAll('.form-status-item strong')[1];
      
      if (progressFill) progressFill.style.width = `${percentage}%`;
      if (completedEl) completedEl.textContent = filled;
      if (percentEl) percentEl.textContent = `${percentage}%`;
      
      // Show/hide status bar
      if (filled > 0) {
        statusBar.classList.add('visible');
      }
    };
    
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    
    // Hide on form submit or navigation
    form.addEventListener('submit', () => {
      statusBar.classList.remove('visible');
    });
  }
  
  // Restore saved data
  restoreAutoSave(formId = 'default') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`bb_autosave_${formId}_`)) {
        const fieldName = key.replace(`bb_autosave_${formId}_`, '');
        const input = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (input) {
          input.value = localStorage.getItem(key);
          this.updateCounter(input);
        }
      }
    });
  }
  
  destroy() {
    this.instances.forEach((instance, input) => {
      instance.wrapper?.replaceWith(input);
    });
    this.instances.clear();
    this.analyticsPanel?.remove();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.formCharacterCounter = new FormCharacterCounter();
  });
} else {
  window.formCharacterCounter = new FormCharacterCounter();
}
