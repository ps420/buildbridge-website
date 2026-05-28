/**
 * v38.0: Advanced Kinetic Typography System
 * Next-Gen text animation and interaction effects
 * Fortune 500 Premium Typography Feature
 */

class AdvancedKineticTypography {
  constructor(options = {}) {
    this.options = {
      magneticStrength: options.magneticStrength || 0.3,
      scrambleChars: options.scrambleChars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      waveSpeed: options.waveSpeed || 0.1,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.initMagneticText();
    this.initScrambleText();
    this.initWaveText();
    this.initGlitchText();
    this.initScrollRevealText();
    this.initTypewriterText();
    this.initHighlightText();
  }
  
  // Magnetic text effect
  initMagneticText() {
    const magneticTexts = document.querySelectorAll('.magnetic-text');
    
    magneticTexts.forEach(text => {
      const chars = text.textContent.split('');
      text.innerHTML = chars.map(char => 
        `<span class="magnetic-char">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      
      const magneticChars = text.querySelectorAll('.magnetic-char');
      
      text.addEventListener('mousemove', (e) => {
        const rect = text.getBoundingClientRect();
        
        magneticChars.forEach(char => {
          const charRect = char.getBoundingClientRect();
          const charCenterX = charRect.left + charRect.width / 2;
          const charCenterY = charRect.top + charRect.height / 2;
          
          const deltaX = e.clientX - charCenterX;
          const deltaY = e.clientY - charCenterY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          const maxDistance = 100;
          const strength = Math.max(0, 1 - distance / maxDistance) * this.options.magneticStrength;
          
          char.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
        });
      });
      
      text.addEventListener('mouseleave', () => {
        magneticChars.forEach(char => {
          char.style.transform = 'translate(0, 0)';
        });
      });
    });
  }
  
  // Scramble decode effect
  initScrambleText() {
    const scrambleTexts = document.querySelectorAll('.scramble-text-advanced');
    
    scrambleTexts.forEach(text => {
      const originalText = text.textContent;
      const chars = originalText.split('');
      
      text.innerHTML = chars.map((char, i) => 
        `<span class="scramble-char" data-original="${char}" data-index="${i}">${char}</span>`
      ).join('');
      
      const scrambleChars = text.querySelectorAll('.scramble-char');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateScramble(scrambleChars);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(text);
    });
  }
  
  animateScramble(chars) {
    chars.forEach((char, i) => {
      const original = char.dataset.original;
      
      // Skip spaces
      if (original === ' ') return;
      
      let iterations = 0;
      const maxIterations = 10;
      const delay = i * 50;
      
      setTimeout(() => {
        const interval = setInterval(() => {
          if (iterations >= maxIterations) {
            char.textContent = original;
            char.classList.add('decoding');
            clearInterval(interval);
            return;
          }
          
          char.textContent = this.options.scrambleChars[
            Math.floor(Math.random() * this.options.scrambleChars.length)
          ];
          iterations++;
        }, 50);
      }, delay);
    });
  }
  
  // Wave text effect
  initWaveText() {
    const waveTexts = document.querySelectorAll('.wave-text');
    
    waveTexts.forEach(text => {
      const chars = text.textContent.split('');
      text.innerHTML = chars.map((char, i) => 
        `<span class="wave-char" style="animation-delay: ${i * 0.05}s">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
    });
  }
  
  // Glitch effect on hover
  initGlitchText() {
    const glitchTexts = document.querySelectorAll('.glitch-text');
    
    glitchTexts.forEach(text => {
      if (!text.dataset.text) {
        text.dataset.text = text.textContent;
      }
      
      text.addEventListener('mouseenter', () => {
        text.classList.add('active');
        setTimeout(() => text.classList.remove('active'), 300);
      });
    });
  }
  
  // Scroll reveal characters
  initScrollRevealText() {
    const scrollTexts = document.querySelectorAll('.scroll-reveal-text');
    
    scrollTexts.forEach(text => {
      const chars = text.textContent.split('');
      text.innerHTML = chars.map(char => 
        `<span class="scroll-char">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      
      const scrollChars = text.querySelectorAll('.scroll-char');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            scrollChars.forEach((char, i) => {
              setTimeout(() => char.classList.add('revealed'), i * 30);
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(text);
    });
  }
  
  // Typewriter effect
  initTypewriterText() {
    const typewriters = document.querySelectorAll('.typewriter-text');
    
    typewriters.forEach(el => {
      const text = el.textContent;
      const speed = parseInt(el.dataset.speed) || 50;
      const delay = parseInt(el.dataset.delay) || 0;
      
      el.innerHTML = `<span class="typewriter-content"></span><span class="typewriter-cursor"></span>`;
      const content = el.querySelector('.typewriter-content');
      
      setTimeout(() => {
        let i = 0;
        const type = () => {
          if (i < text.length) {
            content.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
          }
        };
        type();
      }, delay);
    });
  }
  
  // Highlight text on scroll
  initHighlightText() {
    const highlights = document.querySelectorAll('.highlight-text');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: [0, 0.5, 1] });
    
    highlights.forEach(h => observer.observe(h));
  }
  
  // Text fill animation
  initTextFill() {
    const textFills = document.querySelectorAll('.text-fill-container');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    textFills.forEach(tf => observer.observe(tf));
  }
  
  // Split line animation
  initSplitLines() {
    const splitLines = document.querySelectorAll('.split-line');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    splitLines.forEach(line => observer.observe(line));
  }
  
  // Public API
  triggerGlitch(element) {
    element.classList.add('active');
    setTimeout(() => element.classList.remove('active'), 300);
  }
  
  scrambleElement(element) {
    const chars = element.querySelectorAll('.scramble-char');
    this.animateScramble(chars);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.kineticTypography = new AdvancedKineticTypography();
  });
} else {
  window.kineticTypography = new AdvancedKineticTypography();
}

export default AdvancedKineticTypography;
