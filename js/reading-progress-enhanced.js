/**
 * Reading Progress & Time Estimator
 * Fortune 500 Grade UX Enhancement
 * Tracks reading progress, estimates time remaining, and provides visual feedback
 */

class ReadingProgressSystem {
  constructor(options = {}) {
    this.options = {
      wordsPerMinute: options.wordsPerMinute || 200,
      showTimeWidget: options.showTimeWidget !== false,
      showSectionNav: options.showSectionNav !== false,
      showCompletion: options.showCompletion !== false,
      showVelocity: options.showVelocity !== false,
      minReadTime: options.minReadTime || 5000, // Minimum milliseconds to count as "reading"
      completionThreshold: options.completionThreshold || 0.95
    };
    
    this.state = {
      scrollProgress: 0,
      readingTime: 0,
      timeRemaining: 0,
      wordCount: 0,
      sections: [],
      currentSection: 0,
      isReading: false,
      readingStartTime: null,
      hasCompleted: false,
      scrollVelocity: 0,
      lastScrollY: 0,
      lastScrollTime: Date.now()
    };
    
    this.throttleTimer = null;
    this.readingTimer = null;
    this.velocityTimer = null;
    
    this.init();
  }
  
  init() {
    this.calculateWordCount();
    this.findSections();
    this.createElements();
    this.bindEvents();
    this.update();
    
    console.log('📖 Reading Progress System initialized');
    console.log(`   Word count: ${this.state.wordCount}`);
    console.log(`   Est. read time: ${this.formatTime(this.state.readingTime)}`);
  }
  
  calculateWordCount() {
    // Get main content area
    const mainContent = document.querySelector('main, article, .content, #main-content') || document.body;
    
    // Clone to avoid modifying actual content
    const clone = mainContent.cloneNode(true);
    
    // Remove non-content elements
    const excludeSelectors = 'script, style, nav, header, footer, .nav, .footer, .sidebar, aside, [aria-hidden="true"]';
    clone.querySelectorAll(excludeSelectors).forEach(el => el.remove());
    
    // Get text content
    const text = clone.textContent || clone.innerText || '';
    
    // Count words (split by whitespace and filter empty)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    this.state.wordCount = words.length;
    
    // Calculate reading time
    this.state.readingTime = Math.ceil(words.length / this.options.wordsPerMinute);
    this.state.timeRemaining = this.state.readingTime;
  }
  
  findSections() {
    // Find all major sections for navigation
    const sectionSelectors = 'section[data-section], [id], h2, h3';
    const elements = document.querySelectorAll(sectionSelectors);
    
    this.state.sections = Array.from(elements).map((el, index) => {
      const id = el.id || el.dataset.section || `section-${index}`;
      const label = el.dataset.navLabel || 
                   el.querySelector('.eyebrow')?.textContent || 
                   el.textContent?.slice(0, 30) || 
                   `Section ${index + 1}`;
      
      return {
        id,
        label: label.trim(),
        element: el,
        top: 0,
        read: false
      };
    }).filter(section => section.element);
    
    // Calculate positions
    this.updateSectionPositions();
  }
  
