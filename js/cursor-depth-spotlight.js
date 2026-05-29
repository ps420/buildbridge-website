/**
 * v84.0: Cursor Depth Spotlight System
 * Fortune 500 Interactive Lighting Effect
 * 
 * Features:
 * - Multi-layer spotlight with depth/fog
 * - Chromatic aberration effect
 * - Smooth interpolation with velocity
 * - Trail particles
 * - Element-specific glow reactions
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  
  if (prefersReducedMotion || isTouchDevice) return;

  // Configuration
  const config = {
    lerpFactor: 0.12,
    maxSpeed: 50,
    trailCount: 5,
    activeZone: 0.9 // Only active in top 90% of viewport
  };

  // State
  const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    velocityX: 0,
    velocityY: 0,
    isActive: true,
    trails: [],
    lastTrailTime: 0,
    rafId: null,
    hoverTarget: null
  };

  // Create spotlight elements
  function createSpotlight() {
    const container = document.createElement('div');
    container.className = 'cursor-depth-spotlight active';
    container.setAttribute('aria-hidden', 'true');
    
    container.innerHTML = `
      <div class="cursor-spotlight-fog-2"></div>
      <div class="cursor-spotlight-fog-1"></div>
      <div class="cursor-spotlight-core"></div>
      <div class="cursor-spotlight-chromatic"></div>
      <div class="cursor-spotlight-inner"></div>
      <div class="cursor-spotlight-glow"></div>
    `;
    
    document.body.appendChild(container);
    
    // Create depth shadow
    const shadow = document.createElement('div');
    shadow.className = 'cursor-depth-shadow active';
    shadow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shadow);
    
    // Create trail container
    const trailContainer = document.createElement('div');
    trailContainer.className = 'cursor-spotlight-trail-container';
    trailContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9996;overflow:hidden;';
    document.body.appendChild(trailContainer);
    
    return {
      container,
      elements: {
        core: container.querySelector('.cursor-spotlight-core'),
        inner: container.querySelector('.cursor-spotlight-inner'),
        fog1: container.querySelector('.cursor-spotlight-fog-1'),
        fog2: container.querySelector('.cursor-spotlight-fog-2'),
        chromatic: container.querySelector('.cursor-spotlight-chromatic'),
        glow: container.querySelector('.cursor-spotlight-glow')
      },
      shadow,
      trailContainer
    };
  }

  const spotlight = createSpotlight();

  // Linear interpolation
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Update spotlight position
  function updateSpotlight() {
    if (!state.isActive) return;

    // Calculate velocity
    const prevX = state.currentX;
    const prevY = state.currentY;

    // Smooth follow with lerp
    state.currentX = lerp(state.currentX, state.mouseX, config.lerpFactor);
    state.currentY = lerp(state.currentY, state.mouseY, config.lerpFactor);

    // Calculate velocity for effects
    state.velocityX = state.currentX - prevX;
    state.velocityY = state.currentY - prevY;
    const velocity = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
    const normalizedVelocity = Math.min(velocity / config.maxSpeed, 1);

    // Update positions with layered depth effect
    const baseX = state.currentX;
    const baseY = state.currentY;

    // Core - fastest response
    spotlight.elements.core.style.transform = `translate(${baseX}px, ${baseY}px) translate(-50%, -50%)`;
    
    // Inner - slight lag for depth
    const innerLag = 0.95;
    spotlight.elements.inner.style.transform = `translate(${baseX * innerLag}px, ${baseY * innerLag}px) translate(-50%, -50%)`;
    
    // Fog layers - more lag for depth perception
    const fog1Lag = 0.88;
    spotlight.elements.fog1.style.transform = `translate(${baseX * fog1Lag}px, ${baseY * fog1Lag}px) translate(-50%, -50%)`;
    
    const fog2Lag = 0.82;
    spotlight.elements.fog2.style.transform = `translate(${baseX * fog2Lag}px, ${baseY * fog2Lag}px) translate(-50%, -50%)`;
    
    // Chromatic - leads slightly
    const chromaticLead = 1.05;
    const chromaticX = baseX + state.velocityX * 2;
    const chromaticY = baseY + state.velocityY * 2;
    spotlight.elements.chromatic.style.transform = `translate(${chromaticX}px, ${chromaticY}px) translate(-50%, -50%) rotate(${velocity * 0.5}deg)`;
    
    // Scale glow based on velocity
    const glowScale = 1 + normalizedVelocity * 0.5;
    spotlight.elements.glow.style.transform = `translate(${baseX}px, ${baseY}px) translate(-50%, -50%) scale(${glowScale})`;

    // Update depth shadow position
    const shadowX = (baseX / window.innerWidth) * 100;
    const shadowY = (baseY / window.innerHeight) * 100;
    spotlight.shadow.style.setProperty('--cursor-x', `${shadowX}%`);
    spotlight.shadow.style.setProperty('--cursor-y', `${shadowY}%`);

    // Create trail particles on fast movement
    if (velocity > 15 && Date.now() - state.lastTrailTime > 30) {
      createTrailParticle(baseX, baseY);
      state.lastTrailTime = Date.now();
    }

    // Update existing trails
    updateTrails();

    state.rafId = requestAnimationFrame(updateSpotlight);
  }

  // Create trail particle
  function createTrailParticle(x, y) {
    if (state.trails.length >= config.trailCount) {
      const oldTrail = state.trails.shift();
      oldTrail.remove();
    }

    const particle = document.createElement('div');
    particle.className = 'cursor-spotlight-trail';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.opacity = '0.6';
    
    spotlight.trailContainer.appendChild(particle);
    state.trails.push(particle);

    // Animate out
    requestAnimationFrame(() => {
      particle.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      particle.style.opacity = '0';
      particle.style.transform = 'translate(-50%, -50%) scale(2)';
    });

    // Remove after animation
    setTimeout(() => {
      particle.remove();
      state.trails = state.trails.filter(t => t !== particle);
    }, 600);
  }

  // Update trail positions
  function updateTrails() {
    state.trails.forEach((trail, index) => {
      const age = index / config.trailCount;
      const scale = 1 - age * 0.5;
      trail.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
  }

  // Handle mouse move
  function handleMouseMove(e) {
    // Check if in active zone (not in footer area)
    const viewportHeight = window.innerHeight;
    const activeHeight = viewportHeight * config.activeZone;
    
    if (e.clientY > activeHeight) {
      state.isActive = false;
      spotlight.container.style.opacity = '0.3';
      return;
    }
    
    state.isActive = true;
    spotlight.container.style.opacity = '1';
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  }

  // Handle mouse enter/leave on interactive elements
  function handleElementHover(e) {
    const target = e.target.closest('[data-spotlight-intensity], button, a, .service-card, .project-card');
    
    if (target && e.type === 'mouseenter') {
      state.hoverTarget = target;
      const intensity = target.dataset.spotlightIntensity || 'medium';
      const size = intensity === 'high' ? 300 : intensity === 'medium' ? 200 : 150;
      
      spotlight.elements.glow.style.width = size + 'px';
      spotlight.elements.glow.style.height = size + 'px';
      spotlight.elements.glow.classList.add('active');
      
      // Brighten effect
      spotlight.elements.core.style.filter = `brightness(${intensity === 'high' ? 1.5 : intensity === 'medium' ? 1.2 : 1})`;
    } else if (e.type === 'mouseleave' && state.hoverTarget === target) {
      state.hoverTarget = null;
      spotlight.elements.glow.classList.remove('active');
      spotlight.elements.core.style.filter = 'brightness(1)';
    }
  }

  // Visibility change handler
  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(state.rafId);
    } else {
      state.rafId = requestAnimationFrame(updateSpotlight);
    }
  }

  // Initialize
  function init() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleElementHover, true);
    document.addEventListener('mouseleave', handleElementHover, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start animation loop
    state.rafId = requestAnimationFrame(updateSpotlight);
    
    console.log('✨ Cursor Depth Spotlight System initialized');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup function for SPA navigation
  window.cursorSpotlightCleanup = function() {
    cancelAnimationFrame(state.rafId);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseenter', handleElementHover, true);
    document.removeEventListener('mouseleave', handleElementHover, true);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    spotlight.container.remove();
    spotlight.shadow.remove();
    spotlight.trailContainer.remove();
  };

})();
