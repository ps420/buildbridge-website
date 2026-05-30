/**
 * Advanced 3D Text Scroll Effects v126.0
 * Fortune 500 Scroll-Driven Typography System
 */

(function() {
  'use strict';

  class ThreeDTextScroller {
    constructor(container) {
      this.container = container;
      this.textLayers = container.querySelectorAll('.three-d-text-layer');
      this.progressBar = container.querySelector('.three-d-text-progress-bar');
      this.isActive = false;
      
      this.init();
    }

    init() {
      this.bindEvents();
      this.observeVisibility();
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      window.addEventListener('resize', () => this.onScroll(), { passive: true });
    }

    observeVisibility() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isActive = entry.isIntersecting;
          if (entry.isIntersecting) {
            this.onScroll();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(this.container);
    }

    onScroll() {
      if (!this.isActive) return;

      const rect = this.container.getBoundingClientRect();
      const containerHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) based on scroll through section
      const scrollProgress = Math.max(0, Math.min(1, 
        (-rect.top) / (containerHeight - viewportHeight)
      ));

      // Update progress bar
      if (this.progressBar) {
        this.progressBar.style.width = `${scrollProgress * 100}%`;
      }

      // Animate each layer with different parallax speeds
      this.textLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.3;
        const zOffset = -scrollProgress * 200 * speed;
        const yOffset = scrollProgress * 100 * speed;
        const rotation = scrollProgress * 10 * speed;
        const opacity = 1 - (scrollProgress * 0.3 * index);

        layer.style.transform = `
          translateZ(${zOffset}px) 
          translateY(${yOffset}px) 
          rotateX(${rotation}deg)
        `;
        layer.style.opacity = Math.max(0.1, opacity);
      });
    }
  }

  // Parallax Text Reveal
  class ParallaxTextReveal {
    constructor(container) {
      this.container = container;
      this.words = container.querySelectorAll('.parallax-text-word');
      this.init();
    }

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.words.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add('visible');
              }, index * 150);
            });
          }
        });
      }, { threshold: 0.3 });

      observer.observe(this.container);
    }
  }

  // Split Text Character Animation
  class SplitTextAnimation {
    constructor(element) {
      this.element = element;
      this.text = element.textContent;
      this.init();
    }

    init() {
      // Split text into characters wrapped in spans
      const chars = this.text.split('').map((char, index) => {
        if (char === ' ') return `<span class="split-char" style="width: 0.3em;">&nbsp;</span>`;
        return `<span class="split-char" style="transition-delay: ${index * 30}ms;">${char}</span>`;
      }).join('');

      this.element.innerHTML = `<span class="split-char-container">${chars}</span>`;

      // Observe and trigger animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const chars = entry.target.querySelectorAll('.split-char');
            chars.forEach(char => char.classList.add('visible'));
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(this.element);
    }
  }

  // 3D Perspective Heading with mouse interaction
  class PerspectiveHeading {
    constructor(element) {
      this.element = element;
      this.inner = element.querySelector('.perspective-heading-inner');
      this.init();
    }

    init() {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        this.inner.style.transform = `
          rotateY(${x * 10}deg) 
          rotateX(${-y * 10}deg)
        `;
      });

      element.addEventListener('mouseleave', () => {
        this.inner.style.transform = 'rotateY(0) rotateX(0)';
      });
    }
  }

  // Initialize all 3D text effects
  function init() {
    // ThreeD Text Scroller
    document.querySelectorAll('.three-d-text-section').forEach(section => {
      new ThreeDTextScroller(section);
    });

    // Parallax Text Reveal
    document.querySelectorAll('.parallax-text-scroll').forEach(container => {
      new ParallaxTextReveal(container);
    });

    // Split Text Animation
    document.querySelectorAll('[data-split-text]').forEach(element => {
      new SplitTextAnimation(element);
    });

    // Perspective Headings
    document.querySelectorAll('.perspective-heading').forEach(heading => {
      new PerspectiveHeading(heading);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global for manual initialization
  window.BuildBridge3DText = {
    ThreeDTextScroller,
    ParallaxTextReveal,
    SplitTextAnimation,
    PerspectiveHeading
  };
})();
