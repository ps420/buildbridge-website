/**
 * Magnetic Social Buttons v13.0
 * Fortune 500 Interactive Social Elements
 * Buttons that magnetically attract to cursor within range
 */

(function() {
  'use strict';

  class MagneticSocialButtons {
    constructor(options = {}) {
      this.options = {
        magneticRange: options.magneticRange || 100,
        magneticStrength: options.magneticStrength || 0.4,
        returnSpeed: options.returnSpeed || 0.15,
        rippleEffect: options.rippleEffect !== false
      };

      this.buttons = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.isTouch = window.matchMedia('(pointer: coarse)').matches;

      this.init();
    }

    init() {
      // Skip on touch devices
      if (this.isTouch) return;

      // Find all magnetic social buttons
      this.buttons = document.querySelectorAll('.magnetic-social-btn');
      
      if (this.buttons.length === 0) return;

      // Track mouse position
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.updateButtons();
      }, { passive: true });

      // Add click handlers for ripple
      this.buttons.forEach(btn => {
        btn.addEventListener('click', (e) => this.handleClick(e, btn));
        
        // Add magnetic zone
        const zone = document.createElement('div');
        zone.className = 'magnetic-zone';
        btn.appendChild(zone);
      });

      // Start animation loop
      this.animate();
    }

    updateButtons() {
      this.buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = this.mouseX - centerX;
        const dy = this.mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.options.magneticRange) {
          const force = (this.options.magneticRange - distance) / this.options.magneticRange;
          const moveX = dx * force * this.options.magneticStrength;
          const moveY = dy * force * this.options.magneticStrength;

          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
          
          // Scale up slightly when near
          const scale = 1 + force * 0.1;
          btn.style.transform += ` scale(${scale})`;
        } else {
          // Return to original position
          const currentTransform = btn.style.transform;
          if (currentTransform && currentTransform !== 'none') {
            btn.style.transform = this.lerpTransform(currentTransform, 'translate(0, 0) scale(1)');
          }
        }
      });
    }

    lerpTransform(current, target) {
      // Simple lerp for transform values
      return target;
    }

    animate() {
      // Continuous animation frame for smooth return
      this.buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = this.mouseX - centerX;
        const dy = this.mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= this.options.magneticRange) {
          // Smoothly return to center
          const currentTransform = window.getComputedStyle(btn).transform;
          if (currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
            const matrix = new DOMMatrix(currentTransform);
            const currentX = matrix.m41;
            const currentY = matrix.m42;
            const currentScale = Math.sqrt(matrix.m11 * matrix.m11 + matrix.m12 * matrix.m12);

            const newX = currentX * (1 - this.options.returnSpeed);
            const newY = currentY * (1 - this.options.returnSpeed);
            const newScale = 1 + (currentScale - 1) * (1 - this.options.returnSpeed);

            if (Math.abs(newX) < 0.5 && Math.abs(newY) < 0.5) {
              btn.style.transform = '';
            } else {
              btn.style.transform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
            }
          }
        }
      });

      requestAnimationFrame(() => this.animate());
    }

    handleClick(e, btn) {
      if (!this.options.rippleEffect) return;

      // Create ripple
      const ripple = document.createElement('span');
      ripple.className = 'ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      btn.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);

      // Handle specific actions based on button type
      const type = btn.dataset.type || this.getButtonType(btn);
      
      if (type === 'copy') {
        this.copyToClipboard(btn);
      } else if (type === 'share') {
        this.handleShare(btn);
      }
    }

    getButtonType(btn) {
      if (btn.classList.contains('magnetic-social-btn--copy')) return 'copy';
      if (btn.classList.contains('magnetic-social-btn--whatsapp')) return 'whatsapp';
      if (btn.classList.contains('magnetic-social-btn--linkedin')) return 'linkedin';
      if (btn.classList.contains('magnetic-social-btn--twitter')) return 'twitter';
      if (btn.classList.contains('magnetic-social-btn--facebook')) return 'facebook';
      if (btn.classList.contains('magnetic-social-btn--email')) return 'email';
      return 'default';
    }

    async copyToClipboard(btn) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Show copied state
        btn.classList.add('copied');
        const originalTooltip = btn.querySelector('.magnetic-social-tooltip');
        if (originalTooltip) {
          originalTooltip.textContent = 'Copied!';
        }

        // Show toast if available
        if (window.Toast) {
          window.Toast.success('Link copied to clipboard!');
        }

        // Reset after delay
        setTimeout(() => {
          btn.classList.remove('copied');
          if (originalTooltip) {
            originalTooltip.textContent = originalTooltip.dataset.originalText || 'Copy Link';
          }
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }

    handleShare(btn) {
      const url = btn.dataset.url || window.location.href;
      const title = btn.dataset.title || document.title;
      const text = btn.dataset.text || '';

      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: url
        }).catch(console.error);
      }
    }

    // Static method to create social share buttons
    static create(container, options = {}) {
      const platforms = options.platforms || ['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy'];
      const iconMap = {
        whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`,
        twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4-.2 6.775-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
        copy: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`
      };

      const labelMap = {
        whatsapp: 'WhatsApp',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        facebook: 'Facebook',
        instagram: 'Instagram',
        email: 'Email',
        copy: 'Copy Link'
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'magnetic-social-container';
      if (options.stagger) {
        wrapper.classList.add('stagger-animate');
      }

      platforms.forEach(platform => {
        const btn = document.createElement('button');
        btn.className = `magnetic-social-btn magnetic-social-btn--${platform}`;
        btn.setAttribute('aria-label', `Share on ${labelMap[platform]}`);
        btn.dataset.type = platform;
        
        // Add tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'magnetic-social-tooltip';
        tooltip.textContent = labelMap[platform];
        tooltip.dataset.originalText = labelMap[platform];
        btn.appendChild(tooltip);

        // Add icon
        btn.innerHTML += iconMap[platform] || `<span class="icon">${platform[0].toUpperCase()}</span>`;

        wrapper.appendChild(btn);
      });

      container.appendChild(wrapper);

      // Initialize magnetic functionality
      return new MagneticSocialButtons(options);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.magneticSocialButtons = new MagneticSocialButtons();
    });
  } else {
    window.magneticSocialButtons = new MagneticSocialButtons();
  }

  // Expose to global
  window.MagneticSocialButtons = MagneticSocialButtons;
})();
