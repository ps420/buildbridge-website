/**
 * BuildBridge Fortune 500 Context-Aware Cursor System
 * Intelligent cursor with multiple interaction states
 * Version: 2.0 Professional
 */

class BuildBridgeCursor {
  constructor(options = {}) {
    this.options = {
      size: options.size || 20,
      trailLength: options.trailLength || 5,
      magneticStrength: options.magneticStrength || 0.3,
      enableOnTouch: options.enableOnTouch || false,
      blendMode: options.blendMode || 'difference',
      accentColor: options.accentColor || '#c9ced6',
      ...options
    };

    this.cursor = null;
    this.cursorRing = null;
    this.trail = [];
    this.mouse = { x: 0, y: 0 };
    this.cursorPos = { x: 0, y: 0 };
    this.ringPos = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.lastPos = { x: 0, y: 0 };
    
    // Cursor states
    this.state = 'default'; // default, hover, click, text, drag, hide
    this.hoverElement = null;
    this.magneticElements = [];
    
    // Configuration for different states
    this.states = {
      default: {
        size: 20,
        ringScale: 1,
        scale: 1,
        opacity: 1,
        color: this.options.accentColor
      },
      hover: {
        size: 60,
        ringScale: 1.5,
        scale: 1.2,
        opacity: 0.8,
        color: '#ffffff'
      },
      click: {
        size: 40,
        ringScale: 0.8,
        scale: 0.9,
        opacity: 0.6
      },
      text: {
        size: 3,
        ringScale: 0,
        scale: 1,
        opacity: 1,
        width: 2,
        height: 24
      },
      drag: {
        size: 50,
        ringScale: 0,
        scale: 1,
        opacity: 0.9,
        icon: '↔'
      },
      hide: {
        opacity: 0
      }
    };

    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    // Skip on touch devices unless explicitly enabled
    if (this.isTouchDevice && !this.options.enableOnTouch) {
      return;
    }

    this.init();
  }

  init() {
    this.createCursor();
    this.createTrail();
    this.bindEvents();
    this.findMagneticElements();
    this.startRAF();
    this.hideNativeCursor();
  }

