/**
 * Advanced Typewriter Hero v81.0
 * Fortune 500 Dynamic Text Effects
 */

(function() {
  'use strict';

  const TypewriterHero = {
    elements: [],
    currentElement: 0,
    currentText: '',
    currentIndex: 0,
    isTyping: false,
    isDeleting: false,
    loopIndex: 0,
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseDuration: 2000,
    
    init() {
      this.elements = document.querySelectorAll('.typewriter-target');
      if (this.elements.length === 0) return;
      
      this.startTyping();
      this.initParticles();
    },
    
    startTyping() {
      const element = this.elements[this.currentElement];
      const words = JSON.parse(element.dataset.words || '["BuildBridge"]');
      const currentWord = words[this.loopIndex % words.length];
      
      if (this.isDeleting) {
        this.currentText = currentWord.substring(0, this.currentText.length - 1);
      } else {
        this.currentText = currentWord.substring(0, this.currentText.length + 1);
      }
      
      element.textContent = this.currentText;
      
      // Update cursor state
      const cursor = element.nextElementSibling;
      if (cursor && cursor.classList.contains('typewriter-cursor')) {
        cursor.classList.toggle('typing', !this.isDeleting);
        cursor.classList.toggle('blinking', this.isDeleting || this.currentText === currentWord);
      }
      
      let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
      
      // Randomize typing speed slightly for realism
      typeSpeed += Math.random() * 50 - 25;
      
      if (!this.isDeleting && this.currentText === currentWord) {
        typeSpeed = this.pauseDuration;
        this.isDeleting = true;
        
        // Trigger glitch effect on complete
        if (element.parentElement.classList.contains('typewriter-glitch')) {
          element.parentElement.classList.add('glitching');
          setTimeout(() => {
            element.parentElement.classList.remove('glitching');
          }, 300);
        }
      } else if (this.isDeleting && this.currentText === '') {
        this.isDeleting = false;
        this.loopIndex++;
        typeSpeed = 500;
      }
      
      setTimeout(() => this.startTyping(), typeSpeed);
    },
    
    initParticles() {
      const container = document.querySelector('.typewriter-particles');
      if (!container) return;
      
      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        this.createParticle(container);
      }
    },
    
    createParticle(container) {
      const particle = document.createElement('div');
      particle.className = 'typewriter-particle';
      
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      
      container.appendChild(particle);
      
      // Recreate particle after animation
      particle.addEventListener('animationend', () => {
        particle.remove();
        this.createParticle(container);
      });
    },
    
    // Manual type method for single-use animations
    type(element, text, speed = 100) {
      return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        
        const typeChar = () => {
          if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, speed + Math.random() * 50);
          } else {
            resolve();
          }
        };
        
        typeChar();
      });
    },
    
    // Multi-line typewriter
    typeMultiLine(lines, container, options = {}) {
      const { lineDelay = 500, charSpeed = 50 } = options;
      
      container.innerHTML = lines.map((line, i) => 
        `<div class="typewriter-line" style="animation-delay: ${i * 1.5}s">
          <span class="typewriter-text"></span><span class="typewriter-cursor"></span>
        </div>`
      ).join('');
      
      const lineElements = container.querySelectorAll('.typewriter-text');
      
      const typeNextLine = async (index) => {
        if (index >= lines.length) return;
        
        await this.type(lineElements[index], lines[index], charSpeed);
        
        setTimeout(() => {
          const cursor = lineElements[index].nextElementSibling;
          if (cursor) cursor.classList.add('blinking');
        }, 100);
        
        setTimeout(() => typeNextLine(index + 1), lineDelay);
      };
      
      typeNextLine(0);
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TypewriterHero.init());
  } else {
    TypewriterHero.init();
  }

  window.BuildBridgeTypewriter = TypewriterHero;
})();
