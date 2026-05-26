// BuildBridge - Main JavaScript
// Fortune 500 Interactive Features v4.0
// Enhanced with: Scroll Physics, Image Reveals, Marquee, Split Text, Page Transitions
// NEW v4.0: Animated Counters, Typewriter Effect, Magnetic Buttons, Timeline, 3D Carousel

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

// Preloader - hide on load OR timeout fallback
(function() {
  let preloaderHidden = false;
  const MAX_PRELOADER_WAIT = 5000; // Max 5 seconds
  
  function hidePreloader() {
    if (preloaderHidden) return;
    preloaderHidden = true;
    
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
  }
  
  // Hide on window load
  window.addEventListener('load', hidePreloader);
  
  // Fallback: force hide after timeout in case resources hang
  setTimeout(hidePreloader, MAX_PRELOADER_WAIT);
})();

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

// =========================================
// FORTUNE 500 ENHANCEMENTS v3.0
// Advanced Interactive Features
// =========================================

// (Using existing TextScramble from v1)

// =========================================
// 2. ADVANCED 3D TILT WITH GLARE
// =========================================
class AdvancedTiltCard {
  constructor(element, options = {}) {
    this.element = element;
    this.maxRotation = options.maxRotation || 12;
    this.glare = options.glare !== false;
    this.shine = options.shine !== false;
    
    this.init();
  }
  
  init() {
    this.element.classList.add('tilt-card-advanced');
    
    // Add glare effect
    if (this.glare) {
      const glare = document.createElement('div');
      glare.className = 'glare-effect';
      this.element.appendChild(glare);
    }
    
    // Add shine effect
    if (this.shine) {
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      this.element.appendChild(shine);
    }
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    this.element.addEventListener('mouseenter', () => this.onMouseEnter());
  }
  
  onMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -this.maxRotation;
    const rotateY = ((x - centerX) / centerX) * this.maxRotation;
    
    this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Update shine position
    const shine = this.element.querySelector('.card-shine');
    if (shine) {
      const mouseX = (x / rect.width) * 100;
      const mouseY = (y / rect.height) * 100;
      shine.style.setProperty('--mouse-x', `${mouseX}%`);
      shine.style.setProperty('--mouse-y', `${mouseY}%`);
    }
  }
  
  onMouseLeave() {
    this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
  
  onMouseEnter() {
    this.element.style.transition = 'none';
  }
}

// =========================================
// 3. ADVANCED CUSTOM CURSOR
// =========================================
class CustomCursor {
  constructor(options = {}) {
    this.dot = null;
    this.ring = null;
    this.cursorX = 0;
    this.cursorY = 0;
    this.dotX = 0;
    this.dotY = 0;
    this.ringX = 0;
    this.ringY = 0;
    this.dotSpeed = options.dotSpeed || 1;
    this.ringSpeed = options.ringSpeed || 0.15;
    this.isActive = false;
    this.clickCooldown = false;
    
    this.init();
  }
  
  init() {
    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.createElements();
    this.bindEvents();
    this.animate();
    
    document.body.classList.add('cursor-enabled');
    this.isActive = true;
  }
  
  createElements() {
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    document.body.appendChild(this.dot);
    
    this.ring = document.createElement('div');
    this.ring.className = 'cursor-ring';
    document.body.appendChild(this.ring);
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.cursorX = e.clientX;
      this.cursorY = e.clientY;
    });
    
    document.addEventListener('mousedown', () => {
      this.dot.classList.add('click');
      this.ring.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
      this.dot.classList.remove('click');
      this.ring.classList.remove('click');
    });
    
    // Hover detection for links and buttons
    const hoverElements = document.querySelectorAll('a, button, .magnetic-el, .btn');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('hover');
        this.ring.classList.add('hover');
      });
      
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('hover');
        this.ring.classList.remove('hover');
      });
    });
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Dot follows cursor directly
    this.dotX += (this.cursorX - this.dotX) * this.dotSpeed;
    this.dotY += (this.cursorY - this.dotY) * this.dotSpeed;
    
    // Ring follows with lag
    this.ringX += (this.cursorX - this.ringX) * this.ringSpeed;
    this.ringY += (this.cursorY - this.ringY) * this.ringSpeed;
    
    this.dot.style.left = `${this.dotX}px`;
    this.dot.style.top = `${this.dotY}px`;
    this.ring.style.left = `${this.ringX}px`;
    this.ring.style.top = `${this.ringY}px`;
    
    requestAnimationFrame(() => this.animate());
  }
}

// =========================================
// 4. PARALLAX DEPTH LAYERS
// =========================================
class ParallaxLayers {
  constructor() {
    this.layers = [];
    this.scrollY = 0;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    // Find all parallax layers
    document.querySelectorAll('.parallax-layer').forEach(el => {
      const speed = parseFloat(getComputedStyle(el).getPropertyValue('--parallax-speed')) || 0.5;
      this.layers.push({ element: el, speed });
    });
    
    if (this.layers.length) {
      this.bindEvents();
    }
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => this.update());
      }
    }, { passive: true });
  }
  
  update() {
    this.layers.forEach(layer => {
      const yPos = this.scrollY * layer.speed * -1;
      layer.element.style.transform = `translateY(${yPos}px)`;
    });
    
    this.rafId = null;
  }
}

