/**
 * v84.0: Scroll-Velocity Typography System
 * Fortune 500 Kinetic Text System
 * 
 * Features:
 * - Text skew/stretch based on scroll velocity
 * - Letter/word/line reveal animations
 * - Gradient shift on scroll
 * - Weight interpolation (for variable fonts)
 * - Character-by-character animations
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Configuration
  const config = {
    smoothing: 0.1,
    maxVelocity: 100,
    skewFactor: 0.1,
    stretchFactor: 0.0005,
    blurFactor: 0.02,
    letterSpacingFactor: 0.001,
    weightFactor: 2
  };

  // State
  const state = {
    lastScrollY: window.scrollY,
    velocity: 0,
    smoothedVelocity: 0,
    direction: 0, // -1 up, 1 down
    rafId: null,
    textElements: [],
    velocityTexts: [],
    revealedElements: new Set()
  };

  // Initialize velocity text elements
  function initVelocityTexts() {
    // Find all velocity-reactive text elements
    state.velocityTexts = document.querySelectorAll('[data-velocity-reactive]');
    
    state.velocityTexts.forEach(el => {
      el.classList.add('velocity-text');
      
      // Set intensity
      const intensity = el.dataset.velocityIntensity || 'normal';
      el.setAttribute('data-velocity-intensity', intensity);
      
      // Store base styles
      el._velocityBase = {
        skew: 0,
        scale: 1,
        spacing: parseFloat(getComputedStyle(el).letterSpacing) || 0
      };
    });
  }

  // Split text into characters for animation
  function splitTextIntoChars(element) {
    const text = element.textContent;
    element.innerHTML = '';
    element.classList.add('char-split-velocity');
    
    const chars = text.split('');
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${i * 0.02}s`;
      element.appendChild(span);
    });
    
    return element.querySelectorAll('.char');
  }

  // Split text into words
  function splitTextIntoWords(element) {
    const text = element.textContent;
    element.innerHTML = '';
    element.classList.add('velocity-word-container');
    
    const words = text.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.transitionDelay = `${i * 0.08}s`;
      element.appendChild(span);
      
      if (i < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
    
    return element;
  }

  // Split text into lines for reveal
  function splitTextIntoLines(element) {
    const lines = element.querySelectorAll('.line, br');
    if (lines.length === 0) {
      // Wrap entire content in line structure
      const content = element.innerHTML;
      element.innerHTML = `<span class="line"><span class="line-inner">${content}</span></span>`;
    } else {
      // Process existing lines
      element.querySelectorAll('.line').forEach(line => {
        const content = line.innerHTML;
        line.innerHTML = `<span class="line-inner">${content}</span>`;
      });
    }
    return element;
  }

  // Animate characters based on velocity
  function animateChars(element, velocity) {
    const chars = element.querySelectorAll('.char');
    const direction = velocity > 0 ? 1 : -1;
    const absVelocity = Math.abs(velocity);
    const normalizedVelocity = Math.min(absVelocity / config.maxVelocity, 1);
    
    chars.forEach((char, i) => {
      const stagger = i * 0.02;
      const charVelocity = normalizedVelocity * (1 - stagger);
      
      // Calculate transforms
      const skewX = direction * charVelocity * 5;
      const skewY = charVelocity * 2;
      const scaleX = 1 + charVelocity * 0.05;
      
      char.style.transform = `
        skewX(${skewX}deg) 
        skewY(${skewY}deg)
        scaleX(${scaleX})
      `;
    });
  }

  // Apply velocity effects to text
  function applyVelocityEffects() {
    const velocity = state.smoothedVelocity;
    const absVelocity = Math.abs(velocity);
    const normalizedVelocity = Math.min(absVelocity / config.maxVelocity, 1);
    const direction = velocity > 0 ? 1 : -1;

    state.velocityTexts.forEach(el => {
      const intensity = el.dataset.velocityIntensity || 'normal';
      const intensityMultiplier = intensity === 'dramatic' ? 2 : intensity === 'subtle' ? 0.5 : 1;
      
      // Get computed intensity values
      const maxSkew = parseFloat(getComputedStyle(el).getPropertyValue('--max-skew')) || 5;
      const maxStretch = parseFloat(getComputedStyle(el).getPropertyValue('--max-stretch')) || 1.05;
      const maxCompress = parseFloat(getComputedStyle(el).getPropertyValue('--max-compress')) || 0.95;
      const maxSpacing = parseFloat(getComputedStyle(el).getPropertyValue('--max-spacing')) || 0.05;

      // Calculate values
      const skewX = direction * normalizedVelocity * maxSkew * intensityMultiplier;
      const scaleX = normalizedVelocity > 0 
        ? 1 + (maxStretch - 1) * normalizedVelocity 
        : 1 - (1 - maxCompress) * Math.abs(normalizedVelocity);
      const scaleY = 2 - scaleX; // Preserve volume
      const letterSpacing = normalizedVelocity * maxSpacing * intensityMultiplier;

      // Apply transforms
      el.style.setProperty('--skew-x', `${skewX}deg`);
      el.style.setProperty('--scale-x', scaleX);
      el.style.setProperty('--scale-y', scaleY);
      el.style.setProperty('--letter-spacing', `${letterSpacing}em`);

      // Apply blur for high velocity
      if (el.classList.contains('velocity-blur-text')) {
        const blur = normalizedVelocity * 3 * intensityMultiplier;
        el.style.setProperty('--blur-amount', `${blur}px`);
      }

      // Animate gradient shift
      if (el.classList.contains('gradient-shift-text')) {
        const gradientPos = 50 + (velocity * 0.5);
        el.style.setProperty('--gradient-pos', `${gradientPos}%`);
      }

      // Update font weight for variable fonts
      if (el.classList.contains('weight-shift-text')) {
        const baseWeight = 400;
        const weightShift = absVelocity * config.weightFactor;
        const newWeight = Math.min(baseWeight + weightShift, 900);
        el.style.setProperty('--font-weight', newWeight);
      }

      // Animate character splits
      if (el.classList.contains('char-split-velocity')) {
        animateChars(el, velocity);
      }

      // Update perspective text
      if (el.classList.contains('perspective-text')) {
        const rotateX = normalizedVelocity * 10 * direction;
        el.style.setProperty('--rotate-x', `${rotateX}deg`);
      }

      // Update depth shadow
      if (el.classList.contains('depth-shadow-text')) {
        const shadowDepth = normalizedVelocity * 20;
        const shadowOpacity = normalizedVelocity * 0.3;
        el.style.setProperty('--shadow-depth', `${shadowDepth}px`);
        el.style.setProperty('--shadow-opacity', shadowOpacity);
      }
    });

    // Update gradient shift texts
    document.querySelectorAll('.gradient-shift-text:not([data-velocity-reactive])').forEach(el => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const gradientPos = scrollPercent * 100;
      el.style.setProperty('--gradient-pos', `${gradientPos}%`);
    });
  }

  // Scroll velocity tracking
  function updateScrollVelocity() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - state.lastScrollY;
    
    state.velocity = delta;
    state.direction = delta > 0 ? 1 : -1;
    state.lastScrollY = currentScrollY;

    // Smooth velocity
    state.smoothedVelocity = lerp(state.smoothedVelocity, state.velocity, config.smoothing);

    // Apply effects
    applyVelocityEffects();

    // Continue loop
    state.rafId = requestAnimationFrame(updateScrollVelocity);
  }

  // Linear interpolation
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Intersection Observer for reveal animations
  function initRevealObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.revealedElements.has(entry.target)) {
          entry.target.classList.add('revealed');
          state.revealedElements.add(entry.target);
          
          // For word containers, reveal words with stagger
          if (entry.target.classList.contains('velocity-word-container')) {
            const words = entry.target.querySelectorAll('.word');
            words.forEach((word, i) => {
              setTimeout(() => {
                word.style.transform = 'translateY(0)';
                word.style.opacity = '1';
                word.style.filter = 'blur(0)';
              }, i * 80);
            });
          }
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.velocity-word-container, .velocity-line, .kinetic-headline').forEach(el => {
      observer.observe(el);
    });

    return observer;
  }

  // Initialize split text elements
  function initSplitTexts() {
    // Split elements marked for word animation
    document.querySelectorAll('[data-split-words]').forEach(el => {
      splitTextIntoWords(el);
    });

    // Split elements marked for char animation
    document.querySelectorAll('[data-split-chars]').forEach(el => {
      splitTextIntoChars(el);
    });

    // Split kinetic headlines
    document.querySelectorAll('.kinetic-headline').forEach(el => {
      splitTextIntoLines(el);
    });
  }

  // Masked text reveal on scroll
  function initMaskedTextReveal() {
    const maskedTexts = document.querySelectorAll('.masked-text-reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.5 });

    maskedTexts.forEach(el => observer.observe(el));
  }

  // Initialize all systems
  function init() {
    // Initialize split texts
    initSplitTexts();
    
    // Initialize velocity reactive elements
    initVelocityTexts();
    
    // Initialize observers
    initRevealObserver();
    initMaskedTextReveal();
    
    // Start velocity tracking
    state.rafId = requestAnimationFrame(updateScrollVelocity);

    console.log('📝 Scroll-Velocity Typography System initialized');
  }

  // Wait for fonts to load for accurate measurements
  if (document.fonts) {
    document.fonts.ready.then(init);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Expose API
  window.VelocityTypography = {
    refresh: initVelocityTexts,
    splitWords: splitTextIntoWords,
    splitChars: splitTextIntoChars,
    getVelocity: () => state.smoothedVelocity
  };

})();
