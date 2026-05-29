/**
 * v88.0: Smart Assistant Widget Pro
 * Fortune 500 AI-Powered Conversational Interface
 */

class SmartAssistantPro {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.suggestions = [
      "Get a free quote",
      "View our projects",
      "Services we offer",
      "Schedule a consultation",
      "Contractor information",
      "Contact details"
    ];
    this.responses = {
      greeting: [
        "Hello! Welcome to BuildBridge. I'm your AI assistant. How can I help you today?",
        "Hi there! I'm here to help with your construction project needs. What can I do for you?",
        "Welcome! I'm your BuildBridge assistant. Ready to help you build your vision!"
      ],
      quote: [
        "I'd be happy to help you get a quote! You can use our Project Cost Calculator or chat with us on WhatsApp at +27 66 120 0064.",
        "For a detailed quote, please visit our contact page or message us on WhatsApp. Our team will respond within 24 hours!"
      ],
      projects: [
        "We've completed over 150 projects! Visit our Projects page to see our portfolio of residential, commercial, and industrial work.",
        "Our portfolio includes luxury villas, corporate headquarters, and industrial facilities. Check them out on the Projects page!"
      ],
      services: [
        "We offer Project Consultation, Contractor Matching, Project Management, and Quality Assurance. Visit our Services page for details!",
        "Our core services include: Initial Consultation, Contractor Vetting, Full Project Management, and Quality Control."
      ],
      contact: [
        "You can reach us at: Phone: +27 66 120 0064, Email: info@buildbridge.co.za, or WhatsApp for quick responses!",
        "We're available Monday-Friday, 8AM-6PM SAST. WhatsApp us at +27 66 120 0064 for fastest response!"
      ],
      default: [
        "That's a great question! Let me connect you with our team for more specific information.",
        "I'd recommend speaking directly with our experts. Would you like me to open WhatsApp chat?",
        "I can help with that! For detailed assistance, please use the WhatsApp button or visit our Contact page."
      ]
    };
    
