/**
 * Video Background Section v81.4
 * Fortune 500 Cinematic Experience
 */

(function() {
  'use strict';

  const VideoBackground = {
    video: null,
    isPlaying: true,
    isMuted: true,
    progressInterval: null,
    
    init() {
      this.video = document.querySelector('.video-background video');
      if (!this.video) return;
      
      this.cacheElements();
      this.bindEvents();
      this.setupIntersectionObserver();
      this.updateProgress();
    },
    
    cacheElements() {
      this.elements = {
        playPauseBtn: document.querySelector('.video-play-pause'),
        muteBtn: document.querySelector('.video-mute'),
        progressBar: document.querySelector('.video-progress-bar'),
        scrollIndicator: document.querySelector('.video-scroll-indicator'),
        fallback: document.querySelector('.video-fallback')
      };
    },
    
    bindEvents() {
      // Play/Pause
      this.elements.playPauseBtn?.addEventListener('click', () => {
        this.togglePlayPause();
      });
      
      // Mute/Unmute
      this.elements.muteBtn?.addEventListener('click', () => {
        this.toggleMute();
      });
      
      // Scroll indicator
      this.elements.scrollIndicator?.addEventListener('click', () => {
        this.scrollToNextSection();
      });
      
      // Video events
      this.video.addEventListener('ended', () => {
        this.video.currentTime = 0;
        this.video.play();
      });
      
      // Reduced motion check
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.disableVideo();
      }
    },
    
    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (this.isPlaying) this.video.play();
          } else {
            this.video.pause();
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(this.video.closest('.video-hero-section'));
    },
    
    togglePlayPause() {
      if (this.video.paused) {
        this.video.play();
        this.isPlaying = true;
        this.updatePlayPauseIcon('play');
      } else {
        this.video.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcon('pause');
      }
    },
    
    updatePlayPauseIcon(state) {
      const btn = this.elements.playPauseBtn;
      if (!btn) return;
      
      btn.innerHTML = state === 'play' 
        ? '<span>⏸</span>' 
        : '<span>▶</span>';
    },
    
    toggleMute() {
      this.video.muted = !this.video.muted;
      this.isMuted = this.video.muted;
      this.updateMuteIcon();
    },
    
    updateMuteIcon() {
      const btn = this.elements.muteBtn;
      if (!btn) return;
      
      btn.innerHTML = this.isMuted 
        ? '<span>🔇</span>' 
        : '<span>🔊</span>';
    },
    
    updateProgress() {
      const progressBar = this.elements.progressBar;
      if (!progressBar) return;
      
      setInterval(() => {
        if (this.video && this.video.duration) {
          const progress = (this.video.currentTime / this.video.duration) * 100;
          progressBar.style.width = `${progress}%`;
        }
      }, 100);
    },
    
    scrollToNextSection() {
      const section = this.video.closest('.video-hero-section');
      const nextSection = section?.nextElementSibling;
      
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    disableVideo() {
      this.video.pause();
      this.video.style.display = 'none';
      this.elements.fallback?.classList.add('active');
    },
    
    // Parallax effect on scroll
    enableParallax() {
      const section = this.video.closest('.video-hero-section');
      
      window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const scrollProgress = 1 - (rect.bottom / (window.innerHeight + rect.height));
        
        if (scrollProgress > 0 && scrollProgress < 1) {
          const translateY = scrollProgress * 100;
          this.video.style.transform = `translateY(${translateY}px) scale(${1 + scrollProgress * 0.1})`;
        }
      }, { passive: true });
    }
  };

  // Lazy load video
  const lazyLoadVideo = () => {
    const video = document.querySelector('.video-background video[data-src]');
    if (video) {
      video.src = video.dataset.src;
      video.removeAttribute('data-src');
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      VideoBackground.init();
      lazyLoadVideo();
    });
  } else {
    VideoBackground.init();
    lazyLoadVideo();
  }

  window.BuildBridgeVideoBackground = VideoBackground;
})();
