/**
 * BuildBridge WebGL Flow Field Background
 * Fortune 500 Interactive Particle System v89.0
 */

class WebGLFlowField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    }) || canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS');
      return;
    }
    
    this.options = {
      particleCount: 2000,
      particleSize: 1.5,
      speed: 0.5,
      noiseScale: 0.002,
      noiseSpeed: 0.0005,
      trailLength: 0.15,
      color1: [0.788, 0.808, 0.839], // #C9CED6
      color2: [0.541, 0.569, 0.6],   // #8A9199
      cursorRepulsion: 150,
      cursorRepulsionStrength: 0.5,
      ...options
    };
    
    this.particles = [];
    this.mouse = { x: 0, y: 0, active: false };
    this.time = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.initShaders();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }
  
  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  initShaders() {
    const gl = this.gl;
    
    // Vertex shader
    const vertexSource = `
      attribute vec2 a_position;
      attribute float a_alpha;
      
      uniform vec2 u_resolution;
      uniform float u_size;
      
      varying float v_alpha;
      
      void main() {
        vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = u_size;
        v_alpha = a_alpha;
      }
    `;
    
    // Fragment shader
    const fragmentSource = `
      precision mediump float;
      
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_time;
      
      varying float v_alpha;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) {
          discard;
        }
        
        float alpha = smoothstep(0.5, 0.0, dist) * v_alpha;
        vec3 color = mix(u_color1, u_color2, sin(u_time * 0.5 + v_alpha * 3.14159) * 0.5 + 0.5);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
    
    // Compile shaders
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    // Create program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
    }
    
    // Get attribute/uniform locations
    this.positionLoc = gl.getAttribLocation(this.program, 'a_position');
    this.alphaLoc = gl.getAttribLocation(this.program, 'a_alpha');
    this.resolutionLoc = gl.getUniformLocation(this.program, 'u_resolution');
    this.sizeLoc = gl.getUniformLocation(this.program, 'u_size');
    this.color1Loc = gl.getUniformLocation(this.program, 'u_color1');
    this.color2Loc = gl.getUniformLocation(this.program, 'u_color2');
    this.timeLoc = gl.getUniformLocation(this.program, 'u_time');
    
    // Create buffers
    this.positionBuffer = gl.createBuffer();
    this.alphaBuffer = gl.createBuffer();
  }
  
  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  initParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: 0,
        alpha: Math.random() * 0.5 + 0.2,
        life: Math.random() * 100
      });
    }
    
    // Initialize position and alpha arrays
    this.positions = new Float32Array(this.options.particleCount * 2);
    this.alphas = new Float32Array(this.options.particleCount);
  }
  
  // Simplex noise implementation for flow field
  noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;
    
    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }
  
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  lerp(t, a, b) {
    return a + t * (b - a);
  }
  
  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  // Permutation table for simplex noise
  get p() {
    if (!this._p) {
      this._p = new Uint8Array(512);
      const permutation = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
        247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
        57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
        74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
        207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
        119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
        218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
        81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
        184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
        222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
      ];
      for (let i = 0; i < 256; i++) {
        this._p[256 + i] = this._p[i] = permutation[i];
      }
    }
    return this._p;
  }
  
  updateParticles() {
    const scale = this.options.noiseScale;
    const speed = this.options.speed;
    const time = this.time * this.options.noiseSpeed;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Get flow field direction from noise
      const angle = this.noise(p.x * scale, p.y * scale, time) * Math.PI * 4;
      
      // Update velocity based on flow field
      p.vx += Math.cos(angle) * speed * 0.01;
      p.vy += Math.sin(angle) * speed * 0.01;
      
      // Apply cursor repulsion
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x * this.width;
        const dy = p.y - this.mouse.y * this.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.options.cursorRepulsion) {
          const force = (1 - dist / this.options.cursorRepulsion) * this.options.cursorRepulsionStrength;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
      
      // Apply friction
      p.vx *= 0.98;
      p.vy *= 0.98;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
      
      // Update arrays for rendering
      this.positions[i * 2] = p.x;
      this.positions[i * 2 + 1] = p.y;
      this.alphas[i] = p.alpha;
      
      // Pulse alpha
      p.life += 0.01;
      p.alpha = (Math.sin(p.life) * 0.3 + 0.5) * 0.6;
    }
  }
  
  render() {
    const gl = this.gl;
    
    // Clear with trail effect
    gl.clearColor(0.059, 0.059, 0.071, this.options.trailLength);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Use program
    gl.useProgram(this.program);
    
    // Update buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.positionLoc);
    gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.alphas, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.alphaLoc);
    gl.vertexAttribPointer(this.alphaLoc, 1, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    gl.uniform2f(this.resolutionLoc, this.width, this.height);
    gl.uniform1f(this.sizeLoc, this.options.particleSize);
    gl.uniform3fv(this.color1Loc, this.options.color1);
    gl.uniform3fv(this.color2Loc, this.options.color2);
    gl.uniform1f(this.timeLoc, this.time);
    
    // Draw particles
    gl.drawArrays(gl.POINTS, 0, this.particles.length);
  }
  
  animate() {
    this.frameCount++;
    const now = performance.now();
    
    // Calculate FPS every 30 frames
    if (this.frameCount % 30 === 0) {
      this.fps = Math.round(1000 / ((now - this.lastTime) / 30));
      this.lastTime = now;
      
      // Adjust quality if FPS drops
      if (this.fps < 30 && this.options.particleCount > 500) {
        this.options.particleCount = Math.max(500, this.options.particleCount - 100);
        this.initParticles();
      }
    }
    
    this.time += 0.016;
    
    this.updateParticles();
    this.render();
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    }, { passive: true });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
      this.mouse.active = true;
    }, { passive: true });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    }, { passive: true });
  }
  
  setOptions(newOptions) {
    Object.assign(this.options, newOptions);
    if (newOptions.particleCount) {
      this.initParticles();
    }
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize flow field on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('flow-field-canvas');
  if (canvas) {
    window.flowField = new WebGLFlowField(canvas);
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebGLFlowField;
}
