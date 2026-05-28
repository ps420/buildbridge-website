/**
 * v61.0: Interactive Data Visualization System
 * Fortune 500 Quality Animated Charts and Statistics
 * Features: Bar charts, line charts, circular progress, counters
 */

class DataVisualization {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      animationDelay: 0,
      staggerDelay: 100,
      ...options
    };
    
    this.observer = null;
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.initCounters();
    this.initBarCharts();
    this.initCircularProgress();
    this.initLineCharts();
    this.initDonutCharts();
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );
    
    // Observe all viz elements
    this.container.querySelectorAll('.viz-stat-card, .viz-bar-chart, .viz-circular-item, .viz-line-chart, .viz-donut-chart').forEach(el => {
      this.observer.observe(el);
    });
  }
  
  animateElement(element) {
    // Add animate class to trigger CSS animations
    element.classList.add('animate');
    
    // Animate bar charts
    if (element.classList.contains('viz-bar-chart')) {
      this.animateBars(element);
    }
    
    // Animate circular progress
    if (element.classList.contains('viz-circular-item')) {
      this.animateCircular(element);
    }
    
    // Animate line charts
    if (element.classList.contains('viz-line-chart')) {
      this.animateLineChart(element);
    }
    
    // Animate donut charts
    if (element.classList.contains('viz-donut-chart')) {
      this.animateDonutChart(element);
    }
  }
  
  // Animated Counters
  initCounters() {
    const counters = this.container.querySelectorAll('.viz-stat-value[data-count]');
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const prefix = counter.dataset.prefix || '';
      const duration = parseInt(counter.dataset.duration) || 2000;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(counter, target, suffix, prefix, duration);
            observer.unobserve(counter);
          }
        });
      });
      
      observer.observe(counter);
    });
  }
  
  animateCounter(element, target, suffix = '', prefix = '', duration = 2000) {
    const startTime = performance.now();
    const startValue = 0;
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - ease out quad
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeOut);
      
      element.innerHTML = `${prefix}${current.toLocaleString()}<span class="suffix">${suffix}</span>`;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }
  
  // Bar Charts
  initBarCharts() {
    const charts = this.container.querySelectorAll('.viz-bar-chart');
    charts.forEach(chart => this.setupBarChart(chart));
  }
  
  setupBarChart(chart) {
    const bars = chart.querySelectorAll('.viz-bar-item');
    bars.forEach((bar, index) => {
      const fill = bar.querySelector('.viz-bar-fill');
      const value = bar.querySelector('.viz-bar-value');
      const targetValue = parseInt(bar.dataset.value) || 0;
      
      // Store target for animation
      fill.dataset.targetWidth = targetValue;
      value.textContent = '0%';
      value.dataset.targetValue = targetValue;
    });
  }
  
  animateBars(chart) {
    const bars = chart.querySelectorAll('.viz-bar-item');
    
    bars.forEach((bar, index) => {
      setTimeout(() => {
        const fill = bar.querySelector('.viz-bar-fill');
        const value = bar.querySelector('.viz-bar-value');
        const targetWidth = fill.dataset.targetWidth;
        const targetValue = value.dataset.targetValue;
        
        fill.style.width = `${targetWidth}%`;
        this.animateCounter(value, targetValue, '%');
      }, index * this.options.staggerDelay);
    });
  }
  
  // Circular Progress
  initCircularProgress() {
    const items = this.container.querySelectorAll('.viz-circular-item');
    items.forEach(item => this.setupCircularProgress(item));
  }
  
  setupCircularProgress(item) {
    const progress = item.querySelector('.viz-circular-progress');
    const value = item.querySelector('.viz-circular-value');
    const targetValue = parseInt(item.dataset.value) || 0;
    
    // Calculate stroke-dashoffset
    const circumference = 2 * Math.PI * 60; // r=60
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference;
    
    // Store targets
    progress.dataset.circumference = circumference;
    progress.dataset.targetValue = targetValue;
    value.dataset.targetValue = targetValue;
  }
  
  animateCircular(item) {
    const progress = item.querySelector('.viz-circular-progress');
    const value = item.querySelector('.viz-circular-value');
    const circumference = parseFloat(progress.dataset.circumference);
    const targetValue = parseInt(progress.dataset.targetValue);
    
    const offset = circumference - (targetValue / 100) * circumference;
    progress.style.strokeDashoffset = offset;
    
    // Animate number
    this.animateCounter(value, targetValue, '%');
  }
  
  // Line Charts
  initLineCharts() {
    const charts = this.container.querySelectorAll('.viz-line-chart');
    charts.forEach(chart => this.setupLineChart(chart));
  }
  
  setupLineChart(chart) {
    const svg = chart.querySelector('.viz-line-svg');
    if (!svg) return;
    
    // Create gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#F5F7FA;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#C9CED6;stop-opacity:0" />
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    
    // Add tooltip
    let tooltip = chart.querySelector('.viz-line-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'viz-line-tooltip';
      tooltip.innerHTML = `
        <div class="viz-line-tooltip-label"></div>
        <div class="viz-line-tooltip-value"></div>
      `;
      chart.appendChild(tooltip);
    }
    
    // Setup hover interactions
    const points = chart.querySelectorAll('.viz-line-point');
    points.forEach(point => {
      point.addEventListener('mouseenter', (e) => {
        const label = point.dataset.label;
        const value = point.dataset.value;
        
        tooltip.querySelector('.viz-line-tooltip-label').textContent = label;
        tooltip.querySelector('.viz-line-tooltip-value').textContent = value;
        
        const rect = point.getBoundingClientRect();
        const chartRect = chart.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left - chartRect.left}px`;
        tooltip.style.top = `${rect.top - chartRect.top - 60}px`;
        tooltip.classList.add('visible');
      });
      
      point.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    });
  }
  
  animateLineChart(chart) {
    const path = chart.querySelector('.viz-line-path');
    const area = chart.querySelector('.viz-line-area');
    const points = chart.querySelectorAll('.viz-line-point');
    
    if (path) path.classList.add('animate');
    if (area) area.classList.add('animate');
    
    points.forEach((point, index) => {
      setTimeout(() => {
        point.classList.add('animate');
      }, 500 + (index * 100));
    });
  }
  
  // Donut Charts
  initDonutCharts() {
    const charts = this.container.querySelectorAll('.viz-donut-chart');
    charts.forEach(chart => this.setupDonutChart(chart));
  }
  
  setupDonutChart(chart) {
    const svg = chart.querySelector('.viz-donut-svg');
    if (!svg) return;
    
    const segments = chart.querySelectorAll('.viz-donut-segment');
    let currentOffset = 0;
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    
    segments.forEach((segment, index) => {
      const value = parseFloat(segment.dataset.value) || 0;
      const strokeLength = (value / 100) * circumference;
      
      segment.style.strokeDasharray = `${strokeLength} ${circumference}`;
      segment.style.strokeDashoffset = -currentOffset;
      
      // Animation: start with 0 length
      segment.dataset.targetLength = strokeLength;
      segment.dataset.offset = -currentOffset;
      segment.style.strokeDasharray = `0 ${circumference}`;
      
      currentOffset += strokeLength;
      
      // Hover effect for legend
      const legendItem = chart.querySelector(`.viz-legend-item[data-index="${index}"]`);
      if (legendItem) {
        legendItem.addEventListener('mouseenter', () => {
          segment.style.strokeWidth = '36';
          segment.style.opacity = '1';
          segments.forEach((s, i) => {
            if (i !== index) s.style.opacity = '0.3';
          });
        });
        
        legendItem.addEventListener('mouseleave', () => {
          segment.style.strokeWidth = '30';
          segments.forEach(s => s.style.opacity = '1');
        });
      }
    });
  }
  
  animateDonutChart(chart) {
    const segments = chart.querySelectorAll('.viz-donut-segment');
    
    segments.forEach((segment, index) => {
      setTimeout(() => {
        const targetLength = segment.dataset.targetLength;
        const offset = segment.dataset.offset;
        const circumference = 2 * Math.PI * 85;
        segment.style.strokeDasharray = `${targetLength} ${circumference}`;
      }, index * 150);
    });
  }
  
  // Sparkline charts for dashboard
  static createSparkline(container, data, options = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${data.length - 1} 40`);
    svg.setAttribute('preserveAspectRatio', 'none');
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // Create path
    let pathD = `M0,${40 - ((data[0] - min) / range) * 40}`;
    data.slice(1).forEach((value, index) => {
      const x = index + 1;
      const y = 40 - ((value - min) / range) * 40;
      pathD += ` L${x},${y}`;
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', options.color || '#C9CED6');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    // Animate path
    const length = 1000; // Approximate
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 1.5s ease';
    
    svg.appendChild(path);
    container.appendChild(svg);
    
    // Trigger animation
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = 0;
    });
    
    return svg;
  }
}

// Dashboard with real-time updates
class LiveDashboard {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.init();
  }
  
  init() {
    this.setupSparklines();
  }
  
  setupSparklines() {
    const sparklineContainers = this.container.querySelectorAll('.viz-dashboard-sparkline');
    
    sparklineContainers.forEach(container => {
      const data = JSON.parse(container.dataset.values || '[30, 45, 35, 50, 40, 55, 60, 45, 55, 65, 50, 70]');
      DataVisualization.createSparkline(container, data);
    });
  }
}

// Auto-initialize all visualizations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.data-viz-container').forEach(container => {
      new DataVisualization(container);
    });
    
    document.querySelectorAll('.viz-dashboard').forEach(dashboard => {
      new LiveDashboard(dashboard);
    });
  });
} else {
  document.querySelectorAll('.data-viz-container').forEach(container => {
    new DataVisualization(container);
  });
  
  document.querySelectorAll('.viz-dashboard').forEach(dashboard => {
    new LiveDashboard(dashboard);
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataVisualization, LiveDashboard };
}
