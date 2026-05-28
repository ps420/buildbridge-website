/**
 * BuildBridge Interactive Scroll Timeline v1.0
 * Fortune 500 Horizontal Timeline with Scroll-driven Navigation
 * =====================================================
 * A cinematic timeline experience driven by scroll position
 */

class InteractiveTimeline {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    
    if (!this.container) return;
    
    this.options = {
      snapPoints: options.snapPoints !== false,
      snapDuration: options.snapDuration || 800,
      parallaxLayers: options.parallaxLayers !== false,
      lineAnimation: options.lineAnimation !== false,
      indicatorStyle: options.indicatorStyle || 'dot',
      progressIndicator: options.progressIndicator !== false,
      keyboardNavigation: options.keyboardNavigation !== false,
      touchSwipe: options.touchSwipe !== false,
      ...options
    };
    
    this.state = {
      currentIndex: 0,
      isScrolling: false,
      totalItems: 0,
      scrollProgress: 0,
      touchStartX: 0,
      touchStartY: 0
    };
    
    this.elements = {};
    this.items = [];
    
    this.init();
  }
  
  init() {
    this.buildStructure();
    this.bindEvents();
    this.setupIntersectionObserver();
    this.updateProgress();
  }
  
  buildStructure() {
    // Get original items
    const originalItems = Array.from(this.container.children);
    this.state.totalItems = originalItems.length;
    
    // Create wrapper structure
    this.container.innerHTML = `
      <div class="timeline-scroll-container">
        <div class="timeline-track">
          ${originalItems.map((item, i) => `
            <div class="timeline-item-wrapper" data-index="${i}">
              <div class="timeline-content-card">
                ${item.innerHTML}
              </div>
              <div class="timeline-year-indicator">
                <span class="year-number">${item.dataset.year || (2020 + i)}</span>
                <span class="year-line"></span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="timeline-progress-track">
          <div class="timeline-progress-fill"></div>
        </div>
      </div>
      <div class="timeline-navigation">
        ${originalItems.map((_, i) => `
          <button class="timeline-nav-btn ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to milestone ${i + 1}">
            <span class="nav-dot"></span>
            <span class="nav-label">${originalItems[i].dataset.label || `Milestone ${i + 1}`}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    // Cache elements
    this.elements = {
      scrollContainer: this.container.querySelector('.timeline-scroll-container'),
      track: this.container.querySelector('.timeline-track'),
      items: this.container.querySelectorAll('.timeline-item-wrapper'),
      progressFill: this.container.querySelector('.timeline-progress-fill'),
      navButtons: this.container.querySelectorAll('.timeline-nav-btn'),
      progressTrack: this.container.querySelector('.timeline-progress-track')
    };
    
    // Store item data
    this.elements.items.forEach((item, i) => {
      this.items.push({
        element: item,
        index: i,
        year: originalItems[i].dataset.year || (2020 + i),
        title: originalItems[i].dataset.title || '',
        description: originalItems[i].dataset.description || ''
      });
    });
    
    // Add ambient particles to each card
    this.items.forEach(item => {
      const particles = document.createElement('div');
      particles.className = 'timeline-card-particles';
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('span');
        particle.className = 'ambient-particle';
        particle.style.setProperty('--delay', `${i * 0.5}s`);
        particles.appendChild(particle);
      }
      item.element.querySelector('.timeline-content-card').appendChild(particles);
    });
  }
  
  bindEvents() {
    // Navigation buttons
    this.elements.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.scrollToItem(index);
      });
    });
    
    // Keyboard navigation
    if (this.options.keyboardNavigation) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.prev();
        }
      });
    }
    
    // Touch swipe
    if (this.options.touchSwipe) {
      this.container.addEventListener('touchstart', (e) => {
        this.state.touchStartX = e.touches[0].clientX;
        this.state.touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      this.container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = this.state.touchStartX - touchEndX;
        const deltaY = this.state.touchStartY - touchEndY;
        
        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }
    
    // Scroll-driven progress
    this.elements.scrollContainer.addEventListener('scroll', () => {
      this.updateProgress();
    }, { passive: true });
    
    // Parallax on mouse move
    if (this.options.parallaxLayers && !window.matchMedia('(pointer: coarse)').matches) {
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        this.elements.items.forEach((item, i) => {
          const depth = (i % 3 + 1) * 5;
          const card = item.querySelector('.timeline-content-card');
          card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
        });
      });
    }
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          this.setActiveItem(index);
        }
      });
    }, {
      root: this.elements.scrollContainer,
      threshold: 0.5
    });
    
    this.elements.items.forEach(item => observer.observe(item));
  }
  
  updateProgress() {
    const container = this.elements.scrollContainer;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    
    this.state.scrollProgress = progress;
    
    // Update progress fill
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${progress * 100}%`;
    }
    
    // Calculate current index
    const itemWidth = container.scrollWidth / this.state.totalItems;
    const currentIndex = Math.round(scrollLeft / itemWidth);
    
    if (currentIndex !== this.state.currentIndex) {
      this.setActiveItem(currentIndex);
    }
  }
  
  setActiveItem(index) {
    this.state.currentIndex = Math.max(0, Math.min(index, this.state.totalItems - 1));
    
    // Update nav buttons
    this.elements.navButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === this.state.currentIndex);
    });
    
    // Update items
    this.elements.items.forEach((item, i) => {
      item.classList.toggle('active', i === this.state.currentIndex);
      item.classList.toggle('prev', i < this.state.currentIndex);
      item.classList.toggle('next', i > this.state.currentIndex);
    });
    
    // Trigger custom event
    this.container.dispatchEvent(new CustomEvent('timelinechange', {
      detail: { index: this.state.currentIndex, item: this.items[this.state.currentIndex] }
    }));
  }
  
  scrollToItem(index) {
    const item = this.elements.items[index];
    if (!item) return;
    
    const container = this.elements.scrollContainer;
    const itemLeft = item.offsetLeft;
    const containerCenter = container.clientWidth / 2;
    const itemCenter = item.offsetWidth / 2;
    
    container.scrollTo({
      left: itemLeft - containerCenter + itemCenter,
      behavior: 'smooth'
    });
  }
  
  next() {
    if (this.state.currentIndex < this.state.totalItems - 1) {
      this.scrollToItem(this.state.currentIndex + 1);
    }
  }
  
  prev() {
    if (this.state.currentIndex > 0) {
      this.scrollToItem(this.state.currentIndex - 1);
    }
  }
  
  // Public API
  goTo(index) {
    this.scrollToItem(index);
  }
  
  getCurrentIndex() {
    return this.state.currentIndex;
  }
  
  destroy() {
    // Cleanup if needed
  }
}

