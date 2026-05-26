/**
 * BuildBridge WebGL Hero Background
 * Premium shader-based gradient animation for Fortune 500 quality
 * Version: 1.0.0
 */

class WebGLHeroBackground {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '.hero');
    if (!this.container) return;
    
    // Skip on mobile/touch devices for performance
    if (window.matchMedia('(pointer: coarse)').matches && options.skipMobile !== false) {
      this.createFallback();
      return;
    }
    
    this.colors = options.colors || {
      primary: [0.12, 0.13, 0.14],    // #1e1e23
      secondary: [0.06, 0.06, 0.07],   // #0f0f12
      accent: [0.79, 0.81, 0.84],      // #C9CED6 chrome
      highlight: [0.15, 0.15, 0.16]    // subtle highlight
    };
    
    this.speed = options.speed || 0.0003;
    this.mouseInfluence = options.mouseInfluence || 0.3;
    
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.targetMouseX = 0.5;
    this.targetMouseY = 0.5;
    this.time = 0;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.initWebGL();
    if (this.gl) {
      this.createShaderProgram();
      this.setupGeometry();
      this.bindEvents();
      this.animate();
    } else {
      this.createFallback();
    }
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'webgl-hero-bg';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;
    this.container.style.position = 'relative';
    this.container.insertBefore(this.canvas, this.container.firstChild);
    
    this.resize();
  }
  
  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = this.container.offsetWidth * dpr;
    this.canvas.height = this.container.offsetHeight * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  initWebGL() {
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    }) || this.canvas.getContext('experimental-webgl');
  }
  
  createShaderProgram() {
    const gl = this.gl;
    
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    
    // Fragment shader with organic gradient noise
    const fragmentShaderSource = `
      precision highp float;
      
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_colorPrimary;
      uniform vec3 u_colorSecondary;
      uniform vec3 u_colorAccent;
      uniform vec3 u_colorHighlight;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        
        // Create flowing noise
        float time = u_time * 0.15;
        vec2 q = vec2(0.0);
        q.x = fbm(uv * 2.0 + time * 0.3);
        q.y = fbm(uv * 2.0 + vec2(1.0) + time * 0.2);
        
        vec2 r = vec2(0.0);
        r.x = fbm(uv * 2.0 + q + vec2(1.7, 9.2) + 0.15 * time);
        r.y = fbm(uv * 2.0 + q + vec2(8.3, 2.8) + 0.126 * time);
        
        float f = fbm(uv * 2.0 + r);
        
        // Mouse influence
        vec2 mouseInfluence = (u_mouse - 0.5) * 0.1;
        f += dot(r - mouseInfluence, vec2(0.3));
        
        // Color mixing
        vec3 color = mix(u_colorSecondary, u_colorPrimary, clamp(f * 1.5 + 0.3, 0.0, 1.0));
        color = mix(color, u_colorHighlight, clamp(length(q) * 0.4, 0.0, 0.3));
        color = mix(color, u_colorAccent, clamp(length(r.x) * 0.15, 0.0, 0.08));
        
        // Add subtle vignette
        float vignette = 1.0 - dot((uv - 0.5) * 1.2, (uv - 0.5) * 1.2);
        color *= smoothstep(0.0, 1.0, vignette * 0.5 + 0.5);
        
        // Output
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('WebGL program linking failed');
      return;
    }
    
    // Get uniform locations
    this.uniforms = {
      time: gl.getUniformLocation(this.program, 'u_time'),
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      colorPrimary: gl.getUniformLocation(this.program, 'u_colorPrimary'),
      colorSecondary: gl.getUniformLocation(this.program, 'u_colorSecondary'),
      colorAccent: gl.getUniformLocation(this.program, 'u_colorAccent'),
      colorHighlight: gl.getUniformLocation(this.program, 'u_colorHighlight')
    };
  }
  
  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  
  setupGeometry() {
    const gl = this.gl;
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
  }
  
  bindEvents() {
    // Mouse movement
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouseX = (e.clientX - rect.left) / rect.width;
      this.targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    }, { passive: true });
    
    // Window resize
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
  
  animate() {
    if (!this.gl || !this.program) return;
    
    const gl = this.gl;
    
    // Smooth mouse interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    this.time += this.speed;
    
    // Set uniforms
    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.time, this.time);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
    gl.uniform3fv(this.uniforms.colorPrimary, this.colors.primary);
    gl.uniform3fv(this.uniforms.colorSecondary, this.colors.secondary);
    gl.uniform3fv(this.uniforms.colorAccent, this.colors.accent);
    gl.uniform3fv(this.uniforms.colorHighlight, this.colors.highlight);
    
    // Draw
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  resume() {
    if (!this.animationId) {
      this.animate();
    }
  }
  
  createFallback() {
    // Create CSS gradient fallback for non-WebGL browsers/mobile
    const fallback = document.createElement('div');
    fallback.className = 'webgl-fallback-bg';
    fallback.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: 
        radial-gradient(ellipse at 20% 30%, rgba(201, 206, 214, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(168, 173, 181, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, #0f0f12 0%, #1e1e23 100%);
      animation: hero-gradient-shift 15s ease-in-out infinite;
    `;
    this.container.insertBefore(fallback, this.container.firstChild);
  }
  
  destroy() {
    this.pause();
    if (this.gl) {
      this.gl.deleteProgram(this.program);
      this.gl.deleteBuffer(this.buffer);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on hero section
  if (document.querySelector('.hero')) {
    window.webglHero = new WebGLHeroBackground({
      container: '.hero',
      speed: 0.0005,
      mouseInfluence: 0.3,
      skipMobile: true
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebGLHeroBackground;
}
