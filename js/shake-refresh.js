/**
 * Shake to Refresh - v137.4
 * Mobile gesture for page refresh using DeviceMotion API
 * Fortune 500 Mobile UX Enhancement
 */

class ShakeToRefresh {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 15, // Shake intensity threshold
      cooldown: options.cooldown || 3000, // Cooldown between shakes (ms)
      refreshDelay: options.refreshDelay || 1000, // Delay before refresh
      requireConfirmation: options.requireConfirmation || false,
      vibrate: options.vibrate !== false, // Use vibration API
      ...options
    };

    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
    this.lastShake = 0;
    this.shakeCount = 0;
    this.isRefreshing = false;
    this.hasPermission = false;

    this.indicator = null;
    
    this.init();
  }

  init() {
    // Only initialize on mobile/touch devices
    if (!this.isMobileDevice()) {
      return;
    }

    this.createIndicator();
    this.requestPermission();
    this.bindEvents();
  }

  isMobileDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'shake-refresh-indicator';
    this.indicator.setAttribute('role', 'status');
    this.indicator.setAttribute('aria-live', 'polite');
    this.indicator.setAttribute('aria-label', 'Shake detected, refreshing page');
    
    this.indicator.innerHTML = `
      <svg class="shake-refresh-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span class="shake-refresh-text">Refreshing...</span>
      <div class="shake-refresh-progress">
        <div class="shake-refresh-progress-bar"></div>
      </div>
    `;

    document.body.appendChild(this.indicator);
  }

  async requestPermission() {
    // iOS 13+ requires permission for DeviceMotion
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        this.hasPermission = response === 'granted';
      } catch (e) {
        console.log('DeviceMotion permission denied');
        this.hasPermission = false;
      }
    } else {
      this.hasPermission = true;
    }
  }

  bindEvents() {
    if (!this.hasPermission) return;

    window.addEventListener('devicemotion', (e) => {
      this.handleMotion(e);
    }, true);

    // Also bind to keyboard shortcut for testing on desktop
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        this.triggerRefresh();
      }
    });
  }

  handleMotion(event) {
    if (this.isRefreshing) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;

    // Skip if this is the first reading
    if (this.lastX === null) {
      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
      return;
    }

    // Calculate delta
    const deltaX = Math.abs(this.lastX - x);
    const deltaY = Math.abs(this.lastY - y);
    const deltaZ = Math.abs(this.lastZ - z);

    // Update last values
    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;

    // Check if shake detected
    const totalDelta = deltaX + deltaY + deltaZ;
    
    if (totalDelta > this.options.threshold) {
      const now = Date.now();
      
      // Check cooldown
      if (now - this.lastShake > this.options.cooldown) {
        this.shakeCount++;
        
        // Require multiple shakes for confirmation
        if (this.shakeCount >= 2) {
          this.triggerRefresh();
          this.shakeCount = 0;
        } else {
          // Provide haptic feedback for first shake
          this.hapticFeedback();
        }
        
        this.lastShake = now;
      }
    }
  }

  hapticFeedback() {
    if (!this.options.vibrate) return;
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Visual feedback
    document.body.classList.add('shake-haptic');
    setTimeout(() => {
      document.body.classList.remove('shake-haptic');
    }, 100);
  }

  triggerRefresh() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;

    // Show indicator
    this.indicator.classList.add('active');
    this.indicator.querySelector('.shake-refresh-text').textContent = 'Refreshing...';

    // Haptic feedback
    if (this.options.vibrate && navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('shaketorefresh'));

    // Wait then refresh
    setTimeout(() => {
      this.showSuccess();
    }, this.options.refreshDelay);
  }

  showSuccess() {
    this.indicator.classList.add('success');
    this.indicator.querySelector('.shake-refresh-text').textContent = 'Page refreshed!';
    
    // Haptic success feedback
    if (this.options.vibrate && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    setTimeout(() => {
      location.reload();
    }, 500);
  }

  // Public API: Enable/disable
  enable() {
    this.hasPermission = true;
  }

  disable() {
    this.hasPermission = false;
  }

  // Public API: Check if supported
  static isSupported() {
    return 'ondevicemotion' in window || 'DeviceMotionEvent' in window;
  }

  // Public API: Check if permission is needed (iOS 13+)
  static requiresPermission() {
    return typeof DeviceMotionEvent !== 'undefined' && 
           typeof DeviceMotionEvent.requestPermission === 'function';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shakeRefresh = new ShakeToRefresh();
  });
} else {
  window.shakeRefresh = new ShakeToRefresh();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShakeToRefresh;
}
