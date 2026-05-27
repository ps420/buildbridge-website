/**
 * VOICE NAVIGATION SYSTEM v21.0
 * Fortune 500 Voice Control Interface
 */

(function() {
  'use strict';
  
  const VoiceNavigation = {
    recognition: null,
    isListening: false,
    isInitialized: false,
    commands: new Map(),
    
    // Voice UI elements
    ui: null,
    indicator: null,
    
    /**
     * Initialize voice navigation
     */
    init() {
      // Check for SpeechRecognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Voice navigation not supported in this browser');
        return;
      }
      
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.setupRecognition();
      this.createUI();
      this.registerDefaultCommands();
      this.setupHotkey();
      
      this.isInitialized = true;
      console.log('🎤 Voice Navigation initialized. Press "V" to activate.');
    },
    
    /**
     * Setup speech recognition handlers
     */
    setupRecognition() {
      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUI('listening');
        console.log('Voice navigation active');
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.updateUI('idle');
        
        // Auto-restart if still enabled
        if (this.isInitialized && !this.manualStop) {
          setTimeout(() => this.start(), 500);
        }
      };
      
      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        const isFinal = event.results[last].isFinal;
        
        this.updateTranscript(transcript, isFinal);
        
        if (isFinal) {
          this.processCommand(transcript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        this.updateUI('error');
        
        if (event.error === 'not-allowed') {
          this.showPermissionError();
        }
      };
    },
    
    /**
     * Create voice UI
     */
    createUI() {
      // Main container
      this.ui = document.createElement('div');
      this.ui.className = 'voice-nav-ui';
      this.ui.innerHTML = `
        <div class="voice-nav-backdrop"></div>
        <div class="voice-nav-modal">
          <button class="voice-nav-close" aria-label="Close voice navigation">×</button>
          <div class="voice-nav-content">
            <div class="voice-nav-icon">
              <div class="voice-waves">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="voice-mic">🎤</div>
            </div>
            <h3>Voice Navigation</h3>
            <p class="voice-transcript">Say a command like "Go to services" or "Scroll down"</p>
            <div class="voice-suggestions">
              <span class="voice-chip">"Go to contact"</span>
              <span class="voice-chip">"Scroll to projects"</span>
              <span class="voice-chip">"Back to top"</span>
              <span class="voice-chip">"Go home"</span>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.ui);
      
      // Add event listeners
      this.ui.querySelector('.voice-nav-backdrop').addEventListener('click', () => this.stop());
      this.ui.querySelector('.voice-nav-close').addEventListener('click', () => this.stop());
      
      // Compact indicator
      this.indicator = document.createElement('button');
      this.indicator.className = 'voice-nav-indicator';
      this.indicator.innerHTML = '🎤';
      this.indicator.setAttribute('aria-label', 'Activate voice navigation (press V)');
      this.indicator.title = 'Voice Navigation (V)';
      this.indicator.addEventListener('click', () => this.toggle());
      
      document.body.appendChild(this.indicator);
    },
    
    /**
     * Register default voice commands
     */
    registerDefaultCommands() {
      // Navigation commands
      this.register('go to home|home page|main page', () => this.navigate('index.html'));
      this.register('go to about|about us|about page', () => this.navigate('about.html'));
      this.register('go to services|our services|services page', () => this.navigate('services.html'));
      this.register('go to projects|our projects|portfolio', () => this.navigate('projects.html'));
      this.register('go to contact|contact us|reach us', () => this.navigate('contact.html'));
      
      // Scroll commands
      this.register('scroll up|scroll top|back to top|top of page', () => this.scrollTo(0));
      this.register('scroll down|page down', () => this.scrollBy(window.innerHeight * 0.8));
      this.register('scroll to (services|projects|contact|testimonials|faq)', (match) => {
        const sectionId = match;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          this.showFeedback(`Scrolling to ${sectionId}`);
        }
      });
      
      // WhatsApp
      this.register('open whatsapp|chat on whatsapp|message us', () => {
        window.open('https://wa.me/27661200064', '_blank');
        this.showFeedback('Opening WhatsApp');
      });
      
      // Call
      this.register('call us|phone number|dial number', () => {
        window.location.href = 'tel:+27661200064';
        this.showFeedback('Dialing...');
      });
      
      // Theme
      this.register('dark mode|enable dark|switch to dark', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        this.showFeedback('Dark mode enabled');
      });
      
      this.register('light mode|enable light|switch to light', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        this.showFeedback('Light mode enabled');
      });
      
      // Help
      this.register('help|what can i say|commands', () => this.showHelp());
      
      // Close/Stop
      this.register('stop listening|close voice|exit voice', () => this.stop());
    },
    
    /**
     * Register a voice command
     */
    register(pattern, callback) {
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      this.commands.set(regex, callback);
    },
    
    /**
     * Process voice command
     */
    processCommand(transcript) {
      let matched = false;
      
      for (const [regex, callback] of this.commands) {
        const match = transcript.match(regex);
        if (match) {
          callback(match[1]);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Try fuzzy matching for navigation
        if (transcript.includes('scroll') || transcript.includes('go')) {
          this.handleFuzzyNavigation(transcript);
        } else {
          this.showFeedback('Command not recognized. Try "help" for options.');
        }
      }
    },
    
    /**
     * Handle fuzzy navigation
     */
    handleFuzzyNavigation(transcript) {
      const sections = ['services', 'projects', 'contact', 'testimonials', 
                       'faq', 'about', 'calculator', 'process'];
      
      for (const section of sections) {
        if (transcript.includes(section)) {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.showFeedback(`Scrolling to ${section}`);
            return;
          }
        }
      }
    },
    
    /**
     * Navigate to page
     */
    navigate(url) {
      this.showFeedback(`Navigating to ${url}...`);
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    },
    
    /**
     * Scroll utilities
     */
    scrollTo(position) {
      window.scrollTo({ top: position, behavior: 'smooth' });
      this.showFeedback('Scrolling to top');
    },
    
    scrollBy(amount) {
      window.scrollBy({ top: amount, behavior: 'smooth' });
      this.showFeedback('Scrolling down');
    },
    
    /**
     * Update UI state
     */
    updateUI(state) {
      if (!this.ui) return;
      
      this.ui.classList.remove('listening', 'processing', 'error');
      
      if (state === 'listening') {
        this.ui.classList.add('listening', 'active');
        this.indicator.classList.add('active');
      } else if (state === 'processing') {
        this.ui.classList.add('processing');
      } else if (state === 'error') {
        this.ui.classList.add('error');
      } else {
        this.ui.classList.remove('active');
        this.indicator.classList.remove('active');
      }
    },
    
    /**
     * Update transcript display
     */
    updateTranscript(text, isFinal) {
      const transcriptEl = this.ui.querySelector('.voice-transcript');
      if (transcriptEl) {
        transcriptEl.textContent = text;
        transcriptEl.classList.toggle('final', isFinal);
      }
    },
    
    /**
     * Show feedback toast
     */
    showFeedback(message) {
      if (window.Toast) {
        Toast.info(message, { duration: 3000 });
      }
      this.updateTranscript(message, true);
      
      setTimeout(() => {
        this.updateTranscript('Say a command or "help" for options', false);
      }, 3000);
    },
    
    /**
     * Show help modal
     */
    showHelp() {
      const helpHTML = `
        <div class="voice-help-modal">
          <h4>Voice Commands</h4>
          <div class="voice-help-grid">
            <div>
              <h5>Navigation</h5>
              <ul>
                <li>"Go to [page]"</li>
                <li>"Scroll to [section]"</li>
                <li>"Back to top"</li>
              </ul>
            </div>
            <div>
              <h5>Actions</h5>
              <ul>
                <li>"Open WhatsApp"</li>
                <li>"Call us"</li>
                <li>"Dark/Light mode"</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      
      if (window.Toast) {
        Toast.info(helpHTML, { 
          duration: 8000,
          isHTML: true
        });
      }
    },
    
    /**
     * Show permission error
     */
    showPermissionError() {
      if (window.Toast) {
        Toast.error('Please allow microphone access to use voice navigation', {
          duration: 5000
        });
      }
    },
    
    /**
     * Setup keyboard hotkey
     */
    setupHotkey() {
      document.addEventListener('keydown', (e) => {
        // Press 'V' to toggle voice navigation
        if (e.key === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Don't trigger if typing in an input
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
          }
          e.preventDefault();
          this.toggle();
        }
        
        // Press Escape to stop
        if (e.key === 'Escape' && this.isListening) {
          this.stop();
        }
      });
    },
    
    /**
     * Toggle voice navigation
     */
    toggle() {
      if (this.isListening) {
        this.stop();
      } else {
        this.start();
      }
    },
    
    /**
     * Start voice navigation
     */
    start() {
      if (!this.isInitialized) {
        this.init();
      }
      
      this.manualStop = false;
      
      try {
        this.recognition.start();
        this.ui.classList.add('active');
      } catch (e) {
        console.error('Failed to start voice recognition:', e);
      }
    },
    
    /**
     * Stop voice navigation
     */
    stop() {
      this.manualStop = true;
      
      if (this.recognition) {
        this.recognition.stop();
      }
      
      this.ui.classList.remove('active');
      this.indicator.classList.remove('active');
    },
    
    /**
     * Destroy voice navigation
     */
    destroy() {
      this.stop();
      this.isInitialized = false;
      
      if (this.ui) {
        this.ui.remove();
      }
      if (this.indicator) {
        this.indicator.remove();
      }
      
      this.recognition = null;
    }
  };
  
  // Expose to global scope
  window.VoiceNavigation = VoiceNavigation;
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VoiceNavigation.init());
  } else {
    VoiceNavigation.init();
  }
})();
