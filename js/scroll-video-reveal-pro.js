/**
 * BuildBridge v49.0 - Scroll-Triggered Video Reveal Pro
 * Fortune 500 Immersive Storytelling System
 * 
 * Features:
 * - Scroll-based video frame scrubbing
 * - Smooth video-to-scroll synchronization
 * - Multi-scene narrative support
 * - Frame markers with tooltips
 * - Performance-optimized with RAF
 */

class ScrollVideoRevealPro {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.scroll-video-section');
    if (!this.container) return;
    
    this.options = {
      videoSrc: options.videoSrc || this.container.dataset.videoSrc,
      frameRate: options.frameRate || 30,
      scrollDuration: options.scrollDuration || 300, // vh units
      easing: options.easing || 'easeOutQuart',
      debug: options.debug || false,
      preload: options.preload !== false,
      ...options
    };
    
    this.video = null;
    this.videoWrapper = null;
    this.progressBar = null;
    this.progressText = null;
    this.loadingEl = null;
    
    this.state = {
      isLoaded: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      scrollProgress: 0,
      isInViewport: false,
      targetTime: 0,
      scenes: []
    };
    
    this.rafId = null;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.cacheElements();
    this.setupVideo();
    this.setupScrollObserver();
    this.setupProgressIndicator();
    this.bindEvents();
  }
  
  cacheElements() {
    this.videoWrapper = this.container.querySelector('.scroll-video-wrapper');
    this.progressBar = this.container.querySelector('.scroll-video-progress-fill');
    this.progressText = this.container.querySelector('.scroll-video-progress-text');
    this.loadingEl = this.container.querySelector('.scroll-video-loading');
    this.markersContainer = this.container.querySelector('.scroll-video-markers');
    
    // Cache scenes if multi-scene
    const sceneElements = this.container.querySelectorAll('.scroll-video-scene');
    sceneElements.forEach((scene, index) => {
      this.state.scenes.push({
        element: scene,
        startTime: parseFloat(scene.dataset.startTime) || 0,
        endTime: parseFloat(scene.dataset.endTime) || 0,
        index
      });
    });
  }
  
  setupVideo() {
    this.video = this.container.querySelector('.scroll-video-element');
    if (!this.video) {
      this.video = document.createElement('video');
      this.video.className = 'scroll-video-element';
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.preload = this.options.preload ? 'auto' : 'metadata';
      this.video.src = this.options.videoSrc;
      
      if (this.videoWrapper) {
        this.videoWrapper.insertBefore(this.video, this.videoWrapper.firstChild);
      }
    }
    
    // Video event listeners
    this.video.addEventListener('loadedmetadata', () => {
      this.state.duration = this.video.duration;
      this.onVideoLoaded();
    });
    
    this.video.addEventListener('canplaythrough', () => {
      if (!this.state.isLoaded) {
        this.hideLoading();
      }
    });
    
    this.video.addEventListener('error', (e) => {
      console.error('Video load error:', e);
      this.showFallback();
    });
    
    // Force load
    this.video.load();
  }
  
  onVideoLoaded() {
    this.state.isLoaded = true;
    this.video.pause();
    this.createFrameMarkers();
  }
  
  createFrameMarkers() {
    if (!this.markersContainer || this.state.scenes.length === 0) return;
    
    this.state.scenes.forEach((scene, index) => {
      const marker = document.createElement('div');
      marker.className = 'scroll-video-marker';
      marker.dataset.scene = index;
      
      const tooltip = document.createElement('span');
      tooltip.className = 'scroll-video-marker-tooltip';
      tooltip.textContent = scene.element.dataset.title || `Scene ${index + 1}`;
      marker.appendChild(tooltip);
      
      marker.addEventListener('click', () => this.jumpToScene(index));
      this.markersContainer.appendChild(marker);
    });
  }
  
  setupScrollObserver() {
    // Main intersection observer for viewport
    const viewportObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.state.isInViewport = entry.isIntersecting;
        
        if (entry.isIntersecting) {
          this.container.classList.add('scroll-video-section--active');
          this.startAnimationLoop();
        } else {
          this.container.classList.remove('scroll-video-section--active');
          this.stopAnimationLoop();
        }
      });
    }, { threshold: 0.1 });
    
    viewportObserver.observe(this.container);
    
    // Scroll progress observer
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }
  
  setupProgressIndicator() {
    if (!this.progressBar) return;
    
    // Create progress container if not exists
    if (!this.container.querySelector('.scroll-video-progress')) {
      const progressHTML = `
        <div class="scroll-video-progress">
          <div class="scroll-video-progress-bar">
            <div class="scroll-video-progress-fill"></div>
          </div>
          <span class="scroll-video-progress-text">0%</span>
        </div>
      `;
      const container = this.container.querySelector('.scroll-video-container');
      if (container) {
        container.insertAdjacentHTML('beforeend', progressHTML);
        this.progressBar = container.querySelector('.scroll-video-progress-fill');
        this.progressText = container.querySelector('.scroll-video-progress-text');
      }
    }
  }
  
  onScroll() {
    if (!this.state.isInViewport || !this.state.isLoaded) return;
    
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const containerHeight = rect.height;
    
    // Calculate scroll progress through the section
    const scrollStart = rect.top;
    const scrollEnd = rect.bottom - windowHeight;
    const scrollableDistance = containerHeight - windowHeight;
    
    let progress = 0;
    if (scrollStart <= 0 && scrollEnd >= 0) {
      progress = Math.abs(scrollStart) / scrollableDistance;
    } else if (scrollStart > 0) {
      progress = 0;
    } else {
      progress = 1;
    }
    
    progress = Math.max(0, Math.min(1, progress));
    this.state.scrollProgress = progress;
    this.state.targetTime = progress * this.state.duration;
    
    // Update UI
    this.updateProgressUI(progress);
    this.updateSceneActiveState();
    
    // Hide scroll indicator after scrolling
    if (progress > 0.05) {
      this.container.classList.add('scroll-video-section--scrolled');
    } else {
      this.container.classList.remove('scroll-video-section--scrolled');
    }
  }
  
  updateProgressUI(progress) {
    if (this.progressBar) {
      this.progressBar.style.width = `${progress * 100}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `${Math.round(progress * 100)}%`;
    }
  }
  
  updateSceneActiveState() {
    if (this.state.scenes.length === 0) return;
    
    const currentTime = this.state.targetTime;
    let activeSceneIndex = -1;
    
    this.state.scenes.forEach((scene, index) => {
      const isActive = currentTime >= scene.startTime && currentTime < scene.endTime;
      scene.element.classList.toggle('scroll-video-scene--active', isActive);
      
      if (isActive) activeSceneIndex = index;
    });
    
    // Update markers
    const markers = this.container.querySelectorAll('.scroll-video-marker');
    markers.forEach((marker, index) => {
      marker.classList.toggle('scroll-video-marker--active', index === activeSceneIndex);
    });
  }
  
  startAnimationLoop() {
    if (this.rafId) return;
    this.animate();
  }
  
  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  animate() {
    if (!this.video || !this.state.isLoaded) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth lerp to target time
    const diff = this.state.targetTime - this.video.currentTime;
    const lerpFactor = 0.15;
    
    if (Math.abs(diff) > 0.01) {
      this.video.currentTime += diff * lerpFactor;
    }
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  jumpToScene(sceneIndex) {
    const scene = this.state.scenes[sceneIndex];
    if (!scene) return;
    
    // Calculate scroll position for this scene
    const containerRect = this.container.getBoundingClientRect();
    const scrollTarget = scene.startTime / this.state.duration;
    const scrollPosition = window.scrollY + containerRect.top + (scrollTarget * (containerRect.height - window.innerHeight));
    
    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }
  
  hideLoading() {
    if (this.loadingEl) {
      this.loadingEl.classList.add('scroll-video-loading--hidden');
    }
  }
  
  showFallback() {
    // Show fallback image if video fails
    const fallback = document.createElement('div');
    fallback.className = 'scroll-video-fallback';
    fallback.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1a1a22 0%, #0f0f12 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    `;
    fallback.innerHTML = `
      <div style="text-align: center;">
        <p style="color: #C9CED6; font-family: Montserrat;">Visual experience loading...</p>
      </div>
    `;
    
    if (this.videoWrapper) {
      this.videoWrapper.appendChild(fallback);
    }
    this.hideLoading();
  }
  
  bindEvents() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.onScroll();
    }, { passive: true });
  }
  
  destroy() {
    this.stopAnimationLoop();
    if (this.video) {
      this.video.pause();
      this.video.src = '';
    }
  }
  
  // Public API
  play() {
    if (this.video) this.video.play();
  }
  
  pause() {
    if (this.video) this.video.pause();
  }
  
  seekTo(time) {
    this.state.targetTime = time;
  }
  
  getCurrentProgress() {
    return this.state.scrollProgress;
  }
}

