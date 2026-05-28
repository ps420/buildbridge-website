/**
 * Voice Navigation System
 * Fortune 500 Hands-Free Site Navigation
 * Version: v53.1
 */

class VoiceNavigationSystem {
  constructor(options = {}) {
    this.recognition = null;
    this.isListening = false;
    this.isInitialized = false;
    this.transcript = '';
    this.confidence = 0;
    this.commands = new Map();
    this.commandHistory = [];
    this.maxHistory = 50;
    
    // Configuration
    this.config = {
      lang: options.lang || 'en-US',
      continuous: options.continuous !== false,
      interimResults: options.interimResults !== false,
      maxAlternatives: options.maxAlternatives || 1,
      autoStart: options.autoStart || false,
      wakeWord: options.wakeWord || 'Hey BuildBridge',
      requireWakeWord: options.requireWakeWord !== false,
      silenceTimeout: options.silenceTimeout || 5000,
      visualFeedback: options.visualFeedback !== false,
      audioFeedback: options.audioFeedback !== false,
      hapticFeedback: options.hapticFeedback || false
    };
    
    // Navigation commands
    this.navigationCommands = {
      'home': '/index.html',
      'homepage': '/index.html',
      'main page': '/index.html',
      'about': '/about.html',
      'about us': '/about.html',
      'services': '/services.html',
      'our services': '/services.html',
      'what we do': '/services.html',
      'projects': '/projects.html',
      'our projects': '/projects.html',
      'portfolio': '/projects.html',
      'work': '/projects.html',
      'gallery': '/projects.html',
      'contact': '/contact.html',
      'contact us': '/contact.html',
      'get in touch': '/contact.html',
      'reach out': '/contact.html',
      'cost estimator': '/index.html#cost-calculator',
      'calculator': '/index.html#cost-calculator',
      'estimate': '/index.html#cost-calculator',
      'pricing': '/index.html#cost-calculator',
      'quote': '/index.html#cost-calculator',
      'faq': '/index.html#faq',
      'questions': '/index.html#faq',
      'help': '/index.html#faq',
      'testimonials': '/index.html#testimonials',
      'reviews': '/index.html#testimonials',
      'team': '/index.html#team',
      'our team': '/index.html#team',
      'process': '/index.html#process',
      'how we work': '/index.html#process',
      'virtual tour': '/index.html#virtual-tour'
    };
    
    // Action commands
    this.actionCommands = {
      'scroll down': () => this.scrollPage('down'),
      'scroll up': () => this.scrollPage('up'),
      'scroll to top': () => this.scrollToTop(),
      'go to top': () => this.scrollToTop(),
      'top of page': () => this.scrollToTop(),
      'scroll to bottom': () => this.scrollToBottom(),
      'go to bottom': () => this.scrollToBottom(),
      'bottom of page': () => this.scrollToBottom(),
      'back to top': () => this.scrollToTop(),
      'open menu': () => this.toggleMenu(true),
      'close menu': () => this.toggleMenu(false),
      'show menu': () => this.toggleMenu(true),
      'hide menu': () => this.toggleMenu(false),
      'toggle menu': () => this.toggleMenu(),
      'open search': () => this.openSearch(),
      'search': () => this.openSearch(),
      'find': () => this.openSearch(),
      'close search': () => this.closeSearch(),
      'next': () => this.navigateCarousel('next'),
      'previous': () => this.navigateCarousel('prev'),
      'back': () => window.history.back(),
      'refresh': () => window.location.reload(),
      'reload': () => window.location.reload(),
      'stop listening': () => this.stop(),
      'start listening': () => this.start(),
      'help me': () => this.showHelp(),
      'what can you do': () => this.showHelp(),
      'commands': () => this.showHelp()
    };
    
    this.init();
  }
  
