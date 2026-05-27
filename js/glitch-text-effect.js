/**
 * v32.0 - Glitch Text Effect
 * Cyberpunk-inspired text animations with decode effect
 */

class GlitchText {
  constructor(element, options = {}) {
    this.element = element;
    this.originalText = element.textContent;
    this.isDecoding = false;
    
    // Config
    this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________';
    this.duration = options.duration || 1000;
    this.frameRate = options.frameRate || 30;
    
    // Set data-text for CSS pseudo-elements
    element.setAttribute('data-text', this.originalText);
    
    this.init();
  }
  
  init() {
    // Add hover listeners if decode on hover
    if (this.element.classList.contains('glitch-text--decode')) {
      this.element.addEventListener('mouseenter', () => this.decode());
      this.element.addEventListener('mouseleave', () => this.reset());
    }
    
    // Auto-decode on scroll into view
    if (this.element.classList.contains('glitch-text--decode-auto')) {
      this.initIntersectionObserver();
    }
    
    // Trigger decode on click
    this.element.addEventListener('click', () => {
      if (!this.isDecoding) {
        this.decode();
      }
    });
  }
  
  initIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasDecoded) {
            this.hasDecoded = true;
            setTimeout(() => this.decode(), 200);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(this.element);
  }
  
  decode() {
    if (this.isDecoding) return;
    
    this.isDecoding = true;
    this.element.classList.add('is-decoding');
    
    const length = this.originalText.length;
    const frames = this.duration / (1000 / this.frameRate);
    let frame = 0;
    
    const interval = setInterval(() => {
      let output = '';
      const progress = frame / frames;
      
      for (let i = 0; i < length; i++) {
        // Determine if this character should be decoded
        const charProgress = i / length;
        
        if (charProgress < progress) {
          // Character is decoded
          output += this.originalText[i];
        } else if (charProgress < progress + 0.2) {
          // Character is currently decoding - show random
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        } else {
          // Character hasn't started decoding yet - show random
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }
      
      this.element.textContent = output;
      this.element.setAttribute('data-text', output);
      
      frame++;
      
      if (frame > frames) {
        clearInterval(interval);
        this.element.textContent = this.originalText;
        this.element.setAttribute('data-text', this.originalText);
        this.element.classList.remove('is-decoding');
        this.isDecoding = false;
      }
    }, 1000 / this.frameRate);
  }
  
  reset() {
    this.element.textContent = this.originalText;
    this.element.setAttribute('data-text', this.originalText);
    this.hasDecoded = false;
  }
  
  scramble() {
    const length = this.originalText.length;
    let output = '';
    
    for (let i = 0; i < length; i++) {
      output += this.chars[Math.floor(Math.random() * this.chars.length)];
    }
    
    this.element.textContent = output;
    this.element.setAttribute('data-text', output);
  }
}

// Initialize glitch text on page load
document.addEventListener('DOMContentLoaded', () => {
  const glitchElements = document.querySelectorAll('.glitch-text--decode, .glitch-text--decode-auto');
  
  glitchElements.forEach(element => {
    new GlitchText(element, {
      duration: 800,
      frameRate: 30
    });
  });
});

// Add random glitch triggers
document.addEventListener('DOMContentLoaded', () => {
  const activeGlitchElements = document.querySelectorAll('.glitch-text--active');
  
  // Random glitch intervals
  setInterval(() => {
    activeGlitchElements.forEach(element => {
      if (Math.random() > 0.7) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = '';
      }
    });
  }, 3000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlitchText;
}
