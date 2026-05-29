/**
 * BuildBridge - Interactive Project Map Pro
 * Fortune 500 Quality Map Integration
 */

class InteractiveProjectMapPro {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.options = {
      zoomMin: 0.8,
      zoomMax: 3,
      initialZoom: 1,
      centerX: 50,
      centerY: 50,
      animationDuration: 800,
      ...options
    };
    
    this.state = {
      zoom: this.options.initialZoom,
      panX: 0,
      panY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      activeProject: null,
      activeFilters: ['residential', 'commercial', 'industrial'],
      projects: []
    };
    
    this.projects = [
      {
        id: 1,
        title: 'Cape Town Residential Complex',
        location: 'Cape Town, Western Cape',
        type: 'residential',
        value: 'R12.5M',
        year: '2024',
        x: 25,
        y: 75,
        image: 'assets/02_Website_Heroes/Hero_1.png'
      },
      {
        id: 2,
        title: 'Johannesburg Corporate HQ',
        location: 'Sandton, Gauteng',
        type: 'commercial',
        value: 'R45M',
        year: '2024',
        x: 60,
        y: 35,
        image: 'assets/03_Social_Campaign/Campaign_4.png'
      },
      {
        id: 3,
        title: 'Durban Luxury Villa Estate',
        location: 'Umhlanga, KwaZulu-Natal',
        type: 'residential',
        value: 'R28M',
        year: '2023',
        x: 72,
        y: 55,
        image: 'assets/03_Social_Campaign/Campaign_5.png'
      },
      {
        id: 4,
        title: 'Port Elizabeth Industrial Park',
        location: 'Gqeberha, Eastern Cape',
        type: 'industrial',
        value: 'R67M',
        year: '2023',
        x: 45,
        y: 68,
        image: 'assets/02_Website_Heroes/Hero_2.png'
      },
      {
        id: 5,
        title: 'Pretoria Office Towers',
        location: 'Menlyn, Gauteng',
        type: 'commercial',
        value: 'R89M',
        year: '2024',
        x: 58,
        y: 28,
        image: 'assets/02_Website_Heroes/Hero_3.png'
      },
      {
        id: 6,
        title: 'Garden Route Eco Estate',
        location: 'George, Western Cape',
        type: 'residential',
        value: 'R34M',
        year: '2024',
        x: 30,
        y: 80,
        image: 'assets/03_Social_Campaign/Campaign_1.png'
      },
      {
        id: 7,
        title: 'Bloemfontein Shopping Centre',
        location: 'Bloemfontein, Free State',
        type: 'commercial',
        value: 'R52M',
        year: '2023',
        x: 48,
        y: 50,
        image: 'assets/03_Social_Campaign/Campaign_2.png'
      },
      {
        id: 8,
        title: 'Polokwane Manufacturing Plant',
        location: 'Polokwane, Limpopo',
        type: 'industrial',
        value: 'R95M',
        year: '2024',
        x: 55,
        y: 15,
        image: 'assets/03_Social_Campaign/Campaign_3.png'
      }
    ];
    
