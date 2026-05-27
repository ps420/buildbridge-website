/**
 * Business Hours Widget v16.0
 * Real-time business status with timezone-aware hours
 */

(function() {
  'use strict';
  
  const BusinessHoursWidget = {
    config: {
      // Business hours in SAST (UTC+2)
      hours: {
        0: { open: null, close: null, name: 'Sunday' },      // Closed
        1: { open: 8, close: 18, name: 'Monday' },
        2: { open: 8, close: 18, name: 'Tuesday' },
        3: { open: 8, close: 18, name: 'Wednesday' },
        4: { open: 8, close: 18, name: 'Thursday' },
        5: { open: 8, close: 17, name: 'Friday' },          // Close early
        6: { open: 9, close: 14, name: 'Saturday' }         // Short day
      },
      timezone: 'Africa/Johannesburg',
      holidays: [
        '2026-01-01', // New Year
        '2026-03-21', // Human Rights Day
        '2026-04-10', // Good Friday
        '2026-04-13', // Family Day
        '2026-04-27', // Freedom Day
        '2026-05-01', // Workers Day
        '2026-06-16', // Youth Day
        '2026-08-09', // Women's Day
        '2026-09-24', // Heritage Day
        '2026-12-16', // Day of Reconciliation
        '2026-12-25', // Christmas
        '2026-12-26', // Day of Goodwill
      ]
    },
    
    init() {
      this.createWidget();
      this.bindEvents();
      this.updateStatus();
      
      // Update every minute
      setInterval(() => this.updateStatus(), 60000);
    },
    
    createWidget() {
      const widget = document.createElement('div');
      widget.className = 'business-hours-widget';
      widget.setAttribute('role', 'region');
      widget.setAttribute('aria-label', 'Business hours');
      
      const now = this.getCurrentTime();
      const status = this.getStatus(now);
      
      widget.innerHTML = `
        <button class="business-hours-toggle" aria-expanded="false" aria-controls="business-hours-panel">
          <span class="status-indicator ${status.class}"></span>
          <span class="status-text">
            ${status.text}
            <span class="time" id="current-time">${this.formatTime(now)}</span>
          </span>
        </button>
        
        <div class="business-hours-panel" id="business-hours-panel" role="dialog" aria-modal="false" aria-labelledby="panel-title">
          <div class="panel-header">
            <h4 id="panel-title">Business Hours</h4>
            <button class="close-panel" aria-label="Close panel">&times;</button>
          </div>
          
          <div class="current-status ${status.class}">
            <span class="status-icon">${status.icon}</span>
            <div class="status-details">
              <h5>${status.title}</h5>
              <p>${status.message}</p>
            </div>
          </div>
          
          <ul class="hours-list">
            ${this.generateHoursList(now)}
          </ul>
          
          <div class="contact-cta">
            <a href="https://wa.me/27661200064" target="_blank">
              <span>💬</span> Chat on WhatsApp
            </a>
          </div>
          
          <div class="timezone-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>SAST (UTC+2)</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
    },
    
    getCurrentTime() {
      // Get current time in SAST
      const now = new Date();
      return new Date(now.toLocaleString('en-US', { timeZone: this.config.timezone }));
    },
    
    getStatus(date) {
      const day = date.getDay();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const currentTime = hour + minute / 60;
      
      // Check if holiday
      const dateStr = date.toISOString().split('T')[0];
      if (this.config.holidays.includes(dateStr)) {
        return {
          class: 'offline',
          text: 'Holiday',
          icon: '🏖️',
          title: 'We\'re Closed Today',
          message: 'Closed for the holiday. Back tomorrow!'
        };
      }
      
      const todayHours = this.config.hours[day];
      
      if (!todayHours.open) {
        return {
          class: 'offline',
          text: 'Closed',
          icon: '🌙',
          title: 'We\'re Closed',
          message: `Closed on ${todayHours.name}s`
        };
      }
      
      if (currentTime < todayHours.open) {
        const opensAt = this.formatHour(todayHours.open);
        return {
          class: 'break',
          text: 'Opens soon',
          icon: '🌅',
          title: 'Opening Soon',
          message: `We open at ${opensAt}`
        };
      }
      
      if (currentTime >= todayHours.close) {
        const nextOpen = this.getNextOpeningTime(date);
        return {
          class: 'offline',
          text: 'Closed',
          icon: '🌙',
          title: 'We\'re Closed',
          message: `Open ${nextOpen}`
        };
      }
      
      // Calculate time until close
      const hoursUntilClose = todayHours.close - currentTime;
      const closingSoon = hoursUntilClose <= 1;
      
      return {
        class: 'online',
        text: 'Open now',
        icon: '✨',
        title: 'We\'re Open!',
        message: closingSoon 
          ? `Closing in ${Math.ceil(hoursUntilClose * 60)} minutes`
          : `Open until ${this.formatHour(todayHours.close)}`
      };
    },
    
    getNextOpeningTime(fromDate) {
      let checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() + 1);
      
      for (let i = 0; i < 7; i++) {
        const day = checkDate.getDay();
        if (this.config.hours[day].open) {
          const diffDays = Math.ceil((checkDate - fromDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) return 'tomorrow at 8:00 AM';
          if (diffDays === 2) return 'Monday at 8:00 AM';
          return `${this.config.hours[day].name} at 8:00 AM`;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
      
      return 'soon';
    },
    
    generateHoursList(currentDate) {
      const currentDay = currentDate.getDay();
      
      return Object.values(this.config.hours).map((dayData, index) => {
        const isToday = index === currentDay;
        const timeStr = dayData.open 
          ? `${this.formatHour(dayData.open)} - ${this.formatHour(dayData.close)}`
          : 'Closed';
        
        return `
          <li class="${isToday ? 'current-day' : ''}">
            <span class="day">
              ${dayData.name.substring(0, 3)}
              ${isToday ? '<span class="today-badge">Today</span>' : ''}
            </span>
            <span class="time ${!dayData.open ? 'closed' : ''}">${timeStr}</span>
          </li>
        `;
      }).join('');
    },
    
    formatTime(date) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    },
    
    formatHour(hour) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    },
    
    bindEvents() {
      const toggle = this.widget.querySelector('.business-hours-toggle');
      const panel = this.widget.querySelector('.business-hours-panel');
      const closeBtn = this.widget.querySelector('.close-panel');
      
      toggle.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
      });
      
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.widget.contains(e.target)) {
          panel.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('active')) {
          panel.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    },
    
    updateStatus() {
      const now = this.getCurrentTime();
      const status = this.getStatus(now);
      
      // Update toggle
      const indicator = this.widget.querySelector('.status-indicator');
      const statusText = this.widget.querySelector('.status-text');
      const timeDisplay = this.widget.querySelector('#current-time');
      
      indicator.className = `status-indicator ${status.class}`;
      statusText.firstChild.textContent = status.text;
      timeDisplay.textContent = this.formatTime(now);
      
      // Update panel if open
      if (this.widget.querySelector('.business-hours-panel').classList.contains('active')) {
        const currentStatus = this.widget.querySelector('.current-status');
        const statusDetails = currentStatus.querySelector('.status-details');
        
        currentStatus.className = `current-status ${status.class}`;
        currentStatus.querySelector('.status-icon').textContent = status.icon;
        statusDetails.querySelector('h5').textContent = status.title;
        statusDetails.querySelector('p').textContent = status.message;
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BusinessHoursWidget.init());
  } else {
    BusinessHoursWidget.init();
  }
  
  // Expose to global scope for debugging
  window.BusinessHoursWidget = BusinessHoursWidget;
})();
