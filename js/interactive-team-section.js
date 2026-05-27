/**
 * Interactive Team Section - v22.0 Professional Enhancement
 * Dynamic team showcase with hover effects and interactive cards
 */

class InteractiveTeamSection {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '.team-section');
    if (!this.container) return;
    
    this.cards = this.container.querySelectorAll('.team-card');
    this.modal = null;
    
    this.init();
  }
  
  init() {
    this.setupCards();
    this.createModal();
    this.bindEvents();
  }
  
  setupCards() {
    this.cards.forEach((card, index) => {
      // Add entrance animation delay
      card.style.animationDelay = `${index * 0.1}s`;
      
      // Add 3D tilt effect data
      card.dataset.tilt = 'true';
      
      // Set up image hover effect
      const image = card.querySelector('.team-image');
      if (image) {
        image.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s ease';
      }
    });
  }
  
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'team-modal';
    this.modal.innerHTML = `
      <div class="team-modal-backdrop"></div>
      <div class="team-modal-content">
        <button class="team-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="team-modal-body"></div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    
    // Close handlers
    this.modal.querySelector('.team-modal-close').addEventListener('click', () => this.closeModal());
    this.modal.querySelector('.team-modal-backdrop').addEventListener('click', () => this.closeModal());
  }
  
  bindEvents() {
    this.cards.forEach(card => {
      // 3D Tilt effect on mousemove
      card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
      card.addEventListener('mouseleave', () => this.resetTilt(card));
      
      // Click to open modal
      card.addEventListener('click', () => this.openModal(card));
      
      // Magnetic effect on icon hover
      const socialLinks = card.querySelectorAll('.team-social a');
      socialLinks.forEach(link => {
        link.addEventListener('mousemove', (e) => this.handleMagnetic(e, link));
        link.addEventListener('mouseleave', () => this.resetMagnetic(link));
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
  
  handleTilt(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
    
    // Parallax effect on image
    const image = card.querySelector('.team-image');
    if (image) {
      const moveX = (x - centerX) / 20;
      const moveY = (y - centerY) / 20;
      image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    }
  }
  
  resetTilt(card) {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease';
    
    const image = card.querySelector('.team-image');
    if (image) {
      image.style.transform = 'translate(0, 0) scale(1)';
    }
    
    setTimeout(() => {
      card.style.transition = '';
    }, 500);
  }
  
  handleMagnetic(e, link) {
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }
  
  resetMagnetic(link) {
    link.style.transform = 'translate(0, 0)';
    link.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      link.style.transition = '';
    }, 300);
  }
  
  openModal(card) {
    const name = card.querySelector('.team-name')?.textContent || '';
    const role = card.querySelector('.team-role')?.textContent || '';
    const image = card.querySelector('.team-image')?.src || '';
    const bio = card.dataset.bio || '';
    const expertise = card.dataset.expertise?.split(',') || [];
    const education = card.dataset.education || '';
    const experience = card.dataset.experience || '';
    
    const modalBody = this.modal.querySelector('.team-modal-body');
    modalBody.innerHTML = `
      <div class="team-modal-image">
        <img src="${image}" alt="${name}">
      </div>
      <div class="team-modal-info">
        <h2 class="team-modal-name">${name}</h2>
        <p class="team-modal-role">${role}</p>
        <div class="team-modal-meta">
          <span class="team-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            ${experience} Experience
          </span>
          <span class="team-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            ${education}
          </span>
        </div>
        <div class="team-modal-bio">
          <p>${bio}</p>
        </div>
        ${expertise.length ? `
          <div class="team-modal-expertise">
            <h4>Areas of Expertise</h4>
            <div class="expertise-tags">
              ${expertise.map(skill => `<span class="expertise-tag">${skill.trim()}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        <div class="team-modal-social">
          <a href="#" class="social-link linkedin">LinkedIn</a>
          <a href="#" class="social-link email">Email</a>
        </div>
      </div>
    `;
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Stat counter animation
class TeamStatCounter {
  constructor(element) {
    this.element = element;
    this.target = parseInt(element.dataset.count) || 0;
    this.suffix = element.dataset.suffix || '';
    this.duration = parseInt(element.dataset.duration) || 2000;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
          this.observer.unobserve(entry.target);
        }
      });
    });
    
    this.observer.observe(element);
  }
  
  animate() {
    const startTime = performance.now();
    
    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(this.target * easeOut);
      
      this.element.textContent = current + this.suffix;
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    
    requestAnimationFrame(tick);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize team section
  window.teamSection = new InteractiveTeamSection();
  
  // Initialize stat counters
  document.querySelectorAll('.team-stat-count').forEach(el => {
    new TeamStatCounter(el);
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InteractiveTeamSection, TeamStatCounter };
}
