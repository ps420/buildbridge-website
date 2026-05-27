/**
 * v32.0 - Scroll-Linked Process Timeline
 * Fortune 500 Project Journey with Scroll-Triggered Animations
 */

(function() {
  'use strict';

  class ScrollTimelineProcess {
    constructor() {
      this.section = document.querySelector('.process-timeline-section');
      if (!this.section) return;
      
      this.timeline = this.section.querySelector('.process-timeline');
      this.progressLine = this.section.querySelector('.timeline-progress-line');
      this.items = this.section.querySelectorAll('.timeline-item');
      this.dots = this.section.querySelectorAll('.timeline-step-dot');
      
      this.currentStep = 0;
      this.isActive = false;
      
      this.init();
    }

    init() {
      this.bindEvents();
      this.createObserver();
      this.updateProgress();
      
      // Log initialization
      console.log('🎯 BuildBridge v32.0: Scroll-Linked Timeline initialized');
    }

    bindEvents() {
      // Scroll event with throttling
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Dot navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.scrollToStep(index));
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.scrollToStep(index);
          }
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.isActive) return;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigateToStep(this.currentStep + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigateToStep(this.currentStep - 1);
        }
      });
    }

    createObserver() {
      // Intersection Observer for section visibility
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            this.isActive = entry.isIntersecting;
          });
        },
        { threshold: 0.1 }
      );
      
      sectionObserver.observe(this.section);

      // Observer for individual timeline items
      const itemObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              this.animateEntry(entry.target);
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '-50px 0px'
        }
      );

      this.items.forEach(item => itemObserver.observe(item));
    }

    updateProgress() {
      if (!this.section || !this.progressLine) return;

      const rect = this.timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Calculate progress based on scroll position
      let progress = 0;
      
      if (sectionTop <= windowHeight * 0.5) {
        const scrolled = (windowHeight * 0.5) - sectionTop;
        progress = Math.min(100, Math.max(0, (scrolled / sectionHeight) * 100));
      }

      // Update progress line height
      this.progressLine.style.height = `${progress}%`;

      // Update active dot
      this.updateActiveDot(progress);
    }

    updateActiveDot(progress) {
      const totalSteps = this.dots.length;
      const stepProgress = 100 / totalSteps;
      const activeIndex = Math.min(
        totalSteps - 1,
        Math.floor(progress / stepProgress)
      );

      if (activeIndex !== this.currentStep) {
        this.dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === activeIndex);
        });
        this.currentStep = activeIndex;
      }
    }

    scrollToStep(index) {
      if (index < 0 || index >= this.items.length) return;
      
      const item = this.items[index];
      const offset = window.innerHeight * 0.3;
      
      window.scrollTo({
        top: item.offsetTop + this.section.offsetTop - offset,
        behavior: 'smooth'
      });
    }

    navigateToStep(index) {
      if (index < 0) index = 0;
      if (index >= this.items.length) index = this.items.length - 1;
      this.scrollToStep(index);
    }

    animateEntry(item) {
      // Staggered animation for child elements
      const elements = item.querySelectorAll('.timeline-step-label, h3, p, .timeline-features li, .timeline-stats');
      
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 100);
      });

      // Animate statistics counters
      const counters = item.querySelectorAll('.timeline-stat .value[data-count]');
      counters.forEach(counter => this.animateCounter(counter));
    }

    animateCounter(counter) {
      const target = parseInt(counter.dataset.count, 10);
      const suffix = counter.dataset.suffix || '';
      const duration = 2000;
      const startTime = performance.now();
      const startValue = 0;

      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const currentValue = Math.round(startValue + (target - startValue) * easedProgress);
        
        counter.textContent = currentValue + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }

    // Refresh method for dynamic content
    refresh() {
      this.items = this.section.querySelectorAll('.timeline-item');
      this.dots = this.section.querySelectorAll('.timeline-step-dot');
      this.updateProgress();
    }

    // Destroy method for cleanup
    destroy() {
      window.removeEventListener('scroll', this.updateProgress);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ScrollTimelineProcess());
  } else {
    new ScrollTimelineProcess();
  }

  // Expose to global scope
  window.ScrollTimelineProcess = ScrollTimelineProcess;
})();
