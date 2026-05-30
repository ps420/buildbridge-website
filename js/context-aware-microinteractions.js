// ========================================
// CONTEXT-AWARE MICRO-INTERACTIONS - v129.0
// Fortune 500 Intelligent Button States
// Features: Ripple effects, state machine,
// magnetic pull, proximity detection
// ========================================

class ContextAwareMicroInteractions {
  constructor() {
    this.buttons = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    this.initRippleEffects();
    this.initStateMachineButtons();
    this.initMagneticButtons();
    this.initProximityGlow();
    this.initContextAwareButtons();
    this.initTextScrambleHover();
    this.initProgressiveReveal();
    
    console.log('✨ Context-aware micro-interactions initialized');
  }
  
  // ========================================
  // RIPPLE EFFECT
  // ========================================
  
  initRippleEffects() {
    const buttons = document.querySelectorAll('.ripple-container, .btn, [data-ripple]');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this.createRipple(e, btn));
    });
  }
  
  createRipple(e, btn) {
    if (this.isTouch) return; // Skip on touch devices
    
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    // Check for color variant
    if (btn.dataset.rippleColor) {
      ripple.classList.add(`ripple-${btn.dataset.rippleColor}`);
    }
    
    const size = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    
    btn.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  // ========================================
  // BUTTON STATE MACHINE
  // Loading, Success, Error states
  // ========================================
  
  initStateMachineButtons() {
    const buttons = document.querySelectorAll('.btn-state-machine');
    
    buttons.forEach(btn => {
      // Add state structure if not present
      if (!btn.querySelector('.btn-content')) {
        this.wrapButtonContent(btn);
      }
      
      // Handle click
      btn.addEventListener('click', (e) => {
        if (btn.classList.contains('loading')) {
          e.preventDefault();
          return;
        }
        
        const action = btn.dataset.action;
        if (action) {
          e.preventDefault();
          this.handleButtonAction(btn, action);
        }
      });
    });
  }
  
  wrapButtonContent(btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = `
      <span class="btn-content">${originalContent}</span>
      <span class="btn-loading"><span class="btn-spinner"></span></span>
      <span class="btn-success">✓ Done</span>
      <span class="btn-error">✕ Error</span>
    `;
  }
  
  handleButtonAction(btn, action) {
    this.setButtonState(btn, 'loading');
    
    // Simulate async action
    setTimeout(() => {
      // Random success/error for demo (replace with real logic)
      const success = Math.random() > 0.2;
      this.setButtonState(btn, success ? 'success' : 'error');
      
      // Reset after delay
      setTimeout(() => {
        this.setButtonState(btn, 'default');
      }, 2000);
    }, 1500);
  }
  
  setButtonState(btn, state) {
    btn.classList.remove('loading', 'success', 'error');
    if (state !== 'default') {
      btn.classList.add(state);
    }
  }
  
  // ========================================
  // MAGNETIC BUTTONS V5
  // Enhanced magnetic pull
  // ========================================
  
  initMagneticButtons() {
    if (this.isTouch) return; // Skip on touch devices
    
    const buttons = document.querySelectorAll('.btn-magnetic-v5, [data-magnetic]');
    
    buttons.forEach(btn => {
      const strength = parseFloat(btn.dataset.magnetic) || 0.3;
      const content = btn.querySelector('.magnetic-content') || btn;
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px)`;
        content.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        content.style.transform = '';
      });
    });
  }
  
  // ========================================
  // PROXIMITY GLOW EFFECT
  // Buttons glow when cursor is nearby
  // ========================================
  
  initProximityGlow() {
    if (this.isTouch) return;
    
    const buttons = document.querySelectorAll('.btn-proximity-glow');
    if (buttons.length === 0) return;
    
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(this.mouseX - centerX, 2) + 
          Math.pow(this.mouseY - centerY, 2)
        );
        
        const threshold = 150;
        btn.classList.toggle('nearby', distance < threshold);
        
        // Scale effect based on proximity
        if (distance < threshold) {
          const scale = 1 + (1 - distance / threshold) * 0.05;
          btn.style.transform = `scale(${scale})`;
        } else {
          btn.style.transform = '';
        }
      });
    }, { passive: true });
  }
  
  // ========================================
  // CONTEXT-AWARE BUTTONS
  // Mouse position tracking for effects
  // ========================================
  
  initContextAwareButtons() {
    if (this.isTouch) return;
    
    const buttons = document.querySelectorAll('.btn-context-aware');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        btn.style.setProperty('--mouse-x', `${x}%`);
        btn.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }
  
  // ========================================
  // TEXT SCRAMBLE HOVER
  // Characters scramble and unscramble
  // ========================================
  
  initTextScrambleHover() {
    const elements = document.querySelectorAll('.text-scramble-hover');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    elements.forEach(el => {
      const target = el.querySelector('.scramble-target') || el;
      const originalText = target.textContent;
      let interval = null;
      
      el.addEventListener('mouseenter', () => {
        let iteration = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
          target.textContent = originalText
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return originalText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
          
          if (iteration >= originalText.length) {
            clearInterval(interval);
          }
          
          iteration += 1/3;
        }, 30);
      });
      
      el.addEventListener('mouseleave', () => {
        clearInterval(interval);
        target.textContent = originalText;
      });
    });
  }
  
  // ========================================
  // PROGRESSIVE REVEAL
  // Reveal elements progressively
  // ========================================
  
  initProgressiveReveal() {
    const elements = document.querySelectorAll('.progressive-reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    elements.forEach(el => observer.observe(el));
  }
  
  // ========================================
  // PUBLIC API
  // ========================================
  
  refresh() {
    this.init();
  }
  
  // Programmatically set button state
  static setState(button, state) {
    button.classList.remove('loading', 'success', 'error');
    if (state !== 'default') {
      button.classList.add(state);
    }
  }
  
  // Create ripple programmatically
  static createRipple(element, x, y) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const size = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}

// ========================================
// DUAL STATE TOGGLE
// ========================================

class DualStateToggle {
  constructor(element) {
    this.element = element;
    this.isActive = element.classList.contains('active');
    this.init();
  }
  
  init() {
    this.element.addEventListener('click', () => this.toggle());
    
    // Initialize with proper state
    this.updateState();
  }
  
  toggle() {
    this.isActive = !this.isActive;
    this.updateState();
    this.emitEvent();
  }
  
  updateState() {
    this.element.classList.toggle('active', this.isActive);
    this.element.setAttribute('aria-pressed', this.isActive);
  }
  
  emitEvent() {
    this.element.dispatchEvent(new CustomEvent('toggle', {
      detail: { active: this.isActive }
    }));
  }
  
  getState() {
    return this.isActive;
  }
  
  setState(active) {
    this.isActive = active;
    this.updateState();
  }
}

// ========================================
// EXPANDING BUTTON
// ========================================

class ExpandingButton {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Already handled by CSS, this adds JS enhancements
    this.element.addEventListener('mouseenter', () => {
      this.element.dispatchEvent(new CustomEvent('expand'));
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.dispatchEvent(new CustomEvent('collapse'));
    });
  }
}

// ========================================
// MORPHING BUTTON
// ========================================

class MorphingButton {
  constructor(element) {
    this.element = element;
    this.isMorphed = false;
    this.init();
  }
  
  init() {
    this.element.addEventListener('click', () => this.morph());
  }
  
  morph() {
    this.isMorphed = !this.isMorphed;
    this.element.classList.toggle('morphed', this.isMorphed);
    
    this.element.dispatchEvent(new CustomEvent('morph', {
      detail: { morphed: this.isMorphed }
    }));
  }
}

// ========================================
// INITIALIZE WHEN DOM IS READY
// ========================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.microInteractions = new ContextAwareMicroInteractions();
    
    // Initialize toggles
    document.querySelectorAll('.dual-state-toggle').forEach(el => {
      el._toggle = new DualStateToggle(el);
    });
    
    // Initialize expanding buttons
    document.querySelectorAll('.btn-expanding').forEach(el => {
      el._expanding = new ExpandingButton(el);
    });
    
    // Initialize morphing buttons
    document.querySelectorAll('.btn-morph').forEach(el => {
      el._morph = new MorphingButton(el);
    });
  });
} else {
  window.microInteractions = new ContextAwareMicroInteractions();
}

export { 
  ContextAwareMicroInteractions, 
  DualStateToggle, 
  ExpandingButton, 
  MorphingButton 
};
