/**
 * v45.0: Kinetic Typography System v2
 * Advanced Text Effects and Animations
 */

(function() {
  'use strict';

  // Text Scramble Effect
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
      this.originalText = el.textContent;
    }

    setText(newText) {
      const oldText = this.el.textContent;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise(resolve => this.resolve = resolve);
      
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char" style="opacity: 0.7;">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    // Decode effect - characters decode from random to final
    decode(targetText) {
      const chars = targetText.split('');
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let iterations = 0;
      
      const interval = setInterval(() => {
        this.el.innerHTML = chars
          .map((char, index) => {
            if (index < iterations) {
              return `<span class="scramble-char" style="animation-delay: ${index * 0.05}s">${char}</span>`;
            }
            return `<span class="scramble-char" style="opacity: 0.5;">${randomChars[Math.floor(Math.random() * randomChars.length)]}</span>`;
          })
          .join('');
        
        if (iterations >= chars.length) {
          clearInterval(interval);
          this.el.textContent = targetText;
          this.el.classList.add('decoding');
        }
        
        iterations += 1/3;
      }, 30);
    }
  }

  // Typewriter Effect
  class Typewriter {
    constructor(el, options = {}) {
      this.el = el;
      this.text = el.textContent;
      this.speed = options.speed || 50;
      this.delay = options.delay || 0;
      this.cursor = options.cursor !== false;
      this.el.textContent = '';
      
      if (this.cursor) {
        this.el.classList.add('typewriter-text');
      }
      
      setTimeout(() => this.type(), this.delay);
    }

    type() {
      let i = 0;
      const typeChar = () => {
        if (i < this.text.length) {
          this.el.textContent += this.text.charAt(i);
          i++;
          setTimeout(typeChar, this.speed + Math.random() * 30);
        } else if (this.cursor) {
          // Keep cursor blinking
          setTimeout(() => {
            this.el.style.borderRight = 'none';
          }, 2000);
        }
      };
      typeChar();
    }
  }

  // Wave Text Effect
  class WaveText {
    constructor(el) {
      this.el = el;
      this.text = el.textContent;
      this.wrapChars();
    }

    wrapChars() {
      const chars = this.text.split('');
      this.el.innerHTML = chars
        .map(char => `<span class="wave-char">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');
      this.el.classList.add('wave-text');
    }
  }

  // Glitch Effect
  class GlitchText {
    constructor(el) {
      this.el = el;
      this.text = el.textContent;
      this.el.setAttribute('data-text', this.text);
      this.triggerGlitch();
    }

    triggerGlitch() {
      setInterval(() => {
        if (Math.random() > 0.7) {
          this.el.classList.add('active');
          setTimeout(() => {
            this.el.classList.remove('active');
          }, 300);
        }
      }, 3000);
    }
  }

  // Slot Machine Numbers
  class SlotNumber {
    constructor(el) {
      this.el = el;
      this.targetNumber = parseInt(el.textContent) || 0;
      this.suffix = el.textContent.replace(/[0-9]/g, '');
      this.animate();
    }

    animate() {
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const digits = this.targetNumber.toString().split('');
      
      this.el.innerHTML = digits.map((digit, i) => `
        <span class="slot-number">
          <span class="slot-number-inner" style="animation-delay: ${i * 0.1}s">
            ${numbers.map(n => `<span>${n}</span>`).join('')}
            <span>${digit}</span>
          </span>
        </span>
      `).join('') + this.suffix;
    }
  }

  // Split Line Reveal
  class SplitLineReveal {
    constructor(el) {
      this.el = el;
      this.lines = el.innerHTML.split('<br>');
      this.wrapLines();
      this.observe();
    }

    wrapLines() {
      this.el.innerHTML = this.lines
        .map(line => `<span class="line">${line}</span>`)
        .join('<br>');
      this.el.classList.add('split-line-reveal');
    }

    observe() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(this.el);
    }
  }

  // Magnetic Text
  class MagneticText {
    constructor(el) {
      this.el = el;
      this.strength = parseFloat(el.dataset.magnetic) || 0.3;
      this.bindEvents();
    }

    bindEvents() {
      this.el.addEventListener('mousemove', (e) => {
        const rect = this.el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        this.el.style.transform = `translate(${x * this.strength}px, ${y * this.strength}px)`;
      });

      this.el.addEventListener('mouseleave', () => {
        this.el.style.transform = 'translate(0, 0)';
      });
    }
  }

  // Character Hover Effect
  class CharHoverText {
    constructor(el) {
      this.el = el;
      this.text = el.textContent;
      this.wrapChars();
    }

    wrapChars() {
      const chars = this.text.split('');
      this.el.innerHTML = chars
        .map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');
      this.el.classList.add('char-hover-text');
    }
  }

  // Highlight Text on Scroll
  class HighlightText {
    constructor(el) {
      this.el = el;
      this.observe();
    }

    observe() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(this.el);
    }
  }

  // Initialize all effects
  function initKineticTypography() {
    // Text Scramble
    document.querySelectorAll('[data-scramble]').forEach(el => {
      const fx = new TextScramble(el);
      if (el.dataset.scrambleTrigger === 'hover') {
        el.addEventListener('mouseenter', () => fx.setText(el.dataset.scrambleText || el.textContent));
      } else {
        // Auto trigger on scroll
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              fx.decode(el.textContent);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        observer.observe(el);
      }
    });

    // Typewriter
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      new Typewriter(el, {
        speed: parseInt(el.dataset.typewriterSpeed) || 50,
        delay: parseInt(el.dataset.typewriterDelay) || 0
      });
    });

    // Wave Text
    document.querySelectorAll('[data-wave-text]').forEach(el => {
      new WaveText(el);
    });

    // Glitch Effect
    document.querySelectorAll('[data-glitch]').forEach(el => {
      new GlitchText(el);
    });

    // Slot Numbers
    document.querySelectorAll('[data-slot-number]').forEach(el => {
      new SlotNumber(el);
    });

    // Split Line Reveal
    document.querySelectorAll('[data-split-reveal]').forEach(el => {
      new SplitLineReveal(el);
    });

    // Magnetic Text
    document.querySelectorAll('[data-magnetic-text]').forEach(el => {
      new MagneticText(el);
    });

    // Char Hover
    document.querySelectorAll('[data-char-hover]').forEach(el => {
      new CharHoverText(el);
    });

    // Highlight Text
    document.querySelectorAll('[data-highlight]').forEach(el => {
      new HighlightText(el);
    });

    // Breathing Text
    document.querySelectorAll('[data-breathing]').forEach(el => {
      el.classList.add('breathing-text');
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKineticTypography);
  } else {
    initKineticTypography();
  }

  // Expose classes globally for manual use
  window.KineticTypography = {
    TextScramble,
    Typewriter,
    WaveText,
    GlitchText,
    SlotNumber,
    SplitLineReveal,
    MagneticText,
    CharHoverText,
    HighlightText
  };
})();
