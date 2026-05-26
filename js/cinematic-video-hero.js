/**
 * BuildBridge Cinematic Video Hero v13.0
 * Fortune 500-grade video background management
 */

class CinematicVideoHero {
  constructor(options = {}) {
    this.options = {
      selector: '.video-hero',
      autoplay: true,
      muted: true,
      loop: true,
      playsInline: true,
      preload: 'metadata',
      videoSrc: null,
      posterSrc: null,
      youtubeId: null,
      vimeoId: null,
      overlayOpacity: 0.5,
      parallaxIntensity: 0.3,
      ...options
    };

    this.hero = null;
    this.video = null;
    this.isPlaying = false;
    this.isMuted = this.options.muted;
    this.scrollHandler = null;
    
    this.init();
  }

  init() {
    this.hero = document.querySelector(this.options.selector);
    if (!this.hero) return;

    this.setupVideo();
    this.setupControls();
    this.setupParallax();
    this.setupLightbox();
    
    console.log('🎬 Cinematic Video Hero activated');
  }

  setupVideo() {
    const videoContainer = this.hero.querySelector('.video-hero-bg');
    if (!videoContainer) return;

    // Check for YouTube embed
    if (this.options.youtubeId) {
      this.createYouTubeEmbed(videoContainer);
      return;
    }

    // Check for Vimeo embed
    if (this.options.vimeoId) {
      this.createVimeoEmbed(videoContainer);
      return;
    }

    // Create video element
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.muted = this.options.muted;
    this.video.loop = this.options.loop;
    this.video.autoplay = this.options.autoplay;
    this.video.preload = this.options.preload;
    
    if (this.options.posterSrc) {
      this.video.poster = this.options.posterSrc;
    }

    // Add sources
    if (this.options.videoSrc) {
      if (Array.isArray(this.options.videoSrc)) {
        this.options.videoSrc.forEach(src => {
          const source = document.createElement('source');
          source.src = src.url;
          source.type = src.type;
          this.video.appendChild(source);
        });
      } else {
        this.video.src = this.options.videoSrc;
      }
    }

    videoContainer.appendChild(this.video);

    // Event listeners
    this.video.addEventListener('loadeddata', () => {
      this.hero.classList.add('video-loaded');
    });

    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayButton();
    });

    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });

    // Intersection Observer for performance
    this.setupIntersectionObserver();
  }

  createYouTubeEmbed(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-hero-embed';
    wrapper.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${this.options.youtubeId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${this.options.youtubeId}&start=0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    `;
    container.appendChild(wrapper);
  }

  createVimeoEmbed(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-hero-embed';
    wrapper.innerHTML = `
      <iframe 
        src="https://player.vimeo.com/video/${this.options.vimeoId}?autoplay=1&muted=1&loop=1&controls=0"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
    `;
    container.appendChild(wrapper);
  }

  setupIntersectionObserver() {
    if (!this.video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (this.options.autoplay) this.play();
          } else {
            this.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.hero);
  }

  setupControls() {
    // Play/Pause button
    const playBtn = this.hero.querySelector('.video-hero-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }

    // Control buttons
    const muteBtn = this.hero.querySelector('[data-video-action="mute"]');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleMute());
    }

    const fullscreenBtn = this.hero.querySelector('[data-video-action="fullscreen"]');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
    }

    // Scroll indicator
    const scrollIndicator = this.hero.querySelector('.video-hero-scroll');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        const nextSection = this.hero.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  setupParallax() {
    if (!this.options.parallaxIntensity || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ticking = false;

    this.scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = this.hero.offsetHeight;
          
          if (scrollY < heroHeight) {
            const parallaxY = scrollY * this.options.parallaxIntensity;
            const opacity = 1 - (scrollY / heroHeight);
            
            const bg = this.hero.querySelector('.video-hero-bg, .video-hero-fallback');
            if (bg) {
              bg.style.transform = `translateY(${parallaxY}px)`;
            }
            
            const overlay = this.hero.querySelector('.video-hero-overlay');
            if (overlay) {
              overlay.style.opacity = Math.max(0.3, opacity);
            }
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  setupLightbox() {
    const lightbox = document.querySelector('.video-lightbox');
    if (!lightbox) return;

    const playBtn = this.hero.querySelector('.video-hero-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pause background video
        if (this.video) this.video.pause();
      });
    }

    const closeBtn = lightbox.querySelector('.video-lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLightbox(lightbox));
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        this.closeLightbox(lightbox);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        this.closeLightbox(lightbox);
      }
    });
  }

  closeLightbox(lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    // Resume background video
    if (this.video && this.options.autoplay) {
      this.video.play();
    }
  }

  togglePlay() {
    if (!this.video) return;
    
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.video) {
      this.video.play().catch(() => {
        // Autoplay was prevented
        console.log('Autoplay prevented, user interaction required');
      });
    }
  }

  pause() {
    if (this.video) {
      this.video.pause();
    }
  }

  toggleMute() {
    if (!this.video) return;
    
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;
    this.updateMuteButton();
  }

  enterFullscreen() {
    if (!this.video) return;
    
    if (this.video.requestFullscreen) {
      this.video.requestFullscreen();
    } else if (this.video.webkitRequestFullscreen) {
      this.video.webkitRequestFullscreen();
    }
  }

  updatePlayButton() {
    const playBtn = this.hero?.querySelector('.video-hero-play');
    if (!playBtn) return;

    playBtn.innerHTML = this.isPlaying ? `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
      </svg>
    ` : `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  }

  updateMuteButton() {
    const muteBtn = this.hero?.querySelector('[data-video-action="mute"]');
    if (!muteBtn) return;

    muteBtn.innerHTML = this.isMuted ? `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
      </svg>
    ` : `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
      </svg>
    `;
  }

  destroy() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.video) {
      this.video.pause();
      this.video.src = '';
      this.video.load();
    }
  }

  // Public API
  seek(time) {
    if (this.video) {
      this.video.currentTime = time;
    }
  }

  setPlaybackRate(rate) {
    if (this.video) {
      this.video.playbackRate = rate;
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.cinematicHero = new CinematicVideoHero();
});

// Expose to global
window.CinematicVideoHero = CinematicVideoHero;
