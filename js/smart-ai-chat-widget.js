// ========================================
// SMART AI CHAT WIDGET - v127.0
// Fortune 500 AI-Powered Chat Assistant
// Features: Smart responses, context awareness,
// typing simulation, suggestion chips
// ========================================

class SmartAIChatWidget {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.suggestions = [
      "Get a free quote",
      "View our projects",
      "Services we offer",
      "Contact details"
    ];
    this.responses = {
      greeting: [
        "Hello! I'm BuildBridge AI. How can I help you with your construction project today?",
        "Hi there! Welcome to BuildBridge. What can I assist you with?",
        "Greetings! I'm here to help with any construction management questions."
      ],
      quote: [
        "I'd be happy to help you get a quote! Please visit our contact page or click the WhatsApp button to speak directly with our team.",
        "For a personalized quote, please share your project details via our contact form or WhatsApp. We typically respond within 24 hours."
      ],
      services: [
        "We offer comprehensive construction management services including:\n\n• Project Consultation\n• Contractor Matching\n• Project Management\n• Quality Assurance\n\nWould you like to know more about any specific service?"
      ],
      projects: [
        "We've completed over 150+ projects across residential, commercial, and industrial sectors. Visit our Projects page to see our portfolio, or I can tell you about our recent work in Cape Town and Johannesburg."
      ],
      contact: [
        "You can reach us through:\n\n📱 WhatsApp: +27 66 120 0064\n📧 Email: info@buildbridge.co.za\n🌐 Website: buildbridge.co.za\n\nWe typically respond within 2 hours during business hours."
      ],
      pricing: [
        "Our pricing depends on project scope and complexity. We offer:\n\n• Free initial consultations\n• Transparent pricing\n• Flexible payment options\n\nWould you like to schedule a consultation to discuss your specific needs?"
      ],
      hours: [
        "Our business hours are:\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed\n\nHowever, our WhatsApp line is monitored for urgent inquiries."
      ],
      location: [
        "We're based in Cape Town, South Africa, but we work on projects throughout the Western Cape and Johannesburg areas. We can coordinate contractors nationwide."
      ],
      default: [
        "I appreciate your message. For more specific information, please reach out via WhatsApp at +27 66 120 0064 or email info@buildbridge.co.za. Our team will be happy to assist you!",
        "That's a great question! I'd recommend speaking with our project specialists for detailed information. Would you like me to connect you via WhatsApp?",
        "Thanks for reaching out! I'd be happy to help further. Could you provide more details, or would you prefer to speak with a human representative?"
      ]
    };
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    this.loadChatState();
  }
  
  createWidget() {
    // Check if already exists
    if (document.querySelector('.ai-chat-widget')) return;
    
    const widget = document.createElement('div');
    widget.className = 'ai-chat-widget';
    widget.innerHTML = `
      <button class="ai-chat-trigger" aria-label="Open AI Assistant" title="Ask BuildBridge AI">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
        <span class="ai-chat-badge" style="display: none">1</span>
      </button>
      
      <div class="ai-chat-window" role="dialog" aria-label="AI Assistant Chat">
        <div class="ai-chat-header">
          <div class="ai-chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
            <span class="ai-status-indicator"></span>
          </div>
          <div class="ai-chat-title">
            <h3>BuildBridge AI</h3>
            <p>Online • Typically replies instantly</p>
          </div>
          <button class="ai-chat-close" aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="ai-chat-messages" role="log" aria-live="polite" aria-atomic="false">
          <div class="ai-message ai">
            👋 Hi! I'm your BuildBridge AI assistant. I can help with quotes, services, project info, and more. What can I do for you today?
          </div>
        </div>
        
        <div class="ai-suggestions">
          ${this.suggestions.map(s => `<button class="ai-suggestion-btn">${s}</button>`).join('')}
        </div>
        
        <div class="ai-chat-input-area">
          <div class="ai-chat-input-wrapper">
            <input type="text" class="ai-chat-input" placeholder="Type your message..." aria-label="Type your message">
            <button class="ai-chat-send" aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    this.widget = widget;
    this.chatWindow = widget.querySelector('.ai-chat-window');
    this.messagesContainer = widget.querySelector('.ai-chat-messages');
    this.input = widget.querySelector('.ai-chat-input');
    this.trigger = widget.querySelector('.ai-chat-trigger');
    this.badge = widget.querySelector('.ai-chat-badge');
  }
  
  bindEvents() {
    // Toggle chat
    this.trigger.addEventListener('click', () => this.toggleChat());
    
    // Close chat
    this.widget.querySelector('.ai-chat-close').addEventListener('click', () => this.closeChat());
    
    // Send message
    this.widget.querySelector('.ai-chat-send').addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Suggestion buttons
    this.widget.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent;
        this.input.value = text;
        this.sendMessage();
      });
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.closeChat();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.widget.contains(e.target)) {
        this.closeChat();
      }
    });
  }
  
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatWindow.classList.toggle('open', this.isOpen);
    this.trigger.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.input.focus();
      this.badge.style.display = 'none';
      this.scrollToBottom();
    }
    
    this.saveChatState();
  }
  
  closeChat() {
    this.isOpen = false;
    this.chatWindow.classList.remove('open');
    this.trigger.classList.remove('active');
    this.saveChatState();
  }
  
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    
    // Add user message
    this.addMessage(text, 'user');
    this.input.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    // Generate response after delay
    setTimeout(() => {
      this.hideTyping();
      const response = this.generateResponse(text);
      this.addMessage(response, 'ai');
    }, 1000 + Math.random() * 1000);
  }
  
  addMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `ai-message ${sender}`;
    message.textContent = text;
    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
    
    // Save message
    this.messages.push({ text, sender, timestamp: Date.now() });
    this.saveChatState();
  }
  
  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    typing.id = 'ai-typing-indicator';
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }
  
  hideTyping() {
    const typing = document.getElementById('ai-typing-indicator');
    if (typing) typing.remove();
  }
  
  generateResponse(input) {
    const lower = input.toLowerCase();
    
    // Keyword matching
    if (lower.match(/hi|hello|hey|greetings/)) {
      return this.randomResponse('greeting');
    }
    if (lower.match(/quote|price|cost|estimate|budget/)) {
      return this.randomResponse('quote');
    }
    if (lower.match(/service|offer|provide|do/)) {
      return this.randomResponse('services');
    }
    if (lower.match(/project|portfolio|work|building|built/)) {
      return this.randomResponse('projects');
    }
    if (lower.match(/contact|call|email|phone|reach|whatsapp/)) {
      return this.randomResponse('contact');
    }
    if (lower.match(/hour|time|when|open|available/)) {
      return this.randomResponse('hours');
    }
    if (lower.match(/location|where|address|place|cape|town|johannesburg/)) {
      return this.randomResponse('location');
    }
    if (lower.match(/pricing|how much|expensive|cheap|rate/)) {
      return this.randomResponse('pricing');
    }
    
    return this.randomResponse('default');
  }
  
  randomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  saveChatState() {
    try {
      localStorage.setItem('ai-chat-open', this.isOpen);
      localStorage.setItem('ai-chat-messages', JSON.stringify(this.messages.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  loadChatState() {
    try {
      const savedOpen = localStorage.getItem('ai-chat-open');
      const savedMessages = localStorage.getItem('ai-chat-messages');
      
      // Don't auto-open, just show badge
      if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        if (messages.length > 0) {
          this.badge.style.display = 'flex';
          this.badge.textContent = '1';
        }
      }
      
      // Show welcome notification after delay
      setTimeout(() => {
        if (!this.isOpen) {
          this.badge.style.display = 'flex';
        }
      }, 5000);
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SmartAIChatWidget());
} else {
  new SmartAIChatWidget();
}

export default SmartAIChatWidget;
