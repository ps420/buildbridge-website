/**
 * BuildBridge v49.0 - WebGL Atmospheric Fog Effect
 * Fortune 500 Immersive Background System
 * 
 * Features:
 * - Procedural volumetric fog using shaders
 * - Mouse-responsive fog movement
 * - Scroll-based fog intensity
 * - Performance-optimized with offscreen rendering
 */

class WebGLAtmosphericFog {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.webgl-atmospheric-fog');
    if (!this.container) return;
    
    this.options = {
      density: options.density || 0.5,
      speed: options.speed || 0.3,
      color1: options.color1 || [0.79, 0.81, 0.84], // #C9CED6
      color2: options.color2 || [0.71, 0.73, 0.76], // Slightly darker
      interactWithMouse: options.interactWithMouse !== false,
      scrollResponsive: options.scrollResponsive !== false,
      ...options
    };
    
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.time = 0;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.scrollProgress = 0;
    this.isVisible = true;
    
    this.init();
  }
  
  init() {
    // Check for WebGL support
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    }) || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.log('WebGL not supported, using CSS fallback');
      this.enableCSSFallback();
      return;
    }
    
    this.container.appendChild(this.canvas);
    this.setupShaders();
    this.setupGeometry();
    this.setupEvents();
    this.resize();
    this.animate();
    
    // Mark as loaded
    setTimeout(() => {
      this.container.classList.add('webgl-atmospheric-fog--loaded');
    }, 100);
    
    // Setup intersection observer for visibility
    this.setupVisibilityObserver();
  }
  
  setupShaders() {
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_density;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_scrollProgress;
      
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
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                                dot(x12.zw, x12.zw)), 0.0);
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
        vec2 uv = v_texCoord;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        
        // Mouse influence
        vec2 mouseInfluence = (u_mouse - 0.5) * 0.1;
        
        // Create flowing fog layers
        float time = u_time * 0.05;
        
        // Layer 1: Large slow-moving fog
        vec2 p1 = uv * 2.0 * aspect + vec2(time * 0.5, time * 0.3) + mouseInfluence;
        float fog1 = fbm(p1);
        
        // Layer 2: Medium details
        vec2 p2 = uv * 4.0 * aspect + vec2(-time * 0.7, time * 0.4) - mouseInfluence * 0.5;
        float fog2 = fbm(p2);
        
        // Layer 3: Fine details
        vec2 p3 = uv * 8.0 * aspect + vec2(time * 0.2, -time * 0.6);
        float fog3 = fbm(p3);
        
        // Combine layers
        float fog = fog1 * 0.5 + fog2 * 0.3 + fog3 * 0.2;
        
        // Smooth and heighten contrast
        fog = smoothstep(-0.5, 1.0, fog);
        
        // Apply density
        fog *= u_density * (1.0 - u_scrollProgress * 0.5);
        
        // Vertical gradient - more fog at bottom
        float verticalGradient = 1.0 - uv.y * 0.5;
        fog *= verticalGradient;
        
        // Edge fade
        vec2 edgeDist = min(uv, 1.0 - uv);
        float edgeFade = smoothstep(0.0, 0.2, min(edgeDist.x, edgeDist.y));
        fog *= edgeFade;
        
        // Mix colors based on fog density
        vec3 color = mix(u_color1, u_color2, fog);
        
        // Alpha based on fog intensity
        float alpha = fog * 0.4;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    
    // Get uniform locations
    this.uniforms = {
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      density: this.gl.getUniformLocation(this.program, 'u_density'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      scrollProgress: this.gl.getUniformLocation(this.program, 'u_scrollProgress')
    };
    
    // Get attribute locations
    this.attributes = {
      position: this.gl.getAttribLocation(this.program, 'a_position'),
      texCoord: this.gl.getAttribLocation(this.program, 'a_texCoord')
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
  
  setupGeometry() {
    // Full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]);
    
    // Create and bind position buffer
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    // Create and bind texCoord buffer
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }
  
  setupEvents() {
    // Mouse tracking
    if (this.options.interactWithMouse) {
      let mouseTimeout;
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX / window.innerWidth;
        this.mouseY = 1.0 - (e.clientY / window.innerHeight);
        
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
          this.mouseX = 0.5;
          this.mouseY = 0.5;
        }, 100);
      }, { passive: true });
    }
    
    // Scroll tracking
    if (this.options.scrollResponsive) {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollProgress = scrollTop / docHeight;
      }, { passive: true });
    }
    
    // Resize handling
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }
  
  setupVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animationId) {
          this.animate();
        }
      });
    }, { threshold: 0 });
    
    observer.observe(this.container);
  }
  
  resize() {
    if (!this.gl) return;
    
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  animate() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }
    
    this.time += this.options.speed;
    
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    this.gl.useProgram(this.program);
    
    // Update uniforms
    this.gl.uniform1f(this.uniforms.time, this.time);
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
    this.gl.uniform1f(this.uniforms.density, this.options.density);
    this.gl.uniform3fv(this.uniforms.color1, this.options.color1);
    this.gl.uniform3fv(this.uniforms.color2, this.options.color2);
    this.gl.uniform1f(this.uniforms.scrollProgress, this.scrollProgress);
    
    // Bind position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(this.attributes.position);
    this.gl.vertexAttribPointer(this.attributes.position, 2, this.gl.FLOAT, false, 0, 0);
    
    // Bind texCoord attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(this.attributes.texCoord);
    this.gl.vertexAttribPointer(this.attributes.texCoord, 2, this.gl.FLOAT, false, 0, 0);
    
    // Enable blending for transparency
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  enableCSSFallback() {
    const fallback = document.createElement('div');
    fallback.className = 'fog-fallback';
    this.container.appendChild(fallback);
    this.container.classList.add('webgl-atmospheric-fog--loaded');
  }
  
  setDensity(density) {
    this.options.density = Math.max(0, Math.min(1, density));
  }
  
  setSpeed(speed) {
    this.options.speed = speed;
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Main atmospheric fog
  const fogContainers = document.querySelectorAll('.webgl-atmospheric-fog');
  fogContainers.forEach(container => {
    const density = parseFloat(container.dataset.density) || 0.5;
    const speed = parseFloat(container.dataset.speed) || 0.3;
    const interactWithMouse = container.dataset.mouse !== 'false';
    
    new WebGLAtmosphericFog({
      container,
      density,
      speed,
      interactWithMouse,
      scrollResponsive: true
    });
  });
});

export default WebGLAtmosphericFog;
