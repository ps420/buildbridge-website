/**
 * BuildBridge Premium Effects v6.2
 * Fortune 500-quality interactive enhancements
 */

// ========================================
// 1. CUSTOM CURSOR SYSTEM
// ========================================
class CustomCursor {
  constructor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.cursor = null;
    this.dot = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.dotX = 0;
    this.dotY = 0;
    this.isActive = true;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.animate();
  }
  
  createElements() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    document.body.appendChild(this.cursor);
    
    this.dot = document.createElement('div');
    this.dot.className = 'custom-cursor-dot';
    document.body.appendChild(this.dot);
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });
    
    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('click');
    });
    
    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, .btn, input, textarea, .service-card, .project-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
    });
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (!this.isActive) {
        this.cursor.style.opacity = '0';
        this.dot.style.opacity = '0';
      } else {
        this.cursor.style.opacity = '1';
        this.dot.style.opacity = '1';
      }
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth follow for cursor ring
    this.cursorX += (this.mouseX - this.cursorX) * 0.15;
    this.cursorY += (this.mouseY - this.cursorY) * 0.15;
    
    // Faster follow for dot
    this.dotX += (this.mouseX - this.dotX) * 0.5;
    this.dotY += (this.mouseY - this.dotY) * 0.5;
    
    this.cursor.style.left = this.cursorX + 'px';
    this.cursor.style.top = this.cursorY + 'px';
    this.dot.style.left = this.dotX + 'px';
    this.dot.style.top = this.dotY + 'px';
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 2. MAGNETIC EFFECTS
// ========================================
class MagneticEffect {
  constructor(selector, strength = 0.3) {
    this.elements = document.querySelectorAll(selector);
    this.strength = strength;
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      el.addEventListener('mousemove', (e) => this.onMouseMove(e, el));
      el.addEventListener('mouseleave', () => this.onMouseLeave(el));
    });
  }
  
  onMouseMove(e, el) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    el.style.transform = `translate(${x * this.strength}px, ${y * this.strength}px)`;
  }
  
  onMouseLeave(el) {
    el.style.transform = 'translate(0, 0)';
  }
}

// Enhanced magnetic with button fill effect
class MagneticButton {
  constructor(selector) {
    this.buttons = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.buttons.forEach(btn => {
      btn.classList.add('magnetic-btn');
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.transform = `translate(${(x - rect.width/2) * 0.2}px, ${(y - rect.height/2) * 0.2}px)`;
        
        // Update ripple origin for fill effect
        const before = btn.querySelector('::before');
        btn.style.setProperty('--mouse-x', x + 'px');
        btn.style.setProperty('--mouse-y', y + 'px');
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }
}

// ========================================
// 3. RIPPLE EFFECT
// ========================================
class RippleEffect {
  constructor(selector) {
    this.elements = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      el.classList.add('btn-ripple');
      el.addEventListener('click', (e) => this.createRipple(e, el));
    });
  }
  
  createRipple(e, el) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    
    el.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}

// ========================================
// 4. 3D TILT CARDS
// ========================================
class TiltCard3D {
  constructor(selector) {
    this.cards = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.cards.forEach(card => {
      card.classList.add('tilt-card-3d');
      
      const inner = document.createElement('div');
      inner.className = 'card-inner';
      
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      
      while (card.firstChild) {
        inner.appendChild(card.firstChild);
      }
      
      card.appendChild(inner);
      card.appendChild(shine);
      
      card.addEventListener('mousemove', (e) => this.onMouseMove(e, card, inner, shine));
      card.addEventListener('mouseleave', () => this.onMouseLeave(inner, shine));
    });
  }
  
  onMouseMove(e, card, inner, shine) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const rotateX = (y - 0.5) * -20;
    const rotateY = (x - 0.5) * 20;
    
    inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Shine effect
    const shineX = x * 100;
    const shineY = y * 100;
    shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
  }
  
  onMouseLeave(inner, shine) {
    inner.style.transform = 'rotateX(0) rotateY(0)';
    shine.style.background = 'none';
  }
}

// ========================================
// 5. SCROLL NAVIGATION SPY
// ========================================
class ScrollSpy {
  constructor(navSelector, sectionSelector) {
    this.nav = document.querySelector(navSelector);
    this.sections = document.querySelectorAll(sectionSelector);
    this.navLinks = this.nav?.querySelectorAll('a[href^="#"]') || [];
    this.init();
  }
  
