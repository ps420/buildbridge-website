/**
 * Interactive Data Visualization v87.1 - Fortune 500 Animated Charts
 * Animated statistical displays with counter rings, charts, and progress bars
 */

(function() {
  'use strict';

  const InteractiveDataViz = {
    counters: [],
    observer: null,

    init() {
      this.setupObserver();
      this.initCounterRings();
      this.initDoughnutCharts();
      this.initBarCharts();
      this.initAnimatedCounters();
      this.initProgressBars();
      this.bindEvents();
      
      console.log('📊 Interactive Data Visualization initialized');
    },

    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.animateElement(entry.target);
          }
        });
      }, { threshold: 0.3 });
    },

    animateElement(element) {
      // Animated counters
      const counters = element.querySelectorAll('.counter, [data-counter]');
      counters.forEach(counter => this.animateCounter(counter));

      // Counter rings
      const ring = element.querySelector('.counter-ring');
      if (ring) this.animateRing(ring);

      // Progress bars
      const progressBars = element.querySelectorAll('.progress-viz');
      progressBars.forEach(bar => this.animateProgress(bar));

      // Bar charts
      const barChart = element.querySelector('.bar-chart');
      if (barChart) this.animateBarChart(barChart);

      // Doughnut charts
      const doughnut = element.querySelector('.doughnut-chart');
      if (doughnut) this.animateDoughnut(doughnut);
    },

    // Counter Ring Animation
    initCounterRings() {
      document.querySelectorAll('.counter-ring').forEach(ring => {
        this.observer.observe(ring);
        
        // Create SVG if not exists
        if (!ring.querySelector('svg')) {
          this.createRingSVG(ring);
        }
      });
    },

    createRingSVG(ring) {
      const size = ring.offsetWidth || 200;
      const radius = (size - 16) / 2;
      const circumference = 2 * Math.PI * radius;
      
      const targetValue = parseInt(ring.dataset.value) || 75;
      const targetOffset = circumference - (targetValue / 100) * circumference;

      ring.innerHTML = `
        <svg class="counter-ring-svg" viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#d4a853;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#c49a4c;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle class="counter-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}"></circle>
          <circle class="counter-ring-progress" cx="${size/2}" cy="${size/2}" r="${radius}"
                  style="--ring-offset: ${targetOffset}px; stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference}"></circle>
        </svg>
        <div class="counter-ring-content">
          <div class="counter-ring-value" data-target="${targetValue}" data-suffix="%">0</div>
          <div class="counter-ring-label">${ring.dataset.label || 'Complete'}</div>
        </div>
      `;
    },

    animateRing(ring) {
      const progress = ring.querySelector('.counter-ring-progress');
      const value = ring.querySelector('.counter-ring-value');
      const target = parseInt(value.dataset.target) || 75;
      
      // Animate ring
      setTimeout(() => {
        progress.style.strokeDashoffset = progress.style.getPropertyValue('--ring-offset');
      }, 100);

      // Animate number
      this.countUp(value, 0, target, 2000, '%');
    },

    // Doughnut Chart
    initDoughnutCharts() {
      document.querySelectorAll('.doughnut-chart').forEach(chart => {
        this.createDoughnutChart(chart);
        this.observer.observe(chart);
      });
    },

    createDoughnutChart(chart) {
      const data = JSON.parse(chart.dataset.chart || '[{"value": 40, "color": "#d4a853"}, {"value": 30, "color": "#8b7355"}, {"value": 30, "color": "#5c4a3d"}]');
      const size = 280;
      const radius = 100;
      const center = size / 2;
      const circumference = 2 * Math.PI * radius;

      let svgContent = `<svg class="doughnut-chart-svg" viewBox="0 0 ${size} ${size}">`;
      let currentOffset = 0;

      data.forEach((segment, i) => {
        const segmentLength = (segment.value / 100) * circumference;
        const dashArray = `${segmentLength} ${circumference - segmentLength}`;
        
        svgContent += `
          <circle class="doughnut-segment" cx="${center}" cy="${center}" r="${radius}"
                  fill="none" stroke="${segment.color}" stroke-width="40"
                  stroke-dasharray="0 ${circumference}"
                  data-target-array="${dashArray}"
                  data-index="${i}"
                  style="transform-origin: center;"></circle>
        `;
        currentOffset += segmentLength;
      });

      svgContent += '</svg>';
      
      // Add legend
      let legendHTML = '<div class="doughnut-legend">';
      data.forEach((item, i) => {
        legendHTML += `
          <div class="doughnut-legend-item" data-index="${i}">
            <div class="doughnut-legend-color" style="background: ${item.color}"></div>
            <span class="doughnut-legend-text">${item.label || `Item ${i + 1}`} (${item.value}%)</span>
          </div>
        `;
      });
      legendHTML += '</div>';

      chart.insertAdjacentHTML('beforeend', svgContent + legendHTML);
    },

    animateDoughnut(chart) {
      const segments = chart.querySelectorAll('.doughnut-segment');
      
      segments.forEach((segment, i) => {
        setTimeout(() => {
          segment.style.strokeDasharray = segment.dataset.targetArray;
        }, i * 200);
      });
    },

    // Bar Chart
    initBarCharts() {
      document.querySelectorAll('.bar-chart').forEach(chart => {
        this.observer.observe(chart);
      });
    },

    animateBarChart(chart) {
      const bars = chart.querySelectorAll('.bar-chart-bar');
      
      bars.forEach((bar, i) => {
        setTimeout(() => {
          bar.style.setProperty('--bar-height', bar.dataset.height || '0.7');
        }, i * 150);
      });
    },

    // Animated Counters
    initAnimatedCounters() {
      document.querySelectorAll('[data-counter]').forEach(counter => {
        this.observer.observe(counter.closest('.stats-viz-card, section') || counter);
      });
    },

    animateCounter(counter) {
      const target = parseInt(counter.dataset.counter) || parseInt(counter.dataset.target) || 0;
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      const duration = parseInt(counter.dataset.duration) || 2000;

      this.countUp(counter, 0, target, duration, suffix, prefix);
    },

    countUp(element, start, end, duration, suffix = '', prefix = '') {
      const startTime = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = prefix + current.toLocaleString() + suffix;
        element.classList.add('counting');
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = prefix + end.toLocaleString() + suffix;
          element.classList.remove('counting');
        }
      };
      
      requestAnimationFrame(update);
    },

    // Progress Bars
    initProgressBars() {
      document.querySelectorAll('.progress-viz').forEach(bar => {
        this.observer.observe(bar);
      });
    },

    animateProgress(bar) {
      const fill = bar.querySelector('.progress-viz-fill');
      const value = bar.dataset.progress || fill.dataset.progress || 0;
      
      setTimeout(() => {
        fill.style.setProperty('--progress-width', value + '%');
      }, 200);
    },

    // Stats Viz Cards
    initStatsViz() {
      document.querySelectorAll('.stats-viz-card').forEach(card => {
        this.observer.observe(card);
      });
    },

    bindEvents() {
      // Hover effects for charts
      document.querySelectorAll('.doughnut-legend-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          const index = item.dataset.index;
          const segment = document.querySelector(`.doughnut-segment[data-index="${index}"]`);
          if (segment) {
            segment.style.transform = 'scale(1.05)';
            segment.style.filter = 'brightness(1.2)';
          }
        });

        item.addEventListener('mouseleave', () => {
          const index = item.dataset.index;
          const segment = document.querySelector(`.doughnut-segment[data-index="${index}"]`);
          if (segment) {
            segment.style.transform = 'scale(1)';
            segment.style.filter = 'none';
          }
        });
      });

      // Responsive handling
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          document.querySelectorAll('.counter-ring').forEach(ring => {
            this.createRingSVG(ring);
          });
        }, 250);
      });
    },

    // Public API
    refresh() {
      document.querySelectorAll('.revealed').forEach(el => el.classList.remove('revealed'));
      this.init();
    },

    updateValue(selector, newValue) {
      const element = document.querySelector(selector);
      if (element) {
        const current = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        this.countUp(element, current, newValue, 1000, suffix, prefix);
      }
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InteractiveDataViz.init());
  } else {
    InteractiveDataViz.init();
  }

  window.InteractiveDataViz = InteractiveDataViz;
})();
