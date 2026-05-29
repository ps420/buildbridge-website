/**
 * v88.4: Construction Weather Widget
 * Fortune 500 Weather-Based Planning Assistant
 */

class ConstructionWeatherWidget {
  constructor() {
    this.locations = {
      'cape-town': { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
      'johannesburg': { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
      'durban': { name: 'Durban', lat: -29.8587, lon: 31.0218 },
      'pretoria': { name: 'Pretoria', lat: -25.7479, lon: 28.2293 },
      'port-elizabeth': { name: 'Port Elizabeth', lat: -33.9608, lon: 25.6022 }
    };
    
    this.currentLocation = localStorage.getItem('weather-location') || 'cape-town';
    this.isMinimized = localStorage.getItem('weather-minimized') === 'true';
    this.weatherData = null;
    this.forecast = [];
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    this.loadWeather();
    
    // Auto-refresh every 30 minutes
    setInterval(() => this.loadWeather(), 30 * 60 * 1000);
  }
  
  createWidget() {
    if (document.querySelector('.construction-weather-widget')) return;
    
    const widget = document.createElement('div');
    widget.className = `construction-weather-widget ${this.isMinimized ? 'minimized' : ''}`;
    widget.innerHTML = `
      <div class="weather-widget-toggle">
        <div class="weather-icon-main">⛅</div>
        <div class="weather-toggle-info">
          <span class="weather-temp">--°C</span>
          <span class="weather-location">${this.locations[this.currentLocation].name}</span>
        </div>
        <svg class="weather-expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>
      
      <div class="weather-card">
        <div class="weather-loading">
          <div class="weather-loading-spinner"></div>
          <div class="weather-loading-text">Loading weather...</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    this.elements = {
      widget,
      toggle: widget.querySelector('.weather-widget-toggle'),
      card: widget.querySelector('.weather-card'),
      icon: widget.querySelector('.weather-icon-main'),
      temp: widget.querySelector('.weather-temp'),
      location: widget.querySelector('.weather-location')
    };
  }
  
  bindEvents() {
    // Toggle minimize
    this.elements.toggle.addEventListener('click', () => this.toggle());
    
    // Location change
    this.elements.card.addEventListener('change', (e) => {
      if (e.target.classList.contains('weather-location-select')) {
        this.changeLocation(e.target.value);
      }
    });
    
    // Close button
    this.elements.card.addEventListener('click', (e) => {
      if (e.target.classList.contains('weather-close')) {
        this.minimize();
      }
    });
    
    // Update button
    this.elements.card.addEventListener('click', (e) => {
      if (e.target.classList.contains('weather-update-btn') || e.target.closest('.weather-update-btn')) {
        this.loadWeather();
      }
    });
  }
  
  toggle() {
    this.isMinimized = !this.isMinimized;
    this.elements.widget.classList.toggle('minimized', this.isMinimized);
    localStorage.setItem('weather-minimized', this.isMinimized);
  }
  
  minimize() {
    this.isMinimized = true;
    this.elements.widget.classList.add('minimized');
    localStorage.setItem('weather-minimized', true);
  }
  
  changeLocation(locationKey) {
    this.currentLocation = locationKey;
    localStorage.setItem('weather-location', locationKey);
    this.elements.location.textContent = this.locations[locationKey].name;
    this.loadWeather();
  }
  
  async loadWeather() {
    const location = this.locations[this.currentLocation];
    const updateBtn = this.elements.card.querySelector('.weather-update-btn');
    
    if (updateBtn) updateBtn.classList.add('loading');
    
    try {
      // Using Open-Meteo API (free, no key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa/Johannesburg&forecast_days=5`
      );
      
      if (!response.ok) throw new Error('Weather API error');
      
      const data = await response.json();
      this.weatherData = data;
      this.render();
      
    } catch (error) {
      console.error('Weather load error:', error);
      this.renderError();
    }
  }
  
