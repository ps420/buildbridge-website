/**
 * v31.0 - Text Reveal Animations
 * Scroll-triggered dramatic text animations
 */

(function() {
  'use strict';

  class TextRevealAnimations {
    constructor() {
      this.elements = document.querySelectorAll('[data-text-reveal]');
      this.animated = new Set();
      this.init();
    }

    init() {
      if (this.elements.length === 0) return;

      this.processElements();

      const observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px'
        }
      );

      this.elements.forEach(el => observer.observe(el));
    }

    processElements() {
      this.elements.forEach(el => {
        const type = el.dataset.textReveal;
        
        switch(type) {
          case 'words':
            this.wrapWords(el);
            break;
          case 'chars':
            this.wrapChars(el);
            break;
          case 'lines':
            this.wrapLines(el);
            break;
          case 'split':
            this.wrapSplitText(el);
            break;
        }
      });
    }

    wrapWords(element) {
      const text = element.textContent;
      const words = text.split(' ');
      element.innerHTML = words.map(word => 
        `<span class="text-reveal-word"><span>${word}</span></span>`
      ).join(' ');
    }

    wrapChars(element) {
      const text = element.textContent;
      const chars = text.split('');
      element.innerHTML = `<span class="text-reveal-char">${
        chars.map(char => char === ' ' 
          ? ' ' 
          : `<span class="char">${char}</span>`
        ).join('')
      }</span>`;
    }

    wrapLines(element) {
      element.classList.add('text-reveal-line');
    }

    wrapSplitText(element) {
      const text = element.textContent;
      const words = text.split(' ');
      element.innerHTML = words.map(word => 
        `<span class="word-wrapper"><span class="word">${word}</span></span>`
      ).join('');
      element.classList.add('split-text-reveal');
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated.has(entry.target)) {
          this.reveal(entry.target);
          this.animated.add(entry.target);
        }
      });
    }

    reveal(element) {
      const type = element.dataset.textReveal;
      
      requestAnimationFrame(() => {
        element.classList.add('revealed');
        
        // Reveal nested elements
        const nested = element.querySelectorAll('.text-reveal-word, .text-reveal-char, .text-reveal-line, .word-wrapper');
        nested.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('revealed');
          }, index * 50);
        });
      });
    }

    // Static method for dynamic content
    static refresh() {
      new TextRevealAnimations();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TextRevealAnimations());
  } else {
    new TextRevealAnimations();
  }

  // Expose to global scope
  window.TextRevealAnimations = TextRevealAnimations;
})();
