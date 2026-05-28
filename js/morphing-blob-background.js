/**
 * v44.2: Morphing Blob Background
 * Organic animated shapes with optional mouse interaction
 */

(function() {
  'use strict';

  class MorphingBlobBackground {
    constructor(options = {}) {
      this.options = {
        container: document.body,
        blobCount: 5,
        interactive: true,
        useCSSFallback: false,
        colors: [
          ['#C9CED6', '#F5F7FA'],
          ['#F5F7FA', '#C9CED6'],
          ['#C9CED6', '#ffffff'],
          ['#F5F7FA', '#ffffff'],
          ['#C9CED6', '#e5e8eb']
        ],
        ...options
      };

      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
      this.targetX = this.mouseX;
      this.targetY = this.mouseY;
      this.rafId = null;

      this.init();
    }

    init() {
      // Don't initialize on touch devices for performance
      if (window.matchMedia('(pointer: coarse)').matches) {
        this.options.interactive = false;
      }

      this.createContainer();
      
      if (this.options.useCSSFallback) {
        this.createCSSBlobs();
      } else {
        this.createSVGBlobs();
      }

      if (this.options.interactive) {
        this.bindMouseEvents();
        this.startAnimationLoop();
      }
    }

    createContainer() {
      const existing = document.querySelector('.morphing-blob-container');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.className = 'morphing-blob-container';
      
      if (this.options.interactive) {
        this.container.classList.add('interactive');
      }

      this.container.innerHTML = `
        <svg class="morphing-blobs" viewBox="0 0 500 500" preserveAspectRatio="none">
          <defs>
            ${this.options.colors.map((colors, i) => `
              <linearGradient id="blob-gradient-${i + 1}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.3" />
              </linearGradient>
            `).join('')}
          </defs>
        </svg>
        <div class="morphing-blob-noise"></div>
      `;

      this.options.container.prepend(this.container);
      this.svgContainer = this.container.querySelector('.morphing-blobs');
    }

    createSVGBlobs() {
      const paths = [
        "M440,320Q400,390,320,420Q240,450,170,390Q100,330,90,240Q80,150,150,90Q220,30,310,50Q400,70,440,160Q480,250,440,320Z",
        "M420,340Q380,420,290,430Q200,440,130,370Q60,300,70,210Q80,120,160,80Q240,40,330,70Q420,100,460,190Q500,280,420,340Z",
        "M430,310Q390,380,310,410Q230,440,160,380Q90,320,80,230Q70,140,140,80Q210,20,300,40Q390,60,430,150Q470,240,430,310Z",
        "M450,330Q410,400,330,430Q250,460,180,400Q110,340,100,250Q90,160,160,100Q230,40,320,60Q410,80,450,170Q490,260,450,330Z",
        "M440,300Q400,370,320,400Q240,430,170,370Q100,310,90,220Q80,130,150,70Q220,10,310,30Q400,50,440,140Q480,230,440,300Z"
      ];

      for (let i = 0; i < Math.min(this.options.blobCount, 5); i++) {
        const blob = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        blob.classList.add('morphing-blob', `morphing-blob--${i + 1}`);
        
        blob.innerHTML = `
          <path d="${paths[i]}" />
        `;
        
        this.svgContainer.appendChild(blob);
      }
    }

    createCSSBlobs() {
      // Use CSS-only fallback for better performance
      this.svgContainer.style.display = 'none';
      
      for (let i = 0; i < 3; i++) {
        const blob = document.createElement('div');
        blob.classList.add('css-blob', `css-blob--${i + 1}`);
        this.container.insertBefore(blob, this.container.lastElementChild);
      }
    }

    bindMouseEvents() {
      let ticking = false;
      
      document.addEventListener('mousemove', (e) => {
        this.targetX = e.clientX;
        this.targetY = e.clientY;

        if (!ticking) {
          requestAnimationFrame(() => {
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Handle touch devices
      document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          this.targetX = e.touches[0].clientX;
          this.targetY = e.touches[0].clientY;
        }
      }, { passive: true });
    }

    startAnimationLoop() {
      const lerp = (start, end, factor) => start + (end - start) * factor;

      const animate = () => {
        // Smooth lerp for mouse position
        this.mouseX = lerp(this.mouseX, this.targetX, 0.05);
        this.mouseY = lerp(this.mouseY, this.targetY, 0.05);

        // Calculate percentage values
        const xPercent = (this.mouseX / window.innerWidth) * 100;
        const yPercent = (this.mouseY / window.innerHeight) * 100;

        // Update CSS custom properties
        this.container.style.setProperty('--mouse-x', `${xPercent}%`);
        this.container.style.setProperty('--mouse-y', `${yPercent}%`);

        this.rafId = requestAnimationFrame(animate);
      };

      animate();
    }

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }

    // Public API
    static init(options) {
      return new MorphingBlobBackground(options);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MorphingBlobBackground.init());
  } else {
    MorphingBlobBackground.init();
  }

  // Expose globally
  window.MorphingBlobBackground = MorphingBlobBackground;
})();
