/**
 * BuildBridge Advanced Animations v6.3
 * GSAP-style smooth scroll and section reveals
 */

// ========================================
// 1. SMOOTH SCROLL CONTROLLER
// ========================================
class SmoothScrollController {
  constructor(options = {}) {
    this.container = options.container || document.documentElement;
    this.ease = options.ease || 0.1;
    this.currentY = window.scrollY;
    this.targetY = window.scrollY;
    this.isScrolling = false;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    // Only enable on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    window.addEventListener('scroll', () => this.onNativeScroll(), { passive: true });
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => this.onAnchorClick(e, link));
    });
  }
  
  onWheel(e) {
    e.preventDefault();
    this.targetY += e.deltaY;
    this.clampTarget();
  }
  
  onNativeScroll() {
    this.targetY = window.scrollY;
    this.currentY = window.scrollY;
  }
  
  onAnchorClick(e, link) {
    const href = link.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      this.targetY = target.offsetTop - offset;
      this.clampTarget();
    }
  }
  
  clampTarget() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.targetY = Math.max(0, Math.min(this.targetY, maxScroll));
  }
  
  animate() {
    const diff = this.targetY - this.currentY;
    
    if (Math.abs(diff) > 0.5) {
      this.currentY += diff * this.ease;
      window.scrollTo(0, this.currentY);
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 2. SECTION REVEAL ANIMATIONS
// ========================================
class SectionReveal {
  constructor() {
    this.sections = document.querySelectorAll('section:not(.hero)');
    this.revealedSections = new Set();
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.revealedSections.has(entry.target)) {
          this.revealSection(entry.target);
          this.revealedSections.add(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    });
    
    this.sections.forEach(section => {
      this.prepareSection(section);
      observer.observe(section);
    });
  }
  
  prepareSection(section) {
    const content = section.querySelectorAll('.section-header, h1, h2, h3, p, .btn, .service-card, .project-card, .stat-item, .timeline-item');
    content.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, 
                             transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`;
    });
  }
  
  revealSection(section) {
    section.classList.add('section-revealed');
    
    const content = section.querySelectorAll('.section-header, h1, h2, h3, p, .btn, .service-card, .project-card, .stat-item, .timeline-item');
    content.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    
    // Add special animation for section
    this.addEntranceAnimation(section);
  }
  
  addEntranceAnimation(section) {
    const id = section.getAttribute('id');
    
    switch(id) {
      case 'trust':
        this.animateTrust(section);
        break;
      case 'stats':
        this.animateStats(section);
        break;
      case 'services':
        this.animateServices(section);
        break;
      case 'projects':
        this.animateProjects(section);
        break;
      case 'testimonials':
        this.animateTestimonials(section);
        break;
      case 'process':
        this.animateProcess(section);
        break;
      case 'faq':
        this.animateFAQ(section);
        break;
    }
  }
  
  animateTrust(section) {
    const items = section.querySelectorAll(':scope > div');
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      item.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, 100);
    });
  }
  
  animateStats(section) {
    const items = section.querySelectorAll('.stat-item');
    items.forEach((item, i) => {
      const number = item.querySelector('.number');
      if (number) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`;
        
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
          
          // Trigger counter animation
          const event = new CustomEvent('animateCounter', { detail: number });
          window.dispatchEvent(event);
        }, 100);
      }
    });
  }
  
  animateServices(section) {
    const cards = section.querySelectorAll('.service-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px) rotateX(10deg)';
      card.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) rotateX(0)';
      }, 100);
    });
  }
  
  animateProjects(section) {
    const cards = section.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = `translateX(${i % 2 === 0 ? '-50px' : '50px'})`;
      card.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`;
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }, 100);
    });
  }
  
  animateTestimonials(section) {
    const cards = section.querySelectorAll('.testimonial-carousel-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateZ(-100px)';
      card.style.transition = `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1) translateZ(0)';
      }, 100);
    });
  }
  
  animateProcess(section) {
    const line = section.querySelector('.timeline-progress');
    const items = section.querySelectorAll('.timeline-item');
    
    if (line) {
      line.style.transform = 'scaleY(0)';
      line.style.transformOrigin = 'top';
      line.style.transition = 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
      
      setTimeout(() => {
        line.style.transform = 'scaleY(1)';
      }, 200);
    }
    
    items.forEach((item, i) => {
      const isLeft = i % 2 === 0;
      item.style.opacity = '0';
      item.style.transform = `translateX(${isLeft ? '-80px' : '80px'})`;
      item.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.2}s`;
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 100);
    });
  }
  
  animateFAQ(section) {
    const items = section.querySelectorAll('.faq-item');
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = `translateX(${i % 2 === 0 ? '-30px' : '30px'})`;
      item.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`;
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 100);
    });
  }
}

