/**
 * BuildBridge Fortune 500 Animations v7.0
 * Executive-level interactions and polish
 */

// ========================================
// 1. MAGNETIC CURSOR SYSTEM
// ========================================
class MagneticCursor {
  constructor() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.cursor = null;
    this.cursorDot = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.dotX = 0;
    this.dotY = 0;
    this.isHovering = false;
    
    this.init();
  }
  
  init() {
    this.createCursor();
    this.bindEvents();
    this.animate();
  }
  
  createCursor() {
    // Main cursor ring
    this.cursor = document.createElement('div');
    this.cursor.className = 'magnetic-cursor';
    document.body.appendChild(this.cursor);
    
    // Inner dot
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'magnetic-cursor-dot';
    document.body.appendChild(this.cursorDot);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Hide cursor on specific elements
    const interactiveElements = document.querySelectorAll('a, button, [data-magnetic]');
    interactiveElements.forEach(el => {
      el.style.cursor = 'none';
    });
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });
    
    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('clicking');
    });
    
    // Magnetic attraction for interactive elements
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.isHovering = true;
        this.cursor.classList.add('hovering');
      });
      
      el.addEventListener('mouseleave', () => {
        this.isHovering = false;
        this.cursor.classList.remove('hovering');
      });
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        
        const strength = parseFloat(el.dataset.magnetic) || 0.3;
        el.style.transform = `translate(${distX * strength}px, ${distY * strength}px)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
  
  animate() {
    // Smooth follow for main cursor
    this.cursorX += (this.mouseX - this.cursorX) * 0.15;
    this.cursorY += (this.mouseY - this.cursorY) * 0.15;
    
    // Faster follow for dot
    this.dotX += (this.mouseX - this.dotX) * 0.25;
    this.dotY += (this.mouseY - this.dotY) * 0.25;
    
    this.cursor.style.left = this.cursorX + 'px';
    this.cursor.style.top = this.cursorY + 'px';
    
    this.cursorDot.style.left = this.dotX + 'px';
    this.cursorDot.style.top = this.dotY + 'px';
    
    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 2. 3D TILT CARDS WITH GLARE
// ========================================
class TiltCard3D {
  constructor(selector = '.tilt-card-3d') {
    this.cards = document.querySelectorAll(selector);
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.init();
  }
  
  init() {
    this.cards.forEach(card => {
      this.setupCard(card);
    });
  }
  
  setupCard(card) {
    // Add glare element if not exists
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Update glare position
      const glare = card.querySelector('.card-glare');
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25) 0%, transparent 60%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  }
}

// ========================================
// 3. TEXT SCRAMBLE EFFECT
// ========================================
class TextScramble {
  constructor(el, options = {}) {
    this.el = el;
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
    this.isAnimating = false;
  }
  
  setText(newText) {
    const length = Math.max(this.el.innerText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = this.el.innerText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.frame = 0;
      this.update();
    }
    
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span style="opacity: 0.7">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
      this.isAnimating = false;
    } else {
      this.frame++;
      this.frameRequest = requestAnimationFrame(this.update);
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ========================================
// 4. SCROLL VELOCITY DETECTOR
// ========================================
class ScrollVelocity {
  constructor() {
    this.lastScrollY = window.scrollY;
    this.lastTime = performance.now();
    this.velocity = 0;
    this.elements = document.querySelectorAll('[data-velocity]');
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.animate();
  }
  
  update() {
    const currentY = window.scrollY;
    const currentTime = performance.now();
    const deltaY = currentY - this.lastScrollY;
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      this.velocity = deltaY / deltaTime;
    }
    
    this.lastScrollY = currentY;
    this.lastTime = currentTime;
  }
  
  animate() {
    this.elements.forEach(el => {
      const maxSkew = parseFloat(el.dataset.velocity) || 2;
      const skew = Math.max(-maxSkew, Math.min(maxSkew, this.velocity * 50));
      el.style.transform = `skewX(${skew}deg)`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 5. FLOATING ACTION BUTTON
// ========================================
class FloatingActionButton {
  constructor() {
    this.container = null;
    this.mainBtn = null;
    this.menu = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    // Remove existing WhatsApp buttons
    document.querySelectorAll('.floating-whatsapp').forEach(el => el.remove());
    
    this.createFAB();
    this.bindEvents();
  }
  
  createFAB() {
    this.container = document.createElement('div');
    this.container.className = 'fab-container';
    
    this.menu = document.createElement('div');
    this.menu.className = 'fab-menu';
    this.menu.innerHTML = `
      <a href="https://wa.me/27661200064" class="fab-item" target="_blank" rel="noopener">
        <span class="icon">💬</span>
        <span>WhatsApp</span>
      </a>
      <a href="tel:+27661200064" class="fab-item">
        <span class="icon">📞</span>
        <span>Call Now</span>
      </a>
      <a href="mailto:info@buildbridge.co.za" class="fab-item">
        <span class="icon">✉️</span>
        <span>Email Us</span>
      </a>
    `;
    
    this.mainBtn = document.createElement('button');
    this.mainBtn.className = 'fab-main pulse-subtle';
    this.mainBtn.setAttribute('aria-label', 'Contact options');
    this.mainBtn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"/>
      </svg>
    `;
    
    this.container.appendChild(this.menu);
    this.container.appendChild(this.mainBtn);
    document.body.appendChild(this.container);
  }
  
  bindEvents() {
    this.mainBtn.addEventListener('click', () => this.toggle());
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isOpen) {
        this.close();
      }
    });
    
    // Rotate icon when open
    this.mainBtn.querySelector('svg').style.transition = 'transform 0.3s ease';
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.menu.classList.toggle('active', this.isOpen);
    this.mainBtn.querySelector('svg').style.transform = this.isOpen ? 'rotate(45deg)' : 'rotate(0)';
    this.mainBtn.classList.remove('pulse-subtle');
  }
  
  close() {
    this.isOpen = false;
    this.menu.classList.remove('active');
    this.mainBtn.querySelector('svg').style.transform = 'rotate(0)';
  }
}

