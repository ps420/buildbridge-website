/**
 * Smart Reading Progress - v39.0
 * Fortune 500 Professional Reading Indicator
 * Features: Section awareness, scroll velocity, reading time, chapter navigation
 */

class SmartReadingProgress {
  constructor(options = {}) {
    this.options = {
      showChapters: true,
      showVelocity: false,
      showTime: true,
      showCompletion: true,
      velocityThreshold: 5000, // pixels per second
      ...options
    };
    
    this.sections = [];
    this.currentSection = null;
    this.readingStartTime = Date.now();
    this.scrollVelocity = 0;
    this.lastScrollTop = 0;
    this.lastScrollTime = Date.now();
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.findSections();
    this.createProgressBar();
    
    if (this.options.showChapters) {
      this.createChapterNav();
    }
    
    if (this.options.showVelocity) {
      this.createVelocityIndicator();
    }
    
    if (this.options.showTime) {
      this.createTimeEstimate();
    }
    
    if (this.options.showCompletion) {
      this.createCompletionModal();
    }
    
    this.bindEvents();
    this.calculateReadingTime();
  }
  
  findSections() {
    // Find all sections with data-section or section/heading tags
    const sectionElements = document.querySelectorAll('[data-section], section[id], article[id]');
    
    this.sections = Array.from(sectionElements).map((el, index) => {
      const label = el.dataset.navLabel || 
                    el.dataset.section || 
                    el.querySelector('h2, h3')?.textContent || 
                    `Section ${index + 1}`;
      
      return {
        element: el,
        label: label.substring(0, 25),
        id: el.id || `section-${index}`,
        read: false
      };
    });
  }
  
  createProgressBar() {
    this.progressContainer = document.createElement('div');
    this.progressContainer.className = 'smart-reading-progress';
    this.progressContainer.innerHTML = `
      <div class="smart-reading-progress__bar"></div>
      <div class="smart-reading-progress__markers"></div>
    `;
    
    document.body.insertBefore(this.progressContainer, document.body.firstChild);
    
    this.progressBar = this.progressContainer.querySelector('.smart-reading-progress__bar');
    this.markersContainer = this.progressContainer.querySelector('.smart-reading-progress__markers');
    
    // Create section markers
    if (this.sections.length > 1) {
      this.createSectionMarkers();
    }
  }
  
