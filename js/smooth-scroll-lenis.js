/**
 * BuildBridge Fortune 500 Smooth Scroll System
 * Lenis-style smooth scrolling with physics-based interactions
 * Version: 2.0 Professional
 */

class BuildBridgeSmoothScroll {
  constructor(options = {}) {
    this.options = {
      lerp: options.lerp || 0.08,
      wheelMultiplier: options.wheelMultiplier || 0.8,
      gestureOrientation: options.gestureOrientation || 'vertical',
      normalizeWheel: options.normalizeWheel !== false,
      smoothTouch: options.smoothTouch || false,
      touchMultiplier: options.touchMultiplier || 1.5,
      infinite: options.infinite || false,
    };

    this.targetScroll = 0;
    this.currentScroll = 0;
    this.lastScroll = 0;
    this.velocity = 0;
    this.isScrolling = false;
    this.isTouching = false;
    this.scrollTimeout = null;
    
    // Scroll direction
    this.direction = 0; // 1 = down, -1 = up
    
    // RAF ID
    this.rafId = null;
    
    // Callbacks
    this.callbacks = {
      onScroll: [],
      onScrollStart: [],
      onScrollStop: []
    };

    // Elements with scroll-linked animations
    this.scrollLinkedElements = [];

    this.init();
  }

  init() {
    // Check for touch device
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    // Don't enable smooth scroll on touch devices unless explicitly enabled
    if (this.isTouchDevice && !this.options.smoothTouch) {
      this.bindNativeScroll();
      return;
    }

    this.bindEvents();
    this.startRAF();
    this.registerScrollLinkedElements();
  }