// =========================================
// 5. PARTICLES NETWORK
// =========================================
class ParticlesNetwork {
  constructor(container, options = {}) {
    this.container = container || document.body;
    this.particleCount = options.particleCount || 20;
    this.connectionDistance = options.connectionDistance || 150;
    this.mouseDistance = options.mouseDistance || 200;
    this.particles = [];
    this.connections = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createContainer() {
    if (!this.container.querySelector('.particles-network')) {
      const network = document.createElement('div');
      network.className = 'particles-network';
      network.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      `;
      this.container.appendChild(network);
      this.networkContainer = network;
    } else {
      this.networkContainer = this.container.querySelector('.particles-network');
    }
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-node';
      
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      
      this.networkContainer.appendChild(particle);
      
      this.particles.push({
        element: particle,
        x, y, vx, vy,
        originX: x,
        originY: y
      });
    }
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }
  
  animate() {
    this.particles.forEach(particle => {
      // Return to original position with slight movement
      const dx = particle.originX - particle.x;
      const dy = particle.originY - particle.y;
      
      particle.vx += dx * 0.0005;
      particle.vy += dy * 0.0005;
      
      // Mouse repulsion
      const mouseDx = particle.x - this.mouseX;
      const mouseDy = particle.y - this.mouseY;
      const distance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      
      if (distance < this.mouseDistance) {
        const force = (this.mouseDistance - distance) / this.mouseDistance;
        particle.vx += (mouseDx / distance) * force * 2;
        particle.vy += (mouseDy / distance) * force * 2;
      }
      
      // Apply velocity with damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// =========================================
// 6. KINETIC TYPOGRAPHY
// =========================================
class KineticTypography {
  constructor(element, options = {}) {
    this.element = element;
    this.stagger = options.stagger || 0.03;
    
    this.init();
  }
  
  init() {
    this.element.classList.add('kinetic-heading');
    const text = this.element.textContent;
    this.element.innerHTML = '';
    
    const words = text.split(' ');
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      
      word.split('').forEach((char, charIndex) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        charSpan.style.transitionDelay = `${(wordIndex * word.length + charIndex) * this.stagger}s`;
        wordSpan.appendChild(charSpan);
      });
      
      this.element.appendChild(wordSpan);
      
      // Add space
      if (wordIndex < words.length - 1) {
        this.element.appendChild(document.createTextNode(' '));
      }
    });
    
    // Trigger animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.element.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(this.element);
  }
}

// =========================================
// 7. SCROLL REVEAL SECTIONS
// =========================================
class ScrollReveal {
  constructor(elements, options = {}) {
    this.elements = elements;
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '0px';
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    });
    
    this.elements.forEach(el => observer.observe(el));
  }
}

// =========================================
// 8. RIPPLE EFFECT
// =========================================
class RippleEffect {
  constructor(elements) {
    this.elements = elements || document.querySelectorAll('.ripple-container, .btn, .service-card');
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      el.classList.add('ripple-container');
      el.addEventListener('click', (e) => this.createRipple(e, el));
    });
  }
  
  createRipple(e, element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}

// =========================================
// 9. STAGGERED LIST REVEAL
// =========================================
class StaggeredListReveal {
  constructor(lists, options = {}) {
    this.lists = lists;
    this.itemDelay = options.itemDelay || 100;
    
    this.init();
  }
  
  init() {
    this.lists.forEach(list => {
      const items = list.querySelectorAll('li, .stagger-list-item');
      
      items.forEach((item, index) => {
        item.classList.add('stagger-list-item');
        item.style.transitionDelay = `${index * this.itemDelay}ms`;
      });
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            items.forEach(item => item.classList.add('visible'));
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(list);
    });
  }
}

// =========================================
// 10. SMOOTH PAGE TRANSITIONS
// =========================================
class SmoothPageTransition {
  constructor() {
    this.overlay = null;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.bindEvents();
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    this.overlay.innerHTML = `
      <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="page-transition-logo">
    `;
    document.body.appendChild(this.overlay);
  }
  
  bindEvents() {
    document.querySelectorAll('a[href^="."], a[href^="/"], a[href^="index"], a[href^="about"], a[href^="services"], a[href^="projects"], a[href^="contact"]').forEach(link => {
      // Skip external links
      if (link.getAttribute('href').startsWith('http')) return;
      
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          e.preventDefault();
          this.transition(href);
        }
      });
    });
  }
  
  transition(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    this.overlay.classList.add('active');
    
    setTimeout(() => {
      window.location.href = url;
    }, 600);
  }
}

// =========================================
// FORTUNE 500 v5.0 - PROFESSIONAL FEATURES
// Advanced Interactive Systems
// =========================================

// 1. TOAST NOTIFICATION SYSTEM
class ToastNotification {
  constructor() {
    this.container = this.createContainer();
    this.toasts = [];
  }
  
  createContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  show(message, options = {}) {
    const {
      title = '',
      type = 'info',
      duration = 5000,
      icon = this.getIcon(type)
    } = options;
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
      <div class="toast-progress"></div>
    `;
    
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto remove
    const timeout = setTimeout(() => {
      this.hide(toast);
    }, duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeout);
      this.hide(toast);
    });
    
    return toast;
  }
  
  hide(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 500);
  }
  
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
  
  // Convenience methods
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success', icon: '✓' });
  }
  
  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', icon: '✕' });
  }
  
  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning', icon: '⚠' });
  }
  
  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info', icon: 'ℹ' });
  }
}

// Global toast instance
const toast = new ToastNotification();

// 2. SCROLL NAVIGATION WITH PROGRESS
class ScrollNavigation {
  constructor() {
    this.sections = [];
    this.navItems = [];
    this.currentSection = 0;
    this.init();
  }
  
  init() {
    this.findSections();
    this.createNavigation();
    this.bindEvents();
    this.updateActiveSection();
  }
  
  findSections() {
    // Find all major sections
    this.sections = Array.from(document.querySelectorAll('section[id], .section')).map(section => ({
      element: section,
      id: section.id || section.className.split(' ')[0],
      label: section.dataset.navLabel || this.formatLabel(section.id || section.className.split(' ')[0])
    })).filter(s => s.element);
  }
  
