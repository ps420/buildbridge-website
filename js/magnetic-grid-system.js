/**
 * v36.0: Magnetic Grid Layout System
 * Fortune 500 Interactive Grid Architecture
 * Cards that magnetically attract/repel to cursor position
 */

class MagneticGridSystem {
  constructor() {
    this.grids = [];
    this.mousePos = { x: 0, y: 0 };
    this.isActive = true;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.animationFrame = null;
    
    this.config = {
      attractionRadius: 200,
      maxAttraction: 30,
      springStrength: 0.1,
      damping: 0.85,
      repelStrength: 15,
      enableConnections: true,
      connectionDistance: 250
    };
    
    this.init();
  }
  
  init() {
    if (this.isTouch) {
      // Simplified experience for touch devices
      return this.initTouch();
    }
    
    this.findGrids();
    if (this.grids.length === 0) return;
    
    this.createConnections();
    this.bindEvents();
    this.animate();
    this.revealItems();
  }
  
  initTouch() {
    document.querySelectorAll('.magnetic-grid-item').forEach((item, index) => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    });
  }
  
  findGrids() {
    document.querySelectorAll('.magnetic-grid').forEach(grid => {
      const items = Array.from(grid.querySelectorAll('.magnetic-grid-item'));
      
      this.grids.push({
        element: grid,
        items: items.map((item, index) => ({
          element: item,
          index: index,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          originX: 0,
          originY: 0,
          width: 0,
          height: 0,
          rect: null
        })),
        connections: []
      });
      
      // Calculate initial positions
      this.updateItemPositions(this.grids[this.grids.length - 1]);
    });
  }
  
  updateItemPositions(grid) {
    grid.items.forEach(item => {
      item.rect = item.element.getBoundingClientRect();
      item.originX = item.rect.left + item.rect.width / 2;
      item.originY = item.rect.top + item.rect.height / 2;
      item.width = item.rect.width;
      item.height = item.rect.height;
    });
  }
  
  createConnections() {
    this.grids.forEach(grid => {
      if (!this.config.enableConnections) return;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('magnetic-grid-connections');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.zIndex = '0';
      
      // Create connections between nearby items
      grid.items.forEach((itemA, i) => {
        grid.items.slice(i + 1).forEach((itemB, j) => {
          grid.connections.push({
            from: itemA,
            to: itemB,
            element: null
          });
        });
      });
      
      // Create SVG lines
      grid.connections.forEach((conn, index) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        svg.appendChild(line);
        conn.element = line;
      });
      
      grid.element.style.position = 'relative';
      grid.element.insertBefore(svg, grid.element.firstChild);
      grid.connectionsSvg = svg;
    });
  }
  
  bindEvents() {
    // Mouse tracking with throttling
    let lastUpdate = 0;
    document.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
      
      // Throttle grid updates to every 16ms (60fps)
      const now = performance.now();
      if (now - lastUpdate > 16) {
        this.updateGridMouseTracking();
        lastUpdate = now;
      }
    }, { passive: true });
    
    // Update positions on scroll
    window.addEventListener('scroll', () => {
      this.grids.forEach(grid => this.updateItemPositions(grid));
    }, { passive: true });
    
    // Update positions on resize
    window.addEventListener('resize', () => {
      this.grids.forEach(grid => this.updateItemPositions(grid));
    }, { passive: true });
    
    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
    });
    
    // Handle item hover for local spotlight effect
    this.grids.forEach(grid => {
      grid.items.forEach(item => {
        item.element.addEventListener('mouseenter', () => {
          item.element.setAttribute('data-attraction', 'attracting');
          this.highlightNeighbors(grid, item);
        });
        
        item.element.addEventListener('mouseleave', () => {
          item.element.removeAttribute('data-attraction');
          this.clearHighlights(grid);
        });
        
        // Mouse position for radial gradient
        item.element.addEventListener('mousemove', (e) => {
          const rect = item.element.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          item.element.style.setProperty('--mouse-x', `${x}%`);
          item.element.style.setProperty('--mouse-y', `${y}%`);
        });
      });
    });
  }
  
  highlightNeighbors(grid, activeItem) {
    grid.items.forEach(item => {
      if (item === activeItem) return;
      
      const dist = this.getDistance(activeItem, item);
      if (dist < this.config.connectionDistance) {
        item.element.setAttribute('data-attraction', 'neighboring');
      }
    });
  }
  
  clearHighlights(grid) {
    grid.items.forEach(item => {
      item.element.removeAttribute('data-attraction');
    });
  }
  
  updateGridMouseTracking() {
    this.grids.forEach(grid => {
      grid.items.forEach(item => {
        // Skip if being hovered
        if (item.element.matches(':hover')) return;
        
        const dx = this.mousePos.x - item.originX - item.x;
        const dy = this.mousePos.y - item.originY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.attractionRadius) {
          // Magnetic attraction force
          const force = (1 - dist / this.config.attractionRadius) * this.config.maxAttraction;
          const angle = Math.atan2(dy, dx);
          
          const targetX = Math.cos(angle) * force;
          const targetY = Math.sin(angle) * force;
          
          // Spring physics
          item.vx += (targetX - item.x) * this.config.springStrength;
          item.vy += (targetY - item.y) * this.config.springStrength;
        }
      });
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.grids.forEach(grid => {
      grid.items.forEach(item => {
        // Apply damping
        item.vx *= this.config.damping;
        item.vy *= this.config.damping;
        
        // Apply repulsion from other items (prevents clustering)
        grid.items.forEach(other => {
          if (item === other) return;
          
          const dx = (item.originX + item.x) - (other.originX + other.x);
          const dy = (item.originY + item.y) - (other.originY + other.y);
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < item.width && dist > 0) {
            const force = (item.width - dist) / item.width * this.config.repelStrength;
            const angle = Math.atan2(dy, dx);
            
            item.vx += Math.cos(angle) * force * 0.1;
            item.vy += Math.sin(angle) * force * 0.1;
          }
        });
        
        // Update position
        item.x += item.vx;
        item.y += item.vy;
        
        // Clamp to reasonable values
        item.x = Math.max(-50, Math.min(50, item.x));
        item.y = Math.max(-50, Math.min(50, item.y));
        
        // Apply transforms
        this.applyTransforms(item);
      });
      
      // Update connection lines
      this.updateConnections(grid);
    });
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  applyTransforms(item) {
    const transform = `translate(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px)`;
    item.element.style.transform = transform;
    
    // Update inner element for parallax effect
    const inner = item.element.querySelector('.magnetic-grid-item-inner');
    if (inner) {
      const innerX = item.x * 0.3;
      const innerY = item.y * 0.3;
      inner.style.setProperty('--magnetic-x', innerX.toFixed(2));
      inner.style.setProperty('--magnetic-y', innerY.toFixed(2));
    }
  }
  
  updateConnections(grid) {
    if (!grid.connectionsSvg) return;
    
    grid.connections.forEach(conn => {
      const x1 = conn.from.originX + conn.from.x;
      const y1 = conn.from.originY + conn.from.y;
      const x2 = conn.to.originX + conn.to.x;
      const y2 = conn.to.originY + conn.to.y;
      
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const opacity = Math.max(0, 1 - dist / this.config.connectionDistance);
      
      conn.element.setAttribute('x1', x1);
      conn.element.setAttribute('y1', y1);
      conn.element.setAttribute('x2', x2);
      conn.element.setAttribute('y2', y2);
      conn.element.style.opacity = opacity * 0.5;
      conn.element.style.stroke = opacity > 0.3 ? 'rgba(201, 206, 214, 0.15)' : 'rgba(201, 206, 214, 0.05)';
    });
  }
  
  getDistance(itemA, itemB) {
    const dx = itemA.originX - itemB.originX;
    const dy = itemA.originY - itemB.originY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  revealItems() {
    this.grids.forEach(grid => {
      grid.items.forEach((item, index) => {
        setTimeout(() => {
          item.element.classList.add('revealed');
        }, index * 100);
      });
    });
  }
  
  // Public API
  setAttractionStrength(strength) {
    this.config.maxAttraction = strength;
  }
  
  setAttractionRadius(radius) {
    this.config.attractionRadius = radius;
  }
  
  enableConnections(enabled) {
    this.config.enableConnections = enabled;
    this.grids.forEach(grid => {
      if (grid.connectionsSvg) {
        grid.connectionsSvg.style.display = enabled ? 'block' : 'none';
      }
    });
  }
  
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.magneticGridSystem = new MagneticGridSystem();
  });
} else {
  window.magneticGridSystem = new MagneticGridSystem();
}
