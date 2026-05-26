// BuildBridge - Text Spotlight / Highlight Animation
// Fortune 500-style text reveal with spotlight effect
// Version 5.0 Professional Enhancement

class TextSpotlight {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      color: options.color || 'var(--chrome)',
      backgroundColor: options.backgroundColor || 'rgba(201, 206, 214, 0.15)',
      duration: options.duration || 1500,
      stagger: options.stagger || 100,
      trigger: options.trigger || 'scroll', // 'scroll', 'hover', 'load'
      ...options
    };
    
    this.originalText = '';
    this.words = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.originalText = this.element.textContent;
    this.wrapWords();
    this.setupTrigger();
  }
  
  wrapWords() {
    const text = this.element.textContent;
    this.element.innerHTML = '';
    this.element.classList.add('spotlight-text');
    
    // Split into words, preserving whitespace
    const parts = text.split(/(\s+)/);
    
    parts.forEach((part, index) => {
      if (part.trim() === '') {
        // Preserve whitespace
        this.element.appendChild(document.createTextNode(part));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'spotlight-word';
        wordSpan.textContent = part;
        wordSpan.style.transitionDelay = `${index * this.options.stagger}ms`;
        
        // Create highlight background
        const highlight = document.createElement('span');
        highlight.className = 'spotlight-highlight';
        wordSpan.appendChild(highlight);
        
        this.element.appendChild(wordSpan);
        this.words.push(wordSpan);
      }
    });
  }
  
  setupTrigger() {
    switch (this.options.trigger) {
      case 'scroll':
        this.setupScrollTrigger();
        break;
      case 'hover':
        this.setupHoverTrigger();
        break;
      case 'load':
        this.animate();
        break;
    }
  }
  
  setupScrollTrigger() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    this.observer.observe(this.element);
  }
  
  setupHoverTrigger() {
    this.element.addEventListener('mouseenter', () => this.animate());
    this.element.addEventListener('mouseleave', () => this.reset());
  }
  
  animate() {
    this.element.classList.add('spotlight-active');
    
    this.words.forEach((word, index) => {
      setTimeout(() => {
        word.classList.add('highlighted');
      }, index * this.options.stagger);
    });
  }
  
  reset() {
    this.element.classList.remove('spotlight-active');
    this.words.forEach(word => {
      word.classList.remove('highlighted');
    });
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.element.textContent = this.originalText;
    this.element.classList.remove('spotlight-text', 'spotlight-active');
  }
}

// Scroll-Linked Highlight - Highlights text based on scroll position
class ScrollLinkedHighlight {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      highlightColor: options.highlightColor || 'var(--white)',
      defaultColor: options.defaultColor || 'var(--slate)',
      ...options
    };
    
    this.sentences = [];
    this.init();
  }
  
  init() {
    this.wrapSentences();
    this.bindScroll();
  }
  
  wrapSentences() {
    const text = this.element.innerHTML;
    
    // Split by sentence endings while preserving them
    const sentences = text.split(/([.!?]+(?:\s+|$))/);
    
    this.element.innerHTML = '';
    this.element.classList.add('scroll-highlight-text');
    
    sentences.forEach((part, index) => {
      if (part.trim()) {
        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'scroll-highlight-sentence';
        sentenceSpan.innerHTML = part;
        sentenceSpan.style.color = this.options.defaultColor;
        sentenceSpan.style.transition = 'color 0.3s ease, text-shadow 0.3s ease';
        
        this.element.appendChild(sentenceSpan);
        this.sentences.push(sentenceSpan);
      }
    });
  }
  
  bindScroll() {
    const updateHighlight = () => {
      const scrollProgress = this.getScrollProgress();
      const activeIndex = Math.floor(scrollProgress * this.sentences.length);
      
      this.sentences.forEach((sentence, index) => {
        if (index <= activeIndex) {
          sentence.style.color = this.options.highlightColor;
          sentence.style.textShadow = '0 0 20px rgba(245, 247, 250, 0.3)';
        } else {
          sentence.style.color = this.options.defaultColor;
          sentence.style.textShadow = 'none';
        }
      });
    };
    
    window.addEventListener('scroll', updateHighlight, { passive: true });
    updateHighlight();
  }
  
  getScrollProgress() {
    const rect = this.element.getBoundingClientRect();
    const elementTop = rect.top;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the element has been scrolled through
    const start = windowHeight;
    const end = -elementHeight;
    const current = elementTop;
    
    return Math.max(0, Math.min(1, (start - current) / (start - end)));
  }
}

// Character-by-character spotlight
class CharacterSpotlight {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      cursor: options.cursor !== false,
      cursorChar: options.cursorChar || '|',
      speed: options.speed || 50,
      deleteSpeed: options.deleteSpeed || 30,
      pause: options.pause || 2000,
      loop: options.loop || false,
      ...options
    };
    
    this.texts = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    // Get texts from data attribute or element content
    if (this.element.dataset.texts) {
      this.texts = JSON.parse(this.element.dataset.texts);
    } else {
      this.texts = [this.element.textContent];
    }
    
    this.element.textContent = '';
    this.element.classList.add('character-spotlight');
    
    if (this.options.cursor) {
      const cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      cursor.textContent = this.options.cursorChar;
      this.element.appendChild(cursor);
    }
    
    this.start();
  }
  
  async start() {
    this.isAnimating = true;
    
    while (this.isAnimating) {
      const text = this.texts[this.currentIndex];
      
      // Type out
      await this.typeText(text);
      
      // Pause
      await this.sleep(this.options.pause);
      
      if (this.texts.length > 1 || this.options.loop) {
        // Delete
        await this.deleteText();
        
        // Move to next text
        this.currentIndex = (this.currentIndex + 1) % this.texts.length;
      } else {
        break;
      }
    }
    
    this.isAnimating = false;
  }
  
  async typeText(text) {
    for (let i = 0; i <= text.length; i++) {
      this.element.firstChild.textContent = text.substring(0, i);
      await this.sleep(this.options.speed);
    }
  }
  
  async deleteText() {
    const text = this.texts[this.currentIndex];
    for (let i = text.length; i >= 0; i--) {
      this.element.firstChild.textContent = text.substring(0, i);
      await this.sleep(this.options.deleteSpeed);
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  stop() {
    this.isAnimating = false;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize spotlight text
  document.querySelectorAll('[data-spotlight]').forEach(el => {
    new TextSpotlight(el, {
      trigger: el.dataset.spotlight || 'scroll'
    });
  });
  
  // Initialize scroll-linked highlight
  document.querySelectorAll('[data-scroll-highlight]').forEach(el => {
    new ScrollLinkedHighlight(el);
  });
  
  // Initialize character spotlight
  document.querySelectorAll('[data-character-spotlight]').forEach(el => {
    new CharacterSpotlight(el, {
      loop: el.dataset.loop === 'true',
      speed: parseInt(el.dataset.speed) || 50
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextSpotlight, ScrollLinkedHighlight, CharacterSpotlight };
}
