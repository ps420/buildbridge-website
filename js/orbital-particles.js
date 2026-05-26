/**
 * BuildBridge Fortune 500 Orbital Particles System
 * 3D ambient orbital elements for hero section
 * Version: 2.0 Professional
 */

class BuildBridgeOrbitalParticles {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      console.warn('OrbitalParticles: Container not found');
      return;
    }

    this.options = {
      particleCount: options.particleCount || 25,
      orbitCount: options.orbitCount || 3,
      colors: options.colors || ['#c9ced6', '#525862', '#2a2d34'],
      sizes: options.sizes || [4, 8, 12],
      speed: options.speed || 1,
      perspective: options.perspective || 1000,
      mouseInfluence: options.mouseInfluence !== false,
      mouseRadius: options.mouseRadius || 150,
      trailEffect: options.trailEffect || false,
      glowEffect: options.glowEffect !== false,
      responsive: options.responsive !== false,
      ...options
    };

    this.particles = [];
    this.orbits = [];
    this.mouse = { x: 0, y: 0, active: false };
    this.containerRect = null;
    this.center = { x: 0, y: 0 };
    this.animationId = null;
    this.isActive = true;

    this.init();
  }

  init() {
    this.setupContainer();
    this.createOrbits();
    this.createParticles();
    this.bindEvents();
    this.startAnimation();
  }

  setupContainer() {
    this.container.style.cssText += `
      position: relative;
      perspective: ${this.options.perspective}px;
      overflow: hidden;
    `;
    
    this.updateDimensions();
  }

  updateDimensions() {
    this.containerRect = this.container.getBoundingClientRect();
    this.center = {
      x: this.containerRect.width / 2,
      y: this.containerRect.height / 2
    };
  }

  createOrbits() {
    const orbitRadii = [];
    const maxRadius = Math.min(this.containerRect.width, this.containerRect.height) * 0.4;
    
    for (let i = 0; i < this.options.orbitCount; i++) {
      const radius = maxRadius * (0.3 + i * 0.3);
      orbitRadii.push(radius);
      
      // Create visual orbit ring (optional)
      const orbit = document.createElement('div');
      orbit.className = 'orbital-ring';
      orbit.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        border: 1px solid rgba(201, 206, 214, 0.08);
        border-radius: 50%;
        transform: translate(-50%, -50%) rotateX(60deg);
        transform-style: preserve-3d;
        pointer-events: none;
      `;
      
      this.container.appendChild(orbit);
      
      this.orbits.push({
        element: orbit,
        radius: radius,
        angle: Math.random() * Math.PI * 2,
        speed: (0.001 + i * 0.0005) * this.options.speed,
        tilt: 60 + Math.random() * 10 - 5
      });
    }
    
    this.orbitRadii = orbitRadii;
  }

  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      const particle = this.createParticle(i);
      this.particles.push(particle);
    }
  }

  createParticle(index) {
    const orbitIndex = index % this.options.orbitCount;
    const orbitRadius = this.orbitRadii[orbitIndex];
    
    // Random properties
    const sizeIndex = Math.floor(Math.random() * this.options.sizes.length);
    const size = this.options.sizes[sizeIndex];
    const colorIndex = Math.floor(Math.random() * this.options.colors.length);
    const color = this.options.colors[colorIndex];
    
    // Position
    const angle = (Math.PI * 2 * index) / this.options.particleCount + Math.random();
    const distanceFromOrbit = (Math.random() - 0.5) * 40;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'orbital-particle';
    
    // Glow effect
    const glowStyle = this.options.glowEffect ? `
      box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}40;
    ` : '';
    
    element.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      opacity: ${0.3 + Math.random() * 0.5};
      ${glowStyle}
      transform-style: preserve-3d;
      will-change: transform, opacity;
    `;
    
    // Trail element if enabled
    let trailElement = null;
    if (this.options.trailEffect) {
      trailElement = document.createElement('div');
      trailElement.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.2;
        filter: blur(4px);
        will-change: transform;
      `;
      this.container.appendChild(trailElement);
    }
    
    this.container.appendChild(element);
    
    return {
      element: element,
      trailElement: trailElement,
      orbitIndex: orbitIndex,
      orbitRadius: orbitRadius,
      distanceFromOrbit: distanceFromOrbit,
      angle: angle,
      angleSpeed: (0.002 + Math.random() * 0.003) * this.options.speed * (Math.random() > 0.5 ? 1 : -1),
      size: size,
      color: color,
      tilt: Math.random() * 360,
      rotateSpeed: (Math.random() - 0.5) * 0.02,
      zOffset: (Math.random() - 0.5) * 200,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    };
  }

  bindEvents() {
    // Mouse movement
    if (this.options.mouseInfluence) {
      this.container.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
      this.container.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
      this.container.addEventListener('mouseenter', () => {
        this.mouse.active = true;
      });
    }
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
    });
    
    // Resize
    window.addEventListener('resize', () => {
      this.updateDimensions();
      // Re-position based on new center
    });
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;
  }

  startAnimation() {
    this.animate();
  }

  animate() {
    if (!this.isActive) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
      return;
    }
    
    const time = performance.now() * 0.001;
    
    this.particles.forEach(particle => {
      // Update angle
      particle.angle += particle.angleSpeed;
      
      // Calculate position with 3D orbit
      const orbit = this.orbits[particle.orbitIndex];
      const tiltRad = (orbit.tilt * Math.PI) / 180;
      
      // Base position on orbit
      let x = Math.cos(particle.angle) * particle.orbitRadius;
      let y = Math.sin(particle.angle) * particle.orbitRadius * Math.sin(tiltRad);
      let z = Math.sin(particle.angle) * particle.orbitRadius * Math.cos(tiltRad) + particle.zOffset;
      
      // Add distance variation
      x += Math.cos(particle.angle * 2) * particle.distanceFromOrbit;
      y += Math.sin(particle.angle * 3) * particle.distanceFromOrbit * 0.5;
      
      // Mouse influence
      if (this.options.mouseInfluence && this.mouse.active) {
        const dx = this.mouse.x - (this.center.x + x);
        const dy = this.mouse.y - (this.center.y + y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.mouseRadius) {
          const force = (1 - distance / this.options.mouseRadius) * 30;
          x -= (dx / distance) * force;
          y -= (dy / distance) * force;
          z += force * 2;
        }
      }
      
      // Apply position
      const scale = 1 + z / 400;
      const opacity = Math.max(0.1, Math.min(1, 0.5 + z / 300));
      
      // Pulse effect
      const pulse = Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.2 + 1;
      
      particle.element.style.transform = `
        translate3d(${this.center.x + x}px, ${this.center.y + y}px, ${z}px)
        scale(${scale * pulse})
        rotate(${particle.tilt}deg)
      `;
      particle.element.style.opacity = opacity;
      
      // Update trail
      if (particle.trailElement) {
        particle.trailElement.style.transform = `
          translate3d(${this.center.x + x}px, ${this.center.y + y}px, ${z - 20}px)
          scale(${scale * 0.8})
        `;
      }
      
      // Update tilt
      particle.tilt += particle.rotateSpeed;
    });
    
    // Animate orbit rings
    this.orbits.forEach((orbit, index) => {
      orbit.angle += orbit.speed;
      orbit.element.style.transform = `
        translate(-50%, -50%)
        rotateX(${orbit.tilt}deg)
        rotateZ(${orbit.angle * 10}deg)
      `;
      orbit.element.style.opacity = 0.3 + Math.sin(time + index) * 0.1;
    });
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  // Public API
  addParticle(options = {}) {
    const particle = this.createParticle(this.particles.length);
    
    if (options.color) particle.element.style.background = options.color;
    if (options.size) {
      particle.element.style.width = `${options.size}px`;
      particle.element.style.height = `${options.size}px`;
    }
    if (options.orbitIndex !== undefined) {
      particle.orbitIndex = options.orbitIndex % this.options.orbitCount;
      particle.orbitRadius = this.orbitRadii[particle.orbitIndex];
    }
    
    this.particles.push(particle);
    return particle;
  }

  setSpeed(speed) {
    this.options.speed = speed;
    this.particles.forEach(p => {
      p.angleSpeed = p.angleSpeed / Math.abs(p.angleSpeed) * (0.002 + Math.random() * 0.003) * speed;
    });
  }

  pause() {
    this.isActive = false;
  }

  resume() {
    this.isActive = true;
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.particles.forEach(p => {
      p.element.remove();
      if (p.trailElement) p.trailElement.remove();
    });
    
    this.orbits.forEach(o => {
      o.element.remove();
    });
    
    this.particles = [];
    this.orbits = [];
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize in hero section
  const hero = document.querySelector('.hero-visual');
  if (hero) {
    window.heroOrbitals = new BuildBridgeOrbitalParticles(hero, {
      particleCount: 20,
      orbitCount: 3,
      colors: ['#c9ced6', '#525862', '#ffffff'],
      sizes: [3, 6, 9],
      speed: 0.8,
      mouseInfluence: true,
      glowEffect: true
    });
    
    console.log('🪐 BuildBridge Orbital Particles initialized in hero');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuildBridgeOrbitalParticles;
}
