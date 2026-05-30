/* ========================================
   v102.0: Site Inspection Scheduler
   Fortune 500 Quality Booking Widget
   ======================================== */

class SiteInspectionScheduler {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedProjectType = null;
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    
    // Available time slots
    this.timeSlots = [
      { time: '08:00', period: 'Morning', available: true },
      { time: '09:30', period: 'Morning', available: true },
      { time: '11:00', period: 'Morning', available: true },
      { time: '13:00', period: 'Afternoon', available: true },
      { time: '14:30', period: 'Afternoon', available: true },
      { time: '16:00', period: 'Afternoon', available: true }
    ];
    
    // Simulated unavailable slots (random for demo)
    this.unavailableSlots = this.generateUnavailableSlots();
    
    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    this.weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.renderCalendar();
    this.initializeFromUrl();
  }
  
  generateUnavailableSlots() {
    const unavailable = {};
    const today = new Date();
    
    // Generate some random unavailable slots for next 3 months
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + Math.floor(Math.random() * 90));
      const dateKey = this.formatDateKey(date);
      
      // Randomly make some slots unavailable
      const slots = this.timeSlots.filter(() => Math.random() > 0.7);
      unavailable[dateKey] = slots.map(s => s.time);
    }
    
    return unavailable;
  }
  
  formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  bindEvents() {
    // Month navigation
    document.querySelector('.nav-arrow.prev')?.addEventListener('click', () => this.prevMonth());
    document.querySelector('.nav-arrow.next')?.addEventListener('click', () => this.nextMonth());
    
    // Calendar day clicks
    document.querySelector('.days-grid')?.addEventListener('click', (e) => {
      const day = e.target.closest('.calendar-day:not(.disabled):not(.empty)');
      if (day) {
        const dateStr = day.dataset.date;
        this.selectDate(dateStr);
      }
    });
    
    // Time slot selection
    document.querySelector('.time-slots-grid')?.addEventListener('click', (e) => {
      const slot = e.target.closest('.time-slot:not(.disabled)');
      if (slot) {
        const time = slot.dataset.time;
        this.selectTime(time);
      }
    });
    
    // Project type selection
    document.querySelector('.project-type-selector')?.addEventListener('click', (e) => {
      const option = e.target.closest('.project-type-option');
      if (option) {
        const type = option.dataset.type;
        this.selectProjectType(type);
      }
    });
    
    // Form submission
    document.querySelector('.booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });
    
    // Success modal close
    document.querySelector('.success-close')?.addEventListener('click', () => {
      this.closeSuccessModal();
    });
    
    document.querySelector('.booking-success')?.addEventListener('click', (e) => {
      if (e.target === document.querySelector('.booking-success')) {
        this.closeSuccessModal();
      }
    });
  }
  
  initializeFromUrl() {
    // Check if there's estimate data in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('estimate') && sessionStorage.getItem('costEstimate')) {
      const estimate = JSON.parse(sessionStorage.getItem('costEstimate'));
      this.preFillFromEstimate(estimate);
    }
  }
  
  preFillFromEstimate(estimate) {
    // Pre-select project type if available
    if (estimate.projectType) {
      const typeMap = {
        'residential': 'residential',
        'commercial': 'commercial',
        'renovation': 'renovation',
        'industrial': 'commercial'
      };
      const mappedType = typeMap[estimate.projectType];
      if (mappedType) {
        setTimeout(() => this.selectProjectType(mappedType), 500);
      }
    }
  }
  
  prevMonth() {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentView = new Date(this.currentYear, this.currentMonth, 1);
    
    if (currentView > minDate) {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderCalendar();
    }
  }
  
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }
  
  renderCalendar() {
    // Update header
    const monthDisplay = document.querySelector('.calendar-header h3');
    if (monthDisplay) {
      monthDisplay.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
    }
    
    // Update navigation buttons
    const prevBtn = document.querySelector('.nav-arrow.prev');
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentView = new Date(this.currentYear, this.currentMonth, 1);
    
    if (prevBtn) {
      prevBtn.disabled = currentView <= minDate;
    }
    
    // Generate days
    const daysGrid = document.querySelector('.days-grid');
    if (!daysGrid) return;
    
    daysGrid.innerHTML = '';
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      daysGrid.appendChild(emptyDay);
    }
    
    // Days
    const todayKey = this.formatDateKey(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateKey = this.formatDateKey(date);
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.dataset.date = dateKey;
      
      // Check if past date
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Check if weekend
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (isPast || isWeekend) {
        dayEl.classList.add('disabled');
      } else {
        // Check availability
        const unavailableCount = this.unavailableSlots[dateKey]?.length || 0;
        const availableCount = 6 - unavailableCount;
        
        if (availableCount > 3) {
          dayEl.classList.add('has-slots');
        } else if (availableCount > 0) {
          dayEl.classList.add('limited');
        } else {
          dayEl.classList.add('disabled');
        }
      }
      
      // Check if today
      if (dateKey === todayKey) {
        dayEl.classList.add('today');
      }
      
      // Check if selected
      if (this.selectedDate === dateKey) {
        dayEl.classList.add('selected');
      }
      
      dayEl.innerHTML = `
        <span class="day-number">${day}</span>
        ${!isPast && !isWeekend ? '<span class="availability">Available</span>' : ''}
      `;
      
      daysGrid.appendChild(dayEl);
    }
  }
  
  selectDate(dateStr) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    
    // Add selection
    const dayEl = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
    if (dayEl) {
      dayEl.classList.add('selected');
    }
    
    this.selectedDate = dateStr;
    this.selectedTime = null;
    
    // Update display
    const dateDisplay = document.querySelector('.selected-date-display');
    if (dateDisplay) {
      const date = new Date(dateStr);
      dateDisplay.textContent = date.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Show time slots
    this.renderTimeSlots(dateStr);
    
    // Update form visibility
    this.updateFormVisibility();
  }
  
  renderTimeSlots(dateStr) {
    const container = document.querySelector('.time-slots-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const unavailable = this.unavailableSlots[dateStr] || [];
    
    this.timeSlots.forEach(slot => {
      const slotEl = document.createElement('div');
      const isUnavailable = unavailable.includes(slot.time);
      
      slotEl.className = `time-slot ${isUnavailable ? 'disabled' : ''} ${this.selectedTime === slot.time ? 'selected' : ''}`;
      slotEl.dataset.time = slot.time;
      
      slotEl.innerHTML = `
        <span class="time">${slot.time}</span>
        <span class="period">${slot.period}</span>
      `;
      
      container.appendChild(slotEl);
    });
    
    // Show time slots container
    const timeSlotsContainer = document.querySelector('.time-slots-container');
    if (timeSlotsContainer) {
      timeSlotsContainer.style.display = 'block';
    }
  }
  
  selectTime(time) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    
    // Add selection
    const slotEl = document.querySelector(`.time-slot[data-time="${time}"]`);
    if (slotEl) {
      slotEl.classList.add('selected');
    }
    
    this.selectedTime = time;
    
    // Show booking form
    this.showBookingForm();
  }
  
  showBookingForm() {
    const formContainer = document.querySelector('.booking-form-container');
    if (formContainer) {
      formContainer.classList.add('active');
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  selectProjectType(type) {
    // Remove previous selection
    document.querySelectorAll('.project-type-option').forEach(o => o.classList.remove('selected'));
    
    // Add selection
    const optionEl = document.querySelector(`.project-type-option[data-type="${type}"]`);
    if (optionEl) {
      optionEl.classList.add('selected');
    }
    
    this.selectedProjectType = type;
    this.updateFormVisibility();
  }
  
  updateFormVisibility() {
    const formContainer = document.querySelector('.booking-form-container');
    if (!formContainer) return;
    
    if (this.selectedDate && this.selectedTime) {
      formContainer.style.display = 'block';
    } else {
      formContainer.classList.remove('active');
    }
  }
  
  submitBooking() {
    const form = document.querySelector('.booking-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const booking = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      projectType: this.selectedProjectType,
      projectSize: formData.get('project-size'),
      budget: formData.get('budget'),
      notes: formData.get('notes'),
      date: this.selectedDate,
      time: this.selectedTime,
      timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!booking.name || !booking.email || !booking.phone || !booking.address) {
      if (typeof showToast === 'function') {
        showToast('Please fill in all required fields', 'error');
      }
      return;
    }
    
    // Simulate submission
    const submitBtn = form.querySelector('.booking-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Booking...';
    }
    
    setTimeout(() => {
      // Store booking
      this.storeBooking(booking);
      
      // Show success
      this.showSuccess(booking);
      
      // Reset form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
      }
      form.reset();
      
      // Reset selections
      this.selectedDate = null;
      this.selectedTime = null;
      this.selectedProjectType = null;
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      document.querySelectorAll('.project-type-option').forEach(o => o.classList.remove('selected'));
      document.querySelector('.booking-form-container')?.classList.remove('active');
    }, 1500);
  }
  
  storeBooking(booking) {
    // Store in localStorage for demo
    const bookings = JSON.parse(localStorage.getItem('buildbridge_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('buildbridge_bookings', JSON.stringify(bookings));
    
    // Also store as last booking for reference
    localStorage.setItem('buildbridge_last_booking', JSON.stringify(booking));
  }
  
  showSuccess(booking) {
    const modal = document.querySelector('.booking-success');
    if (!modal) return;
    
    // Update details
    const dateDisplay = modal.querySelector('.detail-date .value');
    if (dateDisplay) {
      const date = new Date(booking.date);
      dateDisplay.textContent = date.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    const timeDisplay = modal.querySelector('.detail-time .value');
    if (timeDisplay) {
      timeDisplay.textContent = booking.time;
    }
    
    const addressDisplay = modal.querySelector('.detail-address .value');
    if (addressDisplay) {
      addressDisplay.textContent = booking.address;
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Send confirmation email simulation
    this.sendConfirmationEmail(booking);
  }
  
  closeSuccessModal() {
    const modal = document.querySelector('.booking-success');
    if (modal) {
      modal.classList.remove('active');
    }
  }
  
  sendConfirmationEmail(booking) {
    // In a real implementation, this would call an API
    console.log('📧 Sending confirmation email to:', booking.email);
    console.log('📧 Booking details:', booking);
    
    // Also send WhatsApp notification simulation
    console.log('📱 Sending WhatsApp notification to:', booking.phone);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const schedulerSection = document.querySelector('.inspection-scheduler-section');
  if (schedulerSection) {
    window.siteScheduler = new SiteInspectionScheduler();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteInspectionScheduler;
}
