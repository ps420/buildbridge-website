/**
 * Cinematic Video Section
 * v25.0 Fortune 500 Professional Feature
 * Auto-playing video backgrounds with parallax and interaction
 */

class CinematicVideoSection {
  constructor(container) {
    this.container = container;
    this.video = container.querySelector('video');
    this.poster = container.querySelector('.cinematic-video-poster');
    this.playBtn = container.querySelector('.cinematic-video-play');
    this.soundBtn = container.querySelector('.cinematic-video-sound');
    this.isPlaying = false;
    this.isMuted = true;
    this.parallaxEnabled = container.dataset.parallax === 'true';
    
    this.init();
  }
  
  init() {
    if (!this.video) return;
    
    // Set up video attributes
    this.setupVideo();
    
    // Bind events
    this.bindEvents();
    
    // Set up parallax
    if (this.parallaxEnabled) {
      this.setupParallax();
    }
    
    // Set up intersection observer for lazy play
    this.setupIntersectionObserver();
  }
  
  setupVideo() {
    // Ensure video has proper attributes for autoplay
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.loop = true;
    this.video.preload = 'metadata';
    
    // Try to autoplay
    this.attemptAutoplay();
  }
  
  async attemptAutoplay() {
    try {
      await this.video.play();
      this.isPlaying = true;
      this.container.classList.add('video-playing');
    } catch (err) {
      // Autoplay blocked, show poster and play button
      this.showPoster();
    }
  }
  
  bindEvents() {
    // Play button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    
    // Sound button
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => this.toggleSound());
    }
    
    // Click on container to toggle play
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container || e.target.closest('.cinematic-video-container')) {
        this.togglePlay();
      }
    });
    
    // Video events
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.hidePoster();
      this.updatePlayButton();
    });
    
    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        this.video.pause();
      } else if (!document.hidden && this.wasPlaying) {
        this.video.play();
      }
      this.wasPlaying = this.isPlaying;
    });
  }
  
  setupParallax() {
    let ticking = false;
    
    const updateParallax = () => {
      const rect = this.container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const parallaxOffset = (scrollProgress - 0.5) * 100; // -50 to 50
        
        this.video.style.transform = `translate(-50%, calc(-50% + ${parallaxOffset}px)) scale(1.2)`;
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    
    // Initial call
    updateParallax();
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (this.isPlaying) {
              this.video.play();
            }
          } else {
            this.video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(this.container);
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.video.pause();
    } else {
      this.video.play();
      this.hidePoster();
    }
  }
  
  toggleSound() {
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;
    this.updateSoundButton();
  }
  
  showPoster() {
    if (this.poster) {
      this.poster.style.opacity = '1';
    }
    if (this.playBtn) {
      this.playBtn.style.opacity = '1';
      this.playBtn.style.visibility = 'visible';
    }
  }
  
  hidePoster() {
    if (this.poster) {
      this.poster.style.opacity = '0';
    }
    if (this.playBtn) {
      this.playBtn.style.opacity = '0';
      this.playBtn.style.visibility = 'hidden';
    }
  }
  
  updatePlayButton() {
    if (!this.playBtn) return;
    
    const icon = this.playBtn.querySelector('svg');
    if (this.isPlaying) {
      // Show pause icon
      icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    } else {
      // Show play icon
      icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    }
  }
  
  updateSoundButton() {
    if (!this.soundBtn) return;
    
    const icon = this.soundBtn.querySelector('svg');
    if (this.isMuted) {
      // Show muted icon
      icon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      `;
    } else {
      // Show sound icon
      icon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      `;
    }
  }
}

// Auto-initialize cinematic video sections
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.cinematic-video-section');
  sections.forEach(section => new CinematicVideoSection(section));
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CinematicVideoSection;
}
