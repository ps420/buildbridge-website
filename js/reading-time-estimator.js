/**
 * Reading Time Estimator v58.0
 * Intelligent content insights with Fortune 500 polish
 */

class ReadingTimeEstimator {
  constructor(options = {}) {
 this.wordsPerMinute = options.wordsPerMinute || 200;
    this.updateInterval = options.updateInterval || 1000;
    this.showCompletionToast = options.showCompletionToast !== false;
    this.completionThreshold = options.completionThreshold || 0.95;
    
    this.stats = {
      totalWords: 0,
      estimatedMinutes: 0,
      readingLevel: 'medium',
      paragraphCount: 0,
      imageCount: 0,
      currentProgress: 0,
      timeSpent: 0,
      startTime: Date.now(),
      sections: [],
      completed: false
    };
    
    this.widget = null;
    this.statsPanel = null;
    this.progressLine = null;
    this.observers = [];
    this.updateTimer = null;
    
    this.init();
  }
  
  init() {
    this.analyzeContent();
    this.createWidget();
    this.createProgressLine();
    this.bindEvents();
    this.startTracking();
    this.setupSectionObserver();
    
    console.log(`📖 Reading Time: ${this.stats.estimatedMinutes} min | ${this.stats.totalWords} words`);
  }
  
  analyzeContent() {
    // Get main content area
    const mainContent = document.querySelector('main, article, .content, [role="main"]') || document.body;
    
    // Count words
    const text = mainContent.innerText || mainContent.textContent || '';
    this.stats.totalWords = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Calculate reading time
    this.stats.estimatedMinutes = Math.max(1, Math.ceil(this.stats.totalWords / this.wordsPerMinute));
    
    // Count paragraphs
    this.stats.paragraphCount = mainContent.querySelectorAll('p').length;
    
    // Count images
    this.stats.imageCount = mainContent.querySelectorAll('img').length;
    
    // Determine reading level
    const avgWordsPerSentence = this.stats.totalWords / (text.match(/[.!?]+/g) || []).length || 0;
    if (avgWordsPerSentence < 12) {
      this.stats.readingLevel = 'easy';
    } else if (avgWordsPerSentence > 20) {
      this.stats.readingLevel = 'hard';
    } else {
      this.stats.readingLevel = 'medium';
    }
    
    // Identify sections
    this.stats.sections = Array.from(document.querySelectorAll('section[data-section], h2, h3')).map((el, i) => ({
      id: el.id || `section-${i}`,
      title: el.getAttribute('data-nav-label') || el.textContent?.slice(0, 30) || `Section ${i + 1}`,
      element: el,
      progress: 0
    }));
  }
  
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'reading-time-widget';
    widget.setAttribute('role', 'status');
    widget.setAttribute('aria-live', 'polite');
    widget.setAttribute('aria-label', 'Reading progress');
    
    widget.innerHTML = `
      <div class="reading-time-content">
        <div class="reading-time-icon">📖</div>
        <div class="reading-time-info">
          <div class="reading-time-label">Reading Time</div>
          <div class="reading-time-value">
            <span>${this.stats.estimatedMinutes}</span> min read
          </div>
        </div>
      </div>
      
      <div class="reading-time-progress">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle class="reading-time-progress-bg" cx="20" cy="20" r="18"></circle>
          <circle 
            class="reading-time-progress-bar" 
            cx="20" 
            cy="20" 
            r="18"
            stroke-dasharray="113.1"
            stroke-dashoffset="113.1"
          ></circle>
        </svg>
        <div class="reading-time-progress-text">0%</div>
      </div>
      
      <button class="reading-time-toggle" aria-label="Show reading statistics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      </button>
    `;
    
    document.body.appendChild(widget);
    this.widget = widget;
    
    // Cache elements
    this.progressBar = widget.querySelector('.reading-time-progress-bar');
    this.progressText = widget.querySelector('.reading-time-progress-text');
    this.timeValue = widget.querySelector('.reading-time-value span');
    
    // Bind toggle
    widget.querySelector('.reading-time-toggle').addEventListener('click', () => {
      this.toggleStatsPanel();
    });
    
