/**
 * BuildBridge Micro-Interactions System v14.0
 * Advanced hover effects, magnetic buttons, and interactions
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // ============================================
  // Magnetic Button v2 - Physics-based
  // ============================================
  class MagneticButton {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        strength: options.strength || 0.3,
        ease: options.ease || 0.15,
        ...options
      };
      
      this.position = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.isHovering = false;
      this.rafId = null;
      
      this.init();
    }
    
    init() {
      if (prefersReducedMotion || isTouchDevice) return;
      
      this.element.addEventListener('mouseenter', () => this.onEnter());
      this.element.addEventListener('mouseleave', () => this.onLeave());
      this.element.addEventListener('mousemove', (e) => this.onMove(e));
      this.element.addEventListener('click', (e) => this.onClick(e));
    }
    
    onEnter() {
      this.isHovering = true;
      this.element.style.transition = 'none';
      this.animate();
    }
    
    onLeave() {
      this.isHovering = false;
      this.target = { x: 0, y: 0 };
      this.element.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
      this.element.style.transform = 'translate(0, 0)';
      
      const text = this.element.querySelector('.btn-text');
      if (text) {
        text.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        text.style.transform = 'translate(0, 0)';
      }
    }
    
    onMove(e) {
      if (!this.isHovering) return;
      
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      this.target = {
        x: (e.clientX - centerX) * this.options.strength,
        y: (e.clientY - centerY) * this.options.strength
      };
    }
    
    animate() {
      if (!this.isHovering && Math.abs(this.position.x) < 0.1 && Math.abs(this.position.y) < 0.1) {
        cancelAnimationFrame(this.rafId);
        return;
      }
      
      this.position.x += (this.target.x - this.position.x) * this.options.ease;
      this.position.y += (this.target.y - this.position.y) * this.options.ease;
      
      this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
      
      // Move text slightly less for parallax effect
      const text = this.element.querySelector('.btn-text');
      if (text) {
        text.style.transform = `translate(${this.position.x * 0.5}px, ${this.position.y * 0.5}px)`;
      }
      
      this.rafId = requestAnimationFrame(() => this.animate());
    }
    
    onClick(e) {
      // Create ripple effect
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 20px;
        height: 20px;
        margin-left: -10px;
        margin-top: -10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.6);
        pointer-events: none;
      `;
      
      this.element.appendChild(ripple);
      
      // Animate ripple
      requestAnimationFrame(() => {
        ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        ripple.style.transform = 'scale(20)';
        ripple.style.opacity = '0';
      });
      
      setTimeout(() => ripple.remove(), 600);
    }
  }

  // ============================================
  // Magnetic Icons
  // ============================================
  class MagneticIcon {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        strength: options.strength || 0.4,
        ease: options.ease || 0.15,
        ...options
      };
      
      this.position = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.isHovering = false;
      this.rafId = null;
      
      this.init();
    }
    
    init() {
      if (prefersReducedMotion || isTouchDevice) return;
      
      this.element.addEventListener('mouseenter', () => this.onEnter());
      this.element.addEventListener('mouseleave', () => this.onLeave());
      this.element.addEventListener('mousemove', (e) => this.onMove(e));
    }
    
    onEnter() {
      this.isHovering = true;
      this.element.style.transition = 'none';
      this.animate();
    }
    
    onLeave() {
      this.isHovering = false;
      this.target = { x: 0, y: 0 };
      this.element.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), background 0.3s ease';
      this.element.style.transform = 'translate(0, 0)';
    }
    
    onMove(e) {
      if (!this.isHovering) return;
      
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      this.target = {
        x: (e.clientX - centerX) * this.options.strength,
        y: (e.clientY - centerY) * this.options.strength
      };
    }
    
    animate() {
      if (!this.isHovering && Math.abs(this.position.x) < 0.1 && Math.abs(this.position.y) < 0.1) {
        cancelAnimationFrame(this.rafId);
        return;
      }
      
      this.position.x += (this.target.x - this.position.x) * this.options.ease;
      this.position.y += (this.target.y - this.position.y) * this.options.ease;
      
      this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(1.1)`;
      
      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  // ============================================
  // Text Scramble v2 Effect
  // ============================================
  class TextScrambleV2 {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        chars: options.chars || '!<>-_\\/[]{}—=+*^?#________',
        speed: options.speed || 50,
        ...options
      };
      
      this.originalText = element.textContent;
      this.frame = 0;
      this.queue = [];
      this.isAnimating = false;
      
      this.init();
    }
    
    init() {
      this.element.addEventListener('mouseenter', () => this.scramble());
    }
    
    scramble() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      
      const text = this.originalText;
      const length = text.length;
      let iteration = 0;
      
      this.element.classList.add('scrambling');
      
      const interval = setInterval(() => {
        this.element.textContent = text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return this.options.chars[Math.floor(Math.random() * this.options.chars.length)];
          })
          .join('');
        
        iteration += 1/3;
        
        if (iteration >= length) {
          clearInterval(interval);
          this.element.textContent = this.originalText;
          this.element.classList.remove('scrambling');
          this.isAnimating = false;
        }
      }, this.options.speed);
    }
  }

  // ============================================
  // Stagger Link Effect
  // ============================================
  class StaggerLink {
    constructor(element) {
      this.element = element;
      this.text = element.textContent;
      
      this.init();
    }
    
    init() {
      // Wrap each character in a span
      this.element.innerHTML = this.text
        .split('')
        .map(char => char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`)
        .join('');
    }
  }

  // ============================================
  // Intersection Observer for In-View Animations
  // ============================================
  class InViewAnimation {
    constructor() {
      this.elements = document.querySelectorAll('[data-animate]');
      this.observer = null;
      
      this.init();
    }
    
    init() {
      if (prefersReducedMotion) {
        this.elements.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.animateDelay || 0;
            setTimeout(() => {
              entry.target.classList.add('in-view');
            }, delay);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      this.elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        this.observer.observe(el);
      });
    }
  }

  // ============================================
  // Smooth Anchor Scrolling
  // ============================================
  class SmoothScroll {
    constructor() {
      this.init();
    }
    
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            
            const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            
            window.scrollTo({
              top: targetPosition,
              behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
          }
        });
      });
    }
  }

  // ============================================
  // Loading States Manager
  // ============================================
  class LoadingStates {
    static show(element) {
      element.classList.add('is-loading');
      element.disabled = true;
      
      // Store original text
      if (!element.dataset.originalText) {
        element.dataset.originalText = element.innerHTML;
      }
      
      element.innerHTML = `
        <span class="loading-spinner" style="
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        "></span>
        ${element.dataset.loadingText || 'Loading...'}
      `;
    }
    
    static hide(element) {
      element.classList.remove('is-loading');
      element.disabled = false;
      element.innerHTML = element.dataset.originalText || element.innerHTML;
    }
  }

  // ============================================
  // Add keyframes for spinner
  // ============================================
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .in-view {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    .is-loading {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // Initialize Everything
  // ============================================
  function init() {
    // Magnetic Buttons v2
    document.querySelectorAll('.magnetic-btn-v2').forEach(btn => {
      new MagneticButton(btn, {
        strength: parseFloat(btn.dataset.magneticStrength) || 0.3
      });
    });
    
    // Magnetic Icons
    document.querySelectorAll('.magnetic-icon').forEach(icon => {
      new MagneticIcon(icon, {
        strength: parseFloat(icon.dataset.magneticStrength) || 0.4
      });
    });
    
    // Text Scramble v2
    document.querySelectorAll('.text-scramble-v2').forEach(el => {
      new TextScrambleV2(el);
    });
    
    // Stagger Links
    document.querySelectorAll('.stagger-link').forEach(el => {
      new StaggerLink(el);
    });
    
    // In-View Animations
    new InViewAnimation();
    
    // Smooth Scroll
    new SmoothScroll();
    
    // Expose LoadingStates globally
    window.LoadingStates = LoadingStates;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose classes for manual initialization
  window.MagneticButton = MagneticButton;
  window.MagneticIcon = MagneticIcon;
  window.TextScrambleV2 = TextScrambleV2;

})();
