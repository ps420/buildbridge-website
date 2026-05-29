/**
 * Draggable Touch Carousel v80.3
 * Fortune 500 Swipe/Drag Gallery
 */

(function() {
  'use strict';
  
  const DraggableCarousel = {
    options: {
      itemWidth: 350,
      gap: 30,
      snapToCenter: true,
      autoplay: false,
      autoplayDelay: 5000,
      infinite: false
    },
    
    carousels: [],
    
    init(selector = '.draggable-carousel', options = {}) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(el => {
        this.createCarousel(el, { ...this.options, ...options, ...el.dataset });
      });
    },
    
    createCarousel(element, options) {
      const track = element.querySelector('.draggable-track');
      if (!track) return;
      
      const items = Array.from(track.children);
      if (items.length === 0) return;
      
      const carousel = {
        element: element,
        track: track,
        items: items,
        options: options,
        state: {
          isDragging: false,
          startX: 0,
          currentX: 0,
          translateX: 0,
          velocity: 0,
          currentIndex: 0,
          autoplayTimer: null
        }
      };
      
      // Calculate dimensions
      const itemWidth = parseInt(options.itemWidth) || items[0].offsetWidth + parseInt(options.gap);
      carousel.itemWidth = itemWidth;
      
      // Bind events
      this.bindEvents(carousel);
      
      // Add navigation if enabled
      if (element.dataset.nav !== 'false') {
        this.addNavigation(carousel);
      }
      
      // Add pagination
      this.addPagination(carousel);
      
      // Start autoplay if enabled
      if (options.autoplay) {
        this.startAutoplay(carousel);
      }
      
      this.carousels.push(carousel);
      
      // Initial snap
      this.snapToItem(carousel, 0, false);
    },
    
    bindEvents(carousel) {
      const { track } = carousel;
      
      // Mouse events
      track.addEventListener('mousedown', (e) => this.onDragStart(e, carousel));
      window.addEventListener('mousemove', (e) => this.onDragMove(e, carousel));
      window.addEventListener('mouseup', (e) => this.onDragEnd(e, carousel));
      
      // Touch events
      track.addEventListener('touchstart', (e) => this.onDragStart(e, carousel), { passive: true });
      window.addEventListener('touchmove', (e) => this.onDragMove(e, carousel), { passive: true });
      window.addEventListener('touchend', (e) => this.onDragEnd(e, carousel));
      
      // Prevent context menu on long press
      track.addEventListener('contextmenu', (e) => {
        if (carousel.state.isDragging) e.preventDefault();
      });
      
      // Resize handler
      window.addEventListener('resize', () => {
        this.snapToItem(carousel, carousel.state.currentIndex, false);
      });
    },
    
    onDragStart(e, carousel) {
      const { state } = carousel;
      
      state.isDragging = true;
      state.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      state.currentX = state.startX;
      state.velocity = 0;
      
      carousel.track.classList.add('dragging');
      carousel.track.classList.remove('snapping');
      
      // Pause autoplay
      this.stopAutoplay(carousel);
      
      // Disable transition during drag
      carousel.track.style.transition = 'none';
    },
    
    onDragMove(e, carousel) {
      if (!carousel.state.isDragging) return;
      
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const deltaX = x - carousel.state.startX;
      
      // Calculate velocity for momentum
      const timeDelta = Date.now() - (carousel.state.lastTime || Date.now());
      if (timeDelta > 0) {
        carousel.state.velocity = (x - carousel.state.currentX) / timeDelta;
      }
      
      carousel.state.currentX = x;
      carousel.state.lastTime = Date.now();
      
      // Apply transform
      const newTranslate = carousel.state.translateX + deltaX;
      carousel.track.style.transform = `translateX(${newTranslate}px)`;
    },
    
    onDragEnd(e, carousel) {
      if (!carousel.state.isDragging) return;
      
      const { state } = carousel;
      state.isDragging = false;
      
      carousel.track.classList.remove('dragging');
      
      // Calculate momentum
      const momentum = state.velocity * 200;
      const currentTranslate = this.getTranslateX(carousel.track);
      const itemWidth = carousel.itemWidth;
      
      // Determine target index
      let targetIndex = Math.round(-(currentTranslate + momentum) / itemWidth);
      targetIndex = Math.max(0, Math.min(targetIndex, carousel.items.length - 1));
      
      // Snap to target
      this.snapToItem(carousel, targetIndex);
      
      // Resume autoplay
      if (carousel.options.autoplay) {
        this.startAutoplay(carousel);
      }
    },
    
    snapToItem(carousel, index, animate = true) {
      const { state, itemWidth } = carousel;
      
      state.currentIndex = index;
      state.translateX = -index * itemWidth;
      
      if (animate) {
        carousel.track.classList.add('snapping');
      }
      
      carousel.track.style.transform = `translateX(${state.translateX}px)`;
      
      // Update active classes
      carousel.items.forEach((item, i) => {
        item.classList.toggle('center-item', i === index);
      });
      
      // Update pagination
      this.updatePagination(carousel, index);
      
      // Update nav buttons
      this.updateNavigation(carousel, index);
    },
    
    getTranslateX(element) {
      const style = window.getComputedStyle(element);
      const matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m41;
    },
    
    addNavigation(carousel) {
      const { element } = carousel;
      
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-nav prev';
      prevBtn.setAttribute('aria-label', 'Previous slide');
      prevBtn.addEventListener('click', () => this.prev(carousel));
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-nav next';
      nextBtn.setAttribute('aria-label', 'Next slide');
      nextBtn.addEventListener('click', () => this.next(carousel));
      
      element.appendChild(prevBtn);
      element.appendChild(nextBtn);
      
      carousel.navPrev = prevBtn;
      carousel.navNext = nextBtn;
    },
    
    addPagination(carousel) {
      const { element, items } = carousel;
      
      const pagination = document.createElement('div');
      pagination.className = 'carousel-pagination';
      
      items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => this.snapToItem(carousel, index));
        pagination.appendChild(dot);
      });
      
      element.appendChild(pagination);
      carousel.pagination = pagination;
      
      this.updatePagination(carousel, 0);
    },
    
    updatePagination(carousel, activeIndex) {
      if (!carousel.pagination) return;
      
      const dots = carousel.pagination.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    },
    
    updateNavigation(carousel, index) {
      if (carousel.navPrev) {
        carousel.navPrev.disabled = index === 0;
        carousel.navPrev.style.opacity = index === 0 ? '0.3' : '1';
      }
      if (carousel.navNext) {
        carousel.navNext.disabled = index === carousel.items.length - 1;
        carousel.navNext.style.opacity = index === carousel.items.length - 1 ? '0.3' : '1';
      }
    },
    
    prev(carousel) {
      const newIndex = Math.max(0, carousel.state.currentIndex - 1);
      this.snapToItem(carousel, newIndex);
    },
    
    next(carousel) {
      const newIndex = Math.min(carousel.items.length - 1, carousel.state.currentIndex + 1);
      this.snapToItem(carousel, newIndex);
    },
    
    startAutoplay(carousel) {
      if (carousel.state.autoplayTimer) return;
      
      carousel.state.autoplayTimer = setInterval(() => {
        let nextIndex = carousel.state.currentIndex + 1;
        if (nextIndex >= carousel.items.length) {
          nextIndex = carousel.options.infinite ? 0 : 0;
        }
        this.snapToItem(carousel, nextIndex);
      }, carousel.options.autoplayDelay);
    },
    
    stopAutoplay(carousel) {
      if (carousel.state.autoplayTimer) {
        clearInterval(carousel.state.autoplayTimer);
        carousel.state.autoplayTimer = null;
      }
    },
    
    // Public API
    goTo(carousel, index) {
      this.snapToItem(carousel, index);
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DraggableCarousel.init());
  } else {
    DraggableCarousel.init();
  }
  
  window.BuildBridgeCarousel = DraggableCarousel;
})();
