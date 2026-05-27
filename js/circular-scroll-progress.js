/**
 * Circular Scroll Progress - Fortune 500 Quality
 * Professional circular progress indicator with percentage
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    circumference: 163.36, // 2 * π * 26 (radius for 56px circle)
    enhancedCircumference: 188.5, // 2 * π * 30 (for 64px enhanced)
    showThreshold: 100, // Show after scrolling this many pixels
    milestonePercentages: [25, 50, 75, 100],
    smoothScroll: true
  };

  // State
  let progress = 0;
  let currentSection = '';
  let milestonesReached = [];
  let rafId = null;
  let lastScrollY = 0;

  // DOM Elements
  let container = null;
  let progressCircle = null;
  let progressText = null;
  let tooltip = null;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    createProgressElement();
    calculateReadingTime();
    bindEvents();
    updateProgress();
    
    console.log('[Circular Progress] Initialized');
  }

  /**
   * Create the circular progress element
   */
  function createProgressElement() {
    container = document.createElement('div');
    container.className = 'circular-progress-container';
    
    container.innerHTML = `
      <span class="circular-reading-time" id="reading-time">~0 min read</span>
      
      <div class="circular-progress" id="circular-progress" title="Scroll to top">
        <svg class="circular-progress-svg" viewBox="0 0 56 56">
          <circle class="circular-progress-bg" cx="28" cy="28" r="26"></circle>
          <circle class="circular-progress-fill" cx="28" cy="28" r="26"
            style="stroke-dasharray: ${CONFIG.circumference}; stroke-dashoffset: ${CONFIG.circumference}"></circle>
        </svg>
        
        <span class="circular-progress-text">
          <span class="progress-value">0</span>
          <span class="circular-progress-percent">%</span>
        </span>
        
        <span class="circular-progress-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </span>
        
        <span class="circular-progress-tooltip">
          <span id="progress-tooltip-text">Scroll progress</span>
        </span>
      </div>
      
      <span class="circular-section-label" id="section-label"></span>
    `;

    document.body.appendChild(container);

    // Cache references
    progressCircle = container.querySelector('.circular-progress-fill');
    progressText = container.querySelector('.progress-value');
    tooltip = container.querySelector('#progress-tooltip-text');

    // Bind click to scroll to top
    const progressEl = container.querySelector('.circular-progress');
    progressEl.addEventListener('click', handleClick);
  }

  /**
   * Bind scroll events
   */
  function bindEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Update on resize
    window.addEventListener('resize', debounce(updateProgress, 100));
  }

  /**
   * Update progress calculation
   */
  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Calculate percentage
    let percentage = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    percentage = Math.min(100, Math.max(0, percentage));
    
    // Update state
    progress = percentage;
    lastScrollY = scrollTop;

    // Show/hide based on threshold
    if (scrollTop > CONFIG.showThreshold) {
      container.classList.add('visible');
    } else {
      container.classList.remove('visible');
    }

    // Update at-top class
    const progressEl = container.querySelector('.circular-progress');
    if (percentage === 0) {
      progressEl.classList.add('at-top');
    } else {
      progressEl.classList.remove('at-top');
    }

    // Update UI
    updateProgressUI(percentage);
    checkMilestones(percentage);
    updateCurrentSection();
  }

  /**
   * Update progress UI
   */
  function updateProgressUI(percentage) {
    // Update circle
    const offset = CONFIG.circumference - (percentage / 100) * CONFIG.circumference;
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = offset;
    }

    // Update text
    if (progressText) {
      // Animate number
      animateNumber(progressText, parseInt(progressText.textContent), percentage, 200);
    }

    // Update tooltip
    if (tooltip) {
      const remaining = 100 - percentage;
      tooltip.textContent = remaining === 0 ? 'Back to top' : `${remaining}% remaining`;
    }
  }

  /**
   * Animate number change
   */
  function animateNumber(element, from, to, duration) {
    const startTime = performance.now();
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      const current = Math.round(from + (to - from) * easeProgress);
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
  }

  /**
   * Check for milestone achievements
   */
  function checkMilestones(percentage) {
    CONFIG.milestonePercentages.forEach(milestone => {
      if (percentage >= milestone && !milestonesReached.includes(milestone)) {
        milestonesReached.push(milestone);
        triggerMilestone(milestone);
      }
    });
  }

  /**
   * Trigger milestone celebration
   */
  function triggerMilestone(percentage) {
    const progressEl = container.querySelector('.circular-progress');
    progressEl.classList.add('milestone');
    
    setTimeout(() => {
      progressEl.classList.remove('milestone');
    }, 600);

    // Optional: Dispatch event
    window.dispatchEvent(new CustomEvent('scroll:milestone', {
      detail: { percentage }
    }));

    // Update section label briefly
    const label = container.querySelector('#section-label');
    if (label) {
      label.textContent = `${percentage}% Read`;
      label.style.color = 'var(--gold, #d4af37)';
      
      setTimeout(() => {
        updateCurrentSection();
        label.style.color = '';
      }, 2000);
    }
  }

  /**
   * Update current section label
   */
  function updateCurrentSection() {
    const sections = document.querySelectorAll('[data-section], section[id]');
    const scrollY = window.pageYOffset + 200; // Offset for header
    
    let activeSection = null;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.pageYOffset + rect.top;
      
      if (scrollY >= sectionTop) {
        activeSection = section;
      }
    });
    
    if (activeSection) {
      const label = activeSection.dataset.navLabel || 
                   activeSection.dataset.section || 
                   activeSection.id;
      
      if (label && label !== currentSection) {
        currentSection = label;
        const sectionLabel = container.querySelector('#section-label');
        if (sectionLabel) {
          // Fade transition
          sectionLabel.style.opacity = '0';
          sectionLabel.style.transform = 'translateY(5px)';
          
          setTimeout(() => {
            sectionLabel.textContent = label;
            sectionLabel.style.opacity = '1';
            sectionLabel.style.transform = 'translateY(0)';
          }, 150);
        }
      }
    }
  }

  /**
   * Handle progress click (scroll to top)
   */
  function handleClick() {
    if (progress === 0) return;
    
    if (CONFIG.smoothScroll) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }

    // Reset milestones
    milestonesReached = [];
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('scroll:totop'));
  }

  /**
   * Calculate and display reading time
   */
  function calculateReadingTime() {
    const text = document.body.innerText;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    const readingEl = container.querySelector('#reading-time');
    if (readingEl) {
      readingEl.textContent = `~${readingTime} min read`;
    }
  }

  /**
   * Debounce utility
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Expose API
  window.BuildBridgeProgress = {
    getProgress: () => progress,
    getCurrentSection: () => currentSection,
    scrollToTop: handleClick,
    update: updateProgress
  };

})();
