/**
 * v103.0: Construction Weather Widget JavaScript
 * Live weather data for construction sites with forecasts and alerts
 * Created by: Godzai
 */

(function() {
  'use strict';

  // Weather codes and icons mapping
  const weatherCodes = {
    0: { icon: '☀️', condition: 'Clear sky', animation: 'weather-sunny' },
    1: { icon: '🌤️', condition: 'Mainly clear', animation: 'weather-sunny' },
    2: { icon: '⛅', condition: 'Partly cloudy', animation: 'weather-cloudy' },
    3: { icon: '☁️', condition: 'Overcast', animation: 'weather-cloudy' },
    45: { icon: '🌫️', condition: 'Foggy', animation: 'weather-cloudy' },
    48: { icon: '🌫️', condition: 'Depositing rime fog', animation: 'weather-cloudy' },
    51: { icon: '🌦️', condition: 'Light drizzle', animation: 'weather-rainy' },
    53: { icon: '🌧️', condition: 'Moderate drizzle', animation: 'weather-rainy' },
    55: { icon: '🌧️', condition: 'Dense drizzle', animation: 'weather-rainy' },
    61: { icon: '🌧️', condition: 'Slight rain', animation: 'weather-rainy' },
    63: { icon: '🌧️', condition: 'Moderate rain', animation: 'weather-rainy' },
    65: { icon: '⛈️', condition: 'Heavy rain', animation: 'weather-rainy' },
    71: { icon: '🌨️', condition: 'Slight snow', animation: 'weather-cloudy' },
    73: { icon: '🌨️', condition: 'Moderate snow', animation: 'weather-cloudy' },
    75: { icon: '❄️', condition: 'Heavy snow', animation: 'weather-cloudy' },
    95: { icon: '⛈️', condition: 'Thunderstorm', animation: 'weather-rainy' }
  };

  // Configuration
  const config = {
    locations: [
      { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
      { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
      { name: 'Durban', lat: -29.8587, lon: 31.0218 },
      { name: 'Pretoria', lat: -25.7479, lon: 28.2293 }
    ],
    refreshInterval: 30 * 60 * 1000, // 30 minutes
    storageKey: 'buildbridge-weather-data'
  };

  let currentLocation = config.locations[0];
  let weatherData = null;

  // Initialize weather widget
  function initWeatherWidget() {
    createWidgetHTML();
    loadCachedData();
    fetchWeatherData();
    
    // Set up refresh interval
    setInterval(fetchWeatherData, config.refreshInterval);
    
    console.log('🌤️ Construction Weather Widget v103.0 initialized');
  }

  // Create widget HTML
  function createWidgetHTML() {
    const widget = document.createElement('div');
    widget.className = 'construction-weather-widget';
    widget.id = 'construction-weather';
    
    widget.innerHTML = `
      <button class="weather-toggle" aria-label="Open weather panel">
        <span class="weather-toggle-icon">🌤️</span>
        <span class="weather-toggle-temp">--°</span>
        <span class="weather-toggle-location">Cape Town</span>
        <span class="weather-alert-badge" style="display: none;">!</span>
      </button>
      
      <div class="weather-panel">
        <div class="weather-panel-header">
          <div class="weather-location">
            <span class="weather-location-icon">📍</span>
            <span class="weather-location-name">Cape Town</span>
          </div>
          <button class="weather-panel-close" aria-label="Close weather panel">✕</button>
        </div>
        
        <div class="weather-location-selector">
          ${config.locations.map(loc => `
            <button class="weather-location-chip ${loc.name === currentLocation.name ? 'active' : ''}" 
                    data-location="${loc.name}">${loc.name}</button>
          `).join('')}
        </div>
        
        <div class="weather-content">
          <div class="weather-loading">
            <div class="weather-loading-spinner"></div>
            <div class="weather-loading-text">Loading weather data...</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Event listeners
    widget.querySelector('.weather-toggle').addEventListener('click', togglePanel);
    widget.querySelector('.weather-panel-close').addEventListener('click', togglePanel);
    
    // Location selector
    widget.querySelectorAll('.weather-location-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const locationName = chip.dataset.location;
        currentLocation = config.locations.find(l => l.name === locationName);
        updateLocationUI();
        fetchWeatherData();
      });
    });
  }

  // Toggle panel visibility
  function togglePanel() {
    const panel = document.querySelector('.weather-panel');
    panel.classList.toggle('open');
  }

  // Update location UI
  function updateLocationUI() {
    document.querySelector('.weather-location-name').textContent = currentLocation.name;
    document.querySelector('.weather-toggle-location').textContent = currentLocation.name;
    
    document.querySelectorAll('.weather-location-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.location === currentLocation.name);
    });
  }

  // Fetch weather data from Open-Meteo API
  async function fetchWeatherData() {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${currentLocation.lat}&longitude=${currentLocation.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Weather API error');
      
      weatherData = await response.json();
      cacheData(weatherData);
      renderWeather();
    } catch (error) {
      console.error('Weather fetch error:', error);
      renderError();
    }
  }

  // Load cached data
  function loadCachedData() {
    const cached = localStorage.getItem(config.storageKey);
    if (cached) {
      try {
        const { data, timestamp, location } = JSON.parse(cached);
        // Use cached data if less than 30 minutes old
        if (Date.now() - timestamp < config.refreshInterval && location === currentLocation.name) {
          weatherData = data;
          renderWeather();
        }
      } catch (e) {
        // Ignore cache errors
      }
    }
  }

  // Cache weather data
  function cacheData(data) {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify({
        data,
        timestamp: Date.now(),
        location: currentLocation.name
      }));
    } catch (e) {
      // Ignore cache errors
    }
  }

  // Render weather data
  function renderWeather() {
    if (!weatherData) return;
    
    const current = weatherData.current;
    const daily = weatherData.daily;
    const weatherInfo = weatherCodes[current.weather_code] || weatherCodes[0];
    
    // Calculate construction suitability score (0-100)
    const suitability = calculateSuitability(current);
    
    // Check for weather alerts
    const alerts = generateAlerts(current);
    
    const content = document.querySelector('.weather-content');
    content.innerHTML = `
      <div class="weather-current">
        <div class="weather-current-main">
          <div class="weather-current-icon ${weatherInfo.animation}">${weatherInfo.icon}</div>
          <div>
            <div class="weather-current-temp">${Math.round(current.temperature_2m)}°C</div>
            <div class="weather-current-condition">${weatherInfo.condition}</div>
          </div>
        </div>
        <div class="weather-suitability">
          <div class="suitability-score" style="--score-deg: ${suitability * 3.6}deg">
            <span class="suitability-value">${suitability}</span>
            <span class="suitability-label">Build Score</span>
          </div>
        </div>
      </div>
      
      ${alerts.length > 0 ? `
        <div class="weather-alerts">
          ${alerts.map(alert => `
            <div class="weather-alert ${alert.type}">
              <span class="weather-alert-icon">${alert.icon}</span>
              <div class="weather-alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="weather-details">
        <div class="weather-detail-item">
          <span class="weather-detail-icon">💧</span>
          <span class="weather-detail-value">${current.relative_humidity_2m}%</span>
          <span class="weather-detail-label">Humidity</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-icon">💨</span>
          <span class="weather-detail-value">${current.wind_speed_10m} km/h</span>
          <span class="weather-detail-label">Wind</span>
        </div>
        <div class="weather-detail-item">
          <span class="weather-detail-icon">🌡️</span>
          <span class="weather-detail-value">${Math.round(current.apparent_temperature)}°C</span>
          <span class="weather-detail-label">Feels Like</span>
        </div>
      </div>
      
      <div class="weather-forecast">
        <div class="weather-forecast-title">5-Day Forecast</div>
        <div class="forecast-days">
          ${daily.time.slice(0, 5).map((time, i) => {
            const dayWeather = weatherCodes[daily.weather_code[i]] || weatherCodes[0];
            const date = new Date(time);
            const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
            
            return `
              <div class="forecast-day">
                <div class="forecast-day-name">${dayName}</div>
                <div class="forecast-day-icon">${dayWeather.icon}</div>
                <div class="forecast-day-temps">
                  <span class="forecast-day-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                  <span class="forecast-day-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    // Update toggle button
    document.querySelector('.weather-toggle-icon').textContent = weatherInfo.icon;
    document.querySelector('.weather-toggle-temp').textContent = `${Math.round(current.temperature_2m)}°`;
    
    // Show alert badge if there are alerts
    const badge = document.querySelector('.weather-alert-badge');
    if (badge) {
      badge.style.display = alerts.length > 0 ? 'flex' : 'none';
    }
  }

  // Calculate construction suitability score
  function calculateSuitability(current) {
    let score = 100;
    
    // Temperature penalties
    if (current.temperature_2m > 35) score -= 30;
    else if (current.temperature_2m > 30) score -= 15;
    else if (current.temperature_2m < 5) score -= 25;
    else if (current.temperature_2m < 10) score -= 10;
    
    // Wind penalties
    if (current.wind_speed_10m > 50) score -= 40;
    else if (current.wind_speed_10m > 35) score -= 25;
    else if (current.wind_speed_10m > 20) score -= 10;
    
    // Weather code penalties
    const badCodes = [51, 53, 55, 61, 63, 65, 71, 73, 75, 95];
    if (badCodes.includes(current.weather_code)) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  // Generate weather alerts
  function generateAlerts(current) {
    const alerts = [];
    
    if (current.temperature_2m > 35) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Extreme Heat',
        message: 'High temperatures may affect worker safety. Consider adjusting work hours.'
      });
    }
    
    if (current.wind_speed_10m > 35) {
      alerts.push({
        type: 'danger',
        icon: '🌪️',
        title: 'High Winds',
        message: 'Strong winds detected. Crane operations and high work suspended.'
      });
    }
    
    if ([61, 63, 65].includes(current.weather_code)) {
      alerts.push({
        type: 'warning',
        icon: '🌧️',
        title: 'Rain Expected',
        message: 'Rain may affect outdoor work. Protect materials and equipment.'
      });
    }
    
    return alerts;
  }

  // Render error state
  function renderError() {
    const content = document.querySelector('.weather-content');
    content.innerHTML = `
      <div class="weather-error">
        <div class="weather-error-icon">⚠️</div>
        <h4>Unable to load weather</h4>
        <p>Please check your connection and try again.</p>
        <button class="weather-retry-btn" onclick="window.ConstructionWeather.fetch()">Retry</button>
      </div>
    `;
  }

  // Expose API
  window.ConstructionWeather = {
    init: initWeatherWidget,
    fetch: fetchWeatherData,
    getData: () => weatherData,
    setLocation: (locationName) => {
      const location = config.locations.find(l => l.name === locationName);
      if (location) {
        currentLocation = location;
        updateLocationUI();
        fetchWeatherData();
      }
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeatherWidget);
  } else {
    initWeatherWidget();
  }

})();
