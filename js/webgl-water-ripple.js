/**
 * v36.0: WebGL Water Ripple Effect
 * Fortune 500 Interactive Background System
 * Creates realistic water ripple simulation using WebGL shaders
 */

class WaterRippleSystem {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.isActive = true;
    this.mousePos = { x: 0.5, y: 0.5 };
    this.ripples = [];
    this.time = 0;
    this.config = {
      intensity: 0.5,
      speed: 1.0,
      damping: 0.96,
      dropSize: 0.03
    };
    
    this.presets = {
      calm: { intensity: 0.2, speed: 0.5, damping: 0.98, dropSize: 0.02 },
      gentle: { intensity: 0.5, speed: 1.0, damping: 0.96, dropSize: 0.03 },
      dynamic: { intensity: 0.8, speed: 1.5, damping: 0.94, dropSize: 0.04 },
      storm: { intensity: 1.0, speed: 2.0, damping: 0.92, dropSize: 0.05 }
    };
    
    this.init();
  }
  
  init() {
    if (!this.checkWebGLSupport()) {
      console.warn('WebGL not supported, water ripple disabled');
      return;
    }
    
    this.createElements();
    this.initWebGL();
    this.createControls();
    this.bindEvents();
    this.start();
    
    // Show notice after delay
    setTimeout(() => this.showNotice(), 2000);
  }
  
  checkWebGLSupport() {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  }
  
  createElements() {
    this.container = document.createElement('div');
    this.container.className = 'water-ripple-container';
    this.container.setAttribute('aria-hidden', 'true');
    
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'water-ripple-canvas';
    
    this.container.appendChild(this.canvas);
    document.body.insertBefore(this.container, document.body.firstChild);
  }
  
  initWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) return;
    
    this.resize();
    
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    // Fragment shader for water ripple effect
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      uniform float u_speed;
      uniform sampler2D u_texture;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Create base water pattern
        float time = u_time * u_speed * 0.3;
        
        // Multiple layers of noise for water effect
        float noise1 = snoise(vec3(uv * 3.0, time)) * 0.5;
        float noise2 = snoise(vec3(uv * 6.0, time * 1.3)) * 0.25;
        float noise3 = snoise(vec3(uv * 12.0, time * 0.7)) * 0.125;
        
        float water = noise1 + noise2 + noise3;
        
        // Mouse interaction - create ripples
        float dist = distance(uv, u_mouse);
        float ripple = sin(dist * 30.0 - time * 8.0) * exp(-dist * 4.0) * u_intensity;
        
        // Combine effects
        float final = water * 0.3 + ripple * 0.5;
        
        // Create subtle color variation
        vec3 color1 = vec3(0.06, 0.06, 0.07); // Dark base
        vec3 color2 = vec3(0.12, 0.12, 0.14); // Slightly lighter
        vec3 accent = vec3(0.78, 0.81, 0.84); // Chrome accent
        
        vec3 baseColor = mix(color1, color2, final + 0.5);
        vec3 finalColor = mix(baseColor, accent, abs(final) * 0.1 * u_intensity);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    
    // Set up geometry
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]);
    
    const texCoords = new Float32Array([
      0, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 1
    ]);
    
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    
    this.buffers = {
      position: positionBuffer,
      texCoord: texCoordBuffer
    };
    
    // Get uniform locations
    this.uniforms = {
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
      speed: this.gl.getUniformLocation(this.program, 'u_speed')
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
  
  createControls() {
    // Main controls
    const controls = document.createElement('div');
    controls.className = 'ripple-controls';
    controls.innerHTML = `
      <button class="ripple-control-btn" data-action="toggle" title="Toggle Effect">💧</button>
      <button class="ripple-control-btn" data-action="increase" title="Increase Intensity">+</button>
      <button class="ripple-control-btn" data-action="decrease" title="Decrease Intensity">−</button>
    `;
    document.body.appendChild(controls);
    this.controls = controls;
    
    // Intensity indicator
    const intensity = document.createElement('div');
    intensity.className = 'ripple-intensity';
    intensity.innerHTML = `
      <div class="ripple-intensity-label">Ripple Intensity</div>
      <div class="ripple-intensity-bar">
        <div class="ripple-intensity-fill"></div>
      </div>
    `;
    document.body.appendChild(intensity);
    this.intensityEl = intensity;
    
    // Preset buttons
    const presetContainer = document.createElement('div');
    presetContainer.className = 'ripple-preset';
    
    Object.keys(this.presets).forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'ripple-preset-btn';
      btn.dataset.preset = preset;
      btn.innerHTML = `<span class="ripple-preset-tooltip">${preset.charAt(0).toUpperCase() + preset.slice(1)}</span>`;
      if (preset === 'gentle') btn.classList.add('active');
      presetContainer.appendChild(btn);
    });
    
    document.body.appendChild(presetContainer);
    this.presetContainer = presetContainer;
    
    // Show controls after delay
    setTimeout(() => {
      controls.classList.add('visible');
      intensity.classList.add('visible');
    }, 1000);
  }
  
  createNotice() {
    const notice = document.createElement('div');
    notice.className = 'ripple-notice';
    notice.innerHTML = `
      <button class="ripple-notice-close">✕</button>
      <div class="ripple-notice-title">💧 Interactive Water Effect</div>
      <div class="ripple-notice-text">
        Move your cursor to create ripples. Use the controls to adjust intensity or select different presets.
      </div>
    `;
    document.body.appendChild(notice);
    this.notice = notice;
    
    notice.querySelector('.ripple-notice-close').addEventListener('click', () => {
      notice.classList.remove('visible');
      localStorage.setItem('rippleNoticeDismissed', 'true');
    });
  }
  
  showNotice() {
    if (localStorage.getItem('rippleNoticeDismissed')) return;
    
    if (!this.notice) {
      this.createNotice();
    }
    this.notice.classList.add('visible');
    
    setTimeout(() => {
      this.notice.classList.remove('visible');
    }, 6000);
  }
  
  bindEvents() {
    // Mouse tracking
    let mouseTimeout;
    document.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX / window.innerWidth;
      this.mousePos.y = 1.0 - (e.clientY / window.innerHeight);
      this.container.classList.add('active');
      
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        this.container.classList.remove('active');
      }, 100);
    }, { passive: true });
    
    // Control buttons
    this.controls.addEventListener('click', (e) => {
      const btn = e.target.closest('.ripple-control-btn');
      if (!btn) return;
      
      const action = btn.dataset.action;
      
      switch(action) {
        case 'toggle':
          this.isActive = !this.isActive;
          btn.classList.toggle('active', this.isActive);
          this.container.style.opacity = this.isActive ? '' : '0';
          break;
        case 'increase':
          this.config.intensity = Math.min(1, this.config.intensity + 0.1);
          this.updateIntensityDisplay();
          break;
        case 'decrease':
          this.config.intensity = Math.max(0.1, this.config.intensity - 0.1);
          this.updateIntensityDisplay();
          break;
      }
    });
    
    // Preset buttons
    this.presetContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.ripple-preset-btn');
      if (!btn) return;
      
      this.presetContainer.querySelectorAll('.ripple-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const preset = this.presets[btn.dataset.preset];
      if (preset) {
        this.config = { ...preset };
        this.updateIntensityDisplay();
      }
    });
    
    // Resize
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
    
    // Reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.destroy();
    }
  }
  
  updateIntensityDisplay() {
    const fill = this.intensityEl.querySelector('.ripple-intensity-fill');
    if (fill) {
      fill.style.width = `${this.config.intensity * 100}%`;
    }
  }
  
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  start() {
    if (this.animationId) return;
    this.animate();
  }
  
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
    if (!this.animationId) this.animate();
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = null;
      return;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
    this.render();
  }
  
  render() {
    if (!this.gl || !this.program) return;
    
    this.time += 0.016;
    
    this.gl.clearColor(0.06, 0.06, 0.07, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    this.gl.useProgram(this.program);
    
    // Bind position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.enableVertexAttribArray(this.attributes.position);
    this.gl.vertexAttribPointer(this.attributes.position, 2, this.gl.FLOAT, false, 0, 0);
    
    // Bind texCoord buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texCoord);
    this.gl.enableVertexAttribArray(this.attributes.texCoord);
    this.gl.vertexAttribPointer(this.attributes.texCoord, 2, this.gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    this.gl.uniform1f(this.uniforms.time, this.time);
    this.gl.uniform2f(this.uniforms.mouse, this.mousePos.x, this.mousePos.y);
    this.gl.uniform1f(this.uniforms.intensity, this.config.intensity);
    this.gl.uniform1f(this.uniforms.speed, this.config.speed);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.controls && this.controls.parentNode) {
      this.controls.parentNode.removeChild(this.controls);
    }
    if (this.intensityEl && this.intensityEl.parentNode) {
      this.intensityEl.parentNode.removeChild(this.intensityEl);
    }
    if (this.presetContainer && this.presetContainer.parentNode) {
      this.presetContainer.parentNode.removeChild(this.presetContainer);
    }
    if (this.notice && this.notice.parentNode) {
      this.notice.parentNode.removeChild(this.notice);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.waterRippleSystem = new WaterRippleSystem();
  });
} else {
  window.waterRippleSystem = new WaterRippleSystem();
}