  createSectionMarkers() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    this.sections.forEach((section, index) => {
      const marker = document.createElement('div');
      marker.className = 'smart-reading-progress__marker';
      marker.dataset.label = section.label;
      marker.dataset.index = index;
      
      // Calculate position
      const sectionTop = section.element.offsetTop;
      const position = (sectionTop / docHeight) * 100;
      marker.style.left = `${position}%`;
      
      this.markersContainer.appendChild(marker);
      section.marker = marker;
    });
  }
  
  createChapterNav() {
    if (this.sections.length <= 1) return;
    
    this.chaptersContainer = document.createElement('nav');
    this.chaptersContainer.className = 'smart-reading-chapters';
    this.chaptersContainer.setAttribute('aria-label', 'Page sections');
    
    this.sections.forEach((section, index) => {
      const chapter = document.createElement('button');
      chapter.className = 'smart-reading-chapter';
      chapter.dataset.index = index;
      chapter.setAttribute('aria-label', `Go to ${section.label}`);
      chapter.innerHTML = `
        <span class="smart-reading-chapter__dot"></span>
        <span class="smart-reading-chapter__label">${section.label}</span>
      `;
      
      chapter.addEventListener('click', () => this.scrollToSection(index));
      
      this.chaptersContainer.appendChild(chapter);
      section.chapter = chapter;
    });
    
    document.body.appendChild(this.chaptersContainer);
    
    // Show on scroll
    setTimeout(() => this.chaptersContainer.classList.add('is-visible'), 1000);
  }
  
  createVelocityIndicator() {
    this.velocityContainer = document.createElement('div');
    this.velocityContainer.className = 'smart-reading-velocity';
    this.velocityContainer.innerHTML = `
      <svg class="smart-reading-velocity__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span class="smart-reading-velocity__label">Reading:</span>
      <span class="smart-reading-velocity__value">0 px/s</span>
    `;
    
    document.body.appendChild(this.velocityContainer);
    this.velocityValue = this.velocityContainer.querySelector('.smart-reading-velocity__value');
  }
  
  createTimeEstimate() {
    this.timeContainer = document.createElement('div');
    this.timeContainer.className = 'smart-reading-time';
    this.timeContainer.innerHTML = `
      <svg class="smart-reading-time__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span class="smart-reading-time__text">
        <strong id="reading-time-remaining">-- min</strong> remaining
      </span>
    `;
    
    document.body.appendChild(this.timeContainer);
    this.timeText = this.timeContainer.querySelector('#reading-time-remaining');
    
    // Show after delay
    setTimeout(() => this.timeContainer.classList.add('is-visible'), 2000);
  }
  
  createCompletionModal() {
    this.completionModal = document.createElement('div');
    this.completionModal.className = 'smart-reading-complete';
    this.completionModal.innerHTML = `
      <div class="smart-reading-complete__content">
        <div class="smart-reading-complete__icon">🎉</div>
        <h3 class="smart-reading-complete__title">You've Reached the End!</h3>
        <p class="smart-reading-complete__text">Great job reading through our content. Ready to start your project?</p>
        <div class="smart-reading-complete__actions">
          <a href="contact.html" class="btn">Get Started</a>
          <button class="btn ghost" onclick="document.querySelector('.smart-reading-complete').classList.remove('is-visible')">Continue Browsing</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.completionModal);
  }
  
  calculateReadingTime() {
    // Estimate based on word count
    const text = document.body.innerText || '';
    const wordCount = text.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    this.totalReadingMinutes = Math.ceil(wordCount / readingSpeed);
  }
  
  bindEvents() {
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    
    // Update every frame for smooth animation
    this.updateLoop();
  }
  
  handleScroll() {
    this.isScrolling = true;
    this.progressContainer.classList.add('is-scrolling');
    
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.progressContainer.classList.remove('is-scrolling');
    }, 150);
    
    // Calculate velocity
    const now = Date.now();
    const scrollTop = window.scrollY;
    const scrollDelta = scrollTop - this.lastScrollTop;
    const timeDelta = now - this.lastScrollTime;
    
    if (timeDelta > 0) {
      this.scrollVelocity = Math.abs(scrollDelta / timeDelta * 1000); // px per second
    }
    
    this.lastScrollTop = scrollTop;
    this.lastScrollTime = now;
  }
  
  updateLoop() {
    // Update progress bar
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    
    this.progressBar.style.width = `${progress}%`;
    
    // Update active section
    this.updateActiveSection(scrollTop);
    
    // Update velocity display
    if (this.options.showVelocity) {
      this.updateVelocityDisplay();
    }
    
    // Update time estimate
    if (this.options.showTime) {
      this.updateTimeEstimate(progress);
    }
    
    // Check completion
    if (this.options.showCompletion && progress >= 95 && !this.completionShown) {
      this.showCompletion();
    }
    
    requestAnimationFrame(() => this.updateLoop());
  }
  
  updateActiveSection(scrollTop) {
    const viewportCenter = scrollTop + window.innerHeight / 2;
    
    let activeIndex = -1;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + scrollTop;
      const sectionCenter = sectionTop + rect.height / 2;
      
      // Check if section has been read
      if (rect.top < window.innerHeight * 0.8) {
        section.read = true;
        if (section.chapter) {
          section.chapter.classList.add('is-read');
        }
      }
      
      // Find active section
      if (sectionCenter <= viewportCenter + window.innerHeight / 3) {
        activeIndex = index;
      }
    });
    
    if (activeIndex !== -1 && activeIndex !== this.currentSection) {
      // Update previous active
      if (this.currentSection !== null && this.sections[this.currentSection]) {
        const prev = this.sections[this.currentSection];
        if (prev.marker) prev.marker.classList.remove('is-active');
        if (prev.chapter) prev.chapter.classList.remove('is-active');
      }
      
      // Update new active
      this.currentSection = activeIndex;
      const current = this.sections[activeIndex];
      if (current.marker) current.marker.classList.add('is-active');
      if (current.chapter) current.chapter.classList.add('is-active');
    }
  }
  
  updateVelocityDisplay() {
    if (this.scrollVelocity > this.options.velocityThreshold) {
      this.velocityContainer.classList.add('is-visible');
      this.velocityValue.textContent = `${Math.round(this.scrollVelocity)} px/s`;
    } else {
      this.velocityContainer.classList.remove('is-visible');
    }
  }
  
  updateTimeEstimate(progress) {
    const remainingProgress = 100 - progress;
    const remainingMinutes = Math.ceil((this.totalReadingMinutes * remainingProgress) / 100);
    
    if (remainingMinutes > 0 && remainingMinutes <= this.totalReadingMinutes) {
      this.timeText.textContent = `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      this.timeText.textContent = 'Done!';
    }
  }
  
  scrollToSection(index) {
    const section = this.sections[index];
    if (!section) return;
    
    const offset = section.element.offsetTop - 100; // Account for header
    
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }
  
  showCompletion() {
    this.completionShown = true;
    this.completionModal.classList.add('is-visible');
    
    // Track completion
    this.trackEvent('reading_complete', {
      timeSpent: Date.now() - this.readingStartTime,
      sectionsRead: this.sections.filter(s => s.read).length
    });
  }
  
  handleResize() {
    // Recalculate marker positions
    if (this.markersContainer) {
      this.markersContainer.innerHTML = '';
      this.createSectionMarkers();
    }
  }
  
  trackEvent(event, data) {
    // Analytics placeholder - integrate with your analytics
    if (window.gtag) {
      window.gtag('event', event, data);
    }
    console.log(`[Reading Progress] ${event}:`, data);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SmartReadingProgress());
} else {
  new SmartReadingProgress();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartReadingProgress;
}
