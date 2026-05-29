/**
 * v90.2: Interactive Data Visualization Charts
 * Fortune 500 Quality Animated Charts & Graphs
 */

class DataVisualization {
  constructor() {
    this.observer = null;
    this.charts = [];
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.initBarCharts();
    this.initCircularCharts();
    this.initLineCharts();
    this.initDonutCharts();
    this.initCounterAnimations();
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.2
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.add('revealed');
          
          // Trigger chart animations
          setTimeout(() => {
            this.animateChart(card);
          }, 200);
          
          this.observer.unobserve(card);
        }
      });
    }, options);
    
    // Observe all viz cards
    document.querySelectorAll('.viz-card').forEach(card => {
      this.observer.observe(card);
    });
  }
  
  animateChart(card) {
    // Bar charts
    const barFills = card.querySelectorAll('.bar-chart-fill');
    barFills.forEach((fill, index) => {
      setTimeout(() => {
        const targetWidth = fill.dataset.value || '0';
        fill.style.width = targetWidth + '%';
      }, index * 100);
    });
    
    // Circular progress
    const circularFills = card.querySelectorAll('.circular-progress-fill');
    circularFills.forEach(fill => {
      const value = parseFloat(fill.dataset.value) || 0;
      const circumference = 2 * Math.PI * 60; // r=60
      const offset = circumference - (value / 100) * circumference;
      fill.style.strokeDasharray = `${circumference} ${circumference}`;
      fill.style.strokeDashoffset = offset;
    });
    
    // Line charts
    const linePaths = card.querySelectorAll('.line-chart-path');
    linePaths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = 0;
    });
    
    // Line chart areas
    const lineAreas = card.querySelectorAll('.line-chart-area');
    setTimeout(() => {
      lineAreas.forEach(area => area.classList.add('revealed'));
    }, 500);
    
    // Line chart points
    const linePoints = card.querySelectorAll('.line-chart-point');
    linePoints.forEach((point, index) => {
      setTimeout(() => {
        point.classList.add('revealed');
      }, 1000 + (index * 100));
    });
    
    // Donut charts
    const donutSegments = card.querySelectorAll('.donut-segment');
    let accumulatedOffset = 0;
    donutSegments.forEach(segment => {
      const value = parseFloat(segment.dataset.value) || 0;
      segment.style.strokeDasharray = `${value} ${100 - value}`;
      segment.style.strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += value;
    });
    
    // Counter animations
    const counters = card.querySelectorAll('[data-counter-viz]');
    counters.forEach(counter => this.animateCounter(counter));
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.counterViz) || 0;
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = parseInt(element.dataset.duration) || 2000;
    
    const startTime = performance.now();
    const startValue = 0;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-expo)
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (target - startValue) * easeProgress);
      
      element.textContent = prefix + current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  initBarCharts() {
    document.querySelectorAll('.bar-chart').forEach(chart => {
      const items = chart.querySelectorAll('.bar-chart-item');
      items.forEach(item => {
        const fill = item.querySelector('.bar-chart-fill');
        if (fill) {
          // Store target value
          const value = fill.style.width;
          fill.dataset.value = value;
          fill.style.width = '0';
        }
      });
    });
  }
  
  initCircularCharts() {
    document.querySelectorAll('.circular-progress').forEach(chart => {
      const svg = chart.querySelector('svg');
      const value = parseFloat(chart.dataset.value) || 0;
      
      // Create SVG structure if not exists
      if (!svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
          <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#9ca3af"/>
          </linearGradient>
        `;
        svg.prepend(defs);
      }
      
      // Create track and fill if not exists
      if (!svg.querySelector('.circular-progress-track')) {
        const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        track.setAttribute('class', 'circular-progress-track');
        track.setAttribute('cx', '70');
        track.setAttribute('cy', '70');
        track.setAttribute('r', '60');
        svg.appendChild(track);
        
        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fill.setAttribute('class', 'circular-progress-fill');
        fill.setAttribute('cx', '70');
        fill.setAttribute('cy', '70');
        fill.setAttribute('r', '60');
        fill.dataset.value = value;
        svg.appendChild(fill);
      }
      
      // Animate value text
      const valueEl = chart.querySelector('.circular-progress-value');
      if (valueEl) {
        valueEl.dataset.counterViz = value;
        valueEl.dataset.suffix = '%';
      }
    });
  }
  
  initLineCharts() {
    document.querySelectorAll('.line-chart').forEach(chart => {
      const data = JSON.parse(chart.dataset.chartData || '[]');
      if (!data.length) return;
      
      const svg = chart.querySelector('.line-chart-svg');
      const width = svg.clientWidth || 400;
      const height = svg.clientHeight || 200;
      const padding = { top: 20, right: 20, bottom: 40, left: 50 };
      
      // Clear existing
      svg.innerHTML = '';
      
      // Add defs
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#c9ced6"/>
          <stop offset="100%" style="stop-color:#9ca3af"/>
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#c9ced6;stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:#c9ced6;stop-opacity:0"/>
        </linearGradient>
      `;
      svg.appendChild(defs);
      
      // Calculate scales
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));
      const valueRange = maxValue - minValue || 1;
      
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      
      // Create grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'line-chart-grid');
        svg.appendChild(line);
      }
      
      // Generate path
      let pathD = '';
      let areaD = `M ${padding.left} ${height - padding.bottom} `;
      
      data.forEach((point, index) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * index;
        const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
          pathD += `M ${x} ${y}`;
          areaD += `L ${x} ${y}`;
        } else {
          // Smooth curve
          const prevX = padding.left + (chartWidth / (data.length - 1)) * (index - 1);
          const prevY = padding.top + chartHeight - ((data[index - 1].value - minValue) / valueRange) * chartHeight;
          const cp1x = prevX + (x - prevX) / 2;
          const cp1y = prevY;
          const cp2x = prevX + (x - prevX) / 2;
          const cp2y = y;
          pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
          areaD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
        
        // Add point
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('class', 'line-chart-point');
        circle.dataset.value = point.value;
        circle.dataset.label = point.label;
        svg.appendChild(circle);
        
        // Add x-axis label
        if (index % Math.ceil(data.length / 6) === 0) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x);
          text.setAttribute('y', height - 10);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', '#6b7280');
          text.setAttribute('font-size', '11');
          text.textContent = point.label;
          svg.appendChild(text);
        }
      });
      
      areaD += ` L ${padding.left + chartWidth} ${height - padding.bottom} Z`;
      
      // Create area
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('class', 'line-chart-area');
      svg.insertBefore(area, svg.firstChild);
      
      // Create line
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'line-chart-path');
      svg.appendChild(path);
      
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'line-chart-tooltip';
      chart.appendChild(tooltip);
      
      // Tooltip events
      chart.querySelectorAll('.line-chart-point').forEach(point => {
        point.addEventListener('mouseenter', (e) => {
          tooltip.textContent = `${point.dataset.label}: ${point.dataset.value}`;
          tooltip.classList.add('visible');
          
          const rect = point.getBoundingClientRect();
          const chartRect = chart.getBoundingClientRect();
          tooltip.style.left = (rect.left - chartRect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
          tooltip.style.top = (rect.top - chartRect.top - tooltip.offsetHeight - 10) + 'px';
        });
        
        point.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      });
    });
  }
  
  initDonutCharts() {
    document.querySelectorAll('.donut-chart-viz').forEach(chart => {
      const data = JSON.parse(chart.dataset.donutData || '[]');
      if (!data.length) return;
      
      const svg = chart.querySelector('svg');
      const total = data.reduce((sum, item) => sum + item.value, 0);
      
      // Clear existing
      svg.innerHTML = '';
      
      // Create segments
      let accumulatedValue = 0;
      const colors = ['#c9ced6', '#9ca3af', '#6b7280', '#4b5563', '#374151'];
      
      data.forEach((item, index) => {
        const percentage = (item.value / total) * 100;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '90');
        circle.setAttribute('cy', '90');
        circle.setAttribute('r', '70');
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', colors[index % colors.length]);
        circle.setAttribute('stroke-width', '25');
        circle.setAttribute('class', 'donut-segment');
        circle.dataset.value = percentage;
        svg.appendChild(circle);
      });
      
      // Update center text
      const totalEl = chart.querySelector('.donut-chart-total');
      if (totalEl) {
        totalEl.textContent = total.toLocaleString();
      }
      
      // Update legend
      const legend = chart.parentElement.querySelector('.donut-legend');
      if (legend) {
        legend.innerHTML = '';
        data.forEach((item, index) => {
          const legendItem = document.createElement('div');
          legendItem.className = 'donut-legend-item';
          legendItem.innerHTML = `
            <span class="donut-legend-color" style="background: ${colors[index % colors.length]}"></span>
            <span>${item.label}</span>
            <span class="donut-legend-value">${item.value}</span>
          `;
          legend.appendChild(legendItem);
        });
      }
    });
  }
  
  initCounterAnimations() {
    document.querySelectorAll('[data-counter-viz]').forEach(counter => {
      counter.dataset.counterViz = counter.textContent.replace(/[^\d]/g, '');
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DataVisualization();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataVisualization;
}
