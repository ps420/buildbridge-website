/**
 * BuildBridge - Split Text Controller v17.2
 * Controls character-by-character text reveal animations
 * Fortune 500 Quality Typography Animation System
 */

(function() {
  'use strict';

  class SplitTextController {
    constructor(elements, options = {}) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.options = {
        type: options.type || 'chars', // 'chars', 'words', 'lines'
        animation: options.animation || 'reveal-up',
        stagger: options.stagger || 'char',
        duration: options.duration || 600,
        delay: options.delay || 0,
        threshold: options.threshold || 0.2,
        once: options.once !== false,
        ...options
      };
      
      this.splitElements = [];
      this.observer = null;
      
      this.init();
    }
    
    init() {
      if (!this.elements || this.elements.length === 0) return;
      
      this.elements.forEach(el => this.processElement(el));
      this.setupIntersectionObserver();
    }
    
    processElement(element) {
      const text = element.textContent;
      const type = element.dataset.splitType || this.options.type;
      const animation = element.dataset.splitAnimation || this.options.animation;
      
      element.classList.add('split-text', `split-text--${animation}`);
      element.dataset.stagger = element.dataset.stagger || this.options.stagger;
      
      let html = '';
      
      switch(type) {
        case 'chars':
          html = this.splitIntoChars(text);
          break;
        case 'words':
          html = this.splitIntoWords(text);
          break;
        case 'lines':
          html = this.splitIntoLines(text);
          break;
        case 'chars-words':
          html = this.splitIntoCharsAndWords(text);
          break;
        default:
          html = this.splitIntoChars(text);
      }
      
      element.innerHTML = html;
      this.splitElements.push(element);
    }
    
    splitIntoChars(text) {
      return text.split('').map((char, index) => {
        if (char === ' ') {
          return '<span class="char">&nbsp;</span>';
        }
        return `<span class="char" style="transition-delay: ${index * 30}ms">${char}</span>`;
      }).join('');
    }
    
    splitIntoWords(text) {
      return text.split(' ').map((word, index) => {
        return `<span class="word" style="transition-delay: ${index * 100}ms">${word}</span>`;
      }).join(' ');
    }
    
    splitIntoLines(text) {
      const lines = text.split('\n');
      return lines.map((line, index) => {
        return `<span class="line" style="transition-delay: ${index * 200}ms">${line}</span>`;
      }).join('');
    }
    
    splitIntoCharsAndWords(text) {
      return text.split(' ').map((word, wordIndex) => {
        const chars = word.split('').map((char, charIndex) => {
          const delay = (wordIndex * 100) + (charIndex * 30);
          return `<span class="char" style="transition-delay: ${delay}ms">${char}</span>`;
        }).join('');
        return `<span class="word">${chars}</span>`;
      }).join(' ');
    }
    
    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        // Fallback: reveal immediately
        this.splitElements.forEach(el => el.classList.add('revealed'));
        return;
      }
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.revealDelay) || 0;
            
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            
            if (this.options.once) {
              this.observer.unobserve(entry.target);
            }
          } else if (!this.options.once) {
            entry.target.classList.remove('revealed');
          }
        });
      }, {
        threshold: this.options.threshold,
        rootMargin: '0px 0px -50px 0px'
      });
      
      this.splitElements.forEach(el => this.observer.observe(el));
    }
    
    revealAll() {
      this.splitElements.forEach(el => el.classList.add('revealed'));
    }
    
    hideAll() {
      this.splitElements.forEach(el => el.classList.remove('revealed'));
    }
    
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
      
      // Restore original text
      this.splitElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = text;
        el.classList.remove('split-text', `split-text--${this.options.animation}`);
      });
    }
  }
  
  // Typewriter Effect Controller
  class TypewriterController {
    constructor(element, options = {}) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      this.options = {
        speed: options.speed || 50,
        delay: options.delay || 0,
        cursor: options.cursor !== false,
        ...options
      };
      
      this.text = '';
      this.currentIndex = 0;
      this.isTyping = false;
      
      if (this.element) {
        this.init();
      }
    }
    
    init() {
      this.text = this.element.textContent;
      this.element.textContent = '';
      this.element.classList.add('typewriter');
      
      setTimeout(() => this.start(), this.options.delay);
    }
    
    start() {
      this.isTyping = true;
      this.type();
    }
    
    type() {
      if (this.currentIndex < this.text.length) {
        this.element.textContent += this.text.charAt(this.currentIndex);
        this.currentIndex++;
        setTimeout(() => this.type(), this.options.speed);
      } else {
        this.isTyping = false;
        this.element.classList.add('typing-complete');
      }
    }
    
    reset() {
      this.currentIndex = 0;
      this.element.textContent = '';
      this.element.classList.remove('typing-complete');
      this.start();
    }
  }
  
  // Wave Animation Controller
  class WaveTextController {
    constructor(elements) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.init();
    }
    
    init() {
      this.elements.forEach(el => {
        const text = el.textContent;
        const chars = text.split('').map((char, index) => {
          return `<span class="char" style="animation-delay: ${index * 0.05}s">${char === ' ' ? '&nbsp;' : char}</span>`;
        }).join('');
        
        el.innerHTML = chars;
        el.classList.add('wave-text');
        
        // Trigger on hover
        el.addEventListener('mouseenter', () => el.classList.add('active'));
        el.addEventListener('mouseleave', () => el.classList.remove('active'));
      });
    }
  }
  
  // Glitch Effect Controller
  class GlitchTextController {
    constructor(elements, options = {}) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.options = {
        interval: options.interval || 5000,
        duration: options.duration || 300,
        ...options
      };
      
      this.init();
    }
    
    init() {
      this.elements.forEach(el => {
        el.dataset.text = el.textContent;
        el.classList.add('glitch-text');
        
        setInterval(() => {
          el.classList.add('active');
          setTimeout(() => el.classList.remove('active'), this.options.duration);
        }, this.options.interval);
      });
    }
  }
  
  // Mask Reveal Controller
  class MaskRevealController {
    constructor(elements, options = {}) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.options = {
        threshold: options.threshold || 0.3,
        ...options
      };
      
      this.init();
    }
    
    init() {
      if (!('IntersectionObserver' in window)) {
        this.elements.forEach(el => el.classList.add('revealed'));
        return;
      }
      
      this.elements.forEach(el => {
        const content = el.innerHTML;
        el.innerHTML = `<span class="mask-reveal__content">${content}</span>`;
        el.classList.add('mask-reveal');
      });
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: this.options.threshold });
      
      this.elements.forEach(el => observer.observe(el));
    }
  }
  
  // Initialize on DOM ready
  function initSplitText() {
    // Auto-initialize elements with data attributes
    const splitTextElements = document.querySelectorAll('[data-split-text]');
    if (splitTextElements.length > 0) {
      splitTextElements.forEach(el => {
        const type = el.dataset.splitType || 'chars';
        const animation = el.dataset.splitAnimation || 'reveal-up';
        
        new SplitTextController(el, { type, animation });
      });
    }
    
    // Initialize typewriter effects
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    typewriterElements.forEach(el => {
      const speed = parseInt(el.dataset.typewriterSpeed) || 50;
      const delay = parseInt(el.dataset.typewriterDelay) || 0;
      new TypewriterController(el, { speed, delay });
    });
    
    // Initialize wave text
    const waveElements = document.querySelectorAll('[data-wave-text]');
    if (waveElements.length > 0) {
      new WaveTextController(waveElements);
    }
    
    // Initialize glitch effect
    const glitchElements = document.querySelectorAll('[data-glitch]');
    if (glitchElements.length > 0) {
      new GlitchTextController(glitchElements);
    }
    
    // Initialize mask reveal
    const maskElements = document.querySelectorAll('[data-mask-reveal]');
    if (maskElements.length > 0) {
      new MaskRevealController(maskElements);
    }
    
    console.log('✨ Split Text Controller initialized');
  }
  
  // Expose to global
  window.SplitTextController = SplitTextController;
  window.TypewriterController = TypewriterController;
  window.WaveTextController = WaveTextController;
  window.GlitchTextController = GlitchTextController;
  window.MaskRevealController = MaskRevealController;
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplitText);
  } else {
    initSplitText();
  }
})();