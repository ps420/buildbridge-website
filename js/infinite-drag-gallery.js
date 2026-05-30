/**
 * v134.0: Infinite Drag Gallery Component
 * Fortune 500 Quality Touch-Friendly Draggable Gallery
 * Physics-based infinite scroll with momentum and snap-to-center
 */

(function() {
  'use strict';
  
  class InfiniteDragGallery {
    constructor(container) {
      this.container = container;
      this.track = container.querySelector('.drag-gallery-track');
      this.items = Array.from(container.querySelectorAll('.drag-gallery-item'));
      
      // State
      this.isDragging = false;
      this.isScrolling = false;
      this.startX = 0;
      this.currentX = 0;
      this.translateX = 0;
      this.lastTranslateX = 0;
      this.velocity = 0;
      this.lastTime = 0;
      this.animationId = null;
      this.itemWidth = 350;
      this.gap = 24;
      
      // Clone items for infinite effect
      this.setupInfiniteScroll();
      
      // Initialize
      this.bindEvents();
      this.createProgressDots();
      this.centerInitialItem();
    }
    
    setupInfiniteScroll() {
      // Clone all items and append to create seamless loop
      const originalItems = [...this.items];
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('clone');
        this.track.appendChild(clone);
      });
      
      // Update items array
      this.items = Array.from(this.track.querySelectorAll('.drag-gallery-item'));
    }
    
    bindEvents() {
      // Mouse events
      this.container.addEventListener('mousedown', this.handleStart.bind(this));
      window.addEventListener('mousemove', this.handleMove.bind(this));
      window.addEventListener('mouseup', this.handleEnd.bind(this));
      
      // Touch events
      this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
      window.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
      window.addEventListener('touchend', this.handleEnd.bind(this));
      
      // Wheel event for trackpad/mouse scroll
      this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
      
      // Navigation buttons
      const prevBtn = this.container.querySelector('.drag-gallery-nav.prev');
      const nextBtn = this.container.querySelector('.drag-gallery-nav.next');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.scrollBy(-1));
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.scrollBy(1));
      }
      
      // Window resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.itemWidth = this.items[0]?.offsetWidth || 350;
        }, 200);
      });
      
      // Visibility handling
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopMomentum();
        }
      });
    }
    
    handleStart(e) {
      if (e.button === 2) return; // Ignore right-click
      
      this.isDragging = true;
      this.isScrolling = false;
      this.startX = this.getClientX(e);
      this.currentX = this.startX;
      this.lastTranslateX = this.translateX;
      this.velocity = 0;
      this.lastTime = Date.now();
      
      this.container.classList.add('dragging');
      this.stopMomentum();
      
      // Prevent default on touch to stop page scroll
      if (e.type === 'touchstart') {
        // Only prevent if horizontal drag intent
        this.touchStartY = e.touches[0].clientY;
      }
    }
    
    handleMove(e) {
      if (!this.isDragging) return;
      
      const x = this.getClientX(e);
      const deltaX = x - this.startX;
      
      // Touch scroll detection
      if (e.type === 'touchmove' && this.touchStartY) {
        const deltaY = e.touches[0].clientY - this.touchStartY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical scroll - let it happen
          this.isDragging = false;
          this.container.classList.remove('dragging');
          return;
        }
        e.preventDefault();
      }
      
      this.currentX = x;
      this.translateX = this.lastTranslateX + deltaX;
      
      // Calculate velocity
      const now = Date.now();
      const dt = now - this.lastTime;
      if (dt > 0) {
        this.velocity = (x - (this.currentX - deltaX)) / dt * 16;
      }
      this.lastTime = now;
      
      // Apply transform with skew based on velocity
      const skewAmount = Math.max(-5, Math.min(5, this.velocity * 0.5));
      this.track.style.transform = `translate3d(${this.translateX}px, 0, 0) skewX(${skewAmount}deg)`;
      
      // Check bounds for infinite scroll
      this.checkInfiniteBounds();
      
      if (e.type === 'mousemove') {
        e.preventDefault();
      }
    }
    
    handleEnd(e) {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      this.container.classList.remove('dragging');
      
      // Apply momentum
      this.applyMomentum();
      
      this.touchStartY = null;
    }
    
    handleWheel(e) {
      // Allow vertical scrolling to pass through
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX || e.deltaX === 0 ? e.deltaX : e.deltaY)) {
        return;
      }
      
      e.preventDefault();
      
      const delta = e.deltaX || e.deltaY;
      this.translateX -= delta;
      this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
      
      this.checkInfiniteBounds();
      this.updateProgressDots();
    }
    
    getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }
    
    checkInfiniteBounds() {
      const itemTotalWidth = this.itemWidth + this.gap;
      const totalWidth = itemTotalWidth * (this.items.length / 2);
      
      // If scrolled past half, jump back
      if (Math.abs(this.translateX) > totalWidth) {
        this.translateX += totalWidth;
        this.track.style.transition = 'none';
        this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
        // Force reflow
        this.track.offsetHeight;
        this.track.style.transition = '';
      }
      
      // If scrolled before start, jump forward
      if (this.translateX > 0) {
        this.translateX -= totalWidth;
        this.track.style.transition = 'none';
        this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
        this.track.offsetHeight;
        this.track.style.transition = '';
      }
    }
    
    applyMomentum() {
      const friction = 0.95;
      const minVelocity = 0.5;
      
      const animate = () => {
        if (Math.abs(this.velocity) < minVelocity) {
          this.snapToNearest();
          return;
        }
        
        this.translateX += this.velocity * 10;
        this.velocity *= friction;
        
        this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
        this.checkInfiniteBounds();
        
        this.animationId = requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    stopMomentum() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    
    snapToNearest() {
      const itemTotalWidth = this.itemWidth + this.gap;
      const targetIndex = Math.round(-this.translateX / itemTotalWidth);
      const targetX = -targetIndex * itemTotalWidth;
      
      // Smooth snap animation
      this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      this.translateX = targetX;
      this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
      
      setTimeout(() => {
        this.track.style.transition = '';
        this.checkInfiniteBounds();
        this.updateProgressDots();
      }, 500);
    }
    
    scrollBy(direction) {
      const itemTotalWidth = this.itemWidth + this.gap;
      const targetX = this.translateX - (direction * itemTotalWidth);
      
      this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      this.translateX = targetX;
      this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
      
      setTimeout(() => {
        this.track.style.transition = '';
        this.checkInfiniteBounds();
        this.updateProgressDots();
      }, 500);
    }
    
    centerInitialItem() {
      const containerWidth = this.container.offsetWidth;
      const itemTotalWidth = this.itemWidth + this.gap;
      const centerOffset = (containerWidth - this.itemWidth) / 2;
      this.translateX = centerOffset - itemTotalWidth;
      this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
    }
    
    createProgressDots() {
      const progress = this.container.querySelector('.drag-gallery-progress');
      if (!progress) return;
      
      const originalCount = this.items.length / 2;
      progress.innerHTML = '';
      
      for (let i = 0; i < originalCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'drag-gallery-dot' + (i === 1 ? ' active' : '');
        dot.addEventListener('click', () => {
          const itemTotalWidth = this.itemWidth + this.gap;
          const centerOffset = (this.container.offsetWidth - this.itemWidth) / 2;
          const targetX = centerOffset - (i * itemTotalWidth);
          
          this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
          this.translateX = targetX;
          this.track.style.transform = `translate3d(${this.translateX}px, 0, 0)`;
          
          setTimeout(() => {
            this.track.style.transition = '';
          }, 500);
          
          this.updateProgressDots();
        });
        progress.appendChild(dot);
      }
    }
    
    updateProgressDots() {
      const progress = this.container.querySelector('.drag-gallery-progress');
      if (!progress) return;
      
      const dots = progress.querySelectorAll('.drag-gallery-dot');
      const itemTotalWidth = this.itemWidth + this.gap;
      const centerOffset = (this.container.offsetWidth - this.itemWidth) / 2;
      const currentIndex = Math.round((centerOffset - this.translateX) / itemTotalWidth) % dots.length;
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
    
    destroy() {
      this.stopMomentum();
      // Remove event listeners would require storing references
    }
  }
  
  // Initialize all galleries
  function init() {
    document.querySelectorAll('.infinite-drag-gallery').forEach(gallery => {
      if (!gallery.infiniteDragGallery) {
        gallery.infiniteDragGallery = new InfiniteDragGallery(gallery);
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope
  window.InfiniteDragGallery = InfiniteDragGallery;
})();
