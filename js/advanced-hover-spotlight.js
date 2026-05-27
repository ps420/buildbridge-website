/**
 * BuildBridge Advanced Hover Spotlight Effects v29.0
 * Fortune 500 interactive hover effects with spotlight, glow, and ripple
 */

class AdvancedHoverSpotlight {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    this.findElements();
    this.bindEvents();
  }

  findElements() {
    // Select elements that should have advanced hover effects
    this.elements = document.querySelectorAll([
      '.advanced-card',
      '.service-card',
      '.project-card',
      '.faq-item',
      '.stat-card',
      '.testimonial-carousel-card',
      '.feature-card'
    ].join(', '));
  }

  bindEvents() {
    this.elements.forEach(element => {
      this.applySpotlightEffect(element);
    });
    
    // Watch for new elements
    this.observeDOM();
  }

  applySpotlightEffect(element) {
    if (element.classList.contains('spotlight-initialized')) return;
    element.classList.add('spotlight-initialized');

    // Create spotlight gradient overlay
    const spotlight = document.createElement('div');
    spotlight.className = 'hover-spotlight';
    spotlight.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(201, 206, 214, 0.1),
        transparent 40%
      );
      z-index: 1;
    `;
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(spotlight);

    // Mouse move for spotlight positioning
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty('--mouse-x', `${x}%`);
      element.style.setProperty('--mouse-y', `${y}%`);
      spotlight.style.opacity = '1';
    });

    // Mouse leave
    element.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });

    // Add magnetic effect for interactive elements inside
    const interactiveElements = element.querySelectorAll('button, a, .btn');
    interactiveElements.forEach(el => this.applyMagneticEffect(el));
    
    // Add ripple effect for buttons
    interactiveElements.forEach(el => this.applyRippleEffect(el));
  }

  applyMagneticEffect(element) {
    if (element.classList.contains('magnetic-initialized')) return;
    element.classList.add('magnetic-initialized');

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 50;
      
      if (distance < maxDistance) {
        const strength = 0.3;
        element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translate(0, 0)';
      element.style.transition = 'transform 0.3s ease';
    });

    element.addEventListener('mouseenter', () => {
      element.style.transition = 'none';
    });
  }

  applyRippleEffect(element) {
    if (element.classList.contains('ripple-initialized')) return;
    element.classList.add('ripple-initialized');

    element.style.position = 'relative';
    element.style.overflow = 'hidden';

    element.addEventListener('click', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        background: rgba(201, 206, 214, 0.4);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple-effect 0.6s ease-out;
      `;
      
      element.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }

  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.matches && (
              node.matches('.advanced-card') ||
              node.matches('.service-card') ||
              node.matches('.project-card') ||
              node.matches('.faq-item') ||
              node.matches('.stat-card')
            )) {
              this.applySpotlightEffect(node);
            }
            
            // Check children
            const children = node.querySelectorAll?.('.advanced-card, .service-card, .project-card, .faq-item, .stat-card');
            children?.forEach(child => this.applySpotlightEffect(child));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Add ripple animation styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
  @keyframes ripple-effect {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
  
  .hover-spotlight {
    will-change: opacity, background;
  }
  
  .spotlight-initialized {
    --mouse-x: 50%;
    --mouse-y: 50%;
  }
  
  .magnetic-initialized {
    will-change: transform;
  }
`;
document.head.appendChild(rippleStyles);

// Text glow effect on headings
document.querySelectorAll('h1, h2, h3').forEach(heading => {
  heading.addEventListener('mouseenter', () => {
    heading.style.textShadow = '0 0 40px rgba(201, 206, 214, 0.3)';
    heading.style.transition = 'text-shadow 0.3s ease';
  });
  
  heading.addEventListener('mouseleave', () => {
    heading.style.textShadow = 'none';
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedHoverSpotlight();
  console.log('✨ BuildBridge v29.0: Advanced Hover Spotlight effects initialized');
});

export default AdvancedHoverSpotlight;
