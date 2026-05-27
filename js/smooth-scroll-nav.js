/**
 * BuildBridge v27.0 - Smooth Scroll Navigation System
 * Fortune 500 Quality Anchor Scrolling & Navigation
 */

class SmoothScrollNav {
  constructor(options = {}) {
    this.options = {
      offset: 100, // Offset for fixed header
      duration: 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      spyNavSelector: '.scroll-spy-nav',
      spyOffset: 0.3, // Percentage of viewport
      ...options
    };
    
    this.sections = [];
    this.spyNav = null;
    this.spyDots = [];
    this.currentSection = null;
    this.scrollProgressBar = null;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createScrollProgress();
    this.createSpyNav();
    this.bindEvents();
    this.updateScrollProgress();
  }
  
  findSections() {
    // Find all sections with IDs
    this.sections = Array.from(document.querySelectorAll('section[id], [id].section')).map(section => {
      const navLabel = section.dataset.navLabel || 
                       section.querySelector('h1, h2')?.textContent || 
                       section.id;
      
      return {
        element: section,
        id: section.id,
        label: navLabel,
        offsetTop: 0
      };
    });
    
    // Calculate offsets
    this.updateSectionOffsets();
  }
  
  updateSectionOffsets() {
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.offsetTop = rect.top + window.scrollY - this.options.offset;
    });
  }
  
  createScrollProgress() {
    // Create top progress bar
    this.scrollProgressBar = document.createElement('div');
    this.scrollProgressBar.className = 'scroll-progress-top';
    document.body.appendChild(this.scrollProgressBar);
    
    // Create momentum indicator
    const momentum = document.createElement('div');
    momentum.className = 'scroll-momentum';
    momentum.innerHTML = '<div class="scroll-momentum-bar"></div>';
    document.body.appendChild(momentum);
    this.momentumBar = momentum.querySelector('.scroll-momentum-bar');
  }
  
  createSpyNav() {
    // Don't create on mobile
    if (window.innerWidth < 1024) return;
    
    // Check if spy nav already exists
    this.spyNav = document.querySelector(this.options.spyNavSelector);
    
    if (!this.spyNav && this.sections.length > 0) {
      this.spyNav = document.createElement('nav');
      this.spyNav.className = 'scroll-spy-nav';
      this.spyNav.setAttribute('aria-label', 'Page sections');
      
      this.sections.forEach((section, index) => {
        const dot = document.createElement('a');
        dot.className = 'scroll-spy-dot';
        dot.href = `#${section.id}`;
        dot.setAttribute('data-label', section.label);
        dot.setAttribute('data-section', section.id);
        dot.setAttribute('aria-label', `Go to ${section.label}`);
        
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToSection(section.id);
        });
        
        this.spyNav.appendChild(dot);
        this.spyDots.push(dot);
      });
      
      document.body.appendChild(this.spyNav);
    } else if (this.spyNav) {
      // Use existing spy nav
      this.spyDots = Array.from(this.spyNav.querySelectorAll('.scroll-spy-dot'));
    }
  }
  
  bindEvents() {
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      
      const target = document.getElementById(targetId);
      if (!target) return;
      
      e.preventDefault();
      this.scrollToSection(targetId);
    });
    
    // Scroll spy and progress updates
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.updateSpyNav();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Recalculate offsets on resize
    window.addEventListener('resize', () => {
      this.updateSectionOffsets();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.navigateToNextSection();
      } else if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        this.navigateToPrevSection();
      }
    });
  }
  
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const targetPosition = section.getBoundingClientRect().top + window.scrollY - this.options.offset;
    
    // Use smooth scroll behavior
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Update URL hash without jumping
    history.pushState(null, null, `#${sectionId}`);
  }
  
  updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Update top progress bar
    if (this.scrollProgressBar) {
      this.scrollProgressBar.style.transform = `scaleX(${scrollPercent / 100})`;
    }
    
    // Update momentum bar
    if (this.momentumBar) {
      this.momentumBar.style.height = `${scrollPercent}%`;
    }
    
    // Update section progress indicators
    this.sections.forEach(section => {
      const progress = this.calculateSectionProgress(section);
      const progressEl = section.element.querySelector('.section-progress');
      if (progressEl) {
        progressEl.style.width = `${progress * 100}%`;
      }
    });
  }
  
  calculateSectionProgress(section) {
    const rect = section.element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = rect.height;
    
    const visibleTop = Math.max(0, windowHeight - rect.top);
    const visibleBottom = Math.max(0, rect.bottom);
    const visibleHeight = Math.min(visibleTop, visibleBottom, sectionHeight);
    
    return Math.min(1, Math.max(0, visibleHeight / sectionHeight));
  }
  
  updateSpyNav() {
    if (!this.spyNav || this.spyDots.length === 0) return;
    
    const scrollPosition = window.scrollY + (window.innerHeight * this.options.spyOffset);
    
    // Find current section
    let currentSection = this.sections[0];
    
    for (const section of this.sections) {
      if (section.offsetTop <= scrollPosition) {
        currentSection = section;
      }
    }
    
    // Update active dot
    if (currentSection && currentSection.id !== this.currentSection) {
      this.currentSection = currentSection.id;
      
      this.spyDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('data-section') === currentSection.id) {
          dot.classList.add('active');
        }
      });
      
      // Update section highlight
      this.sections.forEach(s => s.element.classList.remove('active'));
      currentSection.element.classList.add('active');
    }
  }
  
  navigateToNextSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    const nextSection = this.sections[currentIndex + 1];
    
    if (nextSection) {
      this.scrollToSection(nextSection.id);
    }
  }
  
  navigateToPrevSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    const prevSection = this.sections[currentIndex - 1];
    
    if (prevSection) {
      this.scrollToSection(prevSection.id);
    }
  }
  
  // Method to add scroll indicator to a section
  addScrollIndicator(section) {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = `
      <span>Scroll</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    `;
    
    indicator.addEventListener('click', () => {
      this.navigateToNextSection();
    });
    
    section.appendChild(indicator);
  }
}

// Initialize Smooth Scroll Nav
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smoothScrollNav = new SmoothScrollNav();
  });
} else {
  window.smoothScrollNav = new SmoothScrollNav();
}
