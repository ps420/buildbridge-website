// BuildBridge - Fortune 500 Floating Navigation Dots
// Elegant side navigation with scroll progress indicators
// Version 1.0

class FloatingNavDots {
  constructor(options = {}) {
    this.options = {
      sections: '[data-nav-label]',
      position: 'right',
      offset: 30,
      showTooltips: true,
      highlightActive: true,
      smoothScroll: true,
      ...options
    };
    
    this.nav = null;
    this.dots = [];
    this.sections = [];
    this.currentIndex = 0;
    this.observer = null;
    this.isScrolling = false;
    
    this.init();
  }
  
  init() {
    this.sections = Array.from(document.querySelectorAll(this.options.sections));
    if (this.sections.length === 0) return;
    
    this.createNav();
    this.createStyles();
    this.bindEvents();
    this.observeSections();
  }
  
  createNav() {
    this.nav = document.createElement('nav');
    this.nav.className = 'floating-nav-dots';
    this.nav.setAttribute('aria-label', 'Page sections');
    
    const list = document.createElement('ul');
    
    this.sections.forEach((section, index) => {
      const label = section.dataset.navLabel || `Section ${index + 1}`;
      const dot = document.createElement('li');
      
      dot.innerHTML = `
        <button 
          class="nav-dot ${index === 0 ? 'active' : ''}" 
          data-index="${index}"
          aria-label="Go to ${label}"
          aria-current="${index === 0 ? 'true' : 'false'}"
        >
          <span class="nav-dot-indicator"></span>
          ${this.options.showTooltips ? `<span class="nav-dot-tooltip">${label}</span>` : ''}
        </button>
      `;
      
      const button = dot.querySelector('button');
      button.addEventListener('click', () => this.goToSection(index));
      
      list.appendChild(dot);
      this.dots.push(button);
    });
    
    this.nav.appendChild(list);
    document.body.appendChild(this.nav);
    
    // Animate in
    setTimeout(() => {
      this.nav.classList.add('visible');
    }, 1000);
  }
  
  createStyles() {
    if (document.getElementById('floating-nav-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'floating-nav-styles';
    style.textContent = `
      .floating-nav-dots {
        position: fixed;
        ${this.options.position}: ${this.options.offset}px;
        top: 50%;
        transform: translateY(-50%) translateX(${this.options.position === 'right' ? '20px' : '-20px'});
        z-index: 999;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
      
      .floating-nav-dots.visible {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
        pointer-events: auto;
      }
      
      .floating-nav-dots ul {
        list-style: none;
        margin: 0;
        padding: 16px 10px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: rgba(15, 15, 16, 0.6);
        backdrop-filter: blur(12px);
        border-radius: 24px;
        border: 1px solid rgba(201, 206, 214, 0.1);
      }
      
      .nav-dot {
        position: relative;
        width: 10px;
        height: 10px;
        padding: 0;
        border: 1px solid rgba(201, 206, 214, 0.3);
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .nav-dot:hover {
        transform: scale(1.4);
        border-color: rgba(201, 206, 214, 0.6);
      }
      
      .nav-dot.active {
        background: #C9CED6;
        border-color: #C9CED6;
        transform: scale(1.3);
        box-shadow: 0 0 15px rgba(201, 206, 214, 0.4);
      }
      
      .nav-dot::after {
        content: '';
        position: absolute;
        inset: -6px;
        border: 1px solid transparent;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .nav-dot.active::after {
        border-color: rgba(201, 206, 214, 0.2);
        animation: nav-dot-ring 2s ease-out infinite;
      }
      
      @keyframes nav-dot-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      
      .nav-dot-indicator {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: #C9CED6;
        transform: scale(0);
        transition: transform 0.3s ease;
      }
      
      .nav-dot.active .nav-dot-indicator {
        transform: scale(1);
      }
      
      .nav-dot-tooltip {
        position: absolute;
        ${this.options.position === 'right' ? 'right' : 'left'}: 20px;
        top: 50%;
        transform: translateY(-50%);
        padding: 6px 12px;
        background: rgba(15, 15, 16, 0.95);
        border: 1px solid rgba(201, 206, 214, 0.1);
        border-radius: 4px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #C9CED6;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Montserrat', sans-serif;
      }
      
      .nav-dot:hover .nav-dot-tooltip {
        opacity: 1;
        ${this.options.position === 'right' ? 'right' : 'left'}: 25px;
      }
      
      /* Section progress indicator on dots */
      .nav-dot-progress {
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        border: 1px solid transparent;
        border-top-color: #C9CED6;
        opacity: 0;
        transition: opacity 0.3s ease;
        animation: nav-progress-spin 1s linear infinite;
      }
      
      .nav-dot.in-view .nav-dot-progress {
        opacity: 0.5;
      }
      
      @keyframes nav-progress-spin {
        to { transform: rotate(360deg); }
      }
      
      /* Hide on mobile */
      @media (max-width: 900px) {
        .floating-nav-dots {
          display: none;
        }
      }
      
      /* Section entry animations triggered by nav */
      [data-nav-label] {
        position: relative;
      }
      
      [data-nav-label]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(201, 206, 214, 0.3), transparent);
        transform: scaleX(0);
        transition: transform 0.6s ease;
      }
      
      [data-nav-label].in-view::before {
        transform: scaleX(1);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.goToSection(Math.min(this.currentIndex + 1, this.sections.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.goToSection(Math.max(this.currentIndex - 1, 0));
          break;
      }
    });
  }
  
  observeSections() {
    this.observer = new IntersectionObserver((entries) => {
      if (this.isScrolling) return;
      
      entries.forEach(entry => {
        const section = entry.target;
        const index = this.sections.indexOf(section);
        
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          this.setActiveDot(index);
          section.classList.add('in-view');
        } else {
          section.classList.remove('in-view');
        }
      });
    }, {
      threshold: [0, 0.5, 1],
      rootMargin: '-20% 0px -20% 0px'
    });
    
    this.sections.forEach(section => this.observer.observe(section));
  }
  
  goToSection(index) {
    if (index < 0 || index >= this.sections.length || this.isScrolling) return;
    
    this.isScrolling = true;
    this.setActiveDot(index);
    
    const target = this.sections[index];
    
    if (this.options.smoothScroll) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      target.scrollIntoView({ block: 'start' });
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('navSectionChange', {
      detail: { section: target, index: index }
    }));
    
    setTimeout(() => {
      this.isScrolling = false;
    }, 800);
  }
  
  setActiveDot(index) {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
    this.currentIndex = index;
  }
  
  // Public API
  next() {
    this.goToSection(this.currentIndex + 1);
  }
  
  prev() {
    this.goToSection(this.currentIndex - 1);
  }
  
  refresh() {
    this.sections = Array.from(document.querySelectorAll(this.options.sections));
    if (this.nav) {
      this.nav.remove();
    }
    this.dots = [];
    this.createNav();
    this.observeSections();
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.nav) {
      this.nav.remove();
    }
    const styles = document.getElementById('floating-nav-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only on desktop
  if (!window.matchMedia('(pointer: coarse)').matches) {
    window.floatingNav = new FloatingNavDots({
      showTooltips: true,
      highlightActive: true
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingNavDots;
}
