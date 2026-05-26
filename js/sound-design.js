/**
 * Sound Design System
 * Professional UI Audio Feedback
 * Subtle, non-intrusive audio cues for interactions
 */

class SoundDesign {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.volume = options.volume || 0.15;
    this.context = null;
    this.sounds = new Map();
    this.isInitialized = false;
    this.masterGain = null;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
      return;
    }
    
    // Check for touch device - disable on mobile
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.enabled = false;
      return;
    }
    
    this.setupEventListeners();
    console.log('🔊 Sound Design System initialized');
  }
  
  async initAudio() {
    if (this.isInitialized || !this.enabled) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.context.destination);
      
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio context not supported');
      this.enabled = false;
    }
  }
  
  setupEventListeners() {
    // Initialize on first user interaction (browser requirement)
    const initOnInteraction = async () => {
      await this.initAudio();
      if (this.isInitialized) {
        this.bindInteractionSounds();
      }
    };
    
    document.addEventListener('click', initOnInteraction, { once: true });
    document.addEventListener('keydown', initOnInteraction, { once: true });
    document.addEventListener('mouseenter', initOnInteraction, { once: true });
  }
  
  bindInteractionSounds() {
    // Button hover - subtle tick
    document.querySelectorAll('.btn, button').forEach(btn => {
      btn.addEventListener('mouseenter', () => this.playHover());
      btn.addEventListener('click', () => this.playClick());
    });
    
    // Card hover - shimmer sound
    document.querySelectorAll('.service-card, .project-card, .holo-card').forEach(card => {
      card.addEventListener('mouseenter', () => this.playShimmer());
    });
    
    // Navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => this.playNavigation());
    });
    
    // Success states
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => this.playSuccess());
    });
    
    // Quick contact toggle
    const quickContact = document.getElementById('quickContactTrigger');
    if (quickContact) {
      quickContact.addEventListener('click', () => this.playToggle());
    }
    
    // Modal interactions
    document.querySelectorAll('.newsletter-modal-close').forEach(close => {
      close.addEventListener('click', () => this.playClose());
    });
  }
  
  // Sound Generators
  playHover() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0);
    gain.gain.linearRampToValueAtTime(0.03, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.05);
  }
  
  playClick() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.1);
  }
  
  playShimmer() {
    if (!this.isInitialized) return;
    
    // Create a shimmering arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    const now = this.context.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0);
      gain.gain.linearRampToValueAtTime(0.02, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.1);
      
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.15);
    });
  }
  
  playNavigation() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.context.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0);
    gain.gain.linearRampToValueAtTime(0.04, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.12);
  }
  
  playSuccess() {
    if (!this.isInitialized) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major chord
    const now = this.context.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }
  
  playToggle() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.context.currentTime);
    osc.frequency.setValueAtTime(554, this.context.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0);
    gain.gain.linearRampToValueAtTime(0.04, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.15);
  }
  
  playClose() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.1);
  }
  
  playNotification() {
    if (!this.isInitialized) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, this.context.currentTime);
    osc.frequency.setValueAtTime(0, this.context.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, this.context.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0);
    gain.gain.linearRampToValueAtTime(0.04, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.04, this.context.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.25);
    
    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.3);
  }
  
  // Volume control
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  
  // Enable/disable sounds
  enable() {
    this.enabled = true;
    this.initAudio();
  }
  
  disable() {
    this.enabled = false;
    if (this.context) {
      this.context.suspend();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.soundDesign = new SoundDesign({
    enabled: true,
    volume: 0.12
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundDesign;
}
