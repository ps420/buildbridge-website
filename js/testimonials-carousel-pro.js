/**
 * Testimonials Carousel Pro
 * v76.0: Fortune 500 Social Proof System
 */

class TestimonialsCarouselPro {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      autoplay: options.autoplay !== false,
      autoplayDelay: options.autoplayDelay || 6000,
      showDots: options.showDots !== false,
      showArrows: options.showArrows !== false,
      loop: options.loop !== false,
      ...options
    };
    
    this.testimonials = options.testimonials || this.getDefaultTestimonials();
    this.currentIndex = 0;
    this.autoplayTimer = null;
    this.isPlaying = false;
    this.touchStartX = 0;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.render();
    this.bindEvents();
    this.startAutoplay();
    this.animateStats();
  }
  
  getDefaultTestimonials() {
    return [
      {
        id: 1,
        quote: "BuildBridge transformed our construction experience. Their attention to detail and transparent communication made the entire process seamless. Our office tower was completed 2 weeks ahead of schedule.",
        author: "Sarah Mitchell",
        role: "CEO",
        company: "Metro Developments",
        avatar: "assets/02_Website_Heroes/Hero_2.png",
        video: null,
        image: "assets/02_Website_Heroes/Hero_1.png",
        rating: 5,
        project: "Cape Town Office Tower",
        verified: true
      },
      {
        id: 2,
        quote: "Working with BuildBridge was a game-changer for our residential development. Their contractor matching system found us the perfect partners, and the project management was exceptional.",
        author: "Michael Okonkwo",
        role: "Director",
        company: "Coastal Living Properties",
        avatar: "assets/03_Social_Campaign/Campaign_4.png",
        video: null,
        image: "assets/02_Website_Heroes/Hero_2.png",
        rating: 5,
        project: "Durban Residential Complex",
        verified: true
      },
      {
        id: 3,
        quote: "The professionalism and expertise BuildBridge brought to our mall renovation exceeded all expectations. They managed a complex project with multiple stakeholders flawlessly.",
        author: "Lisa van der Berg",
        role: "Operations Manager",
        company: "Retail Properties Ltd",
        avatar: "assets/03_Social_Campaign/Campaign_5.png",
        video: null,
        image: "assets/03_Social_Campaign/Campaign_4.png",
        rating: 5,
        project: "Johannesburg Mall Renovation",
        verified: true
      },
      {
        id: 4,
        quote: "From initial consultation to final handover, BuildBridge demonstrated why they're the best in the business. Our wine estate project was handled with incredible care and precision.",
        author: "John Anderson",
        role: "Owner",
        company: "Cape Vineyards",
        avatar: "assets/02_Website_Heroes/Hero_1.png",
        video: null,
        image: "assets/03_Social_Campaign/Campaign_5.png",
        rating: 5,
        project: "Stellenbosch Wine Estate",
        verified: true
      }
    ];
  }
  
  render() {
    this.container.innerHTML = `
      <div class="testimonials-carousel-container">
        <div class="testimonials-carousel">
          <div class="testimonials-track">
            ${this.testimonials.map((t, i) => this.renderTestimonialCard(t, i)).join('')}
          </div>
        </div>
        
        ${this.options.showArrows ? `
          <div class="testimonials-pro-nav">
            <button class="testimonials-pro-btn prev" aria-label="Previous testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            ${this.options.showDots ? `
              <div class="testimonials-pro-dots">
                ${this.testimonials.map((_, i) => `
                  <button class="testimonials-pro-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>
                `).join('')}
              </div>
            ` : ''}
            
            <button class="testimonials-pro-btn next" aria-label="Next testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
      
      <div class="testimonials-pro-stats">
        <div class="testimonials-stat">
          <div class="testimonials-stat-icon">⭐</div>
          <div class="testimonials-stat-number" data-count="4.9">0</div>
          <div class="testimonials-stat-label">Average Rating</div>
        </div>
        <div class="testimonials-stat">
          <div class="testimonials-stat-icon">👥</div>
          <div class="testimonials-stat-number" data-count="150">0</div>
          <div class="testimonials-stat-label">Happy Clients</div>
        </div>
        <div class="testimonials-stat">
          <div class="testimonials-stat-icon">🏆</div>
          <div class="testimonials-stat-number" data-count="98">0</div>
          <div class="testimonials-stat-label">% Satisfaction</div>
        </div>
        <div class="testimonials-stat">
          <div class="testimonials-stat-icon">📝</div>
          <div class="testimonials-stat-number" data-count="127">0</div>
          <div class="testimonials-stat-label">Reviews</div>
        </div>
      </div>
    `;
    
    this.track = this.container.querySelector('.testimonials-track');
    this.cards = this.container.querySelectorAll('.testimonial-pro-card');
    this.dots = this.container.querySelectorAll('.testimonials-pro-dot');
  }
  
  renderTestimonialCard(testimonial, index) {
    const stars = Array(5).fill(0).map((_, i) => `
      <span class="testimonial-star">${i < testimonial.rating ? '★' : '☆'}</span>
    `).join('');
    
    return `
      <div class="testimonial-pro-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="testimonial-pro-inner">
          <div class="testimonial-pro-video">
            <img src="${testimonial.image}" alt="${testimonial.project}" loading="lazy">
            <div class="testimonial-pro-video-overlay"></div>
            ${testimonial.video ? `
              <button class="testimonial-play-btn" data-video="${testimonial.video}" aria-label="Play video testimonial">
                ▶
              </button>
            ` : `
              <button class="testimonial-play-btn" aria-label="View project" disabled style="opacity: 0.5; cursor: default;">
                🏗️
              </button>
            `}
          </div>
          
          <div class="testimonial-pro-content">
            <div class="testimonial-pro-rating">${stars}</div>
            
            <div class="testimonial-pro-quote">
              <p>${testimonial.quote}</p>
            </div>
            
            <div class="testimonial-pro-author">
              <div class="testimonial-pro-avatar">
                <img src="${testimonial.avatar}" alt="${testimonial.author}" loading="lazy">
              </div>
              <div class="testimonial-pro-author-info">
                <h4>${testimonial.author}</h4>
                <div class="role">${testimonial.role}</div>
                <div class="company">${testimonial.company}</div>
                ${testimonial.verified ? `
                  <div class="testimonial-verified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Verified Client
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="testimonial-pro-project">
              <div class="testimonial-pro-project-label">Project</div>
              <div class="testimonial-pro-project-name">${testimonial.project}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Navigation buttons
    const prevBtn = this.container.querySelector('.testimonials-pro-btn.prev');
    const nextBtn = this.container.querySelector('.testimonials-pro-btn.next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.prev();
        this.resetAutoplay();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.next();
        this.resetAutoplay();
      });
    }
    
    // Dot navigation
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.resetAutoplay();
      });
    });
    
    // Touch events for swipe
    this.track.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    this.track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = this.touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
        this.resetAutoplay();
      }
    }, { passive: true });
    
    // Pause autoplay on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
    
    // Video modal
    this.container.querySelectorAll('.testimonial-play-btn[data-video]').forEach(btn => {
      btn.addEventListener('click', () => this.openVideoModal(btn.dataset.video));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isInViewport()) return;
      
      if (e.key === 'ArrowLeft') {
        this.prev();
        this.resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        this.next();
        this.resetAutoplay();
      }
    });
  }
  
  goToSlide(index) {
    if (index === this.currentIndex) return;
    
    // Update track position
    this.track.style.transform = `translateX(-${index * 100}%)`;
    
    // Update card states
    this.cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    
    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    this.currentIndex = index;
  }
  
  next() {
    const newIndex = this.options.loop 
      ? (this.currentIndex + 1) % this.testimonials.length
      : Math.min(this.currentIndex + 1, this.testimonials.length - 1);
    
    this.goToSlide(newIndex);
  }
  
  prev() {
    const newIndex = this.options.loop
      ? (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length
      : Math.max(this.currentIndex - 1, 0);
    
    this.goToSlide(newIndex);
  }
  
  startAutoplay() {
    if (!this.options.autoplay || this.isPlaying) return;
    
    this.isPlaying = true;
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplayDelay);
  }
  
  stopAutoplay() {
    this.isPlaying = false;
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
  
  openVideoModal(videoSrc) {
    const modal = document.createElement('div');
    modal.className = 'testimonials-video-modal';
    modal.innerHTML = `
      <div class="testimonials-video-modal-backdrop"></div>
      <div class="testimonials-video-modal-content">
        <button class="testimonials-video-modal-close" aria-label="Close video">×</button>
        <video controls autoplay>
          <source src="${videoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    
    // Close handlers
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 400);
    };
    
    modal.querySelector('.testimonials-video-modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.testimonials-video-modal-close').addEventListener('click', closeModal);
    
    // Close on escape
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Stop video when closing
    modal.addEventListener('transitionend', () => {
      if (!modal.classList.contains('active')) {
        const video = modal.querySelector('video');
        if (video) video.pause();
      }
    });
  }
  
  animateStats() {
    const stats = this.container.querySelectorAll('.testimonials-stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseFloat(entry.target.dataset.count);
          this.animateNumber(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
  }
  
  animateNumber(element, target) {
    const isDecimal = target % 1 !== 0;
    const duration = 1500;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = easeProgress * target;
      
      if (isDecimal) {
        element.textContent = current.toFixed(1);
      } else {
        element.textContent = Math.floor(current);
      }
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = isDecimal ? target.toFixed(1) : target;
      }
    };
    
    requestAnimationFrame(update);
  }
  
  isInViewport() {
    const rect = this.container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.testimonials-carousel-pro');
  containers.forEach(container => {
    new TestimonialsCarouselPro(container);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestimonialsCarouselPro;
}
