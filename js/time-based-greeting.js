/**
 * Time-Based Dynamic Greeting System - v81.0
 * Fortune 500 style contextual content based on time of day
 */

(function() {
  'use strict';

  class TimeBasedGreeting {
    constructor(options = {}) {
      this.options = {
        showDelay: options.showDelay || 2000,
        autoMinimizeDelay: options.autoMinimizeDelay || 15000,
        persistDismissed: options.persistDismissed !== false,
        dismissedDuration: options.dismissedDuration || 24 * 60 * 60 * 1000, // 24 hours
        ...options
      };
      
      this.widget = null;
      this.isVisible = false;
      this.isDismissed = false;
      
      this.greetingData = {
        morning: {
          icon: '🌅',
          greeting: 'Good Morning',
          messages: [
            'Start your construction project planning early. Get a head start on your vision today.',
            'The early bird builds the best homes. Ready to discuss your project over coffee?',
            'New day, new possibilities. Let\'s make your construction dreams a reality.'
          ],
          action: 'Start Your Day',
          actionUrl: '#services',
          theme: 'morning',
          accentColor: '#FFB74D'
        },
        afternoon: {
          icon: '☀️',
          greeting: 'Good Afternoon',
          messages: [
            'Perfect time to explore our portfolio. See what we\'ve built for clients like you.',
            'Taking a midday break? Browse our services and find the perfect solution.',
            'Halfway through the day, but just getting started on excellence. How can we help?'
          ],
          action: 'Explore Services',
          actionUrl: 'services.html',
          theme: 'afternoon',
          accentColor: '#4FC3F7'
        },
        evening: {
          icon: '🌆',
          greeting: 'Good Evening',
          messages: [
            'Unwind and explore our project gallery. See stunning transformations after hours.',
            'Evening inspiration awaits. Browse our completed projects from the comfort of home.',
            'The day may be ending, but great ideas are just beginning. Let\'s talk tomorrow.'
          ],
          action: 'View Projects',
          actionUrl: 'projects.html',
          theme: 'evening',
          accentColor: '#9575CD'
        },
        night: {
          icon: '🌙',
          greeting: 'Good Evening',
          messages: [
            'Late night planning? We admire the dedication. Let\'s discuss your vision soon.',
            'Burning the midnight oil? Take a look at our success stories while you plan.',
            'Rest easy knowing your project is in expert hands. We\'ll be here when you wake.'
          ],
          action: 'View Success Stories',
          actionUrl: 'projects.html',
          theme: 'night',
          accentColor: '#607D8B'
        }
      };
      
      this.init();
    }
    
    init() {
      // Check if user has dismissed recently
      if (this.options.persistDismissed) {
        const dismissedTime = localStorage.getItem('timeGreetingDismissed');
        if (dismissedTime) {
          const timeSinceDismiss = Date.now() - parseInt(dismissedTime);
          if (timeSinceDismiss < this.options.dismissedDuration) {
            this.isDismissed = true;
            return;
          }
        }
      }
      
      this.createWidget();
      this.bindEvents();
      
      // Show after delay
      setTimeout(() => this.show(), this.options.showDelay);
    }
    
    getTimeOfDay() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'night';
    }
    
    getRandomMessage(messages) {
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    createWidget() {
      const timeOfDay = this.getTimeOfDay();
      const data = this.greetingData[timeOfDay];
      
      this.widget = document.createElement('div');
      this.widget.className = `time-greeting-widget ${data.theme}`;
      this.widget.setAttribute('role', 'dialog');
      this.widget.setAttribute('aria-label', 'Personalized greeting');
      
      this.widget.innerHTML = `
        <button class="time-greeting-close" aria-label="Dismiss greeting">×</button>
        <span class="time-greeting-icon">${data.icon}</span>
        <div class="time-greeting-text">${data.greeting}</div>
        <div class="time-greeting-title">${data.greeting}</div>
        <div class="time-greeting-message">${this.getRandomMessage(data.messages)}</div>
        <a href="${data.actionUrl}" class="time-greeting-action">
          ${data.action}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <div class="time-reading-indicator">
          <div class="time-reading-label">
            <span>Reading progress</span>
            <span class="reading-percentage">0%</span>
          </div>
          <div class="time-reading-bar">
            <div class="time-reading-progress"></div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      
      // Add reading progress tracking
      this.setupReadingProgress();
    }
    
    setupReadingProgress() {
      const updateProgress = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        const progressBar = this.widget.querySelector('.time-reading-progress');
        const percentageLabel = this.widget.querySelector('.reading-percentage');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentageLabel) percentageLabel.textContent = `${Math.round(progress)}%`;
      };
      
      // Throttled scroll listener
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      updateProgress();
    }
    
    bindEvents() {
      // Close button
      const closeBtn = this.widget.querySelector('.time-greeting-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.dismiss());
      }
      
      // Action button click tracking
      const actionBtn = this.widget.querySelector('.time-greeting-action');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          this.trackInteraction('action_clicked');
        });
      }
      
      // Auto-minimize after delay
      if (this.options.autoMinimizeDelay) {
        setTimeout(() => {
          if (this.isVisible && !this.isHovered) {
            this.minimize();
          }
        }, this.options.autoMinimizeDelay);
      }
      
      // Hover state tracking
      this.widget.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.widget.classList.remove('minimized');
      });
      
      this.widget.addEventListener('mouseleave', () => {
        this.isHovered = false;
      });
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.dismiss();
        }
      });
    }
    
    show() {
      if (this.isDismissed || !this.widget) return;
      
      this.isVisible = true;
      this.widget.classList.add('visible', 'pulse-attention');
      
      // Remove pulse after animation
      setTimeout(() => {
        if (this.widget) {
          this.widget.classList.remove('pulse-attention');
        }
      }, 4000);
      
      this.trackInteraction('shown');
    }
    
    minimize() {
      if (!this.widget) return;
      this.widget.classList.add('minimized');
    }
    
    dismiss() {
      if (!this.widget) return;
      
      this.isDismissed = true;
      this.widget.style.transform = 'translateX(120%)';
      this.widget.style.opacity = '0';
      
      if (this.options.persistDismissed) {
        localStorage.setItem('timeGreetingDismissed', Date.now().toString());
      }
      
      setTimeout(() => {
        if (this.widget && this.widget.parentNode) {
          this.widget.parentNode.removeChild(this.widget);
        }
      }, 600);
      
      this.trackInteraction('dismissed');
    }
    
    trackInteraction(action) {
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'time_greeting_' + action, {
          time_of_day: this.getTimeOfDay(),
          hour: new Date().getHours()
        });
      }
      
      // Custom event dispatch
      window.dispatchEvent(new CustomEvent('timeGreetingInteraction', {
        detail: {
          action: action,
          timeOfDay: this.getTimeOfDay()
        }
      }));
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.timeGreeting = new TimeBasedGreeting();
    });
  } else {
    window.timeGreeting = new TimeBasedGreeting();
  }
})();
