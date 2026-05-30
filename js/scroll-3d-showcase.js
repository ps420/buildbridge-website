/**
 * v101.0: Scroll-Triggered 3D Showcase JavaScript
 * Interactive 3D rotation and depth effects driven by scroll position
 * Created by: Godzai
 */

(function() {
  'use strict';

  let scrollProgress = 0;
  let rafId = null;
  let isActive = false;

  // Initialize 3D Showcase
  function init3DShowcase() {
    const showcase = document.querySelector('.scroll-3d-showcase');
    if (!showcase) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    isActive = true;
    update3DScene();
    setupProgressIndicator();

    console.log('🎲 3D Scroll Showcase v101.0 initialized');
  }

  // Update 3D scene based on scroll
  function update3DScene() {
    if (!isActive) return;

    const showcase = document.querySelector('.scroll-3d-showcase');
    if (!showcase) return;

    const rect = showcase.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1)
    const scrollStart = rect.top - windowHeight;
    const scrollEnd = rect.bottom;
    const scrollRange = scrollEnd - scrollStart;
    
    scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - windowHeight)));

    // Update 3D cards rotation
    updateCards(scrollProgress);
    
    // Update progress indicator
    updateProgress(scrollProgress);
    
    // Update depth layers
    updateDepthLayers(scrollProgress);

    rafId = requestAnimationFrame(update3DScene);
  }

  // Update 3D cards based on scroll
  function updateCards(progress) {
    const cards = document.querySelectorAll('.scroll-3d-card');
    const scene = document.querySelector('.scroll-3d-scene');
    
    if (!cards.length || !scene) return;

    // Rotate entire scene based on scroll
    const sceneRotation = progress * 360;
    const sceneTilt = Math.sin(progress * Math.PI * 2) * 10;
    
    scene.style.transform = `
      rotateY(${sceneRotation * 0.2}deg)
      rotateX(${sceneTilt}deg)
    `;

    // Animate individual cards
    cards.forEach((card, index) => {
      const offset = index - 2; // Center index is 2
      const cardProgress = (progress * 5) + offset;
      
      // Calculate card transformations
      const rotateY = offset * 15 + (Math.sin(progress * Math.PI * 2) * 5);
      const translateZ = Math.cos(cardProgress) * 100 + (index === 2 ? 150 : 50);
      const translateX = offset * 80;
      const rotateX = Math.sin(progress * Math.PI * 3) * 5;
      
      // Apply transformations
      card.style.transform = `
        translateX(${translateX}px)
        translateZ(${translateZ}px)
        rotateY(${rotateY}deg)
        rotateX(${rotateX}deg)
      `;
      
      // Update opacity based on depth
      const opacity = 0.4 + (translateZ / 300) * 0.6;
      card.style.opacity = Math.min(1, Math.max(0.4, opacity));
      
      // Active state for center card
      if (index === 2) {
        const isActive = Math.abs(progress % 1 - 0.5) < 0.2;
        card.classList.toggle('active', isActive);
      }
    });
  }

  // Update progress indicator
  function updateProgress(progress) {
    const dots = document.querySelectorAll('.scroll-3d-progress-dot');
    const activeIndex = Math.floor(progress * dots.length);
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  // Update depth layers
  function updateDepthLayers(progress) {
    const layers = document.querySelectorAll('.depth-layer');
    
    layers.forEach((layer, index) => {
      const speed = (index + 1) * 0.2;
      const offset = progress * 100 * speed;
      layer.style.transform = `translateY(${offset}px) translateZ(${-index * 50}px)`;
    });
  }

  // Setup progress indicator click handlers
  function setupProgressIndicator() {
    const dots = document.querySelectorAll('.scroll-3d-progress-dot');
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const showcase = document.querySelector('.scroll-3d-showcase');
        if (!showcase) return;
        
        const targetProgress = index / dots.length;
        const rect = showcase.getBoundingClientRect();
        const targetScroll = rect.top + (rect.height * targetProgress) - window.innerHeight / 2;
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }

  // Initialize interactive 3D gallery
  function initInteractive3DGallery() {
    const gallery = document.querySelector('.showcase-3d-interactive');
    if (!gallery) return;

    const items = gallery.querySelectorAll('.showcase-3d-item');
    let currentIndex = 0;

    function updateGallery() {
      items.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        
        if (index === currentIndex) {
          item.classList.add('active');
        } else if (index === currentIndex - 1 || (currentIndex === 0 && index === items.length - 1)) {
          item.classList.add('prev');
        } else if (index === currentIndex + 1 || (currentIndex === items.length - 1 && index === 0)) {
          item.classList.add('next');
        }
      });
    }

    // Navigation
    gallery.addEventListener('click', (e) => {
      const rect = gallery.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      if (x < rect.width / 2) {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      } else {
        currentIndex = (currentIndex + 1) % items.length;
      }
      
      updateGallery();
    });

    // Touch/swipe support
    let touchStartX = 0;
    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    gallery.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = (currentIndex + 1) % items.length;
        } else {
          currentIndex = (currentIndex - 1 + items.length) % items.length;
        }
        updateGallery();
      }
    });

    updateGallery();
  }

  // Parallax depth effect on mouse move
  function initParallaxDepth() {
    const container = document.querySelector('.scroll-3d-container');
    if (!container) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const elements = container.querySelectorAll('.parallax-depth');
      elements.forEach(el => {
        const speed = parseFloat(el.style.getPropertyValue('--parallax-speed')) || 0.5;
        const rotateY = x * 20 * speed;
        const rotateX = -y * 20 * speed;
        
        el.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      });
    });

    container.addEventListener('mouseleave', () => {
      const elements = container.querySelectorAll('.parallax-depth');
      elements.forEach(el => {
        el.style.transform = '';
      });
    });
  }

  // Cleanup on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      isActive = true;
      update3DScene();
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init3DShowcase();
      initInteractive3DGallery();
      initParallaxDepth();
    });
  } else {
    init3DShowcase();
    initInteractive3DGallery();
    initParallaxDepth();
  }

  // Expose API
  window.Scroll3DShowcase = {
    getProgress: () => scrollProgress,
    refresh: init3DShowcase
  };

})();
