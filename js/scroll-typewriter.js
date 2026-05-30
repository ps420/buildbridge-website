/**
 * Scroll-Based Typewriter Effect
 * Fortune 500 Premium Text Animation
 * 
 * Types text progressively based on scroll position within a section
 * Creates an immersive storytelling experience
 */

class ScrollTypewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      text: element.dataset.typewriterText || element.textContent.trim(),
      speed: parseInt(element.dataset.typewriterSpeed) || 50, // Characters per scroll percentage
      cursor: element.dataset.typewriterCursor !== 'false',
      highlightWords: element.dataset.typewriterHighlight?.split(',') || [],
      onComplete: null,
      ...options
    };
    
    this.chars = [];
    this.currentIndex = 0;
    this.isVisible = false;
    this.progress = 0;
    
    this.init();
  }
  
  init() {
    // Clear original content
    this.element.innerHTML = '';
    this.element.classList.add('scroll-typewriter-text');
    
    // Create container for characters
    this.container = document.createElement('span');
    this.container.className = 'scroll-typewriter-container';
    
    // Split text into characters and words
    const words = this.options.text.split(' ');
    let charIndex = 0;
    
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'scroll-typewriter-word';
      
      // Check if word should be highlighted
      const isHighlight = this.options.highlightWords.some(hw => 
        word.toLowerCase().includes(hw.toLowerCase())
      );
      
      if (isHighlight) {
        wordSpan.classList.add('highlight');
      }
      
      // Create character spans
      [...word].forEach((char, i) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'scroll-typewriter-char';
        charSpan.textContent = char;
        charSpan.dataset.index = charIndex++;
        this.chars.push(charSpan);
        wordSpan.appendChild(charSpan);
      });
      
      this.container.appendChild(wordSpan);
      
      // Add space after word (except last word)
      if (wordIndex < words.length - 1) {
        const space = document.createElement('span');
        space.textContent = '\u00A0'; // Non-breaking space
        space.className = 'scroll-typewriter-char';
        space.dataset.index = charIndex++;
        this.chars.push(space);
        this.container.appendChild(space);
      }
    });
    
    this.element.appendChild(this.container);
    
    // Add cursor if enabled
    if (this.options.cursor) {
      this.cursor = document.createElement('span');
      this.cursor.className = 'scroll-typewriter-cursor';
      this.element.appendChild(this.cursor);
    }
    
    // Add glow effect container
    this.glow = document.createElement('div');
    this.glow.className = 'scroll-typewriter-glow';
    this.element.appendChild(this.glow);
    
    // Setup intersection observer
    this.setupObserver();
    
    // Setup scroll listener
    this.setupScrollListener();
  }
  
  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    
    this.observer.observe(this.element);
  }
  
  setupScrollListener() {
    // Find parent section for scroll calculation
    this.section = this.element.closest('.scroll-typewriter-section') || 
                   this.element.closest('section') ||
                   this.element.parentElement;
    
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    // Initial calculation
    this.onScroll();
  }
  
  onScroll() {
    if (!this.section) return;
    
    const rect = this.section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress based on section position
    // 0 = section just entering viewport from bottom
    // 1 = section fully scrolled through
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    // Start typing when section enters viewport
    const startOffset = windowHeight * 0.5;
    const endOffset = -sectionHeight * 0.3;
    
    let rawProgress = (startOffset - sectionTop) / (startOffset - endOffset);
    this.progress = Math.max(0, Math.min(1, rawProgress));
    
    // Calculate how many characters should be visible
    const targetIndex = Math.floor(this.progress * this.chars.length);
    
    this.updateCharacters(targetIndex);
    
    // Update cursor position
    if (this.cursor && targetIndex < this.chars.length) {
      const currentChar = this.chars[targetIndex];
      if (currentChar) {
        const charRect = currentChar.getBoundingClientRect();
        const containerRect = this.element.getBoundingClientRect();
        this.cursor.style.transform = `translate(${charRect.left - containerRect.left}px, ${charRect.top - containerRect.top}px)`;
      }
    }
    
    // Update glow position
    if (this.glow && targetIndex < this.chars.length) {
      const currentChar = this.chars[targetIndex];
      if (currentChar) {
        const charRect = currentChar.getBoundingClientRect();
        const containerRect = this.element.getBoundingClientRect();
        this.glow.style.left = `${charRect.left - containerRect.left + charRect.width / 2}px`;
        this.glow.style.top = `${charRect.top - containerRect.top + charRect.height / 2}px`;
        this.glow.classList.add('active');
      }
    }
    
    // Check if complete
    if (targetIndex >= this.chars.length && !this.completed) {
      this.completed = true;
      if (this.options.onComplete) {
        this.options.onComplete();
      }
      // Trigger completion animation
      this.element.dispatchEvent(new CustomEvent('typewriterComplete'));
    }
  }
  
  updateCharacters(targetIndex) {
    // Show characters up to target
    for (let i = 0; i < this.chars.length; i++) {
      const char = this.chars[i];
      if (i < targetIndex) {
        if (!char.classList.contains('visible')) {
          char.classList.add('visible');
          // Add typing animation for newly revealed chars
          if (i >= this.currentIndex - 3) {
            char.classList.add('typing');
            setTimeout(() => char.classList.remove('typing'), 400);
          }
        }
      } else {
        char.classList.remove('visible');
      }
    }
    
    this.currentIndex = targetIndex;
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize elements with data-scroll-typewriter attribute
  document.querySelectorAll('[data-scroll-typewriter]').forEach(el => {
    new ScrollTypewriter(el);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollTypewriter;
}
