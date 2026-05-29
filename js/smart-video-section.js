/**
 * v72.0: Smart Video Background Section
 * Cinematic Ambient Video Management
 */

(function() {
  'use strict';

  const VideoSection = {
    config: {
      autoplayDelay: 1000,
      fadeInDuration: 1500
    },

    state: {
      isPlaying: true,
      isMuted: true,
      videoLoaded: false
    },

    init() {
      this.sections = document.querySelectorAll('.video-hero-section');
      if (!this.sections.length) return;

      this.sections.forEach(section => this.setupSection(section));
      this.bindGlobalEvents();
    },

    setupSection(section) {
      const video = section.querySelector('.video-background');
      const playBtn = section.querySelector('.video-play-btn');
      const muteBtn = section.querySelector('.video-mute-btn');
      const lightbox = section.querySelector('.video-lightbox');

      if (video) {
        this.setupVideo(video);
      }

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          this.openLightbox(section);
        });
      }

      if (lightbox) {
        const closeBtn = lightbox.querySelector('.video-lightbox-close');
        closeBtn?.addEventListener('click', () => this.closeLightbox(lightbox));
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) this.closeLightbox(lightbox);
        });
      }

      // Scroll indicator
      const scrollIndicator = section.querySelector('.video-scroll-indicator');
      scrollIndicator?.addEventListener('click', () => {
        const nextSection = section.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Controls
      section.querySelectorAll('.video-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.dataset.action;
          if (action === 'mute') this.toggleMute(video, btn);
          if (action === 'pause') this.togglePlay(video, btn);
        });
      });
    },

    setupVideo(video) {
      // Fade in when loaded
      video.addEventListener('loadeddata', () => {
        video.classList.add('loaded');
        this.state.videoLoaded = true;
      });

      // Handle errors gracefully
      video.addEventListener('error', () => {
        console.warn('Video failed to load, using fallback');
        video.style.display = 'none';
      });

      // Intersection Observer for play/pause
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.3 });

      observer.observe(video);
    },

    toggleMute(video, btn) {
      if (!video) return;
      
      video.muted = !video.muted;
      this.state.isMuted = video.muted;
      
      const icon = btn.querySelector('.control-icon') || btn;
      icon.textContent = video.muted ? '🔇' : '🔊';
      
      // Visual feedback
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = '', 200);
    },

    togglePlay(video, btn) {
      if (!video) return;

      if (video.paused) {
        video.play();
        this.state.isPlaying = true;
        btn.innerHTML = '⏸';
      } else {
        video.pause();
        this.state.isPlaying = false;
        btn.innerHTML = '▶';
      }
    },

    openLightbox(section) {
      const lightbox = section.querySelector('.video-lightbox');
      if (!lightbox) return;

      const videoId = lightbox.dataset.videoId;
      const playerContainer = lightbox.querySelector('.video-lightbox-player');

      if (videoId && playerContainer) {
        // YouTube embed
        playerContainer.innerHTML = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        `;
      }

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeLightbox(lightbox) {
      if (!lightbox) return;

      const playerContainer = lightbox.querySelector('.video-lightbox-player');
      if (playerContainer) {
        playerContainer.innerHTML = '';
      }

      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    },

    bindGlobalEvents() {
      // Close lightbox on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.video-lightbox.active').forEach(lb => {
            this.closeLightbox(lb);
          });
        }
      });

      // Reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.video-background').forEach(video => {
          video.pause();
        });
      }
    },

    // Parallax effect for video background
    applyParallax() {
      const videos = document.querySelectorAll('.video-background');
      
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        videos.forEach(video => {
          const rect = video.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const speed = 0.5;
            const yPos = scrollY * speed;
            video.style.transform = `translateY(${yPos}px) scale(1.1)`;
          }
        });
      }, { passive: true });
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VideoSection.init());
  } else {
    VideoSection.init();
  }

  // Expose globally
  window.BuildBridgeVideo = VideoSection;
})();
