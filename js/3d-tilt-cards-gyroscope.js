/**
 * BuildBridge 3D Tilt Cards with Gyroscope Support
 * Fortune 500 Interactive Card System v87.0
 */

class TiltCard3DGyro {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxTilt: 15,
      perspective: 1000,
      scale: 1.05,
      speed: 400,
      transition: true,
      disableAxis: null,
      glare: true,
      maxGlare: 0.3,
      gyroscope: true,
      gyroscopeMinAngleX: -45,
      gyroscopeMaxAngleX: 45,
      gyroscopeMinAngleY: -45,
      gyroscopeMaxAngleY: 45,
      ...options
    };
    
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.gyroscopeAvailable = false;
    this.gyroscopePermissionGranted = false;
    this.animationFrame = null;
    this.bounds = null;
    
    this.init();
  }
  
  init() {
    // Set perspective on parent
    const parent = this.element.parentElement;
    if (parent) {
      parent.style.perspective = `${this.options.perspective}px`;
      parent.style.transformStyle = 'preserve-3d';
    }
    
    // Add glare element if enabled
    if (this.options.glare) {
      this.addGlare();
    }
    
    // Add shadow element
    this.addShadow();
    
    // Add gyro indicator for mobile
    if (this.isMobile && this.options.gyroscope) {
      this.addGyroIndicator();
      this.checkGyroscope();
    }
    
    // Bind events
    this.bindEvents();
  }
  
  addGlare() {
    const glare = document.createElement('div');
    glare.className = 'tilt-card-glare';
    this.element.appendChild(glare);
    this.glareElement = glare;
  }
  
  addShadow() {
    const shadow = document.createElement('div');
    shadow.className = 'tilt-card-shadow';
    this.element.appendChild(shadow);
    this.shadowElement = shadow;
  }
  
  addGyroIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'gyro-indicator';
    indicator.setAttribute('aria-label', 'Gyroscope active');
    indicator.title = 'Tilt your device to interact';
    this.element.appendChild(indicator);
    this.gyroIndicator = indicator;
  }
  
  checkGyroscope() {
    if ('DeviceOrientationEvent' in window) {
      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        this.gyroscopeAvailable = true;
      } else {
        this.gyroscopeAvailable = true;
        this.gyroscopePermissionGranted = true;
      }
    }
  }
  
  async requestGyroscopePermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        this.gyroscopePermissionGranted = permission === 'granted';
        if (this.gyroscopePermissionGranted) {
          this.startGyroscope();
        }
        return this.gyroscopePermissionGranted;
      } catch (e) {
        console.warn('Gyroscope permission denied:', e);
        return false;
      }
    }
    return true;
  }
  
  bindEvents() {
    // Mouse events for desktop
    this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this), { passive: true });
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this), { passive: true });
    
    // Touch events for mobile
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Gyroscope events
    if (this.options.gyroscope && this.isMobile) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
      
      // Click to request permission
      this.element.addEventListener('click', () => {
        if (this.gyroscopeAvailable && !this.gyroscopePermissionGranted) {
          this.requestGyroscopePermission();
        }
      });
    }
    
    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.bounds = this.element.getBoundingClientRect();
    });
    this.resizeObserver.observe(this.element);
  }
  
  onMouseEnter(e) {
    this.bounds = this.element.getBoundingClientRect();
    this.element.classList.add('tilt-active');
    if (this.options.transition) {
      this.element.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    }
  }
  
  onMouseMove(e) {
    if (!this.bounds) return;
    
    const x = e.clientX - this.bounds.left;
    const y = e.clientY - this.bounds.top;
    
    this.updateTilt(x, y);
  }
  
  onMouseLeave() {
    this.element.classList.remove('tilt-active');
    this.element.style.transform = `perspective(${this.options.perspective}px) rotateX(0) rotateY(0) scale(1)`;
    
    if (this.glareElement) {
      this.glareElement.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)';
    }
    
    if (this.shadowElement) {
      this.shadowElement.style.opacity = '0';
      this.shadowElement.style.transform = 'translateZ(-50px)';
    }
  }
  
  onTouchStart(e) {
    this.bounds = this.element.getBoundingClientRect();
    this.element.classList.add('tilt-active');
  }
  
  onTouchMove(e) {
    if (!this.bounds || !e.touches.length) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - this.bounds.left;
    const y = touch.clientY - this.bounds.top;
    
    this.updateTilt(x, y);
  }
  
  onTouchEnd() {
    this.element.classList.remove('tilt-active');
    this.element.style.transform = `perspective(${this.options.perspective}px) rotateX(0) rotateY(0) scale(1)`;
    
    if (this.shadowElement) {
      this.shadowElement.style.opacity = '0';
    }
  }
  
  onDeviceOrientation(e) {
    if (!this.gyroscopePermissionGranted || !this.gyroscopeAvailable) return;
    
    const beta = e.beta;  // -180 to 180 (front/back tilt)
    const gamma = e.gamma; // -90 to 90 (left/right tilt)
    
    if (beta === null || gamma === null) return;
    
    // Clamp values
    const clampedBeta = Math.max(this.options.gyroscopeMinAngleX, Math.min(this.options.gyroscopeMaxAngleX, beta));
    const clampedGamma = Math.max(this.options.gyroscopeMinAngleY, Math.min(this.options.gyroscopeMaxAngleY, gamma));
    
    // Convert to tilt degrees
    const tiltX = (clampedBeta / this.options.gyroscopeMaxAngleX) * this.options.maxTilt;
    const tiltY = (clampedGamma / this.options.gyroscopeMaxAngleY) * this.options.maxTilt;
    
    this.element.classList.add('gyro-active');
    
    requestAnimationFrame(() => {
      this.applyTilt(tiltX, -tiltY, this.options.scale);
    });
  }
  
  updateTilt(x, y) {
    const centerX = this.bounds.width / 2;
    const centerY = this.bounds.height / 2;
    
    // Calculate percentage from center (-1 to 1)
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    
    // Calculate tilt angles
    let tiltX = percentY * this.options.maxTilt;
    let tiltY = percentX * -this.options.maxTilt;
    
    // Disable axis if specified
    if (this.options.disableAxis === 'x') tiltX = 0;
    if (this.options.disableAxis === 'y') tiltY = 0;
    
    this.applyTilt(tiltX, tiltY, this.options.scale);
    this.updateGlare(percentX, percentY);
    this.updateShadow(percentX, percentY);
  }
  
  applyTilt(tiltX, tiltY, scale) {
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale3d(${scale}, ${scale}, ${scale})
    `;
  }
  
  updateGlare(percentX, percentY) {
    if (!this.glareElement) return;
    
    const angle = Math.atan2(percentY, percentX) * (180 / Math.PI);
    const intensity = Math.min(1, Math.sqrt(percentX ** 2 + percentY ** 2));
    
    this.glareElement.style.background = `
      linear-gradient(
        ${angle}deg,
        rgba(255, 255, 255, ${intensity * this.options.maxGlare}) 0%,
        transparent 50%,
        rgba(0, 0, 0, ${intensity * 0.1}) 100%
      )
    `;
  }
  
  updateShadow(percentX, percentY) {
    if (!this.shadowElement) return;
    
    const offsetX = percentX * -20;
    const offsetY = percentY * -20;
    
    this.shadowElement.style.opacity = '1';
    this.shadowElement.style.transform = `
      translateZ(-50px)
      translateX(${offsetX}px)
      translateY(${offsetY}px)
    `;
  }
  
  startGyroscope() {
    // Gyroscope is already handled by the event listener
    console.log('Gyroscope started');
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    window.removeEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Auto-initialize all tilt cards
document.addEventListener('DOMContentLoaded', () => {
  const tiltCards = document.querySelectorAll('.tilt-card-3d-gyro');
  
  tiltCards.forEach(card => {
    const options = {
      maxTilt: parseFloat(card.dataset.tiltMax) || 15,
      perspective: parseInt(card.dataset.tiltPerspective) || 1000,
      scale: parseFloat(card.dataset.tiltScale) || 1.05,
      glare: card.dataset.tiltGlare !== 'false',
      gyroscope: card.dataset.tiltGyroscope !== 'false'
    };
    
    new TiltCard3DGyro(card, options);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TiltCard3DGyro;
}
