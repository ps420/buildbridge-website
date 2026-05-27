/**
 * BuildBridge - Magnetic Cursor Controller v17.4
 * Controls custom cursor and magnetic element effects
 * Fortune 500 Quality Cursor Interaction System
 */

(function() {
  'use strict';

  class MagneticCursorController {
    constructor(options = {}) {
      this.options = {
        cursorSize: options.cursorSize || 20,
        cursorColor: options.cursorColor || '#ffc107',
        enableTrail: options.enableTrail || false,
        trailLength: options.trailLength || 10,
        enableOnTouch: options.enableOnTouch || false,
        ...options
      };
      
      this.cursor = null;
      this.cursorDot = null;
      this.follower = null;
      this.trails = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.cursorX = 0;
      this.cursorY = 0;
      this.isActive = false;
      this.rafId = null;
      this.magneticElements = [];
      
      this.init();
    }
    
    init() {
      // Check touch device
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      if (isTouchDevice && !this.options.enableOnTouch) return;
      
      this.createCursor();
      this.createCursorDot();
      this.setupEventListeners();
      this.setupMagneticElements();
      this.startAnimationLoop();
      
      this.isActive = true;
      console.log('🎯 Magnetic Cursor Controller initialized');
    }
    
    createCursor() {
      this.cursor = document.createElement('div');
      this.cursor.className = 'custom-cursor';
      document.body.appendChild(this.cursor);
    }
    
    createCursorDot() {
      this.cursorDot = document.createElement('div');
      this.cursorDot.className = 'custom-cursor-dot';
      document.body.appendChild(this.cursorDot);
    }
    
    setupEventListeners() {
      // Mouse move
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        if (this.options.enableTrail) {
          this.createTrail(e.clientX, e.clientY);
        }
      });
      
      // Mouse down/up
      document.addEventListener('mousedown', () => {
        this.cursor?.classList.add('click');
      });
      
      document.addEventListener('mouseup', () => {
        this.cursor?.classList.remove('click');
      });
      
      // Visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cursor?.classList.add('hide');
        } else {
          this.cursor?.classList.remove('hide');
        }
      });
      
      // Hover states
      this.setupHoverStates();
    }
    
    setupHoverStates() {
      const interactiveSelectors = [
        'a',
        'button',
        '[role="button"]',
        'input',
        'textarea',
        'select',
        '[data-magnetic]',
        '[data-cursor="pointer"]'
      ];
      
      interactiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.addEventListener('mouseenter', () => {
            this.cursor?.classList.add('hover');
          });
          
          el.addEventListener('mouseleave', () => {
            this.cursor?.classList.remove('hover');
          });
        });
      });
      
      // View cursor
      document.querySelectorAll('[data-cursor="view"]').forEach(el => {
        el.addEventListener('mouseenter', () => this.showFollower('view'));
        el.addEventListener('mouseleave', () => this.hideFollower());
      });
      
      // Drag cursor
      document.querySelectorAll('[data-cursor="drag"]').forEach(el => {
        el.addEventListener('mouseenter', () => this.showFollower('drag'));
        el.addEventListener('mouseleave', () => this.hideFollower());
      });
    }
    
    showFollower(type) {
      if (!this.follower) {
        this.follower = document.createElement('div');
        this.follower.className = 'cursor-follower';
        document.body.appendChild(this.follower);
      }
      
      this.follower.className = `cursor-follower cursor-follower--${type} visible`;
      this.follower.textContent = type === 'view' ? 'View' : 'Drag';
    }
    
    hideFollower() {
      if (this.follower) {
        this.follower.classList.remove('visible');
      }
    }
    
    setupMagneticElements() {
      const magneticElements = document.querySelectorAll('[data-magnetic]');
      
      magneticElements.forEach(el => {
        const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
        
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
          
          // Update gradient position for buttons
          if (el.classList.contains('magnetic-btn')) {
            const percentX = (e.clientX - rect.left) / rect.width * 100;
            const percentY = (e.clientY - rect.top) / rect.height * 100;
            el.style.setProperty('--mouse-x', `${percentX}%`);
            el.style.setProperty('--mouse-y', `${percentY}%`);
          }
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    }
    
    createTrail(x, y) {
      if (this.trails.length >= this.options.trailLength) {
        const oldTrail = this.trails.shift();
        oldTrail?.remove();
      }
      
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${x}px`;
      trail.style.top = `${y}px`;
      document.body.appendChild(trail);
      
      this.trails.push(trail);
      
      setTimeout(() => {
        trail.remove();
        const index = this.trails.indexOf(trail);
        if (index > -1) {
          this.trails.splice(index, 1);
        }
      }, 500);
    }
    
    startAnimationLoop() {
      const animate = () => {
        // Smooth cursor following
        const dx = this.mouseX - this.cursorX;
        const dy = this.mouseY - this.cursorY;
        
        this.cursorX += dx * 0.15;
        this.cursorY += dy * 0.15;
        
        if (this.cursor) {
          this.cursor.style.left = `${this.cursorX}px`;
          this.cursor.style.top = `${this.cursorY}px`;
        }
        
        if (this.cursorDot) {
          this.cursorDot.style.left = `${this.mouseX}px`;
          this.cursorDot.style.top = `${this.mouseY}px`;
        }
        
        if (this.follower) {
          this.follower.style.left = `${this.mouseX}px`;
          this.follower.style.top = `${this.mouseY}px`;
        }
        
        this.rafId = requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      
      this.cursor?.remove();
      this.cursorDot?.remove();
      this.follower?.remove();
      this.trails.forEach(trail => trail.remove());
      
      this.isActive = false;
    }
  }

  // Magnetic Text Effect
  class MagneticTextController {
    constructor(elements, options = {}) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.options = {
        strength: options.strength || 0.3,
        radius: options.radius || 100,
        ...options
      };
      
      this.init();
    }
    
    init() {
      this.elements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = text.split('').map(char => 
          `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        
        el.addEventListener('mousemove', (e) => this.handleMouseMove(e, el));
        el.addEventListener('mouseleave', () => this.handleMouseLeave(el));
      });
    }
    
    handleMouseMove(e, container) {
      const rect = container.getBoundingClientRect();
      const chars = container.querySelectorAll('.char');
      
      chars.forEach(char => {
        const charRect = char.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const charCenterY = charRect.top + charRect.height / 2;
        
        const distX = e.clientX - charCenterX;
        const distY = e.clientY - charCenterY;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        if (dist < this.options.radius) {
          const force = (this.options.radius - dist) / this.options.radius;
          const moveX = -distX * force * this.options.strength;
          const moveY = -distY * force * this.options.strength;
          char.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
    }
    
    handleMouseLeave(container) {
      const chars = container.querySelectorAll('.char');
      chars.forEach(char => {
        char.style.transform = '';
      });
    }
  }

  // Initialize
  function initMagneticCursor() {
    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const controller = new MagneticCursorController({
      enableTrail: false,
      enableOnTouch: false
    });
    
    // Initialize magnetic text effects
    const magneticTextElements = document.querySelectorAll('[data-magnetic-text]');
    if (magneticTextElements.length > 0) {
      new MagneticTextController(magneticTextElements);
    }
    
    // Expose to global
    window.MagneticCursor = controller;
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticCursor);
  } else {
    initMagneticCursor();
  }
})();