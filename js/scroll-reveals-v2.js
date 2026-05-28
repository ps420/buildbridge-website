/**
 * v50.0: Scroll Reveals v2
 * Advanced scroll-triggered animations
 */

class ScrollRevealV2 {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.2,
      rootMargin: options.rootMargin || '0px',
      once: options.once !== false,
      ...options
    };
    
    this.elements = new Map();
    this.observer = null;
    this.init();
  }

  init() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );

    // Auto-observe elements with reveal classes
    this.observeElements();
  }

  observeElements() {
    // Main reveal class
    document.querySelectorAll('.reveal-v2').forEach(el => {
      this.observe(el);
    });

    // Group reveals
    document.querySelectorAll('.reveal-group').forEach(el => {
      this.observe(el);
    });

    // Cascade reveals
    document.querySelectorAll('.reveal-cascade').forEach(el => {
      this.observe(el);
    });

    // Section reveals
    document.querySelectorAll('.section-reveal').forEach(el => {
      this.observe(el);
    });

    // Image reveals
    document.querySelectorAll('.image-reveal-wrapper').forEach(el => {
      this.observe(el);
    });

    // Text mask reveals
    document.querySelectorAll('.text-mask-container').forEach(el => {
      this.observe(el);
    });

    // Wave text reveals
    document.querySelectorAll('.reveal-wave').forEach(el => {
      this.setupWaveReveal(el);
      this.observe(el);
    });

    // Card stack reveals
    document.querySelectorAll('.reveal-card-stack').forEach(el => {
      this.observe(el);
    });
  }

  observe(element) {
    if (this.elements.has(element)) return;
    
    this.elements.set(element, {
      revealed: false,
      animation: element.dataset.revealAnimation || 'default'
    });
    
    this.observer.observe(element);
  }

  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.reveal(entry.target);
        
        if (this.options.once) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.once) {
        this.hide(entry.target);
      }
    });
  }

  reveal(element) {
    const data = this.elements.get(element);
    if (!data || data.revealed) return;
    
    data.revealed = true;
    element.classList.add('revealed');
    
    // Trigger custom event
    element.dispatchEvent(new CustomEvent('revealed', {
      detail: { element, animation: data.animation }
    }));

    // Handle counters
    this.animateCounters(element);
    
    // Handle progressive reveals
    this.handleProgressiveReveal(element);
  }

  hide(element) {
    const data = this.elements.get(element);
    if (!data) return;
    
    data.revealed = false;
    element.classList.remove('revealed');
  }

  setupWaveReveal(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'wave-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${index * 0.03}s`;
      element.appendChild(span);
    });
  }

  animateCounters(container) {
    container.querySelectorAll('[data-counter]').forEach(counter => {
      const target = parseInt(counter.dataset.counter, 10);
      const suffix = counter.dataset.suffix || '';
      const prefix = counter.dataset.prefix || '';
      const duration = parseInt(counter.dataset.duration, 10) || 2000;
      
      this.animateCounterValue(counter, 0, target, duration, prefix, suffix);
    });
  }

  animateCounterValue(element, start, end, duration, prefix, suffix) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-quart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(start + (end - start) * easeProgress);
      element.textContent = `${prefix}${current}${suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }

  handleProgressiveReveal(element) {
    if (!element.classList.contains('progressive-reveal')) return;
    
    // Use scroll-linked animation
    const updateProgress = () => {
      if (!element.isConnected) {
        window.removeEventListener('scroll', updateProgress);
        return;
      }
      
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = 1 - (rect.top / windowHeight);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      element.style.setProperty('--progress', clampedProgress);
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Manual reveal for dynamic content
  revealElement(selector) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
      
    if (element) {
      this.reveal(element);
    }
  }

  // Refresh for dynamic content
  refresh() {
    this.observeElements();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.elements.clear();
  }
}

/**
 * Parallax Reveal System
 * Scroll-based parallax for reveal elements
 */
class ParallaxRevealSystem {
  constructor() {
    this.elements = [];
    this.ticking = false;
    this.init();
  }

  init() {
    this.collectElements();
    this.bindScroll();
  }

  collectElements() {
    document.querySelectorAll('[data-parallax-speed]').forEach(el => {
      this.elements.push({
        element: el,
        speed: parseFloat(el.dataset.parallaxSpeed) || 0.5,
        direction: el.dataset.parallaxDirection || 'vertical'
      });
    });
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.updateParallax());
        this.ticking = true;
      }
    }, { passive: true });
  }

  updateParallax() {
    const scrolled = window.scrollY;
    const windowHeight = window.innerHeight;
    
    this.elements.forEach(({ element, speed, direction }) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + windowHeight;
      
      if (relativeScroll > 0 && relativeScroll < windowHeight + rect.height) {
        const offset = relativeScroll * speed * 0.1;
        
        if (direction === 'horizontal') {
          element.style.transform = `translateX(${offset}px)`;
        } else {
          element.style.transform = `translateY(${offset}px)`;
        }
      }
    });
    
    this.ticking = false;
  }
}

/**
 * Text Reveal Animator
 * Handles character and word animations
 */
class TextRevealAnimator {
  constructor() {
    this.init();
  }

  init() {
    this.setupCharReveals();
    this.setupWordReveals();
    this.setupLineReveals();
  }

  setupCharReveals() {
    document.querySelectorAll('.char-reveal').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${index * 0.03}s`;
        el.appendChild(span);
      });
    });
  }

  setupWordReveals() {
    document.querySelectorAll('.word-reveal').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      
      text.split(' ').forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.transitionDelay = `${index * 0.1}s`;
        el.appendChild(span);
      });
    });
  }

  setupLineReveals() {
    document.querySelectorAll('.line-mask').forEach(el => {
      const text = el.innerHTML;
      el.innerHTML = `<span class="line-text">${text}</span>`;
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main reveal system
  window.scrollRevealV2 = new ScrollRevealV2({
    threshold: 0.15,
    once: true
  });
  
  // Initialize parallax system
  new ParallaxRevealSystem();
  
  // Initialize text animator
  new TextRevealAnimator();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ScrollRevealV2, 
    ParallaxRevealSystem, 
    TextRevealAnimator 
  };
}