    this.init();
  }
  
  init() {
    this.createAssistant();
    this.bindEvents();
    this.loadMessages();
    
    // Show welcome message after delay
    setTimeout(() => {
      if (this.messages.length === 0) {
        this.showWelcome();
      }
    }, 2000);
  }
  
  createAssistant() {
    // Check if already exists
    if (document.querySelector('.smart-assistant-pro')) return;
    
    const assistant = document.createElement('div');
    assistant.className = 'smart-assistant-pro';
    assistant.innerHTML = `
      <button class="assistant-fab-pro" aria-label="Open AI Assistant">
        <div class="assistant-pulse-ring"></div>
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
      </button>
      
      <div class="assistant-window-pro">
        <div class="assistant-header-pro">
          <div class="assistant-header-info">
            <div class="assistant-avatar">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div class="assistant-title">
              <h4>BuildBridge AI</h4>
              <span>Online</span>
            </div>
          </div>
          <div class="assistant-header-actions">
            <button class="assistant-header-btn assistant-menu-btn" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
            <button class="assistant-header-btn assistant-close-btn" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
        
        <div class="assistant-quick-actions">
          <div class="assistant-quick-action" data-action="clear">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            Clear chat
          </div>
          <div class="assistant-quick-action" data-action="whatsapp">
            <svg viewBox="0 0 24 24"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-4.38-2.16-7.14-5.89-8.3-9.3l2.2-2.2c.28-.28.36-.67.25-1.02C7.7 3.45 7.5 2.25 7.5 1c0-.55-.45-1-1-1H2C1.45 0 1 .45 1 1c0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-4.5c0-.55-.45-1-1-1zM5.03 5h1.5c.07.88.22 1.75.45 2.58l-1.2 1.21c-.4-1.21-.66-2.47-.75-3.79zM19 18.97c-1.32-.09-2.6-.35-3.8-.76l1.2-1.2c.85.24 1.72.39 2.6.45v1.51zM17 11h2v2h-2v-2zm-4 0h2v2h-2v-2z"/></svg>
            WhatsApp Chat
          </div>
          <div class="assistant-quick-action" data-action="email">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            Email Us
          </div>
        </div>
        
        <div class="assistant-messages-pro"></div>
        
        <div class="assistant-suggestions"></div>
        
        <div class="assistant-input-pro">
          <textarea class="assistant-input-field" placeholder="Type your message..." rows="1"></textarea>
          <button class="assistant-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(assistant);
    this.elements = {
      fab: assistant.querySelector('.assistant-fab-pro'),
      window: assistant.querySelector('.assistant-window-pro'),
      messages: assistant.querySelector('.assistant-messages-pro'),
      input: assistant.querySelector('.assistant-input-field'),
      sendBtn: assistant.querySelector('.assistant-send-btn'),
      suggestions: assistant.querySelector('.assistant-suggestions'),
      closeBtn: assistant.querySelector('.assistant-close-btn'),
      menuBtn: assistant.querySelector('.assistant-menu-btn'),
      quickActions: assistant.querySelector('.assistant-quick-actions')
    };
  }
  
  bindEvents() {
    // Toggle assistant
    this.elements.fab.addEventListener('click', () => this.toggle());
    
    // Close button
    this.elements.closeBtn.addEventListener('click', () => this.close());
    
    // Menu button
    this.elements.menuBtn.addEventListener('click', () => {
      this.elements.quickActions.classList.toggle('active');
    });
    
    // Quick actions
    this.elements.quickActions.querySelectorAll('.assistant-quick-action').forEach(action => {
      action.addEventListener('click', (e) => {
        const actionType = e.currentTarget.dataset.action;
        this.handleQuickAction(actionType);
        this.elements.quickActions.classList.remove('active');
      });
    });
    
    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Input enter key
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    this.elements.input.addEventListener('input', () => {
      this.elements.input.style.height = 'auto';
      this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 120) + 'px';
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.smart-assistant-pro')) {
        this.elements.quickActions.classList.remove('active');
      }
    });
    
    // Keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.elements.fab.classList.toggle('active', this.isOpen);
    this.elements.window.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.elements.input.focus();
      this.scrollToBottom();
    }
  }
  
  open() {
    this.isOpen = true;
    this.elements.fab.classList.add('active');
    this.elements.window.classList.add('active');
    this.elements.input.focus();
    this.scrollToBottom();
  }
  
  close() {
    this.isOpen = false;
    this.elements.fab.classList.remove('active');
    this.elements.window.classList.remove('active');
    this.elements.quickActions.classList.remove('active');
  }
  
  showWelcome() {
    const welcomeHTML = `
      <div class="assistant-welcome">
        <div class="assistant-welcome-avatar">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>
        <h3>Welcome to BuildBridge</h3>
        <p>I'm your AI assistant. I can help you with project quotes, contractor matching, and general inquiries.</p>
        <div class="assistant-welcome-features">
          <div class="welcome-feature" data-topic="quote">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            Get Quote
          </div>
          <div class="welcome-feature" data-topic="projects">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            View Projects
          </div>
          <div class="welcome-feature" data-topic="services">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Our Services
          </div>
          <div class="welcome-feature" data-topic="contact">
            <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            Contact Us
          </div>
        </div>
      </div>
    `;
    
    this.elements.messages.innerHTML = welcomeHTML;
    
    // Bind welcome feature clicks
    this.elements.messages.querySelectorAll('.welcome-feature').forEach(feature => {
      feature.addEventListener('click', (e) => {
        const topic = e.currentTarget.dataset.topic;
        this.handleWelcomeFeature(topic);
      });
    });
    
    this.renderSuggestions();
  }
  
  handleWelcomeFeature(topic) {
    this.sendBotMessage(this.getRandomResponse(topic));
    this.elements.messages.innerHTML = ''; // Clear welcome
    this.renderMessage({ type: 'bot', text: this.getRandomResponse(topic), time: new Date() });
    this.renderSuggestions();
  }
  
  sendMessage() {
    const text = this.elements.input.value.trim();
    if (!text) return;
    
    // Add user message
    const userMessage = {
      type: 'user',
      text: text,
      time: new Date()
    };
    
    this.messages.push(userMessage);
    this.renderMessage(userMessage);
    this.elements.input.value = '';
    this.elements.input.style.height = 'auto';
    
    // Show typing indicator
    this.showTyping();
    
    // Generate response after delay
    setTimeout(() => {
      this.hideTyping();
      const response = this.generateResponse(text);
      const botMessage = {
        type: 'bot',
        text: response,
        time: new Date()
      };
      this.messages.push(botMessage);
      this.renderMessage(botMessage);
      this.renderSuggestions();
      this.saveMessages();
    }, 1000 + Math.random() * 1000);
  }
  
  sendBotMessage(text) {
    const message = {
      type: 'bot',
      text: text,
      time: new Date()
    };
    this.messages.push(message);
    this.renderMessage(message);
    this.saveMessages();
  }
  
  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'assistant-message assistant-typing-indicator';
    typing.innerHTML = `
      <div class="assistant-message-avatar">🤖</div>
      <div class="assistant-typing">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    this.elements.messages.appendChild(typing);
    this.scrollToBottom();
  }
  
  hideTyping() {
    const typing = this.elements.messages.querySelector('.assistant-typing-indicator');
    if (typing) typing.remove();
  }
  
  generateResponse(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('quote') || lowerText.includes('price') || lowerText.includes('cost')) {
      return this.getRandomResponse('quote');
    }
    if (lowerText.includes('project') || lowerText.includes('portfolio') || lowerText.includes('work')) {
      return this.getRandomResponse('projects');
    }
    if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('do')) {
      return this.getRandomResponse('services');
    }
    if (lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('email') || lowerText.includes('reach')) {
      return this.getRandomResponse('contact');
    }
    if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
      return this.getRandomResponse('greeting');
    }
    
    return this.getRandomResponse('default');
  }
  
  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  renderMessage(message) {
    // Clear welcome screen if present
    if (this.elements.messages.querySelector('.assistant-welcome')) {
      this.elements.messages.innerHTML = '';
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `assistant-message ${message.type}`;
    messageEl.innerHTML = `
      <div class="assistant-message-avatar">${message.type === 'bot' ? '🤖' : '👤'}</div>
      <div class="assistant-message-content">
        ${message.text}
        <div class="assistant-message-time">${this.formatTime(message.time)}</div>
      </div>
    `;
    
    this.elements.messages.appendChild(messageEl);
    this.scrollToBottom();
  }
  
  renderSuggestions() {
    this.elements.suggestions.innerHTML = this.suggestions.map(suggestion => `
      <button class="assistant-suggestion-chip">${suggestion}</button>
    `).join('');
    
    this.elements.suggestions.querySelectorAll('.assistant-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.elements.input.value = e.target.textContent;
        this.sendMessage();
      });
    });
  }
  
  handleQuickAction(action) {
    switch(action) {
      case 'clear':
        this.messages = [];
        this.saveMessages();
        this.showWelcome();
        break;
      case 'whatsapp':
        window.open('https://wa.me/27661200064', '_blank');
        break;
      case 'email':
        window.location.href = 'mailto:info@buildbridge.co.za';
        break;
    }
  }
  
  scrollToBottom() {
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }
  
  formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  saveMessages() {
    // Limit to last 50 messages
    const messagesToSave = this.messages.slice(-50);
    localStorage.setItem('buildbridge-assistant-messages', JSON.stringify(messagesToSave));
  }
  
  loadMessages() {
    const saved = localStorage.getItem('buildbridge-assistant-messages');
    if (saved) {
      this.messages = JSON.parse(saved);
      this.messages.forEach(msg => this.renderMessage(msg));
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SmartAssistantPro());
} else {
  new SmartAssistantPro();
}
