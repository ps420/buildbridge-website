/**
 * BuildBridge Project Filter & Masonry Layout
 * Fortune 500 Quality - Smooth filtering with FLIP animations
 */

class ProjectFilter {
  constructor(container) {
    this.container = container;
    this.filterButtons = container.querySelectorAll('.filter-btn');
    this.projectGrid = container.querySelector('.projects-masonry');
    this.projects = container.querySelectorAll('.project-item');
    this.searchInput = container.querySelector('.project-search');
    this.activeFilter = 'all';
    this.searchTerm = '';
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupIntersectionObserver();
    this.updateGrid();
  }
  
  bindEvents() {
    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.setFilter(filter);
      });
    });
    
    // Search input
    if (this.searchInput) {
      let debounceTimer;
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.toLowerCase();
          this.updateGrid();
        }, 200);
      });
    }
    
    // View toggle (grid/list)
    const viewButtons = this.container.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.setView(view);
      });
    });
  }
  
  setFilter(filter) {
    this.activeFilter = filter;
    
    // Update button states
    this.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    this.updateGrid();
  }
  
  setView(view) {
    this.projectGrid.classList.toggle('view-list', view === 'list');
    
    // Update button states
    this.container.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }
  
  updateGrid() {
    // First, capture current positions
    const firstPositions = this.capturePositions();
    
    // Apply filtering
    this.projects.forEach(project => {
      const category = project.dataset.category;
      const tags = (project.dataset.tags || '').toLowerCase();
      const title = project.querySelector('h3')?.textContent.toLowerCase() || '';
      const location = project.querySelector('.project-location')?.textContent.toLowerCase() || '';
      
      const matchesFilter = this.activeFilter === 'all' || category === this.activeFilter;
      const matchesSearch = !this.searchTerm || 
        title.includes(this.searchTerm) || 
        location.includes(this.searchTerm) ||
        tags.includes(this.searchTerm);
      
      const isVisible = matchesFilter && matchesSearch;
      
      if (isVisible) {
        project.classList.remove('hidden');
        project.style.display = '';
      } else {
        project.classList.add('hidden');
      }
    });
    
    // Force reflow
    this.projectGrid.offsetHeight;
    
    // Capture new positions
    const lastPositions = this.capturePositions();
    
    // Calculate and apply FLIP animations
    this.animateFLIP(firstPositions, lastPositions);
    
    // Update count
    this.updateCount();
  }
  
  capturePositions() {
    const positions = new Map();
    this.projects.forEach(project => {
      if (!project.classList.contains('hidden')) {
        const rect = project.getBoundingClientRect();
        const parentRect = this.projectGrid.getBoundingClientRect();
        positions.set(project, {
          left: rect.left - parentRect.left,
          top: rect.top - parentRect.top,
          width: rect.width,
          height: rect.height
        });
      }
    });
    return positions;
  }
  
  animateFLIP(firstPositions, lastPositions) {
    firstPositions.forEach((first, project) => {
      const last = lastPositions.get(project);
      if (!last) {
        // Project was removed - fade out
        project.style.opacity = '0';
        project.style.transform = 'scale(0.8)';
        setTimeout(() => {
          if (project.classList.contains('hidden')) {
            project.style.display = 'none';
          }
        }, 300);
        return;
      }
      
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const dw = first.width / last.width - 1;
      const dh = first.height / last.height - 1;
      
      if (dx !== 0 || dy !== 0 || dw !== 0 || dh !== 0) {
        // Apply FLIP animation
        project.style.transition = 'none';
        project.style.transform = `translate(${dx}px, ${dy}px) scale(${1 + dw}, ${1 + dh})`;
        
        requestAnimationFrame(() => {
          project.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
          project.style.transform = '';
        });
      }
    });
    
    // Handle new items (fading in)
    lastPositions.forEach((last, project) => {
      if (!firstPositions.has(project)) {
        project.style.opacity = '0';
        project.style.transform = 'scale(0.8)';
        
        requestAnimationFrame(() => {
          project.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
          project.style.opacity = '1';
          project.style.transform = '';
        });
      }
    });
  }
  
  updateCount() {
    const countEl = this.container.querySelector('.project-count');
    if (countEl) {
      const visibleCount = this.projects.length - this.container.querySelectorAll('.project-item.hidden').length;
      countEl.textContent = `${visibleCount} project${visibleCount !== 1 ? 's' : ''}`;
    }
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    this.projects.forEach(project => {
      observer.observe(project);
    });
  }
}

// Project Detail Modal
class ProjectModal {
  constructor() {
    this.modal = null;
    this.currentProject = null;
    this.init();
  }
  
