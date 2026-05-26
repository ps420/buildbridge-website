/**
 * Floating Circular Scroll Progress Indicator
 * Fortune 500 Premium UI Component
 * 
 * Features:
 * - Circular progress ring with SVG stroke animation
 * - Click to scroll to top
 * - Reading time estimation
 * - Section navigation dots
 * - Milestone celebrations (25%, 50%, 75%, 100%)
 * - Smooth animations and transitions
 */

class FloatingScrollProgress {
  constructor(options = {}) {
    this.options = {
      showAfter: options.showAfter || 300, // px to scroll before showing
      showPercentage: options.showPercentage !== false,
      showReadingTime: options.showReadingTime !== false,
      showSections: options.showSections !== false,
      milestones: options.milestones !== false,
      ...options
    };

    this.progress = 0;
    this.lastProgress = 0;
    this.reachedMilestones = new Set();
    this.sections = [];
    this.readingSpeed = 200; // words per minute
    
    this.init();
  }

  init() {
    this.createElements();
    this.calculateReadingTime();
    this.detectSections();
    this.bindEvents();
    this.updateProgress();
  }

  createElements() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'floating-scroll-progress';
    this.container.setAttribute('role', 'button');
    this.container.setAttribute('aria-label', 'Scroll to top');
    this.container.setAttribute('tabindex', '0');

    // SVG Ring
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('progress-ring');
    svg.setAttribute('viewBox', '0 0 56 56');

    // Background circle
    const bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.classList.add('progress-ring-bg');
    bgCircle.setAttribute('cx', '28');
    bgCircle.setAttribute('cy', '28');
    bgCircle.setAttribute('r', '25');
    svg.appendChild(bgCircle);

    // Progress circle
    this.progressCircle = document.createElementNS(svgNS, 'circle');
    this.progressCircle.classList.add('progress-ring-fill');
    this.progressCircle.setAttribute('cx', '28');
    this.progressCircle.setAttribute('cy', '28');
    this.progressCircle.setAttribute('r', '25');
    svg.appendChild(this.progressCircle);

    // Center button
    const center = document.createElement('div');
    center.classList.add('progress-center');

