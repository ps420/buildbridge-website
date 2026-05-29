/**
 * v73.1: DYNAMIC FAVICON & BROWSER TAB INTEGRATION
 * Fortune 500 Quality Browser Integration
 */

class DynamicFavicon {
  constructor(options = {}) {
    this.options = {
      defaultColor: '#C9CED6',
      scrollColor: '#F5F7FA',
      notificationColor: '#ff6b6b',
      canvasSize: 64,
      ...options
    };
    
    this.originalTitle = document.title;
    this.canvas = null;
    this.ctx = null;
    this.originalFavicon = null;
    this.isAnimating = false;
    this.badgeCount = 0;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.saveOriginalFavicon();
    this.bindEvents();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.canvasSize;
    this.canvas.height = this.options.canvasSize;
    this.ctx = this.canvas.getContext('2d');
  }
  
  saveOriginalFavicon() {
    const link = document.querySelector('link[rel*="icon"]');
    if (link) {
      this.originalFavicon = link.href;
    }
  }
  
  bindEvents() {
    // Scroll-based favicon color
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollFavicon();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onTabHidden();
      } else {
        this.onTabVisible();
      }
    });
    
    // Page focus/blur for attention
    window.addEventListener('blur', () => this.onWindowBlur());
    window.addEventListener('focus', () => this.onWindowFocus());
  }
  
  updateScrollFavicon() {
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const hue = 210 + (scrollProgress * 60); // Blue to purple range
    const color = `hsl(${hue}, 70%, ${70 + scrollProgress * 20}%)`;
    
    this.drawFavicon({
      color: color,
      glow: scrollProgress > 0.5,
      progress: scrollProgress
    });
  }
  
  drawFavicon({ color, glow = false, progress = 0, badge = null }) {
    const ctx = this.ctx;
    const size = this.options.canvasSize;
    const center = size / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0f0f12');
    gradient.addColorStop(1, '#1a1a22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw rounded rect background
    ctx.beginPath();
    ctx.roundRect(4, 4, size - 8, size - 8, 12);
    ctx.fillStyle = '#1a1a22';
    ctx.fill();
    
    // Draw glow effect if enabled
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }
    
    // Draw "B" letter
    ctx.font = 'bold 32px Montserrat, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', center, center);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw progress arc
    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(center, center, 28, -Math.PI / 2, (-Math.PI / 2) + (progress * Math.PI * 2));
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw badge if present
    if (badge) {
      // Badge circle
      ctx.beginPath();
      ctx.arc(size - 10, 10, 10, 0, Math.PI * 2);
      ctx.fillStyle = this.options.notificationColor;
      ctx.fill();
      
      // Badge number
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(badge > 9 ? '9+' : String(badge), size - 10, 11);
    }
    
    // Apply favicon
    this.applyFavicon();
  }
  
  applyFavicon() {
    const dataUrl = this.canvas.toDataURL('image/png');
    let link = document.querySelector('link[rel*="icon"]');
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = dataUrl;
  }
  
  onTabHidden() {
    // Set a subtle indicator that user has left
    this.drawFavicon({
      color: this.options.defaultColor,
      dimmed: true
    });
  }
  
  onTabVisible() {
    // Restore normal favicon
    this.badgeCount = 0;
    this.updateScrollFavicon();
  }
  
  onWindowBlur() {
    // Optional: Dim favicon when window loses focus
    this.drawFavicon({
      color: this.options.defaultColor,
      glow: false
    });
  }
  
  onWindowFocus() {
    this.updateScrollFavicon();
  }
  
  // Public API: Set notification badge
  setBadge(count) {
    this.badgeCount = count;
    this.drawFavicon({
      color: this.options.defaultColor,
      badge: count
    });
  }
  
  // Public API: Show typing indicator in title
  showTypingIndicator() {
    if (!document.hidden) return;
    
    const dots = ['.', '..', '...'];
    let index = 0;
    
    this.typingInterval = setInterval(() => {
      document.title = `💬 New message${dots[index]} - ${this.originalTitle}`;
      index = (index + 1) % dots.length;
    }, 500);
  }
  
  hideTypingIndicator() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
      document.title = this.originalTitle;
    }
  }
  
  // Public API: Pulse animation for important events
  pulse(times = 3) {
    let count = 0;
    const pulse = () => {
      if (count >= times * 2) {
        this.updateScrollFavicon();
        return;
      }
      
      const isBright = count % 2 === 0;
      this.drawFavicon({
        color: isBright ? this.options.scrollColor : this.options.defaultColor,
        glow: isBright
      });
      
      count++;
      setTimeout(pulse, 300);
    };
    pulse();
  }
  
  // Public API: Update title with unread count
  updateTitleWithCount(count) {
    if (count > 0) {
      document.title = `(${count}) ${this.originalTitle}`;
    } else {
      document.title = this.originalTitle;
    }
  }
  
  // Public API: Reset to original
  reset() {
    if (this.originalFavicon) {
      let link = document.querySelector('link[rel*="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = this.originalFavicon;
    }
    document.title = this.originalTitle;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.dynamicFavicon = new DynamicFavicon();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicFavicon;
}
