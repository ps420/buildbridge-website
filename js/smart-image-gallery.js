/**
 * v93.0: Smart Image Gallery with Reveal Effects
 * Fortune 500 Progressive Image Loading with Intersection Observer
 */

class SmartImageGallery {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      selector: options.selector || '.smart-gallery-item',
      staggerDelay: options.staggerDelay || 100,
      revealDirection: options.revealDirection || 'left',
      parallaxStrength: options.parallaxStrength || 0.1,
      enableParallax: options.enableParallax !== false,
      enableLightbox: options.enableLightbox !== false,
      ...options
    };
    
    this.items = [];
    this.lightbox = null;
    
    this.init();
  }
  
  init() {
    this.findItems();
    this.createRevealOverlays();
    this.bindEvents();
    this.observeItems();
    
    if (this.options.enableLightbox) {
      this.createLightbox();
    }
  }
  
  findItems() {
    this.items = Array.from(this.container.querySelectorAll(this.options.selector));
    
    this.items.forEach((item, index) => {
      item.style.transitionDelay = `${index * this.options.staggerDelay}ms`;
      
      // Store item data
      item._galleryData = {
        image: item.dataset.image || item.querySelector('img')?.dataset.src,
        title: item.dataset.title || '',
        category: item.dataset.category || '',
        location: item.dataset.location || ''
      };
    });
  }
  
  createRevealOverlays() {
    this.items.forEach(item => {
      const imageContainer = item.querySelector('.smart-gallery-image-container') || item;
      
      // Create skeleton loader
      const skeleton = document.createElement('div');
      skeleton.className = 'smart-gallery-skeleton';
      imageContainer.appendChild(skeleton);
      
      // Create reveal overlay
      const reveal = document.createElement('div');
      reveal.className = 'smart-gallery-reveal';
      
      // Set reveal direction
      const direction = item.dataset.reveal || this.options.revealDirection;
      item.dataset.reveal = direction;
      
      imageContainer.appendChild(reveal);
      
      // Handle image loading
      const img = item.querySelector('img');
      if (img) {
        this.handleImageLoad(img, item, reveal);
      }
    });
  }
  
  handleImageLoad(img, item, reveal) {
    // Add loading class
    item.classList.add('loading');
    
    const onLoad = () => {
      item.classList.remove('loading');
      item.classList.add('loaded');
      
      // Trigger reveal after a slight delay
      setTimeout(() => {
        reveal.classList.add('revealed');
        item.classList.add('revealed');
      }, 100);
    };
    
    if (img.complete) {
      onLoad();
    } else {
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', () => {
        item.classList.remove('loading');
        item.classList.add('error');
      }, { once: true });
    }
    
    // Support for lazy loaded images
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  }
  
  bindEvents() {
    // Parallax effect on scroll
    if (this.options.enableParallax) {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateParallax();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
    
    // Click to open lightbox
    if (this.options.enableLightbox) {
      this.items.forEach(item => {
        item.addEventListener('click', () => this.openLightbox(item));
        
        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${item._galleryData.title || 'image'}`);
        
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openLightbox(item);
          }
        });
      });
    }
  }
  
  observeItems() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const delay = Array.from(this.items).indexOf(item) * this.options.staggerDelay;
          
          setTimeout(() => {
            item.classList.add('visible');
          }, delay);
          
          observer.unobserve(item);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    this.items.forEach(item => observer.observe(item));
  }
  
  updateParallax() {
    const scrolled = window.pageYOffset;
    
    this.items.forEach(item => {
      if (!item.dataset.parallax) return;
      
      const rect = item.getBoundingClientRect();
      const speed = parseFloat(item.dataset.parallax) || this.options.parallaxStrength;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const yPos = -(rect.top * speed);
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = `translateY(${yPos}px) scale(1.1)`;
        }
      }
    });
  }
  
  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'smart-gallery-lightbox';
    this.lightbox.innerHTML = `
      <button class="smart-gallery-lightbox-close" aria-label="Close lightbox">×</button>
      <img src="" alt="">
    `;
    
    document.body.appendChild(this.lightbox);
    
    // Close handlers
    const closeBtn = this.lightbox.querySelector('.smart-gallery-lightbox-close');
    closeBtn.addEventListener('click', () => this.closeLightbox());
    
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
        this.closeLightbox();
      }
    });
  }
  
  openLightbox(item) {
    if (!this.lightbox) return;
    
    const img = item.querySelector('img');
    const lightboxImg = this.lightbox.querySelector('img');
    
    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || item._galleryData.title || '';
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  closeLightbox() {
    if (!this.lightbox) return;
    
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Static method for initialization
  static init(selector = '.smart-gallery-container', options = {}) {
    const containers = document.querySelectorAll(selector);
    const galleries = [];
    
    containers.forEach(container => {
      galleries.push(new SmartImageGallery(container, options));
    });
    
    return galleries;
  }
}

// Progressive Image Loader
class ProgressiveImageLoader {
  constructor(img, options = {}) {
    this.img = typeof img === 'string' ? document.querySelector(img) : img;
    if (!this.img) return;
    
    this.options = {
      lowResSrc: this.img.dataset.lowRes || null,
      highResSrc: this.img.dataset.src || this.img.src,
      blurAmount: options.blurAmount || 20,
      transitionDuration: options.transitionDuration || 500,
      ...options
    };
    
    this.init();
  }
  
  init() {
    // Create placeholder
    this.createPlaceholder();
    
    // Load high-res image
    this.loadHighRes();
  }
  
  createPlaceholder() {
    this.img.style.filter = `blur(${this.options.blurAmount}px)`;
    this.img.style.transform = 'scale(1.1)';
    this.img.style.transition = `filter ${this.options.transitionDuration}ms ease, transform ${this.options.transitionDuration}ms ease`;
  }
  
  loadHighRes() {
    const highResImg = new Image();
    
    highResImg.onload = () => {
      this.img.src = this.options.highResSrc;
      
      requestAnimationFrame(() => {
        this.img.style.filter = 'blur(0)';
        this.img.style.transform = 'scale(1)';
        this.img.classList.add('loaded');
      });
    };
    
    highResImg.src = this.options.highResSrc;
  }
  
  static init(selector = 'img[data-progressive]') {
    document.querySelectorAll(selector).forEach(img => {
      new ProgressiveImageLoader(img);
    });
  }
}

// Image Reveal on Scroll
class ScrollRevealImages {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || '[data-reveal-image]',
      threshold: options.threshold || 0.2,
      rootMargin: options.rootMargin || '0px',
      ...options
    };
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay) || 0;
          
          setTimeout(() => {
            el.classList.add('revealed');
            
            // Handle child images
            const img = el.querySelector('img');
            if (img && img.dataset.src) {
              img.src = img.dataset.src;
            }
          }, delay);
          
          observer.unobserve(el);
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });
    
    document.querySelectorAll(this.options.selector).forEach(el => {
      observer.observe(el);
    });
  }
  
  static init(options = {}) {
    return new ScrollRevealImages(options);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  SmartImageGallery.init();
  ProgressiveImageLoader.init();
  ScrollRevealImages.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SmartImageGallery,
    ProgressiveImageLoader,
    ScrollRevealImages
  };
}
