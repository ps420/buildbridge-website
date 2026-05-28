/**
 * SMART FORM AUTOSAVE SYSTEM v46.0
 * Fortune 500 Quality Form Persistence
 * Auto-saves form data to localStorage with conflict resolution
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    saveDelay: 2000,             // Delay before auto-save (ms)
    storagePrefix: 'bb_form_',   // localStorage key prefix
    maxRetries: 3,               // Max save retries on failure
    retentionDays: 30,           // Form data retention period
    compression: false           // Enable compression for large forms
  };

  // State
  const state = {
    forms: new Map(),            // Active form data
    saveTimers: new Map(),       // Debounce timers
    retryCounts: new Map(),      // Retry counters
    isRestoring: false           // Prevent save during restore
  };

  /**
   * Initialize autosave for all forms with data-autosave attribute
   */
  function init() {
    const forms = document.querySelectorAll('form[data-autosave]');
    
    forms.forEach(form => {
      const formId = form.id || form.dataset.autosave || generateFormId();
      form.id = formId;
      
      setupFormAutosave(form, formId);
      checkForDraft(form, formId);
    });
    
    console.log(`[Autosave] Initialized ${forms.length} form(s)`);
  }

  /**
   * Setup autosave for a specific form
   */
  function setupFormAutosave(form, formId) {
    const storageKey = `${CONFIG.storagePrefix}${formId}`;
    
    // Add visual indicator
    addAutosaveIndicator(form);
    
    // Listen for input events
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', debounceSave.bind(null, form, formId));
      input.addEventListener('change', () => saveFormData(form, formId));
    });
    
    // Listen for form submission
    form.addEventListener('submit', () => {
      clearFormData(formId);
      showAutosaveStatus(form, 'Form submitted successfully');
    });
    
    // Clear on successful submit via AJAX
    form.addEventListener('form:success', () => clearFormData(formId));
    
    // Save before page unload
    window.addEventListener('beforeunload', () => {
      if (!state.isRestoring) {
        saveFormData(form, formId);
      }
    });
    
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && !state.isRestoring) {
        saveFormData(form, formId);
      }
    });
  }

  /**
   * Debounced save handler
   */
  function debounceSave(form, formId) {
    const timerKey = `${formId}_timer`;
    
    // Show saving indicator
    showAutosaveStatus(form, 'Saving...', 'saving');
    
    // Clear existing timer
    if (state.saveTimers.has(timerKey)) {
      clearTimeout(state.saveTimers.get(timerKey));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      saveFormData(form, formId);
    }, CONFIG.saveDelay);
    
    state.saveTimers.set(timerKey, timer);
  }

  /**
   * Save form data to localStorage
   */
  function saveFormData(form, formId) {
    if (state.isRestoring) return;
    
    const storageKey = `${CONFIG.storagePrefix}${formId}`;
    const data = {
      timestamp: Date.now(),
      url: window.location.href,
      fields: {}
    };
    
    // Collect form data
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (shouldSaveField(input)) {
        data.fields[input.name || input.id] = {
          value: input.type === 'checkbox' ? input.checked : input.value,
          type: input.type,
          checked: input.checked
        };
      }
    });
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      localStorage.setItem(`${storageKey}_meta`, JSON.stringify({
        savedAt: new Date().toISOString(),
        fieldCount: Object.keys(data.fields).length
      }));
      
      showAutosaveStatus(form, 'Saved', 'saved');
      updateFormProgress(form);
      
      console.log(`[Autosave] Form "${formId}" saved (${Object.keys(data.fields).length} fields)`);
    } catch (error) {
      handleSaveError(form, formId, error);
    }
  }

  /**
   * Check if field should be saved
   */
  function shouldSaveField(input) {
    // Skip sensitive fields
    const sensitiveTypes = ['password', 'credit-card', 'cvv'];
    if (sensitiveTypes.includes(input.type)) return false;
    
    // Skip fields with data-no-autosave
    if (input.dataset.noAutosave) return false;
    
    // Skip hidden fields (unless explicitly marked)
    if (input.type === 'hidden' && !input.dataset.autosave) return false;
    
    return true;
  }

  /**
   * Load form data from localStorage
   */
  function loadFormData(formId) {
    const storageKey = `${CONFIG.storagePrefix}${formId}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('[Autosave] Failed to parse saved data:', error);
      clearFormData(formId);
      return null;
    }
  }

  /**
   * Check for saved draft and show restore notification
   */
  function checkForDraft(form, formId) {
    const data = loadFormData(formId);
    if (!data) return;
    
    // Check if data is stale
    const age = Date.now() - data.timestamp;
    const maxAge = CONFIG.retentionDays * 24 * 60 * 60 * 1000;
    
    if (age > maxAge) {
      clearFormData(formId);
      return;
    }
    
    // Check if current form has data (conflict)
    const currentData = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    let hasCurrentData = false;
    
    inputs.forEach(input => {
      const value = input.type === 'checkbox' ? input.checked : input.value;
      if (value && value !== input.defaultValue) {
        hasCurrentData = true;
      }
    });
    
    if (hasCurrentData) {
      showConflictModal(form, formId, data);
    } else {
      showRestoreNotification(form, formId, data);
    }
  }

  /**
   * Restore form data
   */
  function restoreFormData(form, formId) {
    const data = loadFormData(formId);
    if (!data) return;
    
    state.isRestoring = true;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      const savedField = data.fields[fieldName];
      
      if (savedField) {
        if (input.type === 'checkbox') {
          input.checked = savedField.checked || savedField.value;
        } else if (input.type === 'radio') {
          input.checked = (input.value === savedField.value);
        } else {
          input.value = savedField.value;
        }
        
        // Trigger change event for any listeners
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    state.isRestoring = false;
    updateFormProgress(form);
    
    console.log(`[Autosave] Form "${formId}" restored`);
  }

  /**
   * Clear saved form data
   */
  function clearFormData(formId) {
    const storageKey = `${CONFIG.storagePrefix}${formId}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_meta`);
    console.log(`[Autosave] Form "${formId}" data cleared`);
  }

  /**
   * Show restore notification
   */
  function showRestoreNotification(form, formId, data) {
    // Remove existing notification
    const existing = document.querySelector('.draft-restore-notification');
    if (existing) existing.remove();
    
    const savedDate = new Date(data.timestamp);
    const timeAgo = getTimeAgo(savedDate);
    
    const notification = document.createElement('div');
    notification.className = 'draft-restore-notification';
    notification.innerHTML = `
      <div class="draft-restore-header">
        <div class="draft-restore-icon">💾</div>
        <h4 class="draft-restore-title">Restore Draft?</h4>
      </div>
      <p class="draft-restore-meta">We found a saved draft from ${timeAgo} with data for ${Object.keys(data.fields).length} fields.</p>
      <div class="draft-restore-actions">
        <button class="draft-restore-btn primary" data-action="restore">Restore Draft</button>
        <button class="draft-restore-btn secondary" data-action="discard">Discard</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show after delay
    setTimeout(() => notification.classList.add('visible'), 500);
    
    // Handle actions
    notification.querySelector('[data-action="restore"]').addEventListener('click', () => {
      restoreFormData(form, formId);
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 500);
      showAutosaveStatus(form, 'Draft restored successfully');
    });
    
    notification.querySelector('[data-action="discard"]').addEventListener('click', () => {
      clearFormData(formId);
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 500);
    });
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 500);
      }
    }, 30000);
  }

  /**
   * Show conflict resolution modal
   */
  function showConflictModal(form, formId, savedData) {
    const existing = document.querySelector('.autosave-conflict-modal');
    if (existing) return;
    
    const modal = document.createElement('div');
    modal.className = 'autosave-conflict-modal';
    modal.innerHTML = `
      <div class="autosave-conflict-content">
        <h3 class="autosave-conflict-title">Unsaved Changes Detected</h3>
        <p class="autosave-conflict-desc">You have both current form data and a saved draft. Which would you like to keep?</p>
        <div class="autosave-conflict-options">
          <button class="autosave-conflict-option" data-action="current">
            <div class="autosave-conflict-option-title">Keep Current Data</div>
            <div class="autosave-conflict-option-desc">Use the data already entered in the form</div>
          </button>
          <button class="autosave-conflict-option" data-action="draft">
            <div class="autosave-conflict-option-title">Restore Saved Draft</div>
            <div class="autosave-conflict-option-desc">Replace current data with previously saved draft from ${getTimeAgo(new Date(savedData.timestamp))}</div>
          </button>
          <button class="autosave-conflict-option" data-action="merge">
            <div class="autosave-conflict-option-title">Merge Both</div>
            <div class="autosave-conflict-option-desc">Fill empty fields from saved draft, keep current values</div>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show
    requestAnimationFrame(() => modal.classList.add('visible'));
    
    // Handle actions
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        
        if (action === 'draft') {
          restoreFormData(form, formId);
        } else if (action === 'merge') {
          mergeFormData(form, formId, savedData);
        }
        // 'current' - do nothing, keep as is
        
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
      });
    });
  }

  /**
   * Merge saved data with current form
   */
  function mergeFormData(form, formId, savedData) {
    state.isRestoring = true;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      const savedField = savedData.fields[fieldName];
      
      // Only fill if current field is empty
      const currentValue = input.type === 'checkbox' ? input.checked : input.value;
      if (!currentValue && savedField) {
        if (input.type === 'checkbox') {
          input.checked = savedField.checked || savedField.value;
        } else if (input.type === 'radio') {
          input.checked = (input.value === savedField.value);
        } else {
          input.value = savedField.value;
        }
        
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    state.isRestoring = false;
    updateFormProgress(form);
  }

  /**
   * Add autosave visual indicator to form
   */
  function addAutosaveIndicator(form) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-autosave-wrapper';
    
    const status = document.createElement('div');
    status.className = 'autosave-status';
    status.innerHTML = `
      <span class="autosave-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v6m0 0l3-3m-3 3l-3-3M4 13h16M4 13v7a2 2 0 002 2h12a2 2 0 002-2v-7"/>
        </svg>
      </span>
      <span class="autosave-text">Auto-saving enabled</span>
      <span class="autosave-timestamp"></span>
    `;
    
    form.insertBefore(status, form.firstChild);
  }

  /**
   * Show autosave status
   */
  function showAutosaveStatus(form, text, type = '') {
    const status = form.querySelector('.autosave-status');
    if (!status) return;
    
    const textEl = status.querySelector('.autosave-text');
    const timestampEl = status.querySelector('.autosave-timestamp');
    
    textEl.textContent = text;
    status.className = `autosave-status visible ${type}`;
    
    if (type === 'saved') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timestampEl.textContent = `at ${time}`;
      
      // Hide after 3 seconds
      setTimeout(() => {
        status.classList.remove('visible');
      }, 3000);
    }
  }

  /**
   * Update form progress indicator
   */
  function updateFormProgress(form) {
    const progressBar = form.querySelector('.form-progress-fill');
    if (!progressBar) return;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    const total = inputs.length;
    let filled = 0;
    
    inputs.forEach(input => {
      const value = input.type === 'checkbox' ? input.checked : input.value;
      if (value) filled++;
    });
    
    const percentage = total > 0 ? (filled / total) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
    
    const progressText = form.querySelector('.form-progress-text');
    if (progressText) {
      progressText.innerHTML = `
        <span>Form Progress</span>
        <span>${Math.round(percentage)}% Complete</span>
      `;
    }
  }

  /**
   * Handle save error
   */
  function handleSaveError(form, formId, error) {
    console.error('[Autosave] Save failed:', error);
    
    const retryKey = `${formId}_retries`;
    let retries = state.retryCounts.get(retryKey) || 0;
    retries++;
    
    if (retries < CONFIG.maxRetries) {
      state.retryCounts.set(retryKey, retries);
      setTimeout(() => saveFormData(form, formId), 1000 * retries);
    } else {
      showAutosaveStatus(form, 'Save failed - storage full', 'error');
      state.retryCounts.delete(retryKey);
    }
  }

  /**
   * Get human-readable time ago
   */
  function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  }

  /**
   * Generate unique form ID
   */
  function generateFormId() {
    return 'form_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clean up old form data
   */
  function cleanupOldData() {
    const maxAge = CONFIG.retentionDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CONFIG.storagePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.timestamp && (now - data.timestamp > maxAge)) {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_meta`);
            console.log(`[Autosave] Cleaned up old data: ${key}`);
          }
        } catch (e) {
          // Invalid data, remove it
          localStorage.removeItem(key);
        }
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Cleanup old data on load
  cleanupOldData();

  // Public API
  window.BuildBridgeAutosave = {
    save: (formId) => {
      const form = document.getElementById(formId);
      if (form) saveFormData(form, formId);
    },
    restore: (formId) => {
      const form = document.getElementById(formId);
      if (form) restoreFormData(form, formId);
    },
    clear: clearFormData,
    init: init
  };

})();
