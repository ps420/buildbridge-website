/**
 * WebGL Liquid Distortion Hero Effect
 * Fortune 500 Immersive Visual Experience
 * Creates an interactive liquid distortion effect on hero images
 */

class WebGLLiquidHero {
  constructor(options = {}) {
    this.canvas = null;
    this.gl = null;
    this.container = options.container || document.querySelector('.webgl-hero-container');
    this.imageSrc = options.imageSrc || 'assets/02_Website_Heroes/Hero_1.png';
    this.program = null;
    this.texture = null;
    this.framebuffer = null;
    this.mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5 };
    this.time = 0;
    this.dissipation = options.dissipation || 0.96;
    this.distortionStrength = options.distortionStrength || 0.3;
    this.fallbackImage = null;
    this.isWebGLSupported = true;
    this.isVisible = true;
    this.rafId = null;
    
    this.vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    this.fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform sampler2D u_distortion;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_distortionStrength;
      uniform vec2 u_resolution;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample distortion from framebuffer
        vec4 distortionColor = texture2D(u_distortion, uv);
        vec2 distortion = distortionColor.rg * 2.0 - 1.0;
        
        // Apply distortion to UV coordinates
        vec2 distortedUV = uv + distortion * u_distortionStrength;
        
        // Sample the image with distorted coordinates
        vec4 color = texture2D(u_image, distortedUV);
        
        // Add subtle vignette
        vec2 center = uv - 0.5;
        float vignette = 1.0 - dot(center, center) * 0.5;
        color.rgb *= vignette;
        
        // Add subtle chromatic aberration near edges
        float aberration = length(distortion) * 0.02;
        color.r = texture2D(u_image, distortedUV + vec2(aberration, 0.0)).r;
        color.b = texture2D(u_image, distortedUV - vec2(aberration, 0.0)).b;
        
