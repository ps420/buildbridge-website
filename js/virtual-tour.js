/**
 * v34.0: Virtual Tour System - Interactive 360° Project Walkthrough
 * Fortune 500 quality immersive experience
 */

(function() {
  'use strict';

  class VirtualTour {
    constructor(container) {
      this.container = container;
      this.frame = container.querySelector('.virtual-tour-frame');
      this.panorama = container.querySelector('.panorama-container');
      this.progressBar = container.querySelector('.tour-progress-fill');
      this.viewLabel = container.querySelector('.tour-view-label');
      this.roomThumbs = container.querySelectorAll('.tour-room-thumb');
      this.infoPanel = container.querySelector('.tour-info-panel');
      this.hotspots = container.querySelectorAll('.tour-hotspot');
      
      this.currentRoom = 0;
      this.isDragging = false;
      this.isPlaying = false;
      this.startX = 0;
      this.scrollLeft = 0;
      this.panProgress = 50; // 0-100, start in middle
      this.animationId = null;
      
      this.rooms = [
        { name: 'Living Room', views: 180 },
        { name: 'Kitchen', views: 200 },
        { name: 'Master Bedroom', views: 160 },
        { name: 'Bathroom', views: 120 }
      ];
      
      this.init();
    }
    
    init() {
      this.bindEvents();
      this.updateProgress();
      this.startAutoPlay();
      
      // Hide drag hint after interaction
      setTimeout(() => {
        const hint = this.container.querySelector('.tour-drag-hint');
        if (hint) hint.style.display = 'none';
      }, 6000);
    }
    
    bindEvents() {
      // Drag to pan
      this.frame.addEventListener('mousedown', this.handleDragStart.bind(this));
      this.frame.addEventListener('mousemove', this.handleDragMove.bind(this));
      this.frame.addEventListener('mouseup', this.handleDragEnd.bind(this));
      this.frame.addEventListener('mouseleave', this.handleDragEnd.bind(this));
      
      // Touch events
      this.frame.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: true });
      this.frame.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: true });
      this.frame.addEventListener('touchend', this.handleDragEnd.bind(this));
      
      // Room selector
      this.roomThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => this.switchRoom(index));
      });
      
      // Control buttons
      const playBtn = this.container.querySelector('.tour-control-play');
      if (playBtn) {
        playBtn.addEventListener('click', () => this.togglePlay());
      }
      
      const fsBtn = this.container.querySelector('.tour-control-fullscreen');
      if (fsBtn) {
        fsBtn.addEventListener('click', () => this.toggleFullscreen());
      }
      
      // Navigation arrows
      const prevBtn = this.container.querySelector('.tour-nav-arrow.prev');
      const nextBtn = this.container.querySelector('.tour-nav-arrow.next');
      
      if (prevBtn) prevBtn.addEventListener('click', () => this.navigatePan(-20));
      if (nextBtn) nextBtn.addEventListener('click', () => this.navigatePan(20));
      
      // Hotspots
      this.hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showHotspotInfo(hotspot);
        });
      });
      
      // Info panel close
      const closeBtn = this.infoPanel?.querySelector('.tour-info-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideInfoPanel());
      }
      
      // VR button
      const vrBtn = this.container.querySelector('.tour-vr-btn');
      if (vrBtn) {
        vrBtn.addEventListener('click', () => this.enterVR());
      }
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.container.matches(':hover')) return;
        
        switch(e.key) {
          case 'ArrowLeft':
            this.navigatePan(-10);
            break;
          case 'ArrowRight':
            this.navigatePan(10);
            break;
          case ' ':
            e.preventDefault();
            this.togglePlay();
            break;
          case 'Escape':
            if (this.container.classList.contains('fullscreen')) {
              this.toggleFullscreen();
            }
            this.hideInfoPanel();
            break;
        }
      });
      
      // Progress bar click
      const progressBar = this.container.querySelector('.tour-progress-bar');
      if (progressBar) {
        progressBar.addEventListener('click', (e) => {
          const rect = progressBar.getBoundingClientRect();
          const percent = ((e.clientX - rect.left) / rect.width) * 100;
          this.panProgress = Math.max(0, Math.min(100, percent));
          this.updatePan();
        });
      }
    }
    
    handleDragStart(e) {
      this.isDragging = true;
      this.isPlaying = false;
      this.updatePlayButton();
      this.frame.classList.add('dragging');
      
      this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      this.scrollLeft = this.panProgress;
      
      // Hide drag hint
      const hint = this.container.querySelector('.tour-drag-hint');
      if (hint) hint.style.display = 'none';
    }
    
    handleDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const walk = (x - this.startX) / 5; // Sensitivity
      
      this.panProgress = Math.max(0, Math.min(100, this.scrollLeft - walk));
      this.updatePan();
    }
    
    handleDragEnd() {
      this.isDragging = false;
      this.frame.classList.remove('dragging');
    }
    
    updatePan() {
      // Convert percent to translateX (-33.33% to 0 to account for 300% width)
      const translate = -33.33 + (this.panProgress / 100 * 33.33 * 2);
      this.panorama.style.transform = `translateX(${translate}%)`;
      this.updateProgress();
    }
    
    updateProgress() {
      if (this.progressBar) {
        this.progressBar.style.width = `${this.panProgress}%`;
      }
      
      if (this.viewLabel) {
        const viewAngle = Math.round((this.panProgress / 100) * 360);
        this.viewLabel.textContent = `${viewAngle}°`;
      }
    }
    
    navigatePan(delta) {
      this.panProgress = Math.max(0, Math.min(100, this.panProgress + delta));
      this.isPlaying = false;
      this.updatePlayButton();
      this.updatePan();
    }
    
    switchRoom(index) {
      if (index === this.currentRoom) return;
      
      // Update active states
      this.roomThumbs[this.currentRoom]?.classList.remove('active');
      this.roomThumbs[index]?.classList.add('active');
      
      this.currentRoom = index;
      
      // Reset pan
      this.panProgress = 50;
      this.updatePan();
      
      // Animate transition
      this.panorama.style.transition = 'opacity 0.3s ease';
      this.panorama.style.opacity = '0.5';
      
      setTimeout(() => {
        this.panorama.style.opacity = '1';
        setTimeout(() => {
          this.panorama.style.transition = 'transform 0.1s ease-out';
        }, 300);
      }, 300);
      
      // Update hotspots visibility based on room
      this.updateHotspots();
      
      // Track event
      if (window.gtag) {
        gtag('event', 'virtual_tour_room_change', {
          room: this.rooms[index].name
        });
      }
    }
    
    updateHotspots() {
      this.hotspots.forEach((hotspot, i) => {
        hotspot.style.opacity = i === this.currentRoom ? '1' : '0';
        hotspot.style.pointerEvents = i === this.currentRoom ? 'auto' : 'none';
      });
    }
    
    togglePlay() {
      this.isPlaying = !this.isPlaying;
      this.updatePlayButton();
      
      if (this.isPlaying) {
        this.startAutoPlay();
      } else {
        this.stopAutoPlay();
      }
    }
    
    updatePlayButton() {
      const playBtn = this.container.querySelector('.tour-control-play');
      if (playBtn) {
        playBtn.innerHTML = this.isPlaying ? '⏸' : '▶';
        playBtn.classList.toggle('active', this.isPlaying);
      }
    }
    
    startAutoPlay() {
      this.stopAutoPlay();
      
      const animate = () => {
        if (!this.isPlaying) return;
        
        this.panProgress += 0.15;
        
        if (this.panProgress >= 100) {
          this.panProgress = 0;
          // Optionally switch to next room
          // this.switchRoom((this.currentRoom + 1) % this.rooms.length);
        }
        
        this.updatePan();
        this.animationId = requestAnimationFrame(animate);
      };
      
      this.animationId = requestAnimationFrame(animate);
    }
    
    stopAutoPlay() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    
    showHotspotInfo(hotspot) {
      const title = hotspot.dataset.title || 'Feature';
      const description = hotspot.dataset.description || '';
      
      const panelTitle = this.infoPanel?.querySelector('h3');
      const panelDesc = this.infoPanel?.querySelector('p');
      
      if (panelTitle) panelTitle.textContent = title;
      if (panelDesc) panelDesc.textContent = description;
      
      this.infoPanel?.classList.add('active');
      
      if (window.gtag) {
        gtag('event', 'virtual_tour_hotspot_click', { title });
      }
    }
    
    hideInfoPanel() {
      this.infoPanel?.classList.remove('active');
    }
    
    toggleFullscreen() {
      this.container.classList.toggle('fullscreen');
      
      if (this.container.classList.contains('fullscreen')) {
        document.body.style.overflow = 'hidden';
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        document.body.style.overflow = '';
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    }
    
    enterVR() {
      // Simulate VR mode
      const notification = document.createElement('div');
      notification.className = 'tour-vr-notification';
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(15, 15, 16, 0.95);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(201, 206, 214, 0.2);
          text-align: center;
          z-index: 10000;
          max-width: 400px;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">🥽</div>
          <h3 style="font-family: Montserrat, sans-serif; font-size: 20px; color: #F5F7FA; margin-bottom: 12px;">
            VR Mode Coming Soon
          </h3>
          <p style="font-family: Poppins, sans-serif; font-size: 14px; color: rgba(201,206,214,0.7); margin-bottom: 24px;">
            Full VR headset support is in development. For now, enjoy our immersive 360° viewer!
          </p>
          <button style="
            padding: 12px 32px;
            background: linear-gradient(135deg, #C9CED6, #9aa0a8);
            border: none;
            border-radius: 30px;
            color: #0f0f10;
            font-family: Montserrat, sans-serif;
            font-weight: 600;
            cursor: pointer;
          ">Got it</button>
        </div>
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 9999;
        "></div>
      `;
      
      document.body.appendChild(notification);
      
      notification.querySelector('button').addEventListener('click', () => {
        notification.remove();
      });
      
      notification.querySelector('div:last-child').addEventListener('click', () => {
        notification.remove();
      });
    }
  }

  // Initialize all virtual tours on page
  function initVirtualTours() {
    const tourContainers = document.querySelectorAll('.virtual-tour-viewer');
    
    tourContainers.forEach(container => {
      // Check if already initialized
      if (container.dataset.initialized) return;
      
      new VirtualTour(container);
      container.dataset.initialized = 'true';
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVirtualTours);
  } else {
    initVirtualTours();
  }
  
  // Re-initialize on dynamic content changes
  window.initVirtualTours = initVirtualTours;

})();