  bindEvents() {
    // Wheel event
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    // Touch events
    window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Keyboard navigation
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    
    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', this.onAnchorClick.bind(this));
    });
  }

  bindNativeScroll() {
    // For touch devices, use native scroll but track it
    window.addEventListener('scroll', () => {
      this.currentScroll = window.scrollY;
      this.handleScrollEvents();
    }, { passive: true });
  }

  onWheel(e) {
    e.preventDefault();
    
    const deltaY = this.options.normalizeWheel 
      ? this.normalizeWheel(e.deltaY) 
      : e.deltaY;
    
    this.targetScroll += deltaY * this.options.wheelMultiplier;
    this.targetScroll = this.clampTarget(this.targetScroll);
    
    this.onScrollStart();
  }

  onTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchMove(e) {
    if (!this.isTouching) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = (this.touchStartY - touchY) * this.options.touchMultiplier;
    
    this.targetScroll += deltaY;
    this.targetScroll = this.clampTarget(this.targetScroll);
    
    this.touchStartY = touchY;
  }

  onTouchEnd() {
    this.isTouching = false;
  }

  onKeyDown(e) {
    const scrollAmount = window.innerHeight * 0.8;
    
    switch(e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        this.targetScroll += scrollAmount;
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this.targetScroll -= scrollAmount;
        break;
      case 'Home':
        e.preventDefault();
        this.targetScroll = 0;
        break;
      case 'End':
        e.preventDefault();
        this.targetScroll = document.body.scrollHeight - window.innerHeight;
        break;
      case ' ': // Space bar
        e.preventDefault();
        this.targetScroll += e.shiftKey ? -scrollAmount : scrollAmount;
        break;
    }
    
    this.targetScroll = this.clampTarget(this.targetScroll);
  }

  onAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      this.scrollTo(target);
    }
  }

  normalizeWheel(delta) {
    // Normalize wheel delta across browsers
    if (delta === 0) return 0;
    return delta > 0 ? Math.max(1, delta / 3) : Math.min(-1, delta / 3);
  }

  clampTarget(target) {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(maxScroll, target));
  }

  startRAF() {
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  tick() {
    // Calculate lerp scroll
    const diff = this.targetScroll - this.currentScroll;
    this.currentScroll += diff * this.options.lerp;
    
    // Calculate velocity
    this.velocity = this.currentScroll - this.lastScroll;
    this.lastScroll = this.currentScroll;
    
    // Determine direction
    this.direction = this.velocity > 0.01 ? 1 : this.velocity < -0.01 ? -1 : 0;
    
    // Apply scroll
    window.scrollTo(0, this.currentScroll);
    
    // Handle scroll events
    this.handleScrollEvents();
    
    // Update scroll-linked elements
    this.updateScrollLinkedElements();
    
    // Check if scrolling stopped
    if (Math.abs(diff) < 0.1 && Math.abs(this.velocity) < 0.1) {
      this.onScrollStop();
    } else {
      this.isScrolling = true;
    }
    
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  handleScrollEvents() {
    const progress = this.currentScroll / (document.body.scrollHeight - window.innerHeight);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('buildbridge-scroll', {
      detail: {
        scrollY: this.currentScroll,
        progress: progress,
        velocity: this.velocity,
        direction: this.direction,
        isScrolling: this.isScrolling
      }
    }));
  }

  onScrollStart() {
    if (!this.isScrolling) {
      document.body.classList.add('is-scrolling');
      document.body.classList.remove('scroll-stopped');
      
      // Trigger callbacks
      this.callbacks.onScrollStart.forEach(cb => cb());
      
      window.dispatchEvent(new CustomEvent('buildbridge-scroll-start'));
    }
  }

  onScrollStop() {
    if (this.isScrolling) {
      this.isScrolling = false;
      document.body.classList.remove('is-scrolling');
      document.body.classList.add('scroll-stopped');
      
      // Trigger callbacks
      this.callbacks.onScrollStop.forEach(cb => cb());
      
      window.dispatchEvent(new CustomEvent('buildbridge-scroll-stop'));
    }
  }

  registerScrollLinkedElements() {
    // Find all elements with scroll-linked animations
    document.querySelectorAll('[data-scroll]').forEach(el => {
      this.scrollLinkedElements.push({
        element: el,
        speed: parseFloat(el.dataset.scroll) || 1,
        direction: el.dataset.scrollDirection || 'vertical',
        offset: parseFloat(el.dataset.scrollOffset) || 0,
        target: el.dataset.scrollTarget || null
      });
    });
  }

  updateScrollLinkedElements() {
    const scrollY = this.currentScroll;
    const windowHeight = window.innerHeight;
    
    this.scrollLinkedElements.forEach(item => {
      const { element, speed, direction, offset } = item;
      
      // Calculate element position
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementCenter = elementTop + rect.height / 2;
      
      // Calculate scroll progress through viewport
      const viewportCenter = scrollY + windowHeight / 2;
      const distance = elementCenter - viewportCenter;
      
      // Apply transform based on direction
      let transform = '';
      
      if (direction === 'vertical') {
        const y = distance * (1 - speed) + offset;
        transform = `translateY(${y}px)`;
      } else if (direction === 'horizontal') {
        const x = distance * (1 - speed) + offset;
        transform = `translateX(${x}px)`;
      } else if (direction === 'both') {
        const y = distance * (1 - speed) + offset;
        transform = `translateY(${y}px)`;
      }
      
      // Add velocity-based skew
      if (Math.abs(this.velocity) > 1) {
        const skew = Math.max(-2, Math.min(2, this.velocity * 0.05));
        transform += ` skewY(${skew}deg)`;
      }
      
      element.style.transform = transform;
    });
  }

  // Public API
  scrollTo(target, options = {}) {
    let targetPosition;
    
    if (typeof target === 'number') {
      targetPosition = target;
    } else if (target instanceof Element) {
      targetPosition = target.getBoundingClientRect().top + this.currentScroll;
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        targetPosition = el.getBoundingClientRect().top + this.currentScroll;
      }
    }
    
    if (targetPosition === undefined) return;
    
    // Apply offset
    const offset = options.offset || 0;
    targetPosition += offset;
    
    // Clamp
    targetPosition = this.clampTarget(targetPosition);
    
    // Animate to target
    if (options.immediate) {
      this.targetScroll = targetPosition;
      this.currentScroll = targetPosition;
    } else {
      // Smooth approach with different easing
      this.animateTo(targetPosition, options.duration || 1000);
    }
  }

  animateTo(targetPosition, duration) {
    const startPosition = this.currentScroll;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      this.targetScroll = startPosition + (targetPosition - startPosition) * ease;
      
      if (progress < 1) {
        this.isScrolling = true;
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stop();
    // Remove event listeners if needed
  }

  // Event subscription
  on(event, callback) {
    if (this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`].push(callback);
    }
  }

  // Getters
  getScrollY() {
    return this.currentScroll;
  }

  getVelocity() {
    return this.velocity;
  }

  getDirection() {
    return this.direction;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.buildbridgeScroll = new BuildBridgeSmoothScroll({
    lerp: 0.075,
    wheelMultiplier: 0.8,
    smoothTouch: false
  });
  
  console.log('🌊 BuildBridge Smooth Scroll initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildBridgeSmoothScroll;
}
