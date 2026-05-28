/**
 * v56.0: Interactive Project Map v2
 * Fortune 500 - Animated project locations with interactive pins
 */

class InteractiveProjectMap {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.options = {
      projects: [],
      animationDuration: 400,
      autoRotate: false,
      rotationInterval: 5000,
      ...options
    };
    
    this.activePin = null;
    this.activeCard = null;
    this.rotationTimer = null;
    this.projectIndex = 0;
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.warn('InteractiveProjectMap: Container not found');
      return;
    }
    
    this.render();
    this.bindEvents();
    this.startEntranceAnimation();
    
    if (this.options.autoRotate) {
      this.startAutoRotation();
    }
    
    console.log('🗺️ InteractiveProjectMap v56.0 initialized');
  }
  
  render() {
    const defaultProjects = [
      {
        id: 'capetown',
        name: 'Cape Town Luxury Estate',
        location: 'Cape Town, Western Cape',
        category: 'residential',
        position: { top: '75%', left: '25%' },
        value: 'R12M',
        duration: '8 months',
        image: 'assets/02_Website_Heroes/Hero_1.png'
      },
      {
        id: 'johannesburg',
        name: 'Johannesburg Corporate HQ',
        location: 'Sandton, Gauteng',
        category: 'commercial',
        position: { top: '35%', left: '55%' },
        value: 'R45M',
        duration: '18 months',
        image: 'assets/02_Website_Heroes/Hero_2.png'
      },
      {
        id: 'durban',
        name: 'Durban Waterfront Complex',
        location: 'Durban, KwaZulu-Natal',
        category: 'mixed-use',
        position: { top: '45%', left: '70%' },
        value: 'R28M',
        duration: '14 months',
        image: 'assets/03_Social_Campaign/Campaign_4.png'
      },
      {
        id: 'pretoria',
        name: 'Pretoria Industrial Park',
        location: 'Pretoria, Gauteng',
        category: 'industrial',
        position: { top: '30%', left: '58%' },
        value: 'R35M',
        duration: '12 months',
        image: 'assets/03_Social_Campaign/Campaign_5.png'
      },
      {
        id: 'portelizabeth',
        name: 'PE Harbour Development',
        location: 'Port Elizabeth, Eastern Cape',
        category: 'commercial',
        position: { top: '70%', left: '45%' },
        value: 'R22M',
        duration: '10 months',
        image: 'assets/02_Website_Heroes/Hero_1.png'
      },
      {
        id: 'bloemfontein',
        name: 'Bloemfontein Shopping Centre',
        location: 'Bloemfontein, Free State',
        category: 'mixed-use',
        position: { top: '50%', left: '45%' },
        value: 'R18M',
        duration: '9 months',
        image: 'assets/02_Website_Heroes/Hero_2.png'
      }
    ];
    
    this.projects = this.options.projects.length > 0 ? this.options.projects : defaultProjects;
    
    const mapHTML = `
      <div class="project-map-section">
        <div class="section-header">
          <p class="eyebrow">Project Locations</p>
          <h2 class="scramble-text">Nationwide Coverage</h2>
          <p>Explore our portfolio of successful projects across South Africa</p>
        </div>
        
        <div class="project-map-wrapper" id="projectMap">
          <!-- Animated Grid Background -->
          <div class="map-grid"></div>
          
          <!-- SA Map Outline -->
          <svg class="sa-map-outline" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
            <path d="M120,40 Q180,30 220,50 T280,80 Q320,100 340,140 T350,200 Q360,260 340,300 T300,380 Q280,420 240,450 T160,470 Q120,460 100,420 T80,340 Q70,280 90,220 T120,120 Q130,80 120,40 Z" />
          </svg>
          
          <!-- Connection Lines -->
          <svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line class="connection-line" x1="25" y1="75" x2="55" y2="35" />
            <line class="connection-line" x1="55" y1="35" x2="70" y2="45" />
            <line class="connection-line" x1="55" y1="35" x2="45" y2="50" />
            <line class="connection-line" x1="45" y1="50" x2="25" y2="75" />
            <line class="connection-line" x1="58" y1="30" x2="70" y2="45" />
            <line class="connection-line" x1="45" y1="50" x2="70" y2="70" />
          </svg>
          
          <!-- Stats Overlay -->
          <div class="map-stats-overlay">
            <div class="map-stat-item">
              <div class="map-stat-value">150+</div>
              <div class="map-stat-label">Projects</div>
            </div>
            <div class="map-stat-item">
              <div class="map-stat-value">9</div>
              <div class="map-stat-label">Provinces</div>
            </div>
            <div class="map-stat-item">
              <div class="map-stat-value">R2B+</div>
              <div class="map-stat-label">Value</div>
            </div>
          </div>
          
          <!-- Map Controls -->
          <div class="map-controls">
            <button class="map-control-btn" data-action="reset" title="Reset View">
              ⟲
            </button>
            <button class="map-control-btn" data-action="fullscreen" title="Fullscreen">
              ⛶
            </button>
          </div>
          
          <!-- Legend -->
          <div class="map-legend">
            <div class="map-legend-title">Project Types</div>
            <div class="map-legend-items">
              <div class="map-legend-item" data-filter="residential">
                <span class="map-legend-dot residential"></span>
                <span>Residential</span>
              </div>
              <div class="map-legend-item" data-filter="commercial">
                <span class="map-legend-dot commercial"></span>
                <span>Commercial</span>
              </div>
              <div class="map-legend-item" data-filter="industrial">
                <span class="map-legend-dot industrial"></span>
                <span>Industrial</span>
              </div>
              <div class="map-legend-item" data-filter="mixed-use">
                <span class="map-legend-dot mixed-use"></span>
                <span>Mixed-Use</span>
              </div>
            </div>
          </div>
          
          <!-- Project Pins -->
          ${this.projects.map((project, index) => `
            <div class="project-pin pin-${project.id}" 
                 data-project-id="${project.id}"
                 data-category="${project.category}"
                 style="top: ${project.position.top}; left: ${project.position.left};"
                 data-delay="${index * 200}">
              <div class="pin-ripple"></div>
              <div class="pin-ripple"></div>
              <div class="pin-ripple"></div>
              
              <!-- Preview Card -->
              <div class="project-preview-card ${parseInt(project.position.left) > 50 ? 'left-side' : 'right-side'}" data-card-for="${project.id}">
                <img src="${project.image}" alt="${project.name}" class="project-preview-image">
                <div class="project-preview-content">
                  <div class="project-preview-category">${project.category}</div>
                  <h4 class="project-preview-title">${project.name}</h4>
                  <div class="project-preview-location">📍 ${project.location}</div>
                  <div class="project-preview-stats">
                    <div class="project-preview-stat">
                      <div class="project-preview-stat-value">${project.value}</div>
                      <div class="project-preview-stat-label">Value</div>
                    </div>
                    <div class="project-preview-stat">
                      <div class="project-preview-stat-value">${project.duration}</div>
                      <div class="project-preview-stat-label">Duration</div>
                    </div>
                  </div>
                  <a href="projects.html#${project.id}" class="project-preview-link">
                    View Project <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    this.container.innerHTML = mapHTML;
  }
  
  bindEvents() {
    // Pin interactions
    this.pins = this.container.querySelectorAll('.project-pin');
    this.cards = this.container.querySelectorAll('.project-preview-card');
    
    this.pins.forEach(pin => {
      // Click to toggle
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activatePin(pin);
      });
      
      // Hover for desktop
      if (!window.matchMedia('(pointer: coarse)').matches) {
        pin.addEventListener('mouseenter', () => {
          this.showCard(pin);
        });
        
        pin.addEventListener('mouseleave', () => {
          if (this.activePin !== pin) {
            this.hideCard(pin);
          }
        });
      }
    });
    
    // Close cards when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.project-pin')) {
        this.deactivateAll();
      }
    });
    
    // Legend filter
    const legendItems = this.container.querySelectorAll('.map-legend-item');
    legendItems.forEach(item => {
      item.addEventListener('click', () => {
        const filter = item.dataset.filter;
        this.filterPins(filter);
      });
    });
    
    // Map controls
    const controlBtns = this.container.querySelectorAll('.map-control-btn');
    controlBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleControl(action);
      });
    });
  }
  
  activatePin(pin) {
    // Deactivate current
    if (this.activePin) {
      this.activePin.classList.remove('active');
      this.hideCard(this.activePin);
    }
    
    // Activate new
    this.activePin = pin;
    pin.classList.add('active');
    this.showCard(pin);
    
    // Reset rotation timer
    if (this.options.autoRotate) {
      this.resetRotationTimer();
    }
  }
  
  deactivateAll() {
    if (this.activePin) {
      this.activePin.classList.remove('active');
      this.hideCard(this.activePin);
      this.activePin = null;
    }
  }
  
  showCard(pin) {
    const projectId = pin.dataset.projectId;
    const card = this.container.querySelector(`.project-preview-card[data-card-for="${projectId}"]`);
    
    if (card) {
      // Hide other cards
      this.cards.forEach(c => c.classList.remove('active'));
      
      // Show this card
      card.classList.add('active');
      this.activeCard = card;
    }
  }
  
  hideCard(pin) {
    const projectId = pin.dataset.projectId;
    const card = this.container.querySelector(`.project-preview-card[data-card-for="${projectId}"]`);
    
    if (card) {
      card.classList.remove('active');
    }
  }
  
  filterPins(category) {
    this.pins.forEach(pin => {
      if (category === 'all' || pin.dataset.category === category) {
        pin.style.opacity = '1';
        pin.style.transform = 'scale(1)';
        pin.style.pointerEvents = 'auto';
      } else {
        pin.style.opacity = '0.3';
        pin.style.transform = 'scale(0.8)';
        pin.style.pointerEvents = 'none';
      }
    });
  }
  
  handleControl(action) {
    switch (action) {
      case 'reset':
        this.deactivateAll();
        this.filterPins('all');
        break;
      case 'fullscreen':
        this.toggleFullscreen();
        break;
    }
  }
  
  toggleFullscreen() {
    const map = this.container.querySelector('.project-map-wrapper');
    
    if (!document.fullscreenElement) {
      map.requestFullscreen?.().catch(err => {
        console.warn('Fullscreen not supported:', err);
      });
    } else {
      document.exitFullscreen?.();
    }
  }
  
  startEntranceAnimation() {
    // Animate pins entrance
    this.pins.forEach((pin, index) => {
      pin.style.opacity = '0';
      pin.style.transform = 'scale(0) translateY(20px)';
      
      setTimeout(() => {
        pin.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        pin.style.opacity = '1';
        pin.style.transform = 'scale(1) translateY(0)';
      }, 500 + (index * 150));
    });
  }
  
  startAutoRotation() {
    this.rotationTimer = setInterval(() => {
      this.projectIndex = (this.projectIndex + 1) % this.pins.length;
      this.activatePin(this.pins[this.projectIndex]);
    }, this.options.rotationInterval);
  }
  
  resetRotationTimer() {
    clearInterval(this.rotationTimer);
    this.startAutoRotation();
  }
  
  destroy() {
    clearInterval(this.rotationTimer);
    this.container.innerHTML = '';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if map container exists, if not create it
  let mapContainer = document.getElementById('interactive-map-container');
  
  if (!mapContainer) {
    // Insert after projects section
    const projectsSection = document.getElementById('masonry-portfolio');
    if (projectsSection) {
      mapContainer = document.createElement('div');
      mapContainer.id = 'interactive-map-container';
      projectsSection.after(mapContainer);
    }
  }
  
  if (mapContainer) {
    window.projectMap = new InteractiveProjectMap('#interactive-map-container', {
      autoRotate: true,
      rotationInterval: 6000
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveProjectMap;
}