  render() {
    if (!this.weatherData) return;
    
    const current = this.weatherData.current;
    const daily = this.weatherData.daily;
    const condition = this.getWeatherCondition(current.weather_code);
    const constructionStatus = this.getConstructionStatus(current);
    
    // Update toggle
    this.elements.icon.textContent = condition.icon;
    this.elements.temp.textContent = `${Math.round(current.temperature_2m)}°C`;
    
    // Build card content
    this.elements.card.innerHTML = `
      <div class="weather-card-header">
        <div>
          <select class="weather-location-select">
            ${Object.entries(this.locations).map(([key, loc]) => `
              <option value="${key}" ${key === this.currentLocation ? 'selected' : ''}>${loc.name}</option>
            `).join('')}
          </select>
          <div class="weather-date">${new Date().toLocaleDateString('en-ZA', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        </div>
        <button class="weather-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="weather-current">
        <div class="weather-current-icon">${condition.icon}</div>
        <div class="weather-current-info">
          <div class="weather-current-temp">${Math.round(current.temperature_2m)}°C</div>
          <div class="weather-current-condition">${condition.label}</div>
          <div class="weather-current-feels">Feels like ${Math.round(current.apparent_temperature)}°C</div>
        </div>
      </div>
      
      <div class="weather-details">
        <div class="weather-detail-item">
          <div class="weather-detail-icon">💧</div>
          <div class="weather-detail-info">
            <span class="weather-detail-label">Humidity</span>
            <span class="weather-detail-value">${current.relative_humidity_2m}%</span>
          </div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-icon">💨</div>
          <div class="weather-detail-info">
            <span class="weather-detail-label">Wind</span>
            <span class="weather-detail-value">${current.wind_speed_10m} km/h</span>
          </div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-icon">🌧️</div>
          <div class="weather-detail-info">
            <span class="weather-detail-label">Rain</span>
            <span class="weather-detail-value">${current.precipitation} mm</span>
          </div>
        </div>
        <div class="weather-detail-item">
          <div class="weather-detail-icon">☁️</div>
          <div class="weather-detail-info">
            <span class="weather-detail-label">Cloud Cover</span>
            <span class="weather-detail-value">${current.cloud_cover}%</span>
          </div>
        </div>
      </div>
      
      <div class="weather-construction-status ${constructionStatus.class}">
        <div class="construction-status-header">
          <span class="construction-status-icon">${constructionStatus.icon}</span>
          <span class="construction-status-title">Construction Status</span>
        </div>
        <div class="construction-status-message">${constructionStatus.message}</div>
      </div>
      
      <div class="weather-forecast">
        <div class="forecast-header">5-Day Forecast</div>
        <div class="forecast-items">
          ${daily.time.slice(1).map((time, i) => {
            const dayCondition = this.getWeatherCondition(daily.weather_code[i + 1]);
            const date = new Date(time);
            return `
              <div class="forecast-item">
                <div class="forecast-day">${date.toLocaleDateString('en-ZA', { weekday: 'short' })}</div>
                <div class="forecast-icon">${dayCondition.icon}</div>
                <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i + 1])}°</div>
                <div class="forecast-temp-range">${Math.round(daily.temperature_2m_min[i + 1])}°-${Math.round(daily.temperature_2m_max[i + 1])}°</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="best-days-section">
        <div class="best-days-header">
          <span>📅</span>
          <span class="best-days-title">Best Construction Days</span>
        </div>
        <div class="best-days-list">
          ${this.getBestConstructionDays(daily).map(day => `
            <span class="best-day-badge ${day.warning ? 'warning' : ''}">${day.label}</span>
          `).join('')}
        </div>
      </div>
      
      <button class="weather-update-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Update Weather
      </button>
    `;
  }
  
  renderError() {
    this.elements.card.innerHTML = `
      <div class="weather-error">
        <div class="weather-error-icon">⚠️</div>
        <div class="weather-error-title">Unable to load weather</div>
        <div class="weather-error-message">Please check your connection and try again</div>
        <button class="weather-update-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Try Again
        </button>
      </div>
    `;
  }
  
  getWeatherCondition(code) {
    // WMO Weather interpretation codes
    const conditions = {
      0: { icon: '☀️', label: 'Clear sky' },
      1: { icon: '🌤️', label: 'Mainly clear' },
      2: { icon: '⛅', label: 'Partly cloudy' },
      3: { icon: '☁️', label: 'Overcast' },
      45: { icon: '🌫️', label: 'Foggy' },
      48: { icon: '🌫️', label: 'Depositing rime fog' },
      51: { icon: '🌦️', label: 'Light drizzle' },
      53: { icon: '🌦️', label: 'Moderate drizzle' },
      55: { icon: '🌧️', label: 'Dense drizzle' },
      61: { icon: '🌧️', label: 'Slight rain' },
      63: { icon: '🌧️', label: 'Moderate rain' },
      65: { icon: '🌧️', label: 'Heavy rain' },
      71: { icon: '🌨️', label: 'Slight snow' },
      73: { icon: '🌨️', label: 'Moderate snow' },
      75: { icon: '❄️', label: 'Heavy snow' },
      95: { icon: '⛈️', label: 'Thunderstorm' },
      96: { icon: '⛈️', label: 'Thunderstorm with hail' },
      99: { icon: '⛈️', label: 'Heavy thunderstorm' }
    };
    
    return conditions[code] || { icon: '☁️', label: 'Unknown' };
  }
  
  getConstructionStatus(current) {
    // Determine construction safety based on weather conditions
    const temp = current.temperature_2m;
    const wind = current.wind_speed_10m;
    const rain = current.precipitation;
    const code = current.weather_code;
    
    // Dangerous conditions
    if (code >= 95 || wind > 50 || rain > 10) {
      return {
        class: 'danger',
        icon: '🚫',
        message: 'Severe weather - Construction should be suspended. Prioritize worker safety.'
      };
    }
    
    // Warning conditions
    if (code >= 61 || wind > 30 || temp > 35 || temp < 5) {
      return {
        class: 'warning',
        icon: '⚠️',
        message: 'Challenging conditions - Extra precautions recommended. Monitor closely.'
      };
    }
    
    // Good conditions
    return {
      class: 'good',
      icon: '✅',
      message: 'Favorable conditions - Good day for construction activities.'
    };
  }
  
  getBestConstructionDays(daily) {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    daily.time.forEach((time, i) => {
      if (i === 0) return; // Skip today
      
      const code = daily.weather_code[i];
      const rainProb = daily.precipitation_probability_max[i];
      const date = new Date(time);
      
      // Good days have low rain probability and no severe weather
      if (rainProb < 30 && code < 60) {
        days.push({
          label: dayNames[date.getDay()],
          warning: false
        });
      } else if (rainProb < 60 && code < 80) {
        days.push({
          label: dayNames[date.getDay()],
          warning: true
        });
      }
    });
    
    return days.slice(0, 4); // Return max 4 best days
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ConstructionWeatherWidget());
} else {
  new ConstructionWeatherWidget();
}
