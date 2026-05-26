// BuildBridge - Fortune 500 Scroll-Snap Sections
// Premium one-page navigation with smooth snap scrolling
// Version 1.0

class ScrollSnapSections {
  constructor(options = {}) {
    this.sections = [];
    this.currentSection = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.options = {
      snapSelector: '[data-section]',
      duration: 800,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // easeInOutQuad
      threshold: 0.4,
      debounce: 50,
      indicator: true,
      keyboard: true,
      ...options
    };
    
    this.navDots = null;
    this.init();
  }
  
  init() {
    this.sections = document.querySelectorAll(this.options.snapSelector);
    if (!this.sections.length) return;
    
    this.createNavDots();
    this.bindEvents();
    this.updateCurrentSection();
    
    // Apply CSS for scroll-snap
    this.applyScrollSnapCSS();
  }
  
  applyScrollSnapCSS() {
    const style = document.createElement('style');
    style.textContent = `
      html.scroll-snap-enabled {
        scroll-behavior: smooth;
      }
      
      html.scroll-snap-enabled body {
        scroll-snap-type: y proximity;
      }
      
      [data-section] {
        scroll-snap-align: start;
        scroll-snap-stop: normal;
      }
      
      .section-nav-dots {
        position: fixed;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 16px;
        z-index: 999;
        padding: 20px 10px;
        background: rgba(15, 15, 16, 0.6);
        backdrop-filter: blur(10px);
        border-radius: 30px;
        border: 1px solid rgba(201, 206, 214, 0.1);
        transition: all 0.3s ease;
      }
      
      .section-nav-dots.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(-50%) translateX(20px);
      }
      
      .section-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(201, 206, 214, 0.3);
        border: 1px solid rgba(201, 206, 214, 0.2);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      
      .section-dot:hover {
        background: rgba(201, 206, 214, 0.6);
        transform: scale(1.3);
      }
      
      .section-dot.active {
        background: #C9CED6;
        transform: scale(1.5);
        box-shadow: 0 0 15px rgba(201, 206, 214, 0.5);
      }
      
      .section-dot::before {
        content: attr(data-label);
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        white-space: nowrap;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #C9CED6;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        font-family: 'Montserrat', sans-serif;
        background: rgba(15, 15, 16, 0.9);
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid rgba(201, 206, 214, 0.1);
      }
      
      .section-dot:hover::before {
        opacity: 1;
        right: 25px;
      }
      
      @media (max-width: 900px) {
        .section-nav-dots {
          display: none;
        }
      }
      
      /* Section indicator label */
      .section-indicator {
        position: fixed;
        right: 80px;
        top: 50%;
        transform: translateY(-50%);
        font-family: 'Montserrat', sans-serif;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #C9CED6;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        opacity: 0.5;
        z-index: 998;
        transition: opacity 0.3s ease;
      }
      
      /* Scroll progress ring on active dot */
      .section-dot {
        position: relative;
      }
      
      .section-dot.active::after {
        content: '';
        position: absolute;
        inset: -4px;
        border: 1px solid rgba(201, 206, 214, 0.3);
        border-radius: 50%;
        animation: dot-pulse 2s ease-in-out infinite;
      }
      
      @keyframes dot-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add('scroll-snap-enabled');
  }
  
  createNavDots() {
    if (!this.options.indicator) return;
    
    this.navDots = document.createElement('div');
    this.navDots.className = 'section-nav-dots';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'section-dot';
      dot.setAttribute('data-index', index);
      dot.setAttribute('aria-label', `Navigate to section ${index + 1}`);
      dot.setAttribute('data-label', section.dataset.section || `Section ${index + 1}`);
      
      dot.addEventListener('click', () => this.scrollToSection(index));
      
      this.navDots.appendChild(dot);
    });
    
    document.body.appendChild(this.navDots);
    
    // Hide on scroll stop
    this.navDots.classList.add('hidden');
    setTimeout(() => this.navDots.classList.remove('hidden'), 500);
  }
  
  bindEvents() {
    // Wheel event with debounce
    let wheelTimeout;
    window.addEventListener('wheel', (e) => {
      if (this.isScrolling) return;
      
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 50) {
          this.nextSection();
        } else if (e.deltaY < -50) {
          this.prevSection();
        }
      }, this.options.debounce);
    }, { passive: true });
    
    // Keyboard navigation
    if (this.options.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
          case 'ArrowDown':
          case 'PageDown':
            e.preventDefault();
            this.nextSection();
            break;
          case 'ArrowUp':
          case 'PageUp':
            e.preventDefault();
            this.prevSection();
            break;
          case 'Home':
            e.preventDefault();
            this.scrollToSection(0);
            break;
          case 'End':
            e.preventDefault();
            this.scrollToSection(this.sections.length - 1);
            break;
        }
      });
    }
    
    // Intersection observer for section tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= this.options.threshold) {
          const index = Array.from(this.sections).indexOf(entry.target);
          if (index !== this.currentSection) {
            this.currentSection = index;
            this.updateNavDots();
          }
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '-10% 0px -10% 0px'
    });
    
    this.sections.forEach(section => observer.observe(section));
    
    // Touch/swipe support
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe(touchStartY, touchEndY);
    }, { passive: true });
  }
  
  handleSwipe(startY, endY) {
    if (this.isScrolling) return;
    
    const diff = startY - endY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.nextSection();
      } else {
        this.prevSection();
      }
    }
  }
  
  scrollToSection(index) {
    if (index < 0 || index >= this.sections.length || this.isScrolling) return;
    
    this.isScrolling = true;
    this.currentSection = index;
    this.updateNavDots();
    
    const target = this.sections[index];
    const targetPosition = target.offsetTop;
    
    // Smooth scroll with custom easing
    this.smoothScrollTo(targetPosition, this.options.duration);
    
    // Trigger section enter event
    window.dispatchEvent(new CustomEvent('sectionEnter', {
      detail: { section: target, index: index }
    }));
    
    setTimeout(() => {
      this.isScrolling = false;
    }, this.options.duration);
  }
  
  smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = this.options.easing(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  }
  
  nextSection() {
    this.scrollToSection(this.currentSection + 1);
  }
  
  prevSection() {
    this.scrollToSection(this.currentSection - 1);
  }
  
  updateNavDots() {
    if (!this.navDots) return;
    
    const dots = this.navDots.querySelectorAll('.section-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSection);
    });
  }
  
  updateCurrentSection() {
    const scrollPosition = window.pageYOffset;
    
    this.sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop - sectionHeight / 2 &&
          scrollPosition < sectionTop + sectionHeight / 2) {
        this.currentSection = index;
      }
    });
    
    this.updateNavDots();
  }
  
  // Public API methods
  goTo(index) {
    this.scrollToSection(index);
  }
  
  next() {
    this.nextSection();
  }
  
  prev() {
    this.prevSection();
  }
  
  getCurrentIndex() {
    return this.currentSection;
  }
  
  destroy() {
    if (this.navDots) {
      this.navDots.remove();
    }
    document.documentElement.classList.remove('scroll-snap-enabled');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only enable on desktop
  if (!window.matchMedia('(pointer: coarse)').matches) {
    window.scrollSnap = new ScrollSnapSections({
      indicator: true,
      keyboard: true,
      threshold: 0.3
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollSnapSections;
}