  createCursor() {
    // Create main cursor dot
    this.cursor = document.createElement('div');
    this.cursor.className = 'buildbridge-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      width: ${this.options.size}px;
      height: ${this.options.size}px;
      background: ${this.options.accentColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease, background 0.3s ease, opacity 0.3s ease;
      mix-blend-mode: ${this.options.blendMode};
    `;
    
    // Create cursor ring
    this.cursorRing = document.createElement('div');
    this.cursorRing.className = 'buildbridge-cursor-ring';
    this.cursorRing.style.cssText = `
      position: fixed;
      width: ${this.options.size * 2}px;
      height: ${this.options.size * 2}px;
      border: 1px solid ${this.options.accentColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 99997;
      transform: translate(-50%, -50%);
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                  height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s ease,
                  opacity 0.3s ease;
      mix-blend-mode: ${this.options.blendMode};
    `;
    
    // Create state indicator
    this.cursorState = document.createElement('div');
    this.cursorState.className = 'buildbridge-cursor-state';
    this.cursorState.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 99996;
      transform: translate(-50%, -50%);
      font-size: 12px;
      color: ${this.options.accentColor};
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: 'Montserrat', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    `;
    
    document.body.appendChild(this.cursorRing);
    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorState);
  }

  createTrail() {
    for (let i = 0; i < this.options.trailLength; i++) {
      const trailDot = document.createElement('div');
      trailDot.className = 'buildbridge-cursor-trail';
      const size = this.options.size * (1 - i / this.options.trailLength);
      trailDot.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${this.options.accentColor};
        border-radius: 50%;
        pointer-events: none;
        z-index: ${99990 - i};
        transform: translate(-50%, -50%);
        opacity: ${0.5 - i * 0.1};
        mix-blend-mode: ${this.options.blendMode};
        filter: blur(${i * 0.5}px);
      `;
      
      document.body.appendChild(trailDot);
      this.trail.push({
        element: trailDot,
        x: 0,
        y: 0
      });
    }
  }

  bindEvents() {
    // Mouse movement
    document.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
    
    // Mouse down/up for click state
    document.addEventListener('mousedown', () => this.setState('click'));
    document.addEventListener('mouseup', () => this.restoreState());
    
    // Element hover detection
    this.setupHoverDetection();
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setState('hide');
      } else {
        this.restoreState();
      }
    });
    
    // Detect if mouse leaves window
    document.addEventListener('mouseleave', () => this.setState('hide'));
    document.addEventListener('mouseenter', () => this.restoreState());
  }

  setupHoverDetection() {
    const hoverSelectors = [
      'a', 'button', '.btn', '[data-cursor="hover"]',
      '.project-card', '.service-card', '[data-magnetic]'
    ];
    
    const textSelectors = [
      'input[type="text"]', 'input[type="email"]', 'textarea',
      '[contenteditable="true"]', '[data-cursor="text"]'
    ];
    
    const dragSelectors = [
      '[draggable="true"]', '.draggable', '[data-cursor="drag"]'
    ];
    
    // Hover state
    hoverSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => {
          this.hoverElement = el;
          this.setState('hover', el);
        });
        
        el.addEventListener('mouseleave', () => {
          if (this.hoverElement === el) {
            this.hoverElement = null;
            this.restoreState();
          }
        });
      });
    });
    
    // Text state
    textSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => this.setState('text'));
        el.addEventListener('mouseleave', () => this.restoreState());
      });
    });
    
    // Drag state
    dragSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => this.setState('drag'));
        el.addEventListener('mouseleave', () => this.restoreState());
      });
    });
    
    // Dynamic elements observer
    const observer = new MutationObserver(() => {
      this.findMagneticElements();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  findMagneticElements() {
    this.magneticElements = [];
    document.querySelectorAll('[data-cursor-magnetic]').forEach(el => {
      this.magneticElements.push({
        element: el,
        strength: parseFloat(el.dataset.cursorMagnetic) || this.options.magneticStrength
      });
    });
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    
    // Calculate velocity
    this.velocity.x = this.mouse.x - this.lastPos.x;
    this.velocity.y = this.mouse.y - this.lastPos.y;
    this.lastPos.x = this.mouse.x;
    this.lastPos.y = this.mouse.y;
  }

  setState(newState, targetElement = null) {
    this.state = newState;
    const config = this.states[newState];
    
    if (!config) return;
    
    // Apply cursor styles
    if (config.size) {
      this.cursor.style.width = `${config.size}px`;
      this.cursor.style.height = `${newState === 'text' ? config.height : config.size}px`;
      this.cursor.style.borderRadius = newState === 'text' ? '0' : '50%';
    }
    
    if (config.opacity !== undefined) {
      this.cursor.style.opacity = config.opacity;
    }
    
    if (config.color) {
      this.cursor.style.background = config.color;
    }
    
    // Apply ring styles
    if (config.ringScale !== undefined) {
      const ringSize = this.options.size * 2 * config.ringScale;
      this.cursorRing.style.width = `${ringSize}px`;
      this.cursorRing.style.height = `${ringSize}px`;
      this.cursorRing.style.opacity = config.ringScale === 0 ? 0 : (config.opacity || 1);
    }
    
    // Handle magnetic effect
    if (targetElement && targetElement.hasAttribute('data-magnetic')) {
      this.applyMagneticEffect(targetElement);
    }
    
    // Update state text
    if (config.icon) {
      this.cursorState.textContent = config.icon;
      this.cursorState.style.opacity = '1';
    } else {
      this.cursorState.style.opacity = '0';
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('cursorstatechange', {
      detail: { state: newState, element: targetElement }
    }));
  }

  restoreState() {
    this.setState('default');
  }

  applyMagneticEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Only apply if cursor is near center
    const distanceX = this.mouse.x - centerX;
    const distanceY = this.mouse.y - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < rect.width / 2) {
      const strength = parseFloat(element.dataset.magnetic) || this.options.magneticStrength;
      this.cursorPos.x += (centerX - this.cursorPos.x) * strength;
      this.cursorPos.y += (centerY - this.cursorPos.y) * strength;
    }
  }

  startRAF() {
    this.animate();
  }

  animate() {
    // Smooth cursor following
    const ease = this.state === 'hover' ? 0.15 : 0.12;
    
    this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * ease;
    this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * ease;
    
    // Ring follows with more delay
    this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.08;
    this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.08;
    
    // Apply transforms
    this.cursor.style.transform = `translate(${this.cursorPos.x}px, ${this.cursorPos.y}px) translate(-50%, -50%)`;
    this.cursorRing.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;
    this.cursorState.style.transform = `translate(${this.cursorPos.x}px, ${this.cursorPos.y + 40}px) translate(-50%, -50%)`;
    
    // Update trail positions
    let prevX = this.cursorPos.x;
    let prevY = this.cursorPos.y;
    
    this.trail.forEach((dot, index) => {
      const delay = (index + 1) * 0.08;
      dot.x += (prevX - dot.x) * delay;
      dot.y += (prevY - dot.y) * delay;
      dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
      prevX = dot.x;
      prevY = dot.y;
    });
    
    // Apply magnetic effects to magnetic elements
    this.magneticElements.forEach(item => {
      const { element, strength } = item;
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = this.mouse.x - centerX;
      const distanceY = this.mouse.y - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      if (distance < 150) {
        const pull = (150 - distance) / 150 * strength;
        const moveX = distanceX * pull * 0.3;
        const moveY = distanceY * pull * 0.3;
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        element.style.transform = '';
      }
    });
    
    requestAnimationFrame(this.animate.bind(this));
  }

  hideNativeCursor() {
    const style = document.createElement('style');
    style.textContent = `
      * { cursor: none !important; }
      @media (pointer: coarse) {
        * { cursor: auto !important; }
        .buildbridge-cursor,
        .buildbridge-cursor-ring,
        .buildbridge-cursor-state,
        .buildbridge-cursor-trail {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Public API
  setCustomState(name, config) {
    this.states[name] = { ...this.states.default, ...config };
  }

  addMagneticElement(element, strength) {
    element.setAttribute('data-magnetic', strength);
    this.findMagneticElements();
  }

  destroy() {
    if (this.cursor) this.cursor.remove();
    if (this.cursorRing) this.cursorRing.remove();
    if (this.cursorState) this.cursorState.remove();
    this.trail.forEach(t => t.element.remove());
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.buildbridgeCursor = new BuildBridgeCursor({
    size: 8,
    trailLength: 4,
    magneticStrength: 0.4,
    accentColor: '#c9ced6'
  });
  
  console.log('👆 BuildBridge Context Cursor initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildBridgeCursor;
}
