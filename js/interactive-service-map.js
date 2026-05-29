/**
 * v71.0: Interactive Service Area Map
 * Fortune 500 Coverage Visualization
 */

(function() {
  'use strict';

  const ServiceMap = {
    config: {
      animationDuration: 400,
      pulseInterval: 2000
    },

    data: {
      regions: [
        {
          id: 'western-cape',
          name: 'Western Cape',
          projects: 42,
          value: 'R18M',
          description: 'Our headquarters location with the highest concentration of projects including Cape Town CBD, Atlantic Seaboard, and Southern Suburbs.',
          coordinates: { x: 22, y: 78 },
          featured: [
            { name: 'Cape Town Luxury Estate', location: 'Camps Bay', thumb: 'Hero_1.png' },
            { name: 'Waterfront Commercial', location: 'V&A Waterfront', thumb: 'Hero_2.png' }
          ]
        },
        {
          id: 'gauteng',
          name: 'Gauteng',
          projects: 56,
          value: 'R24M',
          description: 'Major commercial and residential developments across Johannesburg and Pretoria metropolitan areas.',
          coordinates: { x: 62, y: 28 },
          featured: [
            { name: 'Sandton Towers', location: 'Sandton', thumb: 'Campaign_4.png' },
            { name: 'Pretoria Central', location: 'Pretoria', thumb: 'Campaign_5.png' }
          ]
        },
        {
          id: 'kwazulu-natal',
          name: 'KwaZulu-Natal',
          projects: 28,
          value: 'R12M',
          description: 'Coastal developments and inland projects throughout Durban and surrounding areas.',
          coordinates: { x: 72, y: 52 },
          featured: [
            { name: 'Umhlanga Heights', location: 'Umhlanga', thumb: 'Hero_3.png' },
            { name: 'Ballito Bay', location: 'Ballito', thumb: 'Hero_1.png' }
          ]
        },
        {
          id: 'eastern-cape',
          name: 'Eastern Cape',
          projects: 15,
          value: 'R6M',
          description: 'Growing portfolio of projects in Gqeberha (Port Elizabeth) and East London.',
          coordinates: { x: 58, y: 72 },
          featured: [
            { name: 'Summerstrand Complex', location: 'Gqeberha', thumb: 'Campaign_5.png' }
          ]
        },
        {
          id: 'mpumalanga',
          name: 'Mpumalanga',
          projects: 9,
          value: 'R3.5M',
          description: 'Select projects in Mbombela and surrounding areas.',
          coordinates: { x: 70, y: 38 },
          featured: [
            { name: 'Nelspruit Residences', location: 'Mbombela', thumb: 'Hero_2.png' }
          ]
        }
      ]
    },

    init() {
      this.container = document.querySelector('.interactive-map-wrapper');
      if (!this.container) return;

      this.mapArea = this.container.querySelector('.map-display-area');
      this.infoPanel = this.container.querySelector('.map-info-panel');
      this.chipsContainer = this.container.querySelector('.map-regions-sidebar');

      this.renderMarkers();
      this.renderChips();
      this.bindEvents();
      this.animateEntry();
    },

    renderMarkers() {
      this.data.regions.forEach(region => {
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.dataset.region = region.id;
        marker.style.left = region.coordinates.x + '%';
        marker.style.top = region.coordinates.y + '%';

        marker.innerHTML = `
          <div class="map-marker-pulse"></div>
          <div class="map-marker-pin"></div>
          <div class="map-marker-label">${region.name}</div>
        `;

        this.mapArea.appendChild(marker);
      });
    },

    renderChips() {
      if (!this.chipsContainer) return;

      this.chipsContainer.innerHTML = this.data.regions.map(region => `
        <div class="region-chip" data-region="${region.id}">
          <span class="region-chip-dot"></span>
          <span class="region-chip-name">${region.name}</span>
          <span class="region-chip-count">${region.projects}</span>
        </div>
      `).join('');
    },

    bindEvents() {
      // Marker clicks
      this.mapArea.querySelectorAll('.map-marker').forEach(marker => {
        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          const regionId = marker.dataset.region;
          this.selectRegion(regionId);
        });

        marker.addEventListener('mouseenter', () => {
          marker.classList.add('hover');
        });

        marker.addEventListener('mouseleave', () => {
          marker.classList.remove('hover');
        });
      });

      // Chip clicks
      this.chipsContainer?.querySelectorAll('.region-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const regionId = chip.dataset.region;
          this.selectRegion(regionId);
        });
      });

      // Close panel on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.interactive-map-wrapper')) {
          this.closePanel();
        }
      });

      // Map path interactions
      const mapPaths = this.container.querySelectorAll('.sa-map-svg path');
      mapPaths.forEach((path, index) => {
        if (this.data.regions[index]) {
          path.dataset.region = this.data.regions[index].id;
          path.addEventListener('click', () => {
            this.selectRegion(this.data.regions[index].id);
          });
        }
      });
    },

    selectRegion(regionId) {
      const region = this.data.regions.find(r => r.id === regionId);
      if (!region) return;

      // Update active states
      this.container.querySelectorAll('.map-marker, .region-chip, .sa-map-svg path').forEach(el => {
        el.classList.remove('active');
      });

      this.container.querySelectorAll(`[data-region="${regionId}"]`).forEach(el => {
        el.classList.add('active');
      });

      // Update info panel
      this.updateInfoPanel(region);
      this.openPanel();
    },

    updateInfoPanel(region) {
      if (!this.infoPanel) return;

      const featuredHTML = region.featured.map(p => `
        <div class="map-info-project-item">
          <img src="assets/02_Website_Heroes/${p.thumb}" alt="${p.name}" class="map-info-project-thumb">
          <div class="map-info-project-details">
            <div class="map-info-project-name">${p.name}</div>
            <div class="map-info-project-location">${p.location}</div>
          </div>
        </div>
      `).join('');

      this.infoPanel.innerHTML = `
        <div class="map-info-header">
          <div class="map-info-icon">📍</div>
          <div>
            <div class="map-info-title">${region.name}</div>
            <div class="map-info-subtitle">South Africa</div>
          </div>
        </div>
        <div class="map-info-stats">
          <div class="map-info-stat">
            <div class="map-info-stat-value">${region.projects}</div>
            <div class="map-info-stat-label">Projects</div>
          </div>
          <div class="map-info-stat">
            <div class="map-info-stat-value">${region.value}</div>
            <div class="map-info-stat-label">Value</div>
          </div>
        </div>
        <div class="map-info-description">${region.description}</div>
        <div class="map-info-projects">
          <div class="map-info-projects-title">Featured Projects</div>
          <div class="map-info-project-list">
            ${featuredHTML}
          </div>
        </div>
        <div class="map-info-cta">
          <a href="projects.html" class="btn">View Projects</a>
          <a href="contact.html" class="btn ghost">Contact Us</a>
        </div>
      `;
    },

    openPanel() {
      this.infoPanel?.classList.add('active');
    },

    closePanel() {
      this.infoPanel?.classList.remove('active');
      this.container?.querySelectorAll('.active').forEach(el => {
        el.classList.remove('active');
      });
    },

    animateEntry() {
      const markers = this.container.querySelectorAll('.map-marker');
      markers.forEach((marker, i) => {
        marker.style.opacity = '0';
        marker.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
          marker.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          marker.style.opacity = '1';
          marker.style.transform = 'translate(-50%, -100%) scale(1)';
        }, i * 150);
      });
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ServiceMap.init());
  } else {
    ServiceMap.init();
  }

  // Expose to global scope
  window.BuildBridgeMap = ServiceMap;
})();
