/**
 * BuildBridge Scroll-Linked 3D Showcase
 * Fortune 500 Quality - Immersive scroll-driven 3D project viewer
 */

class Scroll3DShowcase {
  constructor(container) {
    this.container = container;
    this.scenes = container.querySelectorAll('.showcase-3d-scene');
    this.progressBar = container.querySelector('.showcase-3d-progress');
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.setupScrollListener();
    this.setupNavigation();
    this.updateScene(0);
    
    // Add entrance animation
    setTimeout(() => {
      this.container.classList.add('showcase-3d--ready');
    }, 500);
  }
  
  setupIntersectionObserver() {
    const options = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '-10% 0px -10% 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          this.container.classList.add('showcase-3d--active');
        } else {
          this.container.classList.remove('showcase-3d--active');
        }
      });
    }, options);
    
    this.observer.observe(this.container);
  }
  
  setupScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  handleScroll() {
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1) through the section
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight - sectionTop) / (windowHeight + sectionHeight)
      ));
      
      // Update progress bar
      if (this.progressBar) {
        this.progressBar.style.setProperty('--progress', scrollProgress);
      }
      
      // Calculate which scene to show based on progress
      const newIndex = Math.min(
        this.scenes.length - 1,
        Math.floor(scrollProgress * this.scenes.length)
      );
      
      if (newIndex !== this.currentIndex) {
        this.transitionToScene(newIndex, scrollProgress);
      }
      
      // Apply parallax effects based on scroll
      this.applyParallaxEffects(scrollProgress);
    }
  }
  
  transitionToScene(index, progress) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const prevScene = this.scenes[this.currentIndex];
    const nextScene = this.scenes[index];
    const direction = index > this.currentIndex ? 1 : -1;
    
    // Animate out current scene
    prevScene.style.setProperty('--exit-direction', direction * -1);
    prevScene.classList.add('scene--exiting');
    prevScene.classList.remove('scene--active');
    
    // Animate in new scene
    nextScene.style.setProperty('--enter-direction', direction);
    nextScene.classList.add('scene--entering');
    
    setTimeout(() => {
      prevScene.classList.remove('scene--exiting');
      nextScene.classList.remove('scene--entering');
      nextScene.classList.add('scene--active');
      this.currentIndex = index;
      this.isAnimating = false;
      
      // Update navigation dots
      this.updateNavigation(index);
    }, 800);
  }
  
  updateScene(index) {
    this.scenes.forEach((scene, i) => {
      scene.classList.toggle('scene--active', i === index);
    });
    this.currentIndex = index;
    this.updateNavigation(index);
  }
  
  setupNavigation() {
    const dots = this.container.querySelectorAll('.showcase-3d-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.scrollToScene(index);
      });
    });
  }
  
  updateNavigation(index) {
    const dots = this.container.querySelectorAll('.showcase-3d-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('dot--active', i === index);
    });
  }
  
  scrollToScene(index) {
    const rect = this.container.getBoundingClientRect();
    const sectionHeight = rect.height;
    const targetScroll = window.scrollY + rect.top + (sectionHeight / this.scenes.length) * index;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
  
  applyParallaxEffects(progress) {
    // Apply subtle rotation and depth based on scroll
    const depth = (progress * 20) - 10;
    const rotateX = (progress * 5) - 2.5;
    
    this.scenes.forEach(scene => {
      if (scene.classList.contains('scene--active')) {
        const content = scene.querySelector('.scene-content');
        if (content) {
          content.style.transform = `
            translateZ(${depth}px)
            rotateX(${rotateX}deg)
          `;
        }
      }
    });
  }
}

// Initialize all 3D showcases on page
document.addEventListener('DOMContentLoaded', () => {
  const showcases = document.querySelectorAll('.showcase-3d');
  showcases.forEach(showcase => new Scroll3DShowcase(showcase));
});

// Export for global access
window.Scroll3DShowcase = Scroll3DShowcase;
