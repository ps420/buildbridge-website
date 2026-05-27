/**
 * BuildBridge WebGL Shader Hero Background
 * v34.0 - Immersive Fortune 500 Experience
 * Creates a flowing liquid/gelatinous shader effect
 */

class WebGLShaderHero {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.log('WebGL not supported, using fallback');
      return;
    }
    
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.time = 0;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.createShaders();
    this.createBuffers();
    this.addEventListeners();
    this.animate();
    
    // Add particle overlay
    this.createParticles();
  }
  
  setupCanvas() {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.container.appendChild(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  createShaders() {
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                               dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= resolution.x / resolution.y;
        
        // Mouse influence
        vec2 mousePos = mouse * 2.0 - 1.0;
        mousePos.x *= resolution.x / resolution.y;
        float mouseDist = length(p - mousePos);
        float mouseInfluence = smoothstep(1.5, 0.0, mouseDist) * 0.3;
        
        // Flowing noise layers
        float noise1 = snoise(p * 1.5 + time * 0.1);
        float noise2 = snoise(p * 3.0 - time * 0.15);
        float noise3 = snoise(p * 6.0 + time * 0.05);
        
        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        combinedNoise += mouseInfluence;
        
        // Color palette - BuildBridge brand colors
        vec3 color1 = vec3(0.059, 0.059, 0.063); // #0f0f10
        vec3 color2 = vec3(0.102, 0.102, 0.133); // #1a1a22
        vec3 color3 = vec3(0.165, 0.165, 0.184); // #2a2d34
        vec3 accentColor = vec3(0.788, 0.808, 0.839); // #c9ced6
        
        // Mix colors based on noise
        vec3 finalColor = mix(color1, color2, combinedNoise * 0.5 + 0.5);
        finalColor = mix(finalColor, color3, noise2 * 0.3 + 0.3);
        
        // Add subtle accent highlights
        float highlight = smoothstep(0.6, 0.8, noise1 + mouseInfluence);
        finalColor = mix(finalColor, accentColor, highlight * 0.15);
        
        // Vignette
        float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.8;
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    
    this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    this.gl.useProgram(this.program);
    
    // Get uniform locations
    this.uniforms = {
      resolution: this.gl.getUniformLocation(this.program, 'resolution'),
      time: this.gl.getUniformLocation(this.program, 'time'),
      mouse: this.gl.getUniformLocation(this.program, 'mouse')
    };
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  createProgram(vsSource, fsSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  createBuffers() {
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    const positionLocation = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
  
  addEventListeners() {
    let targetX = 0.5;
    let targetY = 0.5;
    
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX / window.innerWidth;
      targetY = 1.0 - (e.clientY / window.innerHeight);
    });
    
    // Smooth mouse following
    setInterval(() => {
      this.mouseX += (targetX - this.mouseX) * 0.1;
      this.mouseY += (targetY - this.mouseY) * 0.1;
    }, 16);
  }
  
  createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'webgl-particles';
    this.container.appendChild(particleContainer);
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'webgl-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = '-10px';
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      particleContainer.appendChild(particle);
    }
  }
  
  animate() {
    this.time += 0.01;
    
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.time, this.time);
    this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resize());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  
  if (!prefersReducedMotion && !isMobile) {
    const shader = new WebGLShaderHero('.hero');
    
    // Add cleanup on page unload
    window.addEventListener('beforeunload', () => {
      shader.destroy();
    });
  }
});
