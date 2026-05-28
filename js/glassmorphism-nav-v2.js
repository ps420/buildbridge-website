/**
 * BuildBridge Glassmorphism Navigation v2.0
 * Fortune 500 Professional Header Controller
 * Advanced scroll behavior with liquid transitions
 * =====================================================
 */

class GlassmorphismNav {
  constructor(options = {}) {
    this.header = document.querySelector(options.selector || '.glass-nav-v2');
    if (!this.header) return;
    
    this.options = {
      scrollThreshold: options.scrollThreshold || 50,
      hideThreshold: options.hideThreshold || 200,
      transitionDuration: options.transitionDuration || 400,
      ...options
    };
    
    this.state = {
      isScrolled: false,
      isHidden: false,
      lastScrollY: 0,
      scrollDirection: 'up',
      ticking: false
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.createProgressBar();
    this.handleScroll(); // Initial check
  }
  
  bindEvents() {
    // Scroll handler with RAF
    window.addEventListener('scroll', () => {
      if (!this.state.ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          this.state.ticking = false;
        });
        this.state.ticking = true;
      }
    }, { passive: true });
    
    // Mobile menu toggle
    const mobileToggle = this.header.querySelector('.mobile-toggle');
    const navLinks = this.header.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('nav-open');
      });
      
      // Close mobile menu on link click
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.classList.remove('nav-open');
        });
      });
    }
    
    // Smooth scroll for anchor links
    this.header.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offset = this.header.offsetHeight + 20;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'nav-progress';
    this.header.appendChild(progressBar);
    this.progressBar = progressBar;
  }
  
  handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - this.state.lastScrollY;
    
    // Determine scroll direction
    this.state.scrollDirection = scrollDelta > 0 ? 'down' : 'up';
    
    // Handle scrolled state
    if (currentScrollY > this.options.scrollThreshold) {
      if (!this.state.isScrolled) {
        this.header.classList.add('scrolled');
        this.state.isScrolled = true;
      }
    } else {
      if (this.state.isScrolled) {
        this.header.classList.remove('scrolled');
        this.state.isScrolled = false;
      }
      // Always show when at top
      if (this.state.isHidden) {
        this.showHeader();
      }
    }
    
    // Handle hide/show on scroll direction (only when scrolled past threshold)
    if (currentScrollY > this.options.hideThreshold) {
      if (this.state.scrollDirection === 'down' && scrollDelta > 5) {
        this.hideHeader();
      } else if (this.state.scrollDirection === 'up' && scrollDelta < -5) {
        this.showHeader();
      }
    }
    
    // Update progress bar
    this.updateProgressBar();
    
    this.state.lastScrollY = currentScrollY;
  }
  
  hideHeader() {
    if (!this.state.isHidden) {
      this.header.style.transform = 'translateY(-100%)';
      this.state.isHidden = true;
    }
  }
  
  showHeader() {
    if (this.state.isHidden) {
      this.header.style.transform = 'translateY(0)';
      this.state.isHidden = false;
    }
  }
  
  updateProgressBar() {
    if (!this.progressBar) return;
    
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
    
    this.progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
  }
  
  // Public method to update active link
  setActiveLink(href) {
    this.header.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      }
    });
  }
  
  // Public method to destroy
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.header.style.transform = '';
  }
}

// =========================================
// INTERSECTION OBSERVER FOR SECTION NAV
// =========================================
class SectionNavObserver {
  constructor(navInstance) {
    this.nav = navInstance;
    this.sections = document.querySelectorAll('[data-section]');
    this.init();
  }
  
  init() {
    if (!this.sections.length || !this.nav) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          if (sectionId) {
            this.nav.setActiveLink(`#${sectionId}`);
          }
        }
      });
    }, observerOptions);
    
    this.sections.forEach(section => observer.observe(section));
  }
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  const nav = new GlassmorphismNav({
    selector: '.glass-nav-v2',
    scrollThreshold: 100,
    hideThreshold: 300
  });
  
  // Initialize section observer
  new SectionNavObserver(nav);
  
  // Expose to global for debugging
  window.GlassmorphismNav = nav;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlassmorphismNav, SectionNavObserver };
}