  formatLabel(id) {
    return id.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  createNavigation() {
    // Remove existing
    const existing = document.querySelector('.scroll-nav');
    if (existing) existing.remove();
    
    const nav = document.createElement('nav');
    nav.className = 'scroll-nav';
    nav.innerHTML = '<div class="scroll-nav-progress"><div class="scroll-nav-progress-bar"></div></div>';
    
    this.sections.forEach((section, index) => {
      const item = document.createElement('div');
      item.className = 'scroll-nav-item';
      item.dataset.index = index;
      item.dataset.label = section.label;
      item.addEventListener('click', () => this.scrollToSection(index));
      nav.appendChild(item);
      this.navItems.push(item);
    });
    
    document.body.appendChild(nav);
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      this.updateActiveSection();
      this.updateProgress();
    }, { passive: true });
  }
  
  updateActiveSection() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;
      
      if (scrollPos >= top && scrollPos < bottom) {
        this.navItems.forEach((item, i) => {
          item.classList.toggle('active', i === index);
        });
        this.currentSection = index;
      }
    });
  }
  
  updateProgress() {
    const progressBar = document.querySelector('.scroll-nav-progress-bar');
    if (!progressBar) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.height = `${progress}%`;
  }
  
  scrollToSection(index) {
    const section = this.sections[index];
    if (section) {
      section.element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// 3. SLOT MACHINE COUNTER
class SlotMachineCounter {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseInt(element.dataset.target) || 0;
    this.prefix = element.dataset.prefix || '';
    this.suffix = element.dataset.suffix || '';
    this.duration = options.duration || 2500;
    this.hasAnimated = false;
    
    this.init();
  }
  
  init() {
    // Create slot machine structure
    this.element.innerHTML = '';
    this.element.classList.add('slot-counter');
    
    const targetStr = this.target.toString();
    this.digits = [];
    
    // Add prefix
    if (this.prefix) {
      const prefix = document.createElement('span');
      prefix.textContent = this.prefix;
      prefix.style.marginRight = '0.1em';
      this.element.appendChild(prefix);
    }
    
    // Create digit slots
    for (let i = 0; i < targetStr.length; i++) {
      const digitContainer = document.createElement('span');
      digitContainer.className = 'slot-digit';
      
      const digitInner = document.createElement('span');
      digitContainer.appendChild(digitInner);
      
      this.element.appendChild(digitContainer);
      this.digits.push({
        container: digitContainer,
        inner: digitInner,
        target: parseInt(targetStr[i])
      });
    }
    
    // Add suffix
    if (this.suffix) {
      const suffix = document.createElement('span');
      suffix.textContent = this.suffix;
      suffix.style.marginLeft = '0.1em';
      this.element.appendChild(suffix);
    }
    
    // Observe for animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animate();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(this.element);
  }
  
  animate() {
    this.digits.forEach((digit, index) => {
      setTimeout(() => {
        this.spinDigit(digit);
      }, index * 200);
    });
  }
  
  spinDigit(digit) {
    digit.container.classList.add('spinning');
    
    // Create numbers 0-9 animation
    let current = 0;
    const spins = 10 + Math.floor(Math.random() * 5);
    const interval = setInterval(() => {
      digit.inner.textContent = current;
      current = (current + 1) % 10;
      
      if (current === digit.target + 1 || (digit.target === 9 && current === 0)) {
        if (spins <= 0) {
          clearInterval(interval);
          digit.inner.textContent = digit.target;
          digit.container.classList.remove('spinning');
          digit.container.style.setProperty('--target-offset', `-${digit.target * 10}%`);
        }
      }
    }, 50);
  }
}

// 4. SCROLL VELOCITY DETECTOR
class ScrollVelocityDetector {
  constructor() {
    this.lastScrollY = 0;
    this.lastTime = performance.now();
    this.velocity = 0;
    this.isScrolling = false;
    this.textElements = [];
    this.init();
  }
  
  init() {
    this.findTextElements();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.animate();
  }
  
  findTextElements() {
    // Add velocity-text class to headings and key text
    document.querySelectorAll('h1, h2, .hero-copy p, .section-header p').forEach(el => {
      el.classList.add('velocity-text');
      this.textElements.push(el);
    });
  }
  
  onScroll() {
    this.isScrolling = true;
    const currentTime = performance.now();
    const currentScrollY = window.scrollY;
    const timeDelta = currentTime - this.lastTime;
    
    if (timeDelta > 0) {
      this.velocity = Math.abs(currentScrollY - this.lastScrollY) / timeDelta;
    }
    
    this.lastScrollY = currentScrollY;
    this.lastTime = currentTime;
    
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.velocity = 0;
    }, 150);
  }
  
  animate() {
    if (this.isScrolling) {
      const speedClass = this.velocity > 0.5 ? 'fast' : this.velocity < 0.1 ? 'slow' : '';
      this.textElements.forEach(el => {
        el.classList.remove('fast', 'slow');
        if (speedClass) el.classList.add(speedClass);
      });
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// 5. HERO IMAGE PERSPECTIVE TILT
class HeroPerspectiveTilt {
  constructor() {
    this.heroImage = document.querySelector('.hero-main-image');
    this.heroWrapper = document.querySelector('.hero-image-wrapper');
    if (!this.heroImage || !this.heroWrapper) return;
    
    this.init();
  }
  
  init() {
    // Skip on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.heroWrapper.classList.add('hero-perspective');
    this.heroImage.classList.add('hero-tilt-image');
    
    this.heroWrapper.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.heroWrapper.addEventListener('mouseleave', () => this.onMouseLeave());
  }
  
  onMouseMove(e) {
    const rect = this.heroWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    this.heroImage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  }
  
  onMouseLeave() {
    this.heroImage.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  }
}

// 6. MASONRY GALLERY WITH LAZY LOADING
class MasonryGallery {
  constructor(container) {
    this.container = container;
    this.items = [];
    this.init();
  }
  
  init() {
    this.createGallery();
    this.observeImages();
  }
  
  createGallery() {
    const images = [
      { src: 'assets/02_Website_Heroes/Hero_1.png', title: 'Modern Design', category: 'Residential' },
      { src: 'assets/02_Website_Heroes/Hero_2.png', title: 'Urban Living', category: 'Commercial' },
      { src: 'assets/03_Social_Campaign/Campaign_4.png', title: 'Luxury Spaces', category: 'Residential' },
      { src: 'assets/03_Social_Campaign/Campaign_5.png', title: 'Corporate HQ', category: 'Commercial' },
      { src: 'assets/02_Website_Heroes/Hero_1.png', title: 'Eco Building', category: 'Industrial' },
      { src: 'assets/03_Social_Campaign/Campaign_4.png', title: 'Smart Office', category: 'Commercial' }
    ];
    
    this.container.innerHTML = '<div class="masonry-grid"></div>';
    const grid = this.container.querySelector('.masonry-grid');
    
    images.forEach((img, index) => {
      const item = document.createElement('div');
      item.className = 'masonry-item chromatic-hover shimmer-container';
      item.innerHTML = `
        <img data-src="${img.src}" alt="${img.title}" class="lazy-load">
        <div class="masonry-overlay">
          <h4>${img.title}</h4>
          <p>${img.category}</p>
        </div>
      `;
      grid.appendChild(item);
      this.items.push(item);
    });
  }
  
  observeImages() {
    const lazyImages = this.container.querySelectorAll('.lazy-load');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          img.addEventListener('load', () => {
            img.style.opacity = '1';
          });
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });
    
    lazyImages.forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
      imageObserver.observe(img);
    });
  }
}

// =========================================
// MAGNETIC BUTTON EFFECT
// =========================================
class MagneticButton {
  constructor(element, options = {}) {
    this.element = element;
    this.strength = options.strength || 0.3;
    this.radius = options.radius || 100;
    this.isHovering = false;
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.element.addEventListener('mouseenter', () => this.isHovering = true);
    this.element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.reset();
    });
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }
  
  onMouseMove(e) {
    if (!this.isHovering) return;
    
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * this.strength;
    const deltaY = (e.clientY - centerY) * this.strength;
    
    this.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }
  
  reset() {
    this.element.style.transform = 'translate(0, 0)';
  }
}

