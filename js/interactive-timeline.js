/**
 * Interactive Project Timeline (v38.0)
 * GSAP ScrollTrigger-powered timeline with Fortune 500 polish
 */

class InteractiveTimeline {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      progressLine: true,
      nodeAnimation: true,
      counterAnimation: true,
      ...options
    };
    
    this.items = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.cacheElements();
    this.setupGSAP();
    this.bindEvents();
    this.createNavigation();
    
    // Initial state - show first item
    setTimeout(() => this.activateItem(0), 500);
  }
  
  cacheElements() {
    this.timelineItems = this.container.querySelectorAll('.timeline-item-interactive');
    this.progressLine = this.container.querySelector('.timeline-progress-line');
    this.timelineLine = this.container.querySelector('.timeline-line');
  }
  
  setupGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, using fallback animations');
      this.setupFallbackAnimations();
      return;
    }
    
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Progress line animation
    if (this.progressLine && this.options.progressLine) {
      gsap.to(this.progressLine, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: this.container,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.5,
          onUpdate: (self) => {
            this.updateProgress(self.progress);
          }
        }
      });
    }
    
    // Timeline items entrance
    this.timelineItems.forEach((item, index) => {
      const isLeft = item.classList.contains('timeline-left');
      const slideDirection = isLeft ? 50 : -50;
      
      gsap.fromTo(item, {
        opacity: 0,
        x: slideDirection,
        y: 30
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: this.options.duration,
        ease: this.options.ease,
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
          onEnter: () => this.activateItem(index),
          onEnterBack: () => this.activateItem(index)
        }
      });
      
      // Node animation
      const node = item.querySelector('.timeline-node-interactive');
      if (node && this.options.nodeAnimation) {
        gsap.fromTo(node, {
          scale: 0,
          rotation: -180
        }, {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: item,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        });
      }
      
      // Counter animation for stats
      if (this.options.counterAnimation) {
        const counters = item.querySelectorAll('.timeline-stat-value[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          const suffix = counter.dataset.suffix || '';
          
          ScrollTrigger.create({
            trigger: item,
            start: 'top 70%',
            onEnter: () => this.animateCounter(counter, target, suffix)
          });
        });
      }
    });
    
    // Create snap points for each timeline item
    this.createSnapPoints();
  }
  
  setupFallbackAnimations() {
    // Fallback for when GSAP isn't available
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          const index = Array.from(this.timelineItems).indexOf(entry.target);
          this.activateItem(index);
        }
      });
    }, { threshold: 0.3 });
    
    this.timelineItems.forEach(item => observer.observe(item));
  }
  
  createSnapPoints() {
    if (typeof ScrollTrigger === 'undefined') return;
    
    const snapPoints = Array.from(this.timelineItems).map(item => {
      const trigger = ScrollTrigger.create({
        trigger: item,
        start: 'top center'
      });
      return trigger.start / ScrollTrigger.maxScroll(window);
    });
    
    ScrollTrigger.create({
      snap: {
        snapTo: snapPoints,
        duration: { min: 0.2, max: 0.5 },
        delay: 0,
        ease: 'power2.inOut'
      }
    });
  }
  
  updateProgress(progress) {
    // Update active item based on scroll progress
    const activeIndex = Math.floor(progress * this.timelineItems.length);
    if (activeIndex !== this.currentIndex && activeIndex < this.timelineItems.length) {
      this.activateItem(activeIndex);
    }
    
    // Update counter
    this.updateCounter(activeIndex + 1);
  }
  
  activateItem(index) {
    if (index < 0 || index >= this.timelineItems.length) return;
    
    // Remove active class from all items
    this.timelineItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      const node = item.querySelector('.timeline-node-interactive');
      if (node) {
        node.classList.toggle('active', i === index);
      }
    });
    
    this.currentIndex = index;
    this.updateCounter(index + 1);
    this.updateNavButtons();
  }
  
  animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const start = performance.now();
    const startValue = 0;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeOut);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  createNavigation() {
    const navContainer = this.container.querySelector('.timeline-navigation');
    if (!navContainer) return;
    
    this.prevBtn = navContainer.querySelector('.timeline-prev');
    this.nextBtn = navContainer.querySelector('.timeline-next');
    this.counterCurrent = navContainer.querySelector('.timeline-counter .current');
    this.counterTotal = navContainer.querySelector('.timeline-counter .total');
    
    if (this.counterTotal) {
      this.counterTotal.textContent = this.timelineItems.length.toString().padStart(2, '0');
    }
    
    this.updateNavButtons();
  }
  
  updateNavButtons() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.timelineItems.length - 1;
    }
  }
  
  updateCounter(current) {
    if (this.counterCurrent) {
      this.counterCurrent.textContent = current.toString().padStart(2, '0');
    }
  }
  
  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.navigateTo(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.navigateTo(1));
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isInViewport()) return;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigateTo(-1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateTo(1);
      }
    });
    
    // Node click
    this.timelineItems.forEach((item, index) => {
      const node = item.querySelector('.timeline-node-interactive');
      if (node) {
        node.addEventListener('click', () => {
          this.scrollToItem(index);
        });
      }
    });
    
    // Filter buttons
    const filterBtns = this.container.querySelectorAll('.timeline-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.filterItems(filter);
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  
  navigateTo(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.timelineItems.length) {
      this.scrollToItem(newIndex);
    }
  }
  
  scrollToItem(index) {
    const item = this.timelineItems[index];
    if (!item) return;
    
    const offset = window.innerHeight / 2;
    const itemTop = item.getBoundingClientRect().top + window.scrollY;
    
    window.scrollTo({
      top: itemTop - offset,
      behavior: 'smooth'
    });
  }
  
  filterItems(filter) {
    this.timelineItems.forEach(item => {
      const category = item.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      if (typeof gsap !== 'undefined') {
        gsap.to(item, {
          opacity: shouldShow ? 1 : 0.3,
          scale: shouldShow ? 1 : 0.95,
          duration: 0.4,
          ease: 'power2.out',
          pointerEvents: shouldShow ? 'auto' : 'none'
        });
      } else {
        item.style.opacity = shouldShow ? '1' : '0.3';
        item.style.transform = shouldShow ? 'scale(1)' : 'scale(0.95)';
        item.style.pointerEvents = shouldShow ? 'auto' : 'none';
      }
    });
  }
  
  isInViewport() {
    const rect = this.container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
  
  // Public API
  refresh() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
  
  destroy() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && this.container.contains(trigger.vars.trigger)) {
          trigger.kill();
        }
      });
    }
  }
  
  goTo(index) {
    this.scrollToItem(index);
  }
}

// Filter functionality for timeline
document.addEventListener('DOMContentLoaded', () => {
  const timelineContainers = document.querySelectorAll('.interactive-timeline');
  timelineContainers.forEach(container => {
    new InteractiveTimeline(container);
  });
});

// Auto-initialize timelines with data attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-timeline="interactive"]').forEach(el => {
    new InteractiveTimeline(el, {
      duration: parseFloat(el.dataset.duration) || 0.8,
      progressLine: el.dataset.progress !== 'false'
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveTimeline;
}
