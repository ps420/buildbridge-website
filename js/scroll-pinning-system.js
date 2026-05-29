/**
 * BuildBridge Scroll Pinning System
 * Fortune 500 Pinned Scroll Sections v88.0
 */

class ScrollPinningSystem {
  constructor() {
    this.sections = [];
    this.currentSection = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.discoverSections();
    this.bindEvents();
    this.createNavigation();
    this.updateProgress();
  }
  
  discoverSections() {
    // Find all pinned sections
    const pinnedSections = document.querySelectorAll('.pinned-section');
    
    pinnedSections.forEach((section, index) => {
      const container = section.querySelector('.pinned-container, .stacked-cards-container, .horizontal-scroll-container, .image-sequence-container, .split-pin-container, .morph-container, .text-reveal-container, .number-count-container, .video-pinned-container');
      const spacer = section.querySelector('.pinned-spacer');
      
      if (container && spacer) {
        const type = this.detectSectionType(container);
        
        this.sections.push({
          element: section,
          container: container,
          spacer: spacer,
          type: type,
          index: index,
          inView: false,
          progress: 0
        });
        
        // Initialize specific section handlers
        this.initSectionHandler(this.sections[index]);
      }
    });
  }
  
  detectSectionType(container) {
    if (container.classList.contains('stacked-cards-container')) return 'stacked-cards';
    if (container.classList.contains('horizontal-scroll-container')) return 'horizontal-scroll';
    if (container.classList.contains('image-sequence-container')) return 'image-sequence';
    if (container.classList.contains('split-pin-container')) return 'split';
    if (container.classList.contains('morph-container')) return 'morph';
    if (container.classList.contains('text-reveal-container')) return 'text-reveal';
    if (container.classList.contains('number-count-container')) return 'number-count';
    if (container.classList.contains('video-pinned-container')) return 'video';
    return 'standard';
  }
  
  initSectionHandler(section) {
    switch (section.type) {
      case 'stacked-cards':
        this.initStackedCards(section);
        break;
      case 'horizontal-scroll':
        this.initHorizontalScroll(section);
        break;
      case 'image-sequence':
        this.initImageSequence(section);
        break;
      case 'text-reveal':
        this.initTextReveal(section);
        break;
      case 'number-count':
        this.initNumberCount(section);
        break;
    }
  }
  
