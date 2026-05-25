// BuildBridge - Main JavaScript
// Fortune 500 Interactive Features v2.0
// Enhanced with: Scroll Physics, Image Reveals, Marquee, Split Text, Page Transitions

// =========================================
// 1. LENIS SMOOTH SCROLL SIMULATION
// =========================================
class SmoothScroll {
  constructor() {
    this.current = 0;
    this.target = 0;
    this.ease = 0.075;
    this.velocity = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    // Don't apply to mobile/touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.bindScroll();
    this.animate();
  }
  
  bindScroll() {
    window.addEventListener('scroll', () => {
      this.target = window.scrollY;
      this.isScrolling = true;
      
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    }, { passive: true });
  }
  
  animate() {
    this.current += (this.target - this.current) * this.ease;
    this.velocity = this.target - this.current;
    
    // Dispatch velocity event for other effects
    if (Math.abs(this.velocity) > 0.1) {
      window.dispatchEvent(new CustomEvent('scrollvelocity', {
        detail: { velocity: this.velocity, direction: this.velocity > 0 ? 1 : -1 }
      }));
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize smooth scroll
const smoothScroll = new SmoothScroll();

// =========================================
// 2. SCROLL VELOCITY SKEW EFFECT
// =========================================
class VelocitySkew {
  constructor() {
    this.elements = [];
    this.maxSkew = 3;
    this.init();
  }
  
  init() {
    this.elements = document.querySelectorAll('.velocity-skew');
    if (!this.elements.length) return;
    
    window.addEventListener('scrollvelocity', (e) => {
      const skew = Math.max(-this.maxSkew, Math.min(this.maxSkew, e.detail.velocity * 0.02));
      this.elements.forEach(el => {
        el.style.transform = `skewY(${skew}deg)`;
      });
    });
  }
}

const velocitySkew = new VelocitySkew();

// =========================================
// 3. IMAGE REVEAL ANIMATION (Mask Effect)
// =========================================
class ImageReveal {
  constructor(element) {
    this.element = element;
    this.image = element.querySelector('img');
    this.direction = element.dataset.reveal || 'up';
    this.init();
  }
  
  init() {
    if (!this.image) return;
    
    // Wrap in container if not already
    if (!this.element.classList.contains('reveal-container')) {
      this.element.classList.add('reveal-container');
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = `reveal-overlay reveal-${this.direction}`;
    this.element.appendChild(overlay);
    
    // Observe for intersection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.reveal(overlay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(this.element);
  }
  
  reveal(overlay) {
    overlay.classList.add('revealed');
    this.element.classList.add('revealed');
  }
}

// =========================================
// 4. MARQUEE / TICKER ANIMATION
// =========================================
class Marquee {
  constructor(element) {
    this.element = element;
    this.speed = parseFloat(element.dataset.speed) || 50;
    this.direction = element.dataset.direction || 'left';
    this.pauseOnHover = element.dataset.pause !== 'false';
    this.items = [];
    this.position = 0;
    this.isPaused = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    const originalItems = Array.from(this.element.children);
    
    // Clone items to create seamless loop
    originalItems.forEach(item => {
      this.element.appendChild(item.cloneNode(true));
      this.element.appendChild(item.cloneNode(true));
    });
    
    if (this.pauseOnHover) {
      this.element.addEventListener('mouseenter', () => this.isPaused = true);
      this.element.addEventListener('mouseleave', () => this.isPaused = false);
    }
    
    this.animate();
  }
  
  animate() {
    if (!this.isPaused) {
      const directionMultiplier = this.direction === 'left' ? -1 : 1;
      this.position += (this.speed / 60) * directionMultiplier;
      
      const firstItem = this.element.children[0];
      const itemWidth = firstItem.offsetWidth + parseInt(getComputedStyle(firstItem).marginRight);
      
      if (Math.abs(this.position) >= itemWidth) {
        this.position = 0;
      }
      
      this.element.style.transform = `translateX(${this.position}px)`;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// =========================================
// 5. SPLIT TEXT ANIMATION
// =========================================
class SplitText {
  constructor(element, options = {}) {
    this.element = element;
    this.type = options.type || 'chars'; // chars, words, lines
    this.animation = options.animation || 'fadeUp';
    this.stagger = options.stagger || 0.03;
    this.delay = options.delay || 0;
    
    this.init();
  }
  
  init() {
    const text = this.element.textContent;
    this.element.innerHTML = '';
    this.element.style.opacity = '1';
    
    if (this.type === 'chars') {
      this.splitIntoChars(text);
    } else if (this.type === 'words') {
      this.splitIntoWords(text);
    }
    
    this.animate();
  }
  
  splitIntoChars(text) {
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(100%) rotateX(-80deg)';
      span.style.transformOrigin = 'center bottom';
      span.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${this.delay + (i * this.stagger)}s`;
      this.element.appendChild(span);
    });
  }
  
  splitIntoWords(text) {
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'split-word';
      span.textContent = word + ' ';
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      span.style.transition = `all 0.5s ease ${this.delay + (i * this.stagger)}s`;
      this.element.appendChild(span);
    });
  }
  
  animate() {
    setTimeout(() => {
      const elements = this.element.querySelectorAll('.split-char, .split-word');
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) rotateX(0)';
      });
    }, 100);
  }
}

// =========================================
// 6. SMOOTH PAGE TRANSITIONS
// =========================================
class PageTransitions {
  constructor() {
    this.transitionElement = null;
    this.isTransitioning = false;
    this.init();
  }
  
  init() {
    this.createTransitionElement();
    this.bindLinks();
    this.animatePageIn();
  }
  
  createTransitionElement() {
    this.transitionElement = document.createElement('div');
    this.transitionElement.className = 'page-transition';
    document.body.appendChild(this.transitionElement);
  }
  
  bindLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      
      // Only internal links
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel')) {
        link.addEventListener('click', (e) => {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.transitionTo(href);
          }
        });
      }
    });
  }
  
  transitionTo(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    this.transitionElement.classList.add('active');
    
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  }
  
  animatePageIn() {
    this.transitionElement.classList.add('exiting');
    setTimeout(() => {
      this.transitionElement.classList.remove('active', 'exiting');
    }, 600);
  }
}

// =========================================
// 7. GRADIENT TEXT ANIMATION
// =========================================
class GradientText {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.element.classList.add('gradient-text-animated');
  }
}

// =========================================
// 8. ENHANCED COUNTER WITH EASING
// =========================================
class EnhancedCounter {
  constructor(element) {
    this.element = element;
    this.target = parseInt(element.dataset.target);
    this.duration = parseInt(element.dataset.duration) || 2000;
    this.prefix = element.dataset.prefix || '';
    this.suffix = element.dataset.suffix || '';
    this.startTime = null;
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.start();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(this.element);
  }
  
  start() {
    this.startTime = performance.now();
    this.animate();
  }
  
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
  
  animate() {
    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const eased = this.easeOutQuart(progress);
    const current = Math.floor(eased * this.target);
    
    this.element.textContent = this.prefix + current + this.suffix;
    
    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.element.textContent = this.prefix + this.target + this.suffix;
    }
  }
}

// =========================================
// 9. HORIZONTAL SCROLL SECTION
// =========================================
class HorizontalScroll {
  constructor(element) {
    this.element = element;
    this.track = element.querySelector('.horizontal-track');
    this.items = element.querySelectorAll('.horizontal-item');
    this.progress = 0;
    
    this.init();
  }
  
  init() {
    if (!this.track || !this.items.length) return;
    
    // Calculate total scroll distance
    const totalWidth = this.track.scrollWidth - window.innerWidth;
    
    window.addEventListener('scroll', () => {
      const rect = this.element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      if (elementTop <= 0 && elementTop > -elementHeight + window.innerHeight) {
        const scrollProgress = Math.abs(elementTop) / (elementHeight - window.innerHeight);
        const translateX = scrollProgress * totalWidth;
        this.track.style.transform = `translateX(-${translateX}px)`;
      }
    }, { passive: true });
  }
}

// =========================================
// 10. MAGNETIC ELEMENTS (Enhanced)
// =========================================
class MagneticElement {
  constructor(element, options = {}) {
    this.element = element;
    this.strength = options.strength || 0.3;
    this.radius = options.radius || 100;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    document.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < this.radius) {
        const factor = 1 - distance / this.radius;
        this.element.style.transform = `translate(${distX * this.strength * factor}px, ${distY * this.strength * factor}px)`;
      } else {
        this.element.style.transform = '';
      }
    });
  }
}

// =========================================
// 11. AUDIO VISUALIZER EFFECT (Visual only)
// =========================================
class AudioBars {
  constructor(element) {
    this.element = element;
    this.bars = [];
    this.barCount = parseInt(element.dataset.bars) || 20;
    this.init();
  }
  
  init() {
    this.element.classList.add('audio-bars-container');
    
    for (let i = 0; i < this.barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'audio-bar';
      bar.style.height = '20%';
      bar.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      bar.style.animationDelay = `${Math.random() * 0.5}s`;
      this.element.appendChild(bar);
      this.bars.push(bar);
    }
  }
}

// =========================================
// ORIGINAL FEATURES (Preserved & Enhanced)
// =========================================

// Preloader
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
  
  // Animate elements on page load
  document.querySelectorAll('.animate-on-load').forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animated');
    }, index * 100);
  });
});

// Mobile menu toggle with animation
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  navLinks.classList.toggle('active');
  menuBtn.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    navLinks.classList.remove('active');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  // Back to top button visibility
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Scroll-triggered animations (Intersection Observer)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
      fadeInObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
  fadeInObserver.observe(el);
});

// Counter animation for stats
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        
        updateCounter();
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats-grid, .stats-section').forEach(section => {
  counterObserver.observe(section);
});

// Project Filter System
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.classList.remove('filtered-out');
            card.classList.add('filtered-in');
          }, 10);
        } else {
          card.classList.add('filtered-out');
          card.classList.remove('filtered-in');
          setTimeout(() => {
            card.style.display = 'none';
          }, 400);
        }
      });
    });
  });
}

// Initialize project filters if they exist
if (document.querySelector('.filter-btn')) {
  initProjectFilters();
}

// Lightbox Gallery
class Lightbox {
  constructor() {
    this.lightbox = null;
    this.currentIndex = 0;
    this.images = [];
    this.init();
  }
  
  init() {
    // Create lightbox element
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox';
    this.lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-nav lightbox-prev">&#8249;</button>
        <button class="lightbox-nav lightbox-next">&#8250;</button>
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(this.lightbox);
    
    // Bind events
    this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
    this.lightbox.querySelector('.lightbox-backdrop').addEventListener('click', () => this.close());
    this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
    this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    this.lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
    this.lightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
    });
  }
  
  open(images, index) {
    this.images = images;
    this.currentIndex = index;
    this.updateImage();
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }
  
  updateImage() {
    const img = this.images[this.currentIndex];
    const imageEl = this.lightbox.querySelector('.lightbox-image');
    const captionEl = this.lightbox.querySelector('.lightbox-caption');
    
    imageEl.style.opacity = '0';
    setTimeout(() => {
      imageEl.src = img.src;
      captionEl.textContent = img.caption || '';
      imageEl.style.opacity = '1';
    }, 200);
  }
}

// Initialize lightbox for project galleries
const lightbox = new Lightbox();

document.querySelectorAll('.projects-grid, .gallery-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.project-card, .gallery-item');
  const images = Array.from(cards).map(card => ({
    src: card.querySelector('img').src,
    caption: card.querySelector('h3')?.textContent || ''
  }));
  
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      lightbox.open(images, index);
    });
    card.style.cursor = 'pointer';
  });
});

// Testimonial Slider
class TestimonialSlider {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll('.testimonial-card');
    this.currentSlide = 0;
    this.touchStartX = 0;
    this.init();
  }
  
  init() {
    if (this.slides.length <= 1) return;
    
    // Create navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);
    });
    this.container.appendChild(dotsContainer);
    
    // Touch events
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    });
    
    this.container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = this.touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
    });
    
    // Auto-advance
    setInterval(() => this.next(), 6000);
  }
  
  goToSlide(index) {
    this.slides[this.currentSlide].classList.remove('active');
    this.container.querySelectorAll('.slider-dot')[this.currentSlide].classList.remove('active');
    
    this.currentSlide = index;
    
    this.slides[this.currentSlide].classList.add('active');
    this.container.querySelectorAll('.slider-dot')[this.currentSlide].classList.add('active');
  }
  
  next() {
    this.goToSlide((this.currentSlide + 1) % this.slides.length);
  }
  
  prev() {
    this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
  }
}

// Initialize testimonial sliders
document.querySelectorAll('.testimonial-slider').forEach(slider => {
  new TestimonialSlider(slider);
});

// Form validation and handling
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Validate
  let isValid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      setTimeout(() => field.classList.remove('error'), 3000);
    }
  });
  
  if (!isValid) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Simulate submission
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  setTimeout(() => {
    form.style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    showToast('Message sent successfully!', 'success');
    
    // Reset after delay
    setTimeout(() => {
      form.reset();
      form.style.display = 'block';
      document.getElementById('formSuccess').style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 5000);
  }, 1500);
}

// Toast notification system
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Parallax effect for hero
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.parallax');
  
  parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-speed') || 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Lazy loading for images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Magnetic button effect for desktop
if (!window.matchMedia('(pointer: coarse)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Text scramble effect for headings
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
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
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Initialize scramble on hero heading
const heroHeading = document.querySelector('.hero-copy h1');
if (heroHeading) {
  const fx = new TextScramble(heroHeading);
  const originalText = heroHeading.textContent;
  
  // Trigger on load
  setTimeout(() => {
    fx.setText(originalText);
  }, 500);
}

// Typewriter Effect for Eyebrow
class Typewriter {
  constructor(element, text, speed = 100) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.index = 0;
    this.type();
  }
  
  type() {
    if (this.index < this.text.length) {
      this.element.textContent += this.text.charAt(this.index);
      this.index++;
      setTimeout(() => this.type(), this.speed);
    }
  }
}

// Initialize typewriter on eyebrow
const eyebrow = document.querySelector('.hero-copy .eyebrow');
if (eyebrow) {
  const eyebrowText = eyebrow.textContent;
  eyebrow.textContent = '';
  setTimeout(() => {
    new Typewriter(eyebrow, eyebrowText, 80);
  }, 300);
}

// 3D Tilt Effect for Cards
class Tilt3D {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  }
}

// Apply 3D tilt to cards
document.querySelectorAll('.service-card, .project-card, .testimonial-card').forEach(card => {
  card.style.transition = 'transform 0.3s ease';
  new Tilt3D(card);
});

// Particle Background System
class ParticleSystem {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = window.matchMedia('(pointer: coarse)').matches ? 15 : 30;
    this.init();
  }
  
  init() {
    this.canvas.id = 'particle-canvas';
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.4;';
    document.body.prepend(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    for (let i = 0; i < this.maxParticles; i++) {
      this.addParticle();
    }
    
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  addParticle() {
    this.particles.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(201, 206, 214, ${p.opacity})`;
      this.ctx.fill();
      
      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(201, 206, 214, ${0.1 * (1 - dist / 100)})`;
          this.ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particles
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(pointer: coarse)').matches) {
    new ParticleSystem();
  }
});

// Reading Progress Bar
const progressBar = document.createElement('div');
progressBar.className = 'reading-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + '%';
});

// Custom Cursor with Trail (Desktop only)
if (!window.matchMedia('(pointer: coarse)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  const cursorTrail = [];
  for (let i = 0; i < 5; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.opacity = (i + 1) * 0.15;
    document.body.appendChild(trail);
    cursorTrail.push(trail);
  }
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    cursorTrail.forEach((trail, i) => {
      const delay = (i + 1) * 0.08;
      const x = cursorX + (mouseX - cursorX) * delay;
      const y = cursorY + (mouseY - cursorY) * delay;
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
    });
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  // Hover effects on interactive elements
  document.querySelectorAll('a, button, .project-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// =========================================
// INITIALIZE ALL NEW FEATURES
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // Image Reveals
  document.querySelectorAll('[data-reveal]').forEach(el => new ImageReveal(el));
  
  // Marquees
  document.querySelectorAll('.marquee-track').forEach(el => new Marquee(el));
  
  // Split Text (Hero heading)
  const heroHeading = document.querySelector('.split-heading');
  if (heroHeading) {
    new SplitText(heroHeading, { type: 'chars', stagger: 0.02, delay: 0.5 });
  }
  
  // Page Transitions
  const pageTransitions = new PageTransitions();
  
  // Gradient Text
  document.querySelectorAll('.gradient-text').forEach(el => new GradientText(el));
  
  // Enhanced Counters
  document.querySelectorAll('.enhanced-counter').forEach(el => new EnhancedCounter(el));
  
  // Horizontal Scroll
  document.querySelectorAll('.horizontal-scroll').forEach(el => new HorizontalScroll(el));
  
  // Magnetic Elements
  document.querySelectorAll('.magnetic-el').forEach(el => new MagneticElement(el, { strength: 0.4 }));
  
  // Audio Bars
  document.querySelectorAll('.audio-bars').forEach(el => new AudioBars(el));
  
  // Velocity Skew elements
  document.querySelectorAll('h2, h3').forEach(el => el.classList.add('velocity-skew'));
});

// Console easter egg
console.log('%c🏗️ BuildBridge', 'font-size: 40px; font-weight: bold; color: #C9CED6; text-shadow: 0 0 20px rgba(201,206,214,0.3);');
console.log('%cFortune 500 Construction Management System v2.0', 'font-size: 14px; color: #525862;');
console.log('%cFeatures: Smooth Scroll | Image Reveals | Marquee | Split Text | Page Transitions', 'font-size: 11px; color: #3B82F6; font-style: italic;');
console.log('%cConnecting Clients. Delivering Projects. Building Trust.', 'font-size: 12px; color: #525862;');
console.log('%c💬 WhatsApp: +27 66 120 0064', 'font-size: 14px; color: #25D366; font-weight: bold;');