// =========================================
// PROCESS TIMELINE
// =========================================
class ProcessTimeline {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.timeline-item');
    this.progress = container.querySelector('.timeline-progress');
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-visible');
          this.updateProgress();
        }
      });
    }, { threshold: 0.3 });
    
    this.items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 0.15}s`;
      observer.observe(item);
    });
    
    window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
  }
  
  updateProgress() {
    if (!this.progress) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress based on container visibility
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    let progress = 0;
    if (containerTop < windowHeight) {
      progress = Math.min(100, Math.max(0, (windowHeight - containerTop) / (containerHeight + windowHeight) * 100));
    }
    
    this.progress.style.height = `${progress}%`;
  }
}

// =========================================
// 3D TESTIMONIAL CAROUSEL
// =========================================
class TestimonialCarousel3D {
  constructor(container) {
    this.container = container;
    this.cards = container.querySelectorAll('.testimonial-carousel-card');
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.createControls();
    this.positionCards();
    this.startAutoPlay();
  }
  
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '←';
    prevBtn.className = 'carousel-btn prev';
    prevBtn.addEventListener('click', () => this.prev());
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '→';
    nextBtn.className = 'carousel-btn next';
    nextBtn.addEventListener('click', () => this.next());
    
    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    this.container.appendChild(controls);
    
    // Create dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goTo(index));
      dotsContainer.appendChild(dot);
    });
    
    this.container.appendChild(dotsContainer);
    this.dots = dotsContainer.querySelectorAll('.carousel-dot');
  }
  
  positionCards() {
    this.cards.forEach((card, index) => {
      card.classList.remove('active', 'prev', 'next');
      
      if (index === this.currentIndex) {
        card.classList.add('active');
      } else if (index === this.getPrevIndex()) {
        card.classList.add('prev');
      } else if (index === this.getNextIndex()) {
        card.classList.add('next');
      }
    });
    
    // Update dots
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
      });
    }
  }
  
  getPrevIndex() {
    return (this.currentIndex - 1 + this.cards.length) % this.cards.length;
  }
  
  getNextIndex() {
    return (this.currentIndex + 1) % this.cards.length;
  }
  
  next() {
    if (this.isAnimating) return;
    this.currentIndex = this.getNextIndex();
    this.positionCards();
  }
  
  prev() {
    if (this.isAnimating) return;
    this.currentIndex = this.getPrevIndex();
    this.positionCards();
  }
  
  goTo(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    this.currentIndex = index;
    this.positionCards();
  }
  
  startAutoPlay() {
    setInterval(() => {
      if (!this.isAnimating) {
        this.next();
      }
    }, 5000);
  }
}

// =========================================
// SCROLL PROGRESS READING
// =========================================
class ReadingProgress {
  constructor() {
    this.progressBar = document.querySelector('.reading-progress');
    if (!this.progressBar) return;
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      this.progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }
}

// =========================================
// INITIALIZE ALL FORTUNE 500 v5.0 FEATURES
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // ENHANCED COUNTERS (v4.0)
  document.querySelectorAll('.enhanced-counter').forEach(el => {
    new EnhancedCounter(el);
  });
  
  // Typewriter Effect on eyebrow text
  document.querySelectorAll('.eyebrow').forEach(el => {
    new TypewriterEffect(el, { speed: 30, delay: 500 });
  });
  
  // Magnetic Buttons
  document.querySelectorAll('.btn, .magnetic').forEach(el => {
    new MagneticButton(el, { strength: 0.4 });
  });
  
  // Reading Progress
  new ReadingProgress();
  
  // Process Timeline (if exists)
  document.querySelectorAll('.process-timeline').forEach(el => {
    new ProcessTimeline(el);
  });
  
  // 3D Testimonial Carousel (if exists)
  document.querySelectorAll('.testimonial-carousel-3d').forEach(el => {
    new TestimonialCarousel3D(el);
  });
  
  // Text Scramble Effect on headings
  document.querySelectorAll('.scramble-text, .section-header h2').forEach(el => {
    new TextScramble(el);
  });
  
  // Advanced 3D Tilt Cards
  document.querySelectorAll('.service-card, .project-card, .testimonial-card').forEach(el => {
    new AdvancedTiltCard(el, { maxRotation: 8, glare: true, shine: true });
  });
  
  // Advanced Custom Cursor (desktop only)
  const customCursor = new CustomCursor({ dotSpeed: 1, ringSpeed: 0.12 });
  
  // Parallax Layers
  const parallax = new ParallaxLayers();
  
  // Particles Network
  const particles = new ParticlesNetwork(document.body, { particleCount: 15 });
  
  // Kinetic Typography
  document.querySelectorAll('h1, .hero h1').forEach(el => {
    new KineticTypography(el, { stagger: 0.04 });
  });
  
  // Scroll Reveal Sections
  new ScrollReveal(document.querySelectorAll('.reveal-section, .section'), { threshold: 0.1 });
  new ScrollReveal(document.querySelectorAll('.reveal-scale'), { threshold: 0.2 });
  
  // Ripple Effect
  const rippleEffect = new RippleEffect();
  
  // Staggered List Reveal
  new StaggeredListReveal(document.querySelectorAll('.footer-links ul, .trust'));
  
  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Toggle current
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
  
  // Smooth Page Transitions
  const pageTransitions = new SmoothPageTransition();
  
  // =========================================
  // NEW v5.0 PROFESSIONAL FEATURES
  // =========================================
  
  // Toast Notification System - demo after 3 seconds
  setTimeout(() => {
    toast.success('Welcome to BuildBridge! Explore our new features.', {
      title: 'Welcome'
    });
  }, 3000);
  
  // Scroll Navigation
  const scrollNav = new ScrollNavigation();
  
  // Slot Machine Counters for hero stats
  document.querySelectorAll('.floating-stats .enhanced-counter').forEach(el => {
    new SlotMachineCounter(el);
  });
  
  // Scroll Velocity Detector
  const velocityDetector = new ScrollVelocityDetector();
  
  // Hero Perspective Tilt
  const heroTilt = new HeroPerspectiveTilt();
  
  // Masonry Gallery (if container exists)
  const masonryContainer = document.querySelector('.masonry-gallery-container');
  if (masonryContainer) {
    new MasonryGallery(masonryContainer);
  }
  
  // Show shimmer effects on hero image
  const heroImageWrapper = document.querySelector('.hero-image-wrapper');
  if (heroImageWrapper) {
    heroImageWrapper.classList.add('shimmer-container', 'chromatic-hover', 'distortion-wave');
  }
  
  // Add liquid button effect to CTA buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.add('liquid-btn');
  });
  
  // Bind toast demo to floating WhatsApp
  const floatingWhatsApp = document.querySelector('.floating-whatsapp');
  if (floatingWhatsApp) {
    floatingWhatsApp.addEventListener('click', (e) => {
      toast.info('Opening WhatsApp chat...', { title: 'Connecting' });
    });
  }
  
  // Remove preloader faster with new animation
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 500);
    }, 1500);
  }
});

// Console easter egg for v5.0
// =========================================
// v6.0 PROFESSIONAL FEATURES (NEW)
// =========================================

// Mouse Spotlight Effect
class MouseSpotlight {
  constructor() {
    this.spotlight = null;
    this.init();
  }
  
  init() {
    // Don't initialize on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'mouse-spotlight';
    document.body.appendChild(this.spotlight);
    
    let mouseX = 0, mouseY = 0;
    let spotlightX = 0, spotlightY = 0;
    let isActive = false;
    let rafId = null;
    
    const updatePosition = () => {
      const ease = 0.1;
      spotlightX += (mouseX - spotlightX) * ease;
      spotlightY += (mouseY - spotlightY) * ease;
      
      this.spotlight.style.left = spotlightX + 'px';
      this.spotlight.style.top = spotlightY + 'px';
      
      if (isActive) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isActive) {
        isActive = true;
        this.spotlight.classList.add('active');
        updatePosition();
      }
    }, { passive: true });
    
    document.addEventListener('mouseleave', () => {
      isActive = false;
      this.spotlight.classList.remove('active');
      if (rafId) cancelAnimationFrame(rafId);
    });
  }
}

// Particle Network Background
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 60;
    this.connectionDistance = 150;
    this.maxConnections = 3;
    this.mouse = { x: null, y: null };
    this.init();
  }
  
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
    
    document.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    this.createParticles();
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((particle, i) => {
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundaries
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(201, 206, 214, 0.3)';
      this.ctx.fill();
      
      // Connect particles
      let connections = 0;
      for (let j = i + 1; j < this.particles.length; j++) {
        if (connections >= this.maxConnections) break;
        
        const other = this.particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          connections++;
          const opacity = (1 - distance / this.connectionDistance) * 0.2;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.strokeStyle = `rgba(201, 206, 214, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
      
      // Connect to mouse
      if (this.mouse.x && this.mouse.y) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const opacity = (1 - distance / 200) * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(201, 206, 214, ${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Advanced Ripple Effect
class AdvancedRipple {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.element.classList.add('ripple-container');
    
    this.element.addEventListener('click', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.element.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }
}

// Text Scramble Effect on Hover
class TextScrambleHover {
  constructor(element) {
    this.element = element;
    this.originalText = element.textContent;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.isHovering = false;
    this.init();
  }
  
  init() {
    this.element.addEventListener('mouseenter', () => {
      this.isHovering = true;
      this.scramble();
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.element.textContent = this.originalText;
    });
  }
  
  scramble() {
    if (!this.isHovering) return;
    
    let iteration = 0;
    const interval = setInterval(() => {
      if (!this.isHovering) {
        clearInterval(interval);
        this.element.textContent = this.originalText;
        return;
      }
      
      this.element.textContent = this.originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return this.originalText[index];
          }
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        })
        .join('');
      
      if (iteration >= this.originalText.length) {
        clearInterval(interval);
      }
      
      iteration += 1/2;
    }, 30);
  }
}

