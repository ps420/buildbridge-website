/**
 * Horizontal Timeline Navigation - v24.1
 * Fortune 500 style horizontal scrolling timeline
 * Perfect for showcasing project phases, milestones, or processes
 */

class HorizontalTimelineNav {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.warn('[Timeline Nav] Container not found');
      return;
    }
    
    this.options = {
      items: options.items || [],
      activeIndex: options.activeIndex || 0,
      autoPlay: options.autoPlay !== false,
      autoPlayInterval: options.autoPlayInterval || 5000,
      pauseOnHover: options.pauseOnHover !== false,
      showProgress: options.showProgress !== false,
      showDots: options.showDots !== false,
      showNavArrows: options.showNavArrows !== false,
      dotStyle: options.dotStyle || 'circle', // circle, line, number
      animationType: options.animationType || 'slide', // slide, fade, scale
      ...options
    };
    
    this.currentIndex = this.options.activeIndex;
    this.isAnimating = false;
    this.autoPlayTimer = null;
    this.progressBar = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    this.buildStructure();
    this.createTimelineItems();
    this.createControls();
    this.bindEvents();
    this.goTo(this.currentIndex, false);
    
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
    
    console.log('[Timeline Nav] Initialized with', this.options.items.length, 'items');
  }
  
  buildStructure() {
    this.container.classList.add('horizontal-timeline');
    
    // Create inner structure
    this.container.innerHTML = `
      <div class="timeline-track-wrapper">
        <div class="timeline-track"></div>
        <div class="timeline-progress-line">
          <div class="timeline-progress-fill"></div>
        </div>
      </div>
      <div class="timeline-content-wrapper">
        <div class="timeline-content-track"></div>
      </div>
      <div class="timeline-nav">
        <button class="timeline-nav-prev" aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div class="timeline-dots"></div>
        <button class="timeline-nav-next" aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    `;
    
    this.track = this.container.querySelector('.timeline-track');
    this.contentTrack = this.container.querySelector('.timeline-content-track');
    this.dotsContainer = this.container.querySelector('.timeline-dots');
    this.prevBtn = this.container.querySelector('.timeline-nav-prev');
    this.nextBtn = this.container.querySelector('.timeline-nav-next');
    this.progressLine = this.container.querySelector('.timeline-progress-fill');
    
    // Toggle controls visibility
    if (!this.options.showNavArrows) {
      this.prevBtn.style.display = 'none';
      this.nextBtn.style.display = 'none';
    }
  }
  
  createTimelineItems() {
    this.options.items.forEach((item, index) => {
      // Create timeline marker
      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      marker.dataset.index = index;
      marker.innerHTML = `
        <div class="timeline-marker-dot"></div>
        <div class="timeline-marker-label">${item.date || item.label || ''}</div>
        <div class="timeline-marker-title">${item.title || ''}</div>
      `;
      marker.addEventListener('click', () => this.goTo(index));
      this.track.appendChild(marker);
      
      // Create content slide
      const slide = document.createElement('div');
      slide.className = 'timeline-slide';
      slide.innerHTML = `
        <div class="timeline-slide-content">
          ${item.image ? `<div class="timeline-slide-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </div>` : ''}
          <div class="timeline-slide-text">
            <span class="timeline-slide-date">${item.date || ''}</span>
            <h3 class="timeline-slide-title">${item.title || ''}</h3>
            <p class="timeline-slide-description">${item.description || ''}</p>
            ${item.link ? `<a href="${item.link}" class="timeline-slide-link">Learn More →</a>` : ''}
          </div>
        </div>
      `;
      this.contentTrack.appendChild(slide);
      
      // Create nav dot
      if (this.options.showDots) {
        const dot = document.createElement('button');
        dot.className = 'timeline-dot';
        dot.dataset.index = index;
        dot.setAttribute('aria-label', `Go to ${item.title || 'slide ' + (index + 1)}`);
        
        if (this.options.dotStyle === 'number') {
          dot.textContent = index + 1;
        }
        
        dot.addEventListener('click', () => this.goTo(index));
        this.dotsContainer.appendChild(dot);
      }
    });
    
    this.markers = Array.from(this.track.querySelectorAll('.timeline-marker'));
    this.slides = Array.from(this.contentTrack.querySelectorAll('.timeline-slide'));
    this.dots = Array.from(this.dotsContainer.querySelectorAll('.timeline-dot'));
  }
  
  createControls() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Keyboard navigation
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }
  
  bindEvents() {
    // Touch swipe support
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.pauseAutoPlay();
    }, { passive: true });
    
    this.container.addEventListener('touchmove', (e) => {
      this.touchEndX = e.touches[0].clientX;
    }, { passive: true });
    
    this.container.addEventListener('touchend', () => {
      const diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
      if (this.options.autoPlay) this.startAutoPlay();
    }, { passive: true });
    
    // Pause on hover
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.addEventListener('mouseleave', () => {
        if (this.options.autoPlay) this.startAutoPlay();
      });
    }
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoPlay();
      } else if (this.options.autoPlay) {
        this.startAutoPlay();
      }
    });
  }
  
  goTo(index, animate = true) {
    if (this.isAnimating || index === this.currentIndex) return;
    if (index < 0) index = this.options.items.length - 1;
    if (index >= this.options.items.length) index = 0;
    
    this.isAnimating = true;
    const direction = index > this.currentIndex ? 1 : -1;
    
    // Update markers
    this.markers.forEach((marker, i) => {
      marker.classList.toggle('active', i === index);
      marker.classList.toggle('passed', i < index);
    });
    
    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update slides
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.classList.toggle('prev', i === this.currentIndex && direction > 0);
      slide.classList.toggle('next', i === this.currentIndex && direction < 0);
    });
    
    // Update progress line
    const progress = ((index + 1) / this.options.items.length) * 100;
    if (this.progressLine) {
      this.progressLine.style.width = `${progress}%`;
    }
    
    // Center active marker in track
    const activeMarker = this.markers[index];
    if (activeMarker) {
      const trackRect = this.track.parentElement.getBoundingClientRect();
      const markerRect = activeMarker.getBoundingClientRect();
      const scrollLeft = markerRect.left - trackRect.left - trackRect.width / 2 + markerRect.width / 2;
      
      this.track.parentElement.scrollTo({
        left: this.track.parentElement.scrollLeft + scrollLeft,
        behavior: 'smooth'
      });
    }
    
    this.currentIndex = index;
    
    // Dispatch event
    this.container.dispatchEvent(new CustomEvent('timelineChange', {
      detail: { index, item: this.options.items[index] }
    }));
    
    setTimeout(() => {
      this.isAnimating = false;
    }, animate ? 600 : 0);
  }
  
  next() {
    this.goTo(this.currentIndex + 1);
  }
  
  prev() {
    this.goTo(this.currentIndex - 1);
  }
  
  startAutoPlay() {
    this.pauseAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.options.autoPlayInterval);
  }
  
  pauseAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
  
  destroy() {
    this.pauseAutoPlay();
    // Cleanup event listeners if needed
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HorizontalTimelineNav;
}
