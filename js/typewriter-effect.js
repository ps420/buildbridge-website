/**
 * BuildBridge Typewriter Effect
 * Fortune 500 Quality - Dynamic text animation with realistic typing behavior
 * Features: Multiple phrases, cursor blinking, backspace effect, speed variation
 */

class TypewriterEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.phrases = options.phrases || [element.textContent.trim()];
    this.typingSpeed = options.typingSpeed || 100;
    this.deleteSpeed = options.deleteSpeed || 50;
    this.pauseDuration = options.pauseDuration || 2000;
    this.cursorChar = options.cursorChar || '|';
    this.showCursor = options.showCursor !== false;
    this.loop = options.loop !== false;
    this.autoStart = options.autoStart !== false;
    
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.isPaused = false;
    this.typingTimeout = null;
    
    this.init();
  }
  
  init() {
    // Store original content
    this.originalText = this.element.textContent;
    this.element.textContent = '';
    this.element.classList.add('typewriter-active');
    
    // Create cursor element
    if (this.showCursor) {
      this.cursor = document.createElement('span');
      this.cursor.className = 'typewriter-cursor';
      this.cursor.textContent = this.cursorChar;
      this.element.appendChild(this.cursor);
    }
    
    if (this.autoStart) {
      this.start();
    }
  }
  
  start() {
    this.type();
  }
  
  type() {
    const currentPhrase = this.phrases[this.currentPhraseIndex];
    
    if (this.isDeleting) {
      // Deleting
      this.currentCharIndex--;
      this.updateText(currentPhrase.substring(0, this.currentCharIndex));
      
      if (this.currentCharIndex === 0) {
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        
        // Pause before typing next
        this.typingTimeout = setTimeout(() => this.type(), 300);
        return;
      }
      
      // Random variation for realistic feel
      const speed = this.deleteSpeed + (Math.random() * 30 - 15);
      this.typingTimeout = setTimeout(() => this.type(), speed);
    } else {
      // Typing
      this.currentCharIndex++;
      this.updateText(currentPhrase.substring(0, this.currentCharIndex));
      
      if (this.currentCharIndex === currentPhrase.length) {
        // Finished typing current phrase
        if (this.loop || this.currentPhraseIndex < this.phrases.length - 1) {
          this.isDeleting = true;
          
          // Pause before deleting
          this.typingTimeout = setTimeout(() => this.type(), this.pauseDuration);
        }
        return;
      }
      
      // Random variation for realistic feel
      const speed = this.typingSpeed + (Math.random() * 40 - 20);
      this.typingTimeout = setTimeout(() => this.type(), speed);
    }
  }
  
  updateText(text) {
    if (this.showCursor && this.cursor) {
      this.cursor.remove();
      this.element.textContent = text;
      this.element.appendChild(this.cursor);
    } else {
      this.element.textContent = text;
    }
  }
  
  pause() {
    this.isPaused = true;
    clearTimeout(this.typingTimeout);
  }
  
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.type();
    }
  }
  
  stop() {
    clearTimeout(this.typingTimeout);
    this.updateText(this.originalText);
    this.element.classList.remove('typewriter-active');
  }
  
  reset() {
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.type();
  }
}

// CSS for typewriter effect
const typewriterCSS = `
  .typewriter-active {
    display: inline-block;
  }
  
  .typewriter-cursor {
    display: inline-block;
    color: var(--chrome, #C9CED6);
    animation: typewriter-blink 1s step-end infinite;
    font-weight: 100;
    margin-left: 2px;
  }
  
  @keyframes typewriter-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  /* Cursor styles for different states */
  .typewriter-active.typing .typewriter-cursor {
    animation: none;
    opacity: 1;
  }
  
  .typewriter-active.paused .typewriter-cursor {
    animation: typewriter-blink 1.5s step-end infinite;
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = typewriterCSS;
document.head.appendChild(style);

// Auto-initialize elements with data-typewriter attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const phrasesAttr = el.dataset.typewriter;
    const phrases = phrasesAttr ? phrasesAttr.split(',') : [el.textContent.trim()];
    
    new TypewriterEffect(el, {
      phrases: phrases.map(p => p.trim()),
      typingSpeed: parseInt(el.dataset.typingSpeed) || 100,
      deleteSpeed: parseInt(el.dataset.deleteSpeed) || 50,
      pauseDuration: parseInt(el.dataset.pauseDuration) || 2000,
      cursorChar: el.dataset.cursorChar || '|',
      loop: el.dataset.loop !== 'false'
    });
  });
  
  // Initialize hero typewriter if present
  const heroTypewriter = document.querySelector('.hero-typewriter');
  if (heroTypewriter && !heroTypewriter.dataset.typewriter) {
    new TypewriterEffect(heroTypewriter, {
      phrases: [
        'Connecting Clients.',
        'Delivering Projects.',
        'Building Trust.'
      ],
      typingSpeed: 80,
      deleteSpeed: 40,
      pauseDuration: 2500
    });
  }
});

// Export
window.TypewriterEffect = TypewriterEffect;