  init() {
    if (!this.checkSupport()) {
      console.warn('Voice Navigation: Web Speech API not supported');
      this.showUnsupportedMessage();
      return;
    }
    
    this.setupRecognition();
    this.createUI();
    this.bindEvents();
    
    this.isInitialized = true;
    
    if (this.config.autoStart) {
      this.start();
    }
    
    console.log('Voice Navigation: Initialized');
  }
  
  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = this.config.lang;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    
    this.recognition.onstart = () => this.handleStart();
    this.recognition.onend = () => this.handleEnd();
    this.recognition.onresult = (e) => this.handleResult(e);
    this.recognition.onerror = (e) => this.handleError(e);
    
    // Silence detection
    this.silenceTimer = null;
  }
  
  createUI() {
    if (!this.config.visualFeedback) return;
    
    // Main voice nav container
    this.ui = document.createElement('div');
    this.ui.className = 'voice-nav';
    this.ui.setAttribute('role', 'region');
    this.ui.setAttribute('aria-label', 'Voice Navigation');
    this.ui.innerHTML = `
      <button class="voice-nav__toggle" aria-label="Start voice navigation" title="Voice Navigation (Click or say 'Hey BuildBridge')">
        <span class="voice-nav__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </span>
        <span class="voice-nav__pulse"></span>
        <span class="voice-nav__ripple"></span>
      </button>
      
      <div class="voice-nav__panel" aria-hidden="true">
        <div class="voice-nav__header">
          <span class="voice-nav__status">Tap microphone to start</span>
          <button class="voice-nav__close" aria-label="Close voice navigation">✕</button>
        </div>
        
        <div class="voice-nav__visualizer">
          <div class="voice-nav__wave"></div>
          <div class="voice-nav__wave"></div>
          <div class="voice-nav__wave"></div>
          <div class="voice-nav__wave"></div>
          <div class="voice-nav__wave"></div>
        </div>
        
        <div class="voice-nav__transcript">
          <span class="voice-nav__ interim"></span>
          <span class="voice-nav__final"></span>
        </div>
        
        <div class="voice-nav__commands">
          <p>Try saying:</p>
          <div class="voice-nav__suggestions">
            <span class="voice-nav__suggestion">"Go to services"</span>
            <span class="voice-nav__suggestion">"Scroll down"</span>
            <span class="voice-nav__suggestion">"Open contact"</span>
            <span class="voice-nav__suggestion">"Show help"</span>
          </div>
        </div>
        
        <div class="voice-nav__feedback" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
    
    document.body.appendChild(this.ui);
    
    // Cache elements
    this.toggleBtn = this.ui.querySelector('.voice-nav__toggle');
    this.panel = this.ui.querySelector('.voice-nav__panel');
    this.closeBtn = this.ui.querySelector('.voice-nav__close');
    this.statusEl = this.ui.querySelector('.voice-nav__status');
    this.transcriptInterim = this.ui.querySelector('.voice-nav__interim');
    this.transcriptFinal = this.ui.querySelector('.voice-nav__final');
    this.feedbackEl = this.ui.querySelector('.voice-nav__feedback');
    this.waves = this.ui.querySelectorAll('.voice-nav__wave');
  }
  
  bindEvents() {
    if (!this.ui) return;
    
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.closePanel());
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' && e.altKey) {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Handle wake word via keyboard for testing
    document.addEventListener('keydown', (e) => {
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        this.handleWakeWord();
      }
    });
  }
  
  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  start() {
    if (!this.isInitialized || this.isListening) return;
    
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Voice Navigation: Failed to start', e);
      this.showFeedback('Could not start voice recognition. Please try again.');
    }
  }
  
  stop() {
    if (!this.isInitialized || !this.isListening) return;
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Voice Navigation: Failed to stop', e);
    }
  }
  
  handleStart() {
    this.isListening = true;
    this.updateUI('listening');
    this.showFeedback('Listening... Say a command');
    this.animateWaves(true);
    
    if (this.config.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Clear silence timer
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.isListening) {
        this.showFeedback('No command detected. Stopping...');
        setTimeout(() => this.stop(), 2000);
      }
    }, this.config.silenceTimeout);
  }
  
  handleEnd() {
    this.isListening = false;
    this.updateUI('idle');
    this.animateWaves(false);
    this.clearSilenceTimer();
    
    // Auto-restart if continuous mode
    if (this.config.continuous && this.panel.classList.contains('active')) {
      setTimeout(() => this.start(), 100);
    }
  }
  
  handleResult(event) {
    this.clearSilenceTimer();
    
    const results = event.results;
    const lastResult = results[results.length - 1];
    
    if (lastResult.isFinal) {
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      this.confidence = lastResult[0].confidence;
      
      this.transcriptFinal.textContent = transcript;
      this.transcriptInterim.textContent = '';
      
      this.processCommand(transcript);
      this.addToHistory(transcript, true);
    } else {
      const interim = lastResult[0].transcript;
      this.transcriptInterim.textContent = interim;
      this.animateWaves(true, this.getVolumeFromTranscript(interim));
    }
  }
  
  handleError(event) {
    console.error('Voice Navigation Error:', event.error);
    
    const messages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'No microphone found. Please check your device.',
      'not-allowed': 'Microphone access denied. Please allow access in settings.',
      'network': 'Network error. Please check your connection.',
      'aborted': 'Voice recognition aborted.',
      'language-not-supported': 'Language not supported.'
    };
    
    this.showFeedback(messages[event.error] || 'An error occurred. Please try again.');
    this.updateUI('error');
  }
  
  processCommand(transcript) {
    // Check for wake word requirement
    if (this.config.requireWakeWord && !this.wakeWordDetected) {
      if (transcript.includes(this.config.wakeWord.toLowerCase())) {
        this.handleWakeWord();
        return;
      }
    }
    
    // Navigation commands
    for (const [command, target] of Object.entries(this.navigationCommands)) {
      if (transcript.includes(command)) {
        this.executeNavigation(command, target);
        return;
      }
    }
    
    // Action commands
    for (const [command, action] of Object.entries(this.actionCommands)) {
      if (transcript.includes(command)) {
        this.executeAction(command, action);
        return;
      }
    }
    
    // Check for partial matches
    const words = transcript.split(' ');
    for (const word of words) {
      if (this.navigationCommands[word]) {
        this.executeNavigation(word, this.navigationCommands[word]);
        return;
      }
    }
    
    this.showFeedback(`I heard: "${transcript}". Try saying "help me" for available commands.`);
  }
  
  handleWakeWord() {
    this.wakeWordDetected = true;
    this.showFeedback('Yes? I\'m listening. What would you like to do?');
    this.playSound('wake');
    
    // Reset wake word detection after 10 seconds
    setTimeout(() => {
      this.wakeWordDetected = false;
    }, 10000);
  }
  
  executeNavigation(command, target) {
    this.showFeedback(`Navigating to ${command}...`);
    this.playSound('success');
    
    setTimeout(() => {
      if (target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (target.startsWith('/')) {
        window.location.href = target;
      }
    }, 500);
    
    this.stop();
  }
  
  executeAction(command, action) {
    this.showFeedback(`Executing: ${command}`);
    this.playSound('success');
    action();
  }
  
  // Action implementations
  scrollPage(direction) {
    const scrollAmount = window.innerHeight * 0.8;
    window.scrollBy({
      top: direction === 'down' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  
  toggleMenu(show) {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.getElementById('navLinks');
    if (!menuBtn || !navLinks) return;
    
    const isOpen = navLinks.classList.contains('active');
    if (show === undefined || show !== isOpen) {
      menuBtn.click();
    }
  }
  
  openSearch() {
    // Trigger search if exists
    const searchInput = document.querySelector('.portfolio-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  closeSearch() {
    const searchInput = document.querySelector('.portfolio-search');
    if (searchInput) {
      searchInput.blur();
    }
  }
  
  navigateCarousel(direction) {
    const carousel = document.querySelector('.testimonial-carousel-3d');
    if (!carousel) return;
    
    const event = new CustomEvent('carouselNavigate', { detail: { direction } });
    carousel.dispatchEvent(event);
  }
  
  showHelp() {
    const commands = [
      '🏠 Navigation: "Home", "About", "Services", "Projects", "Contact"',
      '📜 Scrolling: "Scroll down", "Scroll up", "Go to top", "Go to bottom"',
      '🎛️ Actions: "Open menu", "Open search", "Back", "Refresh"',
      '❓ Help: "Help me", "What can you do"'
    ];
    
    this.showFeedback('Available commands:<br>' + commands.join('<br>'));
  }
  
  // UI updates
  updateUI(state) {
    if (!this.ui) return;
    
    this.ui.className = 'voice-nav voice-nav--' + state;
    
    const statusMessages = {
      'idle': 'Tap microphone to start',
      'listening': 'Listening...',
      'processing': 'Processing...',
      'error': 'Error occurred'
    };
    
    if (this.statusEl) {
      this.statusEl.textContent = statusMessages[state] || '';
    }
  }
  
  animateWaves(active, intensity = 0.5) {
    if (!this.waves) return;
    
    this.waves.forEach((wave, i) => {
      if (active) {
        const delay = i * 0.1;
        const scale = 1 + (intensity * 0.5) + (Math.random() * 0.3);
        wave.style.animation = `voiceWave 0.5s ease-in-out ${delay}s infinite`;
        wave.style.transform = `scaleY(${scale})`;
      } else {
        wave.style.animation = '';
        wave.style.transform = 'scaleY(1)';
      }
    });
  }
  
  getVolumeFromTranscript(transcript) {
    // Simple heuristic based on transcript length
    return Math.min(transcript.length / 50, 1);
  }
  
  showFeedback(message, duration = 3000) {
    if (!this.feedbackEl) return;
    
    this.feedbackEl.innerHTML = message;
    this.feedbackEl.classList.add('show');
    
    if (duration > 0) {
      setTimeout(() => {
        this.feedbackEl.classList.remove('show');
      }, duration);
    }
  }
  
  closePanel() {
    if (this.panel) {
      this.panel.classList.remove('active');
      this.panel.setAttribute('aria-hidden', 'true');
    }
    this.stop();
  }
  
  openPanel() {
    if (this.panel) {
      this.panel.classList.add('active');
      this.panel.setAttribute('aria-hidden', 'false');
    }
  }
  
  addToHistory(command, success) {
    this.commandHistory.unshift({ command, success, timestamp: Date.now() });
    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory.pop();
    }
  }
  
  clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
  
  playSound(type) {
    if (!this.config.audioFeedback) return;
    
    const audio = new Audio();
    const frequencies = {
      'wake': [523.25, 659.25, 783.99], // C major chord
      'success': [523.25, 659.25], // Happy interval
      'error': [200, 150] // Low descent
    };
    
    this.playTone(frequencies[type] || [440], 200);
  }
  
  playTone(frequencies, duration) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + duration / 1000);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + duration / 1000);
      });
    } catch (e) {
      // Audio context not supported
    }
  }
  
  showUnsupportedMessage() {
    console.log('Voice Navigation not supported in this browser');
  }
  
  // Public API
  addCommand(phrase, action) {
    this.actionCommands[phrase.toLowerCase()] = action;
  }
  
  removeCommand(phrase) {
    delete this.actionCommands[phrase.toLowerCase()];
  }
  
  getHistory() {
    return [...this.commandHistory];
  }
  
  destroy() {
    this.stop();
    if (this.ui) {
      this.ui.remove();
    }
    this.clearSilenceTimer();
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.voiceNav = new VoiceNavigationSystem();
  });
} else {
  window.voiceNav = new VoiceNavigationSystem();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceNavigationSystem;
}
