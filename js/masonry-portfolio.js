/**
 * BuildBridge v26.0 - Masonry Portfolio System
 * Fortune 500 Quality Interactive Gallery
 */

(function() {
  'use strict';

  const portfolioData = [
    {
      id: 1,
      category: 'residential',
      title: 'Cape Town Luxury Estate',
      location: '📍 Camps Bay, Cape Town',
      image: 'assets/02_Website_Heroes/Hero_1.png',
      value: 'R12M',
      duration: '8 months',
      description: 'A stunning 5-bedroom luxury residence featuring modern architecture, floor-to-ceiling windows, and sustainable design elements.',
      size: 'large'
    },
    {
      id: 2,
      category: 'commercial',
      title: 'Johannesburg Corporate HQ',
      location: '📍 Sandton, Johannesburg',
      image: 'assets/02_Website_Heroes/Hero_2.png',
      value: 'R45M',
      duration: '18 months',
      description: '12-story commercial development featuring Class A office space and green building certification.',
      size: 'tall'
    },
    {
      id: 3,
      category: 'mixed-use',
      title: 'Durban Waterfront Complex',
      location: '📍 Durban North, Durban',
      image: 'assets/03_Social_Campaign/Campaign_4.png',
      value: 'R28M',
      duration: '14 months',
      description: 'Mixed-use development with luxury apartments, retail spaces, and restaurants with ocean views.',
      size: 'medium'
    },
    {
      id: 4,
      category: 'industrial',
      title: 'Pretoria Industrial Park',
      location: '📍 Centurion, Pretoria',
      image: 'assets/03_Social_Campaign/Campaign_5.png',
      value: 'R65M',
      duration: '24 months',
      description: 'Large-scale industrial facility with warehouse automation and solar power integration.',
      size: 'large'
    },
    {
      id: 5,
      category: 'residential',
      title: 'Stellenbosch Wine Estate',
      location: '📍 Stellenbosch, Western Cape',
      image: 'assets/02_Website_Heroes/Hero_3.png',
      value: 'R18M',
      duration: '12 months',
      description: 'Heritage villa restoration with modern amenities on a working wine estate.',
      size: 'medium'
    },
    {
      id: 6,
      category: 'commercial',
      title: 'Port Elizabeth Retail Center',
      location: '📍 Summerstrand, Port Elizabeth',
      image: 'assets/03_Social_Campaign/Campaign_1.png',
      value: 'R32M',
      duration: '16 months',
      description: 'Modern shopping complex with 45 retail units and underground parking.',
      size: 'tall'
    },
    {
      id: 7,
      category: 'residential',
      title: 'Umhlanga Penthouse',
      location: '📍 Umhlanga Rocks, Durban',
      image: 'assets/03_Social_Campaign/Campaign_2.png',
      value: 'R8.5M',
      duration: '6 months',
      description: 'Luxury penthouse renovation with smart home integration and panoramic sea views.',
      size: 'small'
    },
    {
      id: 8,
      category: 'mixed-use',
      title: 'Bloemfontein City Center',
      location: '📍 CBD, Bloemfontein',
      image: 'assets/03_Social_Campaign/Campaign_3.png',
      value: 'R42M',
      duration: '20 months',
      description: 'Urban regeneration project combining residential, office, and retail spaces.',
      size: 'large'
    },
    {
      id: 9,
      category: 'industrial',
      title: 'East London Logistics Hub',
      location: '📍 Harbour, East London',
      image: 'assets/02_Website_Heroes/Hero_1.png',
      value: 'R55M',
      duration: '22 months',
      description: 'State-of-the-art distribution center with cold storage and automated systems.',
      size: 'medium'
    }
  ];

  class MasonryPortfolio {
    constructor(container) {
      this.container = container;
      this.grid = container.querySelector('.masonry-grid') || container;
      this.items = [];
      this.currentFilter = 'all';
      this.currentIndex = 0;
      this.isAnimating = false;
      
      this.init();
    }

    init() {
      this.createItems();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.calculateRowSpans();
    }

    createItems() {
      this.items = portfolioData.map((data, index) => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.dataset.category = data.category;
        item.dataset.index = index;
        
        // Set row span based on size
        const rowSpan = data.size === 'tall' ? 55 : data.size === 'large' ? 50 : data.size === 'medium' ? 40 : 30;
        item.style.setProperty('--row-span', rowSpan);
        item.style.gridRowEnd = `span ${rowSpan}`;
        
        item.innerHTML = `
          <img src="${data.image}" alt="${data.title}" class="item-image" loading="lazy">
          <button class="quick-view-btn" aria-label="Quick view ${data.title}">👁</button>
          <div class="item-overlay">
            <span class="item-category">${data.category}</span>
            <h3 class="item-title">${data.title}</h3>
            <p class="item-location">${data.location}</p>
            <div class="item-stats">
              <div class="item-stat">
                <span class="item-stat-value">${data.value}</span>
                <span class="item-stat-label">Value</span>
              </div>
              <div class="item-stat">
                <span class="item-stat-value">${data.duration}</span>
                <span class="item-stat-label">Duration</span>
              </div>
            </div>
          </div>
        `;
        
        // Quick view click
        item.querySelector('.quick-view-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          this.openLightbox(index);
        });
        
        return item;
      });
      
      this.items.forEach(item => this.grid.appendChild(item));
    }

    setupEventListeners() {
      // Filter buttons
      this.container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => this.filter(btn.dataset.filter));
      });

      // Search
      const searchInput = this.container.querySelector('.portfolio-search');
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => this.search(e.target.value), 300);
        });
      }

      // Lightbox close
      const lightbox = document.getElementById('portfolio-lightbox');
      if (lightbox) {
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) this.closeLightbox();
        });
        
        // Navigation
        lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => this.prevSlide());
        lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (!lightbox.classList.contains('active')) return;
          if (e.key === 'Escape') this.closeLightbox();
          if (e.key === 'ArrowLeft') this.prevSlide();
          if (e.key === 'ArrowRight') this.nextSlide();
        });
      }
    }

    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      this.items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, i * 100);
        
        observer.observe(item);
      });
    }

    calculateRowSpans() {
      // Recalculate on resize for responsive behavior
      const resizeObserver = new ResizeObserver(() => {
        const isMobile = window.innerWidth <= 768;
        this.items.forEach((item, index) => {
          const data = portfolioData[index];
          if (isMobile) {
            item.style.gridRowEnd = 'span 35';
          } else {
            const rowSpan = data.size === 'tall' ? 55 : data.size === 'large' ? 50 : data.size === 'medium' ? 40 : 30;
            item.style.gridRowEnd = `span ${rowSpan}`;
          }
        });
      });
      
      resizeObserver.observe(this.grid);
    }

    filter(category) {
      if (this.isAnimating || category === this.currentFilter) return;
      this.isAnimating = true;
      this.currentFilter = category;

      // Update button states
      this.container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
      });

      // Animate items
      let visibleCount = 0;
      this.items.forEach((item, index) => {
        const data = portfolioData[index];
        const shouldShow = category === 'all' || data.category === category;
        
        if (shouldShow) {
          visibleCount++;
          item.classList.remove('hidden');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, index * 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => item.classList.add('hidden'), 300);
        }
      });

      // Show no results message
      const noResults = this.container.querySelector('.no-results');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      setTimeout(() => this.isAnimating = false, 500);
    }

    search(query) {
      const normalizedQuery = query.toLowerCase().trim();
      
      this.items.forEach((item, index) => {
        const data = portfolioData[index];
        const searchableText = `${data.title} ${data.location} ${data.category} ${data.description}`.toLowerCase();
        
        if (!normalizedQuery || searchableText.includes(normalizedQuery)) {
          item.classList.remove('hidden');
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => item.classList.add('hidden'), 300);
        }
      });
    }

    openLightbox(index) {
      this.currentIndex = index;
      this.updateLightboxContent();
      
      const lightbox = document.getElementById('portfolio-lightbox');
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
      const lightbox = document.getElementById('portfolio-lightbox');
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    updateLightboxContent() {
      const data = portfolioData[this.currentIndex];
      const lightbox = document.getElementById('portfolio-lightbox');
      
      lightbox.querySelector('.lightbox-image').src = data.image;
      lightbox.querySelector('.lightbox-image').alt = data.title;
      lightbox.querySelector('.lightbox-category').textContent = data.category;
      lightbox.querySelector('.lightbox-title').textContent = data.title;
      lightbox.querySelector('.lightbox-description').textContent = data.description;
      
      // Update meta
      const metaItems = lightbox.querySelectorAll('.lightbox-meta-value');
      metaItems[0].textContent = data.value;
      metaItems[1].textContent = data.duration;
      metaItems[2].textContent = data.location.replace('📍 ', '');
    }

    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + portfolioData.length) % portfolioData.length;
      this.updateLightboxContent();
    }

    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % portfolioData.length;
      this.updateLightboxContent();
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.masonry-portfolio-section').forEach(section => {
      new MasonryPortfolio(section);
    });
  });

  // Expose globally
  window.MasonryPortfolio = MasonryPortfolio;
})();
