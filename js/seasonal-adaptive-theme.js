/**
 * v133.0: Seasonal Adaptive Theme System
 * Fortune 500 Quality Time-Based Theme Adaptation
 * Automatically adjusts site colors based on season, hemisphere, and time
 */

(function() {
  'use strict';
  
  class SeasonalAdaptiveTheme {
    constructor() {
      this.currentSeason = null;
      this.currentTimeOfDay = null;
      this.hemisphere = 'southern'; // Default to South Africa
      this.userOverride = null;
      this.isListening = false;
      
      this.seasons = {
        spring: { icon: '🌱', name: 'Spring' },
        summer: { icon: '☀️', name: 'Summer' },
        autumn: { icon: '🍂', name: 'Autumn' },
        winter: { icon: '❄️', name: 'Winter' },
        holiday: { icon: '🎄', name: 'Holiday' }
      };
      
      this.init();
    }
    
    init() {
      this.loadUserPreference();
      this.detectLocation();
      this.updateTheme();
      this.createUI();
      this.bindEvents();
      this.startAutoUpdate();
    }
    
    loadUserPreference() {
      try {
        const saved = localStorage.getItem('buildbridge-theme-season');
        if (saved && this.seasons[saved]) {
          this.userOverride = saved;
        }
      } catch (e) {
        console.warn('Storage access denied');
      }
    }
    
    saveUserPreference(season) {
      try {
        if (season) {
          localStorage.setItem('buildbridge-theme-season', season);
        } else {
          localStorage.removeItem('buildbridge-theme-season');
        }
      } catch (e) {
        console.warn('Storage access denied');
      }
    }
    
    detectLocation() {
      // Try to detect hemisphere from timezone
      const offset = new Date().getTimezoneOffset();
      const date = new Date();
      const month = date.getMonth();
      
      // South Africa is UTC+2, roughly -120 offset (or 120 negative)
      // If it's summer in Northern Hemisphere (June-Aug), it's winter in Southern
      this.hemisphere = offset <= -180 && offset >= -840 ? 'southern' : 'northern';
    }
    
    getCurrentSeason() {
      const date = new Date();
      const month = date.getMonth(); // 0-11
      const day = date.getDate();
      
      // South Africa seasons (Southern Hemisphere)
      if (this.hemisphere === 'southern') {
        // December - February: Summer (and Holiday in Dec)
        if (month === 11 || month === 0 || month === 1) {
          // Holiday season: mid-December to early January
          if ((month === 11 && day >= 15) || (month === 0 && day <= 7)) {
            return 'holiday';
          }
          return 'summer';
        }
        // March - May: Autumn
        if (month >= 2 && month <= 4) return 'autumn';
        // June - August: Winter
        if (month >= 5 && month <= 7) return 'winter';
        // September - November: Spring
        return 'spring';
      }
      
      // Northern Hemisphere
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    }
    
    getTimeOfDay() {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'night';
    }
    
    updateTheme() {
      const season = this.userOverride || this.getCurrentSeason();
      const timeOfDay = this.getTimeOfDay();
      
      // Only update if changed
      if (season !== this.currentSeason) {
        this.currentSeason = season;
        document.documentElement.setAttribute('data-season', season);
        this.updateBadge(season);
      }
      
      if (timeOfDay !== this.currentTimeOfDay) {
        this.currentTimeOfDay = timeOfDay;
        document.documentElement.setAttribute('data-time-of-day', timeOfDay);
      }
    }
    
    updateBadge(season) {
      const badge = document.querySelector('.season-badge');
      if (badge) {
        const icon = badge.querySelector('.season-badge-icon');
        const text = badge.querySelector('.season-badge-text');
        if (icon) icon.textContent = this.seasons[season].icon;
        if (text) text.textContent = this.seasons[season].name;
      }
    }
    
    createUI() {
      // Check if badge already exists
      if (document.querySelector('.season-badge')) return;
      
      // Create season badge
      const badge = document.createElement('div');
      badge.className = 'season-badge';
      badge.innerHTML = `
        <span class="season-badge-icon">${this.seasons[this.currentSeason]?.icon || '🌱'}</span>
        <span class="season-badge-text">${this.seasons[this.currentSeason]?.name || 'Spring'}</span>
      `;
      
      // Create season toggle
      const toggle = document.createElement('div');
      toggle.className = 'season-toggle';
      toggle.setAttribute('aria-label', 'Change theme season');
      toggle.innerHTML = `
        <span>${this.seasons[this.currentSeason]?.icon || '🌱'}</span>
        <div class="season-toggle-menu">
          ${Object.entries(this.seasons).map(([key, data]) => `
            <div class="season-option ${key === this.currentSeason ? 'active' : ''}" data-season="${key}">
              <span class="season-option-icon">${data.icon}</span>
              <span>${data.name}</span>
            </div>
          `).join('')}
          ${this.userOverride ? `
            <div class="season-option" data-season="auto">
              <span class="season-option-icon">🔄</span>
              <span>Auto (Detect)</span>
            </div>
          ` : ''}
        </div>
      `;
      
      document.body.appendChild(badge);
      document.body.appendChild(toggle);
    }
    
    bindEvents() {
      // Toggle menu
      document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.season-toggle');
        const option = e.target.closest('.season-option');
        
        if (toggle) {
          e.stopPropagation();
          toggle.classList.toggle('active');
        }
        
        if (option) {
          const season = option.dataset.season;
          if (season === 'auto') {
            this.userOverride = null;
            this.saveUserPreference(null);
          } else {
            this.userOverride = season;
            this.saveUserPreference(season);
          }
          this.updateTheme();
          this.refreshUI();
        }
        
        // Close menu when clicking outside
        if (!toggle && !e.target.closest('.season-toggle-menu')) {
          document.querySelectorAll('.season-toggle').forEach(t => {
            t.classList.remove('active');
          });
        }
      });
      
      // Keyboard accessibility
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.season-toggle').forEach(t => {
            t.classList.remove('active');
          });
        }
      });
    }
    
    refreshUI() {
      const toggle = document.querySelector('.season-toggle');
      if (toggle) {
        const icon = toggle.querySelector('span:first-child');
        if (icon) {
          icon.textContent = this.seasons[this.currentSeason]?.icon || '🌱';
        }
        
        // Update active state
        toggle.querySelectorAll('.season-option').forEach(opt => {
          opt.classList.remove('active');
          if (opt.dataset.season === this.currentSeason || 
              (this.userOverride === null && opt.dataset.season === 'auto')) {
            opt.classList.add('active');
          }
        });
      }
      
      this.updateBadge(this.currentSeason);
    }
    
    startAutoUpdate() {
      // Check every minute for time/season changes
      this.updateInterval = setInterval(() => {
        if (!this.userOverride) {
          this.updateTheme();
        }
      }, 60000);
      
      // Update on visibility change (user returns to tab)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.userOverride) {
          this.updateTheme();
        }
      });
    }
    
    // Public API methods
    setSeason(season) {
      if (this.seasons[season]) {
        this.userOverride = season;
        this.saveUserPreference(season);
        this.updateTheme();
        this.refreshUI();
      }
    }
    
    setAuto() {
      this.userOverride = null;
      this.saveUserPreference(null);
      this.updateTheme();
      this.refreshUI();
    }
    
    getCurrentTheme() {
      return {
        season: this.currentSeason,
        timeOfDay: this.currentTimeOfDay,
        hemisphere: this.hemisphere,
        isAuto: this.userOverride === null
      };
    }
    
    destroy() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      document.querySelectorAll('.season-badge, .season-toggle').forEach(el => {
        el.remove();
      });
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    if (window.seasonalTheme) {
      window.seasonalTheme.destroy();
    }
    window.seasonalTheme = new SeasonalAdaptiveTheme();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope
  window.SeasonalAdaptiveTheme = SeasonalAdaptiveTheme;
})();