// ========================================
// 3. HERO ENTRANCE ANIMATION
// ========================================
class HeroEntrance {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.init();
  }
  
  init() {
    if (!this.hero) return;
    
    const eyebrow = this.hero.querySelector('.eyebrow');
    const heading = this.hero.querySelector('h1');
    const paragraphs = this.hero.querySelectorAll('p');
    const buttons = this.hero.querySelectorAll('.btn');
    const image = this.hero.querySelector('.hero-visual');
    
    // Set initial states
    [eyebrow, heading, ...paragraphs, ...buttons, image].forEach(el => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
      }
    });
    
    // Animate in sequence
    const elements = [
      { el: eyebrow, delay: 300 },
      { el: heading, delay: 500 },
      { el: paragraphs[0], delay: 700 },
      { el: buttons[0], delay: 900 },
      { el: buttons[1], delay: 1000 },
      { el: image, delay: 400 }
    ];
    
    elements.forEach(({ el, delay }) => {
      if (el) {
        setTimeout(() => {
          el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      }
    });
  }
}

// ========================================
// 4. MORPHING ORBS BACKGROUND
// ========================================
class MorphingOrbs {
  constructor() {
    this.container = document.body;
    this.orbs = [];
    this.init();
  }
  
  init() {
    // Remove existing orbs
    document.querySelectorAll('.morphing-blob').forEach(orb => orb.remove());
    
    // Create new morphing orbs
    const colors = [
      'rgba(201, 206, 214, 0.08)',
      'rgba(168, 173, 181, 0.06)',
      'rgba(140, 145, 153, 0.05)'
    ];
    
    for (let i = 0; i < 3; i++) {
      const orb = document.createElement('div');
      orb.className = 'morphing-blob';
      orb.style.cssText = `
        position: fixed;
        width: ${400 + i * 150}px;
        height: ${400 + i * 150}px;
        background: ${colors[i]};
        filter: blur(60px);
        z-index: 0;
        pointer-events: none;
        animation: morph-blob ${15 + i * 5}s ease-in-out infinite;
        animation-delay: ${-i * 5}s;
      `;
      
      // Random initial position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      orb.style.left = x + 'px';
      orb.style.top = y + 'px';
      
      this.container.appendChild(orb);
      this.orbs.push(orb);
    }
    
    // Animate positions
    this.animate();  }
  
