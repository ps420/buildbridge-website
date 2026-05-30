/**
 * v97.0: Liquid Morphing Menu
 * Fortune 500 Quality - SVG Path Animations, Fluid Transitions
 * Full-screen navigation with organic morphing animations
 */
(function() {
  'use strict';

  class LiquidMorphingMenu {
    constructor(options = {}) {
      this.isOpen = false;
      this.isAnimating = false;
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.options = {
        trigger: options.trigger || '.menu-trigger',
        menuItemSelector: options.menuItemSelector || '.morphing-menu-item',
        blobColor: options.blobColor || '#0f0f10',
        accentColor: options.accentColor || '#C9CED6',
        animationDuration: options.animationDuration || 800,
        staggerDelay: options.staggerDelay || 50,
        ...options
      };

      this.blobs = [];
      this.menuItems = [];
      this.links = [
        { label: 'Home', href: 'index.html', icon: '🏠' },
        { label: 'About', href: 'about.html', icon: 'ℹ️' },
        { label: 'Services', href: 'services.html', icon: '🛠️' },
        { label: 'Projects', href: 'projects.html', icon: '🏗️' },
        { label: 'Contact', href: 'contact.html', icon: '✉️' }
      ];

      this.init();
    }

    init() {
      this.createDOM();
      this.attachEvents();
      this.initBlobAnimation();
      
      console.log('🌊 BuildBridge v97.0: Liquid Morphing Menu initialized');
    }

    createDOM() {
      // Create menu overlay
      const overlay = document.createElement('div');
      overlay.className = 'liquid-menu-overlay';
      overlay.innerHTML = `
        <svg class="liquid-blob-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="liquid-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 20 -9" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
            </filter>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0f0f10;stop-opacity:1" />
            </linearGradient>
          </defs>
          <g filter="url(#liquid-goo)">
            <circle class="blob blob-1" cx="50" cy="-20" r="0" fill="url(#blobGradient)" />
            <circle class="blob blob-2" cx="-20" cy="50" r="0" fill="url(#blobGradient)" />
            <circle class="blob blob-3" cx="120" cy="50" r="0" fill="url(#blobGradient)" />
            <circle class="blob blob-4" cx="50" cy="-20" r="0" fill="url(#blobGradient)" />
          </g>
        </svg>
        
        <nav class="morphing-menu-nav">
          <ul class="morphing-menu-list">
            ${this.links.map((link, i) => `
              <li class="morphing-menu-item" style="--index: ${i}">
                <a href="${link.href}" class="morphing-menu-link">
                  <span class="menu-link-number">0${i + 1}</span>
                  <span class="menu-link-icon">${link.icon}</span>
                  <span class="menu-link-text" data-text="${link.label}">${link.label}</span>
                </a>
                <div class="menu-link-bg"></div>
              </li>
            `).join('')}
          </ul>
        </nav>
        
        <div class="morphing-menu-footer">
          <div class="menu-contact-info">
            <a href="tel:+27661200064" class="menu-phone">+27 66 120 0064</a>
            <a href="mailto:info@buildbridge.co.za" class="menu-email">info@buildbridge.co.za</a>
          </div>
          <div class="menu-social-links">
            <a href="#" class="menu-social-link">LinkedIn</a>
            <a href="#" class="menu-social-link">Instagram</a>
            <a href="#" class="menu-social-link">Twitter</a>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Add trigger button if it doesn't exist
      if (!document.querySelector(this.options.trigger)) {
        const trigger = document.createElement('button');
        trigger.className = `liquid-menu-trigger ${this.options.trigger.replace('.', '')}`;
        trigger.setAttribute('aria-label', 'Toggle menu');
        trigger.innerHTML = `
          <span class="trigger-line"></span>
          <span class="trigger-line"></span>
          <span class="trigger-line"></span>
        `;
        document.body.appendChild(trigger);
      }

      // Add styles
      this.addStyles();
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* ===== LIQUID MENU TRIGGER ===== */
        .liquid-menu-trigger {
          position: fixed;
          top: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          background: rgba(15, 15, 16, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 206, 214, 0.1);
          border-radius: 50%;
          cursor: pointer;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .liquid-menu-trigger:hover {
          transform: scale(1.1);
          border-color: rgba(201, 206, 214, 0.3);
          box-shadow: 0 0 30px rgba(201, 206, 214, 0.1);
        }
        
        .liquid-menu-trigger .trigger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: #C9CED6;
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .liquid-menu-trigger.active .trigger-line:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        
        .liquid-menu-trigger.active .trigger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        
        .liquid-menu-trigger.active .trigger-line:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }
        
        /* ===== LIQUID MENU OVERLAY ===== */
        .liquid-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          visibility: hidden;
          overflow: hidden;
        }
        
        .liquid-menu-overlay.active {
          visibility: visible;
        }
        
        /* Blob SVG */
        .liquid-blob-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .blob {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .liquid-menu-overlay.active .blob-1 {
          r: 80;
          transform-origin: center;
          animation: blobMorph1 8s ease-in-out infinite;
        }
        
        .liquid-menu-overlay.active .blob-2 {
          r: 70;
          animation: blobMorph2 10s ease-in-out infinite;
        }
        
        .liquid-menu-overlay.active .blob-3 {
          r: 75;
          animation: blobMorph3 9s ease-in-out infinite;
        }
        
        .liquid-menu-overlay.active .blob-4 {
          r: 65;
          animation: blobMorph4 11s ease-in-out infinite;
        }
        
        @keyframes blobMorph1 {
          0%, 100% { cx: 50; cy: 50; }
          25% { cx: 45; cy: 55; }
          50% { cx: 55; cy: 45; }
          75% { cx: 48; cy: 52; }
        }
        
        @keyframes blobMorph2 {
          0%, 100% { cx: 20; cy: 50; }
          33% { cx: 25; cy: 55; }
          66% { cx: 18; cy: 45; }
        }
        
        @keyframes blobMorph3 {
          0%, 100% { cx: 80; cy: 50; }
          33% { cx: 75; cy: 45; }
          66% { cx: 82; cy: 55; }
        }
        
        @keyframes blobMorph4 {
          0%, 100% { cx: 50; cy: 20; }
          50% { cx: 55; cy: 25; }
        }
        
        /* ===== MORPHING MENU NAV ===== */
        .morphing-menu-nav {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 40px;
        }
        
        .morphing-menu-list {
          list-style: none;
          text-align: center;
        }
        
        .morphing-menu-item {
          position: relative;
          margin: 20px 0;
          opacity: 0;
          transform: translateY(60px) rotateX(-20deg);
          transform-origin: center bottom;
        }
        
        .liquid-menu-overlay.active .morphing-menu-item {
          opacity: 1;
          transform: translateY(0) rotateX(0);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: calc(var(--index) * 0.1s + 0.3s);
        }
        
        .morphing-menu-link {
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 20px 40px;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 700;
          color: #F5F7FA;
          text-decoration: none;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .menu-link-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(201, 206, 214, 0.4);
          transition: all 0.3s ease;
        }
        
        .menu-link-icon {
          font-size: 2rem;
          opacity: 0;
          transform: scale(0) rotate(-20deg);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .menu-link-text {
          position: relative;
          display: inline-block;
        }
        
        .menu-link-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: #C9CED6;
          clip-path: inset(0 100% 0 0);
          transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .morphing-menu-link:hover .menu-link-text::after {
          clip-path: inset(0 0 0 0);
        }
        
        .morphing-menu-link:hover {
          transform: translateX(20px);
        }
        
        .morphing-menu-link:hover .menu-link-number {
          color: #C9CED6;
          transform: scale(1.2);
        }
        
        .morphing-menu-link:hover .menu-link-icon {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        
        .menu-link-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(201, 206, 214, 0.05) 50%, 
            transparent 100%
          );
          opacity: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: all 0.4s ease;
          z-index: -1;
        }
        
        .morphing-menu-link:hover + .menu-link-bg {
          opacity: 1;
          transform: scaleX(1);
        }
        
        /* Liquid underline effect */
        .morphing-menu-link::before {
          content: '';
          position: absolute;
          bottom: 10px;
          left: 40px;
          right: 40px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #C9CED6, transparent);
          transform: scaleX(0);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .morphing-menu-link:hover::before {
          transform: scaleX(1);
          animation: liquidLine 2s ease-in-out infinite;
        }
        
        @keyframes liquidLine {
          0%, 100% { 
            clip-path: polygon(0 0, 0 100%, 0 100%, 0 0);
          }
          50% { 
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }
        
        /* ===== MORPHING MENU FOOTER ===== */
        .morphing-menu-footer {
          position: absolute;
          bottom: 40px;
          left: 40px;
          right: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          opacity: 0;
          transform: translateY(40px);
          z-index: 2;
        }
        
        .liquid-menu-overlay.active .morphing-menu-footer {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s;
        }
        
        .menu-contact-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .menu-phone,
        .menu-email {
          font-family: 'Poppins', sans-serif;
          font-size: 0.875rem;
          color: rgba(201, 206, 214, 0.6);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .menu-phone:hover,
        .menu-email:hover {
          color: #C9CED6;
        }
        
        .menu-social-links {
          display: flex;
          gap: 30px;
        }
        
        .menu-social-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(201, 206, 214, 0.6);
          text-decoration: none;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .menu-social-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: #C9CED6;
          transition: width 0.3s ease;
        }
        
        .menu-social-link:hover {
          color: #C9CED6;
        }
        
        .menu-social-link:hover::after {
          width: 100%;
        }
        
        /* Focus states for accessibility */
        .morphing-menu-link:focus-visible {
          outline: 2px solid #C9CED6;
          outline-offset: 4px;
          border-radius: 4px;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .blob {
            animation: none !important;
            transition: none !important;
          }
          
          .morphing-menu-item {
            transition: opacity 0.3s ease;
          }
        }
      `;
      document.head.appendChild(style);
    }

    attachEvents() {
      const trigger = document.querySelector(this.options.trigger);
      
      if (trigger) {
        trigger.addEventListener('click', () => this.toggle());
      }

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Close on link click
      this.overlay.querySelectorAll('.morphing-menu-link').forEach(link => {
        link.addEventListener('click', () => {
          this.close();
        });
      });

      // Hover effects for magnetic pull on menu items
      if (!window.matchMedia('(pointer: coarse)').matches) {
        this.initMagneticEffect();
      }
    }

    initBlobAnimation() {
      // Additional blob animation logic can be added here
      // The CSS animations provide the base morphing effect
    }

    initMagneticEffect() {
      const items = this.overlay.querySelectorAll('.morphing-menu-item');
      
      items.forEach(item => {
        const link = item.querySelector('.morphing-menu-link');
        
        item.addEventListener('mousemove', (e) => {
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          link.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        item.addEventListener('mouseleave', () => {
          link.style.transform = '';
        });
      });
    }

    toggle() {
      if (this.isAnimating) return;
      this.isOpen ? this.close() : this.open();
    }

    open() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.isOpen = true;

      const trigger = document.querySelector(this.options.trigger);
      if (trigger) trigger.classList.add('active');
      
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Announce to screen readers
      this.announce('Menu opened');

      setTimeout(() => {
        this.isAnimating = false;
      }, this.options.animationDuration);
    }

    close() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.isOpen = false;

      const trigger = document.querySelector(this.options.trigger);
      if (trigger) trigger.classList.remove('active');
      
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';

      this.announce('Menu closed');

      setTimeout(() => {
        this.isAnimating = false;
      }, this.options.animationDuration);
    }

    announce(message) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = message;
      document.body.appendChild(announcer);
      setTimeout(() => announcer.remove(), 1000);
    }

    destroy() {
      this.close();
      if (this.overlay) {
        this.overlay.remove();
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiquidMorphingMenu());
  } else {
    new LiquidMorphingMenu();
  }

  // Expose to global scope
  window.LiquidMorphingMenu = LiquidMorphingMenu;
})();
