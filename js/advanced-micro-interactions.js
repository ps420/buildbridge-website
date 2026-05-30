/**
 * v105.0: Advanced Micro-Interactions System
 * Fortune 500 Premium Feedback Effects
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    rippleDuration: 600,
    magneticStrength: 0.3,
    tiltMaxAngle: 10,
    scrollRevealThreshold: 0.1,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /**
   * Ripple Effect System
   */
  class RippleSystem {
    constructor() {
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) return;
      
      document.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
      const target = e.target.closest('.btn, button, [role="button"], input[type="submit"]');
      if (!target) return;

      this.createRipple(e, target);
    }

    createRipple(e, target) {
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      target.appendChild(ripple);

      setTimeout(() => ripple.remove(), CONFIG.rippleDuration);
    }
  }

  /**
   * Magnetic Button System
   */
  class MagneticSystem {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) return;

      this.elements = document.querySelectorAll('[data-magnetic], .btn-magnetic');
      this.bindEvents();
    }

    bindEvents() {
      this.elements.forEach(el => {
        el.addEventListener('mousemove', (e) => this.handleMouseMove(e, el));
        el.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, el));
      });
    }

    handleMouseMove(e, el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const strength = parseFloat(el.dataset.magnetic) || CONFIG.magneticStrength;
      
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    }

    handleMouseLeave(e, el) {
      el.style.transform = 'translate(0, 0)';
    }
  }

  /**
   * Card Shine/Tilt System
   */
  class CardEffectsSystem {
    constructor() {
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) return;

      this.initShine();
      this.initTilt();
    }

    initShine() {
      const cards = document.querySelectorAll('.card-shine');
      
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          card.style.setProperty('--mouse-x', `${x}%`);
          card.style.setProperty('--mouse-y', `${y}%`);
        });
      });
    }

    initTilt() {
      const cards = document.querySelectorAll('.card-tilt');
      
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltMaxAngle;
          const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMaxAngle;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
      });
    }
  }

  /**
   * Form Validation Animations
   */
  class FormValidationSystem {
    constructor() {
      this.init();
    }

    init() {
      const forms = document.querySelectorAll('form[data-validate]');
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateInput(input));
          input.addEventListener('input', () => this.clearValidation(input));
        });

        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      });
    }

    validateInput(input) {
      const isValid = input.checkValidity();
      
      input.classList.remove('input-error', 'input-success');
      
      if (input.value && !isValid) {
        input.classList.add('input-error');
      } else if (input.value && isValid) {
        input.classList.add('input-success');
      }
    }

    clearValidation(input) {
      input.classList.remove('input-error', 'input-success');
    }

    handleSubmit(e, form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      inputs.forEach(input => {
        this.validateInput(input);
        if (!input.checkValidity()) isValid = false;
      });

      if (!isValid) {
        e.preventDefault();
        this.shakeForm(form);
      }
    }

    shakeForm(form) {
      form.style.animation = 'input-shake 0.5s ease';
      setTimeout(() => {
        form.style.animation = '';
      }, 500);
    }
  }

  /**
   * Scroll Reveal System
   */
  class ScrollRevealSystem {
    constructor() {
      this.init();
    }

    init() {
      if (CONFIG.reducedMotion) {
        this.revealAll();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          threshold: CONFIG.scrollRevealThreshold,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      const reveals = document.querySelectorAll('.reveal, [data-reveal]');
      reveals.forEach(el => observer.observe(el));

      const staggerParents = document.querySelectorAll('.stagger-children, [data-stagger]');
      staggerParents.forEach(el => observer.observe(el));
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Unobserve after revealing
          if (!entry.target.dataset.revealRepeat) {
            entry.target._observer?.unobserve(entry.target);
          }
        }
      });
    }

    revealAll() {
      document.querySelectorAll('.reveal, [data-reveal]').forEach(el => {
        el.classList.add('active');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  /**
   * Toast Notification System
   */
  class ToastSystem {
    constructor() {
      this.container = null;
      this.init();
    }

    init() {
      this.createContainer();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }

    show(message, options = {}) {
      const {
        type = 'info',
        duration = 4000,
        position = 'top-right'
      } = options;

      const toast = this.createToast(message, type, duration);
      this.container.appendChild(toast);

      // Auto remove
      if (duration > 0) {
        setTimeout(() => this.removeToast(toast), duration);
      }

      return toast;
    }

    createToast(message, type, duration) {
      const toast = document.createElement('div');
      toast.className = 'toast-enter';
      toast.style.cssText = `
        background: rgba(26, 26, 28, 0.95);
        border: 1px solid rgba(201, 206, 214, 0.2);
        border-radius: 12px;
        padding: 16px 20px;
        min-width: 300px;
        backdrop-filter: blur(10px);
        position: relative;
        overflow: hidden;
      `;

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px;">${icons[type] || icons.info}</span>
          <span style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #F5F7FA;">${message}</span>
        </div>
        ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
      `;

      return toast;
    }

    removeToast(toast) {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      
      setTimeout(() => {
        toast.remove();
      }, 300);
    }

    success(message, options = {}) {
      return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
      return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
      return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
      return this.show(message, { ...options, type: 'info' });
    }
  }

  /**
   * Copy to Clipboard with Feedback
   */
  class ClipboardSystem {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('[data-copy]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => this.copy(el));
      });
    }

    async copy(el) {
      const text = el.dataset.copy;
      
      try {
        await navigator.clipboard.writeText(text);
        this.showFeedback(el, 'Copied!');
      } catch (err) {
        this.showFeedback(el, 'Failed to copy');
      }
    }

    showFeedback(el, message) {
      const original = el.textContent;
      el.textContent = message;
      el.classList.add('input-success');
      
      setTimeout(() => {
        el.textContent = original;
        el.classList.remove('input-success');
      }, 1500);
    }
  }

  /**
   * Smooth Counter Animation
   */
  class CounterAnimation {
    constructor(element, target, options = {}) {
      this.element = element;
      this.target = target;
      this.options = {
        duration: 2000,
        suffix: '',
        prefix: '',
        ...options
      };
      
      this.init();
    }

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            observer.unobserve(this.element);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(this.element);
    }

    animate() {
      const start = 0;
      const end = this.target;
      const duration = this.options.duration;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        this.element.textContent = `${this.options.prefix}${current.toLocaleString()}${this.options.suffix}`;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    }
  }

  /**
   * Initialize All Systems
   */
  function init() {
    // Initialize ripple system
    new RippleSystem();
    
    // Initialize magnetic buttons
    new MagneticSystem();
    
    // Initialize card effects
    new CardEffectsSystem();
    
    // Initialize form validation animations
    new FormValidationSystem();
    
    // Initialize scroll reveal
    new ScrollRevealSystem();
    
    // Initialize clipboard system
    new ClipboardSystem();

    // Expose toast system globally
    window.toast = new ToastSystem();

    // Initialize counters
    document.querySelectorAll('[data-counter]').forEach(el => {
      new CounterAnimation(el, parseInt(el.dataset.counter), {
        suffix: el.dataset.suffix || '',
        prefix: el.dataset.prefix || '',
        duration: parseInt(el.dataset.duration) || 2000
      });
    });

    // Log initialization
    console.log('🔧 Micro-Interactions System v105.0 initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for module usage
  window.MicroInteractions = {
    RippleSystem,
    MagneticSystem,
    CardEffectsSystem,
    FormValidationSystem,
    ScrollRevealSystem,
    ToastSystem,
    ClipboardSystem,
    CounterAnimation
  };
})();
