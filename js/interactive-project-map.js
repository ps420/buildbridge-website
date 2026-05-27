/**
 * BuildBridge Interactive Project Map
 * Fortune 500 Visual Project Location System
 */

class ProjectMap {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.pins = [];
    this.activePin = null;
    this.currentFilter = 'all';
    this.zoomLevel = 1;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.panOffset = { x: 0, y: 0 };
    
    // Project data - BuildBridge projects across South Africa
    this.projects = [
      {
        id: 1,
        name: "Cape Town Luxury Estate",
        location: "Camps Bay, Cape Town",
        province: "western-cape",
        category: "luxury",
        lat: 30,
        lng: 25,
        value: "R12M",
        duration: "8 months",
        image: "assets/02_Website_Heroes/Hero_1.png",
        description: "A stunning 5-bedroom luxury residence featuring modern architecture.",
        completion: "2025"
      },
      {
        id: 2,
        name: "Johannesburg Corporate HQ",
        location: "Sandton, Johannesburg",
        province: "gauteng",
        category: "commercial",
        lat: 20,
        lng: 55,
        value: "R45M",
        duration: "18 months",
        image: "assets/02_Website_Heroes/Hero_2.png",
        description: "12-story commercial development in Sandton featuring Class A office space.",
        completion: "2024"
      },
      {
        id: 3,
        name: "Durban Waterfront Complex",
        location: "Umhlanga, Durban",
        province: "kwazulu-natal",
        category: "commercial",
        lat: 35,
        lng: 75,
        value: "R28M",
        duration: "14 months",
        image: "assets/03_Social_Campaign/Campaign_4.png",
        description: "Mixed-use development featuring luxury apartments and retail spaces.",
        completion: "2024"
      },
      {
        id: 4,
        name: "Pretoria Industrial Park",
        location: "Silverton, Pretoria",
        province: "gauteng",
        category: "industrial",
        lat: 18,
        lng: 58,
        value: "R65M",
        duration: "24 months",
        image: "assets/03_Social_Campaign/Campaign_5.png",
        description: "Large-scale industrial facility with warehouse automation.",
        completion: "2025"
      },
      {
        id: 5,
        name: "Stellenbosch Wine Estate",
        location: "Stellenbosch, Western Cape",
        province: "western-cape",
        category: "luxury",
        lat: 32,
        lng: 28,
        value: "R22M",
        duration: "12 months",
        image: "assets/02_Website_Heroes/Hero_1.png",
        description: "Luxury wine estate renovation with modern guest facilities.",
        completion: "2024"
      },
      {
        id: 6,
        name: "Port Elizabeth Retail Center",
        location: "Summerstrand, Port Elizabeth",
        province: "eastern-cape",
        category: "commercial",
        lat: 55,
        lng: 65,
        value: "R35M",
        duration: "16 months",
        image: "assets/02_Website_Heroes/Hero_2.png",
        description: "Modern retail development with parking and entertainment facilities.",
        completion: "2023"
      },
      {
        id: 7,
        name: "Bloemfontein Residential Complex",
        location: "Westdene, Bloemfontein",
        province: "free-state",
        category: "residential",
        lat: 42,
        lng: 42,
        value: "R18M",
        duration: "10 months",
        image: "assets/03_Social_Campaign/Campaign_4.png",
        description: "Multi-unit residential complex with modern amenities.",
        completion: "2024"
      },
      {
        id: 8,
        name: "Cape Town Office Tower",
        location: "Foreshore, Cape Town",
        province: "western-cape",
        category: "commercial",
        lat: 28,
        lng: 22,
        value: "R85M",
        duration: "30 months",
        image: "assets/02_Website_Heroes/Hero_1.png",
        description: "25-story premium office tower in Cape Town CBD.",
        completion: "2026"
      }
    ];
    
