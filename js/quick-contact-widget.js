/**
 * Quick Contact Widget
 * Floating mini contact form with multiple communication options
 */

class QuickContactWidget {
  constructor(options = {}) {
    this.options = {
      whatsappNumber: options.whatsappNumber || '+27661200064',
      email: options.email || 'info@buildbridge.co.za',
      showTypingIndicator: options.showTypingIndicator !== false,
      autoOpenDelay: options.autoOpenDelay || null, // ms to auto-open
      ...options
    };
    
    this.isOpen = false;
    this.formSubmitted = false;
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    
    // Auto-open after delay if specified
    if (this.options.autoOpenDelay) {
      setTimeout(() => this.open(), this.options.autoOpenDelay);
    }
    
    // Show typing indicator for engagement
    if (this.options.showTypingIndicator) {
      setTimeout(() => this.showTypingIndicator(), 5000);
    }
  }
  
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'quick-contact-widget';
    widget.innerHTML = `
      <button class="quick-contact-toggle" aria-label="Open contact form">
        <span class="toggle-icon">💬</span>
        <span class="badge">1</span>
      </button>
      
      <div class="quick-contact-panel">
        <div class="quick-contact-header">
          <div class="quick-contact-avatar">🏗️</div>
          <div class="quick-contact-info">
            <h4>BuildBridge Team</h4>
            <div class="quick-contact-status">
              <span class="status-dot"></span>
              <span>Usually responds in 10 min</span>
            </div>
          </div>
        </div>
        
        <div class="quick-contact-body">
          <div class="typing-indicator">
            BuildBridge is typing
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <div class="quick-contact-intro">
            👋 Hi there! Need help with your construction project? Send us a message and we'll get back to you quickly.
          </div>
          
          <div class="quick-actions-bar">
            <button class="quick-action-btn active" data-form="message">Message</button>
            <button class="quick-action-btn" data-form="callback">Callback</button>
            <button class="quick-action-btn" data-form="quote">Quote</button>
          </div>
          
          <form class="quick-contact-form" id="quickContactForm">
            <div class="form-group">
              <label for="qc-name">Your Name</label>
              <input type="text" id="qc-name" name="name" placeholder="John Smith" required>
            </div>
            
            <div class="form-group">
              <label for="qc-phone">Phone / WhatsApp</label>
              <input type="tel" id="qc-phone" name="phone" placeholder="+27 66 120 0064" required>
            </div>
            
            <div class="form-group form-row">
              <div>
                <label for="qc-project-type">Project Type</label>
                <select id="qc-project-type" name="projectType">
                  <option value="">Select...</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="renovation">Renovation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label for="qc-budget">Budget (R)</label>
                <select id="qc-budget" name="budget">
                  <option value="">Select...</option>
                  <option value="under-100k">Under R100k</option>
                  <option value="100k-500k">R100k - R500k</option>
                  <option value="500k-1m">R500k - R1M</option>
                  <option value="over-1m">Over R1M</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="qc-message">Your Message</label>
              <textarea id="qc-message" name="message" placeholder="Tell us about your project..." required></textarea>
            </div>
            
            <div class="checkbox-group">
              <input type="checkbox" id="qc-whatsapp" name="whatsapp" checked>
              <label for="qc-whatsapp">Contact me on WhatsApp for faster response</label>
            </div>
            
            <button type="submit" class="quick-contact-submit">
              <span>Send Message</span>
              →
            </button>
          </form>
          
          <div class="quick-contact-success">
            <div class="quick-contact-success-icon">✓</div>
            <h4>Message Sent!</h4>
            <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
          </div>
        </div>
        
        <div class="quick-contact-footer">
          <a href="https://wa.me/${this.options.whatsappNumber}" class="quick-contact-alt" target="_blank">
            💬 WhatsApp
          </a>
          <a href="tel:${this.options.whatsappNumber}" class="quick-contact-alt">
            📞 Call Now
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    this.widget = widget;
    this.toggleBtn = widget.querySelector('.quick-contact-toggle');
    this.panel = widget.querySelector('.quick-contact-panel');
    this.form = widget.querySelector('.quick-contact-form');
    this.successState = widget.querySelector('.quick-contact-success');
    
    // Remove badge after first interaction
    this.toggleBtn.addEventListener('click', () => {
      const badge = this.toggleBtn.querySelector('.badge');
      if (badge) badge.remove();
    }, { once: true });
  }
  
  bindEvents() {
    // Toggle panel
    this.toggleBtn.addEventListener('click', () => this.toggle());
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.widget.contains(e.target)) {
        this.close();
      }
    });
    
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Quick action buttons
    this.widget.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.widget.querySelectorAll('.quick-action-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateFormFields(btn.dataset.form);
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  updateFormFields(formType) {
    const messageField = this.form.querySelector('#qc-message');
    const labels = {
      message: 'Tell us about your project...',
      callback: 'What time works best for a call?',
      quote: 'Describe what you need a quote for...'
    };
    
    messageField.placeholder = labels[formType] || labels.message;
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.isOpen = true;
    this.toggleBtn.classList.add('active');
    this.panel.classList.add('active');
    this.toggleBtn.innerHTML = '<span class="toggle-icon">+</span>';
    
    // Focus first field after animation
    setTimeout(() => {
      const firstInput = this.form.querySelector('input');
      if (firstInput && !window.matchMedia('(pointer: coarse)').matches) {
        firstInput.focus();
      }
    }, 300);
  }
  
  close() {
    this.isOpen = false;
    this.toggleBtn.classList.remove('active');
    this.panel.classList.remove('active');
    this.toggleBtn.innerHTML = `
      <span class="toggle-icon">💬</span>
      ${!this.formSubmitted ? '<span class="badge">1</span>' : ''}
    `;
  }
  
  showTypingIndicator() {
    const indicator = this.widget.querySelector('.typing-indicator');
    indicator.classList.add('show');
    
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 3000);
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.form.querySelector('.quick-contact-submit');
    const originalText = submitBtn.innerHTML;
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
    
    // Collect form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Check if WhatsApp preferred
    if (data.whatsapp) {
      const whatsappMessage = `Hi BuildBridge! I'm ${data.name} interested in ${data.projectType || 'a project'}. ${data.message}`;
      const whatsappUrl = `https://wa.me/${this.options.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    // Simulate API call
    await this.simulateSubmission();
    
    // Show success
    this.form.style.display = 'none';
    this.successState.classList.add('show');
    this.formSubmitted = true;
    
    // Reset badge
    setTimeout(() => {
      const badge = this.toggleBtn.querySelector('.badge');
      if (badge) badge.remove();
    }, 1000);
    
    // Show toast
    if (window.Toast) {
      window.Toast.success('Message sent! We\'ll be in touch soon.', {
        title: 'Thank You!'
      });
    }
    
    // Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quick_contact_submit', {
        'event_category': 'engagement',
        'event_label': 'quick_contact_widget'
      });
    }
  }
  
  simulateSubmission() {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on pages with the widget enabled
  if (document.body.dataset.quickContact !== 'false') {
    window.quickContact = new QuickContactWidget({
      whatsappNumber: '+27661200064',
      autoOpenDelay: null // Set to 30000 for 30s auto-open
    });
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickContactWidget;
}
