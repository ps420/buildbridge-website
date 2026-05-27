/**
 * Text Reveal Animations - v25.0
 * Fortune 500 quality text reveal effects
 * Split text, character animations, and word reveals
 */

class TextRevealAnimations {
  constructor() {
    this.observer = null;
    this.elements = [];
    this.animatedElements = new WeakSet();
    
    this.init();
  }
  
  init() {
    // Don't run on reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.setupObserver();
    this.findAndAnimateElements();
    this.observeMutations();
    
    console.log('[Text Reveal] Initialized');
  }
  
  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target);
          this.animatedElements.add(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -50px 0px'
    });
  }
  
  findAndAnimateElements() {
    // Find all elements with reveal data attributes
    const selectors = [
      '[data-reveal="chars"]',
      '[data-reveal="words"]',
      '[data-reveal="lines"]',
      '[data-reveal="clip"]',
      '[data-reveal="slide"]',
      '[data-reveal="fade"]',
      '[data-reveal="up"]',
      '[data-reveal="scale"]'
    ];
    
    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      this.prepareElement(el);
      this.observer.observe(el);
    });
  }
  
  prepareElement(el) {
    const type = el.dataset.reveal;
    
    switch(type) {
      case 'chars':
        this.splitIntoChars(el);
        break;
      case 'words':
        this.splitIntoWords(el);
        break;
      case 'lines':
        this.splitIntoLines(el);
        break;
      case 'clip':
        this.prepareClipReveal(el);
        break;
      default:
        this.prepareBasicReveal(el, type);
    }
  }
  
  splitIntoChars(el) {
    const text = el.textContent || '';
    el.innerHTML = '';
    el.style.opacity = '1';
    
    const chars = text.split('');
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'reveal-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: ${i * 0.03}s;
      `;
      el.appendChild(span);
    });
    
    el.classList.add('chars-split');
  }
  
  splitIntoWords(el) {
    const text = el.textContent || '';
    el.innerHTML = '';
    el.style.opacity = '1';
    
    const words = text.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'reveal-word';
      span.innerHTML = `${word}${i < words.length - 1 ? '\u00A0' : ''}`;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: ${i * 0.08}s;
      `;
      el.appendChild(span);
    });
    
    el.classList.add('words-split');
  }
  
  splitIntoLines(el) {
    el.style.overflow = 'hidden';
    el.style.opacity = '1';
    
    // Wrap each line in a span if not already done
    if (!el.classList.contains('lines-split')) {
      const text = el.innerHTML;
      el.innerHTML = `<span class="reveal-line-wrapper" style="display: block; overflow: hidden;">
        <span class="reveal-line" style="display: block; transform: translateY(100%); transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);">${text}</span>
      </span>`;
      el.classList.add('lines-split');
    }
  }
  
  prepareClipReveal(el) {
    el.style.cssText += `
      clip-path: inset(0 100% 0 0);
      transition: clip-path 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 1;
    `;
    el.classList.add('clip-reveal');
  }
  
  prepareBasicReveal(el, type) {
    el.style.opacity = '0';
    el.classList.add(`reveal-${type}`);
    
    const transitions = {
      slide: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
      fade: 'opacity 0.6s ease',
      up: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
      scale: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease'
    };
    
    el.style.transition = transitions[type] || transitions.fade;
    
    // Set initial state based on type
    if (type === 'slide') {
      el.style.transform = 'translateX(-30px)';
    } else if (type === 'up') {
      el.style.transform = 'translateY(30px)';
    } else if (type === 'scale') {
      el.style.transform = 'scale(0.9)';
    }
  }
  
  animateElement(el) {
    const type = el.dataset.reveal;
    
    // Add delay if specified
    const delay = el.dataset.revealDelay || 0;
    
    setTimeout(() => {
      switch(type) {
        case 'chars':
          this.animateChars(el);
          break;
        case 'words':
          this.animateWords(el);
          break;
        case 'lines':
          this.animateLines(el);
          break;
        case 'clip':
          this.animateClip(el);
          break;
        default:
          this.animateBasic(el, type);
      }
      
      el.classList.add('revealed');
    }, delay * 1000);
  }
  
  animateChars(el) {
    el.querySelectorAll('.reveal-char').forEach((char, i) => {
      setTimeout(() => {
        char.style.opacity = '1';
        char.style.transform = 'translateY(0)';
      }, i * 30);
    });
  }
  
  animateWords(el) {
    el.querySelectorAll('.reveal-word').forEach((word, i) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, i * 80);
    });
  }
  
  animateLines(el) {
    const line = el.querySelector('.reveal-line');
    if (line) {
      line.style.transform = 'translateY(0)';
    }
  }
  
  animateClip(el) {
    el.style.clipPath = 'inset(0 0% 0 0)';
  }
  
  animateBasic(el, type) {
    el.style.opacity = '1';
    el.style.transform = 'translate(0) scale(1)';
  }
  
  observeMutations() {
    // Watch for new elements added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.matches && node.matches('[data-reveal]')) {
              this.prepareElement(node);
              this.observer.observe(node);
            }
            
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-reveal]').forEach(el => {
                this.prepareElement(el);
                this.observer.observe(el);
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Utility: Refresh all elements
  refresh() {
    this.findAndAnimateElements();
  }
  
  // Utility: Trigger animation for specific element
  trigger(el) {
    if (typeof el === 'string') {
      el = document.querySelector(el);
    }
    if (el) {
      this.animateElement(el);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.textReveal = new TextRevealAnimations();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextRevealAnimations;
}