    this.init();
  }
  
  init() {
    this.createMapHTML();
    this.bindEvents();
    this.renderPins();
    this.animateEntrance();
  }
  
  createMapHTML() {
    this.container.innerHTML = `
      <div class="project-map-container">
        <div class="project-map-header">
          <div class="project-map-title">
            <h3>Project Locations</h3>
            <span class="project-map-badge">${this.projects.length} Active</span>
          </div>
          <div class="project-map-filters">
            <button class="project-map-filter active" data-filter="all">All</button>
            <button class="project-map-filter" data-filter="residential">Residential</button>
            <button class="project-map-filter" data-filter="commercial">Commercial</button>
            <button class="project-map-filter" data-filter="industrial">Industrial</button>
            <button class="project-map-filter" data-filter="luxury">Luxury</button>
          </div>
        </div>
        
        <div class="project-map-wrapper">
          <div class="project-map-canvas" id="mapCanvas">
            <div class="sa-map-container">
              <svg class="sa-map" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(201,206,214,0.3)"/>
                    <stop offset="100%" style="stop-color:rgba(201,206,214,0)"/>
                  </linearGradient>
                </defs>
                
                <!-- Western Cape -->
                <path class="province" data-province="western-cape" 
                  d="M15,45 Q12,55 15,65 Q20,70 25,68 Q28,60 25,50 Q22,42 15,45 Z"/>
                
                <!-- Northern Cape -->
                <path class="province" data-province="northern-cape"
                  d="M20,35 L40,35 L42,50 L38,65 L25,68 Q22,60 25,50 Q22,42 20,35 Z"/>
                
                <!-- Eastern Cape -->
                <path class="province" data-province="eastern-cape"
                  d="M38,65 L42,50 L48,55 L55,65 L52,75 L45,78 L38,65 Z"/>
                
                <!-- Free State -->
                <path class="province" data-province="free-state"
                  d="M40,35 L55,35 L58,50 L52,55 L42,50 L40,35 Z"/>
                
                <!-- North West -->
                <path class="province" data-province="north-west"
                  d="M40,35 L55,35 L58,25 L52,22 L42,22 L40,28 L40,35 Z"/>
                
                <!-- Gauteng -->
                <path class="province" data-province="gauteng"
                  d="M55,35 L60,35 L62,42 L58,45 L55,42 L55,35 Z"/>
                
                <!-- Mpumalanga -->
                <path class="province" data-province="mpumalanga"
                  d="M58,25 L72,25 L75,35 L68,42 L62,38 L60,32 L58,25 Z"/>
                
                <!-- Limpopo -->
                <path class="province" data-province="limpopo"
                  d="M52,22 L58,18 L72,22 L75,28 L72,25 L58,25 L52,22 Z"/>
                
                <!-- KwaZulu-Natal -->
                <path class="province" data-province="kwazulu-natal"
                  d="M58,50 L68,45 L78,55 L72,70 L65,72 L55,65 L58,50 Z"/>
                
                <!-- Connection lines -->
                <g class="map-connections">
                  <line class="connection-line" x1="25" y1="55" x2="55" y2="38"/>
                  <line class="connection-line" x1="55" y1="38" x2="75" y2="58"/>
                  <line class="connection-line" x1="25" y1="55" x2="75" y2="58"/>
                  <line class="connection-line" x1="28" y1="32" x2="55" y2="38"/>
                </g>
              </svg>
            </div>
            
            <!-- Dynamic Pins Container -->
            <div class="pins-container" id="pinsContainer"></div>
          </div>
          
          <!-- Stats Overlay -->
          <div class="map-stats-overlay">
            <div class="map-stat-box">
              <div class="map-stat-box-value">${this.projects.length}</div>
              <div class="map-stat-box-label">Projects</div>
            </div>
            <div class="map-stat-box">
              <div class="map-stat-box-value">R311M</div>
              <div class="map-stat-box-label">Total Value</div>
            </div>
            <div class="map-stat-box">
              <div class="map-stat-box-value">9</div>
              <div class="map-stat-box-label">Provinces</div>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="project-map-legend">
            <h4>Categories</h4>
            <div class="legend-item">
              <span class="legend-marker residential"></span>
              <span>Residential</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker commercial"></span>
              <span>Commercial</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker industrial"></span>
              <span>Industrial</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker luxury"></span>
              <span>Luxury</span>
            </div>
          </div>
          
          <!-- Zoom Controls -->
          <div class="map-zoom-controls">
            <button class="map-zoom-btn" id="zoomIn" aria-label="Zoom in">+</button>
            <button class="map-zoom-btn" id="zoomOut" aria-label="Zoom out">−</button>
          </div>
          
          <!-- Sidebar Toggle -->
          <button class="sidebar-toggle" id="sidebarToggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            View List
          </button>
          
          <!-- Project Info Card -->
          <div class="project-info-card" id="projectInfoCard">
            <div class="project-info-image">
              <img src="" alt="" id="infoCardImage">
            </div>
            <span class="project-info-category" id="infoCardCategory"></span>
            <h4 class="project-info-title" id="infoCardTitle"></h4>
            <div class="project-info-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span id="infoCardLocation"></span>
            </div>
            <div class="project-info-stats">
              <div class="project-info-stat">
                <div class="project-info-stat-value" id="infoCardValue"></div>
                <div class="project-info-stat-label">Value</div>
              </div>
              <div class="project-info-stat">
                <div class="project-info-stat-value" id="infoCardDuration"></div>
                <div class="project-info-stat-label">Duration</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar Panel -->
        <div class="project-map-sidebar" id="projectSidebar">
          <div class="project-map-sidebar-header">
            <h4>All Projects</h4>
            <button class="project-map-sidebar-close" id="sidebarClose">&times;</button>
          </div>
          <div class="project-list" id="projectList"></div>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Filter buttons
    this.container.querySelectorAll('.project-map-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.project-map-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.filterPins();
      });
    });
    
    // Zoom controls
    this.container.querySelector('#zoomIn').addEventListener('click', () => this.zoom(0.2));
    this.container.querySelector('#zoomOut').addEventListener('click', () => this.zoom(-0.2));
    
    // Sidebar toggle
    this.container.querySelector('#sidebarToggle').addEventListener('click', () => {
      this.container.querySelector('#projectSidebar').classList.add('active');
      this.renderProjectList();
    });
    
    this.container.querySelector('#sidebarClose').addEventListener('click', () => {
      this.container.querySelector('#projectSidebar').classList.remove('active');
    });
    
    // Province hover effects
    this.container.querySelectorAll('.province').forEach(province => {
      province.addEventListener('mouseenter', () => {
        province.classList.add('province-active');
      });
      province.addEventListener('mouseleave', () => {
        province.classList.remove('province-active');
      });
    });
    
    // Close info card when clicking outside
    this.container.querySelector('.project-map-wrapper').addEventListener('click', (e) => {
      if (!e.target.closest('.project-info-card') && !e.target.closest('.project-pin')) {
        this.hideInfoCard();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideInfoCard();
        this.container.querySelector('#projectSidebar').classList.remove('active');
      }
    });
  }
  
  renderPins() {
    const container = this.container.querySelector('#pinsContainer');
    container.innerHTML = '';
    
    this.projects.forEach((project, index) => {
      const pin = document.createElement('div');
      pin.className = `project-pin ${project.category}`;
      pin.dataset.projectId = project.id;
      pin.style.left = `${project.lng}%`;
      pin.style.top = `${project.lat}%`;
      pin.style.animationDelay = `${index * 0.1}s`;
      
      pin.innerHTML = `
        <div class="project-pin-marker"></div>
        <span class="project-pin-value">${project.value}</span>
      `;
      
      pin.addEventListener('click', () => this.showProjectInfo(project));
      pin.addEventListener('mouseenter', () => this.highlightPin(pin));
      pin.addEventListener('mouseleave', () => this.unhighlightPin(pin));
      
      container.appendChild(pin);
      this.pins.push({ element: pin, project });
    });
  }
  
  showProjectInfo(project) {
    const card = this.container.querySelector('#projectInfoCard');
    
    card.querySelector('#infoCardImage').src = project.image;
    card.querySelector('#infoCardImage').alt = project.name;
    card.querySelector('#infoCardCategory').textContent = project.category;
    card.querySelector('#infoCardTitle').textContent = project.name;
    card.querySelector('#infoCardLocation').textContent = project.location;
    card.querySelector('#infoCardValue').textContent = project.value;
    card.querySelector('#infoCardDuration').textContent = project.duration;
    
    card.classList.add('active');
    this.activePin = project.id;
  }
  
  hideInfoCard() {
    this.container.querySelector('#projectInfoCard').classList.remove('active');
    this.activePin = null;
  }
  
  highlightPin(pin) {
    pin.style.zIndex = '100';
    pin.querySelector('.project-pin-marker').style.transform = 'rotate(-45deg) scale(1.3)';
  }
  
  unhighlightPin(pin) {
    if (this.activePin !== parseInt(pin.dataset.projectId)) {
      pin.style.zIndex = '10';
      pin.querySelector('.project-pin-marker').style.transform = 'rotate(-45deg) scale(1)';
    }
  }
  
  filterPins() {
    this.pins.forEach(({ element, project }) => {
      if (this.currentFilter === 'all' || project.category === this.currentFilter) {
        element.style.opacity = '1';
        element.style.transform = 'translate(-50%, -100%) scale(1)';
        element.style.pointerEvents = 'auto';
      } else {
        element.style.opacity = '0.2';
        element.style.transform = 'translate(-50%, -100%) scale(0.8)';
        element.style.pointerEvents = 'none';
      }
    });
  }
  
  zoom(delta) {
    this.zoomLevel = Math.max(0.8, Math.min(2, this.zoomLevel + delta));
    const canvas = this.container.querySelector('#mapCanvas');
    canvas.style.transform = `scale(${this.zoomLevel})`;
    canvas.style.transition = 'transform 0.3s ease';
  }
  
  renderProjectList() {
    const list = this.container.querySelector('#projectList');
    const filtered = this.currentFilter === 'all' 
      ? this.projects 
      : this.projects.filter(p => p.category === this.currentFilter);
    
    list.innerHTML = filtered.map(project => `
      <div class="project-list-item" data-project-id="${project.id}">
        <div class="project-list-thumb">
          <img src="${project.image}" alt="${project.name}">
        </div>
        <div class="project-list-info">
          <h5>${project.name}</h5>
          <p>${project.location}</p>
          <div class="project-list-meta">
            <span>${project.value}</span>
            <span>•</span>
            <span>${project.completion}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    // Bind click events
    list.querySelectorAll('.project-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const projectId = parseInt(item.dataset.projectId);
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
          this.showProjectInfo(project);
          this.container.querySelector('#projectSidebar').classList.remove('active');
        }
      });
    });
  }
  
  animateEntrance() {
    // Animate stats counting
    const statValues = this.container.querySelectorAll('.map-stat-box-value');
    statValues.forEach(stat => {
      const finalValue = stat.textContent;
      const isNumber = !isNaN(parseInt(finalValue));
      
      if (isNumber) {
        const num = parseInt(finalValue);
        let current = 0;
        const increment = num / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= num) {
            stat.textContent = finalValue;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 50);
      }
    });
    
    // Animate pins entrance
    this.pins.forEach(({ element }, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translate(-50%, -80%) scale(0)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translate(-50%, -100%) scale(1)';
      }, 300 + (index * 100));
    });
  }
  
  // Public API methods
  focusProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.showProjectInfo(project);
      
      // Center map on project (simplified)
      const canvas = this.container.querySelector('#mapCanvas');
      canvas.style.transformOrigin = `${project.lng}% ${project.lat}%`;
    }
  }
  
  setFilter(category) {
    this.currentFilter = category;
    this.container.querySelectorAll('.project-map-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === category);
    });
    this.filterPins();
  }
  
  getProjectStats() {
    const categories = {};
    const provinces = {};
    let totalValue = 0;
    
    this.projects.forEach(project => {
      categories[project.category] = (categories[project.category] || 0) + 1;
      provinces[project.province] = (provinces[project.province] || 0) + 1;
      
      const value = parseInt(project.value.replace(/[^0-9]/g, ''));
      if (!isNaN(value)) totalValue += value;
    });
    
    return {
      total: this.projects.length,
      categories,
      provinces,
      totalValue: `R${totalValue}M`
    };
  }
}

// Auto-initialize if element exists
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('projectMap');
  if (mapContainer) {
    window.projectMap = new ProjectMap(mapContainer);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectMap;
}
