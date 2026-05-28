/**
 * v60.0: Scroll-Triggered Video Player
 * Fortune 500 Quality Video Experience with Scroll-Driven Playback
 * Features: Frame-accurate scrolling, playback control, mobile optimization
 */

class ScrollTriggeredVideo {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.warn('ScrollTriggeredVideo: Container not found');
      return;
    }
    
    this.options = {
      videoSelector: 'video',
      progressIndicator: true,
      autoplayOnIntersect: true,
      playbackRate: 1,
      frameRate: 30,
      mobileFallback: true,
      ...options
    };
    
    this.video = this.container.querySelector(this.options.videoSelector);
    if (!this.video) {
      console.warn('ScrollTriggeredVideo: Video element not found');
      return;
    }
    
    this.isScrolling = false;
    this.scrollRAF = null;
    this.videoDuration = 0;
    this.isMobile = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    this.setupVideo();
    this.setupScrollTrigger();
    this.setupProgressIndicator();
    this.setupControls();
    this.handleMobileFallback();
    
    console.log('🎬 Scroll-Triggered Video initialized');
  }
  
  setupVideo() {
    // Prepare video for precise seeking
    this.video.preload = 'auto';
    this.video.playsInline = true;
    this.video.muted = true; // Required for autoplay
    this.video.pause();
    
    // Wait for metadata
    this.video.addEventListener('loadedmetadata', () => {
      this.videoDuration = this.video.duration;
      this.video.classList.add('loaded');
      
      // Hide loading spinner
      const loader = this.container.querySelector('.scroll-video-loading');
      if (loader) loader.classList.add('hidden');
    });
    
    // Handle video load
    this.video.addEventListener('loadeddata', () => {
      // Set initial frame
      this.video.currentTime = 0;
    });
    
    // Error handling
    this.video.addEventListener('error', () => {
      console.warn('ScrollTriggeredVideo: Video failed to load');
      this.showFallback();
    });
  }
  
  setupScrollTrigger() {
    // Use ScrollTimeline API if available (Chrome 115+)
    if (CSS.supports('animation-timeline', 'scroll()')) {
      this.setupNativeScrollTimeline();
    } else {
      this.setupScrollListener();
    }
  }
  
  setupNativeScrollTimeline() {
    // Modern browsers can use CSS Scroll-driven Animations
    this.video.style.animation = 'none'; // We'll control via JS
    this.setupScrollListener(); // Fallback to JS for video control
  }
  
  setupScrollListener() {
    const handleScroll = () => {
      if (this.isScrolling) return;
      this.isScrolling = true;
      
      this.scrollRAF = requestAnimationFrame(() => {
        this.updateVideoFrame();
        this.updateProgress();
        this.syncContent();
        this.isScrolling = false;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    this.updateVideoFrame();
    this.updateProgress();
  }
  
  updateVideoFrame() {
    if (!this.videoDuration) return;
    
    const rect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress based on container position
    // Container starts when top reaches bottom of viewport
    // Container ends when bottom reaches top of viewport
    const startThreshold = windowHeight;
    const endThreshold = -rect.height;
    const currentPosition = rect.top;
    
    // Calculate progress (0 to 1)
    let progress = (startThreshold - currentPosition) / (startThreshold - endThreshold);
    progress = Math.max(0, Math.min(1, progress));
    
    // Map progress to video time
    const targetTime = progress * this.videoDuration * this.options.playbackRate;
    
    // Update video current time
    if (Math.abs(this.video.currentTime - targetTime) > 0.1) {
      this.video.currentTime = targetTime;
    }
    
    // Store progress for other methods
    this.currentProgress = progress;
  }
  
  updateProgress() {
    if (!this.options.progressIndicator) return;
    
    const progressBar = this.container.querySelector('.scroll-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${(this.currentProgress || 0) * 100}%`;
    }
  }
  
  syncContent() {
    const progress = this.currentProgress || 0;
    
    // Content animations based on video progress
    const content = this.container.querySelector('.scroll-video-content');
    const controls = this.container.querySelector('.scroll-video-controls');
    const stats = this.container.querySelectorAll('.scroll-video-stat');
    
    // Show content after 10% progress
    if (content && progress > 0.1) {
      content.classList.add('visible');
    }
    
    // Show controls after 5% progress
    if (controls && progress > 0.05) {
      controls.classList.add('visible');
    }
    
    // Stagger stat animations
    stats.forEach((stat, index) => {
      const triggerPoint = 0.2 + (index * 0.15);
      if (progress > triggerPoint) {
        stat.classList.add('visible');
      }
    });
  }
  
  setupProgressIndicator() {
    if (!this.options.progressIndicator) return;
    
    let indicator = this.container.querySelector('.scroll-progress-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'scroll-progress-indicator';
      indicator.innerHTML = '<div class="scroll-progress-bar"></div>';
      this.container.querySelector('.scroll-video-wrapper').appendChild(indicator);
    }
  }
  
  setupControls() {
    const playPauseBtn = this.container.querySelector('.scroll-video-btn[data-action="play-pause"]');
    const muteBtn = this.container.querySelector('.scroll-video-btn[data-action="mute"]');
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }
    
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleMute());
    }
  }
  
  togglePlayPause() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }
  
  toggleMute() {
    this.video.muted = !this.video.muted;
    
    const muteBtn = this.container.querySelector('.scroll-video-btn[data-action="mute"]');
    if (muteBtn) {
      muteBtn.textContent = this.video.muted ? '🔇' : '🔊';
    }
  }
  
  handleMobileFallback() {
    if (!this.isMobile || !this.options.mobileFallback) return;
    
    // On mobile, use native video with simpler scroll behavior
    this.video.controls = true;
    this.video.style.pointerEvents = 'auto';
    
    // Disable complex scroll control on mobile
    // Instead, use intersection observer to play/pause
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.video.play();
          } else {
            this.video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(this.video);
  }
  
  showFallback() {
    // Show image fallback if video fails
    const fallback = this.container.querySelector('.scroll-video-fallback');
    if (fallback) {
      fallback.style.display = 'block';
    }
  }
  
  // Public API: Seek to specific time
  seekTo(time) {
    if (this.videoDuration) {
      this.video.currentTime = Math.max(0, Math.min(time, this.videoDuration));
    }
  }
  
  // Public API: Seek to percentage
  seekToPercent(percent) {
    if (this.videoDuration) {
      this.video.currentTime = (percent / 100) * this.videoDuration;
    }
  }
  
  // Public API: Play video
  play() {
    this.video.play();
  }
  
  // Public API: Pause video
  pause() {
    this.video.pause();
  }
  
  // Public API: Get current progress
  getProgress() {
    return this.currentProgress || 0;
  }
  
  // Public API: Destroy instance
  destroy() {
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF);
    }
    window.removeEventListener('scroll', this.handleScroll);
  }
}

// Multi-video controller for pages with multiple scroll videos
class ScrollVideoController {
  constructor() {
    this.videos = [];
    this.init();
  }
  
  init() {
    document.querySelectorAll('.scroll-video-container').forEach(container => {
      const video = new ScrollTriggeredVideo(container);
      this.videos.push(video);
    });
  }
  
  // Play all videos
  playAll() {
    this.videos.forEach(v => v.play());
  }
  
  // Pause all videos
  pauseAll() {
    this.videos.forEach(v => v.pause());
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollVideoController = new ScrollVideoController();
  });
} else {
  window.scrollVideoController = new ScrollVideoController();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollTriggeredVideo, ScrollVideoController };
}