    this.init();
  }
  
  init() {
    this.render();
    this.setupEventListeners();
    this.setupMapInteractions();
    this.animateEntry();
    
    // Simulate loading delay
    setTimeout(() => {
      const loading = this.container.querySelector('.map-pro-loading');
      if (loading) loading.classList.add('hidden');
    }, 800);
  }
  
  render() {
    const projectListHTML = this.projects.map(p => `
      <div class="panel-pro-item" data-project-id="${p.id}">
        <img src="${p.image}" alt="" class="panel-pro-item-image" loading="lazy">
        <div class="panel-pro-item-info">
          <h4 class="panel-pro-item-title">${p.title}</h4>
          <p class="panel-pro-item-location">📍 ${p.location}</p>
          <div class="panel-pro-item-meta">
            <span class="panel-pro-item-type">${p.type}</span>
            <span class="panel-pro-item-value">${p.value}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    const markersHTML = this.projects.map(p => `
      <div class="map-marker-pro" data-project-id="${p.id}" data-type="${p.type}" style="left: ${p.x}%; top: ${p.y}%;">
        <div class="marker-pro-pulse"></div>
        <div class="marker-pro-pulse"></div>
        <div class="marker-pro-dot"></div>
        <span class="marker-pro-label">${p.title}</span>
        <div class="marker-pro-tooltip">
          <img src="${p.image}" alt="" class="tooltip-pro-image" loading="lazy">
          <h4 class="tooltip-pro-title">${p.title}</h4>
          <p class="tooltip-pro-location">📍 ${p.location}</p>
          <div class="tooltip-pro-stats">
            <div class="tooltip-pro-stat">
              <span class="tooltip-pro-stat-value">${p.value}</span>
              <span class="tooltip-pro-stat-label">Value</span>
            </div>
            <div class="tooltip-pro-stat">
              <span class="tooltip-pro-stat-value">${p.year}</span>
              <span class="tooltip-pro-stat-label">Year</span>
            </div>
            <div class="tooltip-pro-stat">
              <span class="tooltip-pro-stat-value">${p.type}</span>
              <span class="tooltip-pro-stat-label">Type</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    this.container.innerHTML = `
      <div class="project-map-pro-wrapper">
        <!-- Loading State -->
        <div class="map-pro-loading">
          <div class="map-pro-loading-spinner"></div>
          <p class="map-pro-loading-text">Loading project map...</p>
        </div>
        
        <!-- Map Canvas -->
        <div class="project-map-pro-canvas" id="mapCanvas${this.container.id}">
          <!-- SVG Background -->
          <svg class="project-map-pro-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <!-- Grid -->
            <defs>
              <pattern id="grid${this.container.id}" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" class="map-grid"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid${this.container.id})" opacity="0.5"/>
            
            <!-- South Africa Outline (simplified) -->
            <path class="map-base" d="M45,15 L60,12 L70,18 L75,25 L72,35 L68,45 L70,55 L65,65 L60,75 L50,82 L40,85 L30,82 L22,75 L18,65 L20,55 L25,45 L30,35 L35,25 L40,18 Z"/>
            
            <!-- Regions -->
            <path class="map-region" data-region="gauteng" d="M55,25 L62,22 L65,28 L62,35 L58,38 L54,35 L52,28 Z"/>
            <path class="map-region" data-region="westerncape" d="M20,55 L25,50 L32,52 L35,60 L32,72 L25,78 L18,72 L15,62 Z"/>
            <path class="map-region" data-region="kwazulunatal" d="M68,45 L75,42 L78,52 L75,60 L70,62 L66,55 L65,48 Z"/>
            <path class="map-region" data-region="easterncape" d="M38,55 L50,52 L58,58 L55,70 L48,78 L38,75 L32,65 Z"/>
            
            <!-- Connection Lines -->
            <g class="map-connections-pro">
              <path class="connection-pro-line" d="M25,75 Q40,60 60,35"/>
              <path class="connection-pro-line" d="M60,35 Q65,45 72,55"/>
              <path class="connection-pro-line" d="M45,68 Q55,50 58,28"/>
            </g>
          </svg>
          
          <!-- Markers -->
          ${markersHTML}
        </div>
        
        <!-- Search Bar -->
        <div class="map-pro-search">
          <span class="map-pro-search-icon">🔍</span>
          <input type="text" placeholder="Search projects..." id="mapSearch${this.container.id}">
        </div>
        
        <!-- Stats Overlay -->
        <div class="map-pro-stats-overlay">
          <div class="map-pro-stat-card">
            <div class="map-pro-stat-value">${this.projects.length}</div>
            <div class="map-pro-stat-label">Total Projects</div>
          </div>
          <div class="map-pro-stat-card">
            <div class="map-pro-stat-value">9</div>
            <div class="map-pro-stat-label">Provinces</div>
          </div>
          <div class="map-pro-stat-card">
            <div class="map-pro-stat-value">R422M</div>
            <div class="map-pro-stat-label">Total Value</div>
          </div>
        </div>
        
        <!-- Map Controls -->
        <div class="map-pro-controls">
          <button class="map-control-btn" id="zoomIn${this.container.id}" title="Zoom In">+</button>
          <button class="map-control-btn" id="zoomOut${this.container.id}" title="Zoom Out">−</button>
          <button class="map-control-btn" id="resetView${this.container.id}" title="Reset View">⌖</button>
        </div>
        
        <!-- Legend -->
        <div class="map-pro-legend">
          <h4>Project Types</h4>
          <div class="legend-pro-items">
            <div class="legend-pro-item" data-filter="residential">
              <div class="legend-pro-dot residential"></div>
              <span class="legend-pro-label">Residential</span>
              <span class="legend-pro-count">${this.projects.filter(p => p.type === 'residential').length}</span>
            </div>
            <div class="legend-pro-item" data-filter="commercial">
              <div class="legend-pro-dot commercial"></div>
              <span class="legend-pro-label">Commercial</span>
              <span class="legend-pro-count">${this.projects.filter(p => p.type === 'commercial').length}</span>
            </div>
            <div class="legend-pro-item" data-filter="industrial">
              <div class="legend-pro-dot industrial"></div>
              <span class="legend-pro-label">Industrial</span>
              <span class="legend-pro-count">${this.projects.filter(p => p.type === 'industrial').length}</span>
            </div>
          </div>
        </div>
        
        <!-- Project Panel -->
        <div class="project-pro-panel" id="projectPanel${this.container.id}">
          <div class="panel-pro-header">
            <h3>Project Locations</h3>
            <p class="panel-pro-count">${this.projects.length} projects across South Africa</p>
            <button class="panel-pro-close" id="closePanel${this.container.id}">×</button>
          </div>
          <div class="panel-pro-list">
            ${projectListHTML}
          </div>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Search functionality
    const searchInput = this.container.querySelector(`#mapSearch${this.container.id}`);
    searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    // Legend filter toggles
    this.container.querySelectorAll('.legend-pro-item').forEach(item => {
      item.addEventListener('click', () => {
        const filter = item.dataset.filter;
        this.toggleFilter(filter, item);
      });
    });
    
    // Marker clicks
    this.container.querySelectorAll('.map-marker-pro').forEach(marker => {
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        const projectId = parseInt(marker.dataset.projectId);
        this.selectProject(projectId);
      });
    });
    
    // Project panel items
    this.container.querySelectorAll('.panel-pro-item').forEach(item => {
      item.addEventListener('click', () => {
        const projectId = parseInt(item.dataset.projectId);
        this.selectProject(projectId);
      });
    });
    
    // Close panel
    const closeBtn = this.container.querySelector(`#closePanel${this.container.id}`);
    closeBtn?.addEventListener('click', () => this.closePanel());
    
    // Zoom controls
    const zoomIn = this.container.querySelector(`#zoomIn${this.container.id}`);
    const zoomOut = this.container.querySelector(`#zoomOut${this.container.id}`);
    const resetView = this.container.querySelector(`#resetView${this.container.id}`);
    
    zoomIn?.addEventListener('click', () => this.zoom(0.2));
    zoomOut?.addEventListener('click', () => this.zoom(-0.2));
    resetView?.addEventListener('click', () => this.resetView());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closePanel();
    });
  }
  
  setupMapInteractions() {
    const canvas = this.container.querySelector('.project-map-pro-canvas');
    if (!canvas) return;
    
    // Pan functionality
    canvas.addEventListener('mousedown', (e) => {
      if (e.target.closest('.map-marker-pro')) return;
      this.state.isDragging = true;
      this.state.dragStartX = e.clientX - this.state.panX;
      this.state.dragStartY = e.clientY - this.state.panY;
      canvas.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.state.isDragging) return;
      this.state.panX = e.clientX - this.state.dragStartX;
      this.state.panY = e.clientY - this.state.dragStartY;
      this.updateTransform();
    });
    
    document.addEventListener('mouseup', () => {
      this.state.isDragging = false;
      canvas.style.cursor = 'grab';
    });
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.state.isDragging = true;
        this.state.dragStartX = e.touches[0].clientX - this.state.panX;
        this.state.dragStartY = e.touches[0].clientY - this.state.panY;
      }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
      if (this.state.isDragging && e.touches.length === 1) {
        this.state.panX = e.touches[0].clientX - this.state.dragStartX;
        this.state.panY = e.touches[0].clientY - this.state.dragStartY;
        this.updateTransform();
      }
    }, { passive: true });
    
    canvas.addEventListener('touchend', () => {
      this.state.isDragging = false;
    });
    
    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoom(delta);
    }, { passive: false });
  }
  
  zoom(delta) {
    const newZoom = Math.max(
      this.options.zoomMin,
      Math.min(this.options.zoomMax, this.state.zoom + delta)
    );
    this.state.zoom = newZoom;
    this.updateTransform();
  }
  
  resetView() {
    this.state.zoom = this.options.initialZoom;
    this.state.panX = 0;
    this.state.panY = 0;
    this.updateTransform();
  }
  
  updateTransform() {
    const canvas = this.container.querySelector('.project-map-pro-canvas');
    if (!canvas) return;
    
    canvas.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
  }
  
  toggleFilter(filter, element) {
    const index = this.state.activeFilters.indexOf(filter);
    
    if (index > -1) {
      this.state.activeFilters.splice(index, 1);
      element.classList.add('inactive');
    } else {
      this.state.activeFilters.push(filter);
      element.classList.remove('inactive');
    }
    
    this.updateMarkers();
  }
  
  updateMarkers() {
    this.container.querySelectorAll('.map-marker-pro').forEach(marker => {
      const type = marker.dataset.type;
      if (this.state.activeFilters.includes(type)) {
        marker.style.opacity = '1';
        marker.style.pointerEvents = 'auto';
      } else {
        marker.style.opacity = '0.2';
        marker.style.pointerEvents = 'none';
      }
    });
  }
  
  handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    
    this.container.querySelectorAll('.map-marker-pro').forEach(marker => {
      const projectId = marker.dataset.projectId;
      const project = this.projects.find(p => p.id === parseInt(projectId));
      
      if (!project) return;
      
      const match = project.title.toLowerCase().includes(lowerQuery) ||
                    project.location.toLowerCase().includes(lowerQuery);
      
      marker.style.opacity = match ? '1' : '0.2';
      marker.style.pointerEvents = match ? 'auto' : 'none';
    });
    
    // Also filter panel items
    this.container.querySelectorAll('.panel-pro-item').forEach(item => {
      const projectId = item.dataset.projectId;
      const project = this.projects.find(p => p.id === parseInt(projectId));
      
      if (!project) return;
      
      const match = project.title.toLowerCase().includes(lowerQuery) ||
                    project.location.toLowerCase().includes(lowerQuery);
      
      item.style.display = match ? 'flex' : 'none';
    });
  }
  
  selectProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    this.state.activeProject = projectId;
    
    // Show panel on mobile
    const panel = this.container.querySelector(`#projectPanel${this.container.id}`);
    if (panel && window.innerWidth < 768) {
      panel.classList.add('visible');
    }
    
    // Highlight marker
    this.container.querySelectorAll('.map-marker-pro').forEach(marker => {
      marker.classList.remove('active');
      if (parseInt(marker.dataset.projectId) === projectId) {
        marker.classList.add('active');
        
        // Center map on marker
        const rect = marker.getBoundingClientRect();
        const canvasRect = this.container.querySelector('.project-map-pro-canvas').getBoundingClientRect();
        
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        const markerX = (project.x / 100) * canvasRect.width * this.state.zoom + this.state.panX;
        const markerY = (project.y / 100) * canvasRect.height * this.state.zoom + this.state.panY;
        
        this.state.panX += centerX - markerX;
        this.state.panY += centerY - markerY;
        this.updateTransform();
      }
    });
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('projectSelected', { detail: project }));
  }
  
  closePanel() {
    const panel = this.container.querySelector(`#projectPanel${this.container.id}`);
    if (panel) panel.classList.remove('visible');
    this.state.activeProject = null;
    
    this.container.querySelectorAll('.map-marker-pro').forEach(marker => {
      marker.classList.remove('active');
    });
  }
  
  animateEntry() {
    const markers = this.container.querySelectorAll('.map-marker-pro');
    
    markers.forEach((marker, index) => {
      marker.style.opacity = '0';
      marker.style.transform = 'translate(-50%, -50%) scale(0)';
      
      setTimeout(() => {
        marker.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        marker.style.opacity = '1';
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 300 + index * 100);
    });
  }
  
  // Public API methods
  getProjectById(id) {
    return this.projects.find(p => p.id === id);
  }
  
  getProjectsByType(type) {
    return this.projects.filter(p => p.type === type);
  }
  
  getProjectsByRegion(region) {
    // Simplified region matching
    return this.projects.filter(p => {
      const regionMap = {
        'gauteng': ['johannesburg', 'pretoria', 'sandton', 'menlyn'],
        'westerncape': ['cape town', 'george', 'garden route'],
        'kwazulunatal': ['durban', 'umhlanga'],
        'easterncape': ['port elizabeth', 'gqeberha'],
        'freestate': ['bloemfontein'],
        'limpopo': ['polokwane']
      };
      
      const searchTerms = regionMap[region] || [region];
      return searchTerms.some(term => 
        p.location.toLowerCase().includes(term.toLowerCase())
      );
    });
  }
}

// Auto-initialize maps on page load
document.addEventListener('DOMContentLoaded', () => {
  const mapContainers = document.querySelectorAll('[data-project-map-pro]');
  mapContainers.forEach(container => {
    new InteractiveProjectMapPro(container.id);
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveProjectMapPro;
}
