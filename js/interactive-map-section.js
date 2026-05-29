/**
 * Interactive Map Section v81.2
 * Fortune 500 Location Showcase
 */

(function() {
  'use strict';

  const InteractiveMap = {
    canvas: null,
    ctx: null,
    locations: [],
    activeLocation: null,
    dots: [],
    animationId: null,
    
    init() {
      this.canvas = document.getElementById('interactiveMap');
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext('2d');
      this.parseLocations();
      this.resizeCanvas();
      this.createBackgroundDots();
      this.bindEvents();
      this.startAnimation();
      
      // Auto-select first location
      if (this.locations.length > 0) {
        this.selectLocation(0);
      }
    },
    
    parseLocations() {
      const locationElements = document.querySelectorAll('.map-location-item');
      this.locations = Array.from(locationElements).map((el, index) => ({
        index,
        element: el,
        name: el.dataset.name || `Location ${index + 1}`,
        x: parseFloat(el.dataset.x) || 50,
        y: parseFloat(el.dataset.y) || 50,
        projects: parseInt(el.dataset.projects, 10) || 0,
        value: el.dataset.value || 'R0',
        status: el.dataset.status || 'Active'
      }));
    },
    
    resizeCanvas() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.createBackgroundDots();
    },
    
    createBackgroundDots() {
      this.dots = [];
      const numDots = Math.floor((this.canvas.width * this.canvas.height) / 8000);
      
      for (let i = 0; i < numDots; i++) {
        this.dots.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
    },
    
    bindEvents() {
      // Location list clicks
      this.locations.forEach((location, index) => {
        location.element.addEventListener('click', () => {
          this.selectLocation(index);
        });
        
        location.element.addEventListener('mouseenter', () => {
          this.hoverLocation(index);
        });
      });
      
      // Canvas clicks
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const clickedLocation = this.locations.find(loc => {
          const distance = Math.sqrt(Math.pow(loc.x - x, 2) + Math.pow(loc.y - y, 2));
          return distance < 8;
        });
        
        if (clickedLocation) {
          this.selectLocation(clickedLocation.index);
        }
      });
      
      // Window resize
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
      
      // Map controls
      document.querySelector('.map-zoom-in')?.addEventListener('click', () => {
        this.zoomMap(1.2);
      });
      
      document.querySelector('.map-zoom-out')?.addEventListener('click', () => {
        this.zoomMap(0.8);
      });
      
      document.querySelector('.map-reset')?.addEventListener('click', () => {
        this.resetMap();
      });
      
      // Close info card
      document.querySelector('.map-info-card-close')?.addEventListener('click', () => {
        document.querySelector('.map-info-card')?.classList.remove('visible');
      });
    },
    
    selectLocation(index) {
      this.activeLocation = this.locations[index];
      
      // Update list
      this.locations.forEach((loc, i) => {
        loc.element.classList.toggle('active', i === index);
      });
      
      // Update info card
      this.updateInfoCard();
      
      // Scroll to location in list on mobile
      if (window.innerWidth <= 1024) {
        this.activeLocation.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    
    hoverLocation(index) {
      // Could add hover effects here
    },
    
    updateInfoCard() {
      const card = document.querySelector('.map-info-card');
      if (!card || !this.activeLocation) return;
      
      const title = card.querySelector('.map-info-card-title');
      const stats = card.querySelectorAll('.map-info-card-stat-value');
      
      if (title) title.textContent = this.activeLocation.name;
      
      // Animate stats
      const statValues = [
        this.activeLocation.projects,
        this.activeLocation.value,
        this.activeLocation.status
      ];
      
      stats.forEach((stat, i) => {
        if (statValues[i] !== undefined) {
          stat.style.opacity = '0';
          setTimeout(() => {
            stat.textContent = statValues[i];
            stat.style.opacity = '1';
          }, 200);
        }
      });
      
      card.classList.add('visible');
    },
    
    startAnimation() {
      const animate = () => {
        this.draw();
        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    },
    
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw background dots
      this.drawBackgroundDots();
      
      // Draw connection lines
      this.drawConnections();
      
      // Draw location markers
      this.drawMarkers();
    },
    
    drawBackgroundDots() {
      this.dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        if (dot.x < 0 || dot.x > this.canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > this.canvas.height) dot.vy *= -1;
        
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(201, 206, 214, ${dot.opacity})`;
        this.ctx.fill();
      });
      
      // Draw connections between nearby dots
      this.dots.forEach((dot, i) => {
        for (let j = i + 1; j < this.dots.length; j++) {
          const other = this.dots[j];
          const distance = Math.sqrt(
            Math.pow(dot.x - other.x, 2) + 
            Math.pow(dot.y - other.y, 2)
          );
          
          if (distance < 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(dot.x, dot.y);
            this.ctx.lineTo(other.x, other.y);
            this.ctx.strokeStyle = `rgba(201, 206, 214, ${0.05 * (1 - distance / 100)})`;
            this.ctx.stroke();
          }
        }
      });
    },
    
    drawConnections() {
      if (this.locations.length < 2) return;
      
      this.ctx.setLineDash([8, 8]);
      this.ctx.lineWidth = 1;
      
      for (let i = 0; i < this.locations.length - 1; i++) {
        const locA = this.locations[i];
        const locB = this.locations[i + 1];
        
        const xA = (locA.x / 100) * this.canvas.width;
        const yA = (locA.y / 100) * this.canvas.height;
        const xB = (locB.x / 100) * this.canvas.width;
        const yB = (locB.y / 100) * this.canvas.height;
        
        this.ctx.beginPath();
        this.ctx.moveTo(xA, yA);
        this.ctx.lineTo(xB, yB);
        this.ctx.strokeStyle = 'rgba(201, 206, 214, 0.1)';
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
    },
    
    drawMarkers() {
      this.locations.forEach((location, index) => {
        const x = (location.x / 100) * this.canvas.width;
        const y = (location.y / 100) * this.canvas.height;
        const isActive = this.activeLocation === location;
        
        // Pulse effect
        const pulseRadius = 20 + Math.sin(Date.now() / 500 + index) * 5;
        const pulseOpacity = 0.1 + Math.sin(Date.now() / 500 + index) * 0.05;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(201, 206, 214, ${pulseOpacity})`;
        this.ctx.fill();
        
        // Outer ring
        this.ctx.beginPath();
        this.ctx.arc(x, y, 18, 0, Math.PI * 2);
        this.ctx.strokeStyle = isActive ? 'rgba(201, 206, 214, 0.5)' : 'rgba(201, 206, 214, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Inner circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 12);
        if (isActive) {
          gradient.addColorStop(0, '#F5F7FA');
          gradient.addColorStop(1, '#C9CED6');
        } else {
          gradient.addColorStop(0, 'rgba(201, 206, 214, 0.3)');
          gradient.addColorStop(1, 'rgba(201, 206, 214, 0.1)');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Label
        if (isActive) {
          this.ctx.font = '600 12px Montserrat';
          this.ctx.fillStyle = '#F5F7FA';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(location.name, x, y - 30);
        }
      });
    },
    
    zoomMap(factor) {
      // Simple zoom simulation - could be expanded
      console.log('Map zoom:', factor);
    },
    
    resetMap() {
      this.activeLocation = null;
      this.locations.forEach(loc => loc.element.classList.remove('active'));
      document.querySelector('.map-info-card')?.classList.remove('visible');
    },
    
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InteractiveMap.init());
  } else {
    InteractiveMap.init();
  }

  window.BuildBridgeInteractiveMap = InteractiveMap;
})();