    // Create stats panel
    this.createStatsPanel();
  }
  
  createStatsPanel() {
    const panel = document.createElement('div');
    panel.className = 'reading-stats-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Reading statistics');
    
    panel.innerHTML = `
      <div class="reading-stats-header">
        <div class="reading-stats-title">
          📊 Reading Stats
        </div>
        <button class="reading-stats-close" aria-label="Close statistics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="reading-stats-list">
        <div class="reading-stat-item">
          <div class="reading-stat-icon">📝</div>
          <div class="reading-stat-info">
            <div class="reading-stat-label">Word Count</div>
            <div class="reading-stat-value">${this.stats.totalWords.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="reading-stat-item">
          <div class="reading-stat-icon">⏱</div>
          <div class="reading-stat-info">
            <div class="reading-stat-label">Est. Time</div>
            <div class="reading-stat-value">${this.stats.estimatedMinutes} min</div>
          </div>
        </div>
        
        <div class="reading-stat-item">
          <div class="reading-stat-icon">📄</div>
          <div class="reading-stat-info">
            <div class="reading-stat-label">Paragraphs</div>
            <div class="reading-stat-value">${this.stats.paragraphCount}</div>
          </div>
        </div>
        
        <div class="reading-stat-item">
          <div class="reading-stat-icon">🖼</div>
          <div class="reading-stat-info">
            <div class="reading-stat-label">Images</div>
            <div class="reading-stat-value">${this.stats.imageCount}</div>
          </div>
        </div>
        
        <div class="reading-stat-item">
          <div class="reading-stat-icon">📊</div>
          <div class="reading-stat-info">
            <div class="reading-stat-label">Difficulty</div>
            <div class="reading-stat-value">
              <span class="reading-level-indicator ${this.stats.readingLevel}">
                ${this.stats.readingLevel.charAt(0).toUpperCase() + this.stats.readingLevel.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.statsPanel = panel;
    
    // Bind close
    panel.querySelector('.reading-stats-close').addEventListener('click', () => {
      this.toggleStatsPanel();
    });
  }
  
  createProgressLine() {
    const line = document.createElement('div');
    line.className = 'reading-progress-line';
    line.innerHTML = '<div class="reading-progress-fill"></div>';
    document.body.appendChild(line);
    this.progressLine = line.querySelector('.reading-progress-fill');
  }
  
  bindEvents() {
    // Scroll tracking
    window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTracking();
      } else {
        this.resumeTracking();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
  }
  
  startTracking() {
    this.updateTimer = setInterval(() => {
      if (!document.hidden) {
        this.stats.timeSpent++;
      }
    }, 1000);
  }
  
  pauseTracking() {
    // Tracking paused automatically via visibility check
  }
  
  resumeTracking() {
    // Tracking resumed automatically
  }
  
  setupSectionObserver() {
    if (!this.stats.sections.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = this.stats.sections.find(s => s.element === entry.target);
          if (section) {
            section.progress = 1;
          }
        }
      });
    }, { threshold: 0.5 });
    
    this.stats.sections.forEach(section => {
      observer.observe(section.element);
    });
    
    this.observers.push(observer);
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
    
    this.stats.currentProgress = Math.floor(progress * 100);
    
    // Update progress ring
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (progress * circumference);
    if (this.progressBar) {
      this.progressBar.style.strokeDashoffset = offset;
    }
    
    // Update progress text
    if (this.progressText) {
      this.progressText.textContent = `${this.stats.currentProgress}%`;
    }
    
    // Update progress line
    if (this.progressLine) {
      this.progressLine.style.height = `${progress * 100}%`;
    }
    
    // Check for completion
    if (progress >= this.completionThreshold && !this.stats.completed) {
      this.stats.completed = true;
      this.onComplete();
    }
    
    // Update time remaining
    if (this.timeValue) {
      const remainingProgress = 1 - progress;
      const remainingMinutes = Math.ceil(this.stats.estimatedMinutes * remainingProgress);
      this.timeValue.textContent = remainingMinutes;
    }
  }
  
  toggleStatsPanel() {
    this.statsPanel.classList.toggle('visible');
  }
  
  onComplete() {
    if (!this.showCompletionToast) return;
    
    // Trigger confetti if available
    if (window.ConfettiCelebration) {
      window.ConfettiCelebration.trigger({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Show completion toast
    this.showCompletionToast();
    
    // Announce to screen readers
    this.announce(`Congratulations! You've completed reading this article in ${this.formatTime(this.stats.timeSpent)}`);
  }
  
  showCompletionToast() {
    const toast = document.createElement('div');
    toast.className = 'reading-completion-toast';
    toast.innerHTML = `
      <button class="reading-completion-close">✕</button>
      <div class="reading-completion-icon">🎉</div>
      <h3 class="reading-completion-title">Reading Complete!</h3>
      <p class="reading-completion-text">Great job finishing this article</p>
      <div class="reading-completion-stats">
        <div class="reading-completion-stat">
          <div class="reading-completion-stat-value">${this.stats.totalWords.toLocaleString()}</div>
          <div class="reading-completion-stat-label">Words</div>
        </div>
        <div class="reading-completion-stat">
          <div class="reading-completion-stat-value">${this.formatTime(this.stats.timeSpent)}</div>
          <div class="reading-completion-stat-label">Time</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show animation
    requestAnimationFrame(() => toast.classList.add('show'));
    
    // Auto hide
    const hideTimeout = setTimeout(() => {
      this.hideCompletionToast(toast);
    }, 5000);
    
    // Bind close
    toast.querySelector('.reading-completion-close').addEventListener('click', () => {
      clearTimeout(hideTimeout);
      this.hideCompletionToast(toast);
    });
  }
  
  hideCompletionToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
  
  announce(message) {
    let region = document.getElementById('reading-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'reading-live-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = 'position: absolute; left: -10000px;';
      document.body.appendChild(region);
    }
    region.textContent = message;
  }
  
  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.observers.forEach(obs => obs.disconnect());
    
    if (this.widget) this.widget.remove();
    if (this.statsPanel) this.statsPanel.remove();
    if (this.progressLine && this.progressLine.parentElement) {
      this.progressLine.parentElement.remove();
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.readingTime = new ReadingTimeEstimator();
});

// Expose for debugging
window.ReadingTimeEstimator = ReadingTimeEstimator;