// Parallax Tilt Cards
class ParallaxTiltCard {
  constructor(element) {
    this.element = element;
    this.inner = element.querySelector('.parallax-card-inner');
    this.shine = element.querySelector('.parallax-card-shine');
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
      
      if (this.shine) {
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;
        this.shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
        this.shine.style.opacity = '1';
      }
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      if (this.shine) {
        this.shine.style.opacity = '0';
      }
    });
  }
}

// Initialize all new v6.0 features
document.addEventListener('DOMContentLoaded', () => {
  // Mouse Spotlight
  new MouseSpotlight();
  
  // Custom Cursor (desktop only)
  new CustomCursor();
  
  // Particle Network
  const particleCanvas = document.createElement('canvas');
  particleCanvas.className = 'particle-canvas';
  document.body.insertBefore(particleCanvas, document.body.firstChild);
  new ParticleNetwork(particleCanvas);
  
  // Advanced Ripple on buttons
  document.querySelectorAll('.btn, .quote-btn').forEach(btn => {
    new AdvancedRipple(btn);
  });
  
  // Text Scramble on nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    new TextScrambleHover(link);
  });
  
  // Parallax Tilt on service cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.add('parallax-card');
    card.innerHTML = `<div class="parallax-card-inner" style="transform-style: preserve-3d; height: 100%;">${card.innerHTML}<div class="parallax-card-shine" style="position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 0.3s;"></div></div>`;
    new ParallaxTiltCard(card);
  });
  
  // Animated gradient text for hero headline
  const heroHeadline = document.querySelector('.hero h1');
  if (heroHeadline) {
    heroHeadline.classList.add('animated-gradient-text');
  }
  
  // Add shimmer loading to project cards temporarily on load
  document.querySelectorAll('.project-card').forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('shimmer');
      setTimeout(() => card.classList.remove('shimmer'), 1500);
    }, index * 200);
  });
  
  // Floating animation for stats
  document.querySelectorAll('.floating-stats').forEach((stat, index) => {
    stat.style.animationDelay = `${index * 0.5}s`;
    stat.classList.add('float-animation');
  });
});

