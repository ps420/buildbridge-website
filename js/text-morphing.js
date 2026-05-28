/**
 * BuildBridge Text Morphing Animation v1.0
 * Fortune 500 Dynamic Text Transitions
 * Words that morph and transform with smooth animations
 * =====================================================
 */

class TextMorphing {
  constructor(element, options = {}) {
    this.element = typeof element === 'string'
      ? document.querySelector(element)
      : element;
    
    if (!this.element) return;
    
    this.options = {
      words: options.words || [],
      interval: options.interval || 3000,
      transitionDuration: options.transitionDuration || 800,
      easing: options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)',
      animation: options.animation || 'slideUp',
      charAnimation: options.charAnimation !== false,
      scrambleTransition: options.scrambleTransition !== false,
      pauseOnHover: options.pauseOnHover !== false,
      cursor: options.cursor !== false,
      ...options
    };
    
    this.state = {
      currentIndex: 0,
      isAnimating: false,
      isPaused: false,
      timer: null
    };
    
    this.elements = {};
    
    this.init();
  }
  
  init() {
    // Get words from options or data attribute
    if (!this.options.words.length) {
      const dataWords = this.element.dataset.words;
      if (dataWords) {
        this.options.words = dataWords.split(',').map(w => w.trim());
      }
    }
    
    if (this.options.words.length < 2) return;
    
    this.buildStructure();
    this.bindEvents();
    this.startRotation();
  }
  
  buildStructure() {
    // Create morph container
    this.elements.container = document.createElement('span');
    this.elements.container.className = 'text-morph-container';
    
    // Create current word display
    this.elements.current = document.createElement('span');
    this.elements.current.className = 'text-morph-word current';
    this.elements.current.textContent = this.options.words[0];
    
    // Create next word display (hidden initially)
    this.elements.next = document.createElement('span');
    this.elements.next.className = 'text-morph-word next';
    this.elements.next.textContent = this.options.words[1];
    
    // Create cursor
    if (this.options.cursor) {
      this.elements.cursor = document.createElement('span');
      this.elements.cursor.className = 'text-morph-cursor';
      this.elements.cursor.textContent = '|';
    }
    
    // Assemble
    this.elements.container.appendChild(this.elements.current);
    this.elements.container.appendChild(this.elements.next);
    if (this.elements.cursor) {
      this.elements.container.appendChild(this.elements.cursor);
    }
    
    // Replace original content
    this.element.innerHTML = '';
    this.element.appendChild(this.elements.container);
    
    // Add animation class
    this.element.classList.add('text-morph-wrapper');
    this.element.dataset.animation = this.options.animation;
  }
  
  bindEvents() {
    // Pause on hover
    if (this.options.pauseOnHover) {
      this.element.addEventListener('mouseenter', () => {
        this.state.isPaused = true;
      });
      
      this.element.addEventListener('mouseleave', () => {
        this.state.isPaused = false;
      });
    }
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
  
  startRotation() {
    this.state.timer = setInterval(() => {
      if (!this.state.isPaused && !this.state.isAnimating) {
        this.morphToNext();
      }
    }, this.options.interval);
  }
  
  morphToNext() {
    if (this.state.isAnimating) return;
    this.state.isAnimating = true;
    
    const nextIndex = (this.state.currentIndex + 1) % this.options.words.length;
    const currentWord = this.options.words[this.state.currentIndex];
    const nextWord = this.options.words[nextIndex];
    
    // Scramble transition
    if (this.options.scrambleTransition) {
      this.scrambleTransition(currentWord, nextWord, () => {
        this.completeTransition(nextIndex);
      });
    } else {
      // Standard animation
      this.animateTransition(() => {
        this.completeTransition(nextIndex);
      });
    }
  }
  
  scrambleTransition(from, to, callback) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const maxLength = Math.max(from.length, to.length);
    let iteration = 0;
    const maxIterations = 10;
    
    const scramble = () => {
      let result = '';
      
      for (let i = 0; i < maxLength; i++) {
        if (i < iteration) {
          result += to[i] || '';
        } else if (i < from.length && iteration < from.length) {
          result += from[i];
        } else if (i < to.length) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      this.elements.current.textContent = result;
      
      if (iteration < maxLength) {
        iteration += 0.5;
        setTimeout(scramble, 50);
      } else {
        callback();
      }
    };
    
    scramble();
  }
  
  animateTransition(callback) {
    const container = this.elements.container;
    const animation = this.options.animation;
    
    container.classList.add('morphing');
    
    switch (animation) {
      case 'slideUp':
        this.elements.current.classList.add('exit-up');
        this.elements.next.classList.add('enter-up');
        break;
        
      case 'slideDown':
        this.elements.current.classList.add('exit-down');
        this.elements.next.classList.add('enter-down');
        break;
        
      case 'fade':
        this.elements.current.classList.add('exit-fade');
        this.elements.next.classList.add('enter-fade');
        break;
        
      case 'scale':
        this.elements.current.classList.add('exit-scale');
        this.elements.next.classList.add('enter-scale');
        break;
        
      case 'flip':
        container.classList.add('flip-animation');
        break;
        
      case 'typewriter':
        this.typewriterTransition(callback);
        return;
    }
    
    setTimeout(() => {
      callback();
    }, this.options.transitionDuration);
  }
  
  typewriterTransition(callback) {
    this.elements.current.classList.add('typewriter-out');
    
    setTimeout(() => {
      this.elements.next.classList.add('typewriter-in');
      callback();
    }, this.options.transitionDuration / 2);
  }
  
  completeTransition(newIndex) {
    // Swap words
    this.elements.current.textContent = this.options.words[newIndex];
    this.elements.next.textContent = this.options.words[(newIndex + 1) % this.options.words.length];
    
    // Reset animations
    this.elements.current.className = 'text-morph-word current';
    this.elements.next.className = 'text-morph-word next';
    this.elements.container.classList.remove('morphing', 'flip-animation');
    
    this.state.currentIndex = newIndex;
    this.state.isAnimating = false;
    
    // Trigger event
    this.element.dispatchEvent(new CustomEvent('wordchange', {
      detail: { 
        index: newIndex, 
        word: this.options.words[newIndex] 
      }
    }));
  }
  
  pause() {
    this.state.isPaused = true;
  }
  
  resume() {
    this.state.isPaused = false;
  }
  
  goTo(index) {
    if (index === this.state.currentIndex || this.state.isAnimating) return;
    
    clearInterval(this.state.timer);
    this.state.currentIndex = (index - 1 + this.options.words.length) % this.options.words.length;
    this.morphToNext();
    this.startRotation();
  }
  
  destroy() {
    clearInterval(this.state.timer);
    this.element.textContent = this.options.words[this.state.currentIndex];
  }
}

