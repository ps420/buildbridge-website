 => {
        // Mouse enter
        el.addEventListener('mouseenter', (e) => {
          this.isHovering = true;
          this.elements.dot.classList.add('hover');
          this.elements.ring.classList.add('hover');
          this.elements.glow.classList.add('active');
          
          // Check for custom cursor text
          const cursorType = el.dataset.cursor;
          if (cursorType) {
            this.setCursorText(cursorType);
          }
          
          // Check for external link
          const href = el.getAttribute('href');
          if (href && (href.startsWith('http') || href.startsWith('//'))) {
            this.setCursorText('External');
          }
          
          // Create ripple effect
          this.createElementRipple(el);
        });
        
        // Mouse leave
        el.addEventListener('mouseleave', () => {
          this.isHovering = false;
          this.elements.dot.classList.remove('hover');
          this.elements.ring.classList.remove('hover');
          this.elements.glow.classList.remove('active');
          this.hideCursorText();
        });
      });
    });
  }
  
  setCursorText(text) {
    this.elements.text.textContent = text;
    this.elements.text.classList.add('visible');
  }
  
  hideCursorText() {
    this.elements.text.classList.remove('visible');
  }
  
  createVelocityRipple() {
    const ripple = document.createElement('div');
    ripple.className = 'velocity-ripple';
    ripple.style.left = this.cursorX + 'px';
    ripple.style.top = this.cursorY + 'px';
    ripple.style.width = '30px';
    ripple.style.height = '30px';
    this.container.appendChild(ripple);
    
    // Trigger animation
    requestAnimationFrame(() => {
      ripple.classList.add('active');
    });
    
    // Cleanup
    setTimeout(() => ripple.remove(), 600);
  }
  
  createClickBurst() {
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = this.cursorX + 'px';
    burst.style.top = this.cursorY + 'px';
    this.container.appendChild(burst);
    
    // Create particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-burst-particle';
      
      const angle = (360 / particleCount) * i;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance;
      
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      
      burst.appendChild(particle);
      
      // Animate
      requestAnimationFrame(() => {
        particle.classList.add('active');
      });
    }
    
    // Cleanup
    setTimeout(() => burst.remove(), 600);
  }
  
  createElementRipple(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 1px solid rgba(201, 206, 214, 0.3);
      border-radius: inherit;
      pointer-events: none;
      z-index: 99990;
    `;
    document.body.appendChild(ripple);
    
    // Animate
    ripple.animate([
      { transform: 'scale(1)', opacity: 0.5 },
      { transform: 'scale(1.1)', opacity: 0 }
    ], {
      duration: 400,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  }
  
  animate() {
    // Spring physics for main cursor
    const dx = this.mouseX - this.cursorX;
    const dy = this.mouseY - this.cursorY;
    
    this.cursorX += dx * this.springStrength;
    this.cursorY += dy * this.springStrength;
    
    // Update main dot
    this.elements.dot.style.left = this.cursorX + 'px';
    this.elements.dot.style.top = this.cursorY + 'px';
    
    // Update glow
    this.elements.glow.style.left = this.cursorX + 'px';
    this.elements.glow.style.top = this.cursorY + 'px';
    
    // Update text label
    this.elements.text.style.left = this.cursorX + 'px';
    this.elements.text.style.top = this.cursorY + 'px';
    
    // Delayed follow for ring (spring with more lag)
    const ringRect = this.elements.ring.getBoundingClientRect();
    const ringX = ringRect.left + ringRect.width / 2;
    const ringY = ringRect.top + ringRect.height / 2;
    const ringDx = this.cursorX - ringX;
    const ringDy = this.cursorY - ringY;
    
    const newRingX = ringX + ringDx * this.trailDelay;
    const newRingY = ringY + ringDy * this.trailDelay;
    
    this.elements.ring.style.left = newRingX + 'px';
    this.elements.ring.style.top = newRingY + 'px';
    
    // Direction arrow (follows ring)
    const velocity = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (velocity > 5) {
      this.elements.arrow.style.left = this.cursorX + 'px';
      this.elements.arrow.style.top = this.cursorY + 'px';
      
      // Rotate arrow based on velocity direction
      const angle = Math.atan2(this.velocity.y, this.velocity.x) * 180 / Math.PI + 90;
      this.elements.arrow.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      this.elements.arrow.classList.add('visible');
    } else {
      this.elements.arrow.classList.remove('visible');
    }
    
    // Trail dots with positions
    let prevX = this.cursorX;
    let prevY = this.cursorY;
    
    this.elements.trails.forEach((trail, i) => {
      const delay = (i + 1) * 0.08;
      const tdx = prevX - trail.x;
      const tdy = prevY - trail.y;
      
      trail.x += tdx * delay;
      trail.y += tdy * delay;
      
      trail.element.style.left = trail.x + 'px';
      trail.element.style.top = trail.y + 'px';
      trail.element.style.opacity = (1 - i / this.trailCount) * 0.3;
      
      prevX = trail.x;
      prevY = trail.y;
    });
    
    requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.container?.remove();
    document.body.style.cursor = '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  
  if (!prefersReducedMotion && !isTouchDevice) {
    window.physicsCursor = new PhysicsCursor({
      springStrength: 0.18,
      friction: 0.86,
      trailCount: 6
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhysicsCursor;
}