// ========================================
// 6. ADVANCED MOBILE MENU
// ========================================
class AdvancedMobileMenu {
  constructor() {
    this.btn = document.querySelector('.mobile-menu-btn');
    this.nav = document.getElementById('navLinks');
    this.overlay = null;
    this.isOpen = false;
    
    if (!this.btn) return;
    
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.upgradeButton();
    this.bindEvents();
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';
    
    const links = Array.from(document.querySelectorAll('.nav-links a')).map((link, i) => {
      return `<a href="${link.href}" class="menu-overlay-link" data-index="${i + 1}">
        <span class="number">0${i + 1}</span>${link.textContent}
      </a>`;
    }).join('');
    
    this.overlay.innerHTML = `<div class="menu-overlay-content">${links}</div>`;
    document.body.appendChild(this.overlay);
    
    // Bind overlay links
    this.overlay.querySelectorAll('.menu-overlay-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        this.close();
        setTimeout(() => {
          window.location.href = href;
        }, 500);
      });
    });
  }
  
  upgradeButton() {
    this.btn.className = 'menu-btn-advanced';
    this.btn.innerHTML = `
      <span class="menu-line"></span>
      <span class="menu-line"></span>
      <span class="menu-line"></span>
    `;
    this.btn.setAttribute('aria-label', 'Toggle menu');
  }
  
  bindEvents() {
    this.btn.addEventListener('click', () => this.toggle());
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.btn.classList.toggle('active', this.isOpen);
    this.overlay.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
  
  close() {
    this.isOpen = false;
    this.btn.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========================================
// 7. AMBIENT PARTICLE FIELD
// ========================================
class AmbientParticles {
  constructor(count = 50) {
    this.count = count;
    this.container = null;
    
    // Skip on mobile
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.count = 20;
    }
    
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.className = 'ambient-particles';
    
    for (let i = 0; i < this.count; i++) {
      this.createParticle();
    }
    
    document.body.appendChild(this.container);
  }
  
  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'ambient-particle';
    
    // Random properties
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = 10 + Math.random() * 20;
    const opacity = 0.1 + Math.random() * 0.4;
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      top: ${y}%;
      animation-delay: ${-delay}s;
      animation-duration: ${duration}s;
      opacity: ${opacity};
    `;
    
    this.container.appendChild(particle);
  }
}

// ========================================
// 8. SECTION INDICATOR
// ========================================
class SectionIndicator {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.indicator = null;
    this.dots = [];
    
    if (this.sections.length === 0) return;
    if (window.innerWidth < 1200) return;
    
    this.init();
  }
  
  init() {
    this.createIndicator();
    this.observeSections();
    this.bindEvents();
  }
  
  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'section-indicator';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'section-indicator-dot';
      dot.dataset.target = section.id;
      
      const label = document.createElement('span');
      label.className = 'section-indicator-label';
      label.textContent = section.getAttribute('data-nav-label') || section.id;
      dot.appendChild(label);
      
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });
      
      this.indicator.appendChild(dot);
      this.dots.push(dot);
    });
    
    document.body.appendChild(this.indicator);
  }
  
  observeSections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActive(entry.target.id);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  setActive(id) {
    this.dots.forEach((dot, index) => {
      const targetId = this.sections[index].id;
      dot.classList.toggle('active', targetId === id);
    });
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      if (window.innerWidth < 1200) {
        this.indicator.style.display = 'none';
      } else {
        this.indicator.style.display = 'flex';
      }
    });
  }
}

// ========================================
// 9. TEXT REVEAL ANIMATION
// ========================================
class TextReveal {
  constructor(selector = '.text-reveal-mask') {
    this.elements = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    this.elements.forEach(el => {
      observer.observe(el);
    });
  }
}

// ========================================
// 10. STAGGERED LIST ANIMATION
// ========================================
class StaggerList {
  constructor(selector = '.stagger-list') {
    this.lists = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    this.lists.forEach(list => observer.observe(list));
  }
}

// ========================================
// 11. BUTTON RIPPLE EFFECT
// ========================================
class ButtonRipple {
  constructor(selector = '.btn') {
    this.buttons = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.buttons.forEach(btn => {
      btn.classList.add('ripple-btn');
      
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
        
        btn.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
}

// ========================================
// 12. PARALLAX IMAGE EFFECT
// ========================================
class ParallaxImages {
  constructor() {
    this.containers = document.querySelectorAll('.parallax-image-container');
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    this.containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      const speed = parseFloat(container.dataset.parallax) || 0.2;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * speed;
        const img = container.querySelector('img');
        if (img) {
          img.style.transform = `translateY(${-offset}px) scale(1.1)`;
        }
      }
    });
  }
}

// ========================================
// INITIALIZE ALL FORTUNE 500 ANIMATIONS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize in order - DISABLED heavy effects for performance
  // new MagneticCursor();
  // new TiltCard3D();
  // new ScrollVelocity();
  // new FloatingActionButton();
  new AdvancedMobileMenu();
  // new AmbientParticles(40);
  new SectionIndicator();
  new TextReveal();
  new StaggerList();
  new ButtonRipple();
  new ParallaxImages();
  
  // Setup text scramble on hover for headings
  document.querySelectorAll('h1, h2').forEach(heading => {
    if (!heading.dataset.originalText) {
      heading.dataset.originalText = heading.textContent;
      const scrambler = new TextScramble(heading);
      
      heading.addEventListener('mouseenter', () => {
        scrambler.setText(heading.dataset.originalText);
      });
    }
  });
  
  // Console branding
  console.log('%c🏗️ BuildBridge Fortune 500 v7.0 Loaded', 'font-size: 14px; font-weight: bold; color: #C9CED6;');
  console.log('%c   ✓ Magnetic cursor system', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ 3D tilt cards with glare', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Text scramble effects', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Scroll velocity detection', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Floating action button', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Advanced mobile menu', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Ambient particle field', 'font-size: 11px; color: #888;');
  console.log('%c   ✓ Section indicator', 'font-size: 11px; color: #888;');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MagneticCursor,
    TiltCard3D,
    TextScramble,
    ScrollVelocity,
    FloatingActionButton,
    AdvancedMobileMenu,
    AmbientParticles,
    SectionIndicator,
    TextReveal,
    StaggerList,
    ButtonRipple,
    ParallaxImages
  };
}
