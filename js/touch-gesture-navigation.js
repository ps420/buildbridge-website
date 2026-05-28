/**
 * Touch Gesture Navigation v58.0
 * Mobile-first swipe navigation with haptic feedback simulation
 */

class TouchGestureNavigation {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 80;
    this.maxSwipeTime = 300;
    this.touchStartTime = 0;
    this.isPulling = false;
    this.pullStartY = 0;
    this.menuOpen = false;
    this.gesturesEnabled = true;
    
    // Check for touch capability
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    if (this.isTouchDevice) {
      this.init();
    }
  }
  
  init() {
    this.createMenu();
    this.createBackdrop();
    this.createPullToRefresh();
    this.createEdgeIndicators();
    this.bindEvents();
    this.checkFirstVisit();
    
    console.log('Touch Gesture Navigation initialized');
  }
  
  createMenu() {
    const menu = document.createElement('nav');
    menu.className = 'swipe-nav-menu';
    menu.setAttribute('aria-label', 'Mobile navigation');
    menu.setAttribute('role', 'navigation');
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    menu.innerHTML = `
      <div class="swipe-nav-header">
        <a href="index.html" class="swipe-nav-brand">
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="">
          <span>BuildBridge</span>
        </a>
        <button class="swipe-nav-close" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="swipe-nav-links">
        <a href="index.html" class="swipe-nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
          <span class="swipe-nav-link-icon">🏠</span>
          <span>Home</span>
        </a>
        <a href="about.html" class="swipe-nav-link ${currentPage === 'about.html' ? 'active' : ''}">
          <span class="swipe-nav-link-icon">ℹ️</span>
          <span>About</span>
        </a>
        <a href="services.html" class="swipe-nav-link ${currentPage === 'services.html' ? 'active' : ''}">
          <span class="swipe-nav-link-icon">🛠</span>
          <span>Services</span>
        </a>
        <a href="projects.html" class="swipe-nav-link ${currentPage === 'projects.html' ? 'active' : ''}">
          <span class="swipe-nav-link-icon">📁</span>
          <span>Projects</span>
          <span class="swipe-nav-link-badge">150+</span>
        </a>
        <a href="contact.html" class="swipe-nav-link ${currentPage === 'contact.html' ? 'active' : ''}">
          <span class="swipe-nav-link-icon">✉️</span>
          <span>Contact</span>
        </a>
      </div>
      
      <div class="swipe-quick-actions">
        <div class="swipe-quick-title">Quick Actions</div>
        <div class="swipe-quick-grid">
          <a href="https://wa.me/27661200064" class="swipe-quick-item" target="_blank">
            <span class="swipe-quick-icon">💬</span>
            <span class="swipe-quick-label">WhatsApp</span>
          </a>
          <a href="tel:+27661200064" class="swipe-quick-item">
            <span class="swipe-quick-icon">📞</span>
            <span class="swipe-quick-label">Call</span>
          </a>
          <a href="mailto:info@buildbridge.co.za" class="swipe-quick-item">
            <span class="swipe-quick-icon">📧</span>
            <span class="swipe-quick-label">Email</span>
          </a>
          <button class="swipe-quick-item" id="share-btn">
            <span class="swipe-quick-icon">📤</span>
            <span class="swipe-quick-label">Share</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(menu);
    this.menu = menu;
    
    // Bind close button
    menu.querySelector('.swipe-nav-close').addEventListener('click', () => this.closeMenu());
    
    // Bind share button
    const shareBtn = menu.querySelector('#share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.sharePage());
    }
  }
  
  createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'swipe-nav-backdrop';
    backdrop.addEventListener('click', () => this.closeMenu());
    document.body.appendChild(backdrop);
    this.backdrop = backdrop;
  }
  
  createPullToRefresh() {
    const ptr = document.createElement('div');
    ptr.className = 'pull-to-refresh';
    ptr.innerHTML = `
      <div class="ptr-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
        </svg>
      </div>
    `;
    document.body.appendChild(ptr);
    this.ptr = ptr;
    this.ptrIndicator = ptr.querySelector('.ptr-indicator');
  }
  
  createEdgeIndicators() {
    const left = document.createElement('div');
    left.className = 'edge-swipe-indicator left';
    document.body.appendChild(left);
    
    const right = document.createElement('div');
    right.className = 'edge-swipe-indicator right';
    document.body.appendChild(right);
    
    this.edgeLeft = left;
    this.edgeRight = right;
  }
  
  checkFirstVisit() {
    const hasSeenGestures = localStorage.getItem('bb_gestures_hint');
    if (!hasSeenGestures) {
      this.showGestureHint();
    }
  }
  
  showGestureHint() {
    const hint = document.createElement('div');
    hint.className = 'gesture-hint-overlay';
    hint.innerHTML = `
      <div class="gesture-hint-content">
        <div class="gesture-hint-icon">👆</div>
        <h3 class="gesture-hint-title">Swipe Navigation</h3>
        <p class="gesture-hint-text">
          Swipe from the left edge to open the menu.<br>
          Swipe down from the top to refresh.<br>
          Swipe between pages for quick navigation.
        </p>
        <div class="gesture-hint-actions">
          <button class="gesture-hint-btn primary" id="got-it-btn">Got it</button>
          <button class="gesture-hint-btn ghost" id="learn-more-btn">Learn More</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(hint);
    
    // Trigger animation
    requestAnimationFrame(() => hint.classList.add('active'));
    
    hint.querySelector('#got-it-btn').addEventListener('click', () => {
      localStorage.setItem('bb_gestures_hint', 'true');
      hint.classList.remove('active');
      setTimeout(() => hint.remove(), 400);
    });
    
    hint.querySelector('#learn-more-btn').addEventListener('click', () => {
      // Could show more detailed tutorial
      localStorage.setItem('bb_gestures_hint', 'true');
      hint.classList.remove('active');
      setTimeout(() => hint.remove(), 400);
    });
  }
  
  bindEvents() {
    // Touch events for swipe detection
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    
    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
    });
  }
  
  handleTouchStart(e) {
    if (!this.gesturesEnabled) return;
    
    this.touchStartX = e.changedTouches[0].screenX;
    this.touchStartY = e.changedTouches[0].screenY;
    this.touchStartTime = Date.now();
    
    // Edge detection for swipe hints
    if (this.touchStartX < 20) {
      this.edgeLeft.classList.add('visible');
    }
    if (this.touchStartX > window.innerWidth - 20) {
      this.edgeRight.classList.add('visible');
    }
    
    // Pull to refresh detection
    if (window.scrollY === 0 && this.touchStartY < 100) {
      this.isPulling = true;
      this.pullStartY = this.touchStartY;
    }
  }
  
  handleTouchMove(e) {
    if (!this.gesturesEnabled) return;
    
    const touchX = e.changedTouches[0].screenX;
    const touchY = e.changedTouches[0].screenY;
    const diffX = touchX - this.touchStartX;
    const diffY = touchY - this.touchStartY;
    
    // Handle pull to refresh
    if (this.isPulling) {
      const pullDistance = touchY - this.pullStartY;
      if (pullDistance > 0 && pullDistance < 150) {
        this.ptr.style.transform = `translateY(${pullDistance}px)`;
        if (pullDistance > 80) {
          this.ptrIndicator.classList.add('ready');
        }
      }
    }
    
    // Edge swipe preview
    if (this.touchStartX < 20 && diffX > 0 && !this.menuOpen) {
      const progress = Math.min(diffX / 200, 1);
      this.menu.style.transform = `translateX(${(progress - 1) * 100}%)`;
      this.backdrop.style.opacity = progress * 0.5;
      this.backdrop.style.visibility = 'visible';
    }
  }
  
  handleTouchEnd(e) {
    if (!this.gesturesEnabled) return;
    
    this.touchEndX = e.changedTouches[0].screenX;
    this.touchEndY = e.changedTouches[0].screenY;
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Hide edge indicators
    this.edgeLeft.classList.remove('visible');
    this.edgeRight.classList.remove('visible');
    
    // Calculate swipe
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    
    // Handle pull to refresh
    if (this.isPulling) {
      const pullDistance = this.touchEndY - this.pullStartY;
      if (pullDistance > 80) {
        this.triggerRefresh();
      } else {
        this.ptr.style.transform = '';
      }
      this.isPulling = false;
    }
    
    // Determine swipe direction
    if (touchDuration < this.maxSwipeTime) {
      if (absX > absY && absX > this.minSwipeDistance) {
        // Horizontal swipe
        if (diffX > 0 && this.touchStartX < 50) {
          // Right swipe from edge - open menu
          this.openMenu();
          this.triggerHaptic('light');
        } else if (diffX < 0 && this.menuOpen) {
          // Left swipe - close menu
          this.closeMenu();
        } else if (diffX < 0 && !this.menuOpen) {
          // Left swipe - could go back
          if (window.history.length > 1) {
            this.triggerHaptic('light');
            // Visual feedback for back gesture
            this.showBackGestureFeedback();
          }
        }
      } else if (absY > absX && absY > this.minSwipeDistance) {
        // Vertical swipe
        if (diffY < 0) {
          // Up swipe - could scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      // Reset menu position if not completed
      if (!this.menuOpen) {
        this.menu.style.transform = '';
        this.backdrop.style.opacity = '';
        this.backdrop.style.visibility = '';
      }
    }
  }
  
  openMenu() {
    this.menu.classList.add('open');
    this.backdrop.classList.add('active');
    this.menuOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announce('Navigation menu opened. Swipe left or tap backdrop to close.');
  }
  
  closeMenu() {
    this.menu.classList.remove('open');
    this.backdrop.classList.remove('active');
    this.menuOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    this.announce('Navigation menu closed');
  }
  
  triggerRefresh() {
    this.ptr.classList.add('refreshing');
    this.ptrIndicator.classList.add('rotating');
    
    this.triggerHaptic('medium');
    
    // Simulate refresh
    setTimeout(() => {
      this.ptr.classList.remove('refreshing');
      this.ptrIndicator.classList.remove('rotating');
      this.ptr.style.transform = '';
      
      // Show toast
      if (window.AdvancedToastSystem) {
        window.AdvancedToastSystem.success('Page refreshed');
      }
      
      // Optional: Actually reload
      // window.location.reload();
    }, 1500);
  }
  
  sharePage() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard(window.location.href);
      });
    } else {
      this.copyToClipboard(window.location.href);
    }
  }
  
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.AdvancedToastSystem) {
        window.AdvancedToastSystem.success('Link copied to clipboard');
      }
    });
  }
  
  showBackGestureFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 15, 18, 0.9);
      backdrop-filter: blur(10px);
      padding: 20px 30px;
      border-radius: 16px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      color: #F5F7FA;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    feedback.textContent = '← Swipe further to go back';
    document.body.appendChild(feedback);
    
    requestAnimationFrame(() => feedback.style.opacity = '1');
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 200);
    }, 1000);
  }
  
  triggerHaptic(intensity = 'light') {
    // Visual feedback for haptic
    const haptic = document.createElement('div');
    haptic.className = 'haptic-feedback';
    haptic.style.left = `${this.touchEndX - 30}px`;
    haptic.style.top = `${this.touchEndY - 30}px`;
    document.body.appendChild(haptic);
    
    requestAnimationFrame(() => haptic.classList.add('active'));
    
    setTimeout(() => {
      haptic.classList.remove('active');
      setTimeout(() => haptic.remove(), 300);
    }, 100);
    
    // Actual haptic if available
    if (navigator.vibrate) {
      const pattern = intensity === 'light' ? 10 : intensity === 'medium' ? 20 : 30;
      navigator.vibrate(pattern);
    }
  }
  
  announce(message) {
    // Create or update live region
    let region = document.getElementById('gesture-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'gesture-live-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = 'position: absolute; left: -10000px;';
      document.body.appendChild(region);
    }
    region.textContent = message;
  }
  
  destroy() {
    this.gesturesEnabled = false;
    if (this.menu) this.menu.remove();
    if (this.backdrop) this.backdrop.remove();
    if (this.ptr) this.ptr.remove();
    if (this.edgeLeft) this.edgeLeft.remove();
    if (this.edgeRight) this.edgeRight.remove();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.touchGestures = new TouchGestureNavigation();
});

// Expose for debugging
window.TouchGestureNavigation = TouchGestureNavigation;