        gl_FragColor = color;
      }
    `;
    
    this.distortionFragmentSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_distortion;
      uniform vec2 u_mouse;
      uniform vec2 u_mouseDelta;
      uniform float u_dissipation;
      uniform float u_time;
      uniform vec2 u_resolution;
      
      void main() {
        vec2 uv = v_texCoord;
        vec4 color = texture2D(u_distortion, uv);
        
        // Dissipation - fade out over time
        color *= u_dissipation;
        
        // Add mouse influence
        vec2 mousePos = u_mouse;
        vec2 mouseDelta = u_mouseDelta;
        float dist = distance(uv, mousePos);
        float radius = 0.15;
        
        if (dist < radius) {
          float strength = (1.0 - dist / radius) * length(mouseDelta) * 2.0;
          vec2 direction = normalize(mouseDelta + 0.001);
          color.rg += direction * strength;
        }
        
        // Add subtle noise
        float noise = fract(sin(dot(uv + u_time * 0.01, vec2(12.9898, 78.233))) * 43758.5453);
        color *= 0.99 + noise * 0.02;
        
        gl_FragColor = color;
      }
    `;
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.warn('WebGL Hero: No container found');
      return;
    }
    
    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      this.enableFallback();
      return;
    }
    
    this.createCanvas();
    this.createFallback();
    this.setupWebGL();
    this.loadImage();
    this.bindEvents();
    this.animate();
    
    console.log('🌊 WebGL Liquid Hero initialized');
  }
  
  checkWebGLSupport() {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    this.isWebGLSupported = !!gl;
    return this.isWebGLSupported;
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'webgl-canvas';
    this.container.appendChild(this.canvas);
    
    // Set canvas size
    this.resize();
  }
  
  createFallback() {
    this.fallbackImage = document.createElement('div');
    this.fallbackImage.className = 'webgl-fallback-image';
    this.fallbackImage.style.backgroundImage = `url(${this.imageSrc})`;
    this.container.appendChild(this.fallbackImage);
  }
  
  resize() {
    if (!this.canvas) return;
    
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    
    if (!this.gl) {
      this.enableFallback();
      return;
    }
    
    // Create shaders
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);
    const distortionFragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.distortionFragmentSource);
    
    // Create programs
    this.renderProgram = this.createProgram(vertexShader, fragmentShader);
    this.distortionProgram = this.createProgram(vertexShader, distortionFragmentShader);
    
    // Create geometry
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), this.gl.STATIC_DRAW);
    
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 1
    ]), this.gl.STATIC_DRAW);
    
    // Create framebuffers for ping-pong rendering
    this.createFramebuffers();
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
  
  createProgram(vertexShader, fragmentShader) {
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
  
  createFramebuffers() {
    this.framebuffers = [];
    this.textures = [];
    
    for (let i = 0; i < 2; i++) {
      const texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.width, this.canvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      
      const framebuffer = this.gl.createFramebuffer();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
      
      this.textures.push(texture);
      this.framebuffers.push(framebuffer);
    }
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.currentFramebuffer = 0;
  }
  
  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => {
      this.createImageTexture();
      this.fallbackImage.classList.add('visible');
    };
    this.image.onerror = () => {
      this.enableFallback();
    };
    this.image.src = this.imageSrc;
  }
  
  createImageTexture() {
    this.imageTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }
  
  bindEvents() {
    // Mouse tracking
    let lastMoveTime = 0;
    this.container.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime < 16) return; // Throttle to ~60fps
      lastMoveTime = now;
      
      const rect = this.container.getBoundingClientRect();
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    }, { passive: true });
    
    // Touch support
    this.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = (touch.clientX - rect.left) / rect.width;
      this.mouse.y = 1.0 - (touch.clientY - rect.top) / rect.height;
    }, { passive: false });
    
    // Resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 100);
    }, { passive: true });
    
    // Visibility handling
    document.addEventListener('visibilitychange', () => {
      this.isVisible = document.visibilityState === 'visible';
    });
    
    // Click ripple effect
    this.container.addEventListener('click', (e) => {
      this.createRipple(e.clientX, e.clientY);
    });
  }
  
  createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'webgl-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1500);
  }
  
  renderDistortion() {
    this.gl.useProgram(this.distortionProgram);
    
    // Bind input texture from previous frame
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.currentFramebuffer]);
    
    // Bind output framebuffer
    const outputIndex = 1 - this.currentFramebuffer;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers[outputIndex]);
    
    // Set uniforms
    const uDistortion = this.gl.getUniformLocation(this.distortionProgram, 'u_distortion');
    const uMouse = this.gl.getUniformLocation(this.distortionProgram, 'u_mouse');
    const uMouseDelta = this.gl.getUniformLocation(this.distortionProgram, 'u_mouseDelta');
    const uDissipation = this.gl.getUniformLocation(this.distortionProgram, 'u_dissipation');
    const uTime = this.gl.getUniformLocation(this.distortionProgram, 'u_time');
    const uResolution = this.gl.getUniformLocation(this.distortionProgram, 'u_resolution');
    
    this.gl.uniform1i(uDistortion, 0);
    this.gl.uniform2f(uMouse, this.mouse.x, this.mouse.y);
    this.gl.uniform2f(uMouseDelta, this.mouse.x - this.mouse.prevX, this.mouse.y - this.mouse.prevY);
    this.gl.uniform1f(uDissipation, this.dissipation);
    this.gl.uniform1f(uTime, this.time);
    this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
    
    // Draw
    this.drawQuad(this.distortionProgram);
    
    // Swap framebuffers
    this.currentFramebuffer = outputIndex;
  }
  
  renderImage() {
    this.gl.useProgram(this.renderProgram);
    
    // Bind textures
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.currentFramebuffer]);
    
    // Unbind framebuffer (render to screen)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    
    // Set uniforms
    const uImage = this.gl.getUniformLocation(this.renderProgram, 'u_image');
    const uDistortion = this.gl.getUniformLocation(this.renderProgram, 'u_distortion');
    const uMouse = this.gl.getUniformLocation(this.renderProgram, 'u_mouse');
    const uTime = this.gl.getUniformLocation(this.renderProgram, 'u_time');
    const uDistortionStrength = this.gl.getUniformLocation(this.renderProgram, 'u_distortionStrength');
    const uResolution = this.gl.getUniformLocation(this.renderProgram, 'u_resolution');
    
    this.gl.uniform1i(uImage, 0);
    this.gl.uniform1i(uDistortion, 1);
    this.gl.uniform2f(uMouse, this.mouse.x, this.mouse.y);
    this.gl.uniform1f(uTime, this.time);
    this.gl.uniform1f(uDistortionStrength, this.distortionStrength);
    this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
    
    // Draw
    this.drawQuad(this.renderProgram);
  }
  
  drawQuad(program) {
    const aPosition = this.gl.getAttribLocation(program, 'a_position');
    const aTexCoord = this.gl.getAttribLocation(program, 'a_texCoord');
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(aTexCoord);
    this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0);
    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
  
  animate() {
    if (!this.isVisible) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.time += 0.016;
    
    if (this.gl && this.imageTexture) {
      this.renderDistortion();
      this.renderImage();
    }
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  enableFallback() {
    this.isWebGLSupported = false;
    if (this.fallbackImage) {
      this.fallbackImage.classList.add('visible');
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    console.log('WebGL not supported, fallback enabled');
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.gl) {
      this.gl.deleteProgram(this.renderProgram);
      this.gl.deleteProgram(this.distortionProgram);
      this.gl.deleteTexture(this.imageTexture);
      this.gl.deleteTexture(this.textures[0]);
      this.gl.deleteTexture(this.textures[1]);
      this.gl.deleteFramebuffer(this.framebuffers[0]);
      this.gl.deleteFramebuffer(this.framebuffers[1]);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for mobile/touch devices - skip WebGL for performance
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  
  if (!isTouchDevice && document.querySelector('.webgl-hero-container')) {
    window.webglHero = new WebGLLiquidHero({
      container: document.querySelector('.webgl-hero-container'),
      imageSrc: 'assets/02_Website_Heroes/Hero_1.png',
      dissipation: 0.96,
      distortionStrength: 0.4
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebGLLiquidHero;
}
