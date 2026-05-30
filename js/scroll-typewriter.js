/**
 * Scroll-Typewriter v121.0
 * Fortune 500 Quality Scroll-Triggered Typewriter Effect
 */

(function() {
  'use strict';

  class ScrollTypewriter {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        speed: options.speed || 50,
        delay: options.delay || 0,
        cursor: options.cursor !== false,
        cursorChar: options.cursorChar || '|',
        loop: options.loop || false,
        pauseDuration: options.pauseDuration || 2000,
        ...options
      };
      
      this.originalText = element.textContent.trim();
      this.isTyping = false;
      this.hasTyped = false;
      this.cursorElement = null;
      
      this.init();
    }

    init() {
      // Clear element and prepare for typing
      this.element.textContent = '';
      this.element.classList.add('scroll-typewriter');
      
      // Create text container
      this.textSpan = document.createElement('span');
      this.textSpan.className = 'type-text';
      this.element.appendChild(this.textSpan);
      
      // Add cursor if enabled
      if (this.options.cursor) {
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
        this.cursorElement.textContent = this.options.cursorChar;
        this.element.appendChild(this.cursorElement);
      }
      
      // Setup intersection observer for scroll trigger
      this.setupObserver();
    }

    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasTyped) {
            setTimeout(() => this.startTyping(), this.options.delay);
          }
        });
      }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      });
      
      observer.observe(this.element);
    }

    async startTyping() {
      if (this.isTyping) return;
      
      this.isTyping = true;
      this.element.classList.add('typing-active');
      
      const chars = this.originalText.split('');
      
      for (let i = 0; i < chars.length; i++) {
        this.textSpan.textContent += chars[i];
        
        // Variable typing speed for realism
        const delay = this.options.speed + (Math.random() * 30 - 15);
        await this.sleep(delay);
      }
      
      this.isTyping = false;
      this.hasTyped = true;
      this.element.classList.add('typing-complete');
      this.element.classList.remove('typing-active');
      
      // Loop if enabled
      if (this.options.loop) {
        setTimeout(() => this.resetAndType(), this.options.pauseDuration);
      }
    }

    async resetAndType() {
      this.element.classList.remove('typing-complete');
      this.hasTyped = false;
      this.textSpan.textContent = '';
      await this.sleep(500);
      this.startTyping();
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Word-by-word reveal
  class WordReveal {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        delay: options.delay || 100,
        ...options
      };
      
      this.init();
    }

    init() {
      const text = this.element.textContent.trim();
      const words = text.split(' ');
      
      this.element.textContent = '';
      this.element.classList.add('scroll-typewriter-word-reveal');
      
      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.transitionDelay = `${index * this.options.delay}ms`;
        this.element.appendChild(span);
      });
      
      this.setupObserver();
    }

    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.element.classList.add('active');
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(this.element);
    }
  }

  // Character decode effect (random chars to final)
  class DecodeEffect {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        chars: options.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
        speed: options.speed || 30,
        ...options
      };
      
      this.originalText = element.textContent.trim();
      this.init();
    }

    init() {
      this.element.classList.add('scroll-typewriter', 'decode-effect');
      this.setupObserver();
    }

    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.decode();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(this.element);
    }

    async decode() {
      const finalText = this.originalText;
      const length = finalText.length;
      let iterations = 0;
      
      const interval = setInterval(() => {
        this.element.textContent = finalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return finalText[index];
            }
            if (char === ' ') return ' ';
            return this.options.chars[Math.floor(Math.random() * this.options.chars.length)];
          })
          .join('');
        
        iterations += 1/3;
        
        if (iterations >= length) {
          clearInterval(interval);
          this.element.textContent = finalText;
        }
      }, this.options.speed);
    }
  }

  // Initialize on DOM ready
  function init() {
    // Regular typewriter elements
    document.querySelectorAll('[data-scroll-typewriter]').forEach(el => {
      const options = {
        speed: parseInt(el.dataset.typeSpeed) || 50,
        delay: parseInt(el.dataset.typeDelay) || 0,
        cursor: el.dataset.typeCursor !== 'false',
        loop: el.dataset.typeLoop === 'true'
      };
      new ScrollTypewriter(el, options);
    });
    
    // Word reveal elements
    document.querySelectorAll('[data-word-reveal]').forEach(el => {
      const options = {
        delay: parseInt(el.dataset.revealDelay) || 100
      };
      new WordReveal(el, options);
    });
    
    // Decode effect elements
    document.querySelectorAll('[data-decode-effect]').forEach(el => {
      const options = {
        speed: parseInt(el.dataset.decodeSpeed) || 30
      };
      new DecodeEffect(el, options);
    });
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.ScrollTypewriter = ScrollTypewriter;
  window.WordReveal = WordReveal;
  window.DecodeEffect = DecodeEffect;
})();
