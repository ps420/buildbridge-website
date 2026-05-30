/**
 * WebGL Fluid Mesh Gradient Background
 * v96.0: Fortune 500 Immersive Visual Experience
 * Creates an animated mesh gradient with fluid dynamics
 */

class FluidMeshBackground {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.time = 0;
    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    this.isActive = true;
    this.frameCount = 0;
    
    // Configurable parameters
    this.config = {
      speed: 0.3,
      colorIntensity: 0.6,
      complexity: 1.0,
      mouseInfluence: 0.3,
      resolution: 1.0 // 1.0 = full resolution
    };
    
    this.init();
  }
  
  init() {
    // Check for WebGL support and mobile
    if (!this.checkWebGLSupport() || this.isMobile()) {
      console.log('FluidMesh: WebGL not supported or mobile detected, using fallback');
      this.useFallback();
      return;
    }
    
    this.createCanvas();
    this.setupWebGL();
    this.createShaderProgram();
    this.setupGeometry();
    this.bindEvents();
    this.animate();
    
    console.log('✨ FluidMeshBackground initialized');
  }
  
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  isMobile() {
    return window.matchMedia('(pointer: coarse)').matches;
  }
  
  createCanvas() {
    const container = document.createElement('div');
    container.className = 'fluid-mesh-container';
    
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fluid-mesh-canvas loading';
    
    container.appendChild(this.canvas);
    document.body.insertBefore(container, document.body.firstChild);
    
    // Add overlay elements
    const overlay = document.createElement('div');
    overlay.className = 'fluid-mesh-overlay';
    document.body.insertBefore(overlay, document.body.firstChild);
    
    // Add noise texture
    const noise = document.createElement('div');
    noise.className = 'fluid-mesh-noise';
    document.body.insertBefore(noise, document.body.firstChild);
    
    setTimeout(() => {
      this.canvas.classList.remove('loading');
    }, 100);
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    }) || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      this.useFallback();
      return;
    }
    
    this.resize();
  }
  
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth * this.config.resolution;
    const height = window.innerHeight * this.config.resolution;
    
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  getVertexShader() {
    return `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
  }
  
  getFragmentShader() {
    return `
      precision mediump float;
      
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouse;
      uniform float complexity;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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
      
      // Gradient noise
      float gradientNoise(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= resolution.x / resolution.y;
        
        // Mouse influence
        vec2 mouseInfluence = (mouse - 0.5) * 0.5;
        p += mouseInfluence * 0.3;
        
        // Animated noise layers
        float t = time * 0.1;
        float n1 = snoise(p * 1.5 + t);
        float n2 = snoise(p * 3.0 - t * 0.5);
        float n3 = snoise(p * 5.0 + t * 0.3);
        
        // Combine noises
        float noise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
        noise = noise * 0.5 + 0.5;
        
        // Color palette (BuildBridge brand colors)
        vec3 color1 = vec3(0.059, 0.059, 0.071); // #0f0f12
        vec3 color2 = vec3(0.102, 0.102, 0.133); // #1a1a22
        vec3 color3 = vec3(0.788, 0.808, 0.839); // #c9ced6
        vec3 color4 = vec3(0.239, 0.353, 0.502); // #3d5a80
        
        // Mix colors based on noise
        vec3 finalColor = mix(color1, color2, noise);
        finalColor = mix(finalColor, color3, smoothstep(0.4, 0.8, n2) * 0.15);
        finalColor = mix(finalColor, color4, smoothstep(0.3, 0.7, n3) * 0.1);
        
        // Add subtle vignette
        float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.5;
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
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
  
  createShaderProgram() {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.getVertexShader());
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.getFragmentShader());
    
    if (!vertexShader || !fragmentShader) {
      this.useFallback();
      return;
    }
    
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
      this.useFallback();
      return;
    }
    
    this.gl.useProgram(this.program);
  }
  
  setupGeometry() {
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
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX / window.innerWidth;
      this.mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
    });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
      } else {
        this.isActive = true;
        this.animate();
      }
    });
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Skip frames for performance (30fps instead of 60fps)
    this.frameCount++;
    if (this.frameCount % 2 !== 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.time += this.config.speed;
    
    // Smooth mouse movement
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    
    // Update uniforms
    const timeLocation = this.gl.getUniformLocation(this.program, 'time');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution');
    const mouseLocation = this.gl.getUniformLocation(this.program, 'mouse');
    const complexityLocation = this.gl.getUniformLocation(this.program, 'complexity');
    
    this.gl.uniform1f(timeLocation, this.time);
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(mouseLocation, this.mouse.x, this.mouse.y);
    this.gl.uniform1f(complexityLocation, this.config.complexity);
    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  useFallback() {
    // Add CSS fallback class
    document.body.classList.add('no-webgl');
    
    // Create fallback gradient
    const fallback = document.createElement('div');
    fallback.className = 'fluid-mesh-container';
    fallback.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: -2;
      background: linear-gradient(135deg, #0f0f12 0%, #1a1a22 50%, #0f0f12 100%);
      pointer-events: none;
    `;
    document.body.insertBefore(fallback, document.body.firstChild);
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.remove();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.fluidMesh = new FluidMeshBackground();
  });
} else {
  window.fluidMesh = new FluidMeshBackground();
}
