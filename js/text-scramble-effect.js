/**
 * BuildBridge Text Scramble Effect
 * Fortune 500 Quality - Cyberpunk-style text decode animation on hover
 */

class TextScramble {
  constructor(el, options = {}) {
    this.el = el;
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________';
    this.updateInterval = options.interval || 50;
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
    this.isAnimating = false;
    this.originalText = el.textContent;
    
    this.init();
  }

  init() {
    // Store original text
    this.el.dataset.originalText = this.originalText;
    
    // Add hover listeners
    this.el.addEventListener('mouseenter', () => this.scramble());
    this.el.addEventListener('mouseleave', () => this.restore());
    
    // Add focus listeners for accessibility
    this.el.addEventListener('focus', () => this.scramble());
    this.el.addEventListener('blur', () => this.restore());
    
    // Make focusable if it's a heading
    if (this.el.matches('h1, h2, h3, h4, h5, h6')) {
      this.el.setAttribute('tabindex', '0');
      this.el.style.outline = 'none';
    }
  }

  scramble() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const text = this.originalText;
    const length = text.length;
    const scrambleLength = Math.min(length, 15); // Limit scramble for performance
    
    // Create queue of animation frames
    this.queue = [];
    for (let i = 0; i < scrambleLength; i++) {
      const from = this.randomChar();
      const to = text[i] === ' ' ? ' ' : text[i];
      const start = Math.floor(Math.random() * 10);
      const end = start + Math.floor(Math.random() * 10) + 5;
      this.queue.push({ from, to, start, end, char: from });
    }
    
    // Add remaining characters
    for (let i = scrambleLength; i < length; i++) {
      this.queue.push({ char: text[i], final: true });
    }
    
    this.frame = 0;
    this.update();
  }

  restore() {
    // Cancel animation and restore original text
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.el.textContent = this.originalText;
    this.isAnimating = false;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char, final } = this.queue[i];
      
      if (final) {
        output += char;
        complete++;
        continue;
      }
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }

    this.el.textContent = output;

    if (complete === this.queue.length) {
      this.isAnimating = false;
    } else {
      this.frame++;
      this.frameRequest = requestAnimationFrame(() => this.update());
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Initialize scramble effect on elements with specific class
function initTextScramble() {
  const elements = document.querySelectorAll('[data-scramble], .scramble-hover, .section-header h2');
  
  elements.forEach(el => {
    // Skip if already initialized
    if (el.dataset.scrambleInitialized) return;
    el.dataset.scrambleInitialized = 'true';
    
    new TextScramble(el, {
      chars: '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      interval: 40
    });
  });
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initTextScramble);

// Export for manual initialization
window.TextScramble = TextScramble;
window.initTextScramble = initTextScramble;

console.log('🔤 Text Scramble Effect initialized');
