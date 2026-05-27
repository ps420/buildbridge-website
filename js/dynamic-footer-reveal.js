/**
 * v30.0: Dynamic Footer Reveal
 * Fortune 500 Scroll-Triggered Footer System
 * 
 * Features:
 * - Footer reveals as user scrolls to bottom
 * - Smooth parallax reveal animation
 * - Back to top button appears in footer
 * - Newsletter form handling
 */

class DynamicFooterReveal {
  constructor(options = {}) {
    this.config = {
      footerSelector: options.footerSelector || '.footer-reveal-wrapper',
      pageWrapperSelector: options.pageWrapperSelector || '.page-wrapper',
      revealThreshold: options.revealThreshold || 100, // px from bottom to start reveal
      ...options
    };
    
    this.footer = document.querySelector(this.config.footerSelector);
    this.pageWrapper = document.querySelector(this.config.pageWrapperSelector);
    this.backToTopBtn = null;
    this.indicator = null;
    
    this.init();
  }
  
  init() {
    if (!this.footer || !this.pageWrapper) {
      console.warn('DynamicFooterReveal: Required elements not found');
      return;
    }
    
    this.setupPageWrapper();
    this.createBackToTopButton();
    this.createScrollIndicator();
    this.bindEvents();
    this.handleScroll();
    
    console.log('✨ Dynamic Footer Reveal initialized');
  }
  
  setupPageWrapper() {
    // Calculate and set footer height as margin-bottom on page wrapper
    const footerHeight = this.footer.offsetHeight;
    this.pageWrapper.style.marginBottom = footerHeight + 'px';
    
    // Re-calculate on resize
    window.addEventListener('resize', () => {
      const newHeight = this.footer.offsetHeight;
      this.pageWrapper.style.marginBottom = newHeight + 'px';
    }, { passive: true });
  }
  
  createBackToTopButton() {
    this.backToTopBtn = document.createElement('button');
    this.backToTopBtn.className = 'footer-back-to-top';
    this.backToTopBtn.innerHTML = '↑';
    this.backToTopBtn.setAttribute('aria-label', 'Back to top');
    this.backToTopBtn.title = 'Back to top';
    
    this.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    document.body.appendChild(this.backToTopBtn);
  }
  
  createScrollIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'footer-reveal-indicator';
    this.indicator.innerHTML = `
      <span>Scroll to footer</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    `;
    
    this.footer.appendChild(this.indicator);
  }
  
  bindEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Handle newsletter form if present
    const newsletterForm = this.footer.querySelector('.footer-reveal-newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
    }
    
    // Add hover effects to links
    this.footer.querySelectorAll('.footer-reveal-links a').forEach(link => {
      link.addEventListener('mouseenter', () => this.handleLinkHover(link));
    });
  }
  
  handleScroll() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercent = scrollTop / (documentHeight - windowHeight);
    
    // Show back to top button when scrolled past hero
    if (scrollTop > windowHeight * 0.5) {
      this.backToTopBtn.classList.add('visible');
    } else {
      this.backToTopBtn.classList.remove('visible');
    }
    
    // Show footer indicator when near bottom
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
    if (distanceFromBottom < 300 && distanceFromBottom > 50) {
      this.indicator.classList.add('visible');
    } else {
      this.indicator.classList.remove('visible');
    }
    
    // Parallax effect on footer as it reveals
    if (scrollPercent > 0.8) {
      const parallaxOffset = (scrollPercent - 0.8) * 100;
      this.footer.style.transform = `translateY(${parallaxOffset * 0.1}px)`;
    }
  }
  
  handleNewsletterSubmit(e) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const btn = e.target.querySelector('button');
    const email = input.value;
    
    if (!email || !email.includes('@')) {
      this.showNotification('Please enter a valid email address', 'error');
      return;
    }
    
    // Simulate submission
    btn.disabled = true;
    btn.textContent = '...';
    
    setTimeout(() => {
      btn.textContent = '✓';
      btn.style.background = '#48BB78';
      input.value = '';
      
      this.showNotification('Thanks for subscribing!', 'success');
      
      // Reset button after delay
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = '→';
        btn.style.background = '';
      }, 2000);
    }, 1500);
  }
  
  handleLinkHover(link) {
    // Add subtle ripple effect to parent column
    const column = link.closest('.footer-reveal-column');
    if (column) {
      column.style.transform = 'translateX(4px)';
      setTimeout(() => {
        column.style.transform = '';
      }, 200);
    }
  }
  
  showNotification(message, type = 'info') {
    // Use existing toast system if available
    if (window.Toast) {
      window.Toast[type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'](message);
      return;
    }
    
    // Create simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: ${type === 'success' ? '#48BB78' : type === 'error' ? '#F56565' : '#4A5568'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 10000;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Public method to manually recalculate footer height
  recalculate() {
    const footerHeight = this.footer.offsetHeight;
    this.pageWrapper.style.marginBottom = footerHeight + 'px';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.footerReveal = new DynamicFooterReveal();
  });
} else {
  window.footerReveal = new DynamicFooterReveal();
}

// Export for global access
window.DynamicFooterReveal = DynamicFooterReveal;
