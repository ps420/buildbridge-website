/**
 * Audio Feedback System v56.0
 * Fortune 500 Micro-Interaction Sounds
 * Uses Web Audio API for synthesized sounds (no external files needed)
 */

class AudioFeedbackSystem {
  constructor() {
    this.audioContext = null;
    this.isEnabled = false;
    this.volume = 0.3;
    this.sounds = {};
    this.interactionTypes = {
      hover: { enabled: true, volume: 0.2 },
      click: { enabled: true, volume: 0.4 },
      success: { enabled: true, volume: 0.5 },
      error: { enabled: true, volume: 0.5 },
      focus: { enabled: false, volume: 0.15 },
      scroll: { enabled: false, volume: 0.1 },
      notification: { enabled: true, volume: 0.6 }
    };
    this.init();
  }

  init() {
    this.createAudioContext();
    this.createUI();
    this.setupEventListeners();
    this.checkFirstVisit();
  }

  createAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // Sound Synthesis Methods
  createTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  createChord(frequencies, duration, volume = 0.5) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.createTone(freq, duration, 'sine', volume * 0.7);
      }, i * 30);
    });
  }

  createSweep(startFreq, endFreq, duration, volume = 0.5) {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sound Presets
  playHover() {
    if (!this.interactionTypes.hover.enabled) return;
    this.createTone(800, 0.05, 'sine', this.interactionTypes.hover.volume);
  }

  playClick() {
    if (!this.interactionTypes.click.enabled) return;
    this.createTone(1200, 0.08, 'triangle', this.interactionTypes.click.volume);
    setTimeout(() => {
      this.createTone(600, 0.1, 'sine', this.interactionTypes.click.volume * 0.5);
    }, 30);
  }

  playSuccess() {
    if (!this.interactionTypes.success.enabled) return;
    this.createChord([523.25, 659.25, 783.99], 0.4, this.interactionTypes.success.volume);
  }

  playError() {
    if (!this.interactionTypes.error.enabled) return;
    this.createTone(200, 0.3, 'sawtooth', this.interactionTypes.error.volume);
    setTimeout(() => {
      this.createTone(150, 0.3, 'sawtooth', this.interactionTypes.error.volume);
    }, 100);
  }

  playFocus() {
    if (!this.interactionTypes.focus.enabled) return;
    this.createSweep(400, 600, 0.1, this.interactionTypes.focus.volume);
  }

  playNotification() {
    if (!this.interactionTypes.notification.enabled) return;
    this.createTone(880, 0.1, 'sine', this.interactionTypes.notification.volume);
    setTimeout(() => {
      this.createTone(1100, 0.2, 'sine', this.interactionTypes.notification.volume);
    }, 100);
  }

  playScroll() {
    if (!this.interactionTypes.scroll.enabled) return;
    this.createTone(200, 0.03, 'sine', this.interactionTypes.scroll.volume);
  }

  playType() {
    if (!this.isEnabled) return;
    const freq = 800 + Math.random() * 200;
    this.createTone(freq, 0.03, 'sine', 0.1);
  }

  // UI Creation
  createUI() {
    // Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'audio-toggle-btn';
    toggleBtn.innerHTML = '🔊';
    toggleBtn.setAttribute('aria-label', 'Toggle audio feedback');
    document.body.appendChild(toggleBtn);
    this.toggleBtn = toggleBtn;

    // Settings Panel
    const panel = document.createElement('div');
    panel.className = 'audio-settings-panel';
    panel.innerHTML = `
      <div class="audio-settings-header">
        <h4>🔊 Sound Settings</h4>
        <button class="audio-settings-close" aria-label="Close settings">✕</button>
      </div>
      <div class="audio-volume-control">
        <div class="audio-volume-label">
          <span>Master Volume</span>
          <span class="volume-value">30%</span>
        </div>
        <input type="range" class="audio-volume-slider" min="0" max="100" value="30">
      </div>
      <div class="audio-toggles">
        ${this.createToggleHTML('hover', '🔔', 'Hover Sounds')}
        ${this.createToggleHTML('click', '👆', 'Click Sounds')}
        ${this.createToggleHTML('success', '✓', 'Success Sounds')}
        ${this.createToggleHTML('error', '✕', 'Error Sounds')}
        ${this.createToggleHTML('focus', '◎', 'Focus Sounds')}
        ${this.createToggleHTML('scroll', '⇅', 'Scroll Sounds')}
      </div>
    `;
    document.body.appendChild(panel);
    this.settingsPanel = panel;

    // Sound Wave Animation
    const wave = document.createElement('div');
    wave.className = 'sound-wave paused';
    wave.innerHTML = `
      <div class="sound-wave-bar"></div>
      <div class="sound-wave-bar"></div>
      <div class="sound-wave-bar"></div>
      <div class="sound-wave-bar"></div>
    `;
    document.body.appendChild(wave);
    this.soundWave = wave;
  }

  createToggleHTML(type, icon, label) {
    const isEnabled = this.interactionTypes[type].enabled;
    return `
      <div class="audio-toggle" data-type="${type}">
        <span class="audio-toggle-label">
          <span class="audio-toggle-icon">${icon}</span>
          ${label}
        </span>
        <div class="audio-toggle-switch ${isEnabled ? 'active' : ''}"></div>
      </div>
    `;
  }

  setupEventListeners() {
    // Toggle button
    this.toggleBtn.addEventListener('click', () => {
      this.toggleAudio();
    });

    // Settings panel
    const closeBtn = this.settingsPanel.querySelector('.audio-settings-close');
    closeBtn.addEventListener('click', () => {
      this.settingsPanel.classList.remove('visible');
    });

    // Volume slider
    const volumeSlider = this.settingsPanel.querySelector('.audio-volume-slider');
    const volumeValue = this.settingsPanel.querySelector('.volume-value');
    volumeSlider.addEventListener('input', (e) => {
      this.volume = e.target.value / 100;
      volumeValue.textContent = `${e.target.value}%`;
      this.saveSettings();
    });

    // Toggle switches
    const toggles = this.settingsPanel.querySelectorAll('.audio-toggle-switch');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const type = toggle.closest('.audio-toggle').dataset.type;
        this.interactionTypes[type].enabled = toggle.classList.contains('active');
        this.saveSettings();
      });
    });

    // Hover sounds
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches('button, a, [role="button"], .interactive')) {
        this.playHover();
        this.showVisualFeedback(e.target);
      }
    });

    // Click sounds
    document.addEventListener('click', (e) => {
      this.playClick();
      
      // Open settings on long press of toggle button
      if (e.target === this.toggleBtn) {
        clearTimeout(this.longPressTimer);
      }
    });

    // Long press to open settings
    this.toggleBtn.addEventListener('mousedown', () => {
      this.longPressTimer = setTimeout(() => {
        this.settingsPanel.classList.add('visible');
        this.playNotification();
      }, 500);
    });

    this.toggleBtn.addEventListener('mouseup', () => {
      clearTimeout(this.longPressTimer);
    });

    // Focus sounds
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input, textarea, select, button, a')) {
        this.playFocus();
      }
    });

    // Type sounds (throttled)
    let typeTimeout;
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) {
        clearTimeout(typeTimeout);
        typeTimeout = setTimeout(() => {
          this.playType();
        }, 50);
      }
    });

    // Click outside to close settings
    document.addEventListener('click', (e) => {
      if (!this.settingsPanel.contains(e.target) && e.target !== this.toggleBtn) {
        this.settingsPanel.classList.remove('visible');
      }
    });

    // Keyboard shortcut (Alt + A)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.toggleAudio();
      }
    });
  }

  toggleAudio() {
    if (!this.audioContext) {
      this.createAudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isEnabled = !this.isEnabled;
    this.toggleBtn.classList.toggle('muted', !this.isEnabled);
    this.toggleBtn.innerHTML = this.isEnabled ? '🔊' : '🔇';
    this.soundWave.classList.toggle('paused', !this.isEnabled);
    this.soundWave.classList.toggle('playing', this.isEnabled);

    if (this.isEnabled) {
      this.playSuccess();
      localStorage.setItem('audioFeedbackEnabled', 'true');
    } else {
      localStorage.setItem('audioFeedbackEnabled', 'false');
    }

    this.showToast(this.isEnabled ? 'Audio feedback enabled' : 'Audio feedback disabled');
  }

  showVisualFeedback(element) {
    if (!this.isEnabled) return;

    const rect = element.getBoundingClientRect();
    const indicator = document.createElement('div');
    indicator.className = 'audio-feedback-indicator';
    indicator.innerHTML = '<div class="audio-feedback-ring"></div>';
    indicator.style.left = `${rect.left + rect.width / 2}px`;
    indicator.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(indicator);

    requestAnimationFrame(() => {
      indicator.classList.add('visible');
    });

    setTimeout(() => indicator.remove(), 600);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'simple-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(15, 15, 16, 0.95);
      color: #F5F7FA;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  checkFirstVisit() {
    const hasVisited = localStorage.getItem('audioFeedbackPrompted');
    const isEnabled = localStorage.getItem('audioFeedbackEnabled');

    if (!hasVisited) {
      this.showEnableNotice();
      localStorage.setItem('audioFeedbackPrompted', 'true');
    } else if (isEnabled === 'true') {
      this.isEnabled = true;
      this.toggleBtn.classList.remove('muted');
      this.toggleBtn.innerHTML = '🔊';
      this.soundWave.classList.add('playing');
      this.soundWave.classList.remove('paused');
      
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume();
      }
    }

    this.loadSettings();
  }

  showEnableNotice() {
    const notice = document.createElement('div');
    notice.className = 'audio-notice';
    notice.innerHTML = `
      <span class="audio-notice-icon">🔊</span>
      <span class="audio-notice-text">Enable audio feedback for interactions?</span>
      <div class="audio-notice-actions">
        <button class="audio-notice-btn enable">Enable</button>
        <button class="audio-notice-btn dismiss">Dismiss</button>
      </div>
    `;
    document.body.appendChild(notice);

    setTimeout(() => notice.classList.add('visible'), 1000);

    const enableBtn = notice.querySelector('.enable');
    const dismissBtn = notice.querySelector('.dismiss');

    enableBtn.addEventListener('click', () => {
      this.toggleAudio();
      notice.classList.remove('visible');
      setTimeout(() => notice.remove(), 400);
    });

    dismissBtn.addEventListener('click', () => {
      notice.classList.remove('visible');
      setTimeout(() => notice.remove(), 400);
    });

    setTimeout(() => {
      notice.classList.remove('visible');
      setTimeout(() => notice.remove(), 400);
    }, 8000);
  }

  saveSettings() {
    localStorage.setItem('audioFeedbackSettings', JSON.stringify({
      volume: this.volume,
      types: this.interactionTypes
    }));
  }

  loadSettings() {
    const saved = localStorage.getItem('audioFeedbackSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.volume = settings.volume || 0.3;
      if (settings.types) {
        Object.assign(this.interactionTypes, settings.types);
      }

      // Update UI
      const volumeSlider = this.settingsPanel.querySelector('.audio-volume-slider');
      const volumeValue = this.settingsPanel.querySelector('.volume-value');
      if (volumeSlider) {
        volumeSlider.value = this.volume * 100;
        volumeValue.textContent = `${Math.round(this.volume * 100)}%`;
      }
    }
  }

  // Public API for triggering sounds programmatically
  play(type) {
    const soundMap = {
      'hover': () => this.playHover(),
      'click': () => this.playClick(),
      'success': () => this.playSuccess(),
      'error': () => this.playError(),
      'focus': () => this.playFocus(),
      'notification': () => this.playNotification(),
      'scroll': () => this.playScroll()
    };

    if (soundMap[type]) {
      soundMap[type]();
    }
  }
}

// Initialize
const audioFeedback = new AudioFeedbackSystem();

// Export
window.AudioFeedbackSystem = AudioFeedbackSystem;
window.audioFeedback = audioFeedback;
