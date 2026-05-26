/**
 * BuildBridge Premium Cursor with Particle Trail
 * Fortune 500 Quality - Custom cursor with physics-based particle trail
 */

class CursorParticles {
  constructor(options = {}) {
    this.options = {
      particleCount: 20,
      particleLife: 0.8,
      particleDecay: 0.96,
      trailLength: 15,
      color: '201, 206, 214',
      glowColor: '100, 150, 255',
      enableOnTouch: false,
      ...options
    };
    
    this.particles = [];
    this.trail = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMoving = false;
    this.moveTimeout = null;
    this.lastX = 0;
    this.lastY = 0;
    this.velocity = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    // Check for touch device
    if (!this.options.enableOnTouch && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    
    this.createCanvas();
    this.createCustomCursor();
    this.bindEvents();
    this.animate();
    
    // Add class to body
    document.body.classList.add('custom-cursor-active');
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99998;
      mix-blend-mode: screen;
    `;
    
    this.resize();
    document.body.appendChild(this.canvas);
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createCustomCursor() {
    // Main cursor ring
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor-ring';
    this.cursor.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(${this.options.color}, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
      mix-blend-mode: difference;
    `;
    
    // Cursor dot
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'cursor-dot';
    this.cursorDot.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: rgb(${this.options.color});
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease;
    `;
    
    // Cursor glow
    this.cursorGlow = document.createElement('div');
    this.cursorGlow.className = 'cursor-glow';
    this.cursorGlow.style.cssText = `
      position: fixed;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(${this.options.glowColor}, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99997;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    
    document.body.appendChild(this.cursorGlow);
    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorDot);
    
    // Hover effect targets
    this.setupHoverTargets();
  }
  
  setupHoverTargets() {
    const hoverTargets = 'a, button, .service-card, .project-card, .magnetic-el, input, textarea, .showcase-3d-dot';
    
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => this.onHoverStart(el));
      el.addEventListener('mouseleave', () => this.onHoverEnd());
    });
    
    // Watch for dynamically added elements
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(hoverTargets)) {
              node.addEventListener('mouseenter', () => this.onHoverStart(node));
              node.addEventListener('mouseleave', () => this.onHoverEnd());
            }
            if (node.querySelectorAll) {
              node.querySelectorAll(hoverTargets).forEach(el => {
                el.addEventListener('mouseenter', () => this.onHoverStart(el));
                el.addEventListener('mouseleave', () => this.onHoverEnd());
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  onHoverStart(el) {
    const isClickable = el.matches('a, button, input, textarea') || el.closest('a, button');
    
    if (isClickable) {
      this.cursor.style.width = '60px';
      this.cursor.style.height = '60px';
      this.cursor.style.borderColor = `rgba(${this.options.color}, 0.9)`;
      this.cursor.style.background = `rgba(${this.options.color}, 0.1)`;
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
      this.cursorGlow.style.opacity = '1';
    } else {
      this.cursor.style.width = '50px';
      this.cursor.style.height = '50px';
      this.cursorGlow.style.opacity = '0.5';
    }
    
    // Add particle burst
    this.createBurst(this.mouseX, this.mouseY, 8);
  }
  
  onHoverEnd() {
    this.cursor.style.width = '40px';
    this.cursor.style.height = '40px';
    this.cursor.style.borderColor = `rgba(${this.options.color}, 0.6)`;
    this.cursor.style.background = 'transparent';
    this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    this.cursorGlow.style.opacity = '0';
  }
  
  bindEvents() {
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isMoving = true;
      
      // Calculate velocity
      this.velocity.x = this.mouseX - this.lastX;
      this.velocity.y = this.mouseY - this.lastY;
      this.lastX = this.mouseX;
      this.lastY = this.mouseY;
      
      // Add to trail
      this.trail.push({ x: this.mouseX, y: this.mouseY, age: 0 });
      if (this.trail.length > this.options.trailLength) {
        this.trail.shift();
      }
      
      // Create particles based on velocity
      const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
      if (speed > 5) {
        this.createParticle(this.mouseX, this.mouseY, this.velocity);
      }
      
      // Reset move timeout
      clearTimeout(this.moveTimeout);
      this.moveTimeout = setTimeout(() => {
        this.isMoving = false;
      }, 100);
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
      this.createBurst(this.mouseX, this.mouseY, 12);
    });
    
    document.addEventListener('mouseup', () => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Hide on mouse leave
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.cursorDot.style.opacity = '0';
      this.canvas.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.cursorDot.style.opacity = '1';
      this.canvas.style.opacity = '1';
    });
  }
  
  createParticle(x, y, velocity) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    
    this.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: velocity.x * 0.3 + Math.cos(angle) * speed,
      vy: velocity.y * 0.3 + Math.sin(angle) * speed,
      life: 1,
      size: Math.random() * 3 + 2,
      color: `rgba(${this.options.color}, ${Math.random() * 0.5 + 0.3})`
    });
  }
  
  createBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 4 + 2;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 4 + 3,
        color: `rgba(${this.options.glowColor}, ${Math.random() * 0.7 + 0.3})`
      });
    }
  }
  
  animate() {
    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(15, 15, 16, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw cursor positions
    const cursorX = this.mouseX;
    const cursorY = this.mouseY;
    
    // Smooth follow for cursor ring
    const currentTransform = this.cursor.style.transform;
    this.cursor.style.left = cursorX + 'px';
    this.cursor.style.top = cursorY + 'px';
    this.cursorDot.style.left = cursorX + 'px';
    this.cursorDot.style.top = cursorY + 'px';
    this.cursorGlow.style.left = cursorX + 'px';
    this.cursorGlow.style.top = cursorY + 'px';
    
    // Draw trail
    this.trail.forEach((point, i) => {
      point.age++;
      const alpha = 1 - (point.age / this.options.trailLength);
      const size = (1 - (point.age / this.options.trailLength)) * 4;
      
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.options.color}, ${alpha * 0.5})`;
      this.ctx.fill();
      
      // Glow
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.options.glowColor}, ${alpha * 0.2})`;
      this.ctx.fill();
    });
    
    // Remove old trail points
    this.trail = this.trail.filter(point => point.age < this.options.trailLength);
    
    // Update and draw particles
    this.ctx.globalCompositeOperation = 'screen';
    
    this.particles = this.particles.filter(particle => {
      // Update
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life *= this.options.particleDecay;
      particle.size *= 0.97;
      
      // Draw
      if (particle.life > 0.01) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.life})`);
        this.ctx.fill();
        
        // Glow
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, particle.color.replace(/[\d.]+\)$/, `${particle.life * 0.5})`));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        return true;
      }
      return false;
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Connection lines between nearby particles
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 60) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${this.options.color}, ${(1 - dist / 60) * 0.2 * p1.life})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.canvas.remove();
    this.cursor.remove();
    this.cursorDot.remove();
    this.cursorGlow.remove();
    document.body.classList.remove('custom-cursor-active');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Delay initialization for better performance
  setTimeout(() => {
    window.cursorParticles = new CursorParticles({
      particleCount: 25,
      trailLength: 20,
      color: '201, 206, 214',
      glowColor: '100, 150, 255'
    });
  }, 100);
});

// Export for manual control
window.CursorParticles = CursorParticles;
