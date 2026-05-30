/* ========================================
   v103.0: Magnetic Grid Gallery
   Fortune 500 Immersive Portfolio Display
   ======================================== */

class MagneticGridGallery {
  constructor() {
    this.items = document.querySelectorAll('.magnetic-gallery-item');
    this.galleryData = [
      {
        id: 1,
        image: 'assets/02_Website_Heroes/Hero_1.png',
        category: 'Residential',
        title: 'Luxury Villa Estate',
        location: '📍 Cape Town, South Africa',
        value: 'R12.5M',
        duration: '14 months',
        badge: 'Featured'
      },
      {
        id: 2,
        image: 'assets/02_Website_Heroes/Hero_2.png',
        category: 'Commercial',
        title: 'Axis Tower',
        location: '📍 Johannesburg, South Africa',
        value: 'R45M',
        duration: '22 months',
        badge: null
      },
      {
        id: 3,
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        category: 'Industrial',
        title: 'Port Logistics Hub',
        location: '📍 Durban, South Africa',
        value: 'R28M',
        duration: '18 months',
        badge: null
      },
      {
        id: 4,
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        category: 'Renovation',
        title: 'Heritage Restoration',
        location: '📍 Stellenbosch, South Africa',
        value: 'R8.5M',
        duration: '10 months',
        badge: 'Heritage'
      },
      {
        id: 5,
        image: 'assets/02_Website_Heroes/Hero_3.png',
        category: 'Residential',
        title: 'Modern Beachfront',
        location: '📍 Plettenberg Bay, South Africa',
        value: 'R18M',
        duration: '16 months',
        badge: 'Premium'
      },
      {
        id: 6,
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        category: 'Commercial',
        title: 'Tech Park Phase 1',
        location: '📍 Cape Town, South Africa',
        value: 'R32M',
        duration: '20 months',
        badge: null
      },
      {
        id: 7,
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        category: 'Mixed Use',
        title: 'Urban Market Square',
        location: '📍 Pretoria, South Africa',
        value: 'R38M',
        duration: '24 months',
        badge: 'New'
      },
      {
        id: 8,
        image: 'assets/02_Website_Heroes/Hero_1.png',
        category: 'Residential',
        title: 'Eco Estate Phase 2',
        location: '📍 George, South Africa',
        value: 'R22M',
        duration: '15 months',
        badge: 'Eco'
      }
    ];
    
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.renderGallery();
    this.bindEvents();
    this.createLightbox();
  }
  
  renderGallery() {
    const grid = document.querySelector('.magnetic-gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = this.galleryData.map((item, index) => `
      <div class="magnetic-gallery-item" data-index="${index}" data-category="${item.category.toLowerCase()}">
        <img src="${item.image}" alt="${item.title}" class="magnetic-gallery-image" loading="lazy">
        <div class="magnetic-gallery-overlay"></div>
        <div class="magnetic-gallery-shine"></div>
        ${item.badge ? `<div class="magnetic-gallery-badge">${item.badge}</div>` : ''}
        <div class="magnetic-gallery-view"><span>View</span></div>
        <div class="magnetic-gallery-content">
          <span class="magnetic-gallery-category">${item.category}</span>
          <h3 class="magnetic-gallery-title">${item.title}</h3>
          <div class="magnetic-gallery-location">${item.location}</div>
          <div class="magnetic-gallery-stats">
            <div class="magnetic-stat">
              <span class="magnetic-stat-value">${item.value}</span>
              <span class="magnetic-stat-label">Value</span>
            </div>
            <div class="magnetic-stat">
              <span class="magnetic-stat-value">${item.duration}</span>
              <span class="magnetic-stat-label">Duration</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Re-query items after render
    this.items = document.querySelectorAll('.magnetic-gallery-item');
  }
  
  bindEvents() {
    this.items.forEach(item => {
      // Mouse move for magnetic effect
      item.addEventListener('mousemove', (e) => this.handleMouseMove(e, item));
      
      // Mouse leave to reset
      item.addEventListener('mouseleave', () => this.handleMouseLeave(item));
      
      // Click for lightbox
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.openLightbox(index);
      });
    });
    
    // Touch device handling
    if ('ontouchstart' in window) {
      this.items.forEach(item => {
        item.addEventListener('touchstart', () => {
          item.classList.add('touch-active');
        });
        
        item.addEventListener('touchend', () => {
          item.classList.remove('touch-active');
        });
      });
    }
  }
  
  handleMouseMove(e, item) {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    // Calculate shine position
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    
    // Apply transforms
    item.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
      translateZ(20px)
    `;
    
    // Update shine position
    item.style.setProperty('--mouse-x', `${shineX}%`);
    item.style.setProperty('--mouse-y', `${shineY}%`);
  }
  
  handleMouseLeave(item) {
    item.style.transform = '';
    item.style.setProperty('--mouse-x', '50%');
    item.style.setProperty('--mouse-y', '50%');
  }
  
  createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'magnetic-gallery-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-counter">
        <span id="lightboxCurrent">1</span> / <span id="lightboxTotal">${this.galleryData.length}</span>
      </div>
      <button class="lightbox-close">✕</button>
      <button class="lightbox-nav prev">‹</button>
      <button class="lightbox-nav next">›</button>
      <div class="lightbox-image-container">
        <img src="" alt="" id="lightboxImage">
      </div>
      <div class="lightbox-info">
        <h3 id="lightboxTitle"></h3>
        <p id="lightboxLocation"></p>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Bind lightbox events
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => this.prevImage());
    lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => this.nextImage());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.prevImage();
      if (e.key === 'ArrowRight') this.nextImage();
    });
    
    // Click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) this.closeLightbox();
    });
    
    this.lightbox = lightbox;
  }
  
  openLightbox(index) {
    this.currentIndex = index;
    this.updateLightboxContent();
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  closeLightbox() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  updateLightboxContent() {
    const item = this.galleryData[this.currentIndex];
    
    document.getElementById('lightboxImage').src = item.image;
    document.getElementById('lightboxImage').alt = item.title;
    document.getElementById('lightboxTitle').textContent = item.title;
    document.getElementById('lightboxLocation').textContent = item.location.replace('📍 ', '');
    document.getElementById('lightboxCurrent').textContent = this.currentIndex + 1;
  }
  
  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.galleryData.length;
    this.updateLightboxContent();
  }
  
  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.galleryData.length) % this.galleryData.length;
    this.updateLightboxContent();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const gallerySection = document.querySelector('.magnetic-gallery-section');
  if (gallerySection) {
    new MagneticGridGallery();
    
    console.log('🎨 BuildBridge Fortune 500 v103.0 loaded: Magnetic Grid Gallery (3D Hover Effects, Lightbox, Keyboard Navigation, Touch Support)');
  }
});
