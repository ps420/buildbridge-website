/**
 * v90.1: Smart Typewriter Text Effect System
 * Professional Typewriter with Variable Speed, Cursor Control & Multiple Modes
 */

class SmartTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      text: options.text || element.textContent,
      speed: options.speed || 80,
      speedVariation: options.speedVariation || 20,
      cursor: options.cursor !== false,
      cursorStyle: options.cursorStyle || 'block',
      cursorColor: options.cursorColor || '',
      pauseAtEnd: options.pauseAtEnd || 2000,
      pauseAtPeriod: options.pauseAtPeriod || 600,
      pauseAtComma: options.pauseAtComma || 300,
      deleteSpeed: options.deleteSpeed || 40,
      loop: options.loop || false,
      loopDelay: options.loopDelay || 1000,
      startDelay: options.startDelay || 0,
      autoStart: options.autoStart !== false,
      onComplete: options.onComplete || null,
      onType: options.onType || null,
      onDelete: options.onDelete || null,
      onLoop: options.onLoop || null,
      ...options
    };
    
    this.texts = Array.isArray(this.options.text) ? this.options.text : [this.options.text];
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isTyping = false;
    this.isDeleting = false;
    this.isPaused = false;
    this.typingTimeout = null;
    this.cursorElement = null;
    
    this.init();
  }
  
  init() {
    // Clear original content
    this.element.textContent = '';
    this.element.classList.add('typewriter-container');
    
    // Create text wrapper
    this.textSpan = document.createElement('span');
    this.textSpan.className = 'typewriter-text';
    this.element.appendChild(this.textSpan);
    
    // Create cursor
    if (this.options.cursor) {
      this.createCursor();
    }
    
    if (this.options.autoStart) {
      setTimeout(() => this.start(), this.options.startDelay);
    }
  }
  
  createCursor() {
    this.cursorElement = document.createElement('span');
    this.cursorElement.className = `typewriter-cursor style-${this.options.cursorStyle}`;
    if (this.options.cursorColor) {
      this.cursorElement.classList.add(`color-${this.options.cursorColor}`);
    }
    this.cursorElement.setAttribute('aria-hidden', 'true');
    this.element.appendChild(this.cursorElement);
  }
  
  start() {
    if (this.isTyping) return;
    this.isTyping = true;
    this.type();
  }
  
  type() {
    const currentText = this.texts[this.currentTextIndex];
    
    if (this.isDeleting) {
      this.handleDeleting(currentText);
    } else {
      this.handleTyping(currentText);
    }
  }
  
  handleTyping(currentText) {
    if (this.currentCharIndex < currentText.length) {
      const char = currentText.charAt(this.currentCharIndex);
      this.textSpan.textContent += char;
      this.currentCharIndex++;
      
      // Trigger onType callback
      if (this.options.onType) {
        this.options.onType(char, this.currentCharIndex, currentText);
      }
      
      // Calculate typing speed with variation
      let speed = this.getTypingSpeed(char);
      
      this.typingTimeout = setTimeout(() => this.type(), speed);
    } else {
      this.handleTypingComplete();
    }
  }
  
  handleDeleting(currentText) {
    if (this.currentCharIndex > 0) {
      this.textSpan.textContent = currentText.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
      
      // Trigger onDelete callback
      if (this.options.onDelete) {
        this.options.onDelete(this.currentCharIndex);
      }
      
      this.typingTimeout = setTimeout(() => this.type(), this.options.deleteSpeed);
    } else {
      this.handleDeleteComplete();
    }
  }
  
  handleTypingComplete() {
    this.isTyping = false;
    
    // Add completion class
    this.element.classList.add('typewriter-complete', 'finished');
    
    // Trigger onComplete callback
    if (this.options.onComplete) {
      this.options.onComplete(this.texts[this.currentTextIndex]);
    }
    
    // Handle looping or multiple texts
    if (this.texts.length > 1 || this.options.loop) {
      this.typingTimeout = setTimeout(() => {
        this.isDeleting = true;
        this.isTyping = true;
        this.type();
      }, this.options.pauseAtEnd);
    } else {
      this.hideCursor();
    }
  }
  
  handleDeleteComplete() {
    this.isDeleting = false;
    this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
    
    // Trigger onLoop callback
    if (this.options.onLoop) {
      this.options.onLoop(this.currentTextIndex);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.isTyping = true;
      this.type();
    }, this.options.loopDelay);
  }
  
  getTypingSpeed(char) {
    let speed = this.options.speed;
    
    // Add random variation
    const variation = (Math.random() - 0.5) * 2 * this.options.speedVariation;
    speed += variation;
    
    // Pause at punctuation
    if (char === '.') {
      speed += this.options.pauseAtPeriod;
    } else if (char === ',' || char === ';') {
      speed += this.options.pauseAtComma;
    } else if (char === '!' || char === '?') {
      speed += this.options.pauseAtPeriod;
    }
    
    return Math.max(20, speed);
  }
  
  pause() {
    this.isPaused = true;
    if (this.cursorElement) {
      this.cursorElement.classList.add('paused');
    }
    clearTimeout(this.typingTimeout);
  }
  
  resume() {
    this.isPaused = false;
    if (this.cursorElement) {
      this.cursorElement.classList.remove('paused');
    }
    this.type();
  }
  
  stop() {
    clearTimeout(this.typingTimeout);
    this.isTyping = false;
    this.isDeleting = false;
  }
  
  reset() {
    this.stop();
    this.currentCharIndex = 0;
    this.currentTextIndex = 0;
    this.textSpan.textContent = '';
    this.element.classList.remove('typewriter-complete', 'finished');
    this.showCursor();
  }
  
  hideCursor() {
    if (this.cursorElement) {
      this.cursorElement.classList.add('hidden');
    }
  }
  
  showCursor() {
    if (this.cursorElement) {
      this.cursorElement.classList.remove('hidden');
    }
  }
  
  setSpeed(speed) {
    this.options.speed = speed;
  }
  
  setText(text) {
    this.texts = Array.isArray(text) ? text : [text];
    this.reset();
    this.start();
  }
  
  destroy() {
    this.stop();
    this.element.textContent = this.texts.join(' ');
    this.element.classList.remove('typewriter-container');
  }
}

