/**
 * v90.0: Advanced Text Mask Reveal V2
 * Sophisticated text reveal animations
 */

(function() {
  'use strict';

  class TextMaskRevealV2 {
    constructor(options = {}) {
      this.options = {
        selector: '.text-mask-reveal, .text-clip-reveal, .char-wave-reveal, .word-stagger-reveal',
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
        ...options
      };
      
      this.elements = [];
      this.observer = null;
      
      this.init();
    }

    init() {
      this.findElements();
      this.setupObserver();
      this.setupScrollTriggers();
    }

    findElements() {
      this.elements = Array.from(document.querySelectorAll(this.options.selector));
      
      // Setup specific reveal types
      this.elements.forEach(el => {
        if (el.classList.contains('char-wave-reveal')) {
          this.setupCharWave(el);
        } else if (el.classList.contains('word-stagger-reveal')) {
          this.setupWordStagger(el);
        } else if (el.classList.contains('text-scramble-v2')) {
          el.dataset.text = el.textContent;
        }
      });
    }

    setupCharWave(element) {
      const text = element.textContent;
      element.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${index * 0.03}s`;
        element.appendChild(span);
      });
    }

    setupWordStagger(element) {
      const text = element.textContent;
      element.innerHTML = '';
      
      text.split(' ').forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.transitionDelay = `${index * 0.08}s`;
        element.appendChild(span);
        
        // Add space after word
        if (index < text.split(' ').length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
      });
    }

    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.reveal(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      });

      this.elements.forEach(el => this.observer.observe(el));
    }

    setupScrollTriggers() {
      // Line reveal setup
      const lineReveals = document.querySelectorAll('.split-line-reveal');
      lineReveals.forEach(el => {
        const text = el.textContent;
        el.innerHTML = `<span class="line-inner">${text}</span>`;
        this.observer.observe(el);
      });
      
      // 3D Flip setup
      const flipElements = document.querySelectorAll('.text-3d-flip');
      flipElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = `<span class="text-3d-flip-inner">${text}</span>`;
        this.observer.observe(el);
      });
    }

    reveal(element) {
      requestAnimationFrame(() => {
        element.classList.add('revealed');
        
        // Handle typewriter effect
        if (element.classList.contains('typewriter-text')) {
          this.animateTypewriter(element);
        }
        
        // Handle glitch effect
        if (element.classList.contains('text-glitch')) {
          setTimeout(() => element.classList.remove('revealed'), 500);
        }
        
        // Handle text scramble V2
        if (element.classList.contains('text-scramble-v2')) {
          this.animateScramble(element);
        }
      });
    }

    animateTypewriter(element) {
      const text = element.textContent;
      element.textContent = '';
      element.classList.remove('typing-complete');
      
      let i = 0;
      const type = () => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, 50 + Math.random() * 50);
        } else {
          element.classList.add('typing-complete');
        }
      };
      
      type();
    }

    animateScramble(element) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const originalText = element.dataset.text;
      let iteration = 0;
      
      const interval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        
        iteration += 1/3;
      }, 30);
    }

    // Public method to manually trigger reveal
    revealAll() {
      this.elements.forEach(el => this.reveal(el));
    }

    destroy() {
      this.observer?.disconnect();
    }
  }

  // Wave text animation for decorative elements
  class WaveTextAnimator {
    constructor() {
      this.elements = document.querySelectorAll('.text-wave-animated');
      this.init();
    }

    init() {
      this.elements.forEach(el => {
        this.setupWave(el);
      });
    }

    setupWave(element) {
      const text = element.textContent;
      element.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'wave-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${index * 0.1}s`;
        element.appendChild(span);
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.textMaskReveal = new TextMaskRevealV2();
      window.waveTextAnimator = new WaveTextAnimator();
    });
  } else {
    window.textMaskReveal = new TextMaskRevealV2();
    window.waveTextAnimator = new WaveTextAnimator();
  }
})();
