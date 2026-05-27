/**
 * BuildBridge Smart Header Scroll Behavior v29.0
 * Fortune 500 header hide/reveal with scroll direction detection
 */

class SmartHeaderScroll {
  constructor(header) {
    this.header = header;
    this.lastScrollY = window.scrollY;
    this.scrollThreshold = 100;
    this.hideThreshold = 50;
    this.isHidden = false;
    this.ticking = false;
    this.scrollDirection = 'up';
    this.scrollDelta = 0;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkInitialState();
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    
    // Show header on mouse move near top
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Show header on touch move near top
    document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
  }

  onScroll() {
    if (this.ticking) return;
    
    window.requestAnimationFrame(() => {
      this.updateHeader();
      this.ticking = false;
    });
    
    this.ticking = true;
  }

  updateHeader() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;
    this.scrollDirection = delta > 0 ? 'down' : 'up';
    
    // At top of page - always show header with transparent style
    if (currentScrollY < this.scrollThreshold) {
      this.showHeader();
      this.header.classList.add('header-at-top');
      this.header.classList.remove('header-scrolled');
      this.isHidden = false;
    } 
    // Scrolled past threshold - track direction
    else {
      this.header.classList.remove('header-at-top');
      this.header.classList.add('header-scrolled');
      
      // Hide when scrolling down fast
      if (delta > this.hideThreshold) {
        this.hideHeader();
      }
      // Show when scrolling up
      else if (delta < -10) {
        this.showHeader();
      }
    }
    
    this.lastScrollY = currentScrollY;
  }

  onMouseMove(e) {
    // Show header when mouse moves near top of page
    if (e.clientY < 100 && this.scrollDirection === 'up') {
      this.showHeader();
    }
  }

  onTouchStart(e) {
    // Show header when touch starts near top
    if (e.touches[0].clientY < 100 && this.isHidden) {
      this.showHeader();
    }
  }

  showHeader() {
    if (this.isHidden) {
      this.header.style.transform = 'translateY(0)';
      this.header.style.opacity = '1';
      this.isHidden = false;
      this.header.classList.add('header-visible');
      this.header.classList.remove('header-hidden');
    }
  }

  hideHeader() {
    if (!this.isHidden && window.scrollY > this.scrollThreshold) {
      this.header.style.transform = 'translateY(-100%)';
      this.isHidden = true;
      this.header.classList.add('header-hidden');
      this.header.classList.remove('header-visible');
    }
  }

  checkInitialState() {
    const scrollY = window.scrollY;
    if (scrollY > this.scrollThreshold) {
      this.header.classList.add('header-scrolled');
    } else {
      this.header.classList.add('header-at-top');
    }
  }
}

// Smooth scroll for anchor links with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerHeight = document.querySelector('nav')?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('nav') || document.querySelector('header');
  
  if (header) {
    // Add CSS class for transition
    header.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, box-shadow 0.3s ease';
    
    new SmartHeaderScroll(header);
    console.log('📜 BuildBridge v29.0: Smart Header Scroll initialized');
  }
});

// Add escape key to show header
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const header = document.querySelector('nav') || document.querySelector('header');
    if (header) {
      header.style.transform = 'translateY(0)';
      header.classList.add('header-visible');
    }
  }
});

export default SmartHeaderScroll;
