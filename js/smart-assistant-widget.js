/**
 * BuildBridge Smart Assistant Widget v51.0
 * AI-powered interactive chat interface
 * Fortune 500 Professional Component
 */

class SmartAssistant {
  constructor() {
    this.container = null;
    this.window = null;
    this.toggleBtn = null;
    this.messagesContainer = null;
    this.input = null;
    this.isOpen = false;
    this.messageHistory = [];
    this.suggestions = [
      {
        icon: '💰',
        title: 'Get a Quote',
        description: 'Instant project estimation',
        action: 'quote'
      },
      {
        icon: '🏗️',
        title: 'Our Services',
        description: 'Explore what we offer',
        action: 'services'
      },
      {
        icon: '📅',
        title: 'Book Consultation',
        description: 'Schedule a free call',
        action: 'consultation'
      },
      {
        icon: '📍',
        title: 'Project Locations',
        description: 'See our work across SA',
        action: 'locations'
      }
    ];
    
    this.responses = {
      greeting: [
        "👋 Hi there! I'm BridgeBot, your BuildBridge assistant. How can I help you today?",
        "Welcome to BuildBridge! 🏗️ I'm here to assist with your construction questions. What would you like to know?",
        "Hello! Ready to build something amazing together? Ask me anything about our services!"
      ],
      quote: [
        "I'd be happy to help you get a project quote! 💰 Our cost estimator can give you an instant estimate, or would you prefer to speak with our team directly?",
        "Great choice! You can use our cost calculator for an instant estimate (typically R8,500-R12,000 per m²), or I can connect you with a consultant for a detailed quote."
      ],
      services: [
        "We offer comprehensive construction management services: 📋 Project Consultation, 🤝 Contractor Matching, 📊 Project Management, and ✓ Quality Assurance. Which would you like to learn more about?",
        "BuildBridge specializes in: residential builds, commercial developments, industrial projects, and renovations. We manage everything from concept to completion!"
      ],
      consultation: [
        "Perfect! 📅 You can book a free consultation at https://wa.me/27661200064 or I can take your details and have our team call you within 24 hours.",
        "Our consultations are free and typically take 30 minutes. We'll discuss your vision, budget, and timeline. Ready to schedule?"
      ],
      locations: [
        "We operate across South Africa! 🇿🇦 Our major project hubs include Cape Town, Johannesburg, Durban, and Pretoria. Check out our interactive project map on the homepage!",
        "From the Western Cape to Gauteng to KZN - we've got South Africa covered! View our portfolio to see projects in your area."
      ],
      pricing: [
        "Our pricing depends on project type and complexity. Here's a quick guide:\n🏠 Residential: R8,500/m²\n🏢 Commercial: R12,000/m²\n🏭 Industrial: R9,500/m²\n🔨 Renovation: R6,500/m²\nUse our cost calculator for precise estimates!"
      ],
      timeline: [
        "Project timelines vary by scope:\n• Renovations: 2-8 weeks\n• Custom homes: 8-12 months\n• Commercial: 12-24 months\nWe'll provide a detailed timeline during consultation!"
      ],
      contact: [
        "You can reach us at:\n📱 WhatsApp: +27 66 120 0064\n📧 Email: info@buildbridge.co.za\n🌐 Website: buildbridge.co.za\nWe typically respond within an hour!"
      ],
      default: [
        "That's an interesting question! 🤔 For detailed assistance, I'd recommend speaking with our team directly on WhatsApp: +27 66 120 0064",
        "I can connect you with one of our experts who can help with that specific query. Would you like me to arrange a callback?",
        "Great question! This might need a more detailed discussion. Click the WhatsApp button to chat with our team right now!"
      ]
    };
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    this.loadMessageHistory();
    
    // Show greeting after delay
    setTimeout(() => {
      if (this.messageHistory.length === 0) {
        this.showNotification();
      }
    }, 5000);
  }
  
