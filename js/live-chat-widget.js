/**
 * BuildBridge Live Chat Widget - v9.0
 * Professional Fortune 500 Quality Chat System
 */

(function() {
  'use strict';

  // Chat Widget Class
  class BuildBridgeChat {
    constructor(options = {}) {
      this.options = {
        position: 'bottom-right',
        primaryColor: '#1a1a1a',
        accentColor: '#d4af37',
        agentName: 'BuildBridge Support',
        agentAvatar: '👷',
        welcomeMessage: 'Hi there! 👋 How can we help with your construction project today?',
        quickActions: [
          { label: 'Get a quote', value: 'quote' },
          { label: 'Our services', value: 'services' },
          { label: 'Contact us', value: 'contact' }
        ],
        showTypingIndicator: true,
        typingDelay: 1500,
        soundEnabled: true,
        ...options
      };

      this.isOpen = false;
      this.messages = [];
      this.init();
    }

    init() {
      this.createWidget();
      this.attachEvents();
      this.loadStoredMessages();
      
      // Show welcome message after delay
      setTimeout(() => {
        if (this.messages.length === 0) {
          this.showTypingAndSend(this.options.welcomeMessage);
        }
      }, 3000);
    }

    createWidget() {
      // Create container
      const widget = document.createElement('div');
      widget.className = 'bb-chat-widget';
      widget.id = 'bb-live-chat';
      widget.setAttribute('role', 'region');
      widget.setAttribute('aria-label', 'Live chat support');

      widget.innerHTML = `
        <!-- Chat Toggle Button -->
        <button class="bb-chat-toggle" aria-label="Open chat" aria-expanded="false" aria-controls="bb-chat-window">
          <span class="bb-chat-toggle-icon">💬</span>
          <span class="bb-chat-toggle-close">✕</span>
          <span class="bb-chat-status"></span>
          <span class="bb-chat-tooltip">Chat with us</span>
        </button>

        <!-- Chat Window -->
        <div class="bb-chat-window" id="bb-chat-window" role="dialog" aria-modal="true" aria-labelledby="bb-chat-header-name">
          <!-- Header -->
          <div class="bb-chat-header">
            <div class="bb-chat-avatar">${this.options.agentAvatar}</div>
            <div class="bb-chat-header-info">
              <h4 class="bb-chat-header-name" id="bb-chat-header-name">${this.options.agentName}</h4>
              <span class="bb-chat-header-status">Online now</span>
            </div>
            <div class="bb-chat-header-actions">
              <button class="bb-chat-header-btn" aria-label="Clear chat" title="Clear chat" id="bb-chat-clear">🗑️</button>
              <button class="bb-chat-header-btn" aria-label="Close chat" title="Close chat" id="bb-chat-close">✕</button>
            </div>
          </div>

          <!-- Messages Container -->
          <div class="bb-chat-messages" id="bb-chat-messages" role="log" aria-live="polite" aria-relevant="additions">
            <!-- Welcome Section -->
            <div class="bb-chat-welcome">
              <h4>Welcome to BuildBridge! 🏗️</h4>
              <p>We typically reply within minutes during business hours (8am - 6pm SAST).</p>
              <div class="bb-chat-quick-actions">
                ${this.options.quickActions.map(action => 
                  `<button class="bb-chat-quick-btn" data-action="${action.value}">${action.label}</button>`
                ).join('')}
              </div>
            </div>
          </div>

          <!-- Typing Indicator (hidden by default) -->
          <div class="bb-chat-typing" id="bb-chat-typing" style="display: none;">
            <div class="bb-chat-typing-avatar">${this.options.agentAvatar}</div>
            <div class="bb-chat-typing-dots">
              <span class="bb-chat-typing-dot"></span>
              <span class="bb-chat-typing-dot"></span>
              <span class="bb-chat-typing-dot"></span>
            </div>
          </div>

          <!-- Input Area -->
          <div class="bb-chat-input-area">
            <div class="bb-chat-input-wrapper">
              <textarea 
                class="bb-chat-input" 
                id="bb-chat-input" 
                placeholder="Type your message..."
                rows="1"
                aria-label="Message"
              ></textarea>
              <button class="bb-chat-send-btn" id="bb-chat-send" aria-label="Send message" disabled>
                ➤
              </button>
            </div>
            <div class="bb-chat-input-actions">
              <button class="bb-chat-action-btn" id="bb-chat-attachment">
                📎 Attach
              </button>
              <button class="bb-chat-action-btn" id="bb-chat-emoji">
                😊 Emoji
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.widget = widget;
      this.messagesContainer = widget.querySelector('#bb-chat-messages');
      this.typingIndicator = widget.querySelector('#bb-chat-typing');
      this.input = widget.querySelector('#bb-chat-input');
      this.sendBtn = widget.querySelector('#bb-chat-send');
      this.toggleBtn = widget.querySelector('.bb-chat-toggle');
    }

    attachEvents() {
      // Toggle chat
      this.toggleBtn.addEventListener('click', () => this.toggle());

      // Close button
      this.widget.querySelector('#bb-chat-close').addEventListener('click', () => this.close());

      // Clear chat
      this.widget.querySelector('#bb-chat-clear').addEventListener('click', () => this.clearChat());

      // Send message
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.input.addEventListener('input', () => {
        this.sendBtn.disabled = !this.input.value.trim();
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
      });

      // Quick action buttons
      this.widget.querySelectorAll('.bb-chat-quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          this.handleQuickAction(action);
        });
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.widget.contains(e.target)) {
          this.close();
        }
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.widget.classList.add('open');
      this.toggleBtn.classList.add('active');
      this.toggleBtn.setAttribute('aria-expanded', 'true');
      this.input.focus();
      
      // Scroll to bottom
      this.scrollToBottom();
      
      // Store state
      localStorage.setItem('bb-chat-open', 'true');
    }

    close() {
      this.isOpen = false;
      this.widget.classList.remove('open');
      this.toggleBtn.classList.remove('active');
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      localStorage.setItem('bb-chat-open', 'false');
    }

    sendMessage() {
      const text = this.input.value.trim();
      if (!text) return;

      // Add user message
      this.addMessage(text, 'user');
      this.input.value = '';
      this.input.style.height = 'auto';
      this.sendBtn.disabled = true;

      // Simulate agent response
      this.simulateResponse(text);
    }

    addMessage(text, type = 'agent') {
      const messageId = 'msg-' + Date.now();
      const time = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      const messageEl = document.createElement('div');
      messageEl.className = `bb-chat-message ${type}`;
      messageEl.id = messageId;
      messageEl.innerHTML = `
        <div class="bb-chat-message-bubble">${this.escapeHtml(text)}</div>
        <div class="bb-chat-message-time">
          ${time}
          ${type === 'user' ? '<span class="bb-chat-message-status">✓</span>' : ''}
        </div>
      `;

      this.messagesContainer.appendChild(messageEl);
      this.scrollToBottom();

      // Store message
      this.messages.push({ id: messageId, text, type, time });
      this.saveMessages();

      // Mark as read after delay
      if (type === 'user') {
        setTimeout(() => {
          const status = messageEl.querySelector('.bb-chat-message-status');
          if (status) {
            status.textContent = '✓✓';
            status.classList.add('read');
          }
        }, 1000);
      }

      // Play sound
      if (this.options.soundEnabled && type === 'agent' && this.isOpen) {
        this.playMessageSound();
      }
    }

    showTypingAndSend(message, delay = null) {
      if (!this.options.showTypingIndicator) {
        this.addMessage(message, 'agent');
        return;
      }

      // Show typing indicator
      this.typingIndicator.style.display = 'flex';
      this.scrollToBottom();

      // Hide after delay and send message
      setTimeout(() => {
        this.typingIndicator.style.display = 'none';
        this.addMessage(message, 'agent');
      }, delay || this.options.typingDelay);
    }

    simulateResponse(userText) {
      const lowerText = userText.toLowerCase();
      let response = '';
      let delay = 1500;

      // Simple response logic
      if (lowerText.includes('quote') || lowerText.includes('price') || lowerText.includes('cost')) {
        response = "I'd be happy to help you get a quote! To provide an accurate estimate, could you tell me more about your project? What's the scope - renovation, new build, or extension?";
      } else if (lowerText.includes('service')) {
        response = "We offer comprehensive construction management including project consultation, contractor matching, full project oversight, and quality assurance. Which service are you most interested in?";
      } else if (lowerText.includes('contact') || lowerText.includes('call') || lowerText.includes('phone')) {
        response = "You can reach us at +27 66 120 0064 or email info@buildbridge.co.za. We're also available on WhatsApp for quick responses. Would you like us to call you back?";
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        response = "Hello! 👋 Thanks for reaching out. How can we help with your construction project today?";
      } else if (lowerText.includes('project') || lowerText.includes('build')) {
        response = "That sounds exciting! We'd love to hear more about your project. What's the timeline you're working with, and where is the project located?";
      } else if (lowerText.includes('contractor')) {
        response = "We work with a vetted network of 50+ qualified contractors across South Africa. Each one is thoroughly checked for licenses, insurance, and quality of work. What type of contractor do you need?";
      } else {
        response = "Thank you for your message! One of our project managers will review this and get back to you shortly. In the meantime, is there anything else I can help you with?";
      }

      this.showTypingAndSend(response, delay);
    }

    handleQuickAction(action) {
      let message = '';
      let response = '';

      switch(action) {
        case 'quote':
          message = "I'd like to get a quote for my project";
          response = "Great choice! To provide an accurate quote, I'll need a few details. What's the type of project - residential, commercial, or industrial? And what's your estimated budget range?";
          break;
        case 'services':
          message = "Tell me about your services";
          response = "We provide end-to-end construction management: initial consultation, contractor matching, project oversight, quality control, and final handover. You can see all our services at buildbridge.co.za/services";
          break;
        case 'contact':
          message = "How can I contact you?";
          response = "You can reach us multiple ways:\n• WhatsApp: +27 66 120 0064\n• Phone: +27 66 120 0064\n• Email: info@buildbridge.co.za\n• Website: buildbridge.co.za/contact\n\nWhat works best for you?";
          break;
      }

      this.addMessage(message, 'user');
      this.showTypingAndSend(response, 1200);
    }

    clearChat() {
      if (confirm('Clear all chat messages?')) {
        this.messages = [];
        localStorage.removeItem('bb-chat-messages');
        
        // Clear messages container except welcome
        const messages = this.messagesContainer.querySelectorAll('.bb-chat-message, .bb-chat-date-divider');
        messages.forEach(el => el.remove());
      }
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML.replace(/\n/g, '<br>');
    }

    playMessageSound() {
      // Simple beep using Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        // Silent fail
      }
    }

    saveMessages() {
      try {
        localStorage.setItem('bb-chat-messages', JSON.stringify(this.messages.slice(-50)));
      } catch (e) {
        console.warn('Could not save chat messages');
      }
    }

    loadStoredMessages() {
      try {
        const stored = localStorage.getItem('bb-chat-messages');
        if (stored) {
          this.messages = JSON.parse(stored);
          this.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `bb-chat-message ${msg.type}`;
            messageEl.id = msg.id;
            messageEl.innerHTML = `
              <div class="bb-chat-message-bubble">${this.escapeHtml(msg.text)}</div>
              <div class="bb-chat-message-time">${msg.time}</div>
            `;
            this.messagesContainer.appendChild(messageEl);
          });
          
          // Add date divider
          if (this.messages.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'bb-chat-date-divider';
            divider.innerHTML = '<span>Today</span>';
            this.messagesContainer.appendChild(divider);
          }
        }
      } catch (e) {
        console.warn('Could not load chat messages');
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.buildBridgeChat = new BuildBridgeChat();
    });
  } else {
    window.buildBridgeChat = new BuildBridgeChat();
  }

  // Expose for manual initialization
  window.BuildBridgeChat = BuildBridgeChat;

})();
