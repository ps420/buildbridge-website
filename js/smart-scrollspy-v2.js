/**
 * Smart ScrollSpy v2.0
 * Fortune 500 Auto-Highlight Navigation System
 * Features: Smooth scroll, progress tracking, debounced updates, intersection observer
 */

class SmartScrollSpy {
  constructor(options = {}) {
    this.options = {
      navSelector: options.navSelector || '.scrollspy-nav',
      itemSelector: options.itemSelector || '.scrollspy-item',
      sectionSelector: options.sectionSelector || '[data-section]',
      offset: options.offset || 100,
      threshold: options.threshold || 0.3,
      updateURL: options.updateURL !== false,
      smoothScroll: options.smoothScroll !== false,
      showProgress: options.showProgress !== false,
      ...options
    };
    
    this.nav = null;
    this.items = [];
    this.sections = [];
    this.currentSection = null;
    this.observer = null;
    this.progressElement = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.nav = document.querySelector(this.options.navSelector);
    if (!this.nav) {
      this.createNav();
    }
    
    this.collectSections();
    this.createNavItems();
    this.setupIntersectionObserver();
    this.setupProgressTracking();
    this.setupSmoothScroll();
    this.setupHeaderSync();
    
    // Initial check
    this.updateOnScroll();
  }
  
  createNav() {
    // Create navigation container
    this.nav = document.createElement('nav');
    this.nav.className = 'scrollspy-nav';
    this.nav.setAttribute('aria-label', 'Page sections');
    document.body.appendChild(this.nav);
    
    // Create progress ring
    if (this.options.showProgress) {
      const progressRing = document.createElement('div');
      progressRing.className = 'scrollspy-progress-ring';
      progressRing.innerHTML = '<div class="scrollspy-progress-fill"></div>';
      document.body.appendChild(progressRing);
      this.progressElement = progressRing.querySelector('.scrollspy-progress-fill');
    }
  }
  
  collectSections() {
    this.sections = Array.from(document.querySelectorAll(this.options.sectionSelector))
      .filter(section => section.dataset.section)
      .map(section => ({
        element: section,
        id: section.id || section.dataset.section.toLowerCase().replace(/\s+/g, '-'),
        label: section.dataset.navLabel || section.dataset.section,
        offsetTop: 0
      }));
    
    // Calculate offsets
    this.sections.forEach(section => {
      section.offsetTop = section.element.offsetTop;
    });
  }
  
  createNavItems() {
    if (!this.nav) return;
    
    this.nav.innerHTML = '';
    this.items = [];
    
    this.sections.forEach((section, index) => {
      const item = document.createElement('button');
      item.className = 'scrollspy-item';
      item.setAttribute('data-target', section.id);
      item.setAttribute('data-label', section.label);
      item.setAttribute('aria-label', `Go to ${section.label}`);
      item.setAttribute('tabindex', '0');
      
      if (index === 0) {
        item.classList.add('active');
      }
      
      item.addEventListener('click', () => this.scrollToSection(section));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToSection(section);
        }
      });
      
      this.nav.appendChild(item);
      this.items.push({ element: item, section });
    });
  }
  
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: `-${this.options.offset}px 0px -50% 0px`,
      threshold: this.options.threshold
    };
    
    this.observer = new IntersectionObserver((entries) => {
      if (this.isScrolling) return;
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activateSection(entry.target);
        }
      });
    }, observerOptions);
    
    this.sections.forEach(section => {
      this.observer.observe(section.element);
    });
  }
  
  activateSection(sectionElement) {
    const section = this.sections.find(s => s.element === sectionElement);
    if (!section || this.currentSection === section.id) return;
    
    this.currentSection = section.id;
    
    // Update nav items
    this.items.forEach(item => {
      const isActive = item.section.id === section.id;
      item.element.classList.toggle('active', isActive);
      item.element.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    
    // Update URL hash
    if (this.options.updateURL && history.replaceState) {
      history.replaceState(null, null, `#${section.id}`);
    }
    
    // Sync with header nav
    this.syncHeaderNav(section.id);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('sectionchange', {
      detail: { section: section.id, label: section.label }
    }));
  }
  
  scrollToSection(section) {
    if (!section || !section.element) return;
    
    this.isScrolling = true;
    
    const targetPosition = section.element.offsetTop - this.options.offset;
    
    if (this.options.smoothScroll) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, targetPosition);
    }
    
    // Temporarily disable observer during scroll
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Re-enable after scroll completes
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.activateSection(section.element);
      this.setupIntersectionObserver(); // Reconnect observer
    }, 800);
  }
  
  setupProgressTracking() {
    if (!this.progressElement) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  updateProgress() {
    if (!this.progressElement) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    this.progressElement.style.height = `${Math.min(100, Math.max(0, progress))}%`;
  }
  
  updateOnScroll() {
    this.updateProgress();
    
    // Find current section based on scroll position
    const scrollPosition = window.scrollY + this.options.offset + window.innerHeight / 3;
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      if (scrollPosition >= this.sections[i].offsetTop) {
        if (this.currentSection !== this.sections[i].id) {
          this.activateSection(this.sections[i].element);
        }
        break;
      }
    }
  }
  
  setupSmoothScroll() {
    // Handle hash-based navigation
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const section = this.sections.find(s => s.id === targetId);
      if (section) {
        setTimeout(() => this.scrollToSection(section), 100);
      }
    }
  }
  
  setupHeaderSync() {
    // Sync with main navigation
    this.headerNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  }
  
  syncHeaderNav(sectionId) {
    this.headerNavLinks?.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `#${sectionId}`;
      link.classList.toggle('active', isActive);
    });
  }
  
  // Public API methods
  goToSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (section) {
      this.scrollToSection(section);
    }
  }
  
  nextSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    if (currentIndex < this.sections.length - 1) {
      this.scrollToSection(this.sections[currentIndex + 1]);
    }
  }
  
  prevSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    if (currentIndex > 0) {
      this.scrollToSection(this.sections[currentIndex - 1]);
    }
  }
  
  refresh() {
    this.collectSections();
    this.createNavItems();
    if (this.observer) {
      this.observer.disconnect();
    }
    this.setupIntersectionObserver();
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.nav) {
      this.nav.remove();
    }
    if (this.progressElement?.parentElement) {
      this.progressElement.parentElement.remove();
    }
    clearTimeout(this.scrollTimeout);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollSpy = new SmartScrollSpy({
    offset: 100,
    threshold: 0.2,
    updateURL: true,
    smoothScroll: true,
    showProgress: true
  });
});

// Handle dynamic content changes
document.addEventListener('contentloaded', () => {
  if (window.scrollSpy) {
    window.scrollSpy.refresh();
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartScrollSpy;
}
