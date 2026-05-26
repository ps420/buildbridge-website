/**
 * Interactive Stats Dashboard
 * Fortune 500 Data Visualization
 * Animated charts, graphs, and metrics
 */

class InteractiveDashboard {
  constructor(container) {
    this.container = container || document.getElementById('dashboard');
    this.charts = [];
    this.isVisible = false;
    this.hasAnimated = false;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.observeVisibility();
    this.initCharts();
  }
  
  observeVisibility() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.isVisible = true;
          this.animateCharts();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(this.container);
  }
  
  initCharts() {
    // Line Chart
    this.initLineChart();
    
    // Bar Chart
    this.initBarChart();
    
    // Circular Progress
    this.initCircularProgress();
    
    // Progress Bars
    this.initProgressBars();
    
    // Gauge Chart
    this.initGaugeChart();
    
    // Real-time updates
    this.startRealtimeUpdates();
  }
  
  initLineChart() {
    const canvas = this.container.querySelector('.line-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = this.generateLineData();
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    this.lineChart = { canvas, ctx, data, rect };
  }
  
  initBarChart() {
    const canvas = this.container.querySelector('.bar-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = [65, 78, 90, 81, 96, 85, 92, 88, 95, 87, 91, 94];
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    this.barChart = { canvas, ctx, data, rect };
  }
  
  initCircularProgress() {
    const circles = this.container.querySelectorAll('.circular-progress');
    circles.forEach(circle => {
      const percentage = parseInt(circle.dataset.percentage) || 0;
      const circumference = 2 * Math.PI * 45; // r=45
      const offset = circumference - (percentage / 100) * circumference;
      
      const fill = circle.querySelector('.circular-progress-fill');
      if (fill) {
        fill.style.strokeDashoffset = circumference;
        circle.dataset.targetOffset = offset;
        circle.dataset.circumference = circumference;
      }
    });
  }
  
  initProgressBars() {
    const bars = this.container.querySelectorAll('.progress-bar-fill');
    bars.forEach(bar => {
      const target = bar.dataset.target || 0;
      bar.style.width = '0%';
      bar.dataset.targetWidth = target + '%';
    });
  }
  
  initGaugeChart() {
    const gauge = this.container.querySelector('.gauge-fill');
    if (!gauge) return;
    
    const percentage = 87; // 87% satisfaction
    const circumference = 283;
    const offset = circumference - (percentage / 100) * circumference;
    
    gauge.style.strokeDashoffset = circumference;
    this.gaugeTarget = offset;
  }
  
  animateCharts() {
    // Animate line chart
    this.animateLineChart();
    
    // Animate bar chart
    this.animateBarChart();
    
    // Animate circular progress
    setTimeout(() => {
      this.container.querySelectorAll('.circular-progress').forEach(circle => {
        const fill = circle.querySelector('.circular-progress-fill');
        if (fill) {
          fill.style.strokeDashoffset = circle.dataset.targetOffset;
        }
      });
    }, 300);
    
    // Animate progress bars
    setTimeout(() => {
      this.container.querySelectorAll('.progress-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.targetWidth;
      });
    }, 500);
    
    // Animate gauge
    setTimeout(() => {
      const gauge = this.container.querySelector('.gauge-fill');
      if (gauge) {
        gauge.style.strokeDashoffset = this.gaugeTarget;
      }
    }, 700);
    
    // Update circular progress text
    this.animateCounterText();
  }
  
  animateLineChart() {
    if (!this.lineChart) return;
    
    const { ctx, data, rect } = this.lineChart;
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    let progress = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    const draw = (currentTime) => {
      const elapsed = currentTime - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Easing
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(201, 206, 214, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(rect.width - padding, y);
        ctx.stroke();
      }
      
      // Draw line
      const pointsToDraw = Math.floor(data.length * easeOutQuart);
      
      if (pointsToDraw > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#C9CED6';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        data.slice(0, pointsToDraw).forEach((point, i) => {
          const x = padding + (chartWidth / (data.length - 1)) * i;
          const y = padding + chartHeight - (point.value / 100) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Smooth curve
            const prevX = padding + (chartWidth / (data.length - 1)) * (i - 1);
            const prevY = padding + chartHeight - (data[i - 1].value / 100) * chartHeight;
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
            ctx.quadraticCurveTo(cpX, (prevY + y) / 2, x, y);
          }
        });
        
        ctx.stroke();
        
        // Draw gradient fill
        ctx.lineTo(padding + (chartWidth / (data.length - 1)) * (pointsToDraw - 1), padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, 'rgba(201, 206, 214, 0.3)');
        gradient.addColorStop(1, 'rgba(201, 206, 214, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw points
        data.slice(0, pointsToDraw).forEach((point, i) => {
          const x = padding + (chartWidth / (data.length - 1)) * i;
          const y = padding + chartHeight - (point.value / 100) * chartHeight;
          
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#0F0F10';
          ctx.fill();
          ctx.strokeStyle = '#C9CED6';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      
      if (progress < 1) {
        requestAnimationFrame(draw);
      }
    };
    
    requestAnimationFrame(draw);
  }
  
  animateBarChart() {
    if (!this.barChart) return;
    
    const { ctx, data, rect } = this.barChart;
    const padding = 30;
    const barWidth = (rect.width - padding * 2) / data.length - 8;
    const chartHeight = rect.height - padding * 2;
    const maxValue = Math.max(...data);
    
    let progress = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    const draw = (currentTime) => {
      const elapsed = currentTime - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      const easeOutBack = 1 + 2.70158 * Math.pow(progress - 1, 3) + 1.70158 * Math.pow(progress - 1, 2);
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      data.forEach((value, i) => {
        const barHeight = (value / maxValue) * chartHeight * easeOutBack;
        const x = padding + i * (barWidth + 8);
        const y = rect.height - padding - barHeight;
        
        // Bar gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, 'rgba(201, 206, 214, 0.9)');
        gradient.addColorStop(1, 'rgba(201, 206, 214, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Bar top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(x, y, barWidth, 2);
      });
      
      if (progress < 1) {
        requestAnimationFrame(draw);
      }
    };
    
    requestAnimationFrame(draw);
  }
  
  animateCounterText() {
    const counters = this.container.querySelectorAll('.stat-value[data-target]');
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target) || 0;
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      const duration = 2000;
      const startTime = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);
        
        counter.textContent = prefix + current.toLocaleString() + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    });
  }
  
  generateLineData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 40) + 60 // 60-100 range
    }));
  }
  
  startRealtimeUpdates() {
    // Simulate real-time stat changes
    setInterval(() => {
      const statChanges = this.container.querySelectorAll('.stat-change-value');
      statChanges.forEach(el => {
        const change = (Math.random() * 4 + 1).toFixed(1);
        el.textContent = '+' + change + '%';
      });
    }, 5000);
    
    // Add new activity items periodically
    const activityFeed = this.container.querySelector('.activity-feed');
    if (activityFeed) {
      setInterval(() => {
        this.addNewActivity(activityFeed);
      }, 8000);
    }
  }
  
  addNewActivity(feed) {
    const activities = [
      { icon: '🏗️', title: 'New project milestone reached', time: 'Just now' },
      { icon: '✅', title: 'Quality inspection completed', time: 'Just now' },
      { icon: '📋', title: 'Project documentation updated', time: 'Just now' },
      { icon: '💼', title: 'New contractor onboarded', time: 'Just now' },
      { icon: '🎯', title: 'Client review: 5 stars', time: 'Just now' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.borderLeftColor = `hsl(${Math.random() * 60 + 180}, 70%, 60%)`;
    item.innerHTML = `
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Remove old items to keep list manageable
    if (feed.children.length > 8) {
      feed.removeChild(feed.lastChild);
    }
  }
}

// Heatmap initialization
class ActivityHeatmap {
  constructor(container) {
    this.container = container;
    this.init();
  }
  
  init() {
    this.generateHeatmap();
  }
  
  generateHeatmap() {
    const grid = this.container.querySelector('.heatmap-grid');
    if (!grid) return;
    
    const levels = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate 12 weeks
    for (let week = 0; week < 12; week++) {
      days.forEach((day, dayIndex) => {
        const cell = document.createElement('div');
        const level = Math.floor(Math.random() * 4) + 1; // 1-4
        cell.className = `heatmap-cell ${levels[level]}`;
        
        const date = this.getDateForCell(week, dayIndex);
        cell.innerHTML = `<span class="heatmap-tooltip">${date}: ${level} activities</span>`;
        
        grid.appendChild(cell);
      });
    }
  }
  
  getDateForCell(week, day) {
    const date = new Date();
    date.setDate(date.getDate() - (11 - week) * 7 - (6 - day));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = document.getElementById('dashboard');
  if (dashboard) {
    new InteractiveDashboard(dashboard);
  }
  
  const heatmap = document.querySelector('.heatmap-container');
  if (heatmap) {
    new ActivityHeatmap(heatmap);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InteractiveDashboard, ActivityHeatmap };
}
