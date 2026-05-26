/**
 * BuildBridge Unified Feature Loader v6.0
 * Professional Front-End Enhancement System
 * 
 * Activates unused feature modules and provides:
 * - Smart module loading based on page content
 * - Performance monitoring
 * - User interaction tracking
 * - Progressive enhancement
 */

class BuildBridgeFeatures {
  constructor() {
    this.modules = new Map();
    this.performanceMetrics = {};
    this.userInteractions = [];
    this.init();
  }

  init() {
    this.measurePerformance();
    this.loadCoreFeatures();
    this.detectPageType();
    this.initAnalytics();
    this.registerServiceWorker();
  }

  // =========================================
  // PERFORMANCE MONITORING
  // =========================================
  measurePerformance() {
    if (!window.performance) return;

    // Core Web Vitals simulation
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const metrics = {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        };
        
        this.performanceMetrics = metrics;
        console.log('📊 BuildBridge Performance:', metrics);
        
        // Report to analytics if slow
        if (metrics.loadTime > 3000) {
          console.warn('⚠️ Page load time exceeded 3 seconds');
        }
      }, 0);
    });

    // Long task detection
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('⏱️ Long task detected:', entry.duration.toFixed(2) + 'ms');
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {}
    }
  }

  // =========================================
  // CORE FEATURES LOADING
  // =========================================
  loadCoreFeatures() {
    // Load features based on DOM presence
    const features = [
      { selector: '#newsletter-trigger', module: 'newsletter', file: 'newsletter-signup.js' },
      { selector: '.share-trigger', module: 'socialShare', file: 'social-share.js' },
      { selector: '.zoom-image', module: 'imageZoom', file: 'image-zoom-hover.js' },
      { selector: '#quick-contact', module: 'quickContact', file: 'quick-contact-widget.js' },
      { selector: '[data-shortcut]', module: 'shortcuts', file: 'keyboard-shortcuts.js' }
    ];

    features.forEach(feature => {
      if (document.querySelector(feature.selector)) {
        this.loadModule(feature.module, feature.file);
      }
    });

    // Always load these for enhanced experience
    this.initSmartFeedback();
    this.initProgressiveEnhancement();
    this.initReducedMotionSupport();
  }

  loadModule(name, file) {
    if (this.modules.has(name)) return Promise.resolve(this.modules.get(name));

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `js/${file}`;
      script.async = true;
      script.onload = () => {
        this.modules.set(name, true);
        console.log(`✅ Module loaded: ${name}`);
        resolve(true);
      };
      script.onerror = () => {
        console.warn(`⚠️ Failed to load: ${name}`);
        reject(false);
      };
      document.head.appendChild(script);
    });
  }

  // =========================================
  // SMART FEEDBACK SYSTEM
  // =========================================
  initSmartFeedback() {
    // Click feedback
    document.querySelectorAll('button, .btn, a').forEach(el => {
      el.addEventListener('click', (e) => this.handleInteraction(e, 'click'));
    });

    // Form feedback
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => this.handleInteraction(e, 'form_submit'));
      
      // Real-time validation feedback
      form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
      });
    });

    // Scroll depth tracking
    this.initScrollDepthTracking();
  }

  handleInteraction(e, type) {
    const target = e.target.closest('[data-track]') || e.target;
    const interaction = {
      type,
      element: target.tagName,
      id: target.id,
      class: target.className,
      timestamp: Date.now(),
      path: window.location.pathname
    };
    
    this.userInteractions.push(interaction);
    
    // Visual feedback for important actions
    if (type === 'click' && target.classList.contains('btn')) {
      this.showRipple(e, target);
    }
  }

  validateField(field) {
    const parent = field.closest('.form-group');
    if (!parent) return;

    let isValid = true;
    let message = '';

    // Required check
    if (field.required && !field.value.trim()) {
      isValid = false;
      message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        message = 'Please enter a valid email';
      }
    }

    // Phone validation
    if (field.type === 'tel' && field.value) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
        isValid = false;
        message = 'Please enter a valid phone number';
      }
    }

    if (!isValid) {
      this.showFieldError(parent, message);
    } else {
      this.showFieldSuccess(parent);
    }

    return isValid;
  }

  showFieldError(parent, message) {
    parent.classList.add('has-error');
    parent.classList.remove('has-success');
    
    let errorEl = parent.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = message;
    
    // Shake animation
    parent.style.animation = 'none';
    parent.offsetHeight; // Trigger reflow
    parent.style.animation = 'fieldShake 0.5s ease';
  }

  showFieldSuccess(parent) {
    parent.classList.remove('has-error');
    parent.classList.add('has-success');
    
    const errorEl = parent.querySelector('.field-error');
    if (errorEl) errorEl.remove();
  }

  clearFieldError(field) {
    const parent = field.closest('.form-group');
    if (parent) {
      parent.classList.remove('has-error');
      const errorEl = parent.querySelector('.field-error');
      if (errorEl) errorEl.remove();
    }
  }

  showRipple(e, element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      transform: scale(0);
      animation: ripple-expand 0.6s ease-out;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // =========================================
  // SCROLL DEPTH TRACKING
  // =========================================
  initScrollDepthTracking() {
    const depths = [25, 50, 75, 90, 100];
    const tracked = new Set();
    
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      depths.forEach(depth => {
        if (scrollPercent >= depth && !tracked.has(depth)) {
          tracked.add(depth);
          console.log(`📜 Scroll depth: ${depth}%`);
          
          // Dispatch event for analytics
          window.dispatchEvent(new CustomEvent('scrollDepth', { 
            detail: { depth, path: window.location.pathname }
          }));
        }
      });
    }, { passive: true });
  }

  // =========================================
  // PROGRESSIVE ENHANCEMENT
  // =========================================
  initProgressiveEnhancement() {
    // Add loaded class when images load
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
      }
    });

    // Skeleton screen removal
    document.querySelectorAll('.skeleton').forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.classList.remove('skeleton');
            }, 500);
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(el);
    });
  }

  // =========================================
  // REDUCED MOTION SUPPORT
  // =========================================
  initReducedMotionSupport() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion');
      console.log('♿ Reduced motion preference detected');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    });
  }

  // =========================================
  // PAGE TYPE DETECTION
  // =========================================
  detectPageType() {
    const path = window.location.pathname;
    let pageType = 'home';
    
    if (path.includes('about')) pageType = 'about';
    else if (path.includes('services')) pageType = 'services';
    else if (path.includes('projects')) pageType = 'projects';
    else if (path.includes('contact')) pageType = 'contact';
    
    document.body.setAttribute('data-page-type', pageType);
    
    // Page-specific enhancements
    this.applyPageEnhancements(pageType);
  }

  applyPageEnhancements(type) {
    const enhancements = {
      home: () => {
        this.activateNewsletterModal();
        this.activateQuickContact();
      },
      projects: () => {
        this.loadModule('imageZoom', 'image-zoom-hover.js');
        this.loadModule('socialShare', 'social-share.js');
      },
      contact: () => {
        // Form enhancements already handled
      }
    };
    
    if (enhancements[type]) enhancements[type]();
  }

  // =========================================
  // NEWSLETTER MODAL
  // =========================================
  activateNewsletterModal() {
    // Show after 30 seconds or scroll depth
    let shown = false;
    
    const showModal = () => {
      if (shown || localStorage.getItem('newsletter-subscribed')) return;
      shown = true;
      
      const modal = document.getElementById('newsletter-modal');
      if (modal) {
        modal.classList.add('active');
        this.trackEvent('newsletter_modal_shown');
      }
    };

    // Show after 30 seconds
    setTimeout(showModal, 30000);
    
    // Or after 70% scroll
    window.addEventListener('scrollDepth', (e) => {
      if (e.detail.depth >= 70) showModal();
    });
  }

  // =========================================
  // QUICK CONTACT WIDGET
  // =========================================
  activateQuickContact() {
    const widget = document.getElementById('quick-contact');
    if (widget) {
      widget.classList.add('initialized');
      
      // Show after 5 seconds
      setTimeout(() => {
        widget.classList.add('visible');
      }, 5000);
    }
  }

  // =========================================
  // ANALYTICS INTEGRATION
  // =========================================
  initAnalytics() {
    // Simple internal analytics
    window.BuildBridgeAnalytics = {
      track: (event, data = {}) => {
        const payload = {
          event,
          data,
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer
        };
        
        // Log to console in development
        console.log('📈 Analytics:', payload);
        
        // Could send to external service here
      }
    };

    // Track page view
    window.BuildBridgeAnalytics.track('page_view', {
      page_type: document.body.getAttribute('data-page-type'),
      performance: this.performanceMetrics
    });
  }

  trackEvent(event, data = {}) {
    if (window.BuildBridgeAnalytics) {
      window.BuildBridgeAnalytics.track(event, data);
    }
  }

  // =========================================
  // SERVICE WORKER REGISTRATION
  // =========================================
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(() => console.log('⚠️ Service Worker registration failed'));
    }
  }
}

// =========================================
// CSS ANIMATION KEYFRAMES (Injected)
// =========================================
const featureStyles = document.createElement('style');
featureStyles.textContent = `
  @keyframes ripple-expand {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes fieldShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-10px); }
    80% { transform: translateX(10px); }
  }
  
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .form-group.has-error input,
  .form-group.has-error textarea,
  .form-group.has-error select {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
  
  .form-group.has-success input,
  .form-group.has-success textarea,
  .form-group.has-success select {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.05);
  }
  
  .field-error {
    display: block;
    color: #ef4444;
    font-size: 12px;
    margin-top: 8px;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Skeleton loading animation */
  .skeleton {
    background: linear-gradient(90deg, 
      rgba(201, 206, 214, 0.05) 25%, 
      rgba(201, 206, 214, 0.1) 50%, 
      rgba(201, 206, 214, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
  }
  
  @keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
document.head.appendChild(featureStyles);

// =========================================
// INITIALIZATION
// =========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BuildBridgeFeatures());
} else {
  new BuildBridgeFeatures();
}