// =========================================
// TIMELINE ANIMATIONS (CSS-in-JS for dynamic values)
// =========================================
const timelineStyles = document.createElement('style');
timelineStyles.textContent = `
  .interactive-timeline {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  
  .timeline-scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .timeline-scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  .timeline-track {
    display: flex;
    gap: 60px;
    padding: 60px 50vw;
    min-width: max-content;
  }
  
  .timeline-item-wrapper {
    flex: 0 0 400px;
    scroll-snap-align: center;
    position: relative;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0.4;
    transform: scale(0.9);
  }
  
  .timeline-item-wrapper.active {
    opacity: 1;
    transform: scale(1);
  }
  
  .timeline-item-wrapper.prev {
    transform: scale(0.85) translateX(20px);
  }
  
  .timeline-item-wrapper.next {
    transform: scale(0.85) translateX(-20px);
  }
  
  .timeline-content-card {
    background: linear-gradient(145deg, rgba(23, 25, 29, 0.9), rgba(26, 28, 33, 0.9));
    border: 1px solid rgba(201, 206, 214, 0.1);
    border-radius: 16px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }
  
  .timeline-content-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(201, 206, 214, 0.05), transparent 50%);
    pointer-events: none;
  }
  
  .timeline-year-indicator {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
    padding-left: 20px;
  }
  
  .year-number {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--chrome);
    letter-spacing: 0.1em;
  }
  
  .year-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--chrome), transparent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .timeline-item-wrapper.active .year-line {
    transform: scaleX(1);
  }
  
  .timeline-progress-track {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    max-width: 400px;
    height: 2px;
    background: rgba(201, 206, 214, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .timeline-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--chrome), var(--white));
    border-radius: 2px;
    transition: width 0.1s ease-out;
    box-shadow: 0 0 10px rgba(201, 206, 214, 0.3);
  }
  
  .timeline-navigation {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 30px 0;
  }
  
  .timeline-nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: transparent;
    border: 1px solid rgba(201, 206, 214, 0.15);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .timeline-nav-btn:hover {
    background: rgba(201, 206, 214, 0.1);
    border-color: rgba(201, 206, 214, 0.3);
  }
  
  .timeline-nav-btn.active {
    background: var(--white);
    border-color: var(--white);
  }
  
  .timeline-nav-btn.active .nav-dot {
    background: var(--black);
  }
  
  .timeline-nav-btn.active .nav-label {
    color: var(--black);
  }
  
  .nav-dot {
    width: 8px;
    height: 8px;
    background: var(--chrome);
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .nav-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--chrome);
    transition: color 0.3s ease;
  }
  
  .timeline-card-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .ambient-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(201, 206, 214, 0.3);
    border-radius: 50%;
    animation: particle-float 4s ease-in-out infinite;
    animation-delay: var(--delay);
  }
  
  .ambient-particle:nth-child(1) { top: 20%; left: 10%; }
  .ambient-particle:nth-child(2) { top: 60%; left: 80%; }
  .ambient-particle:nth-child(3) { top: 80%; left: 30%; }
  .ambient-particle:nth-child(4) { top: 30%; left: 70%; }
  .ambient-particle:nth-child(5) { top: 50%; left: 50%; }
  
  @keyframes particle-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
  }
  
  @media (max-width: 768px) {
    .timeline-track {
      gap: 30px;
      padding: 40px 30vw;
    }
    
    .timeline-item-wrapper {
      flex: 0 0 300px;
    }
    
    .timeline-content-card {
      padding: 30px;
    }
    
    .timeline-navigation {
      gap: 10px;
    }
    
    .timeline-nav-btn {
      padding: 8px 15px;
    }
    
    .nav-label {
      display: none;
    }
    
    .timeline-progress-track {
      width: 80%;
      bottom: 60px;
    }
  }
`;
document.head.appendChild(timelineStyles);

// =========================================
// AUTO-INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.interactive-timeline').forEach(timeline => {
    new InteractiveTimeline(timeline);
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InteractiveTimeline };
}
