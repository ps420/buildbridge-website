/**
 * v54.0: Smart Booking System - Fortune 500 Quality Appointment Scheduler
 * Professional scheduling interface with real-time availability, type selection,
 * calendar integration, and seamless booking flow.
 */

(function() {
  'use strict';

  class SmartBookingSystem {
    constructor(options = {}) {
      this.options = {
        selector: '#smart-booking',
        apiEndpoint: '/api/bookings',
        calendarSync: true,
        reminderEmail: true,
        ...options
      };

      this.state = {
        currentDate: new Date(),
        selectedDate: null,
        selectedTime: null,
        selectedType: 'consultation',
        selectedProjectType: null,
        formData: {},
        availableSlots: {},
        isLoading: false
      };

      this.consultationTypes = [
        {
          id: 'consultation',
          icon: '💬',
          title: 'Project Consultation',
          description: 'Discuss your vision and get expert advice',
          duration: '45 min'
        },
        {
          id: 'estimate',
          icon: '📊',
          title: 'Detailed Estimate',
          description: 'Get a comprehensive cost breakdown',
          duration: '60 min'
        },
        {
          id: 'design',
          icon: '🎨',
          title: 'Design Review',
          description: 'Review architectural plans and designs',
          duration: '90 min'
        },
        {
          id: 'site',
          icon: '🏗️',
          title: 'Site Assessment',
          description: 'On-site evaluation of your property',
          duration: '120 min'
        }
      ];

      this.projectTypes = [
        { id: 'residential', label: 'Residential' },
        { id: 'commercial', label: 'Commercial' },
        { id: 'industrial', label: 'Industrial' },
        { id: 'renovation', label: 'Renovation' },
        { id: 'extension', label: 'Extension' },
        { id: 'new-build', label: 'New Build' }
      ];

      this.init();
    }

    init() {
      this.container = document.querySelector(this.options.selector);
      if (!this.container) {
        console.warn('SmartBooking: Container not found');
        return;
      }

      this.render();
      this.attachEventListeners();
      this.generateMockAvailability();
      this.animateEntrance();
    }

    render() {
      this.container.innerHTML = `
        <div class="booking-section" id="booking-section">
          <div class="booking-container">
            <div class="booking-info-panel">
              <div class="booking-info-badge">Booking Available Now</div>
              <h2 class="booking-info-title">Schedule Your<br>Consultation</h2>
              <p class="booking-info-description">
                Book a one-on-one session with our construction experts. 
                We'll discuss your project requirements, budget considerations, 
                and timeline expectations.
              </p>
              <div class="booking-consultation-types">
                ${this.consultationTypes.map(type => `
                  <div class="booking-type-card ${this.state.selectedType === type.id ? 'active' : ''}" data-type="${type.id}">
                    <div class="booking-type-icon">${type.icon}</div>
                    <div class="booking-type-content">
                      <h4>${type.title}</h4>
                      <p>${type.description}</p>
                      <div class="booking-type-duration">⏱️ ${type.duration}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="booking-interface">
              <div class="booking-calendar-header">
                <div class="booking-month-nav">
                  <button class="booking-nav-btn" data-action="prev">‹</button>
                  <span class="booking-current-month" id="current-month"></span>
                  <button class="booking-nav-btn" data-action="next">›</button>
                </div>
                <div class="booking-timezone">SAST (UTC+2)</div>
              </div>

              <div class="booking-calendar">
                <div class="booking-calendar-weekdays">
                  <div class="booking-weekday">Sun</div>
                  <div class="booking-weekday">Mon</div>
                  <div class="booking-weekday">Tue</div>
                  <div class="booking-weekday">Wed</div>
                  <div class="booking-weekday">Thu</div>
                  <div class="booking-weekday">Fri</div>
                  <div class="booking-weekday">Sat</div>
                </div>
                <div class="booking-calendar-days" id="calendar-days"></div>
              </div>

              <div class="booking-slots-section" id="slots-section" style="display: none;">
                <h3 class="booking-slots-header">
                  Available Times for <span id="selected-date-display"></span>
                </h3>
                <div class="booking-slots-grid" id="time-slots"></div>
              </div>

              <div class="booking-form" id="booking-form" style="display: none;">
                <h3 class="booking-form-title">Your Information</h3>
                <div class="booking-form-grid">
                  <div class="booking-form-group">
                    <input type="text" class="booking-form-input" id="booking-name" placeholder=" " required>
                    <label class="booking-form-label">Full Name</label>
                  </div>
                  <div class="booking-form-group">
                    <input type="email" class="booking-form-input" id="booking-email" placeholder=" " required>
                    <label class="booking-form-label">Email Address</label>
                  </div>
                  <div class="booking-form-group">
                    <input type="tel" class="booking-form-input" id="booking-phone" placeholder=" ">
                    <label class="booking-form-label">Phone Number</label>
                  </div>
                  <div class="booking-form-group">
                    <input type="text" class="booking-form-input" id="booking-location" placeholder=" ">
                    <label class="booking-form-label">Project Location</label>
                  </div>
                  <div class="booking-form-group full-width">
                    <div style="margin-bottom: 8px; font-family: 'Poppins', sans-serif; font-size: 13px; color: rgba(201, 206, 214, 0.5);">
                      Project Type
                    </div>
                    <div class="booking-project-types">
                      ${this.projectTypes.map(type => `
                        <div class="booking-project-type" data-project="${type.id}">${type.label}</div>
                      `).join('')}
                    </div>
                  </div>
                  <div class="booking-form-group full-width">
                    <textarea class="booking-form-input booking-form-textarea" id="booking-notes" placeholder=" "></textarea>
                    <label class="booking-form-label">Tell us about your project (optional)</label>
                  </div>
                </div>
                <button class="booking-submit" id="booking-submit">
                  Confirm Booking
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          <div class="booking-stats-bar">
            <div class="booking-stat">
              <div class="booking-stat-value">500+</div>
              <div class="booking-stat-label">Consultations</div>
            </div>
            <div class="booking-stat">
              <div class="booking-stat-value">98%</div>
              <div class="booking-stat-label">Satisfaction</div>
            </div>
            <div class="booking-stat">
              <div class="booking-stat-value">24h</div>
              <div class="booking-stat-label">Avg. Response</div>
            </div>
            <div class="booking-stat">
              <div class="booking-stat-value">Free</div>
              <div class="booking-stat-label">First Consultation</div>
            </div>
          </div>
        </div>

        <div class="booking-modal-overlay" id="booking-modal">
          <div class="booking-modal">
            <div class="booking-modal-icon">✅</div>
            <h3 class="booking-modal-title">Booking Confirmed!</h3>
            <p class="booking-modal-text">
              Your consultation has been scheduled. We've sent a confirmation email with calendar details.
            </p>
            <div class="booking-modal-details">
              <div class="booking-modal-detail">
                <span class="booking-modal-label">Date & Time</span>
                <span class="booking-modal-value" id="modal-datetime"></span>
              </div>
              <div class="booking-modal-detail">
                <span class="booking-modal-label">Type</span>
                <span class="booking-modal-value" id="modal-type"></span>
              </div>
              <div class="booking-modal-detail">
                <span class="booking-modal-label">Duration</span>
                <span class="booking-modal-value" id="modal-duration"></span>
              </div>
            </div>
            <div class="booking-modal-actions">
              <button class="booking-modal-btn primary" id="add-to-calendar">Add to Calendar</button>
              <button class="booking-modal-btn secondary" id="close-modal">Close</button>
            </div>
          </div>
        </div>
      `;

      this.renderCalendar();
    }

    attachEventListeners() {
      // Consultation type selection
      this.container.querySelectorAll('.booking-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const type = card.dataset.type;
          this.selectConsultationType(type);
        });
      });

      // Calendar navigation
      this.container.querySelectorAll('.booking-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.dataset.action;
          this.navigateMonth(action);
        });
      });

      // Project type selection
      this.container.querySelectorAll('.booking-project-type').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const projectType = btn.dataset.project;
          this.selectProjectType(projectType, btn);
        });
      });

      // Form submission
      const submitBtn = this.container.querySelector('#booking-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitBooking());
      }

      // Modal close
      const closeModalBtn = this.container.querySelector('#close-modal');
      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => this.closeModal());
      }

      // Add to calendar
      const addToCalendarBtn = this.container.querySelector('#add-to-calendar');
      if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', () => this.addToCalendar());
      }

      // Close modal on overlay click
      const modalOverlay = this.container.querySelector('#booking-modal');
      if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) this.closeModal();
        });
      }

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }

    generateMockAvailability() {
      // Generate mock availability for next 60 days
      const today = new Date();
      const slots = {};

      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Generate 4-8 slots per day
        const numSlots = Math.floor(Math.random() * 5) + 4;
        const daySlots = [];
        const startHour = 9;
        
        for (let j = 0; j < numSlots; j++) {
          const hour = startHour + j;
          const minute = Math.random() > 0.5 ? '00' : '30';
          
          // Randomly mark some as booked
          if (Math.random() > 0.3) {
            daySlots.push(`${hour}:${minute}`);
          }
        }
        
        if (daySlots.length > 0) {
          slots[dateKey] = daySlots;
        }
      }

      this.state.availableSlots = slots;
    }

    renderCalendar() {
      const year = this.state.currentDate.getFullYear();
      const month = this.state.currentDate.getMonth();
      
      // Update month display
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthDisplay = this.container.querySelector('#current-month');
      if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
      }

      // Calculate calendar days
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date().toISOString().split('T')[0];

      let calendarHTML = '';
      
      // Empty cells for days before start of month
      for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="booking-day disabled"></div>';
      }

      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const isToday = dateKey === today;
        const hasSlots = this.state.availableSlots[dateKey] && this.state.availableSlots[dateKey].length > 0;
        const isPast = date < new Date(today);
        const isSelected = this.state.selectedDate === dateKey;

        const classes = [
          'booking-day',
          isToday ? 'today' : '',
          hasSlots ? 'has-slots' : '',
          isPast ? 'disabled' : '',
          isSelected ? 'active' : ''
        ].filter(Boolean).join(' ');

        calendarHTML += `
          <div class="${classes}" data-date="${dateKey}">
            <span class="booking-day-number">${day}</span>
            ${hasSlots ? `<span class="booking-day-slots">${this.state.availableSlots[dateKey].length} slots</span>` : ''}
          </div>
        `;
      }

      const calendarDays = this.container.querySelector('#calendar-days');
      if (calendarDays) {
        calendarDays.innerHTML = calendarHTML;
      }

      // Attach click handlers to days
      this.container.querySelectorAll('.booking-day:not(.disabled)').forEach(day => {
        day.addEventListener('click', () => {
          const date = day.dataset.date;
          this.selectDate(date);
        });
      });
    }

    navigateMonth(action) {
      const newDate = new Date(this.state.currentDate);
      if (action === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      
      // Don't allow navigation to past months
      const today = new Date();
      if (newDate.getFullYear() < today.getFullYear() || 
          (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() < today.getMonth())) {
        return;
      }

      this.state.currentDate = newDate;
      this.renderCalendar();
    }

    selectDate(dateKey) {
      this.state.selectedDate = dateKey;
      this.state.selectedTime = null;
      this.renderCalendar();
      this.renderTimeSlots(dateKey);
      this.showForm(false);
    }

    renderTimeSlots(dateKey) {
      const slots = this.state.availableSlots[dateKey] || [];
      const slotsSection = this.container.querySelector('#slots-section');
      const dateDisplay = this.container.querySelector('#selected-date-display');
      const slotsGrid = this.container.querySelector('#time-slots');

      if (slots.length === 0) {
        slotsSection.style.display = 'none';
        return;
      }

      const dateObj = new Date(dateKey);
      const dateStr = dateObj.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });

      if (dateDisplay) {
        dateDisplay.textContent = dateStr;
      }

      slotsGrid.innerHTML = slots.map(time => {
        const isSelected = this.state.selectedTime === time;
        return `
          <div class="booking-slot ${isSelected ? 'active' : ''}" data-time="${time}">
            ${time}
          </div>
        `;
      }).join('');

      slotsSection.style.display = 'block';

      // Attach click handlers
      slotsGrid.querySelectorAll('.booking-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          const time = slot.dataset.time;
          this.selectTime(time);
        });
      });

      // Scroll to slots
      slotsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    selectTime(time) {
      this.state.selectedTime = time;
      
      this.container.querySelectorAll('.booking-slot').forEach(slot => {
        slot.classList.toggle('active', slot.dataset.time === time);
      });

      this.showForm(true);
    }

    selectConsultationType(type) {
      this.state.selectedType = type;
      
      this.container.querySelectorAll('.booking-type-card').forEach(card => {
        card.classList.toggle('active', card.dataset.type === type);
      });
    }

    selectProjectType(type, element) {
      this.state.selectedProjectType = type;
      
      this.container.querySelectorAll('.booking-project-type').forEach(btn => {
        btn.classList.toggle('active', btn === element);
      });
    }

    showForm(show) {
      const form = this.container.querySelector('#booking-form');
      if (form) {
        form.style.display = show ? 'block' : 'none';
        if (show) {
          form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    validateForm() {
      const name = this.container.querySelector('#booking-name')?.value.trim();
      const email = this.container.querySelector('#booking-email')?.value.trim();
      
      if (!name) {
        alert('Please enter your name');
        return false;
      }
      
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return false;
      }

      return true;
    }

    submitBooking() {
      if (!this.validateForm()) return;

      const submitBtn = this.container.querySelector('#booking-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="booking-loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Processing...';

      // Simulate API call
      setTimeout(() => {
        this.showConfirmation();
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm Booking <span>→</span>';
      }, 1500);
    }

    showConfirmation() {
      const modal = this.container.querySelector('#booking-modal');
      const type = this.consultationTypes.find(t => t.id === this.state.selectedType);
      
      // Update modal details
      const dateObj = new Date(this.state.selectedDate);
      const dateStr = dateObj.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long'
      });

      const datetimeEl = this.container.querySelector('#modal-datetime');
      const typeEl = this.container.querySelector('#modal-type');
      const durationEl = this.container.querySelector('#modal-duration');

      if (datetimeEl) datetimeEl.textContent = `${dateStr} at ${this.state.selectedTime}`;
      if (typeEl) typeEl.textContent = type?.title || 'Consultation';
      if (durationEl) durationEl.textContent = type?.duration || '45 min';

      if (modal) {
        modal.classList.add('active');
      }

      // Update state for calendar export
      this.bookingData = {
        date: this.state.selectedDate,
        time: this.state.selectedTime,
        type: type?.title,
        duration: type?.duration
      };
    }

    closeModal() {
      const modal = this.container.querySelector('#booking-modal');
      if (modal) {
        modal.classList.remove('active');
      }
      
      // Reset form
      this.resetForm();
    }

    resetForm() {
      this.state.selectedDate = null;
      this.state.selectedTime = null;
      this.state.selectedProjectType = null;
      
      this.renderCalendar();
      this.container.querySelector('#slots-section').style.display = 'none';
      this.container.querySelector('#booking-form').style.display = 'none';
      
      // Clear inputs
      ['#booking-name', '#booking-email', '#booking-phone', '#booking-location', '#booking-notes'].forEach(selector => {
        const input = this.container.querySelector(selector);
        if (input) input.value = '';
      });

      // Reset project type
      this.container.querySelectorAll('.booking-project-type').forEach(btn => {
        btn.classList.remove('active');
      });
    }

    addToCalendar() {
      if (!this.bookingData) return;

      const type = this.bookingData.type || 'BuildBridge Consultation';
      const date = this.bookingData.date;
      const time = this.bookingData.time;
      
      // Create calendar event data
      const startDate = new Date(`${date}T${time}`);
      const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 min default

      const event = {
        title: type,
        description: 'BuildBridge Project Consultation\n\nWe look forward to discussing your construction project with you.\n\nPlease have the following ready:\n- Project details and requirements\n- Budget considerations\n- Timeline expectations\n- Any architectural plans or inspiration images',
        location: 'BuildBridge Office or Virtual Meeting',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      };

      // Generate Google Calendar link
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

      window.open(googleCalendarUrl, '_blank');
    }

    animateEntrance() {
      const section = this.container.querySelector('.booking-section');
      if (!section) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      section.style.opacity = '0';
      section.style.transform = 'translateY(40px)';
      section.style.transition = 'all 0.8s ease';
      
      observer.observe(section);
    }

    // Public API methods
    getState() {
      return { ...this.state };
    }

    getSelectedDate() {
      return this.state.selectedDate;
    }

    getSelectedTime() {
      return this.state.selectedTime;
    }

    refreshAvailability() {
      this.generateMockAvailability();
      this.renderCalendar();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smartBooking = new SmartBookingSystem();
    });
  } else {
    window.smartBooking = new SmartBookingSystem();
  }

  // Expose to global scope
  window.SmartBookingSystem = SmartBookingSystem;
})();
