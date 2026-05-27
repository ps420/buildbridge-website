/**
 * BuildBridge v26.2 - Video Testimonials Carousel
 * Fortune 500 Quality Video Review System
 */

(function() {
  'use strict';

  const videoTestimonials = [
    {
      id: 1,
      thumbnail: 'assets/02_Website_Heroes/Hero_1.png',
      duration: '2:34',
      quote: "BuildBridge transformed what could have been a stressful experience into something enjoyable. Their transparent communication and attention to detail gave us complete confidence throughout our project.",
      author: {
        name: 'Sarah Mitchell',
        role: 'Homeowner',
        location: 'Cape Town',
        avatar: 'assets/02_Website_Heroes/Hero_2.png'
      },
      project: {
        name: 'Luxury Villa Renovation',
        value: 'R3.2M',
        details: 'Complete home transformation'
      }
    },
    {
      id: 2,
      thumbnail: 'assets/03_Social_Campaign/Campaign_4.png',
      duration: '3:12',
      quote: "As a business owner, time is money. BuildBridge delivered our commercial headquarters two weeks ahead of schedule and under budget. Their contractor matching system is second to none.",
      author: {
        name: 'Michael Okonkwo',
        role: 'CEO, TechVentures Ltd',
        location: 'Johannesburg',
        avatar: 'assets/03_Social_Campaign/Campaign_5.png'
      },
      project: {
        name: 'Corporate Headquarters',
        value: 'R12M',
        details: '10-story office building'
      }
    },
    {
      id: 3,
      thumbnail: 'assets/03_Social_Campaign/Campaign_5.png',
      duration: '1:58',
      quote: "The team at BuildBridge truly understands construction management. They handled every challenge with professionalism and kept us informed at every stage. Highly recommended!",
      author: {
        name: 'Lisa van der Berg',
        role: 'Property Developer',
        location: 'Durban',
        avatar: 'assets/02_Website_Heroes/Hero_1.png'
      },
      project: {
        name: 'Waterfront Complex',
        value: 'R8.5M',
        details: 'Mixed-use development'
      }
    }
  ];

  class VideoTestimonials {
    constructor(container) {
      this.container = container;
      this.carousel = container.querySelector('.video-carousel-track');
      this.currentSlide = 0;
      this.testimonials = videoTestimonials;
      this.isAnimating = false;
      
      this.init();
    }

    init() {
      this.createSlides();
      this.setupNavigation();
      this.setupDots();
      this.setupModal();
      this.startAutoplay();
    }

    createSlides() {
      this.testimonials.forEach(testimonial => {
        const slide = document.createElement('div');
        slide.className = 'video-slide';
        slide.innerHTML = `
          <div class="video-container">
            <img src="${testimonial.thumbnail}" alt="${testimonial.author.name}" class="video-placeholder">
            <button class="video-play-btn" data-id="${testimonial.id}" aria-label="Play video testimonial">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <span class="video-duration">${testimonial.duration}</span>
          </div>
          <div class="video-content">
            <div class="quote-icon">"</div>
            <blockquote class="video-testimonial-text">${testimonial.quote}</blockquote>
            <div class="video-testimonial-author">
              <img src="${testimonial.author.avatar}" alt="${testimonial.author.name}" class="video-author-avatar">
              <div class="video-author-info">
                <h4>${testimonial.author.name}</h4>
                <span>${testimonial.author.role}, ${testimonial.author.location}</span>
              </div>
            </div>
            <div class="video-project-info">
              <h5>${testimonial.project.name}</h5>
              <p>${testimonial.project.details} • ${testimonial.project.value}</p>
            </div>
          </div>
        `;
        this.carousel.appendChild(slide);
      });
    }

    setupNavigation() {
      const prevBtn = this.container.querySelector('.video-carousel-btn.prev');
      const nextBtn = this.container.querySelector('.video-carousel-btn.next');
      
      prevBtn.addEventListener('click', () => this.prev());
      nextBtn.addEventListener('click', () => this.next());
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }

    setupDots() {
      const dotsContainer = this.container.querySelector('.video-carousel-dots');
      
      this.testimonials.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'video-carousel-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => this.goTo(index));
        dotsContainer.appendChild(dot);
      });
    }

    setupModal() {
      const modal = document.getElementById('video-testimonial-modal');
      if (!modal) return;
      
      // Play button click
      this.carousel.querySelectorAll('.video-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          this.openModal(id);
        });
      });
      
      // Close modal
      modal.querySelector('.video-modal-close').addEventListener('click', () => this.closeModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
      
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }

    goTo(index) {
      if (this.isAnimating || index === this.currentSlide) return;
      this.isAnimating = true;
      
      this.currentSlide = index;
      this.updateCarousel();
      
      setTimeout(() => this.isAnimating = false, 600);
    }

    next() {
      const nextIndex = (this.currentSlide + 1) % this.testimonials.length;
      this.goTo(nextIndex);
    }

    prev() {
      const prevIndex = (this.currentSlide - 1 + this.testimonials.length) % this.testimonials.length;
      this.goTo(prevIndex);
    }

    updateCarousel() {
      // Move track
      this.carousel.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      
      // Update dots
      const dots = this.container.querySelectorAll('.video-carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
    }

    openModal(id) {
      const modal = document.getElementById('video-testimonial-modal');
      const videoContainer = modal.querySelector('.video-modal-content');
      
      // In a real implementation, this would load an actual video
      // For demo purposes, we'll show a placeholder with the testimonial image
      const testimonial = this.testimonials.find(t => t.id === id);
      
      videoContainer.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #0f0f10;">
          <img src="${testimonial.thumbnail}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">
          <div style="position: absolute; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px;">▶️</div>
            <p style="color: #F5F7FA; font-size: 1.2rem;">Video Testimonial Playback</p>
            <p style="color: #C9CED6; margin-top: 10px;">${testimonial.author.name} - ${testimonial.project.name}</p>
            <p style="color: #C9A962; margin-top: 20px; font-size: 0.9rem;">(Video integration available)</p>
          </div>
        </div>
      `;
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      const modal = document.getElementById('video-testimonial-modal');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    startAutoplay() {
      setInterval(() => {
        if (!document.querySelector('.video-testimonial-modal.active')) {
          this.next();
        }
      }, 8000);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.video-testimonials-section').forEach(section => {
      new VideoTestimonials(section);
    });
  });

  window.VideoTestimonials = VideoTestimonials;
})();
