/**
 * BuildBridge Project Gallery Pro v52.0
 * Filterable Isotope-style Gallery with Lightbox
 * Fortune 500 Professional Component
 */

class ProjectGalleryPro {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.items = [];
    this.filteredItems = [];
    this.currentFilter = 'all';
    this.currentIndex = 0;
    this.visibleCount = 8;
    this.itemsPerLoad = 4;
    this.isLightboxOpen = false;
    
    // Sample projects data
    this.projects = [
      {
        id: 1,
        title: 'Ocean View Residence',
        category: 'residential',
        categoryLabel: 'Residential',
        location: 'Cape Town, South Africa',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        description: 'A stunning modern residence featuring floor-to-ceiling windows, sustainable materials, and panoramic ocean views.',
        area: '450 m²',
        duration: '18 months',
        value: 'R8.5M',
        year: '2025',
        featured: true
      },
      {
        id: 2,
        title: 'Century City Commercial Hub',
        category: 'commercial',
        categoryLabel: 'Commercial',
        location: 'Cape Town, South Africa',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        description: 'A state-of-the-art commercial complex with smart building technology and energy-efficient design.',
        area: '2,800 m²',
        duration: '24 months',
        value: 'R45M',
        year: '2024'
      },
      {
        id: 3,
        title: 'Johannesburg Innovation Center',
        category: 'commercial',
        categoryLabel: 'Commercial',
        location: 'Johannesburg, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        description: 'Modern office spaces designed for collaboration and innovation.',
        area: '1,200 m²',
        duration: '14 months',
        value: 'R22M',
        year: '2024'
      },
      {
        id: 4,
        title: 'Durban Waterfront Complex',
        category: 'residential',
        categoryLabel: 'Residential',
        location: 'Durban, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        description: 'Luxury apartments with beachfront access and resort-style amenities.',
        area: '3,500 m²',
        duration: '30 months',
        value: 'R67M',
        year: '2025',
        featured: true
      },
      {
        id: 5,
        title: 'Pretoria Industrial Park',
        category: 'industrial',
        categoryLabel: 'Industrial',
        location: 'Pretoria, South Africa',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        description: 'Large-scale industrial facility with optimized logistics and modern warehousing.',
        area: '8,000 m²',
        duration: '20 months',
        value: 'R89M',
        year: '2023'
      },
      {
        id: 6,
        title: 'Stellenbosch Wine Estate',
        category: 'renovation',
        categoryLabel: 'Renovation',
        location: 'Stellenbosch, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        description: 'Complete restoration and modernization of a historic wine estate.',
        area: '2,200 m²',
        duration: '16 months',
        value: 'R35M',
        year: '2024'
      },
      {
        id: 7,
        title: 'Port Elizabeth Mall',
        category: 'commercial',
        categoryLabel: 'Commercial',
        location: 'Port Elizabeth, South Africa',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        description: 'Modern retail space with sustainable design and customer experience focus.',
        area: '5,500 m²',
        duration: '22 months',
        value: 'R78M',
        year: '2024'
      },
      {
        id: 8,
        title: 'Bloemfontein Medical Center',
        category: 'commercial',
        categoryLabel: 'Commercial',
        location: 'Bloemfontein, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        description: 'Specialized healthcare facility with advanced medical infrastructure.',
        area: '4,200 m²',
        duration: '26 months',
        value: 'R95M',
        year: '2025'
      },
      {
        id: 9,
        title: 'Sandton Luxury Villa',
        category: 'residential',
        categoryLabel: 'Residential',
        location: 'Johannesburg, South Africa',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        description: 'Exclusive private residence with smart home integration and luxury finishes.',
        area: '890 m²',
        duration: '24 months',
        value: 'R28M',
        year: '2024'
      },
      {
        id: 10,
        title: 'East London Factory',
        category: 'industrial',
        categoryLabel: 'Industrial',
        location: 'East London, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        description: 'Automotive parts manufacturing facility with cutting-edge production lines.',
        area: '6,500 m²',
        duration: '18 months',
        value: 'R110M',
        year: '2023'
      },
      {
        id: 11,
        title: 'Cape Town Heritage House',
        category: 'renovation',
        categoryLabel: 'Renovation',
        location: 'Cape Town, South Africa',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        description: 'Careful restoration of a Victorian-era home with modern additions.',
        area: '380 m²',
        duration: '12 months',
        value: 'R8.2M',
        year: '2024'
      },
      {
        id: 12,
        title: 'Nelspruit Eco Resort',
        category: 'commercial',
        categoryLabel: 'Commercial',
        location: 'Nelspruit, South Africa',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        description: 'Sustainable tourism development with minimal environmental impact.',
        area: '3,800 m²',
        duration: '28 months',
        value: 'R52M',
        year: '2025'
      }
    ];
    