  init() {
    if (!this.nav || this.sections.length === 0) return;
    
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();
  }
  
  onScroll() {
    const scrollPos = window.scrollY + 100;
    
    this.sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

// ========================================
// 6. SCROLL PROGRESS RING
// ========================================
class ScrollProgressRing {
  constructor() {
    this.container = null;
    this.progress = null;
    this.percentage = null;
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.className = 'scroll-progress-ring';
    this.container.innerHTML = `
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle class="bg" cx="25" cy="25" r="20"></circle>
        <circle class="progress" cx="25" cy="25" r="20"></circle>
      </svg>
      <span class="percentage">0%</span>
    `;
    document.body.appendChild(this.container);
    
    this.progress = this.container.querySelector('.progress');
    this.percentage = this.container.querySelector('.percentage');
    
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
    
    // Click to scroll to top
    this.container.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  update() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const percent = Math.min(100, Math.max(0, (scrolled / scrollHeight) * 100));
    
    const offset = 126 - (126 * percent / 100);
    this.progress.style.strokeDashoffset = offset;
    this.percentage.textContent = Math.round(percent) + '%';
    
    // Show/hide based on scroll
    if (scrolled > 200) {
      this.container.classList.add('visible');
    } else {
      this.container.classList.remove('visible');
    }
  }
}

// ========================================
// 7. TEXT SCRAMBLE EFFECT
// ========================================
class TextScramble {
  constructor(element, options = {}) {
    this.element = element;
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________';
    this.updateInterval = options.interval || 50;
    this.originalText = element.textContent;
    this.frame = 0;
    this.queue = [];
  }
  
  setText(newText) {
    const length = Math.max(this.originalText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = this.originalText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char scrambling" style="color: var(--chrome)">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.element.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ========================================
// 8. VELOCITY SKEW EFFECT
// ========================================
class VelocitySkew {
  constructor(selector) {
    this.elements = document.querySelectorAll(selector);
    this.lastScrollY = window.scrollY;
    this.velocity = 0;
    this.ticking = false;
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    }, { passive: true });
  }
  
  update() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;
    this.velocity = delta * 0.5;
    
    // Clamp velocity
    this.velocity = Math.max(-5, Math.min(5, this.velocity));
    
    this.elements.forEach(el => {
      el.style.transform = `skewY(${this.velocity * 0.5}deg)`;
    });
    
    this.lastScrollY = currentScrollY;
    this.ticking = false;
  }
}

// ========================================
// 9. PARALLAX LAYERS
// ========================================
class ParallaxLayers {
  constructor() {
    this.layers = document.querySelectorAll('[data-parallax-speed]');
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }
  
  update() {
    const scrolled = window.scrollY;
    
    this.layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.5;
      const yPos = -(scrolled * speed);
      layer.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// ========================================
// 10. LAZY REVEAL ANIMATION
// ========================================
class LazyReveal {
  constructor(selector, options = {}) {
    this.elements = document.querySelectorAll(selector);
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '0px';
    this.animation = options.animation || 'fade-up';
    this.stagger = options.stagger || 0;
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            this.reveal(entry.target);
          }, index * this.stagger);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    });
    
    this.elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = this.getInitialTransform();
      el.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                             transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)`;
      observer.observe(el);
    });
  }
  
  getInitialTransform() {
    switch (this.animation) {
      case 'fade-up': return 'translateY(40px)';
      case 'fade-down': return 'translateY(-40px)';
      case 'fade-left': return 'translateX(40px)';
      case 'fade-right': return 'translateX(-40px)';
      case 'scale': return 'scale(0.9)';
      case 'rotate': return 'rotateX(-15deg) translateY(30px)';
      default: return 'translateY(40px)';
    }
  }
  
  reveal(element) {
    element.style.opacity = '1';
    element.style.transform = 'none';
  }
}

// ========================================
// 11. ENHANCED CAROUSEL 3D
// ========================================
class Carousel3D {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;
    
    this.track = this.container.querySelector('.carousel-3d-track');
    this.items = this.container.querySelectorAll('.carousel-3d-item');
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.init();
  }
  
  init() {
    this.updateClasses();
    this.bindEvents();
  }
  
  bindEvents() {
    // Arrow navigation
    const prevBtn = this.container.querySelector('.carousel-prev');
    const nextBtn = this.container.querySelector('.carousel-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
    
    // Touch/drag
    this.track.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const diff = e.clientX - this.startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.prev();
        else this.next();
        this.isDragging = false;
      }
    });
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateClasses();
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateClasses();
  }
  
  updateClasses() {
    this.items.forEach((item, index) => {
      item.classList.remove('active', 'prev', 'next');
      
      if (index === this.currentIndex) {
        item.classList.add('active');
      } else if (index === (this.currentIndex - 1 + this.items.length) % this.items.length) {
        item.classList.add('prev');
      } else if (index === (this.currentIndex + 1) % this.items.length) {
        item.classList.add('next');
      }
    });
  }
}

// ========================================
// 12. ACCORDION ENHANCED
// ========================================
class AccordionEnhanced {
  constructor(selector) {
    this.items = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-enhanced-header');
      if (header) {
        header.addEventListener('click', () => this.toggle(item));
      }
    });
  }
  
  toggle(item) {
    const isActive = item.classList.contains('active');
    
    // Close all
    this.items.forEach(i => i.classList.remove('active'));
    
    // Open clicked if it wasn't active
    if (!isActive) {
      item.classList.add('active');
    }
  }
}

// ========================================
// INITIALIZE ALL EFFECTS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Custom cursor
  new CustomCursor();
  
  // Magnetic effects
  new MagneticEffect('.magnetic', 0.3);
  new MagneticButton('.btn, .quote-btn');
  
  // Ripple effects
  new RippleEffect('.btn, button:not(.mobile-menu-btn)');
  
  // 3D tilt cards
  new TiltCard3D('.service-card, .project-card');
  
  // Scroll spy
  new ScrollSpy('.nav-links', 'section[id]');
  
  // Scroll progress ring
  new ScrollProgressRing();
  
  // Velocity skew
  new VelocitySkew('.velocity-skew');
  
  // Parallax layers
  new ParallaxLayers();
  
  // Lazy reveal animations
  new LazyReveal('.trust > div', { animation: 'scale', stagger: 100 });
  new LazyReveal('.stat-item', { animation: 'fade-up', stagger: 150 });
  new LazyReveal('.timeline-item', { animation: 'fade-right', stagger: 100 });
  new LazyReveal('.faq-item', { animation: 'fade-left', stagger: 100 });
  
  // 3D carousel for testimonials
  new Carousel3D('.testimonial-carousel-3d');
  
  // Enhanced accordion
  new AccordionEnhanced('.accordion-enhanced');
  
  // Text scramble on hover for headings
  document.querySelectorAll('.scramble-text').forEach(el => {
    const fx = new TextScramble(el);
    const originalText = el.textContent;
    
    el.addEventListener('mouseenter', () => {
      fx.setText(originalText);
    });
  });
  
  console.log('%c✨ Premium Effects v6.2 Loaded', 'font-size: 11px; color: #C9CED6;');
  console.log('%c   • Custom cursor with blend mode', 'font-size: 10px; color: #888;');
  console.log('%c   • Magnetic buttons and elements', 'font-size: 10px; color: #888;');
  console.log('%c   • Ripple click effects', 'font-size: 10px; color: #888;');
  console.log('%c   • 3D tilt cards with shine', 'font-size: 10px; color: #888;');
  console.log('%c   • Scroll spy navigation', 'font-size: 10px; color: #888;');
  console.log('%c   • Scroll progress ring', 'font-size: 10px; color: #888;');
  console.log('%c   • Text scramble effects', 'font-size: 10px; color: #888;');
  console.log('%c   • Velocity skew on scroll', 'font-size: 10px; color: #888;');
  console.log('%c   • Parallax layers', 'font-size: 10px; color: #888;');
  console.log('%c   • Lazy reveal animations', 'font-size: 10px; color: #888;');
  console.log('%c   • 3D carousel', 'font-size: 10px; color: #888;');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CustomCursor,
    MagneticEffect,
    RippleEffect,
    TiltCard3D,
    ScrollSpy,
    ScrollProgressRing,
    TextScramble,
    VelocitySkew,
    ParallaxLayers,
    LazyReveal,
    Carousel3D,
    AccordionEnhanced
  };
}
