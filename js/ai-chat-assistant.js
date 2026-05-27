/* =========================================
   AI Chat Assistant Widget - v30.0
   Fortune 500 Interactive Chat System
   ========================================= */

class AIChatAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.typingDelay = 800;
    this.responses = {
      greeting: [
        "Hello! I'm your BuildBridge assistant. How can I help you with your construction project today?",
        "Welcome to BuildBridge! I'm here to answer questions about our services, projects, or to connect you with our team."
      ],
      services: {
        keywords: ['services', 'offer', 'do', 'provide', 'help', 'construction', 'management'],
        response: "BuildBridge offers comprehensive construction management services including:\n\n🏗️ **Project Consultation** - From concept to completion\n🤝 **Contractor Matching** - Access our vetted network of 50+ professionals\n📊 **Project Management** - Full oversight and real-time tracking\n✅ **Quality Assurance** - Rigorous standards at every phase\n💰 **Budget Management** - Smart cost control and reporting\n\nWould you like to learn more about any specific service?",
        followUp: ['project consultation', 'contractor matching', 'pricing']
      },
      pricing: {
        keywords: ['price', 'cost', 'pricing', 'fee', 'charge', 'budget', 'estimate', 'quote'],
        response: "Our pricing is tailored to each project's scope and complexity. We offer:\n\n• **Free Initial Consultation**\n• **Transparent Fee Structure** - No hidden costs\n• **Flexible Payment Plans**\n• **Value-Based Pricing** - You only pay for what you need\n\nFor a detailed quote, I'd recommend scheduling a consultation with our team. Would you like me to connect you?",
        followUp: ['schedule consultation', 'contact team', 'project types']
      },
      contact: {
        keywords: ['contact', 'reach', 'call', 'email', 'phone', 'whatsapp', 'talk', 'speak'],
        response: "You can reach BuildBridge through:\n\n📱 **WhatsApp:** +27 66 120 0064 (Quickest response)\n📧 **Email:** info@buildbridge.co.za\n📞 **Phone:** +27 66 120 0064\n🌐 **Website:** buildbridge.co.za\n\nOur team is available Monday-Friday, 8AM-6PM SAST. WhatsApp is the fastest way to get in touch!",
        followUp: ['schedule consultation', 'project types', 'services']
      },
      projects: {
        keywords: ['projects', 'portfolio', 'work', 'done', 'completed', 'built', 'examples'],
        response: "We've successfully delivered 150+ projects across South Africa including:\n\n🏢 **Office Renovations** - Modern workspaces for growing businesses\n🏠 **Residential Construction** - Custom homes and renovations\n🏭 **Industrial Facilities** - Manufacturing and logistics spaces\n🏪 **Retail Fit-outs** - Customer-focused commercial spaces\n🎓 **Institutional** - Schools, healthcare, and government\n\nVisit our Projects page to see our portfolio with before/after comparisons!",
        followUp: ['view projects', 'residential projects', 'commercial projects']
      },
      location: {
        keywords: ['location', 'where', 'based', 'south africa', 'cape town', 'johannesburg', 'durban', 'area', 'city', 'region'],
        response: "BuildBridge operates throughout South Africa with primary coverage in:\n\n📍 **Western Cape** - Cape Town and surrounding areas\n📍 **Gauteng** - Johannesburg, Pretoria region\n📍 **KwaZulu-Natal** - Durban and coastal areas\n\nOur network of contractors extends nationwide. Where is your project located?",
        followUp: ['schedule consultation', 'local contractors', 'project start']
      },
      consultation: {
        keywords: ['consultation', 'meeting', 'discuss', 'talk', 'appointment', 'book', 'schedule'],
        response: "Great! I'd be happy to help you schedule a free consultation. During this session, we'll:\n\n1. **Understand your project** goals and requirements\n2. **Discuss timeline** and key milestones\n3. **Explore budget** considerations\n4. **Answer questions** about our process\n5. **Provide initial recommendations**\n\nThe consultation typically takes 30-45 minutes and can be done via video call or in person. Click below to book your slot!",
        followUp: ['book now', 'call us', 'send email']
      },
      timeline: {
        keywords: ['time', 'how long', 'duration', 'timeline', 'when', 'start', 'finish', 'complete'],
        response: "Project timelines vary based on scope:\n\n🏠 **Small Renovations:** 2-8 weeks\n🏢 **Office Fit-outs:** 4-12 weeks\n🏡 **Residential Builds:** 4-12 months\n🏭 **Commercial Projects:** 6-18 months\n\nDuring your consultation, we'll provide a detailed timeline specific to your project. Factors affecting duration include permits, material availability, and project complexity.\n\nWant to discuss your specific timeline?",
        followUp: ['schedule consultation', 'project types', 'process']
      },
      process: {
        keywords: ['process', 'how does', 'how it works', 'steps', 'what happens', 'phases', 'stages'],
        response: "Our proven 5-phase process ensures project success:\n\n**1. Discovery & Planning**\nWe understand your vision, requirements, and constraints\n\n**2. Design & Documentation**\nDetailed plans, specifications, and permit applications\n\n**3. Contractor Selection**\nMatching you with the perfect vetted professionals\n\n**4. Construction Management**\nDaily oversight, quality control, and progress updates\n\n**5. Handover & Support**\nFinal inspections, documentation, and warranty period\n\nEach phase has clear deliverables and sign-offs. Want to dive deeper into any phase?",
        followUp: ['contractor selection', 'quality control', 'warranty']
      },
      default: {
        response: "That's a great question! I'd love to help, but I think our team would be better equipped to provide specific details about that.\n\nWould you like me to:\n• Connect you with a project manager?\n• Schedule a consultation?\n• Or ask me something else about our services?",
        followUp: ['schedule consultation', 'contact us', 'our services']
      }
    };
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    this.loadChatHistory();
  }
  
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'ai-chat-widget';
    widget.innerHTML = `
      <button class="ai-chat-toggle" aria-label="Open chat assistant">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <span class="ai-chat-badge" style="display: none">1</span>
      </button>
      
      <div class="ai-chat-container">
        <div class="ai-chat-header">
          <div class="ai-chat-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div class="ai-chat-info">
            <h4>BuildBridge Assistant</h4>
            <span class="ai-chat-status">
              <span>●</span> Online now
            </span>
          </div>
          <button class="ai-chat-close" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="ai-chat-messages">
          <div class="ai-chat-welcome">
            <p class="ai-chat-welcome-text">👋 Hi there! I'm here to help with your construction project. Ask me about our services, pricing, or how we can bring your vision to life.</p>
            <div class="ai-chat-suggestions">
              <button class="ai-chat-suggestion" data-topic="services">Our Services</button>
              <button class="ai-chat-suggestion" data-topic="pricing">Pricing</button>
              <button class="ai-chat-suggestion" data-topic="consultation">Book Consultation</button>
              <button class="ai-chat-suggestion" data-topic="projects">View Projects</button>
            </div>
          </div>
        </div>
        
        <div class="ai-chat-input-area">
          <div class="ai-chat-quick-actions">
            <button class="ai-chat-quick-action" data-topic="contact">Contact Info</button>
            <button class="ai-chat-quick-action" data-topic="timeline">Timeline</button>
            <button class="ai-chat-quick-action" data-topic="process">Our Process</button>
            <button class="ai-chat-quick-action" data-topic="location">Locations</button>
          </div>
          <div class="ai-chat-input-wrapper">
            <textarea class="ai-chat-input" placeholder="Type your message..." rows="1"></textarea>
            <div class="ai-chat-actions">
              <button class="ai-chat-action-btn ai-chat-send" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    this.widget = widget;
    this.toggle = widget.querySelector('.ai-chat-toggle');
    this.container = widget.querySelector('.ai-chat-container');
    this.messagesContainer = widget.querySelector('.ai-chat-messages');
    this.input = widget.querySelector('.ai-chat-input');
    this.sendBtn = widget.querySelector('.ai-chat-send');
  }
  
  bindEvents() {
    // Toggle chat
    this.toggle.addEventListener('click', () => this.toggleChat());
    
    // Close chat
    this.widget.querySelector('.ai-chat-close').addEventListener('click', () => this.closeChat());
    
    // Send message
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Input enter key
    this.input.addEventListener('keypress', (e) => {
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
    
    // Suggestion buttons
    this.widget.querySelectorAll('.ai-chat-suggestion, .ai-chat-quick-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const topic = e.target.dataset.topic;
        this.handleTopic(topic);
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.widget.contains(e.target)) {
        this.closeChat();
      }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }
  
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('active', this.isOpen);
    this.toggle.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.input.focus();
      this.scrollToBottom();
    }
  }
  
  closeChat() {
    this.isOpen = false;
    this.container.classList.remove('active');
    this.toggle.classList.remove('active');
  }
  
  handleTopic(topic) {
    const topicMessages = {
      'services': 'What services do you offer?',
      'pricing': 'How much do your services cost?',
      'consultation': 'I want to book a consultation',
      'contact': 'How can I contact you?',
      'projects': 'Can you show me your past projects?',
      'location': 'Where do you operate?',
      'timeline': 'How long does a typical project take?',
      'process': 'How does your process work?',
      'contractor selection': 'How do you select contractors?',
      'quality control': 'What quality control measures do you have?',
      'warranty': 'Do you offer warranties?',
      'project types': 'What types of projects do you handle?',
      'book now': 'I want to book a consultation now',
      'call us': 'What\'s your phone number?',
      'send email': 'What\'s your email address?',
      'residential projects': 'Do you do residential construction?',
      'commercial projects': 'Do you do commercial construction?',
      'schedule consultation': 'I want to schedule a consultation',
      'local contractors': 'Do you have contractors in my area?',
      'project start': 'How do I start a project with you?'
    };
    
    const message = topicMessages[topic] || topic;
    this.addMessage(message, 'user');
    this.processResponse(message);
  }
  
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    
    this.addMessage(text, 'user');
    this.input.value = '';
    this.input.style.height = 'auto';
    
    this.processResponse(text);
  }
  
  addMessage(text, type) {
    const message = document.createElement('div');
    message.className = `ai-chat-message ${type}`;
    message.innerHTML = this.formatMessage(text);
    message.style.animationDelay = '0s';
    
    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
    
    this.messages.push({ type, text, time: new Date() });
    this.saveChatHistory();
  }
  
  formatMessage(text) {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
  
  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-chat-message typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
    return typing;
  }
  
  processResponse(userMessage) {
    const typing = this.showTyping();
    
    // Simulate AI processing time
    const delay = Math.min(500 + userMessage.length * 20, 1500);
    
    setTimeout(() => {
      typing.remove();
      const response = this.generateResponse(userMessage.toLowerCase());
      this.addMessage(response.text, 'bot');
      
      // Add follow-up suggestions if available
      if (response.followUp && response.followUp.length > 0) {
        setTimeout(() => {
          this.addQuickReplies(response.followUp);
        }, 500);
      }
    }, delay);
  }
  
  generateResponse(message) {
    // Check for matching keywords
    for (const [key, data] of Object.entries(this.responses)) {
      if (key === 'default' || key === 'greeting') continue;
      
      if (data.keywords && data.keywords.some(keyword => message.includes(keyword))) {
        return {
          text: data.response,
          followUp: data.followUp || []
        };
      }
    }
    
    // Greeting detection
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/.test(message)) {
      return {
        text: this.getRandomResponse('greeting'),
        followUp: ['services', 'pricing', 'book consultation']
      };
    }
    
    // Default response
    return {
      text: this.responses.default.response,
      followUp: this.responses.default.followUp
    };
  }
  
  getRandomResponse(category) {
    const responses = this.responses[category];
    if (Array.isArray(responses)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses;
  }
  
  addQuickReplies(topics) {
    const container = document.createElement('div');
    container.className = 'ai-chat-suggestions';
    container.style.marginTop = '10px';
    
    topics.forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'ai-chat-suggestion';
      btn.textContent = this.capitalizeFirst(topic);
      btn.addEventListener('click', () => this.handleTopic(topic));
      container.appendChild(btn);
    });
    
    this.messagesContainer.appendChild(container);
    this.scrollToBottom();
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  saveChatHistory() {
    // Limit to last 50 messages
    const history = this.messages.slice(-50);
    localStorage.setItem('buildbridge_chat_history', JSON.stringify(history));
  }
  
  loadChatHistory() {
    const history = localStorage.getItem('buildbridge_chat_history');
    if (history) {
      this.messages = JSON.parse(history);
      // Don't display old messages, just keep them for context
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.aiChat = new AIChatAssistant();
  });
} else {
  window.aiChat = new AIChatAssistant();
}
