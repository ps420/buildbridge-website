/**
 * Scroll Reveal Animations v89.1
 * Fortune 500 Professional Scroll Animations
 * Features: Intersection Observer, parallax, text splitting, counter animations
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    once: true,
    parallaxSpeed: 0.5
  };
  
  // State
  let observer = null;
  let revealElements = [];
  let parallaxElements = [];
  let isScrolling = false;
  let scrollRAF = null;
  
  /**
   * Initialize the reveal system
   */
  function init() {
    // Create intersection observer
    observer = new IntersectionObserver(handleIntersection, {
      threshold: CONFIG.threshold,
      rootMargin: CONFIG.rootMargin
    });
    
    // Find and observe all reveal elements
    observeElements();
    
    // Initialize parallax
    initParallax();
    
    // Initialize text reveals
    initTextReveals();
    
    // Initialize counters
    initCounters();
    
    // Set up scroll listener for parallax
    setupScrollListener();
    
    console.log('✨ Scroll Reveal Animations v89.1 initialized');
  }
  
  /**
   * Observe all elements with reveal attributes
   */
  function observeElements() {
    // Standard reveals
    revealElements = document.querySelectorAll('[data-reveal]:not([data-reveal-initialized])');
    
    revealElements.forEach(el => {
      el.setAttribute('data-reveal-initialized', 'true');
      observer.observe(el);
    });
    
    // Image reveal containers
    const imageContainers = document.querySelectorAll('.reveal-image-container:not([data-reveal-initialized])');
    imageContainers.forEach(el => {
      el.setAttribute('data-reveal-initialized', 'true');
      observer.observe(el);
    });
    
    // Heading reveals
    const headings = document.querySelectorAll('.reveal-heading:not([data-reveal-initialized])');
    headings.forEach(el => {
      el.setAttribute('data-reveal-initialized', 'true');
      observer.observe(el);
    });
  }
  
  /**
   * Handle intersection changes
   */
  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        
        if (CONFIG.once) {
          observer.unobserve(entry.target);
        }
      } else if (!CONFIG.once) {
        hideElement(entry.target);
      }
    });
  }
  
  /**
   * Reveal an element
   */
  function revealElement(el) {
    // Add revealed class
    el.classList.add('revealed');
    
    // Handle counters
    if (el.hasAttribute('data-counter')) {
      animateCounter(el);
    }
    
    // Handle stagger children
    if (el.getAttribute('data-reveal') === 'stagger' || 
        el.getAttribute('data-reveal') === 'cascade') {
      revealStaggerChildren(el);
    }
    
    // Handle text reveals
    if (el.getAttribute('data-reveal') === 'chars') {
      revealChars(el);
    }
    
    if (el.getAttribute('data-reveal') === 'words') {
      revealWords(el);
    }
    
    // Dispatch custom event
    el.dispatchEvent(new CustomEvent('revealed', { bubbles: true }));
  }
  
  /**
   * Hide an element (for non-once reveals)
   */
  function hideElement(el) {
    el.classList.remove('revealed');
  }
  
  /**
   * Reveal staggered children
   */
  function revealStaggerChildren(el) {
    const children = el.children;
    Array.from(children).forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('revealed');
      }, index * 100);
    });
  }
  
  /**
   * Initialize text reveal elements
   */
  function initTextReveals() {
    // Split text into characters
    document.querySelectorAll('[data-reveal="chars"]').forEach(el => {
      if (el.getAttribute('data-text-split')) return;
      
      const text = el.textContent;
      el.innerHTML = text.split('').map(char => 
        char === ' ' ? ' ' : `<span class="char">${char}</span>`
      ).join('');
      el.setAttribute('data-text-split', 'true');
    });
    
    // Split text into words
    document.querySelectorAll('[data-reveal="words"]').forEach(el => {
      if (el.getAttribute('data-text-split')) return;
      
      const text = el.textContent;
      el.innerHTML = text.split(' ').map(word => 
        `<span class="word">${word}</span>`
      ).join(' ');
      el.setAttribute('data-text-split', 'true');
    });
    
    // Split text into lines
    document.querySelectorAll('[data-reveal="text-lines"]').forEach(el => {
      if (el.getAttribute('data-text-split')) return;
      
      const lines = el.innerHTML.split('<br>');
      el.innerHTML = lines.map(line => 
        `<span class="line"><span class="line-inner">${line}</span></span>`
      ).join('');
      el.setAttribute('data-text-split', 'true');
    });
  }
  
  /**
   * Reveal characters with stagger
   */
  function revealChars(el) {
    const chars = el.querySelectorAll('.char');
    chars.forEach((char, index) => {
      setTimeout(() => {
        char.style.opacity = '1';
        char.style.transform = 'translateY(0) rotateX(0)';
      }, index * 30);
    });
  }
  
  /**
   * Reveal words with stagger
   */
  function revealWords(el) {
    const words = el.querySelectorAll('.word');
    words.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, index * 80);
    });
  }
  
  /**
   * Initialize counter animations
   */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]:not([data-counter-initialized])');
    
    counters.forEach(counter => {
      counter.setAttribute('data-counter-initialized', 'true');
      observer.observe(counter);
    });
  }
  
  /**
   * Animate counter
   */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const duration = parseInt(el.getAttribute('data-counter-duration'), 10) || 2000;
    
    let startTime = null;
    let animationId = null;
    
    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutQuart)
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      
      el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      
      if (progress < 1) {
        animationId = requestAnimationFrame(updateCounter);
      }
    }
    
    animationId = requestAnimationFrame(updateCounter);
    
    // Store animation ID for potential cancellation
    el.setAttribute('data-animation-id', animationId);
  }
  
  /**
   * Initialize parallax elements
   */
  function initParallax() {
    parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || CONFIG.parallaxSpeed;
      el.setAttribute('data-parallax-speed', speed);
    });
  }
  
  /**
   * Set up scroll listener with RAF
   */
  function setupScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          updateProgressReveal();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  /**
   * Update parallax positions
   */
  function updateParallax() {
    const scrollY = window.pageYOffset;
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax-speed')) || CONFIG.parallaxSpeed;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const windowCenter = window.innerHeight / 2;
      const distance = (elCenter - windowCenter) * speed;
      
      el.style.transform = `translateY(${distance * 0.1}px)`;
    });
  }
  
  /**
   * Update progress-based reveals
   */
  function updateProgressReveal() {
    const progressElements = document.querySelectorAll('[data-reveal-progress]');
    const windowHeight = window.innerHeight;
    
    progressElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate progress (0 to 1) based on element position in viewport
      let progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
      progress = Math.max(0, Math.min(1, progress));
      
      el.style.setProperty('--scroll-progress', progress);
    });
  }
  
  /**
   * Batch reveal elements (useful for dynamically added content)
   */
  function refresh() {
    observeElements();
    initTextReveals();
    initCounters();
    initParallax();
  }
  
  /**
   * Manually reveal an element
   */
  function reveal(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => revealElement(el));
  }
  
  /**
   * Manually hide an element
   */
  function hide(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => hideElement(el));
  }
  
  /**
   * Update configuration
   */
  function configure(options) {
    Object.assign(CONFIG, options);
    
    // Reinitialize observer with new settings
    if (observer) {
      observer.disconnect();
    }
    
    observer = new IntersectionObserver(handleIntersection, {
      threshold: CONFIG.threshold,
      rootMargin: CONFIG.rootMargin
    });
    
    observeElements();
  }
  
  /**
   * Destroy the reveal system
   */
  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    // Cancel any running animations
    document.querySelectorAll('[data-animation-id]').forEach(el => {
      const id = el.getAttribute('data-animation-id');
      cancelAnimationFrame(id);
    });
  }
  
  // Public API
  window.ScrollReveal = {
    init,
    refresh,
    reveal,
    hide,
    configure,
    destroy,
    animateCounter
  };
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose for debugging
  window._scrollReveal = { CONFIG, revealElements, parallaxElements };
})();
