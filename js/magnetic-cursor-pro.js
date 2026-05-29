/**
 * Professional Magnetic Cursor System - v81.1
 * Fortune 500 style cursor with magnetic attraction to interactive elements
 */

(function() {
  'use strict';

  class MagneticCursor {
    constructor(options = {}) {
      // Check for touch device
      if (window.matchMedia('(pointer: coarse)').matches) {
        return;
      }

      this.options = {
        magneticStrength: options.magneticStrength || 0.3,
        magneticRadius: options.magneticRadius || 100,
        trailCount: options.trailCount || 5,
        smoothFactor: options.smoothFactor || 0.15,
        enableMagnetic: options.enableMagnetic !== false,
        ...options
      };

      this.cursor = null;
      this.cursorRing = null;
      this.linkIcon = null;
      this.cursorLabel = null;
      this.trails = [];
      
      this.mouseX = 0;
      this.mouseY = 0;
      this.cursorX = 0;
      this.cursorY = 0;
      this.ringX = 0;
      this.ringY = 0;
      
      this.isHovering = false;
      this.isClicking = false;
      this.magneticElement = null;
      this.hoverTarget = null;
      this.velocity = { x: 0, y: 0 };
      this.lastMouse = { x: 0, y: 0 };
      
      this.rafId = null;

      this.init();
    }

    init() {
      this.createElements();
      this.bindEvents();
      this.startLoop();
      
      // Add body class
      document.body.classList.add('magnetic-cursor-enabled');
    }

    createElements() {
      // Main cursor dot
      this.cursor = document.createElement('div');
      this.cursor.className = 'magnetic-cursor';
      document.body.appendChild(this.cursor);

      // Outer ring
      this.cursorRing = document.createElement('div');
      this.cursorRing.className = 'magnetic-cursor-ring';
      document.body.appendChild(this.cursorRing);

      // Link icon indicator
      this.linkIcon = document.createElement('div');
      this.linkIcon.className = 'magnetic-cursor-link-icon';
      this.linkIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      `;
      document.body.appendChild(this.linkIcon);

      // Cursor label
      this.cursorLabel = document.createElement('div');
      this.cursorLabel.className = 'magnetic-cursor-label';
      document.body.appendChild(this.cursorLabel);

      // Trail elements
      for (let i = 0; i < this.options.trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.opacity = 1 - (i / this.options.trailCount);
        document.body.appendChild(trail);
        this.trails.push({
          el: trail,
          x: 0,
          y: 0
        });
      }
    }

    bindEvents() {
      // Mouse move
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Calculate velocity
        this.velocity.x = e.clientX - this.lastMouse.x;
        this.velocity.y = e.clientY - this.lastMouse.y;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
      }, { passive: true });

      // Mouse down/up
      document.addEventListener('mousedown', () => {
        this.isClicking = true;
        this.updateCursorState();
      });

      document.addEventListener('mouseup', () => {
        this.isClicking = false;
        this.updateCursorState();
      });

      // Text selection
      document.addEventListener('selectstart', () => {
        this.cursor.classList.add('selecting');
        this.cursorRing.classList.add('selecting');
      });

      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.toString().length === 0) {
          this.cursor.classList.remove('selecting');
          this.cursorRing.classList.remove('selecting');
        }
      });

      // Handle hover on interactive elements
      this.setupHoverTracking();

      // Page visibility
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.hideCursor();
        } else {
          this.showCursor();
        }
      });

      // Leave page
      document.addEventListener('mouseleave', () => {
        this.hideCursor();
      });

      document.addEventListener('mouseenter', () => {
        this.showCursor();
      });
    }

    setupHoverTracking() {
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, [data-magnetic]');
      
      interactiveElements.forEach(el => {
        // Hover in
        el.addEventListener('mouseenter', (e) => {
          this.isHovering = true;
          this.hoverTarget = el;
          
          // Check for magnetic
          if (el.hasAttribute('data-magnetic')) {
            this.magneticElement = el;
            this.cursor.classList.add('magnetic');
            this.cursorRing.classList.add('magnetic');
          } else {
            this.cursor.classList.add('hover');
            this.cursorRing.classList.add('hover');
          }

          // Check for external link
          if (el.tagName === 'A' && el.target === '_blank') {
            this.linkIcon.classList.add('visible');
          }

          // Check for cursor label
          if (el.dataset.cursorLabel) {
            this.cursorLabel.textContent = el.dataset.cursorLabel;
            this.cursorLabel.classList.add('visible');
          }
        });

        // Hover out
        el.addEventListener('mouseleave', () => {
          this.isHovering = false;
          this.hoverTarget = null;
          this.magneticElement = null;
          
          this.cursor.classList.remove('hover', 'magnetic');
          this.cursorRing.classList.remove('hover', 'magnetic');
          this.linkIcon.classList.remove('visible');
          this.cursorLabel.classList.remove('visible');
        });

        // Magnetic effect on mouse move over element
        if (el.hasAttribute('data-magnetic')) {
          el.addEventListener('mousemove', (e) => this.handleMagnetic(e, el));
        }
      });

      // Track dynamic elements
      new MutationObserver(() => {
        const newElements = document.querySelectorAll('a:not([data-cursor-bound]), button:not([data-cursor-bound]), [data-magnetic]:not([data-cursor-bound])');
        newElements.forEach(el => {
          el.dataset.cursorBound = 'true';
          // Re-run binding for new elements
          el.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.hoverTarget = el;
            
            if (el.hasAttribute('data-magnetic')) {
              this.magneticElement = el;
              this.cursor.classList.add('magnetic');
              this.cursorRing.classList.add('magnetic');
            } else {
              this.cursor.classList.add('hover');
              this.cursorRing.classList.add('hover');
            }

            if (el.tagName === 'A' && el.target === '_blank') {
              this.linkIcon.classList.add('visible');
            }
          });

          el.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.hoverTarget = null;
            this.magneticElement = null;
            this.cursor.classList.remove('hover', 'magnetic');
            this.cursorRing.classList.remove('hover', 'magnetic');
            this.linkIcon.classList.remove('visible');
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }

    handleMagnetic(e, element) {
      if (!this.options.enableMagnetic) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      const strength = parseFloat(element.dataset.magnetic) || this.options.magneticStrength;
      
      const moveX = deltaX * strength;
      const moveY = deltaY * strength;
      
      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    startLoop() {
      const loop = () => {
        this.updateCursor();
        this.rafId = requestAnimationFrame(loop);
      };
      loop();
    }

    updateCursor() {
      // Smooth lerp for cursor
      const lerp = (start, end, factor) => start + (end - start) * factor;
      
      this.cursorX = lerp(this.cursorX, this.mouseX, this.options.smoothFactor);
      this.cursorY = lerp(this.cursorY, this.mouseY, this.options.smoothFactor);
      
      // Ring follows with more delay
      this.ringX = lerp(this.ringX, this.mouseX, this.options.smoothFactor * 0.8);
      this.ringY = lerp(this.ringY, this.mouseY, this.options.smoothFactor * 0.8);

      // Apply transforms
      this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px) translate(-50%, -50%)`;
      this.cursorRing.style.transform = `translate(${this.ringX}px, ${this.ringY}px) translate(-50%, -50%)`;
      
      // Update link icon position
      this.linkIcon.style.transform = `translate(${this.ringX}px, ${this.ringY}px) translate(-50%, -50%) ${this.linkIcon.classList.contains('visible') ? 'scale(1)' : 'scale(0)'}`;
      
      // Update label position
      this.cursorLabel.style.left = `${this.cursorX}px`;
      this.cursorLabel.style.top = `${this.cursorY}px`;

      // Update trails
      let prevX = this.cursorX;
      let prevY = this.cursorY;
      
      this.trails.forEach((trail, i) => {
        const delay = (i + 1) * 0.08;
        trail.x = lerp(trail.x, prevX, delay);
        trail.y = lerp(trail.y, prevY, delay);
        trail.el.style.transform = `translate(${trail.x}px, ${trail.y}px) translate(-50%, -50%)`;
        prevX = trail.x;
        prevY = trail.y;
      });

      // Scale based on velocity for dynamic feel
      const velocity = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
      if (velocity > 50) {
        const scale = Math.min(1 + velocity / 200, 1.5);
        this.cursorRing.style.transform += ` scale(${scale})`;
      }
    }

    updateCursorState() {
      if (this.isClicking) {
        this.cursor.classList.add('clicking');
        this.cursorRing.classList.add('clicking');
      } else {
        this.cursor.classList.remove('clicking');
        this.cursorRing.classList.remove('clicking');
      }
    }

    hideCursor() {
      this.cursor.style.opacity = '0';
      this.cursorRing.style.opacity = '0';
      this.linkIcon.style.opacity = '0';
      this.trails.forEach(t => t.el.style.opacity = '0');
    }

    showCursor() {
      this.cursor.style.opacity = '1';
      this.cursorRing.style.opacity = '1';
      this.linkIcon.style.opacity = '';
      this.trails.forEach((t, i) => {
        t.el.style.opacity = 1 - (i / this.options.trailCount);
      });
    }

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      
      document.body.classList.remove('magnetic-cursor-enabled');
      
      [this.cursor, this.cursorRing, this.linkIcon, this.cursorLabel, ...this.trails.map(t => t.el)].forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }

    // Public API methods
    setLabel(text) {
      this.cursorLabel.textContent = text;
    }

    showLabel() {
      this.cursorLabel.classList.add('visible');
    }

    hideLabel() {
      this.cursorLabel.classList.remove('visible');
    }

    setLoading(isLoading) {
      if (isLoading) {
        this.cursor.classList.add('loading');
        this.cursorRing.classList.add('loading');
      } else {
        this.cursor.classList.remove('loading');
        this.cursorRing.classList.remove('loading');
      }
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.magneticCursor = new MagneticCursor();
    });
  } else {
    window.magneticCursor = new MagneticCursor();
  }
})();
