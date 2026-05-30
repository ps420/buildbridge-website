/**
 * Scroll-Linked Video Reveal System
 * v99.0: Fortune 500 Scroll-Driven Video Experience
 * Videos that scrub, play, and reveal based on scroll position
 */

class ScrollLinkedVideo {
  constructor(element, options = {}) {
    this.container = element;
    this.video = element.querySelector('video');
    this.options = {
      scrub: true,
      playOnScroll: true,
      reveal: true,
      scaleOnScroll: false,
      ...options
    };
    
    this.isActive = true;
    this.videoDuration = 0;
    this.containerHeight = 0;
    this.isVideoLoaded = false;
    
    this.init();
  }
  
  init() {
    if (!this.video) {
      console.warn('ScrollLinkedVideo: No video element found');
      return;
    }
    
    this.setupVideo();
    this.bindEvents();
  }
  
  setupVideo() {
    // Preload video metadata
    this.video.preload = 'metadata';
    
    // Set up for frame-accurate seeking
    this.video.addEventListener('loadedmetadata', () => {
      this.videoDuration = this.video.duration;
      this.isVideoLoaded = true;
      this.hideLoading();
    });
    
    // Handle video load
    this.video.addEventListener('canplay', () => {
      this.isVideoLoaded = true;
      this.hideLoading();
    });
    
    // Pause video initially if scrubbing
    if (this.options.scrub) {
      this.video.pause();
      this.video.currentTime = 0;
    }
  }
  
  hideLoading() {
    const loader = this.container.querySelector('.scroll-video-loading');
    if (loader) {
      loader.classList.add('hidden');
    }
  }
  
  bindEvents() {
    // Scroll event
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    
    // Resize event
    window.addEventListener('resize', () => this.onResize());
    
    // Initial calculation
    this.onResize();
    this.onScroll();
  }
  
  onResize() {
    this.containerHeight = this.container.offsetHeight;
  }
  
  onScroll() {
    if (!this.isActive || !this.isVideoLoaded) return;
    
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through the container
    const scrollProgress = Math.max(0, Math.min(1, 
      -rect.top / (this.containerHeight - windowHeight)
    ));
    
    // Update CSS custom property
    this.container.style.setProperty('--scroll-progress', scrollProgress);
    
    // Handle video scrubbing
    if (this.options.scrub && this.videoDuration) {
      const targetTime = scrollProgress * this.videoDuration;
      
      // Only update if difference is significant (performance optimization)
      if (Math.abs(this.video.currentTime - targetTime) > 0.1) {
        this.video.currentTime = targetTime;
      }
    }
    
    // Handle reveal animations
    if (this.options.reveal) {
      this.handleReveal(scrollProgress);
    }
    
    // Handle scale animation
    if (this.options.scaleOnScroll) {
      this.handleScale(scrollProgress);
    }
    
    // Handle content items
    this.handleContentItems(scrollProgress);
  }
  
  handleReveal(progress) {
    const masks = this.container.querySelectorAll('.scroll-video-mask, .scroll-video-circle-mask');
    
    masks.forEach(mask => {
      if (progress > 0.1) {
        mask.classList.add('revealed');
      } else {
        mask.classList.remove('revealed');
      }
    });
  }
  
  handleScale(progress) {
    const scale = 0.8 + progress * 0.2;
    const borderRadius = 20 * (1 - progress);
    
    if (this.video) {
      this.video.style.transform = `scale(${scale})`;
      this.video.style.borderRadius = `${borderRadius}px`;
    }
  }
  
  handleContentItems(progress) {
    const items = this.container.querySelectorAll('.scroll-video-content-item');
    
    items.forEach((item, index) => {
      const itemProgress = (progress * items.length) - index;
      
      if (itemProgress > 0 && itemProgress < 1.5) {
        item.classList.add('active');
        item.style.opacity = Math.min(1, itemProgress);
      } else {
        item.classList.remove('active');
        item.style.opacity = 0;
      }
    });
  }
  
  play() {
    if (this.video) {
      this.video.play();
    }
  }
  
  pause() {
    if (this.video) {
      this.video.pause();
    }
  }
  
  destroy() {
    this.isActive = false;
  }
}

// Main ScrollVideo Controller
class ScrollVideoController {
  constructor() {
    this.instances = [];
    this.init();
  }
  
  init() {
    // Find all scroll video containers
    const containers = document.querySelectorAll('.scroll-video-container, [data-scroll-video]');
    
    containers.forEach(container => {
      const options = this.parseOptions(container);
      const instance = new ScrollLinkedVideo(container, options);
      this.instances.push(instance);
    });
    
    // Setup intersection observer for performance
    this.setupIntersectionObserver();
    
    console.log(`✨ ScrollVideoController: ${this.instances.length} video(s) initialized`);
  }
  
  parseOptions(container) {
    const options = {};
    
    if (container.dataset.scrub === 'false') options.scrub = false;
    if (container.dataset.reveal === 'false') options.reveal = false;
    if (container.dataset.scale === 'true') options.scaleOnScroll = true;
    
    return options;
  }
  
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const instance = this.instances.find(i => i.container === entry.target);
        if (instance) {
          instance.isActive = entry.isIntersecting;
        }
      });
    }, { threshold: 0 });
    
    this.instances.forEach(instance => {
      observer.observe(instance.container);
    });
  }
  
  refresh() {
    this.instances.forEach(instance => instance.onResize());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollVideoController = new ScrollVideoController();
  });
} else {
  window.scrollVideoController = new ScrollVideoController();
}

// Helper to create scroll video programmatically
window.createScrollVideo = (container, options) => {
  return new ScrollLinkedVideo(container, options);
};
