/**
 * WebGL Button Ripple Effects - v81.3
 * Fortune 500 style interactive buttons with WebGL ripple/liquid effects
 */

(function() {
  'use strict';

  class WebGLButtonEffects {
    constructor() {
      this.buttons = [];
      this.webglSupported = this.checkWebGLSupport();
      this.init();
    }

    checkWebGLSupport() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    }

    init() {
      if (!this.webglSupported) {
        document.body.classList.add('no-webgl');
        this.initFallbackEffects();
        return;
      }

      this.findButtons();
      this.setupIntersectionObserver();
    }

    findButtons() {
      const buttons = document.querySelectorAll('.webgl-button, [data-webgl-button]');
      buttons.forEach(btn => this.setupButton(btn));

      // Watch for new buttons
      new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.matches && (node.matches('.webgl-button') || node.matches('[data-webgl-button]'))) {
                this.setupButton(node);
              }
              const nested = node.querySelectorAll && node.querySelectorAll('.webgl-button, [data-webgl-button]');
              if (nested) {
                nested.forEach(btn => this.setupButton(btn));
              }
            }
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }

    setupButton(button) {
      if (button.dataset.webglInitialized) return;
      button.dataset.webglInitialized = 'true';

      const effectType = button.dataset.webglEffect || 'ripple';
      
      switch (effectType) {
        case 'ripple':
          this.setupRippleEffect(button);
          break;
        case 'liquid':
          this.setupLiquidEffect(button);
          break;
        case 'magnetic':
          this.setupMagneticEffect(button);
          break;
        case '3d':
          this.setup3DEffect(button);
          break;
        case 'particles':
          this.setupParticleEffect(button);
          break;
        case 'confetti':
          this.setupConfettiEffect(button);
          break;
        default:
          this.setupRippleEffect(button);
      }
    }

    setupRippleEffect(button) {
      button.classList.add('webgl-button-ripple');

      button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        button.style.setProperty('--ripple-x', `${x}%`);
        button.style.setProperty('--ripple-y', `${y}%`);
        
        button.classList.remove('rippling');
        void button.offsetWidth; // Trigger reflow
        button.classList.add('rippling');

        setTimeout(() => {
          button.classList.remove('rippling');
        }, 600);
      });
    }

    setupLiquidEffect(button) {
      if (!button.querySelector('.liquid-bg')) {
        const liquidBg = document.createElement('div');
        liquidBg.className = 'liquid-bg';
        liquidBg.innerHTML = '<div class="liquid-blob"></div>';
        button.insertBefore(liquidBg, button.firstChild);
      }
      button.classList.add('webgl-button-liquid');

      // Add mouse move liquid effect
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const blob = button.querySelector('.liquid-blob');
        if (blob) {
          blob.style.left = `${x * 50}%`;
          blob.style.top = `${y * 50}%`;
        }
      });
    }

    setupMagneticEffect(button) {
      button.classList.add('webgl-button-magnetic');

      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        button.style.setProperty('--shine-x', `${x}%`);
        button.style.setProperty('--shine-y', `${y}%`);
        button.style.setProperty('--shine-opacity', '1');
      });

      button.addEventListener('mouseleave', () => {
        button.style.setProperty('--shine-opacity', '0');
      });
    }

    setup3DEffect(button) {
      button.classList.add('webgl-button-3d');

      if (!button.querySelector('.button-layers')) {
        const layers = document.createElement('div');
        layers.className = 'button-layers';
        layers.innerHTML = `
          <div class="button-layer"></div>
          <div class="button-layer"></div>
          <div class="button-layer"></div>
        `;
        button.insertBefore(layers, button.firstChild);
      }

      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const rotateX = y * -20;
        const rotateY = x * 20;

        button.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        
        const layers = button.querySelector('.button-layers');
        if (layers) {
          layers.style.transform = `translateX(${x * 10}px) translateY(${y * 10}px)`;
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        const layers = button.querySelector('.button-layers');
        if (layers) {
          layers.style.transform = 'translateX(0) translateY(0)';
        }
      });
    }

    setupParticleEffect(button) {
      button.classList.add('webgl-button-particles');

      button.addEventListener('click', (e) => {
        this.createParticleBurst(button, e);
      });
    }

    createParticleBurst(button, e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const particleCount = 12;
      const colors = ['#C9CED6', '#F5F7FA', 'rgba(201, 206, 214, 0.6)'];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 6px;
          height: 6px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          pointer-events: none;
          z-index: 100;
        `;
        button.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.animate([
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
          duration: 600 + Math.random() * 200,
          easing: 'cubic-bezier(0, .9, .57, 1)',
          fill: 'forwards'
        }).onfinish = () => particle.remove();
      }
    }

    setupConfettiEffect(button) {
      button.classList.add('webgl-button-confetti');

      button.addEventListener('click', () => {
        button.classList.add('clicked');
        
        // Create confetti
        const rect = button.getBoundingClientRect();
        const colors = ['#C9CED6', '#F5F7FA', '#FFB74D', '#4FC3F7', '#9575CD'];
        
        for (let i = 0; i < 20; i++) {
          const confetti = document.createElement('div');
          confetti.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 10000;
          `;
          document.body.appendChild(confetti);

          const angle = Math.random() * Math.PI * 2;
          const velocity = 100 + Math.random() * 100;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity - 100;
          const rot = Math.random() * 720;

          confetti.animate([
            { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot}deg)`, opacity: 0 }
          ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
          }).onfinish = () => confetti.remove();
        }

        setTimeout(() => {
          button.classList.remove('clicked');
        }, 500);
      });
    }

    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('button-in-view');
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.webgl-button').forEach(btn => {
        observer.observe(btn);
      });
    }

    initFallbackEffects() {
      // CSS-only fallback for buttons
      document.querySelectorAll('.webgl-button').forEach(btn => {
        btn.classList.add('webgl-button-ripple');
        
        btn.addEventListener('click', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          btn.style.setProperty('--ripple-x', `${x}%`);
          btn.style.setProperty('--ripple-y', `${y}%`);
          
          btn.classList.remove('rippling');
          void btn.offsetWidth;
          btn.classList.add('rippling');

          setTimeout(() => {
            btn.classList.remove('rippling');
          }, 600);
        });
      });
    }

    // Utility methods for button states
    static setLoading(button, isLoading) {
      button.classList.toggle('loading', isLoading);
    }

    static setSuccess(button, duration = 2000) {
      button.classList.add('success');
      setTimeout(() => button.classList.remove('success'), duration);
    }

    static setError(button, duration = 2000) {
      button.classList.add('error');
      setTimeout(() => button.classList.remove('error'), duration);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.webglButtons = new WebGLButtonEffects();
    });
  } else {
    window.webglButtons = new WebGLButtonEffects();
  }

  // Expose utility methods
  window.WebGLButtonEffects = WebGLButtonEffects;
})();