  createWidget() {
    this.container = document.createElement('div');
    this.container.className = 'smart-assistant-widget';
    this.container.innerHTML = `
      <button class="assistant-toggle" aria-label="Open chat assistant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="notification-badge"></span>
      </button>
      
      <div class="assistant-window">
        <div class="assistant-header">
          <div class="assistant-avatar">
            🤖
            <span class="status-dot"></span>
          </div>
          <div class="assistant-info">
            <div class="assistant-name">BridgeBot</div>
            <div class="assistant-status">Online - Typically replies instantly</div>
          </div>
          <div class="assistant-actions">
            <button class="assistant-action-btn" aria-label="Clear chat" data-action="clear">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button class="assistant-action-btn" aria-label="Close" data-action="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="assistant-messages"></div>
        
        <div class="suggestion-cards"></div>
        
        <div class="quick-replies"></div>
        
        <div class="assistant-input-wrapper">
          <textarea 
            class="assistant-input" 
            placeholder="Type your message..." 
            rows="1"
          ></textarea>
          <button class="send-btn" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Store references
    this.toggleBtn = this.container.querySelector('.assistant-toggle');
    this.window = this.container.querySelector('.assistant-window');
    this.messagesContainer = this.container.querySelector('.assistant-messages');
    this.input = this.container.querySelector('.assistant-input');
    
    this.renderSuggestions();
    this.renderQuickReplies();
  }
  
  bindEvents() {
    // Toggle window
    this.toggleBtn.addEventListener('click', () => this.toggle());
    
    // Close button
    this.window.querySelector('[data-action="close"]').addEventListener('click', () => {
      this.close();
    });
    
    // Clear button
    this.window.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clearChat();
    });
    
    // Send button
    this.window.querySelector('.send-btn').addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Input enter key
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.window.classList.toggle('active', this.isOpen);
    this.toggleBtn.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.toggleBtn.querySelector('.notification-badge').style.display = 'none';
      this.input.focus();
      
      // Show greeting if first open
      if (this.messageHistory.length === 0) {
        setTimeout(() => {
          this.addBotMessage(this.getRandomResponse('greeting'));
        }, 400);
      }
    }
  }
  
  open() {
    this.isOpen = true;
    this.window.classList.add('active');
    this.toggleBtn.classList.add('active');
    this.input.focus();
  }
  
  close() {
    this.isOpen = false;
    this.window.classList.remove('active');
    this.toggleBtn.classList.remove('active');
  }
  
  showNotification() {
    this.toggleBtn.querySelector('.notification-badge').style.display = 'block';
  }
  
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    
    // Add user message
    this.addUserMessage(text);
    
    // Clear input
    this.input.value = '';
    this.input.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Generate response after delay
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateResponse(text);
      this.addBotMessage(response);
    }, 1000 + Math.random() * 1000);
  }
  
  addUserMessage(text) {
    const message = {
      type: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messageHistory.push(message);
    this.renderMessage(message);
    this.saveMessageHistory();
  }
  
  addBotMessage(text) {
    const message = {
      type: 'bot',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messageHistory.push(message);
    this.renderMessage(message);
    this.saveMessageHistory();
  }
  
  renderMessage(message) {
    const div = document.createElement('div');
    div.className = `message ${message.type}`;
    div.innerHTML = `
      ${this.formatMessage(message.text)}
      <span class="message-time">${message.time}</span>
    `;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  }
  
  formatMessage(text) {
    // Convert line breaks to HTML
    return text.replace(/\n/g, '<br>');
  }
  
  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    indicator.id = 'typing-indicator';
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  generateResponse(text) {
    const lower = text.toLowerCase();
    
    // Keyword matching
    if (lower.match(/\b(hi|hello|hey|greetings)\b/)) {
      return this.getRandomResponse('greeting');
    }
    if (lower.match(/\b(quote|price|cost|estimate|how much)\b/)) {
      return this.getRandomResponse('quote');
    }
    if (lower.match(/\b(service|offer|do you|what can)\b/)) {
      return this.getRandomResponse('services');
    }
    if (lower.match(/\b(book|consultation|appointment|meeting|call)\b/)) {
      return this.getRandomResponse('consultation');
    }
    if (lower.match(/\b(location|where|area|city|province)\b/)) {
      return this.getRandomResponse('locations');
    }
    if (lower.match(/\b(price|pricing|rate|charge)\b/)) {
      return this.getRandomResponse('pricing');
    }
    if (lower.match(/\b(time|how long|duration|weeks|months)\b/)) {
      return this.getRandomResponse('timeline');
    }
    if (lower.match(/\b(contact|call|email|phone|reach)\b/)) {
      return this.getRandomResponse('contact');
    }
    
    return this.getRandomResponse('default');
  }
  
  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  renderSuggestions() {
    const container = this.window.querySelector('.suggestion-cards');
    container.innerHTML = this.suggestions.map(s => `
      <div class="suggestion-card" data-action="${s.action}">
        <div class="suggestion-card-icon">${s.icon}</div>
        <div class="suggestion-card-title">${s.title}</div>
        <div class="suggestion-card-desc">${s.description}</div>
      </div>
    `).join('');
    
    // Bind click events
    container.querySelectorAll('.suggestion-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.dataset.action;
        this.handleSuggestionClick(action);
      });
    });
  }
  
  renderQuickReplies() {
    const quickReplies = [
      'Get a Quote',
      'Our Services',
      'Contact Us',
      'Book Call'
    ];
    
    const container = this.window.querySelector('.quick-replies');
    container.innerHTML = quickReplies.map(reply => `
      <button class="quick-reply-btn">${reply}</button>
    `).join('');
    
    // Bind click events
    container.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.input.value = btn.textContent;
        this.sendMessage();
      });
    });
  }
  
  handleSuggestionClick(action) {
    const actions = {
      quote: () => this.addBotMessage(this.getRandomResponse('quote')),
      services: () => this.addBotMessage(this.getRandomResponse('services')),
      consultation: () => this.addBotMessage(this.getRandomResponse('consultation')),
      locations: () => this.addBotMessage(this.getRandomResponse('locations'))
    };
    
    if (actions[action]) {
      actions[action]();
    }
  }
  
  clearChat() {
    this.messagesContainer.innerHTML = '';
    this.messageHistory = [];
    this.saveMessageHistory();
    this.addBotMessage(this.getRandomResponse('greeting'));
  }
  
  saveMessageHistory() {
    try {
      sessionStorage.setItem('bridgebot-history', JSON.stringify(this.messageHistory));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  loadMessageHistory() {
    try {
      const saved = sessionStorage.getItem('bridgebot-history');
      if (saved) {
        this.messageHistory = JSON.parse(saved);
        this.messageHistory.forEach(msg => this.renderMessage(msg));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.bridgeBot = new SmartAssistant();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartAssistant;
}
