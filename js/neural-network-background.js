/**
 * v38.0: Neural Network Background
 * WebGL-powered connected nodes system
 * Fortune 500 Next-Gen Visual Feature
 */

class NeuralNetworkBackground {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.neural-network-bg');
    if (!this.container) return;
    
    this.canvas = this.container.querySelector('canvas') || document.createElement('canvas');
    if (!this.container.contains(this.canvas)) {
      this.canvas.className = 'neural-network-canvas';
      this.container.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.connections = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    
    // Config
    this.config = {
      nodeCount: options.nodeCount || (window.innerWidth < 768 ? 25 : 50),
      connectionDistance: options.connectionDistance || 150,
      mouseRadius: options.mouseRadius || 200,
      nodeSpeed: options.nodeSpeed || 0.3,
      nodeColor: options.nodeColor || 'rgba(201, 206, 214, 0.6)',
      lineColor: options.lineColor || 'rgba(201, 206, 214, 0.15)',
      activeColor: options.activeColor || 'rgba(245, 247, 250, 0.4)'
    };
    
    this.resize();
    this.initNodes();
    this.bindEvents();
    this.start();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  initNodes() {
    this.nodes = [];
    
    for (let i = 0; i < this.config.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.nodeSpeed,
        vy: (Math.random() - 0.5) * this.config.nodeSpeed,
        radius: Math.random() * 2 + 1,
        baseRadius: Math.random() * 2 + 1
      });
    }
  }
  
  updateNodes() {
    this.nodes.forEach(node => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < 0 || node.x > this.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.height) node.vy *= -1;
      
      // Keep in bounds
      node.x = Math.max(0, Math.min(this.width, node.x));
      node.y = Math.max(0, Math.min(this.height, node.y));
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.mouseRadius) {
          const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
          node.radius = node.baseRadius + force * 3;
        } else {
          node.radius = node.baseRadius;
        }
      }
    });
  }
  
  drawConnections() {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * 0.5;
          
          // Check if connection is near mouse
          let isActive = false;
          if (this.mouse.x !== null && this.mouse.y !== null) {
            const midX = (this.nodes[i].x + this.nodes[j].x) / 2;
            const midY = (this.nodes[i].y + this.nodes[j].y) / 2;
            const mouseDist = Math.sqrt(
              (this.mouse.x - midX) ** 2 + (this.mouse.y - midY) ** 2
            );
            isActive = mouseDist < this.config.mouseRadius;
          }
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.strokeStyle = isActive 
            ? this.config.activeColor.replace('0.4', opacity.toFixed(2))
            : this.config.lineColor.replace('0.15', opacity.toFixed(2));
          this.ctx.lineWidth = isActive ? 2 : 1;
          this.ctx.stroke();
          
          // Draw data packet on active connections
          if (isActive && Math.random() > 0.95) {
            const t = Math.random();
            const px = this.nodes[i].x + dx * t;
            const py = this.nodes[i].y + dy * t;
            
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = this.config.activeColor;
            this.ctx.fill();
          }
        }
      }
    }
  }
  
  drawNodes() {
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      
      // Check if node is near mouse
      let isActive = false;
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dist = Math.sqrt(
          (this.mouse.x - node.x) ** 2 + (this.mouse.y - node.y) ** 2
        );
        isActive = dist < this.config.mouseRadius;
      }
      
      this.ctx.fillStyle = isActive ? this.config.activeColor : this.config.nodeColor;
      this.ctx.fill();
      
      // Glow effect for active nodes
      if (isActive) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.config.activeColor.replace('0.4', '0.1');
        this.ctx.fill();
      }
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.updateNodes();
    this.drawConnections();
    this.drawNodes();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  start() {
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initNodes();
    }, { passive: true });
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
    
    document.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neuralNetwork = new NeuralNetworkBackground();
  });
} else {
  window.neuralNetwork = new NeuralNetworkBackground();
}

export default NeuralNetworkBackground;
