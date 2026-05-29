/**
 * Scroll Counter Pro v81.1
 * Fortune 500 Animated Statistics
 */

(function() {
  'use strict';

  const ScrollCounterPro = {
    counters: [],
    observer: null,
    animatedCounters: new Set(),
    
    init() {
      this.counters = document.querySelectorAll('[data-counter-pro]');
      if (this.counters.length === 0) return;
      
      this.createObserver();
      this.counters.forEach(counter => {
        this.observer.observe(counter);
      });
    },
    
    createObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedCounters.has(entry.target)) {
            this.animateCounter(entry.target);
            this.animatedCounters.add(entry.target);
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      });
    },
    
    animateCounter(element) {
      const target = parseInt(element.dataset.counterPro, 10) || 0;
      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      const duration = parseInt(element.dataset.duration, 10) || 2000;
      const easing = element.dataset.easing || 'easeOutExpo';
      
      // Make visible first
      element.classList.add('visible');
      
      // Get value element
      const valueEl = element.querySelector('.scroll-counter-value') || element;
      const prefixEl = element.querySelector('.scroll-counter-prefix');
      const suffixEl = element.querySelector('.scroll-counter-suffix');
      
      if (prefixEl) prefixEl.textContent = prefix;
      if (suffixEl) suffixEl.textContent = suffix;
      
      // Animate ring if present
      const ringProgress = element.querySelector('.scroll-counter-ring-progress');
      if (ringProgress) {
        const percentage = Math.min((target / parseInt(element.dataset.max, 10)) * 100, 100);
        const circumference = 2 * Math.PI * 70; // r=70
        const offset = circumference - (percentage / 100) * circumference;
        
        setTimeout(() => {
          ringProgress.style.strokeDashoffset = offset;
        }, 100);
      }
      
      // Animate bar if present
      const barFill = element.querySelector('.scroll-counter-bar-fill');
      if (barFill) {
        const max = parseInt(element.dataset.max, 10) || 100;
        const percentage = Math.min((target / max) * 100, 100);
        setTimeout(() => {
          barFill.style.width = `${percentage}%`;
        }, 100);
      }
      
      // Animate number
      this.animateNumber(valueEl, target, duration, easing);
      
      // Trigger confetti for special milestones
      if (target >= 100 && element.dataset.celebrate) {
        setTimeout(() => {
          this.triggerMiniCelebration(element);
        }, duration);
      }
    },
    
    animateNumber(element, target, duration, easingName) {
      const startTime = performance.now();
      const startValue = 0;
      
      const easings = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => 1 - (1 - t) * (1 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeOutElastic: t => {
          const c4 = (2 * Math.PI) / 3;
          return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        }
      };
      
      const easing = easings[easingName] || easings.easeOutExpo;
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
        
        // Format number with commas
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = target.toLocaleString();
        }
      };
      
      requestAnimationFrame(update);
    },
    
    triggerMiniCelebration(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create mini confetti burst
      for (let i = 0; i < 30; i++) {
        this.createConfettiParticle(centerX, centerY);
      }
    },
    
    createConfettiParticle(x, y) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${['#C9CED6', '#F5F7FA', '#ffffff', '#e0e0e0'][Math.floor(Math.random() * 4)]};
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 9999;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      
      document.body.appendChild(particle);
      
      const angle = (Math.random() * Math.PI * 2);
      const velocity = Math.random() * 150 + 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 100;
      let posX = x;
      let posY = y;
      let opacity = 1;
      
      const animate = () => {
        posX += vx * 0.02;
        posY += vy * 0.02 + 2;
        opacity -= 0.02;
        
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = opacity;
        particle.style.transform = `rotate(${posX * 2}deg)`;
        
        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    // Reset counter for replay
    reset(counterElement) {
      this.animatedCounters.delete(counterElement);
      counterElement.classList.remove('visible');
      
      const valueEl = counterElement.querySelector('.scroll-counter-value');
      if (valueEl) valueEl.textContent = '0';
      
      const ringProgress = counterElement.querySelector('.scroll-counter-ring-progress');
      if (ringProgress) {
        ringProgress.style.strokeDashoffset = '440';
      }
      
      const barFill = counterElement.querySelector('.scroll-counter-bar-fill');
      if (barFill) {
        barFill.style.width = '0';
      }
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollCounterPro.init());
  } else {
    ScrollCounterPro.init();
  }

  window.BuildBridgeScrollCounterPro = ScrollCounterPro;
})();