    // Arrow icon
    const icon = document.createElement('div');
    icon.classList.add('progress-icon');
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    `;
    center.appendChild(icon);

    // Percentage display
    this.percentageEl = document.createElement('span');
    this.percentageEl.classList.add('progress-percentage');
    this.percentageEl.textContent = '0%';
    center.appendChild(this.percentageEl);

    // Glow effect
    const glow = document.createElement('div');
    glow.classList.add('progress-glow');

    // Reading time tooltip
    if (this.options.showReadingTime) {
      this.readingTimeEl = document.createElement('div');
      this.readingTimeEl.classList.add('progress-reading-time');
      this.readingTimeEl.innerHTML = `
        <span class="reading-time-label">Reading time</span>
        <span class="reading-time-value">${this.readingTime} min</span>
      `;
      this.container.appendChild(this.readingTimeEl);
    }

    // Section dots
    if (this.options.showSections) {
      this.sectionsEl = document.createElement('div');
      this.sectionsEl.classList.add('progress-sections');
      this.container.appendChild(this.sectionsEl);
    }

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.classList.add('progress-tooltip');
    this.tooltipEl.textContent = 'Click to scroll to top';
    this.container.appendChild(this.tooltipEl);

    // Assemble
    this.container.appendChild(svg);
    this.container.appendChild(center);
    this.container.appendChild(glow);

    // Add to DOM
    document.body.appendChild(this.container);
  }

  calculateReadingTime() {
    // Get text content from main content areas
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.section',
      '#main-content'
    ];

    let wordCount = 0;
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || '';
        wordCount = text.trim().split(/\s+/).length;
        break;
      }
    }

    // Fallback: count all paragraphs if no main content found
    if (wordCount === 0) {
      const paragraphs = document.querySelectorAll('p');
      wordCount = Array.from(paragraphs).reduce((acc, p) => {
        return acc + (p.textContent || '').trim().split(/\s+/).length;
      }, 0);
    }

    this.readingTime = Math.max(1, Math.ceil(wordCount / this.readingSpeed));
  }

  detectSections() {
    const sectionSelectors = [
      'section[id]',
      '[data-section]',
      '[id]:is(section, div, article)'
    ];

    for (const selector of sectionSelectors) {
      this.sections = document.querySelectorAll(selector);
      if (this.sections.length > 0) break;
    }

    // Create section dots
    if (this.sections.length > 0 && this.options.showSections) {
      this.sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.classList.add('progress-section-dot');
        dot.setAttribute('data-section-index', index);
        dot.setAttribute('aria-label', `Jump to section ${index + 1}`);
        
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.scrollToSection(index);
        });

        this.sectionsEl.appendChild(dot);
      });
    }
  }

  bindEvents() {
    // Scroll handler with RAF throttling
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

    // Click to scroll to top
    this.container.addEventListener('click', () => {
      this.scrollToTop();
    });

    // Keyboard support
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToTop();
      }
    });

    // Show percentage on hover
    this.container.addEventListener('mouseenter', () => {
      if (this.options.showPercentage) {
        this.container.classList.add('show-percentage');
      }
    });

    this.container.addEventListener('mouseleave', () => {
      this.container.classList.remove('show-percentage');
    });
  }

  updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Calculate percentage
    this.progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    
    // Update ring
    const circumference = 2 * Math.PI * 25; // r = 25
    const offset = circumference - (this.progress / 100) * circumference;
    this.progressCircle.style.strokeDashoffset = offset;

    // Update percentage text
    this.percentageEl.textContent = `${Math.round(this.progress)}%`;

    // Show/hide based on scroll position
    if (scrollTop > this.options.showAfter) {
      this.container.classList.add('visible');
    } else {
      this.container.classList.remove('visible');
    }

    // Check milestones
    if (this.options.milestones) {
      this.checkMilestones();
    }

    // Update section dots
    this.updateSectionDots();

    this.lastProgress = this.progress;
  }

  checkMilestones() {
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (this.progress >= milestone && !this.reachedMilestones.has(milestone)) {
        this.reachedMilestones.add(milestone);
        this.celebrateMilestone(milestone);
      }
      
      // Reset if scrolling back up
      if (this.progress < milestone - 10 && this.reachedMilestones.has(milestone)) {
        this.reachedMilestones.delete(milestone);
      }
    });
  }

  celebrateMilestone(milestone) {
    // Add milestone class for animation
    this.container.classList.add(`milestone-${milestone}`);
    
    // Update tooltip temporarily
    const originalText = this.tooltipEl.textContent;
    this.tooltipEl.textContent = `${milestone}% complete! 🎉`;
    
    // Show container if hidden
    this.container.classList.add('visible');

    // Remove animation class after animation completes
    setTimeout(() => {
      this.container.classList.remove(`milestone-${milestone}`);
      setTimeout(() => {
        this.tooltipEl.textContent = originalText;
      }, 2000);
    }, 600);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('scrollMilestone', {
      detail: { milestone, progress: this.progress }
    }));
  }

  updateSectionDots() {
    if (!this.sections.length || !this.sectionsEl) return;

    const scrollTop = window.scrollY + window.innerHeight / 2;

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;

      const dot = this.sectionsEl.children[index];
      if (dot) {
        if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      }
    });
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Update tooltip
    this.tooltipEl.textContent = 'Scrolling to top...';
    setTimeout(() => {
      this.tooltipEl.textContent = 'Click to scroll to top';
    }, 1500);
  }

  scrollToSection(index) {
    const section = this.sections[index];
    if (section) {
      const offset = 100; // Account for fixed header
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  }

  // Public API
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  setProgress(percentage) {
    // Manually set progress (for programmatic control)
    const circumference = 2 * Math.PI * 25;
    const offset = circumference - (percentage / 100) * circumference;
    this.progressCircle.style.strokeDashoffset = offset;
    this.percentageEl.textContent = `${Math.round(percentage)}%`;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollProgress = new FloatingScrollProgress();
  });
} else {
  window.scrollProgress = new FloatingScrollProgress();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingScrollProgress;
}