// Character-by-Character Reveal Effect
class CharacterRevealTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      delay: options.delay || 50,
      stagger: options.stagger || 30,
      ...options
    };
    
    this.init();
  }
  
  init() {
    const text = this.element.textContent;
    this.element.textContent = '';
    this.element.classList.add('typewriter-multiline');
    
    // Split into characters
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'typewriter-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      this.element.appendChild(span);
      
      // Stagger reveal
      setTimeout(() => {
        span.classList.add('revealed');
      }, this.options.delay + (index * this.options.stagger));
    });
  }
}

// Word-by-Word Reveal Effect
class WordRevealTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      delay: options.delay || 100,
      stagger: options.stagger || 100,
      ...options
    };
    
    this.init();
  }
  
  init() {
    const text = this.element.textContent;
    const words = text.split(' ');
    this.element.textContent = '';
    
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'typewriter-word';
      span.textContent = word;
      this.element.appendChild(span);
      
      setTimeout(() => {
        span.classList.add('revealed');
      }, this.options.delay + (index * this.options.stagger));
    });
  }
}

// Rotating Words Typewriter
class RotatingWordsTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      words: options.words || [],
      typeSpeed: options.typeSpeed || 100,
      deleteSpeed: options.deleteSpeed || 50,
      pauseTime: options.pauseTime || 2000,
      ...options
    };
    
    this.currentIndex = 0;
    this.init();
  }
  
  init() {
    this.element.classList.add('typewriter-rotate');
    this.element.textContent = '';
    
    // Create word spans
    this.wordSpans = this.options.words.map((word, index) => {
      const span = document.createElement('span');
      span.className = 'typewriter-rotate-word';
      if (index === 0) span.classList.add('active');
      span.textContent = word;
      this.element.appendChild(span);
      return span;
    });
    
    this.startRotation();
  }
  
  startRotation() {
    const rotate = () => {
      // Remove active from current
      this.wordSpans[this.currentIndex].classList.remove('active');
      
      // Move to next
      this.currentIndex = (this.currentIndex + 1) % this.wordSpans.length;
      
      // Add active to next
      this.wordSpans[this.currentIndex].classList.add('active');
      
      setTimeout(rotate, this.options.pauseTime);
    };
    
    setTimeout(rotate, this.options.pauseTime);
  }
}

// Initialize typewriters on page load
document.addEventListener('DOMContentLoaded', () => {
  // Standard typewriters
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const options = {
      text: el.dataset.typewriterText || el.textContent,
      speed: parseInt(el.dataset.typewriterSpeed) || 80,
      cursor: el.dataset.typewriterCursor !== 'false',
      cursorStyle: el.dataset.typewriterCursorStyle || 'block',
      loop: el.dataset.typewriterLoop === 'true',
      startDelay: parseInt(el.dataset.typewriterDelay) || 0
    };
    new SmartTypewriter(el, options);
  });
  
  // Character reveal
  document.querySelectorAll('[data-char-reveal]').forEach(el => {
    new CharacterRevealTypewriter(el, {
      delay: parseInt(el.dataset.revealDelay) || 50,
      stagger: parseInt(el.dataset.revealStagger) || 30
    });
  });
  
  // Word reveal
  document.querySelectorAll('[data-word-reveal]').forEach(el => {
    new WordRevealTypewriter(el, {
      delay: parseInt(el.dataset.revealDelay) || 100,
      stagger: parseInt(el.dataset.revealStagger) || 100
    });
  });
  
  // Rotating words
  document.querySelectorAll('[data-rotate-words]').forEach(el => {
    const words = el.dataset.rotateWords.split(',').map(w => w.trim());
    new RotatingWordsTypewriter(el, {
      words: words,
      pauseTime: parseInt(el.dataset.rotatePause) || 2500
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SmartTypewriter,
    CharacterRevealTypewriter,
    WordRevealTypewriter,
    RotatingWordsTypewriter
  };
}
