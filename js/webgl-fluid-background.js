/**
 * v45.0: WebGL Fluid Simulation Background
 * Fortune 500 immersive fluid dynamics visualization
 */

(function() {
  'use strict';

  class WebGLFluidSimulation {
    constructor(container) {
      this.container = container;
      this.canvas = container.querySelector('canvas');
      this.gl = null;
      this.program = null;
      this.animationId = null;
      this.mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
      this.time = 0;
      this.isActive = true;
      
      this.init();
    }

    init() {
      if (!this.canvas) return;
      
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) {
        console.warn('WebGL not supported, falling back to CSS');
        this.fallbackMode();
        return;
      }

      this.setupCanvas();
      this.createShaders();
      this.createBuffers();
      this.addEventListeners();
      this.animate();
    }

    setupCanvas() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = this.container.getBoundingClientRect();
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      
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
        uniform vec2 mouseVelocity;
        
        #define PI 3.14159265359
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i = floor(v + dot(v, C.yyy));
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
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
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
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
          
          // Fluid dynamics simulation
          float t = time * 0.15;
          
          // Base flow field
          vec2 flow = vec2(
            snoise(vec3(uv * 2.0, t)) * 0.5,
            snoise(vec3(uv * 2.0 + 100.0, t)) * 0.5
          );
          
          // Mouse interaction - creates ripples
          vec2 mousePos = mouse;
          float mouseDist = length((uv - mousePos) * aspect);
          float mouseInfluence = smoothstep(0.4, 0.0, mouseDist);
          
          // Add mouse velocity influence
          flow += mouseVelocity * mouseInfluence * 2.0;
          
          // Distorted coordinates
          vec2 distortedUV = uv + flow * 0.3;
          
          // Layer multiple noise frequencies for fluid effect
          float n1 = snoise(vec3(distortedUV * 3.0, t * 0.5)) * 0.5 + 0.5;
          float n2 = snoise(vec3(distortedUV * 5.0 + flow, t * 0.3)) * 0.5 + 0.5;
          float n3 = snoise(vec3(distortedUV * 8.0, t * 0.2)) * 0.5 + 0.5;
          
          // Combine layers
          float fluid = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          
          // Add mouse ripple effect
          float ripple = sin(mouseDist * 20.0 - time * 3.0) * mouseInfluence * 0.3;
          fluid += ripple;
          
          // Create color gradients
          vec3 color1 = vec3(0.788, 0.808, 0.839); // #C9CED6
          vec3 color2 = vec3(0.961, 0.969, 0.980); // #F5F7FA
          vec3 color3 = vec3(0.059, 0.059, 0.073); // #0f0f12
          
          // Mix colors based on fluid value
          vec3 color = mix(color3, color1, fluid * 0.4);
          color = mix(color, color2, n2 * 0.3 * mouseInfluence);
          
          // Add subtle glow near mouse
          color += color2 * mouseInfluence * 0.15;
          
          // Vignette
          float vignette = 1.0 - length((uv - 0.5) * 1.2);
          vignette = smoothstep(0.0, 0.7, vignette);
          
          gl_FragColor = vec4(color * vignette, 1.0);
        }
      `;

      const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
      const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

      this.program = this.gl.createProgram();
      this.gl.attachShader(this.program, vertexShader);
      this.gl.attachShader(this.program, fragmentShader);
      this.gl.linkProgram(this.program);

      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        console.error('Shader program failed to link');
        return;
      }

      this.gl.useProgram(this.program);

      // Get uniform locations
      this.uniforms = {
        resolution: this.gl.getUniformLocation(this.program, 'resolution'),
        time: this.gl.getUniformLocation(this.program, 'time'),
        mouse: this.gl.getUniformLocation(this.program, 'mouse'),
        mouseVelocity: this.gl.getUniformLocation(this.program, 'mouseVelocity')
      };
    }

    compileShader(source, type) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    createBuffers() {
      const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
      ]);

      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

      const positionLocation = this.gl.getAttribLocation(this.program, 'position');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    addEventListeners() {
      let lastMouseX = 0.5;
      let lastMouseY = 0.5;
      let lastTime = performance.now();

      const handleMouseMove = (e) => {
        const rect = this.container.getBoundingClientRect();
        const currentTime = performance.now();
        const dt = (currentTime - lastTime) / 1000;
        
        const newX = (e.clientX - rect.left) / rect.width;
        const newY = 1.0 - (e.clientY - rect.top) / rect.height;
        
        // Calculate velocity
        this.mouse.vx = ((newX - lastMouseX) / dt) * 0.01;
        this.mouse.vy = ((newY - lastMouseY) / dt) * 0.01;
        
        this.mouse.x = newX;
        this.mouse.y = newY;
        
        lastMouseX = newX;
        lastMouseY = newY;
        lastTime = currentTime;
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      
      window.addEventListener('resize', () => {
        this.setupCanvas();
      }, { passive: true });

      // Visibility API for performance
      document.addEventListener('visibilitychange', () => {
        this.isActive = document.visibilityState === 'visible';
      });
    }

    fallbackMode() {
      // CSS fallback for non-WebGL browsers
      this.container.style.background = `
        radial-gradient(ellipse at 30% 20%, rgba(201, 206, 214, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(245, 247, 250, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(201, 206, 214, 0.08) 0%, transparent 70%)
      `;
    }

    animate() {
      if (!this.isActive) {
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      }

      this.time += 0.016;

      // Update uniforms
      this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
      this.gl.uniform1f(this.uniforms.time, this.time);
      this.gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
      this.gl.uniform2f(this.uniforms.mouseVelocity, this.mouse.vx, this.mouse.vy);

      // Draw
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      // Decay velocity
      this.mouse.vx *= 0.95;
      this.mouse.vy *= 0.95;

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFluidBackground);
  } else {
    initFluidBackground();
  }

  function initFluidBackground() {
    const container = document.querySelector('.webgl-fluid-container');
    if (!container) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.style.display = 'none';
      return;
    }

    new WebGLFluidSimulation(container);
  }
})();