// Video Frame Scrubber (Alternative for image sequences)
class ScrollImageSequence {
  constructor(options = {}) {
    this.container = options.container;
    this.images = options.images || [];
    this.canvas = null;
    this.ctx = null;
    this.currentFrame = 0;
    this.loadedImages = [];
    this.imagesLoaded = 0;
    
    this.init();
  }
  
  async init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    await this.loadImages();
    this.setupScroll();
    this.resize();
  }
  
  loadImages() {
    return Promise.all(
      this.images.map((src, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.loadedImages[index] = img;
            this.imagesLoaded++;
            resolve();
          };
          img.src = src;
        });
      })
    );
  }
  
  setupScroll() {
    window.addEventListener('scroll', () => {
      const rect = this.container.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      const frameIndex = Math.floor(progress * (this.loadedImages.length - 1));
      
      if (frameIndex !== this.currentFrame && this.loadedImages[frameIndex]) {
        this.currentFrame = frameIndex;
        this.render();
      }
    }, { passive: true });
  }
  
  render() {
    const img = this.loadedImages[this.currentFrame];
    if (!img) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Scale to fit
    const scale = Math.max(
      this.canvas.width / img.width,
      this.canvas.height / img.height
    );
    
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (this.canvas.width - w) / 2;
    const y = (this.canvas.height - h) / 2;
    
    this.ctx.drawImage(img, x, y, w, h);
  }
  
  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
    this.render();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Find all scroll video sections
  const scrollVideoSections = document.querySelectorAll('.scroll-video-section');
  scrollVideoSections.forEach(section => {
    new ScrollVideoRevealPro({ container: section });
  });
});

export { ScrollVideoRevealPro, ScrollImageSequence };
