// BuildBridge - Voice Waveform Animation
// Fortune 500-style audio visualization
// Version 5.0 Professional Enhancement

class VoiceWaveform {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      bars: options.bars || 40,
      barWidth: options.barWidth || 4,
      barGap: options.barGap || 2,
      barColor: options.barColor || 'var(--chrome)',
      barGradient: options.barGradient || ['var(--chrome)', 'var(--white)'],
      smoothing: options.smoothing || 0.8,
      animationSpeed: options.animationSpeed || 1,
      ...options
    };
    
    this.bars = [];
    this.isAnimating = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.createBars();
    this.createCanvas();
    this.bindEvents();
  }
  
  createBars() {
    this.container.classList.add('voice-waveform');
    this.container.innerHTML = '';
    
    for (let i = 0; i < this.options.bars; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform-bar';
      bar.style.cssText = `
        width: ${this.options.barWidth}px;
        margin: 0 ${this.options.barGap / 2}px;
        background: linear-gradient(to top, ${this.options.barGradient[0]}, ${this.options.barGradient[1]});
        border-radius: ${this.options.barWidth / 2}px;
        transition: height 0.1s ease;
      `;
      
      this.container.appendChild(bar);
      this.bars.push({
        element: bar,
        height: 20,
        targetHeight: 20,
        velocity: 0
      });
    }
  }
  
  createCanvas() {
    // For advanced visualization with actual audio
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'waveform-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }
  
  bindEvents() {
    // Hover interaction
    this.container.addEventListener('mouseenter', () => this.start());
    this.container.addEventListener('mouseleave', () => this.stop());
    
    // Click to toggle
    this.container.addEventListener('click', () => {
      if (this.isAnimating) {
        this.stop();
      } else {
        this.start();
      }
    });
  }
  
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
    this.container.classList.add('waveform-active');
  }
  
  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.container.classList.remove('waveform-active');
    
    // Reset bars smoothly
    this.bars.forEach(bar => {
      bar.targetHeight = 10;
      bar.velocity = 0;
      bar.element.style.height = '10%';
    });
  }
  
  animate() {
    if (!this.isAnimating) return;
    
    this.bars.forEach((bar, index) => {
      // Generate random target based on sine wave pattern
      const time = Date.now() * 0.003 * this.options.animationSpeed;
      const baseHeight = 30 + Math.sin(time + index * 0.2) * 20;
      const noise = (Math.random() - 0.5) * 30;
      
      bar.targetHeight = Math.max(5, Math.min(100, baseHeight + noise));
      
      // Smooth interpolation
      const diff = bar.targetHeight - bar.height;
      bar.velocity = diff * (1 - this.options.smoothing) * 0.2;
      bar.height += bar.velocity;
      
      // Apply height
      bar.element.style.height = `${bar.height}%`;
      
      // Add glow effect for higher bars
      const glowIntensity = (bar.height - 20) / 80;
      bar.element.style.boxShadow = glowIntensity > 0.5 
        ? `0 0 ${glowIntensity * 10}px ${this.options.barGradient[0]}` 
        : 'none';
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  // Respond to actual audio input
  async connectToMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isAudioConnected = true;
      
      this.visualizeAudio();
    } catch (err) {
      console.warn('Microphone access denied or not available');
    }
  }
  
  visualizeAudio() {
    if (!this.isAudioConnected) return;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    const step = Math.floor(this.dataArray.length / this.bars.length);
    
    this.bars.forEach((bar, index) => {
      const value = this.dataArray[index * step];
      bar.targetHeight = (value / 255) * 100;
      bar.height = bar.height * 0.8 + bar.targetHeight * 0.2;
      bar.element.style.height = `${bar.height}%`;
    });
    
    this.animationId = requestAnimationFrame(() => this.visualizeAudio());
  }
  
  disconnectAudio() {
    this.isAudioConnected = false;
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Circular waveform variant
class CircularWaveform {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      bars: options.bars || 60,
      radius: options.radius || 100,
      barWidth: options.barWidth || 4,
      barHeight: options.barHeight || 40,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.container.classList.add('circular-waveform');
    this.createBars();
    this.animate();
  }
  
  createBars() {
    for (let i = 0; i < this.options.bars; i++) {
      const angle = (i / this.options.bars) * Math.PI * 2;
      const bar = document.createElement('div');
      bar.className = 'circular-waveform-bar';
      
      const x = Math.cos(angle) * this.options.radius;
      const y = Math.sin(angle) * this.options.radius;
      const rotation = (angle * 180 / Math.PI) + 90;
      
      bar.style.cssText = `
        position: absolute;
        width: ${this.options.barWidth}px;
        height: ${this.options.barHeight}px;
        background: linear-gradient(to top, var(--chrome), var(--white));
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg);
        border-radius: ${this.options.barWidth / 2}px;
        transform-origin: center bottom;
        transition: height 0.1s ease, transform 0.1s ease;
      `;
      
      this.container.appendChild(bar);
    }
    
    this.container.style.cssText = `
      position: relative;
      width: ${this.options.radius * 2 + this.options.barHeight * 2}px;
      height: ${this.options.radius * 2 + this.options.barHeight * 2}px;
    `;
  }
  
  animate() {
    const bars = this.container.querySelectorAll('.circular-waveform-bar');
    const time = Date.now() * 0.002;
    
    bars.forEach((bar, index) => {
      const amplitude = Math.sin(time + index * 0.1) * 0.5 + 0.5;
      const scale = 0.3 + amplitude * 0.7;
      bar.style.transform = bar.style.transform.replace(/scaleY\([^)]+\)/, '') + ` scaleY(${scale})`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Voice visualizer for chat/voice interface
class VoiceChatVisualizer {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      state: options.state || 'idle', // 'idle', 'listening', 'speaking', 'thinking'
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.container.classList.add('voice-chat-visualizer');
    this.createDots();
    this.setState(this.options.state);
  }
  
  createDots() {
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'voice-dot';
      dot.style.animationDelay = `${i * 0.15}s`;
      this.container.appendChild(dot);
    }
  }
  
  setState(state) {
    this.container.className = 'voice-chat-visualizer';
    this.container.classList.add(`voice-state-${state}`);
    
    const dots = this.container.querySelectorAll('.voice-dot');
    
    dots.forEach(dot => {
      dot.style.animation = 'none';
      dot.offsetHeight; // Trigger reflow
      
      switch (state) {
        case 'listening':
          dot.style.animation = 'voice-pulse 0.8s ease-in-out infinite';
          break;
        case 'speaking':
          dot.style.animation = 'voice-wave 0.5s ease-in-out infinite';
          break;
        case 'thinking':
          dot.style.animation = 'voice-bounce 0.6s ease-in-out infinite';
          break;
        default: // idle
          dot.style.opacity = '0.3';
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize voice waveforms
  document.querySelectorAll('[data-voice-waveform]').forEach(el => {
    new VoiceWaveform(el, {
      bars: parseInt(el.dataset.bars) || 40,
      animationSpeed: parseFloat(el.dataset.speed) || 1
    });
  });
  
  // Initialize circular waveforms
  document.querySelectorAll('[data-circular-waveform]').forEach(el => {
    new CircularWaveform(el, {
      bars: parseInt(el.dataset.bars) || 60,
      radius: parseInt(el.dataset.radius) || 100
    });
  });
  
  // Initialize voice chat visualizers
  document.querySelectorAll('[data-voice-chat]').forEach(el => {
    const visualizer = new VoiceChatVisualizer(el);
    el._visualizer = visualizer;
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VoiceWaveform, CircularWaveform, VoiceChatVisualizer };
}