  init() {
    // Create modal element
    this.modal = document.createElement('div');
    this.modal.className = 'project-modal';
    this.modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <button class="modal-close">&times;</button>
        <div class="modal-content">
          <div class="modal-gallery">
            <div class="gallery-main">
              <img src="" alt="" class="gallery-image">
              <button class="gallery-nav prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button class="gallery-nav next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div class="gallery-thumbs"></div>
          </div>
          <div class="modal-info">
            <span class="modal-category"></span>
            <h2 class="modal-title"></h2>
            <p class="modal-location"></p>
            <div class="modal-details">
              <div class="detail-item">
                <span class="detail-label">Value</span>
                <span class="detail-value value-amount"></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value value-duration"></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Year</span>
                <span class="detail-value value-year"></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Size</span>
                <span class="detail-value value-size"></span>
              </div>
            </div>
            <p class="modal-description"></p>
            <div class="modal-tags"></div>
            <div class="modal-actions">
              <a href="https://wa.me/27661200064" class="btn btn-primary" target="_blank">
                💬 Discuss This Project
              </a>
              <a href="projects.html" class="btn btn-secondary">View All Projects</a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    this.bindEvents();
  }
  
  bindEvents() {
    // Close on overlay click
    this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
    
    // Close button
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('active')) return;
      
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prevImage();
      if (e.key === 'ArrowRight') this.nextImage();
    });
    
    // Gallery navigation
    this.modal.querySelector('.gallery-nav.prev').addEventListener('click', () => this.prevImage());
    this.modal.querySelector('.gallery-nav.next').addEventListener('click', () => this.nextImage());
  }
  
  open(projectData) {
    this.currentProject = projectData;
    this.currentImageIndex = 0;
    
    // Populate modal
    this.modal.querySelector('.modal-category').textContent = projectData.category;
    this.modal.querySelector('.modal-title').textContent = projectData.title;
    this.modal.querySelector('.modal-location').textContent = projectData.location;
    this.modal.querySelector('.modal-description').textContent = projectData.description;
    this.modal.querySelector('.value-amount').textContent = projectData.value;
    this.modal.querySelector('.value-duration').textContent = projectData.duration;
    this.modal.querySelector('.value-year').textContent = projectData.year;
    this.modal.querySelector('.value-size').textContent = projectData.size;
    
    // Tags
    const tagsContainer = this.modal.querySelector('.modal-tags');
    tagsContainer.innerHTML = projectData.tags.map(tag => `
      <span class="modal-tag">${tag}</span>
    `).join('');
    
    // Gallery
    this.setupGallery(projectData.images);
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => {
      this.modal.querySelector('.modal-container').style.transform = 'translateY(0)';
      this.modal.querySelector('.modal-container').style.opacity = '1';
    });
  }
  
  setupGallery(images) {
    this.galleryImages = images;
    this.currentImageIndex = 0;
    
    // Update main image
    this.updateGalleryImage();
    
    // Setup thumbs
    const thumbsContainer = this.modal.querySelector('.gallery-thumbs');
    thumbsContainer.innerHTML = images.map((img, i) => `
      <button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${img}" alt="">
      </button>
    `).join('');
    
    // Thumb click events
    thumbsContainer.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this.currentImageIndex = parseInt(thumb.dataset.index);
        this.updateGalleryImage();
      });
    });
  }
  
  updateGalleryImage() {
    const mainImg = this.modal.querySelector('.gallery-image');
    mainImg.style.opacity = '0';
    
    setTimeout(() => {
      mainImg.src = this.galleryImages[this.currentImageIndex];
      mainImg.style.opacity = '1';
    }, 200);
    
    // Update thumbs
    this.modal.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === this.currentImageIndex);
    });
  }
  
  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.updateGalleryImage();
  }
  
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
    this.updateGalleryImage();
  }
  
  close() {
    this.modal.querySelector('.modal-container').style.transform = 'translateY(50px)';
    this.modal.querySelector('.modal-container').style.opacity = '0';
    
    setTimeout(() => {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }, 300);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize filters
  document.querySelectorAll('.projects-filter-container').forEach(container => {
    new ProjectFilter(container);
  });
  
  // Initialize modal
  window.projectModal = new ProjectModal();
  
  // Bind project card clicks
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('click', () => {
      const projectData = {
        category: card.dataset.category,
        title: card.querySelector('h3')?.textContent || '',
        location: card.querySelector('.project-location')?.textContent || '',
        description: card.dataset.description || '',
        value: card.dataset.value || 'Contact us',
        duration: card.dataset.duration || 'N/A',
        year: card.dataset.year || '2024',
        size: card.dataset.size || 'N/A',
        tags: (card.dataset.tags || '').split(',').filter(t => t),
        images: (card.dataset.images || card.querySelector('img')?.src || '').split(',')
      };
      
      window.projectModal.open(projectData);
    });
  });
});

// Export
window.ProjectFilter = ProjectFilter;
window.ProjectModal = ProjectModal;
