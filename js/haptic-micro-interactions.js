/**
 * v95.0: Haptic Micro-Interactions System
 * Fortune 500 Quality - 3D Tilt, Ripple Effects, Magnetic Physics
 * Creates tactile, responsive interactions throughout the UI
 */
(function() {
  'use strict';

  class HapticInteractions {
    constructor() {
      this.ripples = [];
      this.tiltElements = [];
      this.magneticElements = [];
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isTouch = window.matchMedia('(pointer: coarse)').matches;
      
      this.init();
    }

    init() {
      if (this.prefersReducedMotion) return;
      
      this.initRippleEffects();
      this.initTiltEffects();
      this.initMagneticEffects();
      this.initPressEffects();
      this.initElasticButtons();
      this.initShakeValidation();
      this.initPulseIndicators();
      this.initGlowEffects();
      
      console.log('🔘 BuildBridge v95.0: Haptic Micro-Interactions initialized');
    }

    // ========== RIPPLE EFFECTS ==========
    initRippleEffects() {
      const rippleSelectors = [
        '.btn',
        '.nav-link',
        '.team-card',
        '.project-card',
        '.service-card',
        '.morphing-card',
        '.timeline-content-card',
        'button:not(.no-ripple)',
        '.advanced-card',
        '.parallax-card'
      ];

      rippleSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.dataset.rippleInitialized) return;
          el.dataset.rippleInitialized = 'true';
          
          el.style.position = 'relative';
          el.style.overflow = 'hidden';
          
          el.addEventListener('click', (e) => this.createRipple(e, el));
        });
      });
    }

    createRipple(e, element) {
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'haptic-ripple';
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(201, 206, 214, 0.4) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
        animation: rippleExpand 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      `;

      element.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }

    // ========== 3D TILT EFFECTS ==========
    initTiltEffects() {
      const tiltSelectors = [
        '.advanced-card',
        '.project-showcase-card',
        '.team-card',
        '.stat-card-enhanced',
        '.feature-showcase-card'
      ];

      tiltSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.dataset.tiltInitialized || this.isTouch) return;
          el.dataset.tiltInitialized = 'true';
          
          el.style.transformStyle = 'preserve-3d';
          el.style.perspective = '1000px';
          
          let rafId = null;
          let bounds = null;

          const handleMove = (e) => {
            if (!bounds) bounds = el.getBoundingClientRect();
            
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              el.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.02, 1.02, 1.02)
              `;
              
              // Move shine effect
              const shine = el.querySelector('.card-shine');
              if (shine) {
                shine.style.background = `
                  radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255,255,255,0.2) 0%,
                    transparent 60%
                  )
                `;
              }
            });
          };

          const handleLeave = () => {
            cancelAnimationFrame(rafId);
            bounds = null;
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
              el.style.transition = '';
            }, 400);
          };

          el.addEventListener('mouseenter', () => {
            bounds = el.getBoundingClientRect();
          });
          
          el.addEventListener('mousemove', handleMove);
          el.addEventListener('mouseleave', handleLeave);
        });
      });
    }

    // ========== MAGNETIC EFFECTS ==========
    initMagneticEffects() {
      const magneticSelectors = [
        '.btn',
        '.nav-link',
        '.social-link',
        '.icon-button',
        '.floating-action-btn'
      ];

      magneticSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.dataset.magneticInitialized || this.isTouch) return;
          el.dataset.magneticInitialized = 'true';
          
          const strength = el.dataset.magneticStrength || 0.3;
          let rafId = null;
          let bounds = null;

          const handleMove = (e) => {
            if (!bounds) bounds = el.getBoundingClientRect();
            
            const x = e.clientX - bounds.left - bounds.width / 2;
            const y = e.clientY - bounds.top - bounds.height / 2;
            
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });
          };

          const handleLeave = () => {
            cancelAnimationFrame(rafId);
            bounds = null;
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
              el.style.transition = '';
            }, 300);
          };

          el.addEventListener('mouseenter', () => {
            bounds = el.getBoundingClientRect();
          });
          
          el.addEventListener('mousemove', handleMove);
          el.addEventListener('mouseleave', handleLeave);
        });
      });
    }

    // ========== PRESS EFFECTS ==========
    initPressEffects() {
      document.querySelectorAll('.btn, button, .clickable').forEach(el => {
        if (el.dataset.pressInitialized) return;
        el.dataset.pressInitialized = 'true';

        el.addEventListener('mousedown', () => {
          el.style.transform = 'scale(0.97)';
          el.style.transition = 'transform 0.1s ease';
        });

        el.addEventListener('mouseup', () => {
          el.style.transform = 'scale(1)';
          el.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });
      });
    }

    // ========== ELASTIC BUTTONS ==========
    initElasticButtons() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes rippleExpand {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        
        .elastic-btn {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .elastic-btn:active {
          transform: scale(0.92);
          transition: transform 0.1s ease;
        }
        
        .haptic-ripple {
          will-change: transform, opacity;
        }
      `;
      document.head.appendChild(style);

      document.querySelectorAll('.btn-primary, .btn-accent, .cta-button').forEach(btn => {
        btn.classList.add('elastic-btn');
      });
    }

    // ========== SHAKE VALIDATION ==========
    initShakeValidation() {
      window.shakeElement = (element) => {
        element.style.animation = 'shakeError 0.5s ease';
        setTimeout(() => {
          element.style.animation = '';
        }, 500);
      };

      const style = document.createElement('style');
      style.textContent = `
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `;
      document.head.appendChild(style);
    }

    // ========== PULSE INDICATORS ==========
    initPulseIndicators() {
      const style = document.createElement('style');
      style.textContent = `
        .pulse-indicator {
          position: relative;
        }
        
        .pulse-indicator::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          transform: translate(-50%, -50%);
          opacity: 0.5;
          animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #22c55e;
        }
        
        .live-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
        }
        
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `;
      document.head.appendChild(style);

      // Add live badges to relevant elements
      document.querySelectorAll('[data-live-indicator]').forEach(el => {
        el.classList.add('live-badge');
      });
    }

    // ========== GLOW EFFECTS ==========
    initGlowEffects() {
      const style = document.createElement('style');
      style.textContent = `
        .glow-hover {
          transition: box-shadow 0.3s ease;
        }
        
        .glow-hover:hover {
          box-shadow: 
            0 0 20px rgba(201, 206, 214, 0.15),
            0 0 40px rgba(201, 206, 214, 0.1),
            0 0 60px rgba(201, 206, 214, 0.05);
        }
        
        .glow-active {
          animation: glowPulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes glowPulse {
          from {
            box-shadow: 0 0 10px rgba(201, 206, 214, 0.2);
          }
          to {
            box-shadow: 
              0 0 20px rgba(201, 206, 214, 0.3),
              0 0 30px rgba(201, 206, 214, 0.2);
          }
        }
        
        .neon-border {
          position: relative;
        }
        
        .neon-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #C9CED6, #F5F7FA, #C9CED6);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: neonRotate 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .neon-border:hover::before {
          opacity: 1;
        }
        
        @keyframes neonRotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      // Apply glow classes
      document.querySelectorAll('.btn-primary, .cta-button').forEach(el => {
        el.classList.add('glow-hover');
      });

      document.querySelectorAll('.special-card, .featured-item').forEach(el => {
        el.classList.add('neon-border');
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new HapticInteractions());
  } else {
    new HapticInteractions();
  }

  // Expose to global scope
  window.HapticInteractions = HapticInteractions;
})();
