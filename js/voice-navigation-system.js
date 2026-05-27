/**
 * VOICE NAVIGATION SYSTEM v35.0
 * Fortune 500 Voice-Controlled Accessibility
 */

(function() {
  'use strict';

  // Voice Navigation State
  let state = {
    isOpen: false,
    isListening: false,
    recognition: null,
    transcript: ''
  };

  // Navigation Commands Database
  const commands = {
    navigation: {
      'home': '/', 'go home': '/', 'main page': '/',
      'about': '/about.html', 'about us': '/about.html', 'company info': '/about.html',
      'services': '/services.html', 'what we do': '/services.html', 'our services': '/services.html',
      'projects': '/projects.html', 'portfolio': '/projects.html', 'our work': '/projects.html',
      'contact': '/contact.html', 'get in touch': '/contact.html', 'call us': '/contact.html',
      'team': '#team', 'our team': '#team', 'leadership': '#team',
      'calculator': '#calculator', 'cost calculator': '#calculator', 'estimate': '#calculator'
    },
    actions: {
      'scroll up': () => window.scrollBy({ top: -500, behavior: 'smooth' }),
      'scroll down': () => window.scrollBy({ top: 500, behavior: 'smooth' }),
      'top': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      'bottom': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
      'whatsapp': () => window.open('https://wa.me/27661200064', '_blank'),
      'call': () => window.location.href = 'tel:+27661200064',
      'email': () => window.location.href = 'mailto:info@buildbridge.co.za',
      'dark mode': () => toggleTheme('dark'),
      'light mode': () => toggleTheme('light'),
      'help': () => showHelp(),
      'close': () => closeVoicePanel()
    },
    keywords: {
      'residential': '/services.html?type=residential',
      'commercial': '/services.html?type=commercial',
      'industrial': '/services.html?type=industrial',
      'consultation': '/contact.html?service=consultation',
      'quote': '/contact.html?type=quote'
    }
  };

  // Initialize Voice Navigation
  function init() {
    createVoiceWidget();
    setupSpeechRecognition();
    setupKeyboardShortcuts();
    
    console.log('✅ Voice Navigation initialized');
  }

  // Create Voice Widget HTML
  function createVoiceWidget() {
    const widget = document.createElement('div');
    widget.className = 'voice-nav-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Voice Navigation');
    widget.innerHTML = `
      <div class="voice-panel" id="voicePanel">
        <div class="voice-panel-header">
          <div class="voice-panel-title">
            <div class="icon">🎙️</div>
            <div>
              <h3>Voice Control</h3>
              <span>Speak to navigate</span>
            </div>
          </div>
          <button class="voice-panel-close" aria-label="Close voice panel" onclick="window.VoiceNav.closePanel()">✕</button>
        </div>
        
        <div class="voice-status" id="voiceStatus">
          <div class="voice-status-icon">🎤</div>
          <div class="voice-status-text">Tap to speak</div>
          <div class="voice-status-hint">Try saying "Go to services"</div>
        </div>
        
        <div class="voice-transcript" id="voiceTranscript">
          <div class="voice-transcript-placeholder">Your speech will appear here...</div>
        </div>
        
        <div class="voice-commands">
          <div class="voice-commands-title">Quick Commands</div>
          <div class="voice-commands-grid">
            <div class="voice-command-item" data-command="home">
              <div class="cmd-icon">🏠</div>
              <div class="cmd-text">"Go home"</div>
            </div>
            <div class="voice-command-item" data-command="contact">
              <div class="cmd-icon">📞</div>
              <div class="cmd-text">"Contact us"</div>
            </div>
            <div class="voice-command-item" data-command="services">
              <div class="cmd-icon">⚙️</div>
              <div class="cmd-text">"Services"</div>
            </div>
            <div class="voice-command-item" data-command="projects">
              <div class="cmd-icon">🏗️</div>
              <div class="cmd-text">"Projects"</div>
            </div>
            <div class="voice-command-item" data-command="whatsapp">
              <div class="cmd-icon">💬</div>
              <div class="cmd-text">"WhatsApp"</div>
            </div>
            <div class="voice-command-item" data-command="top">
              <div class="cmd-icon">⬆️</div>
              <div class="cmd-text">"Scroll to top"</div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="voice-nav-toggle" id="voiceToggle" aria-label="Open voice navigation">
        <span class="mic-icon">🎙️</span>
        <div class="voice-waves">
          <div class="voice-wave"></div>
          <div class="voice-wave"></div>
          <div class="voice-wave"></div>
        </div>
      </button>
      
      <div class="voice-keyboard-hint">
        Press <kbd>Ctrl</kbd>+<kbd>Space</kbd>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Bind toggle button
    const toggle = widget.querySelector('#voiceToggle');
    toggle.addEventListener('click', togglePanel);
    
    // Bind command items
    widget.querySelectorAll('.voice-command-item').forEach(item => {
      item.addEventListener('click', () => {
        const command = item.dataset.command;
        executeCommand(command);
      });
    });
    
    // Bind status area for manual trigger
    const status = widget.querySelector('#voiceStatus');
    status.addEventListener('click', toggleListening);
  }

  // Setup Speech Recognition
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      document.getElementById('voiceStatus').innerHTML = `
        <div class="voice-status-icon">⚠️</div>
        <div class="voice-status-text">Not Supported</div>
        <div class="voice-status-hint">Try Chrome or Edge browser</div>
      `;
      return;
    }
    
    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = 'en-US';
    
    state.recognition.onstart = () => {
      state.isListening = true;
      updateStatus('listening', 'Listening...', 'Speak clearly');
      document.getElementById('voiceToggle').classList.add('active');
    };
    
    state.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          processCommand(transcript.toLowerCase().trim());
        } else {
          interimTranscript += transcript;
        }
      }
      
      updateTranscript(interimTranscript || finalTranscript, !!finalTranscript);
    };
    
    state.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      updateStatus('error', 'Error: ' + event.error, 'Please try again');
      setTimeout(() => stopListening(), 2000);
    };
    
    state.recognition.onend = () => {
      state.isListening = false;
      document.getElementById('voiceToggle').classList.remove('active');
      if (state.isOpen) {
        updateStatus('idle', 'Tap to speak', 'Try saying "Go to services"');
      }
    };
  }

  // Setup Keyboard Shortcuts
  function setupKeyboardShortcuts() {
    let ctrlPressed = false;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Control') ctrlPressed = true;
      
      // Ctrl + Space to toggle
      if (ctrlPressed && e.code === 'Space') {
        e.preventDefault();
        togglePanel();
      }
      
      // Escape to close
      if (e.key === 'Escape' && state.isOpen) {
        closePanel();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control') ctrlPressed = false;
    });
  }

  // Toggle Panel
  function togglePanel() {
    state.isOpen = !state.isOpen;
    const panel = document.getElementById('voicePanel');
    panel.classList.toggle('active', state.isOpen);
    
    if (state.isOpen) {
      updateStatus('idle', 'Tap to speak', 'Try saying "Go to services"');
    } else {
      stopListening();
    }
  }

  // Close Panel
  function closePanel() {
    state.isOpen = false;
    document.getElementById('voicePanel').classList.remove('active');
    stopListening();
  }

  // Toggle Listening
  function toggleListening() {
    if (!state.recognition) {
      showFeedback('Voice not supported', 'Please use Chrome or Edge', '⚠️');
      return;
    }
    
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // Start Listening
  function startListening() {
    try {
      state.recognition.start();
    } catch (e) {
      console.error('Could not start recognition:', e);
    }
  }

  // Stop Listening
  function stopListening() {
    if (state.recognition && state.isListening) {
      state.recognition.stop();
    }
  }

  // Update Status Display
  function updateStatus(type, text, hint) {
    const status = document.getElementById('voiceStatus');
    status.className = 'voice-status ' + type;
    status.querySelector('.voice-status-text').textContent = text;
    status.querySelector('.voice-status-hint').textContent = hint;
  }

  // Update Transcript Display
  function updateTranscript(text, isFinal) {
    const container = document.getElementById('voiceTranscript');
    container.innerHTML = `<div class="voice-transcript-text ${isFinal ? 'confidence-high' : 'confidence-medium'}">"${text}"</div>`;
  }

  // Process Voice Command
  function processCommand(transcript) {
    console.log('Processing command:', transcript);
    
    // Check navigation commands
    for (const [key, url] of Object.entries(commands.navigation)) {
      if (transcript.includes(key)) {
        executeNavigation(url, key);
        return;
      }
    }
    
    // Check action commands
    for (const [key, action] of Object.entries(commands.actions)) {
      if (transcript.includes(key)) {
        executeAction(action, key);
        return;
      }
    }
    
    // Check keyword commands
    for (const [key, url] of Object.entries(commands.keywords)) {
      if (transcript.includes(key)) {
        executeNavigation(url, key);
        return;
      }
    }
    
    // No match
    showFeedback('Command not recognized', 'Try "Go home" or "Contact us"', '🤔');
  }

  // Execute Navigation
  function executeNavigation(url, commandName) {
    showFeedback('Navigating...', `Going to ${commandName}`, '🚀');
    setTimeout(() => {
      window.location.href = url;
    }, 800);
  }

  // Execute Action
  function executeAction(action, commandName) {
    showFeedback('Action executed', commandName, '✅');
    action();
    closePanel();
  }

  // Execute Command by Name
  function executeCommand(commandName) {
    // Try navigation
    if (commands.navigation[commandName]) {
      executeNavigation(commands.navigation[commandName], commandName);
      return;
    }
    
    // Try actions
    if (commands.actions[commandName]) {
      executeAction(commands.actions[commandName], commandName);
      return;
    }
    
    // Try keywords
    if (commands.keywords[commandName]) {
      executeNavigation(commands.keywords[commandName], commandName);
    }
  }

  // Show Feedback Toast
  function showFeedback(title, desc, icon = '✅') {
    // Remove existing toast
    const existing = document.querySelector('.voice-feedback-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'voice-feedback-toast';
    toast.innerHTML = `
      <div class="feedback-icon">${icon}</div>
      <div class="feedback-content">
        <div class="feedback-title">${title}</div>
        <div class="feedback-desc">${desc}</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('active');
    });
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // Helper: Toggle Theme
  function toggleTheme(mode) {
    document.body.classList.remove('light-mode', 'dark-mode');
    if (mode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  }

  // Helper: Show Help
  function showHelp() {
    showFeedback('Voice Controls', 'Say: "Go home", "Services", "Contact us", "Scroll up"', '💡');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.VoiceNav = {
    togglePanel,
    closePanel,
    executeCommand,
    isSupported: () => !!window.SpeechRecognition || !!window.webkitSpeechRecognition
  };

})();
