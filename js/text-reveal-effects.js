/**
 * Text Reveal Effects v16.0
 * Professional text animation and reveal effects
 */

(function() {
  'use strict';
  
  const TextRevealEffects = {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
    
    init() {
      this.setupSplitText();
      this.setupScrambleText();
      this.setupObserver();
    },
    
    setupSplitText() {
      // Split text into characters
      document.querySelectorAll('.split-text').forEach(el => {
        if (el.dataset.split === 'chars') {
          this.splitIntoChars(el);
        } else if (el.dataset.split === 'words') {
          this.splitIntoWords(el);
        } else if (el.dataset.split === 'lines') {
          this.splitIntoLines(el);
        }
      });
    },
    
    splitIntoChars(element) {
      const text = element.textContent;
      element.innerHTML = text
        .split('')
        .map(char => char === ' ' 
          ? '<span class="char">&nbsp;</span>' 
          : `<span class="char">${char}</span>`
        )
        .join('');
    },
    
    splitIntoWords(element) {
      const text = element.textContent;
      element.innerHTML = text
        .split(' ')
        .map(word => `
          <span class="word">
            <span class="word-inner">${word}</span>
          </span>
        `)
        .join(' ');
    },
    
    splitIntoLines(element) {
      const text = element.textContent;
      element.innerHTML = text
        .split('. ')
        .map(line => line.trim() ? `
          <span class="line">
            <span class="line-inner">${line}${line.endsWith('.') ? '' : '.'}</span>
          </span>
        ` : '')
        .join(' ');
    },
    
    setupScrambleText() {
      document.querySelectorAll('.scramble-text').forEach(el => {
        const originalText = el.textContent;
        el.dataset.original = originalText;
        
        // Prepare for scramble
        el.innerHTML = originalText
          .split('')
          .map(char => `<span class="scramble-char">${char}</span>`)
          .join('');
      });
    },
    
    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            
            // Handle different reveal types
            if (el.classList.contains('scramble-text')) {
              this.scrambleReveal(el);
            } else if (el.classList.contains('random-fade')) {
              this.randomFadeReveal(el);
            } else {
              // Standard reveal
              requestAnimationFrame(() => {
                el.classList.add('revealed');
              });
            }
            
            observer.unobserve(el);
          }
        });
      }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      });
      
      // Observe all text reveal elements
      const selectors = [
        '.split-text',
        '.word-reveal',
        '.line-reveal',
        '.scramble-text',
        '.blur-in',
        '.clip-reveal',
        '.fade-up-chars',
        '.random-fade',
        '.scale-in-words',
        '.rotate-in',
        '.slide-from-left',
        '.slide-from-right',
        '.flip-3d',
        '.gradient-text-reveal',
        '.focus-blur-reveal',
        '.curtain-reveal',
        '.wave-text',
        '.underline-grow',
        '.highlight-sweep'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          observer.observe(el);
        });
      });
    },
    
    scrambleReveal(element) {
      const originalText = element.dataset.original;
      const chars = element.querySelectorAll('.scramble-char');
      const duration = parseInt(element.dataset.scrambleDuration) || 2000;
      const frameRate = 30;
      const totalFrames = duration / (1000 / frameRate);
      
      let frame = 0;
      
      const animate = () => {
        frame++;
        const progress = frame / totalFrames;
        
        chars.forEach((char, index) => {
          const charProgress = (progress * chars.length - index) / 3;
          
          if (charProgress >= 1) {
            char.textContent = originalText[index];
            char.classList.remove('scrambling');
          } else if (charProgress > 0) {
            char.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
            char.classList.add('scrambling');
          }
        });
        
        if (frame < totalFrames + chars.length / 3) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final text
          chars.forEach((char, index) => {
            char.textContent = originalText[index];
            char.classList.remove('scrambling');
          });
          element.classList.add('revealed');
        }
      };
      
      animate();
    },
    
    randomFadeReveal(element) {
      // Split chars if not already done
      if (!element.querySelector('.char')) {
        this.splitIntoChars(element);
        element.classList.add('random-fade');
      }
      
      const chars = element.querySelectorAll('.char');
      const indices = Array.from({ length: chars.length }, (_, i) => i);
      
      // Shuffle indices for random reveal order
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      // Reveal chars in random order
      indices.forEach((index, i) => {
        setTimeout(() => {
          chars[index].style.transitionDelay = '0ms';
          chars[index].style.opacity = '1';
        }, i * 50);
      });
      
      setTimeout(() => {
        element.classList.add('revealed');
      }, indices.length * 50 + 300);
    },
    
    /**
     * Manual trigger for text reveal
     */
    reveal(selector) {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('revealed');
      });
    },
    
    /**
     * Reset text reveal
     */
    reset(selector) {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.remove('revealed');
      });
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TextRevealEffects.init());
  } else {
    TextRevealEffects.init();
  }
  
  // Expose globally
  window.TextRevealEffects = TextRevealEffects;
})();