// Console easter egg for v6.0
console.log('%c🏗️ BuildBridge', 'font-size: 42px; font-weight: bold; background: linear-gradient(90deg, #C9CED6, #fff, #C9CED6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 40px rgba(201,206,214,0.6);');
console.log('%cFortune 500 Construction Management System v6.0', 'font-size: 16px; color: #525862; font-weight: 600;');
console.log('%c═════════════════════════════════════════════════════', 'font-size: 12px; color: #333;');
console.log('%c✨ New in v6.0:', 'font-size: 13px; color: #C9CED6; font-weight: bold;');
console.log('%c   • Mouse Spotlight Effect - Cursor-following gradient glow', 'font-size: 11px; color: #888;');
console.log('%c   • Custom Animated Cursor - Premium hover interactions', 'font-size: 11px; color: #888;');
console.log('%c   • Particle Network Background - Dynamic connecting dots', 'font-size: 11px; color: #888;');
console.log('%c   • Advanced Ripple Effects - Material design clicks', 'font-size: 11px; color: #888;');
console.log('%c   • Text Scramble Hover - Cyber-style text animation', 'font-size: 11px; color: #888;');
console.log('%c   • Parallax Tilt Cards - 3D perspective on service cards', 'font-size: 11px; color: #888;');
console.log('%c   • Animated Gradient Text - Flowing color headlines', 'font-size: 11px; color: #888;');
console.log('%c   • Shimmer Loading Effects - Premium loading states', 'font-size: 11px; color: #888;');
console.log('%c═════════════════════════════════════════════════════', 'font-size: 12px; color: #333;');
console.log('%c💬 WhatsApp: +27 66 120 0064', 'font-size: 14px; color: #25D366; font-weight: bold;');
console.log('%c🌐 Auto-Update Timestamp: ' + new Date().toISOString(), 'font-size: 10px; color: #666; font-style: italic;');

// =========================================
// v6.2 ADVANCED UI COMPONENTS
// =========================================

// Circular Scroll Progress Indicator
class ScrollProgressRing {
  constructor() {
    this.element = null;
    this.progress = 0;
    this.init();
  }
  
  init() {
    this.element = document.createElement('div');
    this.element.className = 'scroll-progress-ring';
    this.element.innerHTML = `
      <svg width="54" height="54" viewBox="0 0 54 54">
        <circle class="bg" cx="27" cy="27" r="24"></circle>
        <circle class="progress" cx="27" cy="27" r="24" 
                stroke-dasharray="150.8" stroke-dashoffset="150.8"></circle>
      </svg>
      <span class="arrow">↑</span>
    `;
    
    document.body.appendChild(this.element);
    
    // Scroll listener
    window.addEventListener('scroll', () => this.update(), { passive: true });
    
    // Click to scroll to top
    this.element.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    this.update();
  }
  
  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.progress = (scrollTop / docHeight) * 150.8;
    
    const circle = this.element.querySelector('.progress');
    circle.style.strokeDashoffset = 150.8 - this.progress;
    
    // Show/hide based on scroll
    if (scrollTop > 300) {
      this.element.classList.add('visible');
    } else {
      this.element.classList.remove('visible');
    }
  }
}

// Enhanced Magnetic Buttons
class MagneticButtons {
  constructor() {
    this.buttons = [];
    this.init();
  }
  