// =========================================
// CSS STYLES
// =========================================
const morphStyles = document.createElement('style');
morphStyles.textContent = `
  .text-morph-wrapper {
    display: inline-block;
    position: relative;
  }
  
  .text-morph-container {
    display: inline-flex;
    align-items: center;
    position: relative;
    min-height: 1.2em;
  }
  
  .text-morph-word {
    display: inline-block;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .text-morph-word.next {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
  }
  
  /* Slide Up Animation */
  .text-morph-wrapper[data-animation="slideUp"] .text-morph-word.exit-up {
    transform: translateY(-100%);
    opacity: 0;
  }
  
  .text-morph-wrapper[data-animation="slideUp"] .text-morph-word.enter-up {
    transform: translateY(0);
    opacity: 1;
  }
  
  .text-morph-wrapper[data-animation="slideUp"] .text-morph-word.next.enter-up {
    transform: translateY(100%);
    opacity: 0;
  }
  
  /* Slide Down Animation */
  .text-morph-wrapper[data-animation="slideDown"] .text-morph-word.exit-down {
    transform: translateY(100%);
    opacity: 0;
  }
  
  .text-morph-wrapper[data-animation="slideDown"] .text-morph-word.enter-down {
    transform: translateY(0);
    opacity: 1;
  }
  
  .text-morph-wrapper[data-animation="slideDown"] .text-morph-word.next.enter-down {
    transform: translateY(-100%);
    opacity: 0;
  }
  
  /* Fade Animation */
  .text-morph-wrapper[data-animation="fade"] .text-morph-word.exit-fade {
    opacity: 0;
    filter: blur(10px);
  }
  
  .text-morph-wrapper[data-animation="fade"] .text-morph-word.enter-fade {
    opacity: 1;
    filter: blur(0);
  }
  
  /* Scale Animation */
  .text-morph-wrapper[data-animation="scale"] .text-morph-word.exit-scale {
    opacity: 0;
    transform: scale(0.5);
  }
  
  .text-morph-wrapper[data-animation="scale"] .text-morph-word.enter-scale {
    opacity: 1;
    transform: scale(1);
  }
  
  /* Flip Animation */
  .text-morph-wrapper .text-morph-container.flip-animation {
    animation: morph-flip 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes morph-flip {
    0% { transform: perspective(1000px) rotateX(0); }
    50% { transform: perspective(1000px) rotateX(-90deg); }
    100% { transform: perspective(1000px) rotateX(0); }
  }
  
  /* Typewriter Animation */
  .text-morph-wrapper .text-morph-word.typewriter-out {
    animation: typewriter-delete 0.4s steps(20) forwards;
  }
  
  .text-morph-wrapper .text-morph-word.typewriter-in {
    animation: typewriter-write 0.4s steps(20) forwards;
  }
  
  /* Cursor */
  .text-morph-cursor {
    display: inline-block;
    margin-left: 4px;
    color: var(--chrome);
    animation: cursor-blink 1s step-end infinite;
  }
  
  @keyframes cursor-blink {
    50% { opacity: 0; }
  }
  
  /* Scramble transition styling */
  .text-morph-container.morphing .text-morph-word {
    font-family: 'Montserrat', monospace;
  }
  
  /* Gradient text variant */
  .text-morph-wrapper.gradient .text-morph-word {
    background: linear-gradient(135deg, var(--chrome), var(--white));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;
document.head.appendChild(morphStyles);

// =========================================
// AUTO-INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-text-morph]').forEach(el => {
    new TextMorphing(el, {
      words: el.dataset.words?.split(',').map(w => w.trim()),
      interval: parseInt(el.dataset.interval) || 3000,
      animation: el.dataset.animation || 'slideUp',
      cursor: el.dataset.cursor !== 'false'
    });
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextMorphing };
}
