/**
 * BuildBridge Video Hero Parallax System v29.0
 * Fortune 500 scroll-triggered video background with parallax effects
 */

class VideoHeroParallax {
  constructor(section) {
    this.section = section;
    this.videoContainer = section.querySelector('.video-background');
    this.video = section.querySelector('video');
    this.overlay = section.querySelector('.video-overlay');
    this.content = section.querySelector('.video-hero-content');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupIntersectionObserver();
    this.startVideoPlayback();
  }

  bindEvents() {
    // Parallax scroll effect
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Pause video when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.video?.pause();
      } else {
        this.video?.play().catch(() => {});
      }
    });
  }

  updateParallax() {
    const rect = this.section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress through the section
    const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    
    // Parallax transform for video background
    if (this.videoContainer && rect.top < viewportHeight && rect.bottom > 0) {
      const translateY = (1 - clampedProgress) * -100;
      const scale = 1 + clampedProgress * 0.1;
      this.videoContainer.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
    
    // Content fade and lift effect
    if (this.content) {
      const contentOpacity = 1 - clampedProgress * 0.8;
      const contentTranslateY = clampedProgress * 60;
      this.content.style.opacity = contentOpacity;
      this.content.style.transform = `translateY(${contentTranslateY}px)`;
    }
    
    // Overlay intensity changes with scroll
    if (this.overlay) {
      const overlayOpacity = 0.4 + clampedProgress * 0.3;
      this.overlay.style.background = `linear-gradient(to bottom, 
        rgba(11, 11, 12, ${overlayOpacity}) 0%, 
        rgba(11, 11, 12, ${overlayOpacity + 0.2}) 100%)`;
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.section.classList.add('video-visible');
            this.startVideoPlayback();
          } else {
            this.pauseVideoPlayback();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(this.section);
  }

  startVideoPlayback() {
    if (this.video && this.video.paused) {
      this.video.play().catch(() => {
        // Auto-play failed (likely due to browser policy), use poster image
        console.log('Video autoplay prevented, using poster image');
      });
    }
  }

  pauseVideoPlayback() {
    if (this.video && !this.video.paused) {
      this.video.pause();
    }
  }

  // Add lazy loading for video source
  static lazyLoad(videoElement) {
    const sources = videoElement.querySelectorAll('source');
    sources.forEach(source => {
      const src = source.getAttribute('data-src');
      if (src) {
        source.src = src;
        source.removeAttribute('data-src');
      }
    });
    videoElement.load();
  }
}

// Initialize all video hero sections
document.addEventListener('DOMContentLoaded', () => {
  const videoHeroes = document.querySelectorAll('.video-hero-section');
  videoHeroes.forEach(section => {
    new VideoHeroParallax(section);
  });
  
  // Log initialization
  console.log('🎬 BuildBridge v29.0: Video Hero Parallax initialized');
});

// Intersection Observer for lazy video loading
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      VideoHeroParallax.lazyLoad(entry.target);
      videoObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '100px' });

// Observe videos for lazy loading
document.querySelectorAll('.video-background video[data-lazy]').forEach(video => {
  videoObserver.observe(video);
});

export default VideoHeroParallax;
