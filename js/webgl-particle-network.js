/**
 * BuildBridge WebGL Particle Network System v29.0
 * Fortune 500 Interactive Background with Construction-Themed Particles
 * Features: GPU-accelerated particles, mouse interaction, connection lines
 */

class WebGLParticleNetwork {
  constructor(container, options = {}) {
    this.container = container || document.body;
    this.canvas = null;
    this.gl = null;
    this.animationId = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0, active: false };
    this.time = 0;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 80,
      connectionDistance: options.connectionDistance || 150,
      connectionOpacity: options.connectionOpacity || 0.15,
      particleSize: options.particleSize || 2.5,
      particleColor: options.particleColor || [0.788, 0.808, 0.839], // Chrome color
      mouseRadius: options.mouseRadius || 200,
      mouseForce: options.mouseForce || 0.5,
      speed: options.speed || 0.3,
      ...options
    };

    this.init();
  }

  init() {
    this.createCanvas();
    this.setupWebGL();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;
    `;
    this.container.prepend(this.canvas);
  }

  setupWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS particles');
      this.fallback();
      return;
    }

    this.resize();
    
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      attribute float size;
      attribute vec3 color;
      attribute float alpha;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        gl_PointSize = size;
        vColor = color;
        vAlpha = alpha;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(vColor, vAlpha * glow);
      }
    `;

    this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    this.gl.useProgram(this.program);

    // Get attribute and uniform locations
    this.locations = {
      position: this.gl.getAttribLocation(this.program, 'position'),
      size: this.gl.getAttribLocation(this.program, 'size'),
      color: this.gl.getAttribLocation(this.program, 'color'),
      alpha: this.gl.getAttribLocation(this.program, 'alpha')
    };

    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  createProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    return program;
  }

  initParticles() {
    const { width, height } = this.getCanvasSize();
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: (Math.random() * width - width / 2) / (width / 2),
        y: (Math.random() * height - height / 2) / (height / 2),
        vx: (Math.random() - 0.5) * this.config.speed * 0.01,
        vy: (Math.random() - 0.5) * this.config.speed * 0.01,
        size: this.config.particleSize + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.4,
        baseAlpha: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  updateParticles() {
    const { width, height } = this.getCanvasSize();
    const aspect = width / height;
    
    this.particles.forEach(p => {
      // Mouse interaction - repel particles
      if (this.mouse.active) {
        const mx = (this.mouse.x / width * 2 - 1);
        const my = -(this.mouse.y / height * 2 - 1);
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.mouseRadius / 200) {
          const force = (1 - dist / (this.config.mouseRadius / 200)) * this.config.mouseForce * 0.01;
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Boundary bounce with damping
      if (p.x < -1 || p.x > 1) {
        p.vx *= -0.8;
        p.x = Math.max(-1, Math.min(1, p.x));
      }
      if (p.y < -1 / aspect || p.y > 1 / aspect) {
        p.vy *= -0.8;
        p.y = Math.max(-1 / aspect, Math.min(1 / aspect, p.y));
      }
      
      // Apply slight friction
      p.vx *= 0.999;
      p.vy *= 0.999;
      
      // Gentle oscillation in alpha
      p.alpha = p.baseAlpha + Math.sin(this.time * 0.001 + p.phase) * 0.1;
    });
  }

  drawParticles() {
    const positions = [];
    const sizes = [];
    const colors = [];
    const alphas = [];
    
    this.particles.forEach(p => {
      positions.push(p.x, p.y);
      sizes.push(p.size);
      colors.push(...this.config.particleColor);
      alphas.push(Math.max(0, Math.min(1, p.alpha)));
    });

    // Update buffers
    this.updateBuffer('position', new Float32Array(positions), 2);
    this.updateBuffer('size', new Float32Array(sizes), 1);
    this.updateBuffer('color', new Float32Array(colors), 3);
    this.updateBuffer('alpha', new Float32Array(alphas), 1);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
  }

  updateBuffer(attribute, data, components) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.locations[attribute]);
    this.gl.vertexAttribPointer(this.locations[attribute], components, this.gl.FLOAT, false, 0, 0);
  }

  drawConnections() {
    // Draw connection lines using canvas 2D for better quality
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = this.getCanvasSize();
    
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = `rgba(${this.config.particleColor.map(c => c * 255).join(',')}, ${this.config.connectionOpacity})`;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const x1 = (p1.x + 1) / 2 * width;
        const y1 = (-p1.y + 1) / 2 * height;
        const x2 = (p2.x + 1) / 2 * width;
        const y2 = (-p2.y + 1) / 2 * height;
        
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * this.config.connectionOpacity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${this.config.particleColor.map(c => c * 255).join(',')}, ${opacity})`;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.time += 16;
    this.updateParticles();
    
    if (this.gl) {
      this.drawParticles();
      this.drawConnections();
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    this.container.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    }, { passive: true });
    
    this.container.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  resize() {
    const { width, height, dpr } = this.getCanvasSize();
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    if (this.gl) {
      this.gl.viewport(0, 0, width * dpr, height * dpr);
    }
  }

  getCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { width, height, dpr };
  }

  fallback() {
    // CSS-based fallback for non-WebGL browsers
    this.canvas.remove();
    this.container.style.cssText += `
      background-image: radial-gradient(circle at 20% 80%, rgba(201,206,214,0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(201,206,214,0.03) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(201,206,214,0.02) 0%, transparent 40%);
      background-attachment: fixed;
    `;
  }

  pause() {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  resume() {
    if (!this.animationId) {
      this.animate();
    }
  }

  destroy() {
    this.pause();
    if (this.canvas) {
      this.canvas.remove();
    }
    if (this.gl) {
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
}

// Construction-themed particle shapes
class ConstructionParticles {
  constructor(container) {
    this.container = container;
    this.shapes = ['⚡', '◆', '□', '○', '⬡'];
    this.particles = [];
    this.maxParticles = 25;
    
    this.init();
  }

  init() {
    this.style = document.createElement('style');
    this.style.textContent = `
      .construction-particle {
        position: fixed;
        pointer-events: none;
        z-index: 1;
        font-size: 14px;
        opacity: 0;
        color: rgba(201, 206, 214, 0.3);
        animation: float-particle 15s linear infinite;
        will-change: transform, opacity;
      }
      
      @keyframes float-particle {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.3; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(this.style);
    
    this.spawnParticle();
    this.interval = setInterval(() => this.spawnParticle(), 3000);
  }

  spawnParticle() {
    if (this.particles.length >= this.maxParticles) {
      const old = this.particles.shift();
      old?.remove();
    }
    
    const particle = document.createElement('div');
    particle.className = 'construction-particle';
    particle.textContent = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particle.style.animationDuration = (12 + Math.random() * 8) + 's';
    particle.style.fontSize = (10 + Math.random() * 16) + 'px';
    
    this.container.appendChild(particle);
    this.particles.push(particle);
    
    // Remove after animation
    setTimeout(() => {
      const index = this.particles.indexOf(particle);
      if (index > -1) {
        this.particles.splice(index, 1);
        particle.remove();
      }
    }, 20000);
  }

  destroy() {
    clearInterval(this.interval);
    this.particles.forEach(p => p.remove());
    this.style.remove();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for touch device - disable on mobile
  if (window.matchMedia('(pointer: coarse)').matches) {
    // Use lighter fallback on mobile
    new ConstructionParticles(document.body);
    return;
  }
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  // Initialize WebGL particle network
  const particleNetwork = new WebGLParticleNetwork(document.body, {
    particleCount: 60,
    connectionDistance: 120,
    connectionOpacity: 0.1,
    particleSize: 2,
    speed: 0.2
  });
  
  // Also add construction-themed floating shapes
  new ConstructionParticles(document.body);
  
  // Expose for debugging
  window.particleNetwork = particleNetwork;
});

export { WebGLParticleNetwork, ConstructionParticles };
