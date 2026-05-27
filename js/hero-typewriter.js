/**
 * Hero Typewriter Effect - v22.0 Professional Enhancement
 * Creates an engaging typewriter animation for hero headlines
 */

class HeroTypewriter {
  constructor(options = {}) {
    this.selector = options.selector || '.typewriter-text';
    this.speed = options.speed || 80;
    this.deleteSpeed = options.deleteSpeed || 40;
    this.pauseTime = options.pauseTime || 3000;
    this.cursorChar = options.cursorChar || '|';
    this.loop = options.loop !== false;
    this.texts = options.texts || [];
    
    this.elements = document.querySelectorAll(this.selector);
    if (!this.elements.length) return;
    
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      // Get texts from data attribute or default texts
      const dataTexts = el.dataset.texts;
      const texts = dataTexts ? JSON.parse(dataTexts) : this.texts;
      
      if (!texts.length) {
        // Use the element's current text as the only text
        texts.push(el.textContent.trim());
      }
      
      this.animateElement(el, texts);
    });
  }
  
  async animateElement(el, texts) {
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = this.cursorChar;
    el.textContent = '';
    el.appendChild(cursor);
    
    let textIndex = 0;
    
    while (this.loop || textIndex < texts.length) {
      const text = texts[textIndex % texts.length];
      
      // Type the text
      await this.typeText(el, cursor, text);
      
      // Pause before deleting
      await this.delay(this.pauseTime);
      
      if (this.loop || textIndex < texts.length - 1) {
        // Delete the text
        await this.deleteText(el, cursor, text);
      }
      
      textIndex++;
    }
    
    // Hide cursor when done
    cursor.style.animation = 'none';
    cursor.style.opacity = '0';
  }
  
  async typeText(el, cursor, text) {
    for (let i = 0; i < text.length; i++) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      await this.delay(this.speed + Math.random() * 30);
    }
  }
  
  async deleteText(el, cursor, text) {
    for (let i = text.length - 1; i >= 0; i--) {
      if (el.childNodes.length > 1) {
        el.removeChild(el.childNodes[el.childNodes.length - 2]);
      }
      await this.delay(this.deleteSpeed);
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    new HeroTypewriter({
      selector: '.hero-typewriter',
      speed: 60,
      deleteSpeed: 30,
      pauseTime: 4000,
      loop: true
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroTypewriter;
}
