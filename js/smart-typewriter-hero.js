/**
 * v91.0: Smart Typewriter Hero Effect
 * Fortune 500 Professional Text Animation System
 */

class SmartTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      text: options.text || element.textContent,
      speed: options.speed || 80,
      deleteSpeed: options.deleteSpeed || 40,
      pauseDuration: options.pauseDuration || 2000,
      loop: options.loop || false,
      cursor: options.cursor !== false,
      cursorChar: options.cursorChar || '|',
      scramble: options.scramble || false,
      scrambleChars: options.scrambleChars || '!<>-_\\/[]{}—=+*^?#________',
      ...options
    };
    
    this.isTyping = false;
    this.currentText = '';
    this.currentIndex = 0;
    this.cursorElement = null;
    
    this.init();
  }
  
  init() {
    // Clear original content
    this.element.innerHTML = '';
    this.element.classList.add('smart-typewriter-text');
    
    // Create text container
    this.textSpan = document.createElement('span');
    this.textSpan.className = 'typewriter-text-content';
    this.element.appendChild(this.textSpan);
    
    // Add cursor if enabled
    if (this.options.cursor) {
      this.cursorElement = document.createElement('span');
      this.cursorElement.className = 'smart-typewriter-cursor';
      this.cursorElement.textContent = this.options.cursorChar;
      this.element.appendChild(this.cursorElement);
    }
    
    // Start typing
    this.start();
  }
  
  async start() {
    if (this.isTyping) return;
    this.isTyping = true;
    
    if (this.cursorElement) {
      this.cursorElement.classList.add('typing');
    }
    
    await this.typeText();
    
    if (this.cursorElement) {
      this.cursorElement.classList.remove('typing');
      this.cursorElement.classList.add('blinking');
    }
    
    if (this.options.loop) {
      await this.pause(this.options.pauseDuration);
      await this.deleteText();
      this.currentIndex = 0;
      this.currentText = '';
      this.isTyping = false;
      this.start();
    } else {
      this.isTyping = false;
    }
  }
  
  async typeText() {
    const text = this.options.text;
    
    for (let i = 0; i < text.length; i++) {
      if (this.options.scramble && Math.random() > 0.7) {
        await this.scrambleChar(text[i]);
      } else {
        this.currentText += text[i];
        this.textSpan.textContent = this.currentText;
      }
      
      // Variable typing speed for realism
      const speed = this.options.speed + (Math.random() * 40 - 20);
      await this.pause(speed);
    }
  }
  
  async scrambleChar(finalChar) {
    const scrambleChars = this.options.scrambleChars;
    const scrambleIterations = 3;
    
    for (let i = 0; i < scrambleIterations; i++) {
      const randomChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      this.textSpan.textContent = this.currentText + randomChar;
      await this.pause(30);
    }
    
    this.currentText += finalChar;
    this.textSpan.textContent = this.currentText;
  }
  
  async deleteText() {
    while (this.currentText.length > 0) {
      this.currentText = this.currentText.slice(0, -1);
      this.textSpan.textContent = this.currentText;
      await this.pause(this.options.deleteSpeed);
    }
  }
  
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Static method for easy initialization
  static init(selector = '[data-typewriter]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const options = {
        text: el.dataset.typewriterText,
        speed: parseInt(el.dataset.typewriterSpeed) || 80,
        loop: el.dataset.typewriterLoop === 'true',
        scramble: el.dataset.typewriterScramble === 'true',
        cursor: el.dataset.typewriterCursor !== 'false'
      };
      new SmartTypewriter(el, options);
    });
  }
}

// Multi-line typewriter for hero sections
class MultiLineTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      lines: options.lines || [],
      speed: options.speed || 60,
      lineDelay: options.lineDelay || 500,
      ...options
    };
    
    this.currentLine = 0;
    this.init();
  }
  
  init() {
    this.element.classList.add('smart-typewriter-multiline');
    this.element.innerHTML = '';
    
    // Create line elements
    this.lineElements = this.options.lines.map((line, index) => {
      const lineEl = document.createElement('span');
      lineEl.className = 'typewriter-line';
      lineEl.dataset.text = line;
      this.element.appendChild(lineEl);
      return lineEl;
    });
    
    this.start();
  }
  
  async start() {
    for (let i = 0; i < this.lineElements.length; i++) {
      const lineEl = this.lineElements[i];
      const text = lineEl.dataset.text;
      
      lineEl.classList.add('visible');
      lineEl.classList.add('typing');
      
      // Type the line
      let currentText = '';
      for (let char of text) {
        currentText += char;
        lineEl.textContent = currentText;
        await this.pause(this.options.speed + Math.random() * 30);
      }
      
      lineEl.classList.remove('typing');
      
      // Delay before next line
      if (i < this.lineElements.length - 1) {
        await this.pause(this.options.lineDelay);
      }
    }
  }
  
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static init(selector = '[data-typewriter-lines]') {
    document.querySelectorAll(selector).forEach(el => {
      try {
        const lines = JSON.parse(el.dataset.typewriterLines);
        new MultiLineTypewriter(el, { lines });
      } catch (e) {
        console.error('Invalid typewriter lines data:', e);
      }
    });
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SmartTypewriter.init();
  MultiLineTypewriter.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmartTypewriter, MultiLineTypewriter };
}
