/**
 * Kinetic Typography
 * Animated text effects for headlines and important text
 */

(function() {
  'use strict';

  const config = {
    scrambleChars: '!<>-_\\/[]{}—=+*^?#________',
    scrambleSpeed: 50,
    triggerOffset: 0.8
  };

  // Initialize
  function init() {
    initKineticChars();
    initKineticWords();
    initScrambleText();
    initGlitchEffect();
    initMagneticText();
    initTypewriter();
    observeKineticElements();
  }

  // Split text into characters
  function initKineticChars() {
    document.querySelectorAll('.kinetic-text:not([data-initialized])').forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split('').map((char, i) => 
        char === ' ' 
          ? ' ' 
          : `<span class="char" style="animation-play-state: paused;">${char}</span>`
      ).join('');
      el.dataset.initialized = 'true';
    });
  }

  // Split text into words
  function initKineticWords() {
    document.querySelectorAll('.kinetic-words:not([data-initialized])').forEach(el => {
      const text = el.textContent.trim();
      el.innerHTML = text.split(' ').map(word => 
        `<span class="word"><span>${word}</span></span>`
      ).join(' ');
      el.dataset.initialized = 'true';
    });
  }

  // Scramble decode effect
  function initScrambleText() {
    document.querySelectorAll('.scramble-decode:not([data-initialized])').forEach(el => {
      const originalText = el.textContent;
      el.dataset.text = originalText;
      el.dataset.initialized = 'true';
      
      el.innerHTML = originalText.split('').map((char, i) => 
        `<span class="char" data-char="${char}" data-index="${i}">${char}</span>`
      ).join('');
    });
  }

  // Glitch effect
  function initGlitchEffect() {
    document.querySelectorAll('.glitch-text:not([data-initialized])').forEach(el => {
      el.dataset.text = el.textContent;
      el.dataset.initialized = 'true';
      
      // Trigger glitch on hover
      el.addEventListener('mouseenter', () => {
        triggerGlitch(el);
      });
    });
  }

  function triggerGlitch(element) {
    element.classList.add('active');
    setTimeout(() => {
      element.classList.remove('active');
    }, 300);
  }

  // Magnetic text effect
  function initMagneticText() {
    document.querySelectorAll('.magnetic-text:not([data-initialized])').forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split('').map(char => 
        char === ' ' ? ' ' : `<span class="char">${char}</span>`
      ).join('');
      el.dataset.initialized = 'true';
      
      // Magnetic effect on mouse move
      el.addEventListener('mousemove', (e) => {
        const chars = el.querySelectorAll('.char');
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        chars.forEach(char => {
          const charRect = char.getBoundingClientRect();
          const charX = charRect.left - rect.left + charRect.width / 2;
          const charY = charRect.top - rect.top + charRect.height / 2;
          
          const distX = mouseX - charX;
          const distY = mouseY - charY;
          const dist = Math.sqrt(distX * distX + distY * distY);
          
          if (dist < 50) {
            const force = (50 - dist) / 50;
            const moveX = -distX * force * 0.3;
            const moveY = -distY * force * 0.3;
            char.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
        });
      });
      
      el.addEventListener('mouseleave', () => {
        el.querySelectorAll('.char').forEach(char => {
          char.style.transform = '';
        });
      });
    });
  }

  // Typewriter effect
  function initTypewriter() {
    document.querySelectorAll('.typewriter:not([data-initialized])').forEach(el => {
      el.dataset.initialized = 'true';
      
      // Store original text
      const originalText = el.textContent;
      el.dataset.fullText = originalText;
      el.textContent = '';
      
      // Calculate exact width needed
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.textContent = originalText;
      document.body.appendChild(tempSpan);
      const width = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);
      
      el.style.width = width + 'px';
    });
  }

  // Scramble animation
  function scramble(element) {
    const chars = element.querySelectorAll('.char');
    const originalText = element.dataset.text;
    
    let iteration = 0;
    const interval = setInterval(() => {
      chars.forEach((char, index) => {
        if (index < iteration) {
          char.textContent = char.dataset.char;
          return;
        }
        
        char.textContent = config.scrambleChars[Math.floor(Math.random() * config.scrambleChars.length)];
      });
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
      }
      
      iteration += 1/3;
    }, config.scrambleSpeed);
  }

  // Observe kinetic elements and trigger on scroll
  function observeKineticElements() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: play all animations
      document.querySelectorAll('.kinetic-text .char').forEach(char => {
        char.style.animationPlayState = 'running';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerAnimation(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: config.triggerOffset });

    // Observe all kinetic elements
    document.querySelectorAll('.kinetic-text, .kinetic-words, .scramble-decode, .typewriter').forEach(el => {
      observer.observe(el);
    });
  }

  // Trigger animation based on element type
  function triggerAnimation(element) {
    if (element.classList.contains('kinetic-text')) {
      // Character reveal
      element.querySelectorAll('.char').forEach((char, i) => {
        char.style.animationPlayState = 'running';
        char.style.animationDelay = `${i * 0.03}s`;
      });
    }
    
    if (element.classList.contains('kinetic-words')) {
      // Word reveal
      element.querySelectorAll('.word span').forEach((span, i) => {
        span.style.animationPlayState = 'running';
        span.style.animationDelay = `${i * 0.1}s`;
      });
    }
    
    if (element.classList.contains('scramble-decode')) {
      // Scramble effect
      scramble(element);
    }
    
    if (element.classList.contains('typewriter')) {
      // Typewriter effect
      const text = element.dataset.fullText;
      element.textContent = '';
      element.style.animation = 'none';
      
      let i = 0;
      const typeInterval = setInterval(() => {
        element.textContent = text.substring(0, i);
        i++;
        
        if (i > text.length) {
          clearInterval(typeInterval);
          // Add blinking cursor via CSS
          element.classList.add('typing-complete');
        }
      }, 50);
    }
  }

  // Wave text effect helper
  window.KineticTypography = {
    // Trigger glitch on element
    glitch: function(selector) {
      const el = document.querySelector(selector);
      if (el) triggerGlitch(el);
    },
    
    // Trigger scramble
    scramble: function(selector) {
      const el = document.querySelector(selector);
      if (el) scramble(el);
    },
    
    // Refresh observers (for dynamic content)
    refresh: function() {
      init();
      observeKineticElements();
    },
    
    // Create kinetic text programmatically
    create: function(element, options = {}) {
      element.classList.add('kinetic-text');
      if (options.type === 'words') {
        element.classList.remove('kinetic-text');
        element.classList.add('kinetic-words');
      }
      if (options.type === 'scramble') {
        element.classList.remove('kinetic-text');
        element.classList.add('scramble-decode');
      }
      init();
      observeKineticElements();
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on page change
  window.addEventListener('pagechange', () => {
    setTimeout(init, 100);
  });

})();
