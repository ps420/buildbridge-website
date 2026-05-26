/**
 * Newsletter Signup Component
 * Professional subscription form with validation, animation, and feedback
 */

class NewsletterSignup {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;
    
    this.emailInput = this.form.querySelector('.newsletter-input');
    this.submitBtn = this.form.querySelector('.newsletter-btn');
    this.successState = this.form.parentElement.querySelector('.newsletter-success');
    
    this.init();
  }
  
  init() {
    // Real-time validation
    this.emailInput.addEventListener('blur', () => this.validateEmail());
    this.emailInput.addEventListener('input', () => this.clearError());
    
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Check for saved email in localStorage
    const savedEmail = localStorage.getItem('bb_newsletter_email');
    if (savedEmail) {
      this.showSuccess();
    }
  }
  
  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.showError('Please enter your email address');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    
    this.emailInput.classList.add('success');
    return true;
  }
  
  showError(message) {
    this.emailInput.classList.add('error');
    this.emailInput.classList.remove('success');
    
    // Show error tooltip
    let errorMsg = this.form.querySelector('.newsletter-error-msg');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'newsletter-error-msg';
      this.form.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
  }
  
  clearError() {
    this.emailInput.classList.remove('error');
    const errorMsg = this.form.querySelector('.newsletter-error-msg');
    if (errorMsg) {
      errorMsg.classList.remove('show');
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateEmail()) return;
    
    const email = this.emailInput.value.trim();
    
    // Disable button and show loading
    this.setLoading(true);
    
    // Simulate API call
    await this.simulateSubmission(email);
    
    // Show success
    this.showSuccess();
    
    // Store in localStorage to prevent duplicate submissions
    localStorage.setItem('bb_newsletter_email', email);
    
    // Track event (if analytics exists)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_signup', {
        'event_category': 'engagement',
        'event_label': 'newsletter'
      });
    }
  }
  
  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = 'Subscribe →';
    }
  }
  
  simulateSubmission(email) {
    return new Promise(resolve => {
      // Simulate network delay
      setTimeout(resolve, 1500);
    });
  }
  
  showSuccess() {
    this.form.style.display = 'none';
    
    this.successState.classList.add('show');
    
    // Create confetti effect
    this.createConfetti();
    
    // Show toast notification
    if (window.Toast) {
      window.Toast.success('Successfully subscribed to our newsletter!', {
        title: 'Welcome!',
        duration: 5000
      });
    }
  }
  
  createConfetti() {
    const colors = ['#C9CED6', '#F5F7FA', '#3B82F6', '#22c55e'];
    const container = this.successState;
    
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'newsletter-confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 1000);
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new NewsletterSignup('.newsletter-form');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsletterSignup;
}