  initStackedCards(section) {
    const cards = section.container.querySelectorAll('.stacked-card');
    section.cards = cards;
    section.totalCards = cards.length;
    section.currentCard = 0;
    
    // Add progress dots
    const progress = document.createElement('div');
    progress.className = 'pinned-progress';
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'pinned-progress-dot';
      if (i === 0) dot.classList.add('active');
      progress.appendChild(dot);
    });
    section.container.appendChild(progress);
  }
  
  initHorizontalScroll(section) {
    const track = section.container.querySelector('.horizontal-scroll-track');
    const items = track.querySelectorAll('.horizontal-scroll-item');
    
    section.track = track;
    section.items = items;
    section.totalWidth = track.scrollWidth - track.clientWidth;
  }
  
  initImageSequence(section) {
    const canvas = section.container.querySelector('.image-sequence-canvas');
    const imageUrls = JSON.parse(section.element.dataset.images || '[]');
    
    if (canvas && imageUrls.length) {
      section.canvas = canvas;
      section.ctx = canvas.getContext('2d');
      section.images = [];
      section.totalFrames = imageUrls.length;
      section.currentFrame = 0;
      section.imagesLoaded = 0;
      
      // Preload images
      imageUrls.forEach((url, i) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          section.images[i] = img;
          section.imagesLoaded++;
          if (section.imagesLoaded === section.totalFrames) {
            this.drawImageFrame(section, 0);
          }
        };
      });
    }
  }
  
  initTextReveal(section) {
    const lines = section.container.querySelectorAll('.text-reveal-line');
    section.lines = lines;
    section.totalLines = lines.length;
    section.currentLine = 0;
  }
  
  initNumberCount(section) {
    const items = section.container.querySelectorAll('.number-count-item');
    section.countItems = items;
    section.counted = false;
  }
  
  drawImageFrame(section, frameIndex) {
    const img = section.images[frameIndex];
    if (!img || !section.ctx) return;
    
    const canvas = section.canvas;
    const ctx = section.ctx;
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Draw image covering canvas
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }
  
  bindEvents() {
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
  }
  
  onScroll() {
    if (this.scrollTimeout) {
      cancelAnimationFrame(this.scrollTimeout);
    }
    
    this.scrollTimeout = requestAnimationFrame(() => {
      this.updateProgress();
    });
  }
  
  onResize() {
    // Recalculate dimensions
    this.sections.forEach(section => {
      if (section.type === 'horizontal-scroll') {
        section.totalWidth = section.track.scrollWidth - section.track.clientWidth;
      }
    });
    this.updateProgress();
  }
  
  updateProgress() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    this.sections.forEach(section => {
      const rect = section.spacer.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionHeight = rect.height;
      
      // Calculate progress through section (0 to 1)
      const scrollProgress = (scrollY - sectionTop + windowHeight) / (sectionHeight + windowHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      
      section.progress = clampedProgress;
      section.inView = rect.top < windowHeight && rect.bottom > 0;
      
      if (section.inView) {
        this.updateSectionAnimation(section);
      }
    });
    
    this.updateNavigation();
  }
  
  updateSectionAnimation(section) {
    const progress = section.progress;
    
    switch (section.type) {
      case 'stacked-cards':
        this.updateStackedCards(section, progress);
        break;
      case 'horizontal-scroll':
        this.updateHorizontalScroll(section, progress);
        break;
      case 'image-sequence':
        this.updateImageSequence(section, progress);
        break;
      case 'text-reveal':
        this.updateTextReveal(section, progress);
        break;
      case 'number-count':
        this.updateNumberCount(section, progress);
        break;
      case 'morph':
        this.updateMorph(section, progress);
        break;
    }
    
    // Update progress bar
    const progressBar = section.element.querySelector('.pinned-progress-fill');
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
  }
  
  updateStackedCards(section, progress) {
    const cardIndex = Math.floor(progress * section.totalCards);
    const cardProgress = (progress * section.totalCards) % 1;
    
    section.cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next');
      
      if (i === cardIndex) {
        card.classList.add('active');
        // Add subtle movement based on progress within card
        const translateY = (1 - cardProgress) * 20;
        card.style.transform = `translateZ(0) translateY(${translateY}px) scale(1)`;
      } else if (i < cardIndex) {
        card.classList.add('prev');
        card.style.transform = `translateZ(-100px) translateY(-100%) scale(0.9)`;
      } else {
        card.classList.add('next');
      }
    });
    
    // Update dots
    const dots = section.container.querySelectorAll('.pinned-progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === cardIndex);
    });
  }
  
  updateHorizontalScroll(section, progress) {
    const translateX = -progress * section.totalWidth;
    section.track.style.transform = `translateX(${translateX}px)`;
  }
  
  updateImageSequence(section, progress) {
    if (!section.imagesLoaded || section.imagesLoaded < section.totalFrames) return;
    
    const frameIndex = Math.floor(progress * (section.totalFrames - 1));
    if (frameIndex !== section.currentFrame && frameIndex < section.totalFrames) {
      section.currentFrame = frameIndex;
      this.drawImageFrame(section, frameIndex);
    }
    
    // Update text visibility
    const texts = section.container.querySelectorAll('.image-sequence-text');
    texts.forEach((text, i) => {
      const textProgress = (i + 1) / (texts.length + 1);
      const isVisible = Math.abs(progress - textProgress) < 0.15;
      text.classList.toggle('visible', isVisible);
    });
  }
  
  updateTextReveal(section, progress) {
    const lineIndex = Math.floor(progress * section.totalLines);
    
    section.lines.forEach((line, i) => {
      line.classList.remove('active', 'highlight');
      
      if (i === lineIndex) {
        line.classList.add('active', 'highlight');
      } else if (i < lineIndex) {
        line.classList.add('active');
      }
    });
  }
  
  updateNumberCount(section, progress) {
    if (section.counted || progress < 0.3) return;
    
    section.countItems.forEach(item => {
      const valueEl = item.querySelector('.number-count-value');
      const targetValue = parseInt(valueEl.dataset.target || valueEl.textContent);
      const suffix = valueEl.dataset.suffix || '';
      
      this.animateNumber(valueEl, 0, targetValue, suffix, 2000);
    });
    
    section.counted = true;
  }
  
  updateMorph(section, progress) {
    const shapes = section.container.querySelectorAll('.morph-shape');
    const rotation = progress * 360;
    
    shapes.forEach((shape, i) => {
      const offset = i * 120;
      shape.style.transform = `rotate(${rotation + offset}deg) scale(${1 + progress * 0.2})`;
    });
  }
  
  animateNumber(element, start, end, suffix, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      element.textContent = current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  createNavigation() {
    if (this.sections.length === 0) return;
    
    const nav = document.createElement('div');
    nav.className = 'pinned-nav';
    nav.setAttribute('aria-label', 'Section navigation');
    
    this.sections.forEach((section, i) => {
      const item = document.createElement('div');
      item.className = 'pinned-nav-item';
      item.dataset.index = i;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'pinned-nav-tooltip';
      tooltip.textContent = section.element.dataset.navLabel || `Section ${i + 1}`;
      
      item.appendChild(tooltip);
      item.addEventListener('click', () => this.scrollToSection(i));
      
      nav.appendChild(item);
    });
    
    document.body.appendChild(nav);
    this.navElement = nav;
  }
  
  updateNavigation() {
    if (!this.navElement) return;
    
    const items = this.navElement.querySelectorAll('.pinned-nav-item');
    
    this.sections.forEach((section, i) => {
      const isActive = section.inView && section.progress > 0 && section.progress < 1;
      items[i].classList.toggle('active', isActive);
    });
  }
  
  scrollToSection(index) {
    const section = this.sections[index];
    if (!section) return;
    
    const targetY = section.spacer.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }
  
  destroy() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    
    if (this.navElement) {
      this.navElement.remove();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollPinningSystem = new ScrollPinningSystem();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollPinningSystem;
}
