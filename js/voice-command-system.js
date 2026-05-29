/**
 * Voice Command & Search System - v82.3
 * Fortune 500 Speech Recognition Interface
 * Features: Voice navigation, voice search, command execution
 */

class VoiceCommandSystem {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.commands = this.buildCommandMap();
    this.synth = window.speechSynthesis;
    this.voiceEnabled = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    this.init();
  }

  init() {
    if (this.voiceEnabled) {
      this.initializeSpeechRecognition();
    }
    this.createOverlay();
    this.createTriggerButton();
    this.attachKeyboardShortcut();
    
    console.log('🎤 BuildBridge v82.3: Voice Command System', this.voiceEnabled ? 'initialized' : '(fallback mode - voice not supported)');
  }

  initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => this.onListeningStart();
    this.recognition.onresult = (e) => this.onResult(e);
    this.recognition.onerror = (e) => this.onError(e);
    this.recognition.onend = () => this.onListeningEnd();
  }

  buildCommandMap() {
    return {
      // Navigation commands
      'go to home': () => this.navigate('index.html'),
      'go home': () => this.navigate('index.html'),
      'home page': () => this.navigate('index.html'),
      'go to about': () => this.navigate('about.html'),
      'about us': () => this.navigate('about.html'),
      'go to services': () => this.navigate('services.html'),
      'our services': () => this.navigate('services.html'),
      'go to projects': () => this.navigate('projects.html'),
      'view projects': () => this.navigate('projects.html'),
      'go to contact': () => this.navigate('contact.html'),
      'contact us': () => this.navigate('contact.html'),
      
      // Search commands
      'search for': (query) => this.search(query),
      'find': (query) => this.search(query),
      'look for': (query) => this.search(query),
      
      // Action commands
      'calculate cost': () => this.navigate('index.html#calculator'),
      'open calculator': () => this.navigate('index.html#calculator'),
      'cost estimator': () => this.navigate('index.html#calculator'),
      'get a quote': () => this.navigate('contact.html'),
      'request quote': () => this.navigate('contact.html'),
      'chat on whatsapp': () => window.open('https://wa.me/27661200064', '_blank'),
      'open whatsapp': () => window.open('https://wa.me/27661200064', '_blank'),
      'call us': () => window.location.href = 'tel:+27661200064',
      'send email': () => window.location.href = 'mailto:info@buildbridge.co.za',
      
      // Feature commands
      'show analytics': () => this.triggerAnalytics(),
      'open dashboard': () => this.triggerAnalytics(),
      'toggle dark mode': () => this.toggleTheme(),
      'change theme': () => this.toggleTheme(),
      'scroll to top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      'go to bottom': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
      'refresh page': () => window.location.reload(),
      
      // Help commands
      'help': () => this.showHelp(),
      'what can I say': () => this.showHelp(),
      'voice commands': () => this.showHelp(),
      
      // Close commands
      'close': () => this.closeOverlay(),
      'exit': () => this.closeOverlay(),
      'stop listening': () => this.stopListening(),
      'cancel': () => this.closeOverlay()
    };
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'voice-command-overlay';
    
    if (!this.voiceEnabled) {
      this.overlay.innerHTML = this.getUnsupportedHTML();
    } else {
      this.overlay.innerHTML = this.getOverlayHTML();
    }
    
    document.body.appendChild(this.overlay);
    
    if (this.voiceEnabled) {
      this.attachOverlayEvents();
    }
  }

  getOverlayHTML() {
    return `
      <button class="voice-close-button" aria-label="Close voice search">✕</button>
      <div class="voice-command-container">
        <div class="voice-wave-container">
          <div class="voice-wave-circle"></div>
          <div class="voice-wave-circle"></div>
          <div class="voice-wave-circle"></div>
          <button class="voice-mic-button">🎤</button>
        </div>
        <div class="voice-status">Tap microphone to speak</div>
        <div class="voice-hint">Try saying "go to projects" or "calculate cost"</div>
        <div class="voice-transcript"></div>
        <div class="voice-confidence">
          <span class="voice-confidence-label">Confidence</span>
          <div class="voice-confidence-bar">
            <div class="voice-confidence-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="voice-processing">
          <div class="voice-processing-dots">
            <div class="voice-processing-dot"></div>
            <div class="voice-processing-dot"></div>
            <div class="voice-processing-dot"></div>
          </div>
          <span class="voice-processing-text">Processing command...</span>
        </div>
        <div class="voice-commands-help">
          <div class="voice-command-item">
            <div class="voice-command-icon">🏠</div>
            <span class="voice-command-text"><strong>"Go to home"</strong><br>Navigate pages</span>
          </div>
          <div class="voice-command-item">
            <div class="voice-command-icon">🔍</div>
            <span class="voice-command-text"><strong>"Search for..."</strong><br>Find content</span>
          </div>
          <div class="voice-command-item">
            <div class="voice-command-icon">🧮</div>
            <span class="voice-command-text"><strong>"Calculate cost"</strong><br>Open tools</span>
          </div>
          <div class="voice-command-item">
            <div class="voice-command-icon">💬</div>
            <span class="voice-command-text"><strong>"Chat on WhatsApp"</strong><br>Quick actions</span>
          </div>
        </div>
      </div>
    `;
  }

  getUnsupportedHTML() {
    return `
      <button class="voice-close-button" aria-label="Close">✕</button>
      <div class="voice-command-container">
        <div class="voice-unsupported">
          <div class="voice-unsupported-icon">🔇</div>
          <h4>Voice Not Supported</h4>
          <p>Your browser doesn't support voice recognition.<br>Try using Chrome, Edge, or Safari.</p>
        </div>
      </div>
    `;
  }

  attachOverlayEvents() {
    // Close button
    this.overlay.querySelector('.voice-close-button').addEventListener('click', () => this.closeOverlay());
    
    // Mic button
    const micBtn = this.overlay.querySelector('.voice-mic-button');
    micBtn.addEventListener('click', () => this.toggleListening());
    
    // Click outside
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.closeOverlay();
    });
  }

  createTriggerButton() {
    if (!this.voiceEnabled) return;
    
    this.triggerBtn = document.createElement('button');
    this.triggerBtn.className = 'voice-trigger-button';
    this.triggerBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
      <span class="voice-trigger-button-tooltip">Voice ⌘ShiftU</span>
    `;
    this.triggerBtn.addEventListener('click', () => this.openOverlay());
    document.body.appendChild(this.triggerBtn);
  }

  attachKeyboardShortcut() {
    if (!this.voiceEnabled) return;
    
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        this.toggleOverlay();
      }
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.closeOverlay();
      }
    });
  }

  openOverlay() {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Start listening automatically if voice is enabled
    if (this.voiceEnabled && !this.isListening) {
      setTimeout(() => this.startListening(), 500);
    }
  }

  closeOverlay() {
    this.stopListening();
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.resetTranscript();
  }

  toggleOverlay() {
    if (this.overlay.classList.contains('active')) {
      this.closeOverlay();
    } else {
      this.openOverlay();
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) return;
    
    try {
      this.recognition.start();
    } catch (e) {
      console.log('Recognition already started');
    }
  }

  stopListening() {
    if (!this.recognition) return;
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.log('Recognition already stopped');
    }
  }

  onListeningStart() {
    this.isListening = true;
    const micBtn = this.overlay.querySelector('.voice-mic-button');
    const status = this.overlay.querySelector('.voice-status');
    
    if (micBtn) micBtn.classList.add('listening');
    if (status) status.textContent = 'Listening...';
  }

  onResult(event) {
    this.interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const confidence = event.results[i][0].confidence;
      
      if (event.results[i].isFinal) {
        this.transcript += transcript;
        this.updateTranscript(this.transcript, false);
        this.updateConfidence(confidence);
        this.processCommand(this.transcript.toLowerCase().trim());
      } else {
        this.interimTranscript += transcript;
        this.updateTranscript(this.interimTranscript, true);
      }
    }
  }

  onError(event) {
    console.error('Speech recognition error:', event.error);
    
    const status = this.overlay.querySelector('.voice-status');
    if (status) {
      switch(event.error) {
        case 'no-speech':
          status.textContent = 'No speech detected. Try again.';
          break;
        case 'audio-capture':
          status.textContent = 'Microphone not available.';
          break;
        case 'not-allowed':
          status.textContent = 'Microphone access denied.';
          break;
        default:
          status.textContent = 'An error occurred. Please try again.';
      }
    }
    
    this.isListening = false;
    const micBtn = this.overlay.querySelector('.voice-mic-button');
    if (micBtn) micBtn.classList.remove('listening');
  }

  onListeningEnd() {
    this.isListening = false;
    const micBtn = this.overlay.querySelector('.voice-mic-button');
    const status = this.overlay.querySelector('.voice-status');
    
    if (micBtn) micBtn.classList.remove('listening');
    if (status) status.textContent = 'Tap microphone to speak';
  }

  updateTranscript(text, isInterim) {
    const transcriptEl = this.overlay.querySelector('.voice-transcript');
    if (transcriptEl) {
      transcriptEl.textContent = text;
      transcriptEl.classList.toggle('interim', isInterim);
    }
  }

  updateConfidence(confidence) {
    const fill = this.overlay.querySelector('.voice-confidence-fill');
    if (fill) {
      fill.style.width = `${confidence * 100}%`;
    }
  }

  resetTranscript() {
    this.transcript = '';
    this.interimTranscript = '';
    this.updateTranscript('', false);
    this.updateConfidence(0);
  }

  processCommand(command) {
    this.showProcessing();
    
    // Find matching command
    let matchedCommand = null;
    let matchedParam = '';
    
    for (const [key, action] of Object.entries(this.commands)) {
      if (command.includes(key)) {
        matchedCommand = action;
        // Extract parameter if command has dynamic part
        if (key.includes('search for') || key.includes('find') || key.includes('look for')) {
          matchedParam = command.replace(key, '').trim();
        }
        break;
      }
    }
    
    // Execute after delay for UX
    setTimeout(() => {
      this.hideProcessing();
      
      if (matchedCommand) {
        matchedCommand(matchedParam);
        this.showFeedback('success', `Executed: "${command}"`);
      } else {
        this.showFeedback('error', `Didn't recognize: "${command}"`);
        this.speak("Sorry, I didn't understand that command.");
      }
      
      this.resetTranscript();
    }, 800);
  }

  showProcessing() {
    const processing = this.overlay.querySelector('.voice-processing');
    if (processing) processing.classList.add('active');
  }

  hideProcessing() {
    const processing = this.overlay.querySelector('.voice-processing');
    if (processing) processing.classList.remove('active');
  }

  showFeedback(type, message) {
    // Remove existing toast
    const existing = document.querySelector('.voice-feedback-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `voice-feedback-toast ${type}`;
    toast.innerHTML = `
      <div class="voice-feedback-icon">${type === 'success' ? '✓' : '✕'}</div>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // Command Actions
  navigate(url) {
    this.closeOverlay();
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  search(query) {
    if (!query) {
      this.showFeedback('error', 'Please say what to search for');
      return;
    }
    
    this.closeOverlay();
    this.showFeedback('success', `Searching for "${query}"`);
    
    setTimeout(() => {
      // Trigger AI search if available
      if (window.BuildBridgeSearch) {
        window.BuildBridgeSearch.open();
        window.BuildBridgeSearch.input.value = query;
        window.BuildBridgeSearch.performSearch(query);
      }
    }, 300);
  }

  triggerAnalytics() {
    this.closeOverlay();
    
    setTimeout(() => {
      if (window.BuildBridgeAnalytics) {
        window.BuildBridgeAnalytics.show();
      }
    }, 300);
  }

  toggleTheme() {
    this.showFeedback('success', 'Theme toggled');
    // Trigger theme toggle if available
    if (window.toggleTheme) {
      window.toggleTheme();
    }
  }

  showHelp() {
    const container = this.overlay.querySelector('.voice-commands-help');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  }

  speak(text) {
    if (!this.synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    this.synth.speak(utterance);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.BuildBridgeVoice = new VoiceCommandSystem();
  });
} else {
  window.BuildBridgeVoice = new VoiceCommandSystem();
}

console.log('🎤 BuildBridge v82.3: Voice Command System loaded - Fortune 500 speech recognition interface');
