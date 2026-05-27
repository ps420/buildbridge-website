/**
 * Parallax Gallery - v22.0 Professional Enhancement
 * Smooth parallax scrolling effects for image galleries
 */

class ParallaxGallery {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '.parallax-gallery');
    this.items = options.items || '.parallax-item';
    this.intensity = options.intensity || 0.5;
    this.smoothness = options.smoothness || 0.1;
    
    if (!this.container) return;
    
    this.elements = this.container.querySelectorAll(this.items);
    this.targetPositions = new Map();
    this.currentPositions = new Map();
    this.isActive = true;
    
    this.init();
  }
  
  init() {
    // Store initial positions
    this.elements.forEach((el, index) => {
      el.style.transition = 'none';
      this.targetPositions.set(el, 0);
      this.currentPositions.set(el, 0);
      
      // Add different parallax speeds based on index
      const speed = parseFloat(el.dataset.parallaxSpeed) || (0.2 + (index % 3) * 0.2);
      el.dataset.parallaxCalc = speed;
    });
    
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    // Use IntersectionObserver for performance
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isActive = true;
        } else {
          this.isActive = false;
        }
      });
    }, { threshold: 0.1 });
    
    this.observer.observe(this.container);
    
    // Scroll listener for target calculation
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // Mouse parallax for tilt effect
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    
    // Resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  handleScroll() {
    if (!this.isActive) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through container
    const scrollProgress = (windowHeight - containerRect.top) / (windowHeight + containerRect.height);
    
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxCalc);
      const direction = el.dataset.parallaxDirection || 'vertical';
      
      let targetY = 0;
      let targetX = 0;
      
      if (direction === 'vertical' || direction === 'both') {
        targetY = (scrollProgress - 0.5) * 100 * speed * this.intensity;
      }
      
      if (direction === 'horizontal' || direction === 'both') {
        targetX = (scrollProgress - 0.5) * 50 * speed * this.intensity;
      }
      
      // Add rotation for extra flair
      const rotate = (scrollProgress - 0.5) * 5 * speed;
      
      this.targetPositions.set(el, { y: targetY, x: targetX, rotate });
    });
  }
  
  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    this.mousePosition = { x, y };
    
    this.elements.forEach((el, index) => {
      if (!el.classList.contains('parallax-tilt')) return;
      
      const tiltAmount = parseFloat(el.dataset.tiltAmount) || 10;
      const rotateX = -y * tiltAmount;
      const rotateY = x * tiltAmount;
      
      el.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        translateZ(20px)
      `;
    });
  }
  
  handleMouseLeave() {
    this.elements.forEach(el => {
      if (el.classList.contains('parallax-tilt')) {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        el.style.transition = 'transform 0.5s ease';
      }
    });
    
    setTimeout(() => {
      this.elements.forEach(el => {
        if (el.classList.contains('parallax-tilt')) {
          el.style.transition = 'none';
        }
      });
    }, 500);
  }
  
  handleResize() {
    this.handleScroll();
  }
  
  animate() {
    if (!this.isActive) {
      requestAnimationFrame(this.animate.bind(this));
      return;
    }
    
    this.elements.forEach(el => {
      const target = this.targetPositions.get(el) || { y: 0, x: 0, rotate: 0 };
      const current = this.currentPositions.get(el) || { y: 0, x: 0, rotate: 0 };
      
      // Smooth interpolation
      const newY = current.y + (target.y - current.y) * this.smoothness;
      const newX = current.x + (target.x - current.x) * this.smoothness;
      const newRotate = current.rotate + (target.rotate - current.rotate) * this.smoothness;
      
      this.currentPositions.set(el, { y: newY, x: newX, rotate: newRotate });
      
      // Scale effect on scroll
      const scale = 1 + Math.abs(newY) * 0.001;
      
      el.style.transform = `
        translate3d(${newX}px, ${newY}px, 0) 
        rotate(${newRotate}deg)
        scale(${scale})
      `;
    });
    
    requestAnimationFrame(this.animate.bind(this));
  }
  
  destroy() {
    this.isActive = false;
    this.observer.disconnect();
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    document.querySelectorAll('.parallax-gallery').forEach(gallery => {
      new ParallaxGallery({
        container: gallery,
        intensity: 0.6,
        smoothness: 0.08
      });
    });
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParallaxGallery;
}
