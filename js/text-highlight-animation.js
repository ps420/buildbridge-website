/**
 * Text Highlight Animation v80.2
 * Fortune 500 Scroll-Triggered Text Effects
 */

(function() {
  'use strict';
  
  const TextHighlight = {
    options: {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px',
      once: true
    },
    
    observer: null,
    elements: [],
    
    init(options = {}) {
      this.options = { ...this.options, ...options };
      
      // Create intersection observer
      this.observer = new IntersectionObserver(
        (entries) => this.onIntersect(entries),
        {
          threshold: this.options.threshold,
          rootMargin: this.options.rootMargin
        }
      );
      
      // Find all highlight elements
      this.elements = document.querySelectorAll(
        '.highlight-text, .highlight-underline, .highlight-wave, ' +
        '.highlight-box, .highlight-marker, .highlight-glow, ' +
        '.highlight-words, .highlight-reveal, .highlight-chars, .highlight-lines'
      );
      
      this.elements.forEach(el => {
        // Add word/char wrappers if needed
        if (el.classList.contains('highlight-words')) {
          this.wrapWords(el);
        } else if (el.classList.contains('highlight-chars')) {
          this.wrapChars(el);
        }
        
        this.observer.observe(el);
      });
    },
    
    wrapWords(element) {
      const text = element.textContent;
      const words = text.split(/(\s+)/);
      
      element.innerHTML = words.map(word => {
        if (word.trim()) {
          return `<span class="word">${word}</span>`;
        }
        return word;
      }).join('');
    },
    
    wrapChars(element) {
      const text = element.textContent;
      const chars = text.split('');
      
      element.innerHTML = chars.map(char => {
        if (char === ' ') {
          return ' ';
        }
        return `<span class="char">${char}</span>`;
      }).join('');
    },
    
    onIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('animated');
          });
          
          if (this.options.once) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TextHighlight.init());
  } else {
    TextHighlight.init();
  }
  
  window.BuildBridgeTextHighlight = TextHighlight;
})();
