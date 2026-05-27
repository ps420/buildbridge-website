/**
 * BuildBridge v15.0 - Smart Announcement Bar
 * Fortune 500 professional broadcast system with targeting
 */

(function() {
  'use strict';

  class AnnouncementBar {
    constructor(options = {}) {
      this.options = {
        storageKey: 'buildbridge_announcements_dismissed',
        carouselInterval: 5000,
        maxDisplayCount: 3,
        ...options
      };

      this.announcements = [];
      this.currentIndex = 0;
      this.dismissedIds = this.loadDismissed();
      this.carouselTimer = null;

      this.init();
    }

    init() {
      this.container = this.createContainer();
      this.loadAnnouncements();
      
      // Check for URL params
      this.checkUrlParams();
      
      // Listen for custom events
      window.addEventListener('show-announcement', (e) => {
        this.show(e.detail);
      });
    }

    createContainer() {
      const bar = document.createElement('div');
      bar.className = 'announcement-bar';
      bar.innerHTML = `
        <div class="announcement-content">
          <div class="announcement-carousel">
            <div class="announcement-slides"></div>
          </div>
          <div class="announcement-dots"></div>
        </div>
        <button class="announcement-close" aria-label="Dismiss announcement">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      `;
      
      // Insert after nav
      const nav = document.querySelector('.nav');
      if (nav) {
        nav.after(bar);
      } else {
        document.body.prepend(bar);
      }

      // Close button
      bar.querySelector('.announcement-close').addEventListener('click', () => {
        this.dismiss();
      });

      return bar;
    }

    loadAnnouncements() {
      // Default announcements - can be loaded from API
      this.announcements = [
        {
          id: 'welcome-2026',
          type: 'info',
          badge: { text: 'New', pulse: true },
          content: '<strong>Welcome to BuildBridge 2026!</strong> Experience our enhanced project management platform.',
          link: { text: 'Learn More', href: '#features', target: '_self' },
          priority: 1,
          target: { newVisitors: true }
        },
        {
          id: 'free-consultation',
          type: 'promo',
          badge: { text: 'Limited Time', pulse: false },
          content: '<strong>Free Project Consultation</strong> - Book now and get 20% off your first project management fee.',
          link: { text: 'Book Now', href: 'contact.html', target: '_self' },
          priority: 2,
          target: { all: true }
        },
        {
          id: 'whatsapp-support',
          type: 'feature',
          badge: { text: 'Fast Response', pulse: true },
          content: '<strong>Get instant support</strong> via WhatsApp Business - Average response time under 5 minutes.',
          link: { text: 'Chat Now', href: 'https://wa.me/27661200064', target: '_blank' },
          priority: 3,
          target: { mobile: true }
        },
        {
          id: 'project-milestone',
          type: 'success',
          badge: { text: 'Milestone', pulse: true },
          content: '<strong>150+ Projects Completed!</strong> Thank you for trusting BuildBridge with your construction needs.',
          link: { text: 'View Projects', href: 'projects.html', target: '_self' },
          priority: 4,
          target: { all: true }
        }
      ];

      // Filter out dismissed and target-specific
      this.filteredAnnouncements = this.announcements.filter(a => {
        if (this.dismissedIds.includes(a.id)) return false;
        if (a.target) {
          if (a.target.newVisitors && !this.isNewVisitor()) return false;
          if (a.target.mobile && !this.isMobile()) return false;
          if (a.target.desktop && this.isMobile()) return false;
        }
        return true;
      });

      // Sort by priority
      this.filteredAnnouncements.sort((a, b) => a.priority - b.priority);

      if (this.filteredAnnouncements.length > 0) {
        this.render();
      }
    }

    render() {
      const slidesContainer = this.container.querySelector('.announcement-slides');
      const dotsContainer = this.container.querySelector('.announcement-dots');

      slidesContainer.innerHTML = '';
      dotsContainer.innerHTML = '';

      this.filteredAnnouncements.forEach((item, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'announcement-slide';
        
        const badgeClass = item.badge.pulse ? 'pulse' : '';
        const badgeType = item.type === 'urgent' ? 'urgent' : '';
        
        slide.innerHTML = `
          <span class="announcement-badge ${badgeClass} ${badgeType}">${item.badge.text}</span>
          <span class="announcement-text">${item.content}</span>
          <a href="${item.link.href}" 
             class="announcement-link" 
             target="${item.link.target}"
             data-announcement-id="${item.id}">
            ${item.link.text}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        `;
        
        slidesContainer.appendChild(slide);

        // Create dot
        const dot = document.createElement('button');
        dot.className = 'announcement-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to announcement ${index + 1}`);
        dot.addEventListener('click', () => this.goToSlide(index));
        dotsContainer.appendChild(dot);
      });

      // Show the bar
      setTimeout(() => {
        this.container.classList.add('visible');
      }, 1000);

      // Start carousel if multiple
      if (this.filteredAnnouncements.length > 1) {
        this.startCarousel();
      }

      // Track link clicks
      this.container.querySelectorAll('.announcement-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.announcementId;
          this.trackClick(id);
        });
      });
    }

    startCarousel() {
      this.carouselTimer = setInterval(() => {
        this.nextSlide();
      }, this.options.carouselInterval);

      // Pause on hover
      this.container.addEventListener('mouseenter', () => {
        clearInterval(this.carouselTimer);
      });

      this.container.addEventListener('mouseleave', () => {
        this.carouselTimer = setInterval(() => {
          this.nextSlide();
        }, this.options.carouselInterval);
      });
    }

    nextSlide() {
      this.goToSlide((this.currentIndex + 1) % this.filteredAnnouncements.length);
    }

    goToSlide(index) {
      this.currentIndex = index;
      
      const slides = this.container.querySelector('.announcement-slides');
      const dots = this.container.querySelectorAll('.announcement-dot');
      
      slides.style.transform = `translateX(-${index * 100}%)`;
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    dismiss() {
      this.container.classList.remove('visible');
      
      // Mark current announcement as dismissed
      if (this.filteredAnnouncements[this.currentIndex]) {
        this.dismissedIds.push(this.filteredAnnouncements[this.currentIndex].id);
        this.saveDismissed();
      }

      // Clear carousel
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer);
      }
    }

    show(announcement) {
      // Add to announcements and show immediately
      this.announcements.unshift({
        ...announcement,
        id: announcement.id || 'custom-' + Date.now()
      });
      
      this.filteredAnnouncements = [announcement];
      this.currentIndex = 0;
      this.render();
    }

    checkUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const announcementParam = params.get('announcement');
      
      if (announcementParam) {
        const announcement = this.announcements.find(a => a.id === announcementParam);
        if (announcement) {
          this.show(announcement);
        }
      }
    }

    isNewVisitor() {
      return !localStorage.getItem('buildbridge_returning');
    }

    isMobile() {
      return window.innerWidth <= 768;
    }

    loadDismissed() {
      try {
        return JSON.parse(localStorage.getItem(this.options.storageKey)) || [];
      } catch {
        return [];
      }
    }

    saveDismissed() {
      // Keep only last 20 dismissed IDs
      const trimmed = this.dismissedIds.slice(-20);
      localStorage.setItem(this.options.storageKey, JSON.stringify(trimmed));
    }

    trackClick(id) {
      // Could send to analytics
      console.log('Announcement clicked:', id);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.announcementBar = new AnnouncementBar();
    });
  } else {
    window.announcementBar = new AnnouncementBar();
  }
})();