  updateSectionPositions() {
    const scrollY = window.scrollY;
    
    this.state.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.top = rect.top + scrollY;
      section.height = rect.height;
    });
  }
  
  createElements() {
    // Main progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    progressContainer.innerHTML = `
      <div class="reading-progress-bar" role="progressbar" 
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"
           aria-label="Reading progress"></div>
    `;
    document.body.appendChild(progressContainer);
    this.progressBar = progressContainer.querySelector('.reading-progress-bar');
    
    // Reading time widget
    if (this.options.showTimeWidget) {
      this.createTimeWidget();
    }
    
    // Section navigation dots
    if (this.options.showSectionNav && this.state.sections.length > 1) {
      this.createSectionNav();
    }
    
    // Article info card
    this.createArticleInfoCard();
    
    // Scroll velocity indicator
    if (this.options.showVelocity) {
      this.createVelocityIndicator();
    }
    
    // Completion celebration
    if (this.options.showCompletion) {
      this.createCompletionOverlay();
    }
  }
  
  createTimeWidget() {
    const widget = document.createElement('div');
    widget.className = 'reading-time-widget';
    widget.innerHTML = `
      <div class="reading-time-header">
        <div class="reading-time-icon">⏱️</div>
        <div class="reading-time-title">
          Reading Time
          <span>Article statistics</span>
        </div>
      </div>
      <div class="reading-time-stats">
        <div class="reading-time-stat">
          <span class="reading-time-stat-label">Total time</span>
          <span class="reading-time-stat-value">
            ${this.state.readingTime}
            <span class="unit">min</span>
          </span>
        </div>
        <div class="reading-time-stat">
          <span class="reading-time-stat-label">Remaining</span>
          <span class="reading-time-stat-value" data-time-remaining>
            ${this.state.timeRemaining}
            <span class="unit">min</span>
          </span>
        </div>
        <div class="reading-time-stat">
          <span class="reading-time-stat-label">Words</span>
          <span class="reading-time-stat-value">
            ${this.state.wordCount.toLocaleString()}
            <span class="unit">words</span>
          </span>
        </div>
        <div class="time-remaining-bar">
          <div class="time-remaining-track">
            <div class="time-remaining-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    this.timeWidget = widget;
    this.timeRemainingEl = widget.querySelector('[data-time-remaining]');
    this.timeRemainingBar = widget.querySelector('.time-remaining-fill');
    
    // Show after delay
    setTimeout(() => widget.classList.add('visible'), 1000);
  }
  
  createSectionNav() {
    const nav = document.createElement('div');
    nav.className = 'reading-section-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Page sections');
    
    this.state.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'reading-section-dot';
      dot.dataset.section = index;
      dot.setAttribute('data-section', section.label);
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Jump to ${section.label}`);
      
      // Add progress bar between dots (except after last)
      if (index < this.state.sections.length - 1) {
        const progress = document.createElement('div');
        progress.className = 'reading-section-progress';
        progress.innerHTML = '<div class="reading-section-progress-fill"></div>';
        dot.appendChild(progress);
      }
      
      dot.addEventListener('click', () => this.scrollToSection(index));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToSection(index);
        }
      });
      
      nav.appendChild(dot);
    });
    
    document.body.appendChild(nav);
    this.sectionNav = nav;
    this.sectionDots = nav.querySelectorAll('.reading-section-dot');
  }
  
  createArticleInfoCard() {
    const card = document.createElement('div');
    card.className = 'article-info-card';
    card.innerHTML = `
      <div class="article-info-title">
        📄 Article Info
      </div>
      <div class="article-info-meta">
        <div class="article-info-item">
          <div class="article-info-icon">⏱️</div>
          <div class="article-info-text">
            <strong>${this.state.readingTime} min</strong> read
          </div>
        </div>
        <div class="article-info-item">
          <div class="article-info-icon">📝</div>
          <div class="article-info-text">
            <strong>${this.state.wordCount.toLocaleString()}</strong> words
          </div>
        </div>
        <div class="article-info-item">
          <div class="article-info-icon">📅</div>
          <div class="article-info-text">
            Published <strong>${this.formatDate()}</strong>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(card);
    this.articleInfoCard = card;
    
    // Show on scroll, hide after reading starts
    setTimeout(() => card.classList.add('visible'), 500);
    
    // Hide after 5 seconds or on scroll
    setTimeout(() => {
      card.classList.add('hidden');
    }, 8000);
  }
  
  createVelocityIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-velocity-indicator';
    indicator.innerHTML = `
      <span>⚡</span>
      <span class="velocity-text">Reading speed</span>
      <div class="scroll-velocity-bar">
        <div class="scroll-velocity-fill"></div>
      </div>
    `;
    
    document.body.appendChild(indicator);
    this.velocityIndicator = indicator;
    this.velocityFill = indicator.querySelector('.scroll-velocity-fill');
  }
  
  createCompletionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'reading-completion';
    overlay.innerHTML = `
      <div class="reading-completion-content">
        <div class="reading-completion-icon">🎉</div>
        <h3>Article Complete!</h3>
        <p>You've reached the end of this article. Thank you for reading!</p>
        <div class="reading-completion-actions">
          <button class="cookie-btn cookie-btn-tertiary" data-action="share">
            📤 Share
          </button>
          <button class="cookie-btn cookie-btn-primary" data-action="close">
            Continue
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.completionOverlay = overlay;
    
    // Event listeners
    overlay.querySelector('[data-action="share"]').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      } else {
        this.showToast('Link copied to clipboard!');
        navigator.clipboard.writeText(window.location.href);
      }
    });
    
    overlay.querySelector('[data-action="close"]').addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }
  
  bindEvents() {
    // Scroll events (throttled)
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.state.isReading = document.visibilityState === 'visible';
      if (this.state.isReading) {
        this.startReadingTimer();
      } else {
        this.stopReadingTimer();
      }
    });
    
    // Resize
    window.addEventListener('resize', () => {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = setTimeout(() => {
        this.updateSectionPositions();
        this.update();
      }, 100);
    });
    
    // Start reading timer
    this.startReadingTimer();
    
    // Velocity tracking
    if (this.options.showVelocity) {
      this.startVelocityTracking();
    }
  }
  
  onScroll() {
    this.calculateScrollProgress();
    this.calculateScrollVelocity();
    this.updateCurrentSection();
    this.update();
    
    // Track reading engagement
    if (!this.state.readingStartTime) {
      this.state.readingStartTime = Date.now();
    }
  }
  
  calculateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) {
      this.state.scrollProgress = 0;
      return;
    }
    
    this.state.scrollProgress = Math.min(1, Math.max(0, scrollTop / docHeight));
  }
  
  calculateScrollVelocity() {
    const now = Date.now();
    const scrollY = window.scrollY;
    const delta = scrollY - this.state.lastScrollY;
    const timeDelta = now - this.state.lastScrollTime;
    
    if (timeDelta > 0) {
      // Smooth velocity calculation
      const rawVelocity = Math.abs(delta / timeDelta) * 100;
      this.state.scrollVelocity = this.state.scrollVelocity * 0.8 + rawVelocity * 0.2;
    }
    
    this.state.lastScrollY = scrollY;
    this.state.lastScrollTime = now;
    
    // Show/hide velocity indicator based on movement
    if (this.velocityIndicator) {
      const isMoving = this.state.scrollVelocity > 0.5;
      this.velocityIndicator.classList.toggle('visible', isMoving);
      
      if (isMoving) {
        const normalizedVelocity = Math.min(100, this.state.scrollVelocity * 10);
        this.velocityFill.style.width = `${normalizedVelocity}%`;
      }
    }
  }
  
  updateCurrentSection() {
    const scrollY = window.scrollY + window.innerHeight * 0.3;
    
    // Find current section
    let currentIndex = 0;
    for (let i = this.state.sections.length - 1; i >= 0; i--) {
      if (this.state.sections[i].top <= scrollY) {
        currentIndex = i;
        break;
      }
    }
    
    this.state.currentSection = currentIndex;
    
    // Mark sections as read
    this.state.sections.forEach((section, index) => {
      if (index < currentIndex) {
        section.read = true;
      }
    });
  }
  
  update() {
    const progress = Math.round(this.state.scrollProgress * 100);
    
    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', progress);
      this.progressBar.classList.toggle('active', progress > 0 && progress < 100);
    }
    
    // Calculate remaining time based on progress
    const remainingMinutes = Math.ceil(
      this.state.readingTime * (1 - this.state.scrollProgress)
    );
    
    // Update time widget
    if (this.timeRemainingEl) {
      this.timeRemainingEl.innerHTML = `
        ${Math.max(1, remainingMinutes)}
        <span class="unit">min</span>
      `;
    }
    
    if (this.timeRemainingBar) {
      this.timeRemainingBar.style.width = `${this.state.scrollProgress * 100}%`;
    }
    
    // Update section dots
    if (this.sectionDots) {
      this.sectionDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.state.currentSection);
        dot.classList.toggle('read', this.state.sections[index]?.read);
        
        // Update progress between dots
        const progressEl = dot.querySelector('.reading-section-progress-fill');
        if (progressEl && index < this.state.currentSection) {
          progressEl.style.height = '100%';
        }
      });
    }
    
    // Check completion
    if (progress >= 95 && !this.state.hasCompleted && this.options.showCompletion) {
      this.onCompletion();
    }
  }
  
  startReadingTimer() {
    this.state.isReading = true;
    
    this.readingTimer = setInterval(() => {
      if (this.state.isReading && document.visibilityState === 'visible') {
        // Update reading metrics here if needed
      }
    }, 1000);
  }
  
  stopReadingTimer() {
    this.state.isReading = false;
    if (this.readingTimer) {
      clearInterval(this.readingTimer);
    }
  }
  
  startVelocityTracking() {
    // Reset velocity when scroll stops
    this.velocityTimer = setInterval(() => {
      const timeSinceLastScroll = Date.now() - this.state.lastScrollTime;
      if (timeSinceLastScroll > 150) {
        this.state.scrollVelocity *= 0.9;
        
        if (this.state.scrollVelocity < 0.1) {
          this.state.scrollVelocity = 0;
          if (this.velocityIndicator) {
            this.velocityIndicator.classList.remove('visible');
          }
        }
      }
    }, 100);
  }
  
  scrollToSection(index) {
    const section = this.state.sections[index];
    if (!section) return;
    
    const offset = 100; // Account for fixed header
    const targetY = section.top - offset;
    
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }
  
  onCompletion() {
    this.state.hasCompleted = true;
    
    // Show completion overlay
    if (this.completionOverlay) {
      // Delay slightly for better UX
      setTimeout(() => {
        this.completionOverlay.classList.add('active');
      }, 500);
    }
    
    // Emit event
    window.dispatchEvent(new CustomEvent('articleComplete', {
      detail: {
        readingTime: this.state.readingTime,
        wordCount: this.state.wordCount
      }
    }));
    
    console.log('📖 Article reading complete!');
  }
  
  formatTime(minutes) {
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
  }
  
  formatDate() {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  showToast(message) {
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log(message);
    }
  }
  
  // Public API
  getProgress() {
    return this.state.scrollProgress;
  }
  
  getStats() {
    return {
      wordCount: this.state.wordCount,
      readingTime: this.state.readingTime,
      progress: this.state.scrollProgress,
      currentSection: this.state.currentSection
    };
  }
  
  destroy() {
    this.stopReadingTimer();
    if (this.velocityTimer) clearInterval(this.velocityTimer);
    if (this.throttleTimer) clearTimeout(this.throttleTimer);
    
    // Remove elements
    [
      '.reading-progress-container',
      '.reading-time-widget',
      '.reading-section-nav',
      '.article-info-card',
      '.scroll-velocity-indicator',
      '.reading-completion'
    ].forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.remove();
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.readingProgress = new ReadingProgressSystem();
  });
} else {
  window.readingProgress = new ReadingProgressSystem();
}
