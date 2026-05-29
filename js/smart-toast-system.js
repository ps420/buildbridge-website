/**
 * Smart Toast Notification System v89.0
 * Fortune 500 Professional Toast Notifications
 * Features: Queue management, auto-dismiss, progress tracking, action buttons
 */

(function() {
  'use strict';
  
  // Toast Configuration
  const CONFIG = {
    defaultDuration: 5000,
    maxVisible: 4,
    position: 'top-right',
    pauseOnHover: true,
    showProgress: true
  };
  
  // Toast State
  let toastQueue = [];
  let activeToasts = [];
  let toastId = 0;
  let container = null;
  
  // Icon mapping
  const ICONS = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
    loading: '⟳'
  };
  
  /**
   * Initialize toast container
   */
  function initContainer() {
    if (container) return container;
    
    container = document.createElement('div');
    container.className = `smart-toast-container ${CONFIG.position}`;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Notifications');
    
    document.body.appendChild(container);
    return container;
  }
  
  /**
   * Create toast element
   */
  function createToast(options) {
    const id = ++toastId;
    const {
      type = 'info',
      title = '',
      message = '',
      duration = CONFIG.defaultDuration,
      actions = [],
      closable = true,
      onClose = null,
      onAction = null
    } = options;
    
    const toast = document.createElement('div');
    toast.className = `smart-toast ${type}`;
    toast.setAttribute('data-toast-id', id);
    toast.setAttribute('role', 'alert');
    
    // Icon
    const icon = ICONS[type] || ICONS.info;
    
    // Build toast HTML
    let toastHTML = `
      <div class="smart-toast-icon">${icon}</div>
      <div class="smart-toast-content">
        ${title ? `<h4 class="smart-toast-title">${escapeHtml(title)}</h4>` : ''}
        ${message ? `<p class="smart-toast-message">${escapeHtml(message)}</p>` : ''}
    `;
    
    // Add action buttons
    if (actions.length > 0) {
      toastHTML += '<div class="smart-toast-actions">';
      actions.forEach((action, index) => {
        const btnClass = action.primary ? 'smart-toast-btn-primary' : 'smart-toast-btn-secondary';
        toastHTML += `<button class="smart-toast-btn ${btnClass}" data-action="${index}">${escapeHtml(action.label)}</button>`;
      });
      toastHTML += '</div>';
    }
    
    toastHTML += '</div>';
    
    // Add close button
    if (closable) {
      toastHTML += `<button class="smart-toast-close" aria-label="Close notification">×</button>`;
    }
    
    // Add progress bar
    if (CONFIG.showProgress && duration > 0) {
      toastHTML += `<div class="smart-toast-progress" style="width: 100%;"></div>`;
    }
    
    toast.innerHTML = toastHTML;
    
    // Store toast data
    const toastData = {
      id,
      element: toast,
      duration,
      startTime: Date.now(),
      remaining: duration,
      paused: false,
      onClose,
      onAction,
      actions,
      timer: null,
      progressInterval: null
    };
    
    // Event listeners
    if (closable) {
      const closeBtn = toast.querySelector('.smart-toast-close');
      closeBtn.addEventListener('click', () => dismissToast(id));
    }
    
    // Action button listeners
    if (actions.length > 0) {
      const actionBtns = toast.querySelectorAll('.smart-toast-btn');
      actionBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = actions[index];
          if (action.handler) {
            action.handler();
          }
          if (onAction) {
            onAction(index, action);
          }
          if (action.closeOnClick !== false) {
            dismissToast(id);
          }
        });
      });
    }
    
    // Pause on hover
    if (CONFIG.pauseOnHover && duration > 0) {
      toast.addEventListener('mouseenter', () => pauseToast(id));
      toast.addEventListener('mouseleave', () => resumeToast(id));
    }
    
    // Click to dismiss (if not clicking buttons)
    toast.addEventListener('click', (e) => {
      if (e.target === toast || e.target.closest('.smart-toast-content')) {
        dismissToast(id);
      }
    });
    
    return toastData;
  }
  
  /**
   * Show a toast
   */
  function show(options) {
    initContainer();
    
    // Check if we've reached max visible toasts
    if (activeToasts.length >= CONFIG.maxVisible) {
      // Add to queue
      toastQueue.push(options);
      return null;
    }
    
    const toastData = createToast(options);
    activeToasts.push(toastData);
    
    // Add to DOM
    container.appendChild(toastData.element);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toastData.element.classList.add('entering');
    });
    
    // Start timer
    if (toastData.duration > 0) {
      startToastTimer(toastData);
    }
    
    // Update stacked appearance
    updateStackedAppearance();
    
    return toastData.id;
  }
  
  /**
   * Start toast timer
   */
  function startToastTimer(toastData) {
    const progressBar = toastData.element.querySelector('.smart-toast-progress');
    
    toastData.timer = setTimeout(() => {
      dismissToast(toastData.id);
    }, toastData.remaining);
    
    // Progress bar animation
    if (progressBar) {
      const startTime = Date.now();
      const duration = toastData.remaining;
      
      toastData.progressInterval = setInterval(() => {
        if (toastData.paused) return;
        
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const percentage = (remaining / duration) * 100;
        
        progressBar.style.width = `${percentage}%`;
        
        if (percentage <= 0) {
          clearInterval(toastData.progressInterval);
        }
      }, 16);
    }
    
    toastData.startTime = Date.now();
  }
  
  /**
   * Pause toast timer
   */
  function pauseToast(id) {
    const toastData = activeToasts.find(t => t.id === id);
    if (!toastData || toastData.paused || !toastData.timer) return;
    
    clearTimeout(toastData.timer);
    clearInterval(toastData.progressInterval);
    
    const elapsed = Date.now() - toastData.startTime;
    toastData.remaining = Math.max(0, toastData.remaining - elapsed);
    toastData.paused = true;
  }
  
  /**
   * Resume toast timer
   */
  function resumeToast(id) {
    const toastData = activeToasts.find(t => t.id === id);
    if (!toastData || !toastData.paused) return;
    
    toastData.paused = false;
    startToastTimer(toastData);
  }
  
  /**
   * Dismiss a toast
   */
  function dismissToast(id) {
    const index = activeToasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const toastData = activeToasts[index];
    
    // Clear timers
    clearTimeout(toastData.timer);
    clearInterval(toastData.progressInterval);
    
    // Callback
    if (toastData.onClose) {
      toastData.onClose();
    }
    
    // Animate out
    toastData.element.classList.remove('entering');
    toastData.element.classList.add('exiting');
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (toastData.element.parentNode) {
        toastData.element.parentNode.removeChild(toastData.element);
      }
      
      // Remove from active toasts
      activeToasts.splice(index, 1);
      
      // Process queue
      processQueue();
      
      // Update stacked appearance
      updateStackedAppearance();
    }, 400);
  }
  
  /**
   * Process queued toasts
   */
  function processQueue() {
    if (toastQueue.length === 0) return;
    if (activeToasts.length >= CONFIG.maxVisible) return;
    
    const nextToast = toastQueue.shift();
    show(nextToast);
  }
  
  /**
   * Update stacked appearance for multiple toasts
   */
  function updateStackedAppearance() {
    activeToasts.forEach((toastData, index) => {
      toastData.element.classList.remove('stacked', 'stacked-2');
      
      const stackIndex = activeToasts.length - 1 - index;
      if (stackIndex === 1) {
        toastData.element.classList.add('stacked');
      } else if (stackIndex >= 2) {
        toastData.element.classList.add('stacked-2');
      }
    });
  }
  
  /**
   * Dismiss all toasts
   */
  function dismissAll() {
    // Clear queue
    toastQueue = [];
    
    // Dismiss all active toasts
    [...activeToasts].forEach(toastData => {
      dismissToast(toastData.id);
    });
  }
  
  /**
   * Update configuration
   */
  function configure(options) {
    Object.assign(CONFIG, options);
    
    // Update container position if changed
    if (container && options.position) {
      container.className = `smart-toast-container ${options.position}`;
    }
  }
  
  /**
   * Utility: Escape HTML
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Preset toast methods
   */
  function success(message, title, options = {}) {
    return show({ type: 'success', message, title, ...options });
  }
  
  function error(message, title, options = {}) {
    return show({ type: 'error', message, title, ...options });
  }
  
  function warning(message, title, options = {}) {
    return show({ type: 'warning', message, title, ...options });
  }
  
  function info(message, title, options = {}) {
    return show({ type: 'info', message, title, ...options });
  }
  
  function loading(message, title, options = {}) {
    return show({ 
      type: 'loading', 
      message, 
      title, 
      duration: 0,
      closable: false,
      ...options 
    });
  }
  
  /**
   * Promise-based toast with loading state
   */
  function promise(promiseFn, messages = {}, options = {}) {
    const {
      loading: loadingMsg = 'Loading...',
      success: successMsg = 'Success!',
      error: errorMsg = 'Something went wrong'
    } = messages;
    
    const toastId = show({
      type: 'loading',
      message: loadingMsg,
      title: 'Please wait',
      duration: 0,
      closable: false,
      ...options
    });
    
    promiseFn
      .then(result => {
        dismissToast(toastId);
        const msg = typeof successMsg === 'function' ? successMsg(result) : successMsg;
        success(msg, 'Complete', { duration: 3000 });
        return result;
      })
      .catch(err => {
        dismissToast(toastId);
        const msg = typeof errorMsg === 'function' ? errorMsg(err) : errorMsg;
        error(msg, 'Error', { duration: 5000 });
        throw err;
      });
    
    return promiseFn;
  }
  
  // Public API
  window.SmartToast = {
    show,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss: dismissToast,
    dismissAll,
    configure,
    getQueue: () => toastQueue,
    getActive: () => activeToasts
  };
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainer);
  } else {
    initContainer();
  }
  
  console.log('🔔 Smart Toast System v89.0 loaded');
})();