  animate() {
    this.orbs.forEach((orb, i) => {
      const time = Date.now() * 0.0001 * (i + 1);
      const x = (Math.sin(time) * 0.4 + 0.5) * window.innerWidth * 0.8;
      const y = (Math.cos(time * 0.7) * 0.4 + 0.5) * window.innerHeight * 0.8;
      
      orb.style.left = x + 'px';
      orb.style.top = y + 'px';
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 5. SCROLL TRIGGERED PARALLAX
// ========================================
class ScrollParallax {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    const scrollY = window.scrollY;
    
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const yPos = scrollY * speed;
      el.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// ========================================
// 6. CURSOR FOLLOWER ELEMENTS
// ========================================
class CursorFollower {
  constructor(selector) {
    this.elements = document.querySelectorAll(selector);
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.init();
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });
    
    this.elements.forEach(el => this.attachToElement(el));
  }
  
  attachToElement(el) {
    let currentX = 0;
    let currentY = 0;
    
    const animate = () => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = this.mouseX - centerX;
      const distY = this.mouseY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < 300) {
        const strength = (300 - distance) / 300 * 0.3;
        currentX += (distX * strength - currentX) * 0.1;
        currentY += (distY * strength - currentY) * 0.1;
        
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      } else {
        currentX *= 0.9;
        currentY *= 0.9;
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}

// ========================================
// 7. CONFETTI EFFECT
// ========================================
class ConfettiEffect {
  constructor() {
    this.colors = ['#C9CED6', '#ffffff', '#a8adb5', '#8c9199'];
  }
  
  trigger(x, y, amount = 30) {
    for (let i = 0; i < amount; i++) {
      this.createParticle(x, y);
    }
  }
  
  createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${this.colors[Math.floor(Math.random() * this.colors.length)]};
      left: ${x}px;
      top: ${y}px;
      z-index: 99999;
      pointer-events: none;
      border-radius: 2px;
    `;
    
    document.body.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    let posX = 0;
    let posY = 0;
    let rotation = Math.random() * 360;
    let opacity = 1;
    
    const animate = () => {
      posX += Math.cos(angle) * velocity * 0.02;
      posY += Math.sin(angle) * velocity * 0.02 + 2;
      rotation += 10;
      opacity -= 0.02;
      
      particle.style.transform = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    animate();
  }
}

// ========================================
// 8. TYPEWRITER 2.0
// ========================================
class TypewriterV2 {
  constructor(element, options = {}) {
    this.element = element;
    this.text = options.text || element.textContent;
    this.speed = options.speed || 50;
    this.delay = options.delay || 0;
    this.cursor = options.cursor !== false;
    this.onComplete = options.onComplete || (() => {});
    
    this.element.textContent = '';
    if (this.cursor) {
      this.element.classList.add('typewriter-cursor');
    }
    
    setTimeout(() => this.type(), this.delay);
  }
  
  type() {
    let i = 0;
    
    const typeChar = () => {
      if (i < this.text.length) {
        this.element.textContent += this.text.charAt(i);
        i++;
        setTimeout(typeChar, this.speed);
      } else {
        this.element.classList.remove('typewriter-cursor');
        this.onComplete();
      }
    };
    
    typeChar();
  }
}

// ========================================
// 9. ENHANCED COUNTERS
// ========================================
class EnhancedCounter {
  constructor(element) {
    this.element = element;
    this.target = parseInt(element.dataset.target) || 0;
    this.prefix = element.dataset.prefix || '';
    this.suffix = element.dataset.suffix || '';
    this.duration = 2000;
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(this.element);
  }
  
  animate() {
    const startTime = performance.now();
    
    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Ease out expo
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(this.target * easeProgress);
      
      // Number scramble effect during animation
      if (progress < 0.9) {
        const scramble = Math.floor(Math.random() * 10);
        this.element.textContent = this.prefix + currentValue + scramble + this.suffix;
      } else {
        this.element.textContent = this.prefix + currentValue + this.suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.element.textContent = this.prefix + this.target + this.suffix;
        this.element.classList.add('counter-complete');
      }
    };
    
    requestAnimationFrame(tick);
  }
}

// ========================================
// INITIALIZE ALL ADVANCED ANIMATIONS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Section reveals
  new SectionReveal();
  
  // Hero entrance
  new HeroEntrance();
  
  // Morphing orbs
  new MorphingOrbs();
  
  // Parallax
  new ScrollParallax();
  
  // Cursor follower for special elements
  new CursorFollower('.floating-stats');
  
  // Enhanced counters
  document.querySelectorAll('.enhanced-counter').forEach(counter => {
    new EnhancedCounter(counter);
  });
  
  // Confetti on CTA clicks
  const confetti = new ConfettiEffect();
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      confetti.trigger(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    });
  });
  
  // Listen for counter animation events
  window.addEventListener('animateCounter', (e) => {
    new EnhancedCounter(e.detail);
  });
  
  console.log('%c✨ Advanced Animations v6.3 Loaded', 'font-size: 11px; color: #C9CED6;');
  console.log('%c   • GSAP-style section reveals', 'font-size: 10px; color: #888;');
  console.log('%c   • Hero entrance sequence', 'font-size: 10px; color: #888;');
  console.log('%c   • Morphing background orbs', 'font-size: 10px; color: #888;');
  console.log('%c   • Scroll parallax effects', 'font-size: 10px; color: #888;');
  console.log('%c   • Cursor follower elements', 'font-size: 10px; color: #888;');
  console.log('%c   • Confetti on interactions', 'font-size: 10px; color: #888;');
  console.log('%c   • Enhanced number counters', 'font-size: 10px; color: #888;');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SmoothScrollController,
    SectionReveal,
    HeroEntrance,
    MorphingOrbs,
    ScrollParallax,
    CursorFollower,
    ConfettiEffect,
    TypewriterV2,
    EnhancedCounter
  };
}
