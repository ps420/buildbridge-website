/**
 * WebGL Fluid Hero Background - v24.0
 * Premium interactive fluid simulation for hero section
 * Fortune 500 Quality Visual Effect
 */

class WebGLFluidHero {
  constructor(container, options = {}) {
    this.container = container || document.querySelector('.hero');
    if (!this.container) return;
    
    this.options = {
      particleCount: options.particleCount || 25,
      connectionDistance: options.connectionDistance || 150,
      mouseRadius: options.mouseRadius || 200,
      color1: options.color1 || [201, 206, 214], // Chrome
      color2: options.color2 || [82, 88, 98],   // Steel
      color3: options.color3 || [43, 45, 48],   // Gun
      speed: options.speed || 0.5,
      ...options
    };
    
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0, vx: 0, vy: 0 };
    this.time = 0;
    this.animationId = null;
    this.isActive = true;
    
    this.init();
  }
  
  init() {
    // Skip on mobile/touch devices for performance
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.fallbackToCSS();
      return;
    }
    
    this.createCanvas();
    this.setupWebGL();
    this.createParticles();
    this.bindEvents();
    this.animate();
    
    console.log('[WebGL Fluid] Initialized with', this.options.particleCount, 'particles');
  }
  
  fallbackToCSS() {
    // Add CSS gradient fallback
    const fallback = document.createElement('div');
    fallback.className = 'webgl-fallback';
    fallback.style.cssText = `
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 20% 30%, rgba(201,206,214,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(82,88,98,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(43,45,48,0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    `;
    this.container.insertBefore(fallback, this.container.firstChild);
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'webgl-fluid-canvas';
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    this.container.insertBefore(this.canvas, this.container.firstChild);
    this.resize();
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl', { 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    }) || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('[WebGL Fluid] WebGL not supported, falling back to CSS');
      this.fallbackToCSS();
      return;
    }
    
    // Vertex shader
    const vertexShader = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute vec3 a_color;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      varying vec3 v_color;
      varying float v_size;
      
      void main() {
        vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_size;
        v_color = a_color;
        v_size = a_size;
      }
    `;
    
    // Fragment shader with fluid-like glow
    const fragmentShader = `
      precision mediump float;
      
      varying vec3 v_color;
      varying float v_size;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        // Soft glow effect
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= 0.6;
        
        // Inner bright core
        float core = 1.0 - smoothstep(0.0, 0.2, dist);
        
        vec3 finalColor = v_color * (0.5 + core * 0.5);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
    
    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('[WebGL Fluid] Shader compile error:', this.gl.getShaderInfoLog(shader));
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
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('[WebGL Fluid] Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: Math.random() * 80 + 40,
        color: this.getRandomColor(),
        originalX: 0,
        originalY: 0
      });
    }
    
    // Store original positions
    this.particles.forEach(p => {
      p.originalX = p.x;
      p.originalY = p.y;
    });
  }
  
  getRandomColor() {
    const colors = [
      this.options.color1,
      this.options.color2,
      this.options.color3
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    // Track mouse for interaction
    document.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }, { passive: true });
    
    // Visibility API to pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive) this.animate();
    });
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  updateParticles() {
    this.time += 0.016;
    
    this.particles.forEach(p => {
      // Gentle floating motion
      p.x += p.vx + Math.sin(this.time * 0.5 + p.y * 0.01) * 0.3;
      p.y += p.vy + Math.cos(this.time * 0.3 + p.x * 0.01) * 0.3;
      
      // Mouse interaction - gentle repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.options.mouseRadius && dist > 0) {
        const force = (this.options.mouseRadius - dist) / this.options.mouseRadius;
        p.vx += (dx / dist) * force * 0.5;
        p.vy += (dy / dist) * force * 0.5;
      }
      
      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Return to original area gently
      p.vx += (p.originalX - p.x) * 0.0005;
      p.vy += (p.originalY - p.y) * 0.0005;
      
      // Wrap around edges
      if (p.x < -100) p.x = this.canvas.width + 100;
      if (p.x > this.canvas.width + 100) p.x = -100;
      if (p.y < -100) p.y = this.canvas.height + 100;
      if (p.y > this.canvas.height + 100) p.y = -100;
    });
  }
  
  render() {
    if (!this.gl || !this.program) return;
    
    // Clear with transparent
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Prepare attributes
    const positions = new Float32Array(this.particles.length * 2);
    const sizes = new Float32Array(this.particles.length);
    const colors = new Float32Array(this.particles.length * 3);
    
    this.particles.forEach((p, i) => {
      positions[i * 2] = p.x;
      positions[i * 2 + 1] = p.y;
      sizes[i] = p.size * window.devicePixelRatio;
      colors[i * 3] = p.color[0] / 255;
      colors[i * 3 + 1] = p.color[1] / 255;
      colors[i * 3 + 2] = p.color[2] / 255;
    });
    
    // Position attribute
    const positionLoc = this.gl.getAttribLocation(this.program, 'a_position');
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
    
    // Size attribute
    const sizeLoc = this.gl.getAttribLocation(this.program, 'a_size');
    const sizeBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, sizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizes, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(sizeLoc);
    this.gl.vertexAttribPointer(sizeLoc, 1, this.gl.FLOAT, false, 0, 0);
    
    // Color attribute
    const colorLoc = this.gl.getAttribLocation(this.program, 'a_color');
    const colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(colorLoc);
    this.gl.vertexAttribPointer(colorLoc, 3, this.gl.FLOAT, false, 0, 0);
    
    // Uniforms
    const resolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.gl.uniform2f(resolutionLoc, this.canvas.width, this.canvas.height);
    
    const timeLoc = this.gl.getUniformLocation(this.program, 'u_time');
    this.gl.uniform1f(timeLoc, this.time);
    
    // Draw
    this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
  }
  
  animate() {
    if (!this.isActive) return;
    
    this.updateParticles();
    this.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Canvas 2D fallback for better compatibility
class CanvasFluidFallback {
  constructor(container, options = {}) {
    this.container = container || document.querySelector('.hero');
    if (!this.container) return;
    
    this.options = {
      particleCount: 20,
      connectionDistance: 120,
      ...options
    };
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.time = 0;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'canvas-fluid-fallback';
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    this.container.insertBefore(this.canvas, this.container.firstChild);
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 60 + 30,
        color: `rgba(201, 206, 214, ${Math.random() * 0.15 + 0.05})`
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    document.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }, { passive: true });
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  animate() {
    this.time += 0.01;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((p, i) => {
      // Update position with sine wave motion
      p.x += p.vx + Math.sin(this.time + i) * 0.2;
      p.y += p.vy + Math.cos(this.time + i * 0.5) * 0.2;
      
      // Wrap edges
      if (p.x < -p.radius) p.x = this.canvas.width / window.devicePixelRatio + p.radius;
      if (p.x > this.canvas.width / window.devicePixelRatio + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = this.canvas.height / window.devicePixelRatio + p.radius;
      if (p.y > this.canvas.height / window.devicePixelRatio + p.radius) p.y = -p.radius;
      
      // Draw particle with gradient
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.5, p.color.replace(/[\d.]+\)$/, '0.05)'));
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  // Try WebGL first, fallback to Canvas 2D
  try {
    const hero = document.querySelector('.hero');
    if (hero) {
      // Test WebGL support
      const testCanvas = document.createElement('canvas');
      const testGl = testCanvas.getContext('webgl');
      
      if (testGl && !window.matchMedia('(pointer: coarse)').matches) {
        window.fluidHero = new WebGLFluidHero(hero, {
          particleCount: 20,
          speed: 0.4
        });
      } else {
        window.fluidHero = new CanvasFluidFallback(hero, {
          particleCount: 15
        });
      }
    }
  } catch (e) {
    console.log('[WebGL Fluid] Initialization error:', e);
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebGLFluidHero, CanvasFluidFallback };
}