  init() {
    document.querySelectorAll('.magnetic-btn, .btn, .quote-btn').forEach(btn => {
      btn.classList.add('magnetic-btn-enhanced');
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        btn.querySelector('span')?.style?.transform && (btn.querySelector('span').style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`);
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.querySelector('span')?.style?.transform && (btn.querySelector('span').style.transform = 'translate(0, 0)');
      });
    });
  }
}

// Progressive Image Loading
class ProgressiveImageLoader {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('.project-card img, .hero-main-image').forEach(img => {
      const container = document.createElement('div');
      container.className = 'progressive-image';
      
      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      
      // Small blur version as placeholder
      const smallImg = new Image();
      smallImg.src = img.src;
      smallImg.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      placeholder.appendChild(smallImg);
      
      img.parentNode.insertBefore(container, img);
      container.appendChild(placeholder);
      container.appendChild(img);
      
      // Load full image
      if (img.complete) {
        container.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          container.classList.add('loaded');
        });
      }
    });
  }
}

// Tab Component
class TabComponent {
  constructor(container) {
    this.container = container;
    this.buttons = container.querySelectorAll('.tab-btn');
    this.panels = container.querySelectorAll('.tab-content');
    this.init();
  }
  
  init() {
    this.buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => this.switchTab(index));
    });
    
    // Activate first tab
    this.switchTab(0);
  }
  
  switchTab(index) {
    this.buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    
    this.panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === index);
    });
  }
}

// Spotlight Cards (Mouse tracking glow)
class SpotlightCards {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.classList.add('spotlight-card');
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }
}

// Enhanced FAQ Accordion
class EnhancedAccordion {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.faq-item');
    this.init();
  }
  
  init() {
    this.items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      const content = item.querySelector('.faq-answer');
      
      // Add enhanced icon
      const icon = document.createElement('span');
      icon.className = 'faq-icon-enhanced';
      icon.innerHTML = '+';
      btn.appendChild(icon);
      
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all
        this.items.forEach(i => {
          i.classList.remove('active');
          i.querySelector('.faq-icon-enhanced').innerHTML = '+';
        });
        
        // Open current
        if (!isActive) {
          item.classList.add('active');
          icon.innerHTML = '−';
        }
      });
    });
  }
}

// Intersection Observer for Animations
class ScrollAnimations {
  constructor() {
    this.observer = null;
    this.init();
  }
  
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    // Observe elements
    document.querySelectorAll('.trust > div, .stat-item, .timeline-item').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      this.observer.observe(el);
    });
  }
}

// Service Worker Registration (for PWA capability)
class PWARegistration {
  constructor() {
    this.init();
  }
  
  init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    }
  }
}

// PWA Install Prompt
class PWAInstallPrompt {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }
  
  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show install button after 5 seconds
      setTimeout(() => {
        this.showInstallButton();
      }, 5000);
    });
  }
  
  showInstallButton() {
    const btn = document.createElement('button');
    btn.className = 'btn magnetic-btn install-btn';
    btn.innerHTML = '<span>📱 Install App</span>';
    btn.style.cssText = 'position: fixed; bottom: 30px; left: 30px; z-index: 9999;';
    
    btn.addEventListener('click', () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(() => {
          btn.remove();
        });
      }
    });
    
    document.body.appendChild(btn);
  }
}

// Initialize v6.2 features
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Progress Ring
  new ScrollProgressRing();
  
  // Magnetic Buttons
  new MagneticButtons();
  
  // Progressive Image Loading
  new ProgressiveImageLoader();
  
  // Spotlight Cards
  new SpotlightCards();
  
  // Enhanced FAQ Accordion
  const faqContainer = document.querySelector('.faq-container');
  if (faqContainer) {
    new EnhancedAccordion(faqContainer);
  }
  
  // Scroll Animations
  new ScrollAnimations();
  
  // Add 'Animate In' class styles
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
  
  // Add notification badge to WhatsApp button
  const whatsappBtn = document.querySelector('.floating-whatsapp');
  if (whatsappBtn && !sessionStorage.getItem('whatsapp-clicked')) {
    whatsappBtn.classList.add('notification-badge');
    whatsappBtn.addEventListener('click', () => {
      sessionStorage.setItem('whatsapp-clicked', 'true');
      whatsappBtn.classList.remove('notification-badge');
    });
  }
  
  // Add flip card effect to testimonials
  document.querySelectorAll('.testimonial-carousel-card').forEach(card => {
    card.classList.add('flip-card');
    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';
    inner.innerHTML = `
      <div class="flip-card-front">${card.innerHTML}</div>
      <div class="flip-card-back">
        <p style="font-size: 14px; color: var(--chrome);">Verified Client</p>
        <p style="margin-top: 20px; color: var(--slate);">★★★★★</p>
        <p style="margin-top: 15px; font-size: 13px;">Project completed in 2024</p>
      </div>
    `;
    card.innerHTML = '';
    card.appendChild(inner);
  });
  
  // Skeleton loading for dynamic content
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
  });
  
  setTimeout(() => {
    document.querySelectorAll('.project-card').forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }, 100);
});

console.log('%c✨ v6.2 Advanced UI Components Loaded:', 'font-size: 12px; color: #C9CED6; font-weight: bold;');
console.log('%c   • Circular scroll progress indicator', 'font-size: 10px; color: #888;');
console.log('%c   • Enhanced magnetic button effects', 'font-size: 10px; color: #888;');
console.log('%c   • Progressive image loading with blur transition', 'font-size: 10px; color: #888;');
console.log('%c   • Spotlight hover effects on cards', 'font-size: 10px; color: #888;');
console.log('%c   • Enhanced FAQ accordion with icons', 'font-size: 10px; color: #888;');
console.log('%c   • Scroll-triggered animations', 'font-size: 10px; color: #888;');
console.log('%c   • Flip card testimonials', 'font-size: 10px; color: #888;');
console.log('%c   • Skeleton loading states', 'font-size: 10px; color: #888;');
console.log('%c   • Notification badges', 'font-size: 10px; color: #888;');

// =========================================
// PWA & SERVICE WORKER REGISTRATION
// =========================================

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('[PWA] New version available');
              toast.info('A new version is available. Refresh to update.', {
                title: 'Update Available',
                duration: 10000
              });
            }
          });
        });
      })
      .catch((error) => {
        console.log('[PWA] Service Worker registration failed:', error);
      });
  });
}

// Performance Monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        console.log('[Perf] LCP:', lastEntry.startTime.toFixed(2) + 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const delay = entry.processingStart - entry.startTime;
          this.metrics.fid = delay;
          console.log('[Perf] FID:', delay.toFixed(2) + 'ms');
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    // Page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        this.metrics.fcp = perfData.responseEnd - perfData.navigationStart;
        this.metrics.ttfb = perfData.responseStart - perfData.navigationStart;
        this.metrics.domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        this.metrics.loadComplete = pageLoadTime;
        
        console.log('[Perf] Page Load Time:', pageLoadTime + 'ms');
        console.log('[Perf] TTFB:', this.metrics.ttfb + 'ms');
        console.log('[Perf] DOM Ready:', this.metrics.domReady + 'ms');
      }, 0);
    });
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

// Prefetch critical resources
const prefetchResources = () => {
  const links = [
    '/about.html',
    '/services.html',
    '/contact.html'
  ];
  
  links.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Prefetch on idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(prefetchResources, { timeout: 5000 });
} else {
  setTimeout(prefetchResources, 5000);
}

// Network status monitoring
window.addEventListener('online', () => {
  console.log('[Network] Back online');
  toast.success('You are back online', { title: 'Connected' });
});

window.addEventListener('offline', () => {
  console.log('[Network] Gone offline');
  toast.warning('You are offline. Some features may be limited.', { 
    title: 'Offline Mode',
    duration: 5000 
  });
});

// Visibility API - pause heavy animations when tab hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('[App] Tab hidden - pausing animations');
    document.body.classList.add('animations-paused');
  } else {
    console.log('[App] Tab visible - resuming animations');
    document.body.classList.remove('animations-paused');
  }
});

console.log('%c📱 PWA Features Loaded:', 'font-size: 12px; color: #C9CED6; font-weight: bold;');
console.log('%c   • Service Worker registration', 'font-size: 10px; color: #888;');
console.log('%c   • Core Web Vitals monitoring', 'font-size: 10px; color: #888;');
console.log('%c   • Resource prefetching', 'font-size: 10px; color: #888;');
console.log('%c   • Network status detection', 'font-size: 10px; color: #888;');
console.log('%c   • Page visibility optimization', 'font-size: 10px; color: #888;');

// =========================================
// v6.1 ADDITIONAL PROFESSIONAL FEATURES
// =========================================

// Typewriter Effect
class TypewriterEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.text = element.textContent;
    this.speed = options.speed || 100;
    this.delay = options.delay || 0;
    this.cursor = options.cursor !== false;
    this.cursorChar = options.cursorChar || '|';
    this.loop = options.loop || false;
    this.loopDelay = options.loopDelay || 2000;
    
    this.init();
  }
  
  init() {
    this.element.classList.add('typewriter');
    this.element.innerHTML = `<span class="typewriter-text"></span>${this.cursor ? '<span class="typewriter-cursor"></span>' : ''}`;
    this.textSpan = this.element.querySelector('.typewriter-text');
    
    setTimeout(() => this.type(), this.delay);
  }
  
  type() {
    let charIndex = 0;
    
    const typeChar = () => {
      if (charIndex < this.text.length) {
        this.textSpan.textContent += this.text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, this.speed);
      } else if (this.loop) {
        setTimeout(() => this.delete(), this.loopDelay);
      }
    };
    
    typeChar();
  }
  
  delete() {
    let charIndex = this.text.length;
    
    const deleteChar = () => {
      if (charIndex > 0) {
        this.textSpan.textContent = this.text.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(deleteChar, this.speed / 2);
      } else if (this.loop) {
        setTimeout(() => this.type(), this.speed * 5);
      }
    };
    
    deleteChar();
  }
}

// Parallax Scroll Sections
class ParallaxSection {
  constructor(element) {
    this.element = element;
    this.layers = element.querySelectorAll('.parallax-layer');
    this.speed = element.dataset.parallaxSpeed || 0.5;
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    const rect = this.element.getBoundingClientRect();
    const scrolled = window.scrollY;
    const elementTop = rect.top + scrolled;
    const relativeScroll = scrolled - elementTop + window.innerHeight;
    
    this.layers.forEach((layer, index) => {
      const speed = (index + 1) * 0.1 * this.speed;
      const yPos = relativeScroll * speed;
      layer.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// Lightbox Gallery
class LightboxGallery {
  constructor() {
    this.overlay = null;
    this.images = [];
    this.currentIndex = 0;
    this.init();
  }
  
  init() {
    // Find all project images
    document.querySelectorAll('.project-card img').forEach((img, index) => {
      this.images.push({
        src: img.src,
        alt: img.alt,
        caption: img.closest('.project-card')?.querySelector('h3')?.textContent || img.alt
      });
      
      img.closest('.project-card').addEventListener('click', () => this.open(index));
      img.closest('.project-card').style.cursor = 'zoom-in';
    });
    
    // Create overlay
    this.createOverlay();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.overlay.classList.contains('active')) return;
      
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'lightbox-overlay';
    this.overlay.innerHTML = `
      <div class="lightbox-container">
        <button class="lightbox-close">✕</button>
        <button class="lightbox-nav lightbox-prev">‹</button>
        <button class="lightbox-nav lightbox-next">›</button>
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Event listeners
    this.overlay.querySelector('.lightbox-close').addEventListener('click', () => this.close());
    this.overlay.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
    this.overlay.querySelector('.lightbox-next').addEventListener('click', () => this.next());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }
  
  open(index) {
    this.currentIndex = index;
    this.updateImage();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.overlay.classList.remove('active');
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
    const overlayImg = this.overlay.querySelector('.lightbox-image');
    const caption = this.overlay.querySelector('.lightbox-caption');
    
    overlayImg.style.opacity = '0';
    
    setTimeout(() => {
      overlayImg.src = img.src;
      overlayImg.alt = img.alt;
      caption.textContent = img.caption;
      overlayImg.style.opacity = '1';
    }, 200);
  }
}

// Scroll Reveal Animation
class ScrollRevealPro {
  constructor(elements, options = {}) {
    this.elements = Array.from(elements);
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '0px';
    this.animation = options.animation || 'fade-up';
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
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
      el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
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
  
  animate(element) {
    element.style.opacity = '1';
    element.style.transform = 'none';
  }
}

// Hero Spotlight Mask for Mouse Tracking
class HeroSpotlightMask {
  constructor() {
    this.hero = document.querySelector('.hero');
    if (!this.hero) return;
    
    this.init();
  }
  
  init() {
    const mask = document.createElement('div');
    mask.className = 'hero-spotlight-mask';
    this.hero.appendChild(mask);
    
    this.hero.addEventListener('mousemove', (e) => {
      const rect = this.hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      mask.style.setProperty('--mouse-x', `${x}%`);
      mask.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });
  }
}

// Stats Counter Animation with Slot Effect
class AnimatedCounter {
  constructor(element) {
    this.element = element;
    this.target = parseInt(element.dataset.target) || 0;
    this.prefix = element.dataset.prefix || '';
    this.suffix = element.dataset.suffix || '';
    this.duration = parseInt(element.dataset.duration) || 2000;
    
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
    const startValue = 0;
    
    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (this.target - startValue) * easeProgress);
      
      // Add slot machine effect
      if (progress < 0.8) {
        const randomDigit = Math.floor(Math.random() * 10);
        this.element.textContent = this.prefix + currentValue + randomDigit + this.suffix;
      } else {
        this.element.textContent = this.prefix + currentValue + this.suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.element.textContent = this.prefix + this.target + this.suffix;
      }
    };
    
    requestAnimationFrame(tick);
  }
}

// Smooth Scroll Anchor Links
class SmoothAnchorScroll {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          const offset = 80; // Account for fixed header
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Initialize all v6.1 features
document.addEventListener('DOMContentLoaded', () => {
  // Typewriter effect for hero eyebrow
  const heroEyebrow = document.querySelector('.hero .eyebrow');
  if (heroEyebrow) {
    new TypewriterEffect(heroEyebrow, { speed: 80, delay: 1500 });
  }
  
  // Lightbox Gallery for projects
  const lightbox = new LightboxGallery();
  
  // Scroll Reveal Pro for sections
  new ScrollRevealPro(document.querySelectorAll('.section-header'), { animation: 'fade-up' });
  new ScrollRevealPro(document.querySelectorAll('.service-card'), { animation: 'fade-up', threshold: 0.2 });
  new ScrollRevealPro(document.querySelectorAll('.stat-item'), { animation: 'scale' });
  new ScrollRevealPro(document.querySelectorAll('.timeline-item'), { animation: 'fade-right' });
  new ScrollRevealPro(document.querySelectorAll('.faq-item'), { animation: 'fade-left' });
  
  // Hero Spotlight Mask
  new HeroSpotlightMask();
  
  // Animated counters for stats
  document.querySelectorAll('.enhanced-counter').forEach(counter => {
    new AnimatedCounter(counter);
  });
  
  // Smooth anchor scroll
  new SmoothAnchorScroll();
  
  // Add Ken Burns effect to hero image
  const heroImage = document.querySelector('.hero-main-image');
  if (heroImage) {
    heroImage.classList.add('ken-burns');
  }
  
  // Add grid overlay to hero
  const hero = document.querySelector('.hero');
  if (hero) {
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'hero-grid-overlay';
    hero.insertBefore(gridOverlay, hero.firstChild);
  }
  
  // Glitch effect on brand logo hover
  const brandName = document.querySelector('.brand span');
  if (brandName) {
    brandName.classList.add('glitch-text');
    brandName.setAttribute('data-text', brandName.textContent);
  }
});

console.log('%c✨ v6.1 Features Loaded:', 'font-size: 12px; color: #C9CED6; font-weight: bold;');
console.log('%c   • Typewriter effect on hero eyebrow', 'font-size: 10px; color: #888;');
console.log('%c   • Lightbox gallery for project images', 'font-size: 10px; color: #888;');
console.log('%c   • Scroll reveal animations (fade, scale, rotate)', 'font-size: 10px; color: #888;');
console.log('%c   • Hero spotlight mask with mouse tracking', 'font-size: 10px; color: #888;');
console.log('%c   • Slot machine counters for stats', 'font-size: 10px; color: #888;');
console.log('%c   • Ken Burns effect on hero image', 'font-size: 10px; color: #888;');
console.log('%c   • Grid overlay and glitch text effects', 'font-size: 10px; color: #888;');
