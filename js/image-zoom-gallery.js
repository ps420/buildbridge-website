/**
 * Image Zoom Gallery & Lightbox
 * Hover zoom effects and fullscreen lightbox
 */

(function() {
  'use strict';

  class ImageGallery {
    constructor() {
      this.lightbox = null;
      this.images = [];
      this.currentIndex = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;
      
      this.init();
    }

    init() {
      this.initLightbox();
      this.initMasonryItems();
      this.initFilterGallery();
      this.initParallax();
      this.initImageCompare();
    }

    initLightbox() {
      // Create lightbox element
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'image-lightbox';
      this.lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">×</button>
        <button class="lightbox-nav prev" aria-label="Previous image">‹</button>
        <button class="lightbox-nav next" aria-label="Next image">›</button>
        <div class="lightbox-counter"><span class="current">1</span> / <span class="total">1</span></div>
        <div class="lightbox-content">
          <img class="lightbox-image" src="" alt="">
          <div class="lightbox-caption">
            <h3></h3>
            <p></p>
          </div>
        </div>
      `;
      document.body.appendChild(this.lightbox);

      // Event listeners
      this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
      this.lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => this.prev());
      this.lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => this.next());
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      // Touch/swipe support
      this.lightbox.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.lightbox.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });

      // Close on background click
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) this.close();
      });
    }

    open(index) {
      this.currentIndex = index;
      this.updateImage();
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this.lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateImage();
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateImage();
    }

    updateImage() {
      const image = this.images[this.currentIndex];
      const imgEl = this.lightbox.querySelector('.lightbox-image');
      const captionEl = this.lightbox.querySelector('.lightbox-caption');
      const counterCurrent = this.lightbox.querySelector('.lightbox-counter .current');
      const counterTotal = this.lightbox.querySelector('.lightbox-counter .total');

      imgEl.style.opacity = '0';
      
      setTimeout(() => {
        imgEl.src = image.src;
        imgEl.alt = image.alt || '';
        captionEl.querySelector('h3').textContent = image.title || '';
        captionEl.querySelector('p').textContent = image.category || '';
        counterCurrent.textContent = this.currentIndex + 1;
        counterTotal.textContent = this.images.length;
        imgEl.style.opacity = '1';
      }, 200);
    }

    handleSwipe() {
      const threshold = 50;
      const diff = this.touchStartX - this.touchEndX;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    initMasonryItems() {
      // Collect all gallery images
      const items = document.querySelectorAll('.masonry-item, .gallery-card, .project-card');
      
      items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img) return;

        // Add to gallery collection
        this.images.push({
          src: img.src,
          alt: img.alt,
          title: item.querySelector('h3, .gallery-card-title, .project-overlay h3')?.textContent || '',
          category: item.querySelector('.gallery-card-category, .project-overlay p')?.textContent || ''
        });

        // Click to open
        item.addEventListener('click', () => this.open(index));
      });
    }

    initFilterGallery() {
      const buttons = document.querySelectorAll('.filter-btn');
      const items = document.querySelectorAll('.filter-item');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;

          // Update active button
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Filter items
          items.forEach(item => {
            const category = item.dataset.category;
            
            if (filter === 'all' || category === filter) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });
        });
      });
    }

    initParallax() {
      const parallaxItems = document.querySelectorAll('.parallax-image');
      
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;

      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            parallaxItems.forEach(img => {
              const rect = img.getBoundingClientRect();
              const scrolled = window.innerHeight - rect.top;
              const rate = scrolled * 0.05;
              
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                img.style.transform = `translateY(${rate * 0.5}px)`;
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    initImageCompare() {
      const compareContainers = document.querySelectorAll('.image-compare');

      compareContainers.forEach(container => {
        const slider = container.querySelector('.image-compare-slider');
        const before = container.querySelector('.image-compare-before');
        let isDragging = false;

        const updateSlider = (x) => {
          const rect = container.getBoundingClientRect();
          let position = ((x - rect.left) / rect.width) * 100;
          position = Math.max(0, Math.min(100, position));
          
          slider.style.left = `${position}%`;
          before.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
        };

        slider.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          updateSlider(e.clientX);
        });

        // Touch support
        slider.addEventListener('touchstart', () => isDragging = true);
        document.addEventListener('touchend', () => isDragging = false);
        document.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          updateSlider(e.touches[0].clientX);
        });
      });
    }
  }

  // Initialize
  function init() {
    new ImageGallery();
    console.log('🖼️ Image Gallery & Lightbox initialized');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
