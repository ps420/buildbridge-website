/**
 * v44.1: Scroll-Triggered Video Reveal
 * Cinematic video entrances with scroll-based animations
 */

(function() {
  'use strict';

  class ScrollVideoReveal {
    constructor(element, options = {}) {
      this.element = element;
      this.video = element.querySelector('video');
      this.options = {
        threshold: 0.3,
        rootMargin: '0px',
        autoplay: true,
        revealAnimation: 'default', // default, diagonal, circle
        ...options
      };

      this.isRevealed = false;
      this.isPlaying = false;
      this.scrollProgress = 0;

      this.init();
    }

    init() {
      this.setupVideo();
      this.createProgressIndicator();
      this.bindEvents();
      this.observe();
    }

    setupVideo() {
      if (!this.video) return;

      // Set video attributes for better performance
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('muted', '');
      this.video.setAttribute('loop', '');
      this.video.setAttribute('preload', 'metadata');

      // Add reveal animation class if specified
      if (this.options.revealAnimation === 'diagonal') {
        this.element.classList.add('diagonal-wipe');
      } else if (this.options.revealAnimation === 'circle') {
        this.element.classList.add('circle-expand');
      }

      // Apply initial scale
      this.video.style.transform = 'scale(1.2)';
    }

    createProgressIndicator() {
      // Check if progress ring already exists
      if (this.element.querySelector('.video-progress-ring')) return;

      const progressRing = document.createElement('div');
      progressRing.className = 'video-progress-ring';
      progressRing.innerHTML = `
        <svg viewBox="0 0 60 60">
          <circle class="progress-ring-bg" cx="30" cy="30" r="25"/>
          <circle class="progress-ring-fill" cx="30" cy="30" r="25"/>
        </svg>
        <span class="video-progress-text">0%</span>
      `;
      this.element.appendChild(progressRing);

      this.progressRing = progressRing;
      this.progressFill = progressRing.querySelector('.progress-ring-fill');
      this.progressText = progressRing.querySelector('.video-progress-text');
    }

    observe() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isRevealed) {
            this.reveal();
          }
          
          // Play/pause based on visibility
          if (this.video) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
              this.play();
            } else {
              this.pause();
            }
          }
        });
      }, {
        threshold: [0, 0.2, 0.3, 0.5, 0.8, 1],
        rootMargin: this.options.rootMargin
      });

      observer.observe(this.element);
    }

    reveal() {
      if (this.isRevealed) return;
      this.isRevealed = true;

      // Add revealed class for CSS animations
      this.element.classList.add('revealed');

      // Scale down video
      if (this.video) {
        setTimeout(() => {
          this.video.style.transform = 'scale(1)';
        }, 100);
      }

      // Dispatch reveal event
      this.element.dispatchEvent(new CustomEvent('video:revealed', {
        bubbles: true
      }));
    }

    play() {
      if (this.isPlaying || !this.video) return;
      
      const playPromise = this.video.play();
      if (playPromise) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(() => {
          // Autoplay blocked, will need user interaction
        });
      }
    }

    pause() {
      if (!this.isPlaying || !this.video) return;
      
      this.video.pause();
      this.isPlaying = false;
    }

    bindEvents() {
      // Track scroll progress for video
      if (this.video) {
        window.addEventListener('scroll', () => this.updateScrollProgress(), { passive: true });
      }

      // Play button click
      const playBtn = this.element.querySelector('.video-reveal-play');
      if (playBtn) {
        playBtn.addEventListener('click', () => this.togglePlayPause());
      }

      // Video click to play/pause
      this.element.addEventListener('click', (e) => {
        if (e.target === this.video || e.target.closest('.video-reveal-wrapper') === this.element) {
          this.togglePlayPause();
        }
      });
    }

    updateScrollProgress() {
      if (!this.isRevealed) return;

      const rect = this.element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the element
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Progress from when element enters viewport to when it leaves
      const start = windowHeight;
      const end = -elementHeight;
      const current = elementTop;
      
      this.scrollProgress = Math.max(0, Math.min(1, (start - current) / (start - end)));

      // Update video currentTime based on scroll (if video is loaded)
      if (this.video && this.video.duration && !this.isPlaying) {
        this.video.currentTime = this.scrollProgress * this.video.duration;
      }

      // Update progress ring
      this.updateProgressRing();
    }

    updateProgressRing() {
      if (!this.progressFill || !this.progressText) return;

      const circumference = 2 * Math.PI * 25;
      const offset = circumference - (this.scrollProgress * circumference);
      
      this.progressFill.style.strokeDashoffset = offset;
      this.progressText.textContent = `${Math.round(this.scrollProgress * 100)}%`;
    }

    togglePlayPause() {
      if (!this.video) return;

      if (this.video.paused) {
        this.video.play();
        this.isPlaying = true;
      } else {
        this.video.pause();
        this.isPlaying = false;
      }
    }

    // Static method to initialize all videos
    static init(selector = '.video-reveal-wrapper', options = {}) {
      const videos = document.querySelectorAll(selector);
      return Array.from(videos).map(video => new ScrollVideoReveal(video, options));
    }
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollVideoReveal.init());
  } else {
    ScrollVideoReveal.init();
  }

  // Expose globally
  window.ScrollVideoReveal = ScrollVideoReveal;
})();
