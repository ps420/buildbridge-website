/**
 * LETTER-BY-LETTER TEXT REVEAL - BuildBridge
 * v36.0 Fortune 500 Typography Animation
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    defaultAnimation: 'slide',
    revealThreshold: 0.2,
    staggerDelay: 30,
    wordStaggerDelay: 80
  };

  /**
   * Initialize letter reveal animations
   */
  function init() {
    // Process elements with data-letter-reveal attribute
    document.querySelectorAll('[data-letter-reveal]').forEach(el => {
      const animation = el.dataset.letterReveal || CONFIG.defaultAnimation;
      splitIntoLetters(el, animation);
    });
    
    // Process elements with data-word-reveal attribute
    document.querySelectorAll('[data-word-reveal]').forEach(el => {
      splitIntoWords(el);
    });
    
    // Process elements with data-line-reveal attribute
    document.querySelectorAll('[data-line-reveal]').forEach(el => {
      splitIntoLines(el);
    });
    
    // Initialize intersection observer
    initObserver();
    
    // Handle already visible elements
    handleScroll();
  }

  /**
   * Split text into individual letter spans
   */
  function splitIntoLetters(element, animation) {
    // Get text content
    const text = element.textContent.trim();
    if (!text) return;
    
    // Clear element and add base class
    element.innerHTML = '';
    element.classList.add('letter-reveal', `letter-reveal--${animation}`);
    
    // Split into words to preserve spacing
    const words = text.split(' ');
    
    words.forEach((word, wordIndex) => {
      // Create word wrapper
      const wordSpan = document.createElement('span');
      wordSpan.className = 'letter-reveal-word';
      
      // Split word into characters
      const chars = word.split('');
      chars.forEach((char, charIndex) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'letter-reveal-char';
        charSpan.textContent = char;
        charSpan.style.setProperty('--char-index', charIndex);
        
        // Handle spaces
        if (char === ' ') {
          charSpan.style.width = '0.3em';
        }
        
        wordSpan.appendChild(charSpan);
      });
      
      element.appendChild(wordSpan);
      
      // Add space between words (except last)
      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
    
    // Store original text for accessibility
    element.setAttribute('aria-label', text);
  }

  /**
   * Split text into word spans
   */
  function splitIntoWords(element) {
    const text = element.textContent.trim();
    if (!text) return;
    
    element.innerHTML = '';
    element.classList.add('word-reveal');
    
    const words = text.split(' ');
    
    words.forEach((word, index) => {
      const wordWrapper = document.createElement('span');
      wordWrapper.className = 'word-reveal-word';
      
      const wordInner = document.createElement('span');
      wordInner.className = 'word-reveal-inner';
      wordInner.textContent = word;
      wordInner.style.transitionDelay = `${index * CONFIG.wordStaggerDelay}ms`;
      
      wordWrapper.appendChild(wordInner);
      element.appendChild(wordWrapper);
      
      if (index < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  }

  /**
   * Split text into line spans
   */
  function splitIntoLines(element) {
    const text = element.textContent.trim();
    if (!text) return;
    
    element.innerHTML = '';
    element.classList.add('line-reveal');
    
    // Split by newlines or create lines
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      const lineSpan = document.createElement('span');
      lineSpan.className = 'line-reveal-line';
      lineSpan.textContent = line || '\u00A0'; // Non-breaking space for empty lines
      lineSpan.style.transitionDelay = `${index * 0.15}s`;
      
      element.appendChild(lineSpan);
    });
  }

  /**
   * Initialize intersection observer for reveal triggers
   */
  function initObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: CONFIG.revealThreshold
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // Observe all reveal elements
    document.querySelectorAll('.letter-reveal, .word-reveal, .line-reveal').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Reveal an element with animation
   */
  function revealElement(element) {
    // Add slight delay for dramatic effect
    setTimeout(() => {
      element.classList.add('revealed');
      
      // Trigger custom event
      element.dispatchEvent(new CustomEvent('letterReveal:complete', {
        bubbles: true
      }));
    }, 100);
  }

  /**
   * Handle scroll for elements not using IntersectionObserver
   */
  function handleScroll() {
    const reveals = document.querySelectorAll('.letter-reveal:not(.revealed), .word-reveal:not(.revealed), .line-reveal:not(.revealed)');
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * (1 - CONFIG.revealThreshold);
    
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < triggerPoint) {
        revealElement(el);
      }
    });
  }

  /**
   * Manually trigger reveal on an element
   */
  function reveal(elementId) {
    const element = typeof elementId === 'string' 
      ? document.getElementById(elementId) 
      : elementId;
      
    if (element && element.classList.contains('letter-reveal')) {
      revealElement(element);
    }
  }

  /**
   * Reset an element to hidden state
   */
  function reset(elementId) {
    const element = typeof elementId === 'string' 
      ? document.getElementById(elementId) 
      : elementId;
      
    if (element) {
      element.classList.remove('revealed');
    }
  }

  /**
   * Process dynamic content
   */
  function processNewContent(container) {
    const scope = container || document;
    
    scope.querySelectorAll('[data-letter-reveal]:not(.letter-reveal)').forEach(el => {
      const animation = el.dataset.letterReveal || CONFIG.defaultAnimation;
      splitIntoLetters(el, animation);
    });
    
    scope.querySelectorAll('[data-word-reveal]:not(.word-reveal)').forEach(el => {
      splitIntoWords(el);
    });
    
    scope.querySelectorAll('[data-line-reveal]:not(.line-reveal)').forEach(el => {
      splitIntoLines(el);
    });
    
    // Reinitialize observer for new elements
    initObserver();
  }

  /**
   * Animation presets for quick use
   */
  const presets = {
    hero: 'slide',
    headline: 'cascade',
    subtitle: 'fade-up',
    title: 'flip',
    quote: 'left',
    stats: 'scale'
  };

  /**
   * Apply preset animation to element
   */
  function applyPreset(element, presetName) {
    const animation = presets[presetName] || CONFIG.defaultAnimation;
    element.dataset.letterReveal = animation;
    splitIntoLetters(element, animation);
    initObserver();
  }

  // Bind scroll event for fallback
  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleScroll);
  }, { passive: true });

  /**
   * Public API
   */
  window.LetterReveal = {
    init,
    reveal,
    reset,
    processNewContent,
    applyPreset,
    splitIntoLetters,
    splitIntoWords,
    splitIntoLines,
    presets
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
