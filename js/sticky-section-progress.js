/**
 * BuildBridge v27.0 - Sticky Section Headers with Progress
 * Fortune 500 Quality Section Navigation
 */

class StickySectionProgress {
  constructor(options = {}) {
    this.options = {
      headerSelector: '.sticky-section-header',
      sectionSelector: '[data-section]',
      offset: 100,
      enableProgress: true,
      enableJumpMenu: true,
      ...options
    };
    
    this.headers = [];
    this.sections = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createHeaders();
    this.createObserver();
    this.bindEvents();
  }
  
  findSections() {
    this.sections = Array.from(document.querySelectorAll(this.options.sectionSelector)).map(section => {
      return {
        element: section,
        id: section.id,
        label: section.dataset.navLabel || section.dataset.section || 'Section',
        number: section.dataset.sectionNumber || ''
      };
    });
  }
  
  createHeaders() {
    this.sections.forEach((section, index) => {
      // Check if header already exists for this section
      let header = section.element.querySelector(this.options.headerSelector);
      
      if (!header) {
        header = document.createElement('div');
        header.className = 'sticky-section-header';
        header.innerHTML = this.getHeaderHTML(section, index);
        
        // Insert at beginning of section
        section.element.insertBefore(header, section.element.firstChild);
      }
      
      this.headers.push({
        element: header,
        section: section,
        progressBar: header.querySelector('.section-progress')
      });
      
      // Create section anchor point
      section.element.classList.add('section-anchor');
    });
  }
  
  getHeaderHTML(section, index) {
    const totalSections = this.sections.length;
    const nextSections = this.sections.slice(index + 1, index + 4);
    
    let navLinks = '';
    if (nextSections.length > 0) {
      navLinks = nextSections.map(s => `
        <a href="#${s.id}" class="sticky-section-nav-link" data-target="${s.id}">
          ${s.label}
        </a>
      `).join('');
    }
    
    return `
      <div class="sticky-section-header-inner">
        <div class="section-breadcrumb">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <span class="current">${section.label}</span>
        </div>
        
        <h2 class="sticky-section-title" data-number="0${index + 1}">
          ${section.label}
        </h2>
        
        ${navLinks ? `
          <nav class="sticky-section-nav" aria-label="Next sections">
            ${navLinks}
          </nav>
        ` : ''}
        
        <div class="sticky-section-counter">
          <span class="current">0${index + 1}</span>
          <span class="separator">/</span>
          <span class="total">0${totalSections}</span>
        </div>
        
        ${this.options.enableJumpMenu && totalSections > 1 ? `
          <div class="section-jump-menu">
            <button class="section-jump-toggle" aria-label="Jump to section">
              <span>Sections</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div class="section-jump-dropdown">
              ${this.sections.map((s, i) => `
                <div class="section-jump-item ${s.id === section.id ? 'active' : ''}" data-target="${s.id}">
                  <span class="section-jump-number">0${i + 1}</span>
                  <span class="section-jump-label">${s.label}</span>
                  <div class="section-jump-progress">
                    <div class="section-jump-progress-bar" style="width: 0%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      ${this.options.enableProgress ? `
        <div class="section-progress" style="width: 0%"></div>
      ` : ''}
    `;
  }
  
  createObserver() {
    const options = {
      root: null,
      rootMargin: `-${this.options.offset}px 0px -${window.innerHeight - this.options.offset - 200}px 0px`,
      threshold: 0
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = this.sections.find(s => s.element === entry.target);
        const header = this.headers.find(h => h.section === section);
        
        if (header) {
          if (entry.isIntersecting) {
            header.element.classList.add('visible');
          } else {
            header.element.classList.remove('visible');
          }
        }
      });
    }, options);
    
    this.sections.forEach(section => {
      this.observer.observe(section.element);
    });
  }
  
  bindEvents() {
    // Smooth scroll for navigation links
    this.headers.forEach(header => {
      const navLinks = header.element.querySelectorAll('.sticky-section-nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('data-target');
          this.scrollToSection(targetId);
        });
      });
      
      // Jump menu toggle
      const jumpToggle = header.element.querySelector('.section-jump-toggle');
      const jumpMenu = header.element.querySelector('.section-jump-menu');
      
      if (jumpToggle && jumpMenu) {
        jumpToggle.addEventListener('click', () => {
          jumpMenu.classList.toggle('open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
          if (!jumpMenu.contains(e.target)) {
            jumpMenu.classList.remove('open');
          }
        });
        
        // Jump menu items
        const jumpItems = jumpMenu.querySelectorAll('.section-jump-item');
        jumpItems.forEach(item => {
          item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            this.scrollToSection(targetId);
            jumpMenu.classList.remove('open');
          });
        });
      }
    });
    
    // Update progress on scroll
    window.addEventListener('scroll', () => {
      this.updateProgress();
    }, { passive: true });
  }
  
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const targetPosition = section.getBoundingClientRect().top + window.scrollY - this.options.offset - 80;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    history.pushState(null, null, `#${sectionId}`);
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + scrollTop;
      const sectionHeight = rect.height;
      
      // Calculate progress through this section
      const sectionProgress = Math.max(0, Math.min(1, 
        (scrollTop + windowHeight - sectionTop) / (windowHeight + sectionHeight)
      ));
      
      // Update header progress bar
      const header = this.headers.find(h => h.section === section);
      if (header && header.progressBar) {
        header.progressBar.style.width = `${sectionProgress * 100}%`;
      }
      
      // Update active nav links
      this.headers.forEach(h => {
        const navLinks = h.element.querySelectorAll('.sticky-section-nav-link');
        navLinks.forEach(link => {
          const targetId = link.getAttribute('data-target');
          const targetSection = this.sections.find(s => s.id === targetId);
          
          if (targetSection) {
            const targetRect = targetSection.element.getBoundingClientRect();
            if (targetRect.top <= this.options.offset + 100 && targetRect.bottom > this.options.offset) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          }
        });
      });
      
      // Update jump menu progress
      this.headers.forEach(h => {
        const jumpProgressBars = h.element.querySelectorAll('.section-jump-progress-bar');
        jumpProgressBars.forEach((bar, i) => {
          const targetSection = this.sections[i];
          if (targetSection) {
            const targetRect = targetSection.element.getBoundingClientRect();
            const targetTop = targetRect.top + scrollTop;
            const targetHeight = targetRect.height;
            
            let progress = 0;
            if (scrollTop + windowHeight > targetTop) {
              progress = Math.min(1, (scrollTop + windowHeight - targetTop) / (windowHeight + targetHeight));
            }
            
            bar.style.width = `${progress * 100}%`;
          }
        });
      });
    });
  }
  
  // Public method to refresh (use after dynamic content changes)
  refresh() {
    this.headers = [];
    this.sections = [];
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove existing headers
    document.querySelectorAll('.sticky-section-header').forEach(h => h.remove());
    
    this.findSections();
    this.createHeaders();
    this.createObserver();
    this.bindEvents();
  }
}

// Initialize Sticky Section Progress
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.stickySectionProgress = new StickySectionProgress();
  });
} else {
  window.stickySectionProgress = new StickySectionProgress();
}
