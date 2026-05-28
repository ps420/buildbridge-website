/**
 * v44.3: Interactive Data Visualization
 * Animated charts for statistics with scroll-triggered animations
 */

(function() {
  'use strict';

  class InteractiveDataViz {
    constructor(element, options = {}) {
      this.element = element;
      this.type = element.dataset.chartType || 'circular';
      this.options = {
        threshold: 0.3,
        animationDuration: 1500,
        ...options
      };

      this.isAnimated = false;
      this.init();
    }

    init() {
      this.observe();
    }

    observe() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isAnimated) {
            this.animate();
          }
        });
      }, { threshold: this.options.threshold });

      observer.observe(this.element);
    }

    animate() {
      this.isAnimated = true;
      this.element.classList.add('animated');

      switch (this.type) {
        case 'circular':
          this.animateCircular();
          break;
        case 'linear':
          this.animateLinear();
          break;
        case 'bar':
          this.animateBar();
          break;
        case 'line':
          this.animateLine();
          break;
        case 'donut':
          this.animateDonut();
          break;
        case 'counter':
          this.animateCounter();
          break;
      }
    }

    animateCircular() {
      const progress = this.element.dataset.progress || 75;
      this.element.style.setProperty('--progress', progress);

      // Animate the number
      const numberEl = this.element.querySelector('.circular-chart-number');
      if (numberEl) {
        this.animateNumber(numberEl, 0, parseInt(progress), 1500, '%');
      }
    }

    animateLinear() {
      const bars = this.element.querySelectorAll('.linear-chart-fill');
      bars.forEach((bar, index) => {
        const value = bar.dataset.value || Math.random() * 100;
        setTimeout(() => {
          bar.style.width = `${value}%`;
        }, index * 100);
      });
    }

    animateBar() {
      const bars = this.element.querySelectorAll('.bar-chart-bar');
      bars.forEach((bar, index) => {
        const height = bar.dataset.height || Math.random() * 100;
        setTimeout(() => {
          bar.style.setProperty('--bar-height', `${height}%`);
        }, index * 100);
      });
    }

    animateLine() {
      const path = this.element.querySelector('.line-chart-path');
      const area = this.element.querySelector('.line-chart-area');
      const points = this.element.querySelectorAll('.line-chart-point');

      if (path) path.classList.add('animated');
      if (area) setTimeout(() => area.classList.add('animated'), 500);

      points.forEach((point, index) => {
        setTimeout(() => {
          point.classList.add('animated');
        }, 200 + index * 100);
      });
    }

    animateDonut() {
      const segments = this.element.querySelectorAll('.donut-segment');
      segments.forEach(segment => {
        const value = segment.dataset.value || 25;
        const circumference = 2 * Math.PI * 80; // radius = 80
        const offset = circumference - (value / 100) * circumference;
        segment.style.strokeDasharray = `${circumference} ${circumference}`;
        segment.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
          segment.style.strokeDashoffset = offset;
        }, 100);
      });
    }

    animateCounter() {
      const counters = this.element.querySelectorAll('[data-count]');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const suffix = counter.dataset.suffix || '';
        this.animateNumber(counter, 0, target, 2000, suffix);
      });
    }

    animateNumber(element, start, end, duration, suffix = '') {
      const range = end - start;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + range * easeOutQuart);
        
        element.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    }

    // Static method to create a chart
    static create(type, container, data, options = {}) {
      const chart = document.createElement('div');
      chart.className = `chart-card chart-${type}`;
      chart.dataset.chartType = type;

      switch (type) {
        case 'circular':
          chart.innerHTML = InteractiveDataViz.createCircularChart(data, options);
          break;
        case 'bar':
          chart.innerHTML = InteractiveDataViz.createBarChart(data, options);
          break;
        case 'line':
          chart.innerHTML = InteractiveDataViz.createLineChart(data, options);
          break;
      }

      container.appendChild(chart);
      return new InteractiveDataViz(chart, options);
    }

    static createCircularChart(data, options) {
      const progress = data.progress || 75;
      return `
        <svg viewBox="0 0 140 140" class="circular-chart" data-progress="${progress}">
          <defs>
            <linearGradient id="chart-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#F5F7FA;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle class="chart-bg" cx="70" cy="70" r="60"/>
          <circle class="chart-progress" cx="70" cy="70" r="60"/>
        </svg>
        <div class="circular-chart-value">
          <div class="circular-chart-number">0</div>
          <div class="circular-chart-label">${data.label || 'Completion'}</div>
        </div>
      `;
    }

    static createBarChart(data, options) {
      const items = data.items || [{ label: 'A', value: 60 }, { label: 'B', value: 80 }];
      const maxValue = Math.max(...items.map(i => i.value));

      return `
        <div class="bar-chart">
          ${items.map(item => `
            <div class="bar-chart-column">
              <div class="bar-chart-bar-wrapper">
                <div class="bar-chart-bar" data-height="${(item.value / maxValue) * 100}">
                  <span class="bar-chart-value">${item.value}</span>
                </div>
              </div>
              <span class="bar-chart-label">${item.label}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    static createLineChart(data, options) {
      const points = data.points || [10, 30, 50, 40, 60, 80, 70];
      const width = 400;
      const height = 160;
      const padding = 20;
      
      const maxValue = Math.max(...points);
      const minValue = Math.min(...points);
      const range = maxValue - minValue || 1;
      
      const xStep = (width - padding * 2) / (points.length - 1);
      const yScale = (height - padding * 2) / range;
      
      const pathPoints = points.map((val, i) => {
        const x = padding + i * xStep;
        const y = height - padding - (val - minValue) * yScale;
        return `${x},${y}`;
      });
      
      const pathD = `M ${pathPoints.join(' L ')}`;
      const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

      return `
        <div class="line-chart" data-chart-type="line">
          <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F5F7FA;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="chart-gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#C9CED6;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path class="line-chart-area" d="${areaD}" />
            <path class="line-chart-path" d="${pathD}" />
            ${pathPoints.map((p, i) => `<circle class="line-chart-point" cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" />`).join('')}
          </svg>
        </div>
      `;
    }

    // Initialize all charts on page
    static init(selector = '.chart-card', options = {}) {
      const charts = document.querySelectorAll(selector);
      return Array.from(charts).map(chart => new InteractiveDataViz(chart, options));
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InteractiveDataViz.init());
  } else {
    InteractiveDataViz.init();
  }

  // Expose globally
  window.InteractiveDataViz = InteractiveDataViz;
})();
