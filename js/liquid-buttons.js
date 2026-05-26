/**
 * Liquid Morphing Buttons v1.0
 * Fortune 500 Premium Button Interactions
 */

class LiquidButtonEffects {
  constructor() {
    this.init();
  }

  init() {
    this.setupLiquidButtons();
    this.setupRippleButtons();
    this.setupMagneticButtons();
    this.setupSplitTextButtons();
  }

  // Liquid Fill Effect
  setupLiquidButtons() {
    document.querySelectorAll('.liquid-fill-btn').forEach(btn => {
      if (!btn.querySelector('.liquid-fill')) {
        const fill = document.createElement('span');
        fill.className = 'liquid-fill';
        btn.appendChild(fill);
      }
    });
  }

  // Ripple Wave Effect
  setupRippleButtons() {
    document.querySelectorAll('.ripple-wave-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-wave';
        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
        `;

        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // Magnetic Button Effect
  setupMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.magnetic-liquid-btn').forEach(btn => {
      const content = btn.querySelector('.btn-content') || btn;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        content.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        content.style.transform = '';
      });
    });
  }

  // Split Text Button Effect
  setupSplitTextButtons() {
    document.querySelectorAll('.split-text-btn').forEach(btn => {
      const text = btn.textContent;
      btn.setAttribute('data-text', text);
      btn.innerHTML = `<span>${text}</span>`;
    });
  }

  // Button Loading State
  static setLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('btn-loading');
      button.dataset.originalText = button.textContent;
    } else {
      button.classList.remove('btn-loading');
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  new LiquidButtonEffects();
});

// Export for global access
window.LiquidButtonEffects = LiquidButtonEffects;