    this.categories = [
      { id: 'all', label: 'All Projects' },
      { id: 'residential', label: 'Residential' },
      { id: 'commercial', label: 'Commercial' },
      { id: 'industrial', label: 'Industrial' },
      { id: 'renovation', label: 'Renovation' }
    ];
    
    this.init();
  }
  
  init() {
    this.createGalleryHTML();
    this.createLightbox();
    this.bindEvents();
    this.renderGallery();
  }
  
  createGalleryHTML() {
    this.container.innerHTML = `
      <div class="gallery-header">
        <span class="gallery-badge">Our Portfolio</span>
        <h2 class="gallery-title">Featured Projects</h2>
        <p class="gallery-subtitle">Explore our diverse portfolio of construction excellence across South Africa</p>
      </div>
      
      <div class="gallery-filters">
        ${this.categories.map(cat => `
          <button class="gallery-filter ${cat.id === 'all' ? 'active' : ''}" data-filter="${cat.id}">
            ${cat.label}
          </button>
        `).join('')}
      </div>
      
      <div class="gallery-container"></div>
      
      <div class="gallery-load-more">
        <button class="load-more-btn">
          Load More Projects
          <span class="arrow">↓</span>
        </button>
      </div>
    `;
    
    this.galleryContainer = this.container.querySelector('.gallery-container');
    this.filterButtons = this.container.querySelectorAll('.gallery-filter');
    this.loadMoreBtn = this.container.querySelector('.load-more-btn');
  }
  
  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'gallery-lightbox';
    this.lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      
      <button class="lightbox-prev" aria-label="Previous project">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <button class="lightbox-next" aria-label="Next project">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      
      <div class="lightbox-content">
        <div class="lightbox-image-container">
          <img class="lightbox-image" src="" alt="">
        </div>
        <div class="lightbox-info">
          <span class="lightbox-category"></span>
          <h3 class="lightbox-title"></h3>
          <p class="lightbox-location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span></span>
          </p>
          <p class="lightbox-description"></p>
          <div class="lightbox-details">
            <div class="lightbox-detail">
              <div class="lightbox-detail-label">Project Size</div>
              <div class="lightbox-detail-value" data-detail="area"></div>
            </div>
            <div class="lightbox-detail">
              <div class="lightbox-detail-label">Duration</div>
              <div class="lightbox-detail-value" data-detail="duration"></div>
            </div>
            <div class="lightbox-detail">
              <div class="lightbox-detail-label">Project Value</div>
              <div class="lightbox-detail-value" data-detail="value"></div>
            </div>
            <div class="lightbox-detail">
              <div class="lightbox-detail-label">Completed</div>
              <div class="lightbox-detail-value" data-detail="year"></div>
            </div>
          </div>
          <a href="https://wa.me/27661200064" class="lightbox-cta">
            Discuss Your Project
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
      
      <div class="lightbox-counter">
        <span class="current">1</span> / <span class="total">12</span>
      </div>
    `;
    
    document.body.appendChild(this.lightbox);
    
    // Store references
    this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
    this.lightboxCategory = this.lightbox.querySelector('.lightbox-category');
    this.lightboxTitle = this.lightbox.querySelector('.lightbox-title');
    this.lightboxLocation = this.lightbox.querySelector('.lightbox-location span');
    this.lightboxDescription = this.lightbox.querySelector('.lightbox-description');
    this.lightboxCounter = this.lightbox.querySelector('.lightbox-counter');
  }
  
  bindEvents() {
    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.setFilter(filter);
        
        // Update active state
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    
    // Load more
    this.loadMoreBtn.addEventListener('click', () => this.loadMore());
    
    // Lightbox controls
    this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevProject());
    this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextProject());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isLightboxOpen) return;
      
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.prevProject();
      if (e.key === 'ArrowRight') this.nextProject();
    });
    
    // Click outside to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
  }
  
  setFilter(filter) {
    this.currentFilter = filter;
    this.visibleCount = 8;
    
    this.filteredItems = filter === 'all' 
      ? [...this.projects]
      : this.projects.filter(p => p.category === filter);
    
    this.renderGallery();
  }
  
  renderGallery() {
    const itemsToShow = this.filteredItems.slice(0, this.visibleCount);
    
    this.galleryContainer.innerHTML = itemsToShow.map((project, index) => `
      <div class="gallery-item ${project.featured ? 'featured' : ''} show" data-id="${project.id}" data-index="${index}" style="animation-delay: ${index * 0.05}s">
        <img class="gallery-item-image" src="${project.image}" alt="${project.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <span class="gallery-item-category">${project.categoryLabel}</span>
          <h3 class="gallery-item-title">${project.title}</h3>
          <p class="gallery-item-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${project.location}
          </p>
          <div class="gallery-item-stats">
            <span class="gallery-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              ${project.area}
            </span>
            <span class="gallery-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              ${project.duration}
            </span>
          </div>
        </div>
      </div>
    `).join('');
    
    // Bind item clicks
    this.galleryContainer.querySelectorAll('.gallery-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.openLightbox(index);
      });
    });
    
    // Show/hide load more button
    this.loadMoreBtn.style.display = 
      this.visibleCount >= this.filteredItems.length ? 'none' : 'inline-flex';
  }
  
  loadMore() {
    this.visibleCount += this.itemsPerLoad;
    this.renderGallery();
  }
  
  openLightbox(index) {
    this.currentIndex = index;
    this.isLightboxOpen = true;
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.updateLightboxContent();
  }
  
  closeLightbox() {
    this.isLightboxOpen = false;
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  prevProject() {
    this.currentIndex = (this.currentIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
    this.updateLightboxContent();
  }
  
  nextProject() {
    this.currentIndex = (this.currentIndex + 1) % this.filteredItems.length;
    this.updateLightboxContent();
  }
  
  updateLightboxContent() {
    const project = this.filteredItems[this.currentIndex];
    
    this.lightboxImage.src = project.image;
    this.lightboxImage.alt = project.title;
    this.lightboxCategory.textContent = project.categoryLabel;
    this.lightboxTitle.textContent = project.title;
    this.lightboxLocation.textContent = project.location;
    this.lightboxDescription.textContent = project.description;
    
    // Update details
    this.lightbox.querySelector('[data-detail="area"]').textContent = project.area;
    this.lightbox.querySelector('[data-detail="duration"]').textContent = project.duration;
    this.lightbox.querySelector('[data-detail="value"]').textContent = project.value;
    this.lightbox.querySelector('[data-detail="year"]').textContent = project.year;
    
    // Update counter
    this.lightboxCounter.querySelector('.current').textContent = this.currentIndex + 1;
    this.lightboxCounter.querySelector('.total').textContent = this.filteredItems.length;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if gallery section exists, if not create it
  let gallerySection = document.querySelector('.project-gallery-section');
  
  if (!gallerySection) {
    // Find a good place to insert - after process section or testimonials
    const processSection = document.querySelector('.process-section, #process');
    const testimonialsSection = document.querySelector('.testimonials-section, #testimonials');
    const targetSection = processSection || testimonialsSection;
    
    if (targetSection) {
      gallerySection = document.createElement('section');
      gallerySection.className = 'project-gallery-section';
      gallerySection.id = 'projects';
      targetSection.parentNode.insertBefore(gallerySection, targetSection.nextSibling);
    }
  }
  
  if (gallerySection) {
    window.projectGallery = new ProjectGalleryPro('.project-gallery-section');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectGalleryPro;
}
