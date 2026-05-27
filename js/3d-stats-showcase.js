/**
 * v32.0 - 3D Statistics Showcase
 * Fortune 500 Animated 3D Counter Cards with Scroll Triggers
 */

(function() {
  'use strict';

  class StatsShowcase3D {
    constructor() {
      this.section = document.querySelector('.stats-showcase-section');
      if (!this.section) return;

      this.cards = this.section.querySelectorAll('.stat-card-3d');
      this.chartBars = this.section.querySelectorAll('.chart-bar');
      this.hasAnimated = false;

      this.init();
    }

    init() {
      this.createObservers();
      this.bindCardEvents();
      this.generateParticles();
      
      console.log('📊 BuildBridge v32.0: 3D Stats Showcase initialized');
    }

    createObservers() {
      // Section entrance observer
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasAnimated) {
              this.hasAnimated = true;
              this.animateEntry();
              this.animateChart();
              entry.target.classList.add('animate');
            }
          });
        },
        { threshold: 0.2 }
      );

      sectionObserver.observe(this.section);

      // Individual card observers
      this.cards.forEach((card, index) => {
        const cardObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  this.animateCard(card);
                }, index * 150);
                cardObserver.unobserve(card);
              }
            });
          },
          { threshold: 0.5 }
        );

        cardObserver.observe(card);
      });
    }

    bindCardEvents() {
      this.cards.forEach(card => {
        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
        card.addEventListener('mouseleave', () => this.handleMouseLeave(card));

        // Touch support
        card.addEventListener('touchmove', (e) => this.handleTouchMove(e, card), { passive: true });
        card.addEventListener('touchend', () => this.handleMouseLeave(card));
      });
    }

    handleMouseMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      // Apply 3D transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      
      // Update glow position
      const glow = card.querySelector('.stat-card-glow');
      if (glow) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glow.style.left = `${percentX}%`;
        glow.style.top = `${percentY}%`;
        glow.style.transform = 'translate(-50%, -50%)';
      }
    }

    handleTouchMove(e, card) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    }

    handleMouseLeave(card) {
      card.style.transform = '';
      const glow = card.querySelector('.stat-card-glow');
      if (glow) {
        glow.style.left = '50%';
        glow.style.top = '50%';
      }
    }

    generateParticles() {
      this.cards.forEach(card => {
        const particlesContainer = card.querySelector('.stat-card-particles');
        if (!particlesContainer) return;

        // Create 5 particles per card
        for (let i = 0; i < 5; i++) {
          const particle = document.createElement('div');
          particle.className = 'stat-particle';
          particle.style.left = `${20 + Math.random() * 60}%`;
          particle.style.bottom = '0';
          particle.style.animationDelay = `${Math.random() * 3}s`;
          particle.style.animationDuration = `${2 + Math.random() * 2}s`;
          particlesContainer.appendChild(particle);
        }
      });
    }

    animateEntry() {
      this.cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) rotateX(15deg)';

        setTimeout(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = '';
        }, index * 100);
      });
    }

    animateCard(card) {
      card.classList.add('active');

      // Animate counter
      const numberEl = card.querySelector('.stat-card-number');
      if (numberEl) {
        this.animateCounter(numberEl);
      }

      // Pulse animation
      card.classList.add('animate');
      setTimeout(() => card.classList.remove('animate'), 500);
    }

    animateCounter(element) {
      const target = parseInt(element.dataset.target, 10);
      const suffix = element.dataset.suffix || '';
      const duration = parseInt(element.dataset.duration, 10) || 2000;
      
      if (!target) return;

      const startTime = performance.now();
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const currentValue = Math.round(target * easedProgress);

        // Format large numbers
        let displayValue = currentValue.toString();
        if (target >= 1000) {
          displayValue = currentValue.toLocaleString();
        }

        element.innerHTML = `${displayValue}<span class="suffix">${suffix}</span>`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    }

    animateChart() {
      this.chartBars.forEach((bar, index) => {
        const value = bar.dataset.value;
        if (value) {
          setTimeout(() => {
            bar.style.height = `${value}%`;
          }, index * 200);
        }
      });
    }

    // Refresh method for dynamic content
    refresh() {
      this.hasAnimated = false;
      this.cards = this.section.querySelectorAll('.stat-card-3d');
      this.chartBars = this.section.querySelectorAll('.chart-bar');
      this.createObservers();
    }

    // Static method for reinitializing
    static refresh() {
      const instance = document.querySelector('.stats-showcase-section')?._statsShowcase;
      if (instance) {
        instance.refresh();
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const instance = new StatsShowcase3D();
      if (instance.section) {
        instance.section._statsShowcase = instance;
      }
    });
  } else {
    const instance = new StatsShowcase3D();
    if (instance.section) {
      instance.section._statsShowcase = instance;
    }
  }

  // Expose to global scope
  window.StatsShowcase3D = StatsShowcase3D;
})();
