/**
 * V87.3: MAGNETIC BUTTONS V4
 * Advanced Button Interactions with Spring Physics
 * Fortune 500 Quality Interactive Elements
 */

class MagneticButtonV4 {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      strength: options.strength || 0.4,
      damping: options.damping || 0.15,
      stiffness: options.stiffness || 0.08,
      radius: options.radius || 150,
      scale: options.scale || 1.05,
      textMagnetic: options.textMagnetic !== false,
      backgroundEffect: options.backgroundEffect !== false,
      ...options
    };
    
    // Physics state
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.isHovering = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.createInnerElements();
    this.bindEvents();
    this.startAnimationLoop();
  }
  
  createInnerElements() {
    // Wrap text content for independent movement
    if (this.options.textMagnetic && !this.element.querySelector('.magnetic-text')) {
      const textContent = this.element.innerHTML;
      this.element.innerHTML = `<span class="magnetic-text">${textContent}</span>`;
    }
    
    // Create magnetic background effect
    if (this.options.backgroundEffect && !this.element.querySelector('.magnetic-bg')) {
      const bg = document.createElement('span');
      bg.className = 'magnetic-bg';
      this.element.insertBefore(bg, this.element.firstChild);
    }
    
    // Ensure positioning context
    if (getComputedStyle(this.element).position === 'static') {
      this.element.style.position = 'relative';
    }
    
    this.textElement = this.element.querySelector('.magnetic-text');
    this.bgElement = this.element.querySelector('.magnetic-bg');
  }
  
  bindEvents() {
    // Mouse enter
    this.element.addEventListener('mouseenter', (e) => {
      this.isHovering = true;
      this.element.classList.add('magnetic-active');
      this.handleMove(e);
    }, { passive: true });
    
    // Mouse move
    this.element.addEventListener('mousemove', (e) => {
      this.handleMove(e);
    }, { passive: true });
    
    // Mouse leave
    this.element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.element.classList.remove('magnetic-active');
      this.target = { x: 0, y: 0 };
    }, { passive: true });
    
    // Focus for accessibility
    this.element.addEventListener('focus', () => {
      this.element.classList.add('magnetic-focus');
    }, { passive: true });
    
    this.element.addEventListener('blur', () => {
      this.element.classList.remove('magnetic-focus');
      this.isHovering = false;
      this.target = { x: 0, y: 0 };
    }, { passive: true });
  }
  
  handleMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate magnetic pull based on distance
    let pull = 1;
    if (distance > this.options.radius) {
      pull = Math.max(0, 1 - (distance - this.options.radius) / 100);
    }
    
    // Set target position with strength multiplier
    this.target = {
      x: dx * this.options.strength * pull,
      y: dy * this.options.strength * pull
    };
  }
  
  updatePhysics() {
    // Spring physics simulation
    const ax = (this.target.x - this.position.x) * this.options.stiffness;
    const ay = (this.target.y - this.position.y) * this.options.stiffness;
    
    this.velocity.x += ax;
    this.velocity.y += ay;
    
    this.velocity.x *= (1 - this.options.damping);
    this.velocity.y *= (1 - this.options.damping);
    
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  
  applyTransforms() {
    const { x, y } = this.position;
    const scale = this.isHovering ? this.options.scale : 1;
    
    // Apply to main element
    this.element.style.transform = `
      translate(${x}px, ${y}px)
      scale(${scale})
    `;
    
    // Apply independent transform to text (stronger effect)
    if (this.textElement) {
      const textX = x * 1.3;
      const textY = y * 1.3;
      this.textElement.style.transform = `translate(${textX}px, ${textY}px)`;
    }
    
    // Apply inverse transform to background (subtle parallax)
    if (this.bgElement) {
      const bgX = x * -0.3;
      const bgY = y * -0.3;
      this.bgElement.style.transform = `translate(${bgX}px, ${bgY}px)`;
    }
  }
  
  startAnimationLoop() {
    const animate = () => {
      this.updatePhysics();
      this.applyTransforms();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.element.style.transform = '';
    if (this.textElement) {
      this.textElement.style.transform = '';
    }
  }
}

// ========================================
// MAGNETIC CONTAINER (for groups of elements)
// ========================================

class MagneticContainer {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      strength: options.strength || 0.2,
      radius: options.radius || 200,
      ...options
    };
    
    this.children = [];
    this.init();
  }
  
  init() {
    this.children = Array.from(this.element.children);
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.children.forEach(child => {
        const childRect = child.getBoundingClientRect();
        const childCenterX = childRect.left - rect.left + childRect.width / 2;
        const childCenterY = childRect.top - rect.top + childRect.height / 2;
        
        const dx = mouseX - childCenterX;
        const dy = mouseY - childCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.radius) {
          const force = (1 - distance / this.options.radius) * this.options.strength;
          const moveX = dx * force;
          const moveY = dy * force;
          
          child.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          child.style.transform = '';
        }
      });
    }, { passive: true });
    
    this.element.addEventListener('mouseleave', () => {
      this.children.forEach(child => {
        child.style.transition = 'transform 0.3s ease-out';
        child.style.transform = '';
        setTimeout(() => {
          child.style.transition = '';
        }, 300);
      });
    }, { passive: true });
  }
}

// ========================================
// BATCH INITIALIZATION
// ========================================

function initMagneticButtonsV4() {
  // Skip on touch devices for performance
  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }
  
  // Initialize magnetic buttons
  const buttons = document.querySelectorAll('.magnetic-v4, [data-magnetic-v4]');
  
  buttons.forEach(button => {
    if (button._magneticV4) return;
    
    const options = {
      strength: parseFloat(button.dataset.magneticStrength) || 0.4,
      radius: parseInt(button.dataset.magneticRadius) || 150,
      scale: parseFloat(button.dataset.magneticScale) || 1.05,
      textMagnetic: button.dataset.magneticText !== 'false',
      backgroundEffect: button.dataset.magneticBg !== 'false'
    };
    
    button._magneticV4 = new MagneticButtonV4(button, options);
  });
  
  // Initialize magnetic containers
  const containers = document.querySelectorAll('.magnetic-container, [data-magnetic-container]');
  
  containers.forEach(container => {
    if (container._magneticContainer) return;
    
    const options = {
      strength: parseFloat(container.dataset.containerStrength) || 0.2,
      radius: parseInt(container.dataset.containerRadius) || 200
    };
    
    container._magneticContainer = new MagneticContainer(container, options);
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagneticButtonsV4);
} else {
  initMagneticButtonsV4();
}

// Re-initialize on dynamic content
const magneticObserver = new MutationObserver((mutations) => {
  let shouldInit = false;
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (node.matches?.('.magnetic-v4, [data-magnetic-v4], .magnetic-container, [data-magnetic-container]') ||
            node.querySelector?.('.magnetic-v4, [data-magnetic-v4], .magnetic-container, [data-magnetic-container]')) {
          shouldInit = true;
        }
      }
    });
  });
  
  if (shouldInit) {
    initMagneticButtonsV4();
  }
});

magneticObserver.observe(document.body, { childList: true, subtree: true });

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MagneticButtonV4, MagneticContainer };
}
