/**
 * v50.0: AI Chat Assistant Widget
 * Fortune 500 Professional Interactive Support System
 */

(function() {
  'use strict';

  // Chat Configuration
  const CHAT_CONFIG = {
    storageKey: 'buildbridge_chat_history',
    maxMessages: 50,
    typingDelay: 800,
    autoOpenDelay: 30000, // Auto-open after 30 seconds
    welcomeMessage: {
      text: "👋 Hi! I'm your BuildBridge assistant. I can help you with project inquiries, finding contractors, or answering questions about our services. What can I help you with today?",
      delay: 1000
    },
    quickReplies: [
      { text: "Get a quote", icon: "📋", action: "quote" },
      { text: "Our services", icon: "🛠️", action: "services" },
      { text: "View projects", icon: "🏗️", action: "projects" },
      { text: "Contact us", icon: "📞", action: "contact" }
    ]
  };

  // Knowledge Base
  const KNOWLEDGE_BASE = {
    greetings: ['hello', 'hi', 'hey', 'greetings', 'howdy'],
    services: ['services', 'what do you do', 'offer', 'provide', 'help'],
    quote: ['quote', 'pricing', 'price', 'cost', 'estimate', 'how much'],
    projects: ['projects', 'portfolio', 'work', 'examples', 'gallery'],
    contact: ['contact', 'email', 'phone', 'call', 'reach', 'speak'],
    contractors: ['contractors', 'builders', 'workers', 'team', 'crew'],
    timeline: ['timeline', 'how long', 'duration', 'time', 'schedule'],
    locations: ['location', 'where', 'area', 'cape town', 'johannesburg', 'durban'],
    about: ['about', 'company', 'who are you', 'buildbridge', 'story']
  };

  // Response Templates
  const RESPONSES = {
    greeting: [
      "Hello! Welcome to BuildBridge. 🏗️ I'm here to help you with your construction project needs. What brings you here today?",
      "Hi there! Ready to start your construction journey? I can connect you with trusted contractors or answer any questions.",
      "Welcome! How can I assist you with your building project today?"
    ],
    services: `We offer comprehensive construction management services:

📋 **Project Consultation** - From concept to blueprint guidance
🤝 **Contractor Matching** - Access to our vetted network of 50+ qualified contractors
📊 **Project Management** - Full oversight from groundbreaking to completion
✓ **Quality & Transparency** - Real-time updates and honest communication

Would you like to know more about any specific service?`,
    quote: `I'd be happy to help you get a quote! 💰

To provide an accurate estimate, I'll need a few details:
• Project type (residential/commercial/industrial)
• Approximate size/scope
• Preferred timeline
• Location

Would you like to:
1. 📞 Chat on WhatsApp for immediate assistance
2. 📧 Fill out our contact form
3. 🗓️ Schedule a free consultation

Which works best for you?`,
    projects: `We've delivered 150+ successful projects! 🏆

**Featured Categories:**
• Modern Residential Complexes
• Commercial Headquarters  
• Luxury Villa Estates
• Industrial Facilities
• Mixed-Use Developments

📸 View our full portfolio at: /projects.html

Would you like to see projects in a specific category?`,
    contact: `You can reach us through any of these channels:

📱 **WhatsApp (Fastest)**: +27 66 120 0064
📧 **Email**: info@buildbridge.co.za
🌐 **Website**: buildbridge.co.za
📍 **Location**: South Africa (Western Cape, Gauteng, KZN)

⏰ **Business Hours**: Mon-Fri 8AM-6PM SAST

Click the WhatsApp button for instant chat! 💬`,
    contractors: `Our contractor network is our pride! 👷‍♂️

**What makes them special:**
• ✓ Fully vetted & qualified professionals
• ✓ 50+ specialized contractors
• ✓ Coverage across all provinces
• ✓ Track record of excellence
• ✓ Specialized in residential, commercial & industrial

We match you based on your specific project needs. All contractors are monitored for quality and reliability.

Ready to meet your perfect contractor match?`,
    timeline: `Project timelines vary based on scope and complexity: ⏱️

**Typical Durations:**
• Small residential: 2-4 months
• Medium projects: 6-12 months  
• Large commercial: 12-24 months
• Industrial facilities: 18-30 months

We use milestone-based management to keep everything on track. During your consultation, we'll provide a detailed timeline specific to your project.

Want to discuss your project timeline?`,
    locations: `BuildBridge operates across South Africa! 🌍

**Primary Regions:**
• Western Cape (Cape Town & surrounds)
• Gauteng (Johannesburg, Pretoria)
• KwaZulu-Natal (Durban, PMB)

We've completed projects in major metros and growing towns throughout SA. Distance isn't a barrier - our network spans the country.

Where is your project located?`,
    about: `BuildBridge is South Africa's premier construction management company! 🏗️

**Our Story:**
Founded with a mission to bridge the gap between clients and contractors, we've grown to manage 150+ projects worth over R50M.

**Why Clients Choose Us:**
• 98% client satisfaction rate
• Transparent pricing & communication
• End-to-end project management
• Risk mitigation expertise
• Quality assurance at every stage

We're not just managers - we're your construction partners! 🤝`,
    fallback: [
      "I'm not sure I understood that completely. Could you rephrase or choose from these options?",
      "I want to make sure I help you properly! Can you tell me more about what you're looking for?",
      "Interesting question! Let me connect you with a human expert who can help better. Would you like to chat on WhatsApp?"
    ]
  };

  class AIChatAssistant {
    constructor() {
      this.isOpen = false;
      this.messages = [];
      this.messageId = 0;
      this.typing = false;
      this.init();
    }

    init() {
      this.createDOM();
      this.attachEvents();
      this.loadHistory();
      this.scheduleAutoOpen();
    }

    createDOM() {
      // Create Toggle Button
      const toggle = document.createElement('button');
      toggle.className = 'ai-chat-toggle';
      toggle.setAttribute('aria-label', 'Open chat assistant');
      toggle.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="ai-chat-badge">1</span>
      `;
      document.body.appendChild(toggle);
      this.toggleBtn = toggle;

      // Create Chat Window
      const window = document.createElement('div');
      window.className = 'ai-chat-window';
      window.setAttribute('role', 'dialog');
      window.setAttribute('aria-label', 'AI Chat Assistant');
      window.innerHTML = `
        <div class="ai-chat-header">
          <div class="ai-chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span class="ai-chat-status"></span>
          </div>
          <div class="ai-chat-header-info">
            <h4>BuildBridge Assistant</h4>
            <p>Online - Usually responds instantly</p>
          </div>
          <div class="ai-chat-actions">
            <button class="ai-chat-btn" id="chat-clear" aria-label="Clear chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button class="ai-chat-btn" id="chat-minimize" aria-label="Minimize chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="ai-chat-messages" id="chat-messages">
          <!-- Messages will be inserted here -->
        </div>
        <div class="ai-chat-quick-replies" id="quick-replies">
          <!-- Quick replies inserted here -->
        </div>
        <div class="ai-chat-input-area">
          <div class="ai-chat-input-wrapper">
            <textarea 
              class="ai-chat-input" 
              id="chat-input"
              placeholder="Type your message..."
              rows="1"
            ></textarea>
          </div>
          <button class="ai-chat-send" id="chat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      `;
      document.body.appendChild(window);
      this.chatWindow = window;
      this.messagesContainer = window.querySelector('#chat-messages');
      this.input = window.querySelector('#chat-input');
      this.sendBtn = window.querySelector('#chat-send');
      this.quickRepliesContainer = window.querySelector('#quick-replies');
    }

    attachEvents() {
      // Toggle
      this.toggleBtn.addEventListener('click', () => this.toggle());

      // Send message
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize input
      this.input.addEventListener('input', () => this.resizeInput());

      // Clear chat
      this.chatWindow.querySelector('#chat-clear').addEventListener('click', () => this.clearChat());

      // Minimize
      this.chatWindow.querySelector('#chat-minimize').addEventListener('click', () => this.close());

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.chatWindow.contains(e.target) && !this.toggleBtn.contains(e.target)) {
          this.close();
        }
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.chatWindow.classList.add('open');
      this.toggleBtn.classList.add('active');
      this.toggleBtn.setAttribute('aria-label', 'Close chat assistant');
      
      // Hide badge
      this.toggleBtn.querySelector('.ai-chat-badge').classList.remove('visible');
      
      // Focus input
      setTimeout(() => this.input.focus(), 300);
      
      // Show welcome if no messages
      if (this.messages.length === 0) {
        this.showWelcome();
      }

      this.saveHistory();
    }

    close() {
      this.isOpen = false;
      this.chatWindow.classList.remove('open');
      this.toggleBtn.classList.remove('active');
      this.toggleBtn.setAttribute('aria-label', 'Open chat assistant');
      this.saveHistory();
    }

    showWelcome() {
      // Welcome message
      setTimeout(() => {
        this.addMessage('ai', CHAT_CONFIG.welcomeMessage.text);
        this.showQuickReplies();
      }, CHAT_CONFIG.welcomeMessage.delay);
    }

    showQuickReplies() {
      this.quickRepliesContainer.innerHTML = CHAT_CONFIG.quickReplies.map(reply => `
        <button class="quick-reply-btn" data-action="${reply.action}">
          ${reply.icon} ${reply.text}
        </button>
      `).join('');

      this.quickRepliesContainer.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.currentTarget.dataset.action;
          this.handleQuickReply(action);
        });
      });
    }

    handleQuickReply(action) {
      let message = '';
      switch(action) {
        case 'quote': message = 'I want to get a quote for my project'; break;
        case 'services': message = 'Tell me about your services'; break;
        case 'projects': message = 'Show me your portfolio'; break;
        case 'contact': message = 'How can I contact you?'; break;
      }
      this.addMessage('user', message);
      this.quickRepliesContainer.innerHTML = '';
      this.processResponse(message);
    }

    sendMessage() {
      const text = this.input.value.trim();
      if (!text || this.typing) return;

      this.addMessage('user', text);
      this.input.value = '';
      this.resizeInput();
      this.processResponse(text);
    }

    addMessage(type, text) {
      const id = ++this.messageId;
      const message = { id, type, text, time: new Date().toISOString() };
      this.messages.push(message);

      if (this.messages.length > CHAT_CONFIG.maxMessages) {
        this.messages.shift();
      }

      const element = document.createElement('div');
      element.className = `chat-message ${type}`;
      element.innerHTML = `
        <div class="message-avatar">${type === 'ai' ? '🤖' : '👤'}</div>
        <div>
          <div class="message-content">${this.formatMessage(text)}</div>
          <div class="message-time">${this.formatTime()}</div>
        </div>
      `;

      this.messagesContainer.appendChild(element);
      this.scrollToBottom();
      this.saveHistory();

      return id;
    }

    formatMessage(text) {
      // Convert markdown-style formatting
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/• /g, '•&nbsp;')
        .replace(/(\d+\.) /g, '<br>$1 ')
        .replace(/\n/g, '<br>');
    }

    formatTime() {
      return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }

    showTyping() {
      this.typing = true;
      const typing = document.createElement('div');
      typing.className = 'chat-typing';
      typing.id = 'typing-indicator';
      typing.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      this.messagesContainer.appendChild(typing);
      this.scrollToBottom();
    }

    hideTyping() {
      this.typing = false;
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    processResponse(userMessage) {
      this.showTyping();

      // Simulate processing delay
      const delay = Math.max(800, Math.random() * 1500);
      
      setTimeout(() => {
        this.hideTyping();
        const response = this.generateResponse(userMessage);
        this.addMessage('ai', response);
        
        // Show quick replies again after response
        setTimeout(() => this.showQuickReplies(), 500);
      }, delay);
    }

    generateResponse(message) {
      const lower = message.toLowerCase();
      
      // Check against knowledge base
      for (const [category, keywords] of Object.entries(KNOWLEDGE_BASE)) {
        if (keywords.some(k => lower.includes(k))) {
          const response = RESPONSES[category];
          if (Array.isArray(response)) {
            return response[Math.floor(Math.random() * response.length)];
          }
          return response;
        }
      }

      // Fallback responses
      const fallbacks = RESPONSES.fallback;
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    resizeInput() {
      this.input.style.height = 'auto';
      this.input.style.height = this.input.scrollHeight + 'px';
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    clearChat() {
      this.messages = [];
      this.messageId = 0;
      this.messagesContainer.innerHTML = '';
      this.showWelcome();
      localStorage.removeItem(CHAT_CONFIG.storageKey);
    }

    saveHistory() {
      try {
        localStorage.setItem(CHAT_CONFIG.storageKey, JSON.stringify({
          messages: this.messages.slice(-20), // Keep last 20
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to save chat history');
      }
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem(CHAT_CONFIG.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          // Only restore if less than 24 hours old
          if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            this.messages = data.messages || [];
            this.messageId = this.messages.length;
            
            // Restore messages to DOM
            this.messages.forEach(msg => {
              const element = document.createElement('div');
              element.className = `chat-message ${msg.type}`;
              element.innerHTML = `
                <div class="message-avatar">${msg.type === 'ai' ? '🤖' : '👤'}</div>
                <div>
                  <div class="message-content">${this.formatMessage(msg.text)}</div>
                  <div class="message-time">${new Date(msg.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                </div>
              `;
              this.messagesContainer.appendChild(element);
            });

            if (this.messages.length > 0) {
              this.scrollToBottom();
              this.showQuickReplies();
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load chat history');
      }
    }

    scheduleAutoOpen() {
      // Auto-open after delay if first visit
      const hasVisited = localStorage.getItem('buildbridge_chat_visited');
      if (!hasVisited) {
        setTimeout(() => {
          if (!this.isOpen) {
            this.toggleBtn.querySelector('.ai-chat-badge').classList.add('visible');
          }
        }, CHAT_CONFIG.autoOpenDelay);
        localStorage.setItem('buildbridge_chat_visited', 'true');
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AIChatAssistant());
  } else {
    new AIChatAssistant();
  }
})();
